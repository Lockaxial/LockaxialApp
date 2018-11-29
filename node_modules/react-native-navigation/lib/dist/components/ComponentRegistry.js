"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const react_native_1 = require("react-native");
class ComponentRegistry {
    constructor(store, componentEventsObserver, ComponentWrapperClass) {
        this.store = store;
        this.componentEventsObserver = componentEventsObserver;
        this.ComponentWrapperClass = ComponentWrapperClass;
    }
    registerComponent(componentName, getComponentClassFunc, ReduxProvider, reduxStore) {
        const NavigationComponent = () => {
            return this.ComponentWrapperClass.wrap(componentName, getComponentClassFunc, this.store, this.componentEventsObserver, ReduxProvider, reduxStore);
        };
        this.store.setComponentClassForName(componentName, NavigationComponent);
        react_native_1.AppRegistry.registerComponent(componentName, NavigationComponent);
        return NavigationComponent;
    }
}
exports.ComponentRegistry = ComponentRegistry;
