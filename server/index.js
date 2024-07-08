require('dotenv').config();
const express = require('express');
const axios = require('axios');
const SpotifyWebApi = require('spotify-web-api-node');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  redirectUri: process.env.SPOTIFY_REDIRECT_URI
});

app.get('/login', (req, res) => {
  const scopes = ['user-library-read', 'playlist-modify-public'];
  res.redirect(spotifyApi.createAuthorizeURL(scopes));
});

app.get('/callback', async (req, res) => {
  const code = req.query.code;
  try {
    const data = await spotifyApi.authorizationCodeGrant(code);
    spotifyApi.setAccessToken(data.body['access_token']);
    spotifyApi.setRefreshToken(data.body['refresh_token']);
    res.redirect('http://localhost:3000');
  } catch (error) {
    res.send('Something went wrong with the callback.');
  }
});

app.get('/liked-songs', async (req, res) => {
  try {
    const data = await spotifyApi.getMySavedTracks({ limit: 50 });
    const tracks = data.body.items.map(item => item.track);
    res.json(tracks);
  } catch (error) {
    res.status(500).send('Failed to fetch liked songs.');
  }
});

app.get('/track-audio-features', async (req, res) => {
  const trackIds = req.query.ids.split(',');
  try {
    const data = await spotifyApi.getAudioFeaturesForTracks(trackIds);
    res.json(data.body.audio_features);
  } catch (error) {
    res.status(500).send('Failed to fetch audio features.');
  }
});

app.listen(3001, () => {
  console.log('Server is running on port 3001');
});
