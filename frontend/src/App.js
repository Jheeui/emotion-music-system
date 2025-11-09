import React, { useState, useEffect } from 'react';
import EmotionDetector from './components/EmotionDetector';
import RecommendationList from './components/RecommendationList';
import MusicPlayer from './components/MusicPlayer';
import API from './services/api';
import './App.css';

console.log('✅ App.js 파일 로드됨');

function App() {
  console.log('✅ App 컴포넌트 렌더링됨');
  
  const [accessToken, setAccessToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentEmotion, setCurrentEmotion] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    console.log('✅ useEffect 실행됨');
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');

    if (code) {
      console.log('✅ OAuth code 발견:', code);
      handleCallback(code);
    }

    const savedToken = localStorage.getItem('spotify_access_token');
    if (savedToken) {
      console.log('✅ 저장된 토큰 발견');
      setAccessToken(savedToken);
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = async () => {
  console.log('🔵🔵🔵 handleLogin 함수 실행!!! 🔵🔵🔵');
  try {
    console.log('🔵 API.getLoginUrl 호출 중...');
    const data = await API.getLoginUrl();
    console.log('🔵 API 응답:', data);
    console.log('🔵 Spotify URL:', data.url);
    
    // alert 없이 바로 이동
    console.log('🔵 페이지 이동 중...');
    window.location.href = data.url;
  } catch (error) {
    console.error('❌ 로그인 에러:', error);
    alert('로그인 중 오류가 발생했습니다: ' + error.message);
  }
};

  const handleCallback = async (code) => {
    console.log('🔵 handleCallback 실행, code:', code);
    try {
      const data = await API.authenticateWithCode(code);
      console.log('🔵 인증 성공:', data);
      
      setAccessToken(data.accessToken);
      setIsAuthenticated(true);
      
      localStorage.setItem('spotify_access_token', data.accessToken);
      localStorage.setItem('spotify_refresh_token', data.refreshToken);

      window.history.replaceState({}, document.title, '/');
    } catch (error) {
      console.error('❌ 인증 에러:', error);
      alert('인증 중 오류가 발생했습니다.');
    }
  };

  const handleEmotionDetected = async (emotion, confidence) => {
    console.log('🔵 감정 감지됨:', emotion, confidence);
    setCurrentEmotion(emotion);

    if (isAuthenticated) {
      await loadRecommendations(emotion);
    } else {
      alert('먼저 Spotify에 로그인해주세요!');
    }
  };

  const loadRecommendations = async (emotion) => {
    if (!accessToken) {
      alert('로그인이 필요합니다!');
      return;
    }

    console.log('🔵 음악 추천 로드 중, 감정:', emotion);
    setIsLoading(true);
    try {
      const data = await API.getRecommendationsByEmotion(emotion, accessToken, 20);
      console.log('🔵 추천 받음:', data.tracks.length, '곡');
      setRecommendations(data.tracks);
      
      if (data.tracks.length > 0) {
        setCurrentTrack(data.tracks[0]);
      }
    } catch (error) {
      console.error('❌ 추천 로드 에러:', error);
      alert('추천 음악을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTrackSelect = (track) => {
    console.log('🔵 트랙 선택:', track.name);
    setCurrentTrack(track);
  };

  const handleLogout = () => {
    console.log('🔵 로그아웃');
    localStorage.clear();
    window.location.reload();
  };

  console.log('🔵 현재 상태 - 로그인:', isAuthenticated);

  return (
    <div className="App">
      <header className="app-header">
        <h1>🎵 감정 기반 음악 추천 시스템</h1>
        <div>
          {isAuthenticated ? (
            <button onClick={handleLogout} className="btn-logout">
              로그아웃
            </button>
          ) : (
            <button 
              onClick={handleLogin} 
              className="btn-login"
              onMouseOver={() => console.log('🔵 마우스 오버')}
            >
              Spotify 로그인
            </button>
          )}
        </div>
      </header>

      <div className="app-container">
        {!isAuthenticated ? (
          <div className="welcome-screen">
            <h2>환영합니다! 👋</h2>
            <p>Spotify에 로그인하여 시작하세요</p>
            <button 
              onClick={handleLogin} 
              className="btn-login-large"
              onMouseOver={() => console.log('🔵 큰 버튼 마우스 오버')}
            >
              Spotify로 시작하기
            </button>
          </div>
        ) : (
          <div className="main-content">
            <div className="left-panel">
              <section className="emotion-section">
                <h2>😊 감정 감지</h2>
                <EmotionDetector onEmotionDetected={handleEmotionDetected} />
                {currentEmotion && (
                  <div className="emotion-status">
                    <p>현재 감정: <strong>{currentEmotion}</strong></p>
                  </div>
                )}
              </section>

              <section className="player-section">
                <h2>🎧 Now Playing</h2>
                <MusicPlayer track={currentTrack} />
              </section>
            </div>

            <div className="right-panel">
              <section className="recommendations-section">
                {isLoading ? (
                  <div className="loading">
                    <div className="spinner"></div>
                    <p>추천 음악을 불러오는 중...</p>
                  </div>
                ) : (
                  <RecommendationList
                    tracks={recommendations}
                    onTrackSelect={handleTrackSelect}
                    currentTrack={currentTrack}
                  />
                )}
              </section>
            </div>
          </div>
        )}
      </div>

      <footer className="app-footer">
        <p>Created by VEMO Team 💙</p>
      </footer>
    </div>
  );
}

export default App;