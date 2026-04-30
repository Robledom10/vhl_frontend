// utils.ts
export interface Slide {
  img1: string;
  img2: string;
  title: string;
  desc: string;
}

export const slides: Slide[] = [
  {
    img1: "https://lh3.googleusercontent.com/d/1jefTeXq-6r9LKktTu5WhExk-ZeylLRf8",
    img2: "https://lh3.googleusercontent.com/d/1lh62xQfO8J34lKHwnqRp8wmjS9Rk5Bv7",
    title: "Vive Tu Próxima Gran Aventura",
    desc: "Explora lugares extraordinarios, conecta con la naturaleza y crea recuerdos que durarán toda la vida. Tu viaje comienza aquí.",
  },
  {
    img1: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&q=80",
    img2: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=400&q=80",
    title: "Cimas que Quitan el Aliento",
    desc: "Escala montañas imponentes y descubre la libertad que solo la naturaleza salvaje puede darte.",
  },
  {
    img1: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=500&q=80",
    img2: "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=400&q=80",
    title: "Costas de Ensueño",
    desc: "Playas vírgenes, atardeceres irrepetibles y la brisa del mar como única compañía.",
  },
];

type OnChangeCallback = (index: number) => void;

export interface CarouselControls {
  goTo: (index: number) => void;
  next: () => void;
  prev: () => void;
  start: (callback: OnChangeCallback) => void;
  stop: () => void;
  getCurrent: () => number;
}

export function useCarouselEngine(
  total: number,
  autoDelay: number = 4000
): CarouselControls {
  let current = 0;
  let timer: ReturnType<typeof setInterval> | null = null;
  let onChange: OnChangeCallback | null = null;

  function goTo(index: number): void {
    current = ((index % total) + total) % total;
    onChange?.(current);
    resetAuto();
  }

  function next(): void { goTo(current + 1); }
  function prev(): void { goTo(current - 1); }

  function resetAuto(): void {
    if (timer) clearInterval(timer);
    timer = setInterval(next, autoDelay);
  }

  function start(callback: OnChangeCallback): void {
    onChange = callback;
    resetAuto();
  }

  function stop(): void {
    if (timer) clearInterval(timer);
  }

  function getCurrent(): number { return current; }

  return { goTo, next, prev, start, stop, getCurrent };
}