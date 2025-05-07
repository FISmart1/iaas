import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/authContext/index';
import { otpCollection, firestore } from '../../firebase/firebase.js';
import { query, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase/firebase';

const AdminDashboard = () => {
  const { userData, setUserLoggedIn } = useAuth();
  const [otps, setOtps] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (userData?.role === 'admin') {
      const fetchOtps = async () => {
        const q = query(otpCollection);
        const querySnapshot = await getDocs(q);
        const otpList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setOtps(otpList);
        setLoading(false);
      };
      fetchOtps();
    }
  }, [userData]);

  const handleDeleteOTP = async (id) => {
    await deleteDoc(doc(firestore, "otps", id));
    setOtps(otps.filter(otp => otp.id !== id));
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUserLoggedIn(false);
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  if (userData?.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto bg-white shadow-lg rounded-2xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition duration-200"
          >
            Logout
          </button>
        </div>

        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-700">Daftar OTP</h2>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm"
          >
            Refresh OTP
          </button>
        </div>

        {loading ? (
          <p className="text-gray-500">Memuat...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border text-sm text-left">
              <thead className="bg-gray-200 text-gray-700">
                <tr>
                  <th className="px-4 py-2 border">Email</th>
                  <th className="px-4 py-2 border">OTP</th>
                  <th className="px-4 py-2 border">Role</th>
                  <th className="px-4 py-2 border">Waktu Dibuat</th>
                  <th className="px-4 py-2 border">Status</th>
                  <th className="px-4 py-2 border">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {otps.map((otp) => (
                  <tr key={otp.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 border">{otp.email}</td>
                    <td className="px-4 py-2 border font-mono">{otp.otp}</td>
                    <td className="px-4 py-2 border capitalize">{otp.role}</td>
                    <td className="px-4 py-2 border">
                      {otp.createdAt?.toDate().toLocaleString() || '—'}
                    </td>
                    <td className="px-4 py-2 border">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        otp.used ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                      }`}>
                        {otp.used ? 'Digunakan' : 'Belum digunakan'}
                      </span>
                    </td>
                    <td className="px-4 py-2 border">
                      <button
                        onClick={() => handleDeleteOTP(otp.id)}
                        className="text-red-600 hover:underline text-sm"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Link >Database</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
