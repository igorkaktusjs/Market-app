
import { format } from 'date-fns';
import { CandleData, XAxisTick, LineSeries, VisibleSeries } from './types';

/**
 * Normalizes timestamp to Unix timestamp (seconds)
 * Handles various timestamp formats: milliseconds, seconds, date strings
 */
export const normalizeTimestamp = (timestamp: string | number): number | null => {
  if (typeof timestamp === 'number') {
    return timestamp > 1000000000000 ? Math.floor(timestamp / 1000) : timestamp;
  }
  
  if (typeof timestamp === 'string') {
    // Handle numeric string
    if (/^\d+$/.test(timestamp)) {
      const num = parseInt(timestamp, 10);
      return num > 1000000000000 ? Math.floor(num / 1000) : num;
    }
    
    // Handle DD/MM/YYYY format
    if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(timestamp)) {
      const [day, month, year] = timestamp.split('/');
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      return Math.floor(date.getTime() / 1000);
    }
    
    // Handle other date string formats
    const date = new Date(timestamp);
    if (!isNaN(date.getTime())) {
      return Math.floor(date.getTime() / 1000);
    }
  }
  
  return null;
};

/**
 * Normalizes data array by converting timestamps and filtering invalid entries
 */
export const normalizeData = (data: CandleData[]): CandleData[] => {
  if (!data || !Array.isArray(data)) {
    return [];
  }

  const normalized = data
    .map(item => {
      const normalizedTimestamp = normalizeTimestamp(item.timestamp);
      if (normalizedTimestamp === null) {
        console.warn('Could not parse timestamp:', item.timestamp);
        return null;
      }
      return { ...item, timestamp: normalizedTimestamp };
    })
    .filter(Boolean) as CandleData[];

  console.log(`Data normalization: ${data.length} -> ${normalized.length} records`);
  return normalized;
};

/**
 * Creates chart series data from normalized candle data
 */
export const createChartSeries = (currentData: CandleData[], colors: any): LineSeries[] => {
  if (!currentData.length) return [];

  const series = [
    { 
      key: 'Open' as const, 
      color: colors.SERIES.OPEN, 
      values: currentData.map(d => [d.timestamp, d.open] as [number, number])
    },
    { 
      key: 'High' as const, 
      color: colors.SERIES.HIGH, 
      values: currentData.map(d => [d.timestamp, d.high] as [number, number])
    },
    { 
      key: 'Low' as const, 
      color: colors.SERIES.LOW, 
      values: currentData.map(d => [d.timestamp, d.low] as [number, number])
    },
    { 
      key: 'Close' as const, 
      color: colors.SERIES.CLOSE, 
      values: currentData.map(d => [d.timestamp, d.close] as [number, number])
    },
  ];

  console.log('Chart data created:', series.map(s => `${s.key}: ${s.values.length} points`));
  return series;
};

/**
 * Generate X-axis ticks with labels
 */
export const generateXTicks = (
  currentData: CandleData[], 
  scaleX: (timestamp: number) => number
): XAxisTick[] => {
  if (!currentData.length) return [];
  
  const step = Math.max(1, Math.floor(currentData.length / 4));
  const ticks: XAxisTick[] = [];
  
  for (let i = 0; i < 4; i++) {
    const index = Math.min(i * step, currentData.length - 1);
    const item = currentData[index];
    
    if (!item) continue;
    
    const timestamp = item.timestamp;
    let label = 'Invalid Date';
    
    try {
      if (typeof timestamp === 'number' && !isNaN(timestamp)) {
        const date = new Date(timestamp * 1000);
        if (!isNaN(date.getTime())) {
          label = format(date, 'dd/MM/yyyy');
        }
      }
    } catch (error) {
      console.warn('Error formatting date:', timestamp, error);
    }
    
    const x = scaleX(timestamp);
    ticks.push({ x, label });
  }
  
  return ticks;
};

/**
 * Get visible chart series for legend
 */
export const getVisibleLines = (chartData: LineSeries[], visibleSeries: VisibleSeries): LineSeries[] => {
  return chartData.filter(line => visibleSeries[line.key]);
};