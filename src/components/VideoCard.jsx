import React, { useRef, useEffect } from 'react';
import FooterLeft from './FooterLeft';
import FooterRight from './FooterRight';
import './VideoCard.css';

const VideoCard = (props) => {
  const { url, filename, description, song, likes, shares, comments, saves, setVideoRef, id } = props;
  const videoRef = useRef(null);

  useEffect(() => {
    // Autoplay el video si es necesario
    if (props.autoplay) {
      videoRef.current.play();
    }
  }, [props.autoplay]);

  useEffect(() => {
    // Pasar la referencia del video al componente padre si es necesario
    if (setVideoRef) {
      setVideoRef(videoRef.current);
    }
  }, [setVideoRef]);

  const onVideoPress = () => {
    // Pausar o reproducir el video al hacer clic en él
    if (videoRef.current.paused) {
      videoRef.current.play();
    } else {
      videoRef.current.pause();
    }
  };

  return (
    <div className="video">
      {/* Elemento de video */}
      <video
        className="player"
        onClick={onVideoPress}
        ref={videoRef}
        loop
        src={url}
        data-id={id} // Asegúrate de que id sea un número
      ></video>
      <div className="bottom-controls">
        <div className="footer-left">
          {/* Componente para mostrar datos del video */}
          <FooterLeft username={filename} description={description} song={song} />
        </div>
        <div className="footer-right">
          {/* Componente para mostrar contadores de interacción */}
          <FooterRight likes={likes} shares={shares} comments={comments} saves={saves} />
        </div>
      </div>
    </div>
  );
};

export default VideoCard;
