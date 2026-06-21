import { ValidationDetail } from "../../../../../core/services/document-management.service";

export interface TravelerDocument {

	idDocument: number;
	userId: number;
	reservationId: number;

	documentType:
	| 'cedula'
	| 'pasaporte'
	| 'visa'
	| 'permiso_menor'
	| 'vacuna'
	| 'otro';

	fileUrl: string;

	status:
	| 'pendiente'
	| 'en_proceso'
	| 'aprobado'
	| 'rechazado';

	createdAt: string;

	// Para la IA
	validation?: ValidationDetail;
}

export interface TravelerFile {
	userId: number;
	reservationId: number;
	documents: TravelerDocument[];
}