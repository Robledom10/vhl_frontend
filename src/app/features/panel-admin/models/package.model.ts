export interface SolicitudActividadItinerario {
	numeroDia: number;
	titulo: string;
}

export interface SolicitudPaqueteTuristico {
	titulo: string;
	descripcion?: string;
	destino: string;
	duracionDias: number;
	precio: number;
	cupo: number;
	fechaInicio: string;
	fechaFin: string;
	lugarSalida: string;
	horaSalida: string;
	alojamiento: string;
	tipoHabitacion: string;
	tipoTransporte: string;
	fotoVerticalUrl: string;
	fotoHorizontalUrl: string;
	incluye: string[];
	noIncluye: string[];
	politicasCancelacion: string[];
	idCategoria: number;
	itinerario: SolicitudActividadItinerario[];
}

export interface RespuestaPaqueteTuristico {
	id: number;
	titulo: string;
	descripcion: string;
	destino: string;
	duracionDias: number;
	precio: number;
	cupo: number;
	fechaInicio: string;
	fechaFin: string;
	lugarSalida: string;
	horaSalida: string;
	alojamiento: string;
	tipoHabitacion: string;
	tipoTransporte: string;
	fotoVerticalUrl: string;
	fotoHorizontalUrl: string;
	incluye: string[];
	noIncluye: string[];
	politicasCancelacion: string[];
	activo: boolean;
	idCategoria: number;
	categoria: string;

	itinerario: {
		id: number;
		numeroDia: number;
		titulo: string;
		idPaquete: number;
	}[];
}