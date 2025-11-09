class MusicEmotionClassifier {
  constructor() {
    this.emotions = {
      HAPPY: 'happy',
      SAD: 'sad',
      ENERGETIC: 'energetic',
      CALM: 'calm'
    };
  }

  classifyEmotion(audioFeatures) {
    const { valence, energy, danceability, acousticness } = audioFeatures;

    if (valence > 0.6 && energy > 0.6) {
      return this.emotions.HAPPY;
    }
    
    if (energy > 0.7 && danceability > 0.6) {
      return this.emotions.ENERGETIC;
    }
    
    if (valence < 0.4 && energy < 0.5) {
      return this.emotions.SAD;
    }
    
    if (acousticness > 0.5 && energy < 0.5) {
      return this.emotions.CALM;
    }

    if (valence > 0.5) {
      return energy > 0.5 ? this.emotions.HAPPY : this.emotions.CALM;
    } else {
      return energy > 0.5 ? this.emotions.ENERGETIC : this.emotions.SAD;
    }
  }

  getTargetFeatures(emotion) {
    const targets = {
      [this.emotions.HAPPY]: {
        target_valence: 0.8,
        target_energy: 0.7,
        min_valence: 0.6,
        min_energy: 0.5
      },
      [this.emotions.SAD]: {
        target_valence: 0.2,
        target_energy: 0.3,
        max_valence: 0.4,
        max_energy: 0.5
      },
      [this.emotions.ENERGETIC]: {
        target_energy: 0.9,
        target_danceability: 0.8,
        min_energy: 0.7
      },
      [this.emotions.CALM]: {
        target_energy: 0.3,
        target_acousticness: 0.7,
        max_energy: 0.5
      }
    };

    return targets[emotion] || targets[this.emotions.CALM];
  }

  calculateEmotionScore(audioFeatures, targetEmotion) {
    const targets = this.getTargetFeatures(targetEmotion);
    let score = 0;
    let count = 0;

    if (targets.target_valence !== undefined) {
      score += (1 - Math.abs(audioFeatures.valence - targets.target_valence)) * 100;
      count++;
    }
    if (targets.target_energy !== undefined) {
      score += (1 - Math.abs(audioFeatures.energy - targets.target_energy)) * 100;
      count++;
    }

    return Math.round(score / count);
  }
}

module.exports = MusicEmotionClassifier;