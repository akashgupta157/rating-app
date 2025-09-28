import Login from "./pages/Login";
import { useContext } from "react";
import Register from "./pages/Register";
import { AuthContext } from "./ContextApi";
import { Header } from "./components/Header";
import { Navigate, Route, Routes } from "react-router";
import { AdminDashboard } from "./pages/AdminDashboard";
import { OwnerDashboard } from "./pages/OwnerDashboard";
import { UserDashboard } from "./pages/UserDashboard";
import UpdatePasswordPage from "./pages/UpdatePassword";

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { auth } = useContext(AuthContext);
  return auth ? children : <Navigate to="/login" />;
};

export default function AllRoute() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/admin-dashboard"
        element={
          <PrivateRoute>
            <Header />
            <AdminDashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/owner-dashboard"
        element={
          <PrivateRoute>
            <Header />
            <OwnerDashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Header />
            <UserDashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/update-password"
        element={
          <PrivateRoute>
            <UpdatePasswordPage />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}
