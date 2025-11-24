const SpotifyService = require('./spotifyService');

class RecommendationService {
  constructor(accessToken) {
    this.spotifyService = new SpotifyService(accessToken);
  }

  async getRecommendationsByEmotion(userEmotion, limit = 20, userPreferences = null) {
    try {
      console.log('🔵 추천 서비스 시작, 감정:', userEmotion);
      console.log('🔵 사용자 선호도:', userPreferences);
      
      // 개인화된 감정별 검색 키워드
      const emotionKeywords = {
        happy: {
          upbeat: ['upbeat pop', 'happy dance', 'party hits', 'feel good music', 'celebration songs'],
          cheerful: ['cheerful music', 'sunshine songs', 'joyful music', 'positive vibes', 'happy beats'],
          energetic: ['energetic pop', 'fun music', 'dance pop', 'uplifting tracks', 'good mood']
        },
        sad: {
          melancholic: ['sad ballads', 'melancholy music', 'emotional songs', 'heartbreak songs', 'tearjerker'],
          uplifting: ['hopeful music', 'uplifting ballads', 'inspirational songs', 'healing music', 'comfort songs'],
          calm: ['sad piano', 'quiet sadness', 'peaceful sadness', 'gentle melancholy', 'soft emotional']
        },
        energetic: {
          intense: ['intense rock', 'powerful music', 'aggressive beats', 'hard rock', 'metal workout'],
          workout: ['workout music', 'gym playlist', 'cardio music', 'motivation music', 'power songs'],
          dance: ['edm', 'electronic dance', 'club music', 'dance hits', 'high energy dance']
        },
        calm: {
          ambient: ['ambient music', 'atmospheric sounds', 'meditation music', 'zen music', 'background music'],
          acoustic: ['acoustic songs', 'calm piano', 'guitar instrumental', 'peaceful acoustic', 'soft instrumental'],
          soft: ['soft music', 'relaxing songs', 'calm vocals', 'soothing songs', 'lofi beats']
        }
      };

      // 사용자 선호도에 따라 키워드 선택
      let selectedKeywords;
      if (userPreferences && userPreferences[userEmotion]) {
        const userPref = userPreferences[userEmotion];
        console.log(`🔵 ${userEmotion} 감정에 대한 사용자 선호: ${userPref}`);
        selectedKeywords = emotionKeywords[userEmotion][userPref] || 
                          Object.values(emotionKeywords[userEmotion]).flat();
      } else {
        selectedKeywords = Object.values(emotionKeywords[userEmotion]).flat();
      }

      // 랜덤으로 4개 키워드 선택
      const keywords = this.getRandomKeywords(selectedKeywords, 4);
      console.log('🔵 선택된 검색 키워드:', keywords);
      
      // 여러 검색 결과 수집
      let allTracks = [];
      for (const keyword of keywords) {
        try {
          console.log('🔵 검색:', keyword);
          const tracks = await this.spotifyService.searchTracks(keyword, 15);
          allTracks = allTracks.concat(tracks);
        } catch (error) {
          console.warn('⚠️ 검색 실패:', keyword, error.message);
        }
      }

      console.log('🔵 전체 검색 결과:', allTracks.length, '곡');

      if (allTracks.length === 0) {
        console.warn('⚠️ 검색 결과 없음');
        return [];
      }

      // 중복 제거
      const uniqueTracks = [];
      const trackIds = new Set();
      
      for (const track of allTracks) {
        if (!trackIds.has(track.id)) {
          trackIds.add(track.id);
          uniqueTracks.push(track);
        }
      }

      console.log('🔵 중복 제거 후:', uniqueTracks.length, '곡');

      // 랜덤 셔플
      const shuffledTracks = this.shuffleArray([...uniqueTracks]);
      
      // 트랙 정보만 반환
      const finalTracks = shuffledTracks.slice(0, limit).map(track => ({
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
        emotion: userEmotion,
        matchScore: Math.floor(75 + Math.random() * 20),
        preference: userPreferences ? userPreferences[userEmotion] : 'default'
      }));
      
      console.log('✅ 최종 추천 곡:', finalTracks.length, '개');
      return finalTracks;
      
    } catch (error) {
      console.error('❌ 추천 서비스 에러:', error);
      
      if (error.statusCode === 401) {
        throw new Error('Spotify 인증이 만료되었습니다. 다시 로그인해주세요.');
      }
      
      throw error;
    }
  }

  // 랜덤으로 n개의 키워드 선택
  getRandomKeywords(keywords, n) {
    const shuffled = [...keywords].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(n, keywords.length));
  }

  // 배열 셔플 (Fisher-Yates)
  shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  }
}

module.exports = RecommendationService;