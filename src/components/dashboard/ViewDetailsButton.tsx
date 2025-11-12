
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export interface ViewDetailsButtonProps {
  route: string;
  text?: string;
  tooltip?: string;
  // Adding properties used in IdeaVaultPage
  type?: string;
  id?: string;
  title?: string;
}

const ViewDetailsButton: React.FC<ViewDetailsButtonProps> = ({
  route,
  text = "View Details",
  tooltip,
  type,
  id,
  title
}) => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    // If type, id and title are provided, use them to build the route
    const finalRoute = type && id 
      ? `/dashboard/${type}/view/${id}`
      : route;
      
    navigate(finalRoute);
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
            onClick={handleClick}
          >
            {text}
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </TooltipTrigger>
        {tooltip && (
          <TooltipContent>
            <p>{tooltip}</p>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
};

export default ViewDetailsButton;
