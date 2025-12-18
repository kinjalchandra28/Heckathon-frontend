export interface MetricsData {
  device: {
    id: string;
    name: string;
    store_number: number;
    store_name: string;
    case_class: string;
    pack_class: string;
    pack_name: string;
  };
  metrics: MetricItem[];
  metadata: {
    generated_at: string;
    data_range: {
      from: string;
      to: string;
    };
    total_datapoints: number;
  };
}

export interface MetricItem {
  id: string;
  name: string;
  metric: {
    type: string;
    value: number;
    unit: string;
  };
  status: 'Critical' | 'Warning' | 'Okay';
  history: number | null;
  description: string;
}
