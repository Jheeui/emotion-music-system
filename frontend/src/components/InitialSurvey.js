import React, { useState } from 'react';

const InitialSurvey = ({ onComplete }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [preferences, setPreferences] = useState({
    happy: '',
    sad: '',
    energetic: '',
    calm: ''
  });

  const questions = [
    {
      emotion: 'happy',
      title: '😊 행복할 때 어떤 음악을 듣고 싶나요?',
      description: '기분이 좋고 즐거울 때',
      options: [
        { value: 'upbeat', label: '신나는 음악', desc: '빠른 템포의 신나는 곡' },
        { value: 'cheerful', label: '밝고 경쾌한 음악', desc: '기분 좋은 팝송' },
        { value: 'energetic', label: '활기찬 음악', desc: '에너지 넘치는 댄스 곡' }
      ]
    },
    {
      emotion: 'sad',
      title: '😢 슬플 때 어떤 음악을 듣고 싶나요?',
      description: '기분이 우울하거나 힘들 때',
      options: [
        { value: 'melancholic', label: '슬픈 감성의 음악', desc: '감정에 공감하는 발라드' },
        { value: 'uplifting', label: '기분 전환되는 음악', desc: '위로가 되는 밝은 곡' },
        { value: 'calm', label: '차분한 음악', desc: '마음을 진정시키는 곡' }
      ]
    },
    {
      emotion: 'energetic',
      title: '⚡ 에너지가 넘칠 때 어떤 음악을 듣고 싶나요?',
      description: '활동적이고 운동할 때',
      options: [
        { value: 'intense', label: '강렬한 음악', desc: '파워풀한 록/힙합' },
        { value: 'workout', label: '운동하기 좋은 음악', desc: '동기부여되는 비트' },
        { value: 'dance', label: '댄스/일렉트로닉', desc: 'EDM, 클럽 음악' }
      ]
    },
    {
      emotion: 'calm',
      title: '😌 차분할 때 어떤 음악을 듣고 싶나요?',
      description: '휴식하거나 집중할 때',
      options: [
        { value: 'ambient', label: '앰비언트/배경음악', desc: '은은한 인스트루멘탈' },
        { value: 'acoustic', label: '어쿠스틱 음악', desc: '피아노, 기타 중심' },
        { value: 'soft', label: '부드러운 음악', desc: '잔잔한 보컬 곡' }
      ]
    }
  ];

  const handleSelect = (value) => {
    const emotion = questions[currentQuestion].emotion;
    setPreferences({ ...preferences, [emotion]: value });
    
    if (currentQuestion < questions.length - 1) {
      setTimeout(() => setCurrentQuestion(currentQuestion + 1), 300);
    } else {
      setTimeout(() => {
        savePreferences({ ...preferences, [emotion]: value });
      }, 300);
    }
  };

  const savePreferences = (finalPreferences) => {
    localStorage.setItem('user_music_preferences', JSON.stringify(finalPreferences));
    localStorage.setItem('survey_completed', 'true');
    onComplete(finalPreferences);
  };

  const goBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const question = questions[currentQuestion];

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999
    }}>
      <div style={{
        background: 'white',
        borderRadius: '20px',
        padding: '50px',
        maxWidth: '700px',
        width: '90%',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}>
        <div style={{
          width: '100%',
          height: '8px',
          background: '#e0e0e0',
          borderRadius: '10px',
          marginBottom: '40px',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${progress}%`,
            height: '100%',
            background: 'linear-gradient(90deg, #667eea, #764ba2)',
            transition: 'width 0.5s ease',
            borderRadius: '10px'
          }} />
        </div>

        <div style={{ marginBottom: '40px' }}>
          <h2 style={{
            fontSize: '32px',
            marginBottom: '15px',
            color: '#333'
          }}>
            {question.title}
          </h2>
          <p style={{
            fontSize: '16px',
            color: '#666',
            marginBottom: '10px'
          }}>
            {question.description}
          </p>
          <p style={{
            fontSize: '14px',
            color: '#999'
          }}>
            질문 {currentQuestion + 1} / {questions.length}
          </p>
        </div>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '15px',
          marginBottom: '30px'
        }}>
          {question.options.map((option) => (
            <button
              key={option.value}
              onClick={() => handleSelect(option.value)}
              style={{
                padding: '20px 25px',
                background: preferences[question.emotion] === option.value 
                  ? 'linear-gradient(135deg, #667eea, #764ba2)' 
                  : 'white',
                color: preferences[question.emotion] === option.value ? 'white' : '#333',
                border: preferences[question.emotion] === option.value 
                  ? 'none' 
                  : '2px solid #e0e0e0',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                textAlign: 'left'
              }}
              onMouseOver={(e) => {
                if (preferences[question.emotion] !== option.value) {
                  e.target.style.background = '#f5f5f5';
                  e.target.style.borderColor = '#667eea';
                }
              }}
              onMouseOut={(e) => {
                if (preferences[question.emotion] !== option.value) {
                  e.target.style.background = 'white';
                  e.target.style.borderColor = '#e0e0e0';
                }
              }}
            >
              <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '5px' }}>
                {option.label}
              </div>
              <div style={{ 
                fontSize: '14px', 
                opacity: preferences[question.emotion] === option.value ? 0.9 : 0.6 
              }}>
                {option.desc}
              </div>
            </button>
          ))}
        </div>

        {currentQuestion > 0 && (
          <button
            onClick={goBack}
            style={{
              padding: '12px 30px',
              background: 'transparent',
              color: '#667eea',
              border: '2px solid #667eea',
              borderRadius: '25px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '14px',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => {
              e.target.style.background = '#667eea';
              e.target.style.color = 'white';
            }}
            onMouseOut={(e) => {
              e.target.style.background = 'transparent';
              e.target.style.color = '#667eea';
            }}
          >
            ← 이전 질문
          </button>
        )}
      </div>
    </div>
  );
};

export default InitialSurvey;