import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { AuthProvider } from './context/AuthContext'; // <-- import context provider
import 'react-toastify/dist/ReactToastify.css';       // <-- toastify styles
import { ToastContainer } from 'react-toastify';       // <-- toast container

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthProvider>
      <App />
      <ToastContainer position="top-right" autoClose={3000} />
    </AuthProvider>
  </React.StrictMode>
);

reportWebVitals();
