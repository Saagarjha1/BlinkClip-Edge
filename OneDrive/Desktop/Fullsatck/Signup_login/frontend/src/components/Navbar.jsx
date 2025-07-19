import React from "react";

const Navbar = ({ user, onLogout }) => {
  return (
    <nav className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center shadow-md">
      <h1 className="text-xl font-bold">MyApp</h1>
      {user && (
        <button
          onClick={onLogout}
          className="bg-white text-blue-600 px-3 py-1 rounded hover:bg-blue-100 transition"
        >
          Logout
        </button>
      )}
    </nav>
  );
};

export default Navbar;
