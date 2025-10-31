import React from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';

interface CognitiveBaselineRadarProps {
  data: {
    awareness: number;
    application: number;
    trust: number;
    governance: number;
  };
}

export const CognitiveBaselineRadar: React.FC<CognitiveBaselineRadarProps> = ({ data }) => {
  const chartData = [
    { dimension: 'Awareness', score: data.awareness },
    { dimension: 'Application', score: data.application },
    { dimension: 'Trust', score: data.trust },
    { dimension: 'Governance', score: data.governance },
  ];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <RadarChart data={chartData}>
        <PolarGrid strokeDasharray="3 3" />
        <PolarAngleAxis dataKey="dimension" />
        <PolarRadiusAxis angle={90} domain={[0, 5]} />
        <Radar
          name="Team Score"
          dataKey="score"
          stroke="hsl(var(--primary))"
          fill="hsl(var(--primary))"
          fillOpacity={0.6}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
