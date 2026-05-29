export interface AdminDashboard {
  totalUsers: number;
  totalCandidates: number;
  totalRecruiters: number;
  totalOffers: number;
  totalApplications: number;
  totalPremiumUsers: number;
  totalCompanies: number;
  pendingCompanies: number;
  publishedOffers: number;
  pendingApplications: number;
  generatedAt?: string;
}
