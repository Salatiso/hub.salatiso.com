/**
 * AssetsWidget Component - Real Data Integration (Phase 3)
 * Displays user assets and resources summary from Firestore
 */

import { Link } from 'react-router-dom';
import { Package, ArrowRight, Plus, TrendingUp, Loader, AlertCircle } from 'lucide-react';
import WidgetCard from './WidgetCard';
import { useUserId } from '../../context/UserContext';
import { useAssets } from '../../hooks/useFirebaseData';

const AssetsWidget = () => {
  const userId = useUserId();
  const { data: assets, loading, error } = useAssets(userId);

  // Asset type colors
  const typeColors = {
    property: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    vehicle: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
    investment: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    equipment: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
    document: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  };

  // Calculate total value
  const totalValue = assets?.reduce((sum, asset) => sum + (asset.value || 0), 0) || 0;
  const formattedTotal = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(totalValue);

  if (error) {
    return (
      <WidgetCard icon={AlertCircle} title="Assets">
        <div className="flex items-center justify-center h-40 text-red-600">
          <AlertCircle className="w-8 h-8 mr-2" />
          <p>{error}</p>
        </div>
      </WidgetCard>
    );
  }

  return (
    <WidgetCard
      icon={Package}
      title="Assets"
      actions={[
        {
          label: 'Add Asset',
          icon: Plus,
          onClick: () => window.location.href = '/assets',
        },
        {
          label: 'View All',
          icon: Package,
          onClick: () => window.location.href = '/assets',
        },
      ]}
    >
      {loading ? (
        <div className="flex items-center justify-center h-40">
          <Loader className="w-6 h-6 animate-spin text-blue-500" />
        </div>
      ) : (
        <div className="space-y-4">
          {/* Total Value Card */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Asset Value</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{formattedTotal}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600 dark:text-green-400 opacity-20" />
            </div>
          </div>

          {/* Assets List */}
          <div className="space-y-2">
            {assets && assets.length > 0 ? (
              assets.slice(0, 3).map((asset) => (
                <div
                  key={asset.id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <p className="font-medium text-gray-900 dark:text-white">{asset.name}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${typeColors[asset.type] || typeColors.document}`}>
                        {asset.type}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD',
                        maximumFractionDigits: 0,
                      }).format(asset.value || 0)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-500 text-center py-4">No assets yet</p>
            )}
          </div>

          {/* View All Link */}
          <Link
            to="/assets"
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium mt-2"
          >
            <span>View All Assets</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}
    </WidgetCard>
  );
};

export default AssetsWidget;
