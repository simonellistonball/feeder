import jwt from "jsonwebtoken";
import { db } from "../db";

const user = await db.query.users.findFirst({
  where: (users, { and, eq }) =>
    and(
      eq(users.active, true),
      eq(users.id, "1f3ac13b-739f-4b4f-9c28-3989bd98e83a")
    ),
  columns: { id: true, name: true },
  with: {
    userDataSourceRole: {
      columns: { role: true },
      with: {
        dataSource: {
          columns: { id: true, active: true, tenantId: true },
        },
      },
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

console.log("user", user);

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
if (!JWT_SECRET_KEY) {
  throw new Error("JWT_SECRET_KEY is not defined");
}

// find the first data source that the user has admin on
const ds = user.userDataSourceRole.find(
  (udr) => udr.role === "admin" && udr.dataSource?.active
)?.dataSource;

if (!ds) {
  throw new Error("User does not have an active data source");
}

// find the tenant that matches that data source
const tenant = user.userTenants.find(
  (ut) =>
    ut.role === "admin" && ut.tenant?.active && ut.tenant?.id === ds?.tenantId
)?.tenant;

if (!tenant) {
  throw new Error(
    "User does not have an active tenant that matches the datasource"
  );
}
const token = jwt.sign(
  {
    _id: user.id,
    name: user.name,
    dataSource: ds.id,
    tenant: tenant.id,
  },
  JWT_SECRET_KEY,
  {
    expiresIn: "31 days",
    issuer: "https://feeder.simonellistonball.com",
    audience: "api",
  }
);

console.log("token", token);
