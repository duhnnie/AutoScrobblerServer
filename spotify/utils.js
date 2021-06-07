const querystring = require('querystring');
const RestClient = require('../rest_client');
const endpoints = require('./endpoints');

const STORE = new WeakMap();

module.exports = {
  toBase64(str) {
    const buffer = new Buffer.from(str, 'utf-8');

    return buffer.toString('base64');
  },

  setValue(instance, key, value) {
    const values = STORE.get(instance) || {};

    values[key] = value;

    return STORE.set(instance, values);
  },

  getValue(instance, key) {
    const values = STORE.get(instance);

    return values[key];
  },

  getToken(clientBase64) {
    return RestClient.post(
      endpoints.authURL,
      querystring.stringify({ grant_type: 'client_credentials' }),
      {
        'Authorization': `Basic ${clientBase64}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    );
  },
};
