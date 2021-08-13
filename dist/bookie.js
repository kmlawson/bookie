/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/camelcase-keys/index.js":
/*!**********************************************!*\
  !*** ./node_modules/camelcase-keys/index.js ***!
  \**********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {


const mapObj = __webpack_require__(/*! map-obj */ "./node_modules/map-obj/index.js");
const camelCase = __webpack_require__(/*! camelcase */ "./node_modules/camelcase/index.js");
const QuickLru = __webpack_require__(/*! quick-lru */ "./node_modules/quick-lru/index.js");

const has = (array, key) => array.some(x => {
	if (typeof x === 'string') {
		return x === key;
	}

	x.lastIndex = 0;
	return x.test(key);
});

const cache = new QuickLru({maxSize: 100000});

// Reproduces behavior from `map-obj`
const isObject = value =>
	typeof value === 'object' &&
	value !== null &&
	!(value instanceof RegExp) &&
	!(value instanceof Error) &&
	!(value instanceof Date);

const camelCaseConvert = (input, options) => {
	if (!isObject(input)) {
		return input;
	}

	options = {
		deep: false,
		pascalCase: false,
		...options
	};

	const {exclude, pascalCase, stopPaths, deep} = options;

	const stopPathsSet = new Set(stopPaths);

	const makeMapper = parentPath => (key, value) => {
		if (deep && isObject(value)) {
			const path = parentPath === undefined ? key : `${parentPath}.${key}`;

			if (!stopPathsSet.has(path)) {
				value = mapObj(value, makeMapper(path));
			}
		}

		if (!(exclude && has(exclude, key))) {
			const cacheKey = pascalCase ? `${key}_` : key;

			if (cache.has(cacheKey)) {
				key = cache.get(cacheKey);
			} else {
				const returnValue = camelCase(key, {pascalCase});

				if (key.length < 100) { // Prevent abuse
					cache.set(cacheKey, returnValue);
				}

				key = returnValue;
			}
		}

		return [key, value];
	};

	return mapObj(input, makeMapper(undefined));
};

module.exports = (input, options) => {
	if (Array.isArray(input)) {
		return Object.keys(input).map(key => camelCaseConvert(input[key], options));
	}

	return camelCaseConvert(input, options);
};


/***/ }),

/***/ "./node_modules/camelcase/index.js":
/*!*****************************************!*\
  !*** ./node_modules/camelcase/index.js ***!
  \*****************************************/
/***/ ((module) => {



const preserveCamelCase = (string, locale) => {
	let isLastCharLower = false;
	let isLastCharUpper = false;
	let isLastLastCharUpper = false;

	for (let i = 0; i < string.length; i++) {
		const character = string[i];

		if (isLastCharLower && /[\p{Lu}]/u.test(character)) {
			string = string.slice(0, i) + '-' + string.slice(i);
			isLastCharLower = false;
			isLastLastCharUpper = isLastCharUpper;
			isLastCharUpper = true;
			i++;
		} else if (isLastCharUpper && isLastLastCharUpper && /[\p{Ll}]/u.test(character)) {
			string = string.slice(0, i - 1) + '-' + string.slice(i - 1);
			isLastLastCharUpper = isLastCharUpper;
			isLastCharUpper = false;
			isLastCharLower = true;
		} else {
			isLastCharLower = character.toLocaleLowerCase(locale) === character && character.toLocaleUpperCase(locale) !== character;
			isLastLastCharUpper = isLastCharUpper;
			isLastCharUpper = character.toLocaleUpperCase(locale) === character && character.toLocaleLowerCase(locale) !== character;
		}
	}

	return string;
};

const preserveConsecutiveUppercase = input => {
	return input.replace(/^[\p{Lu}](?![\p{Lu}])/gu, m1 => m1.toLowerCase());
};

const postProcess = (input, options) => {
	return input.replace(/[_.\- ]+([\p{Alpha}\p{N}_]|$)/gu, (_, p1) => p1.toLocaleUpperCase(options.locale))
		.replace(/\d+([\p{Alpha}\p{N}_]|$)/gu, m => m.toLocaleUpperCase(options.locale));
};

const camelCase = (input, options) => {
	if (!(typeof input === 'string' || Array.isArray(input))) {
		throw new TypeError('Expected the input to be `string | string[]`');
	}

	options = {
		pascalCase: false,
		preserveConsecutiveUppercase: false,
		...options
	};

	if (Array.isArray(input)) {
		input = input.map(x => x.trim())
			.filter(x => x.length)
			.join('-');
	} else {
		input = input.trim();
	}

	if (input.length === 0) {
		return '';
	}

	if (input.length === 1) {
		return options.pascalCase ? input.toLocaleUpperCase(options.locale) : input.toLocaleLowerCase(options.locale);
	}

	const hasUpperCase = input !== input.toLocaleLowerCase(options.locale);

	if (hasUpperCase) {
		input = preserveCamelCase(input, options.locale);
	}

	input = input.replace(/^[_.\- ]+/, '');

	if (options.preserveConsecutiveUppercase) {
		input = preserveConsecutiveUppercase(input);
	} else {
		input = input.toLocaleLowerCase();
	}

	if (options.pascalCase) {
		input = input.charAt(0).toLocaleUpperCase(options.locale) + input.slice(1);
	}

	return postProcess(input, options);
};

module.exports = camelCase;
// TODO: Remove this for the next major release
module.exports.default = camelCase;


/***/ }),

/***/ "./node_modules/map-obj/index.js":
/*!***************************************!*\
  !*** ./node_modules/map-obj/index.js ***!
  \***************************************/
/***/ ((module) => {



const isObject = value => typeof value === 'object' && value !== null;

// Customized for this use-case
const isObjectCustom = value =>
	isObject(value) &&
	!(value instanceof RegExp) &&
	!(value instanceof Error) &&
	!(value instanceof Date);

const mapObject = (object, mapper, options, isSeen = new WeakMap()) => {
	options = {
		deep: false,
		target: {},
		...options
	};

	if (isSeen.has(object)) {
		return isSeen.get(object);
	}

	isSeen.set(object, options.target);

	const {target} = options;
	delete options.target;

	const mapArray = array => array.map(element => isObjectCustom(element) ? mapObject(element, mapper, options, isSeen) : element);
	if (Array.isArray(object)) {
		return mapArray(object);
	}

	for (const [key, value] of Object.entries(object)) {
		let [newKey, newValue, {shouldRecurse = true} = {}] = mapper(key, value, object);

		// Drop `__proto__` keys.
		if (newKey === '__proto__') {
			continue;
		}

		if (options.deep && shouldRecurse && isObjectCustom(newValue)) {
			newValue = Array.isArray(newValue) ?
				mapArray(newValue) :
				mapObject(newValue, mapper, options, isSeen);
		}

		target[newKey] = newValue;
	}

	return target;
};

module.exports = (object, mapper, options) => {
	if (!isObject(object)) {
		throw new TypeError(`Expected an object, got \`${object}\` (${typeof object})`);
	}

	return mapObject(object, mapper, options);
};


/***/ }),

/***/ "./node_modules/quick-lru/index.js":
/*!*****************************************!*\
  !*** ./node_modules/quick-lru/index.js ***!
  \*****************************************/
/***/ ((module) => {



class QuickLRU {
	constructor(options = {}) {
		if (!(options.maxSize && options.maxSize > 0)) {
			throw new TypeError('`maxSize` must be a number greater than 0');
		}

		this.maxSize = options.maxSize;
		this.onEviction = options.onEviction;
		this.cache = new Map();
		this.oldCache = new Map();
		this._size = 0;
	}

	_set(key, value) {
		this.cache.set(key, value);
		this._size++;

		if (this._size >= this.maxSize) {
			this._size = 0;

			if (typeof this.onEviction === 'function') {
				for (const [key, value] of this.oldCache.entries()) {
					this.onEviction(key, value);
				}
			}

			this.oldCache = this.cache;
			this.cache = new Map();
		}
	}

	get(key) {
		if (this.cache.has(key)) {
			return this.cache.get(key);
		}

		if (this.oldCache.has(key)) {
			const value = this.oldCache.get(key);
			this.oldCache.delete(key);
			this._set(key, value);
			return value;
		}
	}

	set(key, value) {
		if (this.cache.has(key)) {
			this.cache.set(key, value);
		} else {
			this._set(key, value);
		}

		return this;
	}

	has(key) {
		return this.cache.has(key) || this.oldCache.has(key);
	}

	peek(key) {
		if (this.cache.has(key)) {
			return this.cache.get(key);
		}

		if (this.oldCache.has(key)) {
			return this.oldCache.get(key);
		}
	}

	delete(key) {
		const deleted = this.cache.delete(key);
		if (deleted) {
			this._size--;
		}

		return this.oldCache.delete(key) || deleted;
	}

	clear() {
		this.cache.clear();
		this.oldCache.clear();
		this._size = 0;
	}

	* keys() {
		for (const [key] of this) {
			yield key;
		}
	}

	* values() {
		for (const [, value] of this) {
			yield value;
		}
	}

	* [Symbol.iterator]() {
		for (const item of this.cache) {
			yield item;
		}

		for (const item of this.oldCache) {
			const [key] = item;
			if (!this.cache.has(key)) {
				yield item;
			}
		}
	}

	get size() {
		let oldCacheSize = 0;
		for (const key of this.oldCache.keys()) {
			if (!this.cache.has(key)) {
				oldCacheSize++;
			}
		}

		return Math.min(this._size + oldCacheSize, this.maxSize);
	}
}

module.exports = QuickLRU;


/***/ }),

/***/ "./src/bookie.ts":
/*!***********************!*\
  !*** ./src/bookie.ts ***!
  \***********************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


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
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Bookie = void 0;
const camelcase_keys_1 = __importDefault(__webpack_require__(/*! camelcase-keys */ "./node_modules/camelcase-keys/index.js"));
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
exports.Bookie = Bookie;


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__("./src/bookie.ts");
/******/ 	
/******/ })()
;