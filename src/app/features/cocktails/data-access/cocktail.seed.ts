import { Cocktail } from '../models/cocktail.model';

export const COCKTAIL_SEED: Cocktail[] = [
  {
    id: 'cherry-americano',
    name: 'Cherry Americano',
    description:
      'Лёгкий аперитив с мягкой горечью, вишнёвыми оттенками и свежим цитрусовым ароматом.',
    finalImageUrl: '/images/hero-cocktail.jpg',
    createdAt: '2026-07-20T18:30:00.000Z',
    updatedAt: '2026-07-20T18:30:00.000Z',
    steps: [
      {
        id: 'cherry-americano-step-1',
        title: 'Подготовьте бокал',
        description: 'Охладите бокал и наполните его крупными кубиками льда.',
        imageUrl: null,
      },
      {
        id: 'cherry-americano-step-2',
        title: 'Смешайте основу',
        description: 'Добавьте красный вермут и биттер, затем аккуратно перемешайте.',
        imageUrl: null,
      },
      {
        id: 'cherry-americano-step-3',
        title: 'Завершите коктейль',
        description: 'Добавьте содовую, украсьте вишней и апельсиновой цедрой.',
        imageUrl: null,
      },
    ],
  },
  {
    id: 'peach-spritz',
    name: 'Peach Spritz',
    description: 'Свежий персиковый спритц с игристым характером и мягким травяным послевкусием.',
    finalImageUrl: '/images/second-cocktail.jpg',
    createdAt: '2026-07-18T17:10:00.000Z',
    updatedAt: '2026-07-18T17:10:00.000Z',
    steps: [
      {
        id: 'peach-spritz-step-1',
        title: 'Добавьте лёд',
        description: 'Наполните винный бокал крупными кубиками льда.',
        imageUrl: null,
      },
      {
        id: 'peach-spritz-step-2',
        title: 'Соедините ингредиенты',
        description: 'Добавьте персиковый аперитив и охлаждённое игристое вино.',
        imageUrl: null,
      },
      {
        id: 'peach-spritz-step-3',
        title: 'Украсьте',
        description: 'Добавьте немного содовой и украсьте долькой персика.',
        imageUrl: null,
      },
    ],
  },
  {
    id: 'blue-garden',
    name: 'Blue Garden',
    description: 'Свежий коктейль с цветочными нотами, цитрусом и прохладным травяным ароматом.',
    finalImageUrl: '/images/third-cocktail.jpg',
    createdAt: '2026-07-15T19:45:00.000Z',
    updatedAt: '2026-07-15T19:45:00.000Z',
    steps: [
      {
        id: 'blue-garden-step-1',
        title: 'Подготовьте ингредиенты',
        description: 'Охладите ингредиенты и подготовьте свежий лимонный сок.',
        imageUrl: null,
      },
      {
        id: 'blue-garden-step-2',
        title: 'Встряхните',
        description: 'Добавьте ингредиенты в шейкер со льдом и встряхивайте 12 секунд.',
        imageUrl: null,
      },
      {
        id: 'blue-garden-step-3',
        title: 'Подавайте',
        description: 'Процедите коктейль в охлаждённый бокал и украсьте свежими травами.',
        imageUrl: null,
      },
    ],
  },
];
