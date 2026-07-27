import { useState } from "react";
import { useParams, Link } from "wouter";
import { useListEmployers, useListEmployerConfigs, useSetEmployerConfig, getListEmployerConfigsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CategoryBadge } from "@/components/category-badge";
import { ArrowLeft, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export default function EmployerConfigsPage() {
  const params = useParams();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const employerId = params.id!;

  const { data: employers } = useListEmployers();
  const { data: configs, isLoading } = useListEmployerConfigs(employerId);
  const setConfig = useSetEmployerConfig();

  const employer = employers?.find((e) => e.id === employerId);

  const [editingConfig, setEditingConfig] = useState<{
    opportunityId: string;
    customPointsValue: string;
    customTitle: string;
  } | null>(null);

  const handleToggle = (opportunityId: string, currentEnabled: boolean) => {
    setConfig.mutate(
      {
        employerId,
        opportunityId,
        data: { isEnabled: !currentEnabled },
      },
      {
        onSuccess: () => {
          toast({
            title: "Configuration updated",
            description: `Opportunity ${!currentEnabled ? "enabled" : "disabled"} for this employer.`,
          });
          queryClient.invalidateQueries({ queryKey: getListEmployerConfigsQueryKey(employerId) });
        },
        onError: () => {
          toast({
            title: "Error",
            description: "Failed to update configuration. Please try again.",
            variant: "destructive",
          });
        },
      }
    );
  };

  const handleSaveCustomization = (opportunityId: string) => {
    if (!editingConfig || editingConfig.opportunityId !== opportunityId) return;

    const config = configs?.find((c) => c.opportunityId === opportunityId);
    if (!config) return;

    setConfig.mutate(
      {
        employerId,
        opportunityId,
        data: {
          isEnabled: config.isEnabled,
          customPointsValue: editingConfig.customPointsValue
            ? Number(editingConfig.customPointsValue)
            : undefined,
          customTitle: editingConfig.customTitle || undefined,
        },
      },
      {
        onSuccess: () => {
          toast({
            title: "Customization saved",
            description: "Custom points and title have been applied.",
          });
          queryClient.invalidateQueries({ queryKey: getListEmployerConfigsQueryKey(employerId) });
          setEditingConfig(null);
        },
        onError: () => {
          toast({
            title: "Error",
            description: "Failed to save customization. Please try again.",
            variant: "destructive",
          });
        },
      }
    );
  };

  const startEditing = (config: typeof configs extends (infer T)[] ? T : never) => {
    setEditingConfig({
      opportunityId: config.opportunityId,
      customPointsValue: config.customPointsValue?.toString() || "",
      customTitle: config.customTitle || "",
    });
  };

  if (isLoading) {
    return (
      <div className="p-8 space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/employers">
          <Button variant="ghost" size="icon" data-testid="button-back">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {employer?.name || "Employer"} Configuration
          </h1>
          <p className="text-muted-foreground">
            Enable opportunities and customize points for this employer
          </p>
        </div>
      </div>

      {/* Configurations */}
      <Card className="border-card-border">
        <CardHeader>
          <CardTitle>Opportunity Configurations</CardTitle>
          <CardDescription>
            Toggle opportunities and set custom values per employer
          </CardDescription>
        </CardHeader>
        <CardContent>
          {configs && configs.length > 0 ? (
            <div className="space-y-3">
              {configs.map((config, idx) => {
                const isEditing =
                  editingConfig?.opportunityId === config.opportunityId;
                const opp = config.opportunity;

                return (
                  <div
                    key={config.id}
                    className={cn(
                      "p-4 rounded-lg border transition-colors animate-stagger-in",
                      config.isEnabled
                        ? "border-primary/30 bg-primary/5"
                        : "border-border bg-card"
                    )}
                    style={{ animationDelay: `${idx * 30}ms` }}
                    data-testid={`config-${config.opportunityId}`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 pt-1">
                        <Switch
                          checked={config.isEnabled}
                          onCheckedChange={() =>
                            handleToggle(config.opportunityId, config.isEnabled)
                          }
                          disabled={setConfig.isPending}
                          data-testid={`switch-enable-${config.opportunityId}`}
                        />
                      </div>

                      <div className="flex-1 min-w-0 space-y-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-foreground">
                              {opp?.title || "Unknown Opportunity"}
                            </h4>
                            {opp?.category && (
                              <CategoryBadge category={opp.category} />
                            )}
                          </div>
                          {opp?.description && (
                            <p className="text-sm text-muted-foreground">
                              {opp.description}
                            </p>
                          )}
                        </div>

                        {config.isEnabled && (
                          <div className="space-y-3 pt-3 border-t border-border/50">
                            {!isEditing ? (
                              <div className="flex items-center gap-6">
                                <div>
                                  <div className="text-xs text-muted-foreground mb-1">
                                    Points
                                  </div>
                                  <div className="font-mono font-semibold text-primary">
                                    {config.customPointsValue || opp?.pointsValue || 0}
                                    {config.customPointsValue && (
                                      <span className="text-xs text-muted-foreground ml-1">
                                        (custom)
                                      </span>
                                    )}
                                  </div>
                                </div>
                                {config.customTitle && (
                                  <div>
                                    <div className="text-xs text-muted-foreground mb-1">
                                      Custom Title
                                    </div>
                                    <div className="text-sm font-medium">
                                      {config.customTitle}
                                    </div>
                                  </div>
                                )}
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => startEditing(config)}
                                  data-testid={`button-customize-${config.opportunityId}`}
                                >
                                  Customize
                                </Button>
                              </div>
                            ) : (
                              <div className="space-y-3">
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Label
                                      htmlFor={`custom-points-${config.opportunityId}`}
                                      className="text-xs"
                                    >
                                      Custom Points (leave empty for default)
                                    </Label>
                                    <Input
                                      id={`custom-points-${config.opportunityId}`}
                                      type="number"
                                      min="1"
                                      value={editingConfig.customPointsValue}
                                      onChange={(e) =>
                                        setEditingConfig({
                                          ...editingConfig,
                                          customPointsValue: e.target.value,
                                        })
                                      }
                                      placeholder={opp?.pointsValue?.toString() || ""}
                                      data-testid={`input-custom-points-${config.opportunityId}`}
                                    />
                                  </div>

                                  <div className="space-y-2">
                                    <Label
                                      htmlFor={`custom-title-${config.opportunityId}`}
                                      className="text-xs"
                                    >
                                      Custom Title (optional)
                                    </Label>
                                    <Input
                                      id={`custom-title-${config.opportunityId}`}
                                      value={editingConfig.customTitle}
                                      onChange={(e) =>
                                        setEditingConfig({
                                          ...editingConfig,
                                          customTitle: e.target.value,
                                        })
                                      }
                                      placeholder={opp?.title || ""}
                                      data-testid={`input-custom-title-${config.opportunityId}`}
                                    />
                                  </div>
                                </div>

                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    onClick={() =>
                                      handleSaveCustomization(config.opportunityId)
                                    }
                                    disabled={setConfig.isPending}
                                    data-testid={`button-save-${config.opportunityId}`}
                                  >
                                    <Save className="w-3 h-3 mr-1" />
                                    {setConfig.isPending ? "Saving..." : "Save"}
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setEditingConfig(null)}
                                    disabled={setConfig.isPending}
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No opportunities available for configuration
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
