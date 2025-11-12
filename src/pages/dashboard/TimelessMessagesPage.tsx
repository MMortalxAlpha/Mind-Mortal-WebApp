import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Clock,
  Mail,
  CalendarDays,
  User,
  MessageSquare,
  Plus,
  Edit,
  Eye,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import PostInteractions from "@/components/social/PostInteractions";
import PostDetailsModal from "@/components/modals/PostDetailsModal";
import { Badge } from "@/components/ui/badge";
import DashboardAnimatedBackground from "@/components/dashboard/DashboardAnimatedBackground";

const TimelessMessagesPage: React.FC = () => {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchMessages();
    }
  }, [user]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("timeless_messages")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching messages:", error);
      } else {
        setMessages(data || []);
      }
    } catch (err) {
      console.error("Error in fetch operation:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMessage = () => {
    navigate("/dashboard/timeless-messages/create");
  };

  const handleViewDetails = (message: any) => {
    setSelectedMessage(message);
    setIsModalOpen(true);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10,
      },
    },
  };

  // Helper function to render content safely
  const renderContent = (content: any) => {
    if (!content)
      return <p className="text-muted-foreground">No content available</p>;

    let textContent = "";

    // If content is a string, use it directly
    if (typeof content === "string") {
      textContent = content;
    }
    // If content is an object with a text property
    else if (content && typeof content === "object") {
      if (content.text) {
        textContent = content.text;
      } else if (content.html) {
        // Return HTML content with dangerouslySetInnerHTML
        return (
          <div
            className="line-clamp-3"
            dangerouslySetInnerHTML={{ __html: content.html }}
          />
        );
      }
    }

    return <p className="line-clamp-3">{textContent}</p>;
  };

  return (
    <DashboardAnimatedBackground objectCount={5}>
      <div className="container mx-auto max-w-6xl xs:p-2">
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex justify-between items-center xs:flex-col xs:items-start xs:gap-2">
            <div>
              <h1 className="text-3xl font-bold">Timeless Messages</h1>
              <p className="text-muted-foreground mt-2">
                Create messages to be delivered at specific times or events
              </p>
            </div>
            <Button
              className="flex items-center bg-[#4C6B8A] hover:bg-[#4C6B8A]/80 gap-2"
              onClick={handleCreateMessage}
            >
              <Plus className="h-4 w-4" />
              Create Message
            </Button>
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
            {messages.map((message) => (
              <motion.div
                key={message.id}
                variants={itemVariants}
                whileHover={{ scale: 1.01 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Card className="hover:shadow-lg transition-all hover:bg-[#4C6B8A]/10 hover:border-[#4C6B8A] duration-300">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {message.delivery_type === "date" ? (
                        <CalendarDays className="h-5 w-5 text-primary" />
                      ) : (
                        <Clock className="h-5 w-5 text-primary" />
                      )}
                      {message.title}
                      <Badge
                        variant={
                          message.status === "sent" ? "default" : "secondary"
                        }
                      >
                        {message.status}
                      </Badge>
                    </CardTitle>
                    <CardDescription className="flex items-center gap-4">
                      <span>
                        Created on{" "}
                        {new Date(message.created_at).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Mail className="h-4 w-4" />
                        {message.recipient_emails &&
                        Array.isArray(message.recipient_emails)
                          ? message.recipient_emails.length
                          : 0}{" "}
                        recipients
                      </span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-secondary/50 p-4 rounded-md mb-4">
                      {message.delivery_type === "date" ? (
                        <p className="font-medium">
                          Will be delivered on:{" "}
                          {message.delivery_date
                            ? new Date(
                                message.delivery_date
                              ).toLocaleDateString()
                            : "Date not specified"}
                        </p>
                      ) : (
                        <p className="font-medium">
                          Will be delivered on event:{" "}
                          {message.delivery_event || "Event not specified"}
                        </p>
                      )}
                    </div>
                    {renderContent(message.content)}
                  </CardContent>
                  <CardFooter className="flex flex-col items-stretch">
                    <PostInteractions
                      postId={message.id}
                      postType="timeless_message"
                      onUpdate={fetchMessages}
                    />
                    <div className="flex justify-end mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-[#4C6B8A]/80 text-white hover:bg-[#4C6B8A]/50"
                        onClick={() => handleViewDetails(message)}
                      >
                        View Details
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}

            {messages.length === 0 && (
              <motion.div variants={itemVariants}>
                <Card className="border-dashed">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <MessageSquare className="h-12 w-12 mb-4 text-muted-foreground" />
                    <h3 className="text-xl font-medium mb-2">
                      No messages yet
                    </h3>
                    <p className="text-muted-foreground mb-6 text-center max-w-md">
                      Create your first timeless message to send to future
                      recipients
                    </p>
                    <Button
                      className="xs:p-1 bg-[#4C6B8A] hover:bg-[#4C6B8A]/80"
                      onClick={handleCreateMessage}
                    >
                      <Plus className="h-4 w-4 mr-2" /> Create Your First
                      Message
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </motion.div>
        )}

        <PostDetailsModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          post={selectedMessage}
          postType="timeless_message"
          onUpdate={fetchMessages}
        />
      </div>
    </DashboardAnimatedBackground>
  );
};

export default TimelessMessagesPage;
