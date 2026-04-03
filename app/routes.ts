import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

export default [
  layout("components/Layout.tsx", [
    index("routes/Dashboard.tsx"),
    route("inventario", "routes/Inventory.tsx"),
    route("kits", "routes/Kits.tsx"),
    route("movimentacoes", "routes/Movements.tsx"),
    route("relatorios", "routes/Reports.tsx"),
  ]),
] satisfies RouteConfig;