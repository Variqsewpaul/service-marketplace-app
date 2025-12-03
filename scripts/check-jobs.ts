import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Checking JobPosts...');
    const jobs = await prisma.jobPost.findMany({
        where: {
            OR: [
                { location: { contains: 'newcastle' } },
                { city: { contains: 'newcastle' } },
                { district: { contains: 'newcastle' } },
            ]
        },
        select: {
            id: true,
            title: true,
            category: true,
            status: true,
            location: true,
            city: true,
            district: true,
            street: true,
            postcode: true,
        }
    });

    console.log(`Found ${jobs.length} jobs matching "newcastle":`);
    jobs.forEach(job => {
        console.log(JSON.stringify(job, null, 2));
    });
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
