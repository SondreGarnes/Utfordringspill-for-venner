import React, { useEffect, useState } from 'react';
import Layout from './Layout';
import { Link } from 'react-router-dom';

function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token); // Check if the user is logged in
  }, []);

  return (
    <Layout>  
      <div style={{ textAlign: 'center', marginTop: '3rem' }}>
        <h1>Welcome to My Homepage</h1>
        <p>This is a simple React homepage.</p>
        {isLoggedIn && (
          <div>
            <div style={{ marginTop: '1rem' }}>
              <Link to="/join-group" style={{ textDecoration: 'none', color: 'blue' }}>
                Join a Group
              </Link>
            </div>
            <div style={{ marginTop: '1rem' }}>
              <Link to="/create-group" style={{ textDecoration: 'none', color: 'blue' }}>
                Create a Group
              </Link>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default Home;