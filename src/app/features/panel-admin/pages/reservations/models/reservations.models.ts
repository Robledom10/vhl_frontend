import { Documento } from "../../profile/profile.component";

export interface DatosUsuario {
	id: number;
	nombre: string;
	apellido: string;
	email: string;
	telefono: string;
	rol?: string;
	activo?: boolean;
}

export interface ContactoEmergencia {
	id?: number;
	nombre: string;
	parentesco: string;
	telefono: string;
	correo?: string;
}

export interface Reservation {
	id: number;
	idUsuario: number;
	datosUsuario?: DatosUsuario;
	contactosEmergencia?: ContactoEmergencia[];
	documentos?: Documento[]; 
	destino: string;
	personas: number;
	fechaViaje: string;
	fechaReserva: string;
	estado: 'Confirmada' | 'Pendiente' | 'Cancelada' | 'Pasada' | 'Completada' | 'Bloqueada';
	paqueteNombre: string;
	total: number;
	notas?: string;
}
