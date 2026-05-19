import './globals.css';
import Sidebar from '@/components/Sidebar';

export const metadata = {
  title: 'Mintserve — Ad Server & Manager',
  description: 'Publisher Operations Dashboard - Mintserve Ad Server',
  icons: {
    icon: '/Mintserve.webp',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/icon?family=Material+Icons"
          rel="stylesheet"
        />
      </head>
      <body className="flex h-screen bg-[#f8f9fa] text-[#202124] font-sans antialiased overflow-hidden">

        {/* Left sidebar */}
        <Sidebar />

        {/* Right panel */}
        <div className="flex-1 flex flex-col overflow-hidden">

          {/* Top appbar */}
          <header className="h-16 bg-white border-b border-[#dadce0] flex items-center justify-between px-6 shrink-0">
            {/* Search bar */}
            <div className="flex items-center w-full max-w-xl bg-[#f1f3f4] rounded-md px-4 py-2 border border-transparent focus-within:bg-white focus-within:border-[#dadce0] focus-within:shadow-sm transition-all">
              <span className="material-icons text-[#5f6368] mr-2 text-xl">search</span>
              <input
                type="text"
                placeholder="Search for an order, line item, or ad unit..."
                className="bg-transparent border-none outline-none w-full text-sm text-[#202124] placeholder-[#5f6368]"
              />
            </div>

            {/* Right icons */}
            <div className="flex items-center space-x-4 ml-4">
              <span className="material-icons text-[#5f6368] cursor-pointer hover:text-[#202124] text-xl" title="Help">help_outline</span>
              <span className="material-icons text-[#5f6368] cursor-pointer hover:text-[#202124] text-xl" title="Notifications">notifications_none</span>
              {/* User avatar */}
              <div
                className="w-8 h-8 rounded-full bg-[#1a73e8] text-white flex items-center justify-center text-sm font-medium cursor-pointer select-none"
                title="User Account"
              >
                P
              </div>
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 overflow-y-auto bg-[#f8f9fa]">
            {children}
          </main>

        </div>
      </body>
    </html>
  );
}
