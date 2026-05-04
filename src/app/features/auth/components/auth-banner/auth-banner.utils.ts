export interface BannerSlide {
  imgFondo: string;   // La de arriba a la izquierda
  imgFrente: string;  // La de abajo a la derecha
  titulo: string;
  descripcion: string;
}

export const BANNER_DATA: BannerSlide[] = [
  {
    imgFondo: 'https://res.cloudinary.com/dqcviyp18/image/upload/v1777916549/D%C3%ADa_1-22_dgdcaw.jpg',
    imgFrente: 'https://res.cloudinary.com/dqcviyp18/image/upload/v1777916548/D%C3%ADa_1-24_a7mmmp.jpg',
    titulo: 'Vive Tu Próxima Gran Aventura',
    descripcion: 'Explora lugares extraordinarios, conecta con la naturaleza y crea recuerdos que durarán toda la vida. Tu viaje comienza aquí.'
  },
  {
    imgFondo: 'URL_IMAGEN_GRANDE_2',
    imgFrente: 'URL_IMAGEN_PEQUE_2',
    titulo: 'Descubre Destinos Mágicos',
    descripcion: 'Viaja a los rincones más hermosos del mundo con la mejor compañía y seguridad.'
  },
  {
    imgFondo: 'URL_IMAGEN_GRANDE_3',
    imgFrente: 'URL_IMAGEN_PEQUE_3',
    titulo: 'Experiencias Inolvidables',
    descripcion: 'No solo es un viaje, es una historia que contarás por siempre.'
  }
];