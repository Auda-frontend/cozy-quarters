
import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import HouseForm from '../components/HouseForm';
import PredictionResult from '../components/PredictionResult';
import FeatureImportance from '../components/FeatureImportance';
import { HouseData } from '../data/modelData';
import { predictPrice, predictPriceFromAPI } from '../utils/prediction';
import { toast } from "@/components/ui/use-toast";

const Index: React.FC = () => {
  console.log("Index page rendering");
  
  const [predictedPrice, setPredictedPrice] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isModelAvailable, setIsModelAvailable] = useState<boolean | null>(null);

  // Check if backend model is available
  useEffect(() => {
    console.log("Checking model status...");
    const checkModelStatus = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/model/status');
        console.log("Model status response:", response);
        if (response.ok) {
          const data = await response.json();
          console.log("Model status data:", data);
          setIsModelAvailable(data.trained);
        } else {
          console.log("Model status error:", response.status);
          setIsModelAvailable(false);
        }
      } catch (error) {
        console.error("Error checking model status:", error);
        setIsModelAvailable(false);
      }
    };

    checkModelStatus();
  }, []);

  const handleFormSubmit = async (data: HouseData) => {
    console.log("Form submitted with data:", data);
    setIsLoading(true);
    
    try {
      // Try to get prediction from API first
      if (isModelAvailable) {
        console.log("Trying API prediction...");
        const apiPrice = await predictPriceFromAPI(data);
        if (apiPrice !== null) {
          console.log("API prediction successful:", apiPrice);
          setPredictedPrice(apiPrice);
          toast({
            title: "Backend ML Model Used",
            description: "Prediction made using the trained machine learning model",
          });
          setIsLoading(false);
          return;
        }
      }
      
      // Fall back to frontend prediction if API fails
      console.log("Using fallback prediction model");
      const fallbackPrice = predictPrice(data);
      console.log("Fallback prediction:", fallbackPrice);
      setPredictedPrice(fallbackPrice);
      
      toast({
        title: "Fallback Model Used",
        description: "Using simplified prediction model as backend is unavailable",
        variant: "destructive",
      });
    } catch (error) {
      console.error("Prediction error:", error);
      toast({
        title: "Prediction Error",
        description: "Could not get a prediction. Using fallback model.",
        variant: "destructive",
      });
      
      // Use fallback prediction
      const fallbackPrice = predictPrice(data);
      setPredictedPrice(fallbackPrice);
    } finally {
      setIsLoading(false);
      
      // Scroll to results if on mobile
      if (window.innerWidth < 768) {
        const resultElement = document.getElementById('prediction-result');
        if (resultElement) {
          setTimeout(() => {
            resultElement.scrollIntoView({ behavior: 'smooth' });
          }, 100);
        }
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Header />
          
          {isModelAvailable === false && (
            <div className="my-4 p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700">
              <p className="font-medium">Backend ML model is not available</p>
              <p className="text-sm">Using simplified frontend prediction model. See README in the backend folder for setup instructions.</p>
            </div>
          )}
          
          <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <HouseForm onSubmit={handleFormSubmit} isLoading={isLoading} />
            </div>
            
            <div className="lg:col-span-1 space-y-8">
              <div id="prediction-result">
                <PredictionResult price={predictedPrice} isLoading={isLoading} />
              </div>
              
              <FeatureImportance />
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Index;
