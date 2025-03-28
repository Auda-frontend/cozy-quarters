
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_squared_error, r2_score
import pickle
import os
from sklearn.preprocessing import StandardScaler
from sklearn.impute import SimpleImputer
import kaggle
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def train_model(dataset_name="dansbecker/melbourne-housing-snapshot", data_path="data"):
    print("Starting model training process...")
    
    # Create directories if they don't exist
    os.makedirs('models', exist_ok=True)
    os.makedirs(data_path, exist_ok=True)
    
    # Download dataset from Kaggle if API key is available
    kaggle_api_available = os.path.exists(os.path.expanduser('~/.kaggle/kaggle.json'))
    
    if kaggle_api_available:
        try:
            print(f"Downloading dataset '{dataset_name}' from Kaggle...")
            kaggle.api.dataset_download_files(dataset_name, path=data_path, unzip=True)
            print("Dataset downloaded successfully!")
            
            # Find CSV file in the downloaded data
            csv_files = [f for f in os.listdir(data_path) if f.endswith('.csv')]
            if csv_files:
                data_file_path = os.path.join(data_path, csv_files[0])
            else:
                print("No CSV file found in the downloaded dataset")
                return False
                
        except Exception as e:
            print(f"Error downloading dataset from Kaggle: {e}")
            print("Please make sure your Kaggle API key is set up correctly")
            return False
    else:
        # Use a predefined data file path if Kaggle API is not set up
        data_file_path = os.path.join(data_path, "melb_data.csv")
        if not os.path.exists(data_file_path):
            print("Kaggle API key not found and no local dataset available.")
            print("Please place your dataset at:", data_file_path)
            print("Or set up Kaggle API credentials in ~/.kaggle/kaggle.json")
            return False
    
    # Load the dataset
    print(f"Loading data from {data_file_path}...")
    data = pd.read_csv(data_file_path)
    
    print("Sample of loaded housing data:")
    print(data.head())
    print(f"Dataset shape: {data.shape}")
    
    # Data preparation - adapt based on the actual dataset structure
    try:
        # Rename columns to match our frontend if needed
        # Example: data.rename(columns={'Price': 'SalePrice', 'Rooms': 'Bedrooms'}, inplace=True)
        
        # 1. Handle missing values
        print("Handling missing values...")
        missing_values = data.isnull().sum()
        print(f"Columns with missing values:\n{missing_values[missing_values > 0]}")
        
        # For numeric columns, fill missing values with median
        numeric_cols = data.select_dtypes(include=['number']).columns
        imputer = SimpleImputer(strategy='median')
        data[numeric_cols] = imputer.fit_transform(data[numeric_cols])
        
        # For categorical columns, fill with most frequent value
        cat_cols = data.select_dtypes(include=['object']).columns
        if len(cat_cols) > 0:
            cat_imputer = SimpleImputer(strategy='most_frequent')
            data[cat_cols] = cat_imputer.fit_transform(data[cat_cols])
        
        # 2. Convert categorical variables to numeric
        print("Converting categorical variables...")
        data = pd.get_dummies(data, drop_first=True)
        
        # 3. Define target variable and features
        # Adjust these based on your actual dataset column names
        # For Melbourne housing dataset:
        if 'Price' in data.columns:
            y = data['Price']
            X = data.drop('Price', axis=1)
        elif 'SalePrice' in data.columns:
            y = data['SalePrice']
            X = data.drop('SalePrice', axis=1)
        else:
            # Find a column that could be the price (looking for columns with 'price' in name)
            price_cols = [col for col in data.columns if 'price' in col.lower()]
            if price_cols:
                y = data[price_cols[0]]
                X = data.drop(price_cols[0], axis=1)
            else:
                print("Could not identify price column. Please specify the correct column name.")
                return False
        
        print(f"Target variable: {y.name}")
        print(f"Number of features: {X.shape[1]}")
        
        # Split the data
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        
        # Feature scaling
        print("Scaling features...")
        scaler = StandardScaler()
        X_train_scaled = scaler.fit_transform(X_train)
        X_test_scaled = scaler.transform(X_test)
        
        # Train a Random Forest model
        print("Training Random Forest model...")
        model = RandomForestRegressor(n_estimators=100, random_state=42)
        model.fit(X_train_scaled, y_train)
        
        # Evaluate the model
        y_pred = model.predict(X_test_scaled)
        rmse = np.sqrt(mean_squared_error(y_test, y_pred))
        r2 = r2_score(y_test, y_pred)
        
        print(f"Model RMSE: ${rmse:.2f}")
        print(f"Model R² Score: {r2:.4f}")
        
        # Calculate feature importance
        importance = model.feature_importances_
        features = X.columns
        feature_importances = pd.DataFrame({'feature': features, 'importance': importance})
        feature_importances = feature_importances.sort_values('importance', ascending=False)
        print("\nTop 10 important features:")
        print(feature_importances.head(10))
        
        # Save the model
        with open('models/housing_model.pkl', 'wb') as f:
            pickle.dump(model, f)
        
        # Save the scaler
        with open('models/scaler.pkl', 'wb') as f:
            pickle.dump(scaler, f)
        
        # Save feature importances for frontend display
        feature_importances.head(10).to_csv('models/feature_importances.csv', index=False)
        
        print("\nModel and scaling information saved successfully.")
        return True
        
    except Exception as e:
        print(f"Error during model training: {e}")
        return False

if __name__ == "__main__":
    success = train_model()
    if success:
        print("Model training completed successfully!")
    else:
        print("Model training failed. Please check the error messages above.")
