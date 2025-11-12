import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Check, Eye, Loader2, X } from "lucide-react";
import { useEffect, useState } from "react";

interface MentorApplication {
  id: string;
  fullName: string;
  email: string;
  avatarUrl: string | null;
  expertise: string[];
  industries: string[];
  experienceYears: number;
  appliedAt: string;
}

const MentorApplications = () => {
  const [applications, setApplications] = useState<MentorApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] =
    useState<MentorApplication | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchMentorApplications();
  }, []);

  const fetchMentorApplications = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("mentor_applications_view")
        .select("*");

      if (error) throw error;

      const formattedApplications: MentorApplication[] = (data || []).map(
        (item) => ({
          id: item.id,
          fullName: item.full_name || "Unknown",
          email: item.email || "No email",
          avatarUrl: item.avatar_url || null,
          expertise: item.expertise || [],
          industries: item.industries || [],
          experienceYears: item.experience_years || 0,
          appliedAt: new Date(item.created_at).toLocaleDateString(),
        })
      );

      setApplications(formattedApplications);
    } catch (error) {
      console.error("Error fetching mentor applications:", error);
      toast({
        title: "Error",
        description: "Failed to load mentor applications",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewApplication = (application: MentorApplication) => {
    setSelectedApplication(application);
    setViewDialogOpen(true);
  };

  const handleApproveApplication = async (id: string) => {
    setProcessingId(id);
    try {
      const { data, error } = await supabase.rpc(
        "approve_mentor_verification",
        {
          mentor_id: id,
        }
      );

      if (error) throw error;

      toast({
        title: "Success",
        description: "Mentor application approved successfully",
      });

      await fetchMentorApplications();
    } catch (error) {
      console.error("Error approving mentor application:", error);
      toast({
        title: "Error",
        description: "Failed to approve mentor application",
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectDialogOpen = (application: MentorApplication) => {
    setSelectedApplication(application);
    setRejectionReason("");
    setRejectDialogOpen(true);
  };

  const handleRejectApplication = async () => {
    if (!selectedApplication) return;

    setProcessingId(selectedApplication.id);
    try {
      // Create a rejection notification for the user
      const { error } = await supabase.from("notifications").insert({
        user_id: selectedApplication.id,
        type: "mentor_verification_rejected",
        title: "Mentor Verification Rejected",
        description:
          rejectionReason ||
          "Your request to become a mentor was not approved at this time.",
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Mentor application rejected successfully",
      });

      setRejectDialogOpen(false);
      await fetchMentorApplications();
    } catch (error) {
      console.error("Error rejecting mentor application:", error);
      toast({
        title: "Error",
        description: "Failed to reject mentor application",
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Mentor Applications</h1>
        <Button onClick={fetchMentorApplications} variant="outline">
          Refresh
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="flex flex-col items-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Loading applications...</p>
          </div>
        </div>
      ) : applications.length > 0 ? (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Applicant</TableHead>
                <TableHead>Expertise</TableHead>
                <TableHead>Experience</TableHead>
                <TableHead>Applied On</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.map((application) => (
                <TableRow key={application.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={application.avatarUrl || undefined} />
                        <AvatarFallback>
                          {application.fullName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{application.fullName}</p>
                        <p className="text-sm text-muted-foreground">
                          {application.email}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {application.expertise.slice(0, 2).map((item, idx) => (
                        <Badge key={idx} variant="outline">
                          {item}
                        </Badge>
                      ))}
                      {application.expertise.length > 2 && (
                        <Badge variant="outline">
                          +{application.expertise.length - 2}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{application.experienceYears} years</TableCell>
                  <TableCell>{application.appliedAt}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleViewApplication(application)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-green-500 hover:text-green-600 hover:bg-green-100"
                        onClick={() => handleApproveApplication(application.id)}
                        disabled={processingId === application.id}
                      >
                        {processingId === application.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Check className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500 hover:text-red-600 hover:bg-red-100"
                        onClick={() => handleRejectDialogOpen(application)}
                        disabled={processingId === application.id}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="bg-muted/30 rounded-lg p-8 text-center">
          <p className="text-lg font-medium mb-2">No Pending Applications</p>
          <p className="text-muted-foreground">
            There are currently no pending mentor applications to review.
          </p>
        </div>
      )}

      {/* View Application Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Application Details</DialogTitle>
            <DialogDescription>
              Review the mentor application information.
            </DialogDescription>
          </DialogHeader>

          {selectedApplication && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage
                    src={selectedApplication.avatarUrl || undefined}
                  />
                  <AvatarFallback>
                    {selectedApplication.fullName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium">
                    {selectedApplication.fullName}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedApplication.email}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-1">Experience</h4>
                <p>{selectedApplication.experienceYears} years</p>
              </div>

              <div>
                <h4 className="font-medium mb-1">Expertise</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedApplication.expertise.map((item, idx) => (
                    <Badge key={idx} variant="secondary">
                      {item}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-1">Industries</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedApplication.industries.map((item, idx) => (
                    <Badge key={idx} variant="outline">
                      {item}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Application Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Reject Application</DialogTitle>
            <DialogDescription>
              Provide a reason for rejecting this mentor application.
            </DialogDescription>
          </DialogHeader>

          {selectedApplication && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-4 mb-4">
                <Avatar className="h-10 w-10">
                  <AvatarImage
                    src={selectedApplication.avatarUrl || undefined}
                  />
                  <AvatarFallback>
                    {selectedApplication.fullName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium">
                    {selectedApplication.fullName}
                  </h3>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="reason" className="text-sm font-medium">
                  Rejection Reason (Optional)
                </label>
                <Textarea
                  id="reason"
                  placeholder="Provide feedback on why the application is being rejected..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={4}
                />
              </div>
            </div>
          )}

          <DialogFooter className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setRejectDialogOpen(false)}
              disabled={processingId !== null}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRejectApplication}
              disabled={processingId !== null}
            >
              {processingId !== null ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Rejecting...
                </>
              ) : (
                "Reject Application"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MentorApplications;
