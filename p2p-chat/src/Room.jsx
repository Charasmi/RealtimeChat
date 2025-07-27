// Room.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Room = () => {
  const [username, setUsername] = useState('');
  const [roomId, setRoomId] = useState('');
  const navigate = useNavigate();

  const createRoom = () => {
    if (!username.trim()) {
      return alert('Please enter your name before creating a room.');
    }
    const newRoomId = Math.random().toString(36).substr(2, 7);
    navigate(`/chat/${newRoomId}`, { state: { username, roomId: newRoomId } });
  };

  const joinRoom = () => {
    if (!username.trim() || !roomId.trim()) {
      return alert('Enter a valid Room ID and username.');
    }
    navigate(`/chat/${roomId}`, { state: { username, roomId } });
  };

  return (
    
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <div className="bg-gray-800 p-8 rounded-xl shadow-lg w-96">
        <h1 className="text-xl font-bold text-center mb-4">💬 Peer-to-Peer Chat</h1>
        <input
          className="w-full p-2 mb-4 rounded bg-gray-700 text-white placeholder-gray-400"
          type="text"
          placeholder="Your Name"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <button
          className="w-full bg-indigo-700 hover:bg-indigo-800 text-white py-2 px-4 rounded mb-2"
          onClick={createRoom}
        >
          ➕ Create Room
        </button>
        <div className="text-center my-2 text-gray-400">or</div>
        <input
          className="w-full p-2 mb-4 rounded bg-gray-700 text-white placeholder-gray-400"
          type="text"
          placeholder="Enter Room ID"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
        />
        <button
          className="w-full bg-green-700 hover:bg-green-800 text-white py-2 px-4 rounded"
          onClick={joinRoom}
        >
          ✅ Join Room
        </button>
      </div>
    </div>
  );
};

export default Room;