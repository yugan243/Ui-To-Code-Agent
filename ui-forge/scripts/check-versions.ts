// Run with: npx ts-node scripts/check-versions.ts
import prisma from '../libs/prisma';

async function checkVersions() {
  const files = await prisma.uIFile.findMany({
    include: {
      versions: true,
      session: {
        include: {
          project: true
        }
      }
    }
  });

  console.log('\n📁 FILES AND VERSIONS SUMMARY:\n');
  
  for (const file of files) {
    console.log(`Project: ${file.session.project.name}`);
    console.log(`  File: ${file.name} (ID: ${file.id})`);
    console.log(`  Versions: ${file.versions.length}`);
    file.versions.forEach(v => {
      console.log(`    - v${v.versionNumber}: ${v.createdAt.toLocaleString()}`);
    });
    console.log('');
  }

  await prisma.$disconnect();
}

checkVersions().catch(console.error);
