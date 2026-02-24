"use client";
import { useEffect, useState, useCallback } from "react";
import { BreadcrumbDemo } from "./BreadCrums";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  Tooltip,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "../ui/button";
import Link from "next/link";
import axios from "axios";
import {
  fetchOverview,
  fetchScoreDistribution,
  fetchCampaignsSummary,
  fetchAgeStats,
  fetchUniversityStats,
  fetchCityStats,
  type OverviewStats,
  type ScoreBucket,
  type CampaignSummary,
  type AgeDataItem,
  type UniversityDataItem,
  type CityDataItem,
} from "@/api/analytics/api";
import { Briefcase, Activity, Users, TrendingUp } from "lucide-react";

const CHART_COLORS = [
  "#16A34A",
  "#22c55e",
  "#4ade80",
  "#86efac",
  "#bbf7d0",
  "#dcfce7",
  "#a3e635",
  "#65a30d",
];

export default function AnalyticsMainSection() {
  const [isUserSubscribed, setIsUserSubscribed] = useState(false);
  const [user, setUser] = useState<Record<string, string>>({});

  const [selectedCampaignId, setSelectedCampaignId] = useState<string | undefined>(undefined);

  const [overview, setOverview] = useState<OverviewStats>({
    totalCampaigns: 0,
    activeCampaigns: 0,
    totalApplicants: 0,
    averageScore: 0,
  });
  const [scores, setScores] = useState<ScoreBucket[]>([]);
  const [campaigns, setCampaigns] = useState<CampaignSummary[]>([]);
  const [ageData, setAgeData] = useState<AgeDataItem[]>([]);
  const [universityData, setUniversityData] = useState<UniversityDataItem[]>([]);
  const [cityData, setCityData] = useState<CityDataItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Auth & subscription
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {}
    }
  }, []);

  useEffect(() => {
    if (!user.id) return;
    (async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL_SUBSCRIPTION}/subs?user_id=${user.id}`
        );
        setIsUserSubscribed(response.data.plan !== "free");
      } catch {
        // default to not subscribed
      }
    })();
  }, [user.id]);

  // Fetch campaigns list once
  useEffect(() => {
    fetchCampaignsSummary()
      .then(setCampaigns)
      .catch(() => {});
  }, []);

  // Fetch filtered data whenever selectedCampaignId changes
  const loadFilteredData = useCallback(async (campaignId?: string) => {
    setLoading(true);
    try {
      const [overviewRes, scoresRes, ageRes, uniRes, cityRes] =
        await Promise.all([
          fetchOverview(campaignId),
          fetchScoreDistribution(campaignId),
          fetchAgeStats(campaignId),
          fetchUniversityStats(campaignId),
          fetchCityStats(campaignId),
        ]);
      setOverview(overviewRes);
      setScores(scoresRes);
      setAgeData(ageRes);
      setUniversityData(uniRes);
      setCityData(cityRes);
    } catch (err) {
      console.error("Failed to load analytics:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFilteredData(selectedCampaignId);
  }, [selectedCampaignId, loadFilteredData]);

  const handleCampaignSelect = (value: string) => {
    setSelectedCampaignId(value === "all" ? undefined : value);
  };

  const handleRowClick = (campaignId: string) => {
    setSelectedCampaignId((prev) => (prev === campaignId ? undefined : campaignId));
  };

  // KPI card config
  const kpiCards = [
    {
      label: "Total Campaigns",
      value: overview.totalCampaigns,
      icon: Briefcase,
    },
    {
      label: "Active Campaigns",
      value: overview.activeCampaigns,
      icon: Activity,
    },
    {
      label: "Total Applicants",
      value: overview.totalApplicants,
      icon: Users,
    },
    {
      label: "Average Score",
      value: overview.averageScore,
      icon: TrendingUp,
    },
  ];

  const statusColor = (status: string) => {
    switch (status) {
      case "ongoing":
        return "bg-green-100 text-green-700 border-green-200";
      case "completed":
        return "bg-gray-100 text-gray-700 border-gray-200";
      case "not-started":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-600 border-gray-200";
    }
  };

  return (
    <div className="p-6 relative">
      {/* Subscription gate */}
      {!isUserSubscribed && (
        <div className="absolute top-0 right-0 w-full h-full flex flex-col items-center pt-32 z-10 backdrop-blur-md">
          <h2 className="text-2xl font-semibold mb-4 text-center">
            Subscribe to Pro
          </h2>
          <p className="text-lg text-muted-foreground mb-4 text-center max-w-md">
            Subscribe to Pro to get access to all features.
          </p>
          <Link href="/pricing">
            <Button className="bg-[#16A34A] text-white">Subscribe</Button>
          </Link>
        </div>
      )}

      <BreadcrumbDemo />
      <h1 className="text-2xl font-semibold pt-8 pb-6">Campaign Analytics</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {kpiCards.map((kpi) => (
          <Card key={kpi.label} className="py-4">
            <CardContent className="flex items-center gap-4 px-4 py-0">
              <div className="rounded-lg bg-green-50 p-2.5">
                <kpi.icon className="h-5 w-5 text-[#16A34A]" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{kpi.label}</p>
                <p className="text-2xl font-bold">{kpi.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Campaign Filter + Score Distribution */}
      <div className="bg-card rounded-lg p-6 border shadow-sm mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
          <h2 className="text-lg font-semibold">Score Distribution</h2>
          <Select
            value={selectedCampaignId ?? "all"}
            onValueChange={handleCampaignSelect}
          >
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="All Campaigns" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Campaigns</SelectItem>
              {campaigns.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={scores}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="range" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="count" fill="#16A34A" radius={[4, 4, 0, 0]} name="Applicants" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* City + University side by side */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        {/* City Donut */}
        <div className="bg-card rounded-lg p-6 border shadow-sm">
          <h2 className="text-lg font-semibold mb-4">City Distribution</h2>
          {cityData.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-16">
              No data available
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={cityData.map((c) => ({ name: c.city, value: c.count }))}
                  dataKey="value"
                  cx="50%"
                  cy="50%"
                  outerRadius={110}
                  innerRadius={60}
                  paddingAngle={2}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  labelLine={true}
                >
                  {cityData.map((_, i) => (
                    <Cell
                      key={`city-${i}`}
                      fill={CHART_COLORS[i % CHART_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* University Horizontal Bar */}
        <div className="bg-card rounded-lg p-6 border shadow-sm">
          <h2 className="text-lg font-semibold mb-4">
            University Distribution (Top 10)
          </h2>
          {universityData.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-16">
              No data available
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                data={universityData}
                layout="vertical"
                margin={{ left: 10, right: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" allowDecimals={false} />
                <YAxis
                  type="category"
                  dataKey="university"
                  width={120}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip />
                <Bar
                  dataKey="count"
                  fill="#22c55e"
                  radius={[0, 4, 4, 0]}
                  name="Applicants"
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Age Distribution Area Chart */}
      <div className="bg-card rounded-lg p-6 border shadow-sm mb-6">
        <h2 className="text-lg font-semibold mb-4">Age Distribution</h2>
        {ageData.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-16">
            No data available
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={ageData}>
              <defs>
                <linearGradient id="ageGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#16A34A" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#16A34A" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="age" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="count"
                stroke="#16A34A"
                strokeWidth={2}
                fill="url(#ageGradient)"
                name="Applicants"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Campaign Performance Table */}
      <div className="bg-card rounded-lg p-6 border shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Campaign Performance</h2>
        {campaigns.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-8">
            No campaigns found
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Campaign</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Applicants</TableHead>
                <TableHead className="text-right">Avg Score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaigns.map((c) => (
                <TableRow
                  key={c.id}
                  className={`cursor-pointer ${
                    selectedCampaignId === c.id ? "bg-green-50" : ""
                  }`}
                  onClick={() => handleRowClick(c.id)}
                >
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={statusColor(c.status)}
                    >
                      {c.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {c.applicantCount}
                  </TableCell>
                  <TableCell className="text-right">{c.avgScore}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
