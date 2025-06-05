
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { generateUniqueId, validateIdFormat, formatIdForDisplay } from '@/utils/idGenerator';

interface RegistrationIdFieldProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export function RegistrationIdField({ value, onChange, error }: RegistrationIdFieldProps) {
  const [displayValue, setDisplayValue] = useState(formatIdForDisplay(value));

  const handleGenerate = () => {
    const newId = generateUniqueId();
    onChange(newId);
    setDisplayValue(formatIdForDisplay(newId));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value.replace(/\s/g, '').toUpperCase();
    if (inputValue.length <= 9) {
      onChange(inputValue);
      setDisplayValue(formatIdForDisplay(inputValue));
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="registrationId">Registration ID</Label>
      <div className="flex gap-2">
        <Input
          id="registrationId"
          placeholder="XX AAAA 000"
          value={displayValue}
          onChange={handleInputChange}
          className={error ? "border-red-500" : ""}
          maxLength={11} // Including spaces
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={handleGenerate}
          title="Generate Random ID"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <p className="text-xs text-muted-foreground">
        Format: 2 digits + 4 capital letters + 3 digits (e.g., 12 ABCD 345)
      </p>
    </div>
  );
}
