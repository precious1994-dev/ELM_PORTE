import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronLeft, FiChevronRight, FiPause, FiPlay } from 'react-icons/fi';
import { setupSSE } from '@/utils/sse';

interface Slide {
  title: string;
  description: string;
  imageUrl: string;
  buttonText?: string;
  buttonLink?: string;
}

interface HomepageData {
  sliderSection: {
    slides: Slide[];
  };
}

const AUTOPLAY_INTERVAL = 5000; // 5 seconds
const SSE_RETRY_INTERVAL = 5000; // 5 seconds
const MAX_SSE_RETRIES = 3;

const fetchHomepageData = async () => {
  try {
    const response = await fetch('/api/homepage', {
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch slider data');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching slider data:', error);
    return null;
  }
};

export default function HomeSlider() {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isPlaying, setIsPlaying] = useState(true);
  const [sseRetries, setSseRetries] = useState(0);

  const nextSlide = useCallback(() => {
    if (slides.length === 0) return;
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    if (slides.length === 0) return;
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  const togglePlayPause = useCallback(() => {
    setIsPlaying(prev => !prev);
  }, []);

  useEffect(() => {
    let cleanup: (() => void) | undefined;

    const loadData = async () => {
      try {
        const data = await fetchHomepageData();
        setSlides(data?.sliderSection?.slides || []);
        setError('');
      } catch (error) {
        setError('Failed to load slider content');
        console.error('Error loading slider:', error);
      } finally {
        setLoading(false);
      }
    };

    // Initial load
    loadData();

    // Setup SSE
    cleanup = setupSSE({
      endpoint: '/api/homepage/sse',
      onMessage: (data) => {
        if (data?.sliderSection?.slides) {
          setSlides(data.sliderSection.slides);
        }
      },
      onError: (error) => {
        console.error('SSE Error:', error);
        // Fallback to regular polling on error
        const pollInterval = setInterval(loadData, 5000);
        return () => clearInterval(pollInterval);
      },
      onConnected: () => {
        console.log('SSE Connected successfully');
      }
    });

    return () => {
      cleanup?.();
    };
  }, []);

  if (loading) {
    return (
      <div className="relative w-full h-screen bg-gray-100 animate-pulse">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative w-full h-screen bg-gray-100">
        <div className="absolute inset-0 flex items-center justify-center text-gray-500">
          {error}
        </div>
      </div>
    );
  }

  if (slides.length === 0) {
    return (
      <div className="relative w-full h-screen bg-gray-100">
        <div className="absolute inset-0 flex items-center justify-center text-gray-500">
          No slides available
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <AnimatePresence initial={false} mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0"
        >
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${slides[currentSlide].imageUrl})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/50 to-black/30">
              <div className="container mx-auto px-4 h-full flex items-center">
                <div className="max-w-3xl text-white">
                  <motion.h2
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                    className="text-5xl md:text-7xl font-bold mb-6 drop-shadow-lg"
                  >
                    {slides[currentSlide].title}
                  </motion.h2>
                  <motion.p
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                    className="text-xl md:text-2xl mb-10 max-w-2xl drop-shadow-md text-gray-100"
                  >
                    {slides[currentSlide].description}
                  </motion.p>
                  {slides[currentSlide].buttonText && slides[currentSlide].buttonLink && (
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.6, duration: 0.6 }}
                    >
                      <a
                        href={slides[currentSlide].buttonLink}
                        className="inline-flex items-center px-8 py-4 bg-white/20 backdrop-blur-sm border-2 border-white text-white text-xl font-medium rounded-full hover:bg-white hover:text-gray-900 transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
                      >
                        {slides[currentSlide].buttonText}
                      </a>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Controls Container */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-center items-center gap-8">
        {/* Navigation Buttons */}
        <button
          onClick={prevSlide}
          className="p-4 rounded-full bg-white/90 text-gray-800 hover:bg-white hover:scale-105 hover:shadow-xl transition-all duration-300 shadow-lg transform active:scale-95"
          aria-label="Previous slide"
        >
          <FiChevronLeft className="w-5 h-5" />
        </button>

        {/* Play/Pause Button */}
        <button
          onClick={togglePlayPause}
          className="p-4 rounded-full bg-white/90 text-gray-800 hover:bg-white hover:scale-105 hover:shadow-xl transition-all duration-300 shadow-lg transform active:scale-95"
          aria-label={isPlaying ? 'Pause slideshow' : 'Play slideshow'}
        >
          {isPlaying ? (
            <FiPause className="w-5 h-5" />
          ) : (
            <FiPlay className="w-5 h-5" />
          )}
        </button>

        <button
          onClick={nextSlide}
          className="p-4 rounded-full bg-white/90 text-gray-800 hover:bg-white hover:scale-105 hover:shadow-xl transition-all duration-300 shadow-lg transform active:scale-95"
          aria-label="Next slide"
        >
          <FiChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-28 left-1/2 -translate-x-1/2 flex items-center space-x-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`transition-all duration-300 rounded-full ${
              index === currentSlide
                ? 'w-12 h-3 bg-white shadow-lg'
                : 'w-3 h-3 bg-white/50 hover:bg-white/75 hover:scale-110'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
} 