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
                className="bg-gray-100 border shadow rounded-lg p-4"
              >
                <h4 className="font-semibold text-lg mb-1">{eskul.nama}</h4>
                <p className="text-sm text-gray-600 mb-1">
                  Lokasi: {eskul.lokasi || "-"}
                </p>
                <p className="text-sm text-gray-500 mb-2">
                  Tanggal:{" "}
                  {eskul.tanggal?.toDate
                    ? eskul.tanggal.toDate().toLocaleDateString()
                    : "Tidak tersedia"}
                </p>
                <p className="text-sm text-gray-700 mb-2">
                  {eskul.deskripsi || ""}
                </p>
                <button
                  onClick={() => handleDeleteEskul(eskul.id)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Hapus
                </button>
              </div>
            ))}
          </div>
        )
}

export default SertifikatPage;