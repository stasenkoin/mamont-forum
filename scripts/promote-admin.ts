import 'dotenv/config';
import supertokens from 'supertokens-node';
import EmailPassword from 'supertokens-node/recipe/emailpassword';
import Session from 'supertokens-node/recipe/session';
import UserRoles from 'supertokens-node/recipe/userroles';
import { PrismaClient } from '@prisma/client';

async function main() {
  const nickname = process.argv[2];
  if (!nickname) {
    console.error('Usage: ts-node scripts/promote-admin.ts <nickname>');
    process.exit(1);
  }

  supertokens.init({
    framework: 'express',
    supertokens: {
      connectionURI: process.env.SUPERTOKENS_CONNECTION_URI,
      apiKey: process.env.SUPERTOKENS_API_KEY,
    },
    appInfo: {
      appName: 'Mamont Forum',
      apiDomain: process.env.APP_URL || 'http://localhost:3000',
      websiteDomain: process.env.APP_URL || 'http://localhost:3000',
      apiBasePath: '/auth',
      websiteBasePath: '/login',
    },
    recipeList: [EmailPassword.init(), UserRoles.init(), Session.init()],
  });

  const prisma = new PrismaClient();
  const user = await prisma.user.findUnique({ where: { nickname } });
  if (!user) {
    console.error(`User "${nickname}" not found`);
    process.exit(1);
  }

  await UserRoles.addRoleToUser('public', user.supertokensId, 'ADMIN');
  await prisma.user.update({
    where: { id: user.id },
    data: { role: 'ADMIN' },
  });
  console.log(`✅ ${nickname} (${user.supertokensId}) is now ADMIN`);
  await prisma.$disconnect();
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
