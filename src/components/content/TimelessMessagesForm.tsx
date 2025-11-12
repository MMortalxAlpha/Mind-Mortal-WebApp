
import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { format, addDays } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import RichTextEditor from '@/components/editor/RichTextEditor';
import { useToast } from '@/hooks/use-toast';
import FileUpload from '@/components/editor/FileUpload';
import RecurringMessageSettings from '../timeless-messages/RecurringMessageSettings';
import { RecurringMessageSettings as RecurringSettingsType } from '@/types';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TimelessMessagesFormProps {
  onSubmit?: (data: any) => void;
  isEdit?: boolean;
  initialData?: any;
}

const TimelessMessagesForm: React.FC<TimelessMessagesFormProps> = ({
  onSubmit,
  isEdit = false,
  initialData,
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [messageType, setMessageType] = useState('text');
  const [title, setTitle] = useState(initialData?.title || '');
  const [recipient, setRecipient] = useState(initialData?.recipient || '');
  const [message, setMessage] = useState(initialData?.message || '');
  const [richMessage, setRichMessage] = useState(initialData?.richMessage || '');
  const [mediaUrl, setMediaUrl] = useState(initialData?.mediaUrl || '');
  const [isTimeCapsule, setIsTimeCapsule] = useState(initialData?.isTimeCapsule || false);
  const [deliveryDate, setDeliveryDate] = useState<Date>(
    initialData?.deliveryDate ? new Date(initialData.deliveryDate) : addDays(new Date(), 1)
  );
  const [isRecurring, setIsRecurring] = useState(initialData?.isRecurring || false);
  const [recurringSettings, setRecurringSettings] = useState<RecurringSettingsType>(
    initialData?.recurringSettings || {
      isRecurring: false,
      frequency: 'yearly',
      customDays: [],
      endDate: null,
    }
  );

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setDeliveryDate(date);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title) {
      toast({
        title: "Missing Information",
        description: "Please provide a title for your message.",
        variant: "destructive",
      });
      return;
    }

    if (!recipient) {
      toast({
        title: "Missing Information",
        description: "Please specify who this message is for.",
        variant: "destructive",
      });
      return;
    }

    if (messageType === 'text' && !message) {
      toast({
        title: "Missing Content",
        description: "Please enter your message content.",
        variant: "destructive",
      });
      return;
    }

    if (messageType === 'rich' && !richMessage) {
      toast({
        title: "Missing Content",
        description: "Please enter your message content.",
        variant: "destructive",
      });
      return;
    }

    if (isTimeCapsule && !deliveryDate) {
      toast({
        title: "Missing Delivery Date",
        description: "Please select when this message should be delivered.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare the data object
      const messageData = {
        id: initialData?.id || uuidv4(),
        title,
        recipient,
        messageType,
        message: messageType === 'text' ? message : richMessage,
        mediaUrl: messageType === 'media' ? mediaUrl : '',
        isTimeCapsule,
        deliveryDate: isTimeCapsule ? deliveryDate.toISOString() : null,
        isRecurring,
        recurringSettings: isRecurring ? recurringSettings : null,
        createdAt: initialData?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (onSubmit) {
        await onSubmit(messageData);
      }

      toast({
        title: isEdit ? "Message Updated" : "Message Created",
        description: isEdit 
          ? "Your timeless message has been updated successfully."
          : "Your timeless message has been created and stored securely.",
      });

      // Navigate back after success
      setTimeout(() => {
        navigate('/dashboard/timeless-messages');
      }, 1500);
    } catch (error) {
      console.error("Error saving message:", error);
      toast({
        title: "Something went wrong",
        description: "There was an error saving your message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUploaded = (url: string) => {
    setMediaUrl(url);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>{isEdit ? "Edit Message" : "Create a New Timeless Message"}</CardTitle>
          <CardDescription>
            Craft a message that will be preserved and delivered in the future.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">Message Title</Label>
              <Input
                id="title"
                placeholder="Title of your message"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="recipient">Recipient</Label>
              <Input
                id="recipient"
                placeholder="Who is this message for?"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Message Format</Label>
            <RadioGroup 
              defaultValue={messageType} 
              onValueChange={setMessageType} 
              className="flex flex-wrap gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="text" id="text" />
                <Label htmlFor="text">Simple Text</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="rich" id="rich" />
                <Label htmlFor="rich">Rich Text</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="media" id="media" />
                <Label htmlFor="media">Media (Video/Audio)</Label>
              </div>
            </RadioGroup>
          </div>

          {messageType === 'text' && (
            <div className="space-y-2">
              <Label htmlFor="message">Your Message</Label>
              <Textarea
                id="message"
                placeholder="Write your message here..."
                rows={8}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>
          )}

          {messageType === 'rich' && (
            <div className="space-y-2">
              <Label>Rich Message Content</Label>
              <RichTextEditor 
                value={richMessage} 
                onChange={setRichMessage} 
                placeholder="Write your rich message content here..."
              />
            </div>
          )}

          {messageType === 'media' && (
            <div className="space-y-4">
              <Label>Upload Media</Label>
              <FileUpload onFileUploaded={handleFileUploaded} />
              {mediaUrl && (
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground mb-2">Media Preview:</p>
                  {mediaUrl.match(/\.(mp4|webm|ogg)$/i) ? (
                    <video 
                      src={mediaUrl} 
                      controls 
                      className="max-w-full h-auto border rounded-md"
                    />
                  ) : mediaUrl.match(/\.(mp3|wav|ogg)$/i) ? (
                    <audio 
                      src={mediaUrl} 
                      controls 
                      className="w-full" 
                    />
                  ) : (
                    <img 
                      src={mediaUrl} 
                      alt="Uploaded media" 
                      className="max-w-full h-auto border rounded-md" 
                    />
                  )}
                </div>
              )}
            </div>
          )}

          <div className="space-y-4 border-t pt-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="time-capsule">Time Capsule</Label>
                <p className="text-sm text-muted-foreground">
                  Schedule this message to be delivered on a specific date
                </p>
              </div>
              <Switch
                id="time-capsule"
                checked={isTimeCapsule}
                onCheckedChange={setIsTimeCapsule}
              />
            </div>

            {isTimeCapsule && (
              <div className="space-y-4 pl-4 border-l-2 border-primary/20">
                <div className="space-y-2">
                  <Label htmlFor="delivery-date">Delivery Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !deliveryDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {deliveryDate ? format(deliveryDate, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={deliveryDate}
                        onSelect={handleDateChange}
                        initialFocus
                        disabled={(date) => date < new Date()}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="recurring">Recurring Message</Label>
                    <p className="text-sm text-muted-foreground">
                      Send this message on a recurring schedule
                    </p>
                  </div>
                  <Switch
                    id="recurring"
                    checked={isRecurring}
                    onCheckedChange={setIsRecurring}
                  />
                </div>

                {isRecurring && (
                  <RecurringMessageSettings
                    settings={recurringSettings}
                    onChange={setRecurringSettings}
                  />
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate('/dashboard/timeless-messages')}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : isEdit ? 'Update Message' : 'Create Message'}
        </Button>
      </div>
    </form>
  );
};

export default TimelessMessagesForm;
