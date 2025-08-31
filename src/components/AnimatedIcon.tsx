import { motion } from "framer-motion";
import { ReactNode } from "react";

interface AnimatedIconProps {
  children: ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export default function AnimatedIcon({ 
  children, 
  className = "", 
  size = "md" 
}: AnimatedIconProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12", 
    lg: "w-16 h-16"
  };

  return (
    <motion.div
      className={`${sizeClasses[size]} bg-blue-100 rounded-full flex items-center justify-center text-blue-600 ${className}`}
      whileHover={{ scale: 1.1, rotate: 5 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      {children}
    </motion.div>
  );
}
