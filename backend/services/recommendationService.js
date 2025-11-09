const SpotifyService = require('./spotifyService');
const MusicEmotionClassifier = require('../models/emotionClassifier');

class RecommendationService {
  constructor(accessToken) {
    this.spotifyService = new SpotifyService(accessToken);
    this.emotionClassifier = new MusicEmotionClassifier();
  }

  async getRecommendationsByEmotion(userEmotion, limit = 20) {
    try {
      const targetFeatures = this.emotionClassifier.getTargetFeatures(userEmotion);
      const seedTracks = await this.getSeedTracks(userEmotion);
      const recommendations = await this.spotifyService.getRecommendations(seedTracks, targetFeatures);
      
      const trackIds = recommendations.map(track => track.id);
      const audioFeatures = await this.spotifyService.getAudioFeatures(trackIds);

      const tracksWithEmotions = recommendations.map((track, index) => {
        const features = audioFeatures[index];
        if (!features) return null;

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
      return tracksWithEmotions.slice(0, limit);
    } catch (error) {
      console.error('Error getting recommendations:', error);
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
      const tracks = await this.spotifyService.searchTracks(query, 5);
      return tracks.slice(0, 3).map(track => track.id);
    } catch (error) {
      return ['3n3Ppam7vgaVa1iaRUc9Lp'];
    }
  }
}

module.exports = RecommendationService;