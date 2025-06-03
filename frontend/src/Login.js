import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "./Layout";

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/'); // Redirect to homepage if already logged in
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Example POST request to your backend (update URL when backend is ready)
    const response = await fetch('http://localhost:5001/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    if (response.ok) {
      const data = await response.json();
      setMessage('Login successful!');
      localStorage.setItem('token', data.token);
      localStorage.setItem('username', username);
      // Fetch userId using the username
    const userResponse = await fetch(`http://localhost:5001/api/users/${username}`, {
      headers: {
        'Authorization': `Bearer ${data.token}` // Pass the token for authentication
      },
    });

    if (!userResponse.ok) {
      setMessage('Error fetching user ID.');
      return;
    }
      const userData = await userResponse.json();
      const userId = userData.userId;
      localStorage.setItem('userId', userId);

      console.log('Token stored in localstorage', data.token);
      console.log(username);
      console.log(userId);
      navigate("/");
    } else {
      setMessage('Login failed.');
    }
  };

  return (
    <Layout>
        <div style={{ textAlign: 'center', marginTop: '3rem' }}>
        <h1>Login</h1>
        <form onSubmit={handleSubmit} style={{ display: 'inline-block', marginTop: '1rem' }}>
            <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
            />
            <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            />
            <button type="submit">Login</button>
        </form>
        {message && <p>{message}</p>}
        </div>
    </Layout>
  );
}

export default Login;