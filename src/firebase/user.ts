import { ResortData } from '../types/ResortData';
import { getData } from './utils';

const getResortData = async (): Promise<[string, ResortData][]> => {
  const locationData = await getData(`/skiResortLocations`);

  if (!locationData) throw new Error('Resort Data not found!');

  return Object.entries(locationData.val());
};

export { getResortData };
