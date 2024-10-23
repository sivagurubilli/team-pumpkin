import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './Pages/Login';
import TripList from './Pages/Triplist';
import TripDetails from './Pages/TripDetails';
import './App.css';
import NavigationBar from './Pages/Navbar';
import Header from './Pages/Header';
import UploadTrip from './Pages/Upload';

const App = () => {
  const [token, setToken] = useState(null); // Initially set to null to indicate loading state

  // Fetch token from localStorage when the component mounts
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      setToken(savedToken);
    }
  }, [token]);

  const handleLogout = () => {
    setToken(null); // Clears the token from state
    localStorage.removeItem('token'); // Clears the token from localStorage
  };

  return (
    <>
      {/* Navigation Bar is moved outside of Routes */}
      {token && <NavigationBar token={token} onLogout={handleLogout} />}
      {token && <Header /> }

      <Routes>
        {!token ? (
          <>
          <Route path="/login" element={<Login onLogin={(token) => setToken(token)} />} />
          <Route path="/*" element={<Login onLogin={(token) => setToken(token)} />} />
          </>
        ) : (
          <>


            <Route path="/trips" element={<TripList token={token} />} />
            <Route path="/uploadtrips" element={<UploadTrip token={token} />} />

            <Route path="/trip-details/:id" element={<TripDetails token={token} />} />
            <Route path="/*" element={<TripList token={token} />} />
          </>
        )}
      </Routes>
    </>
  );
};

export default App;
