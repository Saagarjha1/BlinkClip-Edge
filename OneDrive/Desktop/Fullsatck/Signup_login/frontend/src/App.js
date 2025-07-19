import React, { useState } from "react";
import Login from "./Pages/Login";
import Signup from "./Pages/Signup";
import Dashboard from "./Pages/Dashboard";
import Navbar from "./components/Navbar";
import ResetPassword from "./Pages/ResetPassword";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  const [isLogin, setIsLogin] = useState(true);
  const [user, setUser] = useState(null);
  const [isResetting, setIsResetting] = useState(false);

  const handleSwitch = () => {
    toast.dismiss();
    setIsLogin(!isLogin);
    setIsResetting(false);
  };

  const handleLogout = () => {
    toast.dismiss();
    setUser(null);
    toast.success("Logged out", {
      toastId: "logout-success",
    });
  };

  const handleResetPassword = () => {
    toast.dismiss();
    setIsResetting(true);
  };

  const handleBackToLogin = () => {
    toast.dismiss();
    setIsResetting(false);
    setIsLogin(true);
  };

  return (
    <>
      <Navbar onLogout={handleLogout} user={user} />

      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-md">
          {user ? (
            <Dashboard user={user} onLogout={handleLogout} />
          ) : isResetting ? (
            <ResetPassword onBack={handleBackToLogin} />
          ) : isLogin ? (
            <Login
              onSwitch={handleSwitch}
              onSubmit={setUser}
              onResetPassword={handleResetPassword}
            />
          ) : (
            <Signup
              onSwitch={handleSwitch}
              onSubmit={setUser}
              onResetPassword={handleResetPassword}
            />
          )}
        </div>
      </div>
    </>
  );
}

export default App;
