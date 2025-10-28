import { useState, useContext, useEffect, useCallback, useMemo } from 'react';
import { Plus, Edit2, Trash2, DollarSign, TrendingUp, Zap, AlertCircle, Check, X } from 'lucide-react';
import GuestContext from '../contexts/GuestContext';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../config/firebase';
import { doc, getDoc, updateDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import AssetCard from '../components/common/AssetCard';
import { getPageContainerClasses, getPageHeaderClasses, getPageTitleClasses } from '../utils/layoutHelpers';

/**
 * Assets Management Component
 * Comprehensive asset and resource management including:
 * - Properties, vehicles, investments, documents
 * - Asset valuation and depreciation tracking
 * - Document and media attachments
 * - Firestore integration for cross-app sync
 * - Real-time updates from ecosystem apps
 */
export default function Assets() {
  const { guestData, updateGuestData } = useContext(GuestContext);
  const { user } = useAuth();
  const [assets, setAssets] = useState(guestData?.assets || []);
  const [showForm, setShowForm] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);
  const [syncStatus, setSyncStatus] = useState('idle');
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [formData, setFormData] = useState({
    name: '',
    type: 'property',
    value: '',
    depreciation: 0,
    description: '',
    purchaseDate: '',
    location: '',
    serialNumber: '',
    insuranceProvider: '',
    insuranceValue: '',
    documents: [],
  });

  // Load assets from Firebase
  useEffect(() => {
    if (!user) return;

    const loadFromFirebase = async () => {
      try {
        setSyncStatus('syncing');
        const docRef = doc(db, 'users', user.uid, 'assets', 'inventory');
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setAssets(data.assets || []);
          setLastSyncTime(data.lastUpdatedAt);
        }
        setSyncStatus('success');
      } catch (error) {
        console.error('Error loading assets:', error);
        setSyncStatus('error');
      }
    };

    loadFromFirebase();

    // Real-time listener
    const unsubscribe = onSnapshot(
      doc(db, 'users', user.uid, 'assets', 'inventory'),
      (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          setAssets(data.assets || []);
          setLastSyncTime(data.lastUpdatedAt);
        }
      },
      (error) => console.error('Error listening to assets:', error)
    );

    return unsubscribe;
  }, [user]);

  // Save assets to Firestore
  const saveToFirebase = async (updatedAssets) => {
    if (!user) return;
    try {
      setSyncStatus('syncing');
      const docRef = doc(db, 'users', user.uid, 'assets', 'inventory');
      await updateDoc(docRef, {
        assets: updatedAssets,
        lastUpdatedBy: 'lifesync',
        lastUpdatedAt: serverTimestamp(),
      });
      setLastSyncTime(new Date());
      setSyncStatus('success');
    } catch (error) {
      console.error('Error saving assets:', error);
      setSyncStatus('error');
    }
  };

  const saveAssets = (updatedAssets) => {
    setAssets(updatedAssets);
    updateGuestData(prev => ({
      ...prev,
      assets: updatedAssets,
    }));
    saveToFirebase(updatedAssets);
  };

  const handleSaveAsset = useCallback(() => {
    if (!formData.name || !formData.value) {
      alert('Please fill in name and value');
      return;
    }
    
    if (editingAsset) {
      const updated = assets.map(a => a.id === editingAsset.id ? {
        ...editingAsset,
        ...formData,
        value: parseFloat(formData.value),
        depreciation: parseFloat(formData.depreciation),
        updatedAt: new Date().toISOString()
      } : a);
      saveAssets(updated);
      setEditingAsset(null);
    } else {
      const newAsset = {
        id: Date.now(),
        ...formData,
        value: parseFloat(formData.value),
        depreciation: parseFloat(formData.depreciation),
        createdAt: new Date().toISOString(),
      };
      saveAssets([...assets, newAsset]);
    }
    
    setFormData({
      name: '',
      type: 'property',
      value: '',
      depreciation: 0,
      description: '',
      purchaseDate: '',
      location: '',
      serialNumber: '',
      insuranceProvider: '',
      insuranceValue: '',
      documents: [],
    });
    setShowForm(false);
  }, [formData, editingAsset, assets]);

  const handleEditAsset = useCallback((asset) => {
    setEditingAsset(asset);
    setFormData(asset);
    setShowForm(true);
  }, []);

  const handleDeleteAsset = useCallback((id) => {
    if (confirm('Delete this asset?')) {
      saveAssets(assets.filter(a => a.id !== id));
    }
  }, [assets]);

  const typeColors = {
    property: 'bg-blue-100 text-blue-800',
    vehicle: 'bg-purple-100 text-purple-800',
    investment: 'bg-green-100 text-green-800',
    equipment: 'bg-orange-100 text-orange-800',
    document: 'bg-yellow-100 text-yellow-800',
    photo: 'bg-pink-100 text-pink-800',
    other: 'bg-gray-100 text-gray-800',
  };

  const filteredAssets = useMemo(() => 
    filterType === 'all' ? assets : assets.filter(a => a.type === filterType),
    [filterType, assets]
  );

  const totalValue = useMemo(() => 
    filteredAssets.reduce((sum, asset) => sum + (parseFloat(asset.value) || 0), 0),
    [filteredAssets]
  );

  const totalDepreciation = useMemo(() =>
    filteredAssets.reduce((sum, asset) => sum + (parseFloat(asset.depreciation) || 0), 0),
    [filteredAssets]
  );

  const currentValue = useMemo(() => totalValue - totalDepreciation, [totalValue, totalDepreciation]);

  return (
    <div className={getPageContainerClasses()}>
      {/* Header */}
      <div className={getPageHeaderClasses()}>
        <div>
          <h1 className={getPageTitleClasses()}>Assets & Resources</h1>
          {lastSyncTime && (
            <p className="text-sm text-gray-600 mt-1">
              Last synced: {new Date(lastSyncTime).toLocaleTimeString()}
            </p>
          )}
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setEditingAsset(null); }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          aria-label="Add new asset"
        >
          <Plus className="w-4 h-4" />
          Add Asset
        </button>
      </div>

      {/* Sync Status */}
      {syncStatus !== 'idle' && (
        <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 ${
          syncStatus === 'success' ? 'bg-green-50 text-green-700' :
          syncStatus === 'error' ? 'bg-red-50 text-red-700' :
          'bg-blue-50 text-blue-700'
        }`}>
          {syncStatus === 'syncing' && <Zap className="w-4 h-4 animate-spin" />}
          {syncStatus === 'success' && <Check className="w-4 h-4" />}
          {syncStatus === 'error' && <AlertCircle className="w-4 h-4" />}
          <span className="text-sm">
            {syncStatus === 'syncing' ? 'Syncing with Firebase...' :
             syncStatus === 'success' ? 'Synced successfully!' :
             'Sync error - changes saved locally'}
          </span>
        </div>
      )}

      {/* Value Dashboard */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Value</p>
              <p className="text-2xl font-bold text-blue-600">R{totalValue.toLocaleString('en-ZA', {maximumFractionDigits: 0})}</p>
            </div>
            <DollarSign className="w-10 h-10 text-blue-400 opacity-50" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-6 border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Depreciation</p>
              <p className="text-2xl font-bold text-red-600">R{totalDepreciation.toLocaleString('en-ZA', {maximumFractionDigits: 0})}</p>
            </div>
            <TrendingUp className="w-10 h-10 text-red-400 opacity-50" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Current Value</p>
              <p className="text-2xl font-bold text-green-600">R{currentValue.toLocaleString('en-ZA', {maximumFractionDigits: 0})}</p>
            </div>
            <TrendingUp className="w-10 h-10 text-green-400 opacity-50" />
          </div>
        </div>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-blue-50 rounded-lg border-2 border-blue-200 p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">{editingAsset ? 'Edit Asset' : 'Add New Asset'}</h2>
            <button onClick={() => { setShowForm(false); setEditingAsset(null); }} aria-label="Close form">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Asset Name *"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="col-span-2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Asset name"
            />
            <select
              value={formData.type}
              onChange={(e) => setFormData({...formData, type: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Asset type"
            >
              <option value="property">Property</option>
              <option value="vehicle">Vehicle</option>
              <option value="investment">Investment</option>
              <option value="equipment">Equipment</option>
              <option value="document">Document</option>
              <option value="photo">Photo/Media</option>
              <option value="other">Other</option>
            </select>
            <input
              type="number"
              placeholder="Value (R) *"
              value={formData.value}
              onChange={(e) => setFormData({...formData, value: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Asset value"
              step="0.01"
            />
            <input
              type="number"
              placeholder="Depreciation (R)"
              value={formData.depreciation}
              onChange={(e) => setFormData({...formData, depreciation: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Depreciation amount"
              step="0.01"
            />
            <input
              type="date"
              value={formData.purchaseDate}
              onChange={(e) => setFormData({...formData, purchaseDate: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Purchase date"
            />
            <input
              type="text"
              placeholder="Location"
              value={formData.location}
              onChange={(e) => setFormData({...formData, location: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Asset location"
            />
            <input
              type="text"
              placeholder="Serial Number / ID"
              value={formData.serialNumber}
              onChange={(e) => setFormData({...formData, serialNumber: e.target.value})}
              className="col-span-2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Serial number"
            />
            <input
              type="text"
              placeholder="Insurance Provider"
              value={formData.insuranceProvider}
              onChange={(e) => setFormData({...formData, insuranceProvider: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Insurance provider"
            />
            <input
              type="number"
              placeholder="Insured Value (R)"
              value={formData.insuranceValue}
              onChange={(e) => setFormData({...formData, insuranceValue: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Insurance value"
              step="0.01"
            />
            <textarea
              placeholder="Description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="col-span-2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              aria-label="Asset description"
            />
          </div>
          <div className="flex gap-3 justify-end mt-4">
            <button
              onClick={() => { setShowForm(false); setEditingAsset(null); }}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              aria-label="Cancel"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveAsset}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              aria-label={editingAsset ? "Update asset" : "Create asset"}
            >
              <Plus className="w-4 h-4" />
              {editingAsset ? 'Update' : 'Add'}
            </button>
          </div>
        </div>
      )}

      {/* Type Filter */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {['all', 'property', 'vehicle', 'investment', 'equipment', 'document', 'photo', 'other'].map(type => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
              filterType === type
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            aria-pressed={filterType === type}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>

      {/* Assets List */}
      {filteredAssets.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center text-gray-500">
          No assets in this category. <button onClick={() => { setShowForm(true); setEditingAsset(null); }} className="text-blue-600 underline">Create one!</button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAssets.map(asset => (
            <AssetCard
              key={asset.id}
              asset={asset}
              typeColors={typeColors}
              onEdit={handleEditAsset}
              onDelete={handleDeleteAsset}
            />
          ))}
        </div>
      )}
    </div>
  );
}
