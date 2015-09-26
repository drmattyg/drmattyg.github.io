/// <reference path="../typings/node/node.d.ts" />
export declare class NEREntity {
    name: string;
    isLocation: boolean;
}
export declare class NERClient {
    port: number;
    host: string;
    callback: (entities: Array<NEREntity>) => void;
    reEntString: RegExp;
    constructor(port: number, host: string);
    processResults(result: string): Array<NEREntity>;
    query(text: string, callback: (entities: Array<NEREntity>) => void): void;
    endsWith(input: string, suffix: string): boolean;
}
