import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios"; // Import axios
import { toast } from "react-toastify"; // Import toast
import { useAuth } from "../context/AuthContext.jsx";
import "./Auth.css"; // Import the shared CSS

const RegisterScreen = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate(); // 3. INITIALIZE navigate
  const { login } = useAuth(); // 4. GET THE LOGIN FUNCTION

  // Updated submitHandler
  const submitHandler = async (e) => {
    e.preventDefault(); // Prevents the page from reloading

    // Optional: Add password validation
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    try {
      // This is the API call
      // The proxy in vite.config.js will redirect this to http://localhost:5001/api/users/register
      const { data } = await axios.post("/api/users/register", {
        username,
        email,
        password,
      });

      // If successful, show a success message
      toast.success("Registration successful! Please log in.");
      login(data);
      navigate("/dashboard");

      // We will add logic to auto-login or redirect the user here later
      console.log("Success:", data);
    } catch (err) {
      // If the backend sends an error (like "User already exists"),
      // it will be in err.response.data.message
      toast.error(err.response?.data?.message || err.message);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2 className="auth-title">Create Your Toolkit</h2>
        <p className="auth-subtitle">
          Join thousands of eco-conscious repair enthusiasts
        </p>

        <form onSubmit={submitHandler}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              placeholder="techfixer123"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

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

          <button type="submit" className="auth-button green">
            Get Started
          </button>
        </form>

        <p className="auth-link">
          Already have an account? <Link to="/login">Unlock here</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterScreen;
