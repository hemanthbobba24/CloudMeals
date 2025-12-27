import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const API_BASE_URL = 'https://itsw9q2cyj.execute-api.us-east-2.amazonaws.com/dev';

function MyOrdersPage() {
  const navigate = useNavigate();
  const { user } = useAuth(); 
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  useEffect(() => {
    fetchOrders();
    
    // Auto-refresh orders every 10 seconds
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/orders?customerId=${user.email}`);
      setOrders(response.data.orders || []);
      setLoading(false);
    } catch (err) {
      setError('Failed to load orders');
      setLoading(false);
      console.error('Error fetching orders:', err);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'pending': '#f39c12',
      'confirmed': '#3498db',
      'preparing': '#9b59b6',
      'out for delivery': '#1abc9c',
      'delivered': '#10b981',
      'cancelled': '#e74c3c'
    };
    return colors[status.toLowerCase()] || '#95a5a6';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading && orders.length === 0) {
    return (
      <div className="orders-page">
        <div className="container">Loading orders...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="orders-page">
        <div className="container error">{error}</div>
      </div>
    );
  }

  return (
    <div className="orders-page">
      <header className="header">
        <button onClick={() => navigate('/')} className="back-btn">
          ← Back to Restaurants
        </button>
        <h1>📦 My Orders</h1>
        <p>Track your orders</p>
      </header>

      <div className="container">
        {orders.length === 0 ? (
          <div className="empty-orders">
            <p>You haven't placed any orders yet</p>
            <button className="continue-shopping-btn" onClick={() => navigate('/')}>
              Start Ordering
            </button>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => (
              <div key={order.orderId} className="order-card">
                <div className="order-header">
                  <div className="order-info">
                    <h3>{order.restaurantName}</h3>
                    <p className="order-id">Order #{order.orderId}</p>
                    <p className="order-date">{formatDate(order.orderDate)}</p>
                  </div>
                  <div 
                    className="order-status"
                    style={{ backgroundColor: getStatusColor(order.status) }}
                  >
                    {order.status}
                  </div>
                </div>

                <div className="order-items">
                  <h4>Items:</h4>
                  {order.orderItems.map((item, index) => (
                    <div key={index} className="order-item">
                      <span className="item-name">
                        {item.quantity}x {item.name}
                      </span>
                      <span className="item-price">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="order-total">
                  <span>Total:</span>
                  <span className="total-amount">${order.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyOrdersPage;