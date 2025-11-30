import { AdminSidebar } from '@/components/admin/admin-sidebar';
import { AdminTopBar } from '@/components/admin/admin-topbar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <AdminTopBar />
        <main className="flex-1 bg-white">{children}</main>
      </div>
    </div>
  );
}
