import { Transporte } from '../../../models/operaciones.models';

export interface ViajeAlojamientoDisplay {
	idPaquete: number;
	id: number | null;
	nombre: string;
	titulo: string;
	destino: string;
	fecha: string;
	cupo: number;
	tieneViaje: boolean;
	alojamientoAsignado: boolean;
	alojamientoId: number | null;
	hotel: string | null;
	habitacion: string | null;
	direccion: string | null;
	viajeroNombre: string | null;
	alojamientoFechaIngreso: string | null;
	alojamientoFechaSalida: string | null;
}

export interface ViajeTransporteDisplay {
	idPaquete: number;
	id: number | null;
	nombre: string;
	titulo: string;
	destino: string;
	fecha: string;
	cupo: number;
	tieneViaje: boolean;
	transporteAsignado: boolean;
	transportes: Transporte[];
}

export interface UsuarioDisplay {
	id: number;
	firstName: string;
	lastName: string;
}
