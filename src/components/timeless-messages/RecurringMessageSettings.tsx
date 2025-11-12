
import React from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { RecurringMessageSettings as RecurringSettings } from '@/types';

interface RecurringMessageSettingsProps {
  settings: RecurringSettings;
  onChange: (settings: RecurringSettings) => void;
}

const RecurringMessageSettings: React.FC<RecurringMessageSettingsProps> = ({
  settings,
  onChange
}) => {
  const handleToggleRecurring = (checked: boolean) => {
    onChange({
      ...settings,
      isRecurring: checked,
      // Set default values if toggling on
      ...(checked && !settings.frequency ? { frequency: 'weekly' } : {})
    });
  };

  const handleFrequencyChange = (value: string) => {
    onChange({
      ...settings,
      frequency: value as RecurringSettings['frequency']
    });
  };

  const handleEndDateChange = (date: Date | undefined) => {
    onChange({
      ...settings,
      endDate: date ? date.toISOString() : null
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Switch
          id="recurring"
          checked={settings.isRecurring}
          onCheckedChange={handleToggleRecurring}
        />
        <Label htmlFor="recurring">Make this a recurring message</Label>
      </div>

      {settings.isRecurring && (
        <>
          <div className="ml-6 space-y-4">
            <div className="space-y-2">
              <Label>Frequency</Label>
              <RadioGroup
                value={settings.frequency}
                onValueChange={handleFrequencyChange}
                className="flex flex-col space-y-1"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="daily" id="daily" />
                  <Label htmlFor="daily">Daily</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="weekly" id="weekly" />
                  <Label htmlFor="weekly">Weekly</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="monthly" id="monthly" />
                  <Label htmlFor="monthly">Monthly</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yearly" id="yearly" />
                  <Label htmlFor="yearly">Yearly</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label>End Date (Optional)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !settings.endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {settings.endDate ? (
                      format(new Date(settings.endDate), "PPP")
                    ) : (
                      <span>Pick an end date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={settings.endDate ? new Date(settings.endDate) : undefined}
                    onSelect={handleEndDateChange}
                    initialFocus
                    disabled={(date) => date < new Date()}
                  />
                </PopoverContent>
              </Popover>
              {settings.endDate && (
                <Button
                  variant="ghost"
                  className="text-sm text-muted-foreground hover:text-primary"
                  onClick={() => handleEndDateChange(undefined)}
                >
                  Clear end date
                </Button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default RecurringMessageSettings;
