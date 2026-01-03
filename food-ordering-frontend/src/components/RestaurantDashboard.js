import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getRestaurantId, getRestaurantName } from '../config/restaurantMapping';
import axios from 'axios';

const API_BASE_URL = 'https://zdyiz75g5a.execute-api.us-east-2.amazonaws.com/dev';

function RestaurantDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [myRestaurant, setMyRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    todayRevenue: 0
  });

  // Get this user's restaurant ID
  const myRestaurantId = getRestaurantId(user?.email);
  const myRestaurantName = getRestaurantName(myRestaurantId);

  useEffect(() => {
    if (myRestaurantId) {
      fetchRestaurantData();
    }
  }, [myRestaurantId]);

  const fetchRestaurantData = async () => {
  try {
    setLoading(true);
    
    // Fetch restaurant details
    const restaurantsRes = await axios.get(`${API_BASE_URL}/restaurants`);
    const allRestaurants = restaurantsRes.data.restaurants || [];
    const myRest = allRestaurants.find(r => r.restaurantId === myRestaurantId);
    setMyRestaurant(myRest);

    // Fetch menu items for this restaurant
    const menuRes = await axios.get(`${API_BASE_URL}/menu?restaurantId=${myRestaurantId}`);
    setMenuItems(menuRes.data.menuItems || []);

    // Fetch ALL orders and filter for this restaurant
    try {
      const ordersRes = await axios.get(`${API_BASE_URL}/orders?customerId=all`);
      const allOrders = ordersRes.data.orders || [];
      
      console.log('All orders fetched:', allOrders.length);
      
      // Filter orders for this restaurant
      const myOrders = allOrders.filter(order => {
        // Check if order.restaurantId matches OR any item.restaurantId matches
        return order.restaurantId === myRestaurantId ||
               order.items?.some(item => item.restaurantId === myRestaurantId);
      });
      
      console.log('Filtered orders for', myRestaurantName, ':', myOrders.length);
      
      setOrders(myOrders);
      
      // Calculate stats
      const pending = myOrders.filter(o => o.status === 'pending').length;
      const today = new Date().toISOString().split('T')[0];
      const todayOrders = myOrders.filter(o => o.orderDate?.startsWith(today));
      const revenue = todayOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
      
      setStats({
        totalOrders: myOrders.length,
        pendingOrders: pending,
        todayRevenue: revenue
      });
    } catch (orderError) {
      console.error('Error fetching orders:', orderError);
      // Don't fail if orders don't load
      setOrders([]);
    }

    setLoading(false);
  } catch (error) {
    console.error('Error fetching restaurant data:', error);
    setLoading(false);
  }
};

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleAddMenuItem = () => {
    navigate('/restaurant/add-menu-item');
  };

  const handleEditMenuItem = (itemId) => {
    navigate(`/restaurant/edit-menu-item/${itemId}`);
  };

  const handleDeleteMenuItem = async (itemId, itemName) => {
  if (window.confirm(`Are you sure you want to delete "${itemName}"?`)) {
    try {
      await axios.delete(`${API_BASE_URL}/menu-item/${itemId}`);
      
      // Remove from state
      setMenuItems(prevItems => prevItems.filter(item => item.menuItemId !== itemId));
      
      alert('Menu item deleted successfully!');
    } catch (err) {
      console.error('Error deleting menu item:', err);
      alert('Failed to delete menu item. Please try again.');
    }
  }
};
const handleUpdateOrderStatus = async (orderId, newStatus) => {
  try {
    await axios.put(`${API_BASE_URL}/orders/status`, {
      orderId: orderId,
      status: newStatus
    });
    
    // Update local state
    setOrders(prevOrders => 
      prevOrders.map(order => 
        order.orderId === orderId 
          ? { ...order, status: newStatus }
          : order
      )
    );
    
    alert(`Order status updated to ${newStatus}`);
  } catch (err) {
    console.error('Error updating order status:', err);
    alert('Failed to update order status');
  }
};

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!myRestaurantId) {
    return (
      <div className="dashboard-page">
        <header className="dashboard-header">
          <h1>⚠️ Account Not Linked</h1>
        </header>
        <div className="dashboard-container">
          <div className="error-message" style={{ textAlign: 'center', padding: '2rem' }}>
            <p>Your account is not linked to any restaurant.</p>
            <p>Please contact support.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <h1>🏪 {myRestaurantName}</h1>
          <p>Welcome, {user?.name}!</p>
          {myRestaurant && (
            <p style={{ fontSize: '0.9rem', opacity: 0.9 }}>
              {myRestaurant.cuisine} • ⭐ {myRestaurant.rating}
            </p>
          )}
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

          <div className="stat-card">
            <div className="stat-icon">🍽️</div>
            <div className="stat-info">
              <h3>{menuItems.length}</h3>
              <p>Menu Items</p>
            </div>
          </div>
        </div>

        {/* Menu Items Section */}
        <div className="dashboard-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2>Menu Items</h2>
            <button 
              className="add-menu-btn"
              onClick={handleAddMenuItem}
            >
              + Add Menu Item
            </button>
          </div>

          {menuItems.length === 0 ? (
            <p className="no-data">No menu items yet. Add your first item!</p>
          ) : (
            <div className="menu-items-grid">
              {menuItems.map(item => (
                <div key={item.menuItemId} className="menu-item-card-dashboard">
                  {item.imageUrl && (
                    <img src={item.imageUrl} alt={item.name} />
                  )}
                  <div className="menu-item-info">
                    <h3>{item.name}</h3>
                    <p>{item.description}</p>
                    <p className="item-category">{item.category}</p>
                    <p className="item-price">${item.price}</p>
                    <div className="item-actions">
                      <button 
  className="edit-btn"
  onClick={() => handleEditMenuItem(item.menuItemId)}
>
  Edit
</button>
                      <button 
  className="delete-btn"
  onClick={() => handleDeleteMenuItem(item.menuItemId, item.name)}
>
  Delete
</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
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
            <strong>Order #{order.orderId.slice(-8)}</strong>
            <p>Customer: {order.customerEmail}</p>
            <p className="order-date">
              {new Date(order.orderDate).toLocaleString()}
            </p>
            {/* Order Items */}
            <div className="order-items-list">
              {(order.items || []).map((item, idx) => (
                <p key={idx} className="order-item-detail">
                  {item.quantity}x {item.name}
                </p>
              ))}
            </div>
          </div>
          <div className="order-actions">
            <div className="order-total">
              <strong>${order.totalAmount?.toFixed(2)}</strong>
            </div>
            
            {/* Status Dropdown */}
            <select
              value={order.status}
              onChange={(e) => handleUpdateOrderStatus(order.orderId, e.target.value)}
              className={`status-select ${order.status}`}
            >
              <option value="pending">⏳ Pending</option>
              <option value="confirmed">✅ Confirmed</option>
              <option value="preparing">👨‍🍳 Preparing</option>
              <option value="ready">🎉 Ready</option>
              <option value="completed">✔️ Completed</option>
              <option value="cancelled">❌ Cancelled</option>
            </select>
          </div>
        </div>
      ))}
    </div>
  )}
</div>
      </div>
    </div>
  );
}

export default RestaurantDashboard;