import React from "react";

const Dashboard = ({ user, onLogout }) => {
  const activities = [
    "Logged in",
    "Viewed dashboard",
    "Checked stats",
    "Logged out",
  ];

  return (
    <div className="space-y-6">
      <div className="bg-blue-100 p-4 rounded shadow">
        <h2 className="text-xl font-bold mb-2">Welcome, {user.name}</h2>
        <p className="text-sm text-gray-700">Email: {user.email}</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-green-200 p-4 rounded shadow text-center">
          <p className="text-sm">Total Orders</p>
          <h3 className="text-xl font-bold">12</h3>
        </div>
        <div className="bg-yellow-200 p-4 rounded shadow text-center">
          <p className="text-sm">Pending Tasks</p>
          <h3 className="text-xl font-bold">3</h3>
        </div>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <h4 className="font-semibold mb-2">Recent Activity</h4>
        <ul className="list-disc list-inside text-sm text-gray-600">
          {activities.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </div>

      <button
        onClick={onLogout}
        className="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 w-full"
      >
        Logout
      </button>
    </div>
  );
};

export default Dashboard;
