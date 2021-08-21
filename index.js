const CONFIG = require('./config')
const AlbumResolver = require('./album_resolver');

// const track = 'Decode';
// const artist = 'Paramore';

// remove special characters from track and artist
// remove

// const track = 'Everlong (Acoustic)';
// const artist = 'Foo Fighters';

// const track = 'Everlong';
// const artist = 'Foo Fighters';

// const track = 'Can\'t stop the feeling'; // Remove apostrophe
// const artist = 'Justin Timberlake';

// const track = 'Hero';
// const artist = 'Chad Kroeger';

// const track = 'Finesse';
// const artist = 'Bruno Mars';

// const track = 'Finesse (feat. Cardi B)';
// const artist = 'Bruno Mars';

// const track = 'Finesse';
// const artist = 'Bruno Mars (feat. Cardi B)';

// const track = 'Finesse';
// const artist = 'Bruno Mars Cardi B';

// const track = 'Me, I\'m not';
// const artist = 'Nine Inch Nails';

// const track = 'Interstate Love Song';
// const artist = 'Stone Temple Pilots';

// const track = 'Came back haunted';
// const artist = 'Nine inch nails';

// const track = 'All About You';
// const artist = 'The Knocks';

// const track = 'All About You';
// const artist = 'The Knocks feat. Foster The People';

// const track = 'All About You (feat. Foster The People)';
// const artist = 'The Knocks';

// const track = 'All About You';
// const artist = 'Knocks';

// const track = 'All About You';
// const artist = 'Knocks feat. Foster The People';

// const track = 'All About You (feat. Foster The People)';
// const artist = 'The Knocks';

// const track = 'Interstate love song';
// const artist = 'Stone temple pilots';

// const track = 'My heart will go on';
// const artist = 'Celine Dion';
// const track = 'Levitating DaBaby';
// const track = 'Levitating (feat. DaBaby)';
// const artist = 'Dua Lipa';
// const artist = 'Dua Lipa';

const track = "In the navy";
const artist = "Village People";

let results;

(async () => {
  AlbumResolver.setSpotifyCredentials(CONFIG.SPOTIFY_CLIENT_ID, CONFIG.SPOTIFY_CLIENT_SECRET);

  try {
    album = await AlbumResolver.resolve(artist, track);

    console.log(JSON.stringify(album))
  // } catch ({ response }) {
  //   console.error('ERROR!', response.data, response.statusText);
  // }
  } catch(e) {
    console.error(e);
  }

  // console.log('second call..........')

  // try {
  //   results = await AlbumResolver.resolve("Jarabe de Palo", "Me gusta como eres");

  //   console.log(JSON.stringify(results.data))
  // } catch ({ response }) {
  //   console.error('ERROR!', response.data, response.statusText);
  // }
})();
