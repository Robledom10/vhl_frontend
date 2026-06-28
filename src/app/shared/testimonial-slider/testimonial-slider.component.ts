import { Component, OnInit, OnDestroy } from '@angular/core';
import { forkJoin } from 'rxjs';
import { PackageService } from '../../core/services/package.service';
import { RespuestaComentarioPaquete } from '../package-detail-sheet/models/comments.model';

interface ComentarioConPaquete extends RespuestaComentarioPaquete {
	paqueteNombre: string;
}

const POR_GRUPO = 1;

@Component({
	selector: 'app-testimonial-slider',
	templateUrl: './testimonial-slider.component.html',
	styleUrls: ['./testimonial-slider.component.css'],
})
export class TestimonialSliderComponent implements OnInit, OnDestroy {

	comentarios: ComentarioConPaquete[] = [];
	index = 0;
	visible = true;
	private timer: any;

	constructor(private packageService: PackageService) {}

	ngOnInit(): void {
		this.cargar();
	}

	ngOnDestroy(): void {
		clearInterval(this.timer);
	}

	private cargar(): void {
		this.packageService.getPackages({ activo: true, tamano: 10 }).subscribe({
			next: (page) => {
				const paquetes = page.content.slice(0, 6);
				if (!paquetes.length) return;

				forkJoin(paquetes.map(p => this.packageService.getComments(p.id))).subscribe({
					next: (resultados) => {
						const todos: ComentarioConPaquete[] = [];
						resultados.forEach((lista, i) => {
							lista.forEach(c => {
								if (c.comentario?.trim()) {
									todos.push({ ...c, paqueteNombre: paquetes[i].titulo });
								}
							});
						});
						this.comentarios = todos;
						if (this.totalGrupos > 1) this.iniciar();
					}
				});
			}
		});
	}

	private iniciar(): void {
		this.timer = setInterval(() => this.avanzar(), 5500);
	}

	avanzar(): void {
		this.visible = false;
		setTimeout(() => {
			this.index = (this.index + POR_GRUPO) % Math.max(this.comentarios.length, 1);
			this.visible = true;
		}, 420);
	}

	irA(grupo: number): void {
		if (grupo === this.grupoActual) return;
		clearInterval(this.timer);
		this.visible = false;
		setTimeout(() => {
			this.index = grupo * POR_GRUPO;
			this.visible = true;
			this.iniciar();
		}, 420);
	}

	get visibles(): ComentarioConPaquete[] {
		const n = this.comentarios.length;
		if (!n) return [];
		return Array.from({ length: POR_GRUPO }, (_, i) =>
			this.comentarios[(this.index + i) % n]
		);
	}

	get grupoActual(): number {
		return Math.floor(this.index / POR_GRUPO);
	}

	get totalGrupos(): number {
		return Math.ceil(this.comentarios.length / POR_GRUPO);
	}

	get gruposArr(): number[] {
		return Array.from({ length: this.totalGrupos }, (_, i) => i);
	}

	iniciales(nombre: string): string {
		return (nombre ?? '').split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2);
	}

	stars(n: number): number[] {
		return Array.from({ length: 5 }, (_, i) => i + 1);
	}
}
