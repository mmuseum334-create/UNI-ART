'use client'

/**
 * ArtCollageSection - Visual collage display of artwork with masonry-style layout
 * Features parallax background and hover effects on artwork images
 */
import React from 'react';

// Usar rutas públicas para las imágenes
const Obra1 = '/Obra1.jpg';
const Obra2 = '/Obra2.jpg';
const Obra3 = '/Obra3.jpg';
const Obra4 = '/Obra4.jpg';
const Obra5 = '/Obra5.jpg';
const Obra6 = '/Obra6.jpg';
const Obra7 = '/Obra7.jpg';

const ArtCollageSection = () => {
  return (
    <section className="relative min-h-full w-full overflow-hidden">
      {/* Background Image - Obra7 */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${Obra3})`,
          backgroundAttachment: 'fixed',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
        }}
      >
        {/* Overlay para mejor contraste */}
        <div className="absolute inset-0 bg-black bg-opacity-25"></div>
      </div>
      
      {/* Collage Masonry Style */}
      <div className="relative z-10 h-full flex items-center justify-center p-16">
        <div className="max-w-5xl w-full flex gap-8 h-[500px]">
          
          {/* Columna izquierda */}
          <div className="flex flex-col gap-4 w-1/3">
            <div className="h-3/5 relative overflow-hidden rounded-xl shadow-lg transform rotate-1">
              <img
                src={Obra6}
                alt="Arte 1"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="h-2/5 relative overflow-hidden rounded-xl shadow-lg transform -rotate-1">
              <img
                src={Obra2}
                alt="Arte 2"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
          </div>

          {/* Columna central */}
          <div className="flex flex-col gap-4 w-2/5">
            <div className="h-2/5 relative overflow-hidden rounded-xl shadow-lg">
              <img
                src={Obra7}
                alt="Arte 3"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="h-3/5 flex gap-4">
              <div className="w-3/5 relative overflow-hidden rounded-xl shadow-lg transform rotate-2">
                <img
                  src={Obra4}
                  alt="Arte 4"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="w-2/5 relative overflow-hidden rounded-xl shadow-lg">
                <img
                  src={Obra5}
                  alt="Arte 5"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
            </div>
          </div>

          {/* Columna derecha */}
          <div className="w-1/4 relative overflow-hidden rounded-xl shadow-lg transform -rotate-2">
            <img
              src={Obra1}
              alt="Arte 6"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
          </div>

        </div>
      </div>
    </section>
  );
};

export default ArtCollageSection;