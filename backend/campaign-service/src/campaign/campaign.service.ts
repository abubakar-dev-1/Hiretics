import { Injectable } from '@nestjs/common';
import { supabase } from '../supabase.client';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';
import { format } from 'date-fns';

import { CampaignCriteria } from './dto/create-campaign.dto';

export interface Campaign {
  id: string;
  user_id: string;
  name: string;
  company_name: string;
  job_role: string;
  job_description: string;
  status?: string;
  is_favorite?: boolean;
  is_archived?: boolean;
  created_at: string;
  updated_at: string;
  criteria?: CampaignCriteria;
}

@Injectable()
export class CampaignService {
  async create(dto: CreateCampaignDto): Promise<Campaign> {
    const { data, error } = await supabase
      .from('campaigns')
      .insert([dto])
      .select()
      .single();
    if (error) throw error;
    return data as Campaign;
  }

  async updateCampaignStatuses() {
    const today = format(new Date(), 'yyyy-MM-dd');
    const { data: campaigns, error } = await supabase
      .from('campaigns')
      .select('*');
    if (error) throw error;
    for (const campaign of campaigns) {
      // Skip campaigns that were manually completed or archived
      if (campaign.status === 'completed' || campaign.status === 'archived') {
        continue;
      }
      let newStatus = campaign.status;
      if (campaign.start_date && campaign.end_date) {
        const startDate = format(new Date(campaign.start_date), 'yyyy-MM-dd');
        const endDate = format(new Date(campaign.end_date), 'yyyy-MM-dd');
        if (endDate < today) {
          newStatus = 'completed';
        } else if (startDate <= today || campaign.status === 'ongoing') {
          newStatus = 'ongoing';
        } else {
          newStatus = 'not-started';
        }
      }
      if (newStatus !== campaign.status) {
        await supabase
          .from('campaigns')
          .update({ status: newStatus })
          .eq('id', campaign.id);
      }
    }
  }

  async findAll(userId: string, isArchived?: boolean): Promise<Campaign[]> {
    await this.updateCampaignStatuses();
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('user_id', userId)
      .eq('is_archived', isArchived);
    if (error) throw error;
    return data as Campaign[];
  }
  async findAllFavourite(userId: string): Promise<Campaign[]> {
    await this.updateCampaignStatuses();
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('user_id', userId)
      .eq('is_favorite', true)
      .eq('is_archived', false);
    if (error) throw error;
    return data as Campaign[];
  }

  async findOne(id: string, userId: string): Promise<Campaign> {
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();
    if (error) throw error;
    return data as Campaign;
  }

  async update(id: string, userId: string, dto: UpdateCampaignDto): Promise<Campaign> {
    // 1. Update the campaign
    const { data, error } = await supabase
      .from('campaigns')
      .update({ ...dto, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();
    if (error) throw error;

    // 2. If status was explicitly set in the request, keep it as-is
    if (dto.status) {
      return data as Campaign;
    }

    // 3. Otherwise, auto-calculate status from dates
    const today = format(new Date(), 'yyyy-MM-dd');
    let newStatus = data.status;
    if (data.start_date && data.end_date) {
      const startDate = format(new Date(data.start_date), 'yyyy-MM-dd');
      const endDate = format(new Date(data.end_date), 'yyyy-MM-dd');
      if (endDate < today) {
        newStatus = 'completed';
      } else if (startDate <= today) {
        newStatus = 'ongoing';
      } else {
        newStatus = 'not-started';
      }
    }
    if (newStatus !== data.status) {
      const { data: updated } = await supabase
        .from('campaigns')
        .update({ status: newStatus })
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();
      return updated as Campaign;
    }

    // 4. Return the updated campaign
    return data as Campaign;
  }

  async remove(id: string, userId: string): Promise<{ message: string }> {
    const { error } = await supabase.from('campaigns').delete().eq('id', id).eq('user_id', userId);
    if (error) throw error;
    return { message: 'Campaign deleted successfully' };
  }
}
