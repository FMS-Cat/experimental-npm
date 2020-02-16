/*!
 * @fms-cat/experimental v0.2.0
 *     Experimental edition of FMS_Cat
 * 
 * Copyright (c) FMS_Cat
 * @fms-cat/experimental is distributed under the MIT License
 * https://github.com/FMS-Cat/experimental/blob/master/LICENSE
 */
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["FMS_CAT_EXPERIMENTAL"] = factory();
	else
		root["FMS_CAT_EXPERIMENTAL"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/index.ts");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/CDS/CDS.ts":
/*!************************!*\
  !*** ./src/CDS/CDS.ts ***!
  \************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Critically Damped Spring
 *
 * Shoutouts to Keijiro Takahashi
 */
var CDS = /** @class */ (function () {
    function CDS() {
        this.factor = 100.0;
        this.ratio = 1.0;
        this.velocity = 0.0;
        this.value = 0.0;
        this.target = 0.0;
    }
    CDS.prototype.update = function (deltaTime) {
        this.velocity += (-this.factor * (this.value - this.target)
            - 2.0 * this.velocity * Math.sqrt(this.factor) * this.ratio) * deltaTime;
        this.value += this.velocity * deltaTime;
        return this.value;
    };
    return CDS;
}());
exports.CDS = CDS;


/***/ }),

/***/ "./src/CDS/index.ts":
/*!**************************!*\
  !*** ./src/CDS/index.ts ***!
  \**************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(__webpack_require__(/*! ./CDS */ "./src/CDS/CDS.ts"));


/***/ }),

/***/ "./src/Clock/Clock.ts":
/*!****************************!*\
  !*** ./src/Clock/Clock.ts ***!
  \****************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Class that deals with time.
 * In this base class, you need to set time manually from `Automaton.update()`.
 * Best for sync with external clock stuff.
 */
var Clock = /** @class */ (function () {
    function Clock() {
        /**
         * Its current time.
         */
        this.__time = 0.0;
        /**
         * Its deltaTime of last update.
         */
        this.__deltaTime = 0.0;
        /**
         * Whether its currently playing or not.
         */
        this.__isPlaying = false;
    }
    Object.defineProperty(Clock.prototype, "time", {
        /**
         * Its current time.
         */
        get: function () { return this.__time; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Clock.prototype, "deltaTime", {
        /**
         * Its deltaTime of last update.
         */
        get: function () { return this.__deltaTime; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Clock.prototype, "isPlaying", {
        /**
         * Whether its currently playing or not.
         */
        get: function () { return this.__isPlaying; },
        enumerable: true,
        configurable: true
    });
    /**
     * Update the clock.
     * @param time Time. You need to set manually when you are using manual Clock
     */
    Clock.prototype.update = function (time) {
        var prevTime = this.__time;
        this.__time = time || 0.0;
        this.__deltaTime = this.__time - prevTime;
    };
    /**
     * Start the clock.
     */
    Clock.prototype.play = function () {
        this.__isPlaying = true;
    };
    /**
     * Stop the clock.
     */
    Clock.prototype.pause = function () {
        this.__isPlaying = false;
    };
    /**
     * Set the time manually.
     * @param time Time
     */
    Clock.prototype.setTime = function (time) {
        this.__time = time;
    };
    return Clock;
}());
exports.Clock = Clock;


/***/ }),

/***/ "./src/Clock/ClockFrame.ts":
/*!*********************************!*\
  !*** ./src/Clock/ClockFrame.ts ***!
  \*********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var Clock_1 = __webpack_require__(/*! ./Clock */ "./src/Clock/Clock.ts");
/**
 * Class that deals with time.
 * This is "frame" type clock, the frame increases every {@link ClockFrame#update} call.
 * @param fps Frames per second
 */
var ClockFrame = /** @class */ (function (_super) {
    __extends(ClockFrame, _super);
    function ClockFrame(fps) {
        if (fps === void 0) { fps = 60; }
        var _this = _super.call(this) || this;
        /**
         * Its current frame.
         */
        _this.__frame = 0;
        _this.__fps = fps;
        return _this;
    }
    Object.defineProperty(ClockFrame.prototype, "frame", {
        /**
         * Its current frame.
         */
        get: function () { return this.__frame; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ClockFrame.prototype, "fps", {
        /**
         * Its fps.
         */
        get: function () { return this.__fps; },
        enumerable: true,
        configurable: true
    });
    /**
     * Update the clock. It will increase the frame by 1.
     */
    ClockFrame.prototype.update = function () {
        if (this.__isPlaying) {
            this.__time = this.__frame / this.__fps;
            this.__deltaTime = 1.0 / this.__fps;
            this.__frame++;
        }
        else {
            this.__deltaTime = 0.0;
        }
    };
    /**
     * Set the time manually.
     * The set time will be converted into internal frame count, so the time will not be exactly same as set one.
     * @param time Time
     */
    ClockFrame.prototype.setTime = function (time) {
        this.__frame = Math.floor(this.__fps * time);
        this.__time = this.__frame / this.__fps;
    };
    return ClockFrame;
}(Clock_1.Clock));
exports.ClockFrame = ClockFrame;


/***/ }),

/***/ "./src/Clock/ClockRealtime.ts":
/*!************************************!*\
  !*** ./src/Clock/ClockRealtime.ts ***!
  \************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var Clock_1 = __webpack_require__(/*! ./Clock */ "./src/Clock/Clock.ts");
/**
 * Class that deals with time.
 * This is "realtime" type clock, the time goes on as real world.
 */
var ClockRealtime = /** @class */ (function (_super) {
    __extends(ClockRealtime, _super);
    function ClockRealtime() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        /**
         * "You set the time manually to `__rtTime` when it's `__rtDate`."
         */
        _this.__rtTime = 0.0;
        /**
         * "You set the time manually to `__rtTime` when it's `__rtDate`."
         */
        _this.__rtDate = performance.now();
        return _this;
    }
    Object.defineProperty(ClockRealtime.prototype, "isRealtime", {
        /**
         * The clock is realtime. yeah.
         */
        get: function () { return true; },
        enumerable: true,
        configurable: true
    });
    /**
     * Update the clock. Time is calculated based on time in real world.
     */
    ClockRealtime.prototype.update = function () {
        var now = performance.now();
        if (this.__isPlaying) {
            var prevTime = this.__time;
            var deltaDate = (now - this.__rtDate);
            this.__time = this.__rtTime + deltaDate / 1000.0;
            this.__deltaTime = this.time - prevTime;
        }
        else {
            this.__rtTime = this.time;
            this.__rtDate = now;
            this.__deltaTime = 0.0;
        }
    };
    /**
     * Set the time manually.
     * @param time Time
     */
    ClockRealtime.prototype.setTime = function (time) {
        this.__time = time;
        this.__rtTime = this.time;
        this.__rtDate = performance.now();
    };
    return ClockRealtime;
}(Clock_1.Clock));
exports.ClockRealtime = ClockRealtime;


/***/ }),

/***/ "./src/Clock/index.ts":
/*!****************************!*\
  !*** ./src/Clock/index.ts ***!
  \****************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(__webpack_require__(/*! ./Clock */ "./src/Clock/Clock.ts"));
__export(__webpack_require__(/*! ./ClockFrame */ "./src/Clock/ClockFrame.ts"));
__export(__webpack_require__(/*! ./ClockRealtime */ "./src/Clock/ClockRealtime.ts"));


/***/ }),

/***/ "./src/ExpSmooth/ExpSmooth.ts":
/*!************************************!*\
  !*** ./src/ExpSmooth/ExpSmooth.ts ***!
  \************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var __1 = __webpack_require__(/*! .. */ "./src/index.ts");
/**
 * Do exp smoothing
 */
var ExpSmooth = /** @class */ (function () {
    function ExpSmooth() {
        this.factor = 10.0;
        this.target = 0.0;
        this.value = 0.0;
    }
    ExpSmooth.prototype.update = function (deltaTime) {
        this.value = __1.lerp(this.target, this.value, Math.exp(-this.factor * deltaTime));
        return this.value;
    };
    return ExpSmooth;
}());
exports.ExpSmooth = ExpSmooth;


/***/ }),

/***/ "./src/ExpSmooth/index.ts":
/*!********************************!*\
  !*** ./src/ExpSmooth/index.ts ***!
  \********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(__webpack_require__(/*! ./ExpSmooth */ "./src/ExpSmooth/ExpSmooth.ts"));


/***/ }),

/***/ "./src/FMS_Cat/FMS_Cat.ts":
/*!********************************!*\
  !*** ./src/FMS_Cat/FMS_Cat.ts ***!
  \********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Most awesome cat ever
 */
var FMS_Cat = /** @class */ (function () {
    function FMS_Cat() {
    }
    /**
     * FMS_Cat.gif
     */
    FMS_Cat.gif = 'https://fms-cat.com/images/fms_cat.gif';
    /**
     * FMS_Cat.png
     */
    FMS_Cat.png = 'https://fms-cat.com/images/fms_cat.png';
    return FMS_Cat;
}());
exports.FMS_Cat = FMS_Cat;


/***/ }),

/***/ "./src/FMS_Cat/index.ts":
/*!******************************!*\
  !*** ./src/FMS_Cat/index.ts ***!
  \******************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(__webpack_require__(/*! ./FMS_Cat */ "./src/FMS_Cat/FMS_Cat.ts"));


/***/ }),

/***/ "./src/FizzBuzz/FizzBuzz.ts":
/*!**********************************!*\
  !*** ./src/FizzBuzz/FizzBuzz.ts ***!
  \**********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Iterable FizzBuzz
 */
var FizzBuzz = /** @class */ (function () {
    function FizzBuzz(words, index, end) {
        if (words === void 0) { words = FizzBuzz.WordsDefault; }
        if (index === void 0) { index = 1; }
        if (end === void 0) { end = 100; }
        this.__words = words;
        this.__index = index;
        this.__end = end;
    }
    FizzBuzz.prototype[Symbol.iterator] = function () {
        return this;
    };
    FizzBuzz.prototype.next = function () {
        var e_1, _a;
        if (this.__end < this.__index) {
            return { done: true, value: null };
        }
        var value = '';
        try {
            for (var _b = __values(this.__words), _c = _b.next(); !_c.done; _c = _b.next()) {
                var _d = __read(_c.value, 2), rem = _d[0], word = _d[1];
                if ((this.__index % rem) === 0) {
                    value += word;
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
        if (value === '') {
            value = this.__index;
        }
        this.__index++;
        return { done: false, value: value };
    };
    FizzBuzz.WordsDefault = new Map([
        [3, 'Fizz'],
        [5, 'Buzz']
    ]);
    return FizzBuzz;
}());
exports.FizzBuzz = FizzBuzz;


/***/ }),

/***/ "./src/FizzBuzz/index.ts":
/*!*******************************!*\
  !*** ./src/FizzBuzz/index.ts ***!
  \*******************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(__webpack_require__(/*! ./FizzBuzz */ "./src/FizzBuzz/FizzBuzz.ts"));


/***/ }),

/***/ "./src/HistoryMeanCalculator/HistoryMeanCalculator.ts":
/*!************************************************************!*\
  !*** ./src/HistoryMeanCalculator/HistoryMeanCalculator.ts ***!
  \************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Useful for fps calc
 */
var HistoryMeanCalculator = /** @class */ (function () {
    function HistoryMeanCalculator(length) {
        this.__recalcForEach = 0;
        this.__countUntilRecalc = 0;
        this.__history = [];
        this.__index = 0;
        this.__count = 0;
        this.__cache = 0;
        this.__length = length;
        this.__recalcForEach = length;
        for (var i = 0; i < length; i++) {
            this.__history[i] = 0;
        }
    }
    Object.defineProperty(HistoryMeanCalculator.prototype, "mean", {
        get: function () {
            var count = Math.min(this.__count, this.__length);
            return count === 0 ? 0.0 : this.__cache / count;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(HistoryMeanCalculator.prototype, "recalcForEach", {
        get: function () {
            return this.__recalcForEach;
        },
        set: function (value) {
            var delta = value - this.__recalcForEach;
            this.__recalcForEach = value;
            this.__countUntilRecalc = Math.max(0, this.__countUntilRecalc + delta);
        },
        enumerable: true,
        configurable: true
    });
    HistoryMeanCalculator.prototype.reset = function () {
        this.__index = 0;
        this.__count = 0;
        this.__cache = 0;
        this.__countUntilRecalc = 0;
        for (var i = 0; i < this.__length; i++) {
            this.__history[i] = 0;
        }
    };
    HistoryMeanCalculator.prototype.push = function (value) {
        var prev = this.__history[this.__index];
        this.__history[this.__index] = value;
        this.__count++;
        this.__index = (this.__index + 1) % this.__length;
        if (this.__countUntilRecalc === 0) {
            return this.recalc();
        }
        else {
            this.__countUntilRecalc--;
            this.__cache -= prev;
            this.__cache += value;
            return this.mean;
        }
    };
    HistoryMeanCalculator.prototype.recalc = function () {
        this.__countUntilRecalc = this.__recalcForEach;
        var sum = this.__history
            .slice(0, Math.min(this.__count, this.__length))
            .reduce(function (sum, v) { return sum + v; }, 0);
        this.__cache = sum;
        return this.mean;
    };
    return HistoryMeanCalculator;
}());
exports.HistoryMeanCalculator = HistoryMeanCalculator;


/***/ }),

/***/ "./src/HistoryMeanCalculator/index.ts":
/*!********************************************!*\
  !*** ./src/HistoryMeanCalculator/index.ts ***!
  \********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(__webpack_require__(/*! ./HistoryMeanCalculator */ "./src/HistoryMeanCalculator/HistoryMeanCalculator.ts"));


/***/ }),

/***/ "./src/Swap/Swap.ts":
/*!**************************!*\
  !*** ./src/Swap/Swap.ts ***!
  \**************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Useful for swap buffer
 */
var Swap = /** @class */ (function () {
    function Swap(a, b) {
        this.i = a;
        this.o = b;
    }
    Swap.prototype.swap = function () {
        var i = this.i;
        this.i = this.o;
        this.o = i;
    };
    return Swap;
}());
exports.Swap = Swap;


/***/ }),

/***/ "./src/Swap/index.ts":
/*!***************************!*\
  !*** ./src/Swap/index.ts ***!
  \***************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(__webpack_require__(/*! ./Swap */ "./src/Swap/Swap.ts"));


/***/ }),

/***/ "./src/Xorshift/Xorshift.ts":
/*!**********************************!*\
  !*** ./src/Xorshift/Xorshift.ts ***!
  \**********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var Xorshift = /** @class */ (function () {
    function Xorshift(seed) {
        this.seed = seed || 1;
    }
    Xorshift.prototype.gen = function (seed) {
        if (seed) {
            this.seed = seed;
        }
        this.seed = this.seed ^ (this.seed << 13);
        this.seed = this.seed ^ (this.seed >>> 17);
        this.seed = this.seed ^ (this.seed << 5);
        return this.seed / Math.pow(2, 32) + 0.5;
    };
    Xorshift.prototype.set = function (seed) {
        this.seed = seed || this.seed || 1;
    };
    return Xorshift;
}());
exports.Xorshift = Xorshift;
exports.default = Xorshift;


/***/ }),

/***/ "./src/Xorshift/index.ts":
/*!*******************************!*\
  !*** ./src/Xorshift/index.ts ***!
  \*******************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(__webpack_require__(/*! ./Xorshift */ "./src/Xorshift/Xorshift.ts"));


/***/ }),

/***/ "./src/array/constants.ts":
/*!********************************!*\
  !*** ./src/array/constants.ts ***!
  \********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
/**
 * `[ -1, -1, 1, -1, -1, 1, 1, 1 ]`
 */
exports.TRIANGLE_STRIP_QUAD = [-1, -1, 1, -1, -1, 1, 1, 1];
/**
 * `[ -1, -1, 0, 1, -1, 0, -1, 1, 0, 1, 1, 0 ]`
 */
exports.TRIANGLE_STRIP_QUAD_3D = [-1, -1, 0, 1, -1, 0, -1, 1, 0, 1, 1, 0];
/**
 * `[ 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1 ]`
 */
exports.TRIANGLE_STRIP_QUAD_NORMAL = [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1];
/**
 * `[ 0, 0, 1, 0, 0, 1, 1, 1 ]`
 */
exports.TRIANGLE_STRIP_QUAD_UV = [0, 0, 1, 0, 0, 1, 1, 1];


/***/ }),

/***/ "./src/array/index.ts":
/*!****************************!*\
  !*** ./src/array/index.ts ***!
  \****************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(__webpack_require__(/*! ./constants */ "./src/array/constants.ts"));
__export(__webpack_require__(/*! ./utils */ "./src/array/utils.ts"));


/***/ }),

/***/ "./src/array/utils.ts":
/*!****************************!*\
  !*** ./src/array/utils.ts ***!
  \****************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Shuffle given `array` using given `dice` RNG. **Destructive**.
 */
function shuffleArray(array, dice) {
    var f = dice ? dice : function () { return Math.random(); };
    for (var i = 0; i < array.length - 1; i++) {
        var ir = i + Math.floor(f() * (array.length - i));
        var temp = array[ir];
        array[ir] = array[i];
        array[i] = temp;
    }
    return array;
}
exports.shuffleArray = shuffleArray;
/**
 * I like wireframe
 *
 * `triIndexToLineIndex( [ 0, 1, 2, 5, 6, 7 ] )` -> `[ 0, 1, 1, 2, 2, 0, 5, 6, 6, 7, 7, 5 ]`
 */
function triIndexToLineIndex(array) {
    var ret = [];
    for (var i = 0; i < array.length / 3; i++) {
        var head = i * 3;
        ret.push(array[head], array[head + 1], array[head + 1], array[head + 2], array[head + 2], array[head]);
    }
    return ret;
}
exports.triIndexToLineIndex = triIndexToLineIndex;
/**
 * `matrix2d( 3, 2 )` -> `[ 0, 0, 0, 1, 0, 2, 1, 0, 1, 1, 1, 2 ]`
 */
function matrix2d(w, h) {
    var arr = [];
    for (var iy = 0; iy < h; iy++) {
        for (var ix = 0; ix < w; ix++) {
            arr.push(ix, iy);
        }
    }
    return arr;
}
exports.matrix2d = matrix2d;


/***/ }),

/***/ "./src/index.ts":
/*!**********************!*\
  !*** ./src/index.ts ***!
  \**********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(__webpack_require__(/*! ./array */ "./src/array/index.ts"));
__export(__webpack_require__(/*! ./CDS */ "./src/CDS/index.ts"));
__export(__webpack_require__(/*! ./Clock */ "./src/Clock/index.ts"));
__export(__webpack_require__(/*! ./ExpSmooth */ "./src/ExpSmooth/index.ts"));
__export(__webpack_require__(/*! ./FizzBuzz */ "./src/FizzBuzz/index.ts"));
__export(__webpack_require__(/*! ./FMS_Cat */ "./src/FMS_Cat/index.ts"));
__export(__webpack_require__(/*! ./HistoryMeanCalculator */ "./src/HistoryMeanCalculator/index.ts"));
__export(__webpack_require__(/*! ./math */ "./src/math/index.ts"));
__export(__webpack_require__(/*! ./Swap */ "./src/Swap/index.ts"));
__export(__webpack_require__(/*! ./Xorshift */ "./src/Xorshift/index.ts"));


/***/ }),

/***/ "./src/math/Matrix4.ts":
/*!*****************************!*\
  !*** ./src/math/Matrix4.ts ***!
  \*****************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
Object.defineProperty(exports, "__esModule", { value: true });
var _1 = __webpack_require__(/*! . */ "./src/math/index.ts");
exports.rawIdentityMatrix4 = [
    1.0, 0.0, 0.0, 0.0,
    0.0, 1.0, 0.0, 0.0,
    0.0, 0.0, 1.0, 0.0,
    0.0, 0.0, 0.0, 1.0
];
/**
 * A Matrix4.
 */
var Matrix4 = /** @class */ (function () {
    function Matrix4(v) {
        if (v === void 0) { v = exports.rawIdentityMatrix4; }
        this.elements = v;
    }
    Object.defineProperty(Matrix4.prototype, "transpose", {
        /**
         * Itself but transposed.
         */
        get: function () {
            var m = this.elements;
            return new Matrix4([
                m[0], m[4], m[8], m[12],
                m[1], m[5], m[9], m[13],
                m[2], m[6], m[10], m[14],
                m[3], m[7], m[11], m[15]
            ]);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Matrix4.prototype, "determinant", {
        /**
         * Its determinant.
         */
        get: function () {
            var m = this.elements;
            var a00 = m[0], a01 = m[1], a02 = m[2], a03 = m[3], a10 = m[4], a11 = m[5], a12 = m[6], a13 = m[7], a20 = m[8], a21 = m[9], a22 = m[10], a23 = m[11], a30 = m[12], a31 = m[13], a32 = m[14], a33 = m[15], b00 = a00 * a11 - a01 * a10, b01 = a00 * a12 - a02 * a10, b02 = a00 * a13 - a03 * a10, b03 = a01 * a12 - a02 * a11, b04 = a01 * a13 - a03 * a11, b05 = a02 * a13 - a03 * a12, b06 = a20 * a31 - a21 * a30, b07 = a20 * a32 - a22 * a30, b08 = a20 * a33 - a23 * a30, b09 = a21 * a32 - a22 * a31, b10 = a21 * a33 - a23 * a31, b11 = a22 * a33 - a23 * a32;
            return b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Matrix4.prototype, "inverse", {
        /**
         * Itself but inverted.
         */
        get: function () {
            var m = this.elements;
            var a00 = m[0], a01 = m[1], a02 = m[2], a03 = m[3], a10 = m[4], a11 = m[5], a12 = m[6], a13 = m[7], a20 = m[8], a21 = m[9], a22 = m[10], a23 = m[11], a30 = m[12], a31 = m[13], a32 = m[14], a33 = m[15], b00 = a00 * a11 - a01 * a10, b01 = a00 * a12 - a02 * a10, b02 = a00 * a13 - a03 * a10, b03 = a01 * a12 - a02 * a11, b04 = a01 * a13 - a03 * a11, b05 = a02 * a13 - a03 * a12, b06 = a20 * a31 - a21 * a30, b07 = a20 * a32 - a22 * a30, b08 = a20 * a33 - a23 * a30, b09 = a21 * a32 - a22 * a31, b10 = a21 * a33 - a23 * a31, b11 = a22 * a33 - a23 * a32;
            var det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
            if (det === 0.0) {
                return null;
            }
            var invDet = 1.0 / det;
            return new Matrix4([
                a11 * b11 - a12 * b10 + a13 * b09,
                a02 * b10 - a01 * b11 - a03 * b09,
                a31 * b05 - a32 * b04 + a33 * b03,
                a22 * b04 - a21 * b05 - a23 * b03,
                a12 * b08 - a10 * b11 - a13 * b07,
                a00 * b11 - a02 * b08 + a03 * b07,
                a32 * b02 - a30 * b05 - a33 * b01,
                a20 * b05 - a22 * b02 + a23 * b01,
                a10 * b10 - a11 * b08 + a13 * b06,
                a01 * b08 - a00 * b10 - a03 * b06,
                a30 * b04 - a31 * b02 + a33 * b00,
                a21 * b02 - a20 * b04 - a23 * b00,
                a11 * b07 - a10 * b09 - a12 * b06,
                a00 * b09 - a01 * b07 + a02 * b06,
                a31 * b01 - a30 * b03 - a32 * b00,
                a20 * b03 - a21 * b01 + a22 * b00
            ].map(function (v) { return v * invDet; }));
        },
        enumerable: true,
        configurable: true
    });
    Matrix4.prototype.toString = function () {
        var m = this.elements.map(function (v) { return v.toFixed(3); });
        return "Matrix4( " + m[0] + ", " + m[4] + ", " + m[8] + ", " + m[12] + "; " + m[1] + ", " + m[5] + ", " + m[9] + ", " + m[13] + "; " + m[2] + ", " + m[6] + ", " + m[10] + ", " + m[14] + "; " + m[3] + ", " + m[7] + ", " + m[11] + ", " + m[15] + " )";
    };
    /**
     * Clone this.
     */
    Matrix4.prototype.clone = function () {
        return new Matrix4(this.elements.concat());
    };
    /**
     * Multiply this Matrix4 by one or more Matrix4s.
     */
    Matrix4.prototype.multiply = function () {
        var matrices = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            matrices[_i] = arguments[_i];
        }
        if (matrices.length === 0) {
            return this.clone();
        }
        var arr = matrices.concat();
        var bMat = arr.shift();
        if (0 < arr.length) {
            bMat = bMat.multiply.apply(bMat, __spread(arr));
        }
        var a = this.elements;
        var b = bMat.elements;
        return new Matrix4([
            a[0] * b[0] + a[4] * b[1] + a[8] * b[2] + a[12] * b[3],
            a[1] * b[0] + a[5] * b[1] + a[9] * b[2] + a[13] * b[3],
            a[2] * b[0] + a[6] * b[1] + a[10] * b[2] + a[14] * b[3],
            a[3] * b[0] + a[7] * b[1] + a[11] * b[2] + a[15] * b[3],
            a[0] * b[4] + a[4] * b[5] + a[8] * b[6] + a[12] * b[7],
            a[1] * b[4] + a[5] * b[5] + a[9] * b[6] + a[13] * b[7],
            a[2] * b[4] + a[6] * b[5] + a[10] * b[6] + a[14] * b[7],
            a[3] * b[4] + a[7] * b[5] + a[11] * b[6] + a[15] * b[7],
            a[0] * b[8] + a[4] * b[9] + a[8] * b[10] + a[12] * b[11],
            a[1] * b[8] + a[5] * b[9] + a[9] * b[10] + a[13] * b[11],
            a[2] * b[8] + a[6] * b[9] + a[10] * b[10] + a[14] * b[11],
            a[3] * b[8] + a[7] * b[9] + a[11] * b[10] + a[15] * b[11],
            a[0] * b[12] + a[4] * b[13] + a[8] * b[14] + a[12] * b[15],
            a[1] * b[12] + a[5] * b[13] + a[9] * b[14] + a[13] * b[15],
            a[2] * b[12] + a[6] * b[13] + a[10] * b[14] + a[14] * b[15],
            a[3] * b[12] + a[7] * b[13] + a[11] * b[14] + a[15] * b[15]
        ]);
    };
    /**
     * Multiply this Matrix4 by a scalar
     */
    Matrix4.prototype.scaleScalar = function (scalar) {
        return new Matrix4(this.elements.map(function (v) { return v * scalar; }));
    };
    Object.defineProperty(Matrix4, "identity", {
        /**
         * An identity Matrix4.
         */
        get: function () {
            return new Matrix4(exports.rawIdentityMatrix4);
        },
        enumerable: true,
        configurable: true
    });
    Matrix4.multiply = function () {
        var matrices = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            matrices[_i] = arguments[_i];
        }
        if (matrices.length === 0) {
            return Matrix4.identity;
        }
        else {
            var bMats = matrices.concat();
            var aMat = bMats.shift();
            return aMat.multiply.apply(aMat, __spread(bMats));
        }
    };
    /**
     * Generate a translation matrix.
     * @param vector Translation
     */
    Matrix4.translate = function (vector) {
        return new Matrix4([
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            vector.x, vector.y, vector.z, 1
        ]);
    };
    /**
     * Generate a 3d scaling matrix.
     * @param vector Scale
     */
    Matrix4.scale = function (vector) {
        return new Matrix4([
            vector.x, 0, 0, 0,
            0, vector.y, 0, 0,
            0, 0, vector.z, 0,
            0, 0, 0, 1
        ]);
    };
    /**
     * Generate a 3d scaling matrix by a scalar.
     * @param vector Scale
     */
    Matrix4.scaleScalar = function (scalar) {
        return new Matrix4([
            scalar, 0, 0, 0,
            0, scalar, 0, 0,
            0, 0, scalar, 0,
            0, 0, 0, 1
        ]);
    };
    /**
     * Generate a 3d rotation matrix, rotates around x axis.
     * @param vector Scale
     */
    Matrix4.rotateX = function (theta) {
        return new Matrix4([
            1, 0, 0, 0,
            0, Math.cos(theta), -Math.sin(theta), 0,
            0, Math.sin(theta), Math.cos(theta), 0,
            0, 0, 0, 1
        ]);
    };
    /**
     * Generate a 3d rotation matrix, rotates around y axis.
     * @param vector Scale
     */
    Matrix4.rotateY = function (theta) {
        return new Matrix4([
            Math.cos(theta), 0, Math.sin(theta), 0,
            0, 1, 0, 0,
            -Math.sin(theta), 0, Math.cos(theta), 0,
            0, 0, 0, 1
        ]);
    };
    /**
     * Generate a 3d rotation matrix, rotates around z axis.
     * @param vector Scale
     */
    Matrix4.rotateZ = function (theta) {
        return new Matrix4([
            Math.cos(theta), -Math.sin(theta), 0, 0,
            Math.sin(theta), Math.cos(theta), 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ]);
    };
    /**
     * Generate a "LookAt" view matrix.
     */
    Matrix4.lookAt = function (position, target, up, roll) {
        if (target === void 0) { target = new _1.Vector3([0.0, 0.0, 0.0]); }
        if (up === void 0) { up = new _1.Vector3([0.0, 1.0, 0.0]); }
        if (roll === void 0) { roll = 0.0; }
        var dir = position.sub(target).normalized;
        var sid = up.cross(dir).normalized;
        var top = dir.cross(sid);
        sid = sid.scale(Math.cos(roll)).add(top.scale(Math.sin(roll)));
        top = dir.cross(sid);
        return new Matrix4([
            sid.x, sid.y, sid.z, 0.0,
            top.x, top.y, top.z, 0.0,
            dir.x, dir.y, dir.z, 0.0,
            position.x, position.y, position.z, 1.0
        ]);
    };
    /**
     * Generate a "Perspective" projection matrix.
     * It won't include aspect!
     */
    Matrix4.perspective = function (fov, near, far) {
        if (fov === void 0) { fov = 45.0; }
        if (near === void 0) { near = 0.01; }
        if (far === void 0) { far = 100.0; }
        var p = 1.0 / Math.tan(fov * Math.PI / 360.0);
        var d = (far - near);
        return new Matrix4([
            p, 0.0, 0.0, 0.0,
            0.0, p, 0.0, 0.0,
            0.0, 0.0, -(far + near) / d, -1.0,
            0.0, 0.0, -2 * far * near / d, 0.0
        ]);
    };
    /**
     * Decompose this matrix into a position, a scale, and a rotation.
     * Yoinked from Three.js.
     */
    Matrix4.prototype.decompose = function () {
        var m = this.elements;
        var sx = new _1.Vector3([m[0], m[1], m[2]]).length;
        var sy = new _1.Vector3([m[4], m[5], m[6]]).length;
        var sz = new _1.Vector3([m[8], m[9], m[10]]).length;
        // if determine is negative, we need to invert one scale
        var det = this.determinant;
        if (det < 0) {
            sx = -sx;
        }
        var invSx = 1.0 / sx;
        var invSy = 1.0 / sy;
        var invSz = 1.0 / sz;
        var rotationMatrix = this.clone();
        rotationMatrix.elements[0] *= invSx;
        rotationMatrix.elements[1] *= invSx;
        rotationMatrix.elements[2] *= invSx;
        rotationMatrix.elements[4] *= invSy;
        rotationMatrix.elements[5] *= invSy;
        rotationMatrix.elements[6] *= invSy;
        rotationMatrix.elements[8] *= invSz;
        rotationMatrix.elements[9] *= invSz;
        rotationMatrix.elements[10] *= invSz;
        return {
            position: new _1.Vector3([m[12], m[13], m[14]]),
            scale: new _1.Vector3([sx, sy, sz]),
            rotation: _1.Quaternion.fromMatrix(rotationMatrix)
        };
    };
    /**
     * Compose a matrix out of position, scale, and rotation.
     * Yoinked from Three.js.
     */
    Matrix4.compose = function (position, rotation, scale) {
        var x = rotation.x, y = rotation.y, z = rotation.z, w = rotation.w;
        var x2 = x + x, y2 = y + y, z2 = z + z;
        var xx = x * x2, xy = x * y2, xz = x * z2;
        var yy = y * y2, yz = y * z2, zz = z * z2;
        var wx = w * x2, wy = w * y2, wz = w * z2;
        var sx = scale.x, sy = scale.y, sz = scale.z;
        return new Matrix4([
            (1.0 - (yy + zz)) * sx,
            (xy + wz) * sx,
            (xz - wy) * sx,
            0.0,
            (xy - wz) * sy,
            (1.0 - (xx + zz)) * sy,
            (yz + wx) * sy,
            0.0,
            (xz + wy) * sz,
            (yz - wx) * sz,
            (1.0 - (xx + yy)) * sz,
            0.0,
            position.x,
            position.y,
            position.z,
            1.0
        ]);
    };
    return Matrix4;
}());
exports.Matrix4 = Matrix4;


/***/ }),

/***/ "./src/math/Quaternion.ts":
/*!********************************!*\
  !*** ./src/math/Quaternion.ts ***!
  \********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var _1 = __webpack_require__(/*! . */ "./src/math/index.ts");
exports.rawIdentityQuaternion = [0.0, 0.0, 0.0, 1.0];
/**
 * A Quaternion.
 */
var Quaternion = /** @class */ (function () {
    function Quaternion(elements) {
        if (elements === void 0) { elements = exports.rawIdentityQuaternion; }
        this.elements = elements;
    }
    Object.defineProperty(Quaternion.prototype, "x", {
        /**
         * An x component of this.
         */
        get: function () {
            return this.elements[0];
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Quaternion.prototype, "y", {
        /**
         * An y component of this.
         */
        get: function () {
            return this.elements[1];
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Quaternion.prototype, "z", {
        /**
         * An z component of this.
         */
        get: function () {
            return this.elements[2];
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Quaternion.prototype, "w", {
        /**
         * An w component of this.
         */
        get: function () {
            return this.elements[3];
        },
        enumerable: true,
        configurable: true
    });
    Quaternion.prototype.toString = function () {
        return "Quaternion( " + this.x.toFixed(3) + ", " + this.y.toFixed(3) + ", " + this.z.toFixed(3) + ", " + this.w.toFixed(3) + " )";
    };
    /**
     * Clone this.
     */
    Quaternion.prototype.clone = function () {
        return new Quaternion(this.elements.concat());
    };
    Object.defineProperty(Quaternion.prototype, "matrix", {
        /**
         * Itself but converted into a Matrix4.
         */
        get: function () {
            var x = new _1.Vector3([1.0, 0.0, 0.0]).applyQuaternion(this);
            var y = new _1.Vector3([0.0, 1.0, 0.0]).applyQuaternion(this);
            var z = new _1.Vector3([0.0, 0.0, 1.0]).applyQuaternion(this);
            return new _1.Matrix4([
                x.x, y.x, z.x, 0.0,
                x.y, y.y, z.y, 0.0,
                x.z, y.z, z.z, 0.0,
                0.0, 0.0, 0.0, 1.0
            ]);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Quaternion.prototype, "inversed", {
        /**
         * An inverse of this.
         */
        get: function () {
            return new Quaternion([
                -this.x,
                -this.y,
                -this.z,
                this.w
            ]);
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Multiply two Quaternions.
     * @param q Another Quaternion
     */
    Quaternion.prototype.multiply = function (q) {
        return new Quaternion([
            this.w * q.x + this.x * q.w + this.y * q.z - this.z * q.y,
            this.w * q.y - this.x * q.z + this.y * q.w + this.z * q.x,
            this.w * q.z + this.x * q.y - this.y * q.x + this.z * q.w,
            this.w * q.w - this.x * q.x - this.y * q.y - this.z * q.z
        ]);
    };
    Object.defineProperty(Quaternion, "identity", {
        /**
         * An identity Quaternion.
         */
        get: function () {
            return new Quaternion(exports.rawIdentityQuaternion);
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Generate a Quaternion out of angle and axis.
     */
    Quaternion.fromAxisAngle = function (axis, angle) {
        var halfAngle = angle / 2.0;
        var sinHalfAngle = Math.sin(halfAngle);
        return new Quaternion([
            axis.x * sinHalfAngle,
            axis.y * sinHalfAngle,
            axis.z * sinHalfAngle,
            Math.cos(halfAngle)
        ]);
    };
    /**
     * Generate a Quaternion out of a rotation matrix.
     * Yoinked from Three.js.
     */
    Quaternion.fromMatrix = function (matrix) {
        var m = matrix.elements, m11 = m[0], m12 = m[4], m13 = m[8], m21 = m[1], m22 = m[5], m23 = m[9], m31 = m[2], m32 = m[6], m33 = m[10], trace = m11 + m22 + m33;
        if (trace > 0) {
            var s = 0.5 / Math.sqrt(trace + 1.0);
            return new Quaternion([
                (m32 - m23) * s,
                (m13 - m31) * s,
                (m21 - m12) * s,
                0.25 / s
            ]);
        }
        else if (m11 > m22 && m11 > m33) {
            var s = 2.0 * Math.sqrt(1.0 + m11 - m22 - m33);
            return new Quaternion([
                0.25 * s,
                (m12 + m21) / s,
                (m13 + m31) / s,
                (m32 - m23) / s
            ]);
        }
        else if (m22 > m33) {
            var s = 2.0 * Math.sqrt(1.0 + m22 - m11 - m33);
            return new Quaternion([
                (m12 + m21) / s,
                0.25 * s,
                (m23 + m32) / s,
                (m13 - m31) / s
            ]);
        }
        else {
            var s = 2.0 * Math.sqrt(1.0 + m33 - m11 - m22);
            return new Quaternion([
                (m13 + m31) / s,
                (m23 + m32) / s,
                0.25 * s,
                (m21 - m12) / s
            ]);
        }
    };
    return Quaternion;
}());
exports.Quaternion = Quaternion;


/***/ }),

/***/ "./src/math/Vector.ts":
/*!****************************!*\
  !*** ./src/math/Vector.ts ***!
  \****************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
/**
 * A Vector.
 */
var Vector = /** @class */ (function () {
    function Vector() {
    }
    Object.defineProperty(Vector.prototype, "length", {
        /**
         * The length of this.
         * a.k.a. `magnitude`
         */
        get: function () {
            return Math.sqrt(this.elements.reduce(function (sum, v) { return sum + v * v; }, 0.0));
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Vector.prototype, "normalized", {
        /**
         * A normalized Vector3 of this.
         */
        get: function () {
            return this.scale(1.0 / this.length);
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Clone this.
     */
    Vector.prototype.clone = function () {
        return this.__new(this.elements.concat());
    };
    /**
     * Add a Vector into this.
     * @param vector Another Vector
     */
    Vector.prototype.add = function (vector) {
        return this.__new(this.elements.map(function (v, i) { return v + vector.elements[i]; }));
    };
    /**
     * Substract this from another Vector.
     * @param v Another vector
     */
    Vector.prototype.sub = function (vector) {
        return this.__new(this.elements.map(function (v, i) { return v - vector.elements[i]; }));
    };
    /**
     * Multiply a Vector with this.
     * @param vector Another Vector
     */
    Vector.prototype.multiply = function (vector) {
        return this.__new(this.elements.map(function (v, i) { return v * vector.elements[i]; }));
    };
    /**
     * Divide this from another Vector.
     * @param vector Another Vector
     */
    Vector.prototype.divide = function (vector) {
        return this.__new(this.elements.map(function (v, i) { return v / vector.elements[i]; }));
    };
    /**
     * Scale this by scalar.
     * a.k.a. `multiplyScalar`
     * @param scalar A scalar
     */
    Vector.prototype.scale = function (scalar) {
        return this.__new(this.elements.map(function (v) { return v * scalar; }));
    };
    /**
     * Dot two Vectors.
     * @param vector Another vector
     */
    Vector.prototype.dot = function (vector) {
        return this.elements.reduce(function (sum, v, i) { return sum + v * vector.elements[i]; }, 0.0);
    };
    return Vector;
}());
exports.Vector = Vector;


/***/ }),

/***/ "./src/math/Vector3.ts":
/*!*****************************!*\
  !*** ./src/math/Vector3.ts ***!
  \*****************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var _1 = __webpack_require__(/*! . */ "./src/math/index.ts");
/**
 * A Vector3.
 */
var Vector3 = /** @class */ (function (_super) {
    __extends(Vector3, _super);
    function Vector3(v) {
        if (v === void 0) { v = [0.0, 0.0, 0.0]; }
        var _this = _super.call(this) || this;
        _this.elements = v;
        return _this;
    }
    Object.defineProperty(Vector3.prototype, "x", {
        /**
         * An x component of this.
         */
        get: function () {
            return this.elements[0];
        },
        set: function (x) {
            this.elements[0] = x;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Vector3.prototype, "y", {
        /**
         * An y component of this.
         */
        get: function () {
            return this.elements[1];
        },
        set: function (y) {
            this.elements[1] = y;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Vector3.prototype, "z", {
        /**
         * An z component of this.
         */
        get: function () {
            return this.elements[2];
        },
        set: function (z) {
            this.elements[2] = z;
        },
        enumerable: true,
        configurable: true
    });
    Vector3.prototype.toString = function () {
        return "Vector3( " + this.x.toFixed(3) + ", " + this.y.toFixed(3) + ", " + this.z.toFixed(3) + " )";
    };
    /**
     * Return a cross of this and another Vector3.
     * @param vector Another vector
     */
    Vector3.prototype.cross = function (vector) {
        return new Vector3([
            this.y * vector.z - this.z * vector.y,
            this.z * vector.x - this.x * vector.z,
            this.x * vector.y - this.y * vector.x
        ]);
    };
    /**
     * Rotate this vector using a Quaternion.
     * @param quaternion A quaternion
     */
    Vector3.prototype.applyQuaternion = function (quaternion) {
        var p = new _1.Quaternion([this.x, this.y, this.z, 0.0]);
        var r = quaternion.inversed;
        var res = quaternion.multiply(p).multiply(r);
        return new Vector3([res.x, res.y, res.z]);
    };
    /**
     * Multiply this vector (with an implicit 1 in the 4th dimension) by m.
     */
    Vector3.prototype.applyMatrix4 = function (matrix) {
        var m = matrix.elements;
        var w = m[3] * this.x + m[7] * this.y + m[11] * this.z + m[15];
        var invW = 1.0 / w;
        return new Vector3([
            (m[0] * this.x + m[4] * this.y + m[8] * this.z + m[12]) * invW,
            (m[1] * this.x + m[5] * this.y + m[9] * this.z + m[13]) * invW,
            (m[2] * this.x + m[6] * this.y + m[10] * this.z + m[14]) * invW
        ]);
    };
    Vector3.prototype.__new = function (v) {
        return new Vector3(v);
    };
    Object.defineProperty(Vector3, "zero", {
        /**
         * Vector3( 0.0, 0.0, 0.0 )
         */
        get: function () {
            return new Vector3([0.0, 0.0, 0.0]);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Vector3, "one", {
        /**
         * Vector3( 1.0, 1.0, 1.0 )
         */
        get: function () {
            return new Vector3([1.0, 1.0, 1.0]);
        },
        enumerable: true,
        configurable: true
    });
    return Vector3;
}(_1.Vector));
exports.Vector3 = Vector3;


/***/ }),

/***/ "./src/math/Vector4.ts":
/*!*****************************!*\
  !*** ./src/math/Vector4.ts ***!
  \*****************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var _1 = __webpack_require__(/*! . */ "./src/math/index.ts");
/**
 * A Vector3.
 */
var Vector4 = /** @class */ (function (_super) {
    __extends(Vector4, _super);
    function Vector4(v) {
        if (v === void 0) { v = [0.0, 0.0, 0.0, 0.0]; }
        var _this = _super.call(this) || this;
        _this.elements = v;
        return _this;
    }
    Object.defineProperty(Vector4.prototype, "x", {
        /**
         * An x component of this.
         */
        get: function () {
            return this.elements[0];
        },
        set: function (x) {
            this.elements[0] = x;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Vector4.prototype, "y", {
        /**
         * A y component of this.
         */
        get: function () {
            return this.elements[1];
        },
        set: function (y) {
            this.elements[1] = y;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Vector4.prototype, "z", {
        /**
         * A z component of this.
         */
        get: function () {
            return this.elements[2];
        },
        set: function (z) {
            this.elements[2] = z;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Vector4.prototype, "w", {
        /**
         * A w component of this.
         */
        get: function () {
            return this.elements[3];
        },
        set: function (z) {
            this.elements[3] = z;
        },
        enumerable: true,
        configurable: true
    });
    Vector4.prototype.toString = function () {
        return "Vector4( " + this.x.toFixed(3) + ", " + this.y.toFixed(3) + ", " + this.z.toFixed(3) + ", " + this.w.toFixed(3) + " )";
    };
    /**
     * Multiply this vector (with an implicit 1 in the 4th dimension) by m.
     */
    Vector4.prototype.applyMatrix4 = function (matrix) {
        var m = matrix.elements;
        return new Vector4([
            m[0] * this.x + m[4] * this.y + m[8] * this.z + m[12] * this.w,
            m[1] * this.x + m[5] * this.y + m[9] * this.z + m[13] * this.w,
            m[2] * this.x + m[6] * this.y + m[10] * this.z + m[14] * this.w,
            m[3] * this.x + m[7] * this.y + m[11] * this.z + m[15] * this.w
        ]);
    };
    Vector4.prototype.__new = function (v) {
        return new Vector4(v);
    };
    Object.defineProperty(Vector4, "zero", {
        /**
         * Vector4( 0.0, 0.0, 0.0, 0.0 )
         */
        get: function () {
            return new Vector4([0.0, 0.0, 0.0, 0.0]);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Vector4, "one", {
        /**
         * Vector4( 1.0, 1.0, 1.0, 1.0 )
         */
        get: function () {
            return new Vector4([1.0, 1.0, 1.0, 1.0]);
        },
        enumerable: true,
        configurable: true
    });
    return Vector4;
}(_1.Vector));
exports.Vector4 = Vector4;


/***/ }),

/***/ "./src/math/index.ts":
/*!***************************!*\
  !*** ./src/math/index.ts ***!
  \***************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(__webpack_require__(/*! ./Matrix4 */ "./src/math/Matrix4.ts"));
__export(__webpack_require__(/*! ./Quaternion */ "./src/math/Quaternion.ts"));
__export(__webpack_require__(/*! ./Vector */ "./src/math/Vector.ts"));
__export(__webpack_require__(/*! ./Vector3 */ "./src/math/Vector3.ts"));
__export(__webpack_require__(/*! ./Vector4 */ "./src/math/Vector4.ts"));
__export(__webpack_require__(/*! ./utils */ "./src/math/utils.ts"));


/***/ }),

/***/ "./src/math/utils.ts":
/*!***************************!*\
  !*** ./src/math/utils.ts ***!
  \***************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
/**
 * `lerp`, or `mix`
 */
function lerp(a, b, x) {
    return a + (b - a) * x;
}
exports.lerp = lerp;
/**
 * `clamp`
 */
function clamp(x, l, h) {
    return Math.min(Math.max(x, l), h);
}
exports.clamp = clamp;
/**
 * `clamp( x, 0.0, 1.0 )`
 */
function saturate(x) {
    return clamp(x, 0.0, 1.0);
}
exports.saturate = saturate;
/**
 * `smoothstep` but not smooth
 */
function linearstep(a, b, x) {
    return saturate((x - a) / (b - a));
}
exports.linearstep = linearstep;
/**
 * world famous `smoothstep` function
 */
function smoothstep(a, b, x) {
    var t = linearstep(a, b, x);
    return t * t * (3.0 - 2.0 * t);
}
exports.smoothstep = smoothstep;
/**
 * `smoothstep` but more smooth
 */
function smootherstep(a, b, x) {
    var t = linearstep(a, b, x);
    return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
}
exports.smootherstep = smootherstep;
/**
 * `smoothstep` but WAY more smooth
 */
function smootheststep(a, b, x) {
    var t = linearstep(a, b, x);
    return t * t * t * t * (t * (t * (-20.0 * t + 70.0) - 84.0) + 35.0);
}
exports.smootheststep = smootheststep;


/***/ })

/******/ });
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9GTVNfQ0FUX0VYUEVSSU1FTlRBTC93ZWJwYWNrL3VuaXZlcnNhbE1vZHVsZURlZmluaXRpb24iLCJ3ZWJwYWNrOi8vRk1TX0NBVF9FWFBFUklNRU5UQUwvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vRk1TX0NBVF9FWFBFUklNRU5UQUwvLi9zcmMvQ0RTL0NEUy50cyIsIndlYnBhY2s6Ly9GTVNfQ0FUX0VYUEVSSU1FTlRBTC8uL3NyYy9DRFMvaW5kZXgudHMiLCJ3ZWJwYWNrOi8vRk1TX0NBVF9FWFBFUklNRU5UQUwvLi9zcmMvQ2xvY2svQ2xvY2sudHMiLCJ3ZWJwYWNrOi8vRk1TX0NBVF9FWFBFUklNRU5UQUwvLi9zcmMvQ2xvY2svQ2xvY2tGcmFtZS50cyIsIndlYnBhY2s6Ly9GTVNfQ0FUX0VYUEVSSU1FTlRBTC8uL3NyYy9DbG9jay9DbG9ja1JlYWx0aW1lLnRzIiwid2VicGFjazovL0ZNU19DQVRfRVhQRVJJTUVOVEFMLy4vc3JjL0Nsb2NrL2luZGV4LnRzIiwid2VicGFjazovL0ZNU19DQVRfRVhQRVJJTUVOVEFMLy4vc3JjL0V4cFNtb290aC9FeHBTbW9vdGgudHMiLCJ3ZWJwYWNrOi8vRk1TX0NBVF9FWFBFUklNRU5UQUwvLi9zcmMvRXhwU21vb3RoL2luZGV4LnRzIiwid2VicGFjazovL0ZNU19DQVRfRVhQRVJJTUVOVEFMLy4vc3JjL0ZNU19DYXQvRk1TX0NhdC50cyIsIndlYnBhY2s6Ly9GTVNfQ0FUX0VYUEVSSU1FTlRBTC8uL3NyYy9GTVNfQ2F0L2luZGV4LnRzIiwid2VicGFjazovL0ZNU19DQVRfRVhQRVJJTUVOVEFMLy4vc3JjL0ZpenpCdXp6L0ZpenpCdXp6LnRzIiwid2VicGFjazovL0ZNU19DQVRfRVhQRVJJTUVOVEFMLy4vc3JjL0ZpenpCdXp6L2luZGV4LnRzIiwid2VicGFjazovL0ZNU19DQVRfRVhQRVJJTUVOVEFMLy4vc3JjL0hpc3RvcnlNZWFuQ2FsY3VsYXRvci9IaXN0b3J5TWVhbkNhbGN1bGF0b3IudHMiLCJ3ZWJwYWNrOi8vRk1TX0NBVF9FWFBFUklNRU5UQUwvLi9zcmMvSGlzdG9yeU1lYW5DYWxjdWxhdG9yL2luZGV4LnRzIiwid2VicGFjazovL0ZNU19DQVRfRVhQRVJJTUVOVEFMLy4vc3JjL1N3YXAvU3dhcC50cyIsIndlYnBhY2s6Ly9GTVNfQ0FUX0VYUEVSSU1FTlRBTC8uL3NyYy9Td2FwL2luZGV4LnRzIiwid2VicGFjazovL0ZNU19DQVRfRVhQRVJJTUVOVEFMLy4vc3JjL1hvcnNoaWZ0L1hvcnNoaWZ0LnRzIiwid2VicGFjazovL0ZNU19DQVRfRVhQRVJJTUVOVEFMLy4vc3JjL1hvcnNoaWZ0L2luZGV4LnRzIiwid2VicGFjazovL0ZNU19DQVRfRVhQRVJJTUVOVEFMLy4vc3JjL2FycmF5L2NvbnN0YW50cy50cyIsIndlYnBhY2s6Ly9GTVNfQ0FUX0VYUEVSSU1FTlRBTC8uL3NyYy9hcnJheS9pbmRleC50cyIsIndlYnBhY2s6Ly9GTVNfQ0FUX0VYUEVSSU1FTlRBTC8uL3NyYy9hcnJheS91dGlscy50cyIsIndlYnBhY2s6Ly9GTVNfQ0FUX0VYUEVSSU1FTlRBTC8uL3NyYy9pbmRleC50cyIsIndlYnBhY2s6Ly9GTVNfQ0FUX0VYUEVSSU1FTlRBTC8uL3NyYy9tYXRoL01hdHJpeDQudHMiLCJ3ZWJwYWNrOi8vRk1TX0NBVF9FWFBFUklNRU5UQUwvLi9zcmMvbWF0aC9RdWF0ZXJuaW9uLnRzIiwid2VicGFjazovL0ZNU19DQVRfRVhQRVJJTUVOVEFMLy4vc3JjL21hdGgvVmVjdG9yLnRzIiwid2VicGFjazovL0ZNU19DQVRfRVhQRVJJTUVOVEFMLy4vc3JjL21hdGgvVmVjdG9yMy50cyIsIndlYnBhY2s6Ly9GTVNfQ0FUX0VYUEVSSU1FTlRBTC8uL3NyYy9tYXRoL1ZlY3RvcjQudHMiLCJ3ZWJwYWNrOi8vRk1TX0NBVF9FWFBFUklNRU5UQUwvLi9zcmMvbWF0aC9pbmRleC50cyIsIndlYnBhY2s6Ly9GTVNfQ0FUX0VYUEVSSU1FTlRBTC8uL3NyYy9tYXRoL3V0aWxzLnRzIl0s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Q0FBQyxDQUFFLEVBQUUsR0FBRyxHQUFHLENBQUMsQ0FBRyxDQUFDLENBQUUsRUFDMUQsR0FBRyxHQUFHLENBQUMsQ0FBRyxDQUFDLENBQUUsRUFBRSxHQUFHLEdBQUcsQ0FBQyxDQUFHLENBQUMsQ0FBRSxFQUFFLEdBQUcsR0FBRyxDQUFDLENBQUUsRUFBRSxDQUFFLEVBQUUsR0FBRyxHQUFHLENBQUMsQ0FBRSxFQUFFLENBQUUsRUFDMUQsR0FBRyxHQUFHLENBQUMsQ0FBRSxFQUFFLENBQUUsRUFBRSxHQUFHLEdBQUcsQ0FBQyxDQUFFLEVBQUUsQ0FBRSxFQUFFLEdBQUcsR0FBRyxDQUFDLENBQUUsRUFBRSxDQUFFLEVBQUUsR0FBRyxHQUFHLENBQUMsQ0FBRSxFQUFFLENBQUUsRUFDMUQsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsRUFBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxFQUN6RCxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxFQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEVBQ3pELEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEVBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsRUFDekQsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsRUFBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxFQUN6RCxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxFQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEVBQ3pELEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEVBQUcsR0FBRyxHQUFHLEdB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QUUsRUFBRSxDQUFFLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRTtZQUN0RSxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsRUFBRSxDQUFFLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRTtZQUN0RSxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLEVBQUUsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsRUFBRSxDQUFFLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRTtZQUN2RSxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLEVBQUUsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsRUFBRSxDQUFFLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRTtZQUV2RSxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsRUFBRSxDQUFFLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRTtZQUN0RSxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsRUFBRSxDQUFFLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRTtZQUN0RSxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLEVBQUUsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsRUFBRSxDQUFFLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRTtZQUN2RSxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLEVBQUUsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsRUFBRSxDQUFFLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRTtZQUV2RSxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxFQUFFLENBQUUsR0FBRyxDQUFDLENBQUUsRUFBRSxDQUFFLEdBQUcsQ0FBQyxDQUFFLEVBQUUsQ0FBRTtZQUN4RSxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxFQUFFLENBQUUsR0FBRyxDQUFDLENBQUUsRUFBRSxDQUFFLEdBQUcsQ0FBQyxDQUFFLEVBQUUsQ0FBRTtZQUN4RSxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLEVBQUUsQ0FBRSxHQUFHLENBQUMsQ0FBRSxFQUFFLENBQUUsR0FBRyxDQUFDLENBQUUsRUFBRSxDQUFFLEdBQUcsQ0FBQyxDQUFFLEVBQUUsQ0FBRTtZQUN6RSxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLEVBQUUsQ0FBRSxHQUFHLENBQUMsQ0FBRSxFQUFFLENBQUUsR0FBRyxDQUFDLENBQUUsRUFBRSxDQUFFLEdBQUcsQ0FBQyxDQUFFLEVBQUUsQ0FBRTtZQUV6RSxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLEVBQUUsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsRUFBRSxDQUFFLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxFQUFFLENBQUUsR0FBRyxDQUFDLENBQUUsRUFBRSxDQUFFLEdBQUcsQ0FBQyxDQUFFLEVBQUUsQ0FBRTtZQUMxRSxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLEVBQUUsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsRUFBRSxDQUFFLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxFQUFFLENBQUUsR0FBRyxDQUFDLENBQUUsRUFBRSxDQUFFLEdBQUcsQ0FBQyxDQUFFLEVBQUUsQ0FBRTtZQUMxRSxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLEVBQUUsQ0FB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LENBQUUsQ0FBQyxNQUFNLENBQUM7UUFDMUQsSUFBTSxFQUFFLEdBQUcsSUFBSSxVQUFPLENBQUUsQ0FBRSxDQUFDLENBQUUsQ0FBQyxDQUFFLEVBQUUsQ0FBQyxDQUFFLENBQUMsQ0FBRSxFQUFFLENBQUMsQ0FBRSxDQUFDLENBQUUsQ0FBRSxDQUFFLENBQUMsTUFBTSxDQUFDO1FBQzVELElBQU0sRUFBRSxHQUFHLElBQUksVUFBTyxDQUFFLENBQUUsQ0FBQyxDQUFFLENBQUMsQ0FBRSxFQUFFLENBQUMsQ0FBRSxDQUFDLENBQUUsRUFBRSxDQUFDLENBQUUsRUFBRSxDQUFFLENBQUUsQ0FBRSxDQUFDLE1BQU0sQ0FBQztRQUU3RCx3REFBd0Q7UUFDeEQsSUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQztRQUM3QixJQUFLLEdBQUcsR0FBRyxDQUFDLEVBQUc7WUFBRSxFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUM7U0FBRTtRQUU1QixJQUFNLEtBQUssR0FBRyxHQUFHLEdBQUcsRUFBRSxDQUFDO1FBQ3ZCLElBQU0sS0FBSyxHQUFHLEdBQUcsR0FBRyxFQUFFLENBQUM7UUFDdkIsSUFBTSxLQUFLLEdBQUcsR0FBRyxHQUFHLEVBQUUsQ0FBQztRQUV2QixJQUFNLGNBQWMsR0FBRyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7UUFFcEMsY0FBYyxDQUFDLFFBQVEsQ0FBRSxDQUFDLENBQUUsSUFBSSxLQUFLLENBQUM7UUFDdEMsY0FBYyxDQUFDLFFBQVEsQ0FBRSxDQUFDLENBQUUsSUFBSSxLQUFLLENBQUM7UUFDdEMsY0FBYyxDQUFDLFFBQVEsQ0FBRSxDQUFDLENBQUUsSUFBSSxLQUFLLENBQUM7UUFFdEMsY0FBYyxDQUFDLFFBQVEsQ0FBRSxDQUFDLENBQUUsSUFBSSxLQUFLLENBQUM7UUFDdEMsY0FBYyxDQUFDLFFBQVEsQ0FBRSxDQUFDLENBQUUsSUFBSSxLQUFLLENBQUM7UUFDdEMsY0FBYyxDQUFDLFFBQVEsQ0FBRSxDQUFDLENBQUUsSUFBSSxLQUFLLENBQUM7UUFFdEMsY0FBYyxD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Q0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBRSxDQUFDLEdBQUcsQ0FBRSxDQUFDLEdBQUcsR0FBRyxHQUFHLElBQUksQ0FBRSxHQUFHLElBQUksQ0FBRSxDQUFDO0FBQ3ZELENBQUM7QUFIRCxvQ0FHQztBQUVEOztHQUVHO0FBQ0gsU0FBZ0IsYUFBYSxDQUFFLENBQVMsRUFBRSxDQUFTLEVBQUUsQ0FBUztJQUM1RCxJQUFNLENBQUMsR0FBRyxVQUFVLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsQ0FBQztJQUNoQyxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFFLENBQUMsR0FBRyxDQUFFLENBQUMsR0FBRyxDQUFFLENBQUMsSUFBSSxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUUsR0FBRyxJQUFJLENBQUUsR0FBRyxJQUFJLENBQUUsQ0FBQztBQUM1RSxDQUFDO0FBSEQsc0NBR0MiLCJmaWxlIjoiZm1zLWNhdC1leHBlcmltZW50YWwuZGV2LmpzIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIHdlYnBhY2tVbml2ZXJzYWxNb2R1bGVEZWZpbml0aW9uKHJvb3QsIGZhY3RvcnkpIHtcblx0aWYodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnICYmIHR5cGVvZiBtb2R1bGUgPT09ICdvYmplY3QnKVxuXHRcdG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeSgpO1xuXHRlbHNlIGlmKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZClcblx0XHRkZWZpbmUoW10sIGZhY3RvcnkpO1xuXHRlbHNlIGlmKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jylcblx0XHRleHBvcnRzW1wiRk1TX0NBVF9FWFBFUklNRU5UQUxcIl0gPSBmYWN0b3J5KCk7XG5cdGVsc2Vcblx0XHRyb290W1wiRk1TX0NBVF9FWFBFUklNRU5UQUxcIl0gPSBmYWN0b3J5KCk7XG59KSh0aGlzLCBmdW5jdGlvbigpIHtcbnJldHVybiAiLCIgXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuXG4gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXG4gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSkge1xuIFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5leHBvcnRzO1xuIFx0XHR9XG4gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbiBcdFx0XHRpOiBtb2R1bGVJZCxcbiBcdFx0XHRsOiBmYWxzZSxcbiBcdFx0XHRleHBvcnRzOiB7fVxuIFx0XHR9O1xuXG4gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuIFx0XHRtb2R1bGVzW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuIFx0XHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG4gXHRcdG1vZHVsZS5sID0gdHJ1ZTtcblxuIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4gXHR9XG5cblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuXG4gXHQvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9uIGZvciBoYXJtb255IGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uZCA9IGZ1bmN0aW9uKGV4cG9ydHMsIG5hbWUsIGdldHRlcikge1xuIFx0XHRpZighX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIG5hbWUpKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIG5hbWUsIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBnZXR0ZXIgfSk7XG4gXHRcdH1cbiBcdH07XG5cbiBcdC8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uciA9IGZ1bmN0aW9uKGV4cG9ydHMpIHtcbiBcdFx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG4gXHRcdH1cbiBcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbiBcdH07XG5cbiBcdC8vIGNyZWF0ZSBhIGZha2UgbmFtZXNwYWNlIG9iamVjdFxuIFx0Ly8gbW9kZSAmIDE6IHZhbHVlIGlzIGEgbW9kdWxlIGlkLCByZXF1aXJlIGl0XG4gXHQvLyBtb2RlICYgMjogbWVyZ2UgYWxsIHByb3BlcnRpZXMgb2YgdmFsdWUgaW50byB0aGUgbnNcbiBcdC8vIG1vZGUgJiA0OiByZXR1cm4gdmFsdWUgd2hlbiBhbHJlYWR5IG5zIG9iamVjdFxuIFx0Ly8gbW9kZSAmIDh8MTogYmVoYXZlIGxpa2UgcmVxdWlyZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy50ID0gZnVuY3Rpb24odmFsdWUsIG1vZGUpIHtcbiBcdFx0aWYobW9kZSAmIDEpIHZhbHVlID0gX193ZWJwYWNrX3JlcXVpcmVfXyh2YWx1ZSk7XG4gXHRcdGlmKG1vZGUgJiA4KSByZXR1cm4gdmFsdWU7XG4gXHRcdGlmKChtb2RlICYgNCkgJiYgdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyAmJiB2YWx1ZSAmJiB2YWx1ZS5fX2VzTW9kdWxlKSByZXR1cm4gdmFsdWU7XG4gXHRcdHZhciBucyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18ucihucyk7XG4gXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShucywgJ2RlZmF1bHQnLCB7IGVudW1lcmFibGU6IHRydWUsIHZhbHVlOiB2YWx1ZSB9KTtcbiBcdFx0aWYobW9kZSAmIDIgJiYgdHlwZW9mIHZhbHVlICE9ICdzdHJpbmcnKSBmb3IodmFyIGtleSBpbiB2YWx1ZSkgX193ZWJwYWNrX3JlcXVpcmVfXy5kKG5zLCBrZXksIGZ1bmN0aW9uKGtleSkgeyByZXR1cm4gdmFsdWVba2V5XTsgfS5iaW5kKG51bGwsIGtleSkpO1xuIFx0XHRyZXR1cm4gbnM7XG4gXHR9O1xuXG4gXHQvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5uID0gZnVuY3Rpb24obW9kdWxlKSB7XG4gXHRcdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuIFx0XHRcdGZ1bmN0aW9uIGdldERlZmF1bHQoKSB7IHJldHVybiBtb2R1bGVbJ2RlZmF1bHQnXTsgfSA6XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0TW9kdWxlRXhwb3J0cygpIHsgcmV0dXJuIG1vZHVsZTsgfTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgJ2EnLCBnZXR0ZXIpO1xuIFx0XHRyZXR1cm4gZ2V0dGVyO1xuIFx0fTtcblxuIFx0Ly8gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSBmdW5jdGlvbihvYmplY3QsIHByb3BlcnR5KSB7IHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBwcm9wZXJ0eSk7IH07XG5cbiBcdC8vIF9fd2VicGFja19wdWJsaWNfcGF0aF9fXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIlwiO1xuXG5cbiBcdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuIFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oX193ZWJwYWNrX3JlcXVpcmVfXy5zID0gXCIuL3NyYy9pbmRleC50c1wiKTtcbiIsIi8qKlxuICogQ3JpdGljYWxseSBEYW1wZWQgU3ByaW5nXG4gKlxuICogU2hvdXRvdXRzIHRvIEtlaWppcm8gVGFrYWhhc2hpXG4gKi9cbmV4cG9ydCBjbGFzcyBDRFMge1xuICBwdWJsaWMgZmFjdG9yID0gMTAwLjA7XG4gIHB1YmxpYyByYXRpbyA9IDEuMDtcbiAgcHVibGljIHZlbG9jaXR5ID0gMC4wO1xuICBwdWJsaWMgdmFsdWUgPSAwLjA7XG4gIHB1YmxpYyB0YXJnZXQgPSAwLjA7XG5cbiAgcHVibGljIHVwZGF0ZSggZGVsdGFUaW1lOiBudW1iZXIgKTogbnVtYmVyIHtcbiAgICB0aGlzLnZlbG9jaXR5ICs9IChcbiAgICAgIC10aGlzLmZhY3RvciAqICggdGhpcy52YWx1ZSAtIHRoaXMudGFyZ2V0IClcbiAgICAgIC0gMi4wICogdGhpcy52ZWxvY2l0eSAqIE1hdGguc3FydCggdGhpcy5mYWN0b3IgKSAqIHRoaXMucmF0aW9cbiAgICApICogZGVsdGFUaW1lO1xuICAgIHRoaXMudmFsdWUgKz0gdGhpcy52ZWxvY2l0eSAqIGRlbHRhVGltZTtcbiAgICByZXR1cm4gdGhpcy52YWx1ZTtcbiAgfVxufVxuIiwiZXhwb3J0ICogZnJvbSAnLi9DRFMnO1xuIiwiLyoqXG4gKiBDbGFzcyB0aGF0IGRlYWxzIHdpdGggdGltZS5cbiAqIEluIHRoaXMgYmFzZSBjbGFzcywgeW91IG5lZWQgdG8gc2V0IHRpbWUgbWFudWFsbHkgZnJvbSBgQXV0b21hdG9uLnVwZGF0ZSgpYC5cbiAqIEJlc3QgZm9yIHN5bmMgd2l0aCBleHRlcm5hbCBjbG9jayBzdHVmZi5cbiAqL1xuZXhwb3J0IGNsYXNzIENsb2NrIHtcbiAgLyoqXG4gICAqIEl0cyBjdXJyZW50IHRpbWUuXG4gICAqL1xuICBwcm90ZWN0ZWQgX190aW1lID0gMC4wO1xuXG4gIC8qKlxuICAgKiBJdHMgZGVsdGFUaW1lIG9mIGxhc3QgdXBkYXRlLlxuICAgKi9cbiAgcHJvdGVjdGVkIF9fZGVsdGFUaW1lID0gMC4wO1xuXG4gIC8qKlxuICAgKiBXaGV0aGVyIGl0cyBjdXJyZW50bHkgcGxheWluZyBvciBub3QuXG4gICAqL1xuICBwcm90ZWN0ZWQgX19pc1BsYXlpbmcgPSBmYWxzZTtcblxuICAvKipcbiAgICogSXRzIGN1cnJlbnQgdGltZS5cbiAgICovXG4gIHB1YmxpYyBnZXQgdGltZSgpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5fX3RpbWU7IH1cblxuICAvKipcbiAgICogSXRzIGRlbHRhVGltZSBvZiBsYXN0IHVwZGF0ZS5cbiAgICovXG4gIHB1YmxpYyBnZXQgZGVsdGFUaW1lKCk6IG51bWJlciB7IHJldHVybiB0aGlzLl9fZGVsdGFUaW1lOyB9XG5cbiAgLyoqXG4gICAqIFdoZXRoZXIgaXRzIGN1cnJlbnRseSBwbGF5aW5nIG9yIG5vdC5cbiAgICovXG4gIHB1YmxpYyBnZXQgaXNQbGF5aW5nKCk6IGJvb2xlYW4geyByZXR1cm4gdGhpcy5fX2lzUGxheWluZzsgfVxuXG4gIC8qKlxuICAgKiBVcGRhdGUgdGhlIGNsb2NrLlxuICAgKiBAcGFyYW0gdGltZSBUaW1lLiBZb3UgbmVlZCB0byBzZXQgbWFudWFsbHkgd2hlbiB5b3UgYXJlIHVzaW5nIG1hbnVhbCBDbG9ja1xuICAgKi9cbiAgcHVibGljIHVwZGF0ZSggdGltZT86IG51bWJlciApOiB2b2lkIHtcbiAgICBjb25zdCBwcmV2VGltZSA9IHRoaXMuX190aW1lO1xuICAgIHRoaXMuX190aW1lID0gdGltZSB8fCAwLjA7XG4gICAgdGhpcy5fX2RlbHRhVGltZSA9IHRoaXMuX190aW1lIC0gcHJldlRpbWU7XG4gIH1cblxuICAvKipcbiAgICogU3RhcnQgdGhlIGNsb2NrLlxuICAgKi9cbiAgcHVibGljIHBsYXkoKTogdm9pZCB7XG4gICAgdGhpcy5fX2lzUGxheWluZyA9IHRydWU7XG4gIH1cblxuICAvKipcbiAgICogU3RvcCB0aGUgY2xvY2suXG4gICAqL1xuICBwdWJsaWMgcGF1c2UoKTogdm9pZCB7XG4gICAgdGhpcy5fX2lzUGxheWluZyA9IGZhbHNlO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldCB0aGUgdGltZSBtYW51YWxseS5cbiAgICogQHBhcmFtIHRpbWUgVGltZVxuICAgKi9cbiAgcHVibGljIHNldFRpbWUoIHRpbWU6IG51bWJlciApOiB2b2lkIHtcbiAgICB0aGlzLl9fdGltZSA9IHRpbWU7XG4gIH1cbn1cbiIsImltcG9ydCB7IENsb2NrIH0gZnJvbSAnLi9DbG9jayc7XG5cbi8qKlxuICogQ2xhc3MgdGhhdCBkZWFscyB3aXRoIHRpbWUuXG4gKiBUaGlzIGlzIFwiZnJhbWVcIiB0eXBlIGNsb2NrLCB0aGUgZnJhbWUgaW5jcmVhc2VzIGV2ZXJ5IHtAbGluayBDbG9ja0ZyYW1lI3VwZGF0ZX0gY2FsbC5cbiAqIEBwYXJhbSBmcHMgRnJhbWVzIHBlciBzZWNvbmRcbiAqL1xuZXhwb3J0IGNsYXNzIENsb2NrRnJhbWUgZXh0ZW5kcyBDbG9jayB7XG4gIC8qKlxuICAgKiBJdHMgY3VycmVudCBmcmFtZS5cbiAgICovXG4gIHByaXZhdGUgX19mcmFtZSA9IDA7XG5cbiAgLyoqXG4gICAqIEl0cyBmcHMuXG4gICAqL1xuICBwcml2YXRlIF9fZnBzOiBudW1iZXI7XG5cbiAgcHVibGljIGNvbnN0cnVjdG9yKCBmcHMgPSA2MCApIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMuX19mcHMgPSBmcHM7XG4gIH1cblxuICAvKipcbiAgICogSXRzIGN1cnJlbnQgZnJhbWUuXG4gICAqL1xuICBwdWJsaWMgZ2V0IGZyYW1lKCk6IG51bWJlciB7IHJldHVybiB0aGlzLl9fZnJhbWU7IH1cblxuICAvKipcbiAgICogSXRzIGZwcy5cbiAgICovXG4gIHB1YmxpYyBnZXQgZnBzKCk6IG51bWJlciB7IHJldHVybiB0aGlzLl9fZnBzOyB9XG5cbiAgLyoqXG4gICAqIFVwZGF0ZSB0aGUgY2xvY2suIEl0IHdpbGwgaW5jcmVhc2UgdGhlIGZyYW1lIGJ5IDEuXG4gICAqL1xuICBwdWJsaWMgdXBkYXRlKCk6IHZvaWQge1xuICAgIGlmICggdGhpcy5fX2lzUGxheWluZyApIHtcbiAgICAgIHRoaXMuX190aW1lID0gdGhpcy5fX2ZyYW1lIC8gdGhpcy5fX2ZwcztcbiAgICAgIHRoaXMuX19kZWx0YVRpbWUgPSAxLjAgLyB0aGlzLl9fZnBzO1xuICAgICAgdGhpcy5fX2ZyYW1lICsrO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9fZGVsdGFUaW1lID0gMC4wO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgdGhlIHRpbWUgbWFudWFsbHkuXG4gICAqIFRoZSBzZXQgdGltZSB3aWxsIGJlIGNvbnZlcnRlZCBpbnRvIGludGVybmFsIGZyYW1lIGNvdW50LCBzbyB0aGUgdGltZSB3aWxsIG5vdCBiZSBleGFjdGx5IHNhbWUgYXMgc2V0IG9uZS5cbiAgICogQHBhcmFtIHRpbWUgVGltZVxuICAgKi9cbiAgcHVibGljIHNldFRpbWUoIHRpbWU6IG51bWJlciApOiB2b2lkIHtcbiAgICB0aGlzLl9fZnJhbWUgPSBNYXRoLmZsb29yKCB0aGlzLl9fZnBzICogdGltZSApO1xuICAgIHRoaXMuX190aW1lID0gdGhpcy5fX2ZyYW1lIC8gdGhpcy5fX2ZwcztcbiAgfVxufVxuIiwiaW1wb3J0IHsgQ2xvY2sgfSBmcm9tICcuL0Nsb2NrJztcblxuLyoqXG4gKiBDbGFzcyB0aGF0IGRlYWxzIHdpdGggdGltZS5cbiAqIFRoaXMgaXMgXCJyZWFsdGltZVwiIHR5cGUgY2xvY2ssIHRoZSB0aW1lIGdvZXMgb24gYXMgcmVhbCB3b3JsZC5cbiAqL1xuZXhwb3J0IGNsYXNzIENsb2NrUmVhbHRpbWUgZXh0ZW5kcyBDbG9jayB7XG4gIC8qKlxuICAgKiBcIllvdSBzZXQgdGhlIHRpbWUgbWFudWFsbHkgdG8gYF9fcnRUaW1lYCB3aGVuIGl0J3MgYF9fcnREYXRlYC5cIlxuICAgKi9cbiAgcHJpdmF0ZSBfX3J0VGltZSA9IDAuMDtcblxuICAvKipcbiAgICogXCJZb3Ugc2V0IHRoZSB0aW1lIG1hbnVhbGx5IHRvIGBfX3J0VGltZWAgd2hlbiBpdCdzIGBfX3J0RGF0ZWAuXCJcbiAgICovXG4gIHByaXZhdGUgX19ydERhdGU6IG51bWJlciA9IHBlcmZvcm1hbmNlLm5vdygpO1xuXG4gIC8qKlxuICAgKiBUaGUgY2xvY2sgaXMgcmVhbHRpbWUuIHllYWguXG4gICAqL1xuICBwdWJsaWMgZ2V0IGlzUmVhbHRpbWUoKTogYm9vbGVhbiB7IHJldHVybiB0cnVlOyB9XG5cbiAgLyoqXG4gICAqIFVwZGF0ZSB0aGUgY2xvY2suIFRpbWUgaXMgY2FsY3VsYXRlZCBiYXNlZCBvbiB0aW1lIGluIHJlYWwgd29ybGQuXG4gICAqL1xuICBwdWJsaWMgdXBkYXRlKCk6IHZvaWQge1xuICAgIGNvbnN0IG5vdyA9IHBlcmZvcm1hbmNlLm5vdygpO1xuXG4gICAgaWYgKCB0aGlzLl9faXNQbGF5aW5nICkge1xuICAgICAgY29uc3QgcHJldlRpbWUgPSB0aGlzLl9fdGltZTtcbiAgICAgIGNvbnN0IGRlbHRhRGF0ZSA9ICggbm93IC0gdGhpcy5fX3J0RGF0ZSApO1xuICAgICAgdGhpcy5fX3RpbWUgPSB0aGlzLl9fcnRUaW1lICsgZGVsdGFEYXRlIC8gMTAwMC4wO1xuICAgICAgdGhpcy5fX2RlbHRhVGltZSA9IHRoaXMudGltZSAtIHByZXZUaW1lO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9fcnRUaW1lID0gdGhpcy50aW1lO1xuICAgICAgdGhpcy5fX3J0RGF0ZSA9IG5vdztcbiAgICAgIHRoaXMuX19kZWx0YVRpbWUgPSAwLjA7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFNldCB0aGUgdGltZSBtYW51YWxseS5cbiAgICogQHBhcmFtIHRpbWUgVGltZVxuICAgKi9cbiAgcHVibGljIHNldFRpbWUoIHRpbWU6IG51bWJlciApOiB2b2lkIHtcbiAgICB0aGlzLl9fdGltZSA9IHRpbWU7XG4gICAgdGhpcy5fX3J0VGltZSA9IHRoaXMudGltZTtcbiAgICB0aGlzLl9fcnREYXRlID0gcGVyZm9ybWFuY2Uubm93KCk7XG4gIH1cbn1cbiIsImV4cG9ydCAqIGZyb20gJy4vQ2xvY2snO1xuZXhwb3J0ICogZnJvbSAnLi9DbG9ja0ZyYW1lJztcbmV4cG9ydCAqIGZyb20gJy4vQ2xvY2tSZWFsdGltZSc7XG4iLCJpbXBvcnQgeyBsZXJwIH0gZnJvbSAnLi4nO1xuXG4vKipcbiAqIERvIGV4cCBzbW9vdGhpbmdcbiAqL1xuZXhwb3J0IGNsYXNzIEV4cFNtb290aCB7XG4gIHB1YmxpYyBmYWN0b3IgPSAxMC4wO1xuICBwdWJsaWMgdGFyZ2V0ID0gMC4wO1xuICBwdWJsaWMgdmFsdWUgPSAwLjA7XG5cbiAgcHVibGljIHVwZGF0ZSggZGVsdGFUaW1lOiBudW1iZXIgKTogbnVtYmVyIHtcbiAgICB0aGlzLnZhbHVlID0gbGVycCggdGhpcy50YXJnZXQsIHRoaXMudmFsdWUsIE1hdGguZXhwKCAtdGhpcy5mYWN0b3IgKiBkZWx0YVRpbWUgKSApO1xuICAgIHJldHVybiB0aGlzLnZhbHVlO1xuICB9XG59XG4iLCJleHBvcnQgKiBmcm9tICcuL0V4cFNtb290aCc7XG4iLCIvKipcbiAqIE1vc3QgYXdlc29tZSBjYXQgZXZlclxuICovXG5leHBvcnQgY2xhc3MgRk1TX0NhdCB7IC8vIGVzbGludC1kaXNhYmxlLWxpbmVcbiAgLyoqXG4gICAqIEZNU19DYXQuZ2lmXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIGdpZiA9ICdodHRwczovL2Ztcy1jYXQuY29tL2ltYWdlcy9mbXNfY2F0LmdpZic7XG5cbiAgLyoqXG4gICAqIEZNU19DYXQucG5nXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIHBuZyA9ICdodHRwczovL2Ztcy1jYXQuY29tL2ltYWdlcy9mbXNfY2F0LnBuZyc7XG59XG4iLCJleHBvcnQgKiBmcm9tICcuL0ZNU19DYXQnO1xuIiwiLyoqXG4gKiBJdGVyYWJsZSBGaXp6QnV6elxuICovXG5leHBvcnQgY2xhc3MgRml6ekJ1enogaW1wbGVtZW50cyBJdGVyYWJsZTxudW1iZXIgfCBzdHJpbmc+IHtcbiAgcHVibGljIHN0YXRpYyBXb3Jkc0RlZmF1bHQ6IE1hcDxudW1iZXIsIHN0cmluZz4gPSBuZXcgTWFwKCBbXG4gICAgWyAzLCAnRml6eicgXSxcbiAgICBbIDUsICdCdXp6JyBdXG4gIF0gKTtcblxuICBwcml2YXRlIF9fd29yZHM6IE1hcDxudW1iZXIsIHN0cmluZz47XG4gIHByaXZhdGUgX19pbmRleDogbnVtYmVyO1xuICBwcml2YXRlIF9fZW5kOiBudW1iZXI7XG5cbiAgcHVibGljIGNvbnN0cnVjdG9yKCB3b3JkczogTWFwPG51bWJlciwgc3RyaW5nPiA9IEZpenpCdXp6LldvcmRzRGVmYXVsdCwgaW5kZXggPSAxLCBlbmQgPSAxMDAgKSB7XG4gICAgdGhpcy5fX3dvcmRzID0gd29yZHM7XG4gICAgdGhpcy5fX2luZGV4ID0gaW5kZXg7XG4gICAgdGhpcy5fX2VuZCA9IGVuZDtcbiAgfVxuXG4gIHB1YmxpYyBbIFN5bWJvbC5pdGVyYXRvciBdKCk6IEl0ZXJhdG9yPHN0cmluZyB8IG51bWJlciwgYW55LCB1bmRlZmluZWQ+IHtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIHB1YmxpYyBuZXh0KCk6IEl0ZXJhdG9yUmVzdWx0PG51bWJlciB8IHN0cmluZz4ge1xuICAgIGlmICggdGhpcy5fX2VuZCA8IHRoaXMuX19pbmRleCApIHtcbiAgICAgIHJldHVybiB7IGRvbmU6IHRydWUsIHZhbHVlOiBudWxsIH07XG4gICAgfVxuXG4gICAgbGV0IHZhbHVlOiBudW1iZXIgfCBzdHJpbmcgPSAnJztcbiAgICBmb3IgKCBjb25zdCBbIHJlbSwgd29yZCBdIG9mIHRoaXMuX193b3JkcyApIHtcbiAgICAgIGlmICggKCB0aGlzLl9faW5kZXggJSByZW0gKSA9PT0gMCApIHtcbiAgICAgICAgdmFsdWUgKz0gd29yZDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoIHZhbHVlID09PSAnJyApIHtcbiAgICAgIHZhbHVlID0gdGhpcy5fX2luZGV4O1xuICAgIH1cblxuICAgIHRoaXMuX19pbmRleCArKztcblxuICAgIHJldHVybiB7IGRvbmU6IGZhbHNlLCB2YWx1ZSB9O1xuICB9XG59XG4iLCJleHBvcnQgKiBmcm9tICcuL0ZpenpCdXp6JztcbiIsIi8qKlxuICogVXNlZnVsIGZvciBmcHMgY2FsY1xuICovXG5leHBvcnQgY2xhc3MgSGlzdG9yeU1lYW5DYWxjdWxhdG9yIHtcbiAgcHJpdmF0ZSBfX3JlY2FsY0ZvckVhY2ggPSAwO1xuICBwcml2YXRlIF9fY291bnRVbnRpbFJlY2FsYyA9IDA7XG4gIHByaXZhdGUgX19oaXN0b3J5OiBudW1iZXJbXSA9IFtdO1xuICBwcml2YXRlIF9faW5kZXggPSAwO1xuICBwcml2YXRlIF9fbGVuZ3RoOiBudW1iZXI7XG4gIHByaXZhdGUgX19jb3VudCA9IDA7XG4gIHByaXZhdGUgX19jYWNoZSA9IDA7XG5cbiAgcHVibGljIGNvbnN0cnVjdG9yKCBsZW5ndGg6IG51bWJlciApIHtcbiAgICB0aGlzLl9fbGVuZ3RoID0gbGVuZ3RoO1xuICAgIHRoaXMuX19yZWNhbGNGb3JFYWNoID0gbGVuZ3RoO1xuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IGxlbmd0aDsgaSArKyApIHtcbiAgICAgIHRoaXMuX19oaXN0b3J5WyBpIF0gPSAwO1xuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyBnZXQgbWVhbigpOiBudW1iZXIge1xuICAgIGNvbnN0IGNvdW50ID0gTWF0aC5taW4oIHRoaXMuX19jb3VudCwgdGhpcy5fX2xlbmd0aCApO1xuICAgIHJldHVybiBjb3VudCA9PT0gMCA/IDAuMCA6IHRoaXMuX19jYWNoZSAvIGNvdW50O1xuICB9XG5cbiAgcHVibGljIGdldCByZWNhbGNGb3JFYWNoKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuX19yZWNhbGNGb3JFYWNoO1xuICB9XG5cbiAgcHVibGljIHNldCByZWNhbGNGb3JFYWNoKCB2YWx1ZTogbnVtYmVyICkge1xuICAgIGNvbnN0IGRlbHRhID0gdmFsdWUgLSB0aGlzLl9fcmVjYWxjRm9yRWFjaDtcbiAgICB0aGlzLl9fcmVjYWxjRm9yRWFjaCA9IHZhbHVlO1xuICAgIHRoaXMuX19jb3VudFVudGlsUmVjYWxjID0gTWF0aC5tYXgoIDAsIHRoaXMuX19jb3VudFVudGlsUmVjYWxjICsgZGVsdGEgKTtcbiAgfVxuXG4gIHB1YmxpYyByZXNldCgpOiB2b2lkIHtcbiAgICB0aGlzLl9faW5kZXggPSAwO1xuICAgIHRoaXMuX19jb3VudCA9IDA7XG4gICAgdGhpcy5fX2NhY2hlID0gMDtcbiAgICB0aGlzLl9fY291bnRVbnRpbFJlY2FsYyA9IDA7XG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdGhpcy5fX2xlbmd0aDsgaSArKyApIHtcbiAgICAgIHRoaXMuX19oaXN0b3J5WyBpIF0gPSAwO1xuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyBwdXNoKCB2YWx1ZTogbnVtYmVyICk6IG51bWJlciB7XG4gICAgY29uc3QgcHJldiA9IHRoaXMuX19oaXN0b3J5WyB0aGlzLl9faW5kZXggXTtcbiAgICB0aGlzLl9faGlzdG9yeVsgdGhpcy5fX2luZGV4IF0gPSB2YWx1ZTtcbiAgICB0aGlzLl9fY291bnQgKys7XG4gICAgdGhpcy5fX2luZGV4ID0gKCB0aGlzLl9faW5kZXggKyAxICkgJSB0aGlzLl9fbGVuZ3RoO1xuXG4gICAgaWYgKCB0aGlzLl9fY291bnRVbnRpbFJlY2FsYyA9PT0gMCApIHtcbiAgICAgIHJldHVybiB0aGlzLnJlY2FsYygpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9fY291bnRVbnRpbFJlY2FsYyAtLTtcbiAgICAgIHRoaXMuX19jYWNoZSAtPSBwcmV2O1xuICAgICAgdGhpcy5fX2NhY2hlICs9IHZhbHVlO1xuICAgICAgcmV0dXJuIHRoaXMubWVhbjtcbiAgICB9XG4gIH1cblxuICBwdWJsaWMgcmVjYWxjKCk6IG51bWJlciB7XG4gICAgdGhpcy5fX2NvdW50VW50aWxSZWNhbGMgPSB0aGlzLl9fcmVjYWxjRm9yRWFjaDtcbiAgICBjb25zdCBzdW0gPSB0aGlzLl9faGlzdG9yeVxuICAgICAgLnNsaWNlKCAwLCBNYXRoLm1pbiggdGhpcy5fX2NvdW50LCB0aGlzLl9fbGVuZ3RoICkgKVxuICAgICAgLnJlZHVjZSggKCBzdW0sIHYgKSA9PiBzdW0gKyB2LCAwICk7XG4gICAgdGhpcy5fX2NhY2hlID0gc3VtO1xuICAgIHJldHVybiB0aGlzLm1lYW47XG4gIH1cbn1cbiIsImV4cG9ydCAqIGZyb20gJy4vSGlzdG9yeU1lYW5DYWxjdWxhdG9yJztcbiIsIi8qKlxuICogVXNlZnVsIGZvciBzd2FwIGJ1ZmZlclxuICovXG5leHBvcnQgY2xhc3MgU3dhcDxUPiB7XG4gIHB1YmxpYyBpOiBUO1xuICBwdWJsaWMgbzogVDtcblxuICBwdWJsaWMgY29uc3RydWN0b3IoIGE6IFQsIGI6IFQgKSB7XG4gICAgdGhpcy5pID0gYTtcbiAgICB0aGlzLm8gPSBiO1xuICB9XG5cbiAgcHVibGljIHN3YXAoKTogdm9pZCB7XG4gICAgY29uc3QgaSA9IHRoaXMuaTtcbiAgICB0aGlzLmkgPSB0aGlzLm87XG4gICAgdGhpcy5vID0gaTtcbiAgfVxufVxuIiwiZXhwb3J0ICogZnJvbSAnLi9Td2FwJztcbiIsImV4cG9ydCBjbGFzcyBYb3JzaGlmdCB7XG4gIHB1YmxpYyBzZWVkOiBudW1iZXI7XG5cbiAgcHVibGljIGNvbnN0cnVjdG9yKCBzZWVkPzogbnVtYmVyICkge1xuICAgIHRoaXMuc2VlZCA9IHNlZWQgfHwgMTtcbiAgfVxuXG4gIHB1YmxpYyBnZW4oIHNlZWQ/OiBudW1iZXIgKTogbnVtYmVyIHtcbiAgICBpZiAoIHNlZWQgKSB7XG4gICAgICB0aGlzLnNlZWQgPSBzZWVkO1xuICAgIH1cblxuICAgIHRoaXMuc2VlZCA9IHRoaXMuc2VlZCBeICggdGhpcy5zZWVkIDw8IDEzICk7XG4gICAgdGhpcy5zZWVkID0gdGhpcy5zZWVkIF4gKCB0aGlzLnNlZWQgPj4+IDE3ICk7XG4gICAgdGhpcy5zZWVkID0gdGhpcy5zZWVkIF4gKCB0aGlzLnNlZWQgPDwgNSApO1xuICAgIHJldHVybiB0aGlzLnNlZWQgLyBNYXRoLnBvdyggMiwgMzIgKSArIDAuNTtcbiAgfVxuXG4gIHB1YmxpYyBzZXQoIHNlZWQ/OiBudW1iZXIgKTogdm9pZCB7XG4gICAgdGhpcy5zZWVkID0gc2VlZCB8fCB0aGlzLnNlZWQgfHwgMTtcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBYb3JzaGlmdDtcbiIsImV4cG9ydCAqIGZyb20gJy4vWG9yc2hpZnQnO1xuIiwiLyoqXG4gKiBgWyAtMSwgLTEsIDEsIC0xLCAtMSwgMSwgMSwgMSBdYFxuICovXG5leHBvcnQgY29uc3QgVFJJQU5HTEVfU1RSSVBfUVVBRCA9IFsgLTEsIC0xLCAxLCAtMSwgLTEsIDEsIDEsIDEgXTtcblxuLyoqXG4gKiBgWyAtMSwgLTEsIDAsIDEsIC0xLCAwLCAtMSwgMSwgMCwgMSwgMSwgMCBdYFxuICovXG5leHBvcnQgY29uc3QgVFJJQU5HTEVfU1RSSVBfUVVBRF8zRCA9IFsgLTEsIC0xLCAwLCAxLCAtMSwgMCwgLTEsIDEsIDAsIDEsIDEsIDAgXTtcblxuLyoqXG4gKiBgWyAwLCAwLCAxLCAwLCAwLCAxLCAwLCAwLCAxLCAwLCAwLCAxIF1gXG4gKi9cbmV4cG9ydCBjb25zdCBUUklBTkdMRV9TVFJJUF9RVUFEX05PUk1BTCA9IFsgMCwgMCwgMSwgMCwgMCwgMSwgMCwgMCwgMSwgMCwgMCwgMSBdO1xuXG4vKipcbiAqIGBbIDAsIDAsIDEsIDAsIDAsIDEsIDEsIDEgXWBcbiAqL1xuZXhwb3J0IGNvbnN0IFRSSUFOR0xFX1NUUklQX1FVQURfVVYgPSBbIDAsIDAsIDEsIDAsIDAsIDEsIDEsIDEgXTtcbiIsImV4cG9ydCAqIGZyb20gJy4vY29uc3RhbnRzJztcbmV4cG9ydCAqIGZyb20gJy4vdXRpbHMnO1xuIiwiLyoqXG4gKiBTaHVmZmxlIGdpdmVuIGBhcnJheWAgdXNpbmcgZ2l2ZW4gYGRpY2VgIFJORy4gKipEZXN0cnVjdGl2ZSoqLlxuICovXG5leHBvcnQgZnVuY3Rpb24gc2h1ZmZsZUFycmF5PFQ+KCBhcnJheTogVFtdLCBkaWNlPzogKCkgPT4gbnVtYmVyICk6IFRbXSB7XG4gIGNvbnN0IGYgPSBkaWNlID8gZGljZSA6ICgpID0+IE1hdGgucmFuZG9tKCk7XG4gIGZvciAoIGxldCBpID0gMDsgaSA8IGFycmF5Lmxlbmd0aCAtIDE7IGkgKysgKSB7XG4gICAgY29uc3QgaXIgPSBpICsgTWF0aC5mbG9vciggZigpICogKCBhcnJheS5sZW5ndGggLSBpICkgKTtcbiAgICBjb25zdCB0ZW1wID0gYXJyYXlbIGlyIF07XG4gICAgYXJyYXlbIGlyIF0gPSBhcnJheVsgaSBdO1xuICAgIGFycmF5WyBpIF0gPSB0ZW1wO1xuICB9XG4gIHJldHVybiBhcnJheTtcbn1cblxuLyoqXG4gKiBJIGxpa2Ugd2lyZWZyYW1lXG4gKlxuICogYHRyaUluZGV4VG9MaW5lSW5kZXgoIFsgMCwgMSwgMiwgNSwgNiwgNyBdIClgIC0+IGBbIDAsIDEsIDEsIDIsIDIsIDAsIDUsIDYsIDYsIDcsIDcsIDUgXWBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHRyaUluZGV4VG9MaW5lSW5kZXg8VD4oIGFycmF5OiBUW10gKTogVFtdIHtcbiAgY29uc3QgcmV0OiBUW10gPSBbXTtcbiAgZm9yICggbGV0IGkgPSAwOyBpIDwgYXJyYXkubGVuZ3RoIC8gMzsgaSArKyApIHtcbiAgICBjb25zdCBoZWFkID0gaSAqIDM7XG4gICAgcmV0LnB1c2goXG4gICAgICBhcnJheVsgaGVhZCAgICAgXSwgYXJyYXlbIGhlYWQgKyAxIF0sXG4gICAgICBhcnJheVsgaGVhZCArIDEgXSwgYXJyYXlbIGhlYWQgKyAyIF0sXG4gICAgICBhcnJheVsgaGVhZCArIDIgXSwgYXJyYXlbIGhlYWQgICAgIF1cbiAgICApO1xuICB9XG4gIHJldHVybiByZXQ7XG59XG5cbi8qKlxuICogYG1hdHJpeDJkKCAzLCAyIClgIC0+IGBbIDAsIDAsIDAsIDEsIDAsIDIsIDEsIDAsIDEsIDEsIDEsIDIgXWBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG1hdHJpeDJkKCB3OiBudW1iZXIsIGg6IG51bWJlciApOiBudW1iZXJbXSB7XG4gIGNvbnN0IGFycjogbnVtYmVyW10gPSBbXTtcbiAgZm9yICggbGV0IGl5ID0gMDsgaXkgPCBoOyBpeSArKyApIHtcbiAgICBmb3IgKCBsZXQgaXggPSAwOyBpeCA8IHc7IGl4ICsrICkge1xuICAgICAgYXJyLnB1c2goIGl4LCBpeSApO1xuICAgIH1cbiAgfVxuICByZXR1cm4gYXJyO1xufVxuIiwiZXhwb3J0ICogZnJvbSAnLi9hcnJheSc7XG5leHBvcnQgKiBmcm9tICcuL0NEUyc7XG5leHBvcnQgKiBmcm9tICcuL0Nsb2NrJztcbmV4cG9ydCAqIGZyb20gJy4vRXhwU21vb3RoJztcbmV4cG9ydCAqIGZyb20gJy4vRml6ekJ1enonO1xuZXhwb3J0ICogZnJvbSAnLi9GTVNfQ2F0JztcbmV4cG9ydCAqIGZyb20gJy4vSGlzdG9yeU1lYW5DYWxjdWxhdG9yJztcbmV4cG9ydCAqIGZyb20gJy4vbWF0aCc7XG5leHBvcnQgKiBmcm9tICcuL1N3YXAnO1xuZXhwb3J0ICogZnJvbSAnLi9Yb3JzaGlmdCc7XG4iLCJpbXBvcnQgeyBRdWF0ZXJuaW9uLCBWZWN0b3IzIH0gZnJvbSAnLic7XG5cbmV4cG9ydCB0eXBlIHJhd01hdHJpeDQgPSBbXG4gIG51bWJlciwgbnVtYmVyLCBudW1iZXIsIG51bWJlcixcbiAgbnVtYmVyLCBudW1iZXIsIG51bWJlciwgbnVtYmVyLFxuICBudW1iZXIsIG51bWJlciwgbnVtYmVyLCBudW1iZXIsXG4gIG51bWJlciwgbnVtYmVyLCBudW1iZXIsIG51bWJlclxuXTtcblxuZXhwb3J0IGNvbnN0IHJhd0lkZW50aXR5TWF0cml4NDogcmF3TWF0cml4NCA9IFtcbiAgMS4wLCAwLjAsIDAuMCwgMC4wLFxuICAwLjAsIDEuMCwgMC4wLCAwLjAsXG4gIDAuMCwgMC4wLCAxLjAsIDAuMCxcbiAgMC4wLCAwLjAsIDAuMCwgMS4wXG5dO1xuXG4vKipcbiAqIEEgTWF0cml4NC5cbiAqL1xuZXhwb3J0IGNsYXNzIE1hdHJpeDQge1xuICBwdWJsaWMgZWxlbWVudHM6IHJhd01hdHJpeDQ7XG5cbiAgcHVibGljIGNvbnN0cnVjdG9yKCB2OiByYXdNYXRyaXg0ID0gcmF3SWRlbnRpdHlNYXRyaXg0ICkge1xuICAgIHRoaXMuZWxlbWVudHMgPSB2O1xuICB9XG5cbiAgLyoqXG4gICAqIEl0c2VsZiBidXQgdHJhbnNwb3NlZC5cbiAgICovXG4gIHB1YmxpYyBnZXQgdHJhbnNwb3NlKCk6IE1hdHJpeDQge1xuICAgIGNvbnN0IG0gPSB0aGlzLmVsZW1lbnRzO1xuXG4gICAgcmV0dXJuIG5ldyBNYXRyaXg0KCBbXG4gICAgICBtWyAwIF0sIG1bIDQgXSwgbVsgOCBdLCBtWyAxMiBdLFxuICAgICAgbVsgMSBdLCBtWyA1IF0sIG1bIDkgXSwgbVsgMTMgXSxcbiAgICAgIG1bIDIgXSwgbVsgNiBdLCBtWyAxMCBdLCBtWyAxNCBdLFxuICAgICAgbVsgMyBdLCBtWyA3IF0sIG1bIDExIF0sIG1bIDE1IF1cbiAgICBdICk7XG4gIH1cblxuICAvKipcbiAgICogSXRzIGRldGVybWluYW50LlxuICAgKi9cbiAgcHVibGljIGdldCBkZXRlcm1pbmFudCgpOiBudW1iZXIge1xuICAgIGNvbnN0IG0gPSB0aGlzLmVsZW1lbnRzO1xuICAgIGNvbnN0XG4gICAgICBhMDAgPSBtWyAgMCBdLCBhMDEgPSBtWyAgMSBdLCBhMDIgPSBtWyAgMiBdLCBhMDMgPSBtWyAgMyBdLFxuICAgICAgYTEwID0gbVsgIDQgXSwgYTExID0gbVsgIDUgXSwgYTEyID0gbVsgIDYgXSwgYTEzID0gbVsgIDcgXSxcbiAgICAgIGEyMCA9IG1bICA4IF0sIGEyMSA9IG1bICA5IF0sIGEyMiA9IG1bIDEwIF0sIGEyMyA9IG1bIDExIF0sXG4gICAgICBhMzAgPSBtWyAxMiBdLCBhMzEgPSBtWyAxMyBdLCBhMzIgPSBtWyAxNCBdLCBhMzMgPSBtWyAxNSBdLFxuICAgICAgYjAwID0gYTAwICogYTExIC0gYTAxICogYTEwLCAgYjAxID0gYTAwICogYTEyIC0gYTAyICogYTEwLFxuICAgICAgYjAyID0gYTAwICogYTEzIC0gYTAzICogYTEwLCAgYjAzID0gYTAxICogYTEyIC0gYTAyICogYTExLFxuICAgICAgYjA0ID0gYTAxICogYTEzIC0gYTAzICogYTExLCAgYjA1ID0gYTAyICogYTEzIC0gYTAzICogYTEyLFxuICAgICAgYjA2ID0gYTIwICogYTMxIC0gYTIxICogYTMwLCAgYjA3ID0gYTIwICogYTMyIC0gYTIyICogYTMwLFxuICAgICAgYjA4ID0gYTIwICogYTMzIC0gYTIzICogYTMwLCAgYjA5ID0gYTIxICogYTMyIC0gYTIyICogYTMxLFxuICAgICAgYjEwID0gYTIxICogYTMzIC0gYTIzICogYTMxLCAgYjExID0gYTIyICogYTMzIC0gYTIzICogYTMyO1xuXG4gICAgcmV0dXJuIGIwMCAqIGIxMSAtIGIwMSAqIGIxMCArIGIwMiAqIGIwOSArIGIwMyAqIGIwOCAtIGIwNCAqIGIwNyArIGIwNSAqIGIwNjtcbiAgfVxuXG4gIC8qKlxuICAgKiBJdHNlbGYgYnV0IGludmVydGVkLlxuICAgKi9cbiAgcHVibGljIGdldCBpbnZlcnNlKCk6IE1hdHJpeDQgfCBudWxsIHtcbiAgICBjb25zdCBtID0gdGhpcy5lbGVtZW50cztcbiAgICBjb25zdFxuICAgICAgYTAwID0gbVsgIDAgXSwgYTAxID0gbVsgIDEgXSwgYTAyID0gbVsgIDIgXSwgYTAzID0gbVsgIDMgXSxcbiAgICAgIGExMCA9IG1bICA0IF0sIGExMSA9IG1bICA1IF0sIGExMiA9IG1bICA2IF0sIGExMyA9IG1bICA3IF0sXG4gICAgICBhMjAgPSBtWyAgOCBdLCBhMjEgPSBtWyAgOSBdLCBhMjIgPSBtWyAxMCBdLCBhMjMgPSBtWyAxMSBdLFxuICAgICAgYTMwID0gbVsgMTIgXSwgYTMxID0gbVsgMTMgXSwgYTMyID0gbVsgMTQgXSwgYTMzID0gbVsgMTUgXSxcbiAgICAgIGIwMCA9IGEwMCAqIGExMSAtIGEwMSAqIGExMCwgIGIwMSA9IGEwMCAqIGExMiAtIGEwMiAqIGExMCxcbiAgICAgIGIwMiA9IGEwMCAqIGExMyAtIGEwMyAqIGExMCwgIGIwMyA9IGEwMSAqIGExMiAtIGEwMiAqIGExMSxcbiAgICAgIGIwNCA9IGEwMSAqIGExMyAtIGEwMyAqIGExMSwgIGIwNSA9IGEwMiAqIGExMyAtIGEwMyAqIGExMixcbiAgICAgIGIwNiA9IGEyMCAqIGEzMSAtIGEyMSAqIGEzMCwgIGIwNyA9IGEyMCAqIGEzMiAtIGEyMiAqIGEzMCxcbiAgICAgIGIwOCA9IGEyMCAqIGEzMyAtIGEyMyAqIGEzMCwgIGIwOSA9IGEyMSAqIGEzMiAtIGEyMiAqIGEzMSxcbiAgICAgIGIxMCA9IGEyMSAqIGEzMyAtIGEyMyAqIGEzMSwgIGIxMSA9IGEyMiAqIGEzMyAtIGEyMyAqIGEzMjtcblxuICAgIGNvbnN0IGRldCA9IGIwMCAqIGIxMSAtIGIwMSAqIGIxMCArIGIwMiAqIGIwOSArIGIwMyAqIGIwOCAtIGIwNCAqIGIwNyArIGIwNSAqIGIwNjtcblxuICAgIGlmICggZGV0ID09PSAwLjAgKSB7IHJldHVybiBudWxsOyB9XG5cbiAgICBjb25zdCBpbnZEZXQgPSAxLjAgLyBkZXQ7XG5cbiAgICByZXR1cm4gbmV3IE1hdHJpeDQoIFtcbiAgICAgIGExMSAqIGIxMSAtIGExMiAqIGIxMCArIGExMyAqIGIwOSxcbiAgICAgIGEwMiAqIGIxMCAtIGEwMSAqIGIxMSAtIGEwMyAqIGIwOSxcbiAgICAgIGEzMSAqIGIwNSAtIGEzMiAqIGIwNCArIGEzMyAqIGIwMyxcbiAgICAgIGEyMiAqIGIwNCAtIGEyMSAqIGIwNSAtIGEyMyAqIGIwMyxcbiAgICAgIGExMiAqIGIwOCAtIGExMCAqIGIxMSAtIGExMyAqIGIwNyxcbiAgICAgIGEwMCAqIGIxMSAtIGEwMiAqIGIwOCArIGEwMyAqIGIwNyxcbiAgICAgIGEzMiAqIGIwMiAtIGEzMCAqIGIwNSAtIGEzMyAqIGIwMSxcbiAgICAgIGEyMCAqIGIwNSAtIGEyMiAqIGIwMiArIGEyMyAqIGIwMSxcbiAgICAgIGExMCAqIGIxMCAtIGExMSAqIGIwOCArIGExMyAqIGIwNixcbiAgICAgIGEwMSAqIGIwOCAtIGEwMCAqIGIxMCAtIGEwMyAqIGIwNixcbiAgICAgIGEzMCAqIGIwNCAtIGEzMSAqIGIwMiArIGEzMyAqIGIwMCxcbiAgICAgIGEyMSAqIGIwMiAtIGEyMCAqIGIwNCAtIGEyMyAqIGIwMCxcbiAgICAgIGExMSAqIGIwNyAtIGExMCAqIGIwOSAtIGExMiAqIGIwNixcbiAgICAgIGEwMCAqIGIwOSAtIGEwMSAqIGIwNyArIGEwMiAqIGIwNixcbiAgICAgIGEzMSAqIGIwMSAtIGEzMCAqIGIwMyAtIGEzMiAqIGIwMCxcbiAgICAgIGEyMCAqIGIwMyAtIGEyMSAqIGIwMSArIGEyMiAqIGIwMFxuICAgIF0ubWFwKCAoIHYgKSA9PiB2ICogaW52RGV0ICkgYXMgcmF3TWF0cml4NCApO1xuICB9XG5cbiAgcHVibGljIHRvU3RyaW5nKCk6IHN0cmluZyB7XG4gICAgY29uc3QgbSA9IHRoaXMuZWxlbWVudHMubWFwKCAoIHYgKSA9PiB2LnRvRml4ZWQoIDMgKSApO1xuICAgIHJldHVybiBgTWF0cml4NCggJHsgbVsgMCBdIH0sICR7IG1bIDQgXSB9LCAkeyBtWyA4IF0gfSwgJHsgbVsgMTIgXSB9OyAkeyBtWyAxIF0gfSwgJHsgbVsgNSBdIH0sICR7IG1bIDkgXSB9LCAkeyBtWyAxMyBdIH07ICR7IG1bIDIgXSB9LCAkeyBtWyA2IF0gfSwgJHsgbVsgMTAgXSB9LCAkeyBtWyAxNCBdIH07ICR7IG1bIDMgXSB9LCAkeyBtWyA3IF0gfSwgJHsgbVsgMTEgXSB9LCAkeyBtWyAxNSBdIH0gKWA7XG4gIH1cblxuICAvKipcbiAgICogQ2xvbmUgdGhpcy5cbiAgICovXG4gIHB1YmxpYyBjbG9uZSgpOiBNYXRyaXg0IHtcbiAgICByZXR1cm4gbmV3IE1hdHJpeDQoIHRoaXMuZWxlbWVudHMuY29uY2F0KCkgYXMgcmF3TWF0cml4NCApO1xuICB9XG5cbiAgLyoqXG4gICAqIE11bHRpcGx5IHRoaXMgTWF0cml4NCBieSBvbmUgb3IgbW9yZSBNYXRyaXg0cy5cbiAgICovXG4gIHB1YmxpYyBtdWx0aXBseSggLi4ubWF0cmljZXM6IE1hdHJpeDRbXSApOiBNYXRyaXg0IHtcbiAgICBpZiAoIG1hdHJpY2VzLmxlbmd0aCA9PT0gMCApIHtcbiAgICAgIHJldHVybiB0aGlzLmNsb25lKCk7XG4gICAgfVxuXG4gICAgY29uc3QgYXJyID0gbWF0cmljZXMuY29uY2F0KCk7XG4gICAgbGV0IGJNYXQgPSBhcnIuc2hpZnQoKSE7XG4gICAgaWYgKCAwIDwgYXJyLmxlbmd0aCApIHtcbiAgICAgIGJNYXQgPSBiTWF0Lm11bHRpcGx5KCAuLi5hcnIgKTtcbiAgICB9XG5cbiAgICBjb25zdCBhID0gdGhpcy5lbGVtZW50cztcbiAgICBjb25zdCBiID0gYk1hdC5lbGVtZW50cztcblxuICAgIHJldHVybiBuZXcgTWF0cml4NCggW1xuICAgICAgYVsgMCBdICogYlsgMCBdICsgYVsgNCBdICogYlsgMSBdICsgYVsgOCBdICogYlsgMiBdICsgYVsgMTIgXSAqIGJbIDMgXSxcbiAgICAgIGFbIDEgXSAqIGJbIDAgXSArIGFbIDUgXSAqIGJbIDEgXSArIGFbIDkgXSAqIGJbIDIgXSArIGFbIDEzIF0gKiBiWyAzIF0sXG4gICAgICBhWyAyIF0gKiBiWyAwIF0gKyBhWyA2IF0gKiBiWyAxIF0gKyBhWyAxMCBdICogYlsgMiBdICsgYVsgMTQgXSAqIGJbIDMgXSxcbiAgICAgIGFbIDMgXSAqIGJbIDAgXSArIGFbIDcgXSAqIGJbIDEgXSArIGFbIDExIF0gKiBiWyAyIF0gKyBhWyAxNSBdICogYlsgMyBdLFxuXG4gICAgICBhWyAwIF0gKiBiWyA0IF0gKyBhWyA0IF0gKiBiWyA1IF0gKyBhWyA4IF0gKiBiWyA2IF0gKyBhWyAxMiBdICogYlsgNyBdLFxuICAgICAgYVsgMSBdICogYlsgNCBdICsgYVsgNSBdICogYlsgNSBdICsgYVsgOSBdICogYlsgNiBdICsgYVsgMTMgXSAqIGJbIDcgXSxcbiAgICAgIGFbIDIgXSAqIGJbIDQgXSArIGFbIDYgXSAqIGJbIDUgXSArIGFbIDEwIF0gKiBiWyA2IF0gKyBhWyAxNCBdICogYlsgNyBdLFxuICAgICAgYVsgMyBdICogYlsgNCBdICsgYVsgNyBdICogYlsgNSBdICsgYVsgMTEgXSAqIGJbIDYgXSArIGFbIDE1IF0gKiBiWyA3IF0sXG5cbiAgICAgIGFbIDAgXSAqIGJbIDggXSArIGFbIDQgXSAqIGJbIDkgXSArIGFbIDggXSAqIGJbIDEwIF0gKyBhWyAxMiBdICogYlsgMTEgXSxcbiAgICAgIGFbIDEgXSAqIGJbIDggXSArIGFbIDUgXSAqIGJbIDkgXSArIGFbIDkgXSAqIGJbIDEwIF0gKyBhWyAxMyBdICogYlsgMTEgXSxcbiAgICAgIGFbIDIgXSAqIGJbIDggXSArIGFbIDYgXSAqIGJbIDkgXSArIGFbIDEwIF0gKiBiWyAxMCBdICsgYVsgMTQgXSAqIGJbIDExIF0sXG4gICAgICBhWyAzIF0gKiBiWyA4IF0gKyBhWyA3IF0gKiBiWyA5IF0gKyBhWyAxMSBdICogYlsgMTAgXSArIGFbIDE1IF0gKiBiWyAxMSBdLFxuXG4gICAgICBhWyAwIF0gKiBiWyAxMiBdICsgYVsgNCBdICogYlsgMTMgXSArIGFbIDggXSAqIGJbIDE0IF0gKyBhWyAxMiBdICogYlsgMTUgXSxcbiAgICAgIGFbIDEgXSAqIGJbIDEyIF0gKyBhWyA1IF0gKiBiWyAxMyBdICsgYVsgOSBdICogYlsgMTQgXSArIGFbIDEzIF0gKiBiWyAxNSBdLFxuICAgICAgYVsgMiBdICogYlsgMTIgXSArIGFbIDYgXSAqIGJbIDEzIF0gKyBhWyAxMCBdICogYlsgMTQgXSArIGFbIDE0IF0gKiBiWyAxNSBdLFxuICAgICAgYVsgMyBdICogYlsgMTIgXSArIGFbIDcgXSAqIGJbIDEzIF0gKyBhWyAxMSBdICogYlsgMTQgXSArIGFbIDE1IF0gKiBiWyAxNSBdXG4gICAgXSApO1xuICB9XG5cbiAgLyoqXG4gICAqIE11bHRpcGx5IHRoaXMgTWF0cml4NCBieSBhIHNjYWxhclxuICAgKi9cbiAgcHVibGljIHNjYWxlU2NhbGFyKCBzY2FsYXI6IG51bWJlciApOiBNYXRyaXg0IHtcbiAgICByZXR1cm4gbmV3IE1hdHJpeDQoIHRoaXMuZWxlbWVudHMubWFwKCAoIHYgKSA9PiB2ICogc2NhbGFyICkgYXMgcmF3TWF0cml4NCApO1xuICB9XG5cbiAgLyoqXG4gICAqIEFuIGlkZW50aXR5IE1hdHJpeDQuXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIGdldCBpZGVudGl0eSgpOiBNYXRyaXg0IHtcbiAgICByZXR1cm4gbmV3IE1hdHJpeDQoIHJhd0lkZW50aXR5TWF0cml4NCApO1xuICB9XG5cbiAgcHVibGljIHN0YXRpYyBtdWx0aXBseSggLi4ubWF0cmljZXM6IE1hdHJpeDRbXSApOiBNYXRyaXg0IHtcbiAgICBpZiAoIG1hdHJpY2VzLmxlbmd0aCA9PT0gMCApIHtcbiAgICAgIHJldHVybiBNYXRyaXg0LmlkZW50aXR5O1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBiTWF0cyA9IG1hdHJpY2VzLmNvbmNhdCgpO1xuICAgICAgY29uc3QgYU1hdCA9IGJNYXRzLnNoaWZ0KCkhO1xuICAgICAgcmV0dXJuIGFNYXQubXVsdGlwbHkoIC4uLmJNYXRzICk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEdlbmVyYXRlIGEgdHJhbnNsYXRpb24gbWF0cml4LlxuICAgKiBAcGFyYW0gdmVjdG9yIFRyYW5zbGF0aW9uXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIHRyYW5zbGF0ZSggdmVjdG9yOiBWZWN0b3IzICk6IE1hdHJpeDQge1xuICAgIHJldHVybiBuZXcgTWF0cml4NCggW1xuICAgICAgMSwgMCwgMCwgMCxcbiAgICAgIDAsIDEsIDAsIDAsXG4gICAgICAwLCAwLCAxLCAwLFxuICAgICAgdmVjdG9yLngsIHZlY3Rvci55LCB2ZWN0b3IueiwgMVxuICAgIF0gKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZW5lcmF0ZSBhIDNkIHNjYWxpbmcgbWF0cml4LlxuICAgKiBAcGFyYW0gdmVjdG9yIFNjYWxlXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIHNjYWxlKCB2ZWN0b3I6IFZlY3RvcjMgKTogTWF0cml4NCB7XG4gICAgcmV0dXJuIG5ldyBNYXRyaXg0KCBbXG4gICAgICB2ZWN0b3IueCwgMCwgMCwgMCxcbiAgICAgIDAsIHZlY3Rvci55LCAwLCAwLFxuICAgICAgMCwgMCwgdmVjdG9yLnosIDAsXG4gICAgICAwLCAwLCAwLCAxXG4gICAgXSApO1xuICB9XG5cbiAgLyoqXG4gICAqIEdlbmVyYXRlIGEgM2Qgc2NhbGluZyBtYXRyaXggYnkgYSBzY2FsYXIuXG4gICAqIEBwYXJhbSB2ZWN0b3IgU2NhbGVcbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgc2NhbGVTY2FsYXIoIHNjYWxhcjogbnVtYmVyICk6IE1hdHJpeDQge1xuICAgIHJldHVybiBuZXcgTWF0cml4NCggW1xuICAgICAgc2NhbGFyLCAwLCAwLCAwLFxuICAgICAgMCwgc2NhbGFyLCAwLCAwLFxuICAgICAgMCwgMCwgc2NhbGFyLCAwLFxuICAgICAgMCwgMCwgMCwgMVxuICAgIF0gKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZW5lcmF0ZSBhIDNkIHJvdGF0aW9uIG1hdHJpeCwgcm90YXRlcyBhcm91bmQgeCBheGlzLlxuICAgKiBAcGFyYW0gdmVjdG9yIFNjYWxlXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIHJvdGF0ZVgoIHRoZXRhOiBudW1iZXIgKTogTWF0cml4NCB7XG4gICAgcmV0dXJuIG5ldyBNYXRyaXg0KCBbXG4gICAgICAxLCAwLCAwLCAwLFxuICAgICAgMCwgTWF0aC5jb3MoIHRoZXRhICksIC1NYXRoLnNpbiggdGhldGEgKSwgMCxcbiAgICAgIDAsIE1hdGguc2luKCB0aGV0YSApLCBNYXRoLmNvcyggdGhldGEgKSwgMCxcbiAgICAgIDAsIDAsIDAsIDFcbiAgICBdICk7XG4gIH1cblxuICAvKipcbiAgICogR2VuZXJhdGUgYSAzZCByb3RhdGlvbiBtYXRyaXgsIHJvdGF0ZXMgYXJvdW5kIHkgYXhpcy5cbiAgICogQHBhcmFtIHZlY3RvciBTY2FsZVxuICAgKi9cbiAgcHVibGljIHN0YXRpYyByb3RhdGVZKCB0aGV0YTogbnVtYmVyICk6IE1hdHJpeDQge1xuICAgIHJldHVybiBuZXcgTWF0cml4NCggW1xuICAgICAgTWF0aC5jb3MoIHRoZXRhICksIDAsIE1hdGguc2luKCB0aGV0YSApLCAwLFxuICAgICAgMCwgMSwgMCwgMCxcbiAgICAgIC1NYXRoLnNpbiggdGhldGEgKSwgMCwgTWF0aC5jb3MoIHRoZXRhICksIDAsXG4gICAgICAwLCAwLCAwLCAxXG4gICAgXSApO1xuICB9XG5cbiAgLyoqXG4gICAqIEdlbmVyYXRlIGEgM2Qgcm90YXRpb24gbWF0cml4LCByb3RhdGVzIGFyb3VuZCB6IGF4aXMuXG4gICAqIEBwYXJhbSB2ZWN0b3IgU2NhbGVcbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgcm90YXRlWiggdGhldGE6IG51bWJlciApOiBNYXRyaXg0IHtcbiAgICByZXR1cm4gbmV3IE1hdHJpeDQoIFtcbiAgICAgIE1hdGguY29zKCB0aGV0YSApLCAtTWF0aC5zaW4oIHRoZXRhICksIDAsIDAsXG4gICAgICBNYXRoLnNpbiggdGhldGEgKSwgTWF0aC5jb3MoIHRoZXRhICksIDAsIDAsXG4gICAgICAwLCAwLCAxLCAwLFxuICAgICAgMCwgMCwgMCwgMVxuICAgIF0gKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZW5lcmF0ZSBhIFwiTG9va0F0XCIgdmlldyBtYXRyaXguXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIGxvb2tBdChcbiAgICBwb3NpdGlvbjogVmVjdG9yMyxcbiAgICB0YXJnZXQgPSBuZXcgVmVjdG9yMyggWyAwLjAsIDAuMCwgMC4wIF0gKSxcbiAgICB1cCA9IG5ldyBWZWN0b3IzKCBbIDAuMCwgMS4wLCAwLjAgXSApLFxuICAgIHJvbGwgPSAwLjBcbiAgKTogTWF0cml4NCB7XG4gICAgY29uc3QgZGlyID0gcG9zaXRpb24uc3ViKCB0YXJnZXQgKS5ub3JtYWxpemVkO1xuICAgIGxldCBzaWQgPSB1cC5jcm9zcyggZGlyICkubm9ybWFsaXplZDtcbiAgICBsZXQgdG9wID0gZGlyLmNyb3NzKCBzaWQgKTtcbiAgICBzaWQgPSBzaWQuc2NhbGUoIE1hdGguY29zKCByb2xsICkgKS5hZGQoIHRvcC5zY2FsZSggTWF0aC5zaW4oIHJvbGwgKSApICk7XG4gICAgdG9wID0gZGlyLmNyb3NzKCBzaWQgKTtcblxuICAgIHJldHVybiBuZXcgTWF0cml4NCggW1xuICAgICAgc2lkLngsIHNpZC55LCBzaWQueiwgMC4wLFxuICAgICAgdG9wLngsIHRvcC55LCB0b3AueiwgMC4wLFxuICAgICAgZGlyLngsIGRpci55LCBkaXIueiwgMC4wLFxuICAgICAgcG9zaXRpb24ueCwgcG9zaXRpb24ueSwgcG9zaXRpb24ueiwgMS4wXG4gICAgXSApO1xuICB9XG5cbiAgLyoqXG4gICAqIEdlbmVyYXRlIGEgXCJQZXJzcGVjdGl2ZVwiIHByb2plY3Rpb24gbWF0cml4LlxuICAgKiBJdCB3b24ndCBpbmNsdWRlIGFzcGVjdCFcbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgcGVyc3BlY3RpdmUoIGZvdiA9IDQ1LjAsIG5lYXIgPSAwLjAxLCBmYXIgPSAxMDAuMCApOiBNYXRyaXg0IHtcbiAgICBjb25zdCBwID0gMS4wIC8gTWF0aC50YW4oIGZvdiAqIE1hdGguUEkgLyAzNjAuMCApO1xuICAgIGNvbnN0IGQgPSAoIGZhciAtIG5lYXIgKTtcbiAgICByZXR1cm4gbmV3IE1hdHJpeDQoIFtcbiAgICAgIHAsIDAuMCwgMC4wLCAwLjAsXG4gICAgICAwLjAsIHAsIDAuMCwgMC4wLFxuICAgICAgMC4wLCAwLjAsIC0oIGZhciArIG5lYXIgKSAvIGQsIC0xLjAsXG4gICAgICAwLjAsIDAuMCwgLTIgKiBmYXIgKiBuZWFyIC8gZCwgMC4wXG4gICAgXSApO1xuICB9XG5cbiAgLyoqXG4gICAqIERlY29tcG9zZSB0aGlzIG1hdHJpeCBpbnRvIGEgcG9zaXRpb24sIGEgc2NhbGUsIGFuZCBhIHJvdGF0aW9uLlxuICAgKiBZb2lua2VkIGZyb20gVGhyZWUuanMuXG4gICAqL1xuICBwdWJsaWMgZGVjb21wb3NlKCk6IHsgcG9zaXRpb246IFZlY3RvcjM7IHNjYWxlOiBWZWN0b3IzOyByb3RhdGlvbjogUXVhdGVybmlvbiB9IHtcbiAgICBjb25zdCBtID0gdGhpcy5lbGVtZW50cztcblxuICAgIGxldCBzeCA9IG5ldyBWZWN0b3IzKCBbIG1bIDAgXSwgbVsgMSBdLCBtWyAyIF0gXSApLmxlbmd0aDtcbiAgICBjb25zdCBzeSA9IG5ldyBWZWN0b3IzKCBbIG1bIDQgXSwgbVsgNSBdLCBtWyA2IF0gXSApLmxlbmd0aDtcbiAgICBjb25zdCBzeiA9IG5ldyBWZWN0b3IzKCBbIG1bIDggXSwgbVsgOSBdLCBtWyAxMCBdIF0gKS5sZW5ndGg7XG5cbiAgICAvLyBpZiBkZXRlcm1pbmUgaXMgbmVnYXRpdmUsIHdlIG5lZWQgdG8gaW52ZXJ0IG9uZSBzY2FsZVxuICAgIGNvbnN0IGRldCA9IHRoaXMuZGV0ZXJtaW5hbnQ7XG4gICAgaWYgKCBkZXQgPCAwICkgeyBzeCA9IC1zeDsgfVxuXG4gICAgY29uc3QgaW52U3ggPSAxLjAgLyBzeDtcbiAgICBjb25zdCBpbnZTeSA9IDEuMCAvIHN5O1xuICAgIGNvbnN0IGludlN6ID0gMS4wIC8gc3o7XG5cbiAgICBjb25zdCByb3RhdGlvbk1hdHJpeCA9IHRoaXMuY2xvbmUoKTtcblxuICAgIHJvdGF0aW9uTWF0cml4LmVsZW1lbnRzWyAwIF0gKj0gaW52U3g7XG4gICAgcm90YXRpb25NYXRyaXguZWxlbWVudHNbIDEgXSAqPSBpbnZTeDtcbiAgICByb3RhdGlvbk1hdHJpeC5lbGVtZW50c1sgMiBdICo9IGludlN4O1xuXG4gICAgcm90YXRpb25NYXRyaXguZWxlbWVudHNbIDQgXSAqPSBpbnZTeTtcbiAgICByb3RhdGlvbk1hdHJpeC5lbGVtZW50c1sgNSBdICo9IGludlN5O1xuICAgIHJvdGF0aW9uTWF0cml4LmVsZW1lbnRzWyA2IF0gKj0gaW52U3k7XG5cbiAgICByb3RhdGlvbk1hdHJpeC5lbGVtZW50c1sgOCBdICo9IGludlN6O1xuICAgIHJvdGF0aW9uTWF0cml4LmVsZW1lbnRzWyA5IF0gKj0gaW52U3o7XG4gICAgcm90YXRpb25NYXRyaXguZWxlbWVudHNbIDEwIF0gKj0gaW52U3o7XG5cbiAgICByZXR1cm4ge1xuICAgICAgcG9zaXRpb246IG5ldyBWZWN0b3IzKCBbIG1bIDEyIF0sIG1bIDEzIF0sIG1bIDE0IF0gXSApLFxuICAgICAgc2NhbGU6IG5ldyBWZWN0b3IzKCBbIHN4LCBzeSwgc3ogXSApLFxuICAgICAgcm90YXRpb246IFF1YXRlcm5pb24uZnJvbU1hdHJpeCggcm90YXRpb25NYXRyaXggKVxuICAgIH07XG4gIH1cblxuICAvKipcbiAgICogQ29tcG9zZSBhIG1hdHJpeCBvdXQgb2YgcG9zaXRpb24sIHNjYWxlLCBhbmQgcm90YXRpb24uXG4gICAqIFlvaW5rZWQgZnJvbSBUaHJlZS5qcy5cbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgY29tcG9zZSggcG9zaXRpb246IFZlY3RvcjMsIHJvdGF0aW9uOiBRdWF0ZXJuaW9uLCBzY2FsZTogVmVjdG9yMyApOiBNYXRyaXg0IHtcbiAgICBjb25zdCB4ID0gcm90YXRpb24ueCwgeSA9IHJvdGF0aW9uLnksIHogPSByb3RhdGlvbi56LCB3ID0gcm90YXRpb24udztcbiAgICBjb25zdCB4MiA9IHggKyB4LFx0eTIgPSB5ICsgeSwgejIgPSB6ICsgejtcbiAgICBjb25zdCB4eCA9IHggKiB4MiwgeHkgPSB4ICogeTIsIHh6ID0geCAqIHoyO1xuICAgIGNvbnN0IHl5ID0geSAqIHkyLCB5eiA9IHkgKiB6MiwgenogPSB6ICogejI7XG4gICAgY29uc3Qgd3ggPSB3ICogeDIsIHd5ID0gdyAqIHkyLCB3eiA9IHcgKiB6MjtcbiAgICBjb25zdCBzeCA9IHNjYWxlLngsIHN5ID0gc2NhbGUueSwgc3ogPSBzY2FsZS56O1xuXG4gICAgcmV0dXJuIG5ldyBNYXRyaXg0KCBbXG4gICAgICAoIDEuMCAtICggeXkgKyB6eiApICkgKiBzeCxcbiAgICAgICggeHkgKyB3eiApICogc3gsXG4gICAgICAoIHh6IC0gd3kgKSAqIHN4LFxuICAgICAgMC4wLFxuXG4gICAgICAoIHh5IC0gd3ogKSAqIHN5LFxuICAgICAgKCAxLjAgLSAoIHh4ICsgenogKSApICogc3ksXG4gICAgICAoIHl6ICsgd3ggKSAqIHN5LFxuICAgICAgMC4wLFxuXG4gICAgICAoIHh6ICsgd3kgKSAqIHN6LFxuICAgICAgKCB5eiAtIHd4ICkgKiBzeixcbiAgICAgICggMS4wIC0gKCB4eCArIHl5ICkgKSAqIHN6LFxuICAgICAgMC4wLFxuXG4gICAgICBwb3NpdGlvbi54LFxuICAgICAgcG9zaXRpb24ueSxcbiAgICAgIHBvc2l0aW9uLnosXG4gICAgICAxLjBcbiAgICBdICk7XG4gIH1cbn1cbiIsImltcG9ydCB7IE1hdHJpeDQsIFZlY3RvcjMgfSBmcm9tICcuJztcblxuZXhwb3J0IHR5cGUgcmF3UXVhdGVybmlvbiA9IFsgbnVtYmVyLCBudW1iZXIsIG51bWJlciwgbnVtYmVyIF07XG5cbmV4cG9ydCBjb25zdCByYXdJZGVudGl0eVF1YXRlcm5pb246IHJhd1F1YXRlcm5pb24gPSBbIDAuMCwgMC4wLCAwLjAsIDEuMCBdO1xuXG4vKipcbiAqIEEgUXVhdGVybmlvbi5cbiAqL1xuZXhwb3J0IGNsYXNzIFF1YXRlcm5pb24ge1xuICBwdWJsaWMgZWxlbWVudHM6IHJhd1F1YXRlcm5pb247IC8vIFsgeCwgeSwgejsgdyBdXG5cbiAgcHVibGljIGNvbnN0cnVjdG9yKCBlbGVtZW50czogcmF3UXVhdGVybmlvbiA9IHJhd0lkZW50aXR5UXVhdGVybmlvbiApIHtcbiAgICB0aGlzLmVsZW1lbnRzID0gZWxlbWVudHM7XG4gIH1cblxuICAvKipcbiAgICogQW4geCBjb21wb25lbnQgb2YgdGhpcy5cbiAgICovXG4gIHB1YmxpYyBnZXQgeCgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLmVsZW1lbnRzWyAwIF07XG4gIH1cblxuICAvKipcbiAgICogQW4geSBjb21wb25lbnQgb2YgdGhpcy5cbiAgICovXG4gIHB1YmxpYyBnZXQgeSgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLmVsZW1lbnRzWyAxIF07XG4gIH1cblxuICAvKipcbiAgICogQW4geiBjb21wb25lbnQgb2YgdGhpcy5cbiAgICovXG4gIHB1YmxpYyBnZXQgeigpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLmVsZW1lbnRzWyAyIF07XG4gIH1cblxuICAvKipcbiAgICogQW4gdyBjb21wb25lbnQgb2YgdGhpcy5cbiAgICovXG4gIHB1YmxpYyBnZXQgdygpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLmVsZW1lbnRzWyAzIF07XG4gIH1cblxuICBwdWJsaWMgdG9TdHJpbmcoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gYFF1YXRlcm5pb24oICR7IHRoaXMueC50b0ZpeGVkKCAzICkgfSwgJHsgdGhpcy55LnRvRml4ZWQoIDMgKSB9LCAkeyB0aGlzLnoudG9GaXhlZCggMyApIH0sICR7IHRoaXMudy50b0ZpeGVkKCAzICkgfSApYDtcbiAgfVxuXG4gIC8qKlxuICAgKiBDbG9uZSB0aGlzLlxuICAgKi9cbiAgcHVibGljIGNsb25lKCk6IFF1YXRlcm5pb24ge1xuICAgIHJldHVybiBuZXcgUXVhdGVybmlvbiggdGhpcy5lbGVtZW50cy5jb25jYXQoKSBhcyByYXdRdWF0ZXJuaW9uICk7XG4gIH1cblxuICAvKipcbiAgICogSXRzZWxmIGJ1dCBjb252ZXJ0ZWQgaW50byBhIE1hdHJpeDQuXG4gICAqL1xuICBwdWJsaWMgZ2V0IG1hdHJpeCgpOiBNYXRyaXg0IHtcbiAgICBjb25zdCB4ID0gbmV3IFZlY3RvcjMoIFsgMS4wLCAwLjAsIDAuMCBdICkuYXBwbHlRdWF0ZXJuaW9uKCB0aGlzICk7XG4gICAgY29uc3QgeSA9IG5ldyBWZWN0b3IzKCBbIDAuMCwgMS4wLCAwLjAgXSApLmFwcGx5UXVhdGVybmlvbiggdGhpcyApO1xuICAgIGNvbnN0IHogPSBuZXcgVmVjdG9yMyggWyAwLjAsIDAuMCwgMS4wIF0gKS5hcHBseVF1YXRlcm5pb24oIHRoaXMgKTtcblxuICAgIHJldHVybiBuZXcgTWF0cml4NCggW1xuICAgICAgeC54LCB5LngsIHoueCwgMC4wLFxuICAgICAgeC55LCB5LnksIHoueSwgMC4wLFxuICAgICAgeC56LCB5LnosIHoueiwgMC4wLFxuICAgICAgMC4wLCAwLjAsIDAuMCwgMS4wXG4gICAgXSApO1xuICB9XG5cbiAgLyoqXG4gICAqIEFuIGludmVyc2Ugb2YgdGhpcy5cbiAgICovXG4gIHB1YmxpYyBnZXQgaW52ZXJzZWQoKTogUXVhdGVybmlvbiB7XG4gICAgcmV0dXJuIG5ldyBRdWF0ZXJuaW9uKCBbXG4gICAgICAtdGhpcy54LFxuICAgICAgLXRoaXMueSxcbiAgICAgIC10aGlzLnosXG4gICAgICB0aGlzLndcbiAgICBdICk7XG4gIH1cblxuICAvKipcbiAgICogTXVsdGlwbHkgdHdvIFF1YXRlcm5pb25zLlxuICAgKiBAcGFyYW0gcSBBbm90aGVyIFF1YXRlcm5pb25cbiAgICovXG4gIHB1YmxpYyBtdWx0aXBseSggcTogUXVhdGVybmlvbiApOiBRdWF0ZXJuaW9uIHtcbiAgICByZXR1cm4gbmV3IFF1YXRlcm5pb24oIFtcbiAgICAgIHRoaXMudyAqIHEueCArIHRoaXMueCAqIHEudyArIHRoaXMueSAqIHEueiAtIHRoaXMueiAqIHEueSxcbiAgICAgIHRoaXMudyAqIHEueSAtIHRoaXMueCAqIHEueiArIHRoaXMueSAqIHEudyArIHRoaXMueiAqIHEueCxcbiAgICAgIHRoaXMudyAqIHEueiArIHRoaXMueCAqIHEueSAtIHRoaXMueSAqIHEueCArIHRoaXMueiAqIHEudyxcbiAgICAgIHRoaXMudyAqIHEudyAtIHRoaXMueCAqIHEueCAtIHRoaXMueSAqIHEueSAtIHRoaXMueiAqIHEuelxuICAgIF0gKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBbiBpZGVudGl0eSBRdWF0ZXJuaW9uLlxuICAgKi9cbiAgcHVibGljIHN0YXRpYyBnZXQgaWRlbnRpdHkoKTogUXVhdGVybmlvbiB7XG4gICAgcmV0dXJuIG5ldyBRdWF0ZXJuaW9uKCByYXdJZGVudGl0eVF1YXRlcm5pb24gKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZW5lcmF0ZSBhIFF1YXRlcm5pb24gb3V0IG9mIGFuZ2xlIGFuZCBheGlzLlxuICAgKi9cbiAgcHVibGljIHN0YXRpYyBmcm9tQXhpc0FuZ2xlKCBheGlzOiBWZWN0b3IzLCBhbmdsZTogbnVtYmVyICk6IFF1YXRlcm5pb24ge1xuICAgIGNvbnN0IGhhbGZBbmdsZSA9IGFuZ2xlIC8gMi4wO1xuICAgIGNvbnN0IHNpbkhhbGZBbmdsZSA9IE1hdGguc2luKCBoYWxmQW5nbGUgKTtcbiAgICByZXR1cm4gbmV3IFF1YXRlcm5pb24oIFtcbiAgICAgIGF4aXMueCAqIHNpbkhhbGZBbmdsZSxcbiAgICAgIGF4aXMueSAqIHNpbkhhbGZBbmdsZSxcbiAgICAgIGF4aXMueiAqIHNpbkhhbGZBbmdsZSxcbiAgICAgIE1hdGguY29zKCBoYWxmQW5nbGUgKVxuICAgIF0gKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZW5lcmF0ZSBhIFF1YXRlcm5pb24gb3V0IG9mIGEgcm90YXRpb24gbWF0cml4LlxuICAgKiBZb2lua2VkIGZyb20gVGhyZWUuanMuXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIGZyb21NYXRyaXgoIG1hdHJpeDogTWF0cml4NCApOiBRdWF0ZXJuaW9uIHtcbiAgICBjb25zdCBtID0gbWF0cml4LmVsZW1lbnRzLFxuICAgICAgbTExID0gbVsgMCBdLCBtMTIgPSBtWyA0IF0sIG0xMyA9IG1bIDggXSxcbiAgICAgIG0yMSA9IG1bIDEgXSwgbTIyID0gbVsgNSBdLCBtMjMgPSBtWyA5IF0sXG4gICAgICBtMzEgPSBtWyAyIF0sIG0zMiA9IG1bIDYgXSwgbTMzID0gbVsgMTAgXSxcbiAgICAgIHRyYWNlID0gbTExICsgbTIyICsgbTMzO1xuXG4gICAgaWYgKCB0cmFjZSA+IDAgKSB7XG4gICAgICBjb25zdCBzID0gMC41IC8gTWF0aC5zcXJ0KCB0cmFjZSArIDEuMCApO1xuICAgICAgcmV0dXJuIG5ldyBRdWF0ZXJuaW9uKCBbXG4gICAgICAgICggbTMyIC0gbTIzICkgKiBzLFxuICAgICAgICAoIG0xMyAtIG0zMSApICogcyxcbiAgICAgICAgKCBtMjEgLSBtMTIgKSAqIHMsXG4gICAgICAgIDAuMjUgLyBzXG4gICAgICBdICk7XG4gICAgfSBlbHNlIGlmICggbTExID4gbTIyICYmIG0xMSA+IG0zMyApIHtcbiAgICAgIGNvbnN0IHMgPSAyLjAgKiBNYXRoLnNxcnQoIDEuMCArIG0xMSAtIG0yMiAtIG0zMyApO1xuICAgICAgcmV0dXJuIG5ldyBRdWF0ZXJuaW9uKCBbXG4gICAgICAgIDAuMjUgKiBzLFxuICAgICAgICAoIG0xMiArIG0yMSApIC8gcyxcbiAgICAgICAgKCBtMTMgKyBtMzEgKSAvIHMsXG4gICAgICAgICggbTMyIC0gbTIzICkgLyBzXG4gICAgICBdICk7XG4gICAgfSBlbHNlIGlmICggbTIyID4gbTMzICkge1xuICAgICAgY29uc3QgcyA9IDIuMCAqIE1hdGguc3FydCggMS4wICsgbTIyIC0gbTExIC0gbTMzICk7XG4gICAgICByZXR1cm4gbmV3IFF1YXRlcm5pb24oIFtcbiAgICAgICAgKCBtMTIgKyBtMjEgKSAvIHMsXG4gICAgICAgIDAuMjUgKiBzLFxuICAgICAgICAoIG0yMyArIG0zMiApIC8gcyxcbiAgICAgICAgKCBtMTMgLSBtMzEgKSAvIHNcbiAgICAgIF0gKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgcyA9IDIuMCAqIE1hdGguc3FydCggMS4wICsgbTMzIC0gbTExIC0gbTIyICk7XG4gICAgICByZXR1cm4gbmV3IFF1YXRlcm5pb24oIFtcbiAgICAgICAgKCBtMTMgKyBtMzEgKSAvIHMsXG4gICAgICAgICggbTIzICsgbTMyICkgLyBzLFxuICAgICAgICAwLjI1ICogcyxcbiAgICAgICAgKCBtMjEgLSBtMTIgKSAvIHNcbiAgICAgIF0gKTtcbiAgICB9XG4gIH1cbn1cbiIsIi8qKlxuICogQSBWZWN0b3IuXG4gKi9cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBWZWN0b3I8VCBleHRlbmRzIFZlY3RvcjxUPj4ge1xuICBwdWJsaWMgYWJzdHJhY3QgZWxlbWVudHM6IG51bWJlcltdO1xuXG4gIC8qKlxuICAgKiBUaGUgbGVuZ3RoIG9mIHRoaXMuXG4gICAqIGEuay5hLiBgbWFnbml0dWRlYFxuICAgKi9cbiAgcHVibGljIGdldCBsZW5ndGgoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gTWF0aC5zcXJ0KCB0aGlzLmVsZW1lbnRzLnJlZHVjZSggKCBzdW0sIHYgKSA9PiBzdW0gKyB2ICogdiwgMC4wICkgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBIG5vcm1hbGl6ZWQgVmVjdG9yMyBvZiB0aGlzLlxuICAgKi9cbiAgcHVibGljIGdldCBub3JtYWxpemVkKCk6IFQge1xuICAgIHJldHVybiB0aGlzLnNjYWxlKCAxLjAgLyB0aGlzLmxlbmd0aCApO1xuICB9XG5cbiAgLyoqXG4gICAqIENsb25lIHRoaXMuXG4gICAqL1xuICBwdWJsaWMgY2xvbmUoKTogVCB7XG4gICAgcmV0dXJuIHRoaXMuX19uZXcoIHRoaXMuZWxlbWVudHMuY29uY2F0KCkgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGQgYSBWZWN0b3IgaW50byB0aGlzLlxuICAgKiBAcGFyYW0gdmVjdG9yIEFub3RoZXIgVmVjdG9yXG4gICAqL1xuICBwdWJsaWMgYWRkKCB2ZWN0b3I6IFQgKTogVCB7XG4gICAgcmV0dXJuIHRoaXMuX19uZXcoIHRoaXMuZWxlbWVudHMubWFwKCAoIHYsIGkgKSA9PiB2ICsgdmVjdG9yLmVsZW1lbnRzWyBpIF0gKSApO1xuICB9XG5cbiAgLyoqXG4gICAqIFN1YnN0cmFjdCB0aGlzIGZyb20gYW5vdGhlciBWZWN0b3IuXG4gICAqIEBwYXJhbSB2IEFub3RoZXIgdmVjdG9yXG4gICAqL1xuICBwdWJsaWMgc3ViKCB2ZWN0b3I6IFQgKTogVCB7XG4gICAgcmV0dXJuIHRoaXMuX19uZXcoIHRoaXMuZWxlbWVudHMubWFwKCAoIHYsIGkgKSA9PiB2IC0gdmVjdG9yLmVsZW1lbnRzWyBpIF0gKSApO1xuICB9XG5cbiAgLyoqXG4gICAqIE11bHRpcGx5IGEgVmVjdG9yIHdpdGggdGhpcy5cbiAgICogQHBhcmFtIHZlY3RvciBBbm90aGVyIFZlY3RvclxuICAgKi9cbiAgcHVibGljIG11bHRpcGx5KCB2ZWN0b3I6IFQgKTogVCB7XG4gICAgcmV0dXJuIHRoaXMuX19uZXcoIHRoaXMuZWxlbWVudHMubWFwKCAoIHYsIGkgKSA9PiB2ICogdmVjdG9yLmVsZW1lbnRzWyBpIF0gKSApO1xuICB9XG5cbiAgLyoqXG4gICAqIERpdmlkZSB0aGlzIGZyb20gYW5vdGhlciBWZWN0b3IuXG4gICAqIEBwYXJhbSB2ZWN0b3IgQW5vdGhlciBWZWN0b3JcbiAgICovXG4gIHB1YmxpYyBkaXZpZGUoIHZlY3RvcjogVCApOiBUIHtcbiAgICByZXR1cm4gdGhpcy5fX25ldyggdGhpcy5lbGVtZW50cy5tYXAoICggdiwgaSApID0+IHYgLyB2ZWN0b3IuZWxlbWVudHNbIGkgXSApICk7XG4gIH1cblxuICAvKipcbiAgICogU2NhbGUgdGhpcyBieSBzY2FsYXIuXG4gICAqIGEuay5hLiBgbXVsdGlwbHlTY2FsYXJgXG4gICAqIEBwYXJhbSBzY2FsYXIgQSBzY2FsYXJcbiAgICovXG4gIHB1YmxpYyBzY2FsZSggc2NhbGFyOiBudW1iZXIgKTogVCB7XG4gICAgcmV0dXJuIHRoaXMuX19uZXcoIHRoaXMuZWxlbWVudHMubWFwKCAoIHYgKSA9PiB2ICogc2NhbGFyICkgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBEb3QgdHdvIFZlY3RvcnMuXG4gICAqIEBwYXJhbSB2ZWN0b3IgQW5vdGhlciB2ZWN0b3JcbiAgICovXG4gIHB1YmxpYyBkb3QoIHZlY3RvcjogVCApOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLmVsZW1lbnRzLnJlZHVjZSggKCBzdW0sIHYsIGkgKSA9PiBzdW0gKyB2ICogdmVjdG9yLmVsZW1lbnRzWyBpIF0sIDAuMCApO1xuICB9XG5cbiAgcHJvdGVjdGVkIGFic3RyYWN0IF9fbmV3KCB2OiBudW1iZXJbXSApOiBUO1xufVxuIiwiaW1wb3J0IHsgTWF0cml4NCwgUXVhdGVybmlvbiwgVmVjdG9yIH0gZnJvbSAnLic7XG5cbmV4cG9ydCB0eXBlIHJhd1ZlY3RvcjMgPSBbIG51bWJlciwgbnVtYmVyLCBudW1iZXIgXTtcblxuLyoqXG4gKiBBIFZlY3RvcjMuXG4gKi9cbmV4cG9ydCBjbGFzcyBWZWN0b3IzIGV4dGVuZHMgVmVjdG9yPFZlY3RvcjM+IHtcbiAgcHVibGljIGVsZW1lbnRzOiByYXdWZWN0b3IzO1xuXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggdjogcmF3VmVjdG9yMyA9IFsgMC4wLCAwLjAsIDAuMCBdICkge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5lbGVtZW50cyA9IHY7XG4gIH1cblxuICAvKipcbiAgICogQW4geCBjb21wb25lbnQgb2YgdGhpcy5cbiAgICovXG4gIHB1YmxpYyBnZXQgeCgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLmVsZW1lbnRzWyAwIF07XG4gIH1cblxuICBwdWJsaWMgc2V0IHgoIHg6IG51bWJlciApIHtcbiAgICB0aGlzLmVsZW1lbnRzWyAwIF0gPSB4O1xuICB9XG5cbiAgLyoqXG4gICAqIEFuIHkgY29tcG9uZW50IG9mIHRoaXMuXG4gICAqL1xuICBwdWJsaWMgZ2V0IHkoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5lbGVtZW50c1sgMSBdO1xuICB9XG5cbiAgcHVibGljIHNldCB5KCB5OiBudW1iZXIgKSB7XG4gICAgdGhpcy5lbGVtZW50c1sgMSBdID0geTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBbiB6IGNvbXBvbmVudCBvZiB0aGlzLlxuICAgKi9cbiAgcHVibGljIGdldCB6KCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuZWxlbWVudHNbIDIgXTtcbiAgfVxuXG4gIHB1YmxpYyBzZXQgeiggejogbnVtYmVyICkge1xuICAgIHRoaXMuZWxlbWVudHNbIDIgXSA9IHo7XG4gIH1cblxuICBwdWJsaWMgdG9TdHJpbmcoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gYFZlY3RvcjMoICR7IHRoaXMueC50b0ZpeGVkKCAzICkgfSwgJHsgdGhpcy55LnRvRml4ZWQoIDMgKSB9LCAkeyB0aGlzLnoudG9GaXhlZCggMyApIH0gKWA7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJuIGEgY3Jvc3Mgb2YgdGhpcyBhbmQgYW5vdGhlciBWZWN0b3IzLlxuICAgKiBAcGFyYW0gdmVjdG9yIEFub3RoZXIgdmVjdG9yXG4gICAqL1xuICBwdWJsaWMgY3Jvc3MoIHZlY3RvcjogVmVjdG9yMyApOiBWZWN0b3IzIHtcbiAgICByZXR1cm4gbmV3IFZlY3RvcjMoIFtcbiAgICAgIHRoaXMueSAqIHZlY3Rvci56IC0gdGhpcy56ICogdmVjdG9yLnksXG4gICAgICB0aGlzLnogKiB2ZWN0b3IueCAtIHRoaXMueCAqIHZlY3Rvci56LFxuICAgICAgdGhpcy54ICogdmVjdG9yLnkgLSB0aGlzLnkgKiB2ZWN0b3IueFxuICAgIF0gKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSb3RhdGUgdGhpcyB2ZWN0b3IgdXNpbmcgYSBRdWF0ZXJuaW9uLlxuICAgKiBAcGFyYW0gcXVhdGVybmlvbiBBIHF1YXRlcm5pb25cbiAgICovXG4gIHB1YmxpYyBhcHBseVF1YXRlcm5pb24oIHF1YXRlcm5pb246IFF1YXRlcm5pb24gKTogVmVjdG9yMyB7XG4gICAgY29uc3QgcCA9IG5ldyBRdWF0ZXJuaW9uKCBbIHRoaXMueCwgdGhpcy55LCB0aGlzLnosIDAuMCBdICk7XG4gICAgY29uc3QgciA9IHF1YXRlcm5pb24uaW52ZXJzZWQ7XG4gICAgY29uc3QgcmVzID0gcXVhdGVybmlvbi5tdWx0aXBseSggcCApLm11bHRpcGx5KCByICk7XG4gICAgcmV0dXJuIG5ldyBWZWN0b3IzKCBbIHJlcy54LCByZXMueSwgcmVzLnogXSApO1xuICB9XG5cbiAgLyoqXG4gICAqIE11bHRpcGx5IHRoaXMgdmVjdG9yICh3aXRoIGFuIGltcGxpY2l0IDEgaW4gdGhlIDR0aCBkaW1lbnNpb24pIGJ5IG0uXG4gICAqL1xuICBwdWJsaWMgYXBwbHlNYXRyaXg0KCBtYXRyaXg6IE1hdHJpeDQgKTogVmVjdG9yMyB7XG4gICAgY29uc3QgbSA9IG1hdHJpeC5lbGVtZW50cztcblxuICAgIGNvbnN0IHcgPSBtWyAzIF0gKiB0aGlzLnggKyBtWyA3IF0gKiB0aGlzLnkgKyBtWyAxMSBdICogdGhpcy56ICsgbVsgMTUgXTtcbiAgICBjb25zdCBpbnZXID0gMS4wIC8gdztcblxuICAgIHJldHVybiBuZXcgVmVjdG9yMyggW1xuICAgICAgKCBtWyAwIF0gKiB0aGlzLnggKyBtWyA0IF0gKiB0aGlzLnkgKyBtWyA4IF0gKiB0aGlzLnogKyBtWyAxMiBdICkgKiBpbnZXLFxuICAgICAgKCBtWyAxIF0gKiB0aGlzLnggKyBtWyA1IF0gKiB0aGlzLnkgKyBtWyA5IF0gKiB0aGlzLnogKyBtWyAxMyBdICkgKiBpbnZXLFxuICAgICAgKCBtWyAyIF0gKiB0aGlzLnggKyBtWyA2IF0gKiB0aGlzLnkgKyBtWyAxMCBdICogdGhpcy56ICsgbVsgMTQgXSApICogaW52V1xuICAgIF0gKTtcbiAgfVxuXG4gIHByb3RlY3RlZCBfX25ldyggdjogcmF3VmVjdG9yMyApOiBWZWN0b3IzIHtcbiAgICByZXR1cm4gbmV3IFZlY3RvcjMoIHYgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBWZWN0b3IzKCAwLjAsIDAuMCwgMC4wIClcbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgZ2V0IHplcm8oKTogVmVjdG9yMyB7XG4gICAgcmV0dXJuIG5ldyBWZWN0b3IzKCBbIDAuMCwgMC4wLCAwLjAgXSApO1xuICB9XG5cbiAgLyoqXG4gICAqIFZlY3RvcjMoIDEuMCwgMS4wLCAxLjAgKVxuICAgKi9cbiAgcHVibGljIHN0YXRpYyBnZXQgb25lKCk6IFZlY3RvcjMge1xuICAgIHJldHVybiBuZXcgVmVjdG9yMyggWyAxLjAsIDEuMCwgMS4wIF0gKTtcbiAgfVxufVxuIiwiaW1wb3J0IHsgTWF0cml4NCwgVmVjdG9yIH0gZnJvbSAnLic7XG5cbmV4cG9ydCB0eXBlIHJhd1ZlY3RvcjQgPSBbIG51bWJlciwgbnVtYmVyLCBudW1iZXIsIG51bWJlciBdO1xuXG4vKipcbiAqIEEgVmVjdG9yMy5cbiAqL1xuZXhwb3J0IGNsYXNzIFZlY3RvcjQgZXh0ZW5kcyBWZWN0b3I8VmVjdG9yND4ge1xuICBwdWJsaWMgZWxlbWVudHM6IHJhd1ZlY3RvcjQ7XG5cbiAgcHVibGljIGNvbnN0cnVjdG9yKCB2OiByYXdWZWN0b3I0ID0gWyAwLjAsIDAuMCwgMC4wLCAwLjAgXSApIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMuZWxlbWVudHMgPSB2O1xuICB9XG5cbiAgLyoqXG4gICAqIEFuIHggY29tcG9uZW50IG9mIHRoaXMuXG4gICAqL1xuICBwdWJsaWMgZ2V0IHgoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5lbGVtZW50c1sgMCBdO1xuICB9XG5cbiAgcHVibGljIHNldCB4KCB4OiBudW1iZXIgKSB7XG4gICAgdGhpcy5lbGVtZW50c1sgMCBdID0geDtcbiAgfVxuXG4gIC8qKlxuICAgKiBBIHkgY29tcG9uZW50IG9mIHRoaXMuXG4gICAqL1xuICBwdWJsaWMgZ2V0IHkoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5lbGVtZW50c1sgMSBdO1xuICB9XG5cbiAgcHVibGljIHNldCB5KCB5OiBudW1iZXIgKSB7XG4gICAgdGhpcy5lbGVtZW50c1sgMSBdID0geTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBIHogY29tcG9uZW50IG9mIHRoaXMuXG4gICAqL1xuICBwdWJsaWMgZ2V0IHooKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5lbGVtZW50c1sgMiBdO1xuICB9XG5cbiAgcHVibGljIHNldCB6KCB6OiBudW1iZXIgKSB7XG4gICAgdGhpcy5lbGVtZW50c1sgMiBdID0gejtcbiAgfVxuXG4gIC8qKlxuICAgKiBBIHcgY29tcG9uZW50IG9mIHRoaXMuXG4gICAqL1xuICBwdWJsaWMgZ2V0IHcoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5lbGVtZW50c1sgMyBdO1xuICB9XG5cbiAgcHVibGljIHNldCB3KCB6OiBudW1iZXIgKSB7XG4gICAgdGhpcy5lbGVtZW50c1sgMyBdID0gejtcbiAgfVxuXG4gIHB1YmxpYyB0b1N0cmluZygpOiBzdHJpbmcge1xuICAgIHJldHVybiBgVmVjdG9yNCggJHsgdGhpcy54LnRvRml4ZWQoIDMgKSB9LCAkeyB0aGlzLnkudG9GaXhlZCggMyApIH0sICR7IHRoaXMuei50b0ZpeGVkKCAzICkgfSwgJHsgdGhpcy53LnRvRml4ZWQoIDMgKSB9IClgO1xuICB9XG5cbiAgLyoqXG4gICAqIE11bHRpcGx5IHRoaXMgdmVjdG9yICh3aXRoIGFuIGltcGxpY2l0IDEgaW4gdGhlIDR0aCBkaW1lbnNpb24pIGJ5IG0uXG4gICAqL1xuICBwdWJsaWMgYXBwbHlNYXRyaXg0KCBtYXRyaXg6IE1hdHJpeDQgKTogVmVjdG9yNCB7XG4gICAgY29uc3QgbSA9IG1hdHJpeC5lbGVtZW50cztcblxuICAgIHJldHVybiBuZXcgVmVjdG9yNCggW1xuICAgICAgbVsgMCBdICogdGhpcy54ICsgbVsgNCBdICogdGhpcy55ICsgbVsgOCBdICogdGhpcy56ICsgbVsgMTIgXSAqIHRoaXMudyxcbiAgICAgIG1bIDEgXSAqIHRoaXMueCArIG1bIDUgXSAqIHRoaXMueSArIG1bIDkgXSAqIHRoaXMueiArIG1bIDEzIF0gKiB0aGlzLncsXG4gICAgICBtWyAyIF0gKiB0aGlzLnggKyBtWyA2IF0gKiB0aGlzLnkgKyBtWyAxMCBdICogdGhpcy56ICsgbVsgMTQgXSAqIHRoaXMudyxcbiAgICAgIG1bIDMgXSAqIHRoaXMueCArIG1bIDcgXSAqIHRoaXMueSArIG1bIDExIF0gKiB0aGlzLnogKyBtWyAxNSBdICogdGhpcy53XG4gICAgXSApO1xuICB9XG5cbiAgcHJvdGVjdGVkIF9fbmV3KCB2OiByYXdWZWN0b3I0ICk6IFZlY3RvcjQge1xuICAgIHJldHVybiBuZXcgVmVjdG9yNCggdiApO1xuICB9XG5cbiAgLyoqXG4gICAqIFZlY3RvcjQoIDAuMCwgMC4wLCAwLjAsIDAuMCApXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIGdldCB6ZXJvKCk6IFZlY3RvcjQge1xuICAgIHJldHVybiBuZXcgVmVjdG9yNCggWyAwLjAsIDAuMCwgMC4wLCAwLjAgXSApO1xuICB9XG5cbiAgLyoqXG4gICAqIFZlY3RvcjQoIDEuMCwgMS4wLCAxLjAsIDEuMCApXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIGdldCBvbmUoKTogVmVjdG9yNCB7XG4gICAgcmV0dXJuIG5ldyBWZWN0b3I0KCBbIDEuMCwgMS4wLCAxLjAsIDEuMCBdICk7XG4gIH1cbn1cbiIsImV4cG9ydCAqIGZyb20gJy4vTWF0cml4NCc7XG5leHBvcnQgKiBmcm9tICcuL1F1YXRlcm5pb24nO1xuZXhwb3J0ICogZnJvbSAnLi9WZWN0b3InO1xuZXhwb3J0ICogZnJvbSAnLi9WZWN0b3IzJztcbmV4cG9ydCAqIGZyb20gJy4vVmVjdG9yNCc7XG5leHBvcnQgKiBmcm9tICcuL3V0aWxzJztcbiIsIi8qKlxuICogYGxlcnBgLCBvciBgbWl4YFxuICovXG5leHBvcnQgZnVuY3Rpb24gbGVycCggYTogbnVtYmVyLCBiOiBudW1iZXIsIHg6IG51bWJlciApOiBudW1iZXIge1xuICByZXR1cm4gYSArICggYiAtIGEgKSAqIHg7XG59XG5cbi8qKlxuICogYGNsYW1wYFxuICovXG5leHBvcnQgZnVuY3Rpb24gY2xhbXAoIHg6IG51bWJlciwgbDogbnVtYmVyLCBoOiBudW1iZXIgKTogbnVtYmVyIHtcbiAgcmV0dXJuIE1hdGgubWluKCBNYXRoLm1heCggeCwgbCApLCBoICk7XG59XG5cbi8qKlxuICogYGNsYW1wKCB4LCAwLjAsIDEuMCApYFxuICovXG5leHBvcnQgZnVuY3Rpb24gc2F0dXJhdGUoIHg6IG51bWJlciApOiBudW1iZXIge1xuICByZXR1cm4gY2xhbXAoIHgsIDAuMCwgMS4wICk7XG59XG5cbi8qKlxuICogYHNtb290aHN0ZXBgIGJ1dCBub3Qgc21vb3RoXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBsaW5lYXJzdGVwKCBhOiBudW1iZXIsIGI6IG51bWJlciwgeDogbnVtYmVyICk6IG51bWJlciB7XG4gIHJldHVybiBzYXR1cmF0ZSggKCB4IC0gYSApIC8gKCBiIC0gYSApICk7XG59XG5cbi8qKlxuICogd29ybGQgZmFtb3VzIGBzbW9vdGhzdGVwYCBmdW5jdGlvblxuICovXG5leHBvcnQgZnVuY3Rpb24gc21vb3Roc3RlcCggYTogbnVtYmVyLCBiOiBudW1iZXIsIHg6IG51bWJlciApOiBudW1iZXIge1xuICBjb25zdCB0ID0gbGluZWFyc3RlcCggYSwgYiwgeCApO1xuICByZXR1cm4gdCAqIHQgKiAoIDMuMCAtIDIuMCAqIHQgKTtcbn1cblxuLyoqXG4gKiBgc21vb3Roc3RlcGAgYnV0IG1vcmUgc21vb3RoXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzbW9vdGhlcnN0ZXAoIGE6IG51bWJlciwgYjogbnVtYmVyLCB4OiBudW1iZXIgKTogbnVtYmVyIHtcbiAgY29uc3QgdCA9IGxpbmVhcnN0ZXAoIGEsIGIsIHggKTtcbiAgcmV0dXJuIHQgKiB0ICogdCAqICggdCAqICggdCAqIDYuMCAtIDE1LjAgKSArIDEwLjAgKTtcbn1cblxuLyoqXG4gKiBgc21vb3Roc3RlcGAgYnV0IFdBWSBtb3JlIHNtb290aFxuICovXG5leHBvcnQgZnVuY3Rpb24gc21vb3RoZXN0c3RlcCggYTogbnVtYmVyLCBiOiBudW1iZXIsIHg6IG51bWJlciApOiBudW1iZXIge1xuICBjb25zdCB0ID0gbGluZWFyc3RlcCggYSwgYiwgeCApO1xuICByZXR1cm4gdCAqIHQgKiB0ICogdCAqICggdCAqICggdCAqICggLTIwLjAgKiB0ICsgNzAuMCApIC0gODQuMCApICsgMzUuMCApO1xufVxuIl0sInNvdXJjZVJvb3QiOiIifQ==