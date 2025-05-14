require("dotenv").config();
const express = require("express");
const axios = require("axios");
const crypto = require("crypto");
const { GOLOMT_API_URL } = process.env;

exports.createAuthorization = async ({
  redirect_uri,
  access_token,
  extra = {},
}) => {
  const checksum = _generateChecksum(
    `${extra.transactionId}${extra.returnType}${redirect_uri}`,
    extra.hmac_key
  );

  const response = await _sendRequest(
    "post",
    "/api/confirmation",
    access_token,
    {
      checksum,
      callback: `${redirect_uri}`,
      returnType: extra.returnType,
      transactionId: `${extra.transactionId}`,
    }
  );

  return {
    response,
    check_id: response.invoice,
    invoiceno: extra.transactionId,
    checkout_url: `${GOLOMT_API_URL}/confirmation/mn/${response.invoice}`,
  };
};

exports.checkAuthorization = async ({
  invoiceno,
  access_token,
  extra = {},
}) => {
  let success = false;
  let token = "";
  let masked_card_number = "";

  const checksum = await _generateChecksum(
    `${invoiceno}${invoiceno}`,
    extra.hmac_key
  );

  try {
    const response = await _sendRequest(
      "post",
      "/api/get/token",
      access_token,
      {
        checksum,
        transactionId: invoiceno,
      }
    );
    console.log("reeeees=>", response);

    if (response && response.errorCode === "000") {
      success = true;
      token = response.token;
      masked_card_number = response.cardNumber;
    }
  } catch {}

  return { success, token, masked_card_number };
};

const _sendRequest = async (method, url, access_token, data) => {
  const options = {
    method,
    url: `${GOLOMT_API_URL}${url}`,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${access_token}`,
    },
  };

  if (method === "post") {
    options.data = JSON.stringify(data);
  }

  try {
    const resp = await axios(options);
    return resp.data;
  } catch (err) {
    console.log((err.response || {}).data);
  }
};

const _generateChecksum = (message, hmac_key) => {
  const hash = crypto.createHmac("sha256", hmac_key).update(message);

  return hash.digest("hex");
};
