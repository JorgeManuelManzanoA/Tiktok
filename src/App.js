import React, { useEffect, useState, useRef } from 'react';
import './App.css';
import VideoCard from './components/VideoCard';
import axios from 'axios';

function App() {
  const [videos, setVideos] = useState([]);
  const videoRefs = useRef({});
  const videoTimestamps = useRef({});

  useEffect(() => {
    // Llamada a la API para obtener los videos al cargar la aplicación
    axios.get('http://localhost:5000/api/videos')
      .then(response => {
        setVideos(response.data.videos);
      })
      .catch(error => {
        console.error('Error fetching videos:', error);
      });
  }, []);

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.8,
    };

    let currentPlayingVideo = null; // Referencia al video actualmente en reproducción

    const handleIntersection = (entries) => {
      entries.forEach((entry) => {
        const videoElement = entry.target;
        const videoId = parseInt(videoElement.dataset.video_id); // Asegúrate de que sea un número válido
        if (!isNaN(videoId)){ // Verifica si es un número válido
          // Resto de la lógica aquí
        } else {
          console.log(`Video ID "${videoElement.dataset.video_id}" is not a valid number`);
        }
        const currentTime = videoElement.currentTime;
        if (entry.isIntersecting) {
          // Si hay un video en reproducción y no es el mismo que el actual,
          // pausa el video anteriormente en reproducción.
          if (currentPlayingVideo && currentPlayingVideo !== videoElement) {
            currentPlayingVideo.pause();
          }
          videoElement.play();
          currentPlayingVideo = videoElement; // Actualiza la referencia al video en reproducción
          videoTimestamps.current[videoId] = currentTime;
        } else {
          videoElement.pause();
          const startTime = videoTimestamps.current[videoId];
          if (startTime !== undefined) {
            const elapsedTime = currentTime - startTime;
            console.log(`Video ID: ${videoId}, Time watched: ${elapsedTime.toFixed(2)} seconds`);
    
            // Enviar los datos a la API solo si hay un tiempo de inicio registrado
            axios.post('http://localhost:5000/api/video-watch-time', {
              video_id: videoId,
              watch_time: elapsedTime.toFixed(2)
            })
            .then(response => console.log('Success:', response.data))
            .catch(error => console.error('Error:', error));
          }
        }
      });
    };
    
    const observer = new IntersectionObserver(handleIntersection, observerOptions);

    Object.values(videoRefs.current).forEach((videoRef) => {
      observer.observe(videoRef);
    });

    return () => {
      observer.disconnect();
    };
  }, [videos]);

  const setVideoRef = (id) => (ref) => {
    videoRefs.current[id] = ref;
  };

  return (
    <div className="app">
      <div className="container">
        {videos.map((video) => (
          <VideoCard
          key={video._id}
          filename={video.filename}
          description={video.description}
          song={video.song}
          likes={video.likes}
          shares={video.shares}
          comments={video.comments}
          saves={video.saves}
          url={video.url}
          id={video.video_id} // Utiliza _id en lugar de video_id
          setVideoRef={setVideoRef(video._id)}
        />        
        ))}
      </div>
    </div>
  );
}

export default App;
