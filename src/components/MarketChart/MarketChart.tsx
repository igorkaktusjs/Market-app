import React, { useState, useMemo, useCallback } from 'react';
import { useGetAAPLHistoryQuery } from "../../store/marketApi";
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store/index';
import { toggleLine, setChartMode } from '../../store/displaySlice';

import {
  View,
  Text,
  Switch,
  Button,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import Svg, {
  Path,
  Line,
  Text as SvgText,
  G,
  Circle,
  Rect,
  Defs,
  ClipPath,
} from 'react-native-svg';
import { format } from 'date-fns';
import {
  GestureDetector,
  Gesture,
  GestureTouchEvent,
  GestureUpdateEvent,
} from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  runOnJS,
  SharedValue,
} from 'react-native-reanimated';
import { CHART_CONFIG } from './constants/chartConfig';
import {
  aggregateToWeekly,
  generatePath,
  getVisibleDataRange,
} from './utils/chartUtils';
import { ChartTooltip } from './Tooltip/Tooltip';
import LegendDot from "./LegendDot";

const { width } = Dimensions.get('window');
const { HEIGHT: height, PADDING: padding } = CHART_CONFIG.DIMENSIONS;

interface CandleData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface SeriesState {
  [key: string]: boolean;
}

interface LineSeries {
  key: keyof SeriesState;
  color: string;
  values: [number, number][];
}

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedG = Animated.createAnimatedComponent(G);


function normalizeTimestamp(timestamp) {
  if (typeof timestamp === 'number') {
    return timestamp > 1000000000000 ? Math.floor(timestamp / 1000) : timestamp;
  }
  
  if (typeof timestamp === 'string') {
    if (/^\d+$/.test(timestamp)) {
      const num = parseInt(timestamp, 10);
      return num > 1000000000000 ? Math.floor(num / 1000) : num;
    }
    
    if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(timestamp)) {
      const [day, month, year] = timestamp.split('/');
      const date = new Date(year, month - 1, day);
      return Math.floor(date.getTime() / 1000);
    }
    
    const date = new Date(timestamp);
    if (!isNaN(date.getTime())) {
      return Math.floor(date.getTime() / 1000);
    }
  }
  
  return null;
}


function normalizeData(data) {
  if (!data || !Array.isArray(data)) {
    return [];
  }

  const normalized = data.map(item => {
    const normalizedTimestamp = normalizeTimestamp(item.timestamp);
    if (normalizedTimestamp === null) {
      console.warn('Could not parse timestamp:', item.timestamp);
      return null;
    }

    return {
      ...item,
      timestamp: normalizedTimestamp
    };
  }).filter(Boolean);

  console.log('Data normalization:', data.length, '->', normalized.length, 'records');
  return normalized;
}

export default function MarketChart(): React.FC {
  
const dispatch = useDispatch();

const display = useSelector((state: RootState) => state.display);

const visibleSeries = useSelector((state: RootState) => ({
  Open: state.display.open,
  High: state.display.high,
  Low: state.display.low,
  Close: state.display.close,
}));

  const chartMode = useSelector((state: RootState) => state.display.chartMode);

  const handlePinch = useCallback((scaleValue: number) => {
    if (scaleValue > 1.2 && chartMode !== 'daily') {
      dispatch(setChartMode('daily'));
    } else if (scaleValue < 0.8 && chartMode !== 'weekly') {
      dispatch(setChartMode('weekly'));
    }
  }, [chartMode, dispatch]);

  const { data, isLoading, isError, refetch, error } = useGetAAPLHistoryQuery();

  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const tooltipX = useSharedValue(0);
  const showTooltip = useSharedValue(false);

  // Нормализация исходных данных ОДИН РАЗ
  const normalizedData = useMemo(() => {
    console.log('=== Data Processing Debug ===');
    console.log('Raw data sample:', data?.slice(0, 2));
    
    const normalized = normalizeData(data);
    console.log('Normalized data sample:', normalized?.slice(0, 2));
    
    return normalized;
  }, [data]);

  // Агрегация недельных данных
  const weeklyData = useMemo(() => {
    if (!normalizedData || normalizedData.length === 0) {
      return [];
    }
    const weekly = aggregateToWeekly(normalizedData);
    console.log('Weekly data sample:', weekly?.slice(0, 2));
    return weekly;
  }, [normalizedData]);

  // Текущие данные в зависимости от режима
  const currentData = useMemo(() => {
    const current = chartMode === 'weekly' ? weeklyData : normalizedData;
    console.log('Current data sample:', current?.slice(0, 2));
    console.log('Current data mode:', chartMode, 'Length:', current?.length);
    return current || [];
  }, [normalizedData, weeklyData, chartMode]);

  // Границы данных по X
  const { minX, maxX } = useMemo(() => {
    if (!currentData || currentData.length === 0) {
      return { minX: 0, maxX: 1 };
    }
    const result = {
      minX: Math.min(...currentData.map(d => d.timestamp)),
      maxX: Math.max(...currentData.map(d => d.timestamp)),
    };
    console.log('X bounds:', result);
    return result;
  }, [currentData]);

  // Функция масштабирования X
  const scaleX = useCallback((ts: number) => {
    if (maxX === minX) return padding;
    const result = padding + ((ts - minX) / (maxX - minX)) * (width - padding * 2);
    return result;
  }, [minX, maxX]);

  // Границы данных по Y
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

  // Функция масштабирования Y
  const scaleY = useCallback((val: number) => {
    if (maxY === minY) return 0;
    const result = ((val - minY) / (maxY - minY)) * (height - padding * 2);
    return result;
  }, [minY, maxY]);

  // Данные для графика
  const chartData: LineSeries[] = useMemo(() => {
    if (!currentData || currentData.length === 0) {
      return [];
    }
  
    const series = [
      { key: 'Open', color: CHART_CONFIG.COLORS.SERIES.OPEN, values: currentData.map(d => [d.timestamp, d.open]) },
      { key: 'High', color: CHART_CONFIG.COLORS.SERIES.HIGH, values: currentData.map(d => [d.timestamp, d.high]) },
      { key: 'Low', color: CHART_CONFIG.COLORS.SERIES.LOW, values: currentData.map(d => [d.timestamp, d.low]) },
      { key: 'Close', color: CHART_CONFIG.COLORS.SERIES.CLOSE, values: currentData.map(d => [d.timestamp, d.close]) },
    ];
  
    console.log('Chart data created:', series.map(s => `${s.key}: ${s.values.length} points`));
    return series;
  }, [currentData]);
  
  // Правильный список для легенды:
  const visibleLines = chartData.filter(line => visibleSeries[line.key]);

  // Функция для создания меток по X
  const getXTicks = useCallback(() => {
    if (!currentData || currentData.length === 0) {
      return [];
    }
    
    const step = Math.max(1, Math.floor(currentData.length / 4));
    const ticks = [];
    
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
  }, [currentData, scaleX]);


  const toggleSeries = useCallback((seriesKey: keyof SeriesState) => {
    dispatch(toggleLine(seriesKey.toLowerCase() as keyof Omit<DisplayOptionsState, 'zoomed'>));
  }, [dispatch]);;

  const animatedProps = useAnimatedProps(() => ({
    transform: [
      { translateX: translateX.value },
      { scaleX: scale.value },
    ],
    transformOrigin: `${width / 2}px ${height / 2}px`,
  }));

  // --- Gestures ---
  const pinchGesture = Gesture.Pinch()
    .onUpdate(e => {
      'worklet';
      scale.value = e.scale;
      translateX.value = savedTranslateX.value * e.scale + e.focalX - (width / 2);
      runOnJS(handlePinch)(e.scale);
    })
    .onEnd(() => {
      'worklet';
      savedTranslateX.value = translateX.value;
      
    });

  const panGesture = Gesture.Pan()
    .onStart(() => {
      'worklet';
      if (!showTooltip.value) {
        savedTranslateX.value = translateX.value;
      }
    })
    .onUpdate(e => {
      'worklet';
      if (showTooltip.value) {
        tooltipX.value = e.x;
      } else {
        translateX.value = savedTranslateX.value + e.translationX * scale.value;
      }
    })
    .onEnd(() => {
      'worklet';
      showTooltip.value = false;
    });

  const longPressGesture = Gesture.LongPress()
    .minDuration(300)
    .onStart(e => {
      'worklet';
      showTooltip.value = true;
      tooltipX.value = e.x;
    });

  const composedGesture = Gesture.Simultaneous(
    pinchGesture,
    Gesture.Simultaneous(longPressGesture, panGesture)
  );

  // УСЛОВНЫЕ ВОЗВРАТЫ ТОЛЬКО ПОСЛЕ ВСЕХ ХУКОВ
  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading data...</Text>
      </View>
    );
  }

  if (isError || !data || !Array.isArray(data) || data.length === 0 || normalizedData.length === 0) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorTitle}>Error loading data</Text>
        <Text style={styles.errorText}>
          {error ? JSON.stringify(error) : "Unknown error or no data available"}
        </Text>
        <Button title="Retry" onPress={refetch} />
      </View>
    );
  }

  return (
    <View style={styles.chart}>
      <GestureDetector gesture={composedGesture}>
        <Svg height={height} width={width}>
          {/* Background grid and labels */}
          {Array.from({ length: 5 }).map((_, i) => {
            const y = padding + ((height - padding * 2) / 4) * i;
            const yVal = maxY - ((maxY - minY) / 4) * i;
            return (
              <React.Fragment key={i}>
                <Line
                  x1={padding}
                  x2={width - padding}
                  y1={y}
                  y2={y}
                  stroke={CHART_CONFIG.COLORS.UI.GRID}
                  strokeDasharray="4 4"
                />
                <SvgText x={14} y={y + 4} fontSize="11" fill="black">
                  ${yVal.toFixed(0)}
                </SvgText>
              </React.Fragment>
            );
          })}

          {/* Axes */}
          <Line
            x1={padding}
            y1={padding}
            x2={padding}
            y2={height - padding}
            stroke={CHART_CONFIG.COLORS.UI.AXIS}
            strokeWidth={1.5}
          />
          <Line
            x1={padding}
            y1={height - padding}
            x2={width - padding}
            y2={height - padding}
            stroke={CHART_CONFIG.COLORS.UI.AXIS}
            strokeWidth={1.5}
          />

          {/* Clipping path */}
          <Defs>
            <ClipPath id="clip">
              <Rect
                x={padding}
                y={padding}
                width={width - padding * 2}
                height={height - padding * 2}
              />
            </ClipPath>
          </Defs>

          {/* Chart paths */}
          <G clipPath="url(#clip)">
            <AnimatedG animatedProps={animatedProps}>
              {chartData.map(line => visibleSeries[line.key] && (
                <AnimatedPath
                  key={line.key}
                  d={generatePath(line.values, scaleX, scaleY, height, padding)}
                  stroke={line.color}
                  strokeWidth={CHART_CONFIG.STROKE.WIDTH}
                  fill="none"
                />
              ))}
            </AnimatedG>
          </G>

          {/* X-axis labels */}
          {getXTicks().map(({ x, label }, i) => (
            <SvgText
              key={i}
              x={x+ padding -10}
              y={height - padding / 2}
              fontSize="11"
              fill="black"
              textAnchor="middle"
            >
              {label}
            </SvgText>
          ))}

          {/* Legend */}
          <View style={{ flexDirection: 'row', padding: 10 }}>
              {visibleLines.map((line) => (
            <LegendDot key={line.key} label={line.key} color={line.color} />
                ))}
            </View>

          {/* Tooltip */}
          <ChartTooltip
            tooltipX={tooltipX}
            showTooltip={showTooltip}
            currentData={currentData}
            scaleX={scaleX}
            minX={minX}
            maxX={maxX}
            height={height}
            padding={padding}
            visibleSeries={visibleSeries}
          />
        </Svg>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding:20,

  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chart: {
    backgroundColor: '#BDC1CA',
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  controls: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
    justifyContent: 'space-around',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#d32f2f',
    marginBottom: 10,
  },
  errorText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
});