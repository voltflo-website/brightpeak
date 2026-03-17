import { notFound, redirect } from "next/navigation";
import { checkRedirect } from "../lib/redirects";

export const revalidate = 60;

export default async function CatchAllRoute({
  params,
}: {
  params: Promise<{ catchAll: string[] }>;
}) {
  const { catchAll } = await params;
  const pathname = "/" + catchAll.map((s) => s.toLowerCase().trim()).join("/");

  const target = checkRedirect(pathname);
  if (target) {
    redirect(target);
  }

  notFound();
}
