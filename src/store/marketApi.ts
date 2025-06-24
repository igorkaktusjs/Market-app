
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

type MarketDataItem = {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

type MarketDataResponse = {
  symbol: string;
  data: MarketDataItem[];
};

export const marketApi = createApi({
  reducerPath: 'marketApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'https://mock.apidog.com/m1/892843-874692-default/' }),
  endpoints: (builder) => ({
    getAAPLHistory: builder.query<MarketDataItem[], void>({
      query: () => 'marketdata/history/AAPL',
      transformResponse: (response: MarketDataResponse) => 
        response.data
          .filter(item => !isNaN(Number(item.timestamp))) 
          .slice(-90)
          .map(item => ({
            ...item,
            timestamp: formatDate(Number(item.timestamp) * 1000) 
          })),
    }),
  }),
});

export const { useGetAAPLHistoryQuery } = marketApi;


const formatDate = (timestamp: number) => {
  return new Intl.DateTimeFormat('en-GB').format(new Date(timestamp));
};