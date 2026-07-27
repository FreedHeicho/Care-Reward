import { useState } from "react";
import { useParams, useLocation, Link } from "wouter";
import {
  useGetOpportunity,
  useUpdateOpportunity,
  useDeactivateOpportunity,
  getGetOpportunityQueryKey,
  OpportunityUpdateCategory,
  OpportunityUpdateAudience,
  OpportunityUpdateCompletionType,
  OpportunityUpdateOppStatus,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { CategoryBadge } from "@/components/category-badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ArrowLeft, Edit, Trash2, Send } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

// ── Labels ────────────────────────────────────────────────────────────────────

const actionLabels: Record<string, string> = {
  CREATED: "Created",
  UPDATED: "Updated",
  DEACTIVATED: "Deactivated",
  REACTIVATED: "Reactivated",
};

const audienceLabels: Record<string, string> = {
  ALL_USERS: "All users",
  EMPLOYER_SPECIFIC: "Employer specific",
  INDIVIDUAL_ONLY: "Individual users only",
};

const completionLabels: Record<string, string> = {
  SELF_REPORTED: "Self-reported by user",
  EMR_VERIFIED: "Verified by EMR data",
  ADMIN_VERIFIED: "Manual admin verification",
};

function OppStatusBadge({ status }: { status: string }) {
  if (status === "ACTIVE")
    return <Badge className="bg-emerald-500/15 text-emerald-700 border-emerald-200">Active</Badge>;
  if (status === "DRAFT")
    return <Badge variant="outline" className="border-amber-300 text-amber-700 bg-amber-50">Draft</Badge>;
  return <Badge variant="secondary">Archived</Badge>;
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function OpportunityDetailPage() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const id = params.id!;

  const { data: opportunity, isLoading } = useGetOpportunity(id);
  const updateOpportunity = useUpdateOpportunity();
  const deactivateOpportunity = useDeactivateOpportunity();

  const [editOpen, setEditOpen] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editCategory, setEditCategory] = useState<OpportunityUpdateCategory>("PREVENTATIVE_CARE");
  const [editSubCategory, setEditSubCategory] = useState("");
  const [editPointsValue, setEditPointsValue] = useState("");
  const [editLogoUrl, setEditLogoUrl] = useState("");
  const [editWindowStart, setEditWindowStart] = useState("");
  const [editWindowEnd, setEditWindowEnd] = useState("");
  const [editAudience, setEditAudience] = useState<OpportunityUpdateAudience>("ALL_USERS");
  const [editCompletionType, setEditCompletionType] = useState<OpportunityUpdateCompletionType>("SELF_REPORTED");
  const [editOppStatus, setEditOppStatus] = useState<OpportunityUpdateOppStatus>("DRAFT");
  const [editNotes, setEditNotes] = useState("");

  const handleOpenEdit = () => {
    if (opportunity) {
      setEditTitle(opportunity.title);
      setEditDescription(opportunity.description);
      setEditCategory(opportunity.category as OpportunityUpdateCategory);
      setEditSubCategory(opportunity.subCategory || "");
      setEditPointsValue(opportunity.pointsValue.toString());
      setEditLogoUrl(opportunity.logoUrl || "");
      setEditWindowStart(opportunity.windowStart || "");
      setEditWindowEnd(opportunity.windowEnd || "");
      setEditAudience((opportunity.audience as OpportunityUpdateAudience | null) || "ALL_USERS");
      setEditCompletionType((opportunity.completionType as OpportunityUpdateCompletionType | null) || "SELF_REPORTED");
      setEditOppStatus(opportunity.oppStatus as OpportunityUpdateOppStatus);
      setEditNotes("");
      setEditOpen(true);
    }
  };

  const handleUpdate = () => {
    updateOpportunity.mutate(
      {
        id,
        data: {
          title: editTitle,
          description: editDescription,
          category: editCategory,
          subCategory: editSubCategory || undefined,
          pointsValue: Number(editPointsValue),
          logoUrl: editLogoUrl || undefined,
          windowStart: editWindowStart || null,
          windowEnd: editWindowEnd || null,
          audience: editAudience,
          completionType: editCompletionType,
          oppStatus: editOppStatus,
          notes: editNotes || undefined,
        },
      },
      {
        onSuccess: () => {
          toast({ title: "Opportunity updated", description: "Changes saved." });
          queryClient.invalidateQueries({ queryKey: getGetOpportunityQueryKey(id) });
          queryClient.invalidateQueries({ queryKey: ["/api/admin/opportunities"] });
          queryClient.invalidateQueries({ queryKey: ["/api/admin/opportunities/stats"] });
          setEditOpen(false);
        },
        onError: () => {
          toast({ title: "Error", description: "Failed to update.", variant: "destructive" });
        },
      },
    );
  };

  const handlePublish = () => {
    updateOpportunity.mutate(
      { id, data: { oppStatus: "ACTIVE", notes: "Published from draft" } },
      {
        onSuccess: () => {
          toast({ title: "Opportunity published", description: "Now live in the catalog." });
          queryClient.invalidateQueries({ queryKey: getGetOpportunityQueryKey(id) });
          queryClient.invalidateQueries({ queryKey: ["/api/admin/opportunities"] });
          queryClient.invalidateQueries({ queryKey: ["/api/admin/opportunities/stats"] });
        },
        onError: () => {
          toast({ title: "Error", description: "Failed to publish.", variant: "destructive" });
        },
      },
    );
  };

  const handleDeactivate = () => {
    deactivateOpportunity.mutate(
      { id },
      {
        onSuccess: () => {
          toast({ title: "Opportunity archived", description: "No longer visible to members." });
          queryClient.invalidateQueries({ queryKey: getGetOpportunityQueryKey(id) });
          queryClient.invalidateQueries({ queryKey: ["/api/admin/opportunities"] });
          queryClient.invalidateQueries({ queryKey: ["/api/admin/opportunities/stats"] });
        },
        onError: () => {
          toast({ title: "Error", description: "Failed to archive.", variant: "destructive" });
        },
      },
    );
  };

  if (isLoading) {
    return (
      <div className="p-8 space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!opportunity) {
    return (
      <div className="p-8">
        <p className="text-muted-foreground">Opportunity not found</p>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Link href="/opportunities">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-bold text-foreground">
                {opportunity.title}
              </h1>
              <CategoryBadge category={opportunity.category} />
              <OppStatusBadge status={opportunity.oppStatus} />
            </div>
            <p className="text-muted-foreground">View and edit opportunity details</p>
          </div>
        </div>

        <div className="flex gap-2">
          {/* Publish from draft */}
          {opportunity.oppStatus === "DRAFT" && (
            <Button
              variant="default"
              onClick={handlePublish}
              disabled={updateOpportunity.isPending}
            >
              <Send className="w-4 h-4 mr-2" />
              {updateOpportunity.isPending ? "Publishing..." : "Publish"}
            </Button>
          )}

          {/* Edit */}
          <Sheet open={editOpen} onOpenChange={setEditOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" onClick={handleOpenEdit}>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
              <SheetHeader>
                <SheetTitle>Edit Opportunity</SheetTitle>
                <SheetDescription>
                  Update opportunity details and track the change
                </SheetDescription>
              </SheetHeader>

              <div className="space-y-5 mt-6">
                {/* Status */}
                <div className="space-y-2">
                  <Label htmlFor="edit-status">Status</Label>
                  <Select
                    value={editOppStatus}
                    onValueChange={(v) => setEditOppStatus(v as OpportunityUpdateOppStatus)}
                  >
                    <SelectTrigger id="edit-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DRAFT">Draft</SelectItem>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="ARCHIVED">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-title">Title</Label>
                  <Input
                    id="edit-title"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-description">Description</Label>
                  <Textarea
                    id="edit-description"
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-category">Category</Label>
                    <Select
                      value={editCategory}
                      onValueChange={(v) => setEditCategory(v as OpportunityUpdateCategory)}
                    >
                      <SelectTrigger id="edit-category">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CARE_SITE_ALTERNATIVE">Care Site Alternative</SelectItem>
                        <SelectItem value="CARE_PROTOCOL">Care Protocol</SelectItem>
                        <SelectItem value="PREVENTATIVE_CARE">Preventative Care</SelectItem>
                        <SelectItem value="CARE_QUALITY">Care Quality</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-subCategory">Sub-Category</Label>
                    <Input
                      id="edit-subCategory"
                      value={editSubCategory}
                      onChange={(e) => setEditSubCategory(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-points">Points Value</Label>
                    <Input
                      id="edit-points"
                      type="number"
                      min="1"
                      value={editPointsValue}
                      onChange={(e) => setEditPointsValue(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-logo">Logo URL</Label>
                    <Input
                      id="edit-logo"
                      type="url"
                      value={editLogoUrl}
                      onChange={(e) => setEditLogoUrl(e.target.value)}
                    />
                  </div>
                </div>

                {/* Window */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-window-start">Window Start</Label>
                    <Input
                      id="edit-window-start"
                      type="date"
                      value={editWindowStart}
                      onChange={(e) => setEditWindowStart(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-window-end">Window End</Label>
                    <Input
                      id="edit-window-end"
                      type="date"
                      value={editWindowEnd}
                      onChange={(e) => setEditWindowEnd(e.target.value)}
                    />
                  </div>
                </div>

                {/* Audience */}
                <div className="space-y-2">
                  <Label>Who Sees This</Label>
                  <RadioGroup
                    value={editAudience}
                    onValueChange={(v) => setEditAudience(v as OpportunityUpdateAudience)}
                    className="space-y-2"
                  >
                    {(["ALL_USERS", "EMPLOYER_SPECIFIC", "INDIVIDUAL_ONLY"] as const).map((v) => (
                      <div key={v} className="flex items-center gap-2">
                        <RadioGroupItem value={v} id={`edit-aud-${v}`} />
                        <Label htmlFor={`edit-aud-${v}`} className="cursor-pointer font-normal">
                          {audienceLabels[v]}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                {/* Completion Type */}
                <div className="space-y-2">
                  <Label>Completion Verification</Label>
                  <RadioGroup
                    value={editCompletionType}
                    onValueChange={(v) => setEditCompletionType(v as OpportunityUpdateCompletionType)}
                    className="space-y-2"
                  >
                    {(["SELF_REPORTED", "EMR_VERIFIED", "ADMIN_VERIFIED"] as const).map((v) => (
                      <div key={v} className="flex items-center gap-2">
                        <RadioGroupItem value={v} id={`edit-comp-${v}`} />
                        <Label htmlFor={`edit-comp-${v}`} className="cursor-pointer font-normal">
                          {completionLabels[v]}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-notes">Change Notes</Label>
                  <Textarea
                    id="edit-notes"
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    placeholder="Optional notes about this update"
                    rows={2}
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    onClick={handleUpdate}
                    disabled={updateOpportunity.isPending}
                  >
                    {updateOpportunity.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setEditOpen(false)}
                    disabled={updateOpportunity.isPending}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          {/* Archive */}
          {opportunity.oppStatus !== "ARCHIVED" && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Archive
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Archive Opportunity</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will remove the opportunity from the active catalog.
                    It will no longer be assigned to members, but all records
                    are preserved for audit purposes.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeactivate}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {deactivateOpportunity.isPending ? "Archiving..." : "Archive"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-card-border">
            <CardHeader>
              <CardTitle>Details</CardTitle>
              <CardDescription>Core opportunity information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-muted-foreground text-sm">Description</Label>
                <p className="mt-1 text-foreground">{opportunity.description}</p>
              </div>

              {opportunity.subCategory && (
                <div>
                  <Label className="text-muted-foreground text-sm">Sub-Category</Label>
                  <p className="mt-1 text-foreground">{opportunity.subCategory}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground text-sm">Points Value</Label>
                  <p className="mt-1 text-2xl font-bold font-mono text-primary">
                    {opportunity.pointsValue}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-sm">Status</Label>
                  <div className="mt-1">
                    <OppStatusBadge status={opportunity.oppStatus} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground text-sm">Who Sees This</Label>
                  <p className="mt-1 text-foreground">
                    {opportunity.audience
                      ? audienceLabels[opportunity.audience] ?? opportunity.audience
                      : "—"}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-sm">Completion</Label>
                  <p className="mt-1 text-foreground">
                    {opportunity.completionType
                      ? completionLabels[opportunity.completionType] ?? opportunity.completionType
                      : "—"}
                  </p>
                </div>
              </div>

              {(opportunity.windowStart || opportunity.windowEnd) && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground text-sm">Window Start</Label>
                    <p className="mt-1 text-foreground font-mono text-sm">
                      {opportunity.windowStart
                        ? format(new Date(opportunity.windowStart), "MMM d, yyyy")
                        : "—"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-sm">Window End</Label>
                    <p className="mt-1 text-foreground font-mono text-sm">
                      {opportunity.windowEnd
                        ? format(new Date(opportunity.windowEnd), "MMM d, yyyy")
                        : "—"}
                    </p>
                  </div>
                </div>
              )}

              {opportunity.logoUrl && (
                <div>
                  <Label className="text-muted-foreground text-sm">Logo URL</Label>
                  <a
                    href={opportunity.logoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 block text-primary hover:underline truncate text-sm"
                  >
                    {opportunity.logoUrl}
                  </a>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Author History */}
          <Card className="border-card-border">
            <CardHeader>
              <CardTitle>Author History</CardTitle>
              <CardDescription>Complete audit trail of all changes</CardDescription>
            </CardHeader>
            <CardContent>
              {opportunity.authors && opportunity.authors.length > 0 ? (
                <div className="space-y-4">
                  {opportunity.authors.map((author, idx) => (
                    <div
                      key={author.id}
                      className="flex gap-4 pb-4 border-b last:border-0 last:pb-0"
                      style={{ animationDelay: `${idx * 40}ms` }}
                    >
                      <div className="flex-shrink-0 w-2 h-2 rounded-full bg-primary mt-2" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-foreground">
                            {author.authorName || "Unknown"}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {actionLabels[author.action] || author.action}
                          </Badge>
                        </div>
                        {author.notes && (
                          <p className="text-sm text-muted-foreground mb-1">
                            {author.notes}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(author.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No author history available</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Metadata Sidebar */}
        <div className="space-y-6">
          <Card className="border-card-border">
            <CardHeader>
              <CardTitle>Metadata</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <Label className="text-muted-foreground text-xs">Opportunity ID</Label>
                <p className="mt-1 font-mono text-foreground text-xs break-all">
                  {opportunity.id}
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground text-xs">Created</Label>
                <p className="mt-1 text-foreground">
                  {formatDistanceToNow(new Date(opportunity.createdAt), { addSuffix: true })}
                </p>
              </div>
              {opportunity.createdByName && (
                <div>
                  <Label className="text-muted-foreground text-xs">Created By</Label>
                  <p className="mt-1 text-foreground">{opportunity.createdByName}</p>
                </div>
              )}
              <div>
                <Label className="text-muted-foreground text-xs">Author Events</Label>
                <p className="mt-1 text-foreground">
                  {opportunity.authors?.length ?? 0}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
