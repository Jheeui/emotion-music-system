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
  console.log('🔵 생성된 인증 URL:', authorizeURL);
  res.json({ url: authorizeURL });
});

// 콜백 처리
router.post('/callback', async (req, res) => {
  const { code } = req.body;
  
  console.log('🔵 콜백 요청 받음');
  console.log('🔵 받은 code:', code ? code.substring(0, 20) + '...' : 'null');
  
  if (!code) {
    console.error('❌ 인증 코드가 없습니다');
    return res.status(400).json({ error: 'Authorization code is required' });
  }
  
  try {
    console.log('🔵 Spotify에 토큰 요청 중...');
    const data = await spotifyApi.authorizationCodeGrant(code);
    
    console.log('✅ 토큰 받음');
    
    res.json({
      accessToken: data.body['access_token'],
      refreshToken: data.body['refresh_token'],
      expiresIn: data.body['expires_in']
    });
  } catch (error) {
    console.error('❌ 토큰 요청 에러:', error);
    console.error('❌ 에러 상태:', error.statusCode);
    console.error('❌ 에러 메시지:', error.message);
    console.error('❌ 에러 바디:', error.body);
    
    res.status(400).json({ 
      error: 'Failed to authenticate',
      details: error.message,
      statusCode: error.statusCode
    });
  }
});

// 토큰 갱신
router.post('/refresh', async (req, res) => {
  const { refreshToken } = req.body;
  
  if (!refreshToken) {
    return res.status(400).json({ error: 'Refresh token is required' });
  }
  
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