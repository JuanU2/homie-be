export type RoommateApplicationStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED';

export interface RoommateApplication {
  id: string;
  roommateRequestId: string;
  applicantId: string;
  note: string | null;
  status: RoommateApplicationStatus;
  createdAt: Date;
}

export interface CreateRoommateApplicationModel {
  roommateRequestId: string;
  applicantId: string;
  note?: string;
}

export interface RoommateApplicationListItem {
  id: string;
  roommateRequestId: string;
  propertyId: string;
  status: RoommateApplicationStatus;
  note: string | null;
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
  roommateRequestId: string;
  applicantId: string;
  note: string | null;
  status: RoommateApplicationStatus;
  createdAt: Date;
  applicant: RoommateApplicationApplicant;
}
