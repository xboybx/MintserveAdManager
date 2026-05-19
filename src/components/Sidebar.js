'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// Each nav item defined in one place for easy maintenance
const NAV_ITEMS = [
  { href: '/', icon: 'home', label: 'Home' },
  { href: '/campaigns', icon: 'local_shipping', label: 'Delivery' },
  { href: '/inventory', icon: 'inventory_2', label: 'Inventory' },
  { href: '/reporting', icon: 'bar_chart', label: 'Reporting' },
  { href: '/admin', icon: 'admin_panel_settings', label: 'Admin' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r border-[#dadce0] flex flex-col z-10">
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-[#dadce0] shrink-0">
        <img
          src="/Mintserve.webp"
          alt="Mintserve Logo"
          className="h-40 w-auto max-w-[210px] object-contain"
        />
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto">
        {NAV_ITEMS.map(({ href, icon, label }) => {
          // Mark active: exact match for '/', startsWith for all others
          const isActive =
            href === '/' ? pathname === '/' : pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center px-6 py-3 rounded-r-full mr-4 transition-colors text-sm font-medium ${isActive
                ? 'bg-[#e8f0fe] text-[#1a73e8]'
                : 'text-[#3c4043] hover:bg-[#f1f3f4]'
                }`}
            >
              <span
                className={`material-icons mr-4 text-xl ${isActive ? 'text-[#1a73e8]' : 'text-[#5f6368]'
                  }`}
              >
                {icon}
              </span>
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer info */}
      <div className="p-4 border-t border-[#dadce0] text-xs text-[#5f6368]">
        <p>Mintserve v1.0</p>
      </div>
    </aside>
  );
}
