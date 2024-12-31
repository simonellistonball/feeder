import { eq } from "drizzle-orm";
import { db } from "./index";
import * as schema from "./schema";
import * as views from "./views";

import { faker } from "@faker-js/faker";
import { v4 as uuidv4 } from "uuid";

async function main() {
  // get the current seed user id
  const previousSeed = await db.query.users.findFirst({
    where: eq(schema.users.name, "seed"),
  });
  // delete all tenant user links for the seed user
  if (previousSeed) {
    await db
      .delete(schema.userTenants)
      .where(eq(schema.userTenants.userId, previousSeed.id));
  }
  await db
    .delete(schema.dataSources)
    .where(eq(schema.dataSources.name, "seed"));

  // create a tenant
  const seedUserId = uuidv4();
  const tenants = await db
    .insert(schema.tenants)
    .values([
      {
        name: "Testing Tenant",
      },
      {
        name: "Simon Elliston Ball",
        domain: "simonellistonball.com",
      },
    ])
    .returning();

  // create a data source
  const dataSources = await db
    .insert(schema.dataSources)
    .values({
      name: "seed",
      tenantId: tenants[0].id,
    })
    .returning();
  if (!dataSources[0]) throw new Error("Failed to create data source");
  const dataSourceId = dataSources[0].id;

  // create the seed user
  const seedUsers = await db
    .insert(schema.users)
    .values({
      name: "seed",
      email: "seed@example.com",
      dataSourceId: dataSources[0].id,
    })
    .returning();
  if (!seedUsers[0]) throw new Error("Failed to create seed user");
  const seedUser = seedUsers[0];

  await db.insert(schema.userDataSourceRole).values({
    userId: seedUser.id,
    role: "admin",
    createdById: seedUser.id,
    createdAt: new Date(),
    dataSourceId: dataSourceId,
  });
  await db.insert(schema.userTenants).values({
    userId: seedUser.id,
    tenantId: tenants[0].id,
    role: "admin",
    createdById: seedUser.id,
    createdAt: new Date(),
  });

  const trackDates = () => {
    const [createdAt, updatedAt] = faker.date.betweens({
      from: "2000-01-01",
      to: Date.now(),
      count: 2,
    });
    if (!createdAt || !updatedAt) throw new Error("Failed to create date");
    return {
      createdAt,
      updatedAt,
      dataSourceId,
    };
  };

  const usersData = await db
    .insert(schema.users)
    .values(
      faker.helpers.multiple(
        () => {
          const id = uuidv4();
          return {
            id: id,
            name: faker.person.fullName(),
            email: faker.internet.email(),
            createdById: id,
            updatedById: id,
            ...trackDates(),
          };
        },
        { count: 200 }
      )
    )
    .returning();
  const randomUser = () => faker.helpers.arrayElement(usersData);

  const internalUsersData = await db
    .insert(schema.users)
    .values(
      faker.helpers.multiple(
        () => {
          const firstName = faker.person.firstName();
          const lastName = faker.person.lastName();
          return {
            id: uuidv4(),
            name: faker.person.fullName({ firstName, lastName }),
            email: faker.internet.email({
              firstName,
              lastName,
              provider: "internal",
            }),
            createdById: seedUser.id,
            updatedById: seedUser.id,
            ...trackDates(),
          };
        },
        { count: 20 }
      )
    )
    .returning();
  const randomInternalUser = () =>
    faker.helpers.arrayElement(internalUsersData);

  const trackingFields = () => {
    if (!seedUsers[0]) throw new Error("Failed to create seed user");
    const dates = { ...trackDates() };
    return {
      createdById: randomUser().id,
      updatedById: dates.updatedAt ? randomInternalUser().id : null,
      ...dates,
    };
  };

  const makeTag = (t: string) => {
    return {
      name: t,
      ...trackingFields(),
    };
  };

  // create tags
  const tagsData = ["external", "internal", "critical", "alpha", "beta"].map(
    (t) => makeTag(t)
  );

  const tagResults = await db.insert(schema.tags).values(tagsData).returning();
  if (!tagResults[0]) throw new Error("Failed to create tags");

  // create companies
  const companiesData = await db
    .insert(schema.companies)
    .values(
      faker.helpers
        .multiple(() => faker.company.name(), { count: 100 })
        .map((n) => {
          return {
            name: n,
            ...trackingFields(),
          };
        })
    )
    .returning();

  const phoneResults = await db
    .insert(schema.phoneNumbers)
    .values(
      faker.helpers.multiple(
        () => {
          return {
            id: uuidv4(),
            number: faker.phone.number(),
            type: "home",
            ...trackingFields(),
          };
        },
        { count: 100 }
      )
    )
    .returning();

  const addressResults = await db
    .insert(schema.addresses)
    .values(
      faker.helpers.multiple(
        () => {
          return {
            id: uuidv4(),
            street: faker.location.streetAddress(),
            city: faker.location.city(),
            stateProvince: faker.location.state(),
            postalCode: faker.location.zipCode(),
            countryRegion: faker.location.country(),
            ...trackingFields(),
          };
        },
        { count: 200 }
      )
    )
    .returning();

  type InsertPerson = typeof schema.people.$inferInsert;

  function makePerson(): InsertPerson {
    const [homePhone, workPhone, mobilePhone] = faker.helpers.arrayElements(
      phoneResults.map((i) => i.id),
      {
        min: 2,
        max: 3,
      }
    );

    const [homeAddress, workAddress] = faker.helpers.arrayElements(
      addressResults.map((i) => i.id),
      {
        min: 1,
        max: 2,
      }
    );

    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const result = {
      firstName,
      lastName,
      email: faker.internet.email({ firstName, lastName }),
      workEmail: faker.helpers.maybe(() => faker.internet.email()),
      homePhone,
      workPhone,
      mobilePhone,
      homeAddress,
      workAddress,
      ...trackingFields(),
    };
    return result;
  }

  const peopleData = await db
    .insert(schema.people)
    .values(
      faker.helpers.multiple(makePerson, {
        count: 1000,
      })
    )
    .returning();

  // make some customers
  const customersData = await db
    .insert(schema.customers)
    .values(
      faker.helpers.multiple(
        () => {
          return {
            id: uuidv4(),
            name: faker.company.name(),
            ...trackingFields(),
          };
        },
        { count: 200 }
      )
    )
    .returning();

  // link each of the people to a random company
  await Promise.all(
    peopleData.map(async (p) => {
      const companyId = faker.helpers.arrayElement(companiesData).id;
      return await db
        .insert(schema.companyPeople)
        .values({
          companyId,
          peopleId: p.id,
          ...trackingFields(),
        })
        .returning();
    })
  );
  // and to a random customer
  peopleData.map(async (p) => {
    const customerId = faker.helpers.arrayElement(customersData).id;
    return await db
      .insert(schema.customerPeople)
      .values({
        customerId,
        peopleId: p.id,
        ...trackingFields(),
      })
      .returning();
  });

  // create product groups
  const productGroupsData = await db
    .insert(schema.productGroup)
    .values([
      {
        name: "main",
        ...trackingFields(),
      },
      {
        name: "main",
        ...trackingFields(),
      },
    ])
    .returning();

  // TODO create some products
  const products = await db
    .insert(schema.product)
    .values(
      faker.helpers.multiple(
        () => ({
          name: faker.commerce.product(),
          description: faker.commerce.productDescription(),
          productGroupId: faker.helpers.arrayElement(productGroupsData).id,
          ...trackingFields(),
        }),
        { count: 10 }
      )
    )
    .returning();

  // features
  const featuresData = await db
    .insert(schema.features)
    .values(
      faker.helpers.multiple(
        () => ({
          name: faker.commerce.product(),
          description: faker.commerce.productDescription(),
          productId: faker.helpers.arrayElement(products).id,
          ...trackingFields(),
        }),
        { count: 100 }
      )
    )
    .returning();

  const teamRolesData = await db
    .insert(schema.teamRoles)
    .values(
      [
        ["Product Manager", "PM"],
        ["Developer", "Dev"],
        ["Tester", "Test"],
        ["Project Manager", "PrjM"],
        ["Manager", "Mgmt"],
        ["UX Designer", "UX"],
        ["Technical Artist", "TA"],
      ].map((i) => ({
        name: i[0] ?? "",
        abbr: i[1] ?? "",
        ...trackingFields(),
      }))
    )
    .returning();

  // create some teams
  const teamsData = await db
    .insert(schema.teams)
    .values(
      faker.helpers.multiple(
        () => ({
          name: faker.commerce.department(),
          ...trackingFields(),
        }),
        { count: 10 }
      )
    )
    .returning();

  // each teams gets some random roles and some random users for those roles
  const teamsRolesData = await Promise.all(
    teamsData.map(async (t) => {
      const roles = faker.helpers.arrayElements(teamRolesData, {
        min: 3,
        max: 6,
      });
      roles.map(async (r) => {
        const user = faker.helpers.arrayElement(internalUsersData);
        const dateStart = faker.date.between({
          from: "2000-01-01",
          to: Date.now() - faker.number.int({ min: 5, max: 365 }),
        });
        const dateEnd = faker.helpers.maybe(
          () => faker.date.between({ from: dateStart, to: new Date() }),
          { probability: 0.1 }
        );
        return await db
          .insert(schema.teamMembers)
          .values({
            teamId: t.id,
            userId: user.id,
            roleId: r.id,
            dateStart,
            dateEnd,
            ...trackingFields(),
          })
          .returning();
      });
    })
  );

  await db.refreshMaterializedView(views.productManagersView);
  await db.refreshMaterializedView(views.teamsAndRoles);

  const developer = await db.query.users.findFirst({
    where: eq(schema.users.email, "simon@simonellistonball.com"),
  });

  // make simon's user admin on the tenant and the data source for seed data
  await db
    .insert(schema.userDataSourceRole)
    .values({
      userId: developer!.id,
      role: "admin",
      createdById: seedUser.id,
      createdAt: new Date(),
      dataSourceId: dataSourceId,
    })
    .returning();
  // and the tenant
  await db
    .insert(schema.userTenants)
    .values(
      tenants.map((t) => ({
        userId: developer!.id,
        tenantId: t.id,
        role: "admin" as const,
        createdById: seedUser.id,
        createdAt: new Date(),
      }))
    )
    .returning();
  return;
}

try {
  await main();
  process.exit(0); // Explicitly exit after completion
} catch (error) {
  console.error("Seeding failed:", error);
  process.exit(1);
}
