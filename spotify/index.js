const querystring = require('querystring');
const RestClient = require('../rest_client');
const endpoints = require('./endpoints');
const Utils = require('./utils');

const SEARCH_TYPE = Object.freeze({
  ALBUM: 'album',
  ARTIST: 'artist',
  PLAYLIST: 'playlist',
  TRACK: 'track',
  SHOW: 'show',
  EPISODE: 'episode',
});

class SpotifyAPIClient {
  static get SEARCH_TYPE() {
    return SEARCH_TYPE;
  }

  constructor(client_id, client_secret) {
    Utils.setValue(this, 'client_base64', Utils.toBase64(`${client_id}:${client_secret}`));

    this._restClient = new RestClient({
      baseURL: 'https://api.spotify.com/v1',
    });

    this._restClient.addRequestInterceptor((config) => {
      const clientBase64 = Utils.getValue(this, 'client_base64');

      return Utils.getToken(clientBase64)
        .then(({ data }) => {
          const newAuthorization = `Bearer ${data.access_token}`;

          this._restClient.setHeader('Authorization', newAuthorization);
          config.headers['Authorization'] = newAuthorization;

          return config;
        });
    }, () => !this._restClient.getHeader('Authorization'));

    this._restClient.addResponseInterceptor(null, (error, config, requester) => {
      const clientBase64 = Utils.getValue(this, 'client_base64');

      return Utils.getToken(clientBase64)
        .then(({ data }) => {
          const newAuthorization = `Bearer ${data.access_token}`;

          this._restClient.setHeader('Authorization', newAuthorization);
          config.headers['Authorization'] = newAuthorization;

          return config;
        })
        .then(requester);
    }, (response) => response.status === 401);
  }

  search(query, type) {
    const q = Object.entries(query).reduce((acc, [key, value]) => {
      return `${acc} ${key}:${value}`;
    }, '').trim();

    const t = Array.isArray(type) ? type.join(',') : type;
    const url = endpoints.search(q, t);

    return this._restClient.get(url);
  }
}

module.exports = SpotifyAPIClient;
