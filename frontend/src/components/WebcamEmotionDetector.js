import React, { useRef, useEffect, useState } from 'react';
import API from '../services/api';

const WebcamEmotionDetector = ({ onEmotionDetected, onClose }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [currentEmotion, setCurrentEmotion] = useState(null);
  const [confidence, setConfidence] = useState(0);
  const [isSimulation, setIsSimulation] = useState(false);
  const detectionIntervalRef = useRef(null);

  useEffect(() => {
    startWebcam();
    return () => {
      stopWebcam();
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
      }
    };
  }, []);

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
      alert('웹캠에 접근할 수 없습니다. 카메라 권한을 확인해주세요.');
    }
  };

  const stopWebcam = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) return null;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    return canvas.toDataURL('image/jpeg', 0.8);
  };

  const detectEmotion = async () => {
    if (!isDetecting) return;

    try {
      const imageData = captureImage();
      
      if (!imageData) {
        console.warn('⚠️ 이미지 캡처 실패');
        return;
      }

      console.log('🔵 이미지 캡처 완료, 감정 분석 중...');

      const response = await API.detectEmotionFromImage(imageData);

      console.log('✅ 감정 분석 결과:', response);

      setCurrentEmotion(response.mapped_emotion);
      setConfidence(response.confidence);
      setIsSimulation(response.simulation || false);

    } catch (error) {
      console.error('❌ 감정 감지 에러:', error);
    }
  };

  const toggleDetection = () => {
    if (isDetecting) {
      setIsDetecting(false);
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
        detectionIntervalRef.current = null;
      }
    } else {
      setIsDetecting(true);
      detectEmotion();
      detectionIntervalRef.current = setInterval(() => {
        detectEmotion();
      }, 3000);
    }
  };

  const useDetectedEmotion = () => {
    if (currentEmotion && onEmotionDetected) {
      onEmotionDetected(currentEmotion, confidence);
      onClose();
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
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999
    }}>
      <div style={{
        background: 'white',
        padding: '30px',
        borderRadius: '20px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
        maxWidth: '600px',
        textAlign: 'center'
      }}>
        <h2 style={{ marginBottom: '20px', color: '#333' }}>
          🎭 실시간 감정 인식
        </h2>

        <div style={{ position: 'relative', marginBottom: '20px' }}>
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
              background: '#000'
            }}
          />
          
          {isDetecting && (
            <div style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              background: 'rgba(255, 0, 0, 0.8)',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '20px',
              fontSize: '14px',
              fontWeight: 'bold',
              animation: 'pulse 1.5s infinite'
            }}>
              🔴 감지 중...
            </div>
          )}
        </div>

        <canvas ref={canvasRef} style={{ display: 'none' }} />

        {currentEmotion && (
          <div style={{
            padding: '20px',
            background: isSimulation ? '#fff3cd' : '#e3f5ff',
            borderRadius: '15px',
            marginBottom: '20px',
            border: `2px solid ${isSimulation ? '#ffc107' : '#64bdea'}`
          }}>
            {isSimulation && (
              <div style={{
                fontSize: '12px',
                color: '#856404',
                marginBottom: '10px',
                fontWeight: 'bold'
              }}>
                ⚠️ 시뮬레이션 모드 (모델 서버 미연결)
              </div>
            )}
            <div style={{ fontSize: '48px', marginBottom: '10px' }}>
              {getEmotionIcon(currentEmotion)}
            </div>
            <div style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#333',
              marginBottom: '5px',
              textTransform: 'uppercase'
            }}>
              {currentEmotion}
            </div>
            <div style={{ fontSize: '14px', color: '#666' }}>
              신뢰도: {(confidence * 100).toFixed(1)}%
            </div>
          </div>
        )}

        <div style={{
          display: 'flex',
          gap: '10px',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={toggleDetection}
            style={{
              padding: '12px 30px',
              fontSize: '16px',
              background: isDetecting ? '#ff6b6b' : '#64bdea',
              color: 'white',
              border: 'none',
              borderRadius: '25px',
              cursor: 'pointer',
              fontWeight: 'bold',
              transition: 'all 0.3s ease'
            }}
          >
            {isDetecting ? '⏸ 감지 중지' : '▶ 감지 시작'}
          </button>

          {currentEmotion && (
            <button
              onClick={useDetectedEmotion}
              style={{
                padding: '12px 30px',
                fontSize: '16px',
                background: '#4caf50',
                color: 'white',
                border: 'none',
                borderRadius: '25px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              ✓ 이 감정으로 추천받기
            </button>
          )}

          <button
            onClick={onClose}
            style={{
              padding: '12px 30px',
              fontSize: '16px',
              background: '#9e9e9e',
              color: 'white',
              border: 'none',
              borderRadius: '25px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            닫기
          </button>
        </div>

        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}</style>
      </div>
    </div>
  );
};

export default WebcamEmotionDetector;