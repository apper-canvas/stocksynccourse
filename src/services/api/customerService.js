const { ApperClient } = window.ApperSDK

const initializeClient = () => {
  return new ApperClient({
    apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
    apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
  })
}

const tableName = 'Customer'
const allFields = [
  'Name', 'Tags', 'Owner', 'CreatedOn', 'CreatedBy', 'ModifiedOn', 'ModifiedBy'
]
const updateableFields = ['Name', 'Tags', 'Owner']

export const customerService = {
  async fetchAllCustomers(params = {}) {
    try {
      const apperClient = initializeClient()
      const queryParams = {
        fields: allFields,
        ...params
      }
      const response = await apperClient.fetchRecords(tableName, queryParams)
      return response?.data || []
    } catch (error) {
      console.error("Error fetching customers:", error)
      throw new Error('Failed to fetch customers: ' + error.message)
    }
  },

  async getCustomerById(id) {
    try {
      const apperClient = initializeClient()
      const params = { fields: allFields }
      const response = await apperClient.getRecordById(tableName, id, params)
      return response?.data || null
    } catch (error) {
      console.error(`Error fetching customer ${id}:`, error)
      throw new Error('Failed to fetch customer: ' + error.message)
    }
  },

  async createCustomer(customerData) {
    try {
      const apperClient = initializeClient()
      const filteredData = {}
      updateableFields.forEach(field => {
        if (customerData.hasOwnProperty(field)) {
          filteredData[field] = customerData[field]
        }
      })
      
      const params = { records: [filteredData] }
      const response = await apperClient.createRecord(tableName, params)
      
      if (response?.success && response?.results?.[0]?.success) {
        return response.results[0].data
      } else {
        throw new Error(response?.results?.[0]?.message || 'Failed to create customer')
      }
    } catch (error) {
      console.error("Error creating customer:", error)
      throw new Error('Failed to create customer: ' + error.message)
    }
  },

  async updateCustomer(id, customerData) {
    try {
      const apperClient = initializeClient()
      const filteredData = { Id: id }
      updateableFields.forEach(field => {
        if (customerData.hasOwnProperty(field)) {
          filteredData[field] = customerData[field]
        }
      })
      
      const params = { records: [filteredData] }
      const response = await apperClient.updateRecord(tableName, params)
      
      if (response?.success && response?.results?.[0]?.success) {
        return response.results[0].data
      } else {
        throw new Error(response?.results?.[0]?.message || 'Failed to update customer')
      }
    } catch (error) {
      console.error("Error updating customer:", error)
      throw new Error('Failed to update customer: ' + error.message)
    }
  },

  async deleteCustomer(ids) {
    try {
      const apperClient = initializeClient()
      const recordIds = Array.isArray(ids) ? ids : [ids]
      const params = { RecordIds: recordIds }
      const response = await apperClient.deleteRecord(tableName, params)
      
      if (response?.success) {
        return true
      } else {
        throw new Error('Failed to delete customer(s)')
      }
    } catch (error) {
      console.error("Error deleting customer:", error)
      throw new Error('Failed to delete customer: ' + error.message)
    }
  }
}