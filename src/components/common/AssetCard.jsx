import { memo } from 'react';
import { Edit2, Trash2 } from 'lucide-react';

/**
 * AssetCard Component
 * Displays a single asset in the assets list
 * Memoized to prevent re-renders of unchanged assets
 */
function AssetCard({ asset, typeColors, onEdit, onDelete }) {
  return (
    <div
      key={asset.id}
      className={`rounded-lg p-6 border-l-4 hover:shadow-md transition-shadow ${
        typeColors[asset.type] || typeColors.other
      }`}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-bold">{asset.name}</h3>
            <span className="text-xs px-2 py-1 rounded-full bg-white bg-opacity-70">
              {asset.type}
            </span>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Value</p>
              <p className="font-bold text-lg">
                R
                {parseFloat(asset.value).toLocaleString('en-ZA', {
                  maximumFractionDigits: 0,
                })}
              </p>
            </div>
            {asset.depreciation > 0 && (
              <div>
                <p className="text-gray-600">Current Value</p>
                <p className="font-bold text-lg">
                  R
                  {(
                    parseFloat(asset.value) - parseFloat(asset.depreciation)
                  ).toLocaleString('en-ZA', {
                    maximumFractionDigits: 0,
                  })}
                </p>
              </div>
            )}
            {asset.purchaseDate && (
              <div>
                <p className="text-gray-600">Purchased</p>
                <p className="font-semibold">{asset.purchaseDate}</p>
              </div>
            )}
            {asset.location && (
              <div>
                <p className="text-gray-600">Location</p>
                <p className="font-semibold">{asset.location}</p>
              </div>
            )}
            {asset.serialNumber && (
              <div>
                <p className="text-gray-600">Serial Number</p>
                <p className="font-semibold text-xs">{asset.serialNumber}</p>
              </div>
            )}
            {asset.insuranceProvider && (
              <div>
                <p className="text-gray-600">Insurance</p>
                <p className="font-semibold">{asset.insuranceProvider}</p>
              </div>
            )}
          </div>
          {asset.description && (
            <p className="mt-3 text-gray-700">{asset.description}</p>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(asset)}
            className="p-2 text-blue-600 hover:bg-blue-200 rounded-lg"
            aria-label={`Edit asset: ${asset.name}`}
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(asset.id)}
            className="p-2 text-red-600 hover:bg-red-200 rounded-lg"
            aria-label={`Delete asset: ${asset.name}`}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default memo(AssetCard);
