export interface GraphData {
  chart: {
    title: string;
    type: string;
    unit: string;
  };
  device: {
    id: string;
    name: string;
    store_number: number;
    store_name: string;
  };
  legend: LegendItem[];
  series: {
    [key: string]: SeriesData;
  };
  thresholds: {
    [key: string]: ThresholdData;
  };
  zones: {
    [key: string]: ZoneData;
  };
  alerts: AlertData[];
  axis: {
    x: AxisConfig;
    y: AxisConfig;
  };
  metadata: {
    generated_at: string;
    data_range: {
      from: string;
      to: string;
    };
  };
}

export interface LegendItem {
  id: string;
  label: string;
  color: string;
  currentValue?: number;
  type?: 'zone' | 'marker';
}

export interface SeriesData {
  metric_name: string;
  metric_class: string;
  metric_units: string;
  hasData: boolean;
  data: DataPoint[];
}

export interface DataPoint {
  x: string;
  y: number;
}

export interface ThresholdData {
  value: number;
  label: string;
  color: string;
  style: 'solid' | 'dashed';
}

export interface ZoneData {
  label: string;
  color: string;
  periods: ZonePeriod[];
}

export interface ZonePeriod {
  xStart: string;
  xEnd: string;
}

export interface AlertData {
  id: string;
  timestamp: string;
  severity: 'critical' | 'major' | 'minor';
  message: string;
  value: number;
}

export interface AxisConfig {
  type: string;
  label: string;
  format?: string;
  unit?: string;
  min?: number;
  max?: number;
}
