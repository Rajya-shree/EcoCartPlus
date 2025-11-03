import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import './EcoScreen.css'; // We will create this

const EcoScreen = () => {
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Function to fetch products
  const fetchProducts = async (searchQuery = '') => {
    setIsLoading(true);
    try {
      // Call your new API endpoint
      const { data } = await axios.post('/api/eco-products/search', { 
        query: searchQuery 
      });
      setProducts(data);
    } catch (err) {
      console.error(err);
      toast.error('Could not fetch products');
    }
    setIsLoading(false);
  };

  // Fetch all products when the page first loads
  useEffect(() => {
    fetchProducts();
  }, []);

  // Handle the search form submit
  const submitHandler = (e) => {
    e.preventDefault();
    fetchProducts(query);
  };

  // Helper to get score color
  const getScoreColor = (score) => {
    if (score >= 90) return 'score-blue'; // 90+
    if (score >= 80) return 'score-yellow'; // 80-89
    return 'score-red'; // Below 80
  };

  return (
    <div className="eco-container">
      <div className="eco-header">
        <h2>Green Shopping Assistant</h2>
        <p>Discover products with environmental impact scores.</p>
        <form onSubmit={submitHandler} className="eco-search-form">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for sustainable products..."
          />
          <button type="submit" disabled={isLoading}>
            {isLoading ? '...' : 'Search'}
          </button>
        </form>
      </div>

      <div className="product-grid">
        {isLoading ? (
          <p>Loading products...</p>
        ) : (
          products.map((product) => (
            <div className="product-card" key={product._id}>
              <div className={`score-badge ${getScoreColor(product.finalEcoScore)}`}>
                {product.finalEcoScore}
              </div>
              <img src={product.imageUrl || 'https://via.placeholder.com/150'} alt={product.name} className="product-image" />
              <h3>{product.name}</h3>
              
              <div className="price-box">
                <span className="price">{product.price}</span>
              </div>

              <div className="key-features">
                <strong>Key Features:</strong>
                {product.features.map((feature, i) => (
                  <span key={i} className="feature-tag">{feature}</span>
                ))}
              </div>
              
              <div className="eco-reason">
                <strong>Sustainability:</strong>
                <ul>
                  {product.ecoReasons.map((reason, i) => (
                    <li key={i}>{reason}</li>
                  ))}
                </ul>
              </div>

              <a href={product.buyLink} className="buy-button" target="_blank" rel="noopener noreferrer">
                View Product
              </a>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default EcoScreen;