import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export const WorkshopSkeleton: React.FC = () => (
  <Card>
    <CardHeader>
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-4 w-96 mt-2" />
    </CardHeader>
    <CardContent>
      <Skeleton className="h-64 w-full" />
    </CardContent>
  </Card>
);

export const FormSkeleton: React.FC = () => (
  <div className="space-y-4">
    <Skeleton className="h-10 w-full" />
    <Skeleton className="h-10 w-full" />
    <Skeleton className="h-20 w-full" />
    <Skeleton className="h-10 w-32" />
  </div>
);

export const ListSkeleton: React.FC<{ items?: number }> = ({ items = 3 }) => (
  <div className="space-y-3">
    {Array.from({ length: items }).map((_, i) => (
      <Card key={i} className="p-4">
        <Skeleton className="h-6 w-3/4 mb-2" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3 mt-1" />
      </Card>
    ))}
  </div>
);

export const CardSkeleton: React.FC = () => (
  <Card>
    <CardHeader>
      <Skeleton className="h-6 w-48" />
    </CardHeader>
    <CardContent>
      <Skeleton className="h-32 w-full" />
    </CardContent>
  </Card>
);
