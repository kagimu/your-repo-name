import { Outlet } from "react-router-dom";
import RoleGuard from "./RoleGuard";

// Layout wrapper for public routes
export const PublicRoute = () => (
  <RoleGuard allowedRoles={["*"]} requireAuth={false}>
    <Outlet />
  </RoleGuard>
);

// Layout wrapper for admin routes
export const AdminRoute = () => (
  <RoleGuard allowedRoles={["admin"]} requireAuth={true}>
    <Outlet />
  </RoleGuard>
);

// Layout wrapper for courier routes
export const CourierRoute = () => (
  <RoleGuard allowedRoles={["courier"]} requireAuth={true}>
    <Outlet />
  </RoleGuard>
);

// Layout wrapper for supplier routes
export const SupplierRoute = () => (
  <RoleGuard allowedRoles={["supplier"]} requireAuth={true}>
    <Outlet />
  </RoleGuard>
);
