import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Check, Loader2, AlertCircle } from 'lucide-react';
import { useSaveQueue, SaveQueueStatus } from '@/hooks/useSaveQueue';

export const SaveStatusIndicator = () => {
  const { subscribe, getStatus } = useSaveQueue();
  const [status, setStatus] = useState<SaveQueueStatus>(getStatus());

  useEffect(() => {
    const unsubscribe = subscribe(setStatus);
    return () => {
      unsubscribe();
    };
  }, [subscribe]);

  if (status.processing) {
    return (
      <Badge variant="outline" className="flex items-center gap-2 bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800">
        <Loader2 className="h-3 w-3 animate-spin" />
        <span className="text-xs">Saving {status.components.length} changes...</span>
      </Badge>
    );
  }

  if (status.pending > 0) {
    return (
      <Badge variant="outline" className="flex items-center gap-2 bg-orange-50 dark:bg-orange-950 border-orange-200 dark:border-orange-800">
        <AlertCircle className="h-3 w-3" />
        <span className="text-xs">{status.pending} unsaved changes</span>
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="flex items-center gap-2 bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
      <Check className="h-3 w-3" />
      <span className="text-xs">All changes saved</span>
    </Badge>
  );
};
