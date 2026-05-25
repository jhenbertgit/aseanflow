"use client";

import { motion } from "framer-motion";

interface UserHeaderProps {
  name: string;
}

export function UserHeader({ name }: UserHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex items-center gap-3"
    >
      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-white font-bold text-lg">
        {name.charAt(0)}
      </div>
      <div>
        <p className="text-sm text-muted-foreground">Welcome back,</p>
        <p className="font-semibold text-lg">{name}</p>
      </div>
    </motion.div>
  );
}
