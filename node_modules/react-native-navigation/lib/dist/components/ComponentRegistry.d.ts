import { ComponentProvider } from 'react-native';
import { ComponentWrapper } from './ComponentWrapper';
import { Store } from './Store';
import { ComponentEventsObserver } from '../events/ComponentEventsObserver';
export declare class ComponentRegistry {
    private readonly store;
    private readonly componentEventsObserver;
    private readonly ComponentWrapperClass;
    constructor(store: Store, componentEventsObserver: ComponentEventsObserver, ComponentWrapperClass: typeof ComponentWrapper);
    registerComponent(componentName: string, getComponentClassFunc: ComponentProvider, ReduxProvider?: any, reduxStore?: any): ComponentProvider;
}
