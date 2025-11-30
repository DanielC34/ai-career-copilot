import { Sidebar } from "@/components/Sidebar";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="h-full relative bg-gray-50 min-h-screen">
            <Sidebar />
            <main className="md:pl-72">
                {children}
            </main>
        </div>
    );
}
