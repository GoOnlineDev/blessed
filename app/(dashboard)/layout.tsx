import { getSession } from "@/lib/auth-utils";
import { redirect } from "next/navigation";
import { AuthProvider } from "@/components/AuthProvider";
import DashboardLayoutClient from "@/components/DashboardLayoutClient";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getSession();

    if (!session) {
        redirect("/login");
    }

    const { user } = session;

    return (
        <AuthProvider user={user}>
            <DashboardLayoutClient user={user}>
                {children}
            </DashboardLayoutClient>
        </AuthProvider>
    );
}
