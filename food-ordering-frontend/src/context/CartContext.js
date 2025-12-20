import React, { createContext, useState, useContext } from 'react';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [restaurantInfo, setRestaurantInfo] = useState(null);

  const addToCart = (item, restaurant) => {
    // If cart is empty or from same restaurant, add item
    if (!restaurantInfo || restaurantInfo.restaurantId === restaurant.restaurantId) {
      setRestaurantInfo(restaurant);
      
      // Check if item already in cart
      const existingItem = cartItems.find(
        (cartItem) => cartItem.menuItemId === item.menuItemId
      );

      if (existingItem) {
        // Increase quantity
        setCartItems(
          cartItems.map((cartItem) =>
            cartItem.menuItemId === item.menuItemId
              ? { ...cartItem, quantity: cartItem.quantity + 1 }
              : cartItem
          )
        );
      } else {
        // Add new item
        setCartItems([...cartItems, { ...item, quantity: 1 }]);
      }
    } else {
      // Different restaurant - ask to clear cart
      if (window.confirm('Your cart contains items from another restaurant. Clear cart?')) {
        setCartItems([{ ...item, quantity: 1 }]);
        setRestaurantInfo(restaurant);
      }
    }
  };

  const removeFromCart = (menuItemId) => {
    setCartItems(cartItems.filter((item) => item.menuItemId !== menuItemId));
    if (cartItems.length === 1) {
      setRestaurantInfo(null);
    }
  };

  const updateQuantity = (menuItemId, quantity) => {
    if (quantity === 0) {
      removeFromCart(menuItemId);
    } else {
      setCartItems(
        cartItems.map((item) =>
          item.menuItemId === menuItemId ? { ...item, quantity } : item
        )
      );
    }
  };

  const clearCart = () => {
    setCartItems([]);
    setRestaurantInfo(null);
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getCartCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        restaurantInfo,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};