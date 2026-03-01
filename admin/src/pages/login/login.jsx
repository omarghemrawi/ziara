import React, { useState } from "react";
import "./login.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL;



const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();



  const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const { data } = await axios.post(`${API_URL}/api/admin/login`, {
      email,
      password,
    });

    // Save the token in localStorage
    localStorage.setItem("adminToken", data.token);
    navigate("/dashboard" , {replace:true});
  } catch (err) {
    if (err.response && err.response.data && err.response.data.message) {
      setError(err.response.data.message); 
    } else {
      setError("Server error");
    }
  }
};

  return (
    <div className="login-container">
      <h2>Admin Panel Login</h2>
      <p
        style={{
          color: "#6366f1",
          marginBottom: "24px",
          fontWeight: 500,
          fontSize: "1.1rem",
        }}
      >
        Please sign in with your admin credentials
      </p>

      <form onSubmit={handleSubmit} className="login-form">
        <input
          type="email"
          placeholder="Admin Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <div className="error">{error}</div>}
        <button type="submit">Login</button>
      </form>

      <div
        style={{
          marginTop: "20px",
          padding: "10px",
          background: "#f8f9fa",
          borderRadius: "6px",
          fontSize: "12px",
          color: "#666",
          textAlign: "center",
        }}
      >
        <strong>Admin:</strong> ziaralebanon@gmail.com / ziaralebanon123
      </div>
    </div>
  );
};

export default Login;
