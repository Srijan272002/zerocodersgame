'use client';

import { ReactNode, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface DashboardLayoutProps {
  children: ReactNode;
}

const sidebarItems = [
  { href: '/dashboard', label: 'Overview', icon: '📊' },
  { href: '/dashboard/projects', label: 'Projects', icon: '📁' },
  { href: '/dashboard/settings', label: 'Settings', icon: '⚙️' },
];

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <motion.aside
        initial={{ width: 250 }}
        animate={{ width: isSidebarOpen ? 250 : 80 }}
        transition={{ duration: 0.3 }}
        className="bg-card border-r border-border flex flex-col"
      >
        <div className="p-4 border-b border-border flex items-center justify-between">
          <motion.span
            initial={{ opacity: 1 }}
            animate={{ opacity: isSidebarOpen ? 1 : 0 }}
            className="font-bold text-xl"
          >
            Dashboard
          </motion.span>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-md hover:bg-accent"
          >
            {isSidebarOpen ? '◀' : '▶'}
          </button>
        </div>
        <nav className="flex-1 p-4">
          {sidebarItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md mb-2 transition-colors ${
                pathname === item.href
                  ? 'bg-primary/10 text-primary'
                  : 'hover:bg-accent'
              }`}
            >
              <span>{item.icon}</span>
              <motion.span
                initial={{ opacity: 1 }}
                animate={{ opacity: isSidebarOpen ? 1 : 0 }}
              >
                {item.label}
              </motion.span>
            </Link>
          ))}
        </nav>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto p-6">{children}</div>
      </main>
    </div>
  );
} 