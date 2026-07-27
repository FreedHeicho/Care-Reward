import { useState } from "react";
import { useLocation } from "wouter";
import { useCreateOpportunity, OpportunityInputCategory } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Plus } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";

export default function OpportunityNewPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const createOpportunity = useCreateOpportunity();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<OpportunityInputCategory>("PREVENTATIVE_CARE");
  const [subCategory, setSubCategory] = useState("");
  const [pointsValue, setPointsValue] = useState("100");
  const [logoUrl, setLogoUrl] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    createOpportunity.mutate(
      {
        data: {
          title,
          description,
          category,
          subCategory: subCategory || undefined,
          pointsValue: Number(pointsValue),
          logoUrl: logoUrl || undefined,
        },
      },
      {
        onSuccess: (data) => {
          toast({
            title: "Opportunity created",
            description: `${data.title} has been added to the catalog.`,
          });
          queryClient.invalidateQueries({ queryKey: ["/api/admin/opportunities"] });
          queryClient.invalidateQueries({ queryKey: ["/api/admin/opportunities/stats"] });
          setLocation(`/opportunities/${data.id}`);
        },
        onError: () => {
          toast({
            title: "Error",
            description: "Failed to create opportunity. Please try again.",
            variant: "destructive",
          });
        },
      }
    );
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/opportunities">
          <Button variant="ghost" size="icon" data-testid="button-back">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Create Opportunity
          </h1>
          <p className="text-muted-foreground">
            Define a new wellness behavior that earns points
          </p>
        </div>
      </div>

      <div className="max-w-3xl">
        <Card className="border-card-border">
          <CardHeader>
            <CardTitle>Opportunity Details</CardTitle>
            <CardDescription>
              Fill out the information for the new opportunity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Annual Wellness Visit"
                  required
                  data-testid="input-title"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Complete your annual preventative care checkup with your primary care physician"
                  rows={4}
                  required
                  data-testid="input-description"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select value={category} onValueChange={(v) => setCategory(v as OpportunityInputCategory)}>
                    <SelectTrigger id="category" data-testid="select-category">
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
                  <Label htmlFor="subCategory">Sub-Category</Label>
                  <Input
                    id="subCategory"
                    value={subCategory}
                    onChange={(e) => setSubCategory(e.target.value)}
                    placeholder="e.g., Annual Physical"
                    data-testid="input-subcategory"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pointsValue">Points Value *</Label>
                  <Input
                    id="pointsValue"
                    type="number"
                    min="1"
                    value={pointsValue}
                    onChange={(e) => setPointsValue(e.target.value)}
                    required
                    data-testid="input-points"
                  />
                  <p className="text-xs text-muted-foreground">
                    Points earned when member completes this opportunity
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="logoUrl">Logo URL</Label>
                  <Input
                    id="logoUrl"
                    type="url"
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    placeholder="https://..."
                    data-testid="input-logo-url"
                  />
                  <p className="text-xs text-muted-foreground">
                    Optional icon or logo for this opportunity
                  </p>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <Button
                  type="submit"
                  disabled={createOpportunity.isPending}
                  data-testid="button-create"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {createOpportunity.isPending ? "Creating..." : "Create Opportunity"}
                </Button>
                <Link href="/opportunities">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={createOpportunity.isPending}
                    data-testid="button-cancel"
                  >
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
