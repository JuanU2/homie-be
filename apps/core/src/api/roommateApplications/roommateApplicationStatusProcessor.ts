import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
} from "@nestjs/common";
import {
  type IRoommateApplicationsRepository,
  ROOMMATE_APPLICATIONS_REPOSITORY,
} from "@/api/roommateApplications/domain/interface/roommateApplications.repository";
import type { RoommateApplication } from "@/api/roommateApplications/domain/entity/roommateApplication";
import type { UpdateRoommateApplicationDtoRequest } from "@/api/roommateApplications/dtos/roommateApplications.dto";

/// Applies a requested status change to a roommate application, enforcing the
/// role and state rules for each transition and writing through the repository.
@Injectable()
export class RoommateApplicationStatusProcessor {
  constructor(
    @Inject(ROOMMATE_APPLICATIONS_REPOSITORY)
    private readonly repository: IRoommateApplicationsRepository,
  ) {}

  process(
    application: RoommateApplication,
    isOwner: boolean,
    isApplicant: boolean,
    data: UpdateRoommateApplicationDtoRequest,
  ): Promise<RoommateApplication | undefined> {
    switch (data.status) {
      case "VIEWING_OFFERED":
        return this.offerViewing(application, isOwner, data.dateTimes);
      case "VIEWING_CONFIRMED":
        return this.confirmViewing(application, isApplicant, data.dateTime);
      case "VIEWING_DECLINED":
        return this.declineViewing(application, isApplicant);
      case "ACCEPTED":
        return this.accept(
          application,
          isOwner,
          data.incrementCurrentRoommates,
        );
      case "REJECTED":
        return this.reject(application, isOwner);
      default:
        throw new BadRequestException("Unsupported application status");
    }
  }

  offerViewing(
    application: RoommateApplication,
    isOwner: boolean,
    dateTimes?: string[],
  ): Promise<RoommateApplication | undefined> {
    if (!isOwner) {
      throw new ForbiddenException(
        "Only the listing owner can offer a viewing",
      );
    }
    const options = this.parseViewingOptions(dateTimes);
    return this.repository.updateViewingState(application.id, {
      status: "VIEWING_OFFERED",
      viewingOptions: options,
      viewingChosenAt: null,
    });
  }

  confirmViewing(
    application: RoommateApplication,
    isApplicant: boolean,
    dateTime?: string,
  ): Promise<RoommateApplication | undefined> {
    if (!isApplicant) {
      throw new ForbiddenException("Only the applicant can confirm a viewing");
    }
    if (application.status !== "VIEWING_OFFERED") {
      throw new BadRequestException("No viewing offer to confirm");
    }
    const chosen = dateTime ? new Date(dateTime) : null;
    const offered = application.viewingOptions ?? [];
    if (
      !chosen ||
      !offered.some((time) => time.getTime() === chosen.getTime())
    ) {
      throw new BadRequestException("The chosen time was not offered");
    }
    return this.repository.updateViewingState(application.id, {
      status: "VIEWING_CONFIRMED",
      viewingOptions: null,
      viewingChosenAt: chosen,
    });
  }

  declineViewing(
    application: RoommateApplication,
    isApplicant: boolean,
  ): Promise<RoommateApplication | undefined> {
    if (!isApplicant) {
      throw new ForbiddenException("Only the applicant can decline a viewing");
    }
    if (application.status !== "VIEWING_OFFERED") {
      throw new BadRequestException("No viewing offer to decline");
    }
    return this.repository.updateViewingState(application.id, {
      status: "VIEWING_DECLINED",
      viewingOptions: null,
      viewingChosenAt: null,
    });
  }

  accept(
    application: RoommateApplication,
    isOwner: boolean,
    incrementCurrentRoommates?: boolean,
  ): Promise<RoommateApplication | undefined> {
    if (!isOwner) {
      throw new ForbiddenException(
        "You can only update applications for your own listing",
      );
    }
    if (application.status !== "VIEWING_CONFIRMED") {
      throw new BadRequestException("Confirm a viewing time before accepting");
    }
    return incrementCurrentRoommates === true
      ? this.repository.acceptRoommateApplication(
          application.id,
          application.listingId,
        )
      : this.repository.updateRoommateApplicationStatus(
          application.id,
          "ACCEPTED",
        );
  }

  reject(
    application: RoommateApplication,
    isOwner: boolean,
  ): Promise<RoommateApplication | undefined> {
    if (!isOwner) {
      throw new ForbiddenException(
        "You can only update applications for your own listing",
      );
    }
    return this.repository.updateRoommateApplicationStatus(
      application.id,
      "REJECTED",
    );
  }

  private parseViewingOptions(dateTimes?: string[]): Date[] {
    if (!dateTimes || dateTimes.length === 0) {
      throw new BadRequestException("Provide at least one viewing time");
    }
    const options = dateTimes.map((dateTime) => new Date(dateTime));
    if (options.some((time) => Number.isNaN(time.getTime()))) {
      throw new BadRequestException("Invalid viewing time");
    }
    if (options.some((time) => time.getTime() <= Date.now())) {
      throw new BadRequestException("Viewing times must be in the future");
    }
    const distinct = new Set(options.map((time) => time.getTime()));
    if (distinct.size !== options.length) {
      throw new BadRequestException("Viewing times must be distinct");
    }
    return options;
  }
}
