import { useState, useEffect } from 'react';
import { SliderImage } from '../../types/types';
import './SimpleCarousel.css';

interface SimpleCarouselProps {
  images: SliderImage[];
  autoPlayInterval?: number;
  height?: number;
}

const SimpleCarousel: React.FC<SimpleCarouselProps> = ({
  images,
  autoPlayInterval = 5000,
  height = 400 //altura predeterminada
}) => {
  const [activeIndex, setActiveIndex] = useState(0);

  //auto-play
  useEffect(() => {
    if (images.length <= 1) return;

    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % images.length);
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [images.length, autoPlayInterval]);

  const nextSlide = () => {
    setActiveIndex((current) => (current + 1) % images.length);
  };

  const prevSlide = () => {
    setActiveIndex((current) => (current - 1 + images.length) % images.length);
  };

  if (!images || images.length === 0) {
    return <div className="carousel-empty" style={{ height: `${height}px` }}>No hay imágenes disponibles</div>;
  }

  return (
    <div className="simple-carousel" style={{ height: `${height}px` }}>
      {/* contenedor de la imagen actual */}
      <div className="carousel-image-wrapper">
        {images.map((image, index) => (
          <div
            key={image.id}
            className={`carousel-slide ${index === activeIndex ? 'active' : ''}`}
          >
            <div className="carousel-image-container">
              <img
                src={image.url}
                alt={image.alt}
                onError={(e) => {
                  console.error(`Error loading image: ${image.url}`);
                  e.currentTarget.src = 'https://via.placeholder.com/1200x400?text=Error+Loading+Image';
                }}
              />
              {image.caption && (
                <div className="carousel-caption">
                  <h3>{image.caption}</h3>
                  {image.description && <p>{image.description}</p>}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* controles */}
      <button onClick={prevSlide} className="carousel-arrow prev">❮</button>
      <button onClick={nextSlide} className="carousel-arrow next">❯</button>
    </div>
  );
};

export default SimpleCarousel;