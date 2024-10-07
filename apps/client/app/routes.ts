import type { RouteConfig } from "@react-router/dev/routes";
import { route } from "@react-router/dev/routes";

export const routes: RouteConfig = [route("checkout/:slug", "routes/home.tsx")];
