import { User } from "@prisma/client";
import prisma from "../../components/prisma";

export async function initUser(userId: string): Promise<User> {
    let user = await prisma.user.findFirst({
        where: {
            userId
        }
    });
    if (!user) {
        user = await prisma.user.create({
            data: {
                userId,

            }
        });
    }
    return user;
}