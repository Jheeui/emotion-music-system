import React, { useState, useEffect } from 'react';
import API from './services/api';
import './globals.css';
import './style.css';

function App() {
  const [accessToken, setAccessToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentEmotion, setCurrentEmotion] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');

    if (code) {
      handleCallback(code);
    } else {
      const savedToken = localStorage.getItem('spotify_access_token');
      const savedRefreshToken = localStorage.getItem('spotify_refresh_token');
      
      if (savedToken) {
        setAccessToken(savedToken);
        setRefreshToken(savedRefreshToken);
        setIsAuthenticated(true);
      }
    }
  }, []);

  const handleLogin = async () => {
    try {
      const data = await API.getLoginUrl();
      console.log('🔵 로그인 URL:', data.url);
      window.location.href = data.url;
    } catch (error) {
      console.error('❌ 로그인 에러:', error);
      alert('로그인 중 오류가 발생했습니다: ' + error.message);
    }
  };

  const handleCallback = async (code) => {
    try {
      console.log('🔵 인증 콜백 처리 중...');
      const data = await API.authenticateWithCode(code);
      console.log('✅ 인증 성공:', data);
      
      setAccessToken(data.accessToken);
      setRefreshToken(data.refreshToken);
      setIsAuthenticated(true);
      
      localStorage.setItem('spotify_access_token', data.accessToken);
      localStorage.setItem('spotify_refresh_token', data.refreshToken);
      
      window.history.replaceState({}, document.title, '/');
    } catch (error) {
      console.error('❌ 인증 에러:', error);
      alert('인증 중 오류가 발생했습니다: ' + error.message);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    setAccessToken(null);
    setRefreshToken(null);
    setIsAuthenticated(false);
    setCurrentEmotion(null);
    setRecommendations([]);
    setCurrentTrack(null);
  };

  const refreshAccessToken = async () => {
    try {
      console.log('🔵 토큰 갱신 시도...');
      const data = await API.refreshToken(refreshToken);
      console.log('✅ 토큰 갱신 성공');
      
      setAccessToken(data.accessToken);
      localStorage.setItem('spotify_access_token', data.accessToken);
      
      return data.accessToken;
    } catch (error) {
      console.error('❌ 토큰 갱신 실패:', error);
      alert('세션이 만료되었습니다. 다시 로그인해주세요.');
      handleLogout();
      return null;
    }
  };

  const selectEmotion = async (emotion) => {
    console.log('🔵 감정 선택:', emotion);
    setCurrentEmotion(emotion);
    
    if (!isAuthenticated || !accessToken) {
      alert('먼저 Spotify에 로그인해주세요!');
      return;
    }

    setIsLoading(true);
    setRecommendations([]);
    
    try {
      console.log('🔵 감정 감지 API 호출...');
      await API.detectEmotion(emotion, 1.0, new Date().toISOString());
      
      console.log('🔵 추천 음악 가져오는 중...');
      const data = await API.getRecommendationsByEmotion(emotion, accessToken, 7);
      
      console.log('✅ 추천 받음:', data);
      
      if (data.tracks && data.tracks.length > 0) {
        setRecommendations(data.tracks);
        setCurrentTrack(data.tracks[0]);
        console.log('✅ 추천 곡 개수:', data.tracks.length);
      } else {
        console.warn('⚠️ 추천 곡이 없습니다');
        alert('추천 음악을 찾을 수 없습니다. 다시 시도해주세요.');
      }
    } catch (error) {
      console.error('❌ 추천 로드 에러:', error);
      
      // 토큰 만료 에러인 경우 토큰 갱신 시도
      if (error.response?.status === 401 || 
          error.response?.data?.error?.includes('expired') ||
          error.response?.data?.error?.includes('인증')) {
        
        console.log('🔵 토큰 만료 감지, 갱신 시도...');
        const newToken = await refreshAccessToken();
        
        if (newToken) {
          console.log('🔵 갱신된 토큰으로 재시도...');
          try {
            const retryData = await API.getRecommendationsByEmotion(emotion, newToken, 7);
            if (retryData.tracks && retryData.tracks.length > 0) {
              setRecommendations(retryData.tracks);
              setCurrentTrack(retryData.tracks[0]);
              console.log('✅ 재시도 성공!');
            }
          } catch (retryError) {
            console.error('❌ 재시도 실패:', retryError);
            alert('추천 음악을 불러오는 중 오류가 발생했습니다.');
          }
        }
      } else {
        alert('추천 음악을 불러오는 중 오류가 발생했습니다.\n' + 
              (error.response?.data?.error || error.message));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleTrackSelect = (track) => {
    console.log('🔵 트랙 선택:', track.name);
    setCurrentTrack(track);
  };

  const getEmotionText = (emotion) => {
    const texts = {
      happy: 'Happy',
      sad: 'Sad', 
      energetic: 'Energetic',
      calm: 'Calm'
    };
    return texts[emotion] || 'Unknown';
  };

  // 로그인하지 않았을 때
  if (!isAuthenticated) {
    return (
      <div style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        overflow: 'hidden'
      }}>
        <div style={{
          background: 'white',
          padding: '60px',
          borderRadius: '20px',
          textAlign: 'center',
          boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
        }}>
          <h1 style={{ fontSize: '36px', marginBottom: '20px', color: '#333' }}>
            🎵 Emotion Tracks
          </h1>
          <p style={{ fontSize: '18px', color: '#666', marginBottom: '40px' }}>
            감정 기반 음악 추천 시스템
          </p>
          <button
            onClick={handleLogin}
            style={{
              padding: '16px 40px',
              fontSize: '18px',
              background: '#1db954',
              color: 'white',
              border: 'none',
              borderRadius: '25px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
            onMouseOver={(e) => e.target.style.background = '#1ed760'}
            onMouseOut={(e) => e.target.style.background = '#1db954'}
          >
            Spotify로 시작하기
          </button>
        </div>
      </div>
    );
  }

  // 로그인 후 메인 화면
  return (
    <div className="macbook">
      {/* 왼쪽 메인 영역 배경 */}
      <div className="rectangle"></div>
      
      {/* 하단 바 */}
      <div className="div"></div>
      
      {/* 로그아웃 버튼 */}
      <button
        onClick={handleLogout}
        style={{
          position: 'absolute',
          top: '30px',
          right: '30px',
          padding: '10px 20px',
          background: '#ff6b6b',
          color: 'white',
          border: 'none',
          borderRadius: '20px',
          cursor: 'pointer',
          fontWeight: 'bold',
          fontSize: '14px',
          zIndex: 1000
        }}
        onMouseOver={(e) => e.target.style.background = '#ee5a52'}
        onMouseOut={(e) => e.target.style.background = '#ff6b6b'}
      >
        로그아웃
      </button>
      
      {/* 오른쪽 트랙 리스트 배경 - 감정이 선택되었을 때만 표시 */}
      {currentEmotion && <div className="rectangle-2"></div>}
      
      {/* VEMO 로고 */}
      <div className="text-wrapper-32">VEMO</div>
      
      {/* 검색바 */}
      <div className="rectangle-10"></div>
      <p className="p">Search among 100.000+ music tracks</p>
      
      {/* 추천 트랙 타이틀 - 감정이 선택되었을 때만 표시 */}
      {currentEmotion && (
        <div className="text-wrapper">
          {getEmotionText(currentEmotion)} Tracks
        </div>
      )}
      
      {/* 추천 섹션 */}
      <div className="rectangle-11">
        <div className="text-wrapper-18">Recommend Track</div>
        <div className="text-wrapper-19">
          Emotion track - {currentEmotion ? getEmotionText(currentEmotion) : '(emotion)'}
        </div>
        
        {/* PLAY 버튼 */}
        <div className="rectangle-37"></div>
        <div className="text-wrapper-20">PLAY</div>
      </div>

      {/* 감정 선택 버튼 4개 */}
      <button
        className={`emotion-button ${currentEmotion === 'happy' ? 'selected' : ''}`}
        onClick={() => selectEmotion('happy')}
        style={{
          top: '100px',
          left: '40px',
          width: '120px',
          height: '90px',
          background: currentEmotion === 'happy' ? '#ffd700' : '#64beebf0',
          border: '2px solid #333'
        }}
        disabled={isLoading}
      >
        <div>
          <div style={{ fontSize: '36px', marginBottom: '8px' }}>😊</div>
          <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#333' }}>HAPPY</div>
        </div>
      </button>

      <button
        className={`emotion-button ${currentEmotion === 'sad' ? 'selected' : ''}`}
        onClick={() => selectEmotion('sad')}
        style={{
          top: '100px',
          left: '180px',
          width: '120px',
          height: '90px',
          background: currentEmotion === 'sad' ? '#add8e6' : '#64beebf0',
          border: '2px solid #333'
        }}
        disabled={isLoading}
      >
        <div>
          <div style={{ fontSize: '36px', marginBottom: '8px' }}>😢</div>
          <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#333' }}>SAD</div>
        </div>
      </button>

      <button
        className={`emotion-button ${currentEmotion === 'energetic' ? 'selected' : ''}`}
        onClick={() => selectEmotion('energetic')}
        style={{
          top: '100px',
          left: '320px',
          width: '120px',
          height: '90px',
          background: currentEmotion === 'energetic' ? '#ffcccb' : '#64beebf0',
          border: '2px solid #333'
        }}
        disabled={isLoading}
      >
        <div>
          <div style={{ fontSize: '36px', marginBottom: '8px' }}>⚡</div>
          <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#333' }}>ENERGETIC</div>
        </div>
      </button>

      <button
        className={`emotion-button ${currentEmotion === 'calm' ? 'selected' : ''}`}
        onClick={() => selectEmotion('calm')}
        style={{
          top: '100px',
          left: '460px',
          width: '120px',
          height: '90px',
          background: currentEmotion === 'calm' ? '#e0f7fa' : '#64beebf0',
          border: '2px solid #333'
        }}
        disabled={isLoading}
      >
        <div>
          <div style={{ fontSize: '36px', marginBottom: '8px' }}>😌</div>
          <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#333' }}>CALM</div>
        </div>
      </button>

      {/* Weekly Top Track 섹션 */}
      <div className="text-wrapper-28">Weekly Top Track</div>

      {/* Recent Emotion Tracks 섹션 */}
      <div className="text-wrapper-29">Recent Emotion Tracks</div>

      {/* 오른쪽 추천 트랙 리스트 - 감정이 선택되었을 때만 표시 */}
      {currentEmotion && (
        <>
          {isLoading ? (
            <div style={{
              position: 'absolute',
              top: '300px',
              left: '870px',
              fontSize: '16px',
              color: '#333',
              fontWeight: 'bold'
            }}>
              불러오는 중...
            </div>
          ) : (
            recommendations.slice(0, 7).map((track, index) => {
              const positions = [
                { top: 73, left: 847 },
                { top: 153, left: 847 },
                { top: 233, left: 847 },
                { top: 303, left: 847 },
                { top: 393, left: 847 },
                { top: 473, left: 847 },
                { top: 553, left: 847 }
              ];

              const pos = positions[index];
              const isSpecial = index === 3;

              return (
                <div key={track.id}>
                  {track.album.images[2] && (
                    <img
                      src={track.album.images[2].url}
                      alt={track.album.name}
                      style={{
                        position: 'absolute',
                        top: `${pos.top}px`,
                        left: `${pos.left}px`,
                        width: '53px',
                        height: isSpecial ? '62px' : '52px',
                        objectFit: 'cover',
                        cursor: 'pointer'
                      }}
                      onClick={() => handleTrackSelect(track)}
                    />
                  )}

                  <div
                    style={{
                      position: 'absolute',
                      top: `${pos.top + (isSpecial ? 15 : 10)}px`,
                      left: '906px',
                      width: '170px',
                      fontFamily: '"Raleway-Medium", Helvetica',
                      fontWeight: 500,
                      color: isSpecial ? '#ffffff' : '#000000',
                      fontSize: '13px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      cursor: 'pointer'
                    }}
                    onClick={() => handleTrackSelect(track)}
                  >
                    {track.name}
                  </div>

                  <div
                    style={{
                      position: 'absolute',
                      top: `${pos.top + (isSpecial ? 33 : 26)}px`,
                      left: '906px',
                      width: '170px',
                      fontFamily: '"Raleway-Medium", Helvetica',
                      fontWeight: 500,
                      color: isSpecial ? '#ffffff52' : '#00000052',
                      fontSize: '9px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {track.artists.join(', ')}
                  </div>

                  <div
                    style={{
                      position: 'absolute',
                      top: `${pos.top + (isSpecial ? 7 : 14)}px`,
                      left: '1084px',
                      width: '24px',
                      height: '24px',
                      cursor: 'pointer',
                      fontSize: '20px'
                    }}
                  >
                    ❤️
                  </div>
                </div>
              );
            })
          )}
        </>
      )}

      {/* 현재 재생 중인 트랙 정보 */}
      {currentTrack && (
        <>
          {currentTrack.album.images[2] && (
            <img
              src={currentTrack.album.images[2].url}
              alt={currentTrack.album.name}
              className="rectangle-27"
              style={{
                width: '44px',
                height: '48px',
                objectFit: 'cover'
              }}
            />
          )}

          <div className="text-wrapper-4">{currentTrack.name}</div>
          <div className="text-wrapper-5">{currentTrack.artists.join(', ')}</div>

          <div className="ellipse"></div>
          <div
            className="pause-2"
            style={{ cursor: 'pointer' }}
            onClick={() => {
              if (currentTrack.preview_url) {
                console.log('🔵 재생 시작:', currentTrack.name);
                const audio = new Audio(currentTrack.preview_url);
                audio.play().catch(err => {
                  console.error('❌ 재생 오류:', err);
                  alert('재생 중 오류가 발생했습니다.');
                });
              } else {
                alert('이 트랙은 미리듣기를 지원하지 않습니다.');
              }
            }}
          >
            <div style={{
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%'
            }}>
              ▶
            </div>
          </div>

          <div style={{
            position: 'absolute',
            top: '672px',
            left: '384px',
            width: '376px',
            height: '3px',
            background: '#666'
          }}></div>
          <div style={{
            position: 'absolute',
            top: '671px',
            left: '384px',
            width: '143px',
            height: '3px',
            background: '#64bdea'
          }}></div>

          <div className="text-wrapper-30">0:00</div>
          <div className="text-wrapper-31">0:30</div>
        </>
      )}
    </div>
  );
}

export default App;