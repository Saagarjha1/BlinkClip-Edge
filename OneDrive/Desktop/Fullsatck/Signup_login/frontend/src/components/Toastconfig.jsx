// src/components/ToastConfig.jsx
import React from "react";
import { ToastContainer } from "react-toastify";

const ToastConfig = () => {
  return (
    <ToastContainer
      position="top-right"
      autoClose={3000}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="light"
      style={{ top: "70px", zIndex: 9999 }}
    />
  );
};

export default ToastConfig;
