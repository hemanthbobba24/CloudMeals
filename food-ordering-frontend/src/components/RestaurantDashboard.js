import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const API_BASE_URL = 'https://itsw9q2cyj.execute-api.us-east-2.amazonaws.com/dev';

function RestaurantDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    todayRevenue: 0
  });

  useEffect(() => {
    fetchRestaurantOrders();
  }, []);

  const fetchRestaurantOrders = async () => {
    try {
      // For now, fetch all orders (later we'll filter by restaurantId)
      const response = await axios.get(`${API_BASE_URL}/orders?customerId=all`);
      
      // In real implementation, filter by user's restaurantId
      // For demo, show all orders
      const allOrders = response.data.orders || [];
      
      setOrders(allOrders);
      
      // Calculate stats
      const pending = allOrders.filter(o => o.status === 'pending').length;
      const today = new Date().toISOString().split('T')[0];
      const todayOrders = allOrders.filter(o => o.orderDate?.startsWith(today));
      const revenue = todayOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
      
      setStats({
        totalOrders: allOrders.length,
        pendingOrders: pending,
        todayRevenue: revenue
      });
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching orders:', error);
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
          <h1>🏪 Restaurant Dashboard</h1>
          <p>Welcome, {user?.name}!</p>
        </div>
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </header>

      <div className="dashboard-container">
        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📦</div>
            <div className="stat-info">
              <h3>{stats.totalOrders}</h3>
              <p>Total Orders</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">⏳</div>
            <div className="stat-info">
              <h3>{stats.pendingOrders}</h3>
              <p>Pending Orders</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">💰</div>
            <div className="stat-info">
              <h3>${stats.todayRevenue.toFixed(2)}</h3>
              <p>Today's Revenue</p>
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="dashboard-section">
          <h2>Recent Orders</h2>
          
          {orders.length === 0 ? (
            <p className="no-data">No orders yet</p>
          ) : (
            <div className="orders-table">
              {orders.slice(0, 10).map(order => (
                <div key={order.orderId} className="order-row">
                  <div className="order-info">
                    <strong>Order #{order.orderId.slice(0, 8)}</strong>
                    <p>{order.restaurantName}</p>
                  </div>
                  <div className="order-details">
                    <span className={`status-badge ${order.status}`}>
                      {order.status}
                    </span>
                    <strong>${order.totalAmount}</strong>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="dashboard-section">
          <h2>Quick Actions</h2>
          <div className="action-buttons">
            <button className="action-btn" onClick={() => alert('Coming soon: Manage Menu')}>
              🍽️ Manage Menu
            </button>
            <button className="action-btn" onClick={() => alert('Coming soon: View Analytics')}>
              📊 View Analytics
            </button>
            <button className="action-btn" onClick={() => alert('Coming soon: Restaurant Settings')}>
              ⚙️ Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RestaurantDashboard;