import React, { useState } from 'react';
import './App.css';

const API_BASE_URL = 'https://sentimentizer-backend.onrender.com';

function App() {
  // input text
  const [inputText, setInputText] = useState('');
  // prediction result
  const [prediction, setPrediction] = useState(null);
  // error messages
  const [error, setError] = useState('');
  // tracks if the api call is loading
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setPrediction(null);
    setLoading(true);

    try {
      // sends a post request to the backend api
      const response = await fetch(`${API_BASE_URL}/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: inputText }), // sends the input text as json
      });

      // checks the response
      if (!response.ok) {
        throw new Error(`api error: ${response.status} ${response.statusText}`);
      }

      // parses the json response from the api
      const data = await response.json();
      // sets the prediction state with the received data
      setPrediction(data);
    } catch (err) {
      console.error('error during prediction:', err);
      setError(err.message || 'an error occurred during prediction.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>NLP sentiment classifier</h1>
        <form onSubmit={handleSubmit}>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="enter text to analyze..."
            rows="4"
            cols="50"
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? 'analyzing...' : 'Predict Sentiment!'}
          </button>
        </form>

        {prediction && (
          <div className="result">
            <h3>Prediction:</h3>
            <p><strong>Label:</strong> {prediction.label}</p>
            <p><strong>Confidence:</strong> {(prediction.score * 100).toFixed(2)}%</p>
          </div>
        )}

        {error && (
          <div className="error">
            <h3>error:</h3>
            <p>{error}</p>
          </div>
        )}
      </header>
    </div>
  );
}

export default App;