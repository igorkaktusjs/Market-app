import { useMemo, useCallback } from 'react';
import { useSharedValue, useAnimatedProps } from 'react-native-reanimated';
import { Dimensions } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store/index';
import { toggleLine, setChartMode } from '../../store/displaySlice';
import { aggregateToWeekly, getVisibleDataRange } from './utils/chartUtils';
import { CHART_CONFIG } from './constants/chartConfig';
import { 
  normalizeData, 
  createChartSeries, 
  generateXTicks,
  getVisibleLines 
} from './dataUtils';
import { CandleData, ChartBounds, SeriesState } from './types';

const { width } = Dimensions.get('window');
const { HEIGHT: height, PADDING: padding } = CHART_CONFIG.DIMENSIONS;

interface UseChartLogicProps {
  data?: CandleData[];
}

export const useChartLogic = ({ data }: UseChartLogicProps) => {
  const dispatch = useDispatch();

  // Redux selectors
  const visibleSeries = useSelector((state: RootState) => ({
    Open: state.display.open,
    High: state.display.high,
    Low: state.display.low,
    Close: state.display.close,
  }));

  const chartMode = useSelector((state: RootState) => state.display.chartMode);

  // Shared values for animations and gestures
  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const tooltipX = useSharedValue(0);
  const showTooltip = useSharedValue(false);

  // Normalize raw data once
  const normalizedData = useMemo(() => {
    console.log('=== Data Processing Debug ===');
    console.log('Raw data sample:', data?.slice(0, 2));
    
    const normalized = normalizeData(data || []);
    console.log('Normalized data sample:', normalized?.slice(0, 2));
    
    return normalized;
  }, [data]);

  // Aggregate weekly data
  const weeklyData = useMemo(() => {
    if (!normalizedData.length) return [];
    
    const weekly = aggregateToWeekly(normalizedData);
    console.log('Weekly data sample:', weekly?.slice(0, 2));
    return weekly;
  }, [normalizedData]);

  // Current data based on chart mode
  const currentData = useMemo(() => {
    const current = chartMode === 'weekly' ? weeklyData : normalizedData;
    console.log('Current data mode:', chartMode, 'Length:', current?.length);
    return current;
  }, [normalizedData, weeklyData, chartMode]);

  // X-axis bounds
  const { minX, maxX } = useMemo(() => {
    if (!currentData.length) {
      return { minX: 0, maxX: 1 };
    }
    
    const timestamps = currentData.map(d => d.timestamp);
    const result = {
      minX: Math.min(...timestamps),
      maxX: Math.max(...timestamps),
    };
    console.log('X bounds:', result);
    return result;
  }, [currentData]);

  // X scaling function
  const scaleX = useCallback((timestamp: number): number => {
    if (maxX === minX) return padding;
    return padding + ((timestamp - minX) / (maxX - minX)) * (width - padding * 2);
  }, [minX, maxX]);

  // Y-axis bounds based on visible data
  const { minY, maxY } = useMemo(() => {
    const range = getVisibleDataRange(
      currentData,
      visibleSeries,
      scale,
      translateX,
      width,
      padding,
      minX,
      maxX
    );
    console.log('Y bounds:', range);
    return range;
  }, [currentData, visibleSeries, scale.value, translateX.value, minX, maxX]);

  // Y scaling function
  const scaleY = useCallback((value: number): number => {
    if (maxY === minY) return 0;
    return ((value - minY) / (maxY - minY)) * (height - padding * 2);
  }, [minY, maxY]);

  // Chart series data
  const chartData = useMemo(() => 
    createChartSeries(currentData, CHART_CONFIG.COLORS), 
    [currentData]
  );
  
  // Visible lines for legend
  const visibleLines = useMemo(() => 
    getVisibleLines(chartData, visibleSeries), 
    [chartData, visibleSeries]
  );

  // Generate X-axis ticks
  const xTicks = useMemo(() => 
    generateXTicks(currentData, scaleX), 
    [currentData, scaleX]
  );

  // Handle pinch gesture to change chart mode
  const handlePinch = useCallback((scaleValue: number) => {
    if (scaleValue > 1.2 && chartMode !== 'daily') {
      dispatch(setChartMode('daily'));
    } else if (scaleValue < 0.8 && chartMode !== 'weekly') {
      dispatch(setChartMode('weekly'));
    }
  }, [chartMode, dispatch]);

  // Toggle series visibility
  const toggleSeries = useCallback((seriesKey: keyof SeriesState) => {
    dispatch(toggleLine(seriesKey.toLowerCase() as any));
  }, [dispatch]);

  // Animated props for chart transformations
  const animatedProps = useAnimatedProps(() => ({
    transform: [
      { translateX: translateX.value },
      { scaleX: scale.value },
    ],
    transformOrigin: `${width / 2}px ${height / 2}px`,
  }));

  const bounds: ChartBounds = { minX, maxX, minY, maxY };

  return {
    // Data
    currentData,
    chartData,
    visibleLines,
    xTicks,
    bounds,
    
    // Functions
    scaleX,
    scaleY,
    handlePinch,
    toggleSeries,
    
    // Animation values
    scale,
    translateX,
    savedTranslateX,
    tooltipX,
    showTooltip,
    animatedProps,
    
    // State
    visibleSeries,
    chartMode,
    
    // Constants
    width,
    height,
    padding,
  };
};