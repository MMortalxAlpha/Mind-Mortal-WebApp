import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { motion } from "framer-motion";
import { Users } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import UnauthorizedPage from '@/pages/UnauthorizedPage';
import { usePlanGate } from '@/hooks/usePlanGate';
// Import the actual content creation component
import ContentCreationContainer from "@/components/content/ContentCreationContainer";
import { RouteInfo } from "@/types";

const CreateWisdomResource = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { limits } = usePlanGate();

  // Mentor-only: Master plan required
  if (limits.mentorship !== 'mentor_mentee') return <UnauthorizedPage />;

  // Create a properly typed routeInfo object
  const routeInfo: RouteInfo = {
    returnPath: "/dashboard/mentorship",
    pathname: location.pathname,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="container mx-auto pb-8"
    >
      <Card>
        <CardHeader className="border-b">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-6 w-6 text-primary" />
            <CardTitle>Create Mentorship Resource</CardTitle>
          </div>
          <CardDescription>
            Share your knowledge and connect with others seeking guidance.
          </CardDescription>
        </CardHeader>
        <CardContent className="xs:p-0 pt-6">
          <ContentCreationContainer
            initialTab="mentorship"
            routeInfo={routeInfo}
          />
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default CreateWisdomResource;
