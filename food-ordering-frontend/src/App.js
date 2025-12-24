import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import axios from 'axios';
import MenuPage from './components/MenuPage';
import { CartProvider } from './context/CartContext';
import CartPage from './components/CartPage';
import MyOrdersPage from './components/MyOrdersPage';
import SearchByPhoto from './components/SearchByPhoto';
import './App.css';

const API_BASE_URL = 'https://itsw9q2cyj.execute-api.us-east-2.amazonaws.com/dev';

function RestaurantList() {
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/restaurants`);
      setRestaurants(response.data.restaurants);
      setLoading(false);
    } catch (err) {
      setError('Failed to load restaurants');
      setLoading(false);
      console.error('Error fetching restaurants:', err);
    }
  };

  const handleViewMenu = (restaurantId) => {
    navigate(`/menu/${restaurantId}`);
  };

  if (loading) {
    return (
      <div>
        <header className="header">
          <h1>🍕 Food Ordering Platform</h1>
          <p>Choose your favorite restaurant</p>
        </header>
        <div className="container">Loading restaurants...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <header className="header">
          <h1>🍕 Food Ordering Platform</h1>
          <p>Choose your favorite restaurant</p>
        </header>
        <div className="container error">{error}</div>
      </div>
    );
  }

  return (
    <div>
      <header className="header">
  <h1>🍕 Food Ordering Platform</h1>
  <p>Choose your favorite restaurant</p>
  <div className="header-buttons">
    <button 
      className="search-photo-link"
      onClick={() => navigate('/search-photo')}
    >
      📸 Search by Photo
    </button>
    <button 
      className="my-orders-link"
      onClick={() => navigate('/orders')}
    >
      📦 My Orders
    </button>
  </div>
</header>

      <div className="container">
        <div className="restaurant-grid">
          {restaurants.map((restaurant) => (
            <div key={restaurant.restaurantId} className="restaurant-card">
  {restaurant.imageUrl && (
    <img 
      src={restaurant.imageUrl} 
      alt={restaurant.name}
      className="restaurant-image"
    />
  )}
  <div className="restaurant-header">
    <h2>{restaurant.name}</h2>
    <span className="rating">⭐ {restaurant.rating}</span>
  </div>
  <p className="cuisine">{restaurant.cuisine}</p>
  <p className="address">📍 {restaurant.address}</p>
  <p className="phone">📞 {restaurant.phone}</p>
  <button 
    className="view-menu-btn"
    onClick={() => handleViewMenu(restaurant.restaurantId)}
  >
    View Menu
  </button>
</div>
          ))}
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <CartProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<RestaurantList />} />
            <Route path="/menu/:restaurantId" element={<MenuPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/orders" element={<MyOrdersPage />} />
            <Route path="/search-photo" element={<SearchByPhoto />} />
          </Routes>
        </div>
      </Router>
    </CartProvider>
  );
}

export default App;