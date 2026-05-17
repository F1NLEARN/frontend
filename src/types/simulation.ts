export type InvestmentAccountStatus = 'ACTIVE' | 'CLOSED' | 'SUSPENDED'
export type StockAssetType = 'STOCK' | 'ETF'
export type TradeType = 'BUY' | 'SELL'
export type TradeStatus = 'COMPLETED' | 'FAILED' | 'CANCELED'
export type AnalysisType = 'PORTFOLIO' | 'WEEKLY_REPORT' | 'LEARNING_RECOMMENDATION'
export type AnalysisStatus = 'READY' | 'COMPLETED' | 'FAILED'
export type ConcentrationLevel = 'LOW' | 'MEDIUM' | 'HIGH'
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH'
export type RecommendationType = 'STUDY' | 'DIVERSIFY' | 'REDUCE_RISK' | 'BUY' | 'SELL'

// ─── Account ────────────────────────────────────────────────────────────────

export interface InvestmentAccountResponse {
  investmentAccountId: string
  cashBalance: number
  initialSeedMoney: number
  status: InvestmentAccountStatus
  totalEvaluationAmount: number
  totalProfitLoss: number
  totalProfitRate: number
}

// ─── Orders ─────────────────────────────────────────────────────────────────

export interface BuyOrderRequest {
  stockCode: string
  quantity: number
}

export interface BuyStockResponse {
  accountId: string
  stockCode: string
  stockName: string
  tradeType: string
  quantity: number
  price: number
  totalAmount: number
  cashBalanceAfterTrade: number
}

export interface SellOrderRequest {
  stockCode: string
  quantity: number
}

export interface SellStockResponse {
  stockCode: string
  stockName: string
  sellQuantity: number
  sellPrice: number
  totalSellAmount: number
  remainingQuantity: number
  cashBalance: number
}

// ─── Holdings ────────────────────────────────────────────────────────────────

export interface HoldingResponse {
  holdingId: string
  stockCode: string
  stockName: string
  quantity: number
  averagePrice: number
  currentPrice: number
  totalPurchaseAmount: number
  currentEvaluationAmount: number
  profitLoss: number
  profitRate: number
}

// ─── Trade History ───────────────────────────────────────────────────────────

export interface TradeHistoryResponse {
  tradeHistoryId: string
  stockCode: string
  tradeType: TradeType
  status: TradeStatus
  quantity: number
  tradePrice: number
  totalTradeAmount: number
  cashBalanceAfterTrade: number
  tradeAt: string
}

export interface TradeHistoryListResponse {
  trades: TradeHistoryResponse[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  hasNext: boolean
}

// ─── Stocks ──────────────────────────────────────────────────────────────────

export interface StockItemResponse {
  id: string
  stockCode: string
  name: string
  assetType: StockAssetType
  currentPrice: number
  tradable: boolean
}

export interface StockItemListResponse {
  items: StockItemResponse[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  hasNext: boolean
}

export interface StockPriceResponse {
  stockCode: string
  currentPrice: number
}

// ─── Favorites ───────────────────────────────────────────────────────────────

export interface FavoriteStockResponse {
  favoriteStockId: string
  assetType: StockAssetType
  symbol: string
  stockName: string
}

// ─── Portfolio Analysis ──────────────────────────────────────────────────────

export interface PortfolioRecommendation {
  recommendationType: RecommendationType
  targetCategory: string
  reason: string
  message: string
}

export interface PortfolioAnalysisResponse {
  accountId: string
  portfolioSummary: {
    totalBuyAmount: number
    totalValuationAmount: number
    cashBalance: number
    totalAssetAmount: number
    totalProfitLoss: number
    totalReturnRate: number
  }
  allocation: {
    stockWeight: number
    etfWeight: number
    cashWeight: number
    topHoldingWeight: number
    holdingCount: number
  }
  diagnosis: {
    concentrationLevel: ConcentrationLevel
    riskLevel: RiskLevel
    analysisSummary: string
    warnings: string[]
  }
  recommendations: PortfolioRecommendation[]
  holdings: Array<{
    holdingId: string
    instrumentCode: string
    holdingName: string
    quantity: number
    averageBuyPrice: number
    currentPrice: number
    totalBuyAmount: number
    valuationAmount: number
    unrealizedProfitLoss: number
    returnRate: number
    weight: number
  }>
}
