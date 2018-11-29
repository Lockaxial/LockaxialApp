"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class UniqueIdProvider {
    generate(prefix) {
        return `${prefix}+UNIQUE_ID`;
    }
}
exports.UniqueIdProvider = UniqueIdProvider;
