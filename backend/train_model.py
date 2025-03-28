import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.impute import SimpleImputer
from sklearn.metrics import mean_squared_error
from sklearn.metrics import r2_score
import pickle

def train_model():
    # Load the dataset
    data = pd.read_csv('melb_data.csv')
    
    # Feature selection and renaming to match frontend
    features = data[[
        'Rooms',        # -> bedrooms
        'Bathroom',     # -> bathrooms
        'Landsize',     # -> lotSize
        'BuildingArea', # -> squareFootage
        'YearBuilt',    # -> yearBuilt
        'Suburb',       # -> neighborhood
        'Car',          # -> garage
        'Type'          # -> propertyType
    ]].copy()
    
    # Rename columns to match frontend
    features = features.rename(columns={
        'Rooms': 'bedrooms',
        'Bathroom': 'bathrooms',
        'Landsize': 'lotSize',
        'BuildingArea': 'squareFootage',
        'YearBuilt': 'yearBuilt',
        'Suburb': 'neighborhood',
        'Car': 'garage',
        'Type': 'propertyType'
    })
    
    # Target variable
    target = data['Price']
    
    # Handle missing values
    features['squareFootage'] = features['squareFootage'].fillna(features['squareFootage'].median())
    features['lotSize'] = features['lotSize'].fillna(features['lotSize'].median())
    features['garage'] = features['garage'].fillna(0)
    
    # Define preprocessing
    numeric_features = ['bedrooms', 'bathrooms', 'lotSize', 'squareFootage', 'yearBuilt', 'garage']
    categorical_features = ['neighborhood', 'propertyType']
    
    numeric_transformer = Pipeline(steps=[
        ('imputer', SimpleImputer(strategy='median')),
        ('scaler', StandardScaler())
    ])
    
    categorical_transformer = Pipeline(steps=[
        ('imputer', SimpleImputer(strategy='most_frequent')),
        ('onehot', OneHotEncoder(handle_unknown='ignore'))
    ])
    
    preprocessor = ColumnTransformer(
        transformers=[
            ('num', numeric_transformer, numeric_features),
            ('cat', categorical_transformer, categorical_features)
        ])
    
    # Create pipeline
    pipeline = Pipeline(steps=[
        ('preprocessor', preprocessor),
        ('regressor', RandomForestRegressor(n_estimators=100, random_state=42))
    ])
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        features, target, test_size=0.2, random_state=42
    )
    
    # Train model
    pipeline.fit(X_train, y_train)
    
    # Evaluate
    y_pred = pipeline.predict(X_test)
    rmse = np.sqrt(mean_squared_error(y_test, y_pred))
    r2 = r2_score(y_test, y_pred)
    print(f"RMSE: {rmse:.2f}")
    print(f"R²: {r2:.4f}")
    
    # Save the model
    with open('models/housing_model.pkl', 'wb') as f:
        pickle.dump(pipeline, f)
    
    # Save neighborhood list for frontend
    neighborhoods = features['neighborhood'].unique()
    with open('models/neighborhoods.pkl', 'wb') as f:
        pickle.dump(neighborhoods, f)
    
    # Save property types
    property_types = features['propertyType'].unique()
    with open('models/property_types.pkl', 'wb') as f:
        pickle.dump(property_types, f)

if __name__ == '__main__':
    train_model()