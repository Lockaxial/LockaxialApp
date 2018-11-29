"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const _ = require("lodash");
const ReactLifecyclesCompat = require("react-lifecycles-compat");
class ComponentWrapper {
    static wrap(componentName, OriginalComponentGenerator, store, componentEventsObserver, ReduxProvider, reduxStore) {
        const GeneratedComponentClass = OriginalComponentGenerator();
        class WrappedComponent extends React.Component {
            static getDerivedStateFromProps(nextProps, prevState) {
                return {
                    allProps: _.merge({}, nextProps, store.getPropsForId(prevState.componentId))
                };
            }
            constructor(props) {
                super(props);
                this._assertComponentId();
                this.state = {
                    componentId: props.componentId,
                    allProps: {}
                };
            }
            componentWillUnmount() {
                store.cleanId(this.state.componentId);
                componentEventsObserver.unmounted(this.state.componentId);
            }
            render() {
                return (<GeneratedComponentClass {...this.state.allProps} componentId={this.state.componentId} key={this.state.componentId}/>);
            }
            _assertComponentId() {
                if (!this.props.componentId) {
                    throw new Error(`Component ${componentName} does not have a componentId!`);
                }
            }
        }
        ReactLifecyclesCompat.polyfill(WrappedComponent);
        require('hoist-non-react-statics')(WrappedComponent, GeneratedComponentClass);
        if (reduxStore && ReduxProvider) {
            return ComponentWrapper.wrapWithRedux(WrappedComponent, ReduxProvider, reduxStore);
        }
        else {
            return WrappedComponent;
        }
    }
    static wrapWithRedux(WrappedComponent, ReduxProvider, reduxStore) {
        class ReduxWrapper extends React.Component {
            render() {
                return (<ReduxProvider store={reduxStore}>
            <WrappedComponent {...this.props}/>
          </ReduxProvider>);
            }
        }
        require('hoist-non-react-statics')(ReduxWrapper, WrappedComponent);
        return ReduxWrapper;
    }
}
exports.ComponentWrapper = ComponentWrapper;
