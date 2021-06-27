const Spotify = require('../spotify');
const { sanitize, normalize, sortData, testArtist, splitTrack, testTrack, diffWithNextTrack } = require('./utils');

const ALBUM_TYPE = {
  SINGLE: 'single',
  ALBUM: 'album',
  COMPILATION: 'compilation',
};
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

  return filtered;
}

const getAlbumData = function (data) {
  const sortedData = sortData(data);

  return data.find((track, index, trackList) => {
    if (trackList.length === 1) {
      return true;
    }

    return track.album_type !== ALBUM_TYPE.SINGLE || diffWithNextTrack(track.release_date, trackList[index + 1].release_date) <= 60 * 60 * 24 * 180;
  });
};

const resolve = async function (artist, track) {
  const trimmedArtist = artist.trim();
  const trimmedTrack = track.trim();
  const sanitizedArtist = sanitize(trimmedArtist);
  const sanitizedTrack = sanitize(trimmedTrack);
  const data = await getData(sanitizedArtist, sanitizedTrack);
  const filteredData = filterTracks(data, trimmedArtist, trimmedTrack);
  const albumData = getAlbumData(filteredData);

  return albumData;
};

module.exports = {
  setSpotifyCredentials,
  resolve,
};
