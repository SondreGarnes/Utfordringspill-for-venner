import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "./Layout";

function CreateGroup() {
  const [groupName, setGroupName] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
  e.preventDefault();
  const token = localStorage.getItem('token'); // Get the token from localStorage
  const username = localStorage.getItem('username'); // Assuming username is stored in localStorage

  if (!token || !username) {
    setMessage('You must be logged in to create a group.');
    return;
  }

  try {
    // Fetch userId using the username
    const userResponse = await fetch(`http://localhost:5001/api/users/${username}`, {
      headers: {
        'Authorization': `Bearer ${token}` // Pass the token for authentication
      },
    });

    if (!userResponse.ok) {
      setMessage('Error fetching user ID.');
      return;
    }

    const userData = await userResponse.json();
    const userId = userData.userId;
    
    // Create the group
    const groupResponse = await fetch('http://localhost:5001/api/groups', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` // Pass the token for authentication
      },
      body: JSON.stringify({ name: groupName, userId }),
    });

    if (groupResponse.ok) {
      const groupData = await groupResponse.json();
      setMessage('Group created successfully!');
      navigate(`/groups/${groupData.groupId}`); // Redirect to the group page
    } else {
      setMessage('Error creating group.');
    }
  } catch (error) {
    console.error('Error creating group:', error);
    setMessage('Error creating group.');
  }
};

  return (
    <Layout>
      <div style={{ textAlign: 'center', marginTop: '3rem' }}>
        <h1>Create a Group</h1>
        <form onSubmit={handleSubmit} style={{ display: 'inline-block', marginTop: '1rem' }}>
          <input
            type="text"
            placeholder="Group Name"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            required
          />
          <button type="submit">Create</button>
        </form>
        {message && <p>{message}</p>}
      </div>
    </Layout>
  );
}

export default CreateGroup;