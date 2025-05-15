import React, { useState } from 'react';
import { addDoc, collection, Timestamp } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import { useAuth } from '../../contexts/authContext';
import { useNavigate } from 'react-router-dom';

const FormEkstrakurikuler = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [data, setData] = useState({
    nama: '',
    tanggal: '',
    lokasi: '',
    deskripsi: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!currentUser) {
      setError('User belum login');
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, 'data_eskul'), {
        nama: data.nama,
        tanggal: Timestamp.fromDate(new Date(data.tanggal)),
        lokasi: data.lokasi,
        deskripsi: data.deskripsi,
        userId: currentUser.uid,
        createdAt: new Date(),
      });
      navigate('/siswa');
    } catch (err) {
      setError('Gagal menyimpan data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded shadow">
      {/* Tombol Back */}
      <button
        onClick={() => navigate(-1)}
        className="mb-4 text-blue-600 hover:text-blue-800 font-semibold"
      >
        &#8592; Kembali
      </button>

      <h2 className="text-2xl font-bold mb-4">Tambah Ekstrakurikuler</h2>

      {error && <p className="text-red-500 mb-3">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-semibold">Nama Kegiatan</label>
          <input
            type="text"
            name="nama"
            value={data.nama}
            onChange={handleChange}
            required
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        <div>
          <label className="block font-semibold">Lokasi</label>
          <input
            type="text"
            name="lokasi"
            value={data.lokasi}
            onChange={handleChange}
            required
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        <div>
          <label className="block font-semibold">Tanggal Mengikuti</label>
          <input
            type="date"
            name="tanggal"
            value={data.tanggal}
            onChange={handleChange}
            required
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        <div>
          <label className="block font-semibold">Deskripsi</label>
          <textarea
            name="deskripsi"
            value={data.deskripsi}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            rows={4}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          {loading ? 'Menyimpan...' : 'Simpan'}
        </button>
      </form>
    </div>
  );
};

export default FormEkstrakurikuler;
