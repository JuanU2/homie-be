import { Injectable } from "@nestjs/common";
import { DeviceTokensService } from "@/api/deviceTokens/deviceTokens.service";
import { PushService, type PushMessage } from "@/push/push.service";
import type {
  RoommateApplication,
  RoommateApplicationStatus,
} from "@/api/roommateApplications/domain/entity/roommateApplication";
import type { Listing } from "@/api/listings/domain/entity/listing";

/// Builds and sends push notifications for roommate-application events.
@Injectable()
export class RoommateApplicationPushService {
  constructor(
    private readonly deviceTokensService: DeviceTokensService,
    private readonly pushService: PushService,
  ) {}

  async notifyNewApplication(
    listing: Listing,
    application: RoommateApplication,
  ): Promise<void> {
    const tokens = await this.deviceTokensService.getTokens(listing.createdBy);
    await this.pushService.send(tokens, {
      title: "New roommate application",
      body: `Someone applied to "${listing.title}"`,
      data: {
        type: "new_application",
        listingId: listing.id,
        applicationId: application.id,
      },
    });
  }

  async notifyStatusChanged(
    status: RoommateApplicationStatus,
    application: RoommateApplication,
    listing: Listing,
  ): Promise<void> {
    const recipientId =
      status === "VIEWING_OFFERED" ||
      status === "ACCEPTED" ||
      status === "REJECTED"
        ? application.applicantId
        : listing.createdBy;

    const tokens = await this.deviceTokensService.getTokens(recipientId);
    await this.pushService.send(
      tokens,
      this.messageFor(status, application, listing),
    );
  }

  private messageFor(
    status: RoommateApplicationStatus,
    application: RoommateApplication,
    listing: Listing,
  ): PushMessage {
    return {
      title: this.titleFor(status),
      body: this.bodyFor(status, listing.title),
      data: {
        type: this.typeFor(status),
        listingId: listing.id,
        applicationId: application.id,
        status,
      },
    };
  }

  private titleFor(status: RoommateApplicationStatus): string {
    switch (status) {
      case "VIEWING_OFFERED":
        return "New viewing invitation";
      case "VIEWING_CONFIRMED":
        return "Viewing confirmed";
      case "VIEWING_DECLINED":
        return "Viewing declined";
      default:
        return "Roommate application updated";
    }
  }

  private bodyFor(status: RoommateApplicationStatus, title: string): string {
    switch (status) {
      case "VIEWING_OFFERED":
        return `The owner of "${title}" proposed viewing times`;
      case "VIEWING_CONFIRMED":
        return `A viewing for "${title}" was confirmed`;
      case "VIEWING_DECLINED":
        return `The applicant declined the proposed times for "${title}"`;
      default:
        return `Your application to "${title}" was ${status.toLowerCase()}`;
    }
  }

  private typeFor(status: RoommateApplicationStatus): string {
    switch (status) {
      case "VIEWING_OFFERED":
        return "viewing_offered";
      case "VIEWING_CONFIRMED":
        return "viewing_confirmed";
      case "VIEWING_DECLINED":
        return "viewing_declined";
      default:
        return "application_status_changed";
    }
  }
}
