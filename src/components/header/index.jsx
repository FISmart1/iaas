import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/authContext'
import { doSignOut } from '../../firebase/auth.js'
import { Navigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase/firebase';


const HeaderPage = () => {
    const navigate = useNavigate()
    const { userLoggedIn } = useAuth()
    const { userData, setUserLoggedIn } = useAuth();
    
    const handleLogout = async () => {
        try {
          await signOut(auth);
          setUserLoggedIn(false);
          navigate('/login');
        } catch (error) {
          console.error('Error logging out:', error);
        }
      };
    
      if (userData?.role !== 'admin') {
        return <Navigate to="/login" replace />;
      }

    return (
        <div className="w-full h-screen flex self-center place-content-center place-items-center bg-light">
            <div className="w-96 text-gray-600 space-y-5 p-4 shadow-xl border rounded-xl">
                <div className="text-center">
                    <h3 className="text-gray-800 text-xl font-semibold sm:text-2xl">Welcome to OTA Ku</h3>
                </div>

                
                    
                        {/* ?
                        <button
                            onClick={() => { doSignOut().then(() => { navigate('/login') }) }}
                            className="w-full px-4 py-2 text-white font-medium rounded-lg bg-indigo-600 hover:bg-indigo-700 hover:shadow-xl transition duration-300"
                        >
                            Logout
                        </button>
                        : */}
                        <div className="space-y-5">
                        <button onClick={handleLogout} className="logout-button w-full flex items-center justify-center gap-x-3 py-2.5 border rounded-lg text-sm font-medium  ${isSigningIn ? 'cursor-not-allowed' : 'hover:bg-gray-100 transition duration-300 active:bg-gray-100">
                        Logout
                        </button>
                            
                            <Link 
                                className="w-full flex items-center justify-center gap-x-3 py-2.5 border rounded-lg text-sm font-medium  ${isSigningIn ? 'cursor-not-allowed' : 'hover:bg-gray-100 transition duration-300 active:bg-gray-100" 
                                to={'/register'}
                            >
                                Register New Account
                            </Link>
                        </div>
                

            </div>
        </div>
    )
}

export default HeaderPage
