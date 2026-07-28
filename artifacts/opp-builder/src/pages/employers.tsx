import { useState } from "react";
import { useListEmployers } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Building2, Plus, Settings } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { getAuthToken } from "@/lib/auth";

export default function EmployersPage() {
  const { data: employers, isLoading } = useListEmployers();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [planType, setPlanType] = useState("");
  const [creating, setCreating] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setCreating(true);
    try {
      const res = await fetch("/opp-builder/api/admin/employers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getAuthToken() ?? ""}`,
        },
        body: JSON.stringify({ name: name.trim(), planType: planType.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to create employer");
      toast({ title: "Employer created", description: `${data.name} has been added.` });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/employers"] });
      setName("");
      setPlanType("");
      setOpen(false);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Employers</h1>
          <p className="text-muted-foreground">
            Configure opportunity settings per employer
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-employer">
              <Plus className="w-4 h-4 mr-2" />
              Add Employer
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleCreate}>
              <DialogHeader>
                <DialogTitle>Add Employer</DialogTitle>
                <DialogDescription>
                  Create a new employer so you can configure per-employer opportunity settings.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="emp-name">Employer name *</Label>
                  <Input
                    id="emp-name"
                    placeholder="Acme Corporation"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    disabled={creating}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emp-plan">Plan type</Label>
                  <Input
                    id="emp-plan"
                    placeholder="PPO, HMO, HDHP…"
                    value={planType}
                    onChange={(e) => setPlanType(e.target.value)}
                    disabled={creating}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="ghost" onClick={() => setOpen(false)} disabled={creating}>
                  Cancel
                </Button>
                <Button type="submit" disabled={creating || !name.trim()}>
                  {creating ? "Creating…" : "Create Employer"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Employers List */}
      <Card className="border-card-border">
        <CardHeader>
          <CardTitle>All Employers</CardTitle>
          <CardDescription>
            {employers?.length || 0} employer{employers?.length !== 1 ? "s" : ""} registered
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
                      <h4 className="font-semibold text-foreground mb-1">{employer.name}</h4>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        {employer.planType && <span>{employer.planType}</span>}
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
                          {(employer as any).configuredCount ?? 0}
                        </div>
                      </div>
                      <Settings className="w-5 h-5 text-muted-foreground" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 space-y-4">
              <Building2 className="w-12 h-12 text-muted-foreground mx-auto" />
              <p className="text-muted-foreground">No employers yet</p>
              <Button variant="outline" onClick={() => setOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add your first employer
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
