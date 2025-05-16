import React from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/authContext';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase/firebase';

const HeaderPage = () => {
    const navigate = useNavigate();
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
        <div className="w-full h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100">
            <div className="w-96 bg-white text-gray-700 space-y-6 p-6 shadow-2xl border border-gray-200 rounded-3xl">
                <div className="text-center">
                    <h1 className="text-3xl font-extrabold text-indigo-600">Ko<span className="text-pink-500">!</span>Chat</h1>
                    <p className="text-sm mt-1 text-gray-500">Admin Dashboard</p>
                </div>

                <div className="space-y-4">
                    <button
                        onClick={handleLogout}
                        className="w-full px-4 py-2 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition duration-300"
                    >
                        Login
                    </button>

                    <Link
                        to="/register"
                        className="w-full block text-center px-4 py-2 border border-indigo-500 text-indigo-600 font-medium rounded-xl hover:bg-indigo-50 transition duration-300"
                    >
                        Register New Account
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default HeaderPage;
