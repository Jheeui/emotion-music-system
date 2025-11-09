import React from 'react';

const RecommendationList = ({ tracks, onTrackSelect, currentTrack }) => {
  if (!tracks || tracks.length === 0) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
        <p>추천된 음악이 없습니다</p>
        <p style={{ fontSize: '14px', marginTop: '10px' }}>감정을 감지하면 자동으로 추천됩니다</p>
      </div>
    );
  }

  const formatDuration = (ms) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getEmotionIcon = (emotion) => {
    const icons = {
      happy: '😊',
      sad: '😢',
      energetic: '⚡',
      calm: '😌'
    };
    return icons[emotion] || '🎵';
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2 style={{ marginBottom: '20px', color: '#333' }}>추천 음악 ({tracks.length}곡)</h2>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {tracks.map((track, index) => (
          <div
            key={track.id}
            onClick={() => onTrackSelect(track)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '15px',
              padding: '15px',
              background: currentTrack?.id === track.id ? '#e3f5ff' : 'white',
              border: currentTrack?.id === track.id ? '2px solid #64bdea' : '1px solid #e0e0e0',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              if (currentTrack?.id !== track.id) {
                e.currentTarget.style.background = '#f8f8f8';
                e.currentTarget.style.transform = 'translateX(5px)';
              }
            }}
            onMouseOut={(e) => {
              if (currentTrack?.id !== track.id) {
                e.currentTarget.style.background = 'white';
                e.currentTarget.style.transform = 'translateX(0)';
              }
            }}
          >
            <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#999', minWidth: '30px', textAlign: 'center' }}>
              {index + 1}
            </span>
            
            {track.album.images[2] && (
              <img 
                src={track.album.images[2].url} 
                alt={track.album.name} 
                style={{ width: '60px', height: '60px', borderRadius: '4px', objectFit: 'cover' }} 
              />
            )}

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: '600', marginBottom: '4px', color: '#333', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {track.name}
              </div>
              <div style={{ fontSize: '14px', color: '#666', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {track.artists.join(', ')}
              </div>
            </div>

            <div style={{ textAlign: 'center', minWidth: '80px' }}>
              <div style={{ fontSize: '24px' }}>{getEmotionIcon(track.emotion)}</div>
              <div style={{ fontSize: '12px', color: '#666', textTransform: 'capitalize' }}>{track.emotion}</div>
              <div style={{ fontSize: '12px', color: '#64bdea', fontWeight: 'bold' }}>{track.matchScore}%</div>
            </div>

            <div style={{ fontSize: '14px', color: '#999', minWidth: '50px', textAlign: 'center' }}>
              {formatDuration(track.duration_ms)}
            </div>

            <button
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                border: 'none',
                background: '#64bdea',
                color: 'white',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => {
                e.target.style.background = '#52a8d4';
                e.target.style.transform = 'scale(1.1)';
                e.stopPropagation();
              }}
              onMouseOut={(e) => {
                e.target.style.background = '#64bdea';
                e.target.style.transform = 'scale(1)';
              }}
              onClick={(e) => {
                e.stopPropagation();
                onTrackSelect(track);
              }}
            >
              ▶
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecommendationList;