import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import ApperIcon from '../components/ApperIcon'
import MainFeature from '../components/MainFeature'
import { productService } from '../services'

const Home = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [showLowStockOnly, setShowLowStockOnly] = useState(false)

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true)
      try {
        const result = await productService.getAll()
        setProducts(result)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    loadProducts()
  }, [])

  const filteredProducts = products?.filter(product => {
    const matchesSearch = product?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product?.sku?.toLowerCase().includes(searchTerm.toLowerCase()) || false
    const matchesCategory = selectedCategory === "all" || product?.category === selectedCategory
    const matchesStock = !showLowStockOnly || (product?.currentStock || 0) <= (product?.reorderPoint || 0)
    
    return matchesSearch && matchesCategory && matchesStock
  }) || []

  const categories = [...new Set(products?.map(p => p?.category).filter(Boolean))] || []
  const lowStockCount = products?.filter(p => (p?.currentStock || 0) <= (p?.reorderPoint || 0)).length || 0
  const totalValue = products?.reduce((sum, p) => sum + ((p?.currentStock || 0) * (p?.unitPrice || 0)), 0) || 0

  const getStockStatus = (current, reorder) => {
    const currentStock = current || 0
    const reorderPoint = reorder || 0
    
    if (currentStock <= reorderPoint) return 'low'
    if (currentStock <= reorderPoint * 2) return 'medium'
    return 'high'
  }

  const getStockStatusColor = (status) => {
    switch (status) {
      case 'low': return 'bg-red-100 text-red-800 border-red-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'high': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const onProductUpdate = (updatedProduct) => {
    setProducts(prev => prev?.map(p => p.id === updatedProduct.id ? updatedProduct : p) || [])
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-50 to-surface-100">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-lg border-b border-surface-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-dark rounded-xl flex items-center justify-center">
                  <ApperIcon name="Package" className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-surface-900">StockSync Pro</h1>
                  <p className="text-xs text-surface-600 hidden sm:block">Inventory Management System</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative hidden md:block">
                <ApperIcon name="Search" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-surface-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-64 border border-surface-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                />
              </div>
              
              <div className="relative">
                <button className="p-2 text-surface-600 hover:text-primary hover:bg-primary/10 rounded-lg transition-all duration-200">
                  <ApperIcon name="Bell" className="w-5 h-5" />
                  {lowStockCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                      {lowStockCount}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Mobile Search */}
        <div className="md:hidden">
          <div className="relative">
            <ApperIcon name="Search" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-surface-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-3 w-full border border-surface-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
            />
          </div>
        </div>

        {/* Dashboard Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="metric-card group"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-surface-600">Total Products</p>
                <p className="text-2xl font-bold text-surface-900">{products?.length || 0}</p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-200">
                <ApperIcon name="Package" className="w-6 h-6 text-primary" />
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="metric-card group"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-surface-600">Low Stock Items</p>
                <p className="text-2xl font-bold text-red-600">{lowStockCount}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center group-hover:bg-red-200 transition-colors duration-200">
                <ApperIcon name="AlertTriangle" className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="metric-card group"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-surface-600">Total Value</p>
                <p className="text-2xl font-bold text-surface-900">${totalValue.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center group-hover:bg-secondary/20 transition-colors duration-200">
                <ApperIcon name="DollarSign" className="w-6 h-6 text-secondary" />
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="metric-card group"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-surface-600">Categories</p>
                <p className="text-2xl font-bold text-surface-900">{categories.length}</p>
              </div>
              <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center group-hover:bg-accent/20 transition-colors duration-200">
                <ApperIcon name="Grid3X3" className="w-6 h-6 text-accent" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Filters */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="card p-4"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="input-field text-sm"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showLowStockOnly}
                  onChange={(e) => setShowLowStockOnly(e.target.checked)}
                  className="rounded border-surface-300 text-primary focus:ring-primary"
                />
                <span className="text-sm font-medium text-surface-700">Show low stock only</span>
              </label>
            </div>
            
            <div className="text-sm text-surface-600">
              Showing {filteredProducts.length} of {products?.length || 0} products
            </div>
          </div>
        </motion.div>

        {/* Main Feature - Interactive Inventory Management */}
        <MainFeature 
          products={filteredProducts}
          loading={loading}
          error={error}
          onProductUpdate={onProductUpdate}
          getStockStatus={getStockStatus}
          getStockStatusColor={getStockStatusColor}
        />
      </main>
    </div>
  )
}

export default Home