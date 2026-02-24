import { Controller, Get, Query } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('age')
  getAgeAnalytics(@Query('campaign_id') campaignId?: string) {
    return this.analyticsService.getAgeStats(campaignId);
  }

  @Get('university')
  getUniversityAnalytics(@Query('campaign_id') campaignId?: string) {
    return this.analyticsService.getUniversityStats(campaignId);
  }

  @Get('city')
  getCityAnalytics(@Query('campaign_id') campaignId?: string) {
    return this.analyticsService.getCityStats(campaignId);
  }

  @Get('overview')
  getOverview(@Query('campaign_id') campaignId?: string) {
    return this.analyticsService.getOverviewStats(campaignId);
  }

  @Get('scores')
  getScoreDistribution(@Query('campaign_id') campaignId?: string) {
    return this.analyticsService.getScoreDistribution(campaignId);
  }

  @Get('campaigns-summary')
  getCampaignsSummary() {
    return this.analyticsService.getCampaignsSummary();
  }
}
