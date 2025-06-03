import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "./Layout";

function CreateUser() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const response = await fetch('http://localhost:5001/api/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });
        if (response.ok) {
            const data = await response.json();
            setMessage('User created!');
            localStorage.setItem('token', data.token); // Store the token
            localStorage.setItem('username', username); // Store the username
            navigate('/'); // Redirect to homepage
        } else {
            setMessage('Error creating user.');
        }
    };

    return (
        <Layout>
            <div style={{ textAlign: 'center', marginTop: '3rem' }}>
                <h1>Create User</h1>
                <form onSubmit={handleSubmit} style={{ display: 'inline-block', marginTop: '1rem' }}>
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        required
                        autoComplete="username"
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                        autoComplete="password"
                    />
                    <button type="submit">Create</button>
                </form>
                {message && <p>{message}</p>}
            </div>
        </Layout>
    );
}

export default CreateUser;