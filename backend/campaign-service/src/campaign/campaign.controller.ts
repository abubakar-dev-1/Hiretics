import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Put,
  Delete,
  Query,
} from '@nestjs/common';
import { CampaignService, Campaign } from './campaign.service';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';

@Controller('campaigns')
export class CampaignController {
  constructor(private readonly campaignService: CampaignService) {}

  @Post()
  create(@Body() dto: CreateCampaignDto): Promise<Campaign> {
    return this.campaignService.create(dto);
  }

  @Get()
  findAll(
    @Query('user_id') userId: string,
    @Query('is_archived') isArchived?: boolean,
  ): Promise<Campaign[]> {
    return this.campaignService.findAll(userId, isArchived);
  }
  @Get('favourite')
  findAllFavourite(@Query('user_id') userId: string): Promise<Campaign[]> {
    return this.campaignService.findAllFavourite(userId);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Query('user_id') userId: string,
  ): Promise<Campaign> {
    return this.campaignService.findOne(id, userId);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Query('user_id') userId: string,
    @Body() dto: UpdateCampaignDto,
  ): Promise<Campaign> {
    return this.campaignService.update(id, userId, dto);
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @Query('user_id') userId: string,
  ): Promise<{ message: string }> {
    return this.campaignService.remove(id, userId);
  }
}
