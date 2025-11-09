const spotifyApi = require('../config/spotify');

class SpotifyService {
  constructor(accessToken) {
    this.api = spotifyApi;
    if (accessToken) {
      this.api.setAccessToken(accessToken);
      console.log('🔵 Spotify API 토큰 설정 완료');
    } else {
      console.warn('⚠️ accessToken이 없습니다!');
    }
  }

  async searchTracks(query, limit = 20) {
    try {
      console.log('🔵 트랙 검색:', query, 'limit:', limit);
      const data = await this.api.searchTracks(query, { limit });
      console.log('✅ 검색 완료:', data.body.tracks.items.length, '곡');
      return data.body.tracks.items;
    } catch (error) {
      console.error('❌ 트랙 검색 에러:', error.message);
      if (error.statusCode) {
        console.error('❌ 상태 코드:', error.statusCode);
      }
      throw error;
    }
  }

  async getAudioFeatures(trackIds) {
    try {
      console.log('🔵 오디오 특성 요청:', trackIds.length, '개');
      const data = await this.api.getAudioFeaturesForTracks(trackIds);
      console.log('✅ 오디오 특성 받음:', data.body.audio_features.length, '개');
      return data.body.audio_features;
    } catch (error) {
      console.error('❌ 오디오 특성 에러:', error.message);
      if (error.statusCode) {
        console.error('❌ 상태 코드:', error.statusCode);
      }
      throw error;
    }
  }

  async getTracks(trackIds) {
    try {
      console.log('🔵 트랙 정보 요청:', trackIds.length, '개');
      const data = await this.api.getTracks(trackIds);
      console.log('✅ 트랙 정보 받음');
      return data.body.tracks;
    } catch (error) {
      console.error('❌ 트랙 정보 에러:', error.message);
      throw error;
    }
  }

  async getRecommendations(seedTracks, targetFeatures) {
    try {
      console.log('🔵 추천 요청 - 시드:', seedTracks, '특성:', targetFeatures);
      const data = await this.api.getRecommendations({
        seed_tracks: seedTracks,
        limit: 20,
        ...targetFeatures
      });
      console.log('✅ Spotify 추천 받음:', data.body.tracks.length, '곡');
      return data.body.tracks;
    } catch (error) {
      console.error('❌ 추천 요청 에러:', error.message);
      if (error.statusCode) {
        console.error('❌ 상태 코드:', error.statusCode);
      }
      if (error.body) {
        console.error('❌ 에러 바디:', error.body);
      }
      throw error;
    }
  }
}

module.exports = SpotifyService;