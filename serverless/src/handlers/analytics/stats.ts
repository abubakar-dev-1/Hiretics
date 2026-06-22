import { authed } from '../../lib/rbac';
import { ok, serverError } from '../../lib/response';
import { scanScoredByCompany, scanAllByCompany } from '../../models/candidate';
import { listCampaignsByCompany, computeStatus } from '../../models/campaign';

/**
 * Analytics over the company's scored candidates. DynamoDB Scan + in-memory
 * aggregation — fine at demo scale; precompute for production.
 */

export const age = authed(async (_e, ctx) => {
  try {
    const cands = await scanScoredByCompany(ctx.companyId);
    const counts: Record<number, number> = {};
    for (const c of cands) {
      if (c.age && c.age > 0) counts[c.age] = (counts[c.age] || 0) + 1;
    }
    const data = Object.entries(counts)
      .map(([a, count]) => ({ age: Number(a), count }))
      .sort((x, y) => x.age - y.age);
    return ok(data);
  } catch (e: any) {
    return serverError(e?.message || 'analytics failed');
  }
});

export const city = authed(async (_e, ctx) => {
  try {
    const cands = await scanScoredByCompany(ctx.companyId);
    const counts: Record<string, number> = {};
    let total = 0;
    for (const c of cands) {
      const k = (c.city || '').trim();
      if (k) {
        counts[k] = (counts[k] || 0) + 1;
        total++;
      }
    }
    const data = Object.entries(counts)
      .map(([city, count]) => ({
        city,
        count,
        percentage: total ? Math.round((count / total) * 100) : 0,
      }))
      .sort((x, y) => y.count - x.count);
    return ok(data);
  } catch (e: any) {
    return serverError(e?.message || 'analytics failed');
  }
});

export const university = authed(async (_e, ctx) => {
  try {
    const cands = await scanScoredByCompany(ctx.companyId);
    const counts: Record<string, number> = {};
    for (const c of cands) {
      const k = (c.university || '').trim();
      if (k) counts[k] = (counts[k] || 0) + 1;
    }
    const data = Object.entries(counts)
      .map(([university, count]) => ({ university, count }))
      .sort((x, y) => y.count - x.count);
    return ok(data);
  } catch (e: any) {
    return serverError(e?.message || 'analytics failed');
  }
});

const byCampaign = (e: any, id: string) =>
  !e.queryStringParameters?.campaign_id || e.queryStringParameters.campaign_id === id;

export const overview = authed(async (event, ctx) => {
  try {
    const campaigns = (await listCampaignsByCompany(ctx.companyId)).filter((c) =>
      byCampaign(event, c.campaignId),
    );
    const cands = (await scanAllByCompany(ctx.companyId)).filter((c) =>
      byCampaign(event, c.campaignId),
    );
    const scored = cands.filter((c) => c.status === 'Scored');
    const avg = scored.length
      ? Math.round(scored.reduce((s, c) => s + (c.aiScore || 0), 0) / scored.length)
      : 0;
    return ok({
      totalCampaigns: campaigns.length,
      activeCampaigns: campaigns.filter((c) => computeStatus(c) === 'ongoing').length,
      totalApplicants: cands.length,
      averageScore: avg,
    });
  } catch (e: any) {
    return serverError(e?.message || 'analytics failed');
  }
});

export const scores = authed(async (event, ctx) => {
  try {
    const cands = (await scanScoredByCompany(ctx.companyId)).filter((c) =>
      byCampaign(event, c.campaignId),
    );
    const buckets = [
      { range: '0-20', count: 0 },
      { range: '21-40', count: 0 },
      { range: '41-60', count: 0 },
      { range: '61-80', count: 0 },
      { range: '81-100', count: 0 },
    ];
    for (const c of cands) {
      const s = c.aiScore || 0;
      const i = s <= 20 ? 0 : s <= 40 ? 1 : s <= 60 ? 2 : s <= 80 ? 3 : 4;
      buckets[i].count++;
    }
    return ok(buckets);
  } catch (e: any) {
    return serverError(e?.message || 'analytics failed');
  }
});

export const campaignsSummary = authed(async (_event, ctx) => {
  try {
    const campaigns = await listCampaignsByCompany(ctx.companyId);
    const cands = await scanAllByCompany(ctx.companyId);
    const data = campaigns.map((c) => {
      const mine = cands.filter((x) => x.campaignId === c.campaignId);
      const scored = mine.filter((x) => x.status === 'Scored');
      const avg = scored.length
        ? Math.round(scored.reduce((s, x) => s + (x.aiScore || 0), 0) / scored.length)
        : 0;
      return {
        id: c.campaignId,
        name: c.name,
        status: computeStatus(c),
        applicantCount: mine.length,
        avgScore: avg,
      };
    });
    return ok(data);
  } catch (e: any) {
    return serverError(e?.message || 'analytics failed');
  }
});
