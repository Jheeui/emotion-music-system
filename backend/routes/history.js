const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');

// 청취 기록 저장 파일
const HISTORY_FILE = path.join(__dirname, '../data/listening_history.json');

// 데이터 디렉토리 생성
async function ensureDataDir() {
  const dir = path.dirname(HISTORY_FILE);
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch (err) {
    console.error('디렉토리 생성 에러:', err);
  }
}

// 청취 기록 저장
router.post('/save', async (req, res) => {
  try {
    const { userId, emotion, trackId, trackName, timestamp } = req.body;

    if (!userId || !emotion) {
      return res.status(400).json({ error: 'userId and emotion are required' });
    }

    await ensureDataDir();

    // 기존 기록 읽기
    let history = [];
    try {
      const data = await fs.readFile(HISTORY_FILE, 'utf8');
      history = JSON.parse(data);
    } catch (err) {
      history = [];
    }

    const now = new Date(timestamp || Date.now());
    
    // 새 기록 추가
    history.push({
      userId,
      emotion,
      trackId,
      trackName,
      timestamp: now.toISOString(),
      hour: now.getHours(),
      dayOfWeek: now.getDay(),
      date: now.toISOString().split('T')[0]
    });

    // 파일에 저장 (최근 1000개만 유지)
    const recentHistory = history.slice(-1000);
    await fs.writeFile(HISTORY_FILE, JSON.stringify(recentHistory, null, 2));

    console.log('✅ 청취 기록 저장:', emotion, 'at hour', now.getHours());

    res.json({
      success: true,
      message: 'Listening history saved'
    });

  } catch (error) {
    console.error('❌ 청취 기록 저장 에러:', error);
    res.status(500).json({ error: 'Failed to save listening history' });
  }
});

// 시간대별 추천 가져오기
router.get('/time-suggestion/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const currentHour = new Date().getHours();

    await ensureDataDir();

    let history = [];
    try {
      const data = await fs.readFile(HISTORY_FILE, 'utf8');
      history = JSON.parse(data);
    } catch (err) {
      return res.json({
        hasSuggestion: false,
        message: '아직 청취 기록이 없습니다.'
      });
    }

    const userHistory = history.filter(record => record.userId === userId);

    if (userHistory.length < 5) {
      return res.json({
        hasSuggestion: false,
        message: '충분한 데이터가 쌓이면 시간대별 추천을 제공합니다.'
      });
    }

    // 현재 시간대 (±1시간)의 기록 분석
    const timeRangeHistory = userHistory.filter(record => {
      const recordHour = record.hour;
      return Math.abs(recordHour - currentHour) <= 1 || 
             Math.abs(recordHour - currentHour) >= 23;
    });

    if (timeRangeHistory.length === 0) {
      return res.json({
        hasSuggestion: false,
        message: '이 시간대에는 아직 데이터가 없습니다.'
      });
    }

    // 감정별 빈도 계산
    const emotionCounts = {
      happy: 0,
      sad: 0,
      energetic: 0,
      calm: 0
    };

    timeRangeHistory.forEach(record => {
      if (emotionCounts.hasOwnProperty(record.emotion)) {
        emotionCounts[record.emotion]++;
      }
    });

    // 가장 많이 들은 감정 찾기
    let maxEmotion = 'calm';
    let maxCount = 0;

    Object.keys(emotionCounts).forEach(emotion => {
      if (emotionCounts[emotion] > maxCount) {
        maxCount = emotionCounts[emotion];
        maxEmotion = emotion;
      }
    });

    if (maxCount >= 3) {
      const percentage = Math.round((maxCount / timeRangeHistory.length) * 100);
      const timeOfDay = currentHour >= 6 && currentHour < 12 ? '아침' :
                        currentHour >= 12 && currentHour < 18 ? '오후' :
                        currentHour >= 18 && currentHour < 22 ? '저녁' : '밤';
      
      res.json({
        hasSuggestion: true,
        suggestedEmotion: maxEmotion,
        confidence: percentage,
        message: `이 시간대(${currentHour}시)에는 주로 ${maxEmotion} 음악을 들으시네요! (${percentage}%)`,
        timeOfDay: timeOfDay,
        totalListens: timeRangeHistory.length
      });
    } else {
      res.json({
        hasSuggestion: false,
        message: '더 많은 청취 기록이 쌓이면 정확한 추천을 제공합니다.'
      });
    }

  } catch (error) {
    console.error('❌ 시간대별 추천 에러:', error);
    res.status(500).json({ error: 'Failed to get time-based suggestion' });
  }
});

module.exports = router;