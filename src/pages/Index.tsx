import React from 'react';
import { StreamlinedMindmakerProvider } from '../contexts/StreamlinedMindmakerContext';
import { MindmakerApp } from '../components/CanvasApp';

const Index = () => {
  return (
    <StreamlinedMindmakerProvider>
      <MindmakerApp />
    </StreamlinedMindmakerProvider>
  );
};

export default Index;
