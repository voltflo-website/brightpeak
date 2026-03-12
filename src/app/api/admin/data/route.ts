import path from "path";
import { createAdminHandler } from "../../../../../packages/admin/api/handler";

export const dynamic = "force-dynamic";

const DATA_BASE = path.join(process.cwd(), "data");
const handler = createAdminHandler(DATA_BASE);

export const GET = handler.GET;
export const PUT = handler.PUT;
