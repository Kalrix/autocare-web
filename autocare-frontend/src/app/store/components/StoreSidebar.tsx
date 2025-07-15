'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Menu,
  X,
  LayoutDashboard,
  CalendarCheck2,
  Users,
  Package,
  Handshake,
  LogOut,
  DollarSign,
} from 'lucide-react';

export default function StoreSidebar() {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    localStorage.clear();
    router.push('/store/login');
  };

  const navItems = [
    { label: 'Insights', icon: <LayoutDashboard size={20} />, path: '/store/dashboard' },
    { label: 'Bookings', icon: <CalendarCheck2 size={20} />, path: '/store/bookings' },
    { label: 'Customers', icon: <Users size={20} />, path: '/store/customers' },
    { label: 'Staff & Salary', icon: <DollarSign size={20} />, path: '/store/staff' },
    { label: 'Inventory', icon: <Package size={20} />, path: '/store/inventory' },
    { label: 'CRM', icon: <Handshake size={20} />, path: '/store/crm' },
  ];

  return (
    <aside
      className={`${
        open ? 'w-64' : 'w-16'
      } h-screen bg-white border-r transition-all duration-300 flex flex-col`}
    >
      {/* Header Section */}
      <div className="flex items-center justify-between p-4 border-b">
        {open && <h2 className="text-xl font-bold text-gray-800">AutoCare24</h2>}
        <button
          onClick={() => setOpen(!open)}
          className="text-gray-600 p-2 rounded hover:bg-gray-100"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-2 space-y-1">
        {navItems.map((item) => (
          <div
            key={item.label}
            onClick={() => router.push(item.path)}
            className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 cursor-pointer rounded"
          >
            {item.icon}
            {open && <span className="text-sm font-medium">{item.label}</span>}
          </div>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-2 border-t">
        <div
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-100 cursor-pointer rounded"
        >
          <LogOut size={20} />
          {open && <span className="text-sm font-medium">Logout</span>}
        </div>
      </div>
    </aside>
  );
}
