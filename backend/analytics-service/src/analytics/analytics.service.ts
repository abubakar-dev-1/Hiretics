import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { supabase } from '../supabase.client';

interface Applicant {
  age?: number;
  university?: string;
  city?: string;
  score?: number;
  campaign_id?: string;
}

@Injectable()
export class AnalyticsService {
  async getAgeStats(userId: string, campaignId?: string) {
    let query = supabase.from('applicants').select('age').eq('user_id', userId);
    if (campaignId) {
      query = query.eq('campaign_id', campaignId);
    }

    const { data, error } = await query;

    if (error) {
      throw new InternalServerErrorException(
        'Failed to fetch age stats: ' + error.message,
      );
    }

    const counts = (data as Pick<Applicant, 'age'>[]).reduce(
      (acc, { age }) => {
        if (!age) return acc;
        acc[age] = (acc[age] || 0) + 1;
        return acc;
      },
      {} as Record<number, number>,
    );

    return Object.entries(counts)
      .map(([age, count]) => ({
        age: Number(age),
        count,
      }))
      .sort((a, b) => a.age - b.age);
  }

  async getUniversityStats(userId: string, campaignId?: string) {
    let query = supabase.from('applicants').select('university').eq('user_id', userId);
    if (campaignId) {
      query = query.eq('campaign_id', campaignId);
    }

    const { data, error } = await query;

    if (error) {
      throw new InternalServerErrorException(
        'Failed to fetch university stats: ' + error.message,
      );
    }

    const counts = (data as Pick<Applicant, 'university'>[]).reduce(
      (acc, { university }) => {
        if (!university) return acc;
        acc[university] = (acc[university] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    return Object.entries(counts)
      .map(([university, count]) => ({
        university,
        count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  async getCityStats(userId: string, campaignId?: string) {
    let query = supabase.from('applicants').select('city').eq('user_id', userId);
    if (campaignId) {
      query = query.eq('campaign_id', campaignId);
    }

    const { data, error } = await query;

    if (error) {
      throw new InternalServerErrorException(
        'Failed to fetch city stats: ' + error.message,
      );
    }

    const typedData = data as Pick<Applicant, 'city'>[];
    const total = typedData.filter((d) => d.city).length;

    const counts = typedData.reduce(
      (acc, { city }) => {
        if (!city) return acc;
        acc[city] = (acc[city] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    return Object.entries(counts).map(([city, count]) => ({
      city,
      count,
      percentage: total > 0 ? ((count / total) * 100).toFixed(2) : '0',
    }));
  }

  async getOverviewStats(userId: string, campaignId?: string) {
    const { data: campaigns, error: campaignsError } = await supabase
      .from('campaigns')
      .select('id, status')
      .eq('user_id', userId);

    if (campaignsError) {
      throw new InternalServerErrorException(
        'Failed to fetch overview stats: ' + campaignsError.message,
      );
    }

    let applicantQuery = supabase.from('applicants').select('score').eq('user_id', userId);
    if (campaignId) {
      applicantQuery = applicantQuery.eq('campaign_id', campaignId);
    }

    const { data: applicants, error: applicantsError } = await applicantQuery;

    if (applicantsError) {
      throw new InternalServerErrorException(
        'Failed to fetch overview stats: ' + applicantsError.message,
      );
    }

    const totalCampaigns = campaigns.length;
    const activeCampaigns = campaigns.filter(
      (c) => c.status === 'ongoing',
    ).length;
    const totalApplicants = applicants.length;

    const scores = applicants
      .map((a) => a.score)
      .filter((s): s is number => s != null);
    const averageScore =
      scores.length > 0
        ? Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length)
        : 0;

    return { totalCampaigns, activeCampaigns, totalApplicants, averageScore };
  }

  async getScoreDistribution(userId: string, campaignId?: string) {
    let query = supabase.from('applicants').select('score').eq('user_id', userId);
    if (campaignId) {
      query = query.eq('campaign_id', campaignId);
    }

    const { data, error } = await query;

    if (error) {
      throw new InternalServerErrorException(
        'Failed to fetch score distribution: ' + error.message,
      );
    }

    const buckets = [
      { range: '0-20', min: 0, max: 20, count: 0 },
      { range: '21-40', min: 21, max: 40, count: 0 },
      { range: '41-60', min: 41, max: 60, count: 0 },
      { range: '61-80', min: 61, max: 80, count: 0 },
      { range: '81-100', min: 81, max: 100, count: 0 },
    ];

    for (const row of data) {
      const score = row.score;
      if (score == null) continue;
      for (const bucket of buckets) {
        if (score >= bucket.min && score <= bucket.max) {
          bucket.count++;
          break;
        }
      }
    }

    return buckets.map(({ range, count }) => ({ range, count }));
  }

  async getCampaignsSummary(userId: string) {
    const { data: campaigns, error: campaignsError } = await supabase
      .from('campaigns')
      .select('id, name, status')
      .eq('user_id', userId)
      .eq('is_archived', false);

    if (campaignsError) {
      throw new InternalServerErrorException(
        'Failed to fetch campaigns summary: ' + campaignsError.message,
      );
    }

    const { data: applicants, error: applicantsError } = await supabase
      .from('applicants')
      .select('campaign_id, score')
      .eq('user_id', userId);

    if (applicantsError) {
      throw new InternalServerErrorException(
        'Failed to fetch campaigns summary: ' + applicantsError.message,
      );
    }

    const campaignMap = new Map<
      string,
      { count: number; totalScore: number; scoredCount: number }
    >();

    for (const app of applicants) {
      const cid = app.campaign_id;
      if (!cid) continue;
      const entry = campaignMap.get(cid) || {
        count: 0,
        totalScore: 0,
        scoredCount: 0,
      };
      entry.count++;
      if (app.score != null) {
        entry.totalScore += app.score;
        entry.scoredCount++;
      }
      campaignMap.set(cid, entry);
    }

    return campaigns.map((c) => {
      const stats = campaignMap.get(c.id) || {
        count: 0,
        totalScore: 0,
        scoredCount: 0,
      };
      return {
        id: c.id,
        name: c.name,
        status: c.status,
        applicantCount: stats.count,
        avgScore:
          stats.scoredCount > 0
            ? Math.round(stats.totalScore / stats.scoredCount)
            : 0,
      };
    });
  }
}
