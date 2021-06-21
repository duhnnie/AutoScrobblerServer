const axios = require('axios');
const urlJoin = require('url-join');

const DEFAULTS = Object.freeze({
  baseURL: '',
  timeout: 0,
  headers: {},
});

const HEADERS_CONTEXT = Object.freeze({
  COMMON: '_',
  GET: 'get',
  POST: 'post',
  PUT: 'put',
  PATCH: 'patch',
  OPTIONS: 'options',
  HEAD: 'head',
  DELETE: 'delete',
});

const REQUEST_DEFAULTS = Object.freeze({
  url: '',
  method: HEADERS_CONTEXT.GET,
  headers: {},
  params: null,
  data: null,
  timeout: 0,
});

const ALLOWED_CONFIG_KEYS = Object.freeze(Object.keys(REQUEST_DEFAULTS));

const noopInterceptor = (input) => input;
const noop = () => {};

function sanitize(config) {
  return Object.entries(config)
    .filter(([key]) => ALLOWED_CONFIG_KEYS.includes(key))
    .reduce((config, [key, value]) => {
      return {
        ...config,
        [key]: value,
      };
    }, {})
}

// Copied from https://stackoverflow.com/questions/10687099/how-to-test-if-a-url-string-is-absolute-or-relative
function isUrlAbsolute(url) {
  return url.indexOf('//') === 0 ? true : url.indexOf('://') === -1 ? false : url.indexOf('.') === -1 ? false : url.indexOf('/') === -1 ? false : url.indexOf(':') > url.indexOf('/') ? false : url.indexOf('://') < url.indexOf('.') ? true : false;
}

function requester(config) {
  return axios(config)
    .catch(({ response, request, config }) => Promise.reject(response, request, config));
}

function processRequest(config, interceptors) {
  const { request: requestInterceptors = [], response: responseInterceptors = [] } = interceptors;

  const preRequest = requestInterceptors.reduce((promise, { interceptor, deactivator }) => {
    return promise.then((cfg) => {
      const configClone = { ...cfg };

      if (deactivator(configClone) === false) {
        return cfg;
      }

      return interceptor(configClone);
    });
  }, Promise.resolve(config));

  const request = preRequest.then(requester);

  const postRequest = responseInterceptors.reduce((promise, { successInterceptor, successDeactivator, errorInterceptor, errorDeactivator }) => {
    return promise
      .then((response) => {
        const responseClone = { ...response };

        if (successDeactivator(responseClone) === false) {
          return response;
        }

        return successInterceptor(response);
      })
      .catch((error) => {
        const errorClone = { ...error };

        if (errorDeactivator(errorClone) === false) {
          return error;
        }

        return errorInterceptor(error, config, requester);
      });
  }, request);

  return postRequest;
}

class RestClient {
  static get HEADERS_CONTEXT() {
    return HEADERS_CONTEXT;
  }

  static request(config, interceptors = null) {
    const sanitizedConfig = sanitize(config);
    const requestConfig = {
      ...REQUEST_DEFAULTS,
      ...sanitizedConfig,
    };
    const myInterceptors = interceptors || {};

    return processRequest(requestConfig, myInterceptors);
  }

  static get(url, params = null, headers = null, timeout = 0) {
    return RestClient.request({ method: HEADERS_CONTEXT.GET, url, params, headers, timeout });
  }

  static post(url, data, headers = null, timeout = 0) {
    return RestClient.request({ method: HEADERS_CONTEXT.POST, url, data, headers, timeout });
  }

  constructor(settings) {
    const mySettings = {
      ...DEFAULTS,
      ...settings,
    };

    this._requestInterceptors = [];
    this._responseInterceptors = [];
    this.removeAllHeaders();
    this.setBaseURL(mySettings.baseURL);
    this.setTimeout(mySettings.timeout);

    Object.entries(mySettings.headers)
      .forEach(([context, headers]) => this.setHeaders(headers, context));
  }

  setBaseURL(url) {
    this._baseURL = url;
  }

  setTimeout(timeout) {
    this._timeout = timeout;
  }

  setHeaders(headers, context = HEADERS_CONTEXT.COMMON) {
    this._headers[context] = {};

    Object.entries(headers).forEach(([key, value]) => this.setHeader(key, value, context));
  }

  setHeader(key, value, context = HEADERS_CONTEXT.COMMON) {
    this._headers[context] = {
      ...this._headers[context],
      [key]: value,
    };
  }

  getHeader(key, context = HEADERS_CONTEXT.COMMON) {
    const headers = this._headers[context];

    return headers && headers[key];
  }

  removeHeader(key, context = HEADERS_CONTEXT) {
    delete this._headers[context][key];
  }

  removeAllHeaders() {
    // TODO: Use Map instead.
    this._headers = {};
  }

  request(config) {
    const { url, headers, timeout } = config;

    const myUrl = isUrlAbsolute(url) ? url : urlJoin(this._baseURL, url);
    const myHeaders = {
      ...this._headers[HEADERS_CONTEXT.COMMON],
      ...headers,
    };
    const myTimeout = timeout === null ? this._timeout : timeout;

    return RestClient.request({
      ...config,
      url: myUrl,
      headers: myHeaders,
      timeout: myTimeout,
    }, {
      request: this._requestInterceptors,
      response: this._responseInterceptors,
    });
  }

  addRequestInterceptor(interceptor, deactivator = null) {
    this._requestInterceptors.push({
      interceptor,
      deactivator: deactivator || noop
    });

    return this._requestInterceptors.length;
  }

  removeRequestInterceptor(id) {
    this._requestInterceptors[id] = null;
  }

  addResponseInterceptor(successInterceptor = null, successDeactivator = null, errorInterceptor = null, errorDeactivator = null) {
    if (successInterceptor || errorInterceptor) {
          this._responseInterceptors.push({
            successInterceptor: successInterceptor || noopInterceptor,
            successDeactivator: successDeactivator || noop,
            errorInterceptor: errorInterceptor || noopInterceptor,
            errorDeactivator: errorDeactivator || noop,
          });

          return this._responseInterceptors.length;
    }

    throw new Error('addResponseInterceptor(): at least one interceptor must be supplied.');
  }

  removeResponseInterceptors(id) {
    this._responseInterceptors[id] = null;
  }

  get(url, params = null, headers = null, timeout = null) {
    const method = HEADERS_CONTEXT.GET;
    const myHeaders = {
      ...this._headers[method],
      ...headers
    };

    return this.request({ url, method, params, timeout, headers: myHeaders });
  }

  post(url, data = {}, headers = null, timeout = null) {
    const method = HEADERS_CONTEXT.POST;
    const myHeaders = {
      ...this._headers[HEADERS_CONTEXT.POST],
      ...headers,
    };

    return this.request({ url, method, data, headers: myHeaders, timeout });
  }
}

module.exports = RestClient;
