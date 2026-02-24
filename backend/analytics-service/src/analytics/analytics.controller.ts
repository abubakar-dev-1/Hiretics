import { Controller, Get, Query } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('age')
  getAgeAnalytics(
    @Query('user_id') userId: string,
    @Query('campaign_id') campaignId?: string,
  ) {
    return this.analyticsService.getAgeStats(userId, campaignId);
  }

  @Get('university')
  getUniversityAnalytics(
    @Query('user_id') userId: string,
    @Query('campaign_id') campaignId?: string,
  ) {
    return this.analyticsService.getUniversityStats(userId, campaignId);
  }

  @Get('city')
  getCityAnalytics(
    @Query('user_id') userId: string,
    @Query('campaign_id') campaignId?: string,
  ) {
    return this.analyticsService.getCityStats(userId, campaignId);
  }

  @Get('overview')
  getOverview(
    @Query('user_id') userId: string,
    @Query('campaign_id') campaignId?: string,
  ) {
    return this.analyticsService.getOverviewStats(userId, campaignId);
  }

  @Get('scores')
  getScoreDistribution(
    @Query('user_id') userId: string,
    @Query('campaign_id') campaignId?: string,
  ) {
    return this.analyticsService.getScoreDistribution(userId, campaignId);
  }

  @Get('campaigns-summary')
  getCampaignsSummary(@Query('user_id') userId: string) {
    return this.analyticsService.getCampaignsSummary(userId);
  }
}
