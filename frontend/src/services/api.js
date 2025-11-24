import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:3001/api';

class API {
  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  async getLoginUrl() {
    const response = await this.client.get('/auth/login');
    return response.data;
  }

  async authenticateWithCode(code) {
    const response = await this.client.post('/auth/callback', { code });
    return response.data;
  }

  async refreshToken(refreshToken) {
    const response = await this.client.post('/auth/refresh', { refreshToken });
    return response.data;
  }

  async detectEmotion(emotion, confidence, timestamp) {
    const response = await this.client.post('/emotion/detect', {
      emotion,
      confidence,
      timestamp
    });
    return response.data;
  }

  async getRecommendationsByEmotion(emotion, accessToken, limit = 20, userPreferences = null) {
    const response = await this.client.post('/recommendation/by-emotion', {
      emotion,
      accessToken,
      limit,
      userPreferences
    });
    return response.data;
  }

  async detectEmotionFromImage(imageData) {
    const response = await this.client.post('/emotion/detect-from-image', {
      image: imageData
    });
    return response.data;
  }

  async saveListeningHistory(userId, emotion, trackId, trackName, timestamp = null) {
    const response = await this.client.post('/history/save', {
      userId,
      emotion,
      trackId,
      trackName,
      timestamp: timestamp || new Date().toISOString()
    });
    return response.data;
  }

  async getTimeBasedSuggestion(userId) {
    const response = await this.client.get(`/history/time-suggestion/${userId}`);
    return response.data;
  }
}

export default new API();