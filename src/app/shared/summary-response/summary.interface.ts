export interface SummaryRecommendation {
  id: string;
  title: string;
  confidence: number;
  severity: 'high' | 'medium' | 'low';
  description: string;
  recommendations: string[];
  affected_metrics: string[];
  related_data: Record<string, number>;
}

export interface SummaryData {
  device: {
    id: string;
    name: string;
    store_number: number;
    store_name: string;
    case_class: string;
    pack_name: string;
  };
  analysis_date: string;
  recommendations: SummaryRecommendation[];
  summary: {
    title: string;
    description: string;
    overall_health: string;
    priority_actions: string[];
  };
  metrics_summary: {
    critical_count: number;
    warning_count: number;
    okay_count: number;
    total_alerts: number;
    data_quality_score: number;
  };
  metadata: {
    model_version: string;
    analysis_type: string;
    data_points_analyzed: number;
    time_range: {
      from: string;
      to: string;
    };
  };
}
