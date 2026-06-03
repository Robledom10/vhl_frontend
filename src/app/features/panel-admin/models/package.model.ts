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
  fechaInicio: string;
  lugarSalida: string;
  horaSalida: string;
  alojamiento: string;
  tipoHabitacion: string;
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
  fechaInicio: string;
  lugarSalida: string;
  horaSalida: string;
  alojamiento: string;
  tipoHabitacion: string;
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

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}