import React, { useState } from 'react'; // Ini untuk menggunakan useState
import { useNavigate } from 'react-router-dom'; 
import { getDocs, query, where, addDoc, setDoc, doc } from 'firebase/firestore'; // Pastikan semua impor yang diperlukan ada
import { createUserWithEmailAndPassword } from 'firebase/auth'; 
import { auth, firestore, otpCollection } from '../../../firebase/firebase'; // Pastikan impor firestore dan auth benar
import { serverTimestamp } from 'firebase/firestore'; // Import serverTimestamp untuk waktu

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

  // Handle input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle OTP generation
  const generateOTP = async () => {
    try {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Simpan OTP ke Firestore untuk bisa dilihat oleh admin
      await addDoc(otpCollection, {
        otp,
        email: formData.email,
        role: formData.role,
        createdAt: serverTimestamp(),
        used: false // Tandai OTP sebagai belum dipakai
      });

      alert('OTP berhasil dibuat. Hubungi admin untuk melihat OTP.');

    } catch (err) {
      console.error('Gagal generate OTP:', err.message);
      alert('Gagal generate OTP: ' + err.message);
    }
  };

  // Handle registration
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Verifikasi OTP
      const otpSnapshot = await getDocs(
        query(otpCollection, where('otp', '==', formData.otp), where('used', '==', false))
      );

      if (otpSnapshot.empty) {
        alert('OTP tidak valid atau sudah digunakan.');
        setIsSubmitting(false);
        return;
      }

      // Buat akun pengguna dengan email dan password
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      const user = userCredential.user;

      // Simpan data pengguna ke Firestore
      await setDoc(doc(firestore, 'users', user.uid), {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        createdAt: serverTimestamp()
      });

      // Tandai OTP yang digunakan
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
    <div className="flex justify-center items-center min-h-screen bg-gray-100 py-6 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md bg-white p-8 border border-gray-300 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-center text-gray-700 mb-6">Register</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Input Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Input Nama Lengkap */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nama Lengkap</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Role */}
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700">Role</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="guru">Guru</option>
              <option value="siswa">Siswa</option>
            </select>
          </div>

          {/* OTP */}
          <div>
            <label htmlFor="otp" className="block text-sm font-medium text-gray-700">OTP</label>
            <input
              type="text"
              id="otp"
              name="otp"
              value={formData.otp}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full py-2 px-4 mt-4 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {isSubmitting ? 'Mendaftarkan...' : 'Register'}
          </button>
        </form>

        {/* Generate OTP Button */}
        <button 
          type="button" 
          onClick={generateOTP}
          className="w-full py-2 px-4 mt-4 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          Generate OTP
        </button>
      </div>
    </div>
  );
};

export default Register;
