export interface SolicitudProveedor {
	nombre: string;
	tipoProveedor: string;
	correo?: string;
	telefono?: string;
	tipoVehiculo?: string;
	placa?: string;
	conductor?: string;
	telefonoConductor?: string;
	capacidad?: number;
	direccion?: string;
	especialidad?: string;
	idioma?: string;
	tipoComida?: string;
	notas?: string;
}

export interface RespuestaProveedor {
	id: number;
	nombre: string;
	tipoProveedor: string;
	correo?: string;
	telefono?: string;
	activo: boolean;
	tipoVehiculo?: string;
	placa?: string;
	conductor?: string;
	telefonoConductor?: string;
	capacidad?: number;
	direccion?: string;
	especialidad?: string;
	idioma?: string;
	tipoComida?: string;
	notas?: string;
}