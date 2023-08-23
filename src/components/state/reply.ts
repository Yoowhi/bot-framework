export interface Reply {
    text?: string;
    buttons?: ButtonColumn[]
}

export type ButtonColumn = Button[];

export interface Button {
    text: string,
    callback_data: string
}