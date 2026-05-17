import api from './axios'
import type { CommonResponse } from '../types'
import type {
  InvestmentAccountResponse,
  BuyOrderRequest,
  BuyStockResponse,
  SellOrderRequest,
  SellStockResponse,
  HoldingResponse,
  TradeHistoryListResponse,
  StockItemListResponse,
  StockItemResponse,
  StockPriceResponse,
  FavoriteStockResponse,
  PortfolioAnalysisResponse,
  StockAssetType,
} from '../types/simulation'

export const simulationApi = {
  // ─── Account ──────────────────────────────────────────────────────
  createAccount: () =>
    api.post<CommonResponse<InvestmentAccountResponse>>('/v1/investments/accounts'),

  getAccount: () =>
    api.get<CommonResponse<InvestmentAccountResponse>>('/v1/investments/accounts/me'),

  // ─── Orders ───────────────────────────────────────────────────────
  buyStock: (req: BuyOrderRequest) =>
    api.post<CommonResponse<BuyStockResponse>>('/v1/investments/orders/buy', req),

  sellStock: (req: SellOrderRequest) =>
    api.post<CommonResponse<SellStockResponse>>('/v1/investments/orders/sell', req),

  // ─── Holdings ─────────────────────────────────────────────────────
  getHoldings: () =>
    api.get<CommonResponse<HoldingResponse[]>>('/v1/investments/holdings'),

  // ─── Trade History ────────────────────────────────────────────────
  getTradeHistory: (params?: { stockCode?: string; tradeType?: string; page?: number; size?: number }) =>
    api.get<CommonResponse<TradeHistoryListResponse>>('/v1/investments/trades', { params }),

  // ─── Stocks ───────────────────────────────────────────────────────
  getStocks: (params?: { assetType?: StockAssetType; keyword?: string; page?: number; size?: number }) =>
    api.get<CommonResponse<StockItemListResponse>>('/v1/investments/stocks', { params }),

  getStockDetail: (stockCode: string) =>
    api.get<CommonResponse<StockItemResponse>>(`/v1/investments/stocks/${stockCode}`),

  getStockPrice: (stockCode: string) =>
    api.get<CommonResponse<StockPriceResponse>>(`/v1/investments/stocks/${stockCode}/price`),

  // ─── Favorites ────────────────────────────────────────────────────
  getFavorites: () =>
    api.get<CommonResponse<FavoriteStockResponse[]>>('/v1/investments/favorites'),

  addFavorite: (assetType: StockAssetType, symbol: string) =>
    api.post<CommonResponse<string>>('/v1/investments/favorites', { assetType, symbol }),

  removeFavorite: (symbol: string) =>
    api.delete<CommonResponse<void>>(`/v1/investments/favorites/${symbol}`),

  // ─── Portfolio Analysis ───────────────────────────────────────────
  getPortfolioAnalysis: () =>
    api.get<CommonResponse<PortfolioAnalysisResponse>>('/v1/analyses/portfolio'),

  refreshPortfolioAnalysis: () =>
    api.post<CommonResponse<PortfolioAnalysisResponse>>('/v1/analyses/portfolio/refresh'),
}
