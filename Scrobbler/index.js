const CryptoJS = require("crypto-js");
const CONFIG = require("../config");
const RestClient = require("../rest_client")
const endpoints = require("./endpoints")

class Scrobbler {
  constructor() {
    this._restClient = new RestClient({
      baseURL: endpoints.baseURL
    });
  }

  _getMethodSignature(params, secret) {
      const paramsArray = Array.from(params).sort(([a], [b]) => a > b ? 1 : (a < b)? -1 : 0);

      console.log("params used for signature: ", params);

      const strToEncode = paramsArray.reduce((str, [key, value]) => {
          return `${str}${key}${value}`;
      }, '');

      console.log('encoding: ', strToEncode, secret);

      const signature = CryptoJS.MD5(strToEncode + secret).toString();

      console.log('generated signature: ', signature);

      return signature;
  }

  _getSuccessfulObject(response) {
    const { scrobble } = response.scrobbles

    return {
      success: true,
      message: `Successful scrobble for "${scrobble.track["#text"]}" by ${scrobble.artist["#text"]} (album: "${scrobble.album["#text"]}" by ${scrobble.albumArtist["#text"]})`
    }
  }

  _getErrorObject(data) {
    return {
      success: false,
      message: data?.message ?? "[no message]"
    }
  }

  async scrobble(artist, track, album, albumArtist) {
    const data = new URLSearchParams({
      artist: artist,
      track: track,
      chosenByUser: "0",
      timestamp: parseInt(Date.now() / 1000, 10),
      api_key: CONFIG.LASTFM_API_KEY,
      sk: CONFIG.LASTFM_SESSION_KEY,
      method: "track.scrobble",
    })

    if (!artist || !track) {
      console.log("No artist, or no track: ", artist, track)

      return this._getErrorObject({})
    }
    if (album) {
      data.append("album", album)
    }

    if (albumArtist) {
      data.append("albumArtist", albumArtist)
    }

    data.append("api_sig", this._getMethodSignature(data, CONFIG.LASTFM_SECRET))


    try {
      let response = await this._restClient.post(
        "/?format=json",
        data,
        { "Content-Type": "application/x-www-form-urlenconded" }
      )

      console.log(`Scrobbling successful for:`, arguments)
      return this._getSuccessfulObject(response?.data);
    } catch (response) {
      console.error("Error:", response?.data)
      return this._getErrorObject(response);
    }
  }
}

module.exports = Scrobbler