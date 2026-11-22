import { access } from "fs/promises";
import { Entity, Column, BaseEntity, PrimaryGeneratedColumn } from "typeorm"

export enum FileType {
    PHOTO,
    VIDEO,
    DOCUMENT,
};

@Entity()
export class FileEntity extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    type: FileType;

    @Column({ nullable: true })
    path?: string;

    @Column({ nullable: true })
    fileId?: string;

    @Column({ nullable: true })
    alias?: string;

    @Column({ nullable: true })
    mediaGroupId?: string;

    static async getByPath(path: string): Promise<string> {
        let file: FileEntity | null = await FileEntity.findOneBy({path: path});
        if (!file) {
            await access(path);
            file = new FileEntity();
            file.path = path;
            await file.save();
        }
        return file.fileId ?? file.path!;
    }

    static async saveFileId(path: string, fileId: string): Promise<void> {
        let file: FileEntity | null = await FileEntity.findOneBy({path: path});
        if (!file) {
            throw Error(`No such file as ${path} for fileId ${fileId}`);
        }
        file.fileId = fileId;
        await file.save();
    }
}
