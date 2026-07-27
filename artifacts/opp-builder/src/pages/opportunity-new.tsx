import { useState } from "react";
import { useLocation } from "wouter";
import {
  useCreateOpportunity,
  OpportunityInputCategory,
  OpportunityInputAudience,
  OpportunityInputCompletionType,
  OpportunityInputOppStatus,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, BookOpen, Send } from "lucide-react";
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
  const [windowStart, setWindowStart] = useState("");
  const [windowEnd, setWindowEnd] = useState("");
  const [audience, setAudience] = useState<OpportunityInputAudience>("ALL_USERS");
  const [completionType, setCompletionType] = useState<OpportunityInputCompletionType>("SELF_REPORTED");

  const handleSubmit = (targetStatus: OpportunityInputOppStatus) => {
    createOpportunity.mutate(
      {
        data: {
          title,
          description,
          category,
          subCategory: subCategory || undefined,
          pointsValue: Number(pointsValue),
          logoUrl: logoUrl || undefined,
          oppStatus: targetStatus,
          audience,
          completionType,
          windowStart: windowStart || undefined,
          windowEnd: windowEnd || undefined,
        },
      },
      {
        onSuccess: (data) => {
          toast({
            title:
              targetStatus === "ACTIVE"
                ? "Opportunity published"
                : "Draft saved",
            description:
              targetStatus === "ACTIVE"
                ? `${data.title} is now live in the catalog.`
                : `${data.title} has been saved as a draft.`,
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
      },
    );
  };

  const handleFormSubmit = (e: React.FormEvent, status: OpportunityInputOppStatus) => {
    e.preventDefault();
    handleSubmit(status);
  };

  const isValid = title.trim() && description.trim() && pointsValue && Number(pointsValue) >= 1;

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/opportunities">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-1">
            Create Opportunity
          </h1>
          <p className="text-muted-foreground">
            Define a new wellness behavior that earns points
          </p>
        </div>
      </div>

      <form
        className="max-w-3xl space-y-6"
        onSubmit={(e) => e.preventDefault()}
      >
        {/* Core Details */}
        <Card className="border-card-border">
          <CardHeader>
            <CardTitle>Core Details</CardTitle>
            <CardDescription>
              What members will see when this opportunity is assigned to them
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Schedule Annual Wellness Visit"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Book and complete your annual preventative care checkup with your primary care physician"
                rows={4}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={category}
                  onValueChange={(v) => setCategory(v as OpportunityInputCategory)}
                >
                  <SelectTrigger id="category">
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
                  placeholder="Annual Checkup"
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
                />
                <p className="text-xs text-muted-foreground">
                  Points earned when member completes this
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
                />
                <p className="text-xs text-muted-foreground">
                  Optional icon shown in the mobile app
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Availability Window */}
        <Card className="border-card-border">
          <CardHeader>
            <CardTitle>Availability Window</CardTitle>
            <CardDescription>
              Date range this opportunity is open. Leave blank to use the
              scheduler's default 30-day rolling window.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="windowStart">Start Date</Label>
              <Input
                id="windowStart"
                type="date"
                value={windowStart}
                onChange={(e) => setWindowStart(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="windowEnd">End Date</Label>
              <Input
                id="windowEnd"
                type="date"
                value={windowEnd}
                onChange={(e) => setWindowEnd(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Audience */}
        <Card className="border-card-border">
          <CardHeader>
            <CardTitle>Who Sees This</CardTitle>
            <CardDescription>
              Controls which members are eligible for this opportunity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={audience}
              onValueChange={(v) => setAudience(v as OpportunityInputAudience)}
              className="space-y-3"
            >
              <div className="flex items-start gap-3">
                <RadioGroupItem value="ALL_USERS" id="aud-all" className="mt-0.5" />
                <div>
                  <Label htmlFor="aud-all" className="font-medium cursor-pointer">
                    All users
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Every active member across all employers
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <RadioGroupItem value="EMPLOYER_SPECIFIC" id="aud-employer" className="mt-0.5" />
                <div>
                  <Label htmlFor="aud-employer" className="font-medium cursor-pointer">
                    Employer specific
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Only members whose employer has enabled this opportunity
                    in their configuration
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <RadioGroupItem value="INDIVIDUAL_ONLY" id="aud-individual" className="mt-0.5" />
                <div>
                  <Label htmlFor="aud-individual" className="font-medium cursor-pointer">
                    Individual users only
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Manually assigned to specific members
                  </p>
                </div>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Completion Type */}
        <Card className="border-card-border">
          <CardHeader>
            <CardTitle>Completion Verification</CardTitle>
            <CardDescription>
              How the system confirms a member completed this opportunity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={completionType}
              onValueChange={(v) => setCompletionType(v as OpportunityInputCompletionType)}
              className="space-y-3"
            >
              <div className="flex items-start gap-3">
                <RadioGroupItem value="SELF_REPORTED" id="comp-self" className="mt-0.5" />
                <div>
                  <Label htmlFor="comp-self" className="font-medium cursor-pointer">
                    Self-reported by user
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Member taps "Complete" in the app — no external verification
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <RadioGroupItem value="EMR_VERIFIED" id="comp-emr" className="mt-0.5" />
                <div>
                  <Label htmlFor="comp-emr" className="font-medium cursor-pointer">
                    Verified by EMR data
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically confirmed when a matching record appears
                    in the member's connected health system
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <RadioGroupItem value="ADMIN_VERIFIED" id="comp-admin" className="mt-0.5" />
                <div>
                  <Label htmlFor="comp-admin" className="font-medium cursor-pointer">
                    Manual admin verification
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    An administrator reviews and manually approves completion
                  </p>
                </div>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            disabled={createOpportunity.isPending || !isValid}
            onClick={(e) => handleFormSubmit(e, "DRAFT")}
          >
            <BookOpen className="w-4 h-4 mr-2" />
            {createOpportunity.isPending ? "Saving..." : "Save as Draft"}
          </Button>

          <Button
            type="button"
            disabled={createOpportunity.isPending || !isValid}
            onClick={(e) => handleFormSubmit(e, "ACTIVE")}
          >
            <Send className="w-4 h-4 mr-2" />
            {createOpportunity.isPending ? "Publishing..." : "Publish Opportunity"}
          </Button>

          <Separator orientation="vertical" className="h-8" />

          <Link href="/opportunities">
            <Button
              type="button"
              variant="ghost"
              disabled={createOpportunity.isPending}
            >
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
