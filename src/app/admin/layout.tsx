export const dynamic = "force-dynamic";

export const metadata = {
  title: "Site Admin",
  robots: "noindex, nofollow",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
