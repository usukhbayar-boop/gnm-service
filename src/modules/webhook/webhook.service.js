const axios = require("axios");
const { randomUUID } = require("crypto");
const { insertQuery, pool } = require("../../config/db");
const {
  checkAuthorization,
} = require("../bill/cart-payment/cart-payment.service");
const {
  PAYMENT_CARD_AUTH_WEBHOOK_URL,
  GOLOMT_ZOCHIL_TOKEN,
  GOLOMT_ZOCHIL_HMAC_KEY,
} = process.env;

exports.hookHandler = async (bill_id) => {
  const result = await pool.query(`SELECT * FROM bills WHERE id=${bill_id}`);

  if (result && result.rows.length > 0) {
    const status = result.rows[0].status;
    if (status === "paid") {
      return;
    } else {
      const auth_response = await axios.post(
        "https://merchant.qpay.mn/v2/auth/token",
        {}, // Request body
        {
          auth: {
            username: "GOOD_NEIGHBORS",
            password: "eSkFT03t",
          },
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const check_invoice = await axios.post(
        "https://merchant.qpay.mn/v2/payment/check",
        {
          object_type: "INVOICE",
          object_id: result.rows[0].invoiceno,
          offset: {
            page_number: 1,
            page_limit: 100,
          },
        }, // Request body
        {
          headers: {
            Authorization: `Bearer ${auth_response.data.access_token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (
        check_invoice.data.rows.length > 0 &&
        check_invoice.data.rows[0].payment_status === "PAID"
      ) {
        try {
          const result = await pool.query("SELECT * FROM bills WHERE id = $1", [
            bill_id,
          ]);
          const bill = result.rows[0];
          if (bill) {
            await pool.query("UPDATE bills SET status = $1 WHERE id = $2", [
              "paid",
              bill_id,
            ]);
            console.log(bill.campaign_order_id);
            await pool.query(
              "UPDATE campaign_orders SET payment_status = 'paid' WHERE id = $1",
              [bill.campaign_order_id]
            );
          }
          console.log(`bill updated successfully!`);
        } catch (error) {
          res.status(500).json({ message: error.message });
        }
      }
    }
  } else {
    console.error("Bill not found");
  }
};

exports.handleGolomtWebhook = async (status, refno) => {
  try {
    if (status && refno) {
      console.log("refno ->", refno);
      const result = await pool.query(
        "SELECT * FROM billing_cards WHERE refno = $1",
        [refno]
      );
      const card = result.rows.length ? result.rows[0] : {};

      if (card?.id && card?.status === "requested") {
        const result = await checkAuthorization({
          invoiceno: card.refno,
          access_token: GOLOMT_ZOCHIL_TOKEN,
          extra: {
            hmac_key: GOLOMT_ZOCHIL_HMAC_KEY || "",
          },
        });
        console.log("resuuuult ", result);

        if (result?.success === true && result?.token) {
          await pool.query(
            "UPDATE billing_cards SET status = $1, card_token = $2, masked_card_number = $3 WHERE id = $4",
            ["authorized", result.token, result.masked_card_number, card.id]
          );
        }
      } else {
        res.status(500).json({ message: "Card not found" });
      }
      return card?.callback_url;
    }
  } catch (err) {
    console.err(err);
  }

  return "";
};
