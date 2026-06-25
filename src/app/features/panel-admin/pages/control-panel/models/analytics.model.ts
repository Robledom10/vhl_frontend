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
	blockedReservations: number;
	pendingReservations: number;
	confirmedReservations: number;
	cancelledReservations: number;
	completedReservations: number;
	pastReservations: number;
	paidReservations: number;
	unpaidReservations: number;
}

export interface CatalogStatistics {
	totalPackages: number;
	activePackages: number;
	inactivePackages: number;
	totalProviders: number;
	activeProviders: number;
	inactiveProviders: number;
	averagePrice: number;
	maxPrice: number;
	minPrice: number;
}

export interface PackageReservations {
	year: number;
	packageId: number;
	packageName: string;
	totalReservations: number;
}