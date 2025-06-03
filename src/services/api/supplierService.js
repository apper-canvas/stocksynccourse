import supplierData from '../mockData/suppliers.json'

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

let suppliers = [...supplierData]

export const supplierService = {
  async getAll() {
    await delay(300)
    return [...suppliers]
  },

  async getById(id) {
    await delay(200)
    const supplier = suppliers.find(s => s.id === id)
    if (!supplier) {
      throw new Error('Supplier not found')
    }
    return { ...supplier }
  },

  async create(supplierData) {
    await delay(400)
    const newSupplier = {
      ...supplierData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    }
    suppliers.push(newSupplier)
    return { ...newSupplier }
  },

  async update(id, supplierData) {
    await delay(350)
    const index = suppliers.findIndex(s => s.id === id)
    if (index === -1) {
      throw new Error('Supplier not found')
    }
    
    suppliers[index] = {
      ...suppliers[index],
      ...supplierData,
      updatedAt: new Date().toISOString()
    }
    
    return { ...suppliers[index] }
  },

  async delete(id) {
    await delay(300)
    const index = suppliers.findIndex(s => s.id === id)
    if (index === -1) {
      throw new Error('Supplier not found')
    }
    
    const deletedSupplier = suppliers.splice(index, 1)[0]
    return { ...deletedSupplier }
  }
}