import React, { useState, useCallback } from 'react';
import QRCode from 'react-qr-code';

const Attendance = () => {
  const [authToken, setAuthToken] = useState(sessionStorage.getItem('authToken') || sessionStorage.getItem('testToken'));

  const refreshToken = useCallback(() => {
    const newToken = sessionStorage.getItem('authToken') || sessionStorage.getItem('testToken');
    setAuthToken(newToken);
  }, []);

  if (!authToken) {
    return (
      <div>
        <p>No auth token found</p>
        <button onClick={refreshToken}>Refresh</button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center">
      <p>Scan this QR to mark attendance</p>
      <br />
      <QRCode value={authToken} size={200} />
      <br />
      <button onClick={refreshToken}>🔄 Refresh QR</button>
    </div>
  );
};

export default Attendance;
