import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';


const API_BASE_URL = 'https://zdyiz75g5a.execute-api.us-east-2.amazonaws.com/dev';

function SearchByPhoto() {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResults(null);
      setError(null);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) {
      alert('Please select an image first!');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Step 1: Convert image to base64
      const reader = new FileReader();
      reader.readAsDataURL(selectedFile);
      
      reader.onload = async () => {
        try {
          const base64Image = reader.result;
          
          // Step 2: Upload to S3
          console.log('Uploading image to S3...');
          console.log('Upload URL:', `${API_BASE_URL}/upload-image`);
          
          const uploadResponse = await axios.post(`${API_BASE_URL}/upload-image`, {
            imageData: base64Image,
            fileName: selectedFile.name
          });
          
          const imageUrl = uploadResponse.data.imageUrl;
          console.log('Image uploaded to:', imageUrl);
          
          // Step 3: Analyze with Rekognition
          console.log('Analyzing image with AI...');
          console.log('Recognition URL:', `${API_BASE_URL}/recognize-food`);
          console.log('With payload:', { imageUrl: imageUrl });
          
          const recognitionResponse = await axios.post(`${API_BASE_URL}/recognize-food`, {
            imageUrl: imageUrl
          });
          
          console.log('Analysis results:', recognitionResponse.data);
          setResults(recognitionResponse.data);
          setLoading(false);
        } catch (err) {
          console.error('Error details:', err);
          console.error('Error response:', err.response);
          setError('Failed to analyze image. Please try again.');
          setLoading(false);
        }
      };
      
      reader.onerror = () => {
        setError('Failed to read image file.');
        setLoading(false);
      };
      
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to process image. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="search-by-photo-page">
      <header className="header">
        <button onClick={() => navigate('/')} className="back-btn">
          ← Back to Restaurants
        </button>
        <h1>🔍 Search by Photo</h1>
        <p>Upload a food photo and find matching dishes</p>
      </header>

      <div className="container">
        <div className="upload-section">
          <div className="upload-card">
            <h2>Upload Food Photo</h2>
            
            <div className="file-input-wrapper">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="file-input"
                id="photo-upload"
              />
              <label htmlFor="photo-upload" className="upload-label">
                📸 Choose Photo
              </label>
            </div>

            {previewUrl && (
              <div className="preview-section">
                <img src={previewUrl} alt="Preview" className="preview-image" />
                <button 
                  onClick={handleAnalyze}
                  className="analyze-btn"
                  disabled={loading}
                >
                  {loading ? '🤖 Analyzing...' : '🔍 Analyze with AI'}
                </button>
              </div>
            )}

            {error && (
              <div className="error-message">{error}</div>
            )}
          </div>
        </div>

        {results && (
          <div className="results-section">
            <div className="detection-results">
              <h2>AI Detection Results</h2>
              <div className="top-detection">
                <span className="detection-label">Detected:</span>
                <span className="detection-value">{results.topDetection}</span>
                <span className="confidence">
                  {results.confidence}% confidence
                </span>
              </div>

              <div className="all-labels">
                <h3>All Detected Labels:</h3>
                <div className="label-chips">
                  {results.detectedLabels?.map((label, index) => (
                    <div key={index} className="label-chip">
                      {label.name} ({label.confidence}%)
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="matching-items-section">
              <h2>Matching Menu Items ({results.matchCount})</h2>
              
              {results.matchCount === 0 ? (
                <p className="no-matches">
                  No matching items found. Try browsing our restaurants!
                </p>
              ) : (
                <div className="matching-items-grid">
                  {results.matchingItems?.map((item) => (
                    <div key={item.menuItemId} className="match-card">
                      {item.imageUrl && (
                        <img 
                          src={item.imageUrl} 
                          alt={item.name}
                          className="match-image"
                        />
                      )}
                      <div className="match-info">
                        <h3>{item.name}</h3>
                        <p className="match-description">{item.description}</p>
                        <p className="match-category">{item.category}</p>
                        <div className="match-footer">
                          <span className="match-price">${item.price}</span>
                          <span className="match-keyword">
                            Matched: {item.matchedKeyword}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SearchByPhoto;