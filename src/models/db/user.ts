export interface User {
    chatId: number,
    userId: number
}

export async function initUser(chatId: number, userId: number): Promise<User> {
    return {chatId, userId};
}