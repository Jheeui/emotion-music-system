class MusicEmotionClassifier:
    """음악 감정 분류기 (Python 버전)"""
    
    def classifyEmotion(self, audioFeatures):
        """오디오 특성을 기반으로 감정 분류"""
        valence = audioFeatures.get('valence', 0)
        energy = audioFeatures.get('energy', 0)
        danceability = audioFeatures.get('danceability', 0)
        acousticness = audioFeatures.get('acousticness', 0)
        
        # Happy: 높은 valence + 높은 energy
        if valence > 0.6 and energy > 0.5:
            return 'happy'
        
        # Sad: 낮은 valence + 낮은 energy
        elif valence < 0.4 and energy < 0.5:
            return 'sad'
        
        # Energetic: 높은 energy + 높은 danceability
        elif energy > 0.7 and danceability > 0.6:
            return 'energetic'
        
        # Calm: 낮은 energy + 높은 acousticness
        elif energy < 0.5 and acousticness > 0.5:
            return 'calm'
        
        # 기본값: valence와 energy로 판단
        elif valence >= 0.5:
            return 'happy'
        else:
            return 'sad'
    
    def calculateEmotionScore(self, audioFeatures, targetEmotion):
        """특정 감정에 대한 매칭 점수 계산 (0-100)"""
        valence = audioFeatures.get('valence', 0)
        energy = audioFeatures.get('energy', 0)
        danceability = audioFeatures.get('danceability', 0)
        acousticness = audioFeatures.get('acousticness', 0)
        
        if targetEmotion == 'happy':
            score = (valence * 0.4 + energy * 0.3 + danceability * 0.2 + (1 - acousticness) * 0.1) * 100
        elif targetEmotion == 'sad':
            score = ((1 - valence) * 0.4 + (1 - energy) * 0.3 + acousticness * 0.2 + (1 - danceability) * 0.1) * 100
        elif targetEmotion == 'energetic':
            score = (energy * 0.4 + danceability * 0.3 + valence * 0.2 + (1 - acousticness) * 0.1) * 100
        elif targetEmotion == 'calm':
            score = ((1 - energy) * 0.4 + acousticness * 0.3 + (1 - danceability) * 0.2 + valence * 0.1) * 100
        else:
            score = 50
        
        return min(100, max(0, score))