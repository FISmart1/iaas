import React, { useState, useEffect } from 'react';
import { auth, db } from '../../firebase/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

const ProfilePage = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    address: '',
    birthdate: '',
    motivation: '',
    generation: '',
  });
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      const user = auth.currentUser;
      if (!user) {
        setError('User belum login');
        return;
      }

      try {
        const docSnap = await getDoc(doc(db, 'users', user.uid));
        if (docSnap.exists()) {
          setUserData({
            ...docSnap.data(),
            email: user.email,
          });
        } else {
          setUserData(prev => ({ ...prev, email: user.email }));
        }
      } catch (err) {
        setError('Gagal mengambil data profil');
      }
    };

    fetchProfile();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    const user = auth.currentUser;
  
    if (!user) {
      setError('User tidak ditemukan');
      setLoading(false);
      return;
    }
  
    try {
      // Pastikan untuk menyertakan role yang sudah ada sebelumnya
      const docSnap = await getDoc(doc(db, 'users', user.uid));
      const currentRole = docSnap.exists() ? docSnap.data().role : 'user'; // Ambil role jika ada
  
      await updateProfile(user, { displayName: userData.name });
  
      // Simpan data pengguna beserta role-nya
      await setDoc(doc(db, 'users', user.uid), {
        name: userData.name,
        address: userData.address,
        birthdate: userData.birthdate,
        motivation: userData.motivation,
        generation: userData.generation,
        email: user.email,
        role: currentRole,  // Pastikan untuk menyimpan role yang sama
      });
  
      setEditing(false);
    } catch (err) {
      setError('Gagal menyimpan perubahan: ' + err.message);
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className="min-h-screen bg-white w-full">
      <div className="bg-gray-800 h-20 w-full" />
      <div className="w-full max-w-7xl mx-auto bg-white -mt-10 shadow-lg rounded-lg overflow-hidden">
        <div className="flex flex-col items-center p-6">
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white -mt-2">
            <div className="w-full h-full bg-gray-400 flex items-center justify-center text-white text-4xl font-bold">
              {userData.name?.charAt(0).toUpperCase() || 'U'}
            </div>
          </div>
          <h2 className="mt-4 text-2xl font-bold">{userData.name || 'Your Name'}</h2>
          <p className="text-gray-500">{userData.email}</p>
          {error && <p className="text-red-500 mt-2">{error}</p>}
        </div>

        <div className="md:flex border-t p-6">
          <div className="md:w-1/2 px-4 space-y-4 text-left">
            {['name', 'address', 'birthdate', 'generation'].map((field, idx) => (
              <div key={idx}>
                <h3 className="text-lg font-semibold">
                  {field.charAt(0).toUpperCase() + field.slice(1)}
                </h3>
                {editing ? (
                  <input
                    type={field === 'birthdate' ? 'date' : 'text'}
                    className="w-full mt-1 border rounded px-3 py-2"
                    value={userData[field]}
                    onChange={(e) => setUserData({ ...userData, [field]: e.target.value })}
                  />
                ) : (
                  <p className="text-gray-700">{userData[field] || '-'}</p>
                )}
              </div>
            ))}
          </div>

          <div className="md:w-1/2 px-4 mt-6 md:mt-0">
            <h3 className="text-lg font-bold mb-2">Motivasi</h3>
            {editing ? (
              <textarea
                className="w-full border rounded px-3 py-2 min-h-[120px]"
                value={userData.motivation}
                onChange={(e) => setUserData({ ...userData, motivation: e.target.value })}
              />
            ) : (
              <p className="text-gray-700 whitespace-pre-wrap">
                {userData.motivation || 'Belum diisi.'}
              </p>
            )}
          </div>
        </div>

        <div className="px-6 pb-6 flex justify-end">
          {editing ? (
            <button
              onClick={handleSave}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-900"
            >
              Edit Profile
            </button>
          )}
        </div>

        {/* Back Button */}
        <div className="px-6 pb-6">
          <button
            onClick={() => navigate(-1)} // Navigate back to the previous page
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
