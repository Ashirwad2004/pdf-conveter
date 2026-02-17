declare module 'libreoffice-convert' {
    export const convert: (
        document: Buffer,
        format: string,
        filter: undefined,
        callback: (err: Error | null, result: Buffer) => void
    ) => void;
}
