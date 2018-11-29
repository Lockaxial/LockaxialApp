import * as React from 'react';
import { ComponentProvider } from 'react-native';
import { Store } from './Store';
import { ComponentEventsObserver } from '../events/ComponentEventsObserver';
export declare class ComponentWrapper {
    static wrap(componentName: string, OriginalComponentGenerator: ComponentProvider, store: Store, componentEventsObserver: ComponentEventsObserver, ReduxProvider?: any, reduxStore?: any): React.ComponentClass<any>;
    static wrapWithRedux(WrappedComponent: React.ComponentClass<any>, ReduxProvider: any, reduxStore: any): React.ComponentClass<any>;
}
