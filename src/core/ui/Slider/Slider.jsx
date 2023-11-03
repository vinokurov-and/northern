import React from "react";
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'; // импорт иконки
import { SliderRoot, ScrollDownIconContainer } from "./styles";

export const Slider = () => {
  const handleScrollDown = () => {
    // Прокрутка на высоту экрана
    window.scrollBy({
      top: window.innerHeight - 110,
      behavior: 'smooth'
    });
  };

  return (
    <SliderRoot>
      <ScrollDownIconContainer onClick={handleScrollDown}>
        <ArrowDropDownIcon fontSize="inherit" color="primary" />
      </ScrollDownIconContainer>
    </SliderRoot>
  );
};