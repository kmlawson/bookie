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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const camelcase_keys_1 = __importDefault(require("camelcase-keys"));
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
                    console.log(source.tags);
                    source.tags.forEach((tag) => {
                        if (tag.type === undefined) {
                            tagSet.add(tag.tag);
                        }
                        console.log(tagSet);
                    });
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
        const taggedSources = this.sources.filter((source) => {
            var _a;
            return ((_a = source.tags) === null || _a === void 0 ? void 0 : _a.find((t) => t.type === undefined && t.tag === tag)) !==
                undefined;
        });
        taggedSources.forEach((source) => {
            const item = document.createElement('li');
            console.log(source.author);
            if (source.author) {
                const authorData = source.author.find((a) => a.family);
                console.log(authorData);
                if (authorData) {
                    const author = document.createElement('span');
                    author.textContent =
                        authorData.droppingParticle +
                            ' ' +
                            authorData.family +
                            (authorData.given ? ', ' + authorData.given : '') +
                            '. ';
                    item.appendChild(author);
                }
            }
            const title = document.createElement('span');
            const titleLink = document.createElement('a');
            titleLink.href = source.URL;
            titleLink.innerText = source.title;
            title.appendChild(titleLink);
            item.appendChild(title);
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
                .then((json) => camelcase_keys_1.default(json))
                .then((data) => data);
        });
    }
}
//# sourceMappingURL=bookie.js.map