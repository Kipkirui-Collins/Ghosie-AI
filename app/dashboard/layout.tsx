import { ReactNode } from "react";
import Sidebar from "../../components/Layout/Sidebar";
import SettingsDrawer from "../../components/Layout/SettingsDrawer";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-transparent">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col lg:flex-row">
        <aside className="w-full border-b border-white/10 p-3 lg:w-80 lg:min-h-screen lg:border-b-0 lg:border-r lg:p-4">
          <Sidebar />
        </aside>
        <main className="flex-1 p-3 sm:p-4 lg:p-6">
          {children}
        </main>
      </div>
      <SettingsDrawer />
    </div>
  );
}
