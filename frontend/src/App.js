import React, { useState, useEffect, useRef } from 'react';
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
  const [selectedTrack, setSelectedTrack] = useState(null); // 선택된 트랙 (재생 X)
  const [isLoading, setIsLoading] = useState(false);
  
  const [showWebcam, setShowWebcam] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectedEmotion, setDetectedEmotion] = useState(null);
  const [confidence, setConfidence] = useState(0);
  const videoRef = useRef(null);

  const [player, setPlayer] = useState(null);
  const [deviceId, setDeviceId] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playerReady, setPlayerReady] = useState(false);

  const [currentPosition, setCurrentPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [repeatMode, setRepeatMode] = useState('off');
  const [shuffleMode, setShuffleMode] = useState(false);

  const [recentTracks, setRecentTracks] = useState([]);

  const positionIntervalRef = useRef(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');

    if (code) {
      console.log('🔵 URL에서 code 발견, 콜백 처리 시작');
      
      const isProcessing = sessionStorage.getItem('spotify_auth_processing');
      
      if (!isProcessing) {
        sessionStorage.setItem('spotify_auth_processing', 'true');
        handleCallback(code);
      } else {
        console.log('⚠️ 이미 인증 처리 중...');
      }
    } else {
      const savedToken = localStorage.getItem('spotify_access_token');
      const savedRefreshToken = localStorage.getItem('spotify_refresh_token');
      
      if (savedToken) {
        console.log('🔵 저장된 토큰 발견');
        setAccessToken(savedToken);
        setRefreshToken(savedRefreshToken);
        setIsAuthenticated(true);
      }
    }
  }, []);

  useEffect(() => {
    if (accessToken && !player) {
      console.log('🔵 Spotify Player 초기화 시작');
      
      // SDK 로드 전에 콜백 함수 먼저 정의
      window.onSpotifyWebPlaybackSDKReady = () => {
        console.log('🔵 Spotify SDK Ready');
        initializePlayer();
      };

      // SDK가 이미 로드되어 있다면 바로 초기화
      if (window.Spotify) {
        initializePlayer();
      }
    }

    return () => {
      if (player) {
        player.disconnect();
      }
    };
  }, [accessToken, player]);

  const initializePlayer = () => {
    if (!accessToken || player) return;

    const spotifyPlayer = new window.Spotify.Player({
      name: 'Emotion Tracks Player',
      getOAuthToken: cb => { cb(accessToken); },
      volume: 0.5
    });

    spotifyPlayer.addListener('initialization_error', ({ message }) => {
      console.error('❌ 초기화 에러:', message);
    });
    spotifyPlayer.addListener('authentication_error', ({ message }) => {
      console.error('❌ 인증 에러:', message);
    });
    spotifyPlayer.addListener('account_error', ({ message }) => {
      console.error('❌ 계정 에러:', message);
    });
    spotifyPlayer.addListener('playback_error', ({ message }) => {
      console.error('❌ 재생 에러:', message);
    });

    spotifyPlayer.addListener('ready', ({ device_id }) => {
      console.log('✅ Spotify Player Ready! Device ID:', device_id);
      setDeviceId(device_id);
      setPlayerReady(true);
    });

    spotifyPlayer.addListener('not_ready', ({ device_id }) => {
      console.log('⚠️ Device ID has gone offline', device_id);
    });

    spotifyPlayer.addListener('player_state_changed', state => {
      if (state) {
        setIsPlaying(!state.paused);
        setCurrentPosition(state.position);
        setDuration(state.duration);
        
        if (state.paused && state.position === 0 && state.track_window.previous_tracks.length > 0) {
          console.log('🔵 곡 종료 감지');
          handleTrackEnd();
        }
      }
    });

    spotifyPlayer.connect().then(success => {
      if (success) {
        console.log('✅ Spotify Player 연결 성공!');
      }
    });

    setPlayer(spotifyPlayer);
  };

  useEffect(() => {
    if (isPlaying && player) {
      positionIntervalRef.current = setInterval(async () => {
        const state = await player.getCurrentState();
        if (state) {
          setCurrentPosition(state.position);
          setDuration(state.duration);
        }
      }, 1000);
    } else {
      if (positionIntervalRef.current) {
        clearInterval(positionIntervalRef.current);
      }
    }

    return () => {
      if (positionIntervalRef.current) {
        clearInterval(positionIntervalRef.current);
      }
    };
  }, [isPlaying, player]);

  useEffect(() => {
    if (showWebcam) {
      startWebcam();
    } else {
      stopWebcam();
    }
    
    return () => stopWebcam();
  }, [showWebcam]);

  const handleLogin = async () => {
    try {
      console.log('🔵 로그인 시도...');
      const data = await API.getLoginUrl();
      console.log('🔵 로그인 URL 받음:', data);
      
      if (data && data.url) {
        console.log('🔵 Spotify로 리다이렉트:', data.url);
        window.location.href = data.url;
      } else {
        console.error('❌ URL이 없습니다:', data);
        alert('로그인 URL을 받지 못했습니다.');
      }
    } catch (error) {
      console.error('❌ 로그인 에러:', error);
      alert('로그인 중 오류가 발생했습니다.');
    }
  };

  const handleCallback = async (code) => {
    try {
      console.log('🔵 인증 콜백 처리 시작');
      console.log('🔵 받은 code:', code);
      
      if (!code) {
        throw new Error('인증 코드가 없습니다');
      }
      
      const data = await API.authenticateWithCode(code);
      
      console.log('✅ 인증 성공!');
      
      setAccessToken(data.accessToken);
      setRefreshToken(data.refreshToken);
      setIsAuthenticated(true);
      
      localStorage.setItem('spotify_access_token', data.accessToken);
      localStorage.setItem('spotify_refresh_token', data.refreshToken);
      
      sessionStorage.removeItem('spotify_auth_processing');
      window.history.replaceState({}, document.title, '/');
      
    } catch (error) {
      console.error('❌ 인증 에러:', error);
      
      sessionStorage.removeItem('spotify_auth_processing');
      window.history.replaceState({}, document.title, '/');
      
      alert('인증 중 오류가 발생했습니다.');
    }
  };

  const handleLogout = () => {
    if (player) {
      player.disconnect();
    }
    localStorage.clear();
    sessionStorage.clear();
    setAccessToken(null);
    setRefreshToken(null);
    setIsAuthenticated(false);
    setCurrentEmotion(null);
    setRecommendations([]);
    setCurrentTrack(null);
    setSelectedTrack(null);
    setShowWebcam(false);
    setIsDetecting(false);
    setPlayer(null);
    setDeviceId(null);
    setPlayerReady(false);
    setRecentTracks([]);
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

  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('❌ 웹캠 에러:', err);
      alert('웹캠에 접근할 수 없습니다.');
      setShowWebcam(false);
    }
  };

  const stopWebcam = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const toggleDetection = () => {
    if (isDetecting) {
      setIsDetecting(false);
    } else {
      setIsDetecting(true);
      detectEmotion();
    }
  };

  const detectEmotion = async () => {
    if (!isDetecting) return;

    const emotions = ['happy', 'sad', 'energetic', 'calm'];
    const randomEmotion = emotions[Math.floor(Math.random() * emotions.length)];
    const randomConfidence = 0.7 + Math.random() * 0.3;

    setDetectedEmotion(randomEmotion);
    setConfidence(randomConfidence);

    setTimeout(() => {
      if (isDetecting) {
        detectEmotion();
      }
    }, 3000);
  };

  const useDetectedEmotion = () => {
    if (detectedEmotion) {
      selectEmotion(detectedEmotion);
      setShowWebcam(false);
      setIsDetecting(false);
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
    setSelectedTrack(null);
    
    try {
      await API.detectEmotion(emotion, 1.0, new Date().toISOString());
      const data = await API.getRecommendationsByEmotion(emotion, accessToken, 7);
      
      if (data.tracks && data.tracks.length > 0) {
        setRecommendations(data.tracks);
        setSelectedTrack(data.tracks[0]);
        console.log('✅ 추천 곡:', data.tracks.length, '개');
      } else {
        alert('추천 음악을 찾을 수 없습니다.');
      }
    } catch (error) {
      console.error('❌ 추천 로드 에러:', error);
      
      if (error.response?.status === 401) {
        const newToken = await refreshAccessToken();
        if (newToken) {
          try {
            const retryData = await API.getRecommendationsByEmotion(emotion, newToken, 7);
            if (retryData.tracks && retryData.tracks.length > 0) {
              setRecommendations(retryData.tracks);
              setSelectedTrack(retryData.tracks[0]);
            }
          } catch (retryError) {
            alert('추천 음악을 불러오는 중 오류가 발생했습니다.');
          }
        }
      } else {
        alert('추천 음악을 불러오는 중 오류가 발생했습니다.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 트랙 선택 (재생 X)
  const handleTrackSelect = (track) => {
    console.log('🔵 트랙 선택:', track.name);
    setSelectedTrack(track);
  };

  const addToRecentTracks = (track) => {
    setRecentTracks(prev => {
      const filtered = prev.filter(t => t.id !== track.id);
      return [track, ...filtered].slice(0, 10);
    });
  };

  const playTrack = async (uri, track) => {
    if (!playerReady || !deviceId) {
      alert('Spotify Player가 준비 중입니다. 잠시 후 다시 시도해주세요.');
      return;
    }

    try {
      console.log('🔵 재생 요청:', uri);
      
      await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          uris: [uri]
        })
      });

      console.log('✅ 재생 시작!');
      setIsPlaying(true);
      setCurrentTrack(track);
      
      if (track) {
        addToRecentTracks(track);
      }
    } catch (error) {
      console.error('❌ 재생 에러:', error);
      alert('재생 중 오류가 발생했습니다.');
    }
  };

  const handleTrackEnd = () => {
    if (repeatMode === 'track') {
      console.log('🔵 현재 곡 반복 재생');
      setTimeout(() => {
        if (currentTrack) {
          playTrack(currentTrack.uri, currentTrack);
        }
      }, 500);
    } else {
      playNextTrack();
    }
  };

  const playNextTrack = () => {
    if (recommendations.length === 0) return;
    
    let nextTrack;
    
    if (shuffleMode) {
      const randomIndex = Math.floor(Math.random() * recommendations.length);
      nextTrack = recommendations[randomIndex];
    } else {
      const currentIndex = recommendations.findIndex(t => t.id === currentTrack?.id);
      const nextIndex = (currentIndex + 1) % recommendations.length;
      nextTrack = recommendations[nextIndex];
    }
    
    console.log('🔵 다음 곡:', nextTrack.name);
    setSelectedTrack(nextTrack);
    
    setTimeout(() => {
      playTrack(nextTrack.uri, nextTrack);
    }, 500);
  };

  const playPreviousTrack = () => {
    if (recommendations.length === 0) return;
    
    const currentIndex = recommendations.findIndex(t => t.id === currentTrack?.id);
    const prevIndex = currentIndex === 0 ? recommendations.length - 1 : currentIndex - 1;
    const prevTrack = recommendations[prevIndex];
    
    console.log('🔵 이전 곡:', prevTrack.name);
    setSelectedTrack(prevTrack);
    
    setTimeout(() => {
      playTrack(prevTrack.uri, prevTrack);
    }, 500);
  };

  const togglePlayback = async () => {
    if (!player) return;

    if (isPlaying) {
      await player.pause();
      setIsPlaying(false);
    } else {
      await player.resume();
      setIsPlaying(true);
    }
  };

  const toggleRepeatMode = () => {
    const modes = ['off', 'context', 'track'];
    const currentIndex = modes.indexOf(repeatMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    setRepeatMode(modes[nextIndex]);
    console.log('🔵 반복 모드:', modes[nextIndex]);
  };

  const toggleShuffleMode = () => {
    setShuffleMode(!shuffleMode);
    console.log('🔵 셔플 모드:', !shuffleMode);
  };

  const seekToPosition = async (percentage) => {
    if (!player || !duration) return;
    
    const newPosition = Math.floor(duration * percentage);
    console.log('🔵 위치 이동:', newPosition, 'ms');
    
    try {
      await player.seek(newPosition);
      setCurrentPosition(newPosition);
    } catch (error) {
      console.error('❌ 위치 이동 에러:', error);
    }
  };

  const handleProgressBarClick = (e) => {
    const progressBar = e.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    const percentage = (e.clientX - rect.left) / rect.width;
    seekToPosition(percentage);
  };

  const formatTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getEmotionText = (emotion) => {
    const texts = { happy: 'Happy', sad: 'Sad', energetic: 'Energetic', calm: 'Calm' };
    return texts[emotion] || 'Unknown';
  };

  const getEmotionIcon = (emotion) => {
    const icons = { happy: '😊', sad: '😢', energetic: '⚡', calm: '😌' };
    return icons[emotion] || '😐';
  };

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

  return (
    <div className="macbook">
      <div className="main-container">
        <div className="left-section">
          <div className="header-area">
            <div className="logo">VEMO</div>
            <div className="header-buttons">
              {!playerReady && (
                <div className="player-status">🎵 Player 로딩 중...</div>
              )}
              <button
                onClick={() => setShowWebcam(!showWebcam)}
                className={showWebcam ? "btn-warning" : "btn-primary"}
              >
                📹 웹캠 {showWebcam ? '닫기' : '열기'}
              </button>
              <button onClick={handleLogout} className="btn-danger">
                로그아웃
              </button>
            </div>
          </div>

          <div className="search-bar">
            <input
              type="text"
              placeholder="Search among 100.000+ music tracks"
              readOnly
            />
          </div>

          <div className="emotion-buttons-area">
            {[
              { emotion: 'happy', icon: '😊', color: '#ffd700' },
              { emotion: 'sad', icon: '😢', color: '#add8e6' },
              { emotion: 'energetic', icon: '⚡', color: '#ffcccb' },
              { emotion: 'calm', icon: '😌', color: '#e0f7fa' }
            ].map(({ emotion, icon, color }) => (
              <button
                key={emotion}
                className={`emotion-button ${currentEmotion === emotion ? 'selected' : ''}`}
                onClick={() => selectEmotion(emotion)}
                style={{
                  background: currentEmotion === emotion ? color : '#64beebf0'
                }}
                disabled={isLoading}
              >
                <div className="emotion-button-content">
                  <div className="emotion-icon">{icon}</div>
                  <div className="emotion-label">{emotion.toUpperCase()}</div>
                </div>
              </button>
            ))}
          </div>

          <div className="recommend-section">
            <div className="recommend-subtitle">
              Emotion track - {currentEmotion ? getEmotionText(currentEmotion) : '(emotion)'}
            </div>
            <div className="recommend-title">
              {selectedTrack ? `${selectedTrack.name} - ${selectedTrack.artists.join(', ')}` : 'Recommend Track'}
            </div>
            <div
              className="play-button"
              onClick={() => {
                if (selectedTrack && selectedTrack.uri) {
                  if (currentTrack && currentTrack.id === selectedTrack.id && isPlaying) {
                    togglePlayback();
                  } else {
                    playTrack(selectedTrack.uri, selectedTrack);
                  }
                } else {
                  alert('재생할 트랙을 선택해주세요!');
                }
              }}
            >
              <div className="play-button-text">
                {currentTrack && selectedTrack && currentTrack.id === selectedTrack.id && isPlaying ? '⏸ PAUSE' : '▶ PLAY'}
              </div>
            </div>
          </div>

          <div className="section-title" style={{ marginTop: '30px' }}>Recent Emotion Tracks</div>
          
          <div style={{ marginTop: '15px' }}>
            {recentTracks.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                color: '#666', 
                fontSize: '14px',
                padding: '20px'
              }}>
                재생한 곡이 없습니다
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {recentTracks.slice(0, 5).map((track, index) => (
                  <div
                    key={`${track.id}-${index}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '10px',
                      background: 'rgba(255, 255, 255, 0.5)',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                    onClick={() => {
                      setSelectedTrack(track);
                      playTrack(track.uri, track);
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.7)'}
                    onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.5)'}
                  >
                    {track.album.images[2] && (
                      <img
                        src={track.album.images[2].url}
                        alt={track.album.name}
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '5px',
                          objectFit: 'cover'
                        }}
                      />
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontFamily: '"Raleway-Medium", Helvetica',
                        fontWeight: 500,
                        color: '#000',
                        fontSize: '13px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {track.name}
                      </div>
                      <div style={{
                        fontFamily: '"Raleway-Medium", Helvetica',
                        fontWeight: 500,
                        color: '#00000052',
                        fontSize: '11px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        marginTop: '4px'
                      }}>
                        {track.artists.join(', ')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {currentEmotion && (
          <div className="right-section">
            <div className="tracks-title">{getEmotionText(currentEmotion)} Tracks</div>
            
            {isLoading ? (
              <div className="loading-text">불러오는 중...</div>
            ) : (
              <div className="track-list">
                {recommendations.slice(0, 7).map((track) => (
                  <div
                    key={track.id}
                    className={`track-item ${selectedTrack && selectedTrack.id === track.id ? 'special' : ''}`}
                    onClick={() => handleTrackSelect(track)}
                  >
                    {track.album.images[2] && (
                      <img
                        src={track.album.images[2].url}
                        alt={track.album.name}
                        className="track-cover"
                      />
                    )}
                    <div className="track-info">
                      <div className="track-name">{track.name}</div>
                      <div className="track-artist">{track.artists.join(', ')}</div>
                    </div>
                    <div className="track-heart">❤️</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {showWebcam && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'white',
          padding: '30px',
          borderRadius: '20px',
          boxShadow: '0 10px 50px rgba(0,0,0,0.3)',
          zIndex: 2000,
          textAlign: 'center'
        }}>
          <h2 style={{ marginBottom: '20px', color: '#333' }}>🎭 웹캠 감정 인식</h2>
          
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            width="480"
            height="360"
            style={{ 
              border: '3px solid #64bdea', 
              borderRadius: '15px',
              marginBottom: '20px'
            }}
          />
          
          {detectedEmotion && (
            <div style={{
              padding: '20px',
              background: '#f0f8ff',
              borderRadius: '10px',
              marginBottom: '20px'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '10px' }}>
                {getEmotionIcon(detectedEmotion)}
              </div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#333', marginBottom: '5px' }}>
                {detectedEmotion.toUpperCase()}
              </div>
              <div style={{ fontSize: '14px', color: '#666' }}>
                신뢰도: {(confidence * 100).toFixed(1)}%
              </div>
            </div>
          )}
          
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <button
              onClick={toggleDetection}
              className={isDetecting ? "btn-danger" : "btn-primary"}
            >
              {isDetecting ? '⏸ 감지 중지' : '▶ 감지 시작'}
            </button>
            
            {detectedEmotion && (
              <button
                onClick={useDetectedEmotion}
                style={{
                  padding: '12px 30px',
                  fontSize: '16px',
                  background: '#4caf50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                ✓ 이 감정으로 추천받기
              </button>
            )}
            
            <button
              onClick={() => {
                setShowWebcam(false);
                setIsDetecting(false);
              }}
              style={{
                padding: '12px 30px',
                fontSize: '16px',
                background: '#9e9e9e',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              닫기
            </button>
          </div>
          
          <p style={{ marginTop: '15px', fontSize: '12px', color: '#999' }}>
            💡 팀원 A의 감정 인식 모델로 교체 예정
          </p>
        </div>
      )}

      {currentTrack && (
        <div className="bottom-player">
          {currentTrack.album.images[2] && (
            <img
              src={currentTrack.album.images[2].url}
              alt={currentTrack.album.name}
              className="player-cover"
            />
          )}
          
          <div className="player-info">
            <div className="player-track-name">{currentTrack.name}</div>
            <div className="player-artist-name">{currentTrack.artists.join(', ')}</div>
          </div>

          <div className="player-controls">
            <button
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: shuffleMode ? '#64bdea' : 'transparent',
                border: shuffleMode ? 'none' : '2px solid #666',
                color: shuffleMode ? '#000' : '#fff',
                cursor: 'pointer',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onClick={toggleShuffleMode}
              title="셔플"
            >
              🔀
            </button>

            <button
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'transparent',
                border: '2px solid #666',
                color: '#fff',
                cursor: 'pointer',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onClick={playPreviousTrack}
              title="이전 곡"
            >
              ⏮
            </button>

            <button
              className="play-pause-btn"
              onClick={() => {
                if (currentTrack.uri) {
                  togglePlayback();
                }
              }}
            >
              {isPlaying ? '⏸' : '▶'}
            </button>

            <button
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'transparent',
                border: '2px solid #666',
                color: '#fff',
                cursor: 'pointer',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onClick={playNextTrack}
              title="다음 곡"
            >
              ⏭
            </button>

            <button
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: repeatMode !== 'off' ? '#64bdea' : 'transparent',
                border: repeatMode !== 'off' ? 'none' : '2px solid #666',
                color: repeatMode !== 'off' ? '#000' : '#fff',
                cursor: 'pointer',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative'
              }}
              onClick={toggleRepeatMode}
              title={repeatMode === 'off' ? '반복 끄기' : repeatMode === 'track' ? '한 곡 반복' : '전체 반복'}
            >
              {repeatMode === 'track' ? '🔂' : '🔁'}
            </button>

            <div className="progress-bar-container">
              <div 
                className="progress-bar"
                onClick={handleProgressBarClick}
                style={{ cursor: 'pointer' }}
              >
                <div 
                  className="progress-fill"
                  style={{ width: `${duration > 0 ? (currentPosition / duration) * 100 : 0}%` }}
                ></div>
              </div>
              <div className="time-labels">
                <span>{formatTime(currentPosition)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;