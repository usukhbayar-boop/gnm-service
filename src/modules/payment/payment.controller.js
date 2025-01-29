const axios = require('axios');
const { randomUUID } = require("crypto")
const { insertQuery, pool } = require('../../config/db');
const { QPAY_USERNAME, QPAY_PASSWORD, QPAY_BASE_URL } = process.env;

exports.createCampaignOrder = async (req, res) => {
  const { first_name, last_name, phone, campaign_id, total_amount, description, email } = req.body;
  const payment_status = "pending";

  if (!first_name || !last_name) {
    return res.status(400).json({ error: 'Name and email are required' });
  }

  try {
    const insertSQL = 'INSERT INTO campaign_orders (first_name, last_name, phone, campaign_id, payment_status, total_amount, description, email) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *';
    const campaign = await insertQuery(insertSQL, [first_name, last_name, phone, campaign_id, payment_status, total_amount, description, email]);

    const billDetail = {
      provider: 'qpay',
      campaign_id: campaign_id,
      amount: total_amount,
      status: 'pending',
      user_id: 1,
      bill_type: 'campaign'
  }

  const insertBill = 'INSERT INTO bills (provider, campaign_id, amount, status, user_id, bill_type) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *';
  const bill = await insertQuery(insertBill, [billDetail.provider, billDetail.campaign_id, billDetail.amount, billDetail.status, billDetail.user_id, billDetail.bill_type]);

  console.log(bill.rows[0].id.toString());
  const reciever_code = randomUUID();

  const auth_response = await axios.post(`${QPAY_BASE_URL}/auth/token`, 
    {}, // Request body
    {
      auth: {
      username: 'GOOD_NEIGHBORS',
      password: 'eSkFT03t',
    },
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
  const access_token = auth_response.data.access_token;

  const data = {
    invoice_code: "GOOD_NEIGHBORS_INVOICE",
    sender_invoice_no: bill.rows[0].id.toString(),
    invoice_receiver_code: reciever_code.toString(),
    invoice_description:`Good Neighbors - Campaign ${bill.rows[0].id}`,
    sender_branch_code:"BRANCH1",
    amount: total_amount,
    callback_url:`https://api.crosslink.mn/api/webhook/qpay?bill_id=${bill.rows[0].id}`
  }

  const invoice = await axios.post(`${QPAY_BASE_URL}/invoice`, 
      data, // Request body
      {
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'Content-Type': 'application/json',
        },
      }
  );

  await pool.query("UPDATE bills SET invoiceno = $1, response = $2, deeplinks = $3 WHERE id = $4", [
    invoice.data.invoice_id,
    JSON.stringify(invoice.data),
    JSON.stringify(invoice.data.urls),
    bill.rows[0].id
  ]);

  res.status(200).json({
    message: 'Campaign Order created successfully',
    bill_id: bill.rows[0].id,
    data: invoice.data
  });
  } catch (error) {
    res.status(500).json({ error: 'Database error', msg: error });
  }
};

//v2/payment/check
exports.checkInvoice = async (req, res) => {
    const { bill_id } = req.query;

    const result = await pool.query(`SELECT * FROM bills WHERE id=${bill_id}`);

    if(result && result.rows.length > 0) {
        const auth_response = await axios.post('https://merchant.qpay.mn/v2/auth/token', 
            {}, // Request body
            {
              auth: {
                username: QPAY_USERNAME,
                password: QPAY_PASSWORD,
              },
              headers: {
                'Content-Type': 'application/json',
              },
            }
        );

        const check_invoice = await axios.post('https://merchant.qpay.mn/v2/payment/check', 
            {
                object_type: "INVOICE",
                object_id: result.rows[0].invoiceno,
                offset: {
                    page_number: 1,
                    page_limit : 100
                }
            }, // Request body
            {
              headers: {
                'Authorization': `Bearer ${auth_response.data.access_token}`,
                'Content-Type': 'application/json',
              },
            }
        );

      if(check_invoice.data.rows.length > 0 && check_invoice.data.rows[0].payment_status === "PAID") {
          try {
              const result = await pool.query("SELECT * FROM bills WHERE id = $1", [bill_id]);
              const bill = result.rows[0];
              if(bill) {
                await pool.query("UPDATE bills SET status = $1 WHERE id = $2", [
                  'paid',
                  bill_id
                ]);
                await pool.query("UPDATE campaign_orders SET payment_status = 'paid' WHERE id = $1", [
                  'paid',
                  bill.campaign_id
                ]);
              }
              
              console.log(`bill updated successfully!`);
            } catch (error) {
              console.error(error);
            }
      }
      res.status(200).json({
        bill_id: result.rows[0].id,
        payment_status: check_invoice.data.rows[0] ? check_invoice.data.rows[0].payment_status : 'pending',
        check_invoice: check_invoice.data.rows
    });
    } else {
        res.status(500).json({ error: 'Bill not found' });
    }
  };

exports.processPayment = (req, res) => {
    res.json({ message: 'Payment processed successfully' });
};
