// ChartComponents.tsx - Вспомогательные компоненты графика
import React from 'react';
import { View, Text, Button, ActivityIndicator } from 'react-native';
import { Line, Text as SvgText, G, Rect, Defs, ClipPath, Path } from 'react-native-svg';
import Animated from 'react-native-reanimated';
import { CHART_CONFIG } from './constants/chartConfig';
import { generatePath } from './utils/chartUtils';
import { LineSeries, XAxisTick, VisibleSeries } from './types';
import chartStyles from './style';
import LegendDot from './LegendDot';

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedG = Animated.createAnimatedComponent(G);

interface ChartGridProps {
  width: number;
  height: number;
  padding: number;
  minY: number;
  maxY: number;
}

export const ChartGrid: React.FC<ChartGridProps> = ({ width, height, padding, minY, maxY }) => {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => {
        const y = padding + ((height - padding * 2) / 4) * i;
        const yVal = maxY - ((maxY - minY) / 4) * i;
        return (
          <React.Fragment key={`grid-${i}`}>
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
    </>
  );
};

interface ChartAxesProps {
  width: number;
  height: number;
  padding: number;
}

export const ChartAxes: React.FC<ChartAxesProps> = ({ width, height, padding }) => (
  <>
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
  </>
);

interface ChartPathsProps {
  chartData: LineSeries[];
  visibleSeries: VisibleSeries;
  scaleX: (timestamp: number) => number;
  scaleY: (value: number) => number;
  height: number;
  padding: number;
  animatedProps: any;
}

export const ChartPaths: React.FC<ChartPathsProps> = ({
  chartData,
  visibleSeries,
  scaleX,
  scaleY,
  height,
  padding,
  animatedProps
}) => (
  <G clipPath="url(#clip)">
    <AnimatedG animatedProps={animatedProps}>
      {chartData.map(line => 
        visibleSeries[line.key] && (
          <AnimatedPath
            key={line.key}
            d={generatePath(line.values, scaleX, scaleY, height, padding)}
            stroke={line.color}
            strokeWidth={CHART_CONFIG.STROKE.WIDTH}
            fill="none"
          />
        )
      )}
    </AnimatedG>
  </G>
);

interface ChartClipPathProps {
  width: number;
  height: number;
  padding: number;
}

export const ChartClipPath: React.FC<ChartClipPathProps> = ({ width, height, padding }) => (
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
);

interface XAxisLabelsProps {
  ticks: XAxisTick[];
  height: number;
  padding: number;
}

export const XAxisLabels: React.FC<XAxisLabelsProps> = ({ ticks, height, padding }) => (
  <>
    {ticks.map(({ x, label }, i) => (
      <SvgText
        key={`x-tick-${i}`}
        x={x + padding - 10}
        y={height - padding / 2}
        fontSize="11"
        fill="black"
        textAnchor="middle"
      >
        {label}
      </SvgText>
    ))}
  </>
);

interface ChartLegendProps {
  visibleLines: LineSeries[];
}

export const ChartLegend: React.FC<ChartLegendProps> = ({ visibleLines }) => (
  <View style={chartStyles.legend}>
    {visibleLines.map((line) => (
      <LegendDot key={line.key} label={line.key} color={line.color} />
    ))}
  </View>
);

interface LoadingStateProps {
  onRetry?: () => void;
}

export const LoadingState: React.FC<LoadingStateProps> = () => (
  <View style={[chartStyles.container, chartStyles.centerContent]}>
    <ActivityIndicator size="large" color="#007AFF" />
    <Text style={chartStyles.loadingText}>Loading data...</Text>
  </View>
);

interface ErrorStateProps {
  error?: any;
  onRetry: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ error, onRetry }) => (
  <View style={[chartStyles.container, chartStyles.centerContent]}>
    <Text style={chartStyles.errorTitle}>Error loading data</Text>
    <Text style={chartStyles.errorText}>
      {error ? JSON.stringify(error) : "Unknown error or no data available"}
    </Text>
    <Button title="Retry" onPress={onRetry} />
  </View>
);