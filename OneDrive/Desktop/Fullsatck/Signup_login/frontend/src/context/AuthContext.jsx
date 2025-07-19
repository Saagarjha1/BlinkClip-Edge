// src/context/AuthContext.jsx
import { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const name = localStorage.getItem("userName");
    const email = localStorage.getItem("userEmail");

    if (token && name && email) {
      setUser({ name, email });
    }
  }, []);

  const login = async (email, password) => {
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        email,
        password,
      });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("userName", res.data.user.name);
      localStorage.setItem("userEmail", res.data.user.email);
      setUser(res.data.user);
      toast.success("Login successful");
    } catch (err) {
      toast.error(err.response?.data?.msg || "Login failed");
    }
  };

  const signup = async (name, email, password) => {
    try {
      const res = await axios.post("http://localhost:5000/api/auth/register", {
        name,
        email,
        password,
      });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("userName", res.data.user.name);
      localStorage.setItem("userEmail", res.data.user.email);
      setUser(res.data.user);
      toast.success("Signup successful");
    } catch (err) {
      toast.error(err.response?.data?.msg || "Signup failed");
    }
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
    toast.info("Logged out");
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
