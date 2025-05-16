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
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchOtps = async () => {
    setLoading(true);
    setError('');
    try {
      const q = query(otpCollection);
      const querySnapshot = await getDocs(q);
      const otpList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setOtps(otpList);
    } catch (err) {
      setError('Gagal memuat data OTP');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userData?.role === 'admin') {
      fetchOtps();
    }
  }, [userData]);

  const handleDeleteOTP = async (id) => {
    if (!window.confirm('Yakin ingin menghapus OTP ini?')) return;
    try {
      await deleteDoc(doc(firestore, "otps", id));
      setOtps(otps.filter(otp => otp.id !== id));
    } catch (error) {
      alert('Gagal menghapus OTP: ' + error.message);
    }
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
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-6">
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-lg p-8">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-semibold text-gray-900">Admin Dashboard</h1>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg transition duration-300 shadow-md"
          >
            Logout
          </button>
        </header>

        <section className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-medium text-gray-800">Daftar OTP</h2>
          <button
            onClick={fetchOtps}
            disabled={loading}
            className={`bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition duration-300 shadow-md ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Memuat...' : 'Refresh OTP'}
          </button>
        </section>

        {error && (
          <p className="mb-4 text-center text-red-600 font-medium">{error}</p>
        )}

        <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
          <table className="min-w-full divide-y divide-gray-200 text-left text-gray-700 text-sm">
            <thead className="bg-gray-100">
              <tr>
                {['Email', 'OTP', 'Role', 'Waktu Dibuat', 'Status', 'Aksi'].map((header) => (
                  <th
                    key={header}
                    className="px-6 py-3 font-semibold tracking-wide"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {otps.length === 0 && !loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-6 text-gray-400">
                    Tidak ada data OTP
                  </td>
                </tr>
              ) : (
                otps.map((otp) => (
                  <tr
                    key={otp.id}
                    className="hover:bg-gray-50 transition-colors duration-200"
                  >
                    <td className="px-6 py-4 truncate max-w-xs">{otp.email}</td>
                    <td className="px-6 py-4 font-mono tracking-widest">{otp.otp}</td>
                    <td className="px-6 py-4 capitalize">{otp.role}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {otp.createdAt?.toDate().toLocaleString() || '—'}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                          otp.used
                            ? 'bg-red-200 text-red-800'
                            : 'bg-green-200 text-green-800'
                        }`}
                      >
                        {otp.used ? 'Digunakan' : 'Belum digunakan'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleDeleteOTP(otp.id)}
                        className="text-red-500 hover:text-red-700 font-semibold transition"
                        aria-label={`Hapus OTP untuk ${otp.email}`}
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Contoh Link tambahan yang kamu bisa sesuaikan */}
        <div className="mt-6 text-right">
          <Link
            to="/database"
            className="text-blue-600 hover:text-blue-800 font-medium transition"
          >
            Lihat Database &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
