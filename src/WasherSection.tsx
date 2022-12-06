import React, { useState, useEffect } from 'react';
import { default as axios } from 'axios';
import './WasherSection.css';
import onIcon from './images/on-icon.svg';
import offIcon from './images/off-icon.svg';
import timerArrow from './images/timer-arrow.svg';
import AlertBell from './images/alert-bell.svg';

export const WasherSection = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [startTime, setStartTime] = useState('');

  const getData = async () => {
    const data = await axios.get('/api/getStatus', {
      // `proxy` means the request actually goes to the server listening
      // on localhost:3000, but the request says it is meant for
      // 'http://httpbin.org/get?answer=42'
      proxy: {
        host: 'localhost',
        port: 3080,
      },
    });

    // const { data } = await axios({
    //   method: 'get',
    //   url: '/api/getStatus',
    //   data: {},
    //   proxy: {
    //     host: 'localhost',
    //     port: 3080,
    //   },
    // });
    setRunning(data.data.running);
    setStartTime('12345');
    setIsLoading(false);
  };

  useEffect(() => {
    getData();
  }, []);

  if (isLoading) {
    return <div>Loading</div>;
  } else if (running) {
    return (
      <>
        <div className='square'>
          <img src={offIcon} className='indicator' alt='on icon' />
        </div>
        <div className='headline unavailable-color'>Washer in use</div>
        <div className='timer-section'>
          <img src={timerArrow} alt='timer icon' className='timer-arrow' />
          Cycle running for 45m
        </div>
        <button>
          <img src={AlertBell} alt='alert bell' className='alert-bell' />
          Alert when finished
        </button>
      </>
    );
  } else {
    return (
      <>
        <div className='square'>
          <img src={onIcon} className='indicator' alt='on icon' />
        </div>
        <div className='headline available-color'>Washer available</div>
        <div className='timer-section'>
          <img src={timerArrow} alt='timer icon' className='timer-arrow' />
          Cycle finished at 12:58pm
        </div>
      </>
    );
  }
};
