export interface SolicitudProveedor {
	nombre: string;
	tipoProveedor: string;
	correo?: string;
	telefono?: string;
}

export interface RespuestaProveedor {
	id: number;
	nombre: string;
	tipoProveedor: string;
	correo?: string;
	telefono?: string;
	activo: boolean;
}