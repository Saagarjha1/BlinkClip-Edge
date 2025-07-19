import React, { useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { toast } from "react-toastify";

function Login({ onSwitch, onSubmit }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showReset, setShowReset] = useState(false);

  const [securityQuestion, setSecurityQuestion] = useState("");
  const [securityAnswer, setSecurityAnswer] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loadingQuestion, setLoadingQuestion] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        email,
        password,
      });

      const { token, user } = res.data;

      localStorage.setItem("token", token);
      Cookies.set("auth_token", token, { expires: 7 });
      onSubmit(user);

      if (!toast.isActive("login-success")) {
        toast.success("Login successful", { toastId: "login-success" });
      }
    } catch (err) {
      toast.error(err.response?.data?.msg || "Login failed", {
        toastId: "login-error",
      });
    }
  };

  const handleFetchQuestion = async () => {
    if (!email.includes("@")) {
      toast.error("Please enter a valid email.");
      return;
    }

    try {
      setLoadingQuestion(true);
      const res = await axios.get("http://localhost:5000/api/auth/security-question", {
        params: { email },
      });
      setSecurityQuestion(res.data.securityQuestion);
    } catch (err) {
      setSecurityQuestion("");
      toast.error(err.response?.data?.msg || "Unable to fetch question");
    } finally {
      setLoadingQuestion(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/auth/reset-password-with-security", {
        email,
        securityAnswer,
        newPassword,
      });
      toast.success("Password reset successful");
      setShowReset(false);
      setSecurityQuestion("");
      setSecurityAnswer("");
      setNewPassword("");
    } catch (err) {
      toast.error(err.response?.data?.msg || "Reset failed");
    }
  };

  return (
    <>
      {!showReset ? (
        <form onSubmit={handleLogin}>
          <h2 className="text-xl font-bold mb-4">Login</h2>
          <input
            type="email"
            className="w-full mb-3 p-2 border rounded"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            className="w-full mb-3 p-2 border rounded"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          >
            Login
          </button>

          <div className="text-sm text-center mt-3">
            <button
              type="button"
              className="text-blue-600 underline"
              onClick={() => {
                setShowReset(true);
                setSecurityQuestion("");
                setSecurityAnswer("");
                setNewPassword("");
              }}
            >
              Forgot Password?
            </button>
          </div>

          <p className="mt-3 text-sm text-center">
            Don&apos;t have an account?{" "}
            <button type="button" onClick={onSwitch} className="text-blue-600">
              Signup
            </button>
          </p>
        </form>
      ) : (
        <form onSubmit={handleResetPassword}>
          <h2 className="text-xl font-bold mb-4">Reset Password</h2>

          <input
            type="email"
            className="w-full mb-3 p-2 border rounded"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {/* ✅ Hide button if question is already fetched */}
          {!securityQuestion && (
            <button
              type="button"
              className="w-full bg-blue-500 text-white p-2 rounded mb-3 hover:bg-blue-600"
              onClick={handleFetchQuestion}
              disabled={loadingQuestion || !email.includes("@")}
            >
              {loadingQuestion ? "Loading..." : "Get Security Question"}
            </button>
          )}

          {securityQuestion && (
            <>
              <p className="mb-2 text-sm text-gray-700">Q: {securityQuestion}</p>
              <input
                type="text"
                className="w-full mb-3 p-2 border rounded"
                placeholder="Your Answer"
                value={securityAnswer}
                onChange={(e) => setSecurityAnswer(e.target.value)}
                required
              />
              <input
                type="password"
                className="w-full mb-3 p-2 border rounded"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <button
                type="submit"
                className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600"
              >
                Reset Password
              </button>
            </>
          )}

          <div className="text-sm text-center mt-3">
            <button
              type="button"
              className="text-blue-600 underline"
              onClick={() => setShowReset(false)}
            >
              Back to Login
            </button>
          </div>
        </form>
      )}
    </>
  );
}

export default Login;
