require('dotenv').config();
const express = require('express');
const SpotifyWebApi = require('spotify-web-api-node');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(cors());

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  redirectUri: process.env.SPOTIFY_REDIRECT_URI
});

let accessToken = null;
let refreshToken = null;

// Route to log in and authorize the app
app.get('/login', (req, res) => {
  const scopes = ['user-library-read', 'playlist-modify-public'];
  res.redirect(spotifyApi.createAuthorizeURL(scopes));
});

// Callback route to get the authorization code and exchange it for access and refresh tokens
app.get('/callback', async (req, res) => {
  const code = req.query.code;
  try {
    const data = await spotifyApi.authorizationCodeGrant(code);
    accessToken = data.body['access_token'];
    refreshToken = data.body['refresh_token'];
    console.log('Access Token:', accessToken);
    console.log('Refresh Token:', refreshToken);

    spotifyApi.setAccessToken(accessToken);
    spotifyApi.setRefreshToken(refreshToken);

    // Redirect to the frontend
    res.redirect('http://localhost:3000');
  } catch (error) {
    console.error('Callback Error:', error);
    res.status(500).send('Something went wrong with the callback.');
  }
});

// Middleware to ensure the access token is valid and refreshed if needed
const ensureAccessToken = async (req, res, next) => {
  try {
    if (!accessToken) {
      throw new Error('No access token set');
    }
    if (spotifyApi.getAccessToken() !== accessToken) {
      const data = await spotifyApi.refreshAccessToken();
      accessToken = data.body['access_token'];
      console.log('New Access Token:', accessToken);
      spotifyApi.setAccessToken(accessToken);
    }
    next();
  } catch (error) {
    console.error('Could not refresh access token', error);
    res.status(500).send('Failed to refresh access token.');
  }
};

// Route to get liked songs
app.get('/liked-songs', ensureAccessToken, async (req, res) => {
  try {
    const data = await spotifyApi.getMySavedTracks({ limit: 50 });
    const tracks = data.body.items.map(item => item.track);
    res.json(tracks);
  } catch (error) {
    console.error('Liked Songs Error:', error.message, error.stack);
    res.status(500).send('Failed to fetch liked songs.');
  }
});

// Route to get audio features of tracks
app.get('/track-audio-features', ensureAccessToken, async (req, res) => {
  const trackIds = req.query.ids.split(',');
  try {
    const data = await spotifyApi.getAudioFeaturesForTracks(trackIds);
    res.json(data.body.audio_features);
  } catch (error) {
    console.error('Audio Features Error:', error.message, error.stack);
    res.status(500).send('Failed to fetch audio features.');
  }
});

app.listen(3001, () => {
  console.log('Server is running on port 3001');
});
