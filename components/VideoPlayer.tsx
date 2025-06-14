
import React from 'react';

interface VideoPlayerProps {
  src: string;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ src }) => {
  return (
    <div className="w-full aspect-video bg-black rounded-lg overflow-hidden shadow-inner">
      <video
        controls
        src={src}
        className="w-full h-full object-contain"
        aria-label="Generated lip-synced video"
      >
        Your browser does not support the video tag.
      </video>
    </div>
  );
};
