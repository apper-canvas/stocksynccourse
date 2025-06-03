const { ApperClient } = window.ApperSDK

const initializeClient = () => {
  return new ApperClient({
    apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
    apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
  })
}

const tableName = 'User'
const allFields = [
  'Name', 'Tags', 'Owner', 'CreatedOn', 'CreatedBy', 'ModifiedOn', 'ModifiedBy',
  'FirstName', 'LastName', 'AvatarUrl', 'ProfileId'
]
const updateableFields = ['Name', 'Tags', 'Owner', 'FirstName', 'LastName', 'AvatarUrl', 'ProfileId']

export const userService = {
  async fetchAllUsers(params = {}) {
    try {
      const apperClient = initializeClient()
      const queryParams = {
        fields: allFields,
        ...params
      }
      const response = await apperClient.fetchRecords(tableName, queryParams)
      return response?.data || []
    } catch (error) {
      console.error("Error fetching users:", error)
      throw new Error('Failed to fetch users: ' + error.message)
    }
  },

  async getUserById(id) {
    try {
      const apperClient = initializeClient()
      const params = { fields: allFields }
      const response = await apperClient.getRecordById(tableName, id, params)
      return response?.data || null
    } catch (error) {
      console.error(`Error fetching user ${id}:`, error)
      throw new Error('Failed to fetch user: ' + error.message)
    }
  },

  async createUser(userData) {
    try {
      const apperClient = initializeClient()
      const filteredData = {}
      updateableFields.forEach(field => {
        if (userData.hasOwnProperty(field)) {
          filteredData[field] = userData[field]
        }
      })
      
      const params = { records: [filteredData] }
      const response = await apperClient.createRecord(tableName, params)
      
      if (response?.success && response?.results?.[0]?.success) {
        return response.results[0].data
      } else {
        throw new Error(response?.results?.[0]?.message || 'Failed to create user')
      }
    } catch (error) {
      console.error("Error creating user:", error)
      throw new Error('Failed to create user: ' + error.message)
    }
  },

  async updateUser(id, userData) {
    try {
      const apperClient = initializeClient()
      const filteredData = { Id: id }
      updateableFields.forEach(field => {
        if (userData.hasOwnProperty(field)) {
          filteredData[field] = userData[field]
        }
      })
      
      const params = { records: [filteredData] }
      const response = await apperClient.updateRecord(tableName, params)
      
      if (response?.success && response?.results?.[0]?.success) {
        return response.results[0].data
      } else {
        throw new Error(response?.results?.[0]?.message || 'Failed to update user')
      }
    } catch (error) {
      console.error("Error updating user:", error)
      throw new Error('Failed to update user: ' + error.message)
    }
  },

  async deleteUser(ids) {
    try {
      const apperClient = initializeClient()
      const recordIds = Array.isArray(ids) ? ids : [ids]
      const params = { RecordIds: recordIds }
      const response = await apperClient.deleteRecord(tableName, params)
      
      if (response?.success) {
        return true
      } else {
        throw new Error('Failed to delete user(s)')
      }
    } catch (error) {
      console.error("Error deleting user:", error)
      throw new Error('Failed to delete user: ' + error.message)
    }
  }
}