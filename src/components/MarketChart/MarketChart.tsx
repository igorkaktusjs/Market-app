import React from 'react';
import { View } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';
import Svg from 'react-native-svg';
import { useGetAAPLHistoryQuery } from "../../store/marketApi";
import { ChartTooltip } from './Tooltip/Tooltip';
import { useChartLogic } from './useChartLogic';
import chartStyles from './style';
import {
  ChartGrid,
  ChartAxes,
  ChartClipPath,
  ChartPaths,
  XAxisLabels,
  ChartLegend,
  LoadingState,
  ErrorState,
} from './ChartComponents';

/**
 * Main MarketChart component
 * Renders an interactive financial chart with pinch-to-zoom, pan, and tooltip functionality
 */
export default function MarketChart(): React.JSX.Element {
  // API query
  const { data, isLoading, isError, refetch, error } = useGetAAPLHistoryQuery();

  // Chart logic hook
  const {
    currentData,
    chartData,
    visibleLines,
    xTicks,
    bounds,
    scaleX,
    scaleY,
    handlePinch,
    scale,
    translateX,
    savedTranslateX,
    tooltipX,
    showTooltip,
    animatedProps,
    visibleSeries,
    width,
    height,
    padding,
  } = useChartLogic({ data });

  // Gesture handlers
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

  // Loading state
  if (isLoading) {
    return <LoadingState />;
  }

  // Error state
  if (isError || !data || !Array.isArray(data) || data.length === 0 || currentData.length === 0) {
    return <ErrorState error={error} onRetry={refetch} />;
  }

  // Main chart render
  return (
    <View style={chartStyles.chart}>
      <GestureDetector gesture={composedGesture}>
        
        <Svg height={height} width={width}>

          {/* Background grid and Y-axis labels */}
          <ChartGrid 
            width={width} 
            height={height} 
            padding={padding} 
            minY={bounds.minY} 
            maxY={bounds.maxY} 
          />

          {/* Legend outside SVG */}
          <ChartLegend visibleLines={visibleLines} />

          {/* Chart axes */}
          <ChartAxes width={width} height={height} padding={padding} />

          {/* Clipping path for chart area */}
          <ChartClipPath width={width} height={height} padding={padding} />

          {/* Chart data paths */}
          <ChartPaths
            chartData={chartData}
            visibleSeries={visibleSeries}
            scaleX={scaleX}
            scaleY={scaleY}
            height={height}
            padding={padding}
            animatedProps={animatedProps}
          />

          {/* X-axis labels */}
          <XAxisLabels ticks={xTicks} height={height} padding={padding} />

          {/* Interactive tooltip */}
          <ChartTooltip
            tooltipX={tooltipX}
            showTooltip={showTooltip}
            currentData={currentData}
            scaleX={scaleX}
            minX={bounds.minX}
            maxX={bounds.maxX}
            height={height}
            padding={padding}
            visibleSeries={visibleSeries}
          />
        </Svg>
      </GestureDetector>

      
    </View>
  );
}