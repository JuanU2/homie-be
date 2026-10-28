export type RoommateApplicationStatus =
  | 'PENDING'
  | 'VIEWING_OFFERED'
  | 'VIEWING_CONFIRMED'
  | 'VIEWING_DECLINED'
  | 'ACCEPTED'
  | 'REJECTED';

export interface RoommateApplication {
  id: string;
  listingId: string;
  applicantId: string;
  note: string | null;
  status: RoommateApplicationStatus;
  viewingOptions: Date[] | null;
  viewingChosenAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateRoommateApplicationModel {
  listingId: string;
  applicantId: string;
  note?: string;
}

export interface RoommateApplicationListItem {
  id: string;
  listingId: string;
  propertyId: string;
  status: RoommateApplicationStatus;
  note: string | null;
  viewingOptions: Date[] | null;
  viewingChosenAt: Date | null;
  createdAt: Date;
  title: string;
  titleImageId: string | null;
}

export interface RoommateApplicationsPage {
  items: RoommateApplicationListItem[];
  nextCursor: string | null;
}

export interface GetRoommateApplicationsParams {
  limit: number;
  cursor?: string;
  status?: RoommateApplicationStatus;
}

export interface RoommateApplicationApplicant {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string | null;
  profileUrl: string | null;
}

export interface RoommateApplicationWithApplicant {
  id: string;
  listingId: string;
  applicantId: string;
  note: string | null;
  status: RoommateApplicationStatus;
  viewingOptions: Date[] | null;
  viewingChosenAt: Date | null;
  createdAt: Date;
  applicant: RoommateApplicationApplicant;
}

export interface RoommateApplicationListItemWithApplicant
  extends RoommateApplicationListItem {
  applicant: RoommateApplicationApplicant;
}

export interface RoommateApplicationsWithApplicantPage {
  items: RoommateApplicationListItemWithApplicant[];
  nextCursor: string | null;
}
