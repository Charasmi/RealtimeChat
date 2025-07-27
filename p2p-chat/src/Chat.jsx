import React, { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import io from 'socket.io-client';

const socket = io('http://localhost:5000');

const Chat = () => {
  const { state } = useLocation();
  const { username, roomId } = state || {};

  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [typingStatus, setTypingStatus] = useState('');
  const [editingIndex, setEditingIndex] = useState(null);
  const [file, setFile] = useState(null);
  const [darkMode, setDarkMode] = useState(() =>
    localStorage.getItem('theme') === 'dark'
  );

  const messageEndRef = useRef(null);
  const audioRef = useRef(null);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  useEffect(() => {
    if (!username || !roomId) return;

    socket.emit('join-room', { username, roomId });

    socket.on('receive-message', (data) => {
      setMessages((prev) => [...prev, data]);
      if (data.username !== username) {
      const audio = new Audio('/notification.mp3'); // Make sure notify.mp3 is in public/
      audio.play();
    }
    });

    socket.on('online-users', (list) => {
      setUsers(list);
    });

    socket.on('typing', ({ username }) => {
      setTypingStatus(`${username} is typing...`);
      setTimeout(() => setTypingStatus(''), 1500);
    });

    socket.on('message-edited', ({ index, newText }) => {
      setMessages((prev) => {
        const copy = [...prev];
        if (copy[index]) copy[index].message = newText;
        return copy;
      });
    });

    socket.on('message-deleted', ({ index }) => {
      setMessages((prev) => {
        const copy = [...prev];
        if (copy[index]) copy.splice(index, 1);
        return copy;
      });
    });

    return () => {
      socket.emit('disconnecting');
      socket.off();
    };
  }, [username, roomId]);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!message.trim() && !file) return;

    const msgData = {
      roomId,
      username,
      message,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      file: file ? URL.createObjectURL(file) : null,
      fileType: file?.type || null,
    };

    socket.emit('send-message', msgData);
    setMessage('');
    setFile(null);
  };

  const handleTyping = () => {
    socket.emit('typing', { username, roomId });
  };

  const handleEdit = (idx, currentMsg) => {
    setMessage(currentMsg);
    setEditingIndex(idx);
  };

  const handleSaveEdit = () => {
    socket.emit('edit-message', { index: editingIndex, roomId, newText: message });
    setMessage('');
    setEditingIndex(null);
  };

  const handleDelete = (idx) => {
    socket.emit('delete-message', { index: idx, roomId });
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4 transition-colors duration-300">
      <audio ref={audioRef} src="/notification.mp3" preload="auto" />
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 flex flex-col h-[90vh] relative">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Room: {roomId}</h2>
          <span className="text-sm text-gray-500 dark:text-gray-300">
            Online: {users.length} ({users.join(', ')})
          </span>
        </div>

        <div className="overflow-y-auto flex-1 space-y-2 p-2 border dark:border-gray-700 rounded">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`relative p-2 rounded-xl ${
                msg.username === username
                  ? 'bg-blue-500 text-white text-right'
                  : 'bg-gray-300 dark:bg-gray-700 text-black dark:text-white'
              }`}
            >
              <div className="font-semibold">{msg.username}</div>
              {msg.file && (
                <div className="my-2">
                  {msg.fileType?.includes('image') ? (
                    <img src={msg.file} alt="uploaded" className="max-w-xs rounded" />
                  ) : (
                    <a href={msg.file} download className="text-sm underline">
                      Download File
                    </a>
                  )}
                </div>
              )}
              <div>{msg.message}</div>
              <div className="text-xs mt-1">{msg.time}</div>

              {msg.username === username && (
                <div className="absolute top-1 right-1 flex gap-1 text-xs">
                  <button onClick={() => handleEdit(idx, msg.message)}>✏️</button>
                  <button onClick={() => handleDelete(idx)}>🗑️</button>
                </div>
              )}
            </div>
          ))}
          <div ref={messageEndRef} />
        </div>

        <div className="text-sm text-gray-500 mt-1 mb-2 h-5">{typingStatus}</div>

        <div className="flex gap-2 mt-2">
          <input
            type="file"
            onChange={(e) => setFile(e.target.files[0])}
            className="text-sm"
          />
        </div>

        <div className="flex items-center gap-2 mt-2 relative">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleTyping}
            placeholder="Type a message..."
            className="flex-1 p-2 rounded border dark:bg-gray-700 dark:text-white"
          />
          <button
            onClick={editingIndex !== null ? handleSaveEdit : sendMessage}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded"
          >
            {editingIndex !== null ? 'Save' : 'Send'}
          </button>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 bg-gray-300 dark:bg-gray-700 rounded"
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
