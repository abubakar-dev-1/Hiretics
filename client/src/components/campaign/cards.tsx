"use client";

import { Users, Clock, Activity, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface CountCardsProps {
  responsesReceived?: number;
  daysRemaining?: number;
  status?: string;
  onViewAsApplicant?: () => void;
}

const statusDisplay: Record<string, string> = {
  ongoing: "Ongoing",
  completed: "Completed",
  "not-started": "Not Started",
  archived: "Archived",
};

export function CountCards({
  responsesReceived = 0,
  daysRemaining = 0,
  status = "ongoing",
  onViewAsApplicant,
}: CountCardsProps) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4">
          <CardContent className="p-0 flex items-center gap-3">
            <div className="p-2 bg-[#16A34A]/10 rounded-lg shrink-0">
              <Users className="w-5 h-5 text-[#16A34A]" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Responses</p>
              <p className="text-xl font-bold text-[#16A34A]">{responsesReceived}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="p-4">
          <CardContent className="p-0 flex items-center gap-3">
            <div className="p-2 bg-orange-50 rounded-lg shrink-0">
              <Clock className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Days Left</p>
              <p className="text-xl font-bold text-foreground">{daysRemaining}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="p-4">
          <CardContent className="p-0 flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg shrink-0">
              <Activity className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Status</p>
              <p className="text-xl font-bold text-foreground">{statusDisplay[status] || status}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {onViewAsApplicant && (
        <button
          onClick={onViewAsApplicant}
          className="flex items-center gap-1.5 text-sm text-[#16A34A] hover:underline pl-1"
        >
          <ExternalLink size={14} />
          View as applicant
        </button>
      )}
    </div>
  );
}
