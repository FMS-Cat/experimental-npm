/*!
 * @fms-cat/experimental v0.3.0
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
            this.recalc();
        }
        else {
            this.__countUntilRecalc--;
            this.__cache -= prev;
            this.__cache += value;
        }
    };
    HistoryMeanCalculator.prototype.recalc = function () {
        this.__countUntilRecalc = this.__recalcForEach;
        var sum = this.__history
            .slice(0, Math.min(this.__count, this.__length))
            .reduce(function (sum, v) { return sum + v; }, 0);
        this.__cache = sum;
    };
    return HistoryMeanCalculator;
}());
exports.HistoryMeanCalculator = HistoryMeanCalculator;


/***/ }),

/***/ "./src/HistoryMeanCalculator/HistoryMedianCalculator.ts":
/*!**************************************************************!*\
  !*** ./src/HistoryMeanCalculator/HistoryMedianCalculator.ts ***!
  \**************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var binarySearch_1 = __webpack_require__(/*! ../algorithm/binarySearch */ "./src/algorithm/binarySearch.ts");
/**
 * Useful for tap tempo
 * See also: {@link HistoryMeanCalculator}
 */
var HistoryMedianCalculator = /** @class */ (function () {
    function HistoryMedianCalculator(length) {
        this.__history = [];
        this.__sorted = [];
        this.__index = 0;
        this.__length = length;
    }
    Object.defineProperty(HistoryMedianCalculator.prototype, "median", {
        get: function () {
            var count = Math.min(this.__sorted.length, this.__length);
            return this.__sorted[Math.floor((count - 1) / 2)];
        },
        enumerable: true,
        configurable: true
    });
    HistoryMedianCalculator.prototype.reset = function () {
        this.__index = 0;
        this.__history = [];
        this.__sorted = [];
    };
    HistoryMedianCalculator.prototype.push = function (value) {
        var prev = this.__history[this.__index];
        this.__history[this.__index] = value;
        this.__index = (this.__index + 1) % this.__length;
        // remove the prev from sorted array
        if (this.__sorted.length === this.__length) {
            var prevIndex = binarySearch_1.binarySearch(prev, this.__sorted);
            this.__sorted.splice(prevIndex, 1);
        }
        var index = binarySearch_1.binarySearch(value, this.__sorted);
        this.__sorted.splice(index, 0, value);
    };
    return HistoryMedianCalculator;
}());
exports.HistoryMedianCalculator = HistoryMedianCalculator;


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
__export(__webpack_require__(/*! ./HistoryMedianCalculator */ "./src/HistoryMeanCalculator/HistoryMedianCalculator.ts"));


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

/***/ "./src/TapTempo/TapTempo.ts":
/*!**********************************!*\
  !*** ./src/TapTempo/TapTempo.ts ***!
  \**********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var HistoryMedianCalculator_1 = __webpack_require__(/*! ../HistoryMeanCalculator/HistoryMedianCalculator */ "./src/HistoryMeanCalculator/HistoryMedianCalculator.ts");
var TapTempo = /** @class */ (function () {
    function TapTempo() {
        this.__bpm = 0.0;
        this.__lastTap = 0.0;
        this.__lastBeat = 0.0;
        this.__lastTime = 0.0;
        this.__calc = new HistoryMedianCalculator_1.HistoryMedianCalculator(16);
    }
    Object.defineProperty(TapTempo.prototype, "beatDuration", {
        get: function () {
            return 60.0 / this.__bpm;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TapTempo.prototype, "bpm", {
        get: function () {
            return this.__bpm;
        },
        set: function (bpm) {
            this.__lastBeat = this.beat;
            this.__lastTime = performance.now();
            this.__bpm = bpm;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TapTempo.prototype, "beat", {
        get: function () {
            return this.__lastBeat + (performance.now() - this.__lastTime) * 0.001 / this.beatDuration;
        },
        enumerable: true,
        configurable: true
    });
    TapTempo.prototype.reset = function () {
        this.__calc.reset();
    };
    TapTempo.prototype.nudge = function (amount) {
        this.__lastBeat = this.beat + amount;
        this.__lastTime = performance.now();
    };
    TapTempo.prototype.tap = function () {
        var now = performance.now();
        var delta = (now - this.__lastTap) * 0.001;
        if (2.0 < delta) {
            this.reset();
        }
        else {
            this.__calc.push(delta);
            this.__bpm = 60.0 / (this.__calc.median);
        }
        this.__lastTap = now;
        this.__lastTime = now;
        this.__lastBeat = 0.0;
    };
    return TapTempo;
}());
exports.TapTempo = TapTempo;


/***/ }),

/***/ "./src/TapTempo/index.ts":
/*!*******************************!*\
  !*** ./src/TapTempo/index.ts ***!
  \*******************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(__webpack_require__(/*! ./TapTempo */ "./src/TapTempo/TapTempo.ts"));


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

/***/ "./src/algorithm/binarySearch.ts":
/*!***************************************!*\
  !*** ./src/algorithm/binarySearch.ts ***!
  \***************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

// yoinked from https://stackoverflow.com/questions/1344500/efficient-way-to-insert-a-number-into-a-sorted-array-of-numbers
Object.defineProperty(exports, "__esModule", { value: true });
function binarySearch(element, array) {
    var start = 0;
    var end = array.length;
    while (start < end) {
        var center = (start + end) >> 1;
        if (array[center] < element) {
            start = center + 1;
        }
        else {
            end = center;
        }
    }
    return start;
}
exports.binarySearch = binarySearch;


/***/ }),

/***/ "./src/algorithm/index.ts":
/*!********************************!*\
  !*** ./src/algorithm/index.ts ***!
  \********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(__webpack_require__(/*! ./binarySearch */ "./src/algorithm/binarySearch.ts"));


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
__export(__webpack_require__(/*! ./algorithm */ "./src/algorithm/index.ts"));
__export(__webpack_require__(/*! ./array */ "./src/array/index.ts"));
__export(__webpack_require__(/*! ./CDS */ "./src/CDS/index.ts"));
__export(__webpack_require__(/*! ./Clock */ "./src/Clock/index.ts"));
__export(__webpack_require__(/*! ./ExpSmooth */ "./src/ExpSmooth/index.ts"));
__export(__webpack_require__(/*! ./FizzBuzz */ "./src/FizzBuzz/index.ts"));
__export(__webpack_require__(/*! ./FMS_Cat */ "./src/FMS_Cat/index.ts"));
__export(__webpack_require__(/*! ./HistoryMeanCalculator */ "./src/HistoryMeanCalculator/index.ts"));
__export(__webpack_require__(/*! ./math */ "./src/math/index.ts"));
__export(__webpack_require__(/*! ./Swap */ "./src/Swap/index.ts"));
__export(__webpack_require__(/*! ./TapTempo */ "./src/TapTempo/index.ts"));
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9GTVNfQ0FUX0VYUEVSSU1FTlRBTC93ZWJwYWNrL3VuaXZlcnNhbE1vZHVsZURlZmluaXRpb24iLCJ3ZWJwYWNrOi8vRk1TX0NBVF9FWFBFUklNRU5UQUwvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vRk1TX0NBVF9FWFBFUklNRU5UQUwvLi9zcmMvQ0RTL0NEUy50cyIsIndlYnBhY2s6Ly9GTVNfQ0FUX0VYUEVSSU1FTlRBTC8uL3NyYy9DRFMvaW5kZXgudHMiLCJ3ZWJwYWNrOi8vRk1TX0NBVF9FWFBFUklNRU5UQUwvLi9zcmMvQ2xvY2svQ2xvY2sudHMiLCJ3ZWJwYWNrOi8vRk1TX0NBVF9FWFBFUklNRU5UQUwvLi9zcmMvQ2xvY2svQ2xvY2tGcmFtZS50cyIsIndlYnBhY2s6Ly9GTVNfQ0FUX0VYUEVSSU1FTlRBTC8uL3NyYy9DbG9jay9DbG9ja1JlYWx0aW1lLnRzIiwid2VicGFjazovL0ZNU19DQVRfRVhQRVJJTUVOVEFMLy4vc3JjL0Nsb2NrL2luZGV4LnRzIiwid2VicGFjazovL0ZNU19DQVRfRVhQRVJJTUVOVEFMLy4vc3JjL0V4cFNtb290aC9FeHBTbW9vdGgudHMiLCJ3ZWJwYWNrOi8vRk1TX0NBVF9FWFBFUklNRU5UQUwvLi9zcmMvRXhwU21vb3RoL2luZGV4LnRzIiwid2VicGFjazovL0ZNU19DQVRfRVhQRVJJTUVOVEFMLy4vc3JjL0ZNU19DYXQvRk1TX0NhdC50cyIsIndlYnBhY2s6Ly9GTVNfQ0FUX0VYUEVSSU1FTlRBTC8uL3NyYy9GTVNfQ2F0L2luZGV4LnRzIiwid2VicGFjazovL0ZNU19DQVRfRVhQRVJJTUVOVEFMLy4vc3JjL0ZpenpCdXp6L0ZpenpCdXp6LnRzIiwid2VicGFjazovL0ZNU19DQVRfRVhQRVJJTUVOVEFMLy4vc3JjL0ZpenpCdXp6L2luZGV4LnRzIiwid2VicGFjazovL0ZNU19DQVRfRVhQRVJJTUVOVEFMLy4vc3JjL0hpc3RvcnlNZWFuQ2FsY3VsYXRvci9IaXN0b3J5TWVhbkNhbGN1bGF0b3IudHMiLCJ3ZWJwYWNrOi8vRk1TX0NBVF9FWFBFUklNRU5UQUwvLi9zcmMvSGlzdG9yeU1lYW5DYWxjdWxhdG9yL0hpc3RvcnlNZWRpYW5DYWxjdWxhdG9yLnRzIiwid2VicGFjazovL0ZNU19DQVRfRVhQRVJJTUVOVEFMLy4vc3JjL0hpc3RvcnlNZWFuQ2FsY3VsYXRvci9pbmRleC50cyIsIndlYnBhY2s6Ly9GTVNfQ0FUX0VYUEVSSU1FTlRBTC8uL3NyYy9Td2FwL1N3YXAudHMiLCJ3ZWJwYWNrOi8vRk1TX0NBVF9FWFBFUklNRU5UQUwvLi9zcmMvU3dhcC9pbmRleC50cyIsIndlYnBhY2s6Ly9GTVNfQ0FUX0VYUEVSSU1FTlRBTC8uL3NyYy9UYXBUZW1wby9UYXBUZW1wby50cyIsIndlYnBhY2s6Ly9GTVNfQ0FUX0VYUEVSSU1FTlRBTC8uL3NyYy9UYXBUZW1wby9pbmRleC50cyIsIndlYnBhY2s6Ly9GTVNfQ0FUX0VYUEVSSU1FTlRBTC8uL3NyYy9Yb3JzaGlmdC9Yb3JzaGlmdC50cyIsIndlYnBhY2s6Ly9GTVNfQ0FUX0VYUEVSSU1FTlRBTC8uL3NyYy9Yb3JzaGlmdC9pbmRleC50cyIsIndlYnBhY2s6Ly9GTVNfQ0FUX0VYUEVSSU1FTlRBTC8uL3NyYy9hbGdvcml0aG0vYmluYXJ5U2VhcmNoLnRzIiwid2VicGFjazovL0ZNU19DQVRfRVhQRVJJTUVOVEFMLy4vc3JjL2FsZ29yaXRobS9pbmRleC50cyIsIndlYnBhY2s6Ly9GTVNfQ0FUX0VYUEVSSU1FTlRBTC8uL3NyYy9hcnJheS9jb25zdGFudHMudHMiLCJ3ZWJwYWNrOi8vRk1TX0NBVF9FWFBFUklNRU5UQUwvLi9zcmMvYXJyYXkvaW5kZXgudHMiLCJ3ZWJwYWNrOi8vRk1TX0NBVF9FWFBFUklNRU5UQUwvLi9zcmMvYXJyYXkvdXRpbHMudHMiLCJ3ZWJwYWNrOi8vRk1TX0NBVF9FWFBFUklNRU5UQUwvLi9zcmMvaW5kZXgudHMiLCJ3ZWJwYWNrOi8vRk1TX0NBVF9FWFBFUklNRU5UQUwvLi9zcmMvbWF0aC9NYXRyaXg0LnRzIiwid2VicGFjazovL0ZNU19DQVRfRVhQRVJJTUVOVEFMLy4vc3JjL21hdGgvUXVhdGVybmlvbi50cyIsIndlYnBhY2s6Ly9GTVNfQ0FUX0VYUEVSSU1FTlRBTC8uL3NyYy9tYXRoL1ZlY3Rvci50cyIsIndlYnBhY2s6Ly9GTVNfQ0FUX0VYUEVSSU1FTlRBTC8uL3NyYy9tYXRoL1ZlY3RvcjMudHMiLCJ3ZWJwYWNrOi8vRk1TX0NBVF9FWFBFUklNRU5UQUwvLi9zcmMvbWF0aC9WZWN0b3I0LnRzIiwid2VicGFjazovL0ZNU19DQVRfRVhQRVJJTUVOVEFMLy4vc3JjL21hdGgvaW5kZXgudHMiLCJ3ZWJwYWNrOi8vRk1TX0NBVF9FWFBFUklNRU5UQUwvLi9zcmMvbWF0aC91dGlscy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7OztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLENBQUM7QUFDRCxPO1FDVkE7UUFDQTs7UUFFQTtRQUNBOztRQUVBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBOztRQUVBO1FBQ0E7O1FBRUE7UUFDQTs7UUFFQTtRQUNBO1FBQ0E7OztRQUdBO1FBQ0E7O1FBRUE7UUFDQTs7UUFFQTtRQUNBO1FBQ0E7UUFDQSwwQ0FBMEMsZ0NBQWdDO1FBQzFFO1FBQ0E7O1FBRUE7UUFDQTtRQUNBO1FBQ0Esd0RBQXdELGtCQUFrQjtRQUMxRTtRQUNBLGlEQUFpRCxjQUFjO1FBQy9EOztRQUVBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQSx5Q0FBeUMsaUNBQWlDO1FBQzFFLGdIQUFnSCxtQkFBbUIsRUFBRTtRQUNySTtRQUNBOztRQUVBO1FBQ0E7UUFDQTtRQUNBLDJCQUEyQiwwQkFBMEIsRUFBRTtRQUN2RCxpQ0FBaUMsZUFBZTtRQUNoRDtRQUNBO1FBQ0E7O1FBRUE7UUFDQSxzREFBc0QsK0RBQStEOztRQUVySDtRQUNBOzs7UUFHQTtRQUNBOzs7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RyxDQUFDLENBQUUsRUFDMUQsR0FBRyxHQUFHLENBQUMsQ0FBRyxDQUFDLENBQUUsRUFBRSxHQUFHLEdBQUcsQ0FBQyxDQUFHLENBQUMsQ0FBRSxFQUFFLEdBQUcsR0FBRyxDQUFDLENBQUcsQ0FBQyxDQUFFLEVBQUUsR0FBRyxHQUFHLENBQUMsQ0FBRyxDQUFDLENBQUUsRUFDMUQsR0FBRyxHQUFHLENBQUMsQ0FBRyxDQUFDLENBQUUsRUFBRSxHQUFHLEdBQUcsQ0FBQyxDQUFHLENBQUMsQ0FBRSxFQUFFLEdBQUcsR0FBRyxDQUFDLENBQUUsRUFBRSxDQUFFLEVBQUUsR0FBRyxHQUFHLENBQUMsQ0FBRSxFQUFFLENBQUUsRUFDMUQsR0FBRyxHQUFHLENBQUMsQ0FBRSxFQUFFLENBQUUsRUFBRSxHQUFHLEdBQUcsQ0FBQyxDQUFFLEVBQUUsQ0FBRSxFQUFFLEdBQUcsR0FBRyxDQUFDLENBQUUsRUFBRSxDQUFFLEVBQUUsR0FBRyxHQUFHLENBQUMsQ0FBRSxFQUFFLENBQUUsRUFDMUQsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsRUFBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxFQUN6RCxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxFQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEVBQ3pELEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEVBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsRUFDekQsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsRUFBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxFQUN6RCxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxFQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEVBQ3pELEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEVBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQztZQUU1RCxPQUFPLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDO1FBQy9FLENBQUM7OztPQUFBO0lBS0Qsc0JBQVcsNEJBQU87UUFIbEI7O1dBRUc7YUFDSDtZQUNFLElBQU0sQ0FBQyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUM7WUFDeEIsSUFDRSxHQUFHLEdBQUcsQ0FBQyxDQUFHLENBQUMsQ0FBRSxFQUFFLEdBQUcsR0FBRyxDQUFDLENBQUcsQ0FBQyxDQUFFLEVBQUUsR0FBRyxHQUFHLENBQUMsQ0FBRyxDQUFDLENBQUUsRUFBRSxHQUFHLEdBQUcsQ0FBQyxDQUFHLENBQUMsQ0FBRSxFQUMxRCxHQUFHLEdBQUcsQ0FBQyxDQUFHLENBQUMsQ0FBRSxFQUFFLEdBQUcsR0FBRyxDQUFDLENBQUcsQ0FBQyxDQUFFLEVBQUUsR0FBRyxHQUFHLENBQUMsQ0FBRyxDQUFDLENBQUUsRUFBRSxHQUFHLEdBQUcsQ0FBQyxDQUFHLENBQUMsQ0FBRSxFQUMxRCxHQUFHLEdBQUcsQ0FBQyxDQUFHLENBQUMsQ0FBRSxFQUFFLEdBQUcsR0FBRyxDQUFDLENBQUcsQ0FBQyxDQUFFLEVBQUUsR0FBRyxHQUFHLENBQUMsQ0FBRSxFQUFFLENBQUUsRUFBRSxHQUFHLEdBQUcsQ0FBQyxDQUFFLEVBQUUsQ0FBRSxFQUMxRCxHQUFHLEdBQUcsQ0FBQyxDQUFFLEVBQUUsQ0FBRSxFQUFFLEdBQUcsR0FBRyxDQUFDLENBQUUsRUFBRSxDQUFFLEVBQUUsR0FBRyxHQUFHLENBQUMsQ0FBRSxFQUFFLENBQUUsRUFBRSxHQUFHLEdBQUcsQ0FBQyxDQUFFLEVBQUUsQ0FBRSxFQUMxRCxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxFQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEVBQ3pELEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEVBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsRUFDekQsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsRUFBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxFQUN6RCxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxFQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEVBQ3pELEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEVBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsRUFDekQsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsRUFBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDO1lBRTVELElBQU0sR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDO1lBRWxGLElBQUssR0FBRyxLQUFLLEdBQUcsRUFBRztnQkFBRSxPQUFPLElBQUksQ0FBQzthQUFFO1lBRW5DLElBQU0sTUFBTSxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUM7WUFFekIsT0FBTyxJQUFJLE9BQU8sQ0FBRTtnQkFDbEIsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHO2dCQUNqQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUc7Z0JBQ2pDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRztnQkFDakMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHO2dCQUNqQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUc7Z0JBQ2pDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRztnQkFDakMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHO2dCQUNqQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUc7Z0JBQ2pDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRztnQkFDakMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHO2dCQUNqQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUc7Z0JBQ2pDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRztnQkFDakMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHO2dCQUNqQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUc7Z0JBQ2pDLEdBQUcsR0FBRyxH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LEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsRUFBRSxDQUFFLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxFQUFFLENBQUUsR0FBRyxDQUFDLENBQUUsQ0FBQyxDQUFFO1lBQ3ZFLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsRUFBRSxDQUFFLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxFQUFFLENBQUUsR0FBRyxDQUFDLENBQUUsQ0FBQyxDQUFFO1lBRXZFLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxFQUFFLENBQUUsR0FBRyxDQUFDLENBQUUsQ0FBQyxDQUFFO1lBQ3RFLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxFQUFFLENBQUUsR0FBRyxDQUFDLENBQUUsQ0FBQyxDQUFFO1lBQ3RFLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsRUFBRSxDQUFFLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxFQUFFLENBQUUsR0FBRyxDQUFDLENBQUUsQ0FBQyxDQUFFO1lBQ3ZFLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsRUFBRSxDQUFFLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxFQUFFLENBQUUsR0FBRyxDQUFDLENBQUUsQ0FBQyxDQUFFO1lBRXZFLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLEVBQUUsQ0FBRSxHQUFHLENBQUMsQ0FBRSxFQUFFLENBQUUsR0FBRyxDQUFDLENBQUUsRUFBRSxDQUFFO1lBQ3hFLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLEVBQUUsQ0FBRSxHQUFHLENBQUMsQ0FBRSxFQUFFLENBQUUsR0FBRyxDQUFDLENBQUUsRUFBRSxDQUFFO1lBQ3hFLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsRUFBRSxDQUFFLEdBQUcsQ0FBQyxDQUFFLEVBQUUsQ0FBRSxHQUFHLENBQUMsQ0FBRSxFQUFFLENBQUUsR0FBRyxDQUFDLENBQUUsRUFBRSxDQUFFO1lBQ3pFLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsRUFBRSxDQUFFLEdBQUcsQ0FBQyxDQUFFLEVBQUUsQ0FBRSxHQUFHLENBQUMsQ0FBRSxFQUFFLENBQUUsR0FBRyxDQUFDLENBQUUsRUFBRSxDQUFFO1lBRXpFLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsRUFBRSxDQUFFLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxFQUFFLENBQUUsR0FBRyxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLEVBQUUsQ0FBRSxHQUFHLENBQUMsQ0FBRSxFQUFFLENBQUUsR0FBRyxDQUFDLENBQUUsRUFBRSxDQUFFO1lBQzFFLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsRUFBRSxDQUFFLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxFQUFFLENBQUUsR0FBRyxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLEVBQUUsQ0FBRSxHQUFHLENBQUMsQ0FBRSxFQUFFLENBQUUsR0FBRyxDQUFDLENBQUUsRUFBRSxDQUFFO1lBQzFFLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsRUFBRSxDQUFFLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxFQUFFLENBQUUsR0FBRyxDQUFDLENBQUUsRUFBRSxDQUFFLEdBQUcsQ0FBQyxDQUFFLEVBQUUsQ0FBRSxHQUFHLENBQUMsQ0FBRSxFQUFFLENBQUUsR0FBRyxDQUFDLENBQUUsRUFBRSxDQUFFO1lBQzNFLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsRUFBRSxDQUFFLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxFQUFFLENBQUUsR0FBRyxDQUFDLENBQUUsRUFBRSxDQUFFLEdBQUcsQ0FBQyxD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QyxHQUFHLENBQUUsQ0FBQyxHQUFHLENBQUUsQ0FBQyxHQUFHLENBQUUsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBRSxHQUFHLElBQUksQ0FBRSxHQUFHLElBQUksQ0FBRSxDQUFDO0FBQzVFLENBQUM7QUFIRCxzQ0FHQyIsImZpbGUiOiJmbXMtY2F0LWV4cGVyaW1lbnRhbC5kZXYuanMiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gd2VicGFja1VuaXZlcnNhbE1vZHVsZURlZmluaXRpb24ocm9vdCwgZmFjdG9yeSkge1xuXHRpZih0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIG1vZHVsZSA9PT0gJ29iamVjdCcpXG5cdFx0bW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KCk7XG5cdGVsc2UgaWYodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKVxuXHRcdGRlZmluZShbXSwgZmFjdG9yeSk7XG5cdGVsc2UgaWYodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKVxuXHRcdGV4cG9ydHNbXCJGTVNfQ0FUX0VYUEVSSU1FTlRBTFwiXSA9IGZhY3RvcnkoKTtcblx0ZWxzZVxuXHRcdHJvb3RbXCJGTVNfQ0FUX0VYUEVSSU1FTlRBTFwiXSA9IGZhY3RvcnkoKTtcbn0pKHRoaXMsIGZ1bmN0aW9uKCkge1xucmV0dXJuICIsIiBcdC8vIFRoZSBtb2R1bGUgY2FjaGVcbiBcdHZhciBpbnN0YWxsZWRNb2R1bGVzID0ge307XG5cbiBcdC8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG4gXHRmdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cbiBcdFx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG4gXHRcdGlmKGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdKSB7XG4gXHRcdFx0cmV0dXJuIGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdLmV4cG9ydHM7XG4gXHRcdH1cbiBcdFx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcbiBcdFx0dmFyIG1vZHVsZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdID0ge1xuIFx0XHRcdGk6IG1vZHVsZUlkLFxuIFx0XHRcdGw6IGZhbHNlLFxuIFx0XHRcdGV4cG9ydHM6IHt9XG4gXHRcdH07XG5cbiBcdFx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG4gXHRcdG1vZHVsZXNbbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG4gXHRcdC8vIEZsYWcgdGhlIG1vZHVsZSBhcyBsb2FkZWRcbiBcdFx0bW9kdWxlLmwgPSB0cnVlO1xuXG4gXHRcdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG4gXHRcdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbiBcdH1cblxuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZXMgb2JqZWN0IChfX3dlYnBhY2tfbW9kdWxlc19fKVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tID0gbW9kdWxlcztcblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGUgY2FjaGVcbiBcdF9fd2VicGFja19yZXF1aXJlX18uYyA9IGluc3RhbGxlZE1vZHVsZXM7XG5cbiBcdC8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb24gZm9yIGhhcm1vbnkgZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kID0gZnVuY3Rpb24oZXhwb3J0cywgbmFtZSwgZ2V0dGVyKSB7XG4gXHRcdGlmKCFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywgbmFtZSkpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgbmFtZSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGdldHRlciB9KTtcbiBcdFx0fVxuIFx0fTtcblxuIFx0Ly8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5yID0gZnVuY3Rpb24oZXhwb3J0cykge1xuIFx0XHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcbiBcdFx0fVxuIFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xuIFx0fTtcblxuIFx0Ly8gY3JlYXRlIGEgZmFrZSBuYW1lc3BhY2Ugb2JqZWN0XG4gXHQvLyBtb2RlICYgMTogdmFsdWUgaXMgYSBtb2R1bGUgaWQsIHJlcXVpcmUgaXRcbiBcdC8vIG1vZGUgJiAyOiBtZXJnZSBhbGwgcHJvcGVydGllcyBvZiB2YWx1ZSBpbnRvIHRoZSBuc1xuIFx0Ly8gbW9kZSAmIDQ6IHJldHVybiB2YWx1ZSB3aGVuIGFscmVhZHkgbnMgb2JqZWN0XG4gXHQvLyBtb2RlICYgOHwxOiBiZWhhdmUgbGlrZSByZXF1aXJlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnQgPSBmdW5jdGlvbih2YWx1ZSwgbW9kZSkge1xuIFx0XHRpZihtb2RlICYgMSkgdmFsdWUgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKHZhbHVlKTtcbiBcdFx0aWYobW9kZSAmIDgpIHJldHVybiB2YWx1ZTtcbiBcdFx0aWYoKG1vZGUgJiA0KSAmJiB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmIHZhbHVlICYmIHZhbHVlLl9fZXNNb2R1bGUpIHJldHVybiB2YWx1ZTtcbiBcdFx0dmFyIG5zID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5yKG5zKTtcbiBcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KG5zLCAnZGVmYXVsdCcsIHsgZW51bWVyYWJsZTogdHJ1ZSwgdmFsdWU6IHZhbHVlIH0pO1xuIFx0XHRpZihtb2RlICYgMiAmJiB0eXBlb2YgdmFsdWUgIT0gJ3N0cmluZycpIGZvcih2YXIga2V5IGluIHZhbHVlKSBfX3dlYnBhY2tfcmVxdWlyZV9fLmQobnMsIGtleSwgZnVuY3Rpb24oa2V5KSB7IHJldHVybiB2YWx1ZVtrZXldOyB9LmJpbmQobnVsbCwga2V5KSk7XG4gXHRcdHJldHVybiBucztcbiBcdH07XG5cbiBcdC8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSBmdW5jdGlvbihtb2R1bGUpIHtcbiBcdFx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0RGVmYXVsdCgpIHsgcmV0dXJuIG1vZHVsZVsnZGVmYXVsdCddOyB9IDpcbiBcdFx0XHRmdW5jdGlvbiBnZXRNb2R1bGVFeHBvcnRzKCkgeyByZXR1cm4gbW9kdWxlOyB9O1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCAnYScsIGdldHRlcik7XG4gXHRcdHJldHVybiBnZXR0ZXI7XG4gXHR9O1xuXG4gXHQvLyBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGxcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubyA9IGZ1bmN0aW9uKG9iamVjdCwgcHJvcGVydHkpIHsgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIHByb3BlcnR5KTsgfTtcblxuIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbiBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiXCI7XG5cblxuIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXyhfX3dlYnBhY2tfcmVxdWlyZV9fLnMgPSBcIi4vc3JjL2luZGV4LnRzXCIpO1xuIiwiLyoqXG4gKiBDcml0aWNhbGx5IERhbXBlZCBTcHJpbmdcbiAqXG4gKiBTaG91dG91dHMgdG8gS2VpamlybyBUYWthaGFzaGlcbiAqL1xuZXhwb3J0IGNsYXNzIENEUyB7XG4gIHB1YmxpYyBmYWN0b3IgPSAxMDAuMDtcbiAgcHVibGljIHJhdGlvID0gMS4wO1xuICBwdWJsaWMgdmVsb2NpdHkgPSAwLjA7XG4gIHB1YmxpYyB2YWx1ZSA9IDAuMDtcbiAgcHVibGljIHRhcmdldCA9IDAuMDtcblxuICBwdWJsaWMgdXBkYXRlKCBkZWx0YVRpbWU6IG51bWJlciApOiBudW1iZXIge1xuICAgIHRoaXMudmVsb2NpdHkgKz0gKFxuICAgICAgLXRoaXMuZmFjdG9yICogKCB0aGlzLnZhbHVlIC0gdGhpcy50YXJnZXQgKVxuICAgICAgLSAyLjAgKiB0aGlzLnZlbG9jaXR5ICogTWF0aC5zcXJ0KCB0aGlzLmZhY3RvciApICogdGhpcy5yYXRpb1xuICAgICkgKiBkZWx0YVRpbWU7XG4gICAgdGhpcy52YWx1ZSArPSB0aGlzLnZlbG9jaXR5ICogZGVsdGFUaW1lO1xuICAgIHJldHVybiB0aGlzLnZhbHVlO1xuICB9XG59XG4iLCJleHBvcnQgKiBmcm9tICcuL0NEUyc7XG4iLCIvKipcbiAqIENsYXNzIHRoYXQgZGVhbHMgd2l0aCB0aW1lLlxuICogSW4gdGhpcyBiYXNlIGNsYXNzLCB5b3UgbmVlZCB0byBzZXQgdGltZSBtYW51YWxseSBmcm9tIGBBdXRvbWF0b24udXBkYXRlKClgLlxuICogQmVzdCBmb3Igc3luYyB3aXRoIGV4dGVybmFsIGNsb2NrIHN0dWZmLlxuICovXG5leHBvcnQgY2xhc3MgQ2xvY2sge1xuICAvKipcbiAgICogSXRzIGN1cnJlbnQgdGltZS5cbiAgICovXG4gIHByb3RlY3RlZCBfX3RpbWUgPSAwLjA7XG5cbiAgLyoqXG4gICAqIEl0cyBkZWx0YVRpbWUgb2YgbGFzdCB1cGRhdGUuXG4gICAqL1xuICBwcm90ZWN0ZWQgX19kZWx0YVRpbWUgPSAwLjA7XG5cbiAgLyoqXG4gICAqIFdoZXRoZXIgaXRzIGN1cnJlbnRseSBwbGF5aW5nIG9yIG5vdC5cbiAgICovXG4gIHByb3RlY3RlZCBfX2lzUGxheWluZyA9IGZhbHNlO1xuXG4gIC8qKlxuICAgKiBJdHMgY3VycmVudCB0aW1lLlxuICAgKi9cbiAgcHVibGljIGdldCB0aW1lKCk6IG51bWJlciB7IHJldHVybiB0aGlzLl9fdGltZTsgfVxuXG4gIC8qKlxuICAgKiBJdHMgZGVsdGFUaW1lIG9mIGxhc3QgdXBkYXRlLlxuICAgKi9cbiAgcHVibGljIGdldCBkZWx0YVRpbWUoKTogbnVtYmVyIHsgcmV0dXJuIHRoaXMuX19kZWx0YVRpbWU7IH1cblxuICAvKipcbiAgICogV2hldGhlciBpdHMgY3VycmVudGx5IHBsYXlpbmcgb3Igbm90LlxuICAgKi9cbiAgcHVibGljIGdldCBpc1BsYXlpbmcoKTogYm9vbGVhbiB7IHJldHVybiB0aGlzLl9faXNQbGF5aW5nOyB9XG5cbiAgLyoqXG4gICAqIFVwZGF0ZSB0aGUgY2xvY2suXG4gICAqIEBwYXJhbSB0aW1lIFRpbWUuIFlvdSBuZWVkIHRvIHNldCBtYW51YWxseSB3aGVuIHlvdSBhcmUgdXNpbmcgbWFudWFsIENsb2NrXG4gICAqL1xuICBwdWJsaWMgdXBkYXRlKCB0aW1lPzogbnVtYmVyICk6IHZvaWQge1xuICAgIGNvbnN0IHByZXZUaW1lID0gdGhpcy5fX3RpbWU7XG4gICAgdGhpcy5fX3RpbWUgPSB0aW1lIHx8IDAuMDtcbiAgICB0aGlzLl9fZGVsdGFUaW1lID0gdGhpcy5fX3RpbWUgLSBwcmV2VGltZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTdGFydCB0aGUgY2xvY2suXG4gICAqL1xuICBwdWJsaWMgcGxheSgpOiB2b2lkIHtcbiAgICB0aGlzLl9faXNQbGF5aW5nID0gdHJ1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTdG9wIHRoZSBjbG9jay5cbiAgICovXG4gIHB1YmxpYyBwYXVzZSgpOiB2b2lkIHtcbiAgICB0aGlzLl9faXNQbGF5aW5nID0gZmFsc2U7XG4gIH1cblxuICAvKipcbiAgICogU2V0IHRoZSB0aW1lIG1hbnVhbGx5LlxuICAgKiBAcGFyYW0gdGltZSBUaW1lXG4gICAqL1xuICBwdWJsaWMgc2V0VGltZSggdGltZTogbnVtYmVyICk6IHZvaWQge1xuICAgIHRoaXMuX190aW1lID0gdGltZTtcbiAgfVxufVxuIiwiaW1wb3J0IHsgQ2xvY2sgfSBmcm9tICcuL0Nsb2NrJztcblxuLyoqXG4gKiBDbGFzcyB0aGF0IGRlYWxzIHdpdGggdGltZS5cbiAqIFRoaXMgaXMgXCJmcmFtZVwiIHR5cGUgY2xvY2ssIHRoZSBmcmFtZSBpbmNyZWFzZXMgZXZlcnkge0BsaW5rIENsb2NrRnJhbWUjdXBkYXRlfSBjYWxsLlxuICogQHBhcmFtIGZwcyBGcmFtZXMgcGVyIHNlY29uZFxuICovXG5leHBvcnQgY2xhc3MgQ2xvY2tGcmFtZSBleHRlbmRzIENsb2NrIHtcbiAgLyoqXG4gICAqIEl0cyBjdXJyZW50IGZyYW1lLlxuICAgKi9cbiAgcHJpdmF0ZSBfX2ZyYW1lID0gMDtcblxuICAvKipcbiAgICogSXRzIGZwcy5cbiAgICovXG4gIHByaXZhdGUgX19mcHM6IG51bWJlcjtcblxuICBwdWJsaWMgY29uc3RydWN0b3IoIGZwcyA9IDYwICkge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5fX2ZwcyA9IGZwcztcbiAgfVxuXG4gIC8qKlxuICAgKiBJdHMgY3VycmVudCBmcmFtZS5cbiAgICovXG4gIHB1YmxpYyBnZXQgZnJhbWUoKTogbnVtYmVyIHsgcmV0dXJuIHRoaXMuX19mcmFtZTsgfVxuXG4gIC8qKlxuICAgKiBJdHMgZnBzLlxuICAgKi9cbiAgcHVibGljIGdldCBmcHMoKTogbnVtYmVyIHsgcmV0dXJuIHRoaXMuX19mcHM7IH1cblxuICAvKipcbiAgICogVXBkYXRlIHRoZSBjbG9jay4gSXQgd2lsbCBpbmNyZWFzZSB0aGUgZnJhbWUgYnkgMS5cbiAgICovXG4gIHB1YmxpYyB1cGRhdGUoKTogdm9pZCB7XG4gICAgaWYgKCB0aGlzLl9faXNQbGF5aW5nICkge1xuICAgICAgdGhpcy5fX3RpbWUgPSB0aGlzLl9fZnJhbWUgLyB0aGlzLl9fZnBzO1xuICAgICAgdGhpcy5fX2RlbHRhVGltZSA9IDEuMCAvIHRoaXMuX19mcHM7XG4gICAgICB0aGlzLl9fZnJhbWUgKys7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX19kZWx0YVRpbWUgPSAwLjA7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFNldCB0aGUgdGltZSBtYW51YWxseS5cbiAgICogVGhlIHNldCB0aW1lIHdpbGwgYmUgY29udmVydGVkIGludG8gaW50ZXJuYWwgZnJhbWUgY291bnQsIHNvIHRoZSB0aW1lIHdpbGwgbm90IGJlIGV4YWN0bHkgc2FtZSBhcyBzZXQgb25lLlxuICAgKiBAcGFyYW0gdGltZSBUaW1lXG4gICAqL1xuICBwdWJsaWMgc2V0VGltZSggdGltZTogbnVtYmVyICk6IHZvaWQge1xuICAgIHRoaXMuX19mcmFtZSA9IE1hdGguZmxvb3IoIHRoaXMuX19mcHMgKiB0aW1lICk7XG4gICAgdGhpcy5fX3RpbWUgPSB0aGlzLl9fZnJhbWUgLyB0aGlzLl9fZnBzO1xuICB9XG59XG4iLCJpbXBvcnQgeyBDbG9jayB9IGZyb20gJy4vQ2xvY2snO1xuXG4vKipcbiAqIENsYXNzIHRoYXQgZGVhbHMgd2l0aCB0aW1lLlxuICogVGhpcyBpcyBcInJlYWx0aW1lXCIgdHlwZSBjbG9jaywgdGhlIHRpbWUgZ29lcyBvbiBhcyByZWFsIHdvcmxkLlxuICovXG5leHBvcnQgY2xhc3MgQ2xvY2tSZWFsdGltZSBleHRlbmRzIENsb2NrIHtcbiAgLyoqXG4gICAqIFwiWW91IHNldCB0aGUgdGltZSBtYW51YWxseSB0byBgX19ydFRpbWVgIHdoZW4gaXQncyBgX19ydERhdGVgLlwiXG4gICAqL1xuICBwcml2YXRlIF9fcnRUaW1lID0gMC4wO1xuXG4gIC8qKlxuICAgKiBcIllvdSBzZXQgdGhlIHRpbWUgbWFudWFsbHkgdG8gYF9fcnRUaW1lYCB3aGVuIGl0J3MgYF9fcnREYXRlYC5cIlxuICAgKi9cbiAgcHJpdmF0ZSBfX3J0RGF0ZTogbnVtYmVyID0gcGVyZm9ybWFuY2Uubm93KCk7XG5cbiAgLyoqXG4gICAqIFRoZSBjbG9jayBpcyByZWFsdGltZS4geWVhaC5cbiAgICovXG4gIHB1YmxpYyBnZXQgaXNSZWFsdGltZSgpOiBib29sZWFuIHsgcmV0dXJuIHRydWU7IH1cblxuICAvKipcbiAgICogVXBkYXRlIHRoZSBjbG9jay4gVGltZSBpcyBjYWxjdWxhdGVkIGJhc2VkIG9uIHRpbWUgaW4gcmVhbCB3b3JsZC5cbiAgICovXG4gIHB1YmxpYyB1cGRhdGUoKTogdm9pZCB7XG4gICAgY29uc3Qgbm93ID0gcGVyZm9ybWFuY2Uubm93KCk7XG5cbiAgICBpZiAoIHRoaXMuX19pc1BsYXlpbmcgKSB7XG4gICAgICBjb25zdCBwcmV2VGltZSA9IHRoaXMuX190aW1lO1xuICAgICAgY29uc3QgZGVsdGFEYXRlID0gKCBub3cgLSB0aGlzLl9fcnREYXRlICk7XG4gICAgICB0aGlzLl9fdGltZSA9IHRoaXMuX19ydFRpbWUgKyBkZWx0YURhdGUgLyAxMDAwLjA7XG4gICAgICB0aGlzLl9fZGVsdGFUaW1lID0gdGhpcy50aW1lIC0gcHJldlRpbWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX19ydFRpbWUgPSB0aGlzLnRpbWU7XG4gICAgICB0aGlzLl9fcnREYXRlID0gbm93O1xuICAgICAgdGhpcy5fX2RlbHRhVGltZSA9IDAuMDtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogU2V0IHRoZSB0aW1lIG1hbnVhbGx5LlxuICAgKiBAcGFyYW0gdGltZSBUaW1lXG4gICAqL1xuICBwdWJsaWMgc2V0VGltZSggdGltZTogbnVtYmVyICk6IHZvaWQge1xuICAgIHRoaXMuX190aW1lID0gdGltZTtcbiAgICB0aGlzLl9fcnRUaW1lID0gdGhpcy50aW1lO1xuICAgIHRoaXMuX19ydERhdGUgPSBwZXJmb3JtYW5jZS5ub3coKTtcbiAgfVxufVxuIiwiZXhwb3J0ICogZnJvbSAnLi9DbG9jayc7XG5leHBvcnQgKiBmcm9tICcuL0Nsb2NrRnJhbWUnO1xuZXhwb3J0ICogZnJvbSAnLi9DbG9ja1JlYWx0aW1lJztcbiIsImltcG9ydCB7IGxlcnAgfSBmcm9tICcuLic7XG5cbi8qKlxuICogRG8gZXhwIHNtb290aGluZ1xuICovXG5leHBvcnQgY2xhc3MgRXhwU21vb3RoIHtcbiAgcHVibGljIGZhY3RvciA9IDEwLjA7XG4gIHB1YmxpYyB0YXJnZXQgPSAwLjA7XG4gIHB1YmxpYyB2YWx1ZSA9IDAuMDtcblxuICBwdWJsaWMgdXBkYXRlKCBkZWx0YVRpbWU6IG51bWJlciApOiBudW1iZXIge1xuICAgIHRoaXMudmFsdWUgPSBsZXJwKCB0aGlzLnRhcmdldCwgdGhpcy52YWx1ZSwgTWF0aC5leHAoIC10aGlzLmZhY3RvciAqIGRlbHRhVGltZSApICk7XG4gICAgcmV0dXJuIHRoaXMudmFsdWU7XG4gIH1cbn1cbiIsImV4cG9ydCAqIGZyb20gJy4vRXhwU21vb3RoJztcbiIsIi8qKlxuICogTW9zdCBhd2Vzb21lIGNhdCBldmVyXG4gKi9cbmV4cG9ydCBjbGFzcyBGTVNfQ2F0IHsgLy8gZXNsaW50LWRpc2FibGUtbGluZVxuICAvKipcbiAgICogRk1TX0NhdC5naWZcbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgZ2lmID0gJ2h0dHBzOi8vZm1zLWNhdC5jb20vaW1hZ2VzL2Ztc19jYXQuZ2lmJztcblxuICAvKipcbiAgICogRk1TX0NhdC5wbmdcbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgcG5nID0gJ2h0dHBzOi8vZm1zLWNhdC5jb20vaW1hZ2VzL2Ztc19jYXQucG5nJztcbn1cbiIsImV4cG9ydCAqIGZyb20gJy4vRk1TX0NhdCc7XG4iLCIvKipcbiAqIEl0ZXJhYmxlIEZpenpCdXp6XG4gKi9cbmV4cG9ydCBjbGFzcyBGaXp6QnV6eiBpbXBsZW1lbnRzIEl0ZXJhYmxlPG51bWJlciB8IHN0cmluZz4ge1xuICBwdWJsaWMgc3RhdGljIFdvcmRzRGVmYXVsdDogTWFwPG51bWJlciwgc3RyaW5nPiA9IG5ldyBNYXAoIFtcbiAgICBbIDMsICdGaXp6JyBdLFxuICAgIFsgNSwgJ0J1enonIF1cbiAgXSApO1xuXG4gIHByaXZhdGUgX193b3JkczogTWFwPG51bWJlciwgc3RyaW5nPjtcbiAgcHJpdmF0ZSBfX2luZGV4OiBudW1iZXI7XG4gIHByaXZhdGUgX19lbmQ6IG51bWJlcjtcblxuICBwdWJsaWMgY29uc3RydWN0b3IoIHdvcmRzOiBNYXA8bnVtYmVyLCBzdHJpbmc+ID0gRml6ekJ1enouV29yZHNEZWZhdWx0LCBpbmRleCA9IDEsIGVuZCA9IDEwMCApIHtcbiAgICB0aGlzLl9fd29yZHMgPSB3b3JkcztcbiAgICB0aGlzLl9faW5kZXggPSBpbmRleDtcbiAgICB0aGlzLl9fZW5kID0gZW5kO1xuICB9XG5cbiAgcHVibGljIFsgU3ltYm9sLml0ZXJhdG9yIF0oKTogSXRlcmF0b3I8c3RyaW5nIHwgbnVtYmVyLCBhbnksIHVuZGVmaW5lZD4ge1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgcHVibGljIG5leHQoKTogSXRlcmF0b3JSZXN1bHQ8bnVtYmVyIHwgc3RyaW5nPiB7XG4gICAgaWYgKCB0aGlzLl9fZW5kIDwgdGhpcy5fX2luZGV4ICkge1xuICAgICAgcmV0dXJuIHsgZG9uZTogdHJ1ZSwgdmFsdWU6IG51bGwgfTtcbiAgICB9XG5cbiAgICBsZXQgdmFsdWU6IG51bWJlciB8IHN0cmluZyA9ICcnO1xuICAgIGZvciAoIGNvbnN0IFsgcmVtLCB3b3JkIF0gb2YgdGhpcy5fX3dvcmRzICkge1xuICAgICAgaWYgKCAoIHRoaXMuX19pbmRleCAlIHJlbSApID09PSAwICkge1xuICAgICAgICB2YWx1ZSArPSB3b3JkO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmICggdmFsdWUgPT09ICcnICkge1xuICAgICAgdmFsdWUgPSB0aGlzLl9faW5kZXg7XG4gICAgfVxuXG4gICAgdGhpcy5fX2luZGV4ICsrO1xuXG4gICAgcmV0dXJuIHsgZG9uZTogZmFsc2UsIHZhbHVlIH07XG4gIH1cbn1cbiIsImV4cG9ydCAqIGZyb20gJy4vRml6ekJ1enonO1xuIiwiLyoqXG4gKiBVc2VmdWwgZm9yIGZwcyBjYWxjXG4gKi9cbmV4cG9ydCBjbGFzcyBIaXN0b3J5TWVhbkNhbGN1bGF0b3Ige1xuICBwcml2YXRlIF9fcmVjYWxjRm9yRWFjaCA9IDA7XG4gIHByaXZhdGUgX19jb3VudFVudGlsUmVjYWxjID0gMDtcbiAgcHJpdmF0ZSBfX2hpc3Rvcnk6IG51bWJlcltdID0gW107XG4gIHByaXZhdGUgX19pbmRleCA9IDA7XG4gIHByaXZhdGUgX19sZW5ndGg6IG51bWJlcjtcbiAgcHJpdmF0ZSBfX2NvdW50ID0gMDtcbiAgcHJpdmF0ZSBfX2NhY2hlID0gMDtcblxuICBwdWJsaWMgY29uc3RydWN0b3IoIGxlbmd0aDogbnVtYmVyICkge1xuICAgIHRoaXMuX19sZW5ndGggPSBsZW5ndGg7XG4gICAgdGhpcy5fX3JlY2FsY0ZvckVhY2ggPSBsZW5ndGg7XG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgbGVuZ3RoOyBpICsrICkge1xuICAgICAgdGhpcy5fX2hpc3RvcnlbIGkgXSA9IDA7XG4gICAgfVxuICB9XG5cbiAgcHVibGljIGdldCBtZWFuKCk6IG51bWJlciB7XG4gICAgY29uc3QgY291bnQgPSBNYXRoLm1pbiggdGhpcy5fX2NvdW50LCB0aGlzLl9fbGVuZ3RoICk7XG4gICAgcmV0dXJuIGNvdW50ID09PSAwID8gMC4wIDogdGhpcy5fX2NhY2hlIC8gY291bnQ7XG4gIH1cblxuICBwdWJsaWMgZ2V0IHJlY2FsY0ZvckVhY2goKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5fX3JlY2FsY0ZvckVhY2g7XG4gIH1cblxuICBwdWJsaWMgc2V0IHJlY2FsY0ZvckVhY2goIHZhbHVlOiBudW1iZXIgKSB7XG4gICAgY29uc3QgZGVsdGEgPSB2YWx1ZSAtIHRoaXMuX19yZWNhbGNGb3JFYWNoO1xuICAgIHRoaXMuX19yZWNhbGNGb3JFYWNoID0gdmFsdWU7XG4gICAgdGhpcy5fX2NvdW50VW50aWxSZWNhbGMgPSBNYXRoLm1heCggMCwgdGhpcy5fX2NvdW50VW50aWxSZWNhbGMgKyBkZWx0YSApO1xuICB9XG5cbiAgcHVibGljIHJlc2V0KCk6IHZvaWQge1xuICAgIHRoaXMuX19pbmRleCA9IDA7XG4gICAgdGhpcy5fX2NvdW50ID0gMDtcbiAgICB0aGlzLl9fY2FjaGUgPSAwO1xuICAgIHRoaXMuX19jb3VudFVudGlsUmVjYWxjID0gMDtcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB0aGlzLl9fbGVuZ3RoOyBpICsrICkge1xuICAgICAgdGhpcy5fX2hpc3RvcnlbIGkgXSA9IDA7XG4gICAgfVxuICB9XG5cbiAgcHVibGljIHB1c2goIHZhbHVlOiBudW1iZXIgKTogdm9pZCB7XG4gICAgY29uc3QgcHJldiA9IHRoaXMuX19oaXN0b3J5WyB0aGlzLl9faW5kZXggXTtcbiAgICB0aGlzLl9faGlzdG9yeVsgdGhpcy5fX2luZGV4IF0gPSB2YWx1ZTtcbiAgICB0aGlzLl9fY291bnQgKys7XG4gICAgdGhpcy5fX2luZGV4ID0gKCB0aGlzLl9faW5kZXggKyAxICkgJSB0aGlzLl9fbGVuZ3RoO1xuXG4gICAgaWYgKCB0aGlzLl9fY291bnRVbnRpbFJlY2FsYyA9PT0gMCApIHtcbiAgICAgIHRoaXMucmVjYWxjKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX19jb3VudFVudGlsUmVjYWxjIC0tO1xuICAgICAgdGhpcy5fX2NhY2hlIC09IHByZXY7XG4gICAgICB0aGlzLl9fY2FjaGUgKz0gdmFsdWU7XG4gICAgfVxuICB9XG5cbiAgcHVibGljIHJlY2FsYygpOiB2b2lkIHtcbiAgICB0aGlzLl9fY291bnRVbnRpbFJlY2FsYyA9IHRoaXMuX19yZWNhbGNGb3JFYWNoO1xuICAgIGNvbnN0IHN1bSA9IHRoaXMuX19oaXN0b3J5XG4gICAgICAuc2xpY2UoIDAsIE1hdGgubWluKCB0aGlzLl9fY291bnQsIHRoaXMuX19sZW5ndGggKSApXG4gICAgICAucmVkdWNlKCAoIHN1bSwgdiApID0+IHN1bSArIHYsIDAgKTtcbiAgICB0aGlzLl9fY2FjaGUgPSBzdW07XG4gIH1cbn1cbiIsImltcG9ydCB7IGJpbmFyeVNlYXJjaCB9IGZyb20gJy4uL2FsZ29yaXRobS9iaW5hcnlTZWFyY2gnO1xuXG4vKipcbiAqIFVzZWZ1bCBmb3IgdGFwIHRlbXBvXG4gKiBTZWUgYWxzbzoge0BsaW5rIEhpc3RvcnlNZWFuQ2FsY3VsYXRvcn1cbiAqL1xuZXhwb3J0IGNsYXNzIEhpc3RvcnlNZWRpYW5DYWxjdWxhdG9yIHtcbiAgcHJpdmF0ZSBfX2hpc3Rvcnk6IG51bWJlcltdID0gW107XG4gIHByaXZhdGUgX19zb3J0ZWQ6IG51bWJlcltdID0gW107XG4gIHByaXZhdGUgX19pbmRleCA9IDA7XG4gIHByaXZhdGUgcmVhZG9ubHkgX19sZW5ndGg6IG51bWJlcjtcblxuICBwdWJsaWMgY29uc3RydWN0b3IoIGxlbmd0aDogbnVtYmVyICkge1xuICAgIHRoaXMuX19sZW5ndGggPSBsZW5ndGg7XG4gIH1cblxuICBwdWJsaWMgZ2V0IG1lZGlhbigpOiBudW1iZXIge1xuICAgIGNvbnN0IGNvdW50ID0gTWF0aC5taW4oIHRoaXMuX19zb3J0ZWQubGVuZ3RoLCB0aGlzLl9fbGVuZ3RoICk7XG4gICAgcmV0dXJuIHRoaXMuX19zb3J0ZWRbIE1hdGguZmxvb3IoICggY291bnQgLSAxICkgLyAyICkgXTtcbiAgfVxuXG4gIHB1YmxpYyByZXNldCgpOiB2b2lkIHtcbiAgICB0aGlzLl9faW5kZXggPSAwO1xuICAgIHRoaXMuX19oaXN0b3J5ID0gW107XG4gICAgdGhpcy5fX3NvcnRlZCA9IFtdO1xuICB9XG5cbiAgcHVibGljIHB1c2goIHZhbHVlOiBudW1iZXIgKTogdm9pZCB7XG4gICAgY29uc3QgcHJldiA9IHRoaXMuX19oaXN0b3J5WyB0aGlzLl9faW5kZXggXTtcbiAgICB0aGlzLl9faGlzdG9yeVsgdGhpcy5fX2luZGV4IF0gPSB2YWx1ZTtcbiAgICB0aGlzLl9faW5kZXggPSAoIHRoaXMuX19pbmRleCArIDEgKSAlIHRoaXMuX19sZW5ndGg7XG5cbiAgICAvLyByZW1vdmUgdGhlIHByZXYgZnJvbSBzb3J0ZWQgYXJyYXlcbiAgICBpZiAoIHRoaXMuX19zb3J0ZWQubGVuZ3RoID09PSB0aGlzLl9fbGVuZ3RoICkge1xuICAgICAgY29uc3QgcHJldkluZGV4ID0gYmluYXJ5U2VhcmNoKCBwcmV2LCB0aGlzLl9fc29ydGVkICk7XG4gICAgICB0aGlzLl9fc29ydGVkLnNwbGljZSggcHJldkluZGV4LCAxICk7XG4gICAgfVxuXG4gICAgY29uc3QgaW5kZXggPSBiaW5hcnlTZWFyY2goIHZhbHVlLCB0aGlzLl9fc29ydGVkICk7XG4gICAgdGhpcy5fX3NvcnRlZC5zcGxpY2UoIGluZGV4LCAwLCB2YWx1ZSApO1xuICB9XG59XG4iLCJleHBvcnQgKiBmcm9tICcuL0hpc3RvcnlNZWFuQ2FsY3VsYXRvcic7XG5leHBvcnQgKiBmcm9tICcuL0hpc3RvcnlNZWRpYW5DYWxjdWxhdG9yJztcbiIsIi8qKlxuICogVXNlZnVsIGZvciBzd2FwIGJ1ZmZlclxuICovXG5leHBvcnQgY2xhc3MgU3dhcDxUPiB7XG4gIHB1YmxpYyBpOiBUO1xuICBwdWJsaWMgbzogVDtcblxuICBwdWJsaWMgY29uc3RydWN0b3IoIGE6IFQsIGI6IFQgKSB7XG4gICAgdGhpcy5pID0gYTtcbiAgICB0aGlzLm8gPSBiO1xuICB9XG5cbiAgcHVibGljIHN3YXAoKTogdm9pZCB7XG4gICAgY29uc3QgaSA9IHRoaXMuaTtcbiAgICB0aGlzLmkgPSB0aGlzLm87XG4gICAgdGhpcy5vID0gaTtcbiAgfVxufVxuIiwiZXhwb3J0ICogZnJvbSAnLi9Td2FwJztcbiIsImltcG9ydCB7IEhpc3RvcnlNZWRpYW5DYWxjdWxhdG9yIH0gZnJvbSAnLi4vSGlzdG9yeU1lYW5DYWxjdWxhdG9yL0hpc3RvcnlNZWRpYW5DYWxjdWxhdG9yJztcblxuZXhwb3J0IGNsYXNzIFRhcFRlbXBvIHtcbiAgcHJpdmF0ZSBfX2JwbSA9IDAuMDtcbiAgcHJpdmF0ZSBfX2xhc3RUYXAgPSAwLjA7XG4gIHByaXZhdGUgX19sYXN0QmVhdCA9IDAuMDtcbiAgcHJpdmF0ZSBfX2xhc3RUaW1lID0gMC4wO1xuICBwcml2YXRlIF9fY2FsYzogSGlzdG9yeU1lZGlhbkNhbGN1bGF0b3IgPSBuZXcgSGlzdG9yeU1lZGlhbkNhbGN1bGF0b3IoIDE2ICk7XG5cbiAgcHVibGljIGdldCBiZWF0RHVyYXRpb24oKTogbnVtYmVyIHtcbiAgICByZXR1cm4gNjAuMCAvIHRoaXMuX19icG07XG4gIH1cblxuICBwdWJsaWMgZ2V0IGJwbSgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLl9fYnBtO1xuICB9XG5cbiAgcHVibGljIHNldCBicG0oIGJwbTogbnVtYmVyICkge1xuICAgIHRoaXMuX19sYXN0QmVhdCA9IHRoaXMuYmVhdDtcbiAgICB0aGlzLl9fbGFzdFRpbWUgPSBwZXJmb3JtYW5jZS5ub3coKTtcbiAgICB0aGlzLl9fYnBtID0gYnBtO1xuICB9XG5cbiAgcHVibGljIGdldCBiZWF0KCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuX19sYXN0QmVhdCArICggcGVyZm9ybWFuY2Uubm93KCkgLSB0aGlzLl9fbGFzdFRpbWUgKSAqIDAuMDAxIC8gdGhpcy5iZWF0RHVyYXRpb247XG4gIH1cblxuICBwdWJsaWMgcmVzZXQoKTogdm9pZCB7XG4gICAgdGhpcy5fX2NhbGMucmVzZXQoKTtcbiAgfVxuXG4gIHB1YmxpYyBudWRnZSggYW1vdW50OiBudW1iZXIgKTogdm9pZCB7XG4gICAgdGhpcy5fX2xhc3RCZWF0ID0gdGhpcy5iZWF0ICsgYW1vdW50O1xuICAgIHRoaXMuX19sYXN0VGltZSA9IHBlcmZvcm1hbmNlLm5vdygpO1xuICB9XG5cbiAgcHVibGljIHRhcCgpOiB2b2lkIHtcbiAgICBjb25zdCBub3cgPSBwZXJmb3JtYW5jZS5ub3coKTtcbiAgICBjb25zdCBkZWx0YSA9ICggbm93IC0gdGhpcy5fX2xhc3RUYXAgKSAqIDAuMDAxO1xuXG4gICAgaWYgKCAyLjAgPCBkZWx0YSApIHtcbiAgICAgIHRoaXMucmVzZXQoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fX2NhbGMucHVzaCggZGVsdGEgKTtcbiAgICAgIHRoaXMuX19icG0gPSA2MC4wIC8gKCB0aGlzLl9fY2FsYy5tZWRpYW4gKTtcbiAgICB9XG5cbiAgICB0aGlzLl9fbGFzdFRhcCA9IG5vdztcbiAgICB0aGlzLl9fbGFzdFRpbWUgPSBub3c7XG4gICAgdGhpcy5fX2xhc3RCZWF0ID0gMC4wO1xuICB9XG59XG4iLCJleHBvcnQgKiBmcm9tICcuL1RhcFRlbXBvJztcbiIsImV4cG9ydCBjbGFzcyBYb3JzaGlmdCB7XG4gIHB1YmxpYyBzZWVkOiBudW1iZXI7XG5cbiAgcHVibGljIGNvbnN0cnVjdG9yKCBzZWVkPzogbnVtYmVyICkge1xuICAgIHRoaXMuc2VlZCA9IHNlZWQgfHwgMTtcbiAgfVxuXG4gIHB1YmxpYyBnZW4oIHNlZWQ/OiBudW1iZXIgKTogbnVtYmVyIHtcbiAgICBpZiAoIHNlZWQgKSB7XG4gICAgICB0aGlzLnNlZWQgPSBzZWVkO1xuICAgIH1cblxuICAgIHRoaXMuc2VlZCA9IHRoaXMuc2VlZCBeICggdGhpcy5zZWVkIDw8IDEzICk7XG4gICAgdGhpcy5zZWVkID0gdGhpcy5zZWVkIF4gKCB0aGlzLnNlZWQgPj4+IDE3ICk7XG4gICAgdGhpcy5zZWVkID0gdGhpcy5zZWVkIF4gKCB0aGlzLnNlZWQgPDwgNSApO1xuICAgIHJldHVybiB0aGlzLnNlZWQgLyBNYXRoLnBvdyggMiwgMzIgKSArIDAuNTtcbiAgfVxuXG4gIHB1YmxpYyBzZXQoIHNlZWQ/OiBudW1iZXIgKTogdm9pZCB7XG4gICAgdGhpcy5zZWVkID0gc2VlZCB8fCB0aGlzLnNlZWQgfHwgMTtcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBYb3JzaGlmdDtcbiIsImV4cG9ydCAqIGZyb20gJy4vWG9yc2hpZnQnO1xuIiwiLy8geW9pbmtlZCBmcm9tIGh0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzEzNDQ1MDAvZWZmaWNpZW50LXdheS10by1pbnNlcnQtYS1udW1iZXItaW50by1hLXNvcnRlZC1hcnJheS1vZi1udW1iZXJzXG5cbmV4cG9ydCBmdW5jdGlvbiBiaW5hcnlTZWFyY2goXG4gIGVsZW1lbnQ6IG51bWJlcixcbiAgYXJyYXk6IEFycmF5TGlrZTxudW1iZXI+XG4pOiBudW1iZXIge1xuICBsZXQgc3RhcnQgPSAwO1xuICBsZXQgZW5kID0gYXJyYXkubGVuZ3RoO1xuXG4gIHdoaWxlICggc3RhcnQgPCBlbmQgKSB7XG4gICAgY29uc3QgY2VudGVyID0gKCBzdGFydCArIGVuZCApID4+IDE7XG4gICAgaWYgKCBhcnJheVsgY2VudGVyIF0gPCBlbGVtZW50ICkge1xuICAgICAgc3RhcnQgPSBjZW50ZXIgKyAxO1xuICAgIH0gZWxzZSB7XG4gICAgICBlbmQgPSBjZW50ZXI7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHN0YXJ0O1xufVxuIiwiZXhwb3J0ICogZnJvbSAnLi9iaW5hcnlTZWFyY2gnO1xuIiwiLyoqXG4gKiBgWyAtMSwgLTEsIDEsIC0xLCAtMSwgMSwgMSwgMSBdYFxuICovXG5leHBvcnQgY29uc3QgVFJJQU5HTEVfU1RSSVBfUVVBRCA9IFsgLTEsIC0xLCAxLCAtMSwgLTEsIDEsIDEsIDEgXTtcblxuLyoqXG4gKiBgWyAtMSwgLTEsIDAsIDEsIC0xLCAwLCAtMSwgMSwgMCwgMSwgMSwgMCBdYFxuICovXG5leHBvcnQgY29uc3QgVFJJQU5HTEVfU1RSSVBfUVVBRF8zRCA9IFsgLTEsIC0xLCAwLCAxLCAtMSwgMCwgLTEsIDEsIDAsIDEsIDEsIDAgXTtcblxuLyoqXG4gKiBgWyAwLCAwLCAxLCAwLCAwLCAxLCAwLCAwLCAxLCAwLCAwLCAxIF1gXG4gKi9cbmV4cG9ydCBjb25zdCBUUklBTkdMRV9TVFJJUF9RVUFEX05PUk1BTCA9IFsgMCwgMCwgMSwgMCwgMCwgMSwgMCwgMCwgMSwgMCwgMCwgMSBdO1xuXG4vKipcbiAqIGBbIDAsIDAsIDEsIDAsIDAsIDEsIDEsIDEgXWBcbiAqL1xuZXhwb3J0IGNvbnN0IFRSSUFOR0xFX1NUUklQX1FVQURfVVYgPSBbIDAsIDAsIDEsIDAsIDAsIDEsIDEsIDEgXTtcbiIsImV4cG9ydCAqIGZyb20gJy4vY29uc3RhbnRzJztcbmV4cG9ydCAqIGZyb20gJy4vdXRpbHMnO1xuIiwiLyoqXG4gKiBTaHVmZmxlIGdpdmVuIGBhcnJheWAgdXNpbmcgZ2l2ZW4gYGRpY2VgIFJORy4gKipEZXN0cnVjdGl2ZSoqLlxuICovXG5leHBvcnQgZnVuY3Rpb24gc2h1ZmZsZUFycmF5PFQ+KCBhcnJheTogVFtdLCBkaWNlPzogKCkgPT4gbnVtYmVyICk6IFRbXSB7XG4gIGNvbnN0IGYgPSBkaWNlID8gZGljZSA6ICgpID0+IE1hdGgucmFuZG9tKCk7XG4gIGZvciAoIGxldCBpID0gMDsgaSA8IGFycmF5Lmxlbmd0aCAtIDE7IGkgKysgKSB7XG4gICAgY29uc3QgaXIgPSBpICsgTWF0aC5mbG9vciggZigpICogKCBhcnJheS5sZW5ndGggLSBpICkgKTtcbiAgICBjb25zdCB0ZW1wID0gYXJyYXlbIGlyIF07XG4gICAgYXJyYXlbIGlyIF0gPSBhcnJheVsgaSBdO1xuICAgIGFycmF5WyBpIF0gPSB0ZW1wO1xuICB9XG4gIHJldHVybiBhcnJheTtcbn1cblxuLyoqXG4gKiBJIGxpa2Ugd2lyZWZyYW1lXG4gKlxuICogYHRyaUluZGV4VG9MaW5lSW5kZXgoIFsgMCwgMSwgMiwgNSwgNiwgNyBdIClgIC0+IGBbIDAsIDEsIDEsIDIsIDIsIDAsIDUsIDYsIDYsIDcsIDcsIDUgXWBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHRyaUluZGV4VG9MaW5lSW5kZXg8VD4oIGFycmF5OiBUW10gKTogVFtdIHtcbiAgY29uc3QgcmV0OiBUW10gPSBbXTtcbiAgZm9yICggbGV0IGkgPSAwOyBpIDwgYXJyYXkubGVuZ3RoIC8gMzsgaSArKyApIHtcbiAgICBjb25zdCBoZWFkID0gaSAqIDM7XG4gICAgcmV0LnB1c2goXG4gICAgICBhcnJheVsgaGVhZCAgICAgXSwgYXJyYXlbIGhlYWQgKyAxIF0sXG4gICAgICBhcnJheVsgaGVhZCArIDEgXSwgYXJyYXlbIGhlYWQgKyAyIF0sXG4gICAgICBhcnJheVsgaGVhZCArIDIgXSwgYXJyYXlbIGhlYWQgICAgIF1cbiAgICApO1xuICB9XG4gIHJldHVybiByZXQ7XG59XG5cbi8qKlxuICogYG1hdHJpeDJkKCAzLCAyIClgIC0+IGBbIDAsIDAsIDAsIDEsIDAsIDIsIDEsIDAsIDEsIDEsIDEsIDIgXWBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG1hdHJpeDJkKCB3OiBudW1iZXIsIGg6IG51bWJlciApOiBudW1iZXJbXSB7XG4gIGNvbnN0IGFycjogbnVtYmVyW10gPSBbXTtcbiAgZm9yICggbGV0IGl5ID0gMDsgaXkgPCBoOyBpeSArKyApIHtcbiAgICBmb3IgKCBsZXQgaXggPSAwOyBpeCA8IHc7IGl4ICsrICkge1xuICAgICAgYXJyLnB1c2goIGl4LCBpeSApO1xuICAgIH1cbiAgfVxuICByZXR1cm4gYXJyO1xufVxuIiwiZXhwb3J0ICogZnJvbSAnLi9hbGdvcml0aG0nO1xuZXhwb3J0ICogZnJvbSAnLi9hcnJheSc7XG5leHBvcnQgKiBmcm9tICcuL0NEUyc7XG5leHBvcnQgKiBmcm9tICcuL0Nsb2NrJztcbmV4cG9ydCAqIGZyb20gJy4vRXhwU21vb3RoJztcbmV4cG9ydCAqIGZyb20gJy4vRml6ekJ1enonO1xuZXhwb3J0ICogZnJvbSAnLi9GTVNfQ2F0JztcbmV4cG9ydCAqIGZyb20gJy4vSGlzdG9yeU1lYW5DYWxjdWxhdG9yJztcbmV4cG9ydCAqIGZyb20gJy4vbWF0aCc7XG5leHBvcnQgKiBmcm9tICcuL1N3YXAnO1xuZXhwb3J0ICogZnJvbSAnLi9UYXBUZW1wbyc7XG5leHBvcnQgKiBmcm9tICcuL1hvcnNoaWZ0JztcbiIsImltcG9ydCB7IFF1YXRlcm5pb24sIFZlY3RvcjMgfSBmcm9tICcuJztcblxuZXhwb3J0IHR5cGUgcmF3TWF0cml4NCA9IFtcbiAgbnVtYmVyLCBudW1iZXIsIG51bWJlciwgbnVtYmVyLFxuICBudW1iZXIsIG51bWJlciwgbnVtYmVyLCBudW1iZXIsXG4gIG51bWJlciwgbnVtYmVyLCBudW1iZXIsIG51bWJlcixcbiAgbnVtYmVyLCBudW1iZXIsIG51bWJlciwgbnVtYmVyXG5dO1xuXG5leHBvcnQgY29uc3QgcmF3SWRlbnRpdHlNYXRyaXg0OiByYXdNYXRyaXg0ID0gW1xuICAxLjAsIDAuMCwgMC4wLCAwLjAsXG4gIDAuMCwgMS4wLCAwLjAsIDAuMCxcbiAgMC4wLCAwLjAsIDEuMCwgMC4wLFxuICAwLjAsIDAuMCwgMC4wLCAxLjBcbl07XG5cbi8qKlxuICogQSBNYXRyaXg0LlxuICovXG5leHBvcnQgY2xhc3MgTWF0cml4NCB7XG4gIHB1YmxpYyBlbGVtZW50czogcmF3TWF0cml4NDtcblxuICBwdWJsaWMgY29uc3RydWN0b3IoIHY6IHJhd01hdHJpeDQgPSByYXdJZGVudGl0eU1hdHJpeDQgKSB7XG4gICAgdGhpcy5lbGVtZW50cyA9IHY7XG4gIH1cblxuICAvKipcbiAgICogSXRzZWxmIGJ1dCB0cmFuc3Bvc2VkLlxuICAgKi9cbiAgcHVibGljIGdldCB0cmFuc3Bvc2UoKTogTWF0cml4NCB7XG4gICAgY29uc3QgbSA9IHRoaXMuZWxlbWVudHM7XG5cbiAgICByZXR1cm4gbmV3IE1hdHJpeDQoIFtcbiAgICAgIG1bIDAgXSwgbVsgNCBdLCBtWyA4IF0sIG1bIDEyIF0sXG4gICAgICBtWyAxIF0sIG1bIDUgXSwgbVsgOSBdLCBtWyAxMyBdLFxuICAgICAgbVsgMiBdLCBtWyA2IF0sIG1bIDEwIF0sIG1bIDE0IF0sXG4gICAgICBtWyAzIF0sIG1bIDcgXSwgbVsgMTEgXSwgbVsgMTUgXVxuICAgIF0gKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJdHMgZGV0ZXJtaW5hbnQuXG4gICAqL1xuICBwdWJsaWMgZ2V0IGRldGVybWluYW50KCk6IG51bWJlciB7XG4gICAgY29uc3QgbSA9IHRoaXMuZWxlbWVudHM7XG4gICAgY29uc3RcbiAgICAgIGEwMCA9IG1bICAwIF0sIGEwMSA9IG1bICAxIF0sIGEwMiA9IG1bICAyIF0sIGEwMyA9IG1bICAzIF0sXG4gICAgICBhMTAgPSBtWyAgNCBdLCBhMTEgPSBtWyAgNSBdLCBhMTIgPSBtWyAgNiBdLCBhMTMgPSBtWyAgNyBdLFxuICAgICAgYTIwID0gbVsgIDggXSwgYTIxID0gbVsgIDkgXSwgYTIyID0gbVsgMTAgXSwgYTIzID0gbVsgMTEgXSxcbiAgICAgIGEzMCA9IG1bIDEyIF0sIGEzMSA9IG1bIDEzIF0sIGEzMiA9IG1bIDE0IF0sIGEzMyA9IG1bIDE1IF0sXG4gICAgICBiMDAgPSBhMDAgKiBhMTEgLSBhMDEgKiBhMTAsICBiMDEgPSBhMDAgKiBhMTIgLSBhMDIgKiBhMTAsXG4gICAgICBiMDIgPSBhMDAgKiBhMTMgLSBhMDMgKiBhMTAsICBiMDMgPSBhMDEgKiBhMTIgLSBhMDIgKiBhMTEsXG4gICAgICBiMDQgPSBhMDEgKiBhMTMgLSBhMDMgKiBhMTEsICBiMDUgPSBhMDIgKiBhMTMgLSBhMDMgKiBhMTIsXG4gICAgICBiMDYgPSBhMjAgKiBhMzEgLSBhMjEgKiBhMzAsICBiMDcgPSBhMjAgKiBhMzIgLSBhMjIgKiBhMzAsXG4gICAgICBiMDggPSBhMjAgKiBhMzMgLSBhMjMgKiBhMzAsICBiMDkgPSBhMjEgKiBhMzIgLSBhMjIgKiBhMzEsXG4gICAgICBiMTAgPSBhMjEgKiBhMzMgLSBhMjMgKiBhMzEsICBiMTEgPSBhMjIgKiBhMzMgLSBhMjMgKiBhMzI7XG5cbiAgICByZXR1cm4gYjAwICogYjExIC0gYjAxICogYjEwICsgYjAyICogYjA5ICsgYjAzICogYjA4IC0gYjA0ICogYjA3ICsgYjA1ICogYjA2O1xuICB9XG5cbiAgLyoqXG4gICAqIEl0c2VsZiBidXQgaW52ZXJ0ZWQuXG4gICAqL1xuICBwdWJsaWMgZ2V0IGludmVyc2UoKTogTWF0cml4NCB8IG51bGwge1xuICAgIGNvbnN0IG0gPSB0aGlzLmVsZW1lbnRzO1xuICAgIGNvbnN0XG4gICAgICBhMDAgPSBtWyAgMCBdLCBhMDEgPSBtWyAgMSBdLCBhMDIgPSBtWyAgMiBdLCBhMDMgPSBtWyAgMyBdLFxuICAgICAgYTEwID0gbVsgIDQgXSwgYTExID0gbVsgIDUgXSwgYTEyID0gbVsgIDYgXSwgYTEzID0gbVsgIDcgXSxcbiAgICAgIGEyMCA9IG1bICA4IF0sIGEyMSA9IG1bICA5IF0sIGEyMiA9IG1bIDEwIF0sIGEyMyA9IG1bIDExIF0sXG4gICAgICBhMzAgPSBtWyAxMiBdLCBhMzEgPSBtWyAxMyBdLCBhMzIgPSBtWyAxNCBdLCBhMzMgPSBtWyAxNSBdLFxuICAgICAgYjAwID0gYTAwICogYTExIC0gYTAxICogYTEwLCAgYjAxID0gYTAwICogYTEyIC0gYTAyICogYTEwLFxuICAgICAgYjAyID0gYTAwICogYTEzIC0gYTAzICogYTEwLCAgYjAzID0gYTAxICogYTEyIC0gYTAyICogYTExLFxuICAgICAgYjA0ID0gYTAxICogYTEzIC0gYTAzICogYTExLCAgYjA1ID0gYTAyICogYTEzIC0gYTAzICogYTEyLFxuICAgICAgYjA2ID0gYTIwICogYTMxIC0gYTIxICogYTMwLCAgYjA3ID0gYTIwICogYTMyIC0gYTIyICogYTMwLFxuICAgICAgYjA4ID0gYTIwICogYTMzIC0gYTIzICogYTMwLCAgYjA5ID0gYTIxICogYTMyIC0gYTIyICogYTMxLFxuICAgICAgYjEwID0gYTIxICogYTMzIC0gYTIzICogYTMxLCAgYjExID0gYTIyICogYTMzIC0gYTIzICogYTMyO1xuXG4gICAgY29uc3QgZGV0ID0gYjAwICogYjExIC0gYjAxICogYjEwICsgYjAyICogYjA5ICsgYjAzICogYjA4IC0gYjA0ICogYjA3ICsgYjA1ICogYjA2O1xuXG4gICAgaWYgKCBkZXQgPT09IDAuMCApIHsgcmV0dXJuIG51bGw7IH1cblxuICAgIGNvbnN0IGludkRldCA9IDEuMCAvIGRldDtcblxuICAgIHJldHVybiBuZXcgTWF0cml4NCggW1xuICAgICAgYTExICogYjExIC0gYTEyICogYjEwICsgYTEzICogYjA5LFxuICAgICAgYTAyICogYjEwIC0gYTAxICogYjExIC0gYTAzICogYjA5LFxuICAgICAgYTMxICogYjA1IC0gYTMyICogYjA0ICsgYTMzICogYjAzLFxuICAgICAgYTIyICogYjA0IC0gYTIxICogYjA1IC0gYTIzICogYjAzLFxuICAgICAgYTEyICogYjA4IC0gYTEwICogYjExIC0gYTEzICogYjA3LFxuICAgICAgYTAwICogYjExIC0gYTAyICogYjA4ICsgYTAzICogYjA3LFxuICAgICAgYTMyICogYjAyIC0gYTMwICogYjA1IC0gYTMzICogYjAxLFxuICAgICAgYTIwICogYjA1IC0gYTIyICogYjAyICsgYTIzICogYjAxLFxuICAgICAgYTEwICogYjEwIC0gYTExICogYjA4ICsgYTEzICogYjA2LFxuICAgICAgYTAxICogYjA4IC0gYTAwICogYjEwIC0gYTAzICogYjA2LFxuICAgICAgYTMwICogYjA0IC0gYTMxICogYjAyICsgYTMzICogYjAwLFxuICAgICAgYTIxICogYjAyIC0gYTIwICogYjA0IC0gYTIzICogYjAwLFxuICAgICAgYTExICogYjA3IC0gYTEwICogYjA5IC0gYTEyICogYjA2LFxuICAgICAgYTAwICogYjA5IC0gYTAxICogYjA3ICsgYTAyICogYjA2LFxuICAgICAgYTMxICogYjAxIC0gYTMwICogYjAzIC0gYTMyICogYjAwLFxuICAgICAgYTIwICogYjAzIC0gYTIxICogYjAxICsgYTIyICogYjAwXG4gICAgXS5tYXAoICggdiApID0+IHYgKiBpbnZEZXQgKSBhcyByYXdNYXRyaXg0ICk7XG4gIH1cblxuICBwdWJsaWMgdG9TdHJpbmcoKTogc3RyaW5nIHtcbiAgICBjb25zdCBtID0gdGhpcy5lbGVtZW50cy5tYXAoICggdiApID0+IHYudG9GaXhlZCggMyApICk7XG4gICAgcmV0dXJuIGBNYXRyaXg0KCAkeyBtWyAwIF0gfSwgJHsgbVsgNCBdIH0sICR7IG1bIDggXSB9LCAkeyBtWyAxMiBdIH07ICR7IG1bIDEgXSB9LCAkeyBtWyA1IF0gfSwgJHsgbVsgOSBdIH0sICR7IG1bIDEzIF0gfTsgJHsgbVsgMiBdIH0sICR7IG1bIDYgXSB9LCAkeyBtWyAxMCBdIH0sICR7IG1bIDE0IF0gfTsgJHsgbVsgMyBdIH0sICR7IG1bIDcgXSB9LCAkeyBtWyAxMSBdIH0sICR7IG1bIDE1IF0gfSApYDtcbiAgfVxuXG4gIC8qKlxuICAgKiBDbG9uZSB0aGlzLlxuICAgKi9cbiAgcHVibGljIGNsb25lKCk6IE1hdHJpeDQge1xuICAgIHJldHVybiBuZXcgTWF0cml4NCggdGhpcy5lbGVtZW50cy5jb25jYXQoKSBhcyByYXdNYXRyaXg0ICk7XG4gIH1cblxuICAvKipcbiAgICogTXVsdGlwbHkgdGhpcyBNYXRyaXg0IGJ5IG9uZSBvciBtb3JlIE1hdHJpeDRzLlxuICAgKi9cbiAgcHVibGljIG11bHRpcGx5KCAuLi5tYXRyaWNlczogTWF0cml4NFtdICk6IE1hdHJpeDQge1xuICAgIGlmICggbWF0cmljZXMubGVuZ3RoID09PSAwICkge1xuICAgICAgcmV0dXJuIHRoaXMuY2xvbmUoKTtcbiAgICB9XG5cbiAgICBjb25zdCBhcnIgPSBtYXRyaWNlcy5jb25jYXQoKTtcbiAgICBsZXQgYk1hdCA9IGFyci5zaGlmdCgpITtcbiAgICBpZiAoIDAgPCBhcnIubGVuZ3RoICkge1xuICAgICAgYk1hdCA9IGJNYXQubXVsdGlwbHkoIC4uLmFyciApO1xuICAgIH1cblxuICAgIGNvbnN0IGEgPSB0aGlzLmVsZW1lbnRzO1xuICAgIGNvbnN0IGIgPSBiTWF0LmVsZW1lbnRzO1xuXG4gICAgcmV0dXJuIG5ldyBNYXRyaXg0KCBbXG4gICAgICBhWyAwIF0gKiBiWyAwIF0gKyBhWyA0IF0gKiBiWyAxIF0gKyBhWyA4IF0gKiBiWyAyIF0gKyBhWyAxMiBdICogYlsgMyBdLFxuICAgICAgYVsgMSBdICogYlsgMCBdICsgYVsgNSBdICogYlsgMSBdICsgYVsgOSBdICogYlsgMiBdICsgYVsgMTMgXSAqIGJbIDMgXSxcbiAgICAgIGFbIDIgXSAqIGJbIDAgXSArIGFbIDYgXSAqIGJbIDEgXSArIGFbIDEwIF0gKiBiWyAyIF0gKyBhWyAxNCBdICogYlsgMyBdLFxuICAgICAgYVsgMyBdICogYlsgMCBdICsgYVsgNyBdICogYlsgMSBdICsgYVsgMTEgXSAqIGJbIDIgXSArIGFbIDE1IF0gKiBiWyAzIF0sXG5cbiAgICAgIGFbIDAgXSAqIGJbIDQgXSArIGFbIDQgXSAqIGJbIDUgXSArIGFbIDggXSAqIGJbIDYgXSArIGFbIDEyIF0gKiBiWyA3IF0sXG4gICAgICBhWyAxIF0gKiBiWyA0IF0gKyBhWyA1IF0gKiBiWyA1IF0gKyBhWyA5IF0gKiBiWyA2IF0gKyBhWyAxMyBdICogYlsgNyBdLFxuICAgICAgYVsgMiBdICogYlsgNCBdICsgYVsgNiBdICogYlsgNSBdICsgYVsgMTAgXSAqIGJbIDYgXSArIGFbIDE0IF0gKiBiWyA3IF0sXG4gICAgICBhWyAzIF0gKiBiWyA0IF0gKyBhWyA3IF0gKiBiWyA1IF0gKyBhWyAxMSBdICogYlsgNiBdICsgYVsgMTUgXSAqIGJbIDcgXSxcblxuICAgICAgYVsgMCBdICogYlsgOCBdICsgYVsgNCBdICogYlsgOSBdICsgYVsgOCBdICogYlsgMTAgXSArIGFbIDEyIF0gKiBiWyAxMSBdLFxuICAgICAgYVsgMSBdICogYlsgOCBdICsgYVsgNSBdICogYlsgOSBdICsgYVsgOSBdICogYlsgMTAgXSArIGFbIDEzIF0gKiBiWyAxMSBdLFxuICAgICAgYVsgMiBdICogYlsgOCBdICsgYVsgNiBdICogYlsgOSBdICsgYVsgMTAgXSAqIGJbIDEwIF0gKyBhWyAxNCBdICogYlsgMTEgXSxcbiAgICAgIGFbIDMgXSAqIGJbIDggXSArIGFbIDcgXSAqIGJbIDkgXSArIGFbIDExIF0gKiBiWyAxMCBdICsgYVsgMTUgXSAqIGJbIDExIF0sXG5cbiAgICAgIGFbIDAgXSAqIGJbIDEyIF0gKyBhWyA0IF0gKiBiWyAxMyBdICsgYVsgOCBdICogYlsgMTQgXSArIGFbIDEyIF0gKiBiWyAxNSBdLFxuICAgICAgYVsgMSBdICogYlsgMTIgXSArIGFbIDUgXSAqIGJbIDEzIF0gKyBhWyA5IF0gKiBiWyAxNCBdICsgYVsgMTMgXSAqIGJbIDE1IF0sXG4gICAgICBhWyAyIF0gKiBiWyAxMiBdICsgYVsgNiBdICogYlsgMTMgXSArIGFbIDEwIF0gKiBiWyAxNCBdICsgYVsgMTQgXSAqIGJbIDE1IF0sXG4gICAgICBhWyAzIF0gKiBiWyAxMiBdICsgYVsgNyBdICogYlsgMTMgXSArIGFbIDExIF0gKiBiWyAxNCBdICsgYVsgMTUgXSAqIGJbIDE1IF1cbiAgICBdICk7XG4gIH1cblxuICAvKipcbiAgICogTXVsdGlwbHkgdGhpcyBNYXRyaXg0IGJ5IGEgc2NhbGFyXG4gICAqL1xuICBwdWJsaWMgc2NhbGVTY2FsYXIoIHNjYWxhcjogbnVtYmVyICk6IE1hdHJpeDQge1xuICAgIHJldHVybiBuZXcgTWF0cml4NCggdGhpcy5lbGVtZW50cy5tYXAoICggdiApID0+IHYgKiBzY2FsYXIgKSBhcyByYXdNYXRyaXg0ICk7XG4gIH1cblxuICAvKipcbiAgICogQW4gaWRlbnRpdHkgTWF0cml4NC5cbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgZ2V0IGlkZW50aXR5KCk6IE1hdHJpeDQge1xuICAgIHJldHVybiBuZXcgTWF0cml4NCggcmF3SWRlbnRpdHlNYXRyaXg0ICk7XG4gIH1cblxuICBwdWJsaWMgc3RhdGljIG11bHRpcGx5KCAuLi5tYXRyaWNlczogTWF0cml4NFtdICk6IE1hdHJpeDQge1xuICAgIGlmICggbWF0cmljZXMubGVuZ3RoID09PSAwICkge1xuICAgICAgcmV0dXJuIE1hdHJpeDQuaWRlbnRpdHk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IGJNYXRzID0gbWF0cmljZXMuY29uY2F0KCk7XG4gICAgICBjb25zdCBhTWF0ID0gYk1hdHMuc2hpZnQoKSE7XG4gICAgICByZXR1cm4gYU1hdC5tdWx0aXBseSggLi4uYk1hdHMgKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogR2VuZXJhdGUgYSB0cmFuc2xhdGlvbiBtYXRyaXguXG4gICAqIEBwYXJhbSB2ZWN0b3IgVHJhbnNsYXRpb25cbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgdHJhbnNsYXRlKCB2ZWN0b3I6IFZlY3RvcjMgKTogTWF0cml4NCB7XG4gICAgcmV0dXJuIG5ldyBNYXRyaXg0KCBbXG4gICAgICAxLCAwLCAwLCAwLFxuICAgICAgMCwgMSwgMCwgMCxcbiAgICAgIDAsIDAsIDEsIDAsXG4gICAgICB2ZWN0b3IueCwgdmVjdG9yLnksIHZlY3Rvci56LCAxXG4gICAgXSApO1xuICB9XG5cbiAgLyoqXG4gICAqIEdlbmVyYXRlIGEgM2Qgc2NhbGluZyBtYXRyaXguXG4gICAqIEBwYXJhbSB2ZWN0b3IgU2NhbGVcbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgc2NhbGUoIHZlY3RvcjogVmVjdG9yMyApOiBNYXRyaXg0IHtcbiAgICByZXR1cm4gbmV3IE1hdHJpeDQoIFtcbiAgICAgIHZlY3Rvci54LCAwLCAwLCAwLFxuICAgICAgMCwgdmVjdG9yLnksIDAsIDAsXG4gICAgICAwLCAwLCB2ZWN0b3IueiwgMCxcbiAgICAgIDAsIDAsIDAsIDFcbiAgICBdICk7XG4gIH1cblxuICAvKipcbiAgICogR2VuZXJhdGUgYSAzZCBzY2FsaW5nIG1hdHJpeCBieSBhIHNjYWxhci5cbiAgICogQHBhcmFtIHZlY3RvciBTY2FsZVxuICAgKi9cbiAgcHVibGljIHN0YXRpYyBzY2FsZVNjYWxhciggc2NhbGFyOiBudW1iZXIgKTogTWF0cml4NCB7XG4gICAgcmV0dXJuIG5ldyBNYXRyaXg0KCBbXG4gICAgICBzY2FsYXIsIDAsIDAsIDAsXG4gICAgICAwLCBzY2FsYXIsIDAsIDAsXG4gICAgICAwLCAwLCBzY2FsYXIsIDAsXG4gICAgICAwLCAwLCAwLCAxXG4gICAgXSApO1xuICB9XG5cbiAgLyoqXG4gICAqIEdlbmVyYXRlIGEgM2Qgcm90YXRpb24gbWF0cml4LCByb3RhdGVzIGFyb3VuZCB4IGF4aXMuXG4gICAqIEBwYXJhbSB2ZWN0b3IgU2NhbGVcbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgcm90YXRlWCggdGhldGE6IG51bWJlciApOiBNYXRyaXg0IHtcbiAgICByZXR1cm4gbmV3IE1hdHJpeDQoIFtcbiAgICAgIDEsIDAsIDAsIDAsXG4gICAgICAwLCBNYXRoLmNvcyggdGhldGEgKSwgLU1hdGguc2luKCB0aGV0YSApLCAwLFxuICAgICAgMCwgTWF0aC5zaW4oIHRoZXRhICksIE1hdGguY29zKCB0aGV0YSApLCAwLFxuICAgICAgMCwgMCwgMCwgMVxuICAgIF0gKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZW5lcmF0ZSBhIDNkIHJvdGF0aW9uIG1hdHJpeCwgcm90YXRlcyBhcm91bmQgeSBheGlzLlxuICAgKiBAcGFyYW0gdmVjdG9yIFNjYWxlXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIHJvdGF0ZVkoIHRoZXRhOiBudW1iZXIgKTogTWF0cml4NCB7XG4gICAgcmV0dXJuIG5ldyBNYXRyaXg0KCBbXG4gICAgICBNYXRoLmNvcyggdGhldGEgKSwgMCwgTWF0aC5zaW4oIHRoZXRhICksIDAsXG4gICAgICAwLCAxLCAwLCAwLFxuICAgICAgLU1hdGguc2luKCB0aGV0YSApLCAwLCBNYXRoLmNvcyggdGhldGEgKSwgMCxcbiAgICAgIDAsIDAsIDAsIDFcbiAgICBdICk7XG4gIH1cblxuICAvKipcbiAgICogR2VuZXJhdGUgYSAzZCByb3RhdGlvbiBtYXRyaXgsIHJvdGF0ZXMgYXJvdW5kIHogYXhpcy5cbiAgICogQHBhcmFtIHZlY3RvciBTY2FsZVxuICAgKi9cbiAgcHVibGljIHN0YXRpYyByb3RhdGVaKCB0aGV0YTogbnVtYmVyICk6IE1hdHJpeDQge1xuICAgIHJldHVybiBuZXcgTWF0cml4NCggW1xuICAgICAgTWF0aC5jb3MoIHRoZXRhICksIC1NYXRoLnNpbiggdGhldGEgKSwgMCwgMCxcbiAgICAgIE1hdGguc2luKCB0aGV0YSApLCBNYXRoLmNvcyggdGhldGEgKSwgMCwgMCxcbiAgICAgIDAsIDAsIDEsIDAsXG4gICAgICAwLCAwLCAwLCAxXG4gICAgXSApO1xuICB9XG5cbiAgLyoqXG4gICAqIEdlbmVyYXRlIGEgXCJMb29rQXRcIiB2aWV3IG1hdHJpeC5cbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgbG9va0F0KFxuICAgIHBvc2l0aW9uOiBWZWN0b3IzLFxuICAgIHRhcmdldCA9IG5ldyBWZWN0b3IzKCBbIDAuMCwgMC4wLCAwLjAgXSApLFxuICAgIHVwID0gbmV3IFZlY3RvcjMoIFsgMC4wLCAxLjAsIDAuMCBdICksXG4gICAgcm9sbCA9IDAuMFxuICApOiBNYXRyaXg0IHtcbiAgICBjb25zdCBkaXIgPSBwb3NpdGlvbi5zdWIoIHRhcmdldCApLm5vcm1hbGl6ZWQ7XG4gICAgbGV0IHNpZCA9IHVwLmNyb3NzKCBkaXIgKS5ub3JtYWxpemVkO1xuICAgIGxldCB0b3AgPSBkaXIuY3Jvc3MoIHNpZCApO1xuICAgIHNpZCA9IHNpZC5zY2FsZSggTWF0aC5jb3MoIHJvbGwgKSApLmFkZCggdG9wLnNjYWxlKCBNYXRoLnNpbiggcm9sbCApICkgKTtcbiAgICB0b3AgPSBkaXIuY3Jvc3MoIHNpZCApO1xuXG4gICAgcmV0dXJuIG5ldyBNYXRyaXg0KCBbXG4gICAgICBzaWQueCwgc2lkLnksIHNpZC56LCAwLjAsXG4gICAgICB0b3AueCwgdG9wLnksIHRvcC56LCAwLjAsXG4gICAgICBkaXIueCwgZGlyLnksIGRpci56LCAwLjAsXG4gICAgICBwb3NpdGlvbi54LCBwb3NpdGlvbi55LCBwb3NpdGlvbi56LCAxLjBcbiAgICBdICk7XG4gIH1cblxuICAvKipcbiAgICogR2VuZXJhdGUgYSBcIlBlcnNwZWN0aXZlXCIgcHJvamVjdGlvbiBtYXRyaXguXG4gICAqIEl0IHdvbid0IGluY2x1ZGUgYXNwZWN0IVxuICAgKi9cbiAgcHVibGljIHN0YXRpYyBwZXJzcGVjdGl2ZSggZm92ID0gNDUuMCwgbmVhciA9IDAuMDEsIGZhciA9IDEwMC4wICk6IE1hdHJpeDQge1xuICAgIGNvbnN0IHAgPSAxLjAgLyBNYXRoLnRhbiggZm92ICogTWF0aC5QSSAvIDM2MC4wICk7XG4gICAgY29uc3QgZCA9ICggZmFyIC0gbmVhciApO1xuICAgIHJldHVybiBuZXcgTWF0cml4NCggW1xuICAgICAgcCwgMC4wLCAwLjAsIDAuMCxcbiAgICAgIDAuMCwgcCwgMC4wLCAwLjAsXG4gICAgICAwLjAsIDAuMCwgLSggZmFyICsgbmVhciApIC8gZCwgLTEuMCxcbiAgICAgIDAuMCwgMC4wLCAtMiAqIGZhciAqIG5lYXIgLyBkLCAwLjBcbiAgICBdICk7XG4gIH1cblxuICAvKipcbiAgICogRGVjb21wb3NlIHRoaXMgbWF0cml4IGludG8gYSBwb3NpdGlvbiwgYSBzY2FsZSwgYW5kIGEgcm90YXRpb24uXG4gICAqIFlvaW5rZWQgZnJvbSBUaHJlZS5qcy5cbiAgICovXG4gIHB1YmxpYyBkZWNvbXBvc2UoKTogeyBwb3NpdGlvbjogVmVjdG9yMzsgc2NhbGU6IFZlY3RvcjM7IHJvdGF0aW9uOiBRdWF0ZXJuaW9uIH0ge1xuICAgIGNvbnN0IG0gPSB0aGlzLmVsZW1lbnRzO1xuXG4gICAgbGV0IHN4ID0gbmV3IFZlY3RvcjMoIFsgbVsgMCBdLCBtWyAxIF0sIG1bIDIgXSBdICkubGVuZ3RoO1xuICAgIGNvbnN0IHN5ID0gbmV3IFZlY3RvcjMoIFsgbVsgNCBdLCBtWyA1IF0sIG1bIDYgXSBdICkubGVuZ3RoO1xuICAgIGNvbnN0IHN6ID0gbmV3IFZlY3RvcjMoIFsgbVsgOCBdLCBtWyA5IF0sIG1bIDEwIF0gXSApLmxlbmd0aDtcblxuICAgIC8vIGlmIGRldGVybWluZSBpcyBuZWdhdGl2ZSwgd2UgbmVlZCB0byBpbnZlcnQgb25lIHNjYWxlXG4gICAgY29uc3QgZGV0ID0gdGhpcy5kZXRlcm1pbmFudDtcbiAgICBpZiAoIGRldCA8IDAgKSB7IHN4ID0gLXN4OyB9XG5cbiAgICBjb25zdCBpbnZTeCA9IDEuMCAvIHN4O1xuICAgIGNvbnN0IGludlN5ID0gMS4wIC8gc3k7XG4gICAgY29uc3QgaW52U3ogPSAxLjAgLyBzejtcblxuICAgIGNvbnN0IHJvdGF0aW9uTWF0cml4ID0gdGhpcy5jbG9uZSgpO1xuXG4gICAgcm90YXRpb25NYXRyaXguZWxlbWVudHNbIDAgXSAqPSBpbnZTeDtcbiAgICByb3RhdGlvbk1hdHJpeC5lbGVtZW50c1sgMSBdICo9IGludlN4O1xuICAgIHJvdGF0aW9uTWF0cml4LmVsZW1lbnRzWyAyIF0gKj0gaW52U3g7XG5cbiAgICByb3RhdGlvbk1hdHJpeC5lbGVtZW50c1sgNCBdICo9IGludlN5O1xuICAgIHJvdGF0aW9uTWF0cml4LmVsZW1lbnRzWyA1IF0gKj0gaW52U3k7XG4gICAgcm90YXRpb25NYXRyaXguZWxlbWVudHNbIDYgXSAqPSBpbnZTeTtcblxuICAgIHJvdGF0aW9uTWF0cml4LmVsZW1lbnRzWyA4IF0gKj0gaW52U3o7XG4gICAgcm90YXRpb25NYXRyaXguZWxlbWVudHNbIDkgXSAqPSBpbnZTejtcbiAgICByb3RhdGlvbk1hdHJpeC5lbGVtZW50c1sgMTAgXSAqPSBpbnZTejtcblxuICAgIHJldHVybiB7XG4gICAgICBwb3NpdGlvbjogbmV3IFZlY3RvcjMoIFsgbVsgMTIgXSwgbVsgMTMgXSwgbVsgMTQgXSBdICksXG4gICAgICBzY2FsZTogbmV3IFZlY3RvcjMoIFsgc3gsIHN5LCBzeiBdICksXG4gICAgICByb3RhdGlvbjogUXVhdGVybmlvbi5mcm9tTWF0cml4KCByb3RhdGlvbk1hdHJpeCApXG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDb21wb3NlIGEgbWF0cml4IG91dCBvZiBwb3NpdGlvbiwgc2NhbGUsIGFuZCByb3RhdGlvbi5cbiAgICogWW9pbmtlZCBmcm9tIFRocmVlLmpzLlxuICAgKi9cbiAgcHVibGljIHN0YXRpYyBjb21wb3NlKCBwb3NpdGlvbjogVmVjdG9yMywgcm90YXRpb246IFF1YXRlcm5pb24sIHNjYWxlOiBWZWN0b3IzICk6IE1hdHJpeDQge1xuICAgIGNvbnN0IHggPSByb3RhdGlvbi54LCB5ID0gcm90YXRpb24ueSwgeiA9IHJvdGF0aW9uLnosIHcgPSByb3RhdGlvbi53O1xuICAgIGNvbnN0IHgyID0geCArIHgsXHR5MiA9IHkgKyB5LCB6MiA9IHogKyB6O1xuICAgIGNvbnN0IHh4ID0geCAqIHgyLCB4eSA9IHggKiB5MiwgeHogPSB4ICogejI7XG4gICAgY29uc3QgeXkgPSB5ICogeTIsIHl6ID0geSAqIHoyLCB6eiA9IHogKiB6MjtcbiAgICBjb25zdCB3eCA9IHcgKiB4Miwgd3kgPSB3ICogeTIsIHd6ID0gdyAqIHoyO1xuICAgIGNvbnN0IHN4ID0gc2NhbGUueCwgc3kgPSBzY2FsZS55LCBzeiA9IHNjYWxlLno7XG5cbiAgICByZXR1cm4gbmV3IE1hdHJpeDQoIFtcbiAgICAgICggMS4wIC0gKCB5eSArIHp6ICkgKSAqIHN4LFxuICAgICAgKCB4eSArIHd6ICkgKiBzeCxcbiAgICAgICggeHogLSB3eSApICogc3gsXG4gICAgICAwLjAsXG5cbiAgICAgICggeHkgLSB3eiApICogc3ksXG4gICAgICAoIDEuMCAtICggeHggKyB6eiApICkgKiBzeSxcbiAgICAgICggeXogKyB3eCApICogc3ksXG4gICAgICAwLjAsXG5cbiAgICAgICggeHogKyB3eSApICogc3osXG4gICAgICAoIHl6IC0gd3ggKSAqIHN6LFxuICAgICAgKCAxLjAgLSAoIHh4ICsgeXkgKSApICogc3osXG4gICAgICAwLjAsXG5cbiAgICAgIHBvc2l0aW9uLngsXG4gICAgICBwb3NpdGlvbi55LFxuICAgICAgcG9zaXRpb24ueixcbiAgICAgIDEuMFxuICAgIF0gKTtcbiAgfVxufVxuIiwiaW1wb3J0IHsgTWF0cml4NCwgVmVjdG9yMyB9IGZyb20gJy4nO1xuXG5leHBvcnQgdHlwZSByYXdRdWF0ZXJuaW9uID0gWyBudW1iZXIsIG51bWJlciwgbnVtYmVyLCBudW1iZXIgXTtcblxuZXhwb3J0IGNvbnN0IHJhd0lkZW50aXR5UXVhdGVybmlvbjogcmF3UXVhdGVybmlvbiA9IFsgMC4wLCAwLjAsIDAuMCwgMS4wIF07XG5cbi8qKlxuICogQSBRdWF0ZXJuaW9uLlxuICovXG5leHBvcnQgY2xhc3MgUXVhdGVybmlvbiB7XG4gIHB1YmxpYyBlbGVtZW50czogcmF3UXVhdGVybmlvbjsgLy8gWyB4LCB5LCB6OyB3IF1cblxuICBwdWJsaWMgY29uc3RydWN0b3IoIGVsZW1lbnRzOiByYXdRdWF0ZXJuaW9uID0gcmF3SWRlbnRpdHlRdWF0ZXJuaW9uICkge1xuICAgIHRoaXMuZWxlbWVudHMgPSBlbGVtZW50cztcbiAgfVxuXG4gIC8qKlxuICAgKiBBbiB4IGNvbXBvbmVudCBvZiB0aGlzLlxuICAgKi9cbiAgcHVibGljIGdldCB4KCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuZWxlbWVudHNbIDAgXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBbiB5IGNvbXBvbmVudCBvZiB0aGlzLlxuICAgKi9cbiAgcHVibGljIGdldCB5KCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuZWxlbWVudHNbIDEgXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBbiB6IGNvbXBvbmVudCBvZiB0aGlzLlxuICAgKi9cbiAgcHVibGljIGdldCB6KCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuZWxlbWVudHNbIDIgXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBbiB3IGNvbXBvbmVudCBvZiB0aGlzLlxuICAgKi9cbiAgcHVibGljIGdldCB3KCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuZWxlbWVudHNbIDMgXTtcbiAgfVxuXG4gIHB1YmxpYyB0b1N0cmluZygpOiBzdHJpbmcge1xuICAgIHJldHVybiBgUXVhdGVybmlvbiggJHsgdGhpcy54LnRvRml4ZWQoIDMgKSB9LCAkeyB0aGlzLnkudG9GaXhlZCggMyApIH0sICR7IHRoaXMuei50b0ZpeGVkKCAzICkgfSwgJHsgdGhpcy53LnRvRml4ZWQoIDMgKSB9IClgO1xuICB9XG5cbiAgLyoqXG4gICAqIENsb25lIHRoaXMuXG4gICAqL1xuICBwdWJsaWMgY2xvbmUoKTogUXVhdGVybmlvbiB7XG4gICAgcmV0dXJuIG5ldyBRdWF0ZXJuaW9uKCB0aGlzLmVsZW1lbnRzLmNvbmNhdCgpIGFzIHJhd1F1YXRlcm5pb24gKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJdHNlbGYgYnV0IGNvbnZlcnRlZCBpbnRvIGEgTWF0cml4NC5cbiAgICovXG4gIHB1YmxpYyBnZXQgbWF0cml4KCk6IE1hdHJpeDQge1xuICAgIGNvbnN0IHggPSBuZXcgVmVjdG9yMyggWyAxLjAsIDAuMCwgMC4wIF0gKS5hcHBseVF1YXRlcm5pb24oIHRoaXMgKTtcbiAgICBjb25zdCB5ID0gbmV3IFZlY3RvcjMoIFsgMC4wLCAxLjAsIDAuMCBdICkuYXBwbHlRdWF0ZXJuaW9uKCB0aGlzICk7XG4gICAgY29uc3QgeiA9IG5ldyBWZWN0b3IzKCBbIDAuMCwgMC4wLCAxLjAgXSApLmFwcGx5UXVhdGVybmlvbiggdGhpcyApO1xuXG4gICAgcmV0dXJuIG5ldyBNYXRyaXg0KCBbXG4gICAgICB4LngsIHkueCwgei54LCAwLjAsXG4gICAgICB4LnksIHkueSwgei55LCAwLjAsXG4gICAgICB4LnosIHkueiwgei56LCAwLjAsXG4gICAgICAwLjAsIDAuMCwgMC4wLCAxLjBcbiAgICBdICk7XG4gIH1cblxuICAvKipcbiAgICogQW4gaW52ZXJzZSBvZiB0aGlzLlxuICAgKi9cbiAgcHVibGljIGdldCBpbnZlcnNlZCgpOiBRdWF0ZXJuaW9uIHtcbiAgICByZXR1cm4gbmV3IFF1YXRlcm5pb24oIFtcbiAgICAgIC10aGlzLngsXG4gICAgICAtdGhpcy55LFxuICAgICAgLXRoaXMueixcbiAgICAgIHRoaXMud1xuICAgIF0gKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBNdWx0aXBseSB0d28gUXVhdGVybmlvbnMuXG4gICAqIEBwYXJhbSBxIEFub3RoZXIgUXVhdGVybmlvblxuICAgKi9cbiAgcHVibGljIG11bHRpcGx5KCBxOiBRdWF0ZXJuaW9uICk6IFF1YXRlcm5pb24ge1xuICAgIHJldHVybiBuZXcgUXVhdGVybmlvbiggW1xuICAgICAgdGhpcy53ICogcS54ICsgdGhpcy54ICogcS53ICsgdGhpcy55ICogcS56IC0gdGhpcy56ICogcS55LFxuICAgICAgdGhpcy53ICogcS55IC0gdGhpcy54ICogcS56ICsgdGhpcy55ICogcS53ICsgdGhpcy56ICogcS54LFxuICAgICAgdGhpcy53ICogcS56ICsgdGhpcy54ICogcS55IC0gdGhpcy55ICogcS54ICsgdGhpcy56ICogcS53LFxuICAgICAgdGhpcy53ICogcS53IC0gdGhpcy54ICogcS54IC0gdGhpcy55ICogcS55IC0gdGhpcy56ICogcS56XG4gICAgXSApO1xuICB9XG5cbiAgLyoqXG4gICAqIEFuIGlkZW50aXR5IFF1YXRlcm5pb24uXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIGdldCBpZGVudGl0eSgpOiBRdWF0ZXJuaW9uIHtcbiAgICByZXR1cm4gbmV3IFF1YXRlcm5pb24oIHJhd0lkZW50aXR5UXVhdGVybmlvbiApO1xuICB9XG5cbiAgLyoqXG4gICAqIEdlbmVyYXRlIGEgUXVhdGVybmlvbiBvdXQgb2YgYW5nbGUgYW5kIGF4aXMuXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIGZyb21BeGlzQW5nbGUoIGF4aXM6IFZlY3RvcjMsIGFuZ2xlOiBudW1iZXIgKTogUXVhdGVybmlvbiB7XG4gICAgY29uc3QgaGFsZkFuZ2xlID0gYW5nbGUgLyAyLjA7XG4gICAgY29uc3Qgc2luSGFsZkFuZ2xlID0gTWF0aC5zaW4oIGhhbGZBbmdsZSApO1xuICAgIHJldHVybiBuZXcgUXVhdGVybmlvbiggW1xuICAgICAgYXhpcy54ICogc2luSGFsZkFuZ2xlLFxuICAgICAgYXhpcy55ICogc2luSGFsZkFuZ2xlLFxuICAgICAgYXhpcy56ICogc2luSGFsZkFuZ2xlLFxuICAgICAgTWF0aC5jb3MoIGhhbGZBbmdsZSApXG4gICAgXSApO1xuICB9XG5cbiAgLyoqXG4gICAqIEdlbmVyYXRlIGEgUXVhdGVybmlvbiBvdXQgb2YgYSByb3RhdGlvbiBtYXRyaXguXG4gICAqIFlvaW5rZWQgZnJvbSBUaHJlZS5qcy5cbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgZnJvbU1hdHJpeCggbWF0cml4OiBNYXRyaXg0ICk6IFF1YXRlcm5pb24ge1xuICAgIGNvbnN0IG0gPSBtYXRyaXguZWxlbWVudHMsXG4gICAgICBtMTEgPSBtWyAwIF0sIG0xMiA9IG1bIDQgXSwgbTEzID0gbVsgOCBdLFxuICAgICAgbTIxID0gbVsgMSBdLCBtMjIgPSBtWyA1IF0sIG0yMyA9IG1bIDkgXSxcbiAgICAgIG0zMSA9IG1bIDIgXSwgbTMyID0gbVsgNiBdLCBtMzMgPSBtWyAxMCBdLFxuICAgICAgdHJhY2UgPSBtMTEgKyBtMjIgKyBtMzM7XG5cbiAgICBpZiAoIHRyYWNlID4gMCApIHtcbiAgICAgIGNvbnN0IHMgPSAwLjUgLyBNYXRoLnNxcnQoIHRyYWNlICsgMS4wICk7XG4gICAgICByZXR1cm4gbmV3IFF1YXRlcm5pb24oIFtcbiAgICAgICAgKCBtMzIgLSBtMjMgKSAqIHMsXG4gICAgICAgICggbTEzIC0gbTMxICkgKiBzLFxuICAgICAgICAoIG0yMSAtIG0xMiApICogcyxcbiAgICAgICAgMC4yNSAvIHNcbiAgICAgIF0gKTtcbiAgICB9IGVsc2UgaWYgKCBtMTEgPiBtMjIgJiYgbTExID4gbTMzICkge1xuICAgICAgY29uc3QgcyA9IDIuMCAqIE1hdGguc3FydCggMS4wICsgbTExIC0gbTIyIC0gbTMzICk7XG4gICAgICByZXR1cm4gbmV3IFF1YXRlcm5pb24oIFtcbiAgICAgICAgMC4yNSAqIHMsXG4gICAgICAgICggbTEyICsgbTIxICkgLyBzLFxuICAgICAgICAoIG0xMyArIG0zMSApIC8gcyxcbiAgICAgICAgKCBtMzIgLSBtMjMgKSAvIHNcbiAgICAgIF0gKTtcbiAgICB9IGVsc2UgaWYgKCBtMjIgPiBtMzMgKSB7XG4gICAgICBjb25zdCBzID0gMi4wICogTWF0aC5zcXJ0KCAxLjAgKyBtMjIgLSBtMTEgLSBtMzMgKTtcbiAgICAgIHJldHVybiBuZXcgUXVhdGVybmlvbiggW1xuICAgICAgICAoIG0xMiArIG0yMSApIC8gcyxcbiAgICAgICAgMC4yNSAqIHMsXG4gICAgICAgICggbTIzICsgbTMyICkgLyBzLFxuICAgICAgICAoIG0xMyAtIG0zMSApIC8gc1xuICAgICAgXSApO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBzID0gMi4wICogTWF0aC5zcXJ0KCAxLjAgKyBtMzMgLSBtMTEgLSBtMjIgKTtcbiAgICAgIHJldHVybiBuZXcgUXVhdGVybmlvbiggW1xuICAgICAgICAoIG0xMyArIG0zMSApIC8gcyxcbiAgICAgICAgKCBtMjMgKyBtMzIgKSAvIHMsXG4gICAgICAgIDAuMjUgKiBzLFxuICAgICAgICAoIG0yMSAtIG0xMiApIC8gc1xuICAgICAgXSApO1xuICAgIH1cbiAgfVxufVxuIiwiLyoqXG4gKiBBIFZlY3Rvci5cbiAqL1xuZXhwb3J0IGFic3RyYWN0IGNsYXNzIFZlY3RvcjxUIGV4dGVuZHMgVmVjdG9yPFQ+PiB7XG4gIHB1YmxpYyBhYnN0cmFjdCBlbGVtZW50czogbnVtYmVyW107XG5cbiAgLyoqXG4gICAqIFRoZSBsZW5ndGggb2YgdGhpcy5cbiAgICogYS5rLmEuIGBtYWduaXR1ZGVgXG4gICAqL1xuICBwdWJsaWMgZ2V0IGxlbmd0aCgpOiBudW1iZXIge1xuICAgIHJldHVybiBNYXRoLnNxcnQoIHRoaXMuZWxlbWVudHMucmVkdWNlKCAoIHN1bSwgdiApID0+IHN1bSArIHYgKiB2LCAwLjAgKSApO1xuICB9XG5cbiAgLyoqXG4gICAqIEEgbm9ybWFsaXplZCBWZWN0b3IzIG9mIHRoaXMuXG4gICAqL1xuICBwdWJsaWMgZ2V0IG5vcm1hbGl6ZWQoKTogVCB7XG4gICAgcmV0dXJuIHRoaXMuc2NhbGUoIDEuMCAvIHRoaXMubGVuZ3RoICk7XG4gIH1cblxuICAvKipcbiAgICogQ2xvbmUgdGhpcy5cbiAgICovXG4gIHB1YmxpYyBjbG9uZSgpOiBUIHtcbiAgICByZXR1cm4gdGhpcy5fX25ldyggdGhpcy5lbGVtZW50cy5jb25jYXQoKSApO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZCBhIFZlY3RvciBpbnRvIHRoaXMuXG4gICAqIEBwYXJhbSB2ZWN0b3IgQW5vdGhlciBWZWN0b3JcbiAgICovXG4gIHB1YmxpYyBhZGQoIHZlY3RvcjogVCApOiBUIHtcbiAgICByZXR1cm4gdGhpcy5fX25ldyggdGhpcy5lbGVtZW50cy5tYXAoICggdiwgaSApID0+IHYgKyB2ZWN0b3IuZWxlbWVudHNbIGkgXSApICk7XG4gIH1cblxuICAvKipcbiAgICogU3Vic3RyYWN0IHRoaXMgZnJvbSBhbm90aGVyIFZlY3Rvci5cbiAgICogQHBhcmFtIHYgQW5vdGhlciB2ZWN0b3JcbiAgICovXG4gIHB1YmxpYyBzdWIoIHZlY3RvcjogVCApOiBUIHtcbiAgICByZXR1cm4gdGhpcy5fX25ldyggdGhpcy5lbGVtZW50cy5tYXAoICggdiwgaSApID0+IHYgLSB2ZWN0b3IuZWxlbWVudHNbIGkgXSApICk7XG4gIH1cblxuICAvKipcbiAgICogTXVsdGlwbHkgYSBWZWN0b3Igd2l0aCB0aGlzLlxuICAgKiBAcGFyYW0gdmVjdG9yIEFub3RoZXIgVmVjdG9yXG4gICAqL1xuICBwdWJsaWMgbXVsdGlwbHkoIHZlY3RvcjogVCApOiBUIHtcbiAgICByZXR1cm4gdGhpcy5fX25ldyggdGhpcy5lbGVtZW50cy5tYXAoICggdiwgaSApID0+IHYgKiB2ZWN0b3IuZWxlbWVudHNbIGkgXSApICk7XG4gIH1cblxuICAvKipcbiAgICogRGl2aWRlIHRoaXMgZnJvbSBhbm90aGVyIFZlY3Rvci5cbiAgICogQHBhcmFtIHZlY3RvciBBbm90aGVyIFZlY3RvclxuICAgKi9cbiAgcHVibGljIGRpdmlkZSggdmVjdG9yOiBUICk6IFQge1xuICAgIHJldHVybiB0aGlzLl9fbmV3KCB0aGlzLmVsZW1lbnRzLm1hcCggKCB2LCBpICkgPT4gdiAvIHZlY3Rvci5lbGVtZW50c1sgaSBdICkgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTY2FsZSB0aGlzIGJ5IHNjYWxhci5cbiAgICogYS5rLmEuIGBtdWx0aXBseVNjYWxhcmBcbiAgICogQHBhcmFtIHNjYWxhciBBIHNjYWxhclxuICAgKi9cbiAgcHVibGljIHNjYWxlKCBzY2FsYXI6IG51bWJlciApOiBUIHtcbiAgICByZXR1cm4gdGhpcy5fX25ldyggdGhpcy5lbGVtZW50cy5tYXAoICggdiApID0+IHYgKiBzY2FsYXIgKSApO1xuICB9XG5cbiAgLyoqXG4gICAqIERvdCB0d28gVmVjdG9ycy5cbiAgICogQHBhcmFtIHZlY3RvciBBbm90aGVyIHZlY3RvclxuICAgKi9cbiAgcHVibGljIGRvdCggdmVjdG9yOiBUICk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuZWxlbWVudHMucmVkdWNlKCAoIHN1bSwgdiwgaSApID0+IHN1bSArIHYgKiB2ZWN0b3IuZWxlbWVudHNbIGkgXSwgMC4wICk7XG4gIH1cblxuICBwcm90ZWN0ZWQgYWJzdHJhY3QgX19uZXcoIHY6IG51bWJlcltdICk6IFQ7XG59XG4iLCJpbXBvcnQgeyBNYXRyaXg0LCBRdWF0ZXJuaW9uLCBWZWN0b3IgfSBmcm9tICcuJztcblxuZXhwb3J0IHR5cGUgcmF3VmVjdG9yMyA9IFsgbnVtYmVyLCBudW1iZXIsIG51bWJlciBdO1xuXG4vKipcbiAqIEEgVmVjdG9yMy5cbiAqL1xuZXhwb3J0IGNsYXNzIFZlY3RvcjMgZXh0ZW5kcyBWZWN0b3I8VmVjdG9yMz4ge1xuICBwdWJsaWMgZWxlbWVudHM6IHJhd1ZlY3RvcjM7XG5cbiAgcHVibGljIGNvbnN0cnVjdG9yKCB2OiByYXdWZWN0b3IzID0gWyAwLjAsIDAuMCwgMC4wIF0gKSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLmVsZW1lbnRzID0gdjtcbiAgfVxuXG4gIC8qKlxuICAgKiBBbiB4IGNvbXBvbmVudCBvZiB0aGlzLlxuICAgKi9cbiAgcHVibGljIGdldCB4KCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuZWxlbWVudHNbIDAgXTtcbiAgfVxuXG4gIHB1YmxpYyBzZXQgeCggeDogbnVtYmVyICkge1xuICAgIHRoaXMuZWxlbWVudHNbIDAgXSA9IHg7XG4gIH1cblxuICAvKipcbiAgICogQW4geSBjb21wb25lbnQgb2YgdGhpcy5cbiAgICovXG4gIHB1YmxpYyBnZXQgeSgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLmVsZW1lbnRzWyAxIF07XG4gIH1cblxuICBwdWJsaWMgc2V0IHkoIHk6IG51bWJlciApIHtcbiAgICB0aGlzLmVsZW1lbnRzWyAxIF0gPSB5O1xuICB9XG5cbiAgLyoqXG4gICAqIEFuIHogY29tcG9uZW50IG9mIHRoaXMuXG4gICAqL1xuICBwdWJsaWMgZ2V0IHooKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5lbGVtZW50c1sgMiBdO1xuICB9XG5cbiAgcHVibGljIHNldCB6KCB6OiBudW1iZXIgKSB7XG4gICAgdGhpcy5lbGVtZW50c1sgMiBdID0gejtcbiAgfVxuXG4gIHB1YmxpYyB0b1N0cmluZygpOiBzdHJpbmcge1xuICAgIHJldHVybiBgVmVjdG9yMyggJHsgdGhpcy54LnRvRml4ZWQoIDMgKSB9LCAkeyB0aGlzLnkudG9GaXhlZCggMyApIH0sICR7IHRoaXMuei50b0ZpeGVkKCAzICkgfSApYDtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm4gYSBjcm9zcyBvZiB0aGlzIGFuZCBhbm90aGVyIFZlY3RvcjMuXG4gICAqIEBwYXJhbSB2ZWN0b3IgQW5vdGhlciB2ZWN0b3JcbiAgICovXG4gIHB1YmxpYyBjcm9zcyggdmVjdG9yOiBWZWN0b3IzICk6IFZlY3RvcjMge1xuICAgIHJldHVybiBuZXcgVmVjdG9yMyggW1xuICAgICAgdGhpcy55ICogdmVjdG9yLnogLSB0aGlzLnogKiB2ZWN0b3IueSxcbiAgICAgIHRoaXMueiAqIHZlY3Rvci54IC0gdGhpcy54ICogdmVjdG9yLnosXG4gICAgICB0aGlzLnggKiB2ZWN0b3IueSAtIHRoaXMueSAqIHZlY3Rvci54XG4gICAgXSApO1xuICB9XG5cbiAgLyoqXG4gICAqIFJvdGF0ZSB0aGlzIHZlY3RvciB1c2luZyBhIFF1YXRlcm5pb24uXG4gICAqIEBwYXJhbSBxdWF0ZXJuaW9uIEEgcXVhdGVybmlvblxuICAgKi9cbiAgcHVibGljIGFwcGx5UXVhdGVybmlvbiggcXVhdGVybmlvbjogUXVhdGVybmlvbiApOiBWZWN0b3IzIHtcbiAgICBjb25zdCBwID0gbmV3IFF1YXRlcm5pb24oIFsgdGhpcy54LCB0aGlzLnksIHRoaXMueiwgMC4wIF0gKTtcbiAgICBjb25zdCByID0gcXVhdGVybmlvbi5pbnZlcnNlZDtcbiAgICBjb25zdCByZXMgPSBxdWF0ZXJuaW9uLm11bHRpcGx5KCBwICkubXVsdGlwbHkoIHIgKTtcbiAgICByZXR1cm4gbmV3IFZlY3RvcjMoIFsgcmVzLngsIHJlcy55LCByZXMueiBdICk7XG4gIH1cblxuICAvKipcbiAgICogTXVsdGlwbHkgdGhpcyB2ZWN0b3IgKHdpdGggYW4gaW1wbGljaXQgMSBpbiB0aGUgNHRoIGRpbWVuc2lvbikgYnkgbS5cbiAgICovXG4gIHB1YmxpYyBhcHBseU1hdHJpeDQoIG1hdHJpeDogTWF0cml4NCApOiBWZWN0b3IzIHtcbiAgICBjb25zdCBtID0gbWF0cml4LmVsZW1lbnRzO1xuXG4gICAgY29uc3QgdyA9IG1bIDMgXSAqIHRoaXMueCArIG1bIDcgXSAqIHRoaXMueSArIG1bIDExIF0gKiB0aGlzLnogKyBtWyAxNSBdO1xuICAgIGNvbnN0IGludlcgPSAxLjAgLyB3O1xuXG4gICAgcmV0dXJuIG5ldyBWZWN0b3IzKCBbXG4gICAgICAoIG1bIDAgXSAqIHRoaXMueCArIG1bIDQgXSAqIHRoaXMueSArIG1bIDggXSAqIHRoaXMueiArIG1bIDEyIF0gKSAqIGludlcsXG4gICAgICAoIG1bIDEgXSAqIHRoaXMueCArIG1bIDUgXSAqIHRoaXMueSArIG1bIDkgXSAqIHRoaXMueiArIG1bIDEzIF0gKSAqIGludlcsXG4gICAgICAoIG1bIDIgXSAqIHRoaXMueCArIG1bIDYgXSAqIHRoaXMueSArIG1bIDEwIF0gKiB0aGlzLnogKyBtWyAxNCBdICkgKiBpbnZXXG4gICAgXSApO1xuICB9XG5cbiAgcHJvdGVjdGVkIF9fbmV3KCB2OiByYXdWZWN0b3IzICk6IFZlY3RvcjMge1xuICAgIHJldHVybiBuZXcgVmVjdG9yMyggdiApO1xuICB9XG5cbiAgLyoqXG4gICAqIFZlY3RvcjMoIDAuMCwgMC4wLCAwLjAgKVxuICAgKi9cbiAgcHVibGljIHN0YXRpYyBnZXQgemVybygpOiBWZWN0b3IzIHtcbiAgICByZXR1cm4gbmV3IFZlY3RvcjMoIFsgMC4wLCAwLjAsIDAuMCBdICk7XG4gIH1cblxuICAvKipcbiAgICogVmVjdG9yMyggMS4wLCAxLjAsIDEuMCApXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIGdldCBvbmUoKTogVmVjdG9yMyB7XG4gICAgcmV0dXJuIG5ldyBWZWN0b3IzKCBbIDEuMCwgMS4wLCAxLjAgXSApO1xuICB9XG59XG4iLCJpbXBvcnQgeyBNYXRyaXg0LCBWZWN0b3IgfSBmcm9tICcuJztcblxuZXhwb3J0IHR5cGUgcmF3VmVjdG9yNCA9IFsgbnVtYmVyLCBudW1iZXIsIG51bWJlciwgbnVtYmVyIF07XG5cbi8qKlxuICogQSBWZWN0b3IzLlxuICovXG5leHBvcnQgY2xhc3MgVmVjdG9yNCBleHRlbmRzIFZlY3RvcjxWZWN0b3I0PiB7XG4gIHB1YmxpYyBlbGVtZW50czogcmF3VmVjdG9yNDtcblxuICBwdWJsaWMgY29uc3RydWN0b3IoIHY6IHJhd1ZlY3RvcjQgPSBbIDAuMCwgMC4wLCAwLjAsIDAuMCBdICkge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5lbGVtZW50cyA9IHY7XG4gIH1cblxuICAvKipcbiAgICogQW4geCBjb21wb25lbnQgb2YgdGhpcy5cbiAgICovXG4gIHB1YmxpYyBnZXQgeCgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLmVsZW1lbnRzWyAwIF07XG4gIH1cblxuICBwdWJsaWMgc2V0IHgoIHg6IG51bWJlciApIHtcbiAgICB0aGlzLmVsZW1lbnRzWyAwIF0gPSB4O1xuICB9XG5cbiAgLyoqXG4gICAqIEEgeSBjb21wb25lbnQgb2YgdGhpcy5cbiAgICovXG4gIHB1YmxpYyBnZXQgeSgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLmVsZW1lbnRzWyAxIF07XG4gIH1cblxuICBwdWJsaWMgc2V0IHkoIHk6IG51bWJlciApIHtcbiAgICB0aGlzLmVsZW1lbnRzWyAxIF0gPSB5O1xuICB9XG5cbiAgLyoqXG4gICAqIEEgeiBjb21wb25lbnQgb2YgdGhpcy5cbiAgICovXG4gIHB1YmxpYyBnZXQgeigpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLmVsZW1lbnRzWyAyIF07XG4gIH1cblxuICBwdWJsaWMgc2V0IHooIHo6IG51bWJlciApIHtcbiAgICB0aGlzLmVsZW1lbnRzWyAyIF0gPSB6O1xuICB9XG5cbiAgLyoqXG4gICAqIEEgdyBjb21wb25lbnQgb2YgdGhpcy5cbiAgICovXG4gIHB1YmxpYyBnZXQgdygpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLmVsZW1lbnRzWyAzIF07XG4gIH1cblxuICBwdWJsaWMgc2V0IHcoIHo6IG51bWJlciApIHtcbiAgICB0aGlzLmVsZW1lbnRzWyAzIF0gPSB6O1xuICB9XG5cbiAgcHVibGljIHRvU3RyaW5nKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGBWZWN0b3I0KCAkeyB0aGlzLngudG9GaXhlZCggMyApIH0sICR7IHRoaXMueS50b0ZpeGVkKCAzICkgfSwgJHsgdGhpcy56LnRvRml4ZWQoIDMgKSB9LCAkeyB0aGlzLncudG9GaXhlZCggMyApIH0gKWA7XG4gIH1cblxuICAvKipcbiAgICogTXVsdGlwbHkgdGhpcyB2ZWN0b3IgKHdpdGggYW4gaW1wbGljaXQgMSBpbiB0aGUgNHRoIGRpbWVuc2lvbikgYnkgbS5cbiAgICovXG4gIHB1YmxpYyBhcHBseU1hdHJpeDQoIG1hdHJpeDogTWF0cml4NCApOiBWZWN0b3I0IHtcbiAgICBjb25zdCBtID0gbWF0cml4LmVsZW1lbnRzO1xuXG4gICAgcmV0dXJuIG5ldyBWZWN0b3I0KCBbXG4gICAgICBtWyAwIF0gKiB0aGlzLnggKyBtWyA0IF0gKiB0aGlzLnkgKyBtWyA4IF0gKiB0aGlzLnogKyBtWyAxMiBdICogdGhpcy53LFxuICAgICAgbVsgMSBdICogdGhpcy54ICsgbVsgNSBdICogdGhpcy55ICsgbVsgOSBdICogdGhpcy56ICsgbVsgMTMgXSAqIHRoaXMudyxcbiAgICAgIG1bIDIgXSAqIHRoaXMueCArIG1bIDYgXSAqIHRoaXMueSArIG1bIDEwIF0gKiB0aGlzLnogKyBtWyAxNCBdICogdGhpcy53LFxuICAgICAgbVsgMyBdICogdGhpcy54ICsgbVsgNyBdICogdGhpcy55ICsgbVsgMTEgXSAqIHRoaXMueiArIG1bIDE1IF0gKiB0aGlzLndcbiAgICBdICk7XG4gIH1cblxuICBwcm90ZWN0ZWQgX19uZXcoIHY6IHJhd1ZlY3RvcjQgKTogVmVjdG9yNCB7XG4gICAgcmV0dXJuIG5ldyBWZWN0b3I0KCB2ICk7XG4gIH1cblxuICAvKipcbiAgICogVmVjdG9yNCggMC4wLCAwLjAsIDAuMCwgMC4wIClcbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgZ2V0IHplcm8oKTogVmVjdG9yNCB7XG4gICAgcmV0dXJuIG5ldyBWZWN0b3I0KCBbIDAuMCwgMC4wLCAwLjAsIDAuMCBdICk7XG4gIH1cblxuICAvKipcbiAgICogVmVjdG9yNCggMS4wLCAxLjAsIDEuMCwgMS4wIClcbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgZ2V0IG9uZSgpOiBWZWN0b3I0IHtcbiAgICByZXR1cm4gbmV3IFZlY3RvcjQoIFsgMS4wLCAxLjAsIDEuMCwgMS4wIF0gKTtcbiAgfVxufVxuIiwiZXhwb3J0ICogZnJvbSAnLi9NYXRyaXg0JztcbmV4cG9ydCAqIGZyb20gJy4vUXVhdGVybmlvbic7XG5leHBvcnQgKiBmcm9tICcuL1ZlY3Rvcic7XG5leHBvcnQgKiBmcm9tICcuL1ZlY3RvcjMnO1xuZXhwb3J0ICogZnJvbSAnLi9WZWN0b3I0JztcbmV4cG9ydCAqIGZyb20gJy4vdXRpbHMnO1xuIiwiLyoqXG4gKiBgbGVycGAsIG9yIGBtaXhgXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBsZXJwKCBhOiBudW1iZXIsIGI6IG51bWJlciwgeDogbnVtYmVyICk6IG51bWJlciB7XG4gIHJldHVybiBhICsgKCBiIC0gYSApICogeDtcbn1cblxuLyoqXG4gKiBgY2xhbXBgXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjbGFtcCggeDogbnVtYmVyLCBsOiBudW1iZXIsIGg6IG51bWJlciApOiBudW1iZXIge1xuICByZXR1cm4gTWF0aC5taW4oIE1hdGgubWF4KCB4LCBsICksIGggKTtcbn1cblxuLyoqXG4gKiBgY2xhbXAoIHgsIDAuMCwgMS4wIClgXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzYXR1cmF0ZSggeDogbnVtYmVyICk6IG51bWJlciB7XG4gIHJldHVybiBjbGFtcCggeCwgMC4wLCAxLjAgKTtcbn1cblxuLyoqXG4gKiBgc21vb3Roc3RlcGAgYnV0IG5vdCBzbW9vdGhcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGxpbmVhcnN0ZXAoIGE6IG51bWJlciwgYjogbnVtYmVyLCB4OiBudW1iZXIgKTogbnVtYmVyIHtcbiAgcmV0dXJuIHNhdHVyYXRlKCAoIHggLSBhICkgLyAoIGIgLSBhICkgKTtcbn1cblxuLyoqXG4gKiB3b3JsZCBmYW1vdXMgYHNtb290aHN0ZXBgIGZ1bmN0aW9uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzbW9vdGhzdGVwKCBhOiBudW1iZXIsIGI6IG51bWJlciwgeDogbnVtYmVyICk6IG51bWJlciB7XG4gIGNvbnN0IHQgPSBsaW5lYXJzdGVwKCBhLCBiLCB4ICk7XG4gIHJldHVybiB0ICogdCAqICggMy4wIC0gMi4wICogdCApO1xufVxuXG4vKipcbiAqIGBzbW9vdGhzdGVwYCBidXQgbW9yZSBzbW9vdGhcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNtb290aGVyc3RlcCggYTogbnVtYmVyLCBiOiBudW1iZXIsIHg6IG51bWJlciApOiBudW1iZXIge1xuICBjb25zdCB0ID0gbGluZWFyc3RlcCggYSwgYiwgeCApO1xuICByZXR1cm4gdCAqIHQgKiB0ICogKCB0ICogKCB0ICogNi4wIC0gMTUuMCApICsgMTAuMCApO1xufVxuXG4vKipcbiAqIGBzbW9vdGhzdGVwYCBidXQgV0FZIG1vcmUgc21vb3RoXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzbW9vdGhlc3RzdGVwKCBhOiBudW1iZXIsIGI6IG51bWJlciwgeDogbnVtYmVyICk6IG51bWJlciB7XG4gIGNvbnN0IHQgPSBsaW5lYXJzdGVwKCBhLCBiLCB4ICk7XG4gIHJldHVybiB0ICogdCAqIHQgKiB0ICogKCB0ICogKCB0ICogKCAtMjAuMCAqIHQgKyA3MC4wICkgLSA4NC4wICkgKyAzNS4wICk7XG59XG4iXSwic291cmNlUm9vdCI6IiJ9