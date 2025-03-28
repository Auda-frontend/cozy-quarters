
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="w-full py-8 mt-8 text-center text-sm text-muted-foreground">
      <div className="max-w-7xl mx-auto px-4">
        <p>Built with precision and care. Powered by advanced machine learning.</p>
        <p className="mt-2">© {new Date().getFullYear()} Cozy Quarters Predictor</p>
        <p className="mt-4 text-xs">
          <a 
            href="http://localhost:5000/api/model/status" 
            target="_blank" 
            rel="noopener noreferrer"
            className="underline hover:text-primary transition-colors"
          >
            Check API Status
          </a>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
