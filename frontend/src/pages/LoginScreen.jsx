import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // 1. Import useNavigate
import axios from "axios"; // 2. Import axios
import { toast } from "react-toastify"; // 3. Import toast
import "./Auth.css"; // Import the shared CSS
import { useAuth } from "../context/AuthContext.jsx";

const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate(); // 4. Initialize useNavigate
  const { login } = useAuth();

  // 5. Updated submitHandler
  const submitHandler = async (e) => {
    e.preventDefault(); // Prevents the page from reloading

    try {
      // This is the API call
      const { data } = await axios.post("/api/users/login", {
        email,
        password,
      });

      // If successful, show a success message
      toast.success("Login successful! Welcome back.");

      login(data);

      // We will add logic to save the user's data (the token) next
      //console.log("Success:", data);

      // Redirect to the dashboard
      navigate("/dashboard");
    } catch (err) {
      // If the backend sends an error (like "Invalid email or password")
      toast.error(err.response?.data?.message || err.message);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2 className="auth-title">Access Your Workshop</h2>
        <p className="auth-subtitle">Welcome back, let's fix some devices!</p>

        <form onSubmit={submitHandler}>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              placeholder="your.email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="auth-button">
            Unlock
          </button>
        </form>

        <p className="auth-link">
          New to Repair Advisor? <Link to="/register">Get Started</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginScreen;
