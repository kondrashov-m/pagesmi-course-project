import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const templates = [
  {
    name: 'Лендинг',
    category: 'marketing',
    description: 'Hero · Features · Pricing · CTA',
    colors: ['#3B82F6', '#6366F1'],
    isBuiltIn: true,
  },
  {
    name: 'Портфолио',
    category: 'personal',
    description: 'Работы · Обо мне · Навыки',
    colors: ['#10B981', '#059669'],
    isBuiltIn: true,
  },
  {
    name: 'Бизнес',
    category: 'business',
    description: 'Услуги · Команда · CTA',
    colors: ['#475569', '#1e3a5f'],
    isBuiltIn: true,
  },
  {
    name: 'SaaS Продукт',
    category: 'saas',
    description: 'Features · Pricing · CTA',
    colors: ['#8B5CF6', '#6366F1'],
    isBuiltIn: true,
  },
  {
    name: 'Ресторан / Кафе',
    category: 'restaurant',
    description: 'Меню · История · Бронирование',
    colors: ['#F59E0B', '#D97706'],
    isBuiltIn: true,
  },
]

async function main() {
  console.log('Seeding templates...')
  for (const t of templates) {
    await (prisma as any).template.upsert({
      where: { id: t.name },
      update: t,
      create: t,
    })
  }
  // Use createMany with skipDuplicates for simpler seeding
  await (prisma as any).template.deleteMany({ where: { isBuiltIn: true } })
  await (prisma as any).template.createMany({ data: templates })
  console.log(`Created ${templates.length} templates`)
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
