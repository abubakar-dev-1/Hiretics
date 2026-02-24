"use client";
import { Sidebar } from "@/components/layout/SideBar";
import { Header } from "@/components/layout/Header";
import { MobileHeader } from "@/components/layout/MobileHeader";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  getCampaign,
  archiveCampaign,
  favoriteCampaign,
  updateCampaign,
  startCampaign,
  stopCampaign,
} from "@/api/campaign/api";
import { Campaign } from "@/types/campaign";
import {
  Trash2,
  Pen,
  Link2,
  Star,
  Share2,
  CalendarDays,
  Briefcase,
  Building2,
  FileText,
  Play,
  Square,
  SlidersHorizontal,
  Target,
  MapPin,
  GraduationCap,
  Clock,
  BookOpen,
} from "lucide-react";
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
import { toast } from "sonner";
import CreateCampaign from "@/components/campaign-creation/Dialouges";
import { CountCards } from "./cards";
import { BestCandidates, Candidate } from "./best-candidate";
import { getApplicants } from "@/api/cv/api";
import { differenceInCalendarDays, format, isAfter, parseISO } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShareDialog } from "./ShareDialog";

interface CampaignPageProps {
  id: string;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  completed: { label: "Completed", className: "border-green-300 bg-green-50 text-green-700" },
  ongoing: { label: "Ongoing", className: "border-blue-300 bg-blue-50 text-blue-700" },
  "not-started": { label: "Not Started", className: "border-orange-300 bg-orange-50 text-orange-700" },
  archived: { label: "Archived", className: "border-gray-300 bg-gray-50 text-gray-700" },
};

export default function CampaignPage({ id }: CampaignPageProps) {
  const router = useRouter();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [showArchiveDialog, setShowArchiveDialog] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isStarting, setIsStarting] = useState(false);
  const [isStopping, setIsStopping] = useState(false);

  useEffect(() => {
    if (id) {
      getCampaign(id as string)
        .then(setCampaign)
        .catch(console.error);
    }
  }, [id]);

  useEffect(() => {
    if (campaign?.id) {
      getApplicants(campaign.id)
        .then(setCandidates)
        .catch(console.error);
    }
  }, [campaign?.id]);

  const handleArchive = async () => {
    if (!campaign?.id || !campaign) return;

    try {
      setIsArchiving(true);
      await archiveCampaign(campaign.id);
      toast.success("Campaign moved to trash");
      router.push("/");
    } catch (error) {
      toast.error("Failed to archive campaign");
      console.error(error);
    } finally {
      setIsArchiving(false);
      setShowArchiveDialog(false);
    }
  };

  const handleFavorite = async () => {
    if (!campaign?.id || !campaign) return;
    const newValue = !campaign.is_favorite;
    try {
      const updated = await favoriteCampaign(campaign.id, newValue);
      setCampaign(updated);
      toast.success(
        newValue
          ? "Campaign marked as favorite"
          : "Campaign removed from favorites"
      );
    } catch (error) {
      toast.error("Failed to update favorite status");
      console.error(error);
    }
  };

  const handleEdit = () => {
    setEditDialogOpen(true);
  };

  const handleSave = async (data: any) => {
    if (!campaign?.id || !campaign) return;
    await updateCampaign(campaign.id, data);
    const updated = await getCampaign(campaign.id);
    setCampaign(updated);
    setEditDialogOpen(false);
    setRefreshKey((k) => k + 1);
  };

  const handleCopyLink = () => {
    const url = `${typeof window !== "undefined" ? window.location.origin : ""}/campaign/applicants/${campaign?.id}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copied!");
  };

  const handleStart = async () => {
    if (!campaign?.id) return;
    try {
      setIsStarting(true);
      const updated = await startCampaign(campaign.id);
      setCampaign(updated);
      toast.success("Campaign started!");
    } catch (error) {
      toast.error("Failed to start campaign");
      console.error(error);
    } finally {
      setIsStarting(false);
    }
  };

  const handleStop = async () => {
    if (!campaign?.id) return;
    try {
      setIsStopping(true);
      const updated = await stopCampaign(campaign.id);
      setCampaign(updated);
      toast.success("Campaign ended!");
    } catch (error) {
      toast.error("Failed to end campaign");
      console.error(error);
    } finally {
      setIsStopping(false);
    }
  };

  const shareUrl = typeof window !== "undefined"
    ? `${window.location.origin}/campaign/applicants/${campaign?.id}`
    : "";

  const statusCfg = statusConfig[campaign?.status || ""] || statusConfig.ongoing;

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "—";
    try {
      return format(parseISO(dateStr), "MMM d, yyyy");
    } catch {
      return "—";
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
            title={campaign?.name || "Campaign Details"}
          />

          <Header
            title={campaign?.name || "Campaign Details"}
            subtitle={`${campaign?.company_name || ""}`}
          />

          <div className="flex-1 p-6 overflow-auto">
            {campaign ? (
              <div className="space-y-6">
                {/* Breadcrumb Navigation */}
                <div className="flex items-center space-x-2 text-base">
                  <span
                    className="text-[#16A34A] underline cursor-pointer"
                    onClick={() => router.push("/")}
                  >
                    All Campaigns
                  </span>
                  <span className="text-muted-foreground">›</span>
                  <span className="text-[#16A34A] underline">
                    {campaign.name}
                  </span>
                </div>

                {/* Campaign Header with Status and Actions */}
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className={statusCfg.className}>
                      {statusCfg.label}
                    </Badge>
                    {(campaign.start_date || campaign.end_date) && (
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <CalendarDays size={14} />
                        <span>
                          {formatDate(campaign.start_date)} → {formatDate(campaign.end_date)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setShowArchiveDialog(true)}
                        >
                          <Trash2 className="w-4 h-4 text-[#DC2626]" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Move to Trash</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={handleEdit}
                        >
                          <Pen className="w-4 h-4 text-muted-foreground" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Edit Campaign</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={handleCopyLink}
                        >
                          <Link2 className="w-4 h-4 text-muted-foreground" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Copy Link</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={handleFavorite}
                        >
                          <Star
                            className={
                              campaign?.is_favorite
                                ? "w-4 h-4 text-yellow-400 fill-yellow-400"
                                : "w-4 h-4 text-muted-foreground"
                            }
                          />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        {campaign?.is_favorite ? "Remove from Favorites" : "Add to Favorites"}
                      </TooltipContent>
                    </Tooltip>

                    {campaign?.status === "not-started" && (
                      <Button
                        className="bg-[#16A34A] hover:bg-[#15803D] text-white gap-2"
                        onClick={handleStart}
                        disabled={isStarting}
                      >
                        <Play size={16} />
                        {isStarting ? "Starting..." : "Start Campaign"}
                      </Button>
                    )}

                    {campaign?.status === "ongoing" && (
                      <Button
                        variant="outline"
                        className="border-[#DC2626] text-[#DC2626] hover:bg-[#DC2626]/10 gap-2"
                        onClick={handleStop}
                        disabled={isStopping}
                      >
                        <Square size={16} />
                        {isStopping ? "Ending..." : "End Campaign"}
                      </Button>
                    )}

                    <Button
                      className="bg-[#16A34A] hover:bg-[#15803D] text-white gap-2"
                      onClick={() => setShareDialogOpen(true)}
                    >
                      <Share2 size={16} />
                      Share
                    </Button>
                  </div>
                </div>

                <hr className="border-border" />

                {/* KPI Stats */}
                {(() => {
                  let daysRemaining = 0;
                  if (campaign.start_date && campaign.end_date) {
                    const today = new Date();
                    const end = parseISO(campaign.end_date);
                    if (isAfter(today, end)) {
                      daysRemaining = 0;
                    } else {
                      daysRemaining = differenceInCalendarDays(end, today);
                      if (daysRemaining < 0) daysRemaining = 0;
                    }
                  }
                  return (
                    <CountCards
                      responsesReceived={candidates.length}
                      daysRemaining={daysRemaining}
                      status={campaign.status}
                      onViewAsApplicant={() => {
                        const url = `${typeof window !== "undefined" ? window.location.origin : ""}/campaign/applicants/${campaign?.id}`;
                        window.open(url, "_blank");
                      }}
                    />
                  );
                })()}

                {/* Best Candidates */}
                <BestCandidates
                  campaignId={campaign?.id}
                  refreshKey={refreshKey}
                />

                {/* Job Details Card */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Job Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-start gap-2">
                      <Briefcase size={16} className="text-muted-foreground mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs text-muted-foreground">Role</p>
                        <p className="text-sm font-medium">{campaign.job_role || "—"}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Building2 size={16} className="text-muted-foreground mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs text-muted-foreground">Company</p>
                        <p className="text-sm font-medium">{campaign.company_name || "—"}</p>
                      </div>
                    </div>
                    {campaign.job_description && (
                      <div className="flex items-start gap-2">
                        <FileText size={16} className="text-muted-foreground mt-0.5 shrink-0" />
                        <div>
                          <p className="text-xs text-muted-foreground">Description</p>
                          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                            {campaign.job_description}
                          </p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Scoring Criteria Card */}
                {campaign.criteria && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <SlidersHorizontal size={16} />
                        Scoring Criteria
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {campaign.criteria.required_skills?.length > 0 && (
                        <div className="flex items-start gap-2">
                          <Target size={16} className="text-muted-foreground mt-0.5 shrink-0" />
                          <div>
                            <p className="text-xs text-muted-foreground">Required Skills</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {campaign.criteria.required_skills.map((skill: any, i: number) => (
                                <Badge key={i} variant="outline" className="text-xs gap-1">
                                  {skill.name}
                                  <span className="inline-flex gap-px ml-0.5">
                                    {Array.from({ length: 5 }).map((_, s) => (
                                      <Star key={s} size={8} className={s < skill.weight ? "fill-current" : "opacity-30"} />
                                    ))}
                                  </span>
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                      {campaign.criteria.required_keywords?.length > 0 && (
                        <div className="flex items-start gap-2">
                          <BookOpen size={16} className="text-muted-foreground mt-0.5 shrink-0" />
                          <div>
                            <p className="text-xs text-muted-foreground">Keywords</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {campaign.criteria.required_keywords.map((kw: string, i: number) => (
                                <Badge key={i} variant="secondary" className="text-xs">
                                  {kw}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                      {campaign.criteria.minimum_experience_years > 0 && (
                        <div className="flex items-start gap-2">
                          <Clock size={16} className="text-muted-foreground mt-0.5 shrink-0" />
                          <div>
                            <p className="text-xs text-muted-foreground">Min Experience</p>
                            <p className="text-sm font-medium">{campaign.criteria.minimum_experience_years} years</p>
                          </div>
                        </div>
                      )}
                      {campaign.criteria.minimum_cgpa > 0 && (
                        <div className="flex items-start gap-2">
                          <GraduationCap size={16} className="text-muted-foreground mt-0.5 shrink-0" />
                          <div>
                            <p className="text-xs text-muted-foreground">Min CGPA</p>
                            <p className="text-sm font-medium">{campaign.criteria.minimum_cgpa}</p>
                          </div>
                        </div>
                      )}
                      {campaign.criteria.preferred_universities?.length > 0 && (
                        <div className="flex items-start gap-2">
                          <GraduationCap size={16} className="text-muted-foreground mt-0.5 shrink-0" />
                          <div>
                            <p className="text-xs text-muted-foreground">Preferred Universities</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {campaign.criteria.preferred_universities.map((uni: string, i: number) => (
                                <Badge key={i} variant="secondary" className="text-xs">
                                  {uni}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                      {campaign.criteria.preferred_cities?.length > 0 && (
                        <div className="flex items-start gap-2">
                          <MapPin size={16} className="text-muted-foreground mt-0.5 shrink-0" />
                          <div>
                            <p className="text-xs text-muted-foreground">Preferred Cities</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {campaign.criteria.preferred_cities.map((city: string, i: number) => (
                                <Badge key={i} variant="secondary" className="text-xs">
                                  {city}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">
                  Loading campaign details...
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <AlertDialog open={showArchiveDialog} onOpenChange={setShowArchiveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive Campaign</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to archive this campaign? It will be moved
              to trash.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isArchiving}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleArchive}
              disabled={isArchiving}
              className="bg-[#DC2626] hover:bg-[#DC2626]/90 text-white"
            >
              {isArchiving ? "Moving to trash..." : "Move to trash"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ShareDialog
        open={shareDialogOpen}
        onOpenChange={setShareDialogOpen}
        url={shareUrl}
      />

      {campaign && (
        <CreateCampaign
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          editMode={true}
          campaignId={campaign.id}
          initialValues={{
            id: campaign.id,
            title: campaign.name,
            company: campaign.company_name,
            role: campaign.job_role,
            description: campaign.job_description,
            startDate: campaign.start_date
              ? new Date(campaign.start_date)
              : null,
            endDate: campaign.end_date ? new Date(campaign.end_date) : null,
            criteria: campaign.criteria,
          }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
