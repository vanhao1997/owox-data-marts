import type { Metric } from 'web-vitals';

function reportMetric(metric: Metric): void {
  if (import.meta.env.DEV) {
    console.log(`[Web Vitals] ${metric.name}: ${metric.value.toFixed(2)}`);
  }

  const endpoint = import.meta.env.VITE_ANALYTICS_ENDPOINT;
  if (endpoint) {
    const body = JSON.stringify({
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
      delta: metric.delta,
      id: metric.id,
      navigationType: metric.navigationType,
    });

    if (navigator.sendBeacon) {
      navigator.sendBeacon(`${endpoint}/web-vitals`, body);
    }
  }
}

export async function initWebVitals(): Promise<void> {
  const { onCLS, onLCP, onTTFB, onINP } = await import('web-vitals');
  onCLS(reportMetric);
  onLCP(reportMetric);
  onTTFB(reportMetric);
  onINP(reportMetric);
}
