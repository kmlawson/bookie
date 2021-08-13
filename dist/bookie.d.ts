interface Source {
    title: string;
    author: {
        family: string;
        given: string;
        droppingParticle: string;
    }[];
    issued: {
        dateParts: (string | number)[][];
    };
    URL: string;
    tags: {
        tag: string;
        type: string | null;
    }[];
}
export declare class Bookie {
    sources: Source[] | null;
    tagElement: HTMLElement | null;
    resultsElement: HTMLElement | null;
    init(elementId: string, filepath: string): Promise<void>;
    private show;
    private request;
}
export {};
