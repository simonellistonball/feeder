import { pgMaterializedView } from "drizzle-orm/pg-core";
import { teamMembers, teamRoles, teams, users } from "../schema";
import { eq, sql } from "drizzle-orm";

export const productManagersView = pgMaterializedView(
  `${process.env.APP_NAME}_product_managers`
).as((qb) =>
  qb
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      image: users.image,
    })
    .from(users)
    .innerJoin(teamMembers, eq(teamMembers.userId, users.id))
    .innerJoin(teamRoles, eq(teamMembers.roleId, teamRoles.id))
    .where(eq(teamRoles.name, "Product Manager"))
);

export const teamsAndRoles = pgMaterializedView(
  `${process.env.APP_NAME}_teams_and_roles`
).as((qb) =>
  qb
    .select({
      userId: teamMembers.userId,
      teamId: teamMembers.teamId,
      teamName: teams.name,
      roleId: teamMembers.roleId,
      roleName: sql`${teamRoles.name}`.as("role"),
    })
    .from(teamMembers)
    .innerJoin(teams, eq(teamMembers.teamId, teams.id))
    .innerJoin(teamRoles, eq(teamMembers.roleId, teamRoles.id))
);
