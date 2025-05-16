import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
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

  if (!currentUser) return null

  const getInitial = (user) => {
    if (user.displayName) return user.displayName.charAt(0).toUpperCase()
    if (user.email) return user.email.charAt(0).toUpperCase()
    return "U"
  }

  return (
    <nav className="flex items-center justify-between bg-gray-800 px-6 py-4 shadow-md">
      <div className="flex items-center space-x-4">
        <div
          className="w-10 h-10 flex items-center justify-center rounded-full bg-indigo-600 text-white font-bold text-lg select-none"
          title={currentUser.displayName || currentUser.email}
        >
          {getInitial(auth.currentUser)}
        </div>
        <Link
          to="/profil"
          className="text-white font-semibold hover:underline truncate max-w-xs"
          title={currentUser.displayName || currentUser.email}
        >
          {currentUser.displayName || currentUser.email}
        </Link>
      </div>

      <div className="flex items-center space-x-6">
        <Link
          to="/pesansiswa"
          className="text-white font-medium hover:text-indigo-300 transition"
        >
          Kirim Pesan
        </Link>

        <button
          onClick={handleLogout}
          className="border border-white text-white px-4 py-1 rounded hover:bg-white hover:text-gray-800 transition"
        >
          Logout
        </button>
      </div>
    </nav>
  )
}

export default Navbar
