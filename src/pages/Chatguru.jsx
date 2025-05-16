import React, { useEffect, useState } from "react";
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
} from "firebase/firestore";
import { firestore } from "../firebase/firebase";
import { useAuth } from "../contexts/authContext";
import { Link } from "react-router-dom";

const ChatRoom = () => {
  const { currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [unreadMap, setUnreadMap] = useState({});

  useEffect(() => {
    const q = query(collection(firestore, "users"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const userList = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((user) => user.email !== currentUser.email);
      setUsers(userList);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!selectedUser) return;
    const chatId = [currentUser.uid, selectedUser.id].sort().join("_");
    const q = query(
      collection(firestore, "messages", chatId, "chats"),
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setMessages(msgs);
    });

    const unreadQ = query(
      collection(firestore, "messages", chatId, "chats"),
      where("receiverId", "==", currentUser.uid),
      where("read", "==", false)
    );
    const readUnsub = onSnapshot(unreadQ, (snapshot) => {
      snapshot.docs.forEach((docSnap) => {
        updateDoc(docSnap.ref, { read: true });
      });
    });

    return () => {
      unsubscribe();
      readUnsub();
    };
  }, [selectedUser]);

  useEffect(() => {
    const unsubList = users.map((user) => {
      const chatId = [currentUser.uid, user.id].sort().join("_");
      const q = query(
        collection(firestore, "messages", chatId, "chats"),
        where("receiverId", "==", currentUser.uid),
        where("read", "==", false)
      );

      return onSnapshot(q, (snap) => {
        setUnreadMap((prev) => ({ ...prev, [user.id]: !snap.empty }));
      });
    });
    return () => unsubList.forEach((unsub) => unsub());
  }, [users]);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    const chatId = [currentUser.uid, selectedUser.id].sort().join("_");
    const messageRef = collection(firestore, "messages", chatId, "chats");

    await addDoc(messageRef, {
      text: newMessage,
      senderId: currentUser.uid,
      receiverId: selectedUser.id,
      createdAt: serverTimestamp(),
      read: false,
    });
    setNewMessage("");
  };

  const deleteMessage = async (chatId, messageId) => {
    await deleteDoc(doc(firestore, "messages", chatId, "chats", messageId));
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name?.toLowerCase().includes(search.toLowerCase()) ||
      user.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar pengguna */}
      <div className="w-72 border-r border-gray-300 bg-white flex flex-col">
        <Link to="/siswa" className="p-4 border-b border-gray-300">
          <button className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 rounded transition">
            Kembali ke Dashboard
          </button>
        </Link>
        <input
          type="text"
          placeholder="Cari nama atau email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mx-4 my-3 px-3 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
        />
        <div className="flex-1 overflow-y-auto">
          {filteredUsers.map((user) => (
            <div
              key={user.id}
              onClick={() => setSelectedUser(user)}
              className={`cursor-pointer flex items-center justify-between px-4 py-3 mx-2 my-1 rounded-lg transition ${
                selectedUser?.id === user.id
                  ? "bg-blue-100 font-semibold text-blue-700"
                  : "hover:bg-gray-100"
              }`}
            >
              <div>
                <div className="truncate max-w-xs">{user.name}</div>
                <div className="text-xs text-gray-500 truncate max-w-xs">
                  {user.email}
                </div>
              </div>
              {unreadMap[user.id] && (
                <span className="inline-block bg-red-500 w-3 h-3 rounded-full ml-2" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Chat window */}
      <div className="flex-1 flex flex-col bg-gray-50">
        {selectedUser ? (
          <>
            <header className="flex items-center justify-between p-4 border-b border-gray-300 bg-white shadow-sm">
              <h2 className="text-lg font-semibold truncate max-w-xs">
                {selectedUser.name}
              </h2>
              {/* Bisa ditambah tombol video call atau profil */}
            </header>

            <main className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
              {messages.map((msg) => {
                const isSender = msg.senderId === currentUser.uid;
                return (
                  <div
                    key={msg.id}
                    className={`flex ${
                      isSender ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`relative max-w-xs px-4 py-2 rounded-lg break-words ${
                        isSender
                          ? "bg-blue-600 text-white rounded-br-none"
                          : "bg-white border border-gray-300 rounded-bl-none"
                      }`}
                    >
                      {msg.text}
                      {isSender && (
                        <button
                          onClick={() => {
                            const chatId = [currentUser.uid, selectedUser.id]
                              .sort()
                              .join("_");
                            deleteMessage(chatId, msg.id);
                          }}
                          className="absolute top-1 right-1 text-xs text-red-400 opacity-0 group-hover:opacity-100 hover:text-red-600 transition"
                          aria-label="Hapus pesan"
                        >
                          &#x2715;
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </main>

            <footer className="p-4 border-t border-gray-300 bg-white flex items-center gap-3">
              <input
                type="text"
                placeholder="Tulis pesan..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                onKeyDown={(e) => {
                  if (e.key === "Enter") sendMessage();
                }}
              />
              <button
                onClick={sendMessage}
                disabled={!newMessage.trim()}
                className={`px-5 py-2 rounded-full text-white font-semibold transition ${
                  newMessage.trim()
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-blue-300 cursor-not-allowed"
                }`}
              >
                Kirim
              </button>
            </footer>
          </>
        ) : (
          <div className="flex items-center justify-center flex-1 text-gray-400 italic text-lg select-none">
            Pilih pengguna untuk memulai chat
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatRoom;
