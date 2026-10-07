import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { waitForFirebaseUser } from "@/lib/firebase";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const user = await waitForFirebaseUser();
    if (!user) throw redirect({ to: "/auth" });
    return { user };
  },
  component: () => <Outlet />,
});
