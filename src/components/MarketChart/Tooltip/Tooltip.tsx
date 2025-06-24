import React from 'react';
import Svg, { G, Line } from 'react-native-svg';
import Animated, { useAnimatedProps, SharedValue } from 'react-native-reanimated';
import { CHART_CONFIG } from '../constants/chartConfig';
import { CandleData } from '../utils/chartUtils';

const AnimatedLine = Animated.createAnimatedComponent(Line);

interface ChartTooltipProps {
  tooltipX: SharedValue<number>;
  showTooltip: SharedValue<boolean>;
  currentData: [];
  scaleX: (timestamp: number) => number;
  minX: number;
  maxX: number;
  height: number;
  padding: number;
  visibleSeries: Record<'Open' | 'High' | 'Low' | 'Close', boolean>;
}

export function ChartTooltip({
  tooltipX,
  showTooltip,
  currentData,
  scaleX,
  minX,
  maxX,
  height,
  padding,
}: ChartTooltipProps) {
  const animatedLineProps = useAnimatedProps(() => ({
    x1: tooltipX.value,
    x2: tooltipX.value,
    opacity: showTooltip.value ? 1 : 0,
  }));

  return (
    <>
      <AnimatedLine
        animatedProps={animatedLineProps}
        y1={padding+6}
        y2={height - padding-4}
        stroke={CHART_CONFIG.COLORS.UI.TOOLTIP}
        strokeWidth={CHART_CONFIG.STROKE.TOOLTIP_WIDTH+4}
        strokeLinecap="round"
      />
    </>
  );
}
