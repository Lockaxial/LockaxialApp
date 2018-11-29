import { LayoutNode } from './LayoutTreeCrawler';
export declare class LayoutTreeParser {
    constructor();
    parse(api: any): LayoutNode;
    _topTabs(api: any): LayoutNode;
    _sideMenu(api: any): LayoutNode;
    _sideMenuChildren(api: any): LayoutNode[];
    _bottomTabs(api: any): LayoutNode;
    _stack(api: any): LayoutNode;
    _component(api: any): LayoutNode;
    _externalComponent(api: any): LayoutNode;
    _splitView(api: any): LayoutNode;
}
