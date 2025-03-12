import { type RouteConfig, route } from "@react-router/dev/routes";

export default [
  route("checkout/:slug", "routes/home.tsx"),
] satisfies RouteConfig;
