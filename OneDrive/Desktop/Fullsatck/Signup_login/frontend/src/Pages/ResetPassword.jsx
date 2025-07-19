import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

function ResetPassword({ onBack }) {
  const [email, setEmail] = useState("");
  const [securityQuestion, setSecurityQuestion] = useState("");
  const [securityAnswer, setSecurityAnswer] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [questionFetched, setQuestionFetched] = useState(false);

  const handleGetQuestion = async () => {
    if (!email) {
      toast.error("Please enter your email");
      return;
    }

    try {
      const res = await axios.post("http://localhost:5000/api/auth/get-question", { email });
      setSecurityQuestion(res.data.securityQuestion);
      setQuestionFetched(true);
    } catch (err) {
      toast.error(err.response?.data?.msg || "Failed to fetch security question");
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/auth/reset-password", {
        email,
        securityAnswer,
        newPassword,
      });
      toast.success("Password reset successful");
      onBack(); // navigate to login
    } catch (err) {
      toast.error(err.response?.data?.msg || "Password reset failed");
    }
  };

  return (
    <form onSubmit={handleReset} className="max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Reset Password</h2>

      <input
        type="email"
        className="w-full mb-3 p-2 border rounded"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      {!questionFetched && (
        <button
          type="button"
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 mb-3"
          onClick={handleGetQuestion}
        >
          Get Security Question
        </button>
      )}

      {securityQuestion && (
        <div className="mb-3 p-2 border bg-gray-100 rounded">
          <strong>Q:</strong> {securityQuestion}
        </div>
      )}

      {questionFetched && (
        <>
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

      <p className="mt-3 text-sm text-center">
        Back to Login?{" "}
        <button type="button" onClick={onBack} className="text-blue-600">
          Click here
        </button>
      </p>
    </form>
  );
}

export default ResetPassword;
