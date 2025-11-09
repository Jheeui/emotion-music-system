import React, { useRef, useState, useEffect } from 'react';

const MusicPlayer = ({ track }) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (track && track.preview_url && audioRef.current) {
      audioRef.current.src = track.preview_url;
      audioRef.current.load();
    }
  }, [track]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
    };
  }, []);

  const togglePlay = async () => {
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      try {
        await audioRef.current.play();
        setIsPlaying(true);
      } catch (err) {
        console.error('재생 오류:', err);
      }
    }
  };

  const formatTime = (seconds) => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!track) {
    return <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>재생할 음악을 선택하세요</div>;
  }

  if (!track.preview_url) {
    return <div style={{ padding: '40px', textAlign: 'center', color: '#ff9800' }}>⚠️ 미리듣기를 지원하지 않는 트랙입니다</div>;
  }

  return (
    <div style={{ padding: '30px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '15px', color: 'white' }}>
      <audio ref={audioRef} />
      
      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', alignItems: 'center' }}>
        {track.album.images[1] && (
          <img src={track.album.images[1].url} alt={track.album.name} style={{ width: '120px', height: '120px', borderRadius: '10px', boxShadow: '0 5px 15px rgba(0,0,0,0.3)' }} />
        )}
        <div style={{ flex: 1 }}>
          <h3 style={{ margin: '0 0 10px 0' }}>{track.name}</h3>
          <p style={{ margin: '5px 0', opacity: 0.9 }}>{track.artists.join(', ')}</p>
          <p style={{ margin: '5px 0', fontSize: '14px', opacity: 0.7 }}>{track.album.name}</p>
        </div>
      </div>

      <button
        onClick={togglePlay}
        style={{
          width: '70px',
          height: '70px',
          borderRadius: '50%',
          border: 'none',
          background: 'white',
          color: '#667eea',
          fontSize: '24px',
          cursor: 'pointer',
          marginBottom: '20px',
          boxShadow: '0 5px 15px rgba(0,0,0,0.2)',
          transition: 'transform 0.2s'
        }}
        onMouseOver={(e) => e.target.style.transform = 'scale(1.1)'}
        onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
      >
        {isPlaying ? '⏸' : '▶'}
      </button>

      <div style={{ fontSize: '14px' }}>
        <span>{formatTime(currentTime)}</span>
        <span> / </span>
        <span>{formatTime(duration)}</span>
      </div>
    </div>
  );
};

export default MusicPlayer;