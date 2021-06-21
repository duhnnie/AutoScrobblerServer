// const querystring = require('querystring');
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
    this.setCredentials(client_id, client_secret);

    this._restClient = new RestClient({
      baseURL: endpoints.baseURL,
    });

    this._restClient.addRequestInterceptor(
      async (config) => await this._updateConfigWithNewAutorization(config),
      () => !this._restClient.getHeader('Authorization')
    );

    this._restClient.addResponseInterceptor((response) => response.data, null, async (request, config, requester) => {
      const newConfig = await this._updateConfigWithNewAutorization(config);

      requester(newConfig);
    }, (response) => response.status === 401);
  }

  setCredentials(client_id, client_secret) {
    Utils.setValue(this, 'client_base64', Utils.toBase64(`${client_id}:${client_secret}`));
  }

  _refreshToken() {
    const clientBase64 = Utils.getValue(this, 'client_base64');

    return Utils.getToken(clientBase64)
      .then(({ data }) => {
        const newAuthorization = `Bearer ${data.access_token}`;

        this._restClient.setHeader('Authorization', newAuthorization);

        return newAuthorization;
      });
  }

  _updateConfigWithNewAutorization(config) {
    return this._refreshToken()
      .then((authorization) => {
        const newConfig = { ...config };

        newConfig.headers['Authorization'] = authorization;

        return newConfig;
      });
  }

  search(query, type, market = null, limit = 20, offset = 0, include_external = null) {
    const q = Object.entries(query).reduce((acc, [key, value]) => {
      return `${acc} ${key}:${value}`;
    }, '').trim();

    const t = Array.isArray(type) ? type.join(',') : type;
    const url = endpoints.search(q, t, market, limit, offset, include_external);

    return this._restClient.get(url);
  }
}

module.exports = SpotifyAPIClient;
