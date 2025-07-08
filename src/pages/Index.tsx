import React from 'react';
import { CanvasProvider } from '../contexts/CanvasContext';
import { Layout } from '../components/layout/Layout';
import { CanvasApp } from '../components/CanvasApp';

const Index = () => {
  return (
    <CanvasProvider>
      <Layout>
        <CanvasApp />
      </Layout>
    </CanvasProvider>
  );
};

export default Index;
