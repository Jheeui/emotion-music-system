const express = require('express');
const router = express.Router();
const RecommendationService = require('../services/recommendationService');

router.post('/by-emotion', async (req, res) => {
  try {
    const { emotion, accessToken, limit = 20 } = req.body;

    console.log('🔵 추천 요청 받음');
    console.log('🔵 감정:', emotion);
    console.log('🔵 토큰 있음:', !!accessToken);
    console.log('🔵 limit:', limit);

    if (!emotion) {
      console.error('❌ 감정이 제공되지 않음');
      return res.status(400).json({ error: 'Emotion is required' });
    }

    if (!accessToken) {
      console.error('❌ 토큰이 제공되지 않음');
      return res.status(401).json({ error: 'Access token is required' });
    }

    const recommendationService = new RecommendationService(accessToken);
    const recommendations = await recommendationService.getRecommendationsByEmotion(emotion, limit);

    if (!recommendations || recommendations.length === 0) {
      console.warn('⚠️ 추천 결과 없음');
      return res.json({
        emotion,
        count: 0,
        tracks: [],
        message: '추천 음악을 찾을 수 없습니다. 다시 시도해주세요.'
      });
    }

    console.log('✅ 추천 응답 전송:', recommendations.length, '곡');
    res.json({
      emotion,
      count: recommendations.length,
      tracks: recommendations
    });
    
  } catch (error) {
    console.error('❌ 추천 라우트 에러:', error);
    console.error('❌ 에러 메시지:', error.message);
    console.error('❌ 에러 스택:', error.stack);
    
    if (error.statusCode === 401) {
      return res.status(401).json({ 
        error: 'Spotify 인증이 만료되었습니다. 다시 로그인해주세요.' 
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to get recommendations',
      details: error.message 
    });
  }
});

module.exports = router;