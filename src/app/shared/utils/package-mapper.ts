import { RespuestaPaqueteTuristico } from '../../features/panel-admin/models/package.model';
import { PackageDetail } from '../package-detail-sheet/package-detail-sheet.component';

/**
 * Representación simplificada de un paquete para mostrarlo en tarjetas
 * (grid de la página de Paquetes, carrusel del chat de Sharky, etc.).
 */
export interface TravelPackage {
	id: number;
	name: string;
	location: string;
	price: number;
	imageUrl: string;
	rating: number;
	nights: number;
	category: string;
}

export function mapToTravelPackage(p: RespuestaPaqueteTuristico): TravelPackage {
	const destinos = p.destinos?.length ? p.destinos.join(' – ') : p.destino;
	return {
		id: p.id,
		name: p.titulo,
		location: destinos,
		price: p.precio,
		imageUrl: p.fotoHorizontalUrl || p.fotoVerticalUrl || '',
		rating: 4.5,
		nights: p.duracionDias,
		category: 'aventura',
	};
}

export function mapToPackageDetail(p: RespuestaPaqueteTuristico): PackageDetail {
	const destinos = p.destinos?.length ? p.destinos.join(', ') : p.destino;
	const nights = p.duracionDias;
	return {
		id: p.id,
		title: p.titulo,
		subtitle: p.descripcion || `Disfruta ${nights} días increíbles en ${destinos}.`,
		spotsAvailable: p.cupo,
		price: p.precio,
		destinations: destinos,
		duration: `${nights} Día${nights !== 1 ? 's' : ''} / ${nights - 1} Noche${nights - 1 !== 1 ? 's' : ''}`,
		departurePlace: p.lugarSalida || 'Por confirmar',
		transport: p.tiposTransporte?.join(', ') || p.tipoTransporte || 'Por confirmar',
		mainImage: p.fotoHorizontalUrl || p.fotoVerticalUrl || '',
		galleryImages: [p.fotoVerticalUrl, p.fotoHorizontalUrl].filter((url): url is string => !!url && url.trim() !== ''),
		itinerary: (p.itinerario || []).map((it) => ({
			day: `Día ${it.numeroDia}:`,
			desc: it.titulo,
		})),
		includes: p.incluye || [],
		notIncludes: p.noIncluye || [],
		cancellation: p.politicasCancelacion || [],
		requirements: p.requisitos || [],
	};
}

export function mapToPackageDetailFallback(pkg: TravelPackage): PackageDetail {
	return {
		id: pkg.id,
		title: pkg.name,
		subtitle: `Disfruta ${pkg.nights} noches increíbles en ${pkg.location}.`,
		spotsAvailable: 30,
		price: pkg.price,
		destinations: pkg.location,
		duration: `${pkg.nights + 1} Días / ${pkg.nights} Noches`,
		departurePlace: 'Por confirmar',
		transport: 'Por confirmar',
		mainImage: pkg.imageUrl,
		itinerary: [],
		includes: [],
		notIncludes: [],
		cancellation: [],
		requirements: [],
	};
}
