import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getRestaurantId, getRestaurantName } from '../config/restaurantMapping';
import axios from 'axios';

const API_BASE_URL = 'https://zdyiz75g5a.execute-api.us-east-2.amazonaws.com/dev';

function AddMenuItem() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const myRestaurantId = getRestaurantId(user?.email);
  const myRestaurantName = getRestaurantName(myRestaurantId);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Main Course'
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [allergenInfo, setAllergenInfo] = useState(null);
  const [detectingAllergens, setDetectingAllergens] = useState(false);

  const categories = [
    'Main Course',
    'Appetizer',
    'Dessert',
    'Beverage',
    'Side Dish'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Compress image helper function
  const compressImage = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          // Resize if image is too large
          const maxWidth = 1200;
          const maxHeight = 1200;
          
          if (width > maxWidth || height > maxHeight) {
            if (width > height) {
              height = (height / width) * maxWidth;
              width = maxWidth;
            } else {
              width = (width / height) * maxHeight;
              height = maxHeight;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          // Compress to JPEG with 0.7 quality
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
          resolve(compressedBase64);
        };
        
        img.onerror = reject;
      };
      
      reader.onerror = reject;
    });
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        // Compress image first
        const compressedBase64 = await compressImage(file);
        
        setImageFile(file);
        setImagePreview(compressedBase64);
        
        // Detect allergens automatically
        setDetectingAllergens(true);
        setAllergenInfo(null);
        
        // Upload to S3
        const uploadResponse = await axios.post(`${API_BASE_URL}/upload-image`, {
          imageData: compressedBase64,
          fileName: file.name
        });
        
        const imageUrl = uploadResponse.data.imageUrl;
        
        // Detect allergens
        const allergenResponse = await axios.post(`${API_BASE_URL}/detect-allergens`, {
          imageUrl: imageUrl
        });
        
        setAllergenInfo(allergenResponse.data);
        setDetectingAllergens(false);
        
      } catch (err) {
        console.error('Error processing image:', err);
        setError('Image too large or failed to process. Please try a smaller image.');
        setDetectingAllergens(false);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let imageUrl = '';

      // Step 1: Upload image to S3 if provided (use compressed version)
      if (imagePreview) {
        const uploadResponse = await axios.post(`${API_BASE_URL}/upload-image`, {
          imageData: imagePreview,
          fileName: imageFile.name
        });

        imageUrl = uploadResponse.data.imageUrl;
      }

      // Step 2: Add menu item to DynamoDB
      const menuItemId = `menu-${Date.now()}`;

      const menuItemData = {
        menuItemId,
        restaurantId: myRestaurantId,
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        category: formData.category,
        imageUrl: imageUrl
      };

      const response = await axios.post(`${API_BASE_URL}/menu-item`, menuItemData);

      if (response.data) {
        alert('Menu item added successfully!');
        navigate('/');
      } else {
        throw new Error('Failed to add menu item');
      }
      
    } catch (err) {
      console.error('Error adding menu item:', err);
      setError('Failed to add menu item. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/');
  };

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <h1>🍽️ Add Menu Item</h1>
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

            {/* Image Upload */}
            <div className="form-group">
              <label>Item Photo</label>
              <div className="image-upload-container">
                {imagePreview ? (
                  <div className="image-preview">
                    <img src={imagePreview} alt="Preview" />
                    <button 
                      type="button" 
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview(null);
                        setAllergenInfo(null);
                      }}
                      className="remove-image-btn"
                    >
                      ✕ Remove
                    </button>
                    
                    {/* Allergen Detection Results */}
                    {detectingAllergens && (
                      <div className="allergen-detecting">
                        <div className="spinner">🔍</div>
                        <p>Analyzing food for allergens...</p>
                      </div>
                    )}
                    
                    {allergenInfo && (
                      <div className="allergen-results">
                        <h4>🤖 AI Analysis Complete</h4>
                        
                        {/* Dietary Badges */}
                        <div className="dietary-badges">
                          {allergenInfo.dietaryInfo.vegan && (
                            <span className="badge badge-vegan">🌱 Vegan</span>
                          )}
                          {allergenInfo.dietaryInfo.vegetarian && !allergenInfo.dietaryInfo.vegan && (
                            <span className="badge badge-vegetarian">🥗 Vegetarian</span>
                          )}
                          {allergenInfo.dietaryInfo.glutenFree && (
                            <span className="badge badge-gluten-free">🌾 Gluten-Free</span>
                          )}
                        </div>
                        
                        {/* Allergen Warnings */}
                        {allergenInfo.hasAllergens ? (
                          <div className="allergen-warning">
                            <h5>⚠️ Detected Allergens:</h5>
                            <div className="allergen-chips">
                              {allergenInfo.allergens.map((allergen, index) => (
                                <span key={index} className="allergen-chip">
                                  {allergen}
                                </span>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="allergen-safe">
                            <p>✅ No common allergens detected</p>
                          </div>
                        )}
                        
                        {/* Safety Score */}
                        <div className="safety-score">
                          <span>Safety Score: </span>
                          <strong className={allergenInfo.safetyScore >= 8 ? 'score-high' : 'score-medium'}>
                            {allergenInfo.safetyScore}/10
                          </strong>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="image-upload-placeholder">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      id="image-upload"
                      style={{ display: 'none' }}
                    />
                    <label htmlFor="image-upload" className="upload-label">
                      <div className="upload-icon">📸</div>
                      <p>Click to upload image</p>
                      <small>PNG, JPG up to 5MB</small>
                    </label>
                  </div>
                )}
              </div>
            </div>

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
                {loading ? 'Adding...' : 'Add Menu Item'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddMenuItem;