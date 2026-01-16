import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FormErrorProps {
  message?: string;
  className?: string;
}

export function FormError({ message, className }: FormErrorProps) {
  if (!message) return null;

  return (
    <div
      className={cn(
        'flex items-center gap-2 text-sm text-red-600 mt-1',
        className
      )}
    >
      <AlertCircle className="h-4 w-4 flex-shrink-0" />
      <span>{message}</span>
    </div>
  );
}

interface FormFieldErrorProps {
  error?: string;
  touched?: boolean;
  className?: string;
}

export function FormFieldError({ error, touched, className }: FormFieldErrorProps) {
  if (!error || !touched) return null;

  return <FormError message={error} className={className} />;
}

interface ValidationErrorsProps {
  errors: Record<string, string>;
  className?: string;
}

export function ValidationErrors({ errors, className }: ValidationErrorsProps) {
  const errorEntries = Object.entries(errors);
  
  if (errorEntries.length === 0) return null;

  return (
    <div
      className={cn(
        'rounded-lg border border-red-200 bg-red-50 p-4',
        className
      )}
    >
      <div className="flex items-start gap-2">
        <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="text-sm font-medium text-red-800 mb-2">
            Please fix the following errors:
          </h3>
          <ul className="text-sm text-red-700 space-y-1">
            {errorEntries.map(([field, message]) => (
              <li key={field} className="flex items-start gap-1">
                <span className="font-medium capitalize">{field.replace(/([A-Z])/g, ' $1').trim()}:</span>
                <span>{message}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}