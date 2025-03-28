import React, { useEffect, useState, useRef } from "react";
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Typography, Box } from '@mui/material';
import { 
  SliderRoot, 
  ScrollDownIconContainer, 
  ContentWrapper, 
  Overlay,
  TextContainer,
  GradientText
} from "./styles";

export const Slider = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const sliderRef = useRef(null);
  const { scrollY } = useScroll();

  const y = useTransform(scrollY, [0, 500], [0, 150]);
  const opacity = useTransform(scrollY, [0, 200], [1, 0]);
  const scale = useTransform(scrollY, [0, 200], [1, 1.1]);

  useEffect(() => {
    setIsLoaded(true);
    
    const handleMouseMove = (e) => {
      const rect = sliderRef.current?.getBoundingClientRect();
      if (!rect) return;
      
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      setMousePosition({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleScrollDown = () => {
    window.scrollBy({
      top: window.innerHeight - 110,
      behavior: 'smooth'
    });
  };

  const parallaxStyle = {
    transform: `translate(${mousePosition.x * 20}px, ${mousePosition.y * 20}px)`,
  };

  return (
    <SliderRoot ref={sliderRef}>
      <motion.div
        style={{
          height: '100%',
          scale,
          y,
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <Box
          sx={{
            height: '100%',
            backgroundImage: 'url("https://www.datocms-assets.com/47837/1666304231-fcsever-edited.png")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            transition: 'transform 0.3s ease-out',
          }}
          style={parallaxStyle}
        />
      </motion.div>

      <Overlay />
      
      <ContentWrapper>
        <AnimatePresence>
          {isLoaded && (
            <TextContainer>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
              >
                <GradientText variant="h2" component="h1">
                  ФК Северный
                </GradientText>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.8 }}
              >
                <Typography 
                  variant="h5" 
                  sx={{ 
                    color: 'white',
                    textAlign: 'center',
                    maxWidth: '800px',
                    margin: '0 auto',
                    mt: 2,
                    textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                    opacity: 0.9,
                    fontWeight: 500
                  }}
                >
                  Сила команды в единстве и стремлении к победе
                </Typography>
              </motion.div>
            </TextContainer>
          )}
        </AnimatePresence>

        <motion.div
          style={{ opacity }}
        >
          <ScrollDownIconContainer onClick={handleScrollDown}>
            <ArrowDropDownIcon fontSize="inherit" />
          </ScrollDownIconContainer>
        </motion.div>
      </ContentWrapper>
    </SliderRoot>
  );
};