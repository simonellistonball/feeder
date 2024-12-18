import { GraphQLContext } from "../schema";

export const ADMIN_ROLES = ["admin"];
export const DELETE_ROLES = ["admin", "editor"];
export const UPDATE_ROLES = ["admin", "editor"];
export const CREATE_ROLES = ["admin", "contributor", "editor"];
export const READ_ROLES = ["admin", "contributor", "editor", "viewer"];

export async function checkUser(context: GraphQLContext, roles: string[]) {
  const { _id: userId, tenant, dataSource } = context.jwt.payload;

  const ds = await context.db.query.dataSources.findFirst({
    where: (dataSources, { and, eq }) =>
      and(eq(dataSources.id, dataSource), eq(dataSources.active, true)),
  });
  if (!ds) {
    throw new Error("Datasource not found");
  }

  const user = await context.db.query.users.findFirst({
    where: (users, { and, eq }) =>
      and(eq(users.id, userId), eq(users.active, true)),
    columns: { id: true },
    with: {
      userDataSourceRole: {
        columns: { role: true },
        with: { dataSource: { columns: { id: true, active: true } } },
      },
      userTenants: {
        columns: { role: true },
        with: { tenant: { columns: { id: true, active: true } } },
      },
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // ensure the user is part of a tenant which overlaps with the datasource roles
  if (
    !user?.userTenants.some((ut) =>
      ds?.tenantId
        ? ut.tenant.id === ds.tenantId
        : true &&
          roles.includes(ut.role) &&
          ut.tenant.active &&
          ut.tenant.id === tenant
    )
  ) {
    throw new Error("User not authorized for this tenant");
  }

  // does the user have an admin or create role allocated to this datasource?
  if (
    !user?.userDataSourceRole.some(
      (udr) => roles.includes(udr.role) && udr.dataSource?.id === dataSource
    )
  ) {
    throw new Error("User not authorized for this datasource");
  }
  return { user, dataSource };
}
