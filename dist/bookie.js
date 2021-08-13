"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
/* eslint-disable-next-line @typescript-eslint/no-unused-vars */ //  Class is only used externally
class Bookie {
    constructor() {
        this.sources = null;
        this.tagElement = null;
        this.resultsElement = null;
    }
    init(elementId, filepath) {
        return __awaiter(this, void 0, void 0, function* () {
            const elem = document.getElementById(elementId);
            if (elem === null) {
                return;
            }
            this.sources = yield this.request(filepath);
            elem.innerHTML = '';
            elem.className = 'dsf';
            this.tagElement = document.createElement('div');
            this.tagElement.className = 'bookie__tags';
            elem.appendChild(this.tagElement);
            this.resultsElement = document.createElement('div');
            this.resultsElement.className = 'bookie__result';
            elem.appendChild(this.resultsElement);
            const tagSet = new Set();
            this.sources.forEach((source) => {
                if (source.tags != null) {
                    source.tags.forEach((tag) => tagSet.add(tag));
                }
            });
            tagSet.forEach((tag) => {
                if (this.tagElement === null)
                    return;
                const button = document.createElement('button');
                button.textContent = tag;
                button.className = 'bookie__tag';
                button.onclick = () => {
                    this.show(tag);
                };
                this.tagElement.appendChild(button);
            });
        });
    }
    show(tag) {
        if (this.resultsElement === null)
            return;
        if (this.sources === null)
            return;
        this.resultsElement.innerHTML = '';
        const list = document.createElement('ul');
        list.className = 'bookie__result__list';
        this.resultsElement.appendChild(list);
        const taggedSources = this.sources.filter((source) => { var _a; return ((_a = source.tags) === null || _a === void 0 ? void 0 : _a.indexOf(tag)) != -1; });
        taggedSources.forEach((source) => {
            const item = document.createElement('li');
            item.textContent = source.title;
            item.className = 'bookie__result__item';
            list.appendChild(item);
        });
    }
    request(url, 
    // `RequestInit` is a type for configuring
    // a `fetch` request. By default, an empty object.
    config = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            return fetch(url, config)
                .then((response) => response.json())
                .then((data) => data);
        });
    }
}
//# sourceMappingURL=bookie.js.map