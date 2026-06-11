export interface UserItem {
	id: number;
	image: string;
	name: string;
	email: string;
	role: string;
	status: 'Activo' | 'Inactivo';
	phone?: number;
}