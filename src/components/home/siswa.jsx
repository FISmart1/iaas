import React from "react";
import { useAuth } from "../../contexts/authContext/index.jsx";
import Navbar from "../nav/siswa.jsx";
import { Link } from "react-router-dom";
import { FileText, Medal } from "lucide-react";

const Home = () => {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">
          Selamat Datang, {currentUser.displayName || currentUser.email}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <Link
            to="/sertif"
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 group"
          >
            <div className="flex items-center space-x-4">
              <FileText className="text-blue-600 animate-bounce" size={32} />
              <h3 className="text-lg font-semibold text-gray-700">
                Sertifikat
              </h3>
            </div>
          </Link>

          <Link
            to="/eskul"
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 group"
          >
            <div className="flex items-center space-x-4">
              <Medal className="text-green-600 animate-bounce" size={32} />
              <h3 className="text-lg font-semibold text-gray-700">
                Ekstrakulikuler
              </h3>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
