export type ResortData = {
  name: string;
  temperature: string;
  snowfall: string;
  precipitation: string;
  wind: string;
  openLifts: number;
  totalLifts: number;
  trailsOpen: number;
  totalTrails: number;
  checklist: string[];
};

export const gearCategories = {
  Layering: '',
  Accessories: '',
  Equipment: '',
} as const;

export type GearCategory = keyof typeof gearCategories;
