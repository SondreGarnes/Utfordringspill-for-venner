import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "./Layout";

function GroupPage() {
  const { groupId } = useParams(); // Get the group ID from the URL
  const [groupDetails, setGroupDetails] = useState(null);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGroupDetails = async () => {
      try {
        const response = await fetch(`http://localhost:5001/api/groups/${groupId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}` // Pass the token for authentication
          },
        });

        if (response.ok) {
          const data = await response.json();

          setGroupDetails(data);
        } else {
          setMessage('Error fetching group details.');
        }
      } catch (error) {
        console.error('Error fetching group details:', error);
        setMessage('Error fetching group details.');
      }
    };

    fetchGroupDetails();
  }, [groupId]);

  const handleLeaveGroup = async () => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId'); // Assuming userId is stored in localStorage
    console.log("Token:", token);
    console.log("User ID:", userId);
    if (!token || !userId) {
      setMessage('You must be logged in to leave a group.');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5001/api/groups/${groupId}/leave`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userId }),
      });

      if (response.ok) {
        setMessage('Successfully left the group.');
        navigate('/'); 
      } else {
        setMessage('Error leaving the group.');
      }
    } catch (error) {
      console.error('Error leaving group:', error);
      setMessage('Error leaving the group.');
    }
  };

  return (
    <Layout>
      <div style={{ textAlign: 'center', marginTop: '3rem' }}>
        {groupDetails ? (
          <>
            <h2>Skriv inn denne koden for å bli med</h2>
            <h1>{groupId}</h1>
            <h2>{groupDetails.name}</h2>
            <p>Number of members: {groupDetails.memberCount}</p>
            <button onClick={handleLeaveGroup} style={{ marginTop: '1rem', cursor: 'pointer' }}>
              Leave Group
            </button>
          </>
        ) : (
          <p>{message || 'Loading group details...'}</p>
        )}
      </div>
    </Layout>
  );
}

export default GroupPage;