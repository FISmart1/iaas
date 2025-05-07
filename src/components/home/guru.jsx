import React from 'react'
import { useAuth } from '../../contexts/authContext/index.jsx'
import Navbar from '../nav/guru.jsx'
import { auth } from '../../firebase/firebase.js'

const Home = () => {
    const { currentUser } = useAuth()

    // Cek apakah currentUser ada sebelum mencoba mengakses displayName atau email
    if (!currentUser) {
        return <div>Loading...</div>  // Bisa ganti dengan redirect ke halaman login jika perlu
    }

    return (
        <div>
            <Navbar />  {/* Menambahkan Navbar di atas konten utama */}
            <div className='text-2xl font-bold pt-14'>
                Hello {auth.currentUser.displayName ? auth.currentUser.displayName : auth.currentUser.email}, you are now logged in. Guru
            </div>
        </div>
    )
}

export default Home
