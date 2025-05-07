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
        <h1 className="text-2xl font-bold mb-4 text-center">Live Chat</h1>

        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}  // Go back to the previous page
          className="mb-4 text-blue-600 font-semibold"
        >
          &#8592; Back
        </button>

        <input
          type="text"
          placeholder="Cari pengguna berdasarkan nama atau email"
          className="w-full mb-6 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        {filteredUsers.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {filteredUsers.map(user => (
              <Link
                to={`/chatsiswa/${user.id}`}
                key={user.id}
                className="flex items-center justify-between bg-white p-4 rounded-lg shadow hover:bg-blue-50 transition"
              >
                <div>
                  <p className="font-medium text-gray-800">{user.name}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
                <span className="text-sm text-blue-600 font-semibold">Chat</span>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500">Tidak ada pengguna ditemukan.</p>
        )}
      </div>
    </div>
  );
};

export default LiveChat;
