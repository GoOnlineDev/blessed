import { AuthProvider } from "@/components/AuthProvider";
import DashboardLayoutClient from "@/components/DashboardLayoutClient";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AuthProvider>
            <DashboardLayoutClient>
                {children}
            </DashboardLayoutClient>
        </AuthProvider>
    );
}
