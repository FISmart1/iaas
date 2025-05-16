import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { firestore } from '../../firebase/firebase';
import { useAuth } from '../../contexts/authContext';
import { Link, useNavigate } from 'react-router-dom';

const LiveChat = () => {
  const { currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate(); // Initialize useNavigate

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersSnapshot = await getDocs(collection(firestore, 'users'));
        const fetchedUsers = usersSnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(user => user.email !== currentUser.email); // Exclude current user

        setUsers(fetchedUsers);
      } catch (err) {
        console.error('Error fetching users:', err);
      }
    };

    fetchUsers();
  }, [currentUser]);

  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
  <div className="max-w-3xl mx-auto">
    <h1 className="text-3xl font-extrabold mb-6 text-center text-kochat-blue">
      Live Chat
    </h1>

    {/* Back Button */}
    <button
      onClick={() => navigate(-1)}
      className="mb-6 text-kochat-blue font-semibold hover:underline transition-colors duration-200"
    >
      &#8592; Back
    </button>

    <input
      type="text"
      placeholder="Cari pengguna berdasarkan nama atau email"
      className="w-full mb-8 px-5 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-kochat-blue transition"
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      spellCheck={false}
      autoComplete="off"
    />

    {filteredUsers.length > 0 ? (
      <div className="grid grid-cols-1 gap-5">
        {filteredUsers.map(user => (
          <Link
            to={`/chatsiswa/${user.id}`}
            key={user.id}
            className="flex items-center justify-between bg-white p-5 rounded-xl shadow-md hover:shadow-lg hover:bg-kochat-blue-light transition duration-300"
          >
            <div>
              <p className="font-semibold text-gray-900 truncate max-w-xs">
                {user.name}
              </p>
              <p className="text-sm text-gray-500 truncate max-w-xs">
                {user.email}
              </p>
            </div>
            <span className="text-sm text-kochat-blue font-semibold">
              Chat
            </span>
          </Link>
        ))}
      </div>
    ) : (
      <p className="text-center text-gray-400 italic mt-10">
        Tidak ada pengguna ditemukan.
      </p>
    )}
  </div>
</div>

  );
};

export default LiveChat;
