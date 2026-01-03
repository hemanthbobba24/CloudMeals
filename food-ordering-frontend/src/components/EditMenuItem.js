import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getRestaurantId, getRestaurantName } from '../config/restaurantMapping';
import axios from 'axios';

const API_BASE_URL = 'https://zdyiz75g5a.execute-api.us-east-2.amazonaws.com/dev';

function EditMenuItem() {
  const navigate = useNavigate();
  const { menuItemId } = useParams();
  const { user } = useAuth();
  const myRestaurantId = getRestaurantId(user?.email);
  const myRestaurantName = getRestaurantName(myRestaurantId);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Main Course',
    imageUrl: ''
  });
  const [loading, setLoading] = useState(false);
  const [loadingItem, setLoadingItem] = useState(true);
  const [error, setError] = useState('');

  const categories = [
    'Main Course',
    'Appetizer',
    'Dessert',
    'Beverage',
    'Side Dish'
  ];

  useEffect(() => {
    fetchMenuItem();
  }, [menuItemId]);

  const fetchMenuItem = async () => {
    try {
      // Fetch all menu items and find the one we need
      const response = await axios.get(`${API_BASE_URL}/menu?restaurantId=${myRestaurantId}`);
      const items = response.data.menuItems || [];
      const item = items.find(i => i.menuItemId === menuItemId);
      
      if (item) {
        setFormData({
          name: item.name,
          description: item.description,
          price: item.price.toString(),
          category: item.category,
          imageUrl: item.imageUrl || ''
        });
      } else {
        setError('Menu item not found');
      }
      
      setLoadingItem(false);
    } catch (err) {
      console.error('Error fetching menu item:', err);
      setError('Failed to load menu item');
      setLoadingItem(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const updateData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        category: formData.category,
        imageUrl: formData.imageUrl
      };

      await axios.put(`${API_BASE_URL}/menu-item/${menuItemId}`, updateData);

      alert('Menu item updated successfully!');
      navigate('/');
      
    } catch (err) {
      console.error('Error updating menu item:', err);
      setError('Failed to update menu item. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/');
  };

  if (loadingItem) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <h1>✏️ Edit Menu Item</h1>
          <p>{myRestaurantName}</p>
        </div>
        <button onClick={handleCancel} className="logout-btn">
          Cancel
        </button>
      </header>

      <div className="dashboard-container">
        <div className="form-container">
          <form onSubmit={handleSubmit} className="menu-item-form">
            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            {/* Current Image */}
            {formData.imageUrl && (
              <div className="form-group">
                <label>Current Image</label>
                <div className="current-image">
                  <img src={formData.imageUrl} alt={formData.name} />
                </div>
              </div>
            )}

            {/* Item Name */}
            <div className="form-group">
              <label>Item Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., Margherita Pizza"
                required
              />
            </div>

            {/* Description */}
            <div className="form-group">
              <label>Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe your dish..."
                rows="4"
                required
              />
            </div>

            {/* Price and Category */}
            <div className="form-row">
              <div className="form-group">
                <label>Price ($) *</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="9.99"
                  step="0.01"
                  min="0"
                  required
                />
              </div>

              <div className="form-group">
                <label>Category *</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="form-actions">
              <button 
                type="button" 
                onClick={handleCancel}
                className="cancel-btn"
                disabled={loading}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="submit-btn"
                disabled={loading}
              >
                {loading ? 'Updating...' : 'Update Menu Item'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default EditMenuItem;