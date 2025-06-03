import React, { useEffect, useState } from 'react';
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
function Layout({ children}) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const navigate = useNavigate();
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUsername = localStorage.getItem('username');
    setIsLoggedIn(!!token); // Set logged-in state based on token presence
    setUsername(storedUsername || '');
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setIsLoggedIn(false);
    setUsername('')
    navigate("/");
    
  }

  return (
    <>
      <nav style={{
        display: 'flex',
        alignItems: 'center',
        background: '#f0f0f0',
        padding: '1rem',
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        boxSizing: 'border-box'
      }}>
        <div style={{ 
            display: 'flex', 
            gap: '1rem',
            justifyContent: 'flex-end',
            width: '100%'
        }}>
          {isLoggedIn ? (
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <span>Logged in as: <strong>{username}</strong></span>
              <Link to="/">Home</Link>
              <button onClick={handleLogout} style={{ cursor: 'pointer' }}>Logout</button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '1rem' }}>
              <Link to="/">Home</Link>
              <Link to="/create-user">Create User</Link>
              <Link to="/login">Login</Link>
            </div>
          )}
        </div>
      </nav>
      <div style={{ marginTop: '6rem' }}>
        {children}
      </div>
    </>
  );
}

export default Layout;