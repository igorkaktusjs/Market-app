import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface DisplayOptionsState {
  open: boolean;
  close: boolean;
  low: boolean;
  high: boolean;
  zoomed: boolean;
}

const initialState: DisplayOptionsState = {
  open: true,
  close: true,
  low: false,
  high: false,
  zoomed: false,
};

const displaySlice = createSlice({
  name: "display",
  initialState,
  reducers: {
    toggleLine(state, action: PayloadAction<keyof Omit<DisplayOptionsState, 'zoomed'>>) {
      state[action.payload] = !state[action.payload];
    },
    setDisplay(state, action: PayloadAction<DisplayOptionsState>) {
    
      return action.payload;
    },
    setZoom(state, action: PayloadAction<boolean>) {
      state.zoomed = action.payload;
    },
    toggleZoom(state) {
      state.zoomed = !state.zoomed;
    }
  },
});

export const { toggleLine, setDisplay, setZoom, toggleZoom } = displaySlice.actions;
export default displaySlice.reducer;