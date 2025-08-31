import { motion } from "framer-motion";
import Link from "next/link";

interface AnimatedButtonProps {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "outline";
  className?: string;
  external?: boolean;
}

export default function AnimatedButton({ 
  href, 
  children, 
  variant = "primary", 
  className = "",
  external = false 
}: AnimatedButtonProps) {
  const baseClasses = "px-8 py-4 rounded-xl font-semibold shadow-lg transition-all block";
  
  const variantClasses = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-xl",
    secondary: "bg-green-600 text-white hover:bg-green-700 hover:shadow-xl", 
    outline: "border border-gray-200 bg-white text-gray-800 hover:bg-gray-50 hover:shadow-md"
  };

  const buttonContent = (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
    >
      {children}
    </motion.div>
  );

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer">
        {buttonContent}
      </a>
    );
  }

  return (
    <Link href={href}>
      {buttonContent}
    </Link>
  );
}
