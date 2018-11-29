"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
class CommandsObserver {
    constructor() {
        this.listeners = {};
    }
    register(listener) {
        const id = _.uniqueId();
        _.set(this.listeners, id, listener);
        return {
            remove: () => _.unset(this.listeners, id)
        };
    }
    notify(commandName, params) {
        _.forEach(this.listeners, (listener) => listener(commandName, params));
    }
}
exports.CommandsObserver = CommandsObserver;
