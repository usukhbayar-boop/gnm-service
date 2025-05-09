const _ = require("lodash");
const axios = require("axios");
const { OAuth2Client } = require("google-auth-library");

const { GOOGLE_API_URL } = process.env;

function _buildQueryString(params) {
  const options = { ...params };

  return Object.keys(options)
    .map((key) => `${key}=${encodeURIComponent(options[key])}`)
    .join("&");
}

async function _sendRequest(method, url, body, options) {
  const qs = _buildQueryString(options);
  try {
    const { data } = await axios({
      method,
      url: `${GOOGLE_API_URL}${url}?${qs}`,
      data: method === "post" ? body : undefined,
    });

    return data;
  } catch (error) {
    throw new Error(`${error.message},${JSON.stringify(error.response.data)}`);
  }
}

export async function fetchUserInformation(access_token) {
  return await _sendRequest("get", "/oauth2/v2/userinfo", undefined, {
    access_token,
  });
}

export async function verifyToken(token) {
  const client = new OAuth2Client();

  const ticket = await client.verifyIdToken({
    idToken: token,
  });
  return ticket.getPayload();
}
