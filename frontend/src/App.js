import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CreateUser from './CreateUser';
import Home from './Home'; // Import the Home component
import Login from "./Login";
import CreateGroup from './CreateGroup';
import JoinGroup from './JoinGroup';
import GroupPage from './GroupPage';

function App() {

  return (
    <Router>
      
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/create-user" element={<CreateUser />} />
          <Route path="/login" element={<Login/>} />
          <Route path="/create-group" element={<CreateGroup />} />
          <Route path="/join-group" element={<JoinGroup/>}/>
          <Route path="/groups/:groupId" element={<GroupPage />} />
        </Routes>
    </Router>
  );
}

export default App;