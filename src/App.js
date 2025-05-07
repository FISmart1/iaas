import LoginPage from "./components/auth/login/Login.jsx";
import RegisterPage from "./components/auth/register";
import Header from "./components/header";
import Siswa from "./components/home/siswa.jsx";
import Guru from "./components/home/guru.jsx";
import LiveChat from "./components/home/pesansiswa.jsx";
import LiveChatGuru from "./components/home/pesanguru.jsx";
import Profil from "./components/profil";
import { AuthProvider } from "./contexts/authContext";
import { useRoutes, Navigate } from "react-router-dom";
import AdminDashboard from "./components/admin";
import { useAuth } from "./contexts/authContext";
import HeaderPage from "./components/header";
import Chat from "./pages/Chatsiswa.jsx"
import ChatRoomGuru from "./pages/Chatguru.jsx";

// Buat komponen layout utama
const MainLayout = ({ children }) => {
  return (
    <div className="w-full h-screen flex flex-col">
      <Header />
      <div className="flex-1">{children}</div>
    </div>
  );
};

// Komponen untuk proteksi route
const ProtectedRoute = ({ children }) => {
  const { userLoggedIn } = useAuth();
  return userLoggedIn ? children : <Navigate to="/login" replace />;
};

function App() {
  const routesArray = [
    {
      path: "/",
      element: <HeaderPage/>,
    },
    {
      path: "/login",
      element: <LoginPage />,
    },
    {
      path: "/register",
      element: <RegisterPage />,
    },
    {
      path: "/siswa",
      element: (
            <Siswa />
      ),
    },
    {
      path: "/guru",
      element: (
            <Guru />
      ),
    },
    {
      path: "/profil",
      element: (
            <Profil />

      ),
    },
    {
      path: "/pesansiswa",
      element: (
            <LiveChat />

      ),
    },
    {
      path: "/pesanguru",
      element: (
            <LiveChatGuru />

      ),
    },
    {
      path: "/chatsiswa/:userId",
      element: (
            <Chat />

      ),
    },
    {
      path: "/chatguru/:userId",
      element: (
            <ChatRoomGuru />

      ),
    },
    {
      path: "/admin",
      element: (

            <AdminDashboard />

      ),
    },
  ];

  const routesElement = useRoutes(routesArray);
  
  return (
    <AuthProvider>
      {routesElement}
    </AuthProvider>
  );
}

export default App;