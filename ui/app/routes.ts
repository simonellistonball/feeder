import {
  type RouteConfig,
  index,
  layout,
  prefix,
  route,
} from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),

  route("about", "./pages/about.tsx"),

  layout("./auth/layout.tsx", [
    route("login", "./auth/login.tsx"),
    route("register", "./auth/register.tsx"),
  ]),
  ...prefix("admin", [
    layout("./admin/layout.tsx", [
      route("", "./admin/home.tsx"),
      route(":model", "./admin/model.tsx"),
    ]),
  ]),
] satisfies RouteConfig;
