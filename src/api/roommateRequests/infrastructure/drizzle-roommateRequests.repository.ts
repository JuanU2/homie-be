import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { roommateRequests } from '@/db/schema';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import {
  CreateRoommateRequestModel,
  RoommateRequest,
} from '@/api/roommateRequests/domain/entity/roommateRequest';
import { IRoommateRequestsRepository } from '@/api/roommateRequests/domain/interface/roommateRequests.repository';

type RoommateRequestsSchema = { roommateRequests: typeof roommateRequests };

@Injectable()
export class DrizzleRoommateRequestsRepository
  implements IRoommateRequestsRepository
{
  constructor(
    @Inject('DRIZZLE_DB')
    private readonly db: NodePgDatabase<RoommateRequestsSchema>,
  ) {}

  async createRoommateRequest(
    request: CreateRoommateRequestModel,
  ): Promise<RoommateRequest> {
    const [createdRequest] = await this.db
      .insert(roommateRequests)
      .values({
        propertyId: request.propertyId,
        createdBy: request.createdBy,
        description: request.description,
        priceAmount: request.priceAmount,
        priceCurrency: request.priceCurrency,
        idealMoveInDate: request.idealMoveInDate ?? null,
        maxRoommates: request.maxRoommates,
        currentRoommates: request.currentRoommates,
      })
      .returning();

    if (!createdRequest) {
      throw new Error('Failed to create roommate request');
    }

    return createdRequest;
  }

  async getRoommateRequestById(id: string): Promise<RoommateRequest | undefined> {
    return this.db.query.roommateRequests.findFirst({
      where: requests => eq(requests.id, id),
    });
  }

  async getAllRoommateRequests(): Promise<RoommateRequest[]> {
    return this.db.query.roommateRequests.findMany();
  }
}
