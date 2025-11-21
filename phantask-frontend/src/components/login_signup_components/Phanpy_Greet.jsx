import React from 'react';
import stand from '../../assets/Mascot-Phantask.png';
import bow from '../../assets/BowedHead-PhanTask.png';

const Phanpy_Greet = () => {
    return (
        <>
            <style>{`
        .container {
          position: relative;
          width: 300px;
          height: 300px;
        }
        .img {
          position: absolute;
          width: 100%;
          height: 100%;
          object-fit: contain;
          top: 0;
          left: 0;
          opacity: 0;
          transform-origin: center bottom;
        }
        .img1 {
          animation: standToBow 7s infinite ease-in-out;
        }
        .img2 {
          animation: bowToStand 7s infinite ease-in-out;
        }
        @keyframes standToBow {
          0%, 28.57% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
          42.85% {
            opacity: 0;
            transform: translateY(8px) scale(0.98);
          }
          85.71% {
            opacity: 0;
            transform: translateY(8px) scale(0.98);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @keyframes bowToStand {
          0%, 28.57% {
            opacity: 0;
            transform: translateY(-8px) scale(1.02);
          }
          42.85%, 85.71% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
          100% {
            opacity: 0;
            transform: translateY(-8px) scale(1.02);
          }
        }
      `}</style>
            <div className="container">
                <img className="img img1" src={stand} alt="Elephant Standing" />
                <img className="img img2" src={bow} alt="Elephant Bowing" />
            </div>
        </>
    );
}

export default Phanpy_Greet;
