import React from 'react'
import {Link, useNavigate } from 'react-router-dom'
import { doSignOut } from '../../firebase/auth.js'
import { useAuth } from '../../contexts/authContext/index.jsx'
import { auth } from "../../firebase/firebase.js";


const Navbar = () => {
    const { currentUser } = useAuth()
    const navigate = useNavigate()

    const handleLogout = async () => {
        try {
            await doSignOut()
            navigate('/login')
        } catch (error) {
            console.error("Terjadi kesalahan saat logout:", error)
        }
    }

    if (!currentUser) {
        return null
    }

    // Ambil huruf pertama dari displayName atau email
    const getInitial = (user) => {
        if (user.displayName) {
            return user.displayName.charAt(0).toUpperCase()
        } else if (user.email) {
            return user.email.charAt(0).toUpperCase()
        }
        return "U" // Default huruf jika tidak ada nama/email
    }

    // Menampilkan inisial dalam lingkaran
    return (
        <nav className="flex items-center justify-between p-6 bg-gray-800">
            <div className="flex items-center space-x-4">
                {/* Menampilkan inisial dalam lingkaran dan mencegah salinan */}
                <div 
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-indigo-500 text-white font-bold text-lg"
                    style={{ userSelect: 'none' }} // Menonaktifkan pemilihan teks
                >
                    {getInitial(auth.currentUser)}
                </div>
                <Link className="text-white font-medium" to={"/profil"}>
                    {auth.currentUser.displayName ? auth.currentUser.displayName : auth.currentUser.email}
                </Link>
            </div>

            <div className="flex items-center space-x-4">
                <Link className="text-white" to={"/pesansiswa"}>
                    Kirim Pesan
                </Link>
                <button
                    onClick={handleLogout}
                    className="text-white border border-white px-3 py-1 rounded hover:bg-white hover:text-gray-800 transition"
                >
                    Logout
                </button>
            </div>
        </nav>
    )
}

export default Navbar
