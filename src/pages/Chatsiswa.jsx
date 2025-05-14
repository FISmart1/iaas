import React, { useEffect, useState } from 'react';
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  orderBy,
  serverTimestamp,
  doc,
  deleteDoc,
  updateDoc,
} from 'firebase/firestore';
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
  const [unreadMap, setUnreadMap] = useState({});

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

  useEffect(() => {
    if (!selectedUser) return;
    const chatId = [currentUser.uid, selectedUser.id].sort().join('_');
    const q = query(
      collection(firestore, 'messages', chatId, 'chats'),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMessages(msgs);
    });

    const unreadQ = query(
      collection(firestore, 'messages', chatId, 'chats'),
      where('receiverId', '==', currentUser.uid),
      where('read', '==', false)
    );
    const readUnsub = onSnapshot(unreadQ, (snapshot) => {
      snapshot.docs.forEach(docSnap => {
        updateDoc(docSnap.ref, { read: true });
      });
    });

    return () => {
      unsubscribe();
      readUnsub();
    };
  }, [selectedUser]);

  useEffect(() => {
    const unsubList = users.map(user => {
      const chatId = [currentUser.uid, user.id].sort().join('_');
      const q = query(
        collection(firestore, 'messages', chatId, 'chats'),
        where('receiverId', '==', currentUser.uid),
        where('read', '==', false)
      );

      return onSnapshot(q, (snap) => {
        setUnreadMap(prev => ({ ...prev, [user.id]: !snap.empty }));
      });
    });
    return () => unsubList.forEach(unsub => unsub());
  }, [users]);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    const chatId = [currentUser.uid, selectedUser.id].sort().join('_');
    const messageRef = collection(firestore, 'messages', chatId, 'chats');

    await addDoc(messageRef, {
      text: newMessage,
      senderId: currentUser.uid,
      receiverId: selectedUser.id,
      createdAt: serverTimestamp(),
      read: false,
    });
    setNewMessage('');
  };

  const deleteMessage = async (chatId, messageId) => {
    await deleteDoc(doc(firestore, 'messages', chatId, 'chats', messageId));
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name?.toLowerCase().includes(search.toLowerCase()) ||
      user.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex h-screen">
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
          className="w-full px-3 py-2 border border-gray-300 rounded mb-4"
        />
        <div className="space-y-2">
          {filteredUsers.map((user) => (
            <div
              key={user.id}
              onClick={() => setSelectedUser(user)}
              className={`cursor-pointer p-2 rounded-lg flex justify-between items-center ${
                selectedUser?.id === user.id ? 'bg-blue-100 font-bold' : 'hover:bg-gray-100'
              }`}
            >
              <div>
                <div>{user.name}</div>
                <div className="text-sm text-gray-500">{user.email}</div>
              </div>
              {unreadMap[user.id] && <span className="text-red-500 text-xs font-bold">•</span>}
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-gray-50">
        {selectedUser ? (
          <>
            <div className="p-4 border-b font-semibold">
              Chat dengan {selectedUser.name}
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {messages.map((msg, idx) => {
                const chatId = [currentUser.uid, selectedUser.id].sort().join('_');
                return (
                  <div key={msg.id || idx} className="flex items-center group">
                    <div
                      className={`max-w-xs p-2 rounded relative ${
                        msg.senderId === currentUser.uid
                          ? 'ml-auto bg-blue-500 text-white'
                          : 'mr-auto bg-gray-200 text-gray-800'
                      }`}
                    >
                      {msg.text}
                      {msg.senderId === currentUser.uid && (
                        <button
                          onClick={() => deleteMessage(chatId, msg.id)}
                          className="text-xs absolute top-0 right-1 opacity-0 group-hover:opacity-100 text-red-500"
                        >
                          
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
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