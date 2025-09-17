import React from 'react';
import { MindmakerProvider } from '../contexts/MindmakerContext';
import { MindmakerApp } from '../components/CanvasApp';

const Index = () => {
  return (
    <MindmakerProvider>
      <MindmakerApp />
    </MindmakerProvider>
  );
};

export default Index;
