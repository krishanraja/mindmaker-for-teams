import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

const data = [
  {
    metric: 'Decision Velocity',
    'AI-Native Orgs': 95,
    'Traditional Orgs': 35,
  },
  {
    metric: 'Cost per Output',
    'AI-Native Orgs': 20,
    'Traditional Orgs': 85,
  },
  {
    metric: 'Experimentation Rate',
    'AI-Native Orgs': 90,
    'Traditional Orgs': 25,
  },
  {
    metric: 'Time to Market',
    'AI-Native Orgs': 15,
    'Traditional Orgs': 75,
  },
];

export const BenchmarkComparisonChart: React.FC = () => {
  return (
    <Card className="border-2 border-primary/30">
      <CardContent className="p-8">
        <h3 className="text-2xl font-bold mb-6 text-center text-foreground">
          AI-Native vs Traditional: The Gap is Real
        </h3>
        
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={data} layout="vertical" margin={{ top: 20, right: 30, left: 120, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis type="number" domain={[0, 100]} className="text-muted-foreground" />
            <YAxis dataKey="metric" type="category" className="text-foreground" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))', 
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px'
              }}
            />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            <Bar dataKey="AI-Native Orgs" fill="hsl(var(--primary))" radius={[0, 8, 8, 0]} />
            <Bar dataKey="Traditional Orgs" fill="hsl(var(--muted))" radius={[0, 8, 8, 0]} />
          </BarChart>
        </ResponsiveContainer>

        <div className="mt-8 grid md:grid-cols-3 gap-4">
          <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
            <div className="text-sm text-muted-foreground mb-1">Organization Velocity</div>
            <div className="text-2xl font-bold text-primary">3-5x Faster</div>
          </div>
          <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
            <div className="text-sm text-muted-foreground mb-1">Cost Basis</div>
            <div className="text-2xl font-bold text-primary">60-80% Lower</div>
          </div>
          <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
            <div className="text-sm text-muted-foreground mb-1">Weekly Experiments</div>
            <div className="text-2xl font-bold text-primary">10-20 vs 1-2</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
