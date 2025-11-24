import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:3001/api';

const TimeBasedSuggestion = ({ userId, onEmotionSelect }) => {
  const [suggestion, setSuggestion] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchTimeSuggestion();
    }
  }, [userId]);

  const fetchTimeSuggestion = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${API_BASE_URL}/history/time-suggestion/${userId}`);
      
      console.log('⏰ 시간대별 추천:', response.data);
      
      if (response.data.hasSuggestion) {
        setSuggestion(response.data);
      } else {
        setSuggestion(null);
      }
    } catch (error) {
      console.error('❌ 시간대별 추천 가져오기 실패:', error);
      setSuggestion(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptSuggestion = () => {
    if (suggestion && onEmotionSelect) {
      onEmotionSelect(suggestion.suggestedEmotion);
      setIsVisible(false);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
  };

  if (isLoading || !suggestion || !isVisible) {
    return null;
  }

  const getEmotionIcon = (emotion) => {
    const icons = {
      happy: '😊',
      sad: '😢',
      energetic: '⚡',
      calm: '😌'
    };
    return icons[emotion] || '🎵';
  };

  const getEmotionColor = (emotion) => {
    const colors = {
      happy: '#ffd700',
      sad: '#add8e6',
      energetic: '#ffcccb',
      calm: '#e0f7fa'
    };
    return colors[emotion] || '#e0e0e0';
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px',
      borderRadius: '15px',
      marginBottom: '20px',
      color: 'white',
      boxShadow: '0 5px 15px rgba(0,0,0,0.2)',
      position: 'relative',
      animation: 'slideIn 0.5s ease-out'
    }}>
      <button
        onClick={handleDismiss}
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          background: 'rgba(255,255,255,0.3)',
          border: 'none',
          borderRadius: '50%',
          width: '24px',
          height: '24px',
          cursor: 'pointer',
          fontSize: '14px',
          color: 'white'
        }}
      >
        ✕
      </button>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        marginBottom: '15px'
      }}>
        <span style={{ fontSize: '24px' }}>⏰</span>
        <div>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>
            {suggestion.timeOfDay} 시간대 추천
          </h3>
          <p style={{ margin: '5px 0 0 0', fontSize: '12px', opacity: 0.9 }}>
            당신의 청취 패턴을 분석했어요
          </p>
        </div>
      </div>

      <div style={{
        background: 'rgba(255,255,255,0.2)',
        padding: '15px',
        borderRadius: '10px',
        marginBottom: '15px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '15px',
          marginBottom: '10px'
        }}>
          <div style={{
            fontSize: '48px',
            background: getEmotionColor(suggestion.suggestedEmotion),
            borderRadius: '50%',
            width: '70px',
            height: '70px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {getEmotionIcon(suggestion.suggestedEmotion)}
          </div>
          
          <div style={{ flex: 1 }}>
            <div style={{
              fontSize: '20px',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              marginBottom: '5px'
            }}>
              {suggestion.suggestedEmotion}
            </div>
            <div style={{ fontSize: '14px', opacity: 0.9 }}>
              {suggestion.message}
            </div>
          </div>
        </div>

        <div style={{
          display: 'flex',
          gap: '15px',
          fontSize: '12px',
          opacity: 0.8,
          marginTop: '10px'
        }}>
          <div>
            📊 신뢰도: <strong>{suggestion.confidence}%</strong>
          </div>
          <div>
            🎵 총 {suggestion.totalListens}회 청취
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '10px' }}>
        <button
          onClick={handleAcceptSuggestion}
          style={{
            flex: 1,
            padding: '12px',
            background: 'white',
            color: '#667eea',
            border: 'none',
            borderRadius: '10px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '14px'
          }}
        >
          ✓ 이 감정으로 듣기
        </button>

        <button
          onClick={handleDismiss}
          style={{
            padding: '12px 20px',
            background: 'rgba(255,255,255,0.2)',
            color: 'white',
            border: '1px solid rgba(255,255,255,0.5)',
            borderRadius: '10px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '14px'
          }}
        >
          나중에
        </button>
      </div>

      <style>{`
        @keyframes slideIn {
          from {
            transform: translateY(-20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default TimeBasedSuggestion;