import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import axios from 'axios';
import MenuPage from './components/MenuPage';
import { CartProvider } from './context/CartContext';
import CartPage from './components/CartPage';
import MyOrdersPage from './components/MyOrdersPage';
import SearchByPhoto from './components/SearchByPhoto';
import './App.css';
import { Amplify } from 'aws-amplify';
import awsConfig from './aws-config';
import { AuthProvider } from './context/AuthContext';
import Login from './components/Login';
import Signup from './components/Signup';
import ProtectedRoute from './components/ProtectedRoute';
import RestaurantDashboard from './components/RestaurantDashboard';
import AdminDashboard from './components/AdminDashboard';

// Configure Amplify
Amplify.configure(awsConfig);

const API_BASE_URL = 'https://itsw9q2cyj.execute-api.us-east-2.amazonaws.com/dev';

// Role-based home page router
function RoleBasedHome() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '1.5rem',
        color: '#667eea'
      }}>
        Loading...
      </div>
    );
  }

  // Route based on user's role
  if (user?.role === 'Admins') {
    return <AdminDashboard />;
  } else if (user?.role === 'Restaurants') {
    return <RestaurantDashboard />;
  } else {
    // Default: Customers
    return <RestaurantList />;
  }
}

function RestaurantList() {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
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
  const handleLogout = async () => {
    await logout();
    navigate('/login');
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
  <div className="header-top">
    <div>
      <h1>🍕 Food Ordering Platform</h1>
      <p>Choose your favorite restaurant</p>
    </div>
    {isAuthenticated && (
      <div className="user-info">
        <span>👤 Welcome, {user?.name || 'Guest'}!</span>
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </div>
    )}
  </div>
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
    <AuthProvider>
    <CartProvider>
      <Router>
        <div className="App">
          <Routes>
  <Route path="/login" element={<Login />} />
  <Route path="/signup" element={<Signup />} />
  
  {/* Protected Routes - Role-based home */}
  <Route path="/" element={
    <ProtectedRoute>
      <RoleBasedHome />
    </ProtectedRoute>
  } />
  
  {/* Customer Routes */}
  <Route path="/menu/:restaurantId" element={
    <ProtectedRoute>
      <MenuPage />
    </ProtectedRoute>
  } />
  <Route path="/cart" element={
    <ProtectedRoute>
      <CartPage />
    </ProtectedRoute>
  } />
  <Route path="/orders" element={
    <ProtectedRoute>
      <MyOrdersPage />
    </ProtectedRoute>
  } />
  <Route path="/search-photo" element={
    <ProtectedRoute>
      <SearchByPhoto />
    </ProtectedRoute>
  } />
</Routes>
        </div>
      </Router>
    </CartProvider>
    </AuthProvider>
  );
}

export default App;