export interface Viaje {
	id: number;
	idUsuario: number;
	idPaquete: number;
	fechaSalida: string;
	fechaRegreso: string;
	estado: string;
	mensaje?: string;
}

export interface Transporte {
	id: number;
	idViaje: number;
	tipoTransporte: string;
	empresa: string;
	placa: string;
	conductor: string;
	telefonoConductor: string;
	capacidad: number;
	cantidadViajeros: number;
	fechaSalida: string;
	fechaRegistro: string;
	mensaje?: string;
}

export interface CheckIn {
	id: number;
	idViaje: number;
	idViajero: number;
	codigoQr: string;
	idReserva?: number;
	fechaCheckIn: string;
	mensaje?: string;
}

export interface Alojamiento {
	id: number;
	idViaje: number;
	idViajero: number;
	nombreViajero?: string;
	hotel: string;
	habitacion: string;
	direccion: string;
	fechaIngreso: string;
	fechaSalida: string;
	fechaRegistro: string;
	mensaje?: string;
}

export interface InformacionMedica {
	id: number;
	idViaje: number;
	idViajero: number;
	tipoSangre: string;
	alergias: string;
	medicamentos: string;
	condicionesMedicas: string;
	telefonoMedico: string;
	fechaRegistro: string;
	mensaje?: string;
	nombreViajero?: string;
}

export interface ContactoEmergencia {
	id: number;
	idViaje: number;
	idViajero: number;
	nombre: string;
	parentesco: string;
	telefono: string;
	correo: string;
	fechaRegistro: string;
	mensaje?: string;
	nombreViajero?: string;
}

export interface Incidente {
	id: number;
	idViaje: number;
	idViajero?: number;
	tipo: string;
	descripcion: string;
	severidad: string;
	estado: string;
	reportadoPor: string;
	fechaRegistro: string;
	mensaje?: string;
}

export interface Restaurante {
	id: number;
	idViaje: number;
	nombreRestaurante: string;
	direccion?: string;
	telefono?: string;
	tipoComida?: string;
	notas?: string;
	fechaRegistro: string;
	mensaje?: string;
}

export interface Notificacion {
	id: number;
	idViaje: number;
	asunto: string;
	mensaje: string;
	canal: string;
	totalDestinatarios: number;
	fechaEnvio: string;
	estado: string;
	respuesta?: string;
}

export interface RespuestaEmail {
	id: number;
	notificacionId: number;
	remitenteEmail: string;
	asunto: string;
	contenido: string;
	fechaRecibida: string;
	leida: boolean;
}

export interface ViajeroReserva {
	id: number;
	nombre: string;
	apellido: string;
	documento: string;
	tipoDocumento: string;
	email: string;
	telefono?: string;
}

export interface ReservaApi {
	id: number;
	numeroReserva: string;
	idPaquete: number;
	idViaje?: number;
	idUsuario: number;
	cantidadPasajeros: number;
	precioTotal: number;
	fechaInicioViaje: string;
	fechaFinViaje: string;
	estado: string;
	pagoVerificado: boolean;
	fechaCreacion: string;
	viajeros: ViajeroReserva[];
	datosUsuario?: { email?: string; nombre?: string; apellido?: string };
	notas?: string;
}

export interface Dashboard {
	idViaje: number;
	viajerosRegistrados: number;
	viajerosConCheckIn: number;
	transportesAsignados: number;
	alojamientosAsignados: number;
	incidentesRegistrados: number;
	incidentesAbiertos: number;
	notificacionesEnviadas: number;
	porcentajeCheckIn: number;
	fechaConsulta: string;
}
