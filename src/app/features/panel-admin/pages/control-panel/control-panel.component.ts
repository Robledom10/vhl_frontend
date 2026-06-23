import { Component, OnInit } from '@angular/core';
import { ApexNonAxisChartSeries, ApexChart, ApexDataLabels, ApexTitleSubtitle, ApexAxisChartSeries, ApexPlotOptions, ApexXAxis, ApexLegend, ApexStroke, ApexFill, ApexGrid } from 'ng-apexcharts';
import { AnalyticsService } from '../../../../core/services/analytics.service';

export type PieChartOptions = {
	series: ApexNonAxisChartSeries;
	chart: ApexChart;
	labels: string[];
	dataLabels: ApexDataLabels;
	title: ApexTitleSubtitle;
	colors: string[];
	legend: ApexLegend;
	stroke: ApexStroke;
	plotOptions: any;
};

export type BarChartOptions = {
	series: ApexAxisChartSeries;
	chart: ApexChart;
	plotOptions: ApexPlotOptions;
	xaxis: ApexXAxis;
	title: ApexTitleSubtitle;
	colors: string[];
	fill: ApexFill;
	dataLabels: ApexDataLabels;
	grid: any;
};

// NUEVO: tipo para el radial bar de verificación
export type RadialChartOptions = {
	series: ApexNonAxisChartSeries;
	chart: ApexChart;
	labels: string[];
	colors: string[];
	plotOptions: any;
	legend: ApexLegend;
	stroke: ApexStroke;
};

const PALETTE = ['#1f8fe0', '#5fb6e8', '#9fd6f2', '#c9e9f8', '#0d6efd'];

@Component({
	selector: 'app-control-panel',
	templateUrl: './control-panel.component.html',
	styleUrl: './control-panel.component.css'
})
export class ControlPanelComponent implements OnInit {

	authStatistics: any;
	reservationStatistics: any;
	catalogStatistics: any;

	loadingAuth = true;
	loadingReservation = true;
	loadingCatalog = true;

	authChart: PieChartOptions = this.buildEmptyDonut();
	reservationChart: PieChartOptions = this.buildEmptyDonut();

	catalogChart: BarChartOptions = {
		series: [{ name: 'Paquetes', data: [] }],
		chart: { type: 'bar', height: 280, toolbar: { show: false }, fontFamily: 'inherit' },
		plotOptions: { bar: { horizontal: true, borderRadius: 10, barHeight: '45%' } },
		colors: [PALETTE[0]],
		fill: {
			type: 'gradient',
			gradient: { shade: 'light', type: 'horizontal', gradientToColors: [PALETTE[1]], opacityFrom: 1, opacityTo: 1 }
		},
		dataLabels: { enabled: true, style: { fontWeight: 600 } },
		grid: { borderColor: '#eef2f7', xaxis: { lines: { show: true } }, yaxis: { lines: { show: false } } },
		xaxis: { categories: [] },
		title: { text: '' }
	};

	// NUEVO: radial bar de verificación de usuarios
	verificationChart: RadialChartOptions = this.buildEmptyRadial();

	// NUEVO: bar chart de estado de usuarios (activos / inactivos / bloqueados)
	userStatusChart: BarChartOptions = {
		series: [{ name: 'Usuarios', data: [] }],
		chart: { type: 'bar', height: 260, toolbar: { show: false }, fontFamily: 'inherit' },
		plotOptions: {
			bar: {
				horizontal: false,
				borderRadius: 10,
				columnWidth: '45%',
				distributed: true
			}
		},
		colors: [PALETTE[0], PALETTE[1], '#e74c5c'],
		fill: { type: 'solid' },
		dataLabels: { enabled: true, style: { fontWeight: 600 } },
		grid: { borderColor: '#eef2f7', xaxis: { lines: { show: false } }, yaxis: { lines: { show: true } } },
		xaxis: { categories: [] },
		title: { text: '' }
	};

	constructor(private analyticsService: AnalyticsService) { }

	ngOnInit(): void {
		this.loadAuthStatistics();
		this.loadReservationStatistics();
		this.loadCatalogStatistics();
	}

	private buildEmptyDonut(): PieChartOptions {
		return {
			series: [],
			chart: { type: 'donut', height: 280, fontFamily: 'inherit' },
			labels: [],
			colors: PALETTE,
			dataLabels: { enabled: false },
			stroke: { width: 0 },
			legend: { show: false },
			plotOptions: {
				pie: {
					donut: {
						size: '72%',
						labels: {
							show: true,
							total: { show: true, label: 'Total', fontSize: '13px', color: '#8a94a6', fontWeight: 500 },
							value: { fontSize: '24px', fontWeight: 700, color: '#1c2b39' }
						}
					}
				}
			},
			title: { text: '' }
		};
	}

	// NUEVO
	private buildEmptyRadial(): RadialChartOptions {
		return {
			series: [],
			chart: { type: 'radialBar', height: 300, fontFamily: 'inherit' },
			labels: [],
			colors: [PALETTE[0], PALETTE[1], '#0d6efd'],
			stroke: { lineCap: 'round' },
			legend: {
				show: true,
				position: 'bottom',
				fontSize: '13px',
				labels: { colors: '#4a5a6a' }
			},
			plotOptions: {
				radialBar: {
					hollow: { size: '38%' },
					track: { background: '#eef2f7' },
					dataLabels: {
						name: { fontSize: '13px', color: '#8a94a6' },
						value: { fontSize: '20px', fontWeight: 700, color: '#1c2b39' }
					}
				}
			}
		};
	}

	loadAuthStatistics() {
		this.analyticsService.getAuthStatistics()
			.subscribe({
				next: response => {
					this.authStatistics = response;

					this.authChart = {
						...this.buildEmptyDonut(),
						series: [response.admins, response.clients, response.guides],
						labels: ['Administradores', 'Clientes', 'Guías']
					};

					// NUEVO: radial bar con % de verificación sobre el total de usuarios
					const total = response.totalUsers || 1;
					this.verificationChart = {
						...this.buildEmptyRadial(),
						series: [
							Math.round((response.verifiedEmails / total) * 100),
							Math.round((response.verifiedPhones / total) * 100),
							Math.round((response.completedProfiles / total) * 100)
						],
						labels: ['Emails Verificados', 'Teléfonos Verificados', 'Perfiles Completos']
					};

					// NUEVO: bar chart de estado de usuarios
					this.userStatusChart = {
						...this.userStatusChart,
						series: [{
							name: 'Usuarios',
							data: [response.activeUsers, response.inactiveUsers, response.lockedUsers]
						}],
						xaxis: { categories: ['Activos', 'Inactivos', 'Bloqueados'] }
					};

					this.loadingAuth = false;
				},
				error: () => this.loadingAuth = false
			});
	}

	loadReservationStatistics() {
		this.analyticsService.getReservationStatistics()
			.subscribe({
				next: response => {
					console.log('RESERVATION RESPONSE:', response);
					this.reservationStatistics = response;

					this.reservationChart = {
						...this.buildEmptyDonut(),
						series: [
							response.pendingReservations ?? 0,
							response.approvedReservations ?? 0,
							response.rejectedReservations ?? 0,
							response.cancelledReservations ?? 0
						],
						labels: ['Pendientes', 'Aprobadas', 'Rechazadas', 'Canceladas']
					};

					this.loadingReservation = false;
				},
				error: (err) => {
					console.error('RESERVATION ERROR:', err);
					this.loadingReservation = false;
				}
			});
	}

	loadCatalogStatistics() {
		this.analyticsService.getCatalogStatistics()
			.subscribe({
				next: response => {
					this.catalogStatistics = response;

					this.catalogChart = {
						...this.catalogChart,
						series: [{ name: 'Paquetes', data: [response.activePackages, response.inactivePackages] }],
						xaxis: { categories: ['Activos', 'Inactivos'] }
					};

					this.loadingCatalog = false;
				},
				error: () => this.loadingCatalog = false
			});
	}

	get activePackagesPercent(): number {
		if (!this.catalogStatistics?.totalPackages) return 0;
		return Math.round((this.catalogStatistics.activePackages / this.catalogStatistics.totalPackages) * 100);
	}

	get activeUsersPercent(): number {
		if (!this.authStatistics?.totalUsers) return 0;
		return Math.round((this.authStatistics.activeUsers / this.authStatistics.totalUsers) * 100);
	}
}