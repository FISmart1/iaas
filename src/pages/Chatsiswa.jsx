import React, { useEffect, useState } from 'react';
import {
  collection, query, where, onSnapshot, addDoc,
  orderBy, serverTimestamp, doc, deleteDoc, updateDoc
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

  // Ambil semua user selain diri sendiri
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

  // Ambil pesan dan tandai terbaca saat membuka chat
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

  // Deteksi pesan belum terbaca
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
    <div className="flex h-screen overflow-hidden bg-white">
      {/* SIDEBAR - sembunyi di HP saat chat dibuka */}
      <div className={`w-72 bg-white border-r border-gray-300 flex-col md:flex transition-all duration-200 ${selectedUser ? 'hidden' : 'flex'}`}>
        <Link to="/siswa" className="p-4 border-b border-gray-300">
          <button className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 rounded">
            Kembali ke Dashboard
          </button>
        </Link>
        <input
          type="text"
          placeholder="Cari nama/email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mx-4 my-3 px-3 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500"
        />
        <div className="flex-1 overflow-y-auto px-2">
          {filteredUsers.map((user) => (
            <div
              key={user.id}
              onClick={() => setSelectedUser(user)}
              className={`cursor-pointer flex items-center justify-between p-3 rounded-lg transition ${
                selectedUser?.id === user.id
                  ? "bg-blue-100 font-semibold text-blue-700"
                  : "hover:bg-gray-100"
              }`}
            >
              <div>
                <div className="truncate max-w-xs">{user.name}</div>
                <div className="text-xs text-gray-500 truncate max-w-xs">{user.email}</div>
              </div>
              {unreadMap[user.id] && (
                <span className="bg-red-500 w-2.5 h-2.5 rounded-full ml-2" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* CHAT AREA */}
      <div className="flex-1 flex flex-col">
        {selectedUser ? (
          <>
            {/* HEADER */}
            <div className="p-4 bg-white border-b border-gray-200 shadow-sm flex items-center gap-3">
              {/* Tombol back di HP */}
              <button
                className="md:hidden text-blue-600 hover:text-blue-800 text-xl"
                onClick={() => setSelectedUser(null)}
              >
                ⬅
              </button>
              <h2 className="text-lg font-semibold truncate">{selectedUser.name}</h2>
            </div>

            {/* MESSAGE LIST */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-50">
              {messages.map((msg) => {
                const isSender = msg.senderId === currentUser.uid;
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isSender ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`relative max-w-xs px-4 py-2 rounded-lg ${
                        isSender
                          ? 'bg-blue-600 text-white rounded-br-none'
                          : 'bg-white border border-gray-300 rounded-bl-none'
                      }`}
                    >
                      {msg.text}
                      {isSender && (
                        <button
                          onClick={() => {
                            const chatId = [currentUser.uid, selectedUser.id].sort().join('_');
                            deleteMessage(chatId, msg.id);
                          }}
                          className="absolute top-1 right-1 text-xs text-red-400 hover:text-red-600"
                          aria-label="Hapus pesan"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* INPUT */}
            <div className="p-4 bg-white border-t border-gray-300 flex items-center gap-3">
              <input
                type="text"
                placeholder="Tulis pesan..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={sendMessage}
                disabled={!newMessage.trim()}
                className={`px-5 py-2 rounded-full font-semibold text-white transition ${
                  newMessage.trim()
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-blue-300 cursor-not-allowed'
                }`}
              >
                Kirim
              </button>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center flex-1 text-gray-400 text-lg italic">
            Pilih pengguna untuk mulai chat
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatRoom;
