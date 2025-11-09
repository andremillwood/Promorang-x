import { MouseEvent } from 'react';
import { TrendingUp, Gift, Target, ExternalLink } from 'lucide-react';
import type { ContentPieceType, UserType } from '../../shared/types';

interface ButtonGroupProps {
  content: ContentPieceType;
  onBuyShares?: (content: ContentPieceType) => void;
  onPredict?: (content: ContentPieceType) => void;
  onTip?: (content: ContentPieceType) => void;
  onExternalMove?: (content: ContentPieceType) => void;
  currentUser?: UserType | null;
  onEdit?: (content: ContentPieceType) => void;
  onDelete?: (content: ContentPieceType) => void;
}

interface PrimaryButtonProps {
  variant: 'orange' | 'blue' | 'purple';
  text: string;
  icon?: React.ReactNode;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
}

function PrimaryButton({ variant, text, icon, onClick, disabled }: PrimaryButtonProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'orange':
        return 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600';
      case 'blue':
        return 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600';
      case 'purple':
        return 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600';
      default:
        return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  return (
    <button
      onClick={(event) => onClick?.(event)}
      disabled={disabled}
      className={`text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none ${getVariantStyles()}`}
      aria-label={text}
    >
      {icon}
      <span>{text}</span>
    </button>
  );
}

function PriceLabel({ content }: { content: ContentPieceType }) {
  const sharePriceRaw = typeof content.share_price === 'number'
    ? content.share_price
    : Number(content.share_price ?? 0);
  const sharePrice = Number.isFinite(sharePriceRaw) && sharePriceRaw > 0 ? sharePriceRaw : null;
  return (
    <div className="text-center">
      <div className="text-lg font-bold text-gray-900">
        {sharePrice ? `$${sharePrice.toFixed(2)}` : '—'}
      </div>
      <div className="text-xs text-gray-500">per share</div>
    </div>
  );
}

function AvailabilityLabel({ content }: { content: ContentPieceType }) {
  const paidShares = content.available_shares ?? 0;
  return (
    <div className="text-center">
      <div className="text-lg font-bold text-blue-600">
        {paidShares > 0 ? paidShares : '0'}
      </div>
      <div className="text-xs text-gray-500">available</div>
    </div>
  );
}

export default function ButtonGroup({
  content,
  onBuyShares,
  onPredict,
  onTip,
  onExternalMove,
  currentUser,
  onEdit,
  onDelete
}: ButtonGroupProps) {
  const paidShares = content.available_shares ?? 0;
  const engagementShares = content.engagement_shares_remaining ?? 0;

  const handleButtonClick = (callback?: (content: ContentPieceType) => void) => (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    event.preventDefault();
    callback?.(content);
  };

  const shareHint = paidShares <= 0
    ? engagementShares > 0
      ? 'Paid shares are sold out. Share early to claim the remaining engagement shares.'
      : 'All shares have been claimed. Check back soon for the next drop.'
    : engagementShares > 0
      ? 'Paid shares are available. Share early to also lock in the limited engagement shares.'
      : undefined;

  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 sm:gap-3 mt-4">
      {/* Price and Availability Info */}
      <div className="flex items-center justify-center sm:justify-start gap-3">
        <PriceLabel content={content} />
        <AvailabilityLabel content={content} />
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-center sm:justify-end gap-2 flex-wrap">
        <PrimaryButton
          variant="orange"
          text="Buy Shares"
          icon={<TrendingUp className="w-4 h-4" />}
          onClick={handleButtonClick(onBuyShares)}
          disabled={paidShares <= 0}
        />

        <PrimaryButton
          variant="blue"
          text="Predict"
          icon={<Target className="w-4 h-4" />}
          onClick={handleButtonClick(onPredict)}
        />

        <PrimaryButton
          variant="purple"
          text="Tip Creator"
          icon={<Gift className="w-4 h-4" />}
          onClick={handleButtonClick(onTip)}
        />
      </div>

      {shareHint && (
        <p className="text-xs text-gray-600 bg-gray-50 border border-gray-100 rounded-lg px-3 py-2">
          {shareHint}
        </p>
      )}

      {/* Edit/Delete Actions for Content Owner */}
      {currentUser?.id === content.creator_id && (
        <div className="flex items-center justify-center sm:justify-end space-x-2 pt-3 border-t border-gray-100">
          <button
            onClick={(event) => {
              event.stopPropagation();
              onEdit?.(content);
            }}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium px-3 py-1 rounded-md hover:bg-blue-50 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            aria-label="Edit content"
          >
            Edit
          </button>
          <span className="text-gray-300">•</span>
          <button
            onClick={(event) => {
              event.stopPropagation();
              onDelete?.(content);
            }}
            className="text-red-600 hover:text-red-800 text-sm font-medium px-3 py-1 rounded-md hover:bg-red-50 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            aria-label="Delete content"
          >
            Delete
          </button>
        </div>
      )}

      {/* External Move Button */}
      <div className="pt-3 border-t border-gray-100">
        <button
          onClick={(event) => {
            event.stopPropagation();
            onExternalMove?.(content);
          }}
          className="flex items-center justify-center space-x-2 px-4 py-2 text-sm text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] w-full sm:w-auto"
          aria-label="Move to external platform"
        >
          <ExternalLink className="w-4 h-4" />
          <span>Move to External</span>
        </button>
      </div>
    </div>
  );
}
