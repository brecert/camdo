export interface ICamdoFormat {
    name?: string;
    title?: string;
    description?: string;
    image?: string;
    color?: number;
    format?: "default" | "large_image";
}
export interface ICamdoCommandParams {
    id: string;
    name?: string;
    description?: string;
    args: ICamdoArgumentParams[];
    run(args: any): ICamdoFormat | Promise<ICamdoFormat>;
}
export interface ICamdoCommand {
    id: string;
    name: string;
    description: string;
    args: ICamdoArgument[];
    run(args: any): ICamdoFormat | Promise<ICamdoFormat>;
}
export interface ICamdoArgumentParams {
    id: string;
    name?: string;
    description?: string;
    type?: string;
    default_value?: any;
    capture?: boolean;
    fail_message?: string;
    required?: boolean;
}
export interface ICamdoArgument {
    id: string;
    name: string;
    description: string;
    type: string;
    default_value?: any;
    capture: boolean;
    fail_message?: string;
    required: boolean;
}
export interface ICamdoHandler {
    id: string;
    event: (resolve: (args: string[], ...passedData: any[]) => void | any, cmd: ICamdoCommand) => void | any;
    send: (data: ICamdoFormat, ...passedData: any[]) => void | any;
}
export interface ICamdoType {
    id: string;
    display: string;
    validate: (arg: string) => boolean;
}
export interface ICamdoTypeParams {
    id: string;
    display?: string;
    validate?: (arg: string) => boolean;
}
export default class CommandClient {
    commands: Map<string, ICamdoCommand>;
    types: Map<string, ICamdoType>;
    handlers: Map<string, ICamdoHandler>;
    constructor();
    defineType(opts: ICamdoTypeParams): void;
    defineArg(arg: ICamdoArgumentParams): ICamdoArgument;
    defineCommand(cmd: ICamdoCommandParams): void;
    validateArgs(args: string[], cmd: ICamdoCommand, handler: ICamdoHandler): boolean;
    addHandler(params: ICamdoHandler): Promise<void>;
    failedMessage(cmdArg: ICamdoArgument, failedArg: string): {
        name: string;
        title: string;
        description: string;
        color: number;
    };
}
