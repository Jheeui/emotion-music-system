import React, { useState, useEffect } from 'react';
import EmotionDetector from './components/EmotionDetector';
import RecommendationList from './components/RecommendationList';
import MusicPlayer from './components/MusicPlayer';
import API from './services/api';
import './App.css';

function App() {
  const [accessToken, setAccessToken] = useState(null);
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
    }

    const savedToken = localStorage.getItem('spotify_access_token');
    if (savedToken) {
      setAccessToken(savedToken);
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = async () => {
    try {
      const data = await API.getLoginUrl();
      window.location.href = data.url;
    } catch (error) {
      alert('로그인 중 오류가 발생했습니다.');
    }
  };

  const handleCallback = async (code) => {
    try {
      const data = await API.authenticateWithCode(code);
      setAccessToken(data.accessToken);
      setIsAuthenticated(true);
      
      localStorage.setItem('spotify_access_token', data.accessToken);
      localStorage.setItem('spotify_refresh_token', data.refreshToken);

      window.history.replaceState({}, document.title, '/');
    } catch (error) {
      alert('인증 중 오류가 발생했습니다.');
    }
  };

  const handleEmotionDetected = async (emotion, confidence) => {
    setCurrentEmotion(emotion);

    if (isAuthenticated) {
      await loadRecommendations(emotion);
    }
  };

  const loadRecommendations = async (emotion) => {
    if (!accessToken) return;

    setIsLoading(true);
    try {
      const data = await API.getRecommendationsByEmotion(emotion, accessToken, 20);
      setRecommendations(data.tracks);
      
      if (data.tracks.length > 0) {
        setCurrentTrack(data.tracks[0]);
      }
    } catch (error) {
      console.error('추천 로드 에러:', error);
      alert('추천 음악을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTrackSelect = (track) => {
    setCurrentTrack(track);
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.reload();
  };

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
            <button onClick={handleLogin} className="btn-login">
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
            <button onClick={handleLogin} className="btn-login-large">
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