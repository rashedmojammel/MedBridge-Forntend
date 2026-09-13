'use client';

import { motion } from 'framer-motion';
import Navbar from './Navbar';
import Sidebar, { type NavItem } from './Sidebar';
import BottomNav from './BottomNav';


export default function RoleShell({
  items,
  children,
}: {
  items: NavItem[];
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="flex">
        <Sidebar items={items} />
        <motion.main
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="min-w-0 flex-1 p-4 pb-20 lg:p-6 lg:pb-6"
        >
          {children}
        </motion.main>
      </div>
      <BottomNav items={items} />
    </div>
  );
}
