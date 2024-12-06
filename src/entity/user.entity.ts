import { Entity, Column, PrimaryColumn, CreateDateColumn, BaseEntity } from "typeorm"

@Entity()
export class UserEntity extends BaseEntity {

    @PrimaryColumn()
    id: string

    @Column({nullable: true})
    username?: string

    @Column()
    lastMessageAt: Date

    @CreateDateColumn()
    createdAt: Date

    public static async updateOnMessage(id: string, username?: string) {
        let user = await UserEntity.findOneBy({id});
        if (!user) {
            user = new UserEntity();
            user.id = id;
        }
        user.username = username;
        user.lastMessageAt = new Date();
        user.save();
    }
}
