// ProfilePage.js
import React, { useState, useEffect } from "react";
import { auth, db } from "../../firebase/firebase";
import {
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
} from "firebase/firestore";
import { updateProfile } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import Sertifikat from "./sertifikat";
import EskulSection from "./eskul";

const ProfilePage = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    address: "",
    birthdate: "",
    motivation: "",
    generation: "",
  });
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [eskulList, setEskulList] = useState([]);
  const [activeSection, setActiveSection] = useState(""); // sertifikat | eskul

  useEffect(() => {
    const fetchProfile = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        const docSnap = await getDoc(doc(db, "users", user.uid));
        if (docSnap.exists()) {
          setUserData({ ...docSnap.data(), email: user.email });
        } else {
          setUserData((prev) => ({ ...prev, email: user.email }));
        }
      } catch (err) {
        setError("Gagal mengambil data profil.");
      }
    };

    const fetchEskul = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const q = query(collection(db, "eskul"), where("userId", "==", user.uid));
      const querySnapshot = await getDocs(q);
      const eskulData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setEskulList(eskulData);
    };

    fetchProfile();
    fetchEskul();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    const user = auth.currentUser;
    if (!user) return;

    try {
      const docSnap = await getDoc(doc(db, "users", user.uid));
      const currentRole = docSnap.exists() ? docSnap.data().role : "user";

      await updateProfile(user, { displayName: userData.name });

      await setDoc(doc(db, "users", user.uid), {
        ...userData,
        email: user.email,
        role: currentRole,
      });

      setEditing(false);
    } catch (err) {
      setError("Gagal menyimpan perubahan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-800 font-sans">
      {/* Header Banner */}
      <div className="bg-[#2C3E50] h-28" />
      <div className="max-w-5xl mx-auto -mt-20 bg-white rounded-xl shadow-xl overflow-hidden">
        {/* Profile Picture */}
        <div className="flex flex-col items-center px-6 py-4">
          <div className="w-32 h-32 rounded-full bg-blue-500 text-white text-5xl font-semibold flex items-center justify-center border-4 border-white shadow-md">
            {userData.name?.charAt(0).toUpperCase() || "U"}
          </div>
          <h2 className="text-2xl font-semibold mt-4">{userData.name || "Nama Pengguna"}</h2>
          <p className="text-sm text-gray-500">{userData.email}</p>
          {error && <p className="text-red-500 mt-2">{error}</p>}
        </div>

        {/* Info */}
        <div className="border-t border-gray-200 px-6 md:flex">
          <div className="md:w-1/2 py-6 space-y-4">
            {["name", "address", "birthdate", "generation"].map((field, i) => (
              <div key={i}>
                <h3 className="text-sm font-medium text-gray-600 capitalize">{field}</h3>
                {editing ? (
                  <input
                    type={field === "birthdate" ? "date" : "text"}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={userData[field]}
                    onChange={(e) => setUserData({ ...userData, [field]: e.target.value })}
                  />
                ) : (
                  <p className="text-base text-gray-700">{userData[field] || "-"}</p>
                )}
              </div>
            ))}
          </div>
          <div className="md:w-1/2 py-6 md:pl-6">
            <h3 className="text-sm font-medium text-gray-600">Motivasi</h3>
            {editing ? (
              <textarea
                className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1 min-h-[120px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={userData.motivation}
                onChange={(e) => setUserData({ ...userData, motivation: e.target.value })}
              />
            ) : (
              <p className="text-base text-gray-700 whitespace-pre-wrap">
                {userData.motivation || "Belum diisi."}
              </p>
            )}
          </div>
        </div>

        {/* Edit/Save Button */}
        <div className="px-6 pb-6 text-right">
          {editing ? (
            <button
              onClick={handleSave}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-semibold shadow"
              disabled={loading}
            >
              {loading ? "Menyimpan..." : "Simpan"}
            </button>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="bg-gray-900 hover:bg-gray-800 text-white px-5 py-2 rounded-lg font-semibold shadow"
            >
              Edit Profil
            </button>
          )}
        </div>

        {/* Tab Menu */}
        <div className="border-t px-6 pt-4 pb-6">
          <div className="flex justify-center space-x-4 mb-6">
            <button
              onClick={() => setActiveSection("sertifikat")}
              className={`px-4 py-2 text-sm font-semibold rounded-full border ${
                activeSection === "sertifikat"
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-blue-600 border-blue-300 hover:bg-blue-50"
              }`}
            >
              Sertifikat
            </button>
            <button
              onClick={() => setActiveSection("eskul")}
              className={`px-4 py-2 text-sm font-semibold rounded-full border ${
                activeSection === "eskul"
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-blue-600 border-blue-300 hover:bg-blue-50"
              }`}
            >
              Eskul
            </button>
          </div>

          {activeSection === "sertifikat" && <Sertifikat />}
          {activeSection === "eskul" && <EskulSection />}
        </div>

        {/* Back Button */}
        <div className="px-6 pb-6">
          <button
            onClick={() => navigate(-1)}
            className="bg-gray-500 hover:bg-gray-600 text-white px-5 py-2 rounded-lg font-semibold shadow"
          >
            Kembali
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
