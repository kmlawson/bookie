(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else {
		var a = factory();
		for(var i in a) (typeof exports === 'object' ? exports : root)[i] = a[i];
	}
})(self, function() {
return /******/ (() => { // webpackBootstrap
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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Bookie = void 0;
var camelcase_keys_1 = __importDefault(__webpack_require__(/*! camelcase-keys */ "./node_modules/camelcase-keys/index.js"));
var Book = /** @class */ (function () {
    function Book(source) {
        this.source = source;
        this.typelessTags = source.tags.filter(function (t) { return !t.type; }).map(function (t) { return t.tag; });
        if (source.author) {
            this.authorList = source.author.map(function (a) {
                if (!a)
                    return '';
                if (a.literal)
                    return a.literal;
                return ((a.droppingParticle ? a.droppingParticle + ' ' : '') +
                    a.family +
                    (a.given ? ', ' + a.given : ''));
            });
        }
        else {
            this.authorList = [''];
        }
    }
    Object.defineProperty(Book.prototype, "title", {
        get: function () {
            return this.source.title;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Book.prototype, "issued", {
        get: function () {
            var _a;
            if ((_a = this.source.issued) === null || _a === void 0 ? void 0 : _a.dateParts) {
                return '(' + this.source.issued.dateParts[0][0] + ')';
            }
            return '';
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Book.prototype, "tags", {
        get: function () {
            return this.typelessTags;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Book.prototype, "authors", {
        get: function () {
            return this.authorList;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Book.prototype, "url", {
        get: function () {
            return this.source.url;
        },
        enumerable: false,
        configurable: true
    });
    return Book;
}());
var Bookie = /** @class */ (function () {
    function Bookie() {
        this.sources = null;
        this.tagElement = null;
        this.resultsElement = null;
    }
    Bookie.prototype.init = function (elementId, filepath) {
        var _this = this;
        var elem = document.getElementById(elementId);
        if (elem === null) {
            return;
        }
        this.request(filepath).then(function (sources) {
            if (!sources)
                return;
            _this.sources = sources
                .map(function (s) { return new Book(s); })
                .sort(function (a, b) {
                return a.authors[0]
                    .toUpperCase()
                    .localeCompare(b.authors[0].toUpperCase()) !== 0
                    ? a.authors[0]
                        .toUpperCase()
                        .localeCompare(b.authors[0].toUpperCase())
                    : a.title.toUpperCase().localeCompare(b.title.toUpperCase());
            });
            var firstBookWithAuthor = _this.sources.find(function (b) { return b.authors[0] !== ''; });
            if (firstBookWithAuthor !== undefined) {
                var indexOfFirstBookWithAuthors = _this.sources.indexOf(firstBookWithAuthor);
                var noAuthors = _this.sources.slice(0, indexOfFirstBookWithAuthors);
                var hasAuthors = _this.sources.slice(indexOfFirstBookWithAuthors, _this.sources.length);
                _this.sources = __spreadArray(__spreadArray([], hasAuthors), noAuthors);
            }
            elem.innerHTML = '';
            elem.className = '';
            _this.tagElement = document.createElement('div');
            _this.tagElement.className = 'bookie__tags';
            elem.appendChild(_this.tagElement);
            _this.resultsElement = document.createElement('div');
            _this.resultsElement.className = 'bookie__result';
            elem.appendChild(_this.resultsElement);
            var tagSet = new Set();
            _this.sources.forEach(function (source) {
                if (source.tags != null) {
                    source.tags.forEach(function (tag) {
                        tagSet.add(tag);
                    });
                }
            });
            tagSet.forEach(function (tag) {
                if (_this.tagElement === null)
                    return;
                var button = document.createElement('button');
                button.textContent = tag;
                button.className = 'bookie__tag';
                button.onclick = function () {
                    _this.show(tag);
                };
                _this.tagElement.appendChild(button);
            });
        });
    };
    Bookie.prototype.show = function (tag) {
        var _this = this;
        if (this.resultsElement === null)
            return;
        if (this.sources === null)
            return;
        this.resultsElement.innerHTML = '';
        var list = document.createElement('ul');
        list.className = 'bookie__result__list';
        this.resultsElement.appendChild(list);
        var taggedSources = this.sources.filter(function (source) { var _a; return (_a = source.tags) === null || _a === void 0 ? void 0 : _a.find(function (t) { return t === tag; }); });
        taggedSources.forEach(function (source) {
            var item = document.createElement('li');
            item.className = 'bookie__result__item';
            _this.appendAuthors(source, item);
            _this.appendTitle(source, item);
            _this.appendIssued(source, item);
            _this.appendTags(source, item);
            list.appendChild(item);
        });
    };
    Bookie.prototype.appendTags = function (source, item) {
        var tags = document.createElement('div');
        tags.className = 'bookie__result__item__tags';
        source.tags.forEach(function (t) {
            var tag = document.createElement('span');
            tag.textContent = t;
            tags.appendChild(tag);
        });
        item.appendChild(tags);
    };
    Bookie.prototype.appendIssued = function (source, item) {
        var issued = document.createElement('span');
        issued.textContent = ' ' + source.issued;
        item.appendChild(issued);
    };
    Bookie.prototype.appendTitle = function (source, item) {
        var title = document.createElement('span');
        title.className = 'bookie__result__item__title';
        if (source.url) {
            var titleLink = document.createElement('a');
            titleLink.href = source.url;
            titleLink.innerText = source.title;
            title.appendChild(titleLink);
        }
        else {
            title.textContent = source.title;
        }
        item.appendChild(title);
    };
    Bookie.prototype.appendAuthors = function (source, item) {
        var author = document.createElement('span');
        author.className = 'bookie__result__item__authors';
        author.innerHTML = source.authors
            .map(function (a) { return '<div>' + a + '</div>'; })
            .join('');
        item.appendChild(author);
    };
    Bookie.prototype.request = function (url, 
    // `RequestInit` is a type for configuring
    // a `fetch` request. By default, an empty object.
    config) {
        if (config === void 0) { config = {}; }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, fetch(url, config)
                        .then(function (response) { return response.json(); })
                        .then(function (json) { return camelcase_keys_1.default(json, { deep: true }); })
                        .then(function (data) { return data; })];
            });
        });
    };
    return Bookie;
}());
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
/******/ 	return __webpack_exports__;
/******/ })()
;
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYm9va2llLmpzIiwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLENBQUM7QUFDRCxPOzs7Ozs7Ozs7O0FDVmE7QUFDYixlQUFlLG1CQUFPLENBQUMsZ0RBQVM7QUFDaEMsa0JBQWtCLG1CQUFPLENBQUMsb0RBQVc7QUFDckMsaUJBQWlCLG1CQUFPLENBQUMsb0RBQVc7O0FBRXBDO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxDQUFDOztBQUVELDRCQUE0QixnQkFBZ0I7O0FBRTVDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsUUFBUSxzQ0FBc0M7O0FBRTlDOztBQUVBO0FBQ0E7QUFDQSxvREFBb0QsV0FBVyxHQUFHLElBQUk7O0FBRXRFO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0Esb0NBQW9DLElBQUk7O0FBRXhDO0FBQ0E7QUFDQSxLQUFLO0FBQ0wsd0NBQXdDLFdBQVc7O0FBRW5ELDRCQUE0QjtBQUM1QjtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7Ozs7Ozs7Ozs7QUM1RWE7O0FBRWI7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsaUJBQWlCLG1CQUFtQjtBQUNwQzs7QUFFQSw4QkFBOEIsR0FBRztBQUNqQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSSx3REFBd0QsR0FBRztBQUMvRDtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUk7QUFDSjtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQSw0QkFBNEIsR0FBRyxRQUFRLEdBQUc7QUFDMUM7O0FBRUE7QUFDQSxvQ0FBb0MsTUFBTSxHQUFHLEVBQUU7QUFDL0Msb0JBQW9CLE1BQU0sR0FBRyxFQUFFO0FBQy9COztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLHNCQUFzQjs7Ozs7Ozs7Ozs7QUMxRlQ7O0FBRWI7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFlBQVk7QUFDWjtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQSxRQUFRLFFBQVE7QUFDaEI7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSwwQkFBMEIsc0JBQXNCLElBQUk7O0FBRXBEO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxtREFBbUQsT0FBTyxNQUFNLGNBQWM7QUFDOUU7O0FBRUE7QUFDQTs7Ozs7Ozs7Ozs7QUMxRGE7O0FBRWI7QUFDQSx5QkFBeUI7QUFDekI7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLElBQUk7QUFDSjtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNB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QyxHQUFHLEVBQUUsTUFBTSxDQUFDO3lCQUN0QixJQUFJLENBQUMsVUFBQyxRQUFRLElBQUssZUFBUSxDQUFDLElBQUksRUFBRSxFQUFmLENBQWUsQ0FBQzt5QkFDbkMsSUFBSSxDQUFDLFVBQUMsSUFBSSxJQUFLLCtCQUFhLENBQUMsSUFBSSxFQUFFLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxDQUFDLEVBQW5DLENBQW1DLENBQUM7eUJBQ25ELElBQUksQ0FBQyxVQUFDLElBQUksSUFBSyxXQUFpQixFQUFqQixDQUFpQixDQUFDLEVBQUM7OztLQUN0QztJQUNILGFBQUM7QUFBRCxDQUFDO0FBakpZLHdCQUFNOzs7Ozs7O1VDOURuQjtVQUNBOztVQUVBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBOztVQUVBO1VBQ0E7O1VBRUE7VUFDQTtVQUNBOzs7O1VFdEJBO1VBQ0E7VUFDQTtVQUNBIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vYm9va2llL3dlYnBhY2svdW5pdmVyc2FsTW9kdWxlRGVmaW5pdGlvbiIsIndlYnBhY2s6Ly9ib29raWUvLi9ub2RlX21vZHVsZXMvY2FtZWxjYXNlLWtleXMvaW5kZXguanMiLCJ3ZWJwYWNrOi8vYm9va2llLy4vbm9kZV9tb2R1bGVzL2NhbWVsY2FzZS9pbmRleC5qcyIsIndlYnBhY2s6Ly9ib29raWUvLi9ub2RlX21vZHVsZXMvbWFwLW9iai9pbmRleC5qcyIsIndlYnBhY2s6Ly9ib29raWUvLi9ub2RlX21vZHVsZXMvcXVpY2stbHJ1L2luZGV4LmpzIiwid2VicGFjazovL2Jvb2tpZS8uL3NyYy9ib29raWUudHMiLCJ3ZWJwYWNrOi8vYm9va2llL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL2Jvb2tpZS93ZWJwYWNrL2JlZm9yZS1zdGFydHVwIiwid2VicGFjazovL2Jvb2tpZS93ZWJwYWNrL3N0YXJ0dXAiLCJ3ZWJwYWNrOi8vYm9va2llL3dlYnBhY2svYWZ0ZXItc3RhcnR1cCJdLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gd2VicGFja1VuaXZlcnNhbE1vZHVsZURlZmluaXRpb24ocm9vdCwgZmFjdG9yeSkge1xuXHRpZih0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIG1vZHVsZSA9PT0gJ29iamVjdCcpXG5cdFx0bW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KCk7XG5cdGVsc2UgaWYodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKVxuXHRcdGRlZmluZShbXSwgZmFjdG9yeSk7XG5cdGVsc2Uge1xuXHRcdHZhciBhID0gZmFjdG9yeSgpO1xuXHRcdGZvcih2YXIgaSBpbiBhKSAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnID8gZXhwb3J0cyA6IHJvb3QpW2ldID0gYVtpXTtcblx0fVxufSkoc2VsZiwgZnVuY3Rpb24oKSB7XG5yZXR1cm4gIiwiJ3VzZSBzdHJpY3QnO1xuY29uc3QgbWFwT2JqID0gcmVxdWlyZSgnbWFwLW9iaicpO1xuY29uc3QgY2FtZWxDYXNlID0gcmVxdWlyZSgnY2FtZWxjYXNlJyk7XG5jb25zdCBRdWlja0xydSA9IHJlcXVpcmUoJ3F1aWNrLWxydScpO1xuXG5jb25zdCBoYXMgPSAoYXJyYXksIGtleSkgPT4gYXJyYXkuc29tZSh4ID0+IHtcblx0aWYgKHR5cGVvZiB4ID09PSAnc3RyaW5nJykge1xuXHRcdHJldHVybiB4ID09PSBrZXk7XG5cdH1cblxuXHR4Lmxhc3RJbmRleCA9IDA7XG5cdHJldHVybiB4LnRlc3Qoa2V5KTtcbn0pO1xuXG5jb25zdCBjYWNoZSA9IG5ldyBRdWlja0xydSh7bWF4U2l6ZTogMTAwMDAwfSk7XG5cbi8vIFJlcHJvZHVjZXMgYmVoYXZpb3IgZnJvbSBgbWFwLW9iamBcbmNvbnN0IGlzT2JqZWN0ID0gdmFsdWUgPT5cblx0dHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyAmJlxuXHR2YWx1ZSAhPT0gbnVsbCAmJlxuXHQhKHZhbHVlIGluc3RhbmNlb2YgUmVnRXhwKSAmJlxuXHQhKHZhbHVlIGluc3RhbmNlb2YgRXJyb3IpICYmXG5cdCEodmFsdWUgaW5zdGFuY2VvZiBEYXRlKTtcblxuY29uc3QgY2FtZWxDYXNlQ29udmVydCA9IChpbnB1dCwgb3B0aW9ucykgPT4ge1xuXHRpZiAoIWlzT2JqZWN0KGlucHV0KSkge1xuXHRcdHJldHVybiBpbnB1dDtcblx0fVxuXG5cdG9wdGlvbnMgPSB7XG5cdFx0ZGVlcDogZmFsc2UsXG5cdFx0cGFzY2FsQ2FzZTogZmFsc2UsXG5cdFx0Li4ub3B0aW9uc1xuXHR9O1xuXG5cdGNvbnN0IHtleGNsdWRlLCBwYXNjYWxDYXNlLCBzdG9wUGF0aHMsIGRlZXB9ID0gb3B0aW9ucztcblxuXHRjb25zdCBzdG9wUGF0aHNTZXQgPSBuZXcgU2V0KHN0b3BQYXRocyk7XG5cblx0Y29uc3QgbWFrZU1hcHBlciA9IHBhcmVudFBhdGggPT4gKGtleSwgdmFsdWUpID0+IHtcblx0XHRpZiAoZGVlcCAmJiBpc09iamVjdCh2YWx1ZSkpIHtcblx0XHRcdGNvbnN0IHBhdGggPSBwYXJlbnRQYXRoID09PSB1bmRlZmluZWQgPyBrZXkgOiBgJHtwYXJlbnRQYXRofS4ke2tleX1gO1xuXG5cdFx0XHRpZiAoIXN0b3BQYXRoc1NldC5oYXMocGF0aCkpIHtcblx0XHRcdFx0dmFsdWUgPSBtYXBPYmoodmFsdWUsIG1ha2VNYXBwZXIocGF0aCkpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGlmICghKGV4Y2x1ZGUgJiYgaGFzKGV4Y2x1ZGUsIGtleSkpKSB7XG5cdFx0XHRjb25zdCBjYWNoZUtleSA9IHBhc2NhbENhc2UgPyBgJHtrZXl9X2AgOiBrZXk7XG5cblx0XHRcdGlmIChjYWNoZS5oYXMoY2FjaGVLZXkpKSB7XG5cdFx0XHRcdGtleSA9IGNhY2hlLmdldChjYWNoZUtleSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRjb25zdCByZXR1cm5WYWx1ZSA9IGNhbWVsQ2FzZShrZXksIHtwYXNjYWxDYXNlfSk7XG5cblx0XHRcdFx0aWYgKGtleS5sZW5ndGggPCAxMDApIHsgLy8gUHJldmVudCBhYnVzZVxuXHRcdFx0XHRcdGNhY2hlLnNldChjYWNoZUtleSwgcmV0dXJuVmFsdWUpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0a2V5ID0gcmV0dXJuVmFsdWU7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIFtrZXksIHZhbHVlXTtcblx0fTtcblxuXHRyZXR1cm4gbWFwT2JqKGlucHV0LCBtYWtlTWFwcGVyKHVuZGVmaW5lZCkpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSAoaW5wdXQsIG9wdGlvbnMpID0+IHtcblx0aWYgKEFycmF5LmlzQXJyYXkoaW5wdXQpKSB7XG5cdFx0cmV0dXJuIE9iamVjdC5rZXlzKGlucHV0KS5tYXAoa2V5ID0+IGNhbWVsQ2FzZUNvbnZlcnQoaW5wdXRba2V5XSwgb3B0aW9ucykpO1xuXHR9XG5cblx0cmV0dXJuIGNhbWVsQ2FzZUNvbnZlcnQoaW5wdXQsIG9wdGlvbnMpO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxuY29uc3QgcHJlc2VydmVDYW1lbENhc2UgPSAoc3RyaW5nLCBsb2NhbGUpID0+IHtcblx0bGV0IGlzTGFzdENoYXJMb3dlciA9IGZhbHNlO1xuXHRsZXQgaXNMYXN0Q2hhclVwcGVyID0gZmFsc2U7XG5cdGxldCBpc0xhc3RMYXN0Q2hhclVwcGVyID0gZmFsc2U7XG5cblx0Zm9yIChsZXQgaSA9IDA7IGkgPCBzdHJpbmcubGVuZ3RoOyBpKyspIHtcblx0XHRjb25zdCBjaGFyYWN0ZXIgPSBzdHJpbmdbaV07XG5cblx0XHRpZiAoaXNMYXN0Q2hhckxvd2VyICYmIC9bXFxwe0x1fV0vdS50ZXN0KGNoYXJhY3RlcikpIHtcblx0XHRcdHN0cmluZyA9IHN0cmluZy5zbGljZSgwLCBpKSArICctJyArIHN0cmluZy5zbGljZShpKTtcblx0XHRcdGlzTGFzdENoYXJMb3dlciA9IGZhbHNlO1xuXHRcdFx0aXNMYXN0TGFzdENoYXJVcHBlciA9IGlzTGFzdENoYXJVcHBlcjtcblx0XHRcdGlzTGFzdENoYXJVcHBlciA9IHRydWU7XG5cdFx0XHRpKys7XG5cdFx0fSBlbHNlIGlmIChpc0xhc3RDaGFyVXBwZXIgJiYgaXNMYXN0TGFzdENoYXJVcHBlciAmJiAvW1xccHtMbH1dL3UudGVzdChjaGFyYWN0ZXIpKSB7XG5cdFx0XHRzdHJpbmcgPSBzdHJpbmcuc2xpY2UoMCwgaSAtIDEpICsgJy0nICsgc3RyaW5nLnNsaWNlKGkgLSAxKTtcblx0XHRcdGlzTGFzdExhc3RDaGFyVXBwZXIgPSBpc0xhc3RDaGFyVXBwZXI7XG5cdFx0XHRpc0xhc3RDaGFyVXBwZXIgPSBmYWxzZTtcblx0XHRcdGlzTGFzdENoYXJMb3dlciA9IHRydWU7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGlzTGFzdENoYXJMb3dlciA9IGNoYXJhY3Rlci50b0xvY2FsZUxvd2VyQ2FzZShsb2NhbGUpID09PSBjaGFyYWN0ZXIgJiYgY2hhcmFjdGVyLnRvTG9jYWxlVXBwZXJDYXNlKGxvY2FsZSkgIT09IGNoYXJhY3Rlcjtcblx0XHRcdGlzTGFzdExhc3RDaGFyVXBwZXIgPSBpc0xhc3RDaGFyVXBwZXI7XG5cdFx0XHRpc0xhc3RDaGFyVXBwZXIgPSBjaGFyYWN0ZXIudG9Mb2NhbGVVcHBlckNhc2UobG9jYWxlKSA9PT0gY2hhcmFjdGVyICYmIGNoYXJhY3Rlci50b0xvY2FsZUxvd2VyQ2FzZShsb2NhbGUpICE9PSBjaGFyYWN0ZXI7XG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuIHN0cmluZztcbn07XG5cbmNvbnN0IHByZXNlcnZlQ29uc2VjdXRpdmVVcHBlcmNhc2UgPSBpbnB1dCA9PiB7XG5cdHJldHVybiBpbnB1dC5yZXBsYWNlKC9eW1xccHtMdX1dKD8hW1xccHtMdX1dKS9ndSwgbTEgPT4gbTEudG9Mb3dlckNhc2UoKSk7XG59O1xuXG5jb25zdCBwb3N0UHJvY2VzcyA9IChpbnB1dCwgb3B0aW9ucykgPT4ge1xuXHRyZXR1cm4gaW5wdXQucmVwbGFjZSgvW18uXFwtIF0rKFtcXHB7QWxwaGF9XFxwe059X118JCkvZ3UsIChfLCBwMSkgPT4gcDEudG9Mb2NhbGVVcHBlckNhc2Uob3B0aW9ucy5sb2NhbGUpKVxuXHRcdC5yZXBsYWNlKC9cXGQrKFtcXHB7QWxwaGF9XFxwe059X118JCkvZ3UsIG0gPT4gbS50b0xvY2FsZVVwcGVyQ2FzZShvcHRpb25zLmxvY2FsZSkpO1xufTtcblxuY29uc3QgY2FtZWxDYXNlID0gKGlucHV0LCBvcHRpb25zKSA9PiB7XG5cdGlmICghKHR5cGVvZiBpbnB1dCA9PT0gJ3N0cmluZycgfHwgQXJyYXkuaXNBcnJheShpbnB1dCkpKSB7XG5cdFx0dGhyb3cgbmV3IFR5cGVFcnJvcignRXhwZWN0ZWQgdGhlIGlucHV0IHRvIGJlIGBzdHJpbmcgfCBzdHJpbmdbXWAnKTtcblx0fVxuXG5cdG9wdGlvbnMgPSB7XG5cdFx0cGFzY2FsQ2FzZTogZmFsc2UsXG5cdFx0cHJlc2VydmVDb25zZWN1dGl2ZVVwcGVyY2FzZTogZmFsc2UsXG5cdFx0Li4ub3B0aW9uc1xuXHR9O1xuXG5cdGlmIChBcnJheS5pc0FycmF5KGlucHV0KSkge1xuXHRcdGlucHV0ID0gaW5wdXQubWFwKHggPT4geC50cmltKCkpXG5cdFx0XHQuZmlsdGVyKHggPT4geC5sZW5ndGgpXG5cdFx0XHQuam9pbignLScpO1xuXHR9IGVsc2Uge1xuXHRcdGlucHV0ID0gaW5wdXQudHJpbSgpO1xuXHR9XG5cblx0aWYgKGlucHV0Lmxlbmd0aCA9PT0gMCkge1xuXHRcdHJldHVybiAnJztcblx0fVxuXG5cdGlmIChpbnB1dC5sZW5ndGggPT09IDEpIHtcblx0XHRyZXR1cm4gb3B0aW9ucy5wYXNjYWxDYXNlID8gaW5wdXQudG9Mb2NhbGVVcHBlckNhc2Uob3B0aW9ucy5sb2NhbGUpIDogaW5wdXQudG9Mb2NhbGVMb3dlckNhc2Uob3B0aW9ucy5sb2NhbGUpO1xuXHR9XG5cblx0Y29uc3QgaGFzVXBwZXJDYXNlID0gaW5wdXQgIT09IGlucHV0LnRvTG9jYWxlTG93ZXJDYXNlKG9wdGlvbnMubG9jYWxlKTtcblxuXHRpZiAoaGFzVXBwZXJDYXNlKSB7XG5cdFx0aW5wdXQgPSBwcmVzZXJ2ZUNhbWVsQ2FzZShpbnB1dCwgb3B0aW9ucy5sb2NhbGUpO1xuXHR9XG5cblx0aW5wdXQgPSBpbnB1dC5yZXBsYWNlKC9eW18uXFwtIF0rLywgJycpO1xuXG5cdGlmIChvcHRpb25zLnByZXNlcnZlQ29uc2VjdXRpdmVVcHBlcmNhc2UpIHtcblx0XHRpbnB1dCA9IHByZXNlcnZlQ29uc2VjdXRpdmVVcHBlcmNhc2UoaW5wdXQpO1xuXHR9IGVsc2Uge1xuXHRcdGlucHV0ID0gaW5wdXQudG9Mb2NhbGVMb3dlckNhc2UoKTtcblx0fVxuXG5cdGlmIChvcHRpb25zLnBhc2NhbENhc2UpIHtcblx0XHRpbnB1dCA9IGlucHV0LmNoYXJBdCgwKS50b0xvY2FsZVVwcGVyQ2FzZShvcHRpb25zLmxvY2FsZSkgKyBpbnB1dC5zbGljZSgxKTtcblx0fVxuXG5cdHJldHVybiBwb3N0UHJvY2VzcyhpbnB1dCwgb3B0aW9ucyk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGNhbWVsQ2FzZTtcbi8vIFRPRE86IFJlbW92ZSB0aGlzIGZvciB0aGUgbmV4dCBtYWpvciByZWxlYXNlXG5tb2R1bGUuZXhwb3J0cy5kZWZhdWx0ID0gY2FtZWxDYXNlO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5jb25zdCBpc09iamVjdCA9IHZhbHVlID0+IHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcgJiYgdmFsdWUgIT09IG51bGw7XG5cbi8vIEN1c3RvbWl6ZWQgZm9yIHRoaXMgdXNlLWNhc2VcbmNvbnN0IGlzT2JqZWN0Q3VzdG9tID0gdmFsdWUgPT5cblx0aXNPYmplY3QodmFsdWUpICYmXG5cdCEodmFsdWUgaW5zdGFuY2VvZiBSZWdFeHApICYmXG5cdCEodmFsdWUgaW5zdGFuY2VvZiBFcnJvcikgJiZcblx0ISh2YWx1ZSBpbnN0YW5jZW9mIERhdGUpO1xuXG5jb25zdCBtYXBPYmplY3QgPSAob2JqZWN0LCBtYXBwZXIsIG9wdGlvbnMsIGlzU2VlbiA9IG5ldyBXZWFrTWFwKCkpID0+IHtcblx0b3B0aW9ucyA9IHtcblx0XHRkZWVwOiBmYWxzZSxcblx0XHR0YXJnZXQ6IHt9LFxuXHRcdC4uLm9wdGlvbnNcblx0fTtcblxuXHRpZiAoaXNTZWVuLmhhcyhvYmplY3QpKSB7XG5cdFx0cmV0dXJuIGlzU2Vlbi5nZXQob2JqZWN0KTtcblx0fVxuXG5cdGlzU2Vlbi5zZXQob2JqZWN0LCBvcHRpb25zLnRhcmdldCk7XG5cblx0Y29uc3Qge3RhcmdldH0gPSBvcHRpb25zO1xuXHRkZWxldGUgb3B0aW9ucy50YXJnZXQ7XG5cblx0Y29uc3QgbWFwQXJyYXkgPSBhcnJheSA9PiBhcnJheS5tYXAoZWxlbWVudCA9PiBpc09iamVjdEN1c3RvbShlbGVtZW50KSA/IG1hcE9iamVjdChlbGVtZW50LCBtYXBwZXIsIG9wdGlvbnMsIGlzU2VlbikgOiBlbGVtZW50KTtcblx0aWYgKEFycmF5LmlzQXJyYXkob2JqZWN0KSkge1xuXHRcdHJldHVybiBtYXBBcnJheShvYmplY3QpO1xuXHR9XG5cblx0Zm9yIChjb25zdCBba2V5LCB2YWx1ZV0gb2YgT2JqZWN0LmVudHJpZXMob2JqZWN0KSkge1xuXHRcdGxldCBbbmV3S2V5LCBuZXdWYWx1ZSwge3Nob3VsZFJlY3Vyc2UgPSB0cnVlfSA9IHt9XSA9IG1hcHBlcihrZXksIHZhbHVlLCBvYmplY3QpO1xuXG5cdFx0Ly8gRHJvcCBgX19wcm90b19fYCBrZXlzLlxuXHRcdGlmIChuZXdLZXkgPT09ICdfX3Byb3RvX18nKSB7XG5cdFx0XHRjb250aW51ZTtcblx0XHR9XG5cblx0XHRpZiAob3B0aW9ucy5kZWVwICYmIHNob3VsZFJlY3Vyc2UgJiYgaXNPYmplY3RDdXN0b20obmV3VmFsdWUpKSB7XG5cdFx0XHRuZXdWYWx1ZSA9IEFycmF5LmlzQXJyYXkobmV3VmFsdWUpID9cblx0XHRcdFx0bWFwQXJyYXkobmV3VmFsdWUpIDpcblx0XHRcdFx0bWFwT2JqZWN0KG5ld1ZhbHVlLCBtYXBwZXIsIG9wdGlvbnMsIGlzU2Vlbik7XG5cdFx0fVxuXG5cdFx0dGFyZ2V0W25ld0tleV0gPSBuZXdWYWx1ZTtcblx0fVxuXG5cdHJldHVybiB0YXJnZXQ7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IChvYmplY3QsIG1hcHBlciwgb3B0aW9ucykgPT4ge1xuXHRpZiAoIWlzT2JqZWN0KG9iamVjdCkpIHtcblx0XHR0aHJvdyBuZXcgVHlwZUVycm9yKGBFeHBlY3RlZCBhbiBvYmplY3QsIGdvdCBcXGAke29iamVjdH1cXGAgKCR7dHlwZW9mIG9iamVjdH0pYCk7XG5cdH1cblxuXHRyZXR1cm4gbWFwT2JqZWN0KG9iamVjdCwgbWFwcGVyLCBvcHRpb25zKTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbmNsYXNzIFF1aWNrTFJVIHtcblx0Y29uc3RydWN0b3Iob3B0aW9ucyA9IHt9KSB7XG5cdFx0aWYgKCEob3B0aW9ucy5tYXhTaXplICYmIG9wdGlvbnMubWF4U2l6ZSA+IDApKSB7XG5cdFx0XHR0aHJvdyBuZXcgVHlwZUVycm9yKCdgbWF4U2l6ZWAgbXVzdCBiZSBhIG51bWJlciBncmVhdGVyIHRoYW4gMCcpO1xuXHRcdH1cblxuXHRcdHRoaXMubWF4U2l6ZSA9IG9wdGlvbnMubWF4U2l6ZTtcblx0XHR0aGlzLm9uRXZpY3Rpb24gPSBvcHRpb25zLm9uRXZpY3Rpb247XG5cdFx0dGhpcy5jYWNoZSA9IG5ldyBNYXAoKTtcblx0XHR0aGlzLm9sZENhY2hlID0gbmV3IE1hcCgpO1xuXHRcdHRoaXMuX3NpemUgPSAwO1xuXHR9XG5cblx0X3NldChrZXksIHZhbHVlKSB7XG5cdFx0dGhpcy5jYWNoZS5zZXQoa2V5LCB2YWx1ZSk7XG5cdFx0dGhpcy5fc2l6ZSsrO1xuXG5cdFx0aWYgKHRoaXMuX3NpemUgPj0gdGhpcy5tYXhTaXplKSB7XG5cdFx0XHR0aGlzLl9zaXplID0gMDtcblxuXHRcdFx0aWYgKHR5cGVvZiB0aGlzLm9uRXZpY3Rpb24gPT09ICdmdW5jdGlvbicpIHtcblx0XHRcdFx0Zm9yIChjb25zdCBba2V5LCB2YWx1ZV0gb2YgdGhpcy5vbGRDYWNoZS5lbnRyaWVzKCkpIHtcblx0XHRcdFx0XHR0aGlzLm9uRXZpY3Rpb24oa2V5LCB2YWx1ZSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0dGhpcy5vbGRDYWNoZSA9IHRoaXMuY2FjaGU7XG5cdFx0XHR0aGlzLmNhY2hlID0gbmV3IE1hcCgpO1xuXHRcdH1cblx0fVxuXG5cdGdldChrZXkpIHtcblx0XHRpZiAodGhpcy5jYWNoZS5oYXMoa2V5KSkge1xuXHRcdFx0cmV0dXJuIHRoaXMuY2FjaGUuZ2V0KGtleSk7XG5cdFx0fVxuXG5cdFx0aWYgKHRoaXMub2xkQ2FjaGUuaGFzKGtleSkpIHtcblx0XHRcdGNvbnN0IHZhbHVlID0gdGhpcy5vbGRDYWNoZS5nZXQoa2V5KTtcblx0XHRcdHRoaXMub2xkQ2FjaGUuZGVsZXRlKGtleSk7XG5cdFx0XHR0aGlzLl9zZXQoa2V5LCB2YWx1ZSk7XG5cdFx0XHRyZXR1cm4gdmFsdWU7XG5cdFx0fVxuXHR9XG5cblx0c2V0KGtleSwgdmFsdWUpIHtcblx0XHRpZiAodGhpcy5jYWNoZS5oYXMoa2V5KSkge1xuXHRcdFx0dGhpcy5jYWNoZS5zZXQoa2V5LCB2YWx1ZSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMuX3NldChrZXksIHZhbHVlKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdGhhcyhrZXkpIHtcblx0XHRyZXR1cm4gdGhpcy5jYWNoZS5oYXMoa2V5KSB8fCB0aGlzLm9sZENhY2hlLmhhcyhrZXkpO1xuXHR9XG5cblx0cGVlayhrZXkpIHtcblx0XHRpZiAodGhpcy5jYWNoZS5oYXMoa2V5KSkge1xuXHRcdFx0cmV0dXJuIHRoaXMuY2FjaGUuZ2V0KGtleSk7XG5cdFx0fVxuXG5cdFx0aWYgKHRoaXMub2xkQ2FjaGUuaGFzKGtleSkpIHtcblx0XHRcdHJldHVybiB0aGlzLm9sZENhY2hlLmdldChrZXkpO1xuXHRcdH1cblx0fVxuXG5cdGRlbGV0ZShrZXkpIHtcblx0XHRjb25zdCBkZWxldGVkID0gdGhpcy5jYWNoZS5kZWxldGUoa2V5KTtcblx0XHRpZiAoZGVsZXRlZCkge1xuXHRcdFx0dGhpcy5fc2l6ZS0tO1xuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzLm9sZENhY2hlLmRlbGV0ZShrZXkpIHx8IGRlbGV0ZWQ7XG5cdH1cblxuXHRjbGVhcigpIHtcblx0XHR0aGlzLmNhY2hlLmNsZWFyKCk7XG5cdFx0dGhpcy5vbGRDYWNoZS5jbGVhcigpO1xuXHRcdHRoaXMuX3NpemUgPSAwO1xuXHR9XG5cblx0KiBrZXlzKCkge1xuXHRcdGZvciAoY29uc3QgW2tleV0gb2YgdGhpcykge1xuXHRcdFx0eWllbGQga2V5O1xuXHRcdH1cblx0fVxuXG5cdCogdmFsdWVzKCkge1xuXHRcdGZvciAoY29uc3QgWywgdmFsdWVdIG9mIHRoaXMpIHtcblx0XHRcdHlpZWxkIHZhbHVlO1xuXHRcdH1cblx0fVxuXG5cdCogW1N5bWJvbC5pdGVyYXRvcl0oKSB7XG5cdFx0Zm9yIChjb25zdCBpdGVtIG9mIHRoaXMuY2FjaGUpIHtcblx0XHRcdHlpZWxkIGl0ZW07XG5cdFx0fVxuXG5cdFx0Zm9yIChjb25zdCBpdGVtIG9mIHRoaXMub2xkQ2FjaGUpIHtcblx0XHRcdGNvbnN0IFtrZXldID0gaXRlbTtcblx0XHRcdGlmICghdGhpcy5jYWNoZS5oYXMoa2V5KSkge1xuXHRcdFx0XHR5aWVsZCBpdGVtO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdGdldCBzaXplKCkge1xuXHRcdGxldCBvbGRDYWNoZVNpemUgPSAwO1xuXHRcdGZvciAoY29uc3Qga2V5IG9mIHRoaXMub2xkQ2FjaGUua2V5cygpKSB7XG5cdFx0XHRpZiAoIXRoaXMuY2FjaGUuaGFzKGtleSkpIHtcblx0XHRcdFx0b2xkQ2FjaGVTaXplKys7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIE1hdGgubWluKHRoaXMuX3NpemUgKyBvbGRDYWNoZVNpemUsIHRoaXMubWF4U2l6ZSk7XG5cdH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBRdWlja0xSVTtcbiIsImltcG9ydCBjYW1lbGNhc2VLZXlzIGZyb20gJ2NhbWVsY2FzZS1rZXlzJztcclxuXHJcbmludGVyZmFjZSBTb3VyY2Uge1xyXG4gIHRpdGxlOiBzdHJpbmc7XHJcbiAgYXV0aG9yOiB7XHJcbiAgICBmYW1pbHk6IHN0cmluZztcclxuICAgIGdpdmVuOiBzdHJpbmc7XHJcbiAgICBkcm9wcGluZ1BhcnRpY2xlOiBzdHJpbmc7XHJcbiAgICBsaXRlcmFsOiBzdHJpbmc7XHJcbiAgfVtdO1xyXG4gIGlzc3VlZDoge1xyXG4gICAgZGF0ZVBhcnRzOiAoc3RyaW5nIHwgbnVtYmVyKVtdW107XHJcbiAgfTtcclxuICB1cmw6IHN0cmluZztcclxuICB0YWdzOiB7XHJcbiAgICB0YWc6IHN0cmluZztcclxuICAgIHR5cGU6IHN0cmluZyB8IG51bGw7XHJcbiAgfVtdO1xyXG59XHJcblxyXG5jbGFzcyBCb29rIHtcclxuICBwcml2YXRlIHNvdXJjZTogU291cmNlO1xyXG4gIHByaXZhdGUgdHlwZWxlc3NUYWdzOiBzdHJpbmdbXTtcclxuICBwcml2YXRlIGF1dGhvckxpc3Q6IHN0cmluZ1tdO1xyXG4gIGNvbnN0cnVjdG9yKHNvdXJjZTogU291cmNlKSB7XHJcbiAgICB0aGlzLnNvdXJjZSA9IHNvdXJjZTtcclxuICAgIHRoaXMudHlwZWxlc3NUYWdzID0gc291cmNlLnRhZ3MuZmlsdGVyKCh0KSA9PiAhdC50eXBlKS5tYXAoKHQpID0+IHQudGFnKTtcclxuICAgIGlmIChzb3VyY2UuYXV0aG9yKSB7XHJcbiAgICAgIHRoaXMuYXV0aG9yTGlzdCA9IHNvdXJjZS5hdXRob3IubWFwKChhKSA9PiB7XHJcbiAgICAgICAgaWYgKCFhKSByZXR1cm4gJyc7XHJcbiAgICAgICAgaWYgKGEubGl0ZXJhbCkgcmV0dXJuIGEubGl0ZXJhbDtcclxuICAgICAgICByZXR1cm4gKFxyXG4gICAgICAgICAgKGEuZHJvcHBpbmdQYXJ0aWNsZSA/IGEuZHJvcHBpbmdQYXJ0aWNsZSArICcgJyA6ICcnKSArXHJcbiAgICAgICAgICBhLmZhbWlseSArXHJcbiAgICAgICAgICAoYS5naXZlbiA/ICcsICcgKyBhLmdpdmVuIDogJycpXHJcbiAgICAgICAgKTtcclxuICAgICAgfSk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0aGlzLmF1dGhvckxpc3QgPSBbJyddO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgZ2V0IHRpdGxlKCk6IHN0cmluZyB7XHJcbiAgICByZXR1cm4gdGhpcy5zb3VyY2UudGl0bGU7XHJcbiAgfVxyXG4gIGdldCBpc3N1ZWQoKTogc3RyaW5nIHtcclxuICAgIGlmICh0aGlzLnNvdXJjZS5pc3N1ZWQ/LmRhdGVQYXJ0cykge1xyXG4gICAgICByZXR1cm4gJygnICsgdGhpcy5zb3VyY2UuaXNzdWVkLmRhdGVQYXJ0c1swXVswXSArICcpJztcclxuICAgIH1cclxuICAgIHJldHVybiAnJztcclxuICB9XHJcbiAgZ2V0IHRhZ3MoKTogc3RyaW5nW10ge1xyXG4gICAgcmV0dXJuIHRoaXMudHlwZWxlc3NUYWdzO1xyXG4gIH1cclxuICBnZXQgYXV0aG9ycygpOiBzdHJpbmdbXSB7XHJcbiAgICByZXR1cm4gdGhpcy5hdXRob3JMaXN0O1xyXG4gIH1cclxuICBnZXQgdXJsKCk6IHN0cmluZyB7XHJcbiAgICByZXR1cm4gdGhpcy5zb3VyY2UudXJsO1xyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIEJvb2tpZSB7XHJcbiAgc291cmNlczogQm9va1tdIHwgbnVsbCA9IG51bGw7XHJcbiAgdGFnRWxlbWVudDogSFRNTEVsZW1lbnQgfCBudWxsID0gbnVsbDtcclxuICByZXN1bHRzRWxlbWVudDogSFRNTEVsZW1lbnQgfCBudWxsID0gbnVsbDtcclxuXHJcbiAgaW5pdChlbGVtZW50SWQ6IHN0cmluZywgZmlsZXBhdGg6IHN0cmluZyk6IHZvaWQge1xyXG4gICAgY29uc3QgZWxlbSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGVsZW1lbnRJZCk7XHJcbiAgICBpZiAoZWxlbSA9PT0gbnVsbCkge1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICB0aGlzLnJlcXVlc3Q8U291cmNlW10+KGZpbGVwYXRoKS50aGVuKChzb3VyY2VzOiBTb3VyY2VbXSkgPT4ge1xyXG4gICAgICBpZiAoIXNvdXJjZXMpIHJldHVybjtcclxuICAgICAgdGhpcy5zb3VyY2VzID0gc291cmNlc1xyXG4gICAgICAgIC5tYXAoKHMpID0+IG5ldyBCb29rKHMpKVxyXG4gICAgICAgIC5zb3J0KChhLCBiKSA9PlxyXG4gICAgICAgICAgYS5hdXRob3JzWzBdXHJcbiAgICAgICAgICAgIC50b1VwcGVyQ2FzZSgpXHJcbiAgICAgICAgICAgIC5sb2NhbGVDb21wYXJlKGIuYXV0aG9yc1swXS50b1VwcGVyQ2FzZSgpKSAhPT0gMFxyXG4gICAgICAgICAgICA/IGEuYXV0aG9yc1swXVxyXG4gICAgICAgICAgICAgICAgLnRvVXBwZXJDYXNlKClcclxuICAgICAgICAgICAgICAgIC5sb2NhbGVDb21wYXJlKGIuYXV0aG9yc1swXS50b1VwcGVyQ2FzZSgpKVxyXG4gICAgICAgICAgICA6IGEudGl0bGUudG9VcHBlckNhc2UoKS5sb2NhbGVDb21wYXJlKGIudGl0bGUudG9VcHBlckNhc2UoKSksXHJcbiAgICAgICAgKTtcclxuICAgICAgY29uc3QgZmlyc3RCb29rV2l0aEF1dGhvciA9IHRoaXMuc291cmNlcy5maW5kKChiKSA9PiBiLmF1dGhvcnNbMF0gIT09ICcnKTtcclxuICAgICAgaWYgKGZpcnN0Qm9va1dpdGhBdXRob3IgIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgIGNvbnN0IGluZGV4T2ZGaXJzdEJvb2tXaXRoQXV0aG9ycyA9XHJcbiAgICAgICAgICB0aGlzLnNvdXJjZXMuaW5kZXhPZihmaXJzdEJvb2tXaXRoQXV0aG9yKTtcclxuICAgICAgICBjb25zdCBub0F1dGhvcnMgPSB0aGlzLnNvdXJjZXMuc2xpY2UoMCwgaW5kZXhPZkZpcnN0Qm9va1dpdGhBdXRob3JzKTtcclxuICAgICAgICBjb25zdCBoYXNBdXRob3JzID0gdGhpcy5zb3VyY2VzLnNsaWNlKFxyXG4gICAgICAgICAgaW5kZXhPZkZpcnN0Qm9va1dpdGhBdXRob3JzLFxyXG4gICAgICAgICAgdGhpcy5zb3VyY2VzLmxlbmd0aCxcclxuICAgICAgICApO1xyXG4gICAgICAgIHRoaXMuc291cmNlcyA9IFsuLi5oYXNBdXRob3JzLCAuLi5ub0F1dGhvcnNdO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBlbGVtLmlubmVySFRNTCA9ICcnO1xyXG4gICAgICBlbGVtLmNsYXNzTmFtZSA9ICcnO1xyXG5cclxuICAgICAgdGhpcy50YWdFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbiAgICAgIHRoaXMudGFnRWxlbWVudC5jbGFzc05hbWUgPSAnYm9va2llX190YWdzJztcclxuICAgICAgZWxlbS5hcHBlbmRDaGlsZCh0aGlzLnRhZ0VsZW1lbnQpO1xyXG4gICAgICB0aGlzLnJlc3VsdHNFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbiAgICAgIHRoaXMucmVzdWx0c0VsZW1lbnQuY2xhc3NOYW1lID0gJ2Jvb2tpZV9fcmVzdWx0JztcclxuICAgICAgZWxlbS5hcHBlbmRDaGlsZCh0aGlzLnJlc3VsdHNFbGVtZW50KTtcclxuXHJcbiAgICAgIGNvbnN0IHRhZ1NldCA9IG5ldyBTZXQ8c3RyaW5nPigpO1xyXG4gICAgICB0aGlzLnNvdXJjZXMuZm9yRWFjaCgoc291cmNlKSA9PiB7XHJcbiAgICAgICAgaWYgKHNvdXJjZS50YWdzICE9IG51bGwpIHtcclxuICAgICAgICAgIHNvdXJjZS50YWdzLmZvckVhY2goKHRhZykgPT4ge1xyXG4gICAgICAgICAgICB0YWdTZXQuYWRkKHRhZyk7XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgdGFnU2V0LmZvckVhY2goKHRhZykgPT4ge1xyXG4gICAgICAgIGlmICh0aGlzLnRhZ0VsZW1lbnQgPT09IG51bGwpIHJldHVybjtcclxuICAgICAgICBjb25zdCBidXR0b24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdidXR0b24nKTtcclxuICAgICAgICBidXR0b24udGV4dENvbnRlbnQgPSB0YWc7XHJcbiAgICAgICAgYnV0dG9uLmNsYXNzTmFtZSA9ICdib29raWVfX3RhZyc7XHJcbiAgICAgICAgYnV0dG9uLm9uY2xpY2sgPSAoKSA9PiB7XHJcbiAgICAgICAgICB0aGlzLnNob3codGFnKTtcclxuICAgICAgICB9O1xyXG4gICAgICAgIHRoaXMudGFnRWxlbWVudC5hcHBlbmRDaGlsZChidXR0b24pO1xyXG4gICAgICB9KTtcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBzaG93KHRhZzogc3RyaW5nKSB7XHJcbiAgICBpZiAodGhpcy5yZXN1bHRzRWxlbWVudCA9PT0gbnVsbCkgcmV0dXJuO1xyXG4gICAgaWYgKHRoaXMuc291cmNlcyA9PT0gbnVsbCkgcmV0dXJuO1xyXG5cclxuICAgIHRoaXMucmVzdWx0c0VsZW1lbnQuaW5uZXJIVE1MID0gJyc7XHJcbiAgICBjb25zdCBsaXN0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndWwnKTtcclxuICAgIGxpc3QuY2xhc3NOYW1lID0gJ2Jvb2tpZV9fcmVzdWx0X19saXN0JztcclxuXHJcbiAgICB0aGlzLnJlc3VsdHNFbGVtZW50LmFwcGVuZENoaWxkKGxpc3QpO1xyXG5cclxuICAgIGNvbnN0IHRhZ2dlZFNvdXJjZXMgPSB0aGlzLnNvdXJjZXMuZmlsdGVyKChzb3VyY2UpID0+XHJcbiAgICAgIHNvdXJjZS50YWdzPy5maW5kKCh0KSA9PiB0ID09PSB0YWcpLFxyXG4gICAgKTtcclxuXHJcbiAgICB0YWdnZWRTb3VyY2VzLmZvckVhY2goKHNvdXJjZSkgPT4ge1xyXG4gICAgICBjb25zdCBpdGVtID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGknKTtcclxuICAgICAgaXRlbS5jbGFzc05hbWUgPSAnYm9va2llX19yZXN1bHRfX2l0ZW0nO1xyXG5cclxuICAgICAgdGhpcy5hcHBlbmRBdXRob3JzKHNvdXJjZSwgaXRlbSk7XHJcbiAgICAgIHRoaXMuYXBwZW5kVGl0bGUoc291cmNlLCBpdGVtKTtcclxuICAgICAgdGhpcy5hcHBlbmRJc3N1ZWQoc291cmNlLCBpdGVtKTtcclxuICAgICAgdGhpcy5hcHBlbmRUYWdzKHNvdXJjZSwgaXRlbSk7XHJcblxyXG4gICAgICBsaXN0LmFwcGVuZENoaWxkKGl0ZW0pO1xyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGFwcGVuZFRhZ3Moc291cmNlOiBCb29rLCBpdGVtOiBIVE1MTElFbGVtZW50KSB7XHJcbiAgICBjb25zdCB0YWdzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbiAgICB0YWdzLmNsYXNzTmFtZSA9ICdib29raWVfX3Jlc3VsdF9faXRlbV9fdGFncyc7XHJcbiAgICBzb3VyY2UudGFncy5mb3JFYWNoKCh0KSA9PiB7XHJcbiAgICAgIGNvbnN0IHRhZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcclxuICAgICAgdGFnLnRleHRDb250ZW50ID0gdDtcclxuICAgICAgdGFncy5hcHBlbmRDaGlsZCh0YWcpO1xyXG4gICAgfSk7XHJcbiAgICBpdGVtLmFwcGVuZENoaWxkKHRhZ3MpO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBhcHBlbmRJc3N1ZWQoc291cmNlOiBCb29rLCBpdGVtOiBIVE1MTElFbGVtZW50KSB7XHJcbiAgICBjb25zdCBpc3N1ZWQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyk7XHJcbiAgICBpc3N1ZWQudGV4dENvbnRlbnQgPSAnICcgKyBzb3VyY2UuaXNzdWVkO1xyXG4gICAgaXRlbS5hcHBlbmRDaGlsZChpc3N1ZWQpO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBhcHBlbmRUaXRsZShzb3VyY2U6IEJvb2ssIGl0ZW06IEhUTUxMSUVsZW1lbnQpIHtcclxuICAgIGNvbnN0IHRpdGxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpO1xyXG4gICAgdGl0bGUuY2xhc3NOYW1lID0gJ2Jvb2tpZV9fcmVzdWx0X19pdGVtX190aXRsZSc7XHJcbiAgICBpZiAoc291cmNlLnVybCkge1xyXG4gICAgICBjb25zdCB0aXRsZUxpbmsgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50PCdhJz4oJ2EnKTtcclxuICAgICAgdGl0bGVMaW5rLmhyZWYgPSBzb3VyY2UudXJsO1xyXG4gICAgICB0aXRsZUxpbmsuaW5uZXJUZXh0ID0gc291cmNlLnRpdGxlO1xyXG4gICAgICB0aXRsZS5hcHBlbmRDaGlsZCh0aXRsZUxpbmspO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGl0bGUudGV4dENvbnRlbnQgPSBzb3VyY2UudGl0bGU7XHJcbiAgICB9XHJcbiAgICBpdGVtLmFwcGVuZENoaWxkKHRpdGxlKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgYXBwZW5kQXV0aG9ycyhzb3VyY2U6IEJvb2ssIGl0ZW06IEhUTUxMSUVsZW1lbnQpIHtcclxuICAgIGNvbnN0IGF1dGhvciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcclxuICAgIGF1dGhvci5jbGFzc05hbWUgPSAnYm9va2llX19yZXN1bHRfX2l0ZW1fX2F1dGhvcnMnO1xyXG4gICAgYXV0aG9yLmlubmVySFRNTCA9IHNvdXJjZS5hdXRob3JzXHJcbiAgICAgIC5tYXAoKGEpID0+ICc8ZGl2PicgKyBhICsgJzwvZGl2PicpXHJcbiAgICAgIC5qb2luKCcnKTtcclxuICAgIGl0ZW0uYXBwZW5kQ2hpbGQoYXV0aG9yKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgYXN5bmMgcmVxdWVzdDxUUmVzcG9uc2U+KFxyXG4gICAgdXJsOiBzdHJpbmcsXHJcbiAgICAvLyBgUmVxdWVzdEluaXRgIGlzIGEgdHlwZSBmb3IgY29uZmlndXJpbmdcclxuICAgIC8vIGEgYGZldGNoYCByZXF1ZXN0LiBCeSBkZWZhdWx0LCBhbiBlbXB0eSBvYmplY3QuXHJcbiAgICBjb25maWc6IFJlcXVlc3RJbml0ID0ge30sXHJcbiAgKTogUHJvbWlzZTxUUmVzcG9uc2U+IHtcclxuICAgIHJldHVybiBmZXRjaCh1cmwsIGNvbmZpZylcclxuICAgICAgLnRoZW4oKHJlc3BvbnNlKSA9PiByZXNwb25zZS5qc29uKCkpXHJcbiAgICAgIC50aGVuKChqc29uKSA9PiBjYW1lbGNhc2VLZXlzKGpzb24sIHsgZGVlcDogdHJ1ZSB9KSlcclxuICAgICAgLnRoZW4oKGRhdGEpID0+IGRhdGEgYXMgVFJlc3BvbnNlKTtcclxuICB9XHJcbn1cclxuIiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIiIsIi8vIHN0YXJ0dXBcbi8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuLy8gVGhpcyBlbnRyeSBtb2R1bGUgaXMgcmVmZXJlbmNlZCBieSBvdGhlciBtb2R1bGVzIHNvIGl0IGNhbid0IGJlIGlubGluZWRcbnZhciBfX3dlYnBhY2tfZXhwb3J0c19fID0gX193ZWJwYWNrX3JlcXVpcmVfXyhcIi4vc3JjL2Jvb2tpZS50c1wiKTtcbiIsIiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==