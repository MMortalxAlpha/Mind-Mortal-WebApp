import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save, Clock } from "lucide-react";
import { AnimationPlayer } from "@/components/ui/animation-player";
import mediaConfig from "@/data/mediaConfig.json";
import { useToast } from "@/hooks/use-toast";
import { usePlanGate } from '@/hooks/usePlanGate';

const STORAGE_KEY = "timeless_message_form";

const CreateTimelessMessage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { requireCapacity } = usePlanGate();

  // Controlled form state
  const [recipientEmails, setRecipientEmails] = useState("");
  const [title, setTitle] = useState("");
  const [messageContent, setMessageContent] = useState("");
  const [deliveryType, setDeliveryType] = useState<"date" | "event">("date");
  const [deliveryDate, setDeliveryDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [deliveryEvent, setDeliveryEvent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);

  // Load cached data on mount
  useEffect(() => {
    const cached = localStorage.getItem(STORAGE_KEY);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed.recipientEmails) setRecipientEmails(parsed.recipientEmails);
        if (parsed.title) setTitle(parsed.title);
        if (parsed.messageContent) setMessageContent(parsed.messageContent);
        if (parsed.deliveryType) setDeliveryType(parsed.deliveryType);
        if (parsed.deliveryDate) setDeliveryDate(parsed.deliveryDate);
        if (parsed.deliveryEvent) setDeliveryEvent(parsed.deliveryEvent);
      } catch {
        // Ignore parse errors
      }
    }
  }, []);

  // Save to localStorage on every change
  useEffect(() => {
    const dataToCache = {
      recipientEmails,
      title,
      messageContent,
      deliveryType,
      deliveryDate,
      deliveryEvent,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToCache));
  }, [
    recipientEmails,
    title,
    messageContent,
    deliveryType,
    deliveryDate,
    deliveryEvent,
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create a message.",
        variant: "destructive",
      });
      return;
    }

    const gate = requireCapacity('timeless');
    if (!gate.ok) return;

    if (!title.trim()) {
      toast({
        title: "Missing Title",
        description: "Please enter a title.",
        variant: "destructive",
      });
      return;
    }

    if (!messageContent.trim()) {
      toast({
        title: "Missing Message Content",
        description: "Please enter your message.",
        variant: "destructive",
      });
      return;
    }

    if (deliveryType === "date" && !deliveryDate) {
      toast({
        title: "Missing Delivery Date",
        description: "Please select a delivery date.",
        variant: "destructive",
      });
      return;
    }

    if (deliveryType === "event" && !deliveryEvent.trim()) {
      toast({
        title: "Missing Delivery Event",
        description: "Please enter the life event.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Convert recipient emails string to array
      const recipientEmailsArray = recipientEmails
        .split(",")
        .map((email) => email.trim())
        .filter((email) => email.length > 0);

      // Build the record to insert
      const newMessage = {
        user_id: user.id,
        title: title.trim(),
        content: messageContent.trim(),
        delivery_type: deliveryType,
        delivery_date: deliveryType === "date" ? deliveryDate : null,
        delivery_event: deliveryType === "event" ? deliveryEvent.trim() : null,
        recipient_emails:
          recipientEmailsArray.length > 0 ? recipientEmailsArray : null,
        status: "pending",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_recurring: false,
        media_type: null,
        recipients: null,
        recurrence_custom_days: null,
        recurrence_end_date: null,
        recurrence_frequency: null,
      };

      const { error } = await supabase
        .from("timeless_messages")
        .insert([newMessage]);

      if (error) {
        console.error("Insert error:", error);
        throw error;
      }

      toast({
        title: "Message Created",
        description:
          "Your timeless message has been created and stored securely.",
      });

      // Clear cached form data on success
      localStorage.removeItem(STORAGE_KEY);

      // Show animation then navigate
      setShowAnimation(true);
    } catch (error) {
      toast({
        title: "Failed to create message",
        description: "Please try again later.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };

  if (showAnimation && mediaConfig.animations.messageSubmitted) {
    return (
      <div className="container mx-auto flex flex-col items-center justify-center h-full">
        <div className="w-full max-w-lg">
          <AnimationPlayer
            config={mediaConfig.animations.messageSubmitted}
            onComplete={() => navigate("/dashboard/timeless-messages")}
          />
          <p className="text-center mt-4 text-lg font-medium">
            Your timeless message has been safely stored for the future
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/dashboard/timeless-messages")}
          className="h-8 w-8"
          disabled={isSubmitting}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">Create Timeless Message</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Message Details</CardTitle>
        </CardHeader>
        <CardContent className="xs:p-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="recipientEmails">
                Recipient Emails (comma separated)
              </Label>
              <Input
                id="recipientEmails"
                placeholder="Enter recipient email addresses separated by commas"
                value={recipientEmails}
                onChange={(e) => setRecipientEmails(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Subject / Title</Label>
              <Input
                id="title"
                placeholder="Enter the subject of your message"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="messageContent">Your Message</Label>
              <Textarea
                id="messageContent"
                placeholder="Write your timeless message here..."
                rows={6}
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            {/* <div className="space-y-2">
              <Label>Delivery Options</Label>
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="deliveryType"
                    value="date"
                    checked={deliveryType === "date"}
                    onChange={() => setDeliveryType("date")}
                    disabled={isSubmitting}
                    className="form-radio"
                  />
                  <span>Future Date</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="deliveryType"
                    value="event"
                    checked={deliveryType === "event"}
                    onChange={() => setDeliveryType("event")}
                    disabled={isSubmitting}
                    className="form-radio"
                  />
                  <span>Life Event</span>
                </label>
              </div>
            </div> */}

            
              <div className="space-y-2">
                <Label htmlFor="deliveryDate">Delivery Date</Label>
                <Input
                  id="deliveryDate"
                  type="date"
                  min={new Date().toISOString().split("T")[0]}
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
            

            {/* {deliveryType === "event" && (
              <div className="space-y-2">
                <Label htmlFor="deliveryEvent">Delivery Event</Label>
                <Input
                  id="deliveryEvent"
                  placeholder="Describe the life event"
                  value={deliveryEvent}
                  onChange={(e) => setDeliveryEvent(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
            )} */}

            <div className="pt-4 flex justify-end space-x-2 xs:space-x-0 xs:flex-col xs:items-start xs:gap-2">
              <Button
                className="xs:w-full border-[#4C6B8A] hover:bg-transparent"
                type="button"
                variant="outline"
                onClick={() => navigate("/dashboard/timeless-messages")}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                className="xs:w-full bg-[#4C6B8A] hover:bg-[#4C6B8A]/80"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Clock className="mr-2 h-4 w-4 animate-pulse" />
                    Sending to Future...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Message
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateTimelessMessage;
