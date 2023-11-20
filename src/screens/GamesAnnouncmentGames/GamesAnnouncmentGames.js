import React from 'react';

import { GameSlider } from './GameSlider';

export const GamesAnnouncementScreen = (props) => {
  const {data} = props;
    return (
      <div className="games-announcement-screen">
        <div style={{ width: '100%' }}>
        <GameSlider data={data} />
        </div>
      </div>
    );
  };
