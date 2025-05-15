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

const EskulPage = () => {
    const [data, setData] = useState({
        nama: '',
        tanggal: '',
        lokasi: '',
        deskripsi: '',
      });
    const [eskulList, setEskulList] = useState([]);
    const [error, setError] = useState("");
    const [editing, setEditing] = useState(false);
      const [loading, setLoading] = useState(false);

    const handleDeleteEskul = async (id) => {
        const confirm = window.confirm("Yakin ingin menghapus eskul ini?");
        if (!confirm) return;
    
        try {
          await deleteDoc(doc(db, "dat_eskul", id));
          setEskulList((prev) => prev.filter((data_eskul) => data_eskul.id !== id));
        } catch (err) {
          setError("Gagal menghapus eskul: " + err.message);
        }
      };
      
      useEffect(() => {
          const fetchEskul = async () => {
            const user = auth.currentUser;
            if (!user) return;
      
            const q = query(collection(db, "data_eskul"), where("userId", "==", user.uid));
            const querySnapshot = await getDocs(q);
      
            const data = querySnapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
            setEskulList(data);
          };
      
          fetchEskul();
        }, []);

        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {eskulList.map((data_eskul) => (
              <div
                key={data_eskul.id}
                className="bg-gray-100 border shadow rounded-lg p-4"
              >
                <h4 className="font-semibold text-lg mb-1">{data_eskul.nama}</h4>
                <p className="text-sm text-gray-600 mb-1">
                  Lokasi: {data_eskul.lokasi || "-"}
                </p>
                <p className="text-sm text-gray-500 mb-2">
                  Tanggal:{" "}
                  {data_eskul.tanggal?.toDate
                    ? data_eskul.tanggal.toDate().toLocaleDateString()
                    : "Tidak tersedia"}
                </p>
                <p className="text-sm text-gray-700 mb-2">
                  {data_eskul.deskripsi || ""}
                </p>
                <button
                  onClick={() => handleDeleteEskul(data_eskul.id)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Hapus
                </button>
              </div>
            ))}
          </div>
        )
}

export default EskulPage;