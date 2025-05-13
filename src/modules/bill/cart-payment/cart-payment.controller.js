const { insertQuery, pool } = require("../../../config/db");
const { createAuthorization } = require("./cart-payment.service");
const {
  PAYMENT_CARD_AUTH_WEBHOOK_URL,
  GOLOMT_ZOCHIL_TOKEN,
  GOLOMT_ZOCHIL_HMAC_KEY,
} = process.env;
const bcrypt = require("bcryptjs");
const { randomUUID } = require("crypto");

exports.listPaymentCards = async (req, res) => {
  // ✅ Ensure function exists
  const { user_id } = req.params;
  try {
    const result = await pool.query(
      "SELECT * FROM billing_cards WHERE user_id = $1",
      [user_id]
    );
    if (result.rows.length === 0)
      return res.status(400).json({ message: "Invalid credentials" });

    const currentCard = result.rows[0];
    res.json({ data: currentCard || null });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.linkPaymentCard = async (req, res) => {
  // ✅ Ensure functions exist
  const { user_id, callback_url } = req.body;
  try {
    const result = await pool.query(
      "SELECT * FROM billing_cards WHERE user_id = $1",
      [user_id]
    );
    const currentCard = result.length ? result.rows[0] : {};
    if (currentCard.status === "authorized") {
      return res.status(400).json({
        message: "User has already authorized card. First remove current card.",
      });
    }
    let cardId = currentCard.id;
    if (!cardId) {
      await pool.query(
        "INSERT INTO billing_cards (user_id, callback_url, provider_uid) VALUES ($1, $2, $3)",
        [user_id, callback_url, "golomt_card"]
      );
      const cardId = result.rows[0].id;
    }

    const refno = randomUUID();
    const response = await createAuthorization({
      redirect_uri: PAYMENT_CARD_AUTH_WEBHOOK_URL,
      access_token: GOLOMT_ZOCHIL_TOKEN,
      extra: {
        returnType: "GET",
        transactionId: refno,
        hmac_key: GOLOMT_ZOCHIL_HMAC_KEY || "",
      },
    });

    if (!response?.checkout_url || !response?.check_id) {
      return res.status(505).json({
        message: "Error creating token authorization request.",
      });
    }

    await pool.query(
      "UPDATE billing_cards SET refno = $1, callback_url = $2, status = $3, check_id = $4, provider_link = $5, provider_response = $6 WHERE id = $7",
      [
        refno,
        callback_url,
        "requested",
        response.check_id,
        response.checkout_url,
        JSON.stringify(response),
        cardId,
      ]
    );
    res.json({ data: { id: cardId, card_gateway_url: response.checkout_url } });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

exports.removePaymentCard = async (req, res) => {
  // ✅ Ensure functions exist
  const { user_id } = req.body;
  try {
    if (user_id) {
      await pool.query(
        "DELETE FROM billing_cards WHERE user_id = $1, status = $2",
        [user_id, "authorized"]
      );
      res.json({ data: { status: "success" } });
    }
    res.json({ data: { status: "not_found" } });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};
