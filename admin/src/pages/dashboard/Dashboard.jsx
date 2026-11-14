import React from "react";
import "./dashboard.css";
import { useNavigate } from "react-router-dom"; // If using react-router

const Dashboard = () => {
  let navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/", { replace: true });
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <p>
          Welcome to your admin panel. Manage places and view client places.
        </p>
        <button className="logout-btn click" onClick={handleLogout}>
          Logout
        </button>
      </header>

      <section className="dashboard-content">
        <div
          className="dashboard-card"
          onClick={() => navigate("/clientPlace")}
          style={{ cursor: "pointer" }}
        >
          <h2>Client Places</h2>
          <p>View and manage places created by clients.</p>
        </div>
        <div
          className="dashboard-card"
          onClick={() => navigate("/staticPlace")}
          style={{ cursor: "pointer" }}
        >
          <h2>Static Places</h2>
          <p>Manage static places in the system.</p>
        </div>
        <div
          className="dashboard-card"
          onClick={() => navigate("/report")}
          style={{ cursor: "pointer" }}
        >
          <h2>Reports</h2>
          <p>view reports and manage them.</p>
        </div>
        <div
          className="dashboard-card"
          onClick={() => navigate("/review")}
          style={{ cursor: "pointer" }}
        >
          <h2>Reviews</h2>
          <p>View and manage user reviews.</p>
        </div>
        <div
          className="dashboard-card"
          onClick={() => navigate("/user")}
          style={{ cursor: "pointer" }}
        >
          <h2>Users</h2>
          <p>View and manage user</p>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
