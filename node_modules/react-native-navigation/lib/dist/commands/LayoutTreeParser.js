"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const LayoutType_1 = require("./LayoutType");
class LayoutTreeParser {
    constructor() {
        this.parse = this.parse.bind(this);
    }
    parse(api) {
        if (api.topTabs) {
            return this._topTabs(api.topTabs);
        }
        else if (api.sideMenu) {
            return this._sideMenu(api.sideMenu);
        }
        else if (api.bottomTabs) {
            return this._bottomTabs(api.bottomTabs);
        }
        else if (api.stack) {
            return this._stack(api.stack);
        }
        else if (api.component) {
            return this._component(api.component);
        }
        else if (api.externalComponent) {
            return this._externalComponent(api.externalComponent);
        }
        else if (api.splitView) {
            return this._splitView(api.splitView);
        }
        throw new Error(`unknown LayoutType "${_.keys(api)}"`);
    }
    _topTabs(api) {
        return {
            id: api.id,
            type: LayoutType_1.LayoutType.TopTabs,
            data: { options: api.options },
            children: _.map(api.children, this.parse)
        };
    }
    _sideMenu(api) {
        return {
            id: api.id,
            type: LayoutType_1.LayoutType.SideMenuRoot,
            data: { options: api.options },
            children: this._sideMenuChildren(api)
        };
    }
    _sideMenuChildren(api) {
        if (!api.center) {
            throw new Error(`sideMenu.center is required`);
        }
        const children = [];
        if (api.left) {
            children.push({
                id: api.left.id,
                type: LayoutType_1.LayoutType.SideMenuLeft,
                data: {},
                children: [this.parse(api.left)]
            });
        }
        children.push({
            id: api.center.id,
            type: LayoutType_1.LayoutType.SideMenuCenter,
            data: {},
            children: [this.parse(api.center)]
        });
        if (api.right) {
            children.push({
                id: api.right.id,
                type: LayoutType_1.LayoutType.SideMenuRight,
                data: {},
                children: [this.parse(api.right)]
            });
        }
        return children;
    }
    _bottomTabs(api) {
        return {
            id: api.id,
            type: LayoutType_1.LayoutType.BottomTabs,
            data: { options: api.options },
            children: _.map(api.children, this.parse)
        };
    }
    _stack(api) {
        return {
            id: api.id,
            type: LayoutType_1.LayoutType.Stack,
            data: { name: api.name, options: api.options },
            children: _.map(api.children, this.parse)
        };
    }
    _component(api) {
        return {
            id: api.id,
            type: LayoutType_1.LayoutType.Component,
            data: { name: api.name, options: api.options, passProps: api.passProps },
            children: []
        };
    }
    _externalComponent(api) {
        return {
            id: api.id,
            type: LayoutType_1.LayoutType.ExternalComponent,
            data: { name: api.name, options: api.options, passProps: api.passProps },
            children: []
        };
    }
    _splitView(api) {
        const master = this.parse(api.master);
        const detail = this.parse(api.detail);
        return {
            id: api.id,
            type: LayoutType_1.LayoutType.SplitView,
            data: { name: api.name, options: api.options },
            children: [
                master,
                detail,
            ],
        };
    }
}
exports.LayoutTreeParser = LayoutTreeParser;
