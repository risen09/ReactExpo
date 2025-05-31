import React from 'react';
import { View, StyleSheet } from 'react-native';
import Plotly from 'react-native-plotly';

interface PlotDataPoint {
  x: number;
  y: number;
}

interface PlotSeries {
  name?: string;
  points: PlotDataPoint[];
}

interface PlotBlockData {
  plotType?: string;
  title?: string;
  series?: PlotSeries[];
}

interface PlotBlockProps {
  data?: PlotBlockData;
}

// Define the expected type for Plotly data
interface PlotlyTrace {
  type?: string;
  name?: string;
  x: number[];
  y: number[];
}

type PlotlyData = PlotlyTrace[];

const PlotBlock: React.FC<PlotBlockProps> = ({ data }) => {
  if (!data) {
    return null;
  }

  const plotData: PlotlyData | undefined = data.series?.map((seriesItem) => ({
    type: data.plotType,
    name: seriesItem.name,
    x: seriesItem?.points?.map((point) => point.x),
    y: seriesItem?.points?.map((point) => point.y),
  }));

  // Handle the case where plotData might be undefined
  if (!plotData) {
    return null; // Or a placeholder indicating no data
  }

  const layout = {
    title: data.title,
  };

  const config = {
    staticPlot: true,
  };

  return (
    <View style={styles.plot}>
      <Plotly data={plotData} layout={layout} config={config} />
    </View>
  );
};

const styles = StyleSheet.create({
  plot: {
    flex: 1,
    minHeight: 400,
  },
});

export default PlotBlock; 