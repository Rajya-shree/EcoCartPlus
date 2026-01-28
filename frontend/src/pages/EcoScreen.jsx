import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "./EcoScreen.css";
import {
  Search,
  ShieldCheck,
  Hammer,
  Building2,
  Info,
  ArrowRight,
} from "lucide-react";

const EcoScreen = () => {
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchProducts = async (searchQuery = "") => {
    setIsLoading(true);
    try {
      const { data } = await axios.post(
        "http://localhost:5001/api/eco-products/search",
        { query: searchQuery },
      );
      // Ensure data is always an array
      setProducts(Array.isArray(data) ? data : [data]);
    } catch (err) {
      console.error("Fetch Error:", err);
      toast.error("Could not fetch results");
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchProducts("Sustainable Electronics");
  }, []);

  const submitHandler = (e) => {
    e.preventDefault();
    fetchProducts(query);
  };

  // We take the first product to display in the detailed card
  const result = products[0];

  return (
    <div
      className="eco-advisor-container"
      style={{ backgroundColor: "rgb(241, 245, 249)" }}
    >
      <div className="hero-section text-center">
        <h1>Green Shopping Intelligence</h1>
        <p>
          Use our AI-powered advisor to get a real-time sustainability report.
        </p>

        <form onSubmit={submitHandler} className="search-bar-container">
          <input
            type="text"
            placeholder="e.g., iPhone 15, Sony WH-1000XM5..."
            value={query} // 🟢 Fixed: matched useState name
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="submit" className="analyze-btn" disabled={isLoading}>
            {isLoading ? "..." : "Analyze"}
          </button>
        </form>
      </div>

      {result && (
        <div className="analysis-card">
          <div className="card-header">
            <div className="product-info">
              <span className="brand-tag">ELECTRONICS</span>
              <h2>{result.name}</h2>
              <p className="description">
                Sustainability analysis for {result.name}
              </p>
            </div>
            <div className="score-circle">
              <span className="score-num">{result.finalEcoScore}</span>
              <span className="score-label">ECOSCORE</span>
            </div>
          </div>

          <div className="metrics-grid">
            <MetricBar
              icon={<ShieldCheck size={20} />}
              label="Material Source"
              score={result.materialScore}
              color="#2e7d32"
            />
            <MetricBar
              icon={<Hammer size={20} />}
              label="Repairability"
              score={result.repairabilityScore}
              color="#ed6c02"
            />
            <MetricBar
              icon={<Building2 size={20} />}
              label="Corporate Ethics"
              score={result.companyScore}
              color="#0288d1"
            />
          </div>

          <div className="pros-cons-section">
            <div className="pros">
              <h4>✓ Key Sustainability Pros</h4>
              <ul>
                {(result.ecoReasons || []).map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
            <div className="cons">
              <h4>! Room for Improvement</h4>
              <ul>
                {(result.features || []).map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
            </div>
          </div>

          {result.greenerAlternative && (
            <div className="alternatives">
              <h4>
                <Info size={16} /> Better Alternatives
              </h4>
              <button className="alt-tag">
                {result.greenerAlternative} <ArrowRight size={14} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Sub-component for the progress bars
const MetricBar = ({ icon, label, score, color }) => (
  <div className="metric-item">
    <div className="metric-label">
      {icon} <span>{label}</span>
    </div>
    <div className="progress-bg">
      <div
        className="progress-fill"
        style={{ width: `${score * 10}%`, backgroundColor: color }}
      ></div>
    </div>
  </div>
);

export default EcoScreen;
