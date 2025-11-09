import React, { useEffect, useRef, useState } from 'react';
import API from '../services/api';

const EmotionDetector = ({ onEmotionDetected }) => {
  const videoRef = useRef(null);
  const [currentEmotion, setCurrentEmotion] = useState(null);
  const [confidence, setConfidence] = useState(0);
  const [isDetecting, setIsDetecting] = useState(false);

  useEffect(() => {
    startWebcam();
    return () => stopWebcam();
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
      console.error('웹캠 에러:', err);
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
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        width="320"
        height="240"
        style={{ border: '2px solid #64bdea', borderRadius: '10px' }}
      />

      {currentEmotion && (
        <div style={{ margin: '20px 0', fontSize: '18px' }}>
          <div style={{ fontSize: '40px' }}>{getEmotionIcon(currentEmotion)}</div>
          <div><strong>{currentEmotion.toUpperCase()}</strong></div>
          <div>신뢰도: {(confidence * 100).toFixed(1)}%</div>
        </div>
      )}

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
    </div>
  );
};

export default EmotionDetector;