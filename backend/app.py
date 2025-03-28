from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import numpy as np
import pandas as pd
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:8080", "http://127.0.0.1:8080"],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type"]
    }
})

# Load the trained model and preprocessing pipeline
model_path = os.path.join('models', 'housing_model.pkl')
pipeline = None

def load_model():
    global pipeline
    try:
        with open(model_path, 'rb') as f:
            pipeline = pickle.load(f)
        print("Model loaded successfully!")
        return True
    except Exception as e:
        print(f"Error loading model: {e}")
        return False

# Try to load the model if it exists
if os.path.exists(model_path):
    load_model()

@app.route('/api/predict', methods=['POST', 'OPTIONS'])
def predict():
    if request.method == 'OPTIONS':
        return _build_cors_preflight_response()
    
    global pipeline
    
    if pipeline is None:
        if not load_model():
            return jsonify({"error": "Model not available. Please train the model first."}), 503
    
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data received"}), 400

        print("Received data:", data)

        # Create input DataFrame matching training structure
        input_data = pd.DataFrame([{
            'bedrooms': data.get('bedrooms', 0),
            'bathrooms': data.get('bathrooms', 0),
            'squareFootage': data.get('squareFootage', 0),
            'yearBuilt': data.get('yearBuilt', 0),
            'neighborhood': data.get('neighborhood', ''),
            'lotSize': data.get('lotSize', 0),
            'garage': data.get('garage', 0),
            'propertyType': data.get('propertyType', 'h'),  # Default to house
            'basement': 1 if data.get('basement', False) else 0,
            'centralAir': 1 if data.get('centralAir', False) else 0,
            'kitchenQuality': data.get('kitchenQuality', 1)
        }])

        # Make prediction using the full pipeline
        prediction = pipeline.predict(input_data)[0]
        
        return _corsify_actual_response(jsonify({
            "prediction": float(prediction),
            "status": "success"
        }))
        
    except Exception as e:
        print(f"Prediction error: {str(e)}")
        return jsonify({
            "error": str(e),
            "status": "error"
        }), 400

@app.route('/api/neighborhoods', methods=['GET'])
def get_neighborhoods():
    try:
        # First check if file exists
        if not os.path.exists('models/neighborhoods.pkl'):
            return jsonify({
                "status": "error",
                "message": "Neighborhood data not found"
            }), 404

        # Then try to load it
        with open('models/neighborhoods.pkl', 'rb') as f:
            neighborhoods = pickle.load(f)
            
        # Convert numpy array to list if needed
        if hasattr(neighborhoods, 'tolist'):
            neighborhoods = neighborhoods.tolist()
            
        return jsonify({
            "status": "success",
            "neighborhoods": neighborhoods
        })
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

def _build_cors_preflight_response():
    response = jsonify({"success": True})
    response.headers.add("Access-Control-Allow-Origin", "*")
    response.headers.add("Access-Control-Allow-Headers", "*")
    response.headers.add("Access-Control-Allow-Methods", "*")
    return response

def _corsify_actual_response(response):
    response.headers.add("Access-Control-Allow-Origin", "*")
    return response

@app.route('/api/model/status', methods=['GET'])
def model_status():
    global pipeline
    return jsonify({
        "trained": pipeline is not None,
        "status": "success"
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)