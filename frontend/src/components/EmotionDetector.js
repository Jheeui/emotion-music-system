import React, { useEffect, useRef, useState } from 'react';
import API from '../services/api';

const EmotionDetector = ({ onEmotionDetected }) => {
  const videoRef = useRef(null);
  const [currentEmotion, setCurrentEmotion] = useState(null);
  const [confidence, setConfidence] = useState(0);
  const [isDetecting, setIsDetecting] = useState(false);
  const [hasWebcam, setHasWebcam] = useState(true);
  const [useManualMode, setUseManualMode] = useState(false);

  useEffect(() => {
    if (!useManualMode) {
      startWebcam();
    }
    return () => stopWebcam();
  }, [useManualMode]);

  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setHasWebcam(true);
    } catch (err) {
      console.error('웹캠 에러:', err);
      setHasWebcam(false);
      setUseManualMode(true);
    }
  };

  const stopWebcam = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
    }
  };

  const startDetection = () => {
    setIsDetecting(true);
    detectEmotion();
  };

  const detectEmotion = async () => {
    if (!isDetecting) return;

    // 시뮬레이션 (나중에 팀원 A 모델로 교체)
    const emotions = ['happy', 'sad', 'energetic', 'calm'];
    const randomEmotion = emotions[Math.floor(Math.random() * emotions.length)];
    const randomConfidence = 0.7 + Math.random() * 0.3;

    setCurrentEmotion(randomEmotion);
    setConfidence(randomConfidence);

    const mappedEmotion = await API.detectEmotion(
      randomEmotion,
      randomConfidence,
      new Date().toISOString()
    );

    if (onEmotionDetected) {
      onEmotionDetected(mappedEmotion.mapped_emotion, randomConfidence);
    }

    setTimeout(() => {
      if (isDetecting) detectEmotion();
    }, 3000);
  };

  // 수동으로 감정 선택
  const selectEmotion = async (emotion) => {
    console.log('감정 선택:', emotion);
    setCurrentEmotion(emotion);
    setConfidence(1.0);

    const mappedEmotion = await API.detectEmotion(
      emotion,
      1.0,
      new Date().toISOString()
    );

    if (onEmotionDetected) {
      onEmotionDetected(mappedEmotion.mapped_emotion, 1.0);
    }
  };

  const getEmotionIcon = (emotion) => {
    const icons = {
      happy: '😊',
      sad: '😢',
      energetic: '⚡',
      calm: '😌'
    };
    return icons[emotion] || '😐';
  };

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      {/* 모드 전환 버튼 */}
      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={() => setUseManualMode(!useManualMode)}
          style={{
            padding: '10px 20px',
            fontSize: '14px',
            backgroundColor: '#64bdea',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            marginBottom: '10px'
          }}
        >
          {useManualMode ? '📹 웹캠 모드로 전환' : '🖱️ 수동 선택 모드로 전환'}
        </button>
      </div>

      {/* 웹캠 모드 */}
      {!useManualMode && (
        <>
          {hasWebcam ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              width="320"
              height="240"
              style={{ border: '2px solid #64bdea', borderRadius: '10px' }}
            />
          ) : (
            <div style={{ 
              width: '320px', 
              height: '240px', 
              border: '2px solid #ff6b6b', 
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto',
              backgroundColor: '#fff3cd'
            }}>
              <p style={{ color: '#856404', padding: '20px' }}>
                ⚠️ 웹캠을 사용할 수 없습니다.<br/>
                수동 선택 모드를 사용하세요.
              </p>
            </div>
          )}

          {currentEmotion && (
            <div style={{ margin: '20px 0', fontSize: '18px' }}>
              <div style={{ fontSize: '40px' }}>{getEmotionIcon(currentEmotion)}</div>
              <div><strong>{currentEmotion.toUpperCase()}</strong></div>
              <div>신뢰도: {(confidence * 100).toFixed(1)}%</div>
            </div>
          )}

          {hasWebcam && (
            <button
              onClick={isDetecting ? () => setIsDetecting(false) : startDetection}
              style={{
                padding: '12px 30px',
                fontSize: '16px',
                backgroundColor: isDetecting ? '#ff6b6b' : '#64bdea',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              {isDetecting ? '감정 감지 중지' : '감정 감지 시작'}
            </button>
          )}
        </>
      )}

      {/* 수동 선택 모드 */}
      {useManualMode && (
        <div>
          <h3 style={{ marginBottom: '20px', color: '#333' }}>감정을 선택하세요</h3>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr',
            gap: '15px',
            maxWidth: '400px',
            margin: '0 auto'
          }}>
            <button
              onClick={() => selectEmotion('happy')}
              style={{
                padding: '30px',
                fontSize: '18px',
                backgroundColor: currentEmotion === 'happy' ? '#ffd700' : '#fff',
                border: '2px solid #64bdea',
                borderRadius: '10px',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
              onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
              onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
            >
              <div style={{ fontSize: '48px' }}>😊</div>
              <div style={{ marginTop: '10px', fontWeight: 'bold' }}>HAPPY</div>
              <div style={{ fontSize: '12px', color: '#666' }}>행복한</div>
            </button>

            <button
              onClick={() => selectEmotion('sad')}
              style={{
                padding: '30px',
                fontSize: '18px',
                backgroundColor: currentEmotion === 'sad' ? '#add8e6' : '#fff',
                border: '2px solid #64bdea',
                borderRadius: '10px',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
              onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
              onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
            >
              <div style={{ fontSize: '48px' }}>😢</div>
              <div style={{ marginTop: '10px', fontWeight: 'bold' }}>SAD</div>
              <div style={{ fontSize: '12px', color: '#666' }}>슬픈</div>
            </button>

            <button
              onClick={() => selectEmotion('energetic')}
              style={{
                padding: '30px',
                fontSize: '18px',
                backgroundColor: currentEmotion === 'energetic' ? '#ffcccb' : '#fff',
                border: '2px solid #64bdea',
                borderRadius: '10px',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
              onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
              onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
            >
              <div style={{ fontSize: '48px' }}>⚡</div>
              <div style={{ marginTop: '10px', fontWeight: 'bold' }}>ENERGETIC</div>
              <div style={{ fontSize: '12px', color: '#666' }}>활기찬</div>
            </button>

            <button
              onClick={() => selectEmotion('calm')}
              style={{
                padding: '30px',
                fontSize: '18px',
                backgroundColor: currentEmotion === 'calm' ? '#e0f7fa' : '#fff',
                border: '2px solid #64bdea',
                borderRadius: '10px',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
              onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
              onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
            >
              <div style={{ fontSize: '48px' }}>😌</div>
              <div style={{ marginTop: '10px', fontWeight: 'bold' }}>CALM</div>
              <div style={{ fontSize: '12px', color: '#666' }}>차분한</div>
            </button>
          </div>

          {currentEmotion && (
            <div style={{ 
              marginTop: '30px', 
              padding: '20px',
              backgroundColor: '#f0f8ff',
              borderRadius: '10px',
              border: '2px solid #64bdea'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '10px' }}>
                {getEmotionIcon(currentEmotion)}
              </div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#333' }}>
                선택된 감정: {currentEmotion.toUpperCase()}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EmotionDetector;