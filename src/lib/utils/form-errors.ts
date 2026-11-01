import { ApiError } from '@/lib/apiClient';
import { toast } from 'sonner';

export function applyServerErrors<T extends { setError: (field: any, error: { message: string }) => void }>(
  error: unknown,
  form: T,
  setErrorMap?: Record<string, string>
) {
  if (error instanceof ApiError) {
    // Jodi validation errors thake ebong details array thake
    if (error.code === 'VALIDATION_ERROR' && Array.isArray(error.details)) {
      error.details.forEach((errDetail: any) => {
        const fieldName = errDetail.path;
        const message = errDetail.message;
        if (fieldName) {
          form.setError(fieldName as any, { message });
        }
      });
      return;
    }

    // Jodi specific error map thake (jemon CONFLICT ba OTP_INVALID)
    if (setErrorMap && error.code in setErrorMap) {
      const field = setErrorMap[error.code];
      form.setError(field as any, { message: error.message });
      return;
    }

    // General error toast
    toast.error(error.message);
  } else if (error instanceof Error) {
    toast.error(error.message);
  } else {
    toast.error('কিছু একটা সমস্যা হয়েছে। আবার চেষ্টা করুন।');
  }
}