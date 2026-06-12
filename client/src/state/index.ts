import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface initialStateTypes {
  isSidebarCollapsed: boolean;
  isDarkMode: boolean;
  backendToken: string | null;
  mongoId: string | null;
}

const initialState: initialStateTypes = {
  isSidebarCollapsed: false,
  isDarkMode: true,
  backendToken: null,
  mongoId: null,
};

export const globalSlice = createSlice({
  name: "global",
  initialState,
  reducers: {
    setIsSidebarCollapsed: (state, action: PayloadAction<boolean>) => {
      state.isSidebarCollapsed = action.payload;
    },
    setIsDarkMode: (state, action: PayloadAction<boolean>) => {
      state.isDarkMode = action.payload;
    },
    setSessionCredentials: (
      state,
      action: PayloadAction<{ backendToken: string | null; mongoId: string | null }>,
    ) => {
      state.backendToken = action.payload.backendToken;
      state.mongoId = action.payload.mongoId;
    },
  },
});

export const { setIsSidebarCollapsed, setIsDarkMode, setSessionCredentials } = globalSlice.actions;
export default globalSlice.reducer;
