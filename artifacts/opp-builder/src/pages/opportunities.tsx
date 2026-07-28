import { useState } from "react";
import { useListAdminOpportunities, ListAdminOpportunitiesCategory } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { CategoryBadge } from "@/components/category-badge";
import { Plus, Users } from "lucide-react";

function OppStatusBadge({ status }: { status?: string | null }) {
  if (status === "ACTIVE")
    return <Badge className="bg-emerald-500/15 text-emerald-700 border-emerald-200">Active</Badge>;
  if (status === "DRAFT")
    return <Badge variant="outline" className="border-amber-300 text-amber-700 bg-amber-50">Draft</Badge>;
  if (status === "ARCHIVED")
    return <Badge variant="secondary" className="text-muted-foreground">Archived</Badge>;
  return null;
}

export default function OpportunitiesPage() {
  const [categoryFilter, setCategoryFilter] = useState<ListAdminOpportunitiesCategory | "ALL">("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "DRAFT" | "ARCHIVED">("ALL");

  const { data: opportunities, isLoading } = useListAdminOpportunities(
    categoryFilter === "ALL" ? {} : { category: categoryFilter }
  );

  const filteredOpportunities = opportunities?.filter((opp) => {
    if (statusFilter === "ALL") return true;
    return (opp as any).oppStatus === statusFilter;
  });

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Opportunities
          </h1>
          <p className="text-muted-foreground">
            Manage wellness opportunities and track author history
          </p>
        </div>
        <Link href="/opportunities/new">
          <Button data-testid="button-create-opportunity">
            <Plus className="w-4 h-4 mr-2" />
            Create Opportunity
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card className="border-card-border">
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-medium text-foreground mb-2 block">
                Category
              </label>
              <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v as any)}>
                <SelectTrigger data-testid="select-category-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Categories</SelectItem>
                  <SelectItem value="CARE_SITE_ALTERNATIVE">Care Site</SelectItem>
                  <SelectItem value="CARE_PROTOCOL">Protocol</SelectItem>
                  <SelectItem value="PREVENTATIVE_CARE">Preventative</SelectItem>
                  <SelectItem value="CARE_QUALITY">Quality</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-medium text-foreground mb-2 block">
                Status
              </label>
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
                <SelectTrigger data-testid="select-status-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Statuses</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="ARCHIVED">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Opportunities Table */}
      <Card className="border-card-border">
        <CardHeader>
          <CardTitle>All Opportunities</CardTitle>
          <CardDescription>
            {filteredOpportunities?.length || 0} opportunities found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-20" />
              ))}
            </div>
          ) : filteredOpportunities && filteredOpportunities.length > 0 ? (
            <div className="space-y-2">
              {filteredOpportunities.map((opp, idx) => (
                <Link key={opp.id} href={`/opportunities/${opp.id}`}>
                  <div
                    className="flex items-center gap-4 p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer animate-stagger-in"
                    style={{ animationDelay: `${idx * 30}ms` }}
                    data-testid={`row-opportunity-${opp.id}`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h4 className="font-semibold text-foreground">
                          {opp.title}
                        </h4>
                        <CategoryBadge category={opp.category} />
                        <OppStatusBadge status={(opp as any).oppStatus ?? (opp.isActive ? "ACTIVE" : "ARCHIVED")} />
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {opp.description}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        {opp.createdByName && (
                          <span>Created by {opp.createdByName}</span>
                        )}
                        {opp.authorCount !== undefined && (
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {opp.authorCount} {opp.authorCount === 1 ? "author" : "authors"}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <div className="text-xl font-bold font-mono text-primary">
                        {opp.pointsValue}
                      </div>
                      <div className="text-xs text-muted-foreground">points</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                No opportunities found with the current filters
              </p>
              <Link href="/opportunities/new">
                <Button variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Opportunity
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
