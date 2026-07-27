import { useState } from "react";
import { useGetOpportunityStats } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CategoryBadge } from "@/components/category-badge";
import { Target, Building2, Plus, TrendingUp, Activity as ActivityIcon, Play, CheckCircle2, AlertCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";

export default function DashboardPage() {
  const { data: stats, isLoading } = useGetOpportunityStats();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [schedulerRunning, setSchedulerRunning] = useState(false);

  const handleRunScheduler = async () => {
    setSchedulerRunning(true);
    try {
      const res = await fetch("/opp-builder/api/admin/scheduler/run", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken") ?? ""}`,
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Unknown error");
      toast({
        title: "Scheduler ran successfully",
        description: data.message,
      });
      // Refresh stats so the dashboard reflects any new assignments
      queryClient.invalidateQueries({ queryKey: ["/api/admin/opportunities/stats"] });
    } catch (err: any) {
      toast({
        title: "Scheduler failed",
        description: err.message ?? "Could not run the opportunities engine.",
        variant: "destructive",
      });
    } finally {
      setSchedulerRunning(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 space-y-6">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Dashboard
          </h1>
          <p className="text-muted-foreground">
            Overview of wellness opportunities and employer configurations
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleRunScheduler}
            disabled={schedulerRunning}
            data-testid="button-run-scheduler"
          >
            <Play className="w-4 h-4 mr-2" />
            {schedulerRunning ? "Running…" : "Run Scheduler Now"}
          </Button>
          <Link href="/employers">
            <Button variant="outline" data-testid="button-configure-employers">
              <Building2 className="w-4 h-4 mr-2" />
              Configure Employers
            </Button>
          </Link>
          <Link href="/opportunities/new">
            <Button data-testid="button-create-opportunity">
              <Plus className="w-4 h-4 mr-2" />
              Create Opportunity
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-card-border">
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              Total Opportunities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono">{stats.total}</div>
            <p className="text-sm text-muted-foreground mt-1">
              {stats.totalActive} active, {stats.totalInactive} inactive
            </p>
          </CardContent>
        </Card>

        <Card className="border-card-border">
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <ActivityIcon className="w-4 h-4" />
              Active Opportunities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono text-primary">
              {stats.totalActive}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Available to members
            </p>
          </CardContent>
        </Card>

        <Card className="border-card-border">
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Categories
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono">
              {stats.byCategory.length}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Distinct opportunity types
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown */}
      <Card className="border-card-border">
        <CardHeader>
          <CardTitle>Opportunities by Category</CardTitle>
          <CardDescription>
            Distribution across all opportunity types
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.byCategory.map((cat) => (
              <div
                key={cat.category}
                className="p-4 rounded-lg border border-border bg-card"
              >
                <CategoryBadge
                  category={cat.category as any}
                  className="mb-2"
                />
                <div className="text-2xl font-bold font-mono mt-2">
                  {cat.count}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recently Created */}
      {stats.recentlyCreated && stats.recentlyCreated.length > 0 && (
        <Card className="border-card-border">
          <CardHeader>
            <CardTitle>Recently Created</CardTitle>
            <CardDescription>
              Latest opportunities added to the catalog
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recentlyCreated.map((opp, idx) => (
                <Link key={opp.id} href={`/opportunities/${opp.id}`}>
                  <div
                    className="flex items-start justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer"
                    style={{ animationDelay: `${idx * 50}ms` }}
                    data-testid={`card-recent-opportunity-${opp.id}`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-foreground truncate">
                          {opp.title}
                        </h4>
                        <CategoryBadge category={opp.category} />
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {opp.description}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span>
                          Created {formatDistanceToNow(new Date(opp.createdAt), { addSuffix: true })}
                        </span>
                        {opp.createdByName && (
                          <span>by {opp.createdByName}</span>
                        )}
                      </div>
                    </div>
                    <div className="ml-4 flex flex-col items-end gap-1">
                      <div className="text-lg font-bold font-mono text-primary">
                        {opp.pointsValue}
                      </div>
                      <div className="text-xs text-muted-foreground">points</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
