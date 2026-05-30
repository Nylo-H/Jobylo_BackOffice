import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useUIStore } from '../../store/ui.store';

export function AdminLayout() {
  const { sidebarOpen } = useUIStore();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div
        className="transition-all duration-300"
        style={{ marginLeft: sidebarOpen ? 260 : 72 }}
      >
        <Header />
        <main className="p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}