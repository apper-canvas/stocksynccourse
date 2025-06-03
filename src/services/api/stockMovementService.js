const { ApperClient } = window.ApperSDK

const initializeClient = () => {
  return new ApperClient({
    apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
    apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
  })
}

const tableName = 'stock_movement'
const allFields = [
  'Name', 'Tags', 'Owner', 'CreatedOn', 'CreatedBy', 'ModifiedOn', 'ModifiedBy',
  'type', 'quantity', 'reason', 'timestamp', 'notes', 'user_id', 'product_id'
]
const updateableFields = [
  'Name', 'Tags', 'Owner', 'type', 'quantity', 'reason', 'timestamp', 'notes', 'user_id', 'product_id'
]

export const stockMovementService = {
  async fetchAllStockMovements(params = {}) {
    try {
      const apperClient = initializeClient()
      const queryParams = {
        fields: allFields,
        ...params
      }
      const response = await apperClient.fetchRecords(tableName, queryParams)
      return response?.data || []
    } catch (error) {
      console.error("Error fetching stock movements:", error)
      throw new Error('Failed to fetch stock movements: ' + error.message)
    }
  },

  async getStockMovementById(id) {
    try {
      const apperClient = initializeClient()
      const params = { fields: allFields }
      const response = await apperClient.getRecordById(tableName, id, params)
      return response?.data || null
    } catch (error) {
      console.error(`Error fetching stock movement ${id}:`, error)
      throw new Error('Failed to fetch stock movement: ' + error.message)
    }
  },

  async createStockMovement(movementData) {
    try {
      const apperClient = initializeClient()
      // Filter to only include updateable fields
      const filteredData = {}
      updateableFields.forEach(field => {
        if (movementData.hasOwnProperty(field)) {
          filteredData[field] = movementData[field]
        }
      })
      
      const params = { records: [filteredData] }
      const response = await apperClient.createRecord(tableName, params)
      
      if (response?.success && response?.results?.[0]?.success) {
        return response.results[0].data
      } else {
        throw new Error(response?.results?.[0]?.message || 'Failed to create stock movement')
      }
    } catch (error) {
      console.error("Error creating stock movement:", error)
      throw new Error('Failed to create stock movement: ' + error.message)
    }
  },

  async updateStockMovement(id, movementData) {
    try {
      const apperClient = initializeClient()
      // Filter to only include updateable fields plus Id
      const filteredData = { Id: id }
      updateableFields.forEach(field => {
        if (movementData.hasOwnProperty(field)) {
          filteredData[field] = movementData[field]
        }
      })
      
      const params = { records: [filteredData] }
      const response = await apperClient.updateRecord(tableName, params)
      
      if (response?.success && response?.results?.[0]?.success) {
        return response.results[0].data
      } else {
        throw new Error(response?.results?.[0]?.message || 'Failed to update stock movement')
      }
    } catch (error) {
      console.error("Error updating stock movement:", error)
      throw new Error('Failed to update stock movement: ' + error.message)
    }
  },

  async deleteStockMovement(ids) {
    try {
      const apperClient = initializeClient()
      const recordIds = Array.isArray(ids) ? ids : [ids]
      const params = { RecordIds: recordIds }
      const response = await apperClient.deleteRecord(tableName, params)
      
      if (response?.success) {
        return true
      } else {
        throw new Error('Failed to delete stock movement(s)')
      }
    } catch (error) {
      console.error("Error deleting stock movement:", error)
      throw new Error('Failed to delete stock movement: ' + error.message)
    }
  },

  // Legacy methods for backward compatibility
  async getAll(params = {}) {
    return this.fetchAllStockMovements(params)
  },

  async getById(id) {
    return this.getStockMovementById(id)
  },

  async create(movementData) {
    return this.createStockMovement(movementData)
  },

  async update(id, movementData) {
    return this.updateStockMovement(id, movementData)
  },

  async delete(id) {
    return this.deleteStockMovement(id)
  },

  async getByProduct(productId) {
    const params = {
      where: [{
        fieldName: "product_id",
        operator: "ExactMatch",
        values: [productId]
      }]
    }
    return this.fetchAllStockMovements(params)
  },

  async getByDateRange(startDate, endDate) {
    const params = {
      where: [{
        fieldName: "timestamp",
        operator: "GreaterThanOrEqualTo",
        values: [startDate]
      }, {
        fieldName: "timestamp",
        operator: "LessThanOrEqualTo",
        values: [endDate]
      }]
    }
    return this.fetchAllStockMovements(params)
  }
}