import { LayoutType } from './LayoutType';
export interface Data {
    name?: string;
    options?: any;
    passProps?: any;
}
export interface LayoutNode {
    id?: string;
    type: LayoutType;
    data: Data;
    children: LayoutNode[];
}
export declare class LayoutTreeCrawler {
    private readonly uniqueIdProvider;
    readonly store: any;
    private optionsProcessor;
    constructor(uniqueIdProvider: any, store: any);
    crawl(node: LayoutNode): void;
    processOptions(options: any): void;
    _handleComponent(node: any): void;
    _savePropsToStore(node: any): void;
    _applyStaticOptions(node: any): void;
    _assertKnownLayoutType(type: any): void;
    _assertComponentDataName(component: any): void;
}
