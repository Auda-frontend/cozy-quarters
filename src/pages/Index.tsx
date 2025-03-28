import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import HouseForm from '../components/HouseForm';
import PredictionResult from '../components/PredictionResult';
import FeatureImportance from '../components/FeatureImportance';
import { HouseData } from '../data/modelData';
import { checkModelStatus, predictPrice, predictPriceFromAPI } from '../utils/prediction';
import { toast } from "@/components/ui/use-toast";
import { ToastAction } from "@/components/ui/toast";

const Index: React.FC = () => {
  const [predictedPrice, setPredictedPrice] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [modelStatus, setModelStatus] = useState<{
    isAvailable: boolean | null;
    isLoading: boolean;
    error: string | null;
  }>({
    isAvailable: null,
    isLoading: true,
    error: null
  });

  // Check backend status on component mount
  useEffect(() => {
    const checkBackendStatus = async () => {
      try {
        const status = await checkModelStatus();
        setModelStatus({
          isAvailable: status.trained,
          isLoading: false,
          error: null
        });
        
        if (!status.trained) {
          toast({
            title: "Backend Model Not Ready",
            description: "Using simplified prediction model",
            variant: "default",
            action: (
              <ToastAction 
                altText="Learn more" 
                onClick={() => window.open('/docs/backend-setup', '_blank')}
              >
                Setup Guide
              </ToastAction>
            )
          });
        }
      } catch (error) {
        console.error("Failed to check model status:", error);
        setModelStatus({
          isAvailable: false,
          isLoading: false,
          error: "Failed to connect to backend"
        });
      }
    };

    checkBackendStatus();
  }, []);

  const handleFormSubmit = async (data: HouseData) => {
    setIsLoading(true);
    setPredictedPrice(null); // Reset previous prediction

    try {
      let price: number | null = null;
      let source = '';

      // Try API first if available
      if (modelStatus.isAvailable) {
        try {
          price = await predictPriceFromAPI(data);
          source = 'API';
        } catch (apiError) {
          console.warn("API prediction failed, falling back:", apiError);
        }
      }

      // Fallback to local prediction
      if (price === null) {
        price = predictPrice(data);
        source = 'fallback';
      }

      setPredictedPrice(price);
      
      // Show appropriate toast
      toast({
        title: source === 'API' ? "ML Model Prediction" : "Fallback Prediction",
        description: source === 'API' 
          ? "Prediction from trained machine learning model" 
          : "Using simplified calculation as fallback",
        variant: source === 'API' ? "default" : "destructive",
      });

      // Scroll to results on mobile
      scrollToResults();
    } catch (error) {
      console.error("Prediction failed:", error);
      toast({
        title: "Prediction Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToResults = () => {
    if (window.innerWidth < 768) {
      setTimeout(() => {
        document.getElementById('prediction-result')?.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest'
        });
      }, 100);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <div className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Header />
          
          {/* Status Alert */}
          {modelStatus.isLoading && (
            <div className="my-4 p-4 bg-blue-50 border-l-4 border-blue-500 text-blue-700">
              <p className="font-medium">Checking backend status...</p>
            </div>
          )}
          
          {modelStatus.error && (
            <div className="my-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
              <p className="font-medium">Backend Connection Error</p>
              <p className="text-sm">{modelStatus.error}</p>
            </div>
          )}
          
          {modelStatus.isAvailable === false && !modelStatus.isLoading && (
            <div className="my-4 p-4 bg-yellow-50 border-l-4 border-yellow-500 text-yellow-700">
              <p className="font-medium">Backend Model Unavailable</p>
              <p className="text-sm">Using simplified frontend prediction model</p>
            </div>
          )}

          {/* Main Content */}
          <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <HouseForm 
                onSubmit={handleFormSubmit} 
                isLoading={isLoading}
                isBackendReady={modelStatus.isAvailable === true}
              />
            </div>
            
            <div className="lg:col-span-1 space-y-8">
              <div id="prediction-result">
                <PredictionResult 
                  price={predictedPrice} 
                  isLoading={isLoading}
                  isUsingFallback={modelStatus.isAvailable === false}
                />
              </div>
              
              <FeatureImportance 
                isBackendAvailable={modelStatus.isAvailable === true}
              />
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Index;