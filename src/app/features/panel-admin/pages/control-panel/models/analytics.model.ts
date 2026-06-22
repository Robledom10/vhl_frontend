export interface AuthStatistics {
	totalUsers: number;
	activeUsers: number;
	inactiveUsers: number;
	verifiedEmails: number;
	verifiedPhones: number;
	completedProfiles: number;
	lockedUsers: number;
	admins: number;
	clients: number;
	guides: number;

}

export interface ReservationStatistics {
	totalReservations: number;
	pendingReservations: number;
	approvedReservations: number;
	rejectedReservations: number;
	cancelledReservations: number;
}

export interface CatalogStatistics {
	totalPackages: number;
	activePackages: number;
	inactivePackages: number;
	totalCategories: number;
}