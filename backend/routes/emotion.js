const express = require('express');
const router = express.Router();

// 감정 매핑
const emotionMapping = {
  'happy': 'happy',
  'joy': 'happy',
  'excited': 'energetic',
  'angry': 'energetic',
  'sad': 'sad',
  'fear': 'sad',
  'neutral': 'calm',
  'calm': 'calm',
  'relaxed': 'calm'
};

// 감정 감지
router.post('/detect', (req, res) => {
  try {
    const { emotion, confidence, timestamp } = req.body;

    if (!emotion) {
      return res.status(400).json({ error: 'Emotion is required' });
    }

    const mappedEmotion = emotionMapping[emotion.toLowerCase()] || 'calm';

    res.json({
      original_emotion: emotion,
      mapped_emotion: mappedEmotion,
      confidence: confidence || 1.0,
      timestamp: timestamp || new Date().toISOString(),
      message: 'Emotion detected successfully'
    });
  } catch (error) {
    console.error('Error detecting emotion:', error);
    res.status(500).json({ error: 'Failed to process emotion' });
  }
});

// 지원되는 감정 목록
router.get('/supported', (req, res) => {
  res.json({
    emotions: ['happy', 'sad', 'energetic', 'calm'],
    mapping: emotionMapping
  });
});

module.exports = router;