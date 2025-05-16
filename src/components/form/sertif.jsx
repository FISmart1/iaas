import React, { useState } from 'react';
import { addDoc, collection, Timestamp } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import { useAuth } from '../../contexts/authContext';
import { useNavigate } from 'react-router-dom';

const EskulForm = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [eskulData, setEskulData] = useState({
    nama: '',
    tanggal: '',
    lokasi: '',
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

    // Validasi tanggal tidak boleh di masa depan
    if (new Date(eskulData.tanggal) > new Date()) {
      setError('Tanggal tidak boleh di masa depan');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await addDoc(collection(db, 'eskul'), {
        nama: eskulData.nama.trim(),
        tanggal: Timestamp.fromDate(new Date(eskulData.tanggal)),
        lokasi: eskulData.lokasi.trim(),
        deskripsi: eskulData.deskripsi.trim(),
        userId: currentUser.uid,
        createdAt: Timestamp.fromDate(new Date()),
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
      <button
        onClick={() => navigate(-1)}
        className="mb-4 text-blue-600 hover:text-blue-800 font-semibold"
        aria-label="Kembali ke halaman sebelumnya"
      >
        &#8592; Kembali
      </button>

      <h2 className="text-2xl font-bold mb-4">Tambah Sertifikat</h2>

      {error && <p className="text-red-500 mb-3" role="alert">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="nama" className="block font-semibold mb-1">Nama Sertifikat</label>
          <input
            id="nama"
            type="text"
            name="nama"
            value={eskulData.nama}
            onChange={handleChange}
            required
            className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div>
          <label htmlFor="lokasi" className="block font-semibold mb-1">Lokasi</label>
          <input
            id="lokasi"
            type="text"
            name="lokasi"
            value={eskulData.lokasi}
            onChange={handleChange}
            required
            className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div>
          <label htmlFor="tanggal" className="block font-semibold mb-1">Tanggal Mengikuti</label>
          <input
            id="tanggal"
            type="date"
            name="tanggal"
            value={eskulData.tanggal}
            onChange={handleChange}
            required
            max={new Date().toISOString().split('T')[0]} // batasi max tanggal hari ini
            className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div>
          <label htmlFor="deskripsi" className="block font-semibold mb-1">Deskripsi</label>
          <textarea
            id="deskripsi"
            name="deskripsi"
            value={eskulData.deskripsi}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            rows={4}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition disabled:opacity-60"
        >
          {loading ? 'Menyimpan...' : 'Simpan'}
        </button>
      </form>
    </div>
  );
};

export default EskulForm;
