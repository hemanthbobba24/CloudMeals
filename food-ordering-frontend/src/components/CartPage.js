import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {useAuth} from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import axios from 'axios';
const API_BASE_URL = 'https://zdyiz75g5a.execute-api.us-east-2.amazonaws.com/dev';

function CartPage() {
  const navigate = useNavigate();
  const { 
    cartItems, 
    restaurantInfo, 
    updateQuantity, 
    removeFromCart, 
    getCartTotal, 
    clearCart 
  } = useCart();
  const {user} = useAuth();
  const [loading, setLoading] = useState(false)
  const handlePlaceOrder = async () => {
  try {
    setLoading(true);
    
    // Fetch all restaurants to get names
    const restaurantsRes = await axios.get(`${API_BASE_URL}/restaurants`);
    const allRestaurants = restaurantsRes.data.restaurants || [];
    
    console.log('🏪 All restaurants:', allRestaurants);
    
    // Group items by restaurant
    const restaurantGroups = {};
    cartItems.forEach(item => {
      const restId = item.restaurantId;
      if (!restaurantGroups[restId]) {
        // Find restaurant name
        const restaurant = allRestaurants.find(r => r.restaurantId === restId);
        
        console.log(`🔍 Looking for restaurant ${restId}, found:`, restaurant);
        
        restaurantGroups[restId] = {
          restaurantId: restId,
          restaurantName: restaurant ? restaurant.name : 'Unknown Restaurant',
          items: []
        };
      }
      restaurantGroups[restId].items.push({
        menuItemId: item.menuItemId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        restaurantId: item.restaurantId
      });
    });
    
    console.log('📦 Restaurant groups:', restaurantGroups);
    
    // Create order for each restaurant
    for (const restId in restaurantGroups) {
      const group = restaurantGroups[restId];
      const restaurantTotal = group.items.reduce((sum, item) => 
        sum + (item.price * item.quantity), 0
      );
      
      const orderData = {
        customerId: user.email,
        restaurantId: group.restaurantId,
        restaurantName: group.restaurantName,  // ✅ THIS WAS MISSING!
        orderItems: group.items,
        totalAmount: restaurantTotal
      };
      
      console.log('📦 Sending order:', JSON.stringify(orderData, null, 2));
      
      const response = await axios.post(`${API_BASE_URL}/orders`, orderData);
      
      console.log('✅ Order created:', response.data);
    }
    
    alert('Order placed successfully!');
    clearCart();
    navigate('/orders');
    
  } catch (error) {
    console.error('❌ Error placing order:', error);
    console.error('❌ Error response:', error.response?.data);
    alert('Failed to place order. Please try again.');
  } finally {
    setLoading(false);
  }
};

  if (cartItems.length === 0) {
    return (
      <div className="cart-page">
        <header className="header">
          <h1>🛒 Your Cart</h1>
          <p>Your cart is empty</p>
        </header>
        <div className="container">
          <div className="empty-cart">
            <p>No items in cart</p>
            <button className="continue-shopping-btn" onClick={() => navigate('/')}>
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <header className="header">
        <button onClick={() => navigate(-1)} className="back-btn">
          ← Back
        </button>
        <h1>🛒 Your Cart</h1>
        <p>{restaurantInfo?.name || 'Review your order'}</p>
      </header>

      <div className="container">
        <div className="cart-content">
          <div className="cart-items">
            {cartItems.map((item) => (
              <div key={item.menuItemId} className="cart-item">
                <div className="cart-item-info">
                  <h3>{item.name}</h3>
                  <p className="cart-item-price">${item.price.toFixed(2)} each</p>
                </div>
                
                <div className="cart-item-controls">
                  <div className="quantity-controls">
                    <button 
                      onClick={() => updateQuantity(item.menuItemId, item.quantity - 1)}
                      className="quantity-btn"
                    >
                      −
                    </button>
                    <span className="quantity">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.menuItemId, item.quantity + 1)}
                      className="quantity-btn"
                    >
                      +
                    </button>
                  </div>
                  
                  <div className="cart-item-total">
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>
                  
                  <button 
                    onClick={() => removeFromCart(item.menuItemId)}
                    className="remove-btn"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <h2>Order Summary</h2>
            <div className="summary-row">
              <span>Subtotal:</span>
              <span>${getCartTotal().toFixed(2)}</span>
            </div>
            <div className="summary-row total">
              <span>Total:</span>
              <span>${getCartTotal().toFixed(2)}</span>
            </div>
            <button className="place-order-btn" onClick={handlePlaceOrder}>
              Place Order
            </button>
            <button className="clear-cart-btn" onClick={clearCart}>
              Clear Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CartPage;