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

  async getRecommendationsByEmotion(emotion, accessToken, limit = 20) {
    const response = await this.client.post('/recommendation/by-emotion', {
      emotion,
      accessToken,
      limit
    });
    return response.data;
  }
}

export default new API();