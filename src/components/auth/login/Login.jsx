import React, { useState } from 'react';
import { auth } from '../../../firebase/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { Link, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { firestore } from '../../../firebase/firebase';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (user.email === 'admin@sekolah.com') {
        navigate('/admin');
        return;
      }

      const userDocRef = doc(firestore, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        if (userData.role === 'guru') {
          navigate('/guru');
        } else if (userData.role === 'siswa') {
          navigate('/siswa');
        } else {
          alert('Peran tidak dikenali.');
        }
      } else {
        alert('Data pengguna tidak ditemukan.');
      }
    } catch (err) {
      alert("Login gagal: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100">
      <form onSubmit={handleLogin} className="w-full max-w-sm bg-white p-8 rounded-3xl shadow-2xl border border-gray-200">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-extrabold text-indigo-600">
            Ko<span className="text-pink-500">!</span>Chat
          </h1>
          <p className="text-sm text-gray-500 mt-1">Silakan login untuk melanjutkan</p>
        </div>
        <div className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 rounded-xl hover:bg-indigo-700 transition duration-300"
            disabled={loading}
          >
            {loading ? 'Masuk...' : 'Login'}
          </button>
        </div>
        <p className="mt-6 text-center text-sm text-gray-600">
          Belum punya akun?{' '}
          <Link to="/register" className="text-indigo-600 hover:underline font-medium">
            Daftar disini
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
