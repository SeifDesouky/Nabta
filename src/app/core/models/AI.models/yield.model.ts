// ─────────────────────────────────────────────
//  Yield Forecast — API Response Models
//  Forecast : https://osamamahgoup0-yield.hf.space/forecast
//  Plants   : https://osamamahgoup0-yield.hf.space/plants
// ─────────────────────────────────────────────

// GET /plants
export interface PlantsResponse {
  count: number;
  plants: string[];
}

export interface YieldRow {
  year: number;
  type: 'historical' | 'forecast';
  production_ton: number;
  area_feddan: number | null;
}

export interface YieldForecastResponse {
  plant_name: string;
  start_year: number;
  last_historical_year: number;
  end_year: number;
  historical_total_ton: number;
  forecast_total_ton: number;
  rows: YieldRow[];
  forecast: YieldRow[];
}

export interface YieldForecastParams {
  plant_name: string;   // e.g. "Apples"
  end_year: number;     // e.g. 2025
}