"use client";

import { Sidebar } from "@/components/layout/SideBar";
import { Header } from "@/components/layout/Header";
import { CardComponent } from "@/components/campaign-creation/DynamicCard";
import { useState, useEffect } from "react";
import { MobileHeader } from "@/components/layout/MobileHeader";
import { favoriteCampaign, getFavouriteCampaigns, archiveCampaign } from "@/api/campaign/api";
import { Campaign } from "@/types/campaign";
import { useRouter } from "next/navigation";
import { getApplicants } from "@/api/cv/api";
import { toast } from "sonner";
import { Star } from "lucide-react";

export default function Favourite() {
  const router = useRouter();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [applicantsCount, setApplicantsCount] = useState<Record<string, number>>({});

  const fetchCampaigns = () => {
    setIsLoading(true);
    getFavouriteCampaigns(true)
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
            button={false}
            onMobileMenuClick={() => setIsMobileOpen(true)}
            title="Favourites"
          />

          <Header
            title="Favourites"
            subtitle="Your starred campaigns"
          />

          <div className="flex-1 p-6 overflow-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
              {isLoading ? (
                Array.from({ length: 6 }).map((_, idx) => (
                  <CardComponent
                    key={`skeleton-${idx}`}
                    variant="skeleton"
                  />
                ))
              ) : campaigns.length === 0 ? (
                <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
                  <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                    <Star size={24} className="text-muted-foreground" />
                  </div>
                  <p className="text-base font-medium text-foreground mb-1">No favourites yet</p>
                  <p className="text-sm text-muted-foreground">Star a campaign to see it here</p>
                </div>
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
                      username={campaign.company_name}
                      count={applicantsCount[campaign.id || ''] || 0}
                      isFavorite={campaign.is_favorite}
                      onClick={() => router.push(`/campaign/${campaign.id}`)}
                      onFavorite={async () => {
                        if (!campaign.id) return;
                        await favoriteCampaign(String(campaign.id), !campaign.is_favorite);
                        fetchCampaigns();
                      }}
                      onEdit={() => router.push(`/campaign/${campaign.id}`)}
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
    </div>
  );
}
