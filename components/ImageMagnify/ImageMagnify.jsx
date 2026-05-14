import React, { useState, useEffect } from 'react';
import './ImageMagnify.css';

function ImageMagnify({
  smallImage,
  largeImage,
  magnifierHeight = 150,
  magnifierWidth = 150,
  zoomLevel = 2.5
}) {
  const [zoom, setZoom] = useState(false);
  const [mouseX, setMouseX] = useState(null);
  const [mouseY, setMouseY] = useState(null);
  const [imgWidth, setImgWidth] = useState(null);
  const [imgHeight, setImgHeight] = useState(null);

  const handleMouseEnter = (e) => {
    const elem = e.currentTarget;
    const { width, height } = elem.getBoundingClientRect();
    setImgWidth(width);
    setImgHeight(height);
    setZoom(true);
  };

  const handleMouseLeave = () => {
    setZoom(false);
  };

  const handleMouseMove = (e) => {
    const elem = e.currentTarget;
    const { top, left } = elem.getBoundingClientRect();
    const x = e.pageX - left - window.pageXOffset;
    const y = e.pageY - top - window.pageYOffset;
    setMouseX(x);
    setMouseY(y);
  };

  return (
    <div
      className="img-magnifier-container"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
    >
      <img 
        className="small-image" 
        src={smallImage.src} 
        alt={smallImage.alt} 
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />

      <div
        style={{
          display: zoom ? 'block' : 'none',
          position: 'absolute',
          top: `${mouseY - magnifierHeight / 2}px`,
          left: `${mouseX - magnifierWidth / 2}px`,
          height: `${magnifierHeight}px`,
          width: `${magnifierWidth}px`,
          pointerEvents: 'none',
          backgroundImage: `url('${largeImage.src}')`,
          backgroundRepeat: 'no-repeat',
          backgroundSize: `${imgWidth * zoomLevel}px ${imgHeight * zoomLevel}px`,
          backgroundPosition: `-${mouseX * zoomLevel - magnifierWidth / 2}px -${mouseY * zoomLevel - magnifierHeight / 2}px`,
          border: '1px solid lightgray',
          backgroundColor: 'white',
          borderRadius: '5px'
        }}
      />
    </div>
  );
}

export default ImageMagnify;