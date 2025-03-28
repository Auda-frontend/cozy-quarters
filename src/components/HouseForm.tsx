import React, { useState } from 'react';
import { 
  Card, 
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle 
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { HouseData, defaultHouseData, neighborhoods } from '../data/modelData';

interface HouseFormProps {
  onSubmit: (data: HouseData) => void;
  isLoading?: boolean;
}

const HouseForm: React.FC<HouseFormProps> = ({ onSubmit, isLoading = false }) => {
  const [formData, setFormData] = useState<HouseData>({...defaultHouseData});

  const handleChange = (field: keyof HouseData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const currentYear = new Date().getFullYear();

  return (
    <Card className="glass-card w-full animate-scale-in">
      <CardHeader>
        <CardTitle className="text-2xl">House Details</CardTitle>
        <CardDescription>
          Enter the details of the property to get an estimated price
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="form-container">
            {/* Square Footage */}
            <div className="input-group">
              <Label htmlFor="squareFootage" className="input-label">Square Footage</Label>
              <Input
                id="squareFootage"
                type="number"
                value={formData.squareFootage}
                onChange={(e) => handleChange('squareFootage', Number(e.target.value))}
                min="500"
                max="10000"
                required
                className="transition-all-fast"
              />
            </div>
            
            {/* Bedrooms */}
            <div className="input-group">
              <Label htmlFor="bedrooms" className="input-label">Bedrooms</Label>
              <Input
                id="bedrooms"
                type="number"
                value={formData.bedrooms}
                onChange={(e) => handleChange('bedrooms', Number(e.target.value))}
                min="1"
                max="10"
                required
                className="transition-all-fast"
              />
            </div>
            
            {/* Bathrooms */}
            <div className="input-group">
              <Label htmlFor="bathrooms" className="input-label">Bathrooms</Label>
              <Input
                id="bathrooms"
                type="number"
                value={formData.bathrooms}
                onChange={(e) => handleChange('bathrooms', Number(e.target.value))}
                min="1"
                max="7"
                step="0.5"
                required
                className="transition-all-fast"
              />
            </div>
            
            {/* Year Built */}
            <div className="input-group">
              <Label htmlFor="yearBuilt" className="input-label">Year Built</Label>
              <Input
                id="yearBuilt"
                type="number"
                value={formData.yearBuilt}
                onChange={(e) => handleChange('yearBuilt', Number(e.target.value))}
                min="1900"
                max={currentYear}
                required
                className="transition-all-fast"
              />
            </div>
            
            {/* Neighborhood */}
            <div className="input-group">
              <Label htmlFor="neighborhood" className="input-label">Neighborhood</Label>
              <Select 
                value={formData.neighborhood}
                onValueChange={(value) => handleChange('neighborhood', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select neighborhood" />
                </SelectTrigger>
                <SelectContent>
                  {neighborhoods.map((neighborhood) => (
                    <SelectItem key={neighborhood} value={neighborhood}>
                      {neighborhood}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Lot Size */}
            <div className="input-group">
              <Label htmlFor="lotSize" className="input-label">
                Lot Size (acres): {formData.lotSize.toFixed(2)}
              </Label>
              <Slider
                id="lotSize"
                min={0.1}
                max={2}
                step={0.01}
                value={[formData.lotSize]}
                onValueChange={(value) => handleChange('lotSize', value[0])}
                className="py-4"
              />
            </div>
            
            {/* Garage */}
            <div className="input-group">
              <Label htmlFor="garage" className="input-label">Garage Spaces</Label>
              <Input
                id="garage"
                type="number"
                value={formData.garage}
                onChange={(e) => handleChange('garage', Number(e.target.value))}
                min="0"
                max="4"
                required
                className="transition-all-fast"
              />
            </div>
            
            {/* Kitchen Quality */}
            <div className="input-group">
              <Label htmlFor="kitchenQuality" className="input-label">
                Kitchen Quality: {formData.kitchenQuality}/5
              </Label>
              <Slider
                id="kitchenQuality"
                min={1}
                max={5}
                step={1}
                value={[formData.kitchenQuality]}
                onValueChange={(value) => handleChange('kitchenQuality', value[0])}
                className="py-4"
              />
            </div>
            
            {/* Basement */}
            <div className="input-group flex-row items-center space-y-0 space-x-2">
              <Switch
                id="basement"
                checked={formData.basement}
                onCheckedChange={(checked) => handleChange('basement', checked)}
              />
              <Label htmlFor="basement" className="input-label">Has Basement</Label>
            </div>
            
            {/* Central Air */}
            <div className="input-group flex-row items-center space-y-0 space-x-2">
              <Switch
                id="centralAir"
                checked={formData.centralAir}
                onCheckedChange={(checked) => handleChange('centralAir', checked)}
              />
              <Label htmlFor="centralAir" className="input-label">Central Air</Label>
            </div>
          </div>
          
          <Button 
            type="submit" 
            className="w-full mt-6 transition-all-fast"
            disabled={isLoading}
          >
            {isLoading ? "Calculating..." : "Predict Price"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default HouseForm;
