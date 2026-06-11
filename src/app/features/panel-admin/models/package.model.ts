export interface SolicitudActividadItinerario {
	numeroDia: number;
	titulo: string;
}

export interface SolicitudPaqueteTuristico {
	titulo: string;
	descripcion?: string;
	destino: string;
	destinos?: string[];
	duracionDias: number;
	precio: number;
	cupo: number;
	lugarSalida: string;
	tipoTransporte: string;
	tiposTransporte?: string[];
	fotoVerticalUrl: string;
	fotoHorizontalUrl: string;
	incluye: string[];
	noIncluye: string[];
	politicasCancelacion: string[];
	requisitos?: string[];
	itinerario: SolicitudActividadItinerario[];
}

export interface RespuestaPaqueteTuristico {
	id: number;
	titulo: string;
	descripcion: string;
	destino: string;
	destinos?: string[];
	duracionDias: number;
	precio: number;
	cupo: number;
	lugarSalida: string;
	tipoTransporte: string;
	tiposTransporte?: string[];
	fotoVerticalUrl: string;
	fotoHorizontalUrl: string;
	incluye: string[];
	noIncluye: string[];
	politicasCancelacion: string[];
	requisitos: string[];
	activo: boolean;
	itinerario: {
		id: number;
		numeroDia: number;
		titulo: string;
		idPaquete: number;
	}[];
}

export interface RespuestaImagenPaquete {
	url: string;
}

export interface SolicitudProveedor {
  nombre: string;
  tipoProveedor: string;
  correo: string;
  telefono: string;
  // Transporte
  tipoVehiculo?: string;
  placa?: string;
  conductor?: string;
  telefonoConductor?: string;
  capacidad?: number;
  // Hotel / Restaurante
  direccion?: string;
  // Guía
  especialidad?: string;
  idioma?: string;
  // Restaurante
  tipoComida?: string;
  // General
  notas?: string;
}

export interface RespuestaProveedor {
  id: number;
  nombre: string;
  tipoProveedor: string;
  correo: string;
  telefono: string;
  activo: boolean;
  // Transporte
  tipoVehiculo?: string;
  placa?: string;
  conductor?: string;
  telefonoConductor?: string;
  capacidad?: number;
  // Hotel / Restaurante
  direccion?: string;
  // Guía
  especialidad?: string;
  idioma?: string;
  // Restaurante
  tipoComida?: string;
  // General
  notas?: string;
}

export interface PageResponse<T> {
	content: T[];
	totalElements: number;
	totalPages: number;
	number: number;
	size: number;
}