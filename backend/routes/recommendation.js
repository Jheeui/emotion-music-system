const express = require('express');
const router = express.Router();
const RecommendationService = require('../services/recommendationService');

router.post('/by-emotion', async (req, res) => {
  try {
    const { emotion, accessToken, limit = 20 } = req.body;

    if (!emotion) {
      return res.status(400).json({ error: 'Emotion is required' });
    }

    if (!accessToken) {
      return res.status(401).json({ error: 'Access token is required' });
    }

    const recommendationService = new RecommendationService(accessToken);
    const recommendations = await recommendationService.getRecommendationsByEmotion(emotion, limit);

    res.json({
      emotion,
      count: recommendations.length,
      tracks: recommendations
    });
  } catch (error) {
    console.error('Error in recommendation:', error);
    res.status(500).json({ error: 'Failed to get recommendations' });
  }
});

module.exports = router;