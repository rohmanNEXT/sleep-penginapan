import prisma from './prisma';

async function check() {
  try {
    const users = await prisma.user.findMany();
    console.log('Users:', users.map((u: { id: string; email: string; role: string }) => ({ id: u.id, email: u.email, role: u.role })));
    const count = await prisma.penginapan.count();
    console.log('Penginapan count:', count);
    const allP = await prisma.penginapan.findMany({
      select: { id: true, title: true }
    });
    console.log('All Penginapan:', allP);
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}
check();
