import {
  Controller,
  Post,
  Get,
  Query,
  UploadedFile,
  UseInterceptors,
  Body,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CvService } from './cv.service';

@Controller('cv')
export class CvController {
  constructor(private readonly cvService: CvService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async uploadCv(
    @UploadedFile() file: Express.Multer.File,
    @Body('campaign_id') campaignId: string,
    @Body('user_id') userId: string,
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }
    if (!campaignId) {
      throw new BadRequestException('campaign_id is required');
    }
    if (!userId) {
      throw new BadRequestException('user_id is required');
    }
    return this.cvService.processCv(file, campaignId, userId);
  }

  @Get()
  async getCvs(
    @Query('campaign_id') campaignId: string,
    @Query('user_id') userId: string,
  ) {
    if (!campaignId) throw new BadRequestException('campaign_id is required');
    if (!userId) throw new BadRequestException('user_id is required');
    return this.cvService.getRankedCvs(campaignId, userId);
  }
}
