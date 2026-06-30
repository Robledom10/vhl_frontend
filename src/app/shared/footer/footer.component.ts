import { Component } from '@angular/core';
import { PdfService } from '../../services/pdf.service';

@Component({
	selector: 'app-footer',
	templateUrl: './footer.component.html',
	styleUrls: ['./footer.component.css'],
})
export class FooterComponent {
	showTerms = false;
	showCancellation = false;

	constructor(private pdfService: PdfService) {}

	openPoliticaCancelacion(): void {
		this.pdfService.generateCancelacionPDF();
	}

	openTerminosCondiciones(): void {
		this.pdfService.generateTerminosCondicionesPDF();
	}
}
