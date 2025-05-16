import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDocs, query, where, addDoc, setDoc, doc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, firestore, otpCollection } from '../../../firebase/firebase';
import { serverTimestamp } from 'firebase/firestore';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    role: 'siswa',
    otp: '',
    password: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const generateOTP = async () => {
    try {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      await addDoc(otpCollection, {
        otp,
        email: formData.email,
        role: formData.role,
        createdAt: serverTimestamp(),
        used: false
      });
      alert('OTP berhasil dibuat. Hubungi admin untuk melihat OTP.');
    } catch (err) {
      console.error('Gagal generate OTP:', err.message);
      alert('Gagal generate OTP: ' + err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const otpSnapshot = await getDocs(
        query(otpCollection, where('otp', '==', formData.otp), where('used', '==', false))
      );

      if (otpSnapshot.empty) {
        alert('OTP tidak valid atau sudah digunakan.');
        setIsSubmitting(false);
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      const user = userCredential.user;

      await setDoc(doc(firestore, 'users', user.uid), {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        createdAt: serverTimestamp()
      });

      await setDoc(otpSnapshot.docs[0].ref, { used: true }, { merge: true });

      alert('Registrasi berhasil. Silakan login.');
      navigate('/login');
    } catch (error) {
      console.error(error);
      alert('Gagal registrasi: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-purple-100 via-blue-100 to-pink-100">
      <div className="w-full max-w-md bg-white p-8 border border-gray-200 rounded-3xl shadow-2xl">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-extrabold text-indigo-600">
            Ko<span className="text-pink-500">!</span>Chat
          </h1>
          <p className="text-sm text-gray-600 mt-1">Buat akun baru dan mulai mengobrol</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-300"
            />
          </div>

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nama Lengkap</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-300"
            />
          </div>

          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700">Role</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-300"
            >
              <option value="guru">Guru</option>
              <option value="siswa">Siswa</option>
            </select>
          </div>

          <div>
            <label htmlFor="otp" className="block text-sm font-medium text-gray-700">OTP</label>
            <input
              type="text"
              name="otp"
              value={formData.otp}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-300"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-300"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2 mt-4 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition duration-300"
          >
            {isSubmitting ? 'Mendaftarkan...' : 'Register'}
          </button>
        </form>

        <button
          type="button"
          onClick={generateOTP}
          className="w-full py-2 mt-4 bg-green-500 text-white font-semibold rounded-xl hover:bg-green-600 transition duration-300"
        >
          Generate OTP
        </button>
      </div>
    </div>
  );
};

export default Register;
