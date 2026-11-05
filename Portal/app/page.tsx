import Image from "next/image";
import ClientOnly from "./components/ClientOnly";
import Container from "./components/container";
import getCurrentUser from "./actions/getCurrentUser";
import EmptyState from "./components/EmptyState";
import { redirect } from "next/navigation";

export default async function Home() {
  const currentUser = await getCurrentUser();

  if (currentUser) {
    redirect("/dashboard");
  }

  // If no user, render a simple welcome or rely on Navbar for login/register
  // For now, let's keep the structure but it will be empty if not redirected.
  // A more explicit landing page could be built here.
  return (
    <div className="text-rose-500 text-2xl">
      <ClientOnly>
        <Container>
          <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]"> {/* Basic centering */}
            <EmptyState
              title="Welcome to CCMS Portal"
              subtitle="Please login or register using the options in the navigation bar to manage your devices."
              // showLoginButton prop removed as it's not supported
            />
          </div>
        </Container>
      </ClientOnly>
    </div>
  );
}
export const dynamic = "force-dynamic";
