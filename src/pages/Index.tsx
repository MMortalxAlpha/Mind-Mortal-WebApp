
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import HomePage from './HomePage';

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Instead of redirecting to '/', we'll just use the HomePage component directly
    // This prevents an unnecessary navigation
  }, [navigate]);

  return <HomePage />;
};

export default Index;
