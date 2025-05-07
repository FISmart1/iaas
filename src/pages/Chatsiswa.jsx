import React, { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, addDoc, orderBy, serverTimestamp } from 'firebase/firestore';
import { firestore } from '../firebase/firebase';
import { useAuth } from '../contexts/authContext';
import { Link } from 'react-router-dom';

const ChatRoom = () => {
  const { currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  // Ambil semua user yang bukan currentUser
  useEffect(() => {
    const q = query(collection(firestore, 'users'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const userList = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(user => user.email !== currentUser.email);
      setUsers(userList);
    });

    return () => unsubscribe();
  }, []);

  // Ambil pesan jika ada user yang dipilih
  useEffect(() => {
    if (!selectedUser) return;

    const chatId = [currentUser.uid, selectedUser.id].sort().join('_');
    const q = query(
      collection(firestore, 'messages', chatId, 'chats'),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => doc.data());
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [selectedUser]);

  // Kirim pesan
  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    const chatId = [currentUser.uid, selectedUser.id].sort().join('_');
    const messageRef = collection(firestore, 'messages', chatId, 'chats');

    await addDoc(messageRef, {
      text: newMessage,
      senderId: currentUser.uid,
      receiverId: selectedUser.id,
      createdAt: serverTimestamp()
    });

    setNewMessage('');
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name?.toLowerCase().includes(search.toLowerCase()) ||
      user.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex h-screen">
      {/* Sidebar Users */}
      <div className="w-1/4 border-r bg-white p-4">
        <Link to="/siswa">
          <button className="bg-gray-500 text-white px-4 py-2 rounded mb-4">
            Kembali ke Dashboard
          </button>
        </Link>
        
        <input
          type="text"
          placeholder="Cari nama atau email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <div className="space-y-2">
          {filteredUsers.map((user) => (
            <div
              key={user.id}
              onClick={() => setSelectedUser(user)}
              className={`cursor-pointer p-2 rounded-lg ${
                selectedUser?.id === user.id
                  ? 'bg-blue-100 font-bold'
                  : 'hover:bg-gray-100'
              }`}
            >
              <div>{user.name}</div>
              <div className="text-sm text-gray-500">{user.email}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Panel */}
      <div className="flex-1 flex flex-col bg-gray-50">
        {selectedUser ? (
          <>
            <div className="p-4 border-b font-semibold">
              Chat dengan {selectedUser.name}
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`max-w-xs p-2 rounded ${
                    msg.senderId === currentUser.uid
                      ? 'ml-auto bg-blue-500 text-white'
                      : 'mr-auto bg-gray-200 text-gray-800'
                  }`}
                >
                  {msg.text}
                </div>
              ))}
            </div>
            <div className="p-4 border-t flex gap-2">
              <input
                type="text"
                placeholder="Tulis pesan..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-1 px-3 py-2 border rounded"
              />
              <button
                onClick={sendMessage}
                className="bg-blue-500 text-white px-4 py-2 rounded"
              >
                Kirim
              </button>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center flex-1 text-gray-500">
            Pilih pengguna untuk memulai chat
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatRoom;
