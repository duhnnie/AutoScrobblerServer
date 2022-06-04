const express = require('express')
const CONFIG = require('./config')
const AlbumResolver = require('./album_resolver');
const Scrobbler = require('./Scrobbler');

const app = express()
const port = CONFIG.PORT || 3000

app.use(express.json());

AlbumResolver.setSpotifyCredentials(CONFIG.SPOTIFY_CLIENT_ID, CONFIG.SPOTIFY_CLIENT_SECRET);

app.get('/api/album-info', async (req, res) => {
  const { artist, track } = req.query;

  try {
    album = await AlbumResolver.resolve(artist, track);

    console.log(`for artist"${artist}" and track "${track}" it was found:`, album)

    if (album) {
      res.send(album)
    } else {
      res.status(404)
        .send({
          message: 'Not found'
        })
    }
  } catch ({ response }) {
    console.error(`Error for artist"${artist}" and track "${track}":`, response)

    res.status(400)
      .send({
        data: response && response.data,
        statusText: response && response.statusText,
      })
  }
})

// app.get('/api/scrobble', async(req, res) => {
//   let s = new Scrobbler()
//   let result = await s.scrobble(
//     "Llegas",
//     "Antifaz",
//     "El Pesanervios",
//     "Llegas"
//   )

//   res.status(result ? 200 : 400)
//     .send(result)
// })

app.post('/api/scrobble', async (req, res) => {
  const { artist, track } = req.body

  console.log("body", req.body)

  if (!artist || !track) {
    res.status(400)
      .send({
        success: false,
        message: "artist and/or track are missing."
      })
    return
  }

  try {
    let albumInfo = await AlbumResolver.resolve(artist, track);

    console.log(`for artist"${artist}" and track "${track}" it was found:`, albumInfo)

    if (albumInfo) {
      let artist = albumInfo.artists[0]
      let track = albumInfo.name
      let album = albumInfo.album_name
      let albumArtist = albumInfo.album_artists[0]

      let s = new Scrobbler()
      let result = await s.scrobble(artist, track, album, albumArtist)

      res.status(result ? 200 : 400)
        .send(result)

    } else {
      res.status(404)
        .send({
          success: false,
          message: 'Album not found'
        })
    }
  } catch ({ response }) {
    console.error(`Error for artist"${artist}" and track "${track}":`, response)

    res.status(400)
      .send({
        success: false,
        message: response && response.statusText,
      })
  }
});

app.listen(port, () => {
  console.log(`Running on port ${port}\nTry making a request to http://localhost:${port}/api/album-info?artist=silversun%20pickups&track=substitution`)
})
