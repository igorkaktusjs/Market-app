import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type ChartMode = 'daily' | 'weekly';

interface DisplayState {
  open: boolean;
  close: boolean;
  low: boolean;
  high: boolean;
  zoomed: boolean;
  chartMode: ChartMode; // новое поле
}

const initialState: DisplayState = {
  open: true,
  close: true,
  low: false,
  high: false,
  zoomed: false,
  chartMode: 'weekly', 
};

const displaySlice = createSlice({
  name: "display",
  initialState,
  reducers: {
    toggleLine: (state, action: PayloadAction<keyof DisplayState>) => {
      const key = action.payload;
      if (key !== 'zoomed' && key !== 'chartMode') {
        state[key] = !state[key];
      }
    },
    setZoom: (state, action: PayloadAction<boolean>) => {
      state.zoomed = action.payload;
    },
    setChartMode: (state, action: PayloadAction<ChartMode>) => {
      state.chartMode = action.payload;
    },
    resetDisplay: (state) => {
      state.zoomed = false;
      state.chartMode = 'weekly';
    }
  },
});

export const { toggleLine, setZoom, setChartMode, resetDisplay } = displaySlice.actions;
export default displaySlice.reducer;
