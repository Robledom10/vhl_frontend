import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GalleryAdminComponent } from './gallery-admin.component';

describe('GalleryAdminComponent', () => {
	let component: GalleryAdminComponent;
	let fixture: ComponentFixture<GalleryAdminComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [GalleryAdminComponent]
		})
			.compileComponents();

		fixture = TestBed.createComponent(GalleryAdminComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
