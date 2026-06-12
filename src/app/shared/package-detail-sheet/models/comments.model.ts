export interface SolicitudComentarioPaquete {
	comentario: string;
	puntaje: number;
}

export interface RespuestaComentarioPaquete {
	id: number;
	comentario: string;
	puntaje: number;
	autor: string;
	fechaCreacion: string;
}