export declare class NativeCommandsSender {
    private readonly nativeCommandsModule;
    constructor();
    setRoot(commandId: string, layout: {
        root: any;
        modals: any[];
        overlays: any[];
    }): any;
    setDefaultOptions(options: object): any;
    mergeOptions(componentId: string, options: object): any;
    push(commandId: string, onComponentId: string, layout: object): any;
    pop(commandId: string, componentId: string, options?: object): any;
    popTo(commandId: string, componentId: string, options?: object): any;
    popToRoot(commandId: string, componentId: string, options?: object): any;
    setStackRoot(commandId: string, onComponentId: string, layout: object): any;
    showModal(commandId: string, layout: object): any;
    dismissModal(commandId: string, componentId: string, options?: object): any;
    dismissAllModals(commandId: string, options?: object): any;
    showOverlay(commandId: string, layout: object): any;
    dismissOverlay(commandId: string, componentId: string): any;
    getLaunchArgs(commandId: string): any;
}
