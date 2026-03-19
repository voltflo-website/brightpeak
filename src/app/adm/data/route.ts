import path from "path";
import { createAdminHandler, setInvalidateCacheCallback } from "../../../../packages/admin/api/handler";
import { invalidateHomeDataCache } from "../../lib/loadAllHomeData";

export const dynamic = "force-dynamic";

setInvalidateCacheCallback(invalidateHomeDataCache);

const DATA_BASE = path.join(process.cwd(), "data");
const handler = createAdminHandler(DATA_BASE);

export const GET = handler.GET;
export const PUT = handler.PUT;
