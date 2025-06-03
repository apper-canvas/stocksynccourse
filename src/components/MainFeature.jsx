import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-toastify'
import ApperIcon from './ApperIcon'
import { productService, stockMovementService } from '../services'

const MainFeature = ({ 
  products, 
  loading, 
  error, 
  onProductUpdate, 
  getStockStatus, 
  getStockStatusColor 
}) => {
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [showAdjustModal, setShowAdjustModal] = useState(false)
  const [adjustmentData, setAdjustmentData] = useState({
    quantity: 0,
    type: 'adjustment',
    reason: 'Count Adjustment',
    notes: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [sortField, setSortField] = useState('name')
  const [sortDirection, setSortDirection] = useState('asc')

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const sortedProducts = [...(products || [])].sort((a, b) => {
    const aValue = a?.[sortField] || ''
    const bValue = b?.[sortField] || ''
    
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue
    }
    
    const aStr = String(aValue).toLowerCase()
    const bStr = String(bValue).toLowerCase()
    
    if (sortDirection === 'asc') {
      return aStr.localeCompare(bStr)
    } else {
      return bStr.localeCompare(aStr)
    }
  })

  const openAdjustModal = (product) => {
    setSelectedProduct(product)
    setAdjustmentData({
      quantity: 0,
      type: 'adjustment',
      reason: 'Count Adjustment',
      notes: ''
    })
    setShowAdjustModal(true)
  }

  const closeAdjustModal = () => {
    setShowAdjustModal(false)
    setSelectedProduct(null)
    setAdjustmentData({
      quantity: 0,
      type: 'adjustment',
      reason: 'Count Adjustment',
      notes: ''
    })
  }

  const handleStockAdjustment = async () => {
    if (!selectedProduct || adjustmentData.quantity === 0) {
      toast.warning("Please enter a valid adjustment quantity")
      return
    }

    setIsSubmitting(true)
    try {
      // Create stock movement record
      const movementData = {
        productId: selectedProduct.id,
        type: adjustmentData.type,
        quantity: Math.abs(adjustmentData.quantity),
        reason: adjustmentData.reason,
        notes: adjustmentData.notes,
        timestamp: new Date().toISOString(),
        userId: 'current-user'
      }
      
      await stockMovementService.create(movementData)
      
      // Update product stock
      const newStock = Math.max(0, (selectedProduct.currentStock || 0) + adjustmentData.quantity)
      const updatedProduct = {
        ...selectedProduct,
        currentStock: newStock
      }
      
      await productService.update(selectedProduct.id, updatedProduct)
      onProductUpdate(updatedProduct)
      
      toast.success(`Stock adjusted successfully! New quantity: ${newStock}`)
      closeAdjustModal()
    } catch (err) {
      toast.error("Failed to adjust stock: " + err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const quickAdjustStock = async (product, change) => {
    const newStock = Math.max(0, (product.currentStock || 0) + change)
    
    try {
      // Create stock movement record
      const movementData = {
        productId: product.id,
        type: change > 0 ? 'in' : 'out',
        quantity: Math.abs(change),
        reason: change > 0 ? 'Quick Add' : 'Quick Remove',
        timestamp: new Date().toISOString(),
        userId: 'current-user'
      }
      
      await stockMovementService.create(movementData)
      
      // Update product
      const updatedProduct = { ...product, currentStock: newStock }
      await productService.update(product.id, updatedProduct)
      onProductUpdate(updatedProduct)
      
      toast.success(`Stock updated! New quantity: ${newStock}`)
    } catch (err) {
      toast.error("Failed to update stock: " + err.message)
    }
  }

  if (loading) {
    return (
      <div className="card p-8">
        <div className="flex items-center justify-center space-x-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="text-surface-600">Loading inventory...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="card p-8">
        <div className="flex items-center justify-center space-x-4 text-red-600">
          <ApperIcon name="AlertTriangle" className="w-6 h-6" />
          <span>Error loading inventory: {error}</span>
        </div>
      </div>
    )
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className="card overflow-hidden"
    >
      <div className="p-6 border-b border-surface-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <h2 className="text-xl font-semibold text-surface-900 flex items-center space-x-2">
            <ApperIcon name="Database" className="w-5 h-5 text-primary" />
            <span>Inventory Management</span>
          </h2>
          <div className="text-sm text-surface-600">
            {sortedProducts.length} products • Click to adjust stock levels
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-surface-50 border-b border-surface-200">
            <tr>
              {[
                { key: 'name', label: 'Product Name' },
                { key: 'sku', label: 'SKU' },
                { key: 'category', label: 'Category' },
                { key: 'currentStock', label: 'Stock' },
                { key: 'reorderPoint', label: 'Reorder Point' },
                { key: 'unitPrice', label: 'Unit Price' }
              ].map(({ key, label }) => (
                <th
                  key={key}
                  className="px-6 py-4 text-left text-xs font-medium text-surface-500 uppercase tracking-wider cursor-pointer hover:bg-surface-100 transition-colors duration-200"
                  onClick={() => handleSort(key)}
                >
                  <div className="flex items-center space-x-1">
                    <span>{label}</span>
                    <ApperIcon 
                      name={sortField === key ? (sortDirection === 'asc' ? 'ChevronUp' : 'ChevronDown') : 'ChevronsUpDown'} 
                      className="w-3 h-3" 
                    />
                  </div>
                </th>
              ))}
              <th className="px-6 py-4 text-left text-xs font-medium text-surface-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-surface-200">
            {sortedProducts?.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-12 text-center text-surface-500">
                  <div className="flex flex-col items-center space-y-3">
                    <ApperIcon name="Package" className="w-12 h-12 text-surface-300" />
                    <span>No products found</span>
                  </div>
                </td>
              </tr>
            ) : (
              sortedProducts.map((product, index) => {
                const stockStatus = getStockStatus(product?.currentStock, product?.reorderPoint)
                return (
                  <motion.tr
                    key={product?.id || index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-surface-50 transition-colors duration-200 group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg flex items-center justify-center">
                          <ApperIcon name="Package" className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium text-surface-900">{product?.name || 'Unknown Product'}</div>
                          <div className="text-sm text-surface-500">{product?.barcode || 'No barcode'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-mono text-surface-900">
                      {product?.sku || 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-surface-100 text-surface-800">
                        {product?.category || 'Uncategorized'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg font-semibold text-surface-900">
                          {product?.currentStock || 0}
                        </span>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStockStatusColor(stockStatus)}`}>
                          {stockStatus}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-surface-900">
                      {product?.reorderPoint || 0}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-surface-900">
                      ${(product?.unitPrice || 0).toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => quickAdjustStock(product, -1)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors duration-200"
                          title="Remove 1"
                        >
                          <ApperIcon name="Minus" className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => quickAdjustStock(product, 1)}
                          className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors duration-200"
                          title="Add 1"
                        >
                          <ApperIcon name="Plus" className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openAdjustModal(product)}
                          className="p-1 text-primary hover:bg-primary/10 rounded transition-colors duration-200"
                          title="Detailed Adjustment"
                        >
                          <ApperIcon name="Edit3" className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Stock Adjustment Modal */}
      <AnimatePresence>
        {showAdjustModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={closeAdjustModal}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="glass-card w-full max-w-md p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-surface-900">Adjust Stock</h3>
                <button
                  onClick={closeAdjustModal}
                  className="text-surface-400 hover:text-surface-600 transition-colors duration-200"
                >
                  <ApperIcon name="X" className="w-5 h-5" />
                </button>
              </div>

              {selectedProduct && (
                <div className="space-y-4">
                  <div className="bg-surface-50 rounded-lg p-4">
                    <h4 className="font-medium text-surface-900">{selectedProduct.name}</h4>
                    <p className="text-sm text-surface-600">Current Stock: {selectedProduct.currentStock || 0}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-surface-700 mb-2">
                      Adjustment Amount
                    </label>
                    <div className="flex items-center space-x-3">
                      <button
                        type="button"
                        onClick={() => setAdjustmentData(prev => ({ ...prev, quantity: prev.quantity - 1 }))}
                        className="p-2 border border-surface-300 rounded-lg hover:bg-surface-50 transition-colors duration-200"
                      >
                        <ApperIcon name="Minus" className="w-4 h-4" />
                      </button>
                      <input
                        type="number"
                        value={adjustmentData.quantity}
                        onChange={(e) => setAdjustmentData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 0 }))}
                        className="input-field text-center flex-1"
                        placeholder="0"
                      />
                      <button
                        type="button"
                        onClick={() => setAdjustmentData(prev => ({ ...prev, quantity: prev.quantity + 1 }))}
                        className="p-2 border border-surface-300 rounded-lg hover:bg-surface-50 transition-colors duration-200"
                      >
                        <ApperIcon name="Plus" className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-surface-700 mb-2">
                      Reason
                    </label>
                    <select
                      value={adjustmentData.reason}
                      onChange={(e) => setAdjustmentData(prev => ({ ...prev, reason: e.target.value }))}
                      className="input-field"
                    >
                      <option value="Count Adjustment">Count Adjustment</option>
                      <option value="Damage">Damage</option>
                      <option value="Loss">Loss</option>
                      <option value="Return">Return</option>
                      <option value="Transfer">Transfer</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-surface-700 mb-2">
                      Notes (Optional)
                    </label>
                    <textarea
                      value={adjustmentData.notes}
                      onChange={(e) => setAdjustmentData(prev => ({ ...prev, notes: e.target.value }))}
                      className="input-field resize-none"
                      rows="3"
                      placeholder="Add any additional notes..."
                    />
                  </div>

                  <div className="bg-surface-50 rounded-lg p-3">
<p className="text-sm text-surface-600">
                      New Stock Level: <span className="font-semibold text-surface-900">
                        {Math.max(0, (selectedProduct.current_stock || 0) + adjustmentData.quantity)}
                      </span>
                    </p>
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <button
                      onClick={closeAdjustModal}
                      className="flex-1 px-4 py-2 border border-surface-300 text-surface-700 rounded-lg hover:bg-surface-50 transition-all duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleStockAdjustment}
                      disabled={isSubmitting || adjustmentData.quantity === 0}
                      className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Adjusting...</span>
                        </>
                      ) : (
                        <>
                          <ApperIcon name="Check" className="w-4 h-4" />
                          <span>Adjust Stock</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default MainFeature