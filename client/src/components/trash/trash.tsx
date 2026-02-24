"use client";

import { Sidebar } from "@/components/layout/SideBar";
import { Header } from "@/components/layout/Header";
import { CardComponent } from "@/components/campaign-creation/DynamicCard";
import { useState, useEffect } from "react";
import { MobileHeader } from "@/components/layout/MobileHeader";
import { getCampaigns, deleteCampaign, restoreCampaign } from "@/api/campaign/api";
import { Campaign } from "@/types/campaign";
import { useRouter } from "next/navigation";
import { getApplicants } from "@/api/cv/api";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { RotateCcw, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function Trash() {
  const router = useRouter();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [applicantsCount, setApplicantsCount] = useState<Record<string, number>>({});
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [emptyTrashDialogOpen, setEmptyTrashDialogOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const fetchCampaigns = () => {
    setIsLoading(true);
    getCampaigns(true)
      .then(async (campaigns) => {
        setCampaigns(campaigns);
        const counts: Record<string, number> = {};
        await Promise.all(
          campaigns.map(async (campaign) => {
            if (campaign.id) {
              try {
                const applicants = await getApplicants(campaign.id);
                counts[campaign.id] = applicants.length;
              } catch (error) {
                console.error(`Error fetching applicants for campaign ${campaign.id}:`, error);
                counts[campaign.id] = 0;
              }
            }
          })
        );
        setApplicantsCount(counts);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const toggleSelect = (id: string, selected: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (selected) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === campaigns.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(campaigns.map((c) => c.id!).filter(Boolean)));
    }
  };

  const handleRestore = async (ids: string[]) => {
    try {
      await Promise.all(ids.map((id) => restoreCampaign(id)));
      toast.success(ids.length === 1 ? "Campaign restored" : `${ids.length} campaigns restored`);
      setSelectedIds((prev) => {
        const next = new Set(prev);
        ids.forEach((id) => next.delete(id));
        return next;
      });
      fetchCampaigns();
    } catch {
      toast.error("Failed to restore campaign(s)");
    }
  };

  const handleDelete = async (ids: string[]) => {
    try {
      await Promise.all(ids.map((id) => deleteCampaign(id)));
      toast.success(ids.length === 1 ? "Campaign deleted permanently" : `${ids.length} campaigns deleted`);
      setSelectedIds((prev) => {
        const next = new Set(prev);
        ids.forEach((id) => next.delete(id));
        return next;
      });
      fetchCampaigns();
    } catch {
      toast.error("Failed to delete campaign(s)");
    }
  };

  const handleEmptyTrash = async () => {
    const allIds = campaigns.map((c) => c.id!).filter(Boolean);
    await handleDelete(allIds);
    setEmptyTrashDialogOpen(false);
  };

  const confirmDeleteSingle = (id: string) => {
    setPendingDeleteId(id);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteSelected = () => {
    setPendingDeleteId(null);
    setDeleteDialogOpen(true);
  };

  const executeDelete = async () => {
    if (pendingDeleteId) {
      await handleDelete([pendingDeleteId]);
    } else {
      await handleDelete(Array.from(selectedIds));
    }
    setDeleteDialogOpen(false);
    setPendingDeleteId(null);
  };

  const allSelected = campaigns.length > 0 && selectedIds.size === campaigns.length;
  const someSelected = selectedIds.size > 0;

  return (
    <div className="w-full bg-muted/20">
      <div className="max-w-[1440px] mx-auto flex px-0 lg:px-6 lg:pt-6 pt-2">
        <div className="border-border border-[1px] shadow-md rounded-[6px] h-screen">
          <Sidebar
            isMobileOpen={isMobileOpen}
            setIsMobileOpen={setIsMobileOpen}
            collapsed={collapsed}
            setCollapsed={setCollapsed}
          />
        </div>

        <div className="flex-1 flex flex-col">
          <MobileHeader
            button={false}
            onMobileMenuClick={() => setIsMobileOpen(true)}
            title="Trash"
          />

          <Header
            title="Trash"
            subtitle="Manage deleted campaigns"
          />

          <div className="flex-1 p-6 overflow-auto">
            {/* Toolbar */}
            {!isLoading && campaigns.length > 0 && (
              <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={toggleSelectAll}
                  />
                  <span className="text-sm text-muted-foreground">
                    {someSelected
                      ? `${selectedIds.size} selected`
                      : "Select all"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {someSelected && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRestore(Array.from(selectedIds))}
                        className="gap-1.5"
                      >
                        <RotateCcw size={14} />
                        Restore
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={confirmDeleteSelected}
                        className="gap-1.5 text-[#DC2626] border-[#DC2626]/30 hover:bg-[#DC2626]/10"
                      >
                        <Trash2 size={14} />
                        Delete
                      </Button>
                    </>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEmptyTrashDialogOpen(true)}
                    className="gap-1.5 text-[#DC2626] border-[#DC2626]/30 hover:bg-[#DC2626]/10"
                  >
                    <Trash2 size={14} />
                    Empty Trash
                  </Button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
              {isLoading ? (
                Array.from({ length: 6 }).map((_, idx) => (
                  <CardComponent key={`skeleton-${idx}`} variant="skeleton" />
                ))
              ) : campaigns.length === 0 ? (
                <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
                  <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                    <Trash2 size={24} className="text-muted-foreground" />
                  </div>
                  <p className="text-base font-medium text-foreground mb-1">Trash is empty</p>
                  <p className="text-sm text-muted-foreground">Deleted campaigns will appear here</p>
                </div>
              ) : (
                campaigns.map((campaign) => {
                  let status: "ongoing" | "completed" | "archived" | "not-started" | undefined =
                    undefined;
                  if (
                    campaign.status === "ongoing" ||
                    campaign.status === "completed" ||
                    campaign.status === "archived" ||
                    campaign.status === "not-started"
                  ) {
                    status = campaign.status;
                  }
                  return (
                    <CardComponent
                      key={campaign.id}
                      variant="trash"
                      title={campaign.name}
                      status={status}
                      username={campaign.company_name}
                      count={applicantsCount[campaign.id || ""] || 0}
                      isSelected={selectedIds.has(campaign.id || "")}
                      onSelectToggle={(selected) =>
                        campaign.id && toggleSelect(campaign.id, selected)
                      }
                      onRestore={() => campaign.id && handleRestore([campaign.id])}
                      onDeletePermanently={() =>
                        campaign.id && confirmDeleteSingle(campaign.id)
                      }
                    />
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Permanently</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingDeleteId
                ? "Are you sure you want to permanently delete this campaign? This action cannot be undone."
                : `Are you sure you want to permanently delete ${selectedIds.size} campaign(s)? This action cannot be undone.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={executeDelete}
              className="bg-[#DC2626] hover:bg-[#DC2626]/90 text-white"
            >
              Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Empty Trash Confirmation Dialog */}
      <AlertDialog open={emptyTrashDialogOpen} onOpenChange={setEmptyTrashDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Empty Trash</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete all {campaigns.length} campaign(s) in trash? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleEmptyTrash}
              className="bg-[#DC2626] hover:bg-[#DC2626]/90 text-white"
            >
              Empty Trash
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
