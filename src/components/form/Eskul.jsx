import React, { useState } from 'react';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import { useAuth } from '../../contexts/authContext';
import { useNavigate } from 'react-router-dom';

const EskulForm = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [eskulData, setEskulData] = useState({
    nama: '',
    tanggalMengikuti: '',
    deskripsi: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setEskulData({ ...eskulData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!currentUser) {
      setError('User belum login');
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, 'eskul'), {
        ...eskulData,
        userId: currentUser.uid,
        createdAt: new Date(),
      });
      navigate('/siswa'); // Atau ganti dengan rute lain
    } catch (err) {
      setError('Gagal menyimpan data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Tambah Eskul</h2>

      {error && <p className="text-red-500 mb-3">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-semibold">Nama Eskul</label>
          <input
            type="text"
            name="nama"
            value={eskulData.nama}
            onChange={handleChange}
            required
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        <div>
          <label className="block font-semibold">Tanggal Mengikuti</label>
          <input
            type="date"
            name="tanggalMengikuti"
            value={eskulData.tanggalMengikuti}
            onChange={handleChange}
            required
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        <div>
          <label className="block font-semibold">Deskripsi</label>
          <textarea
            name="deskripsi"
            value={eskulData.deskripsi}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            rows={4}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {loading ? 'Menyimpan...' : 'Simpan'}
        </button>
      </form>
    </div>
  );
};

export default EskulForm;
