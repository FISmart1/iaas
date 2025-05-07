import React, { useState } from 'react';
import { auth } from '../../../firebase/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { Link, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore'; // Tambahkan ini
import { firestore } from '../../../firebase/firebase'; // Pastikan ini juga diimpor

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
  
      // Jika email admin, langsung ke dashboard admin
      if (user.email === 'admin@sekolah.com') {
        navigate('/admin');
        return;
      }
  
      // Ambil data pengguna dari Firestore
      const userDocRef = doc(firestore, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);
  
      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
  
        // Arahkan berdasarkan role
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
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <form onSubmit={handleLogin} className="w-full max-w-sm p-6 bg-white rounded shadow">
        <h2 className="text-xl mb-4 text-center font-bold">Login</h2>
        <input
          type="email"
          placeholder="Email"
          className="mb-3 w-full border px-3 py-2 rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="mb-3 w-full border px-3 py-2 rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
          disabled={loading}
        >
          {loading ? 'Masuk...' : 'Login'}
        </button>
        <p className="mt-4 text-center text-sm">
          Belum punya akun?{' '}
          <Link to="/register" className="text-blue-500 hover:text-blue-700">
            Daftar disini
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
