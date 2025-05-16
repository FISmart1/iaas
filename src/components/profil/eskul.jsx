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
    nama: "",
    tanggal: "",
    lokasi: "",
    deskripsi: "",
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

      const q = query(
        collection(db, "data_eskul"),
        where("userId", "==", user.uid)
      );
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
          className="bg-white border border-gray-200 shadow-sm rounded-xl p-5 hover:shadow-md transition-shadow duration-300 flex flex-col justify-between"
        >
          <div>
            <h4 className="font-bold text-xl text-kochat-blue mb-2 truncate">
              {data_eskul.nama}
            </h4>
            <p className="text-sm text-gray-600 mb-1 font-semibold">
              Lokasi:{" "}
              <span className="font-normal">{data_eskul.lokasi || "-"}</span>
            </p>
            <p className="text-sm text-gray-500 mb-3">
              Tanggal:{" "}
              <span className="font-normal">
                {data_eskul.tanggal?.toDate
                  ? data_eskul.tanggal.toDate().toLocaleDateString()
                  : "Tidak tersedia"}
              </span>
            </p>
            <p className="text-sm text-gray-700 line-clamp-3">
              {data_eskul.deskripsi || ""}
            </p>
          </div>

          <button
            onClick={() => handleDeleteEskul(data_eskul.id)}
            className="mt-4 self-start text-kochat-red font-semibold hover:underline transition"
          >
            Hapus
          </button>
        </div>
      ))}
    </div>
  );
};

export default EskulPage;
