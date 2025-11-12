
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GroupCircle } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Users, Lock, Globe, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

const GroupCircles = () => {
  const [circles, setCircles] = useState<GroupCircle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newCircle, setNewCircle] = useState({
    name: '',
    description: '',
    isPublic: true,
    topics: [] as string[]
  });
  const [currentTopic, setCurrentTopic] = useState('');
  const [open, setOpen] = useState(false);
  
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCircles();
  }, []);

  const fetchCircles = async () => {
    setIsLoading(true);
    try {
      // First get all public circles
      const { data: publicCircles, error: publicError } = await supabase
        .from('group_circles')
        .select('*')
        .eq('is_public', true);
        
      if (publicError) throw publicError;

      // Then get all private circles where the user is a member
      let privateCircles: any[] = [];
      if (user) {
        const { data: memberships, error: membershipError } = await supabase
          .from('circle_memberships')
          .select('circle_id')
          .eq('user_id', user.id);
          
        if (membershipError) throw membershipError;
        
        if (memberships && memberships.length > 0) {
          const circleIds = memberships.map(m => m.circle_id);
          
          const { data: privateData, error: privateError } = await supabase
            .from('group_circles')
            .select('*')
            .eq('is_public', false)
            .in('id', circleIds);
            
          if (privateError) throw privateError;
          privateCircles = privateData || [];
        }
      }

      // Combine and process circles
      const allCircles = [...(publicCircles || []), ...privateCircles];
      
      // Get member counts for each circle
      const processedCircles = await Promise.all(allCircles.map(async (circle) => {
        const { count, error } = await supabase
          .from('circle_memberships')
          .select('*', { count: 'exact' })
          .eq('circle_id', circle.id);
          
        return {
          id: circle.id,
          name: circle.name,
          description: circle.description,
          isPublic: circle.is_public,
          topics: circle.topics || [],
          members: count || 0
        };
      }));
      
      setCircles(processedCircles);
    } catch (error) {
      console.error('Error fetching circles:', error);
      toast({
        title: "Failed to load groups",
        description: "There was a problem loading the group circles.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCircle = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to create a group circle.",
        variant: "destructive"
      });
      return;
    }
    
    if (!newCircle.name) {
      toast({
        title: "Name Required",
        description: "Please provide a name for your group circle.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Create the circle
      const { data, error } = await supabase
        .from('group_circles')
        .insert({
          name: newCircle.name,
          description: newCircle.description,
          created_by: user.id,
          is_public: newCircle.isPublic,
          topics: newCircle.topics
        })
        .select();
        
      if (error) throw error;
      
      // Add creator as a member with 'admin' role
      const circleId = data[0].id;
      const { error: membershipError } = await supabase
        .from('circle_memberships')
        .insert({
          circle_id: circleId,
          user_id: user.id,
          role: 'admin'
        });
        
      if (membershipError) throw membershipError;
      
      toast({
        title: "Group Circle Created",
        description: "Your group circle has been created successfully!",
      });
      
      // Clear form and close dialog
      setNewCircle({
        name: '',
        description: '',
        isPublic: true,
        topics: []
      });
      setOpen(false);
      
      // Refresh circles
      fetchCircles();
    } catch (error: any) {
      console.error('Error creating circle:', error);
      toast({
        title: "Creation Failed",
        description: error.message || "Failed to create the group circle.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const joinCircle = async (circleId: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to join a group circle.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const { error } = await supabase
        .from('circle_memberships')
        .insert({
          circle_id: circleId,
          user_id: user.id,
          role: 'member'
        });
        
      if (error) throw error;
      
      toast({
        title: "Joined Successfully",
        description: "You have joined the group circle.",
      });
      
      // Update the circle member count
      setCircles(circles.map(circle => 
        circle.id === circleId 
          ? { ...circle, members: circle.members + 1 } 
          : circle
      ));
    } catch (error: any) {
      console.error('Error joining circle:', error);
      toast({
        title: "Failed to Join",
        description: error.message || "There was a problem joining the group circle.",
        variant: "destructive"
      });
    }
  };

  const handleAddTopic = () => {
    if (currentTopic && !newCircle.topics.includes(currentTopic)) {
      setNewCircle(prev => ({
        ...prev,
        topics: [...prev.topics, currentTopic]
      }));
      setCurrentTopic('');
    }
  };

  const handleRemoveTopic = (topic: string) => {
    setNewCircle(prev => ({
      ...prev,
      topics: prev.topics.filter(t => t !== topic)
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Group Circles</h2>
        
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Circle
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create a Group Circle</DialogTitle>
              <DialogDescription>
                Create a space where like-minded individuals can discuss topics, ask questions, and share insights.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="circle-name">Circle Name</Label>
                <Input
                  id="circle-name"
                  value={newCircle.name}
                  onChange={(e) => setNewCircle({...newCircle, name: e.target.value})}
                  placeholder="E.g., Tech Innovators, Business Mentors"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="circle-description">Description</Label>
                <Textarea
                  id="circle-description"
                  value={newCircle.description}
                  onChange={(e) => setNewCircle({...newCircle, description: e.target.value})}
                  placeholder="What is this circle about? Who should join?"
                  className="min-h-[100px]"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Topics</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a topic"
                    value={currentTopic}
                    onChange={(e) => setCurrentTopic(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTopic();
                      }
                    }}
                  />
                  <Button type="button" variant="outline" onClick={handleAddTopic}>
                    Add
                  </Button>
                </div>
                
                {newCircle.topics.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {newCircle.topics.map(topic => (
                      <Badge key={topic} variant="secondary" className="flex items-center gap-1">
                        {topic}
                        <button
                          type="button"
                          className="ml-1 h-3 w-3 rounded-full bg-muted-foreground/30 text-gray-50 flex items-center justify-center hover:bg-muted-foreground/50"
                          onClick={() => handleRemoveTopic(topic)}
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="circle-public"
                  checked={newCircle.isPublic}
                  onCheckedChange={(checked) => setNewCircle({...newCircle, isPublic: checked})}
                />
                <Label htmlFor="circle-public">Make this circle public</Label>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateCircle} disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Circle"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <Card key={i} className="w-full h-[200px] animate-pulse">
              <div className="h-full bg-gray-200 rounded-lg" />
            </Card>
          ))}
        </div>
      ) : circles.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Circles Found</h3>
            <p className="text-muted-foreground mb-6">
              Create your first group circle to connect with others who share your interests.
            </p>
            <Button onClick={() => setOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Circle
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {circles.map(circle => (
            <Card key={circle.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{circle.name}</CardTitle>
                  {circle.isPublic ? (
                    <Globe className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Lock className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                <CardDescription className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  <span>{circle.members} {circle.members === 1 ? 'member' : 'members'}</span>
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                  {circle.description || "No description provided."}
                </p>
                
                {circle.topics.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {circle.topics.map(topic => (
                      <Badge key={topic} variant="outline" className="text-xs">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
              
              <CardFooter className="bg-muted/50 pt-4">
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => joinCircle(circle.id)}
                >
                  Join Circle
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default GroupCircles;
