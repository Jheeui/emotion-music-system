const SpotifyService = require('./spotifyService');
const MusicEmotionClassifier = require('../models/emotionClassifier');

class RecommendationService {
  constructor(accessToken) {
    this.spotifyService = new SpotifyService(accessToken);
    this.emotionClassifier = new MusicEmotionClassifier();
  }

  async getRecommendationsByEmotion(userEmotion, limit = 20) {
    try {
      console.log('🔵 추천 서비스 시작, 감정:', userEmotion);
      
      const targetFeatures = this.emotionClassifier.getTargetFeatures(userEmotion);
      console.log('🔵 목표 특성:', targetFeatures);
      
      const seedTracks = await this.getSeedTracks(userEmotion);
      console.log('🔵 시드 트랙:', seedTracks);
      
      const recommendations = await this.spotifyService.getRecommendations(seedTracks, targetFeatures);
      console.log('🔵 Spotify 추천 받음:', recommendations.length, '곡');
      
      if (!recommendations || recommendations.length === 0) {
        console.warn('⚠️ Spotify에서 추천을 받지 못했습니다');
        return [];
      }
      
      const trackIds = recommendations.map(track => track.id);
      const audioFeatures = await this.spotifyService.getAudioFeatures(trackIds);
      console.log('🔵 오디오 특성 받음:', audioFeatures.length, '개');

      const tracksWithEmotions = recommendations.map((track, index) => {
        const features = audioFeatures[index];
        if (!features) {
          console.warn('⚠️ 트랙', track.name, '의 오디오 특성 없음');
          return null;
        }

        const emotion = this.emotionClassifier.classifyEmotion(features);
        const score = this.emotionClassifier.calculateEmotionScore(features, userEmotion);

        return {
          id: track.id,
          name: track.name,
          artists: track.artists.map(artist => artist.name),
          album: {
            name: track.album.name,
            images: track.album.images
          },
          duration_ms: track.duration_ms,
          preview_url: track.preview_url,
          uri: track.uri,
          audioFeatures: features,
          emotion: emotion,
          matchScore: score
        };
      }).filter(track => track !== null);

      tracksWithEmotions.sort((a, b) => b.matchScore - a.matchScore);
      const finalTracks = tracksWithEmotions.slice(0, limit);
      
      console.log('✅ 최종 추천 곡:', finalTracks.length, '개');
      return finalTracks;
      
    } catch (error) {
      console.error('❌ 추천 서비스 에러:', error);
      console.error('❌ 에러 상세:', error.message);
      console.error('❌ 에러 스택:', error.stack);
      
      if (error.statusCode === 401) {
        throw new Error('Spotify 인증이 만료되었습니다. 다시 로그인해주세요.');
      }
      
      throw error;
    }
  }

  async getSeedTracks(emotion) {
    const emotionQueries = {
      happy: 'happy pop',
      sad: 'sad songs',
      energetic: 'workout',
      calm: 'chill'
    };

    try {
      const query = emotionQueries[emotion] || 'popular';
      console.log('🔵 시드 트랙 검색 쿼리:', query);
      
      const tracks = await this.spotifyService.searchTracks(query, 5);
      console.log('🔵 검색 결과:', tracks.length, '곡');
      
      if (!tracks || tracks.length === 0) {
        console.warn('⚠️ 시드 트랙 검색 실패, 기본 트랙 사용');
        return ['3n3Ppam7vgaVa1iaRUc9Lp'];
      }
      
      return tracks.slice(0, 3).map(track => track.id);
    } catch (error) {
      console.error('❌ 시드 트랙 검색 에러:', error);
      console.log('🔵 기본 시드 트랙 사용');
      return ['3n3Ppam7vgaVa1iaRUc9Lp'];
    }
  }
}

module.exports = RecommendationService;