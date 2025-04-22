export type GearCategory = 'Base Layers' | 'Mid Layers' | 'Outer Layers' | 'Accessories';

export type WardrobeItem = {
  name: string;
  category: GearCategory;
  warmth: number;
};
