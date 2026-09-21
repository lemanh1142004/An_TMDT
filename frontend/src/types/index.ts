export interface ApiResponse<T> {
  status: string;
  data: T;
  message?: string;
}

export interface HealthCheckResponse {
  status: string;
  service: string;
  timestamp: string;
}
