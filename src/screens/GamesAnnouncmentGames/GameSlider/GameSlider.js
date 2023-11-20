import React  from 'react';
// Import Swiper React components
import { Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import { GameCard } from "../GameCard";

import 'swiper/css';
import 'swiper/css/pagination';

export const GameSlider = ({data}) => {
    const games = data.filter(item=>item.score === '- : -');
    return <Swiper
    pagination
    slidesPerView={3}
    modules={[Pagination]}
    spaceBetween={20}
    breakpoints={{
      300: {
        slidesPerView: 1,
      },
      680: {
        slidesPerView: 2,
      },
      980: {
        slidesPerView: 3
      }
    }}
  >
    {games.map((game, index) => (
              <SwiperSlide>
                <div style={{paddingBottom: 50}}>
                  <GameCard key={index} game={game} />
                </div>
                </SwiperSlide>
            ))}
  </Swiper>
    
  
  };

  export default GameSlider;