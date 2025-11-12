import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { motion } from "framer-motion";
import { Archive } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

// Import the actual content creation component
import ContentCreationContainer from "@/components/content/ContentCreationContainer";
import { RouteInfo } from "@/types";



const CreateLegacyPost = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Create a properly typed routeInfo object
  const routeInfo: RouteInfo = {
    returnPath: "/dashboard/legacy-vault",
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
            <Archive className="h-6 w-6 text-primary" />
            <CardTitle>Create Legacy Post</CardTitle>
          </div>
          <CardDescription>
            Preserve your stories, wisdom, and experiences for future
            generations.
          </CardDescription>
        </CardHeader>
        <CardContent className="xs:p-0 pt-6">
          <ContentCreationContainer
            initialTab="legacy-vault"
            routeInfo={routeInfo}
          />
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default CreateLegacyPost;
