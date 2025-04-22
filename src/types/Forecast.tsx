export type Forecast = {
  dayOfWeek: string;
  am: {
    minTemp: string;
    summary: string;
    snow: string;
    maxTemp: string;
  };
  pm: { summary: string; snow: string; maxTemp: string };
  night: { summary: string; snow: string; maxTemp: string };
};
