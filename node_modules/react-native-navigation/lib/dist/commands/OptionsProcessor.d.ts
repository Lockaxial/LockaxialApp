export declare class OptionsProcessor {
    store: any;
    uniqueIdProvider: any;
    constructor(store: any, uniqueIdProvider: any);
    processOptions(options: any): void;
    private processColor;
    private processImage;
    private processButtonsPassProps;
    private processComponent;
}
