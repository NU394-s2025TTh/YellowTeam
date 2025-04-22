export type GearCategory = 'Layering' | 'Accessories' | 'Equipment';

export type WardrobeItem = {
  name: string;
  category: GearCategory;
  warmth: number;
};
