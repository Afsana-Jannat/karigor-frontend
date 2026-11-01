import { LoaderCircle } from 'lucide-react';

export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <LoaderCircle className="h-10 w-10 animate-spin text-brand" />
    </div>
  );
}