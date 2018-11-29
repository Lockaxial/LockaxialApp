"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const react_native_1 = require("react-native");
const resolveAssetSource = require("react-native/Libraries/Image/resolveAssetSource");
class OptionsProcessor {
    constructor(store, uniqueIdProvider) {
        this.store = store;
        this.uniqueIdProvider = uniqueIdProvider;
    }
    processOptions(options) {
        _.forEach(options, (value, key) => {
            if (!value) {
                return;
            }
            this.processComponent(key, value, options);
            this.processColor(key, value, options);
            this.processImage(key, value, options);
            this.processButtonsPassProps(key, value);
            if (!_.isEqual(key, 'passProps') && (_.isObject(value) || _.isArray(value))) {
                this.processOptions(value);
            }
        });
    }
    processColor(key, value, options) {
        if (_.isEqual(key, 'color') || _.endsWith(key, 'Color')) {
            options[key] = react_native_1.processColor(value);
        }
    }
    processImage(key, value, options) {
        if (_.isEqual(key, 'icon') || _.isEqual(key, 'image') || _.endsWith(key, 'Icon') || _.endsWith(key, 'Image')) {
            options[key] = resolveAssetSource(value);
        }
    }
    processButtonsPassProps(key, value) {
        if (_.endsWith(key, 'Buttons')) {
            _.forEach(value, (button) => {
                if (button.passProps && button.id) {
                    this.store.setPropsForId(button.id, button.passProps);
                    button.passProps = undefined;
                }
            });
        }
    }
    processComponent(key, value, options) {
        if (_.isEqual(key, 'component')) {
            value.componentId = value.id ? value.id : this.uniqueIdProvider.generate('CustomComponent');
            if (value.passProps) {
                this.store.setPropsForId(value.componentId, value.passProps);
            }
            options[key] = _.omit(value, 'passProps');
        }
    }
}
exports.OptionsProcessor = OptionsProcessor;
