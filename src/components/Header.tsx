
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="w-full py-8 flex flex-col items-center justify-center animate-fade-in">
      <div className="chip mb-2">Property Valuation Tool</div>
      <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-2">Cozy Quarters</h1>
      <p className="text-muted-foreground text-lg max-w-md text-center">
        Precise house price predictions powered by machine learning
      </p>
    </header>
  );
};

export default Header;
