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
} from "firebase/firestore";
import { updateProfile } from "firebase/auth";
import { useNavigate, Link } from "react-router-dom";
import { deleteDoc } from "firebase/firestore";

const SertifikatPage = () => {
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    address: "",
    birthdate: "",
    motivation: "",
    generation: "",
  });
  const [eskulList, setEskulList] = useState([]);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDeleteEskul = async (id) => {
    const confirm = window.confirm("Yakin ingin menghapus eskul ini?");
    if (!confirm) return;

    try {
      await deleteDoc(doc(db, "eskul", id));
      setEskulList((prev) => prev.filter((eskul) => eskul.id !== id));
    } catch (err) {
      setError("Gagal menghapus eskul: " + err.message);
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      const user = auth.currentUser;
      if (!user) {
        setError("User belum login");
        return;
      }

      try {
        const docSnap = await getDoc(doc(db, "users", user.uid));
        if (docSnap.exists()) {
          setUserData({
            ...docSnap.data(),
            email: user.email,
          });
        } else {
          setUserData((prev) => ({ ...prev, email: user.email }));
        }
      } catch (err) {
        setError("Gagal mengambil data profil");
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

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {eskulList.map((eskul) => (
        <div
          key={eskul.id}
          className="bg-white border border-gray-200 shadow-sm rounded-xl p-5 hover:shadow-md transition-shadow duration-300 flex flex-col justify-between"
        >
          <div>
            <h4 className="font-bold text-xl text-kochat-blue mb-2 truncate">
              {eskul.nama}
            </h4>
            <p className="text-sm text-gray-600 mb-1 font-semibold">
              Lokasi: <span className="font-normal">{eskul.lokasi || "-"}</span>
            </p>
            <p className="text-sm text-gray-500 mb-3">
              Tanggal:{" "}
              <span className="font-normal">
                {eskul.tanggal?.toDate
                  ? eskul.tanggal.toDate().toLocaleDateString()
                  : "Tidak tersedia"}
              </span>
            </p>
            <p className="text-sm text-gray-700 line-clamp-3">
              {eskul.deskripsi || ""}
            </p>
          </div>

          <button
            onClick={() => handleDeleteEskul(eskul.id)}
            className="mt-4 self-start text-kochat-red font-semibold hover:underline transition"
          >
            Hapus
          </button>
        </div>
      ))}
    </div>
  );
};

export default SertifikatPage;
