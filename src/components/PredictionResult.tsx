
import React, { useEffect, useRef } from 'react';
import { 
  Card, 
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle 
} from "@/components/ui/card";
import { formatPrice } from '../utils/prediction';

interface PredictionResultProps {
  price: number | null;
  isLoading?: boolean;
}

const PredictionResult: React.FC<PredictionResultProps> = ({ price, isLoading = false }) => {
  const prevPriceRef = useRef<number | null>(null);
  const priceDisplayRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (price !== null && price !== prevPriceRef.current && priceDisplayRef.current) {
      // Add animation class when price changes
      priceDisplayRef.current.classList.remove('animate-scale-in');
      void priceDisplayRef.current.offsetWidth; // Force reflow
      priceDisplayRef.current.classList.add('animate-scale-in');
      
      prevPriceRef.current = price;
    }
  }, [price]);
  
  if (price === null && !isLoading) return null;
  
  return (
    <Card className="glass-card w-full mt-8 overflow-hidden">
      <CardHeader className="bg-primary/5 border-b border-primary/10">
        <CardTitle className="text-2xl">Predicted Price</CardTitle>
        <CardDescription>
          Based on the provided house details
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6 pb-8">
        <div ref={priceDisplayRef} className="flex flex-col items-center justify-center">
          <div className="chip mb-3">Estimated Value</div>
          
          {isLoading ? (
            <div className="h-16 flex items-center justify-center">
              <div className="loader"></div>
            </div>
          ) : (
            <div className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary">
              {formatPrice(price!)}
            </div>
          )}
          
          <p className="mt-4 text-sm text-muted-foreground text-center max-w-md">
            This estimate is based on current market trends and comparable properties
            in the selected neighborhood.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PredictionResult;
