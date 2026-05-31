export interface BannerSlide {
	imgFondo: string;
	imgFrente: string;
	titulo: string;
	descripcion: string;
}

/**
 * Parámetros Cloudinary optimizados para calidad máxima:
 *  - f_auto       → formato óptimo (WebP / AVIF si el browser lo soporta)
 *  - q_auto:best  → calidad máxima automática
 *  - dpr_auto     → ajusta a la densidad de píxeles del dispositivo (Retina)
 *  - c_fill       → recorte inteligente sin distorsión
 *  - g_auto:faces → Cloudinary detecta caras y centra en ellas (¡mejora mucho el crop!)
 *  - w_900        → ancho suficiente para contenedores ≤450px en Retina 2×
 *  - ar_4:5       → proporción vertical, igual a tu CSS
 *
 *  ⚠️  Quita ar_4:5 si prefieres dejar que object-position maneje el recorte en CSS.
 */

export const BANNER_DATA: BannerSlide[] = [
	{
		imgFondo: `https://res.cloudinary.com/dqcviyp18/image/upload/f_auto,q_auto:best,dpr_auto,c_fill,w_900,ar_4:5/v1777919857/D%C3%ADa3-70_ebnjzm.jpg`,
		imgFrente: `https://res.cloudinary.com/dqcviyp18/image/upload/f_auto,q_auto:best,dpr_auto,c_fill,w_700,ar_4:5/v1777919855/D%C3%ADa3-69_xlko14.jpg`,
		titulo: 'Descubre nuevos destinos',
		descripcion: 'Vive aventuras inolvidables y conoce lugares increíbles con experiencias para ti. Atrévete a explorar y crear recuerdos únicos.',
	},
	{
		imgFondo: `https://res.cloudinary.com/dqcviyp18/image/upload/f_auto,q_auto:best,dpr_auto,c_fill,w_900,ar_4:5/v1777933202/D%C3%ADa_7-38_a8hmsh.jpg`,
		imgFrente: `https://res.cloudinary.com/dqcviyp18/image/upload/f_auto,q_auto:best,dpr_auto,c_fill,w_700,ar_4:5/v1777933201/D%C3%ADa_7-37_zgbob5.jpg`,
		titulo: 'Tu próxima aventura empieza aquí',
		descripcion: 'Encuentra excursiones, viajes y planes pensados para disfrutar cada momento. Prepárate para vivir experiencias inolvidables.',
	},
	{
		imgFondo: `https://res.cloudinary.com/dqcviyp18/image/upload/f_auto,q_auto:best,dpr_auto,c_fill,w_900,ar_4:5/v1777932610/D%C3%ADa5-12_uuxr8x.jpg`,
		imgFrente: `https://res.cloudinary.com/dqcviyp18/image/upload/f_auto,q_auto:best,dpr_auto,c_fill,w_700,ar_4:5/v1777932611/D%C3%ADa5-13_tcmbm3.jpg`,
		titulo: 'Viaja, explora y disfruta',
		descripcion: 'Conecta con la naturaleza, la cultura y nuevas emociones en cada recorrido. Haz de cada viaje una historia inolvidable.',
	},
];