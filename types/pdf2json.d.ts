declare module 'pdf2json' {
    export default class PDFParser extends require('events').EventEmitter {
        constructor(context: any, shouldParseRelativeUrl: boolean);
        parseBuffer(buffer: Buffer): void;
        getRawTextContent(): string;
        on(event: string, callback: (data: any) => void): this;
    }
}
