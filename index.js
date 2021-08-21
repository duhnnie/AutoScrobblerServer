const express = require('express')
const app = express()
const CONFIG = require('./config')
const AlbumResolver = require('./album_resolver');

const port = CONFIG.PORT || 3000

AlbumResolver.setSpotifyCredentials(CONFIG.SPOTIFY_CLIENT_ID, CONFIG.SPOTIFY_CLIENT_SECRET);

app.get('/api/album-info', async (req, res) => {
  const { artist, track } = req.query;

  try {
    album = await AlbumResolver.resolve(artist, track);

    console.log(`for artist"${artist}" and track "${track}" it was found:`, album)

    if (album) {
      res.send(album)
    } else {
      res.send(404).send({
        message: 'Not found'
      })
    }
  } catch ({ response }) {
    console.error(`Error for artist"${artist}" and track "${track}":`, response)

    res.status(400).send({
      data: response.data,
      statusText: response.statusText,
    })
  }
})

app.listen(port, () => {
  console.log(`Running on port ${port}\nTry making a request to http://localhost:3000/api/album-info?artist=silversun%20pickups&track=substitution`)
})
