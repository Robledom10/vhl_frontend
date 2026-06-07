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
