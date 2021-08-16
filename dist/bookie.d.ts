interface Source {
    title: string;
    author: {
        family: string;
        given: string;
        droppingParticle: string;
        literal: string;
    }[];
    issued: {
        dateParts: (string | number)[][];
    };
    url: string;
    tags: {
        tag: string;
        type: string | null;
    }[];
}
declare class Book {
    private source;
    private typelessTags;
    private authorList;
    constructor(source: Source);
    get title(): string;
    get issued(): string;
    get tags(): string[];
    get authors(): string[];
    get url(): string;
}
export declare class Bookie {
    sources: Book[] | null;
    tagElement: HTMLElement | null;
    resultsElement: HTMLElement | null;
    init(elementId: string, filepath: string): void;
    private show;
    private appendTags;
    private appendIssued;
    private appendTitle;
    private appendAuthors;
    private request;
}
export {};
