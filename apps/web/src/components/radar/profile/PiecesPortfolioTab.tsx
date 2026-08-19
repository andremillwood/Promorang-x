import { useState } from 'react';
import { Layers, TrendingUp, DollarSign, PieChart, Sparkles, ExternalLink, ArrowUpRight } from 'lucide-react';
import { UserPieceHoldingType, ContentPieceType } from '@/shared/types';

interface PiecesPortfolioTabProps {
  holdings: UserPieceHoldingType[];
  createdPieces: ContentPieceType[];
  isPublic?: boolean;
}

export default function PiecesPortfolioTab({ holdings, createdPieces, isPublic = false }: PiecesPortfolioTabProps) {
  const [subTab, setSubTab] = useState<'owned' | 'created'>('owned');

  // Compute portfolio metrics
  const totalValue = holdings.reduce((sum, item) => sum + (item.current_value * item.shares_owned), 0);
  const totalDividends = holdings.reduce((sum, item) => sum + item.dividends_earned, 0);
  const avgYield = holdings.length > 0 
    ? (holdings.reduce((sum, item) => sum + item.dividend_yield_percent, 0) / holdings.length).toFixed(1)
    : '0.0';

  return (
    <div className="space-y-6">
      {/* Portfolio Stats Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-5 text-white shadow-sm">
          <div className="flex items-center justify-between text-orange-100 text-xs font-medium mb-1">
            <span>Portfolio Value</span>
            <PieChart className="w-4 h-4" />
          </div>
          <div className="text-2xl font-extrabold">${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
          <div className="text-xs text-orange-100 mt-2 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Avg Yield: {avgYield}% APR</span>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-gray-500 text-xs font-medium mb-1">
            <span>Cumulative Dividends</span>
            <DollarSign className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-extrabold text-gray-900">${totalDividends.toFixed(2)}</div>
          <div className="text-xs text-emerald-600 font-medium mt-2 flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Passive yield generated</span>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-gray-500 text-xs font-medium mb-1">
            <span>Asset Breakdown</span>
            <Layers className="w-4 h-4 text-orange-500" />
          </div>
          <div className="text-2xl font-extrabold text-gray-900">{holdings.length} Pieces</div>
          <div className="text-xs text-gray-500 mt-2">
            {createdPieces.length} Creator Pieces Minted
          </div>
        </div>
      </div>

      {/* Sub-tab Selection */}
      <div className="flex border-b border-gray-200 gap-6">
        <button
          onClick={() => setSubTab('owned')}
          className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
            subTab === 'owned'
              ? 'border-orange-500 text-orange-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Pieces Owned ({holdings.length})
        </button>
        <button
          onClick={() => setSubTab('created')}
          className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
            subTab === 'created'
              ? 'border-orange-500 text-orange-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Created Pieces ({createdPieces.length})
        </button>
      </div>

      {/* Owned Pieces Tab */}
      {subTab === 'owned' && (
        <div>
          {holdings.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              <Layers className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-900">No Pieces Owned Yet</h3>
              <p className="text-sm text-gray-500 max-w-md mx-auto mt-1 mb-4">
                Explore the marketplace to invest in fractional creator pieces and earn dividend yields as content performs.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {holdings.map((piece) => (
                <div key={piece.id} className="bg-white rounded-2xl p-5 border border-gray-100 hover:border-orange-200 transition-all shadow-sm">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-xs font-semibold uppercase tracking-wider text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md">
                        {piece.platform}
                      </span>
                      <h4 className="font-bold text-gray-900 mt-1 text-base">{piece.title}</h4>
                      <p className="text-xs text-gray-500">Creator: {piece.creator_name}</p>
                    </div>
                    <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-full">
                      +{piece.dividend_yield_percent}% APR
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-2 bg-gray-50 p-3 rounded-xl text-center">
                    <div>
                      <div className="text-xs text-gray-500">Shares</div>
                      <div className="font-bold text-gray-900 text-sm">{piece.shares_owned}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Value</div>
                      <div className="font-bold text-gray-900 text-sm">${(piece.current_value * piece.shares_owned).toFixed(2)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Dividends</div>
                      <div className="font-bold text-emerald-600 text-sm">${piece.dividends_earned.toFixed(2)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Created Pieces Tab */}
      {subTab === 'created' && (
        <div>
          {createdPieces.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              <Sparkles className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-900">No Minted Pieces</h3>
              <p className="text-sm text-gray-500 max-w-md mx-auto mt-1 mb-4">
                Mint your first digital piece to raise capital, reward backers, and distribute dividends to supporters.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {createdPieces.map((piece) => (
                <div key={piece.id} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-xs font-semibold uppercase tracking-wider text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md">
                        {piece.platform}
                      </span>
                      <h4 className="font-bold text-gray-900 mt-1 text-base">{piece.title}</h4>
                      {piece.description && <p className="text-xs text-gray-500 line-clamp-1">{piece.description}</p>}
                    </div>
                    <a
                      href={piece.platform_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-orange-500"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-2 bg-purple-50/50 p-3 rounded-xl text-center">
                    <div>
                      <div className="text-xs text-gray-500">Price/Share</div>
                      <div className="font-bold text-gray-900 text-sm">${piece.share_price}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Remaining</div>
                      <div className="font-bold text-gray-900 text-sm">{piece.available_shares}/{piece.total_shares}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Revenue</div>
                      <div className="font-bold text-purple-700 text-sm">${piece.current_revenue || 0}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
