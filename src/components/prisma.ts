import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient()

export default prisma;

export async function initUser(userId: string) {
    let user = await prisma.user.findFirst({
        where: {
            userId: userId
        }
    });
    if (!user) {
        await prisma.user.create({
            data: {
                userId: userId,
            }
        });
    }
}