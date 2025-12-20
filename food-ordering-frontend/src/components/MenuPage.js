import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';

const API_BASE_URL = 'https://itsw9q2cyj.execute-api.us-east-2.amazonaws.com/dev';

function MenuPage() {
  const { restaurantId } = useParams();
  const navigate = useNavigate();
  const { addToCart, getCartCount } = useCart();
  
  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMenuItems();
  }, [restaurantId]);

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      
      // Fetch menu items
      const menuResponse = await axios.get(`${API_BASE_URL}/menu?restaurantId=${restaurantId}`);
      setMenuItems(menuResponse.data.menuItems);
      
      // Fetch restaurant details
      const restaurantsResponse = await axios.get(`${API_BASE_URL}/restaurants`);
      const restaurantData = restaurantsResponse.data.restaurants.find(
        (r) => r.restaurantId === restaurantId
      );
      setRestaurant(restaurantData);
      
      setLoading(false);
    } catch (err) {
      setError('Failed to load menu');
      setLoading(false);
      console.error('Error fetching menu:', err);
    }
  };

  const handleAddToCart = (item) => {
    if (restaurant) {
      addToCart(item, restaurant);
    }
  };

  if (loading) {
    return (
      <div className="menu-page">
        <div className="container">Loading menu...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="menu-page">
        <div className="container error">{error}</div>
      </div>
    );
  }

  return (
    <div className="menu-page">
      <header className="header">
        <button onClick={() => navigate('/')} className="back-btn">
          ← Back to Restaurants
        </button>
        <h1>{restaurant ? restaurant.name : 'Menu'}</h1>
        <p>Choose your items</p>
      </header>

      <div className="container">
        <div className="menu-grid">
          {menuItems.map((item) => (
            <div key={item.menuItemId} className="menu-item-card">
              <div className="menu-item-header">
                <h3>{item.name}</h3>
                <span className="price">${item.price}</span>
              </div>
              <p className="description">{item.description}</p>
              <p className="category">{item.category}</p>
              <button 
                className="add-to-cart-btn"
                onClick={() => handleAddToCart(item)}
              >
                Add to Cart
              </button>
            </div>
          ))}
        </div>
      </div>

      {getCartCount() > 0 && (
        <button 
          className="cart-button"
          onClick={() => navigate('/cart')}
        >
          🛒
          <span className="cart-count">{getCartCount()}</span>
        </button>
      )}
    </div>
  );
}

export default MenuPage;