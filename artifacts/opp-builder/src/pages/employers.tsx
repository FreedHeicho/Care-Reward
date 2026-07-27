import { useListEmployers } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Building2, Settings } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function EmployersPage() {
  const { data: employers, isLoading } = useListEmployers();

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Employers
        </h1>
        <p className="text-muted-foreground">
          Configure opportunity settings per employer
        </p>
      </div>

      {/* Employers List */}
      <Card className="border-card-border">
        <CardHeader>
          <CardTitle>All Employers</CardTitle>
          <CardDescription>
            {employers?.length || 0} employers registered
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-20" />
              ))}
            </div>
          ) : employers && employers.length > 0 ? (
            <div className="space-y-2">
              {employers.map((employer, idx) => (
                <Link key={employer.id} href={`/employers/${employer.id}/configs`}>
                  <div
                    className="flex items-center gap-4 p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer animate-stagger-in"
                    style={{ animationDelay: `${idx * 30}ms` }}
                    data-testid={`row-employer-${employer.id}`}
                  >
                    <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-foreground mb-1">
                        {employer.name}
                      </h4>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        {employer.planType && (
                          <span>{employer.planType}</span>
                        )}
                        {employer.createdAt && (
                          <span>
                            Added {formatDistanceToNow(new Date(employer.createdAt), { addSuffix: true })}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">Configured</div>
                        <div className="text-xl font-bold font-mono text-foreground">
                          {employer.configuredCount || 0}
                        </div>
                      </div>
                      <Settings className="w-5 h-5 text-muted-foreground" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No employers found
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
