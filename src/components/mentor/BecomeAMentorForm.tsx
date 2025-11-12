
import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, Award, BookOpen, Clock, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface MentorFormData {
  expertise: string[];
  industries: string[];
  experience_years: number;
  monthly_availability: number;
}

const BecomeAMentorForm: React.FC = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [open, setOpen] = useState(false);
  const [formStep, setFormStep] = useState(1);
  const [formData, setFormData] = useState<MentorFormData>({
    expertise: [],
    industries: [],
    experience_years: 0,
    monthly_availability: 0
  });
  const [currentExpertise, setCurrentExpertise] = useState('');
  const [currentIndustry, setCurrentIndustry] = useState('');

  const handleAddExpertise = () => {
    if (currentExpertise.trim() && !formData.expertise.includes(currentExpertise.trim())) {
      setFormData({
        ...formData,
        expertise: [...formData.expertise, currentExpertise.trim()]
      });
      setCurrentExpertise('');
    }
  };

  const handleAddIndustry = () => {
    if (currentIndustry.trim() && !formData.industries.includes(currentIndustry.trim())) {
      setFormData({
        ...formData,
        industries: [...formData.industries, currentIndustry.trim()]
      });
      setCurrentIndustry('');
    }
  };

  const handleRemoveExpertise = (item: string) => {
    setFormData({
      ...formData,
      expertise: formData.expertise.filter(i => i !== item)
    });
  };

  const handleRemoveIndustry = (item: string) => {
    setFormData({
      ...formData,
      industries: formData.industries.filter(i => i !== item)
    });
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: parseInt(value) || 0
    });
  };

  const nextStep = () => {
    if (formStep < 4) {
      setFormStep(prevStep => prevStep + 1);
    }
  };

  const prevStep = () => {
    if (formStep > 1) {
      setFormStep(prevStep => prevStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // Call the RPC function to request mentor verification
      const { data, error } = await supabase.rpc('request_mentor_verification', {
        expertise: formData.expertise,
        industries: formData.industries,
        experience_years: formData.experience_years,
        monthly_availability: formData.monthly_availability
      });
      
      if (error) throw error;
      
      toast({
        title: "Mentor application submitted",
        description: "Your application to become a mentor has been sent for review."
      });
      
      setOpen(false);
      // Reset the form
      setFormData({
        expertise: [],
        industries: [],
        experience_years: 0,
        monthly_availability: 0
      });
      setFormStep(1);
    } catch (error: any) {
      toast({
        title: "Error submitting application",
        description: error.message || "There was a problem submitting your mentor application.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderFormStep = () => {
    switch (formStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-2">Your Areas of Expertise</h3>
              <p className="text-sm text-muted-foreground mb-4">
                List the areas where you can provide valuable mentorship.
              </p>
              
              <div className="flex gap-2 mb-3">
                <Input 
                  value={currentExpertise}
                  onChange={(e) => setCurrentExpertise(e.target.value)}
                  placeholder="E.g., Leadership, Business Development"
                  className="flex-1"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddExpertise();
                    }
                  }}
                />
                <Button type="button" onClick={handleAddExpertise}>Add</Button>
              </div>
              
              <div className="flex flex-wrap gap-2 mt-3">
                {formData.expertise.map((item, index) => (
                  <Badge key={index} variant="secondary" className="px-3 py-1">
                    {item}
                    <button 
                      className="ml-2 text-muted-foreground hover:text-foreground"
                      onClick={() => handleRemoveExpertise(item)}
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        );
      
      case 2:
        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-2">Industries You're Familiar With</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Select the industries where you have experience and knowledge.
              </p>
              
              <div className="flex gap-2 mb-3">
                <Input 
                  value={currentIndustry}
                  onChange={(e) => setCurrentIndustry(e.target.value)}
                  placeholder="E.g., Technology, Healthcare"
                  className="flex-1"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddIndustry();
                    }
                  }}
                />
                <Button type="button" onClick={handleAddIndustry}>Add</Button>
              </div>
              
              <div className="flex flex-wrap gap-2 mt-3">
                {formData.industries.map((item, index) => (
                  <Badge key={index} variant="secondary" className="px-3 py-1">
                    {item}
                    <button 
                      className="ml-2 text-muted-foreground hover:text-foreground"
                      onClick={() => handleRemoveIndustry(item)}
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        );
      
      case 3:
        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-2">Your Experience & Availability</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Let us know about your experience level and how much time you can dedicate.
              </p>
              
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="experience_years">Years of Experience</Label>
                  <Input 
                    id="experience_years"
                    name="experience_years"
                    type="number"
                    min="0"
                    value={formData.experience_years}
                    onChange={handleNumberChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="monthly_availability">Hours Available per Month</Label>
                  <Input 
                    id="monthly_availability"
                    name="monthly_availability"
                    type="number"
                    min="0"
                    value={formData.monthly_availability}
                    onChange={handleNumberChange}
                  />
                </div>
              </div>
            </div>
          </div>
        );
      
      case 4:
        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-2">Review Your Application</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Please review your information before submission.
              </p>
              
              <div className="rounded-lg border p-4 space-y-3">
                <div>
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    <BookOpen size={16} className="text-primary" />
                    Areas of Expertise
                  </h4>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {formData.expertise.length > 0 ? (
                      formData.expertise.map((item, index) => (
                        <Badge key={index} variant="outline" className="px-2 py-0.5 text-xs">
                          {item}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">No expertise added</span>
                    )}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    <Users size={16} className="text-primary" />
                    Industries
                  </h4>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {formData.industries.length > 0 ? (
                      formData.industries.map((item, index) => (
                        <Badge key={index} variant="outline" className="px-2 py-0.5 text-xs">
                          {item}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">No industries added</span>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <h4 className="text-sm font-medium flex items-center gap-2">
                      <Award size={16} className="text-primary" />
                      Years of Experience
                    </h4>
                    <p className="text-sm">{formData.experience_years}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium flex items-center gap-2">
                      <Clock size={16} className="text-primary" />
                      Monthly Availability
                    </h4>
                    <p className="text-sm">{formData.monthly_availability} hours</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" className="flex items-center gap-2">
          <Award className="h-4 w-4" />
          <span>Become a Mentor</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            Become a Mentor
          </DialogTitle>
          <DialogDescription>
            Share your wisdom and experience with others on their journey
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex justify-between mb-4">
          {[1, 2, 3, 4].map((step) => (
            <div key={step} className="flex flex-col items-center">
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  formStep >= step 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {formStep > step ? <CheckCircle className="h-5 w-5" /> : step}
              </div>
              <div className="text-xs mt-1 hidden sm:block">
                {step === 1 && "Expertise"}
                {step === 2 && "Industries"}
                {step === 3 && "Experience"}
                {step === 4 && "Review"}
              </div>
            </div>
          ))}
        </div>
        
        <form>
          {renderFormStep()}
          
          <div className="flex justify-between mt-6">
            <Button 
              type="button" 
              variant="outline" 
              onClick={prevStep}
              disabled={formStep === 1}
            >
              Back
            </Button>
            
            {formStep < 4 ? (
              <Button 
                type="button" 
                onClick={nextStep}
                disabled={
                  (formStep === 1 && formData.expertise.length === 0) ||
                  (formStep === 2 && formData.industries.length === 0)
                }
              >
                Continue
              </Button>
            ) : (
              <Button 
                type="button" 
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit Application"}
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BecomeAMentorForm;
