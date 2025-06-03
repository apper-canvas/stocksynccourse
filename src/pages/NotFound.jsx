import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import ApperIcon from '../components/ApperIcon'

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-50 to-surface-100 flex items-center justify-center px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <motion.div
          animate={{ 
            rotate: [0, 10, -10, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            repeatType: "reverse"
          }}
          className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-8"
        >
          <ApperIcon name="Package" className="w-12 h-12 text-primary" />
        </motion.div>
        
        <h1 className="text-6xl font-bold text-surface-900 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-surface-700 mb-4">Page Not Found</h2>
        <p className="text-surface-600 mb-8 max-w-md mx-auto">
          The inventory page you're looking for seems to have been moved or doesn't exist.
        </p>
        
        <Link 
          to="/" 
          className="btn-primary inline-flex items-center space-x-2"
        >
          <ApperIcon name="ArrowLeft" className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>
      </motion.div>
    </div>
  )
}

export default NotFound