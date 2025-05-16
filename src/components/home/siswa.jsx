import React from "react";
import { useAuth } from "../../contexts/authContext/index.jsx";
import Navbar from "../nav/siswa.jsx";
import { Link } from "react-router-dom";
import { FileText, Medal } from "lucide-react";

const Home = () => {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-600 text-lg">
        Memuat...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-100 to-pink-100">
      <Navbar />

      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-indigo-700">
            Selamat Datang,{" "}
            <span className="text-pink-500">
              {currentUser.displayName || currentUser.email}
            </span>
          </h1>
          <p className="mt-2 text-gray-600">Pilih menu yang ingin kamu akses</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Link
            to="/sertif"
            className="bg-white p-6 rounded-2xl shadow-md hover:shadow-2xl hover:scale-[1.02] transition-all duration-300"
          >
            <div className="flex items-center gap-4">
              <FileText className="text-blue-500 animate-bounce" size={32} />
              <div>
                <h3 className="text-xl font-semibold text-gray-700">Sertifikat</h3>
                <p className="text-sm text-gray-500">Lihat dan kelola sertifikat</p>
              </div>
            </div>
          </Link>

          <Link
            to="/eskul"
            className="bg-white p-6 rounded-2xl shadow-md hover:shadow-2xl hover:scale-[1.02] transition-all duration-300"
          >
            <div className="flex items-center gap-4">
              <Medal className="text-green-500 animate-bounce" size={32} />
              <div>
                <h3 className="text-xl font-semibold text-gray-700">Ekstrakurikuler</h3>
                <p className="text-sm text-gray-500">Aktivitas dan pencapaianmu</p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
