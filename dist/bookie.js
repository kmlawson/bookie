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
var bookie;
(function (bookie) {
    var sources;
    var tagElement;
    var resultsElement;
    function init(elementId, filepath) {
        return __awaiter(this, void 0, void 0, function* () {
            const elem = document.getElementById(elementId);
            let test;
            if (elem === null) {
                return;
            }
            sources = yield request(filepath);
            elem.innerHTML = '';
            elem.className = 'dsf';
            tagElement = document.createElement('div');
            tagElement.className = 'bookie__tags';
            elem.appendChild(tagElement);
            resultsElement = document.createElement('div');
            resultsElement.className = 'bookie__result';
            elem.appendChild(resultsElement);
            let tagSet = new Set();
            sources.forEach((source) => {
                if (source.tags != null) {
                    source.tags.forEach((tag) => tagSet.add(tag));
                }
            });
            tagSet.forEach((tag) => {
                let button = document.createElement('button');
                button.textContent = tag;
                button.className = 'bookie__tag';
                button.onclick = (ev) => {
                    show(tag);
                };
                tagElement.appendChild(button);
            });
        });
    }
    bookie.init = init;
    function show(tag) {
        resultsElement.innerHTML = '';
        const list = document.createElement('ul');
        list.className = 'bookie__result__list';
        resultsElement.appendChild(list);
        const taggedSources = sources.filter((source) => { var _a; return ((_a = source.tags) === null || _a === void 0 ? void 0 : _a.indexOf(tag)) != -1; });
        taggedSources.forEach((source) => {
            let item = document.createElement('li');
            item.textContent = source.title;
            item.className = 'bookie__result__item';
            list.appendChild(item);
        });
    }
    function request(url, 
    // `RequestInit` is a type for configuring
    // a `fetch` request. By default, an empty object.
    config = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            return fetch(url, config)
                .then((response) => response.json())
                .then((data) => data);
        });
    }
})(bookie || (bookie = {}));
//# sourceMappingURL=bookie.js.map