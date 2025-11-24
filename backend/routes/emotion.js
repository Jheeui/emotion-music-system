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

// 팀원의 감정 인식 모델 API
const EMOTION_MODEL_API = process.env.EMOTION_MODEL_API || 'http://localhost:5000/predict';

// 이미지 기반 감정 감지
router.post('/detect-from-image', async (req, res) => {
  try {
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({ error: 'Image is required' });
    }

    console.log('🔵 이미지 기반 감정 분석 시작');

    // 팀원의 모델 API 호출 시도
    try {
      const modelResponse = await axios.post(EMOTION_MODEL_API, {
        image: image
      }, {
        timeout: 10000
      });

      console.log('✅ 모델 응답:', modelResponse.data);

      const { emotion, confidence } = modelResponse.data;
      const mappedEmotion = emotionMapping[emotion.toLowerCase()] || 'calm';

      res.json({
        original_emotion: emotion,
        mapped_emotion: mappedEmotion,
        confidence: confidence || 0.0,
        timestamp: new Date().toISOString(),
        message: 'Emotion detected from image successfully'
      });

    } catch (modelError) {
      console.error('❌ 감정 인식 모델 에러:', modelError.message);
      
      // 시뮬레이션 모드
      const emotions = ['happy', 'sad', 'energetic', 'calm'];
      const randomEmotion = emotions[Math.floor(Math.random() * emotions.length)];
      const randomConfidence = 0.7 + Math.random() * 0.3;

      console.log('⚠️ 시뮬레이션 모드로 전환');

      res.json({
        original_emotion: randomEmotion,
        mapped_emotion: randomEmotion,
        confidence: randomConfidence,
        timestamp: new Date().toISOString(),
        message: 'Emotion detected (simulation mode)',
        simulation: true
      });
    }
  } catch (error) {
    console.error('❌ 감정 감지 에러:', error);
    res.status(500).json({ error: 'Failed to detect emotion' });
  }
});

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