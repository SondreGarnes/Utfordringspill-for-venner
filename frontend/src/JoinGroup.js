import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "./Layout";

function JoinGroup() {
  const [groupId, setGroupId] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token'); // Get the token from localStorage

    if (!token) {
      setMessage('You must be logged in to join a group.');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5001/api/groups/${groupId}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Pass the token for authentication
        },
        body: JSON.stringify({ userId: localStorage.getItem('userId') }),
      });

      if (response.ok) {
        setMessage('Successfully joined the group!');
        navigate(`/groups/${groupId}`); // Redirect to the group page
      } else {
        setMessage('Error joining the group.');
      }
    } catch (error) {
      console.error('Error joining group:', error);
      setMessage('Error joining the group.');
    }
  };

  return (
    <Layout>
      <div style={{ textAlign: 'center', marginTop: '3rem' }}>
        <h1>Join a Group</h1>
        <form onSubmit={handleSubmit} style={{ display: 'inline-block', marginTop: '1rem' }}>
          <input
            type="text"
            placeholder="Group ID"
            value={groupId}
            onChange={(e) => setGroupId(e.target.value)}
            required
          />
          <button type="submit">Join</button>
        </form>
        {message && <p>{message}</p>}
      </div>
    </Layout>
  );
}

export default JoinGroup;