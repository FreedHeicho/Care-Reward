import { useState } from "react";
import { useParams, useLocation, Link } from "wouter";
import { useGetOpportunity, useUpdateOpportunity, useDeactivateOpportunity, getGetOpportunityQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { CategoryBadge } from "@/components/category-badge";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Edit, Trash2, CheckCircle2, XCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { OpportunityUpdateCategory } from "@workspace/api-client-react";
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
  const [editNotes, setEditNotes] = useState("");

  const handleOpenEdit = () => {
    if (opportunity) {
      setEditTitle(opportunity.title);
      setEditDescription(opportunity.description);
      setEditCategory(opportunity.category as OpportunityUpdateCategory);
      setEditSubCategory(opportunity.subCategory || "");
      setEditPointsValue(opportunity.pointsValue.toString());
      setEditLogoUrl(opportunity.logoUrl || "");
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
          notes: editNotes || undefined,
        },
      },
      {
        onSuccess: () => {
          toast({
            title: "Opportunity updated",
            description: "Changes have been saved.",
          });
          queryClient.invalidateQueries({ queryKey: getGetOpportunityQueryKey(id) });
          queryClient.invalidateQueries({ queryKey: ["/api/admin/opportunities"] });
          setEditOpen(false);
        },
        onError: () => {
          toast({
            title: "Error",
            description: "Failed to update opportunity. Please try again.",
            variant: "destructive",
          });
        },
      }
    );
  };

  const handleDeactivate = () => {
    deactivateOpportunity.mutate(
      { id },
      {
        onSuccess: () => {
          toast({
            title: "Opportunity deactivated",
            description: "This opportunity is now inactive.",
          });
          queryClient.invalidateQueries({ queryKey: getGetOpportunityQueryKey(id) });
          queryClient.invalidateQueries({ queryKey: ["/api/admin/opportunities"] });
          queryClient.invalidateQueries({ queryKey: ["/api/admin/opportunities/stats"] });
        },
        onError: () => {
          toast({
            title: "Error",
            description: "Failed to deactivate opportunity. Please try again.",
            variant: "destructive",
          });
        },
      }
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

  const actionLabels: Record<string, string> = {
    CREATED: "Created",
    UPDATED: "Updated",
    DEACTIVATED: "Deactivated",
    REACTIVATED: "Reactivated",
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Link href="/opportunities">
            <Button variant="ghost" size="icon" data-testid="button-back">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-foreground">
                {opportunity.title}
              </h1>
              <CategoryBadge category={opportunity.category} />
              {opportunity.isActive ? (
                <Badge variant="default" className="gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Active
                </Badge>
              ) : (
                <Badge variant="secondary" className="gap-1">
                  <XCircle className="w-3 h-3" />
                  Inactive
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground">
              View and edit opportunity details
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <Sheet open={editOpen} onOpenChange={setEditOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" onClick={handleOpenEdit} data-testid="button-edit">
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
              <div className="space-y-6 mt-6">
                <div className="space-y-2">
                  <Label htmlFor="edit-title">Title</Label>
                  <Input
                    id="edit-title"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    data-testid="input-edit-title"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-description">Description</Label>
                  <Textarea
                    id="edit-description"
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    rows={4}
                    data-testid="input-edit-description"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-category">Category</Label>
                    <Select value={editCategory} onValueChange={(v) => setEditCategory(v as OpportunityUpdateCategory)}>
                      <SelectTrigger id="edit-category" data-testid="select-edit-category">
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
                      data-testid="input-edit-subcategory"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-pointsValue">Points Value</Label>
                    <Input
                      id="edit-pointsValue"
                      type="number"
                      min="1"
                      value={editPointsValue}
                      onChange={(e) => setEditPointsValue(e.target.value)}
                      data-testid="input-edit-points"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-logoUrl">Logo URL</Label>
                    <Input
                      id="edit-logoUrl"
                      type="url"
                      value={editLogoUrl}
                      onChange={(e) => setEditLogoUrl(e.target.value)}
                      data-testid="input-edit-logo-url"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-notes">Change Notes</Label>
                  <Textarea
                    id="edit-notes"
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    placeholder="Optional notes about this update"
                    rows={3}
                    data-testid="input-edit-notes"
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={handleUpdate}
                    disabled={updateOpportunity.isPending}
                    data-testid="button-save-edit"
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

          {opportunity.isActive && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" data-testid="button-deactivate">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Deactivate
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Deactivate Opportunity</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will mark the opportunity as inactive. It will no longer be available
                    to members, but the record will be preserved for audit purposes.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeactivate}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    data-testid="button-confirm-deactivate"
                  >
                    {deactivateOpportunity.isPending ? "Deactivating..." : "Deactivate"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Details */}
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
                  <p className="mt-1 text-foreground">
                    {opportunity.isActive ? "Active" : "Inactive"}
                  </p>
                </div>
              </div>

              {opportunity.logoUrl && (
                <div>
                  <Label className="text-muted-foreground text-sm">Logo URL</Label>
                  <p className="mt-1 text-foreground truncate">
                    <a
                      href={opportunity.logoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {opportunity.logoUrl}
                    </a>
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-card-border">
            <CardHeader>
              <CardTitle>Author History</CardTitle>
              <CardDescription>
                Complete audit trail of all changes
              </CardDescription>
            </CardHeader>
            <CardContent>
              {opportunity.authors && opportunity.authors.length > 0 ? (
                <div className="space-y-4">
                  {opportunity.authors.map((author, idx) => (
                    <div
                      key={author.id}
                      className="flex gap-4 pb-4 border-b last:border-0 last:pb-0 animate-stagger-in"
                      style={{ animationDelay: `${idx * 40}ms` }}
                      data-testid={`entry-author-${author.id}`}
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
                <p className="mt-1 font-mono text-foreground">{opportunity.id}</p>
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
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
