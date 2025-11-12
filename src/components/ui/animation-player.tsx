
import React, { useRef, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { AnimationConfig } from '@/types';

interface AnimationPlayerProps {
  config: AnimationConfig;
  className?: string;
  onComplete?: () => void;
  autoPlay?: boolean;
  loop?: boolean;
}

export function AnimationPlayer({
  config,
  className,
  onComplete,
  autoPlay = true,
  loop = false
}: AnimationPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    videoElement.addEventListener('loadeddata', () => {
      setIsLoaded(true);
      if (autoPlay) {
        videoElement.play().catch(error => {
          console.error("Video autoplay failed:", error);
          setError(true);
        });
      }
    });

    videoElement.addEventListener('error', () => {
      console.error("Video load error");
      setError(true);
    });

    videoElement.addEventListener('ended', () => {
      if (onComplete) onComplete();
    });

    return () => {
      if (videoElement) {
        videoElement.removeEventListener('loadeddata', () => setIsLoaded(true));
        videoElement.removeEventListener('error', () => setError(true));
        videoElement.removeEventListener('ended', () => onComplete && onComplete());
      }
    };
  }, [autoPlay, onComplete]);

  const handlePlayClick = () => {
    if (videoRef.current) {
      videoRef.current.play().catch(error => {
        console.error("Video play failed:", error);
      });
    }
  };

  return (
    <div className={cn("relative w-full h-full", className)}>
      {!isLoaded && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      )}
      
      {error && config.fallbackImage && (
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{backgroundImage: `url(${config.fallbackImage})`}}
        />
      )}
      
      <video
        ref={videoRef}
        className={cn(
          "w-full h-full object-cover transition-opacity duration-300",
          isLoaded ? "opacity-100" : "opacity-0"
        )}
        loop={loop}
        playsInline
        muted
      >
        <source src={config.path} type="video/webm" />
        Your browser does not support the video tag.
      </video>
      
      {!autoPlay && isLoaded && !error && (
        <button
          onClick={handlePlayClick}
          className="absolute inset-0 w-full h-full flex items-center justify-center bg-black/30"
        >
          <div className="w-16 h-16 bg-primary/90 rounded-full flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-8 h-8 text-white"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </button>
      )}
    </div>
  );
}
