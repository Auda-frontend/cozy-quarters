
from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import numpy as np
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Load the trained model
model_path = os.path.join('models', 'housing_model.pkl')
scaler_path = os.path.join('models', 'scaler.pkl')

# Initialize model to None (it will be loaded once available)
model = None
scaler = None

def load_model():
    global model, scaler
    try:
        with open(model_path, 'rb') as f:
            model = pickle.load(f)
        with open(scaler_path, 'rb') as f:
            scaler = pickle.load(f)
        print("Model loaded successfully!")
        return True
    except Exception as e:
        print(f"Error loading model: {e}")
        return False

# Try to load the model if it exists
if os.path.exists(model_path) and os.path.exists(scaler_path):
    load_model()

@app.route('/api/predict', methods=['POST'])
def predict():
    global model, scaler
    
    if model is None:
        if not load_model():
            return jsonify({"error": "Model not trained yet. Please run the training script first."}), 400
    
    try:
        # Get data from request
        data = request.json
        
        # Create a numpy array with the features in the correct order (same as training)
        # These should match the features used in training
        features = np.array([[
            data['squareFootage'],
            data['bedrooms'], 
            data['bathrooms'],
            data['yearBuilt'],
            # One-hot encode neighborhood (assuming 10 neighborhoods from your frontend)
            1 if data['neighborhood'] == 'Downtown' else 0,
            1 if data['neighborhood'] == 'Suburban Heights' else 0,
            1 if data['neighborhood'] == 'Riverside' else 0,
            1 if data['neighborhood'] == 'West End' else 0,
            1 if data['neighborhood'] == 'North Hills' else 0,
            1 if data['neighborhood'] == 'Oak Park' else 0,
            1 if data['neighborhood'] == 'Maplewood' else 0,
            1 if data['neighborhood'] == 'Cedar Ridge' else 0,
            1 if data['neighborhood'] == 'Brookside' else 0,
            1 if data['neighborhood'] == 'Highland Park' else 0,
            data['lotSize'],
            data['garage'],
            1 if data['basement'] else 0,
            1 if data['centralAir'] else 0,
            data['kitchenQuality']
        ]])
        
        # Scale the features
        features_scaled = scaler.transform(features)
        
        # Make prediction
        prediction = model.predict(features_scaled)[0]
        
        # Return prediction
        return jsonify({
            "prediction": float(prediction),
            "modelInfo": {
                "trained": True,
                "accuracy": 0.85  # Placeholder - should come from actual model evaluation
            }
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/api/model/status', methods=['GET'])
def model_status():
    global model
    return jsonify({
        "trained": model is not None,
        "modelPath": model_path if os.path.exists(model_path) else None
    })

if __name__ == '__main__':
    app.run(debug=True)
