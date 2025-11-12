
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TimelineItem } from '@/types';
import { format } from 'date-fns';
import { ChevronRight, FileText, Image, Video, Mic, File } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface LegacyTimelineProps {
  items: TimelineItem[];
}

const LegacyTimeline: React.FC<LegacyTimelineProps> = ({ items }) => {
  const navigate = useNavigate();
  
  const getTimelineIcon = (type: string) => {
    switch (type) {
      case 'text':
        return <FileText className="h-5 w-5 text-blue-500" />;
      case 'image':
        return <Image className="h-5 w-5 text-green-500" />;
      case 'video':
        return <Video className="h-5 w-5 text-red-500" />;
      case 'audio':
        return <Mic className="h-5 w-5 text-purple-500" />;
      default:
        return <File className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-300 before:to-transparent">
      {items.length === 0 ? (
        <Card className="text-center py-8">
          <CardContent>
            <p className="text-muted-foreground">No legacy items found in your timeline.</p>
            <Button 
              onClick={() => navigate('/dashboard/legacy-vault/create')}
              className="mt-4"
            >
              Add Your First Legacy Item
            </Button>
          </CardContent>
        </Card>
      ) : (
        items.map((item, index) => (
          <div key={item.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
            <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-white shadow-md shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
              {getTimelineIcon(item.type)}
            </div>
            
            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 rounded-lg border shadow-sm">
              <div className="flex items-center justify-between space-x-2 mb-1">
                <Badge variant="outline">
                  {format(new Date(item.date), 'MMM d, yyyy')}
                </Badge>
                <Badge variant="secondary">{item.type}</Badge>
              </div>
              
              <h3 className="font-semibold text-gray-900">{item.title}</h3>
              {item.content && (
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">{item.content}</p>
              )}
              
              <Button 
                variant="ghost" 
                size="sm" 
                className="mt-3 flex items-center" 
                onClick={() => navigate(`/dashboard/legacy-vault/view/${item.id}`)}
              >
                View Details
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default LegacyTimeline;
