import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const users = [
  { name: 'Aryaman', email: 'aryaman@climitra.com', role: 'Super Admin' },
  { name: 'Shrinivas', email: 'shrinivas@climitra.com', role: 'User' },
  { name: 'Sanat', email: 'sanat@climitra.com', role: 'User' },
  { name: 'Shubhankar', email: 'shubhankar@climitra.com', role: 'Super Admin' },
  { name: 'Shaurya', email: 'shaurya@climitra.com', role: 'Super Admin' },
  { name: 'Deepam', email: 'deepam@climitra.com', role: 'User' },
  { name: 'Sankalp', email: 'sankalp@climitra.com', role: 'User' },
  { name: 'Nandini', email: 'nandini@climitra.com', role: 'User' },
  { name: 'Aman', email: 'aman@climitra.com', role: 'User' },
  { name: 'Khyati', email: 'khyati@climitra.com', role: 'User' },
  { name: 'Sanskriti', email: 'sanskriti@climitra.com', role: 'User' },
  { name: 'Swasti', email: 'swasti@climitra.com', role: 'Super Admin' },
  { name: 'Admin', email: 'admin@climitra.com', role: 'Super Admin' },
]

async function main() {
  console.log('Start seeding...')
  
  for (const user of users) {
    const createdUser = await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: user,
    })
    console.log(`Created user: ${createdUser.name}`)
  }
  
  console.log('Seeding finished.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
