const axios = require('axios');
const { randomUUID } = require("crypto")
const { insertQuery, pool } = require('../../config/db');

exports.createCampaignOrder = async (req, res) => {
  const { first_name, last_name, phone, campaign_id, total_amount, description } = req.body;
  const payment_status = "pending";

  if (!first_name || !last_name) {
    return res.status(400).json({ error: 'Name and email are required' });
  }

  try {
    const insertSQL = 'INSERT INTO campaign_orders (first_name, last_name, phone, campaign_id, payment_status, total_amount, description) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *';
    const campaign = await insertQuery(insertSQL, [first_name, last_name, phone, campaign_id, payment_status, total_amount, description]);

    const auth_response = await axios.post('https://merchant.qpay.mn/v2/auth/token', 
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

    const reciever_code = randomUUID();

    const data = {
            invoice_code: "GOOD_NEIGHBORS_INVOICE",
            sender_invoice_no: campaign.rows[0].id.toString(),
            invoice_receiver_code: reciever_code.toString(),
            sender_branch_code:"BRANCH1",
            invoice_description: `Campaign ${campaign.rows[0].id}`,
            enable_expiry:"false",
            allow_partial: false,
            minimum_amount: null,
            allow_exceed: false,
            maximum_amount: null,
            amount: total_amount,
            callback_url: "https://bd5492c3ee85.ngrok.io/payments?payment_id=12345678",
            sender_staff_code: "online",
            note:null,
            invoice_receiver_data: {
                register: "UZ96021105",
                name: "Ganzul",
                email: "test@gmail.com",
                phone: "88614450"
            },
            lines: [
                {
                    tax_product_code: "6401",
                    line_description: " Order No1311 200.00 .",
                    line_quantity: "1.00",
                    line_unit_price: "200.00",
                    note: "-.",
                    discounts: [
                        {
                            discount_code: "NONE",
                            description: " discounts",
                            amount: 10,
                            note: " discounts"
                        }
                    ],
                    surcharges: [
                        {
                            surcharge_code: "NONE",
                            description: "Хүргэлтийн зардал",
                            amount: 10,
                            note: " Хүргэлт"
                        }
                    ],
                    taxes: [
                        {
                            tax_code: "VAT",
                            description: "НӨАТ",
                            amount: 20,
                            note: " НӨАТ"
                        }
                    ]
                }
            ]
    }
    const invoice = await axios.post('https://merchant.qpay.mn/v2/invoice', 
        data, // Request body
        {
          headers: {
            'Authorization': `Bearer ${access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
    const billDetail = {
        provider: 'qpay',
        campaign_id: 1,
        amount: total_amount,
        status: 'pending',
        invoice_no: invoice.data.invoice_id,
        response: JSON.stringify(invoice.data),
        deeplinks: JSON.stringify(invoice.data.urls),
        user_id: 1,
        bill_type: 'campaign'
    }

    const insertBill = 'INSERT INTO bills (provider, campaign_id, amount, status, invoiceno, response, deeplinks, user_id, bill_type) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *';
    const bill = await insertQuery(insertBill, [billDetail.provider, billDetail.campaign_id, billDetail.amount, billDetail.status, billDetail.invoice_no, billDetail.response, billDetail.deeplinks, billDetail.user_id, billDetail.bill_type]);

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
                username: 'GOOD_NEIGHBORS',
                password: 'eSkFT03t',
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
        res.status(200).json({
            bill_id: result.rows[0].id,
            payment_status: 'pending',
            check_invoice: check_invoice.data.rows
          });
    } else {
        res.status(500).json({ error: 'Bill not found' });
    }
    
  };

exports.processPayment = (req, res) => {
    res.json({ message: 'Payment processed successfully' });
};
