import stockMovementData from '../mockData/stockMovements.json'

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

let stockMovements = [...stockMovementData]

export const stockMovementService = {
  async getAll() {
    await delay(300)
    return [...stockMovements]
  },

  async getById(id) {
    await delay(200)
    const movement = stockMovements.find(m => m.id === id)
    if (!movement) {
      throw new Error('Stock movement not found')
    }
    return { ...movement }
  },

  async create(movementData) {
    await delay(400)
    const newMovement = {
      ...movementData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    }
    stockMovements.push(newMovement)
    return { ...newMovement }
  },

  async update(id, movementData) {
    await delay(350)
    const index = stockMovements.findIndex(m => m.id === id)
    if (index === -1) {
      throw new Error('Stock movement not found')
    }
    
    stockMovements[index] = {
      ...stockMovements[index],
      ...movementData,
      updatedAt: new Date().toISOString()
    }
    
    return { ...stockMovements[index] }
  },

  async delete(id) {
    await delay(300)
    const index = stockMovements.findIndex(m => m.id === id)
    if (index === -1) {
      throw new Error('Stock movement not found')
    }
    
    const deletedMovement = stockMovements.splice(index, 1)[0]
    return { ...deletedMovement }
  },

  async getByProduct(productId) {
    await delay(250)
    return stockMovements.filter(m => m.productId === productId).map(m => ({ ...m }))
  },

  async getByDateRange(startDate, endDate) {
    await delay(300)
    return stockMovements.filter(m => {
      const movementDate = new Date(m.timestamp)
      return movementDate >= new Date(startDate) && movementDate <= new Date(endDate)
    }).map(m => ({ ...m }))
  }
}