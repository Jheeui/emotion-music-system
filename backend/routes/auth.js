const express = require('express');
const router = express.Router();
const spotifyApi = require('../config/spotify');

// 인증 URL 생성
router.get('/login', (req, res) => {
  const scopes = [
    'user-read-private',
    'user-read-email',
    'streaming',
    'user-read-playback-state',
    'user-modify-playback-state',
    'user-library-read',
    'playlist-read-private'
  ];
  
  const authorizeURL = spotifyApi.createAuthorizeURL(scopes);
  res.json({ url: authorizeURL });
});

// 콜백 처리
router.post('/callback', async (req, res) => {
  const { code } = req.body;
  
  try {
    const data = await spotifyApi.authorizationCodeGrant(code);
    
    res.json({
      accessToken: data.body['access_token'],
      refreshToken: data.body['refresh_token'],
      expiresIn: data.body['expires_in']
    });
  } catch (error) {
    console.error('Error getting tokens:', error);
    res.status(400).json({ error: 'Failed to authenticate' });
  }
});

// 토큰 갱신
router.post('/refresh', async (req, res) => {
  const { refreshToken } = req.body;
  
  try {
    spotifyApi.setRefreshToken(refreshToken);
    const data = await spotifyApi.refreshAccessToken();
    
    res.json({
      accessToken: data.body['access_token'],
      expiresIn: data.body['expires_in']
    });
  } catch (error) {
    console.error('Error refreshing token:', error);
    res.status(400).json({ error: 'Failed to refresh token' });
  }
});

module.exports = router;