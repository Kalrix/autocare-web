'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Menu,
  X,
  LayoutDashboard,
  Store,
  CalendarCheck2,
  Users,
  Package,
  LogOut,
  ChevronDown,
  ListTodo,
  Handshake,
  Wrench,
} from 'lucide-react';

export default function AdminDashboard() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [crmMenuOpen, setCrmMenuOpen] = useState(false);
  const [bookingMenuOpen, setBookingMenuOpen] = useState(false);
  const [taskMenuOpen, setTaskMenuOpen] = useState(false); // ✅ New submenu state

  useEffect(() => {
    const type = localStorage.getItem('user_type');
    if (type !== 'admin') {
      router.push('/admin/login');
    }
  }, [router]);

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/admin/login';
  };

  return (
    <div className="flex">
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-16'
        } bg-white shadow-md transition-all duration-300 overflow-hidden flex flex-col h-screen`}
      >
        <div className="flex items-center justify-between px-4 py-4 border-b">
          <h2 className={`text-xl font-bold ${sidebarOpen ? 'block' : 'hidden'}`}>
            AutoCare24
          </h2>
          <button onClick={toggleSidebar} className="text-gray-600">
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="flex-1 p-2 space-y-1">
          <NavItem
            icon={<LayoutDashboard size={20} />}
            label="Insights"
            open={sidebarOpen}
            href="/admin/dashboard"
          />
          <NavItem
            icon={<Store size={20} />}
            label="Manage Store"
            open={sidebarOpen}
            href="/admin/dashboard/manage-store"
          />
          <Submenu
            icon={<CalendarCheck2 size={20} />}
            label="Bookings"
            open={sidebarOpen}
            expanded={bookingMenuOpen}
            setExpanded={setBookingMenuOpen}
            items={[
              { label: 'Car Wash', path: '/crm/bookings/carwashBook' },
              { label: 'Job Cards', path: '/crm/bookings/jobcards' },
              { label: 'Repairs (Coming Soon)', path: '', disabled: true },
            ]}
          />

          <Submenu
            icon={<Users size={20} />}
            label="Users"
            open={sidebarOpen}
            expanded={userMenuOpen}
            setExpanded={setUserMenuOpen}
            items={[
              { label: 'Customers', path: '/admin/dashboard/customer' },
              { label: 'Vendors', path: '/vendors' },
              { label: 'OEMs', path: '/oem' },
            ]}
          />

          <NavItem
            icon={<Package size={20} />}
            label="Product & Service"
            open={sidebarOpen}
            href="/inventory"
          />

          {/* ✅ Task Engine with Submenu */}
          <Submenu
            icon={<Wrench size={20} />}
            label="Task Engine"
            open={sidebarOpen}
            expanded={taskMenuOpen}
            setExpanded={setTaskMenuOpen}
            items={[
              { label: 'Task Types', path: '/admin/dashboard/store-task/task-types' },
              { label: 'Services', path: '/admin/dashboard/store-task/services' },
              { label: 'Subservices', path: '/admin/dashboard/store-task/subservices' },
              { label: 'Addons', path: '/admin/dashboard/store-task/addons' },
              { label: 'Service Pricing', path: '/admin/dashboard/store-task/service-pricing' },
              { label: 'Labour Rules', path: '/admin/dashboard/store-task/labour-rules' },
            ]}
          />

          <Submenu
            icon={<Handshake size={20} />}
            label="CRM"
            open={sidebarOpen}
            expanded={crmMenuOpen}
            setExpanded={setCrmMenuOpen}
            items={[
              { label: 'Leads', path: '/crm/leads' },
              { label: 'Opportunities', path: '/crm/opportunities' },
              { label: 'Pipeline', path: '/crm/pipeline' },
              { label: 'Closed Deals', path: '/crm/closed' },
            ]}
          />
        </nav>

        <div className="border-t p-2">
          <NavItem
            icon={<LogOut size={20} />}
            label="Logout"
            open={sidebarOpen}
            onClick={handleLogout}
          />
        </div>
      </aside>

      <main className="flex-1 p-6">{/* Dashboard content goes here */}</main>
    </div>
  );
}

type NavItemProps = {
  icon: React.ReactNode;
  label: string;
  open: boolean;
  href?: string;
  onClick?: () => void;
  hasSub?: boolean;
};

function NavItem({ icon, label, open, href, onClick, hasSub }: NavItemProps) {
  const router = useRouter();

  const handleClick = () => {
    if (!open) return;
    if (href) router.push(href);
    else if (onClick) onClick();
  };

  return (
    <div
      onClick={handleClick}
      className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 cursor-pointer rounded"
    >
      {icon}
      {open && <span className="flex-1 text-sm font-medium">{label}</span>}
      {hasSub && open && <ChevronDown size={16} />}
    </div>
  );
}

type SubmenuItem = {
  label: string;
  path: string;
  disabled?: boolean;
};

type SubmenuProps = {
  icon: React.ReactNode;
  label: string;
  open: boolean;
  expanded: boolean;
  setExpanded: (value: boolean) => void;
  items: SubmenuItem[];
};

function Submenu({ icon, label, open, expanded, setExpanded, items }: SubmenuProps) {
  const router = useRouter();

  return (
    <div>
      <NavItem
        icon={icon}
        label={label}
        open={open}
        hasSub
        onClick={() => setExpanded(!expanded)}
      />
      {expanded && open && (
        <div className="ml-8 mt-1 space-y-1 text-sm text-gray-700">
          {items.map((item) =>
            item.disabled ? (
              <div key={item.label} className="text-gray-400 cursor-default">
                {item.label}
              </div>
            ) : (
              <div
                key={item.label}
                className="hover:text-black cursor-pointer"
                onClick={() => router.push(item.path)}
              >
                {item.label}
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}
