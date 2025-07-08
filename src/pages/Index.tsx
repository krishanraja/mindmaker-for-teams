import React from 'react';
import { MindmakerProvider } from '../contexts/MindmakerContext';
import { Layout } from '../components/layout/Layout';
import { MindmakerApp } from '../components/CanvasApp';

const Index = () => {
  return (
    <MindmakerProvider>
      <Layout>
        <MindmakerApp />
      </Layout>
    </MindmakerProvider>
  );
};

export default Index;
