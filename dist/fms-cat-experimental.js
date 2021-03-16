/*!
* @fms-cat/experimental v0.6.0
* Experimental edition of FMS_Cat
*
* Copyright (c) 2019-2020 FMS_Cat
* @fms-cat/experimental is distributed under MIT License
* https://github.com/FMS-Cat/experimental-npm/blob/master/LICENSE
*/
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = global || self, factory(global.FMS_CAT_EXPERIMENTAL = {}));
}(this, (function (exports) { 'use strict';

    // yoinked from https://stackoverflow.com/questions/1344500/efficient-way-to-insert-a-number-into-a-sorted-array-of-numbers
    function binarySearch(array, elementOrCompare) {
        if (typeof elementOrCompare !== 'function') {
            return binarySearch(array, function (element) { return (element < elementOrCompare); });
        }
        var compare = elementOrCompare;
        var start = 0;
        var end = array.length;
        while (start < end) {
            var center = (start + end) >> 1;
            var centerElement = array[center];
            var compareResult = compare(centerElement);
            if (compareResult) {
                start = center + 1;
            }
            else {
                end = center;
            }
        }
        return start;
    }

    /**
     * `[ -1, -1, 1, -1, -1, 1, 1, 1 ]`
     */
    var TRIANGLE_STRIP_QUAD = [-1, -1, 1, -1, -1, 1, 1, 1];
    /**
     * `[ -1, -1, 0, 1, -1, 0, -1, 1, 0, 1, 1, 0 ]`
     */
    var TRIANGLE_STRIP_QUAD_3D = [-1, -1, 0, 1, -1, 0, -1, 1, 0, 1, 1, 0];
    /**
     * `[ 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1 ]`
     */
    var TRIANGLE_STRIP_QUAD_NORMAL = [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1];
    /**
     * `[ 0, 0, 1, 0, 0, 1, 1, 1 ]`
     */
    var TRIANGLE_STRIP_QUAD_UV = [0, 0, 1, 0, 0, 1, 1, 1];

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

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */
    /* global Reflect, Promise */

    var extendStatics = function(d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };

    function __extends(d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    }

    function __values(o) {
        var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
        if (m) return m.call(o);
        if (o && typeof o.length === "number") return {
            next: function () {
                if (o && i >= o.length) o = void 0;
                return { value: o && o[i++], done: !o };
            }
        };
        throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
    }

    function __read(o, n) {
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
    }

    function __spread() {
        for (var ar = [], i = 0; i < arguments.length; i++)
            ar = ar.concat(__read(arguments[i]));
        return ar;
    }

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
    }(Clock));

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
    }(Clock));

    // yoinked from https://github.com/mapbox/tiny-sdf (BSD 2-Clause)
    // implements http://people.cs.uchicago.edu/~pff/papers/dt.pdf
    /**
     * Compute a one dimensional edt from the source data.
     * Returning distance will be squared.
     * Intended to be used internally in {@link edt2d}.
     *
     * @param data Data of the source
     * @param offset Offset of the source from beginning
     * @param stride Stride of the source
     * @param length Length of the source
     */
    function edt1d(data, offset, stride, length) {
        // index of rightmost parabola in lower envelope
        var k = 0;
        // locations of parabolas in lower envelope
        var v = new Float32Array(length);
        v[0] = 0.0;
        // locations of boundaries between parabolas
        var z = new Float32Array(length + 1);
        z[0] = -Infinity;
        z[1] = Infinity;
        // create a straight array of input data
        var f = new Float32Array(length);
        for (var q = 0; q < length; q++) {
            f[q] = data[offset + q * stride];
        }
        // compute lower envelope
        for (var q = 1; q < length; q++) {
            var s = 0.0;
            while (0 <= k) {
                s = (f[q] + q * q - f[v[k]] - v[k] * v[k]) / (2.0 * q - 2.0 * v[k]);
                if (s <= z[k]) {
                    k--;
                }
                else {
                    break;
                }
            }
            k++;
            v[k] = q;
            z[k] = s;
            z[k + 1] = Infinity;
        }
        k = 0;
        // fill in values of distance transform
        for (var q = 0; q < length; q++) {
            while (z[k + 1] < q) {
                k++;
            }
            var qSubVK = q - v[k];
            data[offset + q * stride] = f[v[k]] + qSubVK * qSubVK;
        }
    }
    /**
     * Compute a two dimensional edt from the source data.
     * Returning distance will be squared.
     *
     * @param data Data of the source.
     * @param width Width of the source.
     * @param height Height of the source.
     */
    function edt2d(data, width, height) {
        for (var x = 0; x < width; x++) {
            edt1d(data, x, width, height);
        }
        for (var y = 0; y < height; y++) {
            edt1d(data, y * width, 1, width);
        }
    }

    /**
     * `lerp`, or `mix`
     */
    function lerp(a, b, x) {
        return a + (b - a) * x;
    }
    /**
     * `clamp`
     */
    function clamp(x, l, h) {
        return Math.min(Math.max(x, l), h);
    }
    /**
     * `clamp( x, 0.0, 1.0 )`
     */
    function saturate(x) {
        return clamp(x, 0.0, 1.0);
    }
    /**
     * Transform a value from input range to output range.
     */
    function range(x, x0, x1, y0, y1) {
        return ((x - x0) * (y1 - y0) / (x1 - x0) + y0);
    }
    /**
     * `smoothstep` but not smooth
     */
    function linearstep(a, b, x) {
        return saturate((x - a) / (b - a));
    }
    /**
     * world famous `smoothstep` function
     */
    function smoothstep(a, b, x) {
        var t = linearstep(a, b, x);
        return t * t * (3.0 - 2.0 * t);
    }
    /**
     * `smoothstep` but more smooth
     */
    function smootherstep(a, b, x) {
        var t = linearstep(a, b, x);
        return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
    }
    /**
     * `smoothstep` but WAY more smooth
     */
    function smootheststep(a, b, x) {
        var t = linearstep(a, b, x);
        return t * t * t * t * (t * (t * (-20.0 * t + 70.0) - 84.0) + 35.0);
    }

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
            this.value = lerp(this.target, this.value, Math.exp(-this.factor * deltaTime));
            return this.value;
        };
        return ExpSmooth;
    }());

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

    /**
     * Useful for tap tempo
     * See also: {@link HistoryMeanCalculator}
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

    /**
     * Useful for fps calc
     * See also: {@link HistoryMeanCalculator}
     */
    var HistoryPercentileCalculator = /** @class */ (function () {
        function HistoryPercentileCalculator(length) {
            this.__history = [];
            this.__sorted = [];
            this.__index = 0;
            this.__length = length;
        }
        Object.defineProperty(HistoryPercentileCalculator.prototype, "median", {
            get: function () {
                return this.percentile(50.0);
            },
            enumerable: true,
            configurable: true
        });
        HistoryPercentileCalculator.prototype.percentile = function (percentile) {
            if (this.__history.length === 0) {
                return 0.0;
            }
            return this.__sorted[Math.round(percentile * 0.01 * (this.__history.length - 1))];
        };
        HistoryPercentileCalculator.prototype.reset = function () {
            this.__index = 0;
            this.__history = [];
            this.__sorted = [];
        };
        HistoryPercentileCalculator.prototype.push = function (value) {
            var prev = this.__history[this.__index];
            this.__history[this.__index] = value;
            this.__index = (this.__index + 1) % this.__length;
            // remove the prev from sorted array
            if (this.__sorted.length === this.__length) {
                var prevIndex = binarySearch(this.__sorted, prev);
                this.__sorted.splice(prevIndex, 1);
            }
            var index = binarySearch(this.__sorted, value);
            this.__sorted.splice(index, 0, value);
        };
        return HistoryPercentileCalculator;
    }());

    /**
     * @deprecated It's actually just a special case of {@link HistoryPercentileCalculator}
     */
    var HistoryMedianCalculator = /** @class */ (function (_super) {
        __extends(HistoryMedianCalculator, _super);
        function HistoryMedianCalculator(length) {
            var _this = _super.call(this, length) || this;
            console.warn('HistoryMedianCalculator: Deprecated. Use HistoryPercentileCalculator instead');
            return _this;
        }
        return HistoryMedianCalculator;
    }(HistoryPercentileCalculator));

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
            var p = new Quaternion([this.x, this.y, this.z, 0.0]);
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
    }(Vector));

    var rawIdentityQuaternion = [0.0, 0.0, 0.0, 1.0];
    /**
     * A Quaternion.
     */
    var Quaternion = /** @class */ (function () {
        function Quaternion(elements) {
            if (elements === void 0) { elements = rawIdentityQuaternion; }
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
                var x = new Vector3([1.0, 0.0, 0.0]).applyQuaternion(this);
                var y = new Vector3([0.0, 1.0, 0.0]).applyQuaternion(this);
                var z = new Vector3([0.0, 0.0, 1.0]).applyQuaternion(this);
                return new Matrix4([
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
                return new Quaternion(rawIdentityQuaternion);
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

    var rawIdentityMatrix4 = [
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
            if (v === void 0) { v = rawIdentityMatrix4; }
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
                return new Matrix4(rawIdentityMatrix4);
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
         * Generate a "LookAt" matrix.
         *
         * See also: {@link lookAtInverse}
         */
        Matrix4.lookAt = function (position, target, up, roll) {
            if (target === void 0) { target = new Vector3([0.0, 0.0, 0.0]); }
            if (up === void 0) { up = new Vector3([0.0, 1.0, 0.0]); }
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
         * Generate an inverse of "LookAt" matrix. Good for creating a view matrix.
         *
         * See also: {@link lookAt}
         */
        Matrix4.lookAtInverse = function (position, target, up, roll) {
            if (target === void 0) { target = new Vector3([0.0, 0.0, 0.0]); }
            if (up === void 0) { up = new Vector3([0.0, 1.0, 0.0]); }
            if (roll === void 0) { roll = 0.0; }
            var dir = position.sub(target).normalized;
            var sid = up.cross(dir).normalized;
            var top = dir.cross(sid);
            sid = sid.scale(Math.cos(roll)).add(top.scale(Math.sin(roll)));
            top = dir.cross(sid);
            return new Matrix4([
                sid.x, top.x, dir.x, 0.0,
                sid.y, top.y, dir.y, 0.0,
                sid.z, top.z, dir.z, 0.0,
                -sid.x * position.x - sid.y * position.y - sid.z * position.z,
                -top.x * position.x - top.y * position.y - top.z * position.z,
                -dir.x * position.x - dir.y * position.y - dir.z * position.z,
                1.0
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
            var sx = new Vector3([m[0], m[1], m[2]]).length;
            var sy = new Vector3([m[4], m[5], m[6]]).length;
            var sz = new Vector3([m[8], m[9], m[10]]).length;
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
                position: new Vector3([m[12], m[13], m[14]]),
                scale: new Vector3([sx, sy, sz]),
                rotation: Quaternion.fromMatrix(rotationMatrix)
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
    }(Vector));

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

    var TapTempo = /** @class */ (function () {
        function TapTempo() {
            this.__bpm = 0.0;
            this.__lastTap = 0.0;
            this.__lastBeat = 0.0;
            this.__lastTime = 0.0;
            this.__calc = new HistoryMeanCalculator(16);
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
                this.__bpm = 60.0 / (this.__calc.mean);
            }
            this.__lastTap = now;
            this.__lastTime = now;
            this.__lastBeat = 0.0;
        };
        return TapTempo;
    }());

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

    exports.CDS = CDS;
    exports.Clock = Clock;
    exports.ClockFrame = ClockFrame;
    exports.ClockRealtime = ClockRealtime;
    exports.ExpSmooth = ExpSmooth;
    exports.FMS_Cat = FMS_Cat;
    exports.FizzBuzz = FizzBuzz;
    exports.HistoryMeanCalculator = HistoryMeanCalculator;
    exports.HistoryMedianCalculator = HistoryMedianCalculator;
    exports.HistoryPercentileCalculator = HistoryPercentileCalculator;
    exports.Matrix4 = Matrix4;
    exports.Quaternion = Quaternion;
    exports.Swap = Swap;
    exports.TRIANGLE_STRIP_QUAD = TRIANGLE_STRIP_QUAD;
    exports.TRIANGLE_STRIP_QUAD_3D = TRIANGLE_STRIP_QUAD_3D;
    exports.TRIANGLE_STRIP_QUAD_NORMAL = TRIANGLE_STRIP_QUAD_NORMAL;
    exports.TRIANGLE_STRIP_QUAD_UV = TRIANGLE_STRIP_QUAD_UV;
    exports.TapTempo = TapTempo;
    exports.Vector = Vector;
    exports.Vector3 = Vector3;
    exports.Vector4 = Vector4;
    exports.Xorshift = Xorshift;
    exports.binarySearch = binarySearch;
    exports.clamp = clamp;
    exports.edt1d = edt1d;
    exports.edt2d = edt2d;
    exports.lerp = lerp;
    exports.linearstep = linearstep;
    exports.matrix2d = matrix2d;
    exports.range = range;
    exports.rawIdentityMatrix4 = rawIdentityMatrix4;
    exports.rawIdentityQuaternion = rawIdentityQuaternion;
    exports.saturate = saturate;
    exports.shuffleArray = shuffleArray;
    exports.smootherstep = smootherstep;
    exports.smootheststep = smootheststep;
    exports.smoothstep = smoothstep;
    exports.triIndexToLineIndex = triIndexToLineIndex;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm1zLWNhdC1leHBlcmltZW50YWwuanMiLCJzb3VyY2VzIjpbIi4uL3NyYy9hbGdvcml0aG0vYmluYXJ5U2VhcmNoLnRzIiwiLi4vc3JjL2FycmF5L2NvbnN0YW50cy50cyIsIi4uL3NyYy9hcnJheS91dGlscy50cyIsIi4uL3NyYy9DRFMvQ0RTLnRzIiwiLi4vc3JjL0Nsb2NrL0Nsb2NrLnRzIiwiLi4vbm9kZV9tb2R1bGVzL3RzbGliL3RzbGliLmVzNi5qcyIsIi4uL3NyYy9DbG9jay9DbG9ja0ZyYW1lLnRzIiwiLi4vc3JjL0Nsb2NrL0Nsb2NrUmVhbHRpbWUudHMiLCIuLi9zcmMvZWR0L2VkdC50cyIsIi4uL3NyYy9tYXRoL3V0aWxzLnRzIiwiLi4vc3JjL0V4cFNtb290aC9FeHBTbW9vdGgudHMiLCIuLi9zcmMvRml6ekJ1enovRml6ekJ1enoudHMiLCIuLi9zcmMvRk1TX0NhdC9GTVNfQ2F0LnRzIiwiLi4vc3JjL0hpc3RvcnlNZWFuQ2FsY3VsYXRvci9IaXN0b3J5TWVhbkNhbGN1bGF0b3IudHMiLCIuLi9zcmMvSGlzdG9yeU1lYW5DYWxjdWxhdG9yL0hpc3RvcnlQZXJjZW50aWxlQ2FsY3VsYXRvci50cyIsIi4uL3NyYy9IaXN0b3J5TWVhbkNhbGN1bGF0b3IvSGlzdG9yeU1lZGlhbkNhbGN1bGF0b3IudHMiLCIuLi9zcmMvbWF0aC9WZWN0b3IudHMiLCIuLi9zcmMvbWF0aC9WZWN0b3IzLnRzIiwiLi4vc3JjL21hdGgvUXVhdGVybmlvbi50cyIsIi4uL3NyYy9tYXRoL01hdHJpeDQudHMiLCIuLi9zcmMvbWF0aC9WZWN0b3I0LnRzIiwiLi4vc3JjL1N3YXAvU3dhcC50cyIsIi4uL3NyYy9UYXBUZW1wby9UYXBUZW1wby50cyIsIi4uL3NyYy9Yb3JzaGlmdC9Yb3JzaGlmdC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyB5b2lua2VkIGZyb20gaHR0cHM6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMTM0NDUwMC9lZmZpY2llbnQtd2F5LXRvLWluc2VydC1hLW51bWJlci1pbnRvLWEtc29ydGVkLWFycmF5LW9mLW51bWJlcnNcblxuLyoqXG4gKiBMb29rIGZvciBhbiBpbmRleCBmcm9tIGEgc29ydGVkIGxpc3QgdXNpbmcgYmluYXJ5IHNlYXJjaC5cbiAqXG4gKiBJZiB5b3UgZG9uJ3QgcHJvdmlkZSBhIGNvbXBhcmUgZnVuY3Rpb24sIGl0IHdpbGwgbG9vayBmb3IgKip0aGUgZmlyc3Qgc2FtZSB2YWx1ZSoqIGl0IGNhbiBmaW5kLlxuICogSWYgaXQgY2Fubm90IGZpbmQgYW4gZXhhY3RseSBtYXRjaGluZyB2YWx1ZSwgaXQgY2FuIHJldHVybiBOIHdoZXJlIHRoZSBsZW5ndGggb2YgZ2l2ZW4gYXJyYXkgaXMgTi5cbiAqXG4gKiBAcGFyYW0gYXJyYXkgQSBzb3J0ZWQgYXJyYXlcbiAqIEBwYXJhbSBjb21wYXJlIE1ha2UgdGhpcyBmdW5jdGlvbiByZXR1cm4gYGZhbHNlYCBpZiB5b3Ugd2FudCB0byBwb2ludCByaWdodCBzaWRlIG9mIGdpdmVuIGVsZW1lbnQsIGB0cnVlYCBpZiB5b3Ugd2FudCB0byBwb2ludCBsZWZ0IHNpZGUgb2YgZ2l2ZW4gZWxlbWVudC5cbiAqIEByZXR1cm5zIEFuIGluZGV4IGZvdW5kXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBiaW5hcnlTZWFyY2g8VD4oIGFycmF5OiBBcnJheUxpa2U8VD4sIGVsZW1lbnQ6IFQgKTogbnVtYmVyO1xuZXhwb3J0IGZ1bmN0aW9uIGJpbmFyeVNlYXJjaDxUPiggYXJyYXk6IEFycmF5TGlrZTxUPiwgY29tcGFyZTogKCBlbGVtZW50OiBUICkgPT4gYm9vbGVhbiApOiBudW1iZXI7XG5leHBvcnQgZnVuY3Rpb24gYmluYXJ5U2VhcmNoPFQ+KFxuICBhcnJheTogQXJyYXlMaWtlPFQ+LFxuICBlbGVtZW50T3JDb21wYXJlOiBUIHwgKCAoIGVsZW1lbnQ6IFQgKSA9PiBib29sZWFuICksXG4pOiBudW1iZXIge1xuICBpZiAoIHR5cGVvZiBlbGVtZW50T3JDb21wYXJlICE9PSAnZnVuY3Rpb24nICkge1xuICAgIHJldHVybiBiaW5hcnlTZWFyY2goIGFycmF5LCAoIGVsZW1lbnQgKSA9PiAoIGVsZW1lbnQgPCBlbGVtZW50T3JDb21wYXJlICkgKTtcbiAgfVxuICBjb25zdCBjb21wYXJlID0gZWxlbWVudE9yQ29tcGFyZSBhcyAoIGVsZW1lbnQ6IFQgKSA9PiBib29sZWFuO1xuXG4gIGxldCBzdGFydCA9IDA7XG4gIGxldCBlbmQgPSBhcnJheS5sZW5ndGg7XG5cbiAgd2hpbGUgKCBzdGFydCA8IGVuZCApIHtcbiAgICBjb25zdCBjZW50ZXIgPSAoIHN0YXJ0ICsgZW5kICkgPj4gMTtcbiAgICBjb25zdCBjZW50ZXJFbGVtZW50ID0gYXJyYXlbIGNlbnRlciBdO1xuXG4gICAgY29uc3QgY29tcGFyZVJlc3VsdCA9IGNvbXBhcmUoIGNlbnRlckVsZW1lbnQgKTtcblxuICAgIGlmICggY29tcGFyZVJlc3VsdCApIHtcbiAgICAgIHN0YXJ0ID0gY2VudGVyICsgMTtcbiAgICB9IGVsc2Uge1xuICAgICAgZW5kID0gY2VudGVyO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBzdGFydDtcbn1cbiIsIi8qKlxuICogYFsgLTEsIC0xLCAxLCAtMSwgLTEsIDEsIDEsIDEgXWBcbiAqL1xuZXhwb3J0IGNvbnN0IFRSSUFOR0xFX1NUUklQX1FVQUQgPSBbIC0xLCAtMSwgMSwgLTEsIC0xLCAxLCAxLCAxIF07XG5cbi8qKlxuICogYFsgLTEsIC0xLCAwLCAxLCAtMSwgMCwgLTEsIDEsIDAsIDEsIDEsIDAgXWBcbiAqL1xuZXhwb3J0IGNvbnN0IFRSSUFOR0xFX1NUUklQX1FVQURfM0QgPSBbIC0xLCAtMSwgMCwgMSwgLTEsIDAsIC0xLCAxLCAwLCAxLCAxLCAwIF07XG5cbi8qKlxuICogYFsgMCwgMCwgMSwgMCwgMCwgMSwgMCwgMCwgMSwgMCwgMCwgMSBdYFxuICovXG5leHBvcnQgY29uc3QgVFJJQU5HTEVfU1RSSVBfUVVBRF9OT1JNQUwgPSBbIDAsIDAsIDEsIDAsIDAsIDEsIDAsIDAsIDEsIDAsIDAsIDEgXTtcblxuLyoqXG4gKiBgWyAwLCAwLCAxLCAwLCAwLCAxLCAxLCAxIF1gXG4gKi9cbmV4cG9ydCBjb25zdCBUUklBTkdMRV9TVFJJUF9RVUFEX1VWID0gWyAwLCAwLCAxLCAwLCAwLCAxLCAxLCAxIF07XG4iLCIvKipcbiAqIFNodWZmbGUgZ2l2ZW4gYGFycmF5YCB1c2luZyBnaXZlbiBgZGljZWAgUk5HLiAqKkRlc3RydWN0aXZlKiouXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzaHVmZmxlQXJyYXk8VD4oIGFycmF5OiBUW10sIGRpY2U/OiAoKSA9PiBudW1iZXIgKTogVFtdIHtcbiAgY29uc3QgZiA9IGRpY2UgPyBkaWNlIDogKCkgPT4gTWF0aC5yYW5kb20oKTtcbiAgZm9yICggbGV0IGkgPSAwOyBpIDwgYXJyYXkubGVuZ3RoIC0gMTsgaSArKyApIHtcbiAgICBjb25zdCBpciA9IGkgKyBNYXRoLmZsb29yKCBmKCkgKiAoIGFycmF5Lmxlbmd0aCAtIGkgKSApO1xuICAgIGNvbnN0IHRlbXAgPSBhcnJheVsgaXIgXTtcbiAgICBhcnJheVsgaXIgXSA9IGFycmF5WyBpIF07XG4gICAgYXJyYXlbIGkgXSA9IHRlbXA7XG4gIH1cbiAgcmV0dXJuIGFycmF5O1xufVxuXG4vKipcbiAqIEkgbGlrZSB3aXJlZnJhbWVcbiAqXG4gKiBgdHJpSW5kZXhUb0xpbmVJbmRleCggWyAwLCAxLCAyLCA1LCA2LCA3IF0gKWAgLT4gYFsgMCwgMSwgMSwgMiwgMiwgMCwgNSwgNiwgNiwgNywgNywgNSBdYFxuICovXG5leHBvcnQgZnVuY3Rpb24gdHJpSW5kZXhUb0xpbmVJbmRleDxUPiggYXJyYXk6IFRbXSApOiBUW10ge1xuICBjb25zdCByZXQ6IFRbXSA9IFtdO1xuICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBhcnJheS5sZW5ndGggLyAzOyBpICsrICkge1xuICAgIGNvbnN0IGhlYWQgPSBpICogMztcbiAgICByZXQucHVzaChcbiAgICAgIGFycmF5WyBoZWFkICAgICBdLCBhcnJheVsgaGVhZCArIDEgXSxcbiAgICAgIGFycmF5WyBoZWFkICsgMSBdLCBhcnJheVsgaGVhZCArIDIgXSxcbiAgICAgIGFycmF5WyBoZWFkICsgMiBdLCBhcnJheVsgaGVhZCAgICAgXVxuICAgICk7XG4gIH1cbiAgcmV0dXJuIHJldDtcbn1cblxuLyoqXG4gKiBgbWF0cml4MmQoIDMsIDIgKWAgLT4gYFsgMCwgMCwgMCwgMSwgMCwgMiwgMSwgMCwgMSwgMSwgMSwgMiBdYFxuICovXG5leHBvcnQgZnVuY3Rpb24gbWF0cml4MmQoIHc6IG51bWJlciwgaDogbnVtYmVyICk6IG51bWJlcltdIHtcbiAgY29uc3QgYXJyOiBudW1iZXJbXSA9IFtdO1xuICBmb3IgKCBsZXQgaXkgPSAwOyBpeSA8IGg7IGl5ICsrICkge1xuICAgIGZvciAoIGxldCBpeCA9IDA7IGl4IDwgdzsgaXggKysgKSB7XG4gICAgICBhcnIucHVzaCggaXgsIGl5ICk7XG4gICAgfVxuICB9XG4gIHJldHVybiBhcnI7XG59XG4iLCIvKipcbiAqIENyaXRpY2FsbHkgRGFtcGVkIFNwcmluZ1xuICpcbiAqIFNob3V0b3V0cyB0byBLZWlqaXJvIFRha2FoYXNoaVxuICovXG5leHBvcnQgY2xhc3MgQ0RTIHtcbiAgcHVibGljIGZhY3RvciA9IDEwMC4wO1xuICBwdWJsaWMgcmF0aW8gPSAxLjA7XG4gIHB1YmxpYyB2ZWxvY2l0eSA9IDAuMDtcbiAgcHVibGljIHZhbHVlID0gMC4wO1xuICBwdWJsaWMgdGFyZ2V0ID0gMC4wO1xuXG4gIHB1YmxpYyB1cGRhdGUoIGRlbHRhVGltZTogbnVtYmVyICk6IG51bWJlciB7XG4gICAgdGhpcy52ZWxvY2l0eSArPSAoXG4gICAgICAtdGhpcy5mYWN0b3IgKiAoIHRoaXMudmFsdWUgLSB0aGlzLnRhcmdldCApXG4gICAgICAtIDIuMCAqIHRoaXMudmVsb2NpdHkgKiBNYXRoLnNxcnQoIHRoaXMuZmFjdG9yICkgKiB0aGlzLnJhdGlvXG4gICAgKSAqIGRlbHRhVGltZTtcbiAgICB0aGlzLnZhbHVlICs9IHRoaXMudmVsb2NpdHkgKiBkZWx0YVRpbWU7XG4gICAgcmV0dXJuIHRoaXMudmFsdWU7XG4gIH1cbn1cbiIsIi8qKlxuICogQ2xhc3MgdGhhdCBkZWFscyB3aXRoIHRpbWUuXG4gKiBJbiB0aGlzIGJhc2UgY2xhc3MsIHlvdSBuZWVkIHRvIHNldCB0aW1lIG1hbnVhbGx5IGZyb20gYEF1dG9tYXRvbi51cGRhdGUoKWAuXG4gKiBCZXN0IGZvciBzeW5jIHdpdGggZXh0ZXJuYWwgY2xvY2sgc3R1ZmYuXG4gKi9cbmV4cG9ydCBjbGFzcyBDbG9jayB7XG4gIC8qKlxuICAgKiBJdHMgY3VycmVudCB0aW1lLlxuICAgKi9cbiAgcHJvdGVjdGVkIF9fdGltZSA9IDAuMDtcblxuICAvKipcbiAgICogSXRzIGRlbHRhVGltZSBvZiBsYXN0IHVwZGF0ZS5cbiAgICovXG4gIHByb3RlY3RlZCBfX2RlbHRhVGltZSA9IDAuMDtcblxuICAvKipcbiAgICogV2hldGhlciBpdHMgY3VycmVudGx5IHBsYXlpbmcgb3Igbm90LlxuICAgKi9cbiAgcHJvdGVjdGVkIF9faXNQbGF5aW5nID0gZmFsc2U7XG5cbiAgLyoqXG4gICAqIEl0cyBjdXJyZW50IHRpbWUuXG4gICAqL1xuICBwdWJsaWMgZ2V0IHRpbWUoKTogbnVtYmVyIHsgcmV0dXJuIHRoaXMuX190aW1lOyB9XG5cbiAgLyoqXG4gICAqIEl0cyBkZWx0YVRpbWUgb2YgbGFzdCB1cGRhdGUuXG4gICAqL1xuICBwdWJsaWMgZ2V0IGRlbHRhVGltZSgpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5fX2RlbHRhVGltZTsgfVxuXG4gIC8qKlxuICAgKiBXaGV0aGVyIGl0cyBjdXJyZW50bHkgcGxheWluZyBvciBub3QuXG4gICAqL1xuICBwdWJsaWMgZ2V0IGlzUGxheWluZygpOiBib29sZWFuIHsgcmV0dXJuIHRoaXMuX19pc1BsYXlpbmc7IH1cblxuICAvKipcbiAgICogVXBkYXRlIHRoZSBjbG9jay5cbiAgICogQHBhcmFtIHRpbWUgVGltZS4gWW91IG5lZWQgdG8gc2V0IG1hbnVhbGx5IHdoZW4geW91IGFyZSB1c2luZyBtYW51YWwgQ2xvY2tcbiAgICovXG4gIHB1YmxpYyB1cGRhdGUoIHRpbWU/OiBudW1iZXIgKTogdm9pZCB7XG4gICAgY29uc3QgcHJldlRpbWUgPSB0aGlzLl9fdGltZTtcbiAgICB0aGlzLl9fdGltZSA9IHRpbWUgfHwgMC4wO1xuICAgIHRoaXMuX19kZWx0YVRpbWUgPSB0aGlzLl9fdGltZSAtIHByZXZUaW1lO1xuICB9XG5cbiAgLyoqXG4gICAqIFN0YXJ0IHRoZSBjbG9jay5cbiAgICovXG4gIHB1YmxpYyBwbGF5KCk6IHZvaWQge1xuICAgIHRoaXMuX19pc1BsYXlpbmcgPSB0cnVlO1xuICB9XG5cbiAgLyoqXG4gICAqIFN0b3AgdGhlIGNsb2NrLlxuICAgKi9cbiAgcHVibGljIHBhdXNlKCk6IHZvaWQge1xuICAgIHRoaXMuX19pc1BsYXlpbmcgPSBmYWxzZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgdGhlIHRpbWUgbWFudWFsbHkuXG4gICAqIEBwYXJhbSB0aW1lIFRpbWVcbiAgICovXG4gIHB1YmxpYyBzZXRUaW1lKCB0aW1lOiBudW1iZXIgKTogdm9pZCB7XG4gICAgdGhpcy5fX3RpbWUgPSB0aW1lO1xuICB9XG59XG4iLCIvKiEgKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcclxuQ29weXJpZ2h0IChjKSBNaWNyb3NvZnQgQ29ycG9yYXRpb24uXHJcblxyXG5QZXJtaXNzaW9uIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBhbmQvb3IgZGlzdHJpYnV0ZSB0aGlzIHNvZnR3YXJlIGZvciBhbnlcclxucHVycG9zZSB3aXRoIG9yIHdpdGhvdXQgZmVlIGlzIGhlcmVieSBncmFudGVkLlxyXG5cclxuVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiBBTkQgVEhFIEFVVEhPUiBESVNDTEFJTVMgQUxMIFdBUlJBTlRJRVMgV0lUSFxyXG5SRUdBUkQgVE8gVEhJUyBTT0ZUV0FSRSBJTkNMVURJTkcgQUxMIElNUExJRUQgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFlcclxuQU5EIEZJVE5FU1MuIElOIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1IgQkUgTElBQkxFIEZPUiBBTlkgU1BFQ0lBTCwgRElSRUNULFxyXG5JTkRJUkVDVCwgT1IgQ09OU0VRVUVOVElBTCBEQU1BR0VTIE9SIEFOWSBEQU1BR0VTIFdIQVRTT0VWRVIgUkVTVUxUSU5HIEZST01cclxuTE9TUyBPRiBVU0UsIERBVEEgT1IgUFJPRklUUywgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIE5FR0xJR0VOQ0UgT1JcclxuT1RIRVIgVE9SVElPVVMgQUNUSU9OLCBBUklTSU5HIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFVTRSBPUlxyXG5QRVJGT1JNQU5DRSBPRiBUSElTIFNPRlRXQVJFLlxyXG4qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiAqL1xyXG4vKiBnbG9iYWwgUmVmbGVjdCwgUHJvbWlzZSAqL1xyXG5cclxudmFyIGV4dGVuZFN0YXRpY3MgPSBmdW5jdGlvbihkLCBiKSB7XHJcbiAgICBleHRlbmRTdGF0aWNzID0gT2JqZWN0LnNldFByb3RvdHlwZU9mIHx8XHJcbiAgICAgICAgKHsgX19wcm90b19fOiBbXSB9IGluc3RhbmNlb2YgQXJyYXkgJiYgZnVuY3Rpb24gKGQsIGIpIHsgZC5fX3Byb3RvX18gPSBiOyB9KSB8fFxyXG4gICAgICAgIGZ1bmN0aW9uIChkLCBiKSB7IGZvciAodmFyIHAgaW4gYikgaWYgKGIuaGFzT3duUHJvcGVydHkocCkpIGRbcF0gPSBiW3BdOyB9O1xyXG4gICAgcmV0dXJuIGV4dGVuZFN0YXRpY3MoZCwgYik7XHJcbn07XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19leHRlbmRzKGQsIGIpIHtcclxuICAgIGV4dGVuZFN0YXRpY3MoZCwgYik7XHJcbiAgICBmdW5jdGlvbiBfXygpIHsgdGhpcy5jb25zdHJ1Y3RvciA9IGQ7IH1cclxuICAgIGQucHJvdG90eXBlID0gYiA9PT0gbnVsbCA/IE9iamVjdC5jcmVhdGUoYikgOiAoX18ucHJvdG90eXBlID0gYi5wcm90b3R5cGUsIG5ldyBfXygpKTtcclxufVxyXG5cclxuZXhwb3J0IHZhciBfX2Fzc2lnbiA9IGZ1bmN0aW9uKCkge1xyXG4gICAgX19hc3NpZ24gPSBPYmplY3QuYXNzaWduIHx8IGZ1bmN0aW9uIF9fYXNzaWduKHQpIHtcclxuICAgICAgICBmb3IgKHZhciBzLCBpID0gMSwgbiA9IGFyZ3VtZW50cy5sZW5ndGg7IGkgPCBuOyBpKyspIHtcclxuICAgICAgICAgICAgcyA9IGFyZ3VtZW50c1tpXTtcclxuICAgICAgICAgICAgZm9yICh2YXIgcCBpbiBzKSBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHMsIHApKSB0W3BdID0gc1twXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHQ7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gX19hc3NpZ24uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fcmVzdChzLCBlKSB7XHJcbiAgICB2YXIgdCA9IHt9O1xyXG4gICAgZm9yICh2YXIgcCBpbiBzKSBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHMsIHApICYmIGUuaW5kZXhPZihwKSA8IDApXHJcbiAgICAgICAgdFtwXSA9IHNbcF07XHJcbiAgICBpZiAocyAhPSBudWxsICYmIHR5cGVvZiBPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzID09PSBcImZ1bmN0aW9uXCIpXHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDAsIHAgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzKHMpOyBpIDwgcC5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBpZiAoZS5pbmRleE9mKHBbaV0pIDwgMCAmJiBPYmplY3QucHJvdG90eXBlLnByb3BlcnR5SXNFbnVtZXJhYmxlLmNhbGwocywgcFtpXSkpXHJcbiAgICAgICAgICAgICAgICB0W3BbaV1dID0gc1twW2ldXTtcclxuICAgICAgICB9XHJcbiAgICByZXR1cm4gdDtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fZGVjb3JhdGUoZGVjb3JhdG9ycywgdGFyZ2V0LCBrZXksIGRlc2MpIHtcclxuICAgIHZhciBjID0gYXJndW1lbnRzLmxlbmd0aCwgciA9IGMgPCAzID8gdGFyZ2V0IDogZGVzYyA9PT0gbnVsbCA/IGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHRhcmdldCwga2V5KSA6IGRlc2MsIGQ7XHJcbiAgICBpZiAodHlwZW9mIFJlZmxlY3QgPT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIFJlZmxlY3QuZGVjb3JhdGUgPT09IFwiZnVuY3Rpb25cIikgciA9IFJlZmxlY3QuZGVjb3JhdGUoZGVjb3JhdG9ycywgdGFyZ2V0LCBrZXksIGRlc2MpO1xyXG4gICAgZWxzZSBmb3IgKHZhciBpID0gZGVjb3JhdG9ycy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkgaWYgKGQgPSBkZWNvcmF0b3JzW2ldKSByID0gKGMgPCAzID8gZChyKSA6IGMgPiAzID8gZCh0YXJnZXQsIGtleSwgcikgOiBkKHRhcmdldCwga2V5KSkgfHwgcjtcclxuICAgIHJldHVybiBjID4gMyAmJiByICYmIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGtleSwgciksIHI7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX3BhcmFtKHBhcmFtSW5kZXgsIGRlY29yYXRvcikge1xyXG4gICAgcmV0dXJuIGZ1bmN0aW9uICh0YXJnZXQsIGtleSkgeyBkZWNvcmF0b3IodGFyZ2V0LCBrZXksIHBhcmFtSW5kZXgpOyB9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX21ldGFkYXRhKG1ldGFkYXRhS2V5LCBtZXRhZGF0YVZhbHVlKSB7XHJcbiAgICBpZiAodHlwZW9mIFJlZmxlY3QgPT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIFJlZmxlY3QubWV0YWRhdGEgPT09IFwiZnVuY3Rpb25cIikgcmV0dXJuIFJlZmxlY3QubWV0YWRhdGEobWV0YWRhdGFLZXksIG1ldGFkYXRhVmFsdWUpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19hd2FpdGVyKHRoaXNBcmcsIF9hcmd1bWVudHMsIFAsIGdlbmVyYXRvcikge1xyXG4gICAgZnVuY3Rpb24gYWRvcHQodmFsdWUpIHsgcmV0dXJuIHZhbHVlIGluc3RhbmNlb2YgUCA/IHZhbHVlIDogbmV3IFAoZnVuY3Rpb24gKHJlc29sdmUpIHsgcmVzb2x2ZSh2YWx1ZSk7IH0pOyB9XHJcbiAgICByZXR1cm4gbmV3IChQIHx8IChQID0gUHJvbWlzZSkpKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcclxuICAgICAgICBmdW5jdGlvbiBmdWxmaWxsZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3IubmV4dCh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XHJcbiAgICAgICAgZnVuY3Rpb24gcmVqZWN0ZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3JbXCJ0aHJvd1wiXSh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XHJcbiAgICAgICAgZnVuY3Rpb24gc3RlcChyZXN1bHQpIHsgcmVzdWx0LmRvbmUgPyByZXNvbHZlKHJlc3VsdC52YWx1ZSkgOiBhZG9wdChyZXN1bHQudmFsdWUpLnRoZW4oZnVsZmlsbGVkLCByZWplY3RlZCk7IH1cclxuICAgICAgICBzdGVwKChnZW5lcmF0b3IgPSBnZW5lcmF0b3IuYXBwbHkodGhpc0FyZywgX2FyZ3VtZW50cyB8fCBbXSkpLm5leHQoKSk7XHJcbiAgICB9KTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fZ2VuZXJhdG9yKHRoaXNBcmcsIGJvZHkpIHtcclxuICAgIHZhciBfID0geyBsYWJlbDogMCwgc2VudDogZnVuY3Rpb24oKSB7IGlmICh0WzBdICYgMSkgdGhyb3cgdFsxXTsgcmV0dXJuIHRbMV07IH0sIHRyeXM6IFtdLCBvcHM6IFtdIH0sIGYsIHksIHQsIGc7XHJcbiAgICByZXR1cm4gZyA9IHsgbmV4dDogdmVyYigwKSwgXCJ0aHJvd1wiOiB2ZXJiKDEpLCBcInJldHVyblwiOiB2ZXJiKDIpIH0sIHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiAoZ1tTeW1ib2wuaXRlcmF0b3JdID0gZnVuY3Rpb24oKSB7IHJldHVybiB0aGlzOyB9KSwgZztcclxuICAgIGZ1bmN0aW9uIHZlcmIobikgeyByZXR1cm4gZnVuY3Rpb24gKHYpIHsgcmV0dXJuIHN0ZXAoW24sIHZdKTsgfTsgfVxyXG4gICAgZnVuY3Rpb24gc3RlcChvcCkge1xyXG4gICAgICAgIGlmIChmKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiR2VuZXJhdG9yIGlzIGFscmVhZHkgZXhlY3V0aW5nLlwiKTtcclxuICAgICAgICB3aGlsZSAoXykgdHJ5IHtcclxuICAgICAgICAgICAgaWYgKGYgPSAxLCB5ICYmICh0ID0gb3BbMF0gJiAyID8geVtcInJldHVyblwiXSA6IG9wWzBdID8geVtcInRocm93XCJdIHx8ICgodCA9IHlbXCJyZXR1cm5cIl0pICYmIHQuY2FsbCh5KSwgMCkgOiB5Lm5leHQpICYmICEodCA9IHQuY2FsbCh5LCBvcFsxXSkpLmRvbmUpIHJldHVybiB0O1xyXG4gICAgICAgICAgICBpZiAoeSA9IDAsIHQpIG9wID0gW29wWzBdICYgMiwgdC52YWx1ZV07XHJcbiAgICAgICAgICAgIHN3aXRjaCAob3BbMF0pIHtcclxuICAgICAgICAgICAgICAgIGNhc2UgMDogY2FzZSAxOiB0ID0gb3A7IGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSA0OiBfLmxhYmVsKys7IHJldHVybiB7IHZhbHVlOiBvcFsxXSwgZG9uZTogZmFsc2UgfTtcclxuICAgICAgICAgICAgICAgIGNhc2UgNTogXy5sYWJlbCsrOyB5ID0gb3BbMV07IG9wID0gWzBdOyBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgIGNhc2UgNzogb3AgPSBfLm9wcy5wb3AoKTsgXy50cnlzLnBvcCgpOyBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCEodCA9IF8udHJ5cywgdCA9IHQubGVuZ3RoID4gMCAmJiB0W3QubGVuZ3RoIC0gMV0pICYmIChvcFswXSA9PT0gNiB8fCBvcFswXSA9PT0gMikpIHsgXyA9IDA7IGNvbnRpbnVlOyB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG9wWzBdID09PSAzICYmICghdCB8fCAob3BbMV0gPiB0WzBdICYmIG9wWzFdIDwgdFszXSkpKSB7IF8ubGFiZWwgPSBvcFsxXTsgYnJlYWs7IH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAob3BbMF0gPT09IDYgJiYgXy5sYWJlbCA8IHRbMV0pIHsgXy5sYWJlbCA9IHRbMV07IHQgPSBvcDsgYnJlYWs7IH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAodCAmJiBfLmxhYmVsIDwgdFsyXSkgeyBfLmxhYmVsID0gdFsyXTsgXy5vcHMucHVzaChvcCk7IGJyZWFrOyB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRbMl0pIF8ub3BzLnBvcCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIF8udHJ5cy5wb3AoKTsgY29udGludWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgb3AgPSBib2R5LmNhbGwodGhpc0FyZywgXyk7XHJcbiAgICAgICAgfSBjYXRjaCAoZSkgeyBvcCA9IFs2LCBlXTsgeSA9IDA7IH0gZmluYWxseSB7IGYgPSB0ID0gMDsgfVxyXG4gICAgICAgIGlmIChvcFswXSAmIDUpIHRocm93IG9wWzFdOyByZXR1cm4geyB2YWx1ZTogb3BbMF0gPyBvcFsxXSA6IHZvaWQgMCwgZG9uZTogdHJ1ZSB9O1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgdmFyIF9fY3JlYXRlQmluZGluZyA9IE9iamVjdC5jcmVhdGUgPyAoZnVuY3Rpb24obywgbSwgaywgazIpIHtcclxuICAgIGlmIChrMiA9PT0gdW5kZWZpbmVkKSBrMiA9IGs7XHJcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkobywgazIsIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBmdW5jdGlvbigpIHsgcmV0dXJuIG1ba107IH0gfSk7XHJcbn0pIDogKGZ1bmN0aW9uKG8sIG0sIGssIGsyKSB7XHJcbiAgICBpZiAoazIgPT09IHVuZGVmaW5lZCkgazIgPSBrO1xyXG4gICAgb1trMl0gPSBtW2tdO1xyXG59KTtcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2V4cG9ydFN0YXIobSwgZXhwb3J0cykge1xyXG4gICAgZm9yICh2YXIgcCBpbiBtKSBpZiAocCAhPT0gXCJkZWZhdWx0XCIgJiYgIWV4cG9ydHMuaGFzT3duUHJvcGVydHkocCkpIF9fY3JlYXRlQmluZGluZyhleHBvcnRzLCBtLCBwKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fdmFsdWVzKG8pIHtcclxuICAgIHZhciBzID0gdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIFN5bWJvbC5pdGVyYXRvciwgbSA9IHMgJiYgb1tzXSwgaSA9IDA7XHJcbiAgICBpZiAobSkgcmV0dXJuIG0uY2FsbChvKTtcclxuICAgIGlmIChvICYmIHR5cGVvZiBvLmxlbmd0aCA9PT0gXCJudW1iZXJcIikgcmV0dXJuIHtcclxuICAgICAgICBuZXh0OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGlmIChvICYmIGkgPj0gby5sZW5ndGgpIG8gPSB2b2lkIDA7XHJcbiAgICAgICAgICAgIHJldHVybiB7IHZhbHVlOiBvICYmIG9baSsrXSwgZG9uZTogIW8gfTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihzID8gXCJPYmplY3QgaXMgbm90IGl0ZXJhYmxlLlwiIDogXCJTeW1ib2wuaXRlcmF0b3IgaXMgbm90IGRlZmluZWQuXCIpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19yZWFkKG8sIG4pIHtcclxuICAgIHZhciBtID0gdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIG9bU3ltYm9sLml0ZXJhdG9yXTtcclxuICAgIGlmICghbSkgcmV0dXJuIG87XHJcbiAgICB2YXIgaSA9IG0uY2FsbChvKSwgciwgYXIgPSBbXSwgZTtcclxuICAgIHRyeSB7XHJcbiAgICAgICAgd2hpbGUgKChuID09PSB2b2lkIDAgfHwgbi0tID4gMCkgJiYgIShyID0gaS5uZXh0KCkpLmRvbmUpIGFyLnB1c2goci52YWx1ZSk7XHJcbiAgICB9XHJcbiAgICBjYXRjaCAoZXJyb3IpIHsgZSA9IHsgZXJyb3I6IGVycm9yIH07IH1cclxuICAgIGZpbmFsbHkge1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGlmIChyICYmICFyLmRvbmUgJiYgKG0gPSBpW1wicmV0dXJuXCJdKSkgbS5jYWxsKGkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBmaW5hbGx5IHsgaWYgKGUpIHRocm93IGUuZXJyb3I7IH1cclxuICAgIH1cclxuICAgIHJldHVybiBhcjtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fc3ByZWFkKCkge1xyXG4gICAgZm9yICh2YXIgYXIgPSBbXSwgaSA9IDA7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspXHJcbiAgICAgICAgYXIgPSBhci5jb25jYXQoX19yZWFkKGFyZ3VtZW50c1tpXSkpO1xyXG4gICAgcmV0dXJuIGFyO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19zcHJlYWRBcnJheXMoKSB7XHJcbiAgICBmb3IgKHZhciBzID0gMCwgaSA9IDAsIGlsID0gYXJndW1lbnRzLmxlbmd0aDsgaSA8IGlsOyBpKyspIHMgKz0gYXJndW1lbnRzW2ldLmxlbmd0aDtcclxuICAgIGZvciAodmFyIHIgPSBBcnJheShzKSwgayA9IDAsIGkgPSAwOyBpIDwgaWw7IGkrKylcclxuICAgICAgICBmb3IgKHZhciBhID0gYXJndW1lbnRzW2ldLCBqID0gMCwgamwgPSBhLmxlbmd0aDsgaiA8IGpsOyBqKyssIGsrKylcclxuICAgICAgICAgICAgcltrXSA9IGFbal07XHJcbiAgICByZXR1cm4gcjtcclxufTtcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2F3YWl0KHYpIHtcclxuICAgIHJldHVybiB0aGlzIGluc3RhbmNlb2YgX19hd2FpdCA/ICh0aGlzLnYgPSB2LCB0aGlzKSA6IG5ldyBfX2F3YWl0KHYpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19hc3luY0dlbmVyYXRvcih0aGlzQXJnLCBfYXJndW1lbnRzLCBnZW5lcmF0b3IpIHtcclxuICAgIGlmICghU3ltYm9sLmFzeW5jSXRlcmF0b3IpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJTeW1ib2wuYXN5bmNJdGVyYXRvciBpcyBub3QgZGVmaW5lZC5cIik7XHJcbiAgICB2YXIgZyA9IGdlbmVyYXRvci5hcHBseSh0aGlzQXJnLCBfYXJndW1lbnRzIHx8IFtdKSwgaSwgcSA9IFtdO1xyXG4gICAgcmV0dXJuIGkgPSB7fSwgdmVyYihcIm5leHRcIiksIHZlcmIoXCJ0aHJvd1wiKSwgdmVyYihcInJldHVyblwiKSwgaVtTeW1ib2wuYXN5bmNJdGVyYXRvcl0gPSBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzOyB9LCBpO1xyXG4gICAgZnVuY3Rpb24gdmVyYihuKSB7IGlmIChnW25dKSBpW25dID0gZnVuY3Rpb24gKHYpIHsgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChhLCBiKSB7IHEucHVzaChbbiwgdiwgYSwgYl0pID4gMSB8fCByZXN1bWUobiwgdik7IH0pOyB9OyB9XHJcbiAgICBmdW5jdGlvbiByZXN1bWUobiwgdikgeyB0cnkgeyBzdGVwKGdbbl0odikpOyB9IGNhdGNoIChlKSB7IHNldHRsZShxWzBdWzNdLCBlKTsgfSB9XHJcbiAgICBmdW5jdGlvbiBzdGVwKHIpIHsgci52YWx1ZSBpbnN0YW5jZW9mIF9fYXdhaXQgPyBQcm9taXNlLnJlc29sdmUoci52YWx1ZS52KS50aGVuKGZ1bGZpbGwsIHJlamVjdCkgOiBzZXR0bGUocVswXVsyXSwgcik7IH1cclxuICAgIGZ1bmN0aW9uIGZ1bGZpbGwodmFsdWUpIHsgcmVzdW1lKFwibmV4dFwiLCB2YWx1ZSk7IH1cclxuICAgIGZ1bmN0aW9uIHJlamVjdCh2YWx1ZSkgeyByZXN1bWUoXCJ0aHJvd1wiLCB2YWx1ZSk7IH1cclxuICAgIGZ1bmN0aW9uIHNldHRsZShmLCB2KSB7IGlmIChmKHYpLCBxLnNoaWZ0KCksIHEubGVuZ3RoKSByZXN1bWUocVswXVswXSwgcVswXVsxXSk7IH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fYXN5bmNEZWxlZ2F0b3Iobykge1xyXG4gICAgdmFyIGksIHA7XHJcbiAgICByZXR1cm4gaSA9IHt9LCB2ZXJiKFwibmV4dFwiKSwgdmVyYihcInRocm93XCIsIGZ1bmN0aW9uIChlKSB7IHRocm93IGU7IH0pLCB2ZXJiKFwicmV0dXJuXCIpLCBpW1N5bWJvbC5pdGVyYXRvcl0gPSBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzOyB9LCBpO1xyXG4gICAgZnVuY3Rpb24gdmVyYihuLCBmKSB7IGlbbl0gPSBvW25dID8gZnVuY3Rpb24gKHYpIHsgcmV0dXJuIChwID0gIXApID8geyB2YWx1ZTogX19hd2FpdChvW25dKHYpKSwgZG9uZTogbiA9PT0gXCJyZXR1cm5cIiB9IDogZiA/IGYodikgOiB2OyB9IDogZjsgfVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19hc3luY1ZhbHVlcyhvKSB7XHJcbiAgICBpZiAoIVN5bWJvbC5hc3luY0l0ZXJhdG9yKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiU3ltYm9sLmFzeW5jSXRlcmF0b3IgaXMgbm90IGRlZmluZWQuXCIpO1xyXG4gICAgdmFyIG0gPSBvW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSwgaTtcclxuICAgIHJldHVybiBtID8gbS5jYWxsKG8pIDogKG8gPSB0eXBlb2YgX192YWx1ZXMgPT09IFwiZnVuY3Rpb25cIiA/IF9fdmFsdWVzKG8pIDogb1tTeW1ib2wuaXRlcmF0b3JdKCksIGkgPSB7fSwgdmVyYihcIm5leHRcIiksIHZlcmIoXCJ0aHJvd1wiKSwgdmVyYihcInJldHVyblwiKSwgaVtTeW1ib2wuYXN5bmNJdGVyYXRvcl0gPSBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzOyB9LCBpKTtcclxuICAgIGZ1bmN0aW9uIHZlcmIobikgeyBpW25dID0gb1tuXSAmJiBmdW5jdGlvbiAodikgeyByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkgeyB2ID0gb1tuXSh2KSwgc2V0dGxlKHJlc29sdmUsIHJlamVjdCwgdi5kb25lLCB2LnZhbHVlKTsgfSk7IH07IH1cclxuICAgIGZ1bmN0aW9uIHNldHRsZShyZXNvbHZlLCByZWplY3QsIGQsIHYpIHsgUHJvbWlzZS5yZXNvbHZlKHYpLnRoZW4oZnVuY3Rpb24odikgeyByZXNvbHZlKHsgdmFsdWU6IHYsIGRvbmU6IGQgfSk7IH0sIHJlamVjdCk7IH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fbWFrZVRlbXBsYXRlT2JqZWN0KGNvb2tlZCwgcmF3KSB7XHJcbiAgICBpZiAoT2JqZWN0LmRlZmluZVByb3BlcnR5KSB7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eShjb29rZWQsIFwicmF3XCIsIHsgdmFsdWU6IHJhdyB9KTsgfSBlbHNlIHsgY29va2VkLnJhdyA9IHJhdzsgfVxyXG4gICAgcmV0dXJuIGNvb2tlZDtcclxufTtcclxuXHJcbnZhciBfX3NldE1vZHVsZURlZmF1bHQgPSBPYmplY3QuY3JlYXRlID8gKGZ1bmN0aW9uKG8sIHYpIHtcclxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvLCBcImRlZmF1bHRcIiwgeyBlbnVtZXJhYmxlOiB0cnVlLCB2YWx1ZTogdiB9KTtcclxufSkgOiBmdW5jdGlvbihvLCB2KSB7XHJcbiAgICBvW1wiZGVmYXVsdFwiXSA9IHY7XHJcbn07XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19pbXBvcnRTdGFyKG1vZCkge1xyXG4gICAgaWYgKG1vZCAmJiBtb2QuX19lc01vZHVsZSkgcmV0dXJuIG1vZDtcclxuICAgIHZhciByZXN1bHQgPSB7fTtcclxuICAgIGlmIChtb2QgIT0gbnVsbCkgZm9yICh2YXIgayBpbiBtb2QpIGlmIChPYmplY3QuaGFzT3duUHJvcGVydHkuY2FsbChtb2QsIGspKSBfX2NyZWF0ZUJpbmRpbmcocmVzdWx0LCBtb2QsIGspO1xyXG4gICAgX19zZXRNb2R1bGVEZWZhdWx0KHJlc3VsdCwgbW9kKTtcclxuICAgIHJldHVybiByZXN1bHQ7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2ltcG9ydERlZmF1bHQobW9kKSB7XHJcbiAgICByZXR1cm4gKG1vZCAmJiBtb2QuX19lc01vZHVsZSkgPyBtb2QgOiB7IGRlZmF1bHQ6IG1vZCB9O1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19jbGFzc1ByaXZhdGVGaWVsZEdldChyZWNlaXZlciwgcHJpdmF0ZU1hcCkge1xyXG4gICAgaWYgKCFwcml2YXRlTWFwLmhhcyhyZWNlaXZlcikpIHtcclxuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiYXR0ZW1wdGVkIHRvIGdldCBwcml2YXRlIGZpZWxkIG9uIG5vbi1pbnN0YW5jZVwiKTtcclxuICAgIH1cclxuICAgIHJldHVybiBwcml2YXRlTWFwLmdldChyZWNlaXZlcik7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2NsYXNzUHJpdmF0ZUZpZWxkU2V0KHJlY2VpdmVyLCBwcml2YXRlTWFwLCB2YWx1ZSkge1xyXG4gICAgaWYgKCFwcml2YXRlTWFwLmhhcyhyZWNlaXZlcikpIHtcclxuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiYXR0ZW1wdGVkIHRvIHNldCBwcml2YXRlIGZpZWxkIG9uIG5vbi1pbnN0YW5jZVwiKTtcclxuICAgIH1cclxuICAgIHByaXZhdGVNYXAuc2V0KHJlY2VpdmVyLCB2YWx1ZSk7XHJcbiAgICByZXR1cm4gdmFsdWU7XHJcbn1cclxuIiwiaW1wb3J0IHsgQ2xvY2sgfSBmcm9tICcuL0Nsb2NrJztcblxuLyoqXG4gKiBDbGFzcyB0aGF0IGRlYWxzIHdpdGggdGltZS5cbiAqIFRoaXMgaXMgXCJmcmFtZVwiIHR5cGUgY2xvY2ssIHRoZSBmcmFtZSBpbmNyZWFzZXMgZXZlcnkge0BsaW5rIENsb2NrRnJhbWUjdXBkYXRlfSBjYWxsLlxuICogQHBhcmFtIGZwcyBGcmFtZXMgcGVyIHNlY29uZFxuICovXG5leHBvcnQgY2xhc3MgQ2xvY2tGcmFtZSBleHRlbmRzIENsb2NrIHtcbiAgLyoqXG4gICAqIEl0cyBjdXJyZW50IGZyYW1lLlxuICAgKi9cbiAgcHJpdmF0ZSBfX2ZyYW1lID0gMDtcblxuICAvKipcbiAgICogSXRzIGZwcy5cbiAgICovXG4gIHByaXZhdGUgX19mcHM6IG51bWJlcjtcblxuICBwdWJsaWMgY29uc3RydWN0b3IoIGZwcyA9IDYwICkge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5fX2ZwcyA9IGZwcztcbiAgfVxuXG4gIC8qKlxuICAgKiBJdHMgY3VycmVudCBmcmFtZS5cbiAgICovXG4gIHB1YmxpYyBnZXQgZnJhbWUoKTogbnVtYmVyIHsgcmV0dXJuIHRoaXMuX19mcmFtZTsgfVxuXG4gIC8qKlxuICAgKiBJdHMgZnBzLlxuICAgKi9cbiAgcHVibGljIGdldCBmcHMoKTogbnVtYmVyIHsgcmV0dXJuIHRoaXMuX19mcHM7IH1cblxuICAvKipcbiAgICogVXBkYXRlIHRoZSBjbG9jay4gSXQgd2lsbCBpbmNyZWFzZSB0aGUgZnJhbWUgYnkgMS5cbiAgICovXG4gIHB1YmxpYyB1cGRhdGUoKTogdm9pZCB7XG4gICAgaWYgKCB0aGlzLl9faXNQbGF5aW5nICkge1xuICAgICAgdGhpcy5fX3RpbWUgPSB0aGlzLl9fZnJhbWUgLyB0aGlzLl9fZnBzO1xuICAgICAgdGhpcy5fX2RlbHRhVGltZSA9IDEuMCAvIHRoaXMuX19mcHM7XG4gICAgICB0aGlzLl9fZnJhbWUgKys7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX19kZWx0YVRpbWUgPSAwLjA7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFNldCB0aGUgdGltZSBtYW51YWxseS5cbiAgICogVGhlIHNldCB0aW1lIHdpbGwgYmUgY29udmVydGVkIGludG8gaW50ZXJuYWwgZnJhbWUgY291bnQsIHNvIHRoZSB0aW1lIHdpbGwgbm90IGJlIGV4YWN0bHkgc2FtZSBhcyBzZXQgb25lLlxuICAgKiBAcGFyYW0gdGltZSBUaW1lXG4gICAqL1xuICBwdWJsaWMgc2V0VGltZSggdGltZTogbnVtYmVyICk6IHZvaWQge1xuICAgIHRoaXMuX19mcmFtZSA9IE1hdGguZmxvb3IoIHRoaXMuX19mcHMgKiB0aW1lICk7XG4gICAgdGhpcy5fX3RpbWUgPSB0aGlzLl9fZnJhbWUgLyB0aGlzLl9fZnBzO1xuICB9XG59XG4iLCJpbXBvcnQgeyBDbG9jayB9IGZyb20gJy4vQ2xvY2snO1xuXG4vKipcbiAqIENsYXNzIHRoYXQgZGVhbHMgd2l0aCB0aW1lLlxuICogVGhpcyBpcyBcInJlYWx0aW1lXCIgdHlwZSBjbG9jaywgdGhlIHRpbWUgZ29lcyBvbiBhcyByZWFsIHdvcmxkLlxuICovXG5leHBvcnQgY2xhc3MgQ2xvY2tSZWFsdGltZSBleHRlbmRzIENsb2NrIHtcbiAgLyoqXG4gICAqIFwiWW91IHNldCB0aGUgdGltZSBtYW51YWxseSB0byBgX19ydFRpbWVgIHdoZW4gaXQncyBgX19ydERhdGVgLlwiXG4gICAqL1xuICBwcml2YXRlIF9fcnRUaW1lID0gMC4wO1xuXG4gIC8qKlxuICAgKiBcIllvdSBzZXQgdGhlIHRpbWUgbWFudWFsbHkgdG8gYF9fcnRUaW1lYCB3aGVuIGl0J3MgYF9fcnREYXRlYC5cIlxuICAgKi9cbiAgcHJpdmF0ZSBfX3J0RGF0ZTogbnVtYmVyID0gcGVyZm9ybWFuY2Uubm93KCk7XG5cbiAgLyoqXG4gICAqIFRoZSBjbG9jayBpcyByZWFsdGltZS4geWVhaC5cbiAgICovXG4gIHB1YmxpYyBnZXQgaXNSZWFsdGltZSgpOiBib29sZWFuIHsgcmV0dXJuIHRydWU7IH1cblxuICAvKipcbiAgICogVXBkYXRlIHRoZSBjbG9jay4gVGltZSBpcyBjYWxjdWxhdGVkIGJhc2VkIG9uIHRpbWUgaW4gcmVhbCB3b3JsZC5cbiAgICovXG4gIHB1YmxpYyB1cGRhdGUoKTogdm9pZCB7XG4gICAgY29uc3Qgbm93ID0gcGVyZm9ybWFuY2Uubm93KCk7XG5cbiAgICBpZiAoIHRoaXMuX19pc1BsYXlpbmcgKSB7XG4gICAgICBjb25zdCBwcmV2VGltZSA9IHRoaXMuX190aW1lO1xuICAgICAgY29uc3QgZGVsdGFEYXRlID0gKCBub3cgLSB0aGlzLl9fcnREYXRlICk7XG4gICAgICB0aGlzLl9fdGltZSA9IHRoaXMuX19ydFRpbWUgKyBkZWx0YURhdGUgLyAxMDAwLjA7XG4gICAgICB0aGlzLl9fZGVsdGFUaW1lID0gdGhpcy50aW1lIC0gcHJldlRpbWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX19ydFRpbWUgPSB0aGlzLnRpbWU7XG4gICAgICB0aGlzLl9fcnREYXRlID0gbm93O1xuICAgICAgdGhpcy5fX2RlbHRhVGltZSA9IDAuMDtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogU2V0IHRoZSB0aW1lIG1hbnVhbGx5LlxuICAgKiBAcGFyYW0gdGltZSBUaW1lXG4gICAqL1xuICBwdWJsaWMgc2V0VGltZSggdGltZTogbnVtYmVyICk6IHZvaWQge1xuICAgIHRoaXMuX190aW1lID0gdGltZTtcbiAgICB0aGlzLl9fcnRUaW1lID0gdGhpcy50aW1lO1xuICAgIHRoaXMuX19ydERhdGUgPSBwZXJmb3JtYW5jZS5ub3coKTtcbiAgfVxufVxuIiwiLy8geW9pbmtlZCBmcm9tIGh0dHBzOi8vZ2l0aHViLmNvbS9tYXBib3gvdGlueS1zZGYgKEJTRCAyLUNsYXVzZSlcbi8vIGltcGxlbWVudHMgaHR0cDovL3Blb3BsZS5jcy51Y2hpY2Fnby5lZHUvfnBmZi9wYXBlcnMvZHQucGRmXG5cbi8qKlxuICogQ29tcHV0ZSBhIG9uZSBkaW1lbnNpb25hbCBlZHQgZnJvbSB0aGUgc291cmNlIGRhdGEuXG4gKiBSZXR1cm5pbmcgZGlzdGFuY2Ugd2lsbCBiZSBzcXVhcmVkLlxuICogSW50ZW5kZWQgdG8gYmUgdXNlZCBpbnRlcm5hbGx5IGluIHtAbGluayBlZHQyZH0uXG4gKlxuICogQHBhcmFtIGRhdGEgRGF0YSBvZiB0aGUgc291cmNlXG4gKiBAcGFyYW0gb2Zmc2V0IE9mZnNldCBvZiB0aGUgc291cmNlIGZyb20gYmVnaW5uaW5nXG4gKiBAcGFyYW0gc3RyaWRlIFN0cmlkZSBvZiB0aGUgc291cmNlXG4gKiBAcGFyYW0gbGVuZ3RoIExlbmd0aCBvZiB0aGUgc291cmNlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBlZHQxZChcbiAgZGF0YTogRmxvYXQzMkFycmF5LFxuICBvZmZzZXQ6IG51bWJlcixcbiAgc3RyaWRlOiBudW1iZXIsXG4gIGxlbmd0aDogbnVtYmVyXG4pOiB2b2lkIHtcbiAgLy8gaW5kZXggb2YgcmlnaHRtb3N0IHBhcmFib2xhIGluIGxvd2VyIGVudmVsb3BlXG4gIGxldCBrID0gMDtcblxuICAvLyBsb2NhdGlvbnMgb2YgcGFyYWJvbGFzIGluIGxvd2VyIGVudmVsb3BlXG4gIGNvbnN0IHYgPSBuZXcgRmxvYXQzMkFycmF5KCBsZW5ndGggKTtcbiAgdlsgMCBdID0gMC4wO1xuXG4gIC8vIGxvY2F0aW9ucyBvZiBib3VuZGFyaWVzIGJldHdlZW4gcGFyYWJvbGFzXG4gIGNvbnN0IHogPSBuZXcgRmxvYXQzMkFycmF5KCBsZW5ndGggKyAxICk7XG4gIHpbIDAgXSA9IC1JbmZpbml0eTtcbiAgelsgMSBdID0gSW5maW5pdHk7XG5cbiAgLy8gY3JlYXRlIGEgc3RyYWlnaHQgYXJyYXkgb2YgaW5wdXQgZGF0YVxuICBjb25zdCBmID0gbmV3IEZsb2F0MzJBcnJheSggbGVuZ3RoICk7XG4gIGZvciAoIGxldCBxID0gMDsgcSA8IGxlbmd0aDsgcSArKyApIHtcbiAgICBmWyBxIF0gPSBkYXRhWyBvZmZzZXQgKyBxICogc3RyaWRlIF07XG4gIH1cblxuICAvLyBjb21wdXRlIGxvd2VyIGVudmVsb3BlXG4gIGZvciAoIGxldCBxID0gMTsgcSA8IGxlbmd0aDsgcSArKyApIHtcbiAgICBsZXQgcyA9IDAuMDtcblxuICAgIHdoaWxlICggMCA8PSBrICkge1xuICAgICAgcyA9ICggZlsgcSBdICsgcSAqIHEgLSBmWyB2WyBrIF0gXSAtIHZbIGsgXSAqIHZbIGsgXSApIC8gKCAyLjAgKiBxIC0gMi4wICogdlsgayBdICk7XG4gICAgICBpZiAoIHMgPD0gelsgayBdICkge1xuICAgICAgICBrIC0tO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuXG4gICAgayArKztcbiAgICB2WyBrIF0gPSBxO1xuICAgIHpbIGsgXSA9IHM7XG4gICAgelsgayArIDEgXSA9IEluZmluaXR5O1xuICB9XG5cbiAgayA9IDA7XG5cbiAgLy8gZmlsbCBpbiB2YWx1ZXMgb2YgZGlzdGFuY2UgdHJhbnNmb3JtXG4gIGZvciAoIGxldCBxID0gMDsgcSA8IGxlbmd0aDsgcSArKyApIHtcbiAgICB3aGlsZSAoIHpbIGsgKyAxIF0gPCBxICkgeyBrICsrOyB9XG4gICAgY29uc3QgcVN1YlZLID0gcSAtIHZbIGsgXTtcbiAgICBkYXRhWyBvZmZzZXQgKyBxICogc3RyaWRlIF0gPSBmWyB2WyBrIF0gXSArIHFTdWJWSyAqIHFTdWJWSztcbiAgfVxufVxuXG4vKipcbiAqIENvbXB1dGUgYSB0d28gZGltZW5zaW9uYWwgZWR0IGZyb20gdGhlIHNvdXJjZSBkYXRhLlxuICogUmV0dXJuaW5nIGRpc3RhbmNlIHdpbGwgYmUgc3F1YXJlZC5cbiAqXG4gKiBAcGFyYW0gZGF0YSBEYXRhIG9mIHRoZSBzb3VyY2UuXG4gKiBAcGFyYW0gd2lkdGggV2lkdGggb2YgdGhlIHNvdXJjZS5cbiAqIEBwYXJhbSBoZWlnaHQgSGVpZ2h0IG9mIHRoZSBzb3VyY2UuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBlZHQyZChcbiAgZGF0YTogRmxvYXQzMkFycmF5LFxuICB3aWR0aDogbnVtYmVyLFxuICBoZWlnaHQ6IG51bWJlclxuKTogdm9pZCB7XG4gIGZvciAoIGxldCB4ID0gMDsgeCA8IHdpZHRoOyB4ICsrICkge1xuICAgIGVkdDFkKCBkYXRhLCB4LCB3aWR0aCwgaGVpZ2h0ICk7XG4gIH1cblxuICBmb3IgKCBsZXQgeSA9IDA7IHkgPCBoZWlnaHQ7IHkgKysgKSB7XG4gICAgZWR0MWQoIGRhdGEsIHkgKiB3aWR0aCwgMSwgd2lkdGggKTtcbiAgfVxufVxuIiwiLyoqXG4gKiBgbGVycGAsIG9yIGBtaXhgXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBsZXJwKCBhOiBudW1iZXIsIGI6IG51bWJlciwgeDogbnVtYmVyICk6IG51bWJlciB7XG4gIHJldHVybiBhICsgKCBiIC0gYSApICogeDtcbn1cblxuLyoqXG4gKiBgY2xhbXBgXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjbGFtcCggeDogbnVtYmVyLCBsOiBudW1iZXIsIGg6IG51bWJlciApOiBudW1iZXIge1xuICByZXR1cm4gTWF0aC5taW4oIE1hdGgubWF4KCB4LCBsICksIGggKTtcbn1cblxuLyoqXG4gKiBgY2xhbXAoIHgsIDAuMCwgMS4wIClgXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzYXR1cmF0ZSggeDogbnVtYmVyICk6IG51bWJlciB7XG4gIHJldHVybiBjbGFtcCggeCwgMC4wLCAxLjAgKTtcbn1cblxuLyoqXG4gKiBUcmFuc2Zvcm0gYSB2YWx1ZSBmcm9tIGlucHV0IHJhbmdlIHRvIG91dHB1dCByYW5nZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJhbmdlKCB4OiBudW1iZXIsIHgwOiBudW1iZXIsIHgxOiBudW1iZXIsIHkwOiBudW1iZXIsIHkxOiBudW1iZXIgKTogbnVtYmVyIHtcbiAgcmV0dXJuICggKCB4IC0geDAgKSAqICggeTEgLSB5MCApIC8gKCB4MSAtIHgwICkgKyB5MCApO1xufVxuXG4vKipcbiAqIGBzbW9vdGhzdGVwYCBidXQgbm90IHNtb290aFxuICovXG5leHBvcnQgZnVuY3Rpb24gbGluZWFyc3RlcCggYTogbnVtYmVyLCBiOiBudW1iZXIsIHg6IG51bWJlciApOiBudW1iZXIge1xuICByZXR1cm4gc2F0dXJhdGUoICggeCAtIGEgKSAvICggYiAtIGEgKSApO1xufVxuXG4vKipcbiAqIHdvcmxkIGZhbW91cyBgc21vb3Roc3RlcGAgZnVuY3Rpb25cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNtb290aHN0ZXAoIGE6IG51bWJlciwgYjogbnVtYmVyLCB4OiBudW1iZXIgKTogbnVtYmVyIHtcbiAgY29uc3QgdCA9IGxpbmVhcnN0ZXAoIGEsIGIsIHggKTtcbiAgcmV0dXJuIHQgKiB0ICogKCAzLjAgLSAyLjAgKiB0ICk7XG59XG5cbi8qKlxuICogYHNtb290aHN0ZXBgIGJ1dCBtb3JlIHNtb290aFxuICovXG5leHBvcnQgZnVuY3Rpb24gc21vb3RoZXJzdGVwKCBhOiBudW1iZXIsIGI6IG51bWJlciwgeDogbnVtYmVyICk6IG51bWJlciB7XG4gIGNvbnN0IHQgPSBsaW5lYXJzdGVwKCBhLCBiLCB4ICk7XG4gIHJldHVybiB0ICogdCAqIHQgKiAoIHQgKiAoIHQgKiA2LjAgLSAxNS4wICkgKyAxMC4wICk7XG59XG5cbi8qKlxuICogYHNtb290aHN0ZXBgIGJ1dCBXQVkgbW9yZSBzbW9vdGhcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNtb290aGVzdHN0ZXAoIGE6IG51bWJlciwgYjogbnVtYmVyLCB4OiBudW1iZXIgKTogbnVtYmVyIHtcbiAgY29uc3QgdCA9IGxpbmVhcnN0ZXAoIGEsIGIsIHggKTtcbiAgcmV0dXJuIHQgKiB0ICogdCAqIHQgKiAoIHQgKiAoIHQgKiAoIC0yMC4wICogdCArIDcwLjAgKSAtIDg0LjAgKSArIDM1LjAgKTtcbn1cbiIsImltcG9ydCB7IGxlcnAgfSBmcm9tICcuLi9tYXRoL3V0aWxzJztcblxuLyoqXG4gKiBEbyBleHAgc21vb3RoaW5nXG4gKi9cbmV4cG9ydCBjbGFzcyBFeHBTbW9vdGgge1xuICBwdWJsaWMgZmFjdG9yID0gMTAuMDtcbiAgcHVibGljIHRhcmdldCA9IDAuMDtcbiAgcHVibGljIHZhbHVlID0gMC4wO1xuXG4gIHB1YmxpYyB1cGRhdGUoIGRlbHRhVGltZTogbnVtYmVyICk6IG51bWJlciB7XG4gICAgdGhpcy52YWx1ZSA9IGxlcnAoIHRoaXMudGFyZ2V0LCB0aGlzLnZhbHVlLCBNYXRoLmV4cCggLXRoaXMuZmFjdG9yICogZGVsdGFUaW1lICkgKTtcbiAgICByZXR1cm4gdGhpcy52YWx1ZTtcbiAgfVxufVxuIiwiLyoqXG4gKiBJdGVyYWJsZSBGaXp6QnV6elxuICovXG5leHBvcnQgY2xhc3MgRml6ekJ1enogaW1wbGVtZW50cyBJdGVyYWJsZTxudW1iZXIgfCBzdHJpbmc+IHtcbiAgcHVibGljIHN0YXRpYyBXb3Jkc0RlZmF1bHQ6IE1hcDxudW1iZXIsIHN0cmluZz4gPSBuZXcgTWFwKCBbXG4gICAgWyAzLCAnRml6eicgXSxcbiAgICBbIDUsICdCdXp6JyBdXG4gIF0gKTtcblxuICBwcml2YXRlIF9fd29yZHM6IE1hcDxudW1iZXIsIHN0cmluZz47XG4gIHByaXZhdGUgX19pbmRleDogbnVtYmVyO1xuICBwcml2YXRlIF9fZW5kOiBudW1iZXI7XG5cbiAgcHVibGljIGNvbnN0cnVjdG9yKCB3b3JkczogTWFwPG51bWJlciwgc3RyaW5nPiA9IEZpenpCdXp6LldvcmRzRGVmYXVsdCwgaW5kZXggPSAxLCBlbmQgPSAxMDAgKSB7XG4gICAgdGhpcy5fX3dvcmRzID0gd29yZHM7XG4gICAgdGhpcy5fX2luZGV4ID0gaW5kZXg7XG4gICAgdGhpcy5fX2VuZCA9IGVuZDtcbiAgfVxuXG4gIHB1YmxpYyBbIFN5bWJvbC5pdGVyYXRvciBdKCk6IEl0ZXJhdG9yPHN0cmluZyB8IG51bWJlciwgYW55LCB1bmRlZmluZWQ+IHtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIHB1YmxpYyBuZXh0KCk6IEl0ZXJhdG9yUmVzdWx0PG51bWJlciB8IHN0cmluZz4ge1xuICAgIGlmICggdGhpcy5fX2VuZCA8IHRoaXMuX19pbmRleCApIHtcbiAgICAgIHJldHVybiB7IGRvbmU6IHRydWUsIHZhbHVlOiBudWxsIH07XG4gICAgfVxuXG4gICAgbGV0IHZhbHVlOiBudW1iZXIgfCBzdHJpbmcgPSAnJztcbiAgICBmb3IgKCBjb25zdCBbIHJlbSwgd29yZCBdIG9mIHRoaXMuX193b3JkcyApIHtcbiAgICAgIGlmICggKCB0aGlzLl9faW5kZXggJSByZW0gKSA9PT0gMCApIHtcbiAgICAgICAgdmFsdWUgKz0gd29yZDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoIHZhbHVlID09PSAnJyApIHtcbiAgICAgIHZhbHVlID0gdGhpcy5fX2luZGV4O1xuICAgIH1cblxuICAgIHRoaXMuX19pbmRleCArKztcblxuICAgIHJldHVybiB7IGRvbmU6IGZhbHNlLCB2YWx1ZSB9O1xuICB9XG59XG4iLCIvKipcbiAqIE1vc3QgYXdlc29tZSBjYXQgZXZlclxuICovXG5leHBvcnQgY2xhc3MgRk1TX0NhdCB7IC8vIGVzbGludC1kaXNhYmxlLWxpbmVcbiAgLyoqXG4gICAqIEZNU19DYXQuZ2lmXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIGdpZiA9ICdodHRwczovL2Ztcy1jYXQuY29tL2ltYWdlcy9mbXNfY2F0LmdpZic7XG5cbiAgLyoqXG4gICAqIEZNU19DYXQucG5nXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIHBuZyA9ICdodHRwczovL2Ztcy1jYXQuY29tL2ltYWdlcy9mbXNfY2F0LnBuZyc7XG59XG4iLCIvKipcbiAqIFVzZWZ1bCBmb3IgdGFwIHRlbXBvXG4gKiBTZWUgYWxzbzoge0BsaW5rIEhpc3RvcnlNZWFuQ2FsY3VsYXRvcn1cbiAqL1xuZXhwb3J0IGNsYXNzIEhpc3RvcnlNZWFuQ2FsY3VsYXRvciB7XG4gIHByaXZhdGUgX19yZWNhbGNGb3JFYWNoID0gMDtcbiAgcHJpdmF0ZSBfX2NvdW50VW50aWxSZWNhbGMgPSAwO1xuICBwcml2YXRlIF9faGlzdG9yeTogbnVtYmVyW10gPSBbXTtcbiAgcHJpdmF0ZSBfX2luZGV4ID0gMDtcbiAgcHJpdmF0ZSBfX2xlbmd0aDogbnVtYmVyO1xuICBwcml2YXRlIF9fY291bnQgPSAwO1xuICBwcml2YXRlIF9fY2FjaGUgPSAwO1xuXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggbGVuZ3RoOiBudW1iZXIgKSB7XG4gICAgdGhpcy5fX2xlbmd0aCA9IGxlbmd0aDtcbiAgICB0aGlzLl9fcmVjYWxjRm9yRWFjaCA9IGxlbmd0aDtcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBsZW5ndGg7IGkgKysgKSB7XG4gICAgICB0aGlzLl9faGlzdG9yeVsgaSBdID0gMDtcbiAgICB9XG4gIH1cblxuICBwdWJsaWMgZ2V0IG1lYW4oKTogbnVtYmVyIHtcbiAgICBjb25zdCBjb3VudCA9IE1hdGgubWluKCB0aGlzLl9fY291bnQsIHRoaXMuX19sZW5ndGggKTtcbiAgICByZXR1cm4gY291bnQgPT09IDAgPyAwLjAgOiB0aGlzLl9fY2FjaGUgLyBjb3VudDtcbiAgfVxuXG4gIHB1YmxpYyBnZXQgcmVjYWxjRm9yRWFjaCgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLl9fcmVjYWxjRm9yRWFjaDtcbiAgfVxuXG4gIHB1YmxpYyBzZXQgcmVjYWxjRm9yRWFjaCggdmFsdWU6IG51bWJlciApIHtcbiAgICBjb25zdCBkZWx0YSA9IHZhbHVlIC0gdGhpcy5fX3JlY2FsY0ZvckVhY2g7XG4gICAgdGhpcy5fX3JlY2FsY0ZvckVhY2ggPSB2YWx1ZTtcbiAgICB0aGlzLl9fY291bnRVbnRpbFJlY2FsYyA9IE1hdGgubWF4KCAwLCB0aGlzLl9fY291bnRVbnRpbFJlY2FsYyArIGRlbHRhICk7XG4gIH1cblxuICBwdWJsaWMgcmVzZXQoKTogdm9pZCB7XG4gICAgdGhpcy5fX2luZGV4ID0gMDtcbiAgICB0aGlzLl9fY291bnQgPSAwO1xuICAgIHRoaXMuX19jYWNoZSA9IDA7XG4gICAgdGhpcy5fX2NvdW50VW50aWxSZWNhbGMgPSAwO1xuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHRoaXMuX19sZW5ndGg7IGkgKysgKSB7XG4gICAgICB0aGlzLl9faGlzdG9yeVsgaSBdID0gMDtcbiAgICB9XG4gIH1cblxuICBwdWJsaWMgcHVzaCggdmFsdWU6IG51bWJlciApOiB2b2lkIHtcbiAgICBjb25zdCBwcmV2ID0gdGhpcy5fX2hpc3RvcnlbIHRoaXMuX19pbmRleCBdO1xuICAgIHRoaXMuX19oaXN0b3J5WyB0aGlzLl9faW5kZXggXSA9IHZhbHVlO1xuICAgIHRoaXMuX19jb3VudCArKztcbiAgICB0aGlzLl9faW5kZXggPSAoIHRoaXMuX19pbmRleCArIDEgKSAlIHRoaXMuX19sZW5ndGg7XG5cbiAgICBpZiAoIHRoaXMuX19jb3VudFVudGlsUmVjYWxjID09PSAwICkge1xuICAgICAgdGhpcy5yZWNhbGMoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fX2NvdW50VW50aWxSZWNhbGMgLS07XG4gICAgICB0aGlzLl9fY2FjaGUgLT0gcHJldjtcbiAgICAgIHRoaXMuX19jYWNoZSArPSB2YWx1ZTtcbiAgICB9XG4gIH1cblxuICBwdWJsaWMgcmVjYWxjKCk6IHZvaWQge1xuICAgIHRoaXMuX19jb3VudFVudGlsUmVjYWxjID0gdGhpcy5fX3JlY2FsY0ZvckVhY2g7XG4gICAgY29uc3Qgc3VtID0gdGhpcy5fX2hpc3RvcnlcbiAgICAgIC5zbGljZSggMCwgTWF0aC5taW4oIHRoaXMuX19jb3VudCwgdGhpcy5fX2xlbmd0aCApIClcbiAgICAgIC5yZWR1Y2UoICggc3VtLCB2ICkgPT4gc3VtICsgdiwgMCApO1xuICAgIHRoaXMuX19jYWNoZSA9IHN1bTtcbiAgfVxufVxuIiwiaW1wb3J0IHsgYmluYXJ5U2VhcmNoIH0gZnJvbSAnLi4vYWxnb3JpdGhtL2JpbmFyeVNlYXJjaCc7XG5cbi8qKlxuICogVXNlZnVsIGZvciBmcHMgY2FsY1xuICogU2VlIGFsc286IHtAbGluayBIaXN0b3J5TWVhbkNhbGN1bGF0b3J9XG4gKi9cbmV4cG9ydCBjbGFzcyBIaXN0b3J5UGVyY2VudGlsZUNhbGN1bGF0b3Ige1xuICBwcml2YXRlIF9faGlzdG9yeTogbnVtYmVyW10gPSBbXTtcbiAgcHJpdmF0ZSBfX3NvcnRlZDogbnVtYmVyW10gPSBbXTtcbiAgcHJpdmF0ZSBfX2luZGV4ID0gMDtcbiAgcHJpdmF0ZSByZWFkb25seSBfX2xlbmd0aDogbnVtYmVyO1xuXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggbGVuZ3RoOiBudW1iZXIgKSB7XG4gICAgdGhpcy5fX2xlbmd0aCA9IGxlbmd0aDtcbiAgfVxuXG4gIHB1YmxpYyBnZXQgbWVkaWFuKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMucGVyY2VudGlsZSggNTAuMCApO1xuICB9XG5cbiAgcHVibGljIHBlcmNlbnRpbGUoIHBlcmNlbnRpbGU6IG51bWJlciApOiBudW1iZXIge1xuICAgIGlmICggdGhpcy5fX2hpc3RvcnkubGVuZ3RoID09PSAwICkgeyByZXR1cm4gMC4wOyB9XG4gICAgcmV0dXJuIHRoaXMuX19zb3J0ZWRbIE1hdGgucm91bmQoIHBlcmNlbnRpbGUgKiAwLjAxICogKCB0aGlzLl9faGlzdG9yeS5sZW5ndGggLSAxICkgKSBdO1xuICB9XG5cbiAgcHVibGljIHJlc2V0KCk6IHZvaWQge1xuICAgIHRoaXMuX19pbmRleCA9IDA7XG4gICAgdGhpcy5fX2hpc3RvcnkgPSBbXTtcbiAgICB0aGlzLl9fc29ydGVkID0gW107XG4gIH1cblxuICBwdWJsaWMgcHVzaCggdmFsdWU6IG51bWJlciApOiB2b2lkIHtcbiAgICBjb25zdCBwcmV2ID0gdGhpcy5fX2hpc3RvcnlbIHRoaXMuX19pbmRleCBdO1xuICAgIHRoaXMuX19oaXN0b3J5WyB0aGlzLl9faW5kZXggXSA9IHZhbHVlO1xuICAgIHRoaXMuX19pbmRleCA9ICggdGhpcy5fX2luZGV4ICsgMSApICUgdGhpcy5fX2xlbmd0aDtcblxuICAgIC8vIHJlbW92ZSB0aGUgcHJldiBmcm9tIHNvcnRlZCBhcnJheVxuICAgIGlmICggdGhpcy5fX3NvcnRlZC5sZW5ndGggPT09IHRoaXMuX19sZW5ndGggKSB7XG4gICAgICBjb25zdCBwcmV2SW5kZXggPSBiaW5hcnlTZWFyY2goIHRoaXMuX19zb3J0ZWQsIHByZXYgKTtcbiAgICAgIHRoaXMuX19zb3J0ZWQuc3BsaWNlKCBwcmV2SW5kZXgsIDEgKTtcbiAgICB9XG5cbiAgICBjb25zdCBpbmRleCA9IGJpbmFyeVNlYXJjaCggdGhpcy5fX3NvcnRlZCwgdmFsdWUgKTtcbiAgICB0aGlzLl9fc29ydGVkLnNwbGljZSggaW5kZXgsIDAsIHZhbHVlICk7XG4gIH1cbn1cbiIsImltcG9ydCB7IEhpc3RvcnlQZXJjZW50aWxlQ2FsY3VsYXRvciB9IGZyb20gJy4vSGlzdG9yeVBlcmNlbnRpbGVDYWxjdWxhdG9yJztcblxuLyoqXG4gKiBAZGVwcmVjYXRlZCBJdCdzIGFjdHVhbGx5IGp1c3QgYSBzcGVjaWFsIGNhc2Ugb2Yge0BsaW5rIEhpc3RvcnlQZXJjZW50aWxlQ2FsY3VsYXRvcn1cbiAqL1xuZXhwb3J0IGNsYXNzIEhpc3RvcnlNZWRpYW5DYWxjdWxhdG9yIGV4dGVuZHMgSGlzdG9yeVBlcmNlbnRpbGVDYWxjdWxhdG9yIHtcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBsZW5ndGg6IG51bWJlciApIHtcbiAgICBzdXBlciggbGVuZ3RoICk7XG4gICAgY29uc29sZS53YXJuKCAnSGlzdG9yeU1lZGlhbkNhbGN1bGF0b3I6IERlcHJlY2F0ZWQuIFVzZSBIaXN0b3J5UGVyY2VudGlsZUNhbGN1bGF0b3IgaW5zdGVhZCcgKTtcbiAgfVxufVxuIiwiLyoqXG4gKiBBIFZlY3Rvci5cbiAqL1xuZXhwb3J0IGFic3RyYWN0IGNsYXNzIFZlY3RvcjxUIGV4dGVuZHMgVmVjdG9yPFQ+PiB7XG4gIHB1YmxpYyBhYnN0cmFjdCBlbGVtZW50czogbnVtYmVyW107XG5cbiAgLyoqXG4gICAqIFRoZSBsZW5ndGggb2YgdGhpcy5cbiAgICogYS5rLmEuIGBtYWduaXR1ZGVgXG4gICAqL1xuICBwdWJsaWMgZ2V0IGxlbmd0aCgpOiBudW1iZXIge1xuICAgIHJldHVybiBNYXRoLnNxcnQoIHRoaXMuZWxlbWVudHMucmVkdWNlKCAoIHN1bSwgdiApID0+IHN1bSArIHYgKiB2LCAwLjAgKSApO1xuICB9XG5cbiAgLyoqXG4gICAqIEEgbm9ybWFsaXplZCBWZWN0b3IzIG9mIHRoaXMuXG4gICAqL1xuICBwdWJsaWMgZ2V0IG5vcm1hbGl6ZWQoKTogVCB7XG4gICAgcmV0dXJuIHRoaXMuc2NhbGUoIDEuMCAvIHRoaXMubGVuZ3RoICk7XG4gIH1cblxuICAvKipcbiAgICogQ2xvbmUgdGhpcy5cbiAgICovXG4gIHB1YmxpYyBjbG9uZSgpOiBUIHtcbiAgICByZXR1cm4gdGhpcy5fX25ldyggdGhpcy5lbGVtZW50cy5jb25jYXQoKSApO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZCBhIFZlY3RvciBpbnRvIHRoaXMuXG4gICAqIEBwYXJhbSB2ZWN0b3IgQW5vdGhlciBWZWN0b3JcbiAgICovXG4gIHB1YmxpYyBhZGQoIHZlY3RvcjogVCApOiBUIHtcbiAgICByZXR1cm4gdGhpcy5fX25ldyggdGhpcy5lbGVtZW50cy5tYXAoICggdiwgaSApID0+IHYgKyB2ZWN0b3IuZWxlbWVudHNbIGkgXSApICk7XG4gIH1cblxuICAvKipcbiAgICogU3Vic3RyYWN0IHRoaXMgZnJvbSBhbm90aGVyIFZlY3Rvci5cbiAgICogQHBhcmFtIHYgQW5vdGhlciB2ZWN0b3JcbiAgICovXG4gIHB1YmxpYyBzdWIoIHZlY3RvcjogVCApOiBUIHtcbiAgICByZXR1cm4gdGhpcy5fX25ldyggdGhpcy5lbGVtZW50cy5tYXAoICggdiwgaSApID0+IHYgLSB2ZWN0b3IuZWxlbWVudHNbIGkgXSApICk7XG4gIH1cblxuICAvKipcbiAgICogTXVsdGlwbHkgYSBWZWN0b3Igd2l0aCB0aGlzLlxuICAgKiBAcGFyYW0gdmVjdG9yIEFub3RoZXIgVmVjdG9yXG4gICAqL1xuICBwdWJsaWMgbXVsdGlwbHkoIHZlY3RvcjogVCApOiBUIHtcbiAgICByZXR1cm4gdGhpcy5fX25ldyggdGhpcy5lbGVtZW50cy5tYXAoICggdiwgaSApID0+IHYgKiB2ZWN0b3IuZWxlbWVudHNbIGkgXSApICk7XG4gIH1cblxuICAvKipcbiAgICogRGl2aWRlIHRoaXMgZnJvbSBhbm90aGVyIFZlY3Rvci5cbiAgICogQHBhcmFtIHZlY3RvciBBbm90aGVyIFZlY3RvclxuICAgKi9cbiAgcHVibGljIGRpdmlkZSggdmVjdG9yOiBUICk6IFQge1xuICAgIHJldHVybiB0aGlzLl9fbmV3KCB0aGlzLmVsZW1lbnRzLm1hcCggKCB2LCBpICkgPT4gdiAvIHZlY3Rvci5lbGVtZW50c1sgaSBdICkgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTY2FsZSB0aGlzIGJ5IHNjYWxhci5cbiAgICogYS5rLmEuIGBtdWx0aXBseVNjYWxhcmBcbiAgICogQHBhcmFtIHNjYWxhciBBIHNjYWxhclxuICAgKi9cbiAgcHVibGljIHNjYWxlKCBzY2FsYXI6IG51bWJlciApOiBUIHtcbiAgICByZXR1cm4gdGhpcy5fX25ldyggdGhpcy5lbGVtZW50cy5tYXAoICggdiApID0+IHYgKiBzY2FsYXIgKSApO1xuICB9XG5cbiAgLyoqXG4gICAqIERvdCB0d28gVmVjdG9ycy5cbiAgICogQHBhcmFtIHZlY3RvciBBbm90aGVyIHZlY3RvclxuICAgKi9cbiAgcHVibGljIGRvdCggdmVjdG9yOiBUICk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuZWxlbWVudHMucmVkdWNlKCAoIHN1bSwgdiwgaSApID0+IHN1bSArIHYgKiB2ZWN0b3IuZWxlbWVudHNbIGkgXSwgMC4wICk7XG4gIH1cblxuICBwcm90ZWN0ZWQgYWJzdHJhY3QgX19uZXcoIHY6IG51bWJlcltdICk6IFQ7XG59XG4iLCJpbXBvcnQgeyBNYXRyaXg0IH0gZnJvbSAnLi9NYXRyaXg0JztcbmltcG9ydCB7IFF1YXRlcm5pb24gfSBmcm9tICcuL1F1YXRlcm5pb24nO1xuaW1wb3J0IHsgVmVjdG9yIH0gZnJvbSAnLi9WZWN0b3InO1xuXG5leHBvcnQgdHlwZSByYXdWZWN0b3IzID0gWyBudW1iZXIsIG51bWJlciwgbnVtYmVyIF07XG5cbi8qKlxuICogQSBWZWN0b3IzLlxuICovXG5leHBvcnQgY2xhc3MgVmVjdG9yMyBleHRlbmRzIFZlY3RvcjxWZWN0b3IzPiB7XG4gIHB1YmxpYyBlbGVtZW50czogcmF3VmVjdG9yMztcblxuICBwdWJsaWMgY29uc3RydWN0b3IoIHY6IHJhd1ZlY3RvcjMgPSBbIDAuMCwgMC4wLCAwLjAgXSApIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMuZWxlbWVudHMgPSB2O1xuICB9XG5cbiAgLyoqXG4gICAqIEFuIHggY29tcG9uZW50IG9mIHRoaXMuXG4gICAqL1xuICBwdWJsaWMgZ2V0IHgoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5lbGVtZW50c1sgMCBdO1xuICB9XG5cbiAgcHVibGljIHNldCB4KCB4OiBudW1iZXIgKSB7XG4gICAgdGhpcy5lbGVtZW50c1sgMCBdID0geDtcbiAgfVxuXG4gIC8qKlxuICAgKiBBbiB5IGNvbXBvbmVudCBvZiB0aGlzLlxuICAgKi9cbiAgcHVibGljIGdldCB5KCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuZWxlbWVudHNbIDEgXTtcbiAgfVxuXG4gIHB1YmxpYyBzZXQgeSggeTogbnVtYmVyICkge1xuICAgIHRoaXMuZWxlbWVudHNbIDEgXSA9IHk7XG4gIH1cblxuICAvKipcbiAgICogQW4geiBjb21wb25lbnQgb2YgdGhpcy5cbiAgICovXG4gIHB1YmxpYyBnZXQgeigpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLmVsZW1lbnRzWyAyIF07XG4gIH1cblxuICBwdWJsaWMgc2V0IHooIHo6IG51bWJlciApIHtcbiAgICB0aGlzLmVsZW1lbnRzWyAyIF0gPSB6O1xuICB9XG5cbiAgcHVibGljIHRvU3RyaW5nKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGBWZWN0b3IzKCAkeyB0aGlzLngudG9GaXhlZCggMyApIH0sICR7IHRoaXMueS50b0ZpeGVkKCAzICkgfSwgJHsgdGhpcy56LnRvRml4ZWQoIDMgKSB9IClgO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybiBhIGNyb3NzIG9mIHRoaXMgYW5kIGFub3RoZXIgVmVjdG9yMy5cbiAgICogQHBhcmFtIHZlY3RvciBBbm90aGVyIHZlY3RvclxuICAgKi9cbiAgcHVibGljIGNyb3NzKCB2ZWN0b3I6IFZlY3RvcjMgKTogVmVjdG9yMyB7XG4gICAgcmV0dXJuIG5ldyBWZWN0b3IzKCBbXG4gICAgICB0aGlzLnkgKiB2ZWN0b3IueiAtIHRoaXMueiAqIHZlY3Rvci55LFxuICAgICAgdGhpcy56ICogdmVjdG9yLnggLSB0aGlzLnggKiB2ZWN0b3IueixcbiAgICAgIHRoaXMueCAqIHZlY3Rvci55IC0gdGhpcy55ICogdmVjdG9yLnhcbiAgICBdICk7XG4gIH1cblxuICAvKipcbiAgICogUm90YXRlIHRoaXMgdmVjdG9yIHVzaW5nIGEgUXVhdGVybmlvbi5cbiAgICogQHBhcmFtIHF1YXRlcm5pb24gQSBxdWF0ZXJuaW9uXG4gICAqL1xuICBwdWJsaWMgYXBwbHlRdWF0ZXJuaW9uKCBxdWF0ZXJuaW9uOiBRdWF0ZXJuaW9uICk6IFZlY3RvcjMge1xuICAgIGNvbnN0IHAgPSBuZXcgUXVhdGVybmlvbiggWyB0aGlzLngsIHRoaXMueSwgdGhpcy56LCAwLjAgXSApO1xuICAgIGNvbnN0IHIgPSBxdWF0ZXJuaW9uLmludmVyc2VkO1xuICAgIGNvbnN0IHJlcyA9IHF1YXRlcm5pb24ubXVsdGlwbHkoIHAgKS5tdWx0aXBseSggciApO1xuICAgIHJldHVybiBuZXcgVmVjdG9yMyggWyByZXMueCwgcmVzLnksIHJlcy56IF0gKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBNdWx0aXBseSB0aGlzIHZlY3RvciAod2l0aCBhbiBpbXBsaWNpdCAxIGluIHRoZSA0dGggZGltZW5zaW9uKSBieSBtLlxuICAgKi9cbiAgcHVibGljIGFwcGx5TWF0cml4NCggbWF0cml4OiBNYXRyaXg0ICk6IFZlY3RvcjMge1xuICAgIGNvbnN0IG0gPSBtYXRyaXguZWxlbWVudHM7XG5cbiAgICBjb25zdCB3ID0gbVsgMyBdICogdGhpcy54ICsgbVsgNyBdICogdGhpcy55ICsgbVsgMTEgXSAqIHRoaXMueiArIG1bIDE1IF07XG4gICAgY29uc3QgaW52VyA9IDEuMCAvIHc7XG5cbiAgICByZXR1cm4gbmV3IFZlY3RvcjMoIFtcbiAgICAgICggbVsgMCBdICogdGhpcy54ICsgbVsgNCBdICogdGhpcy55ICsgbVsgOCBdICogdGhpcy56ICsgbVsgMTIgXSApICogaW52VyxcbiAgICAgICggbVsgMSBdICogdGhpcy54ICsgbVsgNSBdICogdGhpcy55ICsgbVsgOSBdICogdGhpcy56ICsgbVsgMTMgXSApICogaW52VyxcbiAgICAgICggbVsgMiBdICogdGhpcy54ICsgbVsgNiBdICogdGhpcy55ICsgbVsgMTAgXSAqIHRoaXMueiArIG1bIDE0IF0gKSAqIGludldcbiAgICBdICk7XG4gIH1cblxuICBwcm90ZWN0ZWQgX19uZXcoIHY6IHJhd1ZlY3RvcjMgKTogVmVjdG9yMyB7XG4gICAgcmV0dXJuIG5ldyBWZWN0b3IzKCB2ICk7XG4gIH1cblxuICAvKipcbiAgICogVmVjdG9yMyggMC4wLCAwLjAsIDAuMCApXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIGdldCB6ZXJvKCk6IFZlY3RvcjMge1xuICAgIHJldHVybiBuZXcgVmVjdG9yMyggWyAwLjAsIDAuMCwgMC4wIF0gKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBWZWN0b3IzKCAxLjAsIDEuMCwgMS4wIClcbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgZ2V0IG9uZSgpOiBWZWN0b3IzIHtcbiAgICByZXR1cm4gbmV3IFZlY3RvcjMoIFsgMS4wLCAxLjAsIDEuMCBdICk7XG4gIH1cbn1cbiIsImltcG9ydCB7IE1hdHJpeDQgfSBmcm9tICcuL01hdHJpeDQnO1xuaW1wb3J0IHsgVmVjdG9yMyB9IGZyb20gJy4vVmVjdG9yMyc7XG5cbmV4cG9ydCB0eXBlIHJhd1F1YXRlcm5pb24gPSBbIG51bWJlciwgbnVtYmVyLCBudW1iZXIsIG51bWJlciBdO1xuXG5leHBvcnQgY29uc3QgcmF3SWRlbnRpdHlRdWF0ZXJuaW9uOiByYXdRdWF0ZXJuaW9uID0gWyAwLjAsIDAuMCwgMC4wLCAxLjAgXTtcblxuLyoqXG4gKiBBIFF1YXRlcm5pb24uXG4gKi9cbmV4cG9ydCBjbGFzcyBRdWF0ZXJuaW9uIHtcbiAgcHVibGljIGVsZW1lbnRzOiByYXdRdWF0ZXJuaW9uOyAvLyBbIHgsIHksIHo7IHcgXVxuXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggZWxlbWVudHM6IHJhd1F1YXRlcm5pb24gPSByYXdJZGVudGl0eVF1YXRlcm5pb24gKSB7XG4gICAgdGhpcy5lbGVtZW50cyA9IGVsZW1lbnRzO1xuICB9XG5cbiAgLyoqXG4gICAqIEFuIHggY29tcG9uZW50IG9mIHRoaXMuXG4gICAqL1xuICBwdWJsaWMgZ2V0IHgoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5lbGVtZW50c1sgMCBdO1xuICB9XG5cbiAgLyoqXG4gICAqIEFuIHkgY29tcG9uZW50IG9mIHRoaXMuXG4gICAqL1xuICBwdWJsaWMgZ2V0IHkoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5lbGVtZW50c1sgMSBdO1xuICB9XG5cbiAgLyoqXG4gICAqIEFuIHogY29tcG9uZW50IG9mIHRoaXMuXG4gICAqL1xuICBwdWJsaWMgZ2V0IHooKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5lbGVtZW50c1sgMiBdO1xuICB9XG5cbiAgLyoqXG4gICAqIEFuIHcgY29tcG9uZW50IG9mIHRoaXMuXG4gICAqL1xuICBwdWJsaWMgZ2V0IHcoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5lbGVtZW50c1sgMyBdO1xuICB9XG5cbiAgcHVibGljIHRvU3RyaW5nKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGBRdWF0ZXJuaW9uKCAkeyB0aGlzLngudG9GaXhlZCggMyApIH0sICR7IHRoaXMueS50b0ZpeGVkKCAzICkgfSwgJHsgdGhpcy56LnRvRml4ZWQoIDMgKSB9LCAkeyB0aGlzLncudG9GaXhlZCggMyApIH0gKWA7XG4gIH1cblxuICAvKipcbiAgICogQ2xvbmUgdGhpcy5cbiAgICovXG4gIHB1YmxpYyBjbG9uZSgpOiBRdWF0ZXJuaW9uIHtcbiAgICByZXR1cm4gbmV3IFF1YXRlcm5pb24oIHRoaXMuZWxlbWVudHMuY29uY2F0KCkgYXMgcmF3UXVhdGVybmlvbiApO1xuICB9XG5cbiAgLyoqXG4gICAqIEl0c2VsZiBidXQgY29udmVydGVkIGludG8gYSBNYXRyaXg0LlxuICAgKi9cbiAgcHVibGljIGdldCBtYXRyaXgoKTogTWF0cml4NCB7XG4gICAgY29uc3QgeCA9IG5ldyBWZWN0b3IzKCBbIDEuMCwgMC4wLCAwLjAgXSApLmFwcGx5UXVhdGVybmlvbiggdGhpcyApO1xuICAgIGNvbnN0IHkgPSBuZXcgVmVjdG9yMyggWyAwLjAsIDEuMCwgMC4wIF0gKS5hcHBseVF1YXRlcm5pb24oIHRoaXMgKTtcbiAgICBjb25zdCB6ID0gbmV3IFZlY3RvcjMoIFsgMC4wLCAwLjAsIDEuMCBdICkuYXBwbHlRdWF0ZXJuaW9uKCB0aGlzICk7XG5cbiAgICByZXR1cm4gbmV3IE1hdHJpeDQoIFtcbiAgICAgIHgueCwgeS54LCB6LngsIDAuMCxcbiAgICAgIHgueSwgeS55LCB6LnksIDAuMCxcbiAgICAgIHgueiwgeS56LCB6LnosIDAuMCxcbiAgICAgIDAuMCwgMC4wLCAwLjAsIDEuMFxuICAgIF0gKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBbiBpbnZlcnNlIG9mIHRoaXMuXG4gICAqL1xuICBwdWJsaWMgZ2V0IGludmVyc2VkKCk6IFF1YXRlcm5pb24ge1xuICAgIHJldHVybiBuZXcgUXVhdGVybmlvbiggW1xuICAgICAgLXRoaXMueCxcbiAgICAgIC10aGlzLnksXG4gICAgICAtdGhpcy56LFxuICAgICAgdGhpcy53XG4gICAgXSApO1xuICB9XG5cbiAgLyoqXG4gICAqIE11bHRpcGx5IHR3byBRdWF0ZXJuaW9ucy5cbiAgICogQHBhcmFtIHEgQW5vdGhlciBRdWF0ZXJuaW9uXG4gICAqL1xuICBwdWJsaWMgbXVsdGlwbHkoIHE6IFF1YXRlcm5pb24gKTogUXVhdGVybmlvbiB7XG4gICAgcmV0dXJuIG5ldyBRdWF0ZXJuaW9uKCBbXG4gICAgICB0aGlzLncgKiBxLnggKyB0aGlzLnggKiBxLncgKyB0aGlzLnkgKiBxLnogLSB0aGlzLnogKiBxLnksXG4gICAgICB0aGlzLncgKiBxLnkgLSB0aGlzLnggKiBxLnogKyB0aGlzLnkgKiBxLncgKyB0aGlzLnogKiBxLngsXG4gICAgICB0aGlzLncgKiBxLnogKyB0aGlzLnggKiBxLnkgLSB0aGlzLnkgKiBxLnggKyB0aGlzLnogKiBxLncsXG4gICAgICB0aGlzLncgKiBxLncgLSB0aGlzLnggKiBxLnggLSB0aGlzLnkgKiBxLnkgLSB0aGlzLnogKiBxLnpcbiAgICBdICk7XG4gIH1cblxuICAvKipcbiAgICogQW4gaWRlbnRpdHkgUXVhdGVybmlvbi5cbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgZ2V0IGlkZW50aXR5KCk6IFF1YXRlcm5pb24ge1xuICAgIHJldHVybiBuZXcgUXVhdGVybmlvbiggcmF3SWRlbnRpdHlRdWF0ZXJuaW9uICk7XG4gIH1cblxuICAvKipcbiAgICogR2VuZXJhdGUgYSBRdWF0ZXJuaW9uIG91dCBvZiBhbmdsZSBhbmQgYXhpcy5cbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgZnJvbUF4aXNBbmdsZSggYXhpczogVmVjdG9yMywgYW5nbGU6IG51bWJlciApOiBRdWF0ZXJuaW9uIHtcbiAgICBjb25zdCBoYWxmQW5nbGUgPSBhbmdsZSAvIDIuMDtcbiAgICBjb25zdCBzaW5IYWxmQW5nbGUgPSBNYXRoLnNpbiggaGFsZkFuZ2xlICk7XG4gICAgcmV0dXJuIG5ldyBRdWF0ZXJuaW9uKCBbXG4gICAgICBheGlzLnggKiBzaW5IYWxmQW5nbGUsXG4gICAgICBheGlzLnkgKiBzaW5IYWxmQW5nbGUsXG4gICAgICBheGlzLnogKiBzaW5IYWxmQW5nbGUsXG4gICAgICBNYXRoLmNvcyggaGFsZkFuZ2xlIClcbiAgICBdICk7XG4gIH1cblxuICAvKipcbiAgICogR2VuZXJhdGUgYSBRdWF0ZXJuaW9uIG91dCBvZiBhIHJvdGF0aW9uIG1hdHJpeC5cbiAgICogWW9pbmtlZCBmcm9tIFRocmVlLmpzLlxuICAgKi9cbiAgcHVibGljIHN0YXRpYyBmcm9tTWF0cml4KCBtYXRyaXg6IE1hdHJpeDQgKTogUXVhdGVybmlvbiB7XG4gICAgY29uc3QgbSA9IG1hdHJpeC5lbGVtZW50cyxcbiAgICAgIG0xMSA9IG1bIDAgXSwgbTEyID0gbVsgNCBdLCBtMTMgPSBtWyA4IF0sXG4gICAgICBtMjEgPSBtWyAxIF0sIG0yMiA9IG1bIDUgXSwgbTIzID0gbVsgOSBdLFxuICAgICAgbTMxID0gbVsgMiBdLCBtMzIgPSBtWyA2IF0sIG0zMyA9IG1bIDEwIF0sXG4gICAgICB0cmFjZSA9IG0xMSArIG0yMiArIG0zMztcblxuICAgIGlmICggdHJhY2UgPiAwICkge1xuICAgICAgY29uc3QgcyA9IDAuNSAvIE1hdGguc3FydCggdHJhY2UgKyAxLjAgKTtcbiAgICAgIHJldHVybiBuZXcgUXVhdGVybmlvbiggW1xuICAgICAgICAoIG0zMiAtIG0yMyApICogcyxcbiAgICAgICAgKCBtMTMgLSBtMzEgKSAqIHMsXG4gICAgICAgICggbTIxIC0gbTEyICkgKiBzLFxuICAgICAgICAwLjI1IC8gc1xuICAgICAgXSApO1xuICAgIH0gZWxzZSBpZiAoIG0xMSA+IG0yMiAmJiBtMTEgPiBtMzMgKSB7XG4gICAgICBjb25zdCBzID0gMi4wICogTWF0aC5zcXJ0KCAxLjAgKyBtMTEgLSBtMjIgLSBtMzMgKTtcbiAgICAgIHJldHVybiBuZXcgUXVhdGVybmlvbiggW1xuICAgICAgICAwLjI1ICogcyxcbiAgICAgICAgKCBtMTIgKyBtMjEgKSAvIHMsXG4gICAgICAgICggbTEzICsgbTMxICkgLyBzLFxuICAgICAgICAoIG0zMiAtIG0yMyApIC8gc1xuICAgICAgXSApO1xuICAgIH0gZWxzZSBpZiAoIG0yMiA+IG0zMyApIHtcbiAgICAgIGNvbnN0IHMgPSAyLjAgKiBNYXRoLnNxcnQoIDEuMCArIG0yMiAtIG0xMSAtIG0zMyApO1xuICAgICAgcmV0dXJuIG5ldyBRdWF0ZXJuaW9uKCBbXG4gICAgICAgICggbTEyICsgbTIxICkgLyBzLFxuICAgICAgICAwLjI1ICogcyxcbiAgICAgICAgKCBtMjMgKyBtMzIgKSAvIHMsXG4gICAgICAgICggbTEzIC0gbTMxICkgLyBzXG4gICAgICBdICk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IHMgPSAyLjAgKiBNYXRoLnNxcnQoIDEuMCArIG0zMyAtIG0xMSAtIG0yMiApO1xuICAgICAgcmV0dXJuIG5ldyBRdWF0ZXJuaW9uKCBbXG4gICAgICAgICggbTEzICsgbTMxICkgLyBzLFxuICAgICAgICAoIG0yMyArIG0zMiApIC8gcyxcbiAgICAgICAgMC4yNSAqIHMsXG4gICAgICAgICggbTIxIC0gbTEyICkgLyBzXG4gICAgICBdICk7XG4gICAgfVxuICB9XG59XG4iLCJpbXBvcnQgeyBRdWF0ZXJuaW9uIH0gZnJvbSAnLi9RdWF0ZXJuaW9uJztcbmltcG9ydCB7IFZlY3RvcjMgfSBmcm9tICcuL1ZlY3RvcjMnO1xuXG5leHBvcnQgdHlwZSByYXdNYXRyaXg0ID0gW1xuICBudW1iZXIsIG51bWJlciwgbnVtYmVyLCBudW1iZXIsXG4gIG51bWJlciwgbnVtYmVyLCBudW1iZXIsIG51bWJlcixcbiAgbnVtYmVyLCBudW1iZXIsIG51bWJlciwgbnVtYmVyLFxuICBudW1iZXIsIG51bWJlciwgbnVtYmVyLCBudW1iZXJcbl07XG5cbmV4cG9ydCBjb25zdCByYXdJZGVudGl0eU1hdHJpeDQ6IHJhd01hdHJpeDQgPSBbXG4gIDEuMCwgMC4wLCAwLjAsIDAuMCxcbiAgMC4wLCAxLjAsIDAuMCwgMC4wLFxuICAwLjAsIDAuMCwgMS4wLCAwLjAsXG4gIDAuMCwgMC4wLCAwLjAsIDEuMFxuXTtcblxuLyoqXG4gKiBBIE1hdHJpeDQuXG4gKi9cbmV4cG9ydCBjbGFzcyBNYXRyaXg0IHtcbiAgcHVibGljIGVsZW1lbnRzOiByYXdNYXRyaXg0O1xuXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggdjogcmF3TWF0cml4NCA9IHJhd0lkZW50aXR5TWF0cml4NCApIHtcbiAgICB0aGlzLmVsZW1lbnRzID0gdjtcbiAgfVxuXG4gIC8qKlxuICAgKiBJdHNlbGYgYnV0IHRyYW5zcG9zZWQuXG4gICAqL1xuICBwdWJsaWMgZ2V0IHRyYW5zcG9zZSgpOiBNYXRyaXg0IHtcbiAgICBjb25zdCBtID0gdGhpcy5lbGVtZW50cztcblxuICAgIHJldHVybiBuZXcgTWF0cml4NCggW1xuICAgICAgbVsgMCBdLCBtWyA0IF0sIG1bIDggXSwgbVsgMTIgXSxcbiAgICAgIG1bIDEgXSwgbVsgNSBdLCBtWyA5IF0sIG1bIDEzIF0sXG4gICAgICBtWyAyIF0sIG1bIDYgXSwgbVsgMTAgXSwgbVsgMTQgXSxcbiAgICAgIG1bIDMgXSwgbVsgNyBdLCBtWyAxMSBdLCBtWyAxNSBdXG4gICAgXSApO1xuICB9XG5cbiAgLyoqXG4gICAqIEl0cyBkZXRlcm1pbmFudC5cbiAgICovXG4gIHB1YmxpYyBnZXQgZGV0ZXJtaW5hbnQoKTogbnVtYmVyIHtcbiAgICBjb25zdCBtID0gdGhpcy5lbGVtZW50cztcbiAgICBjb25zdFxuICAgICAgYTAwID0gbVsgIDAgXSwgYTAxID0gbVsgIDEgXSwgYTAyID0gbVsgIDIgXSwgYTAzID0gbVsgIDMgXSxcbiAgICAgIGExMCA9IG1bICA0IF0sIGExMSA9IG1bICA1IF0sIGExMiA9IG1bICA2IF0sIGExMyA9IG1bICA3IF0sXG4gICAgICBhMjAgPSBtWyAgOCBdLCBhMjEgPSBtWyAgOSBdLCBhMjIgPSBtWyAxMCBdLCBhMjMgPSBtWyAxMSBdLFxuICAgICAgYTMwID0gbVsgMTIgXSwgYTMxID0gbVsgMTMgXSwgYTMyID0gbVsgMTQgXSwgYTMzID0gbVsgMTUgXSxcbiAgICAgIGIwMCA9IGEwMCAqIGExMSAtIGEwMSAqIGExMCwgIGIwMSA9IGEwMCAqIGExMiAtIGEwMiAqIGExMCxcbiAgICAgIGIwMiA9IGEwMCAqIGExMyAtIGEwMyAqIGExMCwgIGIwMyA9IGEwMSAqIGExMiAtIGEwMiAqIGExMSxcbiAgICAgIGIwNCA9IGEwMSAqIGExMyAtIGEwMyAqIGExMSwgIGIwNSA9IGEwMiAqIGExMyAtIGEwMyAqIGExMixcbiAgICAgIGIwNiA9IGEyMCAqIGEzMSAtIGEyMSAqIGEzMCwgIGIwNyA9IGEyMCAqIGEzMiAtIGEyMiAqIGEzMCxcbiAgICAgIGIwOCA9IGEyMCAqIGEzMyAtIGEyMyAqIGEzMCwgIGIwOSA9IGEyMSAqIGEzMiAtIGEyMiAqIGEzMSxcbiAgICAgIGIxMCA9IGEyMSAqIGEzMyAtIGEyMyAqIGEzMSwgIGIxMSA9IGEyMiAqIGEzMyAtIGEyMyAqIGEzMjtcblxuICAgIHJldHVybiBiMDAgKiBiMTEgLSBiMDEgKiBiMTAgKyBiMDIgKiBiMDkgKyBiMDMgKiBiMDggLSBiMDQgKiBiMDcgKyBiMDUgKiBiMDY7XG4gIH1cblxuICAvKipcbiAgICogSXRzZWxmIGJ1dCBpbnZlcnRlZC5cbiAgICovXG4gIHB1YmxpYyBnZXQgaW52ZXJzZSgpOiBNYXRyaXg0IHwgbnVsbCB7XG4gICAgY29uc3QgbSA9IHRoaXMuZWxlbWVudHM7XG4gICAgY29uc3RcbiAgICAgIGEwMCA9IG1bICAwIF0sIGEwMSA9IG1bICAxIF0sIGEwMiA9IG1bICAyIF0sIGEwMyA9IG1bICAzIF0sXG4gICAgICBhMTAgPSBtWyAgNCBdLCBhMTEgPSBtWyAgNSBdLCBhMTIgPSBtWyAgNiBdLCBhMTMgPSBtWyAgNyBdLFxuICAgICAgYTIwID0gbVsgIDggXSwgYTIxID0gbVsgIDkgXSwgYTIyID0gbVsgMTAgXSwgYTIzID0gbVsgMTEgXSxcbiAgICAgIGEzMCA9IG1bIDEyIF0sIGEzMSA9IG1bIDEzIF0sIGEzMiA9IG1bIDE0IF0sIGEzMyA9IG1bIDE1IF0sXG4gICAgICBiMDAgPSBhMDAgKiBhMTEgLSBhMDEgKiBhMTAsICBiMDEgPSBhMDAgKiBhMTIgLSBhMDIgKiBhMTAsXG4gICAgICBiMDIgPSBhMDAgKiBhMTMgLSBhMDMgKiBhMTAsICBiMDMgPSBhMDEgKiBhMTIgLSBhMDIgKiBhMTEsXG4gICAgICBiMDQgPSBhMDEgKiBhMTMgLSBhMDMgKiBhMTEsICBiMDUgPSBhMDIgKiBhMTMgLSBhMDMgKiBhMTIsXG4gICAgICBiMDYgPSBhMjAgKiBhMzEgLSBhMjEgKiBhMzAsICBiMDcgPSBhMjAgKiBhMzIgLSBhMjIgKiBhMzAsXG4gICAgICBiMDggPSBhMjAgKiBhMzMgLSBhMjMgKiBhMzAsICBiMDkgPSBhMjEgKiBhMzIgLSBhMjIgKiBhMzEsXG4gICAgICBiMTAgPSBhMjEgKiBhMzMgLSBhMjMgKiBhMzEsICBiMTEgPSBhMjIgKiBhMzMgLSBhMjMgKiBhMzI7XG5cbiAgICBjb25zdCBkZXQgPSBiMDAgKiBiMTEgLSBiMDEgKiBiMTAgKyBiMDIgKiBiMDkgKyBiMDMgKiBiMDggLSBiMDQgKiBiMDcgKyBiMDUgKiBiMDY7XG5cbiAgICBpZiAoIGRldCA9PT0gMC4wICkgeyByZXR1cm4gbnVsbDsgfVxuXG4gICAgY29uc3QgaW52RGV0ID0gMS4wIC8gZGV0O1xuXG4gICAgcmV0dXJuIG5ldyBNYXRyaXg0KCBbXG4gICAgICBhMTEgKiBiMTEgLSBhMTIgKiBiMTAgKyBhMTMgKiBiMDksXG4gICAgICBhMDIgKiBiMTAgLSBhMDEgKiBiMTEgLSBhMDMgKiBiMDksXG4gICAgICBhMzEgKiBiMDUgLSBhMzIgKiBiMDQgKyBhMzMgKiBiMDMsXG4gICAgICBhMjIgKiBiMDQgLSBhMjEgKiBiMDUgLSBhMjMgKiBiMDMsXG4gICAgICBhMTIgKiBiMDggLSBhMTAgKiBiMTEgLSBhMTMgKiBiMDcsXG4gICAgICBhMDAgKiBiMTEgLSBhMDIgKiBiMDggKyBhMDMgKiBiMDcsXG4gICAgICBhMzIgKiBiMDIgLSBhMzAgKiBiMDUgLSBhMzMgKiBiMDEsXG4gICAgICBhMjAgKiBiMDUgLSBhMjIgKiBiMDIgKyBhMjMgKiBiMDEsXG4gICAgICBhMTAgKiBiMTAgLSBhMTEgKiBiMDggKyBhMTMgKiBiMDYsXG4gICAgICBhMDEgKiBiMDggLSBhMDAgKiBiMTAgLSBhMDMgKiBiMDYsXG4gICAgICBhMzAgKiBiMDQgLSBhMzEgKiBiMDIgKyBhMzMgKiBiMDAsXG4gICAgICBhMjEgKiBiMDIgLSBhMjAgKiBiMDQgLSBhMjMgKiBiMDAsXG4gICAgICBhMTEgKiBiMDcgLSBhMTAgKiBiMDkgLSBhMTIgKiBiMDYsXG4gICAgICBhMDAgKiBiMDkgLSBhMDEgKiBiMDcgKyBhMDIgKiBiMDYsXG4gICAgICBhMzEgKiBiMDEgLSBhMzAgKiBiMDMgLSBhMzIgKiBiMDAsXG4gICAgICBhMjAgKiBiMDMgLSBhMjEgKiBiMDEgKyBhMjIgKiBiMDBcbiAgICBdLm1hcCggKCB2ICkgPT4gdiAqIGludkRldCApIGFzIHJhd01hdHJpeDQgKTtcbiAgfVxuXG4gIHB1YmxpYyB0b1N0cmluZygpOiBzdHJpbmcge1xuICAgIGNvbnN0IG0gPSB0aGlzLmVsZW1lbnRzLm1hcCggKCB2ICkgPT4gdi50b0ZpeGVkKCAzICkgKTtcbiAgICByZXR1cm4gYE1hdHJpeDQoICR7IG1bIDAgXSB9LCAkeyBtWyA0IF0gfSwgJHsgbVsgOCBdIH0sICR7IG1bIDEyIF0gfTsgJHsgbVsgMSBdIH0sICR7IG1bIDUgXSB9LCAkeyBtWyA5IF0gfSwgJHsgbVsgMTMgXSB9OyAkeyBtWyAyIF0gfSwgJHsgbVsgNiBdIH0sICR7IG1bIDEwIF0gfSwgJHsgbVsgMTQgXSB9OyAkeyBtWyAzIF0gfSwgJHsgbVsgNyBdIH0sICR7IG1bIDExIF0gfSwgJHsgbVsgMTUgXSB9IClgO1xuICB9XG5cbiAgLyoqXG4gICAqIENsb25lIHRoaXMuXG4gICAqL1xuICBwdWJsaWMgY2xvbmUoKTogTWF0cml4NCB7XG4gICAgcmV0dXJuIG5ldyBNYXRyaXg0KCB0aGlzLmVsZW1lbnRzLmNvbmNhdCgpIGFzIHJhd01hdHJpeDQgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBNdWx0aXBseSB0aGlzIE1hdHJpeDQgYnkgb25lIG9yIG1vcmUgTWF0cml4NHMuXG4gICAqL1xuICBwdWJsaWMgbXVsdGlwbHkoIC4uLm1hdHJpY2VzOiBNYXRyaXg0W10gKTogTWF0cml4NCB7XG4gICAgaWYgKCBtYXRyaWNlcy5sZW5ndGggPT09IDAgKSB7XG4gICAgICByZXR1cm4gdGhpcy5jbG9uZSgpO1xuICAgIH1cblxuICAgIGNvbnN0IGFyciA9IG1hdHJpY2VzLmNvbmNhdCgpO1xuICAgIGxldCBiTWF0ID0gYXJyLnNoaWZ0KCkhO1xuICAgIGlmICggMCA8IGFyci5sZW5ndGggKSB7XG4gICAgICBiTWF0ID0gYk1hdC5tdWx0aXBseSggLi4uYXJyICk7XG4gICAgfVxuXG4gICAgY29uc3QgYSA9IHRoaXMuZWxlbWVudHM7XG4gICAgY29uc3QgYiA9IGJNYXQuZWxlbWVudHM7XG5cbiAgICByZXR1cm4gbmV3IE1hdHJpeDQoIFtcbiAgICAgIGFbIDAgXSAqIGJbIDAgXSArIGFbIDQgXSAqIGJbIDEgXSArIGFbIDggXSAqIGJbIDIgXSArIGFbIDEyIF0gKiBiWyAzIF0sXG4gICAgICBhWyAxIF0gKiBiWyAwIF0gKyBhWyA1IF0gKiBiWyAxIF0gKyBhWyA5IF0gKiBiWyAyIF0gKyBhWyAxMyBdICogYlsgMyBdLFxuICAgICAgYVsgMiBdICogYlsgMCBdICsgYVsgNiBdICogYlsgMSBdICsgYVsgMTAgXSAqIGJbIDIgXSArIGFbIDE0IF0gKiBiWyAzIF0sXG4gICAgICBhWyAzIF0gKiBiWyAwIF0gKyBhWyA3IF0gKiBiWyAxIF0gKyBhWyAxMSBdICogYlsgMiBdICsgYVsgMTUgXSAqIGJbIDMgXSxcblxuICAgICAgYVsgMCBdICogYlsgNCBdICsgYVsgNCBdICogYlsgNSBdICsgYVsgOCBdICogYlsgNiBdICsgYVsgMTIgXSAqIGJbIDcgXSxcbiAgICAgIGFbIDEgXSAqIGJbIDQgXSArIGFbIDUgXSAqIGJbIDUgXSArIGFbIDkgXSAqIGJbIDYgXSArIGFbIDEzIF0gKiBiWyA3IF0sXG4gICAgICBhWyAyIF0gKiBiWyA0IF0gKyBhWyA2IF0gKiBiWyA1IF0gKyBhWyAxMCBdICogYlsgNiBdICsgYVsgMTQgXSAqIGJbIDcgXSxcbiAgICAgIGFbIDMgXSAqIGJbIDQgXSArIGFbIDcgXSAqIGJbIDUgXSArIGFbIDExIF0gKiBiWyA2IF0gKyBhWyAxNSBdICogYlsgNyBdLFxuXG4gICAgICBhWyAwIF0gKiBiWyA4IF0gKyBhWyA0IF0gKiBiWyA5IF0gKyBhWyA4IF0gKiBiWyAxMCBdICsgYVsgMTIgXSAqIGJbIDExIF0sXG4gICAgICBhWyAxIF0gKiBiWyA4IF0gKyBhWyA1IF0gKiBiWyA5IF0gKyBhWyA5IF0gKiBiWyAxMCBdICsgYVsgMTMgXSAqIGJbIDExIF0sXG4gICAgICBhWyAyIF0gKiBiWyA4IF0gKyBhWyA2IF0gKiBiWyA5IF0gKyBhWyAxMCBdICogYlsgMTAgXSArIGFbIDE0IF0gKiBiWyAxMSBdLFxuICAgICAgYVsgMyBdICogYlsgOCBdICsgYVsgNyBdICogYlsgOSBdICsgYVsgMTEgXSAqIGJbIDEwIF0gKyBhWyAxNSBdICogYlsgMTEgXSxcblxuICAgICAgYVsgMCBdICogYlsgMTIgXSArIGFbIDQgXSAqIGJbIDEzIF0gKyBhWyA4IF0gKiBiWyAxNCBdICsgYVsgMTIgXSAqIGJbIDE1IF0sXG4gICAgICBhWyAxIF0gKiBiWyAxMiBdICsgYVsgNSBdICogYlsgMTMgXSArIGFbIDkgXSAqIGJbIDE0IF0gKyBhWyAxMyBdICogYlsgMTUgXSxcbiAgICAgIGFbIDIgXSAqIGJbIDEyIF0gKyBhWyA2IF0gKiBiWyAxMyBdICsgYVsgMTAgXSAqIGJbIDE0IF0gKyBhWyAxNCBdICogYlsgMTUgXSxcbiAgICAgIGFbIDMgXSAqIGJbIDEyIF0gKyBhWyA3IF0gKiBiWyAxMyBdICsgYVsgMTEgXSAqIGJbIDE0IF0gKyBhWyAxNSBdICogYlsgMTUgXVxuICAgIF0gKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBNdWx0aXBseSB0aGlzIE1hdHJpeDQgYnkgYSBzY2FsYXJcbiAgICovXG4gIHB1YmxpYyBzY2FsZVNjYWxhciggc2NhbGFyOiBudW1iZXIgKTogTWF0cml4NCB7XG4gICAgcmV0dXJuIG5ldyBNYXRyaXg0KCB0aGlzLmVsZW1lbnRzLm1hcCggKCB2ICkgPT4gdiAqIHNjYWxhciApIGFzIHJhd01hdHJpeDQgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBbiBpZGVudGl0eSBNYXRyaXg0LlxuICAgKi9cbiAgcHVibGljIHN0YXRpYyBnZXQgaWRlbnRpdHkoKTogTWF0cml4NCB7XG4gICAgcmV0dXJuIG5ldyBNYXRyaXg0KCByYXdJZGVudGl0eU1hdHJpeDQgKTtcbiAgfVxuXG4gIHB1YmxpYyBzdGF0aWMgbXVsdGlwbHkoIC4uLm1hdHJpY2VzOiBNYXRyaXg0W10gKTogTWF0cml4NCB7XG4gICAgaWYgKCBtYXRyaWNlcy5sZW5ndGggPT09IDAgKSB7XG4gICAgICByZXR1cm4gTWF0cml4NC5pZGVudGl0eTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgYk1hdHMgPSBtYXRyaWNlcy5jb25jYXQoKTtcbiAgICAgIGNvbnN0IGFNYXQgPSBiTWF0cy5zaGlmdCgpITtcbiAgICAgIHJldHVybiBhTWF0Lm11bHRpcGx5KCAuLi5iTWF0cyApO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBHZW5lcmF0ZSBhIHRyYW5zbGF0aW9uIG1hdHJpeC5cbiAgICogQHBhcmFtIHZlY3RvciBUcmFuc2xhdGlvblxuICAgKi9cbiAgcHVibGljIHN0YXRpYyB0cmFuc2xhdGUoIHZlY3RvcjogVmVjdG9yMyApOiBNYXRyaXg0IHtcbiAgICByZXR1cm4gbmV3IE1hdHJpeDQoIFtcbiAgICAgIDEsIDAsIDAsIDAsXG4gICAgICAwLCAxLCAwLCAwLFxuICAgICAgMCwgMCwgMSwgMCxcbiAgICAgIHZlY3Rvci54LCB2ZWN0b3IueSwgdmVjdG9yLnosIDFcbiAgICBdICk7XG4gIH1cblxuICAvKipcbiAgICogR2VuZXJhdGUgYSAzZCBzY2FsaW5nIG1hdHJpeC5cbiAgICogQHBhcmFtIHZlY3RvciBTY2FsZVxuICAgKi9cbiAgcHVibGljIHN0YXRpYyBzY2FsZSggdmVjdG9yOiBWZWN0b3IzICk6IE1hdHJpeDQge1xuICAgIHJldHVybiBuZXcgTWF0cml4NCggW1xuICAgICAgdmVjdG9yLngsIDAsIDAsIDAsXG4gICAgICAwLCB2ZWN0b3IueSwgMCwgMCxcbiAgICAgIDAsIDAsIHZlY3Rvci56LCAwLFxuICAgICAgMCwgMCwgMCwgMVxuICAgIF0gKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZW5lcmF0ZSBhIDNkIHNjYWxpbmcgbWF0cml4IGJ5IGEgc2NhbGFyLlxuICAgKiBAcGFyYW0gdmVjdG9yIFNjYWxlXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIHNjYWxlU2NhbGFyKCBzY2FsYXI6IG51bWJlciApOiBNYXRyaXg0IHtcbiAgICByZXR1cm4gbmV3IE1hdHJpeDQoIFtcbiAgICAgIHNjYWxhciwgMCwgMCwgMCxcbiAgICAgIDAsIHNjYWxhciwgMCwgMCxcbiAgICAgIDAsIDAsIHNjYWxhciwgMCxcbiAgICAgIDAsIDAsIDAsIDFcbiAgICBdICk7XG4gIH1cblxuICAvKipcbiAgICogR2VuZXJhdGUgYSAzZCByb3RhdGlvbiBtYXRyaXgsIHJvdGF0ZXMgYXJvdW5kIHggYXhpcy5cbiAgICogQHBhcmFtIHZlY3RvciBTY2FsZVxuICAgKi9cbiAgcHVibGljIHN0YXRpYyByb3RhdGVYKCB0aGV0YTogbnVtYmVyICk6IE1hdHJpeDQge1xuICAgIHJldHVybiBuZXcgTWF0cml4NCggW1xuICAgICAgMSwgMCwgMCwgMCxcbiAgICAgIDAsIE1hdGguY29zKCB0aGV0YSApLCAtTWF0aC5zaW4oIHRoZXRhICksIDAsXG4gICAgICAwLCBNYXRoLnNpbiggdGhldGEgKSwgTWF0aC5jb3MoIHRoZXRhICksIDAsXG4gICAgICAwLCAwLCAwLCAxXG4gICAgXSApO1xuICB9XG5cbiAgLyoqXG4gICAqIEdlbmVyYXRlIGEgM2Qgcm90YXRpb24gbWF0cml4LCByb3RhdGVzIGFyb3VuZCB5IGF4aXMuXG4gICAqIEBwYXJhbSB2ZWN0b3IgU2NhbGVcbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgcm90YXRlWSggdGhldGE6IG51bWJlciApOiBNYXRyaXg0IHtcbiAgICByZXR1cm4gbmV3IE1hdHJpeDQoIFtcbiAgICAgIE1hdGguY29zKCB0aGV0YSApLCAwLCBNYXRoLnNpbiggdGhldGEgKSwgMCxcbiAgICAgIDAsIDEsIDAsIDAsXG4gICAgICAtTWF0aC5zaW4oIHRoZXRhICksIDAsIE1hdGguY29zKCB0aGV0YSApLCAwLFxuICAgICAgMCwgMCwgMCwgMVxuICAgIF0gKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZW5lcmF0ZSBhIDNkIHJvdGF0aW9uIG1hdHJpeCwgcm90YXRlcyBhcm91bmQgeiBheGlzLlxuICAgKiBAcGFyYW0gdmVjdG9yIFNjYWxlXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIHJvdGF0ZVooIHRoZXRhOiBudW1iZXIgKTogTWF0cml4NCB7XG4gICAgcmV0dXJuIG5ldyBNYXRyaXg0KCBbXG4gICAgICBNYXRoLmNvcyggdGhldGEgKSwgLU1hdGguc2luKCB0aGV0YSApLCAwLCAwLFxuICAgICAgTWF0aC5zaW4oIHRoZXRhICksIE1hdGguY29zKCB0aGV0YSApLCAwLCAwLFxuICAgICAgMCwgMCwgMSwgMCxcbiAgICAgIDAsIDAsIDAsIDFcbiAgICBdICk7XG4gIH1cblxuICAvKipcbiAgICogR2VuZXJhdGUgYSBcIkxvb2tBdFwiIG1hdHJpeC5cbiAgICpcbiAgICogU2VlIGFsc286IHtAbGluayBsb29rQXRJbnZlcnNlfVxuICAgKi9cbiAgcHVibGljIHN0YXRpYyBsb29rQXQoXG4gICAgcG9zaXRpb246IFZlY3RvcjMsXG4gICAgdGFyZ2V0ID0gbmV3IFZlY3RvcjMoIFsgMC4wLCAwLjAsIDAuMCBdICksXG4gICAgdXAgPSBuZXcgVmVjdG9yMyggWyAwLjAsIDEuMCwgMC4wIF0gKSxcbiAgICByb2xsID0gMC4wXG4gICk6IE1hdHJpeDQge1xuICAgIGNvbnN0IGRpciA9IHBvc2l0aW9uLnN1YiggdGFyZ2V0ICkubm9ybWFsaXplZDtcbiAgICBsZXQgc2lkID0gdXAuY3Jvc3MoIGRpciApLm5vcm1hbGl6ZWQ7XG4gICAgbGV0IHRvcCA9IGRpci5jcm9zcyggc2lkICk7XG4gICAgc2lkID0gc2lkLnNjYWxlKCBNYXRoLmNvcyggcm9sbCApICkuYWRkKCB0b3Auc2NhbGUoIE1hdGguc2luKCByb2xsICkgKSApO1xuICAgIHRvcCA9IGRpci5jcm9zcyggc2lkICk7XG5cbiAgICByZXR1cm4gbmV3IE1hdHJpeDQoIFtcbiAgICAgIHNpZC54LCBzaWQueSwgc2lkLnosIDAuMCxcbiAgICAgIHRvcC54LCB0b3AueSwgdG9wLnosIDAuMCxcbiAgICAgIGRpci54LCBkaXIueSwgZGlyLnosIDAuMCxcbiAgICAgIHBvc2l0aW9uLngsIHBvc2l0aW9uLnksIHBvc2l0aW9uLnosIDEuMFxuICAgIF0gKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZW5lcmF0ZSBhbiBpbnZlcnNlIG9mIFwiTG9va0F0XCIgbWF0cml4LiBHb29kIGZvciBjcmVhdGluZyBhIHZpZXcgbWF0cml4LlxuICAgKlxuICAgKiBTZWUgYWxzbzoge0BsaW5rIGxvb2tBdH1cbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgbG9va0F0SW52ZXJzZShcbiAgICBwb3NpdGlvbjogVmVjdG9yMyxcbiAgICB0YXJnZXQgPSBuZXcgVmVjdG9yMyggWyAwLjAsIDAuMCwgMC4wIF0gKSxcbiAgICB1cCA9IG5ldyBWZWN0b3IzKCBbIDAuMCwgMS4wLCAwLjAgXSApLFxuICAgIHJvbGwgPSAwLjBcbiAgKTogTWF0cml4NCB7XG4gICAgY29uc3QgZGlyID0gcG9zaXRpb24uc3ViKCB0YXJnZXQgKS5ub3JtYWxpemVkO1xuICAgIGxldCBzaWQgPSB1cC5jcm9zcyggZGlyICkubm9ybWFsaXplZDtcbiAgICBsZXQgdG9wID0gZGlyLmNyb3NzKCBzaWQgKTtcbiAgICBzaWQgPSBzaWQuc2NhbGUoIE1hdGguY29zKCByb2xsICkgKS5hZGQoIHRvcC5zY2FsZSggTWF0aC5zaW4oIHJvbGwgKSApICk7XG4gICAgdG9wID0gZGlyLmNyb3NzKCBzaWQgKTtcblxuICAgIHJldHVybiBuZXcgTWF0cml4NCggW1xuICAgICAgc2lkLngsIHRvcC54LCBkaXIueCwgMC4wLFxuICAgICAgc2lkLnksIHRvcC55LCBkaXIueSwgMC4wLFxuICAgICAgc2lkLnosIHRvcC56LCBkaXIueiwgMC4wLFxuICAgICAgLXNpZC54ICogcG9zaXRpb24ueCAtIHNpZC55ICogcG9zaXRpb24ueSAtIHNpZC56ICogcG9zaXRpb24ueixcbiAgICAgIC10b3AueCAqIHBvc2l0aW9uLnggLSB0b3AueSAqIHBvc2l0aW9uLnkgLSB0b3AueiAqIHBvc2l0aW9uLnosXG4gICAgICAtZGlyLnggKiBwb3NpdGlvbi54IC0gZGlyLnkgKiBwb3NpdGlvbi55IC0gZGlyLnogKiBwb3NpdGlvbi56LFxuICAgICAgMS4wXG4gICAgXSApO1xuICB9XG5cbiAgLyoqXG4gICAqIEdlbmVyYXRlIGEgXCJQZXJzcGVjdGl2ZVwiIHByb2plY3Rpb24gbWF0cml4LlxuICAgKiBJdCB3b24ndCBpbmNsdWRlIGFzcGVjdCFcbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgcGVyc3BlY3RpdmUoIGZvdiA9IDQ1LjAsIG5lYXIgPSAwLjAxLCBmYXIgPSAxMDAuMCApOiBNYXRyaXg0IHtcbiAgICBjb25zdCBwID0gMS4wIC8gTWF0aC50YW4oIGZvdiAqIE1hdGguUEkgLyAzNjAuMCApO1xuICAgIGNvbnN0IGQgPSAoIGZhciAtIG5lYXIgKTtcbiAgICByZXR1cm4gbmV3IE1hdHJpeDQoIFtcbiAgICAgIHAsIDAuMCwgMC4wLCAwLjAsXG4gICAgICAwLjAsIHAsIDAuMCwgMC4wLFxuICAgICAgMC4wLCAwLjAsIC0oIGZhciArIG5lYXIgKSAvIGQsIC0xLjAsXG4gICAgICAwLjAsIDAuMCwgLTIgKiBmYXIgKiBuZWFyIC8gZCwgMC4wXG4gICAgXSApO1xuICB9XG5cbiAgLyoqXG4gICAqIERlY29tcG9zZSB0aGlzIG1hdHJpeCBpbnRvIGEgcG9zaXRpb24sIGEgc2NhbGUsIGFuZCBhIHJvdGF0aW9uLlxuICAgKiBZb2lua2VkIGZyb20gVGhyZWUuanMuXG4gICAqL1xuICBwdWJsaWMgZGVjb21wb3NlKCk6IHsgcG9zaXRpb246IFZlY3RvcjM7IHNjYWxlOiBWZWN0b3IzOyByb3RhdGlvbjogUXVhdGVybmlvbiB9IHtcbiAgICBjb25zdCBtID0gdGhpcy5lbGVtZW50cztcblxuICAgIGxldCBzeCA9IG5ldyBWZWN0b3IzKCBbIG1bIDAgXSwgbVsgMSBdLCBtWyAyIF0gXSApLmxlbmd0aDtcbiAgICBjb25zdCBzeSA9IG5ldyBWZWN0b3IzKCBbIG1bIDQgXSwgbVsgNSBdLCBtWyA2IF0gXSApLmxlbmd0aDtcbiAgICBjb25zdCBzeiA9IG5ldyBWZWN0b3IzKCBbIG1bIDggXSwgbVsgOSBdLCBtWyAxMCBdIF0gKS5sZW5ndGg7XG5cbiAgICAvLyBpZiBkZXRlcm1pbmUgaXMgbmVnYXRpdmUsIHdlIG5lZWQgdG8gaW52ZXJ0IG9uZSBzY2FsZVxuICAgIGNvbnN0IGRldCA9IHRoaXMuZGV0ZXJtaW5hbnQ7XG4gICAgaWYgKCBkZXQgPCAwICkgeyBzeCA9IC1zeDsgfVxuXG4gICAgY29uc3QgaW52U3ggPSAxLjAgLyBzeDtcbiAgICBjb25zdCBpbnZTeSA9IDEuMCAvIHN5O1xuICAgIGNvbnN0IGludlN6ID0gMS4wIC8gc3o7XG5cbiAgICBjb25zdCByb3RhdGlvbk1hdHJpeCA9IHRoaXMuY2xvbmUoKTtcblxuICAgIHJvdGF0aW9uTWF0cml4LmVsZW1lbnRzWyAwIF0gKj0gaW52U3g7XG4gICAgcm90YXRpb25NYXRyaXguZWxlbWVudHNbIDEgXSAqPSBpbnZTeDtcbiAgICByb3RhdGlvbk1hdHJpeC5lbGVtZW50c1sgMiBdICo9IGludlN4O1xuXG4gICAgcm90YXRpb25NYXRyaXguZWxlbWVudHNbIDQgXSAqPSBpbnZTeTtcbiAgICByb3RhdGlvbk1hdHJpeC5lbGVtZW50c1sgNSBdICo9IGludlN5O1xuICAgIHJvdGF0aW9uTWF0cml4LmVsZW1lbnRzWyA2IF0gKj0gaW52U3k7XG5cbiAgICByb3RhdGlvbk1hdHJpeC5lbGVtZW50c1sgOCBdICo9IGludlN6O1xuICAgIHJvdGF0aW9uTWF0cml4LmVsZW1lbnRzWyA5IF0gKj0gaW52U3o7XG4gICAgcm90YXRpb25NYXRyaXguZWxlbWVudHNbIDEwIF0gKj0gaW52U3o7XG5cbiAgICByZXR1cm4ge1xuICAgICAgcG9zaXRpb246IG5ldyBWZWN0b3IzKCBbIG1bIDEyIF0sIG1bIDEzIF0sIG1bIDE0IF0gXSApLFxuICAgICAgc2NhbGU6IG5ldyBWZWN0b3IzKCBbIHN4LCBzeSwgc3ogXSApLFxuICAgICAgcm90YXRpb246IFF1YXRlcm5pb24uZnJvbU1hdHJpeCggcm90YXRpb25NYXRyaXggKVxuICAgIH07XG4gIH1cblxuICAvKipcbiAgICogQ29tcG9zZSBhIG1hdHJpeCBvdXQgb2YgcG9zaXRpb24sIHNjYWxlLCBhbmQgcm90YXRpb24uXG4gICAqIFlvaW5rZWQgZnJvbSBUaHJlZS5qcy5cbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgY29tcG9zZSggcG9zaXRpb246IFZlY3RvcjMsIHJvdGF0aW9uOiBRdWF0ZXJuaW9uLCBzY2FsZTogVmVjdG9yMyApOiBNYXRyaXg0IHtcbiAgICBjb25zdCB4ID0gcm90YXRpb24ueCwgeSA9IHJvdGF0aW9uLnksIHogPSByb3RhdGlvbi56LCB3ID0gcm90YXRpb24udztcbiAgICBjb25zdCB4MiA9IHggKyB4LFx0eTIgPSB5ICsgeSwgejIgPSB6ICsgejtcbiAgICBjb25zdCB4eCA9IHggKiB4MiwgeHkgPSB4ICogeTIsIHh6ID0geCAqIHoyO1xuICAgIGNvbnN0IHl5ID0geSAqIHkyLCB5eiA9IHkgKiB6MiwgenogPSB6ICogejI7XG4gICAgY29uc3Qgd3ggPSB3ICogeDIsIHd5ID0gdyAqIHkyLCB3eiA9IHcgKiB6MjtcbiAgICBjb25zdCBzeCA9IHNjYWxlLngsIHN5ID0gc2NhbGUueSwgc3ogPSBzY2FsZS56O1xuXG4gICAgcmV0dXJuIG5ldyBNYXRyaXg0KCBbXG4gICAgICAoIDEuMCAtICggeXkgKyB6eiApICkgKiBzeCxcbiAgICAgICggeHkgKyB3eiApICogc3gsXG4gICAgICAoIHh6IC0gd3kgKSAqIHN4LFxuICAgICAgMC4wLFxuXG4gICAgICAoIHh5IC0gd3ogKSAqIHN5LFxuICAgICAgKCAxLjAgLSAoIHh4ICsgenogKSApICogc3ksXG4gICAgICAoIHl6ICsgd3ggKSAqIHN5LFxuICAgICAgMC4wLFxuXG4gICAgICAoIHh6ICsgd3kgKSAqIHN6LFxuICAgICAgKCB5eiAtIHd4ICkgKiBzeixcbiAgICAgICggMS4wIC0gKCB4eCArIHl5ICkgKSAqIHN6LFxuICAgICAgMC4wLFxuXG4gICAgICBwb3NpdGlvbi54LFxuICAgICAgcG9zaXRpb24ueSxcbiAgICAgIHBvc2l0aW9uLnosXG4gICAgICAxLjBcbiAgICBdICk7XG4gIH1cbn1cbiIsImltcG9ydCB7IE1hdHJpeDQgfSBmcm9tICcuL01hdHJpeDQnO1xuaW1wb3J0IHsgVmVjdG9yIH0gZnJvbSAnLi9WZWN0b3InO1xuXG5leHBvcnQgdHlwZSByYXdWZWN0b3I0ID0gWyBudW1iZXIsIG51bWJlciwgbnVtYmVyLCBudW1iZXIgXTtcblxuLyoqXG4gKiBBIFZlY3RvcjMuXG4gKi9cbmV4cG9ydCBjbGFzcyBWZWN0b3I0IGV4dGVuZHMgVmVjdG9yPFZlY3RvcjQ+IHtcbiAgcHVibGljIGVsZW1lbnRzOiByYXdWZWN0b3I0O1xuXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggdjogcmF3VmVjdG9yNCA9IFsgMC4wLCAwLjAsIDAuMCwgMC4wIF0gKSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLmVsZW1lbnRzID0gdjtcbiAgfVxuXG4gIC8qKlxuICAgKiBBbiB4IGNvbXBvbmVudCBvZiB0aGlzLlxuICAgKi9cbiAgcHVibGljIGdldCB4KCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuZWxlbWVudHNbIDAgXTtcbiAgfVxuXG4gIHB1YmxpYyBzZXQgeCggeDogbnVtYmVyICkge1xuICAgIHRoaXMuZWxlbWVudHNbIDAgXSA9IHg7XG4gIH1cblxuICAvKipcbiAgICogQSB5IGNvbXBvbmVudCBvZiB0aGlzLlxuICAgKi9cbiAgcHVibGljIGdldCB5KCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuZWxlbWVudHNbIDEgXTtcbiAgfVxuXG4gIHB1YmxpYyBzZXQgeSggeTogbnVtYmVyICkge1xuICAgIHRoaXMuZWxlbWVudHNbIDEgXSA9IHk7XG4gIH1cblxuICAvKipcbiAgICogQSB6IGNvbXBvbmVudCBvZiB0aGlzLlxuICAgKi9cbiAgcHVibGljIGdldCB6KCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuZWxlbWVudHNbIDIgXTtcbiAgfVxuXG4gIHB1YmxpYyBzZXQgeiggejogbnVtYmVyICkge1xuICAgIHRoaXMuZWxlbWVudHNbIDIgXSA9IHo7XG4gIH1cblxuICAvKipcbiAgICogQSB3IGNvbXBvbmVudCBvZiB0aGlzLlxuICAgKi9cbiAgcHVibGljIGdldCB3KCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuZWxlbWVudHNbIDMgXTtcbiAgfVxuXG4gIHB1YmxpYyBzZXQgdyggejogbnVtYmVyICkge1xuICAgIHRoaXMuZWxlbWVudHNbIDMgXSA9IHo7XG4gIH1cblxuICBwdWJsaWMgdG9TdHJpbmcoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gYFZlY3RvcjQoICR7IHRoaXMueC50b0ZpeGVkKCAzICkgfSwgJHsgdGhpcy55LnRvRml4ZWQoIDMgKSB9LCAkeyB0aGlzLnoudG9GaXhlZCggMyApIH0sICR7IHRoaXMudy50b0ZpeGVkKCAzICkgfSApYDtcbiAgfVxuXG4gIC8qKlxuICAgKiBNdWx0aXBseSB0aGlzIHZlY3RvciAod2l0aCBhbiBpbXBsaWNpdCAxIGluIHRoZSA0dGggZGltZW5zaW9uKSBieSBtLlxuICAgKi9cbiAgcHVibGljIGFwcGx5TWF0cml4NCggbWF0cml4OiBNYXRyaXg0ICk6IFZlY3RvcjQge1xuICAgIGNvbnN0IG0gPSBtYXRyaXguZWxlbWVudHM7XG5cbiAgICByZXR1cm4gbmV3IFZlY3RvcjQoIFtcbiAgICAgIG1bIDAgXSAqIHRoaXMueCArIG1bIDQgXSAqIHRoaXMueSArIG1bIDggXSAqIHRoaXMueiArIG1bIDEyIF0gKiB0aGlzLncsXG4gICAgICBtWyAxIF0gKiB0aGlzLnggKyBtWyA1IF0gKiB0aGlzLnkgKyBtWyA5IF0gKiB0aGlzLnogKyBtWyAxMyBdICogdGhpcy53LFxuICAgICAgbVsgMiBdICogdGhpcy54ICsgbVsgNiBdICogdGhpcy55ICsgbVsgMTAgXSAqIHRoaXMueiArIG1bIDE0IF0gKiB0aGlzLncsXG4gICAgICBtWyAzIF0gKiB0aGlzLnggKyBtWyA3IF0gKiB0aGlzLnkgKyBtWyAxMSBdICogdGhpcy56ICsgbVsgMTUgXSAqIHRoaXMud1xuICAgIF0gKTtcbiAgfVxuXG4gIHByb3RlY3RlZCBfX25ldyggdjogcmF3VmVjdG9yNCApOiBWZWN0b3I0IHtcbiAgICByZXR1cm4gbmV3IFZlY3RvcjQoIHYgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBWZWN0b3I0KCAwLjAsIDAuMCwgMC4wLCAwLjAgKVxuICAgKi9cbiAgcHVibGljIHN0YXRpYyBnZXQgemVybygpOiBWZWN0b3I0IHtcbiAgICByZXR1cm4gbmV3IFZlY3RvcjQoIFsgMC4wLCAwLjAsIDAuMCwgMC4wIF0gKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBWZWN0b3I0KCAxLjAsIDEuMCwgMS4wLCAxLjAgKVxuICAgKi9cbiAgcHVibGljIHN0YXRpYyBnZXQgb25lKCk6IFZlY3RvcjQge1xuICAgIHJldHVybiBuZXcgVmVjdG9yNCggWyAxLjAsIDEuMCwgMS4wLCAxLjAgXSApO1xuICB9XG59XG4iLCIvKipcbiAqIFVzZWZ1bCBmb3Igc3dhcCBidWZmZXJcbiAqL1xuZXhwb3J0IGNsYXNzIFN3YXA8VD4ge1xuICBwdWJsaWMgaTogVDtcbiAgcHVibGljIG86IFQ7XG5cbiAgcHVibGljIGNvbnN0cnVjdG9yKCBhOiBULCBiOiBUICkge1xuICAgIHRoaXMuaSA9IGE7XG4gICAgdGhpcy5vID0gYjtcbiAgfVxuXG4gIHB1YmxpYyBzd2FwKCk6IHZvaWQge1xuICAgIGNvbnN0IGkgPSB0aGlzLmk7XG4gICAgdGhpcy5pID0gdGhpcy5vO1xuICAgIHRoaXMubyA9IGk7XG4gIH1cbn1cbiIsImltcG9ydCB7IEhpc3RvcnlNZWFuQ2FsY3VsYXRvciB9IGZyb20gJy4uL0hpc3RvcnlNZWFuQ2FsY3VsYXRvci9IaXN0b3J5TWVhbkNhbGN1bGF0b3InO1xuXG5leHBvcnQgY2xhc3MgVGFwVGVtcG8ge1xuICBwcml2YXRlIF9fYnBtID0gMC4wO1xuICBwcml2YXRlIF9fbGFzdFRhcCA9IDAuMDtcbiAgcHJpdmF0ZSBfX2xhc3RCZWF0ID0gMC4wO1xuICBwcml2YXRlIF9fbGFzdFRpbWUgPSAwLjA7XG4gIHByaXZhdGUgX19jYWxjOiBIaXN0b3J5TWVhbkNhbGN1bGF0b3IgPSBuZXcgSGlzdG9yeU1lYW5DYWxjdWxhdG9yKCAxNiApO1xuXG4gIHB1YmxpYyBnZXQgYmVhdER1cmF0aW9uKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIDYwLjAgLyB0aGlzLl9fYnBtO1xuICB9XG5cbiAgcHVibGljIGdldCBicG0oKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5fX2JwbTtcbiAgfVxuXG4gIHB1YmxpYyBzZXQgYnBtKCBicG06IG51bWJlciApIHtcbiAgICB0aGlzLl9fbGFzdEJlYXQgPSB0aGlzLmJlYXQ7XG4gICAgdGhpcy5fX2xhc3RUaW1lID0gcGVyZm9ybWFuY2Uubm93KCk7XG4gICAgdGhpcy5fX2JwbSA9IGJwbTtcbiAgfVxuXG4gIHB1YmxpYyBnZXQgYmVhdCgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLl9fbGFzdEJlYXQgKyAoIHBlcmZvcm1hbmNlLm5vdygpIC0gdGhpcy5fX2xhc3RUaW1lICkgKiAwLjAwMSAvIHRoaXMuYmVhdER1cmF0aW9uO1xuICB9XG5cbiAgcHVibGljIHJlc2V0KCk6IHZvaWQge1xuICAgIHRoaXMuX19jYWxjLnJlc2V0KCk7XG4gIH1cblxuICBwdWJsaWMgbnVkZ2UoIGFtb3VudDogbnVtYmVyICk6IHZvaWQge1xuICAgIHRoaXMuX19sYXN0QmVhdCA9IHRoaXMuYmVhdCArIGFtb3VudDtcbiAgICB0aGlzLl9fbGFzdFRpbWUgPSBwZXJmb3JtYW5jZS5ub3coKTtcbiAgfVxuXG4gIHB1YmxpYyB0YXAoKTogdm9pZCB7XG4gICAgY29uc3Qgbm93ID0gcGVyZm9ybWFuY2Uubm93KCk7XG4gICAgY29uc3QgZGVsdGEgPSAoIG5vdyAtIHRoaXMuX19sYXN0VGFwICkgKiAwLjAwMTtcblxuICAgIGlmICggMi4wIDwgZGVsdGEgKSB7XG4gICAgICB0aGlzLnJlc2V0KCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX19jYWxjLnB1c2goIGRlbHRhICk7XG4gICAgICB0aGlzLl9fYnBtID0gNjAuMCAvICggdGhpcy5fX2NhbGMubWVhbiApO1xuICAgIH1cblxuICAgIHRoaXMuX19sYXN0VGFwID0gbm93O1xuICAgIHRoaXMuX19sYXN0VGltZSA9IG5vdztcbiAgICB0aGlzLl9fbGFzdEJlYXQgPSAwLjA7XG4gIH1cbn1cbiIsImV4cG9ydCBjbGFzcyBYb3JzaGlmdCB7XG4gIHB1YmxpYyBzZWVkOiBudW1iZXI7XG5cbiAgcHVibGljIGNvbnN0cnVjdG9yKCBzZWVkPzogbnVtYmVyICkge1xuICAgIHRoaXMuc2VlZCA9IHNlZWQgfHwgMTtcbiAgfVxuXG4gIHB1YmxpYyBnZW4oIHNlZWQ/OiBudW1iZXIgKTogbnVtYmVyIHtcbiAgICBpZiAoIHNlZWQgKSB7XG4gICAgICB0aGlzLnNlZWQgPSBzZWVkO1xuICAgIH1cblxuICAgIHRoaXMuc2VlZCA9IHRoaXMuc2VlZCBeICggdGhpcy5zZWVkIDw8IDEzICk7XG4gICAgdGhpcy5zZWVkID0gdGhpcy5zZWVkIF4gKCB0aGlzLnNlZWQgPj4+IDE3ICk7XG4gICAgdGhpcy5zZWVkID0gdGhpcy5zZWVkIF4gKCB0aGlzLnNlZWQgPDwgNSApO1xuICAgIHJldHVybiB0aGlzLnNlZWQgLyBNYXRoLnBvdyggMiwgMzIgKSArIDAuNTtcbiAgfVxuXG4gIHB1YmxpYyBzZXQoIHNlZWQ/OiBudW1iZXIgKTogdm9pZCB7XG4gICAgdGhpcy5zZWVkID0gc2VlZCB8fCB0aGlzLnNlZWQgfHwgMTtcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBYb3JzaGlmdDtcbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztJQUFB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O2dCQUNFLElBQU0sQ0FBQyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUM7Z0JBQ3hCLElBQ0UsR0FBRyxHQUFHLENBQUMsQ0FBRyxDQUFDLENBQUUsRUFBRSxHQUFHLEdBQUcsQ0FBQyxDQUFHLENBQUMsQ0FBRSxFQUFFLEdBQUcsR0FBRyxDQUFDLENBQUcsQ0FBQyxDQUFFLEVBQUUsR0FBRyxHQUFHLENBQUMsQ0FBRyxDQUFDLENBQUUsRUFDMUQsR0FBRyxHQUFHLENBQUMsQ0FBRyxDQUFDLENBQUUsRUFBRSxHQUFHLEdBQUcsQ0FBQyxDQUFHLENBQUMsQ0FBRSxFQUFFLEdBQUcsR0FBRyxDQUFDLENBQUcsQ0FBQyxDQUFFLEVBQUUsR0FBRyxHQUFHLENBQUMsQ0FBRyxDQUFDLENBQUUsRUFDMUQsR0FBRyxHQUFHLENBQUMsQ0FBRyxDQUFDLENBQUUsRUFBRSxHQUFHLEdBQUcsQ0FBQyxDQUFHLENBQUMsQ0FBRSxFQUFFLEdBQUcsR0FBRyxDQUFDLENBQUUsRUFBRSxDQUFFLEVBQUUsR0FBRyxHQUFHLENBQUMsQ0FBRSxFQUFFLENBQUUsRUFDMUQsR0FBRyxHQUFHLENBQUMsQ0FBRSxFQUFFLENBQUUsRUFBRSxHQUFHLEdBQUcsQ0FBQyxDQUFFLEVBQUUsQ0FBRSxFQUFFLEdBQUcsR0FBRyxDQUFDLENBQUUsRUFBRSxDQUFFLEVBQUUsR0FBRyxHQUFHLENBQUMsQ0FBRSxFQUFFLENBQUUsRUFDMUQsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsRUFBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxFQUN6RCxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxFQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEVBQ3pELEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEVBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsRUFDekQsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsRUFBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxFQUN6RCxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxFQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEVBQ3pELEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEVBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQztnQkFFNUQsT0FBTyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQzthQUM5RTs7O1dBQUE7UUFLRCxzQkFBVyw0QkFBTzs7OztpQkFBbEI7Z0JBQ0UsSUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQztnQkFDeEIsSUFDRSxHQUFHLEdBQUcsQ0FBQyxDQUFHLENBQUMsQ0FBRSxFQUFFLEdBQUcsR0FBRyxDQUFDLENBQUcsQ0FBQyxDQUFFLEVBQUUsR0FBRyxHQUFHLENBQUMsQ0FBRyxDQUFDLENBQUUsRUFBRSxHQUFHLEdBQUcsQ0FBQyxDQUFHLENBQUMsQ0FBRSxFQUMxRCxHQUFHLEdBQUcsQ0FBQyxDQUFHLENBQUMsQ0FBRSxFQUFFLEdBQUcsR0FBRyxDQUFDLENBQUcsQ0FBQyxDQUFFLEVBQUUsR0FBRyxHQUFHLENBQUMsQ0FBRyxDQUFDLENBQUUsRUFBRSxHQUFHLEdBQUcsQ0FBQyxDQUFHLENBQUMsQ0FBRSxFQUMxRCxHQUFHLEdBQUcsQ0FBQyxDQUFHLENBQUMsQ0FBRSxFQUFFLEdBQUcsR0FBRyxDQUFDLENBQUcsQ0FBQyxDQUFFLEVBQUUsR0FBRyxHQUFHLENBQUMsQ0FBRSxFQUFFLENBQUUsRUFBRSxHQUFHLEdBQUcsQ0FBQyxDQUFFLEVBQUUsQ0FBRSxFQUMxRCxHQUFHLEdBQUcsQ0FBQyxDQUFFLEVBQUUsQ0FBRSxFQUFFLEdBQUcsR0FBRyxDQUFDLENBQUUsRUFBRSxDQUFFLEVBQUUsR0FBRyxHQUFHLENBQUMsQ0FBRSxFQUFFLENBQUUsRUFBRSxHQUFHLEdBQUcsQ0FBQyxDQUFFLEVBQUUsQ0FBRSxFQUMxRCxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxFQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEVBQ3pELEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEVBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsRUFDekQsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsRUFBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxFQUN6RCxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxFQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEVBQ3pELEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEVBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsRUFDekQsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsRUFBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDO2dCQUU1RCxJQUFNLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxH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QUFHLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLEVBQUUsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUU7Z0JBQ3RFLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsRUFBRSxDQUFFLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxFQUFFLENBQUUsR0FBRyxDQUFDLENBQUUsQ0FBQyxDQUFFO2dCQUN2RSxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLEVBQUUsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsRUFBRSxDQUFFLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRTtnQkFFdkUsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLEVBQUUsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUU7Z0JBQ3RFLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxFQUFFLENBQUUsR0FBRyxDQUFDLENBQUUsQ0FBQyxDQUFFO2dCQUN0RSxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLEVBQUUsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsRUFBRSxDQUFFLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRTtnQkFDdkUsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxFQUFFLENBQUUsR0FBRyxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLEVBQUUsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUU7Z0JBRXZFLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLEVBQUUsQ0FBRSxHQUFHLENBQUMsQ0FBRSxFQUFFLENBQUUsR0FBRyxDQUFDLENBQUUsRUFBRSxDQUFFO2dCQUN4RSxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxFQUFFLENBQUUsR0FBRyxDQUFDLENBQUUsRUFBRSxDQUFFLEdBQUcsQ0FBQyxDQUFFLEVBQUUsQ0FBRTtnQkFDeEUsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxFQUFFLENBQUUsR0FBRyxDQUFDLENBQUUsRUFBRSxDQUFFLEdBQUcsQ0FBQyxDQUFFLEVBQUUsQ0FBRSxHQUFHLENBQUMsQ0FBRSxFQUFFLENBQUU7Z0JBQ3pFLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsRUFBRSxDQUFFLEdBQUcsQ0FBQyxDQUFFLEVBQUUsQ0FBRSxHQUFHLENBQUMsQ0FBRSxFQUFFLENBQUUsR0FBRyxDQUFDLENBQUUsRUFBRSxDQUFFO2dCQUV6RSxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLEVBQUUsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsRUFBRSxDQUFFLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxFQUFFLENBQUUsR0FBRyxDQUFDLENBQUUsRUFBRSxDQUFFLEdBQUcsQ0FBQyxDQUFFLEVBQUUsQ0FBRTtnQkFDMUUsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxFQUFFLENBQUUsR0FBRyxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLEVBQUUsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsRUFBRSxDQUFFLEdBQUcsQ0FBQyxDQUFFLEVBQUUsQ0FBRSxHQUFHLENBQUMsQ0FBRSxFQUFFLENBQUU7Z0JBQzFFLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsRUFBRSxDQUFFLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxFQUFFLENBQUUsR0FBRyxDQUFDLENBQUUsRUFBRSxDQUFFLEdBQUcsQ0FBQyxDQUFFLEVBQUUsQ0FBRSxHQUFHLENBQUMsQ0FBRSxFQUFFLENBQUUs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
