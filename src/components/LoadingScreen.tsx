
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BlobLogo from './BlobLogo';

interface LoadingScreenProps {
  isLoading?: boolean;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ isLoading = true }) => {
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          className="fixed inset-0 bg-background z-50 flex flex-col items-center justify-center"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center"
          >
            <BlobLogo size="lg" className="mb-8" />
            
            <motion.div 
              className="h-1 bg-gradient-to-r from-[#C8FF00] to-[#F97316] rounded-full w-48 mt-4 overflow-hidden"
              initial={{ width: 0 }}
              animate={{ width: "12rem" }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoadingScreen;
