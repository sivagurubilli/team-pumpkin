import React from 'react';
import { useNavigate } from 'react-router-dom';
import clap from "../assets/clap.png";

const Header = ({ token, onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    onLogout();
    navigate('/login'); // Redirect to login page after logout
  };

  return (
    <div style={{ 
      width: "80%", 
      height: "70px", 
      border: "1px solid grey", 
      borderRadius:"20px",
  
      marginLeft:"10%"
    }}>
        <div className='p-3'>
      <img
        src={clap} // Placeholder for your logo
        height="40"
        className="d-inline-block align-top"
        alt="App Logo"
      />
      <span style={{ margin: "20px 20px", 
        fontSize: "1.25rem", // Font size similar to h4 (1.25rem is equivalent to 20px)
        fontWeight: "bold"}}>Welcome user</span>
      </div>
    </div>
  );
};

export default Header;
