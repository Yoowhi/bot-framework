import { Entity, Column, PrimaryColumn, CreateDateColumn, BaseEntity } from "typeorm"

@Entity()
export class ChatEntity extends BaseEntity {

    @PrimaryColumn()
    id: string

    @Column()
    lastMessageAt: Date

    @CreateDateColumn()
    createdAt: Date

    public static async updateOnMessage(id: string) {
        let chat = await ChatEntity.findOneBy({id});
        if (!chat) {
            chat = new ChatEntity();
            chat.id = id;
        }
        chat.lastMessageAt = new Date();
        chat.save();
    }
}
