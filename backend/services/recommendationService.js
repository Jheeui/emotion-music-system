const SpotifyService = require('./spotifyService');

class RecommendationService {
  constructor(accessToken) {
    this.spotifyService = new SpotifyService(accessToken);
  }

  async getRecommendationsByEmotion(userEmotion, limit = 20) {
    try {
      console.log('🔵 추천 서비스 시작, 감정:', userEmotion);
      
      // 감정별 검색 키워드 (더 다양하게!)
      const emotionKeywords = {
        happy: [
          'happy songs', 'feel good music', 'upbeat pop', 'cheerful hits',
          'joyful music', 'positive vibes', 'sunshine songs', 'party hits',
          'dance pop', 'uplifting tracks', 'good mood', 'fun music',
          'celebration songs', 'happy beats', 'smile songs'
        ],
        sad: [
          'sad songs', 'emotional ballads', 'melancholy music', 'heartbreak songs',
          'tearjerker', 'lonely songs', 'breakup music', 'cry songs',
          'emotional music', 'sad piano', 'melancholic', 'sorrowful',
          'grief songs', 'nostalgic music', 'blue mood'
        ],
        energetic: [
          'workout music', 'pump up songs', 'energetic hits', 'party music',
          'power songs', 'intense music', 'adrenaline rush', 'high energy',
          'motivation music', 'gym playlist', 'cardio music', 'running songs',
          'beast mode', 'power workout', 'energy boost'
        ],
        calm: [
          'chill music', 'relaxing songs', 'peaceful melodies', 'calm vibes',
          'meditation music', 'ambient sounds', 'soft music', 'tranquil',
          'soothing songs', 'zen music', 'calm piano', 'study music',
          'lofi beats', 'peaceful piano', 'relaxation'
        ]
      };

      const allKeywords = emotionKeywords[userEmotion] || ['popular music'];
      
      // 랜덤으로 4개 키워드 선택
      const selectedKeywords = this.getRandomKeywords(allKeywords, 4);
      console.log('🔵 선택된 검색 키워드:', selectedKeywords);
      
      // 여러 검색 결과 수집
      let allTracks = [];
      for (const keyword of selectedKeywords) {
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
      
      // 트랙 정보만 반환 (오디오 특성 없이)
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
        matchScore: Math.floor(75 + Math.random() * 20) // 75-95 랜덤 점수
      }));
      
      console.log('✅ 최종 추천 곡:', finalTracks.length, '개');
      return finalTracks;
      
    } catch (error) {
      console.error('❌ 추천 서비스 에러:', error);
      console.error('❌ 에러 상세:', error.message);
      
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