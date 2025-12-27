import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const API_BASE_URL = 'https://itsw9q2cyj.execute-api.us-east-2.amazonaws.com/dev';

function AdminDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [restaurants, setRestaurants] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRestaurants: 0,
    totalOrders: 0,
    totalRevenue: 0,
    activeUsers: 0
  });

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      // Fetch restaurants
      const restaurantsRes = await axios.get(`${API_BASE_URL}/restaurants`);
      const restaurantsData = restaurantsRes.data.restaurants || [];
      setRestaurants(restaurantsData);

      // Fetch all orders (you'd need to modify your Lambda to support this)
      // For now, we'll use a placeholder
      const ordersData = [];
      setOrders(ordersData);

      setStats({
        totalRestaurants: restaurantsData.length,
        totalOrders: ordersData.length,
        totalRevenue: ordersData.reduce((sum, o) => sum + (o.totalAmount || 0), 0),
        activeUsers: 0 // Would need Cognito API call
      });

      setLoading(false);
    } catch (error) {
      console.error('Error fetching admin data:', error);
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <h1>👨‍💼 Admin Dashboard</h1>
          <p>Welcome, {user?.name}!</p>
        </div>
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </header>

      <div className="dashboard-container">
        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">🏪</div>
            <div className="stat-info">
              <h3>{stats.totalRestaurants}</h3>
              <p>Total Restaurants</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">📦</div>
            <div className="stat-info">
              <h3>{stats.totalOrders}</h3>
              <p>Total Orders</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">💰</div>
            <div className="stat-info">
              <h3>${stats.totalRevenue.toFixed(2)}</h3>
              <p>Total Revenue</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-info">
              <h3>{stats.activeUsers}</h3>
              <p>Active Users</p>
            </div>
          </div>
        </div>

        {/* Restaurants List */}
        <div className="dashboard-section">
          <h2>All Restaurants</h2>
          
          {restaurants.length === 0 ? (
            <p className="no-data">No restaurants yet</p>
          ) : (
            <div className="restaurants-grid">
              {restaurants.map(restaurant => (
                <div key={restaurant.restaurantId} className="restaurant-admin-card">
                  {restaurant.imageUrl && (
                    <img src={restaurant.imageUrl} alt={restaurant.name} />
                  )}
                  <div className="restaurant-admin-info">
                    <h3>{restaurant.name}</h3>
                    <p>{restaurant.cuisine}</p>
                    <p className="rating">⭐ {restaurant.rating}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="dashboard-section">
          <h2>Platform Management</h2>
          <div className="action-buttons">
            <button className="action-btn" onClick={() => alert('Coming soon: User Management')}>
              👥 Manage Users
            </button>
            <button className="action-btn" onClick={() => alert('Coming soon: Restaurant Approval')}>
              ✅ Approve Restaurants
            </button>
            <button className="action-btn" onClick={() => alert('Coming soon: Platform Analytics')}>
              📊 Analytics
            </button>
            <button className="action-btn" onClick={() => alert('Coming soon: System Settings')}>
              ⚙️ Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;