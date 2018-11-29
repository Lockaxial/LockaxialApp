"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const OptionsProcessor_1 = require("./OptionsProcessor");
const LayoutType_1 = require("./LayoutType");
class LayoutTreeCrawler {
    constructor(uniqueIdProvider, store) {
        this.uniqueIdProvider = uniqueIdProvider;
        this.store = store;
        this.crawl = this.crawl.bind(this);
        this.processOptions = this.processOptions.bind(this);
        this.optionsProcessor = new OptionsProcessor_1.OptionsProcessor(store, uniqueIdProvider);
    }
    crawl(node) {
        this._assertKnownLayoutType(node.type);
        node.id = node.id || this.uniqueIdProvider.generate(node.type);
        node.data = node.data || {};
        node.children = node.children || [];
        if (node.type === LayoutType_1.LayoutType.Component) {
            this._handleComponent(node);
        }
        this.processOptions(node.data.options);
        _.forEach(node.children, this.crawl);
    }
    processOptions(options) {
        this.optionsProcessor.processOptions(options);
    }
    _handleComponent(node) {
        this._assertComponentDataName(node);
        this._savePropsToStore(node);
        this._applyStaticOptions(node);
        node.data.passProps = undefined;
    }
    _savePropsToStore(node) {
        this.store.setPropsForId(node.id, node.data.passProps);
    }
    _applyStaticOptions(node) {
        const clazz = this.store.getComponentClassForName(node.data.name) ? this.store.getComponentClassForName(node.data.name)() : {};
        const staticOptions = _.isFunction(clazz.options) ? clazz.options(node.data.passProps || {}) : (_.cloneDeep(clazz.options) || {});
        const passedOptions = node.data.options || {};
        node.data.options = _.merge({}, staticOptions, passedOptions);
    }
    _assertKnownLayoutType(type) {
        if (!LayoutType_1.LayoutType[type]) {
            throw new Error(`Unknown layout type ${type}`);
        }
    }
    _assertComponentDataName(component) {
        if (!component.data.name) {
            throw new Error('Missing component data.name');
        }
    }
}
exports.LayoutTreeCrawler = LayoutTreeCrawler;
