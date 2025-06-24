
export interface CandleData {
    timestamp: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }
  
  export interface SeriesState {
    [key: string]: boolean;
  }
  
  export interface LineSeries {
    key: keyof SeriesState;
    color: string;
    values: [number, number][];
  }
  
  export interface XAxisTick {
    x: number;
    label: string;
  }
  
  export interface VisibleSeries {
    Open: boolean;
    High: boolean;
    Low: boolean;
    Close: boolean;
  }
  
  export type ChartMode = 'daily' | 'weekly';
  
  export interface ChartBounds {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
  }