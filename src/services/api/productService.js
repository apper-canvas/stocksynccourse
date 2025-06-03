import productData from '../mockData/products.json'

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

let products = [...productData]

export const productService = {
  async getAll() {
    await delay(300)
    return [...products]
  },

  async getById(id) {
    await delay(200)
    const product = products.find(p => p.id === id)
    if (!product) {
      throw new Error('Product not found')
    }
    return { ...product }
  },

  async create(productData) {
    await delay(400)
    const newProduct = {
      ...productData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    }
    products.push(newProduct)
    return { ...newProduct }
  },

  async update(id, productData) {
    await delay(350)
    const index = products.findIndex(p => p.id === id)
    if (index === -1) {
      throw new Error('Product not found')
    }
    
    products[index] = {
      ...products[index],
      ...productData,
      updatedAt: new Date().toISOString()
    }
    
    return { ...products[index] }
  },

  async delete(id) {
    await delay(300)
    const index = products.findIndex(p => p.id === id)
    if (index === -1) {
      throw new Error('Product not found')
    }
    
    const deletedProduct = products.splice(index, 1)[0]
    return { ...deletedProduct }
  },

  async getByCategory(category) {
    await delay(250)
    return products.filter(p => p.category === category).map(p => ({ ...p }))
  },

  async getLowStock() {
    await delay(200)
    return products.filter(p => p.currentStock <= p.reorderPoint).map(p => ({ ...p }))
  }
}