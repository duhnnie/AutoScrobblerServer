const Spotify = require('../spotify');
const { sanitize, normalize, sortData, testArtist, splitTrack, testTrack } = require('./utils');

const spotify = new Spotify();

const setSpotifyCredentials = function (client_id, client_secret) {
  spotify.setCredentials(client_id, client_secret);
};

const getData = function(artist, track) {
  return spotify
    .search({
      artist: `${artist}`,
      track: `${track}`,
    }, [Spotify.SEARCH_TYPE.TRACK], 'BO')
    .then((data) => {
      const tracks = (data.tracks && data.tracks.items) || [];

      return tracks.map((track) => normalize(track));
    })
    .catch((response) => {
      throw new Error('Error:', response.data, response.statusText);
    })
}

/**
 * Tries to find an exact match, otherwise it filters out results that doesn't
 * belongs to the supplied artist.
 * @param {Array} tracks An array of track items
 * @param {String} artist The artist
 * @param {String} title The song title.
 * @returns {Array
 */
const filterTracks = function (tracks, artist, title) {
  const lcArtist = artist.toLowerCase();
  const lcTitle = title.toLowerCase();
  // exact match wiht one single artists
  let filtered = tracks.filter((track) => {
    return (lcTitle === track.name.toLowerCase() && track.artists.length === 1 && track.artists[0].toLowerCase() === lcArtist);
  });

  if (filtered.length) {
    return filtered;
  }

  // exact song title match + all result artists included in queried artists text
  // some artists in query could miss in results
  filtered = tracks.filter((track) => {
    return (testTrack(track, splitTrack(lcTitle)) && testArtist(track.artists, artist, title));
  });

  // if (filtered.length) {
  //   return filtered;
  // }

  // // filter out all results that doesn't match at with one artist at least.
  // // There's some special cases in which this can be useful
  // // i.e. artist = Justin Timberlake | track = Cant stop the feeling
  // filtered = tracks.filter((track) => {
  //   return track.artists.some((art) => artist.includes(art));
  // });

  return filtered;
}

const getAlbumData = function (data) {
  const sortedData = sortData(data);

  return sortedData;
};

const resolve = async function (artist, track) {
  const trimmedArtist = artist.trim();
  const trimmedTrack = track.trim();
  const sanitizedArtist = sanitize(trimmedArtist);
  const sanitizedTrack = sanitize(trimmedTrack);
  const data = await getData(sanitizedArtist, sanitizedTrack);
  const filteredData = filterTracks(data, trimmedArtist, trimmedTrack);
  const albumData = getAlbumData(filteredData);

  // console.log('original length', data.length);

  return albumData;
};

module.exports = {
  setSpotifyCredentials,
  resolve,
};
