const isLeapYear = function (year) {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
};

const getLastDay = function (year, month) {
  switch (month) {
    case 4:
    case 6:
    case 9:
    case 11:
      return 30;
    case 2:
      return isLeapYear(year) ? 29 : 28;
    default:
      return 31;
  }
};

const normalizeDate =  function (date) {
  const splitted = date.split('-').map((dateFragment) => parseInt(dateFragment, 10));

  if (splitted.length < 2) {
    splitted.push(12);
  }

  if (splitted.length < 3) {
    splitted.push(getLastDay(...splitted))
  }

  return splitted;
}

const normalize = function ({ album, artists, name }) {
  return {
    album_type: album.album_type,
    release_date: normalizeDate(album.release_date),
    // release_date_precision: album.release_date_precision,
    album_artists: album.artists.map((artist) => artist.name), // album.artists.map((artist) => artist.name).join(' | '),
    album_name: album.name,
    artists: artists.map((artist) => artist.name), // artists.map((artist) => artist.name).join(' | '),
    name,
  };
}

const sanitize = function (text) {
  return text
    //.replace(/\(.+\)/, '')
    .split(' ')
    .filter((word) => word !== '')
    .join(' ');
};

const sortData = function (data) {
  const sortedData = [...data].sort((a, b) => {
    const dateA = new Date(...a.release_date);
    const dateB = new Date(...b.release_date);

    if (dateA < dateB) {
      return -1;
    } else if (dateA > dateB) {
      return  1;
    } else {
      if (a.album_name.length < b.album_name.length) {
        return -1;
      } else if (a.album_name.length > b.album_name.length) {
        return 1;
      }
      return 0;
    }
  });

  return sortedData;
}

const splitTrack = function (trackTitle) {
  return trackTitle.split(/\(|\)/).filter((word) => word);
}

const diffWithNextTrack = function (date1, date2) {
  const d1 = [...date1];
  const d2 = [...date2];

  d1[1] --;
  d2[1] --;

  return Math.abs(new Date(...d1) - new Date(...d2));
}

const testArtist = function (artistsArray, artistPart, trackPart) {
  const lcArtistPart = artistPart.toLowerCase();
  const lcTrackPart = trackPart.toLowerCase();
  const artistsWithoutInitialThe = artistsArray.map((artist) => artist.replace(/^the\s/i, ''));

  // If all the artists exists in artist or track part.
  return artistsWithoutInitialThe.every((artist) => lcArtistPart.includes(artist.toLowerCase()) || lcTrackPart.includes(artist.toLowerCase()))
    // If at least one of the artist exists in the artist part.
    && artistsWithoutInitialThe.some((artist) => lcArtistPart.includes(artist.toLowerCase()));
};

const testTrack = function (data, trackArray) {
  const artists = data.artists.map((artist) => artist.toLowerCase());
  const trackTitle = data.name.toLowerCase();
  const filtered = trackArray
    .map((trackPart) => trackPart.toLowerCase())
    .filter((trackPart) => !artists.some((artist) => trackPart.includes(artist.toLowerCase())));

  return filtered.every((trackPart) => trackTitle.includes(trackPart));
};

module.exports = {
  sanitize,
  normalize,
  sortData,
  testArtist,
  splitTrack,
  testTrack,
  diffWithNextTrack
};
