const axios = require('axios');

class SpotifyService {
  constructor(accessToken) {
    this.accessToken = accessToken;
    this.baseURL = 'https://api.spotify.com/v1';
    console.log('🔵 Spotify API 서비스 생성 (Axios 버전)');
  }

  async searchTracks(query, limit = 20) {
    try {
      console.log('🔵 트랙 검색:', query, 'limit:', limit);
      
      const response = await axios.get(`${this.baseURL}/search`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        },
        params: {
          q: query,
          type: 'track',
          limit: limit
        }
      });
      
      console.log('✅ 검색 완료:', response.data.tracks.items.length, '곡');
      return response.data.tracks.items;
    } catch (error) {
      console.error('❌ 트랙 검색 에러:', error.response?.data || error.message);
      throw error;
    }
  }

  async getAudioFeatures(trackIds) {
    try {
      console.log('🔵 오디오 특성 요청:', trackIds.length, '개');
      
      const response = await axios.get(`${this.baseURL}/audio-features`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        },
        params: {
          ids: trackIds.join(',')
        }
      });
      
      console.log('✅ 오디오 특성 받음:', response.data.audio_features.length, '개');
      return response.data.audio_features;
    } catch (error) {
      console.error('❌ 오디오 특성 에러:', error.response?.data || error.message);
      throw error;
    }
  }

  async getTracks(trackIds) {
    try {
      console.log('🔵 트랙 정보 요청:', trackIds.length, '개');
      
      const response = await axios.get(`${this.baseURL}/tracks`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        },
        params: {
          ids: trackIds.join(',')
        }
      });
      
      console.log('✅ 트랙 정보 받음');
      return response.data.tracks;
    } catch (error) {
      console.error('❌ 트랙 정보 에러:', error.response?.data || error.message);
      throw error;
    }
  }

  async getRecommendations(seedTracks, targetFeatures) {
    try {
      console.log('🔵🔵🔵 추천 요청 시작 (Axios) 🔵🔵🔵');
      console.log('🔵 시드 트랙:', seedTracks);
      console.log('🔵 타겟 특성:', targetFeatures);
      
      const params = {
        limit: 20,
        seed_tracks: seedTracks.join(',')
      };
      
      // 타겟 특성 추가
      Object.keys(targetFeatures).forEach(key => {
        params[key] = targetFeatures[key];
      });
      
      console.log('🔵 최종 요청 파라미터:', JSON.stringify(params, null, 2));
      console.log('🔵 요청 URL:', `${this.baseURL}/recommendations`);
      
      const response = await axios.get(`${this.baseURL}/recommendations`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        },
        params: params
      });
      
      console.log('✅✅✅ Spotify 추천 받음:', response.data.tracks.length, '곡 ✅✅✅');
      return response.data.tracks;
    } catch (error) {
      console.error('❌❌❌ 추천 요청 에러 ❌❌❌');
      console.error('❌ 상태 코드:', error.response?.status);
      console.error('❌ 에러 데이터:', JSON.stringify(error.response?.data, null, 2));
      console.error('❌ 요청 URL:', error.config?.url);
      console.error('❌ 요청 파라미터:', JSON.stringify(error.config?.params, null, 2));
      console.error('❌ 헤더:', JSON.stringify(error.config?.headers, null, 2));
      throw error;
    }
  }
}

module.exports = SpotifyService;