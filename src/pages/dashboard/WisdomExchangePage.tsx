
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Plus, BookOpen, Star, Award } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import PostInteractions from '@/components/social/PostInteractions';
import PostDetailsModal from '@/components/modals/PostDetailsModal';
import { Badge } from "@/components/ui/badge";
import DashboardAnimatedBackground from '@/components/dashboard/DashboardAnimatedBackground';

const WisdomExchangePage: React.FC = () => {
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedResource, setSelectedResource] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchResources();
    }
  }, [user]);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('wisdom_resources')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching resources:', error);
      } else {
        setResources(data || []);
      }
    } catch (err) {
      console.error('Error in fetch operation:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateResource = () => {
    navigate('/dashboard/wisdom-exchange/create');
  };

  const handleBecomeMentor = () => {
    // Navigate to mentor application form
    navigate('/dashboard/become-mentor');
  };

  const handleViewDetails = (resource: any) => {
    setSelectedResource(resource);
    setIsModalOpen(true);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10
      }
    }
  };

  const getResourceTypeIcon = (type: string) => {
    switch (type) {
      case 'article':
        return <BookOpen className="h-5 w-5 text-blue-500" />;
      case 'video':
        return <Users className="h-5 w-5 text-green-500" />;
      case 'course':
        return <Award className="h-5 w-5 text-purple-500" />;
      default:
        return <BookOpen className="h-5 w-5 text-primary" />;
    }
  };

  return (
    <DashboardAnimatedBackground objectCount={6}>
      <div className="container mx-auto max-w-6xl">
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Wisdom Exchange</h1>
              <p className="text-muted-foreground mt-2">
                Share your knowledge and learn from others in the community
              </p>
            </div>
            {profile?.is_mentor ? (
              <Button 
                className="flex items-center gap-2"
                onClick={handleCreateResource}
              >
                <Plus className="h-4 w-4" />
                Create Resource
              </Button>
            ) : (
              <Button 
                className="flex items-center gap-2"
                onClick={handleBecomeMentor}
              >
                <Users className="h-4 w-4" />
                Become a Mentor
              </Button>
            )}
          </div>
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 gap-6"
          >
            {resources.map(resource => (
              <motion.div 
                key={resource.id} 
                variants={itemVariants}
                whileHover={{ scale: 1.01 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Card className="hover:shadow-lg transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {getResourceTypeIcon(resource.resource_type)}
                      {resource.title}
                      {resource.is_featured && (
                        <Badge variant="secondary" className="ml-2">
                          <Star className="h-3 w-3 mr-1" />
                          Featured
                        </Badge>
                      )}
                      {resource.approved && (
                        <Badge variant="default" className="ml-2">
                          Approved
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-4">
                      <span>Created on {new Date(resource.created_at).toLocaleDateString()}</span>
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {resource.views_count || 0} views
                      </span>
                      <Badge variant="outline">
                        {resource.resource_type}
                      </Badge>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {resource.description && (
                      <p className="text-muted-foreground mb-3">{resource.description}</p>
                    )}
                    {resource.tags && resource.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {resource.tags.map((tag: string, index: number) => (
                          <Badge key={index} variant="outline">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="flex flex-col items-stretch">
                    <PostInteractions 
                      postId={resource.id} 
                      postType="wisdom_resource"
                      onUpdate={fetchResources}
                    />
                    <div className="flex justify-end mt-4">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewDetails(resource)}
                      >
                        View Details
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}

            {resources.length === 0 && (
              <motion.div variants={itemVariants}>
                <Card className="border-dashed">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Users className="h-12 w-12 mb-4 text-muted-foreground" />
                    <h3 className="text-xl font-medium mb-2">No resources yet</h3>
                    <p className="text-muted-foreground mb-6 text-center max-w-md">
                      Start sharing your knowledge and experience with the community
                    </p>
                    {profile?.is_mentor ? (
                      <Button onClick={handleCreateResource}>
                        <Plus className="h-4 w-4 mr-2" /> Share Your First Resource
                      </Button>
                    ) : (
                      <Button onClick={handleBecomeMentor}>
                        <Users className="h-4 w-4 mr-2" /> Become a Mentor
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </motion.div>
        )}

        <PostDetailsModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          post={selectedResource}
          postType="wisdom_resource"
          onUpdate={fetchResources}
        />
      </div>
    </DashboardAnimatedBackground>
  );
};

export default WisdomExchangePage;
