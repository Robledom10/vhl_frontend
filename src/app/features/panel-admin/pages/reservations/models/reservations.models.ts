export interface Reservation {
	id: number;
	clienteNombre: string;
	clienteImagen: string;
	clienteEmail: string;
	clienteTelefono: string;
	destino: string;
	personas: number;
	fechaViaje: string;
	fechaReserva: string;
	estado: 'Confirmada' | 'Pendiente' | 'Cancelada';
	paqueteNombre: string;
	total: number;
	notas?: string;
}