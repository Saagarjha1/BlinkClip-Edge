import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

function Signup({ onSwitch, onSubmit, onResetPassword }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [securityQuestion, setSecurityQuestion] = useState("");
  const [securityAnswer, setSecurityAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  const securityQuestions = [
    "What is your mother’s maiden name?",
    "What was the name of your first pet?",
    "What is your favorite book?",
    "What was your first school?",
    "What city were you born in?",
    "What is your favourite colour?",
  ];

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/api/auth/register", {
        name: name.trim(),
        email: email.trim(),
        password,
        securityQuestion,
        securityAnswer: securityAnswer.trim(),
      });
      toast.success("Signup successful");
      onSubmit(res.data.user);
    } catch (err) {
      toast.error(err.response?.data?.msg || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSignup} className="space-y-6 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4 text-center">Signup</h2>

      <input
        type="text"
        className="w-full p-2 border rounded"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />

      <input
        type="email"
        className="w-full p-2 border rounded"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <input
        type="password"
        className="w-full p-2 border rounded"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}"
        title="Must contain at least one number, one uppercase and lowercase letter, and at least 8 or more characters"
      />

      <select
        className="w-full p-2 border rounded"
        value={securityQuestion}
        onChange={(e) => setSecurityQuestion(e.target.value)}
        required
      >
        <option value="" disabled>
          Select a Security Question
        </option>
        {securityQuestions.map((q) => (
          <option key={q} value={q}>
            {q}
          </option>
        ))}
      </select>

      <input
        type="text"
        className="w-full p-2 border rounded"
        placeholder="Security Answer"
        value={securityAnswer}
        onChange={(e) => setSecurityAnswer(e.target.value)}
        required
      />

      <button
        type="submit"
        disabled={loading}
        className={`w-full p-2 rounded text-white ${
          loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"
        }`}
      >
        {loading ? "Signing up..." : "Signup"}
      </button>

      <p className="text-center text-sm">
        Already have an account?{" "}
        <button
          type="button"
          onClick={onSwitch}
          className="text-blue-600 underline hover:text-blue-800"
        >
          Login
        </button>
      </p>

      <p className="text-center text-sm mt-1">
        Forgot password?{" "}
        <button
          type="button"
          onClick={onResetPassword}
          className="text-red-500 underline hover:text-red-700"
        >
          Reset Password
        </button>
      </p>
    </form>
  );
}

export default Signup;
