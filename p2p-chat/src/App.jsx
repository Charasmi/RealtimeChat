import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Room from './Room';
import Chat from './Chat';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Room />} />
      <Route path="/chat/:roomId" element={<Chat />} />
    </Routes>
  );
}

export default App;
