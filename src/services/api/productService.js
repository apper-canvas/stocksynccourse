const { ApperClient } = window.ApperSDK

const initializeClient = () => {
  return new ApperClient({
    apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
    apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
  })
}

const tableName = 'product'
const allFields = [
  'Name', 'Tags', 'Owner', 'CreatedOn', 'CreatedBy', 'ModifiedOn', 'ModifiedBy',
  'sku', 'barcode', 'category', 'current_stock', 'reorder_point', 'unit_price', 'supplier', 'description'
]
const updateableFields = [
  'Name', 'Tags', 'Owner', 'sku', 'barcode', 'category', 'current_stock', 'reorder_point', 'unit_price', 'supplier', 'description'
]

export const productService = {
  async fetchAllProducts(params = {}) {
    try {
      const apperClient = initializeClient()
      const queryParams = {
        fields: allFields,
        ...params
      }
      const response = await apperClient.fetchRecords(tableName, queryParams)
      return response?.data || []
    } catch (error) {
      console.error("Error fetching products:", error)
      throw new Error('Failed to fetch products: ' + error.message)
    }
  },

  async getProductById(id) {
    try {
      const apperClient = initializeClient()
      const params = { fields: allFields }
      const response = await apperClient.getRecordById(tableName, id, params)
      return response?.data || null
    } catch (error) {
      console.error(`Error fetching product ${id}:`, error)
      throw new Error('Failed to fetch product: ' + error.message)
    }
  },

  async createProduct(productData) {
    try {
      const apperClient = initializeClient()
      // Filter to only include updateable fields
      const filteredData = {}
      updateableFields.forEach(field => {
        if (productData.hasOwnProperty(field)) {
          filteredData[field] = productData[field]
        }
      })
      
      const params = { records: [filteredData] }
      const response = await apperClient.createRecord(tableName, params)
      
      if (response?.success && response?.results?.[0]?.success) {
        return response.results[0].data
      } else {
        throw new Error(response?.results?.[0]?.message || 'Failed to create product')
      }
    } catch (error) {
      console.error("Error creating product:", error)
      throw new Error('Failed to create product: ' + error.message)
    }
  },

  async updateProduct(id, productData) {
    try {
      const apperClient = initializeClient()
      // Filter to only include updateable fields plus Id
      const filteredData = { Id: id }
      updateableFields.forEach(field => {
        if (productData.hasOwnProperty(field)) {
          filteredData[field] = productData[field]
        }
      })
      
      const params = { records: [filteredData] }
      const response = await apperClient.updateRecord(tableName, params)
      
      if (response?.success && response?.results?.[0]?.success) {
        return response.results[0].data
      } else {
        throw new Error(response?.results?.[0]?.message || 'Failed to update product')
      }
    } catch (error) {
      console.error("Error updating product:", error)
      throw new Error('Failed to update product: ' + error.message)
    }
  },

  async deleteProduct(ids) {
    try {
      const apperClient = initializeClient()
      const recordIds = Array.isArray(ids) ? ids : [ids]
      const params = { RecordIds: recordIds }
      const response = await apperClient.deleteRecord(tableName, params)
      
      if (response?.success) {
        return true
      } else {
        throw new Error('Failed to delete product(s)')
      }
    } catch (error) {
      console.error("Error deleting product:", error)
      throw new Error('Failed to delete product: ' + error.message)
    }
  },

  // Legacy methods for backward compatibility
  async getAll(params = {}) {
    return this.fetchAllProducts(params)
  },

  async getById(id) {
    return this.getProductById(id)
  },

  async create(productData) {
    return this.createProduct(productData)
  },

  async update(id, productData) {
    return this.updateProduct(id, productData)
  },

  async delete(id) {
    return this.deleteProduct(id)
  },

  async getByCategory(category) {
    const params = {
      where: [{
        fieldName: "category",
        operator: "ExactMatch",
        values: [category]
      }]
    }
    return this.fetchAllProducts(params)
  },

  async getLowStock() {
    // This would require a more complex query to compare current_stock with reorder_point
    // For now, fetch all and filter client-side
    const allProducts = await this.fetchAllProducts()
    return allProducts.filter(p => (p?.current_stock || 0) <= (p?.reorder_point || 0))
  }
}