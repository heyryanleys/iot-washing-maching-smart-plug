import React from 'react';
import './App.css';
import { WasherSection } from './WasherSection';
import background from './images/washing-machine.png';

function App() {
  return (
    <div className='App'>
      <div
        className='wave-container'
        style={{ backgroundImage: `url(${background})` }}
      ></div>
      <div className='Washer-Section'>
        <div className='middle'>
          <div className='inner'>
            <WasherSection />
          </div>
        </div>
      </div>

      <div
        className='Dryer-Section'
        style={{ backgroundImage: `url(${background})` }}
      >
        <div className='middle'>
          <div className='inner'>
            <WasherSection />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
