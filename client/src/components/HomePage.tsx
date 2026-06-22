"use client";

import { Sidebar } from "@/components/layout/SideBar";
import { Header } from "@/components/layout/Header";
import { CardComponent } from "@/components/campaign-creation/DynamicCard";
import { useState, useEffect } from "react";
import { MobileHeader } from "./layout/MobileHeader";
import CreateCampaign from "./campaign-creation/Dialouges";
import { getCampaigns, favoriteCampaign, archiveCampaign } from "@/api/campaign/api";
import { Campaign } from "@/types/campaign";
import { useRouter } from "next/navigation";
import { getApplicants } from "@/api/cv/api";
import { mapLimit } from "@/lib/http";
import { toast } from "sonner";

export default function Home() {
  const router = useRouter();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [applicantsCount, setApplicantsCount] = useState<Record<string, number>>({});
  const [editCampaign, setEditCampaign] = useState<Campaign | null>(null);

  const fetchCampaigns = () => {
    setIsLoading(true);
    getCampaigns(false)
      .then(async (campaigns) => {
        setCampaigns(campaigns);
        // Fetch applicants for each campaign
        const counts: Record<string, number> = {};
        await mapLimit(campaigns, 2, async (campaign) => {
          if (campaign.id) {
            try {
              const applicants = await getApplicants(campaign.id);
              counts[campaign.id] = applicants.length;
            } catch (error) {
              console.error(`Error fetching applicants for campaign ${campaign.id}:`, error);
              counts[campaign.id] = 0;
            }
          }
        });
        setApplicantsCount(counts);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const handleCopyLink = (campaignId: string) => {
    const url = `${window.location.origin}/campaign/applicants/${campaignId}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard!");
  };

  const handleArchive = async (campaignId: string) => {
    try {
      await archiveCampaign(campaignId);
      toast.success("Campaign moved to trash");
      fetchCampaigns();
    } catch {
      toast.error("Failed to move campaign to trash");
    }
  };

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
            onMobileMenuClick={() => setIsMobileOpen(true)}
            title="Your Campaigns"
            onAddClick={() => setDialogOpen(true)}
          />

          <Header
            title="Your Campaigns"
            subtitle="Welcome back"
          />

          <div className="flex-1 p-6 overflow-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
              <CardComponent
                className="lg:flex hidden"
                variant="create"
                onClick={() => setDialogOpen(true)}
              />

              {isLoading ? (
                // Show 6 skeleton cards while loading
                Array.from({ length: 6 }).map((_, idx) => (
                  <CardComponent
                    key={`skeleton-${idx}`}
                    variant="skeleton"
                  />
                ))
              ) : (
                campaigns.map((campaign) => {
                  let status: "ongoing" | "completed" | "archived" | "not-started" | undefined = undefined;
                  if (campaign.status === "ongoing" || campaign.status === "completed" || campaign.status === "archived" || campaign.status === "not-started") {
                    status = campaign.status;
                  }
                  return (
                    <CardComponent
                      key={campaign.id}
                      title={campaign.name}
                      status={status}
                      isFavorite={campaign.is_favorite}
                      username={campaign.company_name}
                      count={applicantsCount[campaign.id || ''] || 0}
                      onClick={() => router.push(`/campaign/${campaign.id}`)}
                      onFavorite={async () => {
                        if (!campaign.id) return;
                        await favoriteCampaign(String(campaign.id), !campaign.is_favorite);
                        fetchCampaigns();
                      }}
                      onEdit={() => {
                        setEditCampaign(campaign);
                        setDialogOpen(true);
                      }}
                      onCopyLink={() => campaign.id && handleCopyLink(campaign.id)}
                      onArchive={() => campaign.id && handleArchive(campaign.id)}
                    />
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      <CreateCampaign
        open={dialogOpen}
        onCreated={() => {
          setEditCampaign(null);
          fetchCampaigns();
        }}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditCampaign(null);
        }}
        editMode={!!editCampaign}
        campaignId={editCampaign?.id}
        initialValues={editCampaign ? {
          id: editCampaign.id,
          title: editCampaign.name,
          company: editCampaign.company_name,
          role: editCampaign.job_role,
          description: editCampaign.job_description,
          startDate: editCampaign.start_date ? new Date(editCampaign.start_date) : null,
          endDate: editCampaign.end_date ? new Date(editCampaign.end_date) : null,
        } : undefined}
      />
    </div>
  );
}
