import { RespuestaPaqueteTuristico } from '../../../models/package.model';

export interface AdminPackage {
	id: number;
	name: string;
	location: string;
	duration: string;
	price: number;
	capacity: number;
	status: string;
	imageUrl: string;
	source: RespuestaPaqueteTuristico;
}
