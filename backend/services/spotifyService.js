const spotifyApi = require('../config/spotify');

class SpotifyService {
  constructor(accessToken) {
    this.api = spotifyApi;
    if (accessToken) {
      this.api.setAccessToken(accessToken);
    }
  }

  async searchTracks(query, limit = 20) {
    try {
      const data = await this.api.searchTracks(query, { limit });
      return data.body.tracks.items;
    } catch (error) {
      console.error('Error searching tracks:', error);
      throw error;
    }
  }

  async getAudioFeatures(trackIds) {
    try {
      const data = await this.api.getAudioFeaturesForTracks(trackIds);
      return data.body.audio_features;
    } catch (error) {
      console.error('Error getting audio features:', error);
      throw error;
    }
  }

  async getTracks(trackIds) {
    try {
      const data = await this.api.getTracks(trackIds);
      return data.body.tracks;
    } catch (error) {
      console.error('Error getting tracks:', error);
      throw error;
    }
  }

  async getRecommendations(seedTracks, targetFeatures) {
    try {
      const data = await this.api.getRecommendations({
        seed_tracks: seedTracks,
        limit: 20,
        ...targetFeatures
      });
      return data.body.tracks;
    } catch (error) {
      console.error('Error getting recommendations:', error);
      throw error;
    }
  }
}

module.exports = SpotifyService;