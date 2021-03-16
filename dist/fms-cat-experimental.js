/*!
* @fms-cat/experimental v0.5.1
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
            return binarySearch(array, function (element) { return (element <= elementOrCompare); });
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm1zLWNhdC1leHBlcmltZW50YWwuanMiLCJzb3VyY2VzIjpbIi4uL3NyYy9hbGdvcml0aG0vYmluYXJ5U2VhcmNoLnRzIiwiLi4vc3JjL2FycmF5L2NvbnN0YW50cy50cyIsIi4uL3NyYy9hcnJheS91dGlscy50cyIsIi4uL3NyYy9DRFMvQ0RTLnRzIiwiLi4vc3JjL0Nsb2NrL0Nsb2NrLnRzIiwiLi4vbm9kZV9tb2R1bGVzL3RzbGliL3RzbGliLmVzNi5qcyIsIi4uL3NyYy9DbG9jay9DbG9ja0ZyYW1lLnRzIiwiLi4vc3JjL0Nsb2NrL0Nsb2NrUmVhbHRpbWUudHMiLCIuLi9zcmMvZWR0L2VkdC50cyIsIi4uL3NyYy9tYXRoL3V0aWxzLnRzIiwiLi4vc3JjL0V4cFNtb290aC9FeHBTbW9vdGgudHMiLCIuLi9zcmMvRml6ekJ1enovRml6ekJ1enoudHMiLCIuLi9zcmMvRk1TX0NhdC9GTVNfQ2F0LnRzIiwiLi4vc3JjL0hpc3RvcnlNZWFuQ2FsY3VsYXRvci9IaXN0b3J5TWVhbkNhbGN1bGF0b3IudHMiLCIuLi9zcmMvSGlzdG9yeU1lYW5DYWxjdWxhdG9yL0hpc3RvcnlQZXJjZW50aWxlQ2FsY3VsYXRvci50cyIsIi4uL3NyYy9IaXN0b3J5TWVhbkNhbGN1bGF0b3IvSGlzdG9yeU1lZGlhbkNhbGN1bGF0b3IudHMiLCIuLi9zcmMvbWF0aC9WZWN0b3IudHMiLCIuLi9zcmMvbWF0aC9WZWN0b3IzLnRzIiwiLi4vc3JjL21hdGgvUXVhdGVybmlvbi50cyIsIi4uL3NyYy9tYXRoL01hdHJpeDQudHMiLCIuLi9zcmMvbWF0aC9WZWN0b3I0LnRzIiwiLi4vc3JjL1N3YXAvU3dhcC50cyIsIi4uL3NyYy9UYXBUZW1wby9UYXBUZW1wby50cyIsIi4uL3NyYy9Yb3JzaGlmdC9Yb3JzaGlmdC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyB5b2lua2VkIGZyb20gaHR0cHM6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMTM0NDUwMC9lZmZpY2llbnQtd2F5LXRvLWluc2VydC1hLW51bWJlci1pbnRvLWEtc29ydGVkLWFycmF5LW9mLW51bWJlcnNcblxuLyoqXG4gKiBMb29rIGZvciBhbiBpbmRleCBmcm9tIGEgc29ydGVkIGxpc3QgdXNpbmcgdGhlIGJpbmFyeSBzZWFyY2guXG4gKiBAcGFyYW0gYXJyYXkgQSBzb3J0ZWQgYXJyYXlcbiAqIEBwYXJhbSBjb21wYXJlIE1ha2UgdGhpcyBmdW5jdGlvbiByZXR1cm4gYGZhbHNlYCBpZiB5b3Ugd2FudCB0byBwb2ludCByaWdodCBzaWRlIG9mIGdpdmVuIGVsZW1lbnQsIGB0cnVlYCBpZiB5b3Ugd2FudCB0byBwb2ludCBsZWZ0IHNpZGUgb2YgZ2l2ZW4gZWxlbWVudC5cbiAqIEByZXR1cm5zIEFuIGluZGV4IGZvdW5kXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBiaW5hcnlTZWFyY2g8VD4oIGFycmF5OiBBcnJheUxpa2U8VD4sIGVsZW1lbnQ6IFQgKTogbnVtYmVyO1xuZXhwb3J0IGZ1bmN0aW9uIGJpbmFyeVNlYXJjaDxUPiggYXJyYXk6IEFycmF5TGlrZTxUPiwgY29tcGFyZTogKCBlbGVtZW50OiBUICkgPT4gYm9vbGVhbiApOiBudW1iZXI7XG5leHBvcnQgZnVuY3Rpb24gYmluYXJ5U2VhcmNoPFQ+KFxuICBhcnJheTogQXJyYXlMaWtlPFQ+LFxuICBlbGVtZW50T3JDb21wYXJlOiBUIHwgKCAoIGVsZW1lbnQ6IFQgKSA9PiBib29sZWFuICksXG4pOiBudW1iZXIge1xuICBpZiAoIHR5cGVvZiBlbGVtZW50T3JDb21wYXJlICE9PSAnZnVuY3Rpb24nICkge1xuICAgIHJldHVybiBiaW5hcnlTZWFyY2goIGFycmF5LCAoIGVsZW1lbnQgKSA9PiAoIGVsZW1lbnQgPD0gZWxlbWVudE9yQ29tcGFyZSApICk7XG4gIH1cbiAgY29uc3QgY29tcGFyZSA9IGVsZW1lbnRPckNvbXBhcmUgYXMgKCBlbGVtZW50OiBUICkgPT4gYm9vbGVhbjtcblxuICBsZXQgc3RhcnQgPSAwO1xuICBsZXQgZW5kID0gYXJyYXkubGVuZ3RoO1xuXG4gIHdoaWxlICggc3RhcnQgPCBlbmQgKSB7XG4gICAgY29uc3QgY2VudGVyID0gKCBzdGFydCArIGVuZCApID4+IDE7XG4gICAgY29uc3QgY2VudGVyRWxlbWVudCA9IGFycmF5WyBjZW50ZXIgXTtcblxuICAgIGNvbnN0IGNvbXBhcmVSZXN1bHQgPSBjb21wYXJlKCBjZW50ZXJFbGVtZW50ICk7XG5cbiAgICBpZiAoIGNvbXBhcmVSZXN1bHQgKSB7XG4gICAgICBzdGFydCA9IGNlbnRlciArIDE7XG4gICAgfSBlbHNlIHtcbiAgICAgIGVuZCA9IGNlbnRlcjtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gc3RhcnQ7XG59XG4iLCIvKipcbiAqIGBbIC0xLCAtMSwgMSwgLTEsIC0xLCAxLCAxLCAxIF1gXG4gKi9cbmV4cG9ydCBjb25zdCBUUklBTkdMRV9TVFJJUF9RVUFEID0gWyAtMSwgLTEsIDEsIC0xLCAtMSwgMSwgMSwgMSBdO1xuXG4vKipcbiAqIGBbIC0xLCAtMSwgMCwgMSwgLTEsIDAsIC0xLCAxLCAwLCAxLCAxLCAwIF1gXG4gKi9cbmV4cG9ydCBjb25zdCBUUklBTkdMRV9TVFJJUF9RVUFEXzNEID0gWyAtMSwgLTEsIDAsIDEsIC0xLCAwLCAtMSwgMSwgMCwgMSwgMSwgMCBdO1xuXG4vKipcbiAqIGBbIDAsIDAsIDEsIDAsIDAsIDEsIDAsIDAsIDEsIDAsIDAsIDEgXWBcbiAqL1xuZXhwb3J0IGNvbnN0IFRSSUFOR0xFX1NUUklQX1FVQURfTk9STUFMID0gWyAwLCAwLCAxLCAwLCAwLCAxLCAwLCAwLCAxLCAwLCAwLCAxIF07XG5cbi8qKlxuICogYFsgMCwgMCwgMSwgMCwgMCwgMSwgMSwgMSBdYFxuICovXG5leHBvcnQgY29uc3QgVFJJQU5HTEVfU1RSSVBfUVVBRF9VViA9IFsgMCwgMCwgMSwgMCwgMCwgMSwgMSwgMSBdO1xuIiwiLyoqXG4gKiBTaHVmZmxlIGdpdmVuIGBhcnJheWAgdXNpbmcgZ2l2ZW4gYGRpY2VgIFJORy4gKipEZXN0cnVjdGl2ZSoqLlxuICovXG5leHBvcnQgZnVuY3Rpb24gc2h1ZmZsZUFycmF5PFQ+KCBhcnJheTogVFtdLCBkaWNlPzogKCkgPT4gbnVtYmVyICk6IFRbXSB7XG4gIGNvbnN0IGYgPSBkaWNlID8gZGljZSA6ICgpID0+IE1hdGgucmFuZG9tKCk7XG4gIGZvciAoIGxldCBpID0gMDsgaSA8IGFycmF5Lmxlbmd0aCAtIDE7IGkgKysgKSB7XG4gICAgY29uc3QgaXIgPSBpICsgTWF0aC5mbG9vciggZigpICogKCBhcnJheS5sZW5ndGggLSBpICkgKTtcbiAgICBjb25zdCB0ZW1wID0gYXJyYXlbIGlyIF07XG4gICAgYXJyYXlbIGlyIF0gPSBhcnJheVsgaSBdO1xuICAgIGFycmF5WyBpIF0gPSB0ZW1wO1xuICB9XG4gIHJldHVybiBhcnJheTtcbn1cblxuLyoqXG4gKiBJIGxpa2Ugd2lyZWZyYW1lXG4gKlxuICogYHRyaUluZGV4VG9MaW5lSW5kZXgoIFsgMCwgMSwgMiwgNSwgNiwgNyBdIClgIC0+IGBbIDAsIDEsIDEsIDIsIDIsIDAsIDUsIDYsIDYsIDcsIDcsIDUgXWBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHRyaUluZGV4VG9MaW5lSW5kZXg8VD4oIGFycmF5OiBUW10gKTogVFtdIHtcbiAgY29uc3QgcmV0OiBUW10gPSBbXTtcbiAgZm9yICggbGV0IGkgPSAwOyBpIDwgYXJyYXkubGVuZ3RoIC8gMzsgaSArKyApIHtcbiAgICBjb25zdCBoZWFkID0gaSAqIDM7XG4gICAgcmV0LnB1c2goXG4gICAgICBhcnJheVsgaGVhZCAgICAgXSwgYXJyYXlbIGhlYWQgKyAxIF0sXG4gICAgICBhcnJheVsgaGVhZCArIDEgXSwgYXJyYXlbIGhlYWQgKyAyIF0sXG4gICAgICBhcnJheVsgaGVhZCArIDIgXSwgYXJyYXlbIGhlYWQgICAgIF1cbiAgICApO1xuICB9XG4gIHJldHVybiByZXQ7XG59XG5cbi8qKlxuICogYG1hdHJpeDJkKCAzLCAyIClgIC0+IGBbIDAsIDAsIDAsIDEsIDAsIDIsIDEsIDAsIDEsIDEsIDEsIDIgXWBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG1hdHJpeDJkKCB3OiBudW1iZXIsIGg6IG51bWJlciApOiBudW1iZXJbXSB7XG4gIGNvbnN0IGFycjogbnVtYmVyW10gPSBbXTtcbiAgZm9yICggbGV0IGl5ID0gMDsgaXkgPCBoOyBpeSArKyApIHtcbiAgICBmb3IgKCBsZXQgaXggPSAwOyBpeCA8IHc7IGl4ICsrICkge1xuICAgICAgYXJyLnB1c2goIGl4LCBpeSApO1xuICAgIH1cbiAgfVxuICByZXR1cm4gYXJyO1xufVxuIiwiLyoqXG4gKiBDcml0aWNhbGx5IERhbXBlZCBTcHJpbmdcbiAqXG4gKiBTaG91dG91dHMgdG8gS2VpamlybyBUYWthaGFzaGlcbiAqL1xuZXhwb3J0IGNsYXNzIENEUyB7XG4gIHB1YmxpYyBmYWN0b3IgPSAxMDAuMDtcbiAgcHVibGljIHJhdGlvID0gMS4wO1xuICBwdWJsaWMgdmVsb2NpdHkgPSAwLjA7XG4gIHB1YmxpYyB2YWx1ZSA9IDAuMDtcbiAgcHVibGljIHRhcmdldCA9IDAuMDtcblxuICBwdWJsaWMgdXBkYXRlKCBkZWx0YVRpbWU6IG51bWJlciApOiBudW1iZXIge1xuICAgIHRoaXMudmVsb2NpdHkgKz0gKFxuICAgICAgLXRoaXMuZmFjdG9yICogKCB0aGlzLnZhbHVlIC0gdGhpcy50YXJnZXQgKVxuICAgICAgLSAyLjAgKiB0aGlzLnZlbG9jaXR5ICogTWF0aC5zcXJ0KCB0aGlzLmZhY3RvciApICogdGhpcy5yYXRpb1xuICAgICkgKiBkZWx0YVRpbWU7XG4gICAgdGhpcy52YWx1ZSArPSB0aGlzLnZlbG9jaXR5ICogZGVsdGFUaW1lO1xuICAgIHJldHVybiB0aGlzLnZhbHVlO1xuICB9XG59XG4iLCIvKipcbiAqIENsYXNzIHRoYXQgZGVhbHMgd2l0aCB0aW1lLlxuICogSW4gdGhpcyBiYXNlIGNsYXNzLCB5b3UgbmVlZCB0byBzZXQgdGltZSBtYW51YWxseSBmcm9tIGBBdXRvbWF0b24udXBkYXRlKClgLlxuICogQmVzdCBmb3Igc3luYyB3aXRoIGV4dGVybmFsIGNsb2NrIHN0dWZmLlxuICovXG5leHBvcnQgY2xhc3MgQ2xvY2sge1xuICAvKipcbiAgICogSXRzIGN1cnJlbnQgdGltZS5cbiAgICovXG4gIHByb3RlY3RlZCBfX3RpbWUgPSAwLjA7XG5cbiAgLyoqXG4gICAqIEl0cyBkZWx0YVRpbWUgb2YgbGFzdCB1cGRhdGUuXG4gICAqL1xuICBwcm90ZWN0ZWQgX19kZWx0YVRpbWUgPSAwLjA7XG5cbiAgLyoqXG4gICAqIFdoZXRoZXIgaXRzIGN1cnJlbnRseSBwbGF5aW5nIG9yIG5vdC5cbiAgICovXG4gIHByb3RlY3RlZCBfX2lzUGxheWluZyA9IGZhbHNlO1xuXG4gIC8qKlxuICAgKiBJdHMgY3VycmVudCB0aW1lLlxuICAgKi9cbiAgcHVibGljIGdldCB0aW1lKCk6IG51bWJlciB7IHJldHVybiB0aGlzLl9fdGltZTsgfVxuXG4gIC8qKlxuICAgKiBJdHMgZGVsdGFUaW1lIG9mIGxhc3QgdXBkYXRlLlxuICAgKi9cbiAgcHVibGljIGdldCBkZWx0YVRpbWUoKTogbnVtYmVyIHsgcmV0dXJuIHRoaXMuX19kZWx0YVRpbWU7IH1cblxuICAvKipcbiAgICogV2hldGhlciBpdHMgY3VycmVudGx5IHBsYXlpbmcgb3Igbm90LlxuICAgKi9cbiAgcHVibGljIGdldCBpc1BsYXlpbmcoKTogYm9vbGVhbiB7IHJldHVybiB0aGlzLl9faXNQbGF5aW5nOyB9XG5cbiAgLyoqXG4gICAqIFVwZGF0ZSB0aGUgY2xvY2suXG4gICAqIEBwYXJhbSB0aW1lIFRpbWUuIFlvdSBuZWVkIHRvIHNldCBtYW51YWxseSB3aGVuIHlvdSBhcmUgdXNpbmcgbWFudWFsIENsb2NrXG4gICAqL1xuICBwdWJsaWMgdXBkYXRlKCB0aW1lPzogbnVtYmVyICk6IHZvaWQge1xuICAgIGNvbnN0IHByZXZUaW1lID0gdGhpcy5fX3RpbWU7XG4gICAgdGhpcy5fX3RpbWUgPSB0aW1lIHx8IDAuMDtcbiAgICB0aGlzLl9fZGVsdGFUaW1lID0gdGhpcy5fX3RpbWUgLSBwcmV2VGltZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTdGFydCB0aGUgY2xvY2suXG4gICAqL1xuICBwdWJsaWMgcGxheSgpOiB2b2lkIHtcbiAgICB0aGlzLl9faXNQbGF5aW5nID0gdHJ1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTdG9wIHRoZSBjbG9jay5cbiAgICovXG4gIHB1YmxpYyBwYXVzZSgpOiB2b2lkIHtcbiAgICB0aGlzLl9faXNQbGF5aW5nID0gZmFsc2U7XG4gIH1cblxuICAvKipcbiAgICogU2V0IHRoZSB0aW1lIG1hbnVhbGx5LlxuICAgKiBAcGFyYW0gdGltZSBUaW1lXG4gICAqL1xuICBwdWJsaWMgc2V0VGltZSggdGltZTogbnVtYmVyICk6IHZvaWQge1xuICAgIHRoaXMuX190aW1lID0gdGltZTtcbiAgfVxufVxuIiwiLyohICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXHJcbkNvcHlyaWdodCAoYykgTWljcm9zb2Z0IENvcnBvcmF0aW9uLlxyXG5cclxuUGVybWlzc2lvbiB0byB1c2UsIGNvcHksIG1vZGlmeSwgYW5kL29yIGRpc3RyaWJ1dGUgdGhpcyBzb2Z0d2FyZSBmb3IgYW55XHJcbnB1cnBvc2Ugd2l0aCBvciB3aXRob3V0IGZlZSBpcyBoZXJlYnkgZ3JhbnRlZC5cclxuXHJcblRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIgQU5EIFRIRSBBVVRIT1IgRElTQ0xBSU1TIEFMTCBXQVJSQU5USUVTIFdJVEhcclxuUkVHQVJEIFRPIFRISVMgU09GVFdBUkUgSU5DTFVESU5HIEFMTCBJTVBMSUVEIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZXHJcbkFORCBGSVRORVNTLiBJTiBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SIEJFIExJQUJMRSBGT1IgQU5ZIFNQRUNJQUwsIERJUkVDVCxcclxuSU5ESVJFQ1QsIE9SIENPTlNFUVVFTlRJQUwgREFNQUdFUyBPUiBBTlkgREFNQUdFUyBXSEFUU09FVkVSIFJFU1VMVElORyBGUk9NXHJcbkxPU1MgT0YgVVNFLCBEQVRBIE9SIFBST0ZJVFMsIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBORUdMSUdFTkNFIE9SXHJcbk9USEVSIFRPUlRJT1VTIEFDVElPTiwgQVJJU0lORyBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBVU0UgT1JcclxuUEVSRk9STUFOQ0UgT0YgVEhJUyBTT0ZUV0FSRS5cclxuKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogKi9cclxuLyogZ2xvYmFsIFJlZmxlY3QsIFByb21pc2UgKi9cclxuXHJcbnZhciBleHRlbmRTdGF0aWNzID0gZnVuY3Rpb24oZCwgYikge1xyXG4gICAgZXh0ZW5kU3RhdGljcyA9IE9iamVjdC5zZXRQcm90b3R5cGVPZiB8fFxyXG4gICAgICAgICh7IF9fcHJvdG9fXzogW10gfSBpbnN0YW5jZW9mIEFycmF5ICYmIGZ1bmN0aW9uIChkLCBiKSB7IGQuX19wcm90b19fID0gYjsgfSkgfHxcclxuICAgICAgICBmdW5jdGlvbiAoZCwgYikgeyBmb3IgKHZhciBwIGluIGIpIGlmIChiLmhhc093blByb3BlcnR5KHApKSBkW3BdID0gYltwXTsgfTtcclxuICAgIHJldHVybiBleHRlbmRTdGF0aWNzKGQsIGIpO1xyXG59O1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fZXh0ZW5kcyhkLCBiKSB7XHJcbiAgICBleHRlbmRTdGF0aWNzKGQsIGIpO1xyXG4gICAgZnVuY3Rpb24gX18oKSB7IHRoaXMuY29uc3RydWN0b3IgPSBkOyB9XHJcbiAgICBkLnByb3RvdHlwZSA9IGIgPT09IG51bGwgPyBPYmplY3QuY3JlYXRlKGIpIDogKF9fLnByb3RvdHlwZSA9IGIucHJvdG90eXBlLCBuZXcgX18oKSk7XHJcbn1cclxuXHJcbmV4cG9ydCB2YXIgX19hc3NpZ24gPSBmdW5jdGlvbigpIHtcclxuICAgIF9fYXNzaWduID0gT2JqZWN0LmFzc2lnbiB8fCBmdW5jdGlvbiBfX2Fzc2lnbih0KSB7XHJcbiAgICAgICAgZm9yICh2YXIgcywgaSA9IDEsIG4gPSBhcmd1bWVudHMubGVuZ3RoOyBpIDwgbjsgaSsrKSB7XHJcbiAgICAgICAgICAgIHMgPSBhcmd1bWVudHNbaV07XHJcbiAgICAgICAgICAgIGZvciAodmFyIHAgaW4gcykgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChzLCBwKSkgdFtwXSA9IHNbcF07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0O1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIF9fYXNzaWduLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX3Jlc3QocywgZSkge1xyXG4gICAgdmFyIHQgPSB7fTtcclxuICAgIGZvciAodmFyIHAgaW4gcykgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChzLCBwKSAmJiBlLmluZGV4T2YocCkgPCAwKVxyXG4gICAgICAgIHRbcF0gPSBzW3BdO1xyXG4gICAgaWYgKHMgIT0gbnVsbCAmJiB0eXBlb2YgT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scyA9PT0gXCJmdW5jdGlvblwiKVxyXG4gICAgICAgIGZvciAodmFyIGkgPSAwLCBwID0gT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scyhzKTsgaSA8IHAubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgaWYgKGUuaW5kZXhPZihwW2ldKSA8IDAgJiYgT2JqZWN0LnByb3RvdHlwZS5wcm9wZXJ0eUlzRW51bWVyYWJsZS5jYWxsKHMsIHBbaV0pKVxyXG4gICAgICAgICAgICAgICAgdFtwW2ldXSA9IHNbcFtpXV07XHJcbiAgICAgICAgfVxyXG4gICAgcmV0dXJuIHQ7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2RlY29yYXRlKGRlY29yYXRvcnMsIHRhcmdldCwga2V5LCBkZXNjKSB7XHJcbiAgICB2YXIgYyA9IGFyZ3VtZW50cy5sZW5ndGgsIHIgPSBjIDwgMyA/IHRhcmdldCA6IGRlc2MgPT09IG51bGwgPyBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcih0YXJnZXQsIGtleSkgOiBkZXNjLCBkO1xyXG4gICAgaWYgKHR5cGVvZiBSZWZsZWN0ID09PSBcIm9iamVjdFwiICYmIHR5cGVvZiBSZWZsZWN0LmRlY29yYXRlID09PSBcImZ1bmN0aW9uXCIpIHIgPSBSZWZsZWN0LmRlY29yYXRlKGRlY29yYXRvcnMsIHRhcmdldCwga2V5LCBkZXNjKTtcclxuICAgIGVsc2UgZm9yICh2YXIgaSA9IGRlY29yYXRvcnMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIGlmIChkID0gZGVjb3JhdG9yc1tpXSkgciA9IChjIDwgMyA/IGQocikgOiBjID4gMyA/IGQodGFyZ2V0LCBrZXksIHIpIDogZCh0YXJnZXQsIGtleSkpIHx8IHI7XHJcbiAgICByZXR1cm4gYyA+IDMgJiYgciAmJiBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBrZXksIHIpLCByO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19wYXJhbShwYXJhbUluZGV4LCBkZWNvcmF0b3IpIHtcclxuICAgIHJldHVybiBmdW5jdGlvbiAodGFyZ2V0LCBrZXkpIHsgZGVjb3JhdG9yKHRhcmdldCwga2V5LCBwYXJhbUluZGV4KTsgfVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19tZXRhZGF0YShtZXRhZGF0YUtleSwgbWV0YWRhdGFWYWx1ZSkge1xyXG4gICAgaWYgKHR5cGVvZiBSZWZsZWN0ID09PSBcIm9iamVjdFwiICYmIHR5cGVvZiBSZWZsZWN0Lm1ldGFkYXRhID09PSBcImZ1bmN0aW9uXCIpIHJldHVybiBSZWZsZWN0Lm1ldGFkYXRhKG1ldGFkYXRhS2V5LCBtZXRhZGF0YVZhbHVlKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fYXdhaXRlcih0aGlzQXJnLCBfYXJndW1lbnRzLCBQLCBnZW5lcmF0b3IpIHtcclxuICAgIGZ1bmN0aW9uIGFkb3B0KHZhbHVlKSB7IHJldHVybiB2YWx1ZSBpbnN0YW5jZW9mIFAgPyB2YWx1ZSA6IG5ldyBQKGZ1bmN0aW9uIChyZXNvbHZlKSB7IHJlc29sdmUodmFsdWUpOyB9KTsgfVxyXG4gICAgcmV0dXJuIG5ldyAoUCB8fCAoUCA9IFByb21pc2UpKShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XHJcbiAgICAgICAgZnVuY3Rpb24gZnVsZmlsbGVkKHZhbHVlKSB7IHRyeSB7IHN0ZXAoZ2VuZXJhdG9yLm5leHQodmFsdWUpKTsgfSBjYXRjaCAoZSkgeyByZWplY3QoZSk7IH0gfVxyXG4gICAgICAgIGZ1bmN0aW9uIHJlamVjdGVkKHZhbHVlKSB7IHRyeSB7IHN0ZXAoZ2VuZXJhdG9yW1widGhyb3dcIl0odmFsdWUpKTsgfSBjYXRjaCAoZSkgeyByZWplY3QoZSk7IH0gfVxyXG4gICAgICAgIGZ1bmN0aW9uIHN0ZXAocmVzdWx0KSB7IHJlc3VsdC5kb25lID8gcmVzb2x2ZShyZXN1bHQudmFsdWUpIDogYWRvcHQocmVzdWx0LnZhbHVlKS50aGVuKGZ1bGZpbGxlZCwgcmVqZWN0ZWQpOyB9XHJcbiAgICAgICAgc3RlcCgoZ2VuZXJhdG9yID0gZ2VuZXJhdG9yLmFwcGx5KHRoaXNBcmcsIF9hcmd1bWVudHMgfHwgW10pKS5uZXh0KCkpO1xyXG4gICAgfSk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2dlbmVyYXRvcih0aGlzQXJnLCBib2R5KSB7XHJcbiAgICB2YXIgXyA9IHsgbGFiZWw6IDAsIHNlbnQ6IGZ1bmN0aW9uKCkgeyBpZiAodFswXSAmIDEpIHRocm93IHRbMV07IHJldHVybiB0WzFdOyB9LCB0cnlzOiBbXSwgb3BzOiBbXSB9LCBmLCB5LCB0LCBnO1xyXG4gICAgcmV0dXJuIGcgPSB7IG5leHQ6IHZlcmIoMCksIFwidGhyb3dcIjogdmVyYigxKSwgXCJyZXR1cm5cIjogdmVyYigyKSB9LCB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgKGdbU3ltYm9sLml0ZXJhdG9yXSA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gdGhpczsgfSksIGc7XHJcbiAgICBmdW5jdGlvbiB2ZXJiKG4pIHsgcmV0dXJuIGZ1bmN0aW9uICh2KSB7IHJldHVybiBzdGVwKFtuLCB2XSk7IH07IH1cclxuICAgIGZ1bmN0aW9uIHN0ZXAob3ApIHtcclxuICAgICAgICBpZiAoZikgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkdlbmVyYXRvciBpcyBhbHJlYWR5IGV4ZWN1dGluZy5cIik7XHJcbiAgICAgICAgd2hpbGUgKF8pIHRyeSB7XHJcbiAgICAgICAgICAgIGlmIChmID0gMSwgeSAmJiAodCA9IG9wWzBdICYgMiA/IHlbXCJyZXR1cm5cIl0gOiBvcFswXSA/IHlbXCJ0aHJvd1wiXSB8fCAoKHQgPSB5W1wicmV0dXJuXCJdKSAmJiB0LmNhbGwoeSksIDApIDogeS5uZXh0KSAmJiAhKHQgPSB0LmNhbGwoeSwgb3BbMV0pKS5kb25lKSByZXR1cm4gdDtcclxuICAgICAgICAgICAgaWYgKHkgPSAwLCB0KSBvcCA9IFtvcFswXSAmIDIsIHQudmFsdWVdO1xyXG4gICAgICAgICAgICBzd2l0Y2ggKG9wWzBdKSB7XHJcbiAgICAgICAgICAgICAgICBjYXNlIDA6IGNhc2UgMTogdCA9IG9wOyBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgNDogXy5sYWJlbCsrOyByZXR1cm4geyB2YWx1ZTogb3BbMV0sIGRvbmU6IGZhbHNlIH07XHJcbiAgICAgICAgICAgICAgICBjYXNlIDU6IF8ubGFiZWwrKzsgeSA9IG9wWzFdOyBvcCA9IFswXTsgY29udGludWU7XHJcbiAgICAgICAgICAgICAgICBjYXNlIDc6IG9wID0gXy5vcHMucG9wKCk7IF8udHJ5cy5wb3AoKTsgY29udGludWU7XHJcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgICAgIGlmICghKHQgPSBfLnRyeXMsIHQgPSB0Lmxlbmd0aCA+IDAgJiYgdFt0Lmxlbmd0aCAtIDFdKSAmJiAob3BbMF0gPT09IDYgfHwgb3BbMF0gPT09IDIpKSB7IF8gPSAwOyBjb250aW51ZTsgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChvcFswXSA9PT0gMyAmJiAoIXQgfHwgKG9wWzFdID4gdFswXSAmJiBvcFsxXSA8IHRbM10pKSkgeyBfLmxhYmVsID0gb3BbMV07IGJyZWFrOyB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG9wWzBdID09PSA2ICYmIF8ubGFiZWwgPCB0WzFdKSB7IF8ubGFiZWwgPSB0WzFdOyB0ID0gb3A7IGJyZWFrOyB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHQgJiYgXy5sYWJlbCA8IHRbMl0pIHsgXy5sYWJlbCA9IHRbMl07IF8ub3BzLnB1c2gob3ApOyBicmVhazsgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0WzJdKSBfLm9wcy5wb3AoKTtcclxuICAgICAgICAgICAgICAgICAgICBfLnRyeXMucG9wKCk7IGNvbnRpbnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIG9wID0gYm9keS5jYWxsKHRoaXNBcmcsIF8pO1xyXG4gICAgICAgIH0gY2F0Y2ggKGUpIHsgb3AgPSBbNiwgZV07IHkgPSAwOyB9IGZpbmFsbHkgeyBmID0gdCA9IDA7IH1cclxuICAgICAgICBpZiAob3BbMF0gJiA1KSB0aHJvdyBvcFsxXTsgcmV0dXJuIHsgdmFsdWU6IG9wWzBdID8gb3BbMV0gOiB2b2lkIDAsIGRvbmU6IHRydWUgfTtcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IHZhciBfX2NyZWF0ZUJpbmRpbmcgPSBPYmplY3QuY3JlYXRlID8gKGZ1bmN0aW9uKG8sIG0sIGssIGsyKSB7XHJcbiAgICBpZiAoazIgPT09IHVuZGVmaW5lZCkgazIgPSBrO1xyXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG8sIGsyLCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZnVuY3Rpb24oKSB7IHJldHVybiBtW2tdOyB9IH0pO1xyXG59KSA6IChmdW5jdGlvbihvLCBtLCBrLCBrMikge1xyXG4gICAgaWYgKGsyID09PSB1bmRlZmluZWQpIGsyID0gaztcclxuICAgIG9bazJdID0gbVtrXTtcclxufSk7XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19leHBvcnRTdGFyKG0sIGV4cG9ydHMpIHtcclxuICAgIGZvciAodmFyIHAgaW4gbSkgaWYgKHAgIT09IFwiZGVmYXVsdFwiICYmICFleHBvcnRzLmhhc093blByb3BlcnR5KHApKSBfX2NyZWF0ZUJpbmRpbmcoZXhwb3J0cywgbSwgcCk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX3ZhbHVlcyhvKSB7XHJcbiAgICB2YXIgcyA9IHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiBTeW1ib2wuaXRlcmF0b3IsIG0gPSBzICYmIG9bc10sIGkgPSAwO1xyXG4gICAgaWYgKG0pIHJldHVybiBtLmNhbGwobyk7XHJcbiAgICBpZiAobyAmJiB0eXBlb2Ygby5sZW5ndGggPT09IFwibnVtYmVyXCIpIHJldHVybiB7XHJcbiAgICAgICAgbmV4dDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBpZiAobyAmJiBpID49IG8ubGVuZ3RoKSBvID0gdm9pZCAwO1xyXG4gICAgICAgICAgICByZXR1cm4geyB2YWx1ZTogbyAmJiBvW2krK10sIGRvbmU6ICFvIH07XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIHRocm93IG5ldyBUeXBlRXJyb3IocyA/IFwiT2JqZWN0IGlzIG5vdCBpdGVyYWJsZS5cIiA6IFwiU3ltYm9sLml0ZXJhdG9yIGlzIG5vdCBkZWZpbmVkLlwiKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fcmVhZChvLCBuKSB7XHJcbiAgICB2YXIgbSA9IHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiBvW1N5bWJvbC5pdGVyYXRvcl07XHJcbiAgICBpZiAoIW0pIHJldHVybiBvO1xyXG4gICAgdmFyIGkgPSBtLmNhbGwobyksIHIsIGFyID0gW10sIGU7XHJcbiAgICB0cnkge1xyXG4gICAgICAgIHdoaWxlICgobiA9PT0gdm9pZCAwIHx8IG4tLSA+IDApICYmICEociA9IGkubmV4dCgpKS5kb25lKSBhci5wdXNoKHIudmFsdWUpO1xyXG4gICAgfVxyXG4gICAgY2F0Y2ggKGVycm9yKSB7IGUgPSB7IGVycm9yOiBlcnJvciB9OyB9XHJcbiAgICBmaW5hbGx5IHtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBpZiAociAmJiAhci5kb25lICYmIChtID0gaVtcInJldHVyblwiXSkpIG0uY2FsbChpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZmluYWxseSB7IGlmIChlKSB0aHJvdyBlLmVycm9yOyB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gYXI7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX3NwcmVhZCgpIHtcclxuICAgIGZvciAodmFyIGFyID0gW10sIGkgPSAwOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKVxyXG4gICAgICAgIGFyID0gYXIuY29uY2F0KF9fcmVhZChhcmd1bWVudHNbaV0pKTtcclxuICAgIHJldHVybiBhcjtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fc3ByZWFkQXJyYXlzKCkge1xyXG4gICAgZm9yICh2YXIgcyA9IDAsIGkgPSAwLCBpbCA9IGFyZ3VtZW50cy5sZW5ndGg7IGkgPCBpbDsgaSsrKSBzICs9IGFyZ3VtZW50c1tpXS5sZW5ndGg7XHJcbiAgICBmb3IgKHZhciByID0gQXJyYXkocyksIGsgPSAwLCBpID0gMDsgaSA8IGlsOyBpKyspXHJcbiAgICAgICAgZm9yICh2YXIgYSA9IGFyZ3VtZW50c1tpXSwgaiA9IDAsIGpsID0gYS5sZW5ndGg7IGogPCBqbDsgaisrLCBrKyspXHJcbiAgICAgICAgICAgIHJba10gPSBhW2pdO1xyXG4gICAgcmV0dXJuIHI7XHJcbn07XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19hd2FpdCh2KSB7XHJcbiAgICByZXR1cm4gdGhpcyBpbnN0YW5jZW9mIF9fYXdhaXQgPyAodGhpcy52ID0gdiwgdGhpcykgOiBuZXcgX19hd2FpdCh2KTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fYXN5bmNHZW5lcmF0b3IodGhpc0FyZywgX2FyZ3VtZW50cywgZ2VuZXJhdG9yKSB7XHJcbiAgICBpZiAoIVN5bWJvbC5hc3luY0l0ZXJhdG9yKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiU3ltYm9sLmFzeW5jSXRlcmF0b3IgaXMgbm90IGRlZmluZWQuXCIpO1xyXG4gICAgdmFyIGcgPSBnZW5lcmF0b3IuYXBwbHkodGhpc0FyZywgX2FyZ3VtZW50cyB8fCBbXSksIGksIHEgPSBbXTtcclxuICAgIHJldHVybiBpID0ge30sIHZlcmIoXCJuZXh0XCIpLCB2ZXJiKFwidGhyb3dcIiksIHZlcmIoXCJyZXR1cm5cIiksIGlbU3ltYm9sLmFzeW5jSXRlcmF0b3JdID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpczsgfSwgaTtcclxuICAgIGZ1bmN0aW9uIHZlcmIobikgeyBpZiAoZ1tuXSkgaVtuXSA9IGZ1bmN0aW9uICh2KSB7IHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAoYSwgYikgeyBxLnB1c2goW24sIHYsIGEsIGJdKSA+IDEgfHwgcmVzdW1lKG4sIHYpOyB9KTsgfTsgfVxyXG4gICAgZnVuY3Rpb24gcmVzdW1lKG4sIHYpIHsgdHJ5IHsgc3RlcChnW25dKHYpKTsgfSBjYXRjaCAoZSkgeyBzZXR0bGUocVswXVszXSwgZSk7IH0gfVxyXG4gICAgZnVuY3Rpb24gc3RlcChyKSB7IHIudmFsdWUgaW5zdGFuY2VvZiBfX2F3YWl0ID8gUHJvbWlzZS5yZXNvbHZlKHIudmFsdWUudikudGhlbihmdWxmaWxsLCByZWplY3QpIDogc2V0dGxlKHFbMF1bMl0sIHIpOyB9XHJcbiAgICBmdW5jdGlvbiBmdWxmaWxsKHZhbHVlKSB7IHJlc3VtZShcIm5leHRcIiwgdmFsdWUpOyB9XHJcbiAgICBmdW5jdGlvbiByZWplY3QodmFsdWUpIHsgcmVzdW1lKFwidGhyb3dcIiwgdmFsdWUpOyB9XHJcbiAgICBmdW5jdGlvbiBzZXR0bGUoZiwgdikgeyBpZiAoZih2KSwgcS5zaGlmdCgpLCBxLmxlbmd0aCkgcmVzdW1lKHFbMF1bMF0sIHFbMF1bMV0pOyB9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2FzeW5jRGVsZWdhdG9yKG8pIHtcclxuICAgIHZhciBpLCBwO1xyXG4gICAgcmV0dXJuIGkgPSB7fSwgdmVyYihcIm5leHRcIiksIHZlcmIoXCJ0aHJvd1wiLCBmdW5jdGlvbiAoZSkgeyB0aHJvdyBlOyB9KSwgdmVyYihcInJldHVyblwiKSwgaVtTeW1ib2wuaXRlcmF0b3JdID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpczsgfSwgaTtcclxuICAgIGZ1bmN0aW9uIHZlcmIobiwgZikgeyBpW25dID0gb1tuXSA/IGZ1bmN0aW9uICh2KSB7IHJldHVybiAocCA9ICFwKSA/IHsgdmFsdWU6IF9fYXdhaXQob1tuXSh2KSksIGRvbmU6IG4gPT09IFwicmV0dXJuXCIgfSA6IGYgPyBmKHYpIDogdjsgfSA6IGY7IH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fYXN5bmNWYWx1ZXMobykge1xyXG4gICAgaWYgKCFTeW1ib2wuYXN5bmNJdGVyYXRvcikgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlN5bWJvbC5hc3luY0l0ZXJhdG9yIGlzIG5vdCBkZWZpbmVkLlwiKTtcclxuICAgIHZhciBtID0gb1tTeW1ib2wuYXN5bmNJdGVyYXRvcl0sIGk7XHJcbiAgICByZXR1cm4gbSA/IG0uY2FsbChvKSA6IChvID0gdHlwZW9mIF9fdmFsdWVzID09PSBcImZ1bmN0aW9uXCIgPyBfX3ZhbHVlcyhvKSA6IG9bU3ltYm9sLml0ZXJhdG9yXSgpLCBpID0ge30sIHZlcmIoXCJuZXh0XCIpLCB2ZXJiKFwidGhyb3dcIiksIHZlcmIoXCJyZXR1cm5cIiksIGlbU3ltYm9sLmFzeW5jSXRlcmF0b3JdID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpczsgfSwgaSk7XHJcbiAgICBmdW5jdGlvbiB2ZXJiKG4pIHsgaVtuXSA9IG9bbl0gJiYgZnVuY3Rpb24gKHYpIHsgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHsgdiA9IG9bbl0odiksIHNldHRsZShyZXNvbHZlLCByZWplY3QsIHYuZG9uZSwgdi52YWx1ZSk7IH0pOyB9OyB9XHJcbiAgICBmdW5jdGlvbiBzZXR0bGUocmVzb2x2ZSwgcmVqZWN0LCBkLCB2KSB7IFByb21pc2UucmVzb2x2ZSh2KS50aGVuKGZ1bmN0aW9uKHYpIHsgcmVzb2x2ZSh7IHZhbHVlOiB2LCBkb25lOiBkIH0pOyB9LCByZWplY3QpOyB9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX21ha2VUZW1wbGF0ZU9iamVjdChjb29rZWQsIHJhdykge1xyXG4gICAgaWYgKE9iamVjdC5kZWZpbmVQcm9wZXJ0eSkgeyBPYmplY3QuZGVmaW5lUHJvcGVydHkoY29va2VkLCBcInJhd1wiLCB7IHZhbHVlOiByYXcgfSk7IH0gZWxzZSB7IGNvb2tlZC5yYXcgPSByYXc7IH1cclxuICAgIHJldHVybiBjb29rZWQ7XHJcbn07XHJcblxyXG52YXIgX19zZXRNb2R1bGVEZWZhdWx0ID0gT2JqZWN0LmNyZWF0ZSA/IChmdW5jdGlvbihvLCB2KSB7XHJcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkobywgXCJkZWZhdWx0XCIsIHsgZW51bWVyYWJsZTogdHJ1ZSwgdmFsdWU6IHYgfSk7XHJcbn0pIDogZnVuY3Rpb24obywgdikge1xyXG4gICAgb1tcImRlZmF1bHRcIl0gPSB2O1xyXG59O1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9faW1wb3J0U3Rhcihtb2QpIHtcclxuICAgIGlmIChtb2QgJiYgbW9kLl9fZXNNb2R1bGUpIHJldHVybiBtb2Q7XHJcbiAgICB2YXIgcmVzdWx0ID0ge307XHJcbiAgICBpZiAobW9kICE9IG51bGwpIGZvciAodmFyIGsgaW4gbW9kKSBpZiAoT2JqZWN0Lmhhc093blByb3BlcnR5LmNhbGwobW9kLCBrKSkgX19jcmVhdGVCaW5kaW5nKHJlc3VsdCwgbW9kLCBrKTtcclxuICAgIF9fc2V0TW9kdWxlRGVmYXVsdChyZXN1bHQsIG1vZCk7XHJcbiAgICByZXR1cm4gcmVzdWx0O1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19pbXBvcnREZWZhdWx0KG1vZCkge1xyXG4gICAgcmV0dXJuIChtb2QgJiYgbW9kLl9fZXNNb2R1bGUpID8gbW9kIDogeyBkZWZhdWx0OiBtb2QgfTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fY2xhc3NQcml2YXRlRmllbGRHZXQocmVjZWl2ZXIsIHByaXZhdGVNYXApIHtcclxuICAgIGlmICghcHJpdmF0ZU1hcC5oYXMocmVjZWl2ZXIpKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcImF0dGVtcHRlZCB0byBnZXQgcHJpdmF0ZSBmaWVsZCBvbiBub24taW5zdGFuY2VcIik7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gcHJpdmF0ZU1hcC5nZXQocmVjZWl2ZXIpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19jbGFzc1ByaXZhdGVGaWVsZFNldChyZWNlaXZlciwgcHJpdmF0ZU1hcCwgdmFsdWUpIHtcclxuICAgIGlmICghcHJpdmF0ZU1hcC5oYXMocmVjZWl2ZXIpKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcImF0dGVtcHRlZCB0byBzZXQgcHJpdmF0ZSBmaWVsZCBvbiBub24taW5zdGFuY2VcIik7XHJcbiAgICB9XHJcbiAgICBwcml2YXRlTWFwLnNldChyZWNlaXZlciwgdmFsdWUpO1xyXG4gICAgcmV0dXJuIHZhbHVlO1xyXG59XHJcbiIsImltcG9ydCB7IENsb2NrIH0gZnJvbSAnLi9DbG9jayc7XG5cbi8qKlxuICogQ2xhc3MgdGhhdCBkZWFscyB3aXRoIHRpbWUuXG4gKiBUaGlzIGlzIFwiZnJhbWVcIiB0eXBlIGNsb2NrLCB0aGUgZnJhbWUgaW5jcmVhc2VzIGV2ZXJ5IHtAbGluayBDbG9ja0ZyYW1lI3VwZGF0ZX0gY2FsbC5cbiAqIEBwYXJhbSBmcHMgRnJhbWVzIHBlciBzZWNvbmRcbiAqL1xuZXhwb3J0IGNsYXNzIENsb2NrRnJhbWUgZXh0ZW5kcyBDbG9jayB7XG4gIC8qKlxuICAgKiBJdHMgY3VycmVudCBmcmFtZS5cbiAgICovXG4gIHByaXZhdGUgX19mcmFtZSA9IDA7XG5cbiAgLyoqXG4gICAqIEl0cyBmcHMuXG4gICAqL1xuICBwcml2YXRlIF9fZnBzOiBudW1iZXI7XG5cbiAgcHVibGljIGNvbnN0cnVjdG9yKCBmcHMgPSA2MCApIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMuX19mcHMgPSBmcHM7XG4gIH1cblxuICAvKipcbiAgICogSXRzIGN1cnJlbnQgZnJhbWUuXG4gICAqL1xuICBwdWJsaWMgZ2V0IGZyYW1lKCk6IG51bWJlciB7IHJldHVybiB0aGlzLl9fZnJhbWU7IH1cblxuICAvKipcbiAgICogSXRzIGZwcy5cbiAgICovXG4gIHB1YmxpYyBnZXQgZnBzKCk6IG51bWJlciB7IHJldHVybiB0aGlzLl9fZnBzOyB9XG5cbiAgLyoqXG4gICAqIFVwZGF0ZSB0aGUgY2xvY2suIEl0IHdpbGwgaW5jcmVhc2UgdGhlIGZyYW1lIGJ5IDEuXG4gICAqL1xuICBwdWJsaWMgdXBkYXRlKCk6IHZvaWQge1xuICAgIGlmICggdGhpcy5fX2lzUGxheWluZyApIHtcbiAgICAgIHRoaXMuX190aW1lID0gdGhpcy5fX2ZyYW1lIC8gdGhpcy5fX2ZwcztcbiAgICAgIHRoaXMuX19kZWx0YVRpbWUgPSAxLjAgLyB0aGlzLl9fZnBzO1xuICAgICAgdGhpcy5fX2ZyYW1lICsrO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9fZGVsdGFUaW1lID0gMC4wO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgdGhlIHRpbWUgbWFudWFsbHkuXG4gICAqIFRoZSBzZXQgdGltZSB3aWxsIGJlIGNvbnZlcnRlZCBpbnRvIGludGVybmFsIGZyYW1lIGNvdW50LCBzbyB0aGUgdGltZSB3aWxsIG5vdCBiZSBleGFjdGx5IHNhbWUgYXMgc2V0IG9uZS5cbiAgICogQHBhcmFtIHRpbWUgVGltZVxuICAgKi9cbiAgcHVibGljIHNldFRpbWUoIHRpbWU6IG51bWJlciApOiB2b2lkIHtcbiAgICB0aGlzLl9fZnJhbWUgPSBNYXRoLmZsb29yKCB0aGlzLl9fZnBzICogdGltZSApO1xuICAgIHRoaXMuX190aW1lID0gdGhpcy5fX2ZyYW1lIC8gdGhpcy5fX2ZwcztcbiAgfVxufVxuIiwiaW1wb3J0IHsgQ2xvY2sgfSBmcm9tICcuL0Nsb2NrJztcblxuLyoqXG4gKiBDbGFzcyB0aGF0IGRlYWxzIHdpdGggdGltZS5cbiAqIFRoaXMgaXMgXCJyZWFsdGltZVwiIHR5cGUgY2xvY2ssIHRoZSB0aW1lIGdvZXMgb24gYXMgcmVhbCB3b3JsZC5cbiAqL1xuZXhwb3J0IGNsYXNzIENsb2NrUmVhbHRpbWUgZXh0ZW5kcyBDbG9jayB7XG4gIC8qKlxuICAgKiBcIllvdSBzZXQgdGhlIHRpbWUgbWFudWFsbHkgdG8gYF9fcnRUaW1lYCB3aGVuIGl0J3MgYF9fcnREYXRlYC5cIlxuICAgKi9cbiAgcHJpdmF0ZSBfX3J0VGltZSA9IDAuMDtcblxuICAvKipcbiAgICogXCJZb3Ugc2V0IHRoZSB0aW1lIG1hbnVhbGx5IHRvIGBfX3J0VGltZWAgd2hlbiBpdCdzIGBfX3J0RGF0ZWAuXCJcbiAgICovXG4gIHByaXZhdGUgX19ydERhdGU6IG51bWJlciA9IHBlcmZvcm1hbmNlLm5vdygpO1xuXG4gIC8qKlxuICAgKiBUaGUgY2xvY2sgaXMgcmVhbHRpbWUuIHllYWguXG4gICAqL1xuICBwdWJsaWMgZ2V0IGlzUmVhbHRpbWUoKTogYm9vbGVhbiB7IHJldHVybiB0cnVlOyB9XG5cbiAgLyoqXG4gICAqIFVwZGF0ZSB0aGUgY2xvY2suIFRpbWUgaXMgY2FsY3VsYXRlZCBiYXNlZCBvbiB0aW1lIGluIHJlYWwgd29ybGQuXG4gICAqL1xuICBwdWJsaWMgdXBkYXRlKCk6IHZvaWQge1xuICAgIGNvbnN0IG5vdyA9IHBlcmZvcm1hbmNlLm5vdygpO1xuXG4gICAgaWYgKCB0aGlzLl9faXNQbGF5aW5nICkge1xuICAgICAgY29uc3QgcHJldlRpbWUgPSB0aGlzLl9fdGltZTtcbiAgICAgIGNvbnN0IGRlbHRhRGF0ZSA9ICggbm93IC0gdGhpcy5fX3J0RGF0ZSApO1xuICAgICAgdGhpcy5fX3RpbWUgPSB0aGlzLl9fcnRUaW1lICsgZGVsdGFEYXRlIC8gMTAwMC4wO1xuICAgICAgdGhpcy5fX2RlbHRhVGltZSA9IHRoaXMudGltZSAtIHByZXZUaW1lO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9fcnRUaW1lID0gdGhpcy50aW1lO1xuICAgICAgdGhpcy5fX3J0RGF0ZSA9IG5vdztcbiAgICAgIHRoaXMuX19kZWx0YVRpbWUgPSAwLjA7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFNldCB0aGUgdGltZSBtYW51YWxseS5cbiAgICogQHBhcmFtIHRpbWUgVGltZVxuICAgKi9cbiAgcHVibGljIHNldFRpbWUoIHRpbWU6IG51bWJlciApOiB2b2lkIHtcbiAgICB0aGlzLl9fdGltZSA9IHRpbWU7XG4gICAgdGhpcy5fX3J0VGltZSA9IHRoaXMudGltZTtcbiAgICB0aGlzLl9fcnREYXRlID0gcGVyZm9ybWFuY2Uubm93KCk7XG4gIH1cbn1cbiIsIi8vIHlvaW5rZWQgZnJvbSBodHRwczovL2dpdGh1Yi5jb20vbWFwYm94L3Rpbnktc2RmIChCU0QgMi1DbGF1c2UpXG4vLyBpbXBsZW1lbnRzIGh0dHA6Ly9wZW9wbGUuY3MudWNoaWNhZ28uZWR1L35wZmYvcGFwZXJzL2R0LnBkZlxuXG4vKipcbiAqIENvbXB1dGUgYSBvbmUgZGltZW5zaW9uYWwgZWR0IGZyb20gdGhlIHNvdXJjZSBkYXRhLlxuICogUmV0dXJuaW5nIGRpc3RhbmNlIHdpbGwgYmUgc3F1YXJlZC5cbiAqIEludGVuZGVkIHRvIGJlIHVzZWQgaW50ZXJuYWxseSBpbiB7QGxpbmsgZWR0MmR9LlxuICpcbiAqIEBwYXJhbSBkYXRhIERhdGEgb2YgdGhlIHNvdXJjZVxuICogQHBhcmFtIG9mZnNldCBPZmZzZXQgb2YgdGhlIHNvdXJjZSBmcm9tIGJlZ2lubmluZ1xuICogQHBhcmFtIHN0cmlkZSBTdHJpZGUgb2YgdGhlIHNvdXJjZVxuICogQHBhcmFtIGxlbmd0aCBMZW5ndGggb2YgdGhlIHNvdXJjZVxuICovXG5leHBvcnQgZnVuY3Rpb24gZWR0MWQoXG4gIGRhdGE6IEZsb2F0MzJBcnJheSxcbiAgb2Zmc2V0OiBudW1iZXIsXG4gIHN0cmlkZTogbnVtYmVyLFxuICBsZW5ndGg6IG51bWJlclxuKTogdm9pZCB7XG4gIC8vIGluZGV4IG9mIHJpZ2h0bW9zdCBwYXJhYm9sYSBpbiBsb3dlciBlbnZlbG9wZVxuICBsZXQgayA9IDA7XG5cbiAgLy8gbG9jYXRpb25zIG9mIHBhcmFib2xhcyBpbiBsb3dlciBlbnZlbG9wZVxuICBjb25zdCB2ID0gbmV3IEZsb2F0MzJBcnJheSggbGVuZ3RoICk7XG4gIHZbIDAgXSA9IDAuMDtcblxuICAvLyBsb2NhdGlvbnMgb2YgYm91bmRhcmllcyBiZXR3ZWVuIHBhcmFib2xhc1xuICBjb25zdCB6ID0gbmV3IEZsb2F0MzJBcnJheSggbGVuZ3RoICsgMSApO1xuICB6WyAwIF0gPSAtSW5maW5pdHk7XG4gIHpbIDEgXSA9IEluZmluaXR5O1xuXG4gIC8vIGNyZWF0ZSBhIHN0cmFpZ2h0IGFycmF5IG9mIGlucHV0IGRhdGFcbiAgY29uc3QgZiA9IG5ldyBGbG9hdDMyQXJyYXkoIGxlbmd0aCApO1xuICBmb3IgKCBsZXQgcSA9IDA7IHEgPCBsZW5ndGg7IHEgKysgKSB7XG4gICAgZlsgcSBdID0gZGF0YVsgb2Zmc2V0ICsgcSAqIHN0cmlkZSBdO1xuICB9XG5cbiAgLy8gY29tcHV0ZSBsb3dlciBlbnZlbG9wZVxuICBmb3IgKCBsZXQgcSA9IDE7IHEgPCBsZW5ndGg7IHEgKysgKSB7XG4gICAgbGV0IHMgPSAwLjA7XG5cbiAgICB3aGlsZSAoIDAgPD0gayApIHtcbiAgICAgIHMgPSAoIGZbIHEgXSArIHEgKiBxIC0gZlsgdlsgayBdIF0gLSB2WyBrIF0gKiB2WyBrIF0gKSAvICggMi4wICogcSAtIDIuMCAqIHZbIGsgXSApO1xuICAgICAgaWYgKCBzIDw9IHpbIGsgXSApIHtcbiAgICAgICAgayAtLTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cblxuICAgIGsgKys7XG4gICAgdlsgayBdID0gcTtcbiAgICB6WyBrIF0gPSBzO1xuICAgIHpbIGsgKyAxIF0gPSBJbmZpbml0eTtcbiAgfVxuXG4gIGsgPSAwO1xuXG4gIC8vIGZpbGwgaW4gdmFsdWVzIG9mIGRpc3RhbmNlIHRyYW5zZm9ybVxuICBmb3IgKCBsZXQgcSA9IDA7IHEgPCBsZW5ndGg7IHEgKysgKSB7XG4gICAgd2hpbGUgKCB6WyBrICsgMSBdIDwgcSApIHsgayArKzsgfVxuICAgIGNvbnN0IHFTdWJWSyA9IHEgLSB2WyBrIF07XG4gICAgZGF0YVsgb2Zmc2V0ICsgcSAqIHN0cmlkZSBdID0gZlsgdlsgayBdIF0gKyBxU3ViVksgKiBxU3ViVks7XG4gIH1cbn1cblxuLyoqXG4gKiBDb21wdXRlIGEgdHdvIGRpbWVuc2lvbmFsIGVkdCBmcm9tIHRoZSBzb3VyY2UgZGF0YS5cbiAqIFJldHVybmluZyBkaXN0YW5jZSB3aWxsIGJlIHNxdWFyZWQuXG4gKlxuICogQHBhcmFtIGRhdGEgRGF0YSBvZiB0aGUgc291cmNlLlxuICogQHBhcmFtIHdpZHRoIFdpZHRoIG9mIHRoZSBzb3VyY2UuXG4gKiBAcGFyYW0gaGVpZ2h0IEhlaWdodCBvZiB0aGUgc291cmNlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZWR0MmQoXG4gIGRhdGE6IEZsb2F0MzJBcnJheSxcbiAgd2lkdGg6IG51bWJlcixcbiAgaGVpZ2h0OiBudW1iZXJcbik6IHZvaWQge1xuICBmb3IgKCBsZXQgeCA9IDA7IHggPCB3aWR0aDsgeCArKyApIHtcbiAgICBlZHQxZCggZGF0YSwgeCwgd2lkdGgsIGhlaWdodCApO1xuICB9XG5cbiAgZm9yICggbGV0IHkgPSAwOyB5IDwgaGVpZ2h0OyB5ICsrICkge1xuICAgIGVkdDFkKCBkYXRhLCB5ICogd2lkdGgsIDEsIHdpZHRoICk7XG4gIH1cbn1cbiIsIi8qKlxuICogYGxlcnBgLCBvciBgbWl4YFxuICovXG5leHBvcnQgZnVuY3Rpb24gbGVycCggYTogbnVtYmVyLCBiOiBudW1iZXIsIHg6IG51bWJlciApOiBudW1iZXIge1xuICByZXR1cm4gYSArICggYiAtIGEgKSAqIHg7XG59XG5cbi8qKlxuICogYGNsYW1wYFxuICovXG5leHBvcnQgZnVuY3Rpb24gY2xhbXAoIHg6IG51bWJlciwgbDogbnVtYmVyLCBoOiBudW1iZXIgKTogbnVtYmVyIHtcbiAgcmV0dXJuIE1hdGgubWluKCBNYXRoLm1heCggeCwgbCApLCBoICk7XG59XG5cbi8qKlxuICogYGNsYW1wKCB4LCAwLjAsIDEuMCApYFxuICovXG5leHBvcnQgZnVuY3Rpb24gc2F0dXJhdGUoIHg6IG51bWJlciApOiBudW1iZXIge1xuICByZXR1cm4gY2xhbXAoIHgsIDAuMCwgMS4wICk7XG59XG5cbi8qKlxuICogVHJhbnNmb3JtIGEgdmFsdWUgZnJvbSBpbnB1dCByYW5nZSB0byBvdXRwdXQgcmFuZ2UuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByYW5nZSggeDogbnVtYmVyLCB4MDogbnVtYmVyLCB4MTogbnVtYmVyLCB5MDogbnVtYmVyLCB5MTogbnVtYmVyICk6IG51bWJlciB7XG4gIHJldHVybiAoICggeCAtIHgwICkgKiAoIHkxIC0geTAgKSAvICggeDEgLSB4MCApICsgeTAgKTtcbn1cblxuLyoqXG4gKiBgc21vb3Roc3RlcGAgYnV0IG5vdCBzbW9vdGhcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGxpbmVhcnN0ZXAoIGE6IG51bWJlciwgYjogbnVtYmVyLCB4OiBudW1iZXIgKTogbnVtYmVyIHtcbiAgcmV0dXJuIHNhdHVyYXRlKCAoIHggLSBhICkgLyAoIGIgLSBhICkgKTtcbn1cblxuLyoqXG4gKiB3b3JsZCBmYW1vdXMgYHNtb290aHN0ZXBgIGZ1bmN0aW9uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzbW9vdGhzdGVwKCBhOiBudW1iZXIsIGI6IG51bWJlciwgeDogbnVtYmVyICk6IG51bWJlciB7XG4gIGNvbnN0IHQgPSBsaW5lYXJzdGVwKCBhLCBiLCB4ICk7XG4gIHJldHVybiB0ICogdCAqICggMy4wIC0gMi4wICogdCApO1xufVxuXG4vKipcbiAqIGBzbW9vdGhzdGVwYCBidXQgbW9yZSBzbW9vdGhcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNtb290aGVyc3RlcCggYTogbnVtYmVyLCBiOiBudW1iZXIsIHg6IG51bWJlciApOiBudW1iZXIge1xuICBjb25zdCB0ID0gbGluZWFyc3RlcCggYSwgYiwgeCApO1xuICByZXR1cm4gdCAqIHQgKiB0ICogKCB0ICogKCB0ICogNi4wIC0gMTUuMCApICsgMTAuMCApO1xufVxuXG4vKipcbiAqIGBzbW9vdGhzdGVwYCBidXQgV0FZIG1vcmUgc21vb3RoXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzbW9vdGhlc3RzdGVwKCBhOiBudW1iZXIsIGI6IG51bWJlciwgeDogbnVtYmVyICk6IG51bWJlciB7XG4gIGNvbnN0IHQgPSBsaW5lYXJzdGVwKCBhLCBiLCB4ICk7XG4gIHJldHVybiB0ICogdCAqIHQgKiB0ICogKCB0ICogKCB0ICogKCAtMjAuMCAqIHQgKyA3MC4wICkgLSA4NC4wICkgKyAzNS4wICk7XG59XG4iLCJpbXBvcnQgeyBsZXJwIH0gZnJvbSAnLi4vbWF0aC91dGlscyc7XG5cbi8qKlxuICogRG8gZXhwIHNtb290aGluZ1xuICovXG5leHBvcnQgY2xhc3MgRXhwU21vb3RoIHtcbiAgcHVibGljIGZhY3RvciA9IDEwLjA7XG4gIHB1YmxpYyB0YXJnZXQgPSAwLjA7XG4gIHB1YmxpYyB2YWx1ZSA9IDAuMDtcblxuICBwdWJsaWMgdXBkYXRlKCBkZWx0YVRpbWU6IG51bWJlciApOiBudW1iZXIge1xuICAgIHRoaXMudmFsdWUgPSBsZXJwKCB0aGlzLnRhcmdldCwgdGhpcy52YWx1ZSwgTWF0aC5leHAoIC10aGlzLmZhY3RvciAqIGRlbHRhVGltZSApICk7XG4gICAgcmV0dXJuIHRoaXMudmFsdWU7XG4gIH1cbn1cbiIsIi8qKlxuICogSXRlcmFibGUgRml6ekJ1enpcbiAqL1xuZXhwb3J0IGNsYXNzIEZpenpCdXp6IGltcGxlbWVudHMgSXRlcmFibGU8bnVtYmVyIHwgc3RyaW5nPiB7XG4gIHB1YmxpYyBzdGF0aWMgV29yZHNEZWZhdWx0OiBNYXA8bnVtYmVyLCBzdHJpbmc+ID0gbmV3IE1hcCggW1xuICAgIFsgMywgJ0ZpenonIF0sXG4gICAgWyA1LCAnQnV6eicgXVxuICBdICk7XG5cbiAgcHJpdmF0ZSBfX3dvcmRzOiBNYXA8bnVtYmVyLCBzdHJpbmc+O1xuICBwcml2YXRlIF9faW5kZXg6IG51bWJlcjtcbiAgcHJpdmF0ZSBfX2VuZDogbnVtYmVyO1xuXG4gIHB1YmxpYyBjb25zdHJ1Y3Rvciggd29yZHM6IE1hcDxudW1iZXIsIHN0cmluZz4gPSBGaXp6QnV6ei5Xb3Jkc0RlZmF1bHQsIGluZGV4ID0gMSwgZW5kID0gMTAwICkge1xuICAgIHRoaXMuX193b3JkcyA9IHdvcmRzO1xuICAgIHRoaXMuX19pbmRleCA9IGluZGV4O1xuICAgIHRoaXMuX19lbmQgPSBlbmQ7XG4gIH1cblxuICBwdWJsaWMgWyBTeW1ib2wuaXRlcmF0b3IgXSgpOiBJdGVyYXRvcjxzdHJpbmcgfCBudW1iZXIsIGFueSwgdW5kZWZpbmVkPiB7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBwdWJsaWMgbmV4dCgpOiBJdGVyYXRvclJlc3VsdDxudW1iZXIgfCBzdHJpbmc+IHtcbiAgICBpZiAoIHRoaXMuX19lbmQgPCB0aGlzLl9faW5kZXggKSB7XG4gICAgICByZXR1cm4geyBkb25lOiB0cnVlLCB2YWx1ZTogbnVsbCB9O1xuICAgIH1cblxuICAgIGxldCB2YWx1ZTogbnVtYmVyIHwgc3RyaW5nID0gJyc7XG4gICAgZm9yICggY29uc3QgWyByZW0sIHdvcmQgXSBvZiB0aGlzLl9fd29yZHMgKSB7XG4gICAgICBpZiAoICggdGhpcy5fX2luZGV4ICUgcmVtICkgPT09IDAgKSB7XG4gICAgICAgIHZhbHVlICs9IHdvcmQ7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKCB2YWx1ZSA9PT0gJycgKSB7XG4gICAgICB2YWx1ZSA9IHRoaXMuX19pbmRleDtcbiAgICB9XG5cbiAgICB0aGlzLl9faW5kZXggKys7XG5cbiAgICByZXR1cm4geyBkb25lOiBmYWxzZSwgdmFsdWUgfTtcbiAgfVxufVxuIiwiLyoqXG4gKiBNb3N0IGF3ZXNvbWUgY2F0IGV2ZXJcbiAqL1xuZXhwb3J0IGNsYXNzIEZNU19DYXQgeyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lXG4gIC8qKlxuICAgKiBGTVNfQ2F0LmdpZlxuICAgKi9cbiAgcHVibGljIHN0YXRpYyBnaWYgPSAnaHR0cHM6Ly9mbXMtY2F0LmNvbS9pbWFnZXMvZm1zX2NhdC5naWYnO1xuXG4gIC8qKlxuICAgKiBGTVNfQ2F0LnBuZ1xuICAgKi9cbiAgcHVibGljIHN0YXRpYyBwbmcgPSAnaHR0cHM6Ly9mbXMtY2F0LmNvbS9pbWFnZXMvZm1zX2NhdC5wbmcnO1xufVxuIiwiLyoqXG4gKiBVc2VmdWwgZm9yIHRhcCB0ZW1wb1xuICogU2VlIGFsc286IHtAbGluayBIaXN0b3J5TWVhbkNhbGN1bGF0b3J9XG4gKi9cbmV4cG9ydCBjbGFzcyBIaXN0b3J5TWVhbkNhbGN1bGF0b3Ige1xuICBwcml2YXRlIF9fcmVjYWxjRm9yRWFjaCA9IDA7XG4gIHByaXZhdGUgX19jb3VudFVudGlsUmVjYWxjID0gMDtcbiAgcHJpdmF0ZSBfX2hpc3Rvcnk6IG51bWJlcltdID0gW107XG4gIHByaXZhdGUgX19pbmRleCA9IDA7XG4gIHByaXZhdGUgX19sZW5ndGg6IG51bWJlcjtcbiAgcHJpdmF0ZSBfX2NvdW50ID0gMDtcbiAgcHJpdmF0ZSBfX2NhY2hlID0gMDtcblxuICBwdWJsaWMgY29uc3RydWN0b3IoIGxlbmd0aDogbnVtYmVyICkge1xuICAgIHRoaXMuX19sZW5ndGggPSBsZW5ndGg7XG4gICAgdGhpcy5fX3JlY2FsY0ZvckVhY2ggPSBsZW5ndGg7XG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgbGVuZ3RoOyBpICsrICkge1xuICAgICAgdGhpcy5fX2hpc3RvcnlbIGkgXSA9IDA7XG4gICAgfVxuICB9XG5cbiAgcHVibGljIGdldCBtZWFuKCk6IG51bWJlciB7XG4gICAgY29uc3QgY291bnQgPSBNYXRoLm1pbiggdGhpcy5fX2NvdW50LCB0aGlzLl9fbGVuZ3RoICk7XG4gICAgcmV0dXJuIGNvdW50ID09PSAwID8gMC4wIDogdGhpcy5fX2NhY2hlIC8gY291bnQ7XG4gIH1cblxuICBwdWJsaWMgZ2V0IHJlY2FsY0ZvckVhY2goKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5fX3JlY2FsY0ZvckVhY2g7XG4gIH1cblxuICBwdWJsaWMgc2V0IHJlY2FsY0ZvckVhY2goIHZhbHVlOiBudW1iZXIgKSB7XG4gICAgY29uc3QgZGVsdGEgPSB2YWx1ZSAtIHRoaXMuX19yZWNhbGNGb3JFYWNoO1xuICAgIHRoaXMuX19yZWNhbGNGb3JFYWNoID0gdmFsdWU7XG4gICAgdGhpcy5fX2NvdW50VW50aWxSZWNhbGMgPSBNYXRoLm1heCggMCwgdGhpcy5fX2NvdW50VW50aWxSZWNhbGMgKyBkZWx0YSApO1xuICB9XG5cbiAgcHVibGljIHJlc2V0KCk6IHZvaWQge1xuICAgIHRoaXMuX19pbmRleCA9IDA7XG4gICAgdGhpcy5fX2NvdW50ID0gMDtcbiAgICB0aGlzLl9fY2FjaGUgPSAwO1xuICAgIHRoaXMuX19jb3VudFVudGlsUmVjYWxjID0gMDtcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB0aGlzLl9fbGVuZ3RoOyBpICsrICkge1xuICAgICAgdGhpcy5fX2hpc3RvcnlbIGkgXSA9IDA7XG4gICAgfVxuICB9XG5cbiAgcHVibGljIHB1c2goIHZhbHVlOiBudW1iZXIgKTogdm9pZCB7XG4gICAgY29uc3QgcHJldiA9IHRoaXMuX19oaXN0b3J5WyB0aGlzLl9faW5kZXggXTtcbiAgICB0aGlzLl9faGlzdG9yeVsgdGhpcy5fX2luZGV4IF0gPSB2YWx1ZTtcbiAgICB0aGlzLl9fY291bnQgKys7XG4gICAgdGhpcy5fX2luZGV4ID0gKCB0aGlzLl9faW5kZXggKyAxICkgJSB0aGlzLl9fbGVuZ3RoO1xuXG4gICAgaWYgKCB0aGlzLl9fY291bnRVbnRpbFJlY2FsYyA9PT0gMCApIHtcbiAgICAgIHRoaXMucmVjYWxjKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX19jb3VudFVudGlsUmVjYWxjIC0tO1xuICAgICAgdGhpcy5fX2NhY2hlIC09IHByZXY7XG4gICAgICB0aGlzLl9fY2FjaGUgKz0gdmFsdWU7XG4gICAgfVxuICB9XG5cbiAgcHVibGljIHJlY2FsYygpOiB2b2lkIHtcbiAgICB0aGlzLl9fY291bnRVbnRpbFJlY2FsYyA9IHRoaXMuX19yZWNhbGNGb3JFYWNoO1xuICAgIGNvbnN0IHN1bSA9IHRoaXMuX19oaXN0b3J5XG4gICAgICAuc2xpY2UoIDAsIE1hdGgubWluKCB0aGlzLl9fY291bnQsIHRoaXMuX19sZW5ndGggKSApXG4gICAgICAucmVkdWNlKCAoIHN1bSwgdiApID0+IHN1bSArIHYsIDAgKTtcbiAgICB0aGlzLl9fY2FjaGUgPSBzdW07XG4gIH1cbn1cbiIsImltcG9ydCB7IGJpbmFyeVNlYXJjaCB9IGZyb20gJy4uL2FsZ29yaXRobS9iaW5hcnlTZWFyY2gnO1xuXG4vKipcbiAqIFVzZWZ1bCBmb3IgZnBzIGNhbGNcbiAqIFNlZSBhbHNvOiB7QGxpbmsgSGlzdG9yeU1lYW5DYWxjdWxhdG9yfVxuICovXG5leHBvcnQgY2xhc3MgSGlzdG9yeVBlcmNlbnRpbGVDYWxjdWxhdG9yIHtcbiAgcHJpdmF0ZSBfX2hpc3Rvcnk6IG51bWJlcltdID0gW107XG4gIHByaXZhdGUgX19zb3J0ZWQ6IG51bWJlcltdID0gW107XG4gIHByaXZhdGUgX19pbmRleCA9IDA7XG4gIHByaXZhdGUgcmVhZG9ubHkgX19sZW5ndGg6IG51bWJlcjtcblxuICBwdWJsaWMgY29uc3RydWN0b3IoIGxlbmd0aDogbnVtYmVyICkge1xuICAgIHRoaXMuX19sZW5ndGggPSBsZW5ndGg7XG4gIH1cblxuICBwdWJsaWMgZ2V0IG1lZGlhbigpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLnBlcmNlbnRpbGUoIDUwLjAgKTtcbiAgfVxuXG4gIHB1YmxpYyBwZXJjZW50aWxlKCBwZXJjZW50aWxlOiBudW1iZXIgKTogbnVtYmVyIHtcbiAgICBpZiAoIHRoaXMuX19oaXN0b3J5Lmxlbmd0aCA9PT0gMCApIHsgcmV0dXJuIDAuMDsgfVxuICAgIHJldHVybiB0aGlzLl9fc29ydGVkWyBNYXRoLnJvdW5kKCBwZXJjZW50aWxlICogMC4wMSAqICggdGhpcy5fX2hpc3RvcnkubGVuZ3RoIC0gMSApICkgXTtcbiAgfVxuXG4gIHB1YmxpYyByZXNldCgpOiB2b2lkIHtcbiAgICB0aGlzLl9faW5kZXggPSAwO1xuICAgIHRoaXMuX19oaXN0b3J5ID0gW107XG4gICAgdGhpcy5fX3NvcnRlZCA9IFtdO1xuICB9XG5cbiAgcHVibGljIHB1c2goIHZhbHVlOiBudW1iZXIgKTogdm9pZCB7XG4gICAgY29uc3QgcHJldiA9IHRoaXMuX19oaXN0b3J5WyB0aGlzLl9faW5kZXggXTtcbiAgICB0aGlzLl9faGlzdG9yeVsgdGhpcy5fX2luZGV4IF0gPSB2YWx1ZTtcbiAgICB0aGlzLl9faW5kZXggPSAoIHRoaXMuX19pbmRleCArIDEgKSAlIHRoaXMuX19sZW5ndGg7XG5cbiAgICAvLyByZW1vdmUgdGhlIHByZXYgZnJvbSBzb3J0ZWQgYXJyYXlcbiAgICBpZiAoIHRoaXMuX19zb3J0ZWQubGVuZ3RoID09PSB0aGlzLl9fbGVuZ3RoICkge1xuICAgICAgY29uc3QgcHJldkluZGV4ID0gYmluYXJ5U2VhcmNoKCB0aGlzLl9fc29ydGVkLCBwcmV2ICk7XG4gICAgICB0aGlzLl9fc29ydGVkLnNwbGljZSggcHJldkluZGV4LCAxICk7XG4gICAgfVxuXG4gICAgY29uc3QgaW5kZXggPSBiaW5hcnlTZWFyY2goIHRoaXMuX19zb3J0ZWQsIHZhbHVlICk7XG4gICAgdGhpcy5fX3NvcnRlZC5zcGxpY2UoIGluZGV4LCAwLCB2YWx1ZSApO1xuICB9XG59XG4iLCJpbXBvcnQgeyBIaXN0b3J5UGVyY2VudGlsZUNhbGN1bGF0b3IgfSBmcm9tICcuL0hpc3RvcnlQZXJjZW50aWxlQ2FsY3VsYXRvcic7XG5cbi8qKlxuICogQGRlcHJlY2F0ZWQgSXQncyBhY3R1YWxseSBqdXN0IGEgc3BlY2lhbCBjYXNlIG9mIHtAbGluayBIaXN0b3J5UGVyY2VudGlsZUNhbGN1bGF0b3J9XG4gKi9cbmV4cG9ydCBjbGFzcyBIaXN0b3J5TWVkaWFuQ2FsY3VsYXRvciBleHRlbmRzIEhpc3RvcnlQZXJjZW50aWxlQ2FsY3VsYXRvciB7XG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggbGVuZ3RoOiBudW1iZXIgKSB7XG4gICAgc3VwZXIoIGxlbmd0aCApO1xuICAgIGNvbnNvbGUud2FybiggJ0hpc3RvcnlNZWRpYW5DYWxjdWxhdG9yOiBEZXByZWNhdGVkLiBVc2UgSGlzdG9yeVBlcmNlbnRpbGVDYWxjdWxhdG9yIGluc3RlYWQnICk7XG4gIH1cbn1cbiIsIi8qKlxuICogQSBWZWN0b3IuXG4gKi9cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBWZWN0b3I8VCBleHRlbmRzIFZlY3RvcjxUPj4ge1xuICBwdWJsaWMgYWJzdHJhY3QgZWxlbWVudHM6IG51bWJlcltdO1xuXG4gIC8qKlxuICAgKiBUaGUgbGVuZ3RoIG9mIHRoaXMuXG4gICAqIGEuay5hLiBgbWFnbml0dWRlYFxuICAgKi9cbiAgcHVibGljIGdldCBsZW5ndGgoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gTWF0aC5zcXJ0KCB0aGlzLmVsZW1lbnRzLnJlZHVjZSggKCBzdW0sIHYgKSA9PiBzdW0gKyB2ICogdiwgMC4wICkgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBIG5vcm1hbGl6ZWQgVmVjdG9yMyBvZiB0aGlzLlxuICAgKi9cbiAgcHVibGljIGdldCBub3JtYWxpemVkKCk6IFQge1xuICAgIHJldHVybiB0aGlzLnNjYWxlKCAxLjAgLyB0aGlzLmxlbmd0aCApO1xuICB9XG5cbiAgLyoqXG4gICAqIENsb25lIHRoaXMuXG4gICAqL1xuICBwdWJsaWMgY2xvbmUoKTogVCB7XG4gICAgcmV0dXJuIHRoaXMuX19uZXcoIHRoaXMuZWxlbWVudHMuY29uY2F0KCkgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGQgYSBWZWN0b3IgaW50byB0aGlzLlxuICAgKiBAcGFyYW0gdmVjdG9yIEFub3RoZXIgVmVjdG9yXG4gICAqL1xuICBwdWJsaWMgYWRkKCB2ZWN0b3I6IFQgKTogVCB7XG4gICAgcmV0dXJuIHRoaXMuX19uZXcoIHRoaXMuZWxlbWVudHMubWFwKCAoIHYsIGkgKSA9PiB2ICsgdmVjdG9yLmVsZW1lbnRzWyBpIF0gKSApO1xuICB9XG5cbiAgLyoqXG4gICAqIFN1YnN0cmFjdCB0aGlzIGZyb20gYW5vdGhlciBWZWN0b3IuXG4gICAqIEBwYXJhbSB2IEFub3RoZXIgdmVjdG9yXG4gICAqL1xuICBwdWJsaWMgc3ViKCB2ZWN0b3I6IFQgKTogVCB7XG4gICAgcmV0dXJuIHRoaXMuX19uZXcoIHRoaXMuZWxlbWVudHMubWFwKCAoIHYsIGkgKSA9PiB2IC0gdmVjdG9yLmVsZW1lbnRzWyBpIF0gKSApO1xuICB9XG5cbiAgLyoqXG4gICAqIE11bHRpcGx5IGEgVmVjdG9yIHdpdGggdGhpcy5cbiAgICogQHBhcmFtIHZlY3RvciBBbm90aGVyIFZlY3RvclxuICAgKi9cbiAgcHVibGljIG11bHRpcGx5KCB2ZWN0b3I6IFQgKTogVCB7XG4gICAgcmV0dXJuIHRoaXMuX19uZXcoIHRoaXMuZWxlbWVudHMubWFwKCAoIHYsIGkgKSA9PiB2ICogdmVjdG9yLmVsZW1lbnRzWyBpIF0gKSApO1xuICB9XG5cbiAgLyoqXG4gICAqIERpdmlkZSB0aGlzIGZyb20gYW5vdGhlciBWZWN0b3IuXG4gICAqIEBwYXJhbSB2ZWN0b3IgQW5vdGhlciBWZWN0b3JcbiAgICovXG4gIHB1YmxpYyBkaXZpZGUoIHZlY3RvcjogVCApOiBUIHtcbiAgICByZXR1cm4gdGhpcy5fX25ldyggdGhpcy5lbGVtZW50cy5tYXAoICggdiwgaSApID0+IHYgLyB2ZWN0b3IuZWxlbWVudHNbIGkgXSApICk7XG4gIH1cblxuICAvKipcbiAgICogU2NhbGUgdGhpcyBieSBzY2FsYXIuXG4gICAqIGEuay5hLiBgbXVsdGlwbHlTY2FsYXJgXG4gICAqIEBwYXJhbSBzY2FsYXIgQSBzY2FsYXJcbiAgICovXG4gIHB1YmxpYyBzY2FsZSggc2NhbGFyOiBudW1iZXIgKTogVCB7XG4gICAgcmV0dXJuIHRoaXMuX19uZXcoIHRoaXMuZWxlbWVudHMubWFwKCAoIHYgKSA9PiB2ICogc2NhbGFyICkgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBEb3QgdHdvIFZlY3RvcnMuXG4gICAqIEBwYXJhbSB2ZWN0b3IgQW5vdGhlciB2ZWN0b3JcbiAgICovXG4gIHB1YmxpYyBkb3QoIHZlY3RvcjogVCApOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLmVsZW1lbnRzLnJlZHVjZSggKCBzdW0sIHYsIGkgKSA9PiBzdW0gKyB2ICogdmVjdG9yLmVsZW1lbnRzWyBpIF0sIDAuMCApO1xuICB9XG5cbiAgcHJvdGVjdGVkIGFic3RyYWN0IF9fbmV3KCB2OiBudW1iZXJbXSApOiBUO1xufVxuIiwiaW1wb3J0IHsgTWF0cml4NCB9IGZyb20gJy4vTWF0cml4NCc7XG5pbXBvcnQgeyBRdWF0ZXJuaW9uIH0gZnJvbSAnLi9RdWF0ZXJuaW9uJztcbmltcG9ydCB7IFZlY3RvciB9IGZyb20gJy4vVmVjdG9yJztcblxuZXhwb3J0IHR5cGUgcmF3VmVjdG9yMyA9IFsgbnVtYmVyLCBudW1iZXIsIG51bWJlciBdO1xuXG4vKipcbiAqIEEgVmVjdG9yMy5cbiAqL1xuZXhwb3J0IGNsYXNzIFZlY3RvcjMgZXh0ZW5kcyBWZWN0b3I8VmVjdG9yMz4ge1xuICBwdWJsaWMgZWxlbWVudHM6IHJhd1ZlY3RvcjM7XG5cbiAgcHVibGljIGNvbnN0cnVjdG9yKCB2OiByYXdWZWN0b3IzID0gWyAwLjAsIDAuMCwgMC4wIF0gKSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLmVsZW1lbnRzID0gdjtcbiAgfVxuXG4gIC8qKlxuICAgKiBBbiB4IGNvbXBvbmVudCBvZiB0aGlzLlxuICAgKi9cbiAgcHVibGljIGdldCB4KCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuZWxlbWVudHNbIDAgXTtcbiAgfVxuXG4gIHB1YmxpYyBzZXQgeCggeDogbnVtYmVyICkge1xuICAgIHRoaXMuZWxlbWVudHNbIDAgXSA9IHg7XG4gIH1cblxuICAvKipcbiAgICogQW4geSBjb21wb25lbnQgb2YgdGhpcy5cbiAgICovXG4gIHB1YmxpYyBnZXQgeSgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLmVsZW1lbnRzWyAxIF07XG4gIH1cblxuICBwdWJsaWMgc2V0IHkoIHk6IG51bWJlciApIHtcbiAgICB0aGlzLmVsZW1lbnRzWyAxIF0gPSB5O1xuICB9XG5cbiAgLyoqXG4gICAqIEFuIHogY29tcG9uZW50IG9mIHRoaXMuXG4gICAqL1xuICBwdWJsaWMgZ2V0IHooKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5lbGVtZW50c1sgMiBdO1xuICB9XG5cbiAgcHVibGljIHNldCB6KCB6OiBudW1iZXIgKSB7XG4gICAgdGhpcy5lbGVtZW50c1sgMiBdID0gejtcbiAgfVxuXG4gIHB1YmxpYyB0b1N0cmluZygpOiBzdHJpbmcge1xuICAgIHJldHVybiBgVmVjdG9yMyggJHsgdGhpcy54LnRvRml4ZWQoIDMgKSB9LCAkeyB0aGlzLnkudG9GaXhlZCggMyApIH0sICR7IHRoaXMuei50b0ZpeGVkKCAzICkgfSApYDtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm4gYSBjcm9zcyBvZiB0aGlzIGFuZCBhbm90aGVyIFZlY3RvcjMuXG4gICAqIEBwYXJhbSB2ZWN0b3IgQW5vdGhlciB2ZWN0b3JcbiAgICovXG4gIHB1YmxpYyBjcm9zcyggdmVjdG9yOiBWZWN0b3IzICk6IFZlY3RvcjMge1xuICAgIHJldHVybiBuZXcgVmVjdG9yMyggW1xuICAgICAgdGhpcy55ICogdmVjdG9yLnogLSB0aGlzLnogKiB2ZWN0b3IueSxcbiAgICAgIHRoaXMueiAqIHZlY3Rvci54IC0gdGhpcy54ICogdmVjdG9yLnosXG4gICAgICB0aGlzLnggKiB2ZWN0b3IueSAtIHRoaXMueSAqIHZlY3Rvci54XG4gICAgXSApO1xuICB9XG5cbiAgLyoqXG4gICAqIFJvdGF0ZSB0aGlzIHZlY3RvciB1c2luZyBhIFF1YXRlcm5pb24uXG4gICAqIEBwYXJhbSBxdWF0ZXJuaW9uIEEgcXVhdGVybmlvblxuICAgKi9cbiAgcHVibGljIGFwcGx5UXVhdGVybmlvbiggcXVhdGVybmlvbjogUXVhdGVybmlvbiApOiBWZWN0b3IzIHtcbiAgICBjb25zdCBwID0gbmV3IFF1YXRlcm5pb24oIFsgdGhpcy54LCB0aGlzLnksIHRoaXMueiwgMC4wIF0gKTtcbiAgICBjb25zdCByID0gcXVhdGVybmlvbi5pbnZlcnNlZDtcbiAgICBjb25zdCByZXMgPSBxdWF0ZXJuaW9uLm11bHRpcGx5KCBwICkubXVsdGlwbHkoIHIgKTtcbiAgICByZXR1cm4gbmV3IFZlY3RvcjMoIFsgcmVzLngsIHJlcy55LCByZXMueiBdICk7XG4gIH1cblxuICAvKipcbiAgICogTXVsdGlwbHkgdGhpcyB2ZWN0b3IgKHdpdGggYW4gaW1wbGljaXQgMSBpbiB0aGUgNHRoIGRpbWVuc2lvbikgYnkgbS5cbiAgICovXG4gIHB1YmxpYyBhcHBseU1hdHJpeDQoIG1hdHJpeDogTWF0cml4NCApOiBWZWN0b3IzIHtcbiAgICBjb25zdCBtID0gbWF0cml4LmVsZW1lbnRzO1xuXG4gICAgY29uc3QgdyA9IG1bIDMgXSAqIHRoaXMueCArIG1bIDcgXSAqIHRoaXMueSArIG1bIDExIF0gKiB0aGlzLnogKyBtWyAxNSBdO1xuICAgIGNvbnN0IGludlcgPSAxLjAgLyB3O1xuXG4gICAgcmV0dXJuIG5ldyBWZWN0b3IzKCBbXG4gICAgICAoIG1bIDAgXSAqIHRoaXMueCArIG1bIDQgXSAqIHRoaXMueSArIG1bIDggXSAqIHRoaXMueiArIG1bIDEyIF0gKSAqIGludlcsXG4gICAgICAoIG1bIDEgXSAqIHRoaXMueCArIG1bIDUgXSAqIHRoaXMueSArIG1bIDkgXSAqIHRoaXMueiArIG1bIDEzIF0gKSAqIGludlcsXG4gICAgICAoIG1bIDIgXSAqIHRoaXMueCArIG1bIDYgXSAqIHRoaXMueSArIG1bIDEwIF0gKiB0aGlzLnogKyBtWyAxNCBdICkgKiBpbnZXXG4gICAgXSApO1xuICB9XG5cbiAgcHJvdGVjdGVkIF9fbmV3KCB2OiByYXdWZWN0b3IzICk6IFZlY3RvcjMge1xuICAgIHJldHVybiBuZXcgVmVjdG9yMyggdiApO1xuICB9XG5cbiAgLyoqXG4gICAqIFZlY3RvcjMoIDAuMCwgMC4wLCAwLjAgKVxuICAgKi9cbiAgcHVibGljIHN0YXRpYyBnZXQgemVybygpOiBWZWN0b3IzIHtcbiAgICByZXR1cm4gbmV3IFZlY3RvcjMoIFsgMC4wLCAwLjAsIDAuMCBdICk7XG4gIH1cblxuICAvKipcbiAgICogVmVjdG9yMyggMS4wLCAxLjAsIDEuMCApXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIGdldCBvbmUoKTogVmVjdG9yMyB7XG4gICAgcmV0dXJuIG5ldyBWZWN0b3IzKCBbIDEuMCwgMS4wLCAxLjAgXSApO1xuICB9XG59XG4iLCJpbXBvcnQgeyBNYXRyaXg0IH0gZnJvbSAnLi9NYXRyaXg0JztcbmltcG9ydCB7IFZlY3RvcjMgfSBmcm9tICcuL1ZlY3RvcjMnO1xuXG5leHBvcnQgdHlwZSByYXdRdWF0ZXJuaW9uID0gWyBudW1iZXIsIG51bWJlciwgbnVtYmVyLCBudW1iZXIgXTtcblxuZXhwb3J0IGNvbnN0IHJhd0lkZW50aXR5UXVhdGVybmlvbjogcmF3UXVhdGVybmlvbiA9IFsgMC4wLCAwLjAsIDAuMCwgMS4wIF07XG5cbi8qKlxuICogQSBRdWF0ZXJuaW9uLlxuICovXG5leHBvcnQgY2xhc3MgUXVhdGVybmlvbiB7XG4gIHB1YmxpYyBlbGVtZW50czogcmF3UXVhdGVybmlvbjsgLy8gWyB4LCB5LCB6OyB3IF1cblxuICBwdWJsaWMgY29uc3RydWN0b3IoIGVsZW1lbnRzOiByYXdRdWF0ZXJuaW9uID0gcmF3SWRlbnRpdHlRdWF0ZXJuaW9uICkge1xuICAgIHRoaXMuZWxlbWVudHMgPSBlbGVtZW50cztcbiAgfVxuXG4gIC8qKlxuICAgKiBBbiB4IGNvbXBvbmVudCBvZiB0aGlzLlxuICAgKi9cbiAgcHVibGljIGdldCB4KCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuZWxlbWVudHNbIDAgXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBbiB5IGNvbXBvbmVudCBvZiB0aGlzLlxuICAgKi9cbiAgcHVibGljIGdldCB5KCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuZWxlbWVudHNbIDEgXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBbiB6IGNvbXBvbmVudCBvZiB0aGlzLlxuICAgKi9cbiAgcHVibGljIGdldCB6KCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuZWxlbWVudHNbIDIgXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBbiB3IGNvbXBvbmVudCBvZiB0aGlzLlxuICAgKi9cbiAgcHVibGljIGdldCB3KCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuZWxlbWVudHNbIDMgXTtcbiAgfVxuXG4gIHB1YmxpYyB0b1N0cmluZygpOiBzdHJpbmcge1xuICAgIHJldHVybiBgUXVhdGVybmlvbiggJHsgdGhpcy54LnRvRml4ZWQoIDMgKSB9LCAkeyB0aGlzLnkudG9GaXhlZCggMyApIH0sICR7IHRoaXMuei50b0ZpeGVkKCAzICkgfSwgJHsgdGhpcy53LnRvRml4ZWQoIDMgKSB9IClgO1xuICB9XG5cbiAgLyoqXG4gICAqIENsb25lIHRoaXMuXG4gICAqL1xuICBwdWJsaWMgY2xvbmUoKTogUXVhdGVybmlvbiB7XG4gICAgcmV0dXJuIG5ldyBRdWF0ZXJuaW9uKCB0aGlzLmVsZW1lbnRzLmNvbmNhdCgpIGFzIHJhd1F1YXRlcm5pb24gKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJdHNlbGYgYnV0IGNvbnZlcnRlZCBpbnRvIGEgTWF0cml4NC5cbiAgICovXG4gIHB1YmxpYyBnZXQgbWF0cml4KCk6IE1hdHJpeDQge1xuICAgIGNvbnN0IHggPSBuZXcgVmVjdG9yMyggWyAxLjAsIDAuMCwgMC4wIF0gKS5hcHBseVF1YXRlcm5pb24oIHRoaXMgKTtcbiAgICBjb25zdCB5ID0gbmV3IFZlY3RvcjMoIFsgMC4wLCAxLjAsIDAuMCBdICkuYXBwbHlRdWF0ZXJuaW9uKCB0aGlzICk7XG4gICAgY29uc3QgeiA9IG5ldyBWZWN0b3IzKCBbIDAuMCwgMC4wLCAxLjAgXSApLmFwcGx5UXVhdGVybmlvbiggdGhpcyApO1xuXG4gICAgcmV0dXJuIG5ldyBNYXRyaXg0KCBbXG4gICAgICB4LngsIHkueCwgei54LCAwLjAsXG4gICAgICB4LnksIHkueSwgei55LCAwLjAsXG4gICAgICB4LnosIHkueiwgei56LCAwLjAsXG4gICAgICAwLjAsIDAuMCwgMC4wLCAxLjBcbiAgICBdICk7XG4gIH1cblxuICAvKipcbiAgICogQW4gaW52ZXJzZSBvZiB0aGlzLlxuICAgKi9cbiAgcHVibGljIGdldCBpbnZlcnNlZCgpOiBRdWF0ZXJuaW9uIHtcbiAgICByZXR1cm4gbmV3IFF1YXRlcm5pb24oIFtcbiAgICAgIC10aGlzLngsXG4gICAgICAtdGhpcy55LFxuICAgICAgLXRoaXMueixcbiAgICAgIHRoaXMud1xuICAgIF0gKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBNdWx0aXBseSB0d28gUXVhdGVybmlvbnMuXG4gICAqIEBwYXJhbSBxIEFub3RoZXIgUXVhdGVybmlvblxuICAgKi9cbiAgcHVibGljIG11bHRpcGx5KCBxOiBRdWF0ZXJuaW9uICk6IFF1YXRlcm5pb24ge1xuICAgIHJldHVybiBuZXcgUXVhdGVybmlvbiggW1xuICAgICAgdGhpcy53ICogcS54ICsgdGhpcy54ICogcS53ICsgdGhpcy55ICogcS56IC0gdGhpcy56ICogcS55LFxuICAgICAgdGhpcy53ICogcS55IC0gdGhpcy54ICogcS56ICsgdGhpcy55ICogcS53ICsgdGhpcy56ICogcS54LFxuICAgICAgdGhpcy53ICogcS56ICsgdGhpcy54ICogcS55IC0gdGhpcy55ICogcS54ICsgdGhpcy56ICogcS53LFxuICAgICAgdGhpcy53ICogcS53IC0gdGhpcy54ICogcS54IC0gdGhpcy55ICogcS55IC0gdGhpcy56ICogcS56XG4gICAgXSApO1xuICB9XG5cbiAgLyoqXG4gICAqIEFuIGlkZW50aXR5IFF1YXRlcm5pb24uXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIGdldCBpZGVudGl0eSgpOiBRdWF0ZXJuaW9uIHtcbiAgICByZXR1cm4gbmV3IFF1YXRlcm5pb24oIHJhd0lkZW50aXR5UXVhdGVybmlvbiApO1xuICB9XG5cbiAgLyoqXG4gICAqIEdlbmVyYXRlIGEgUXVhdGVybmlvbiBvdXQgb2YgYW5nbGUgYW5kIGF4aXMuXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIGZyb21BeGlzQW5nbGUoIGF4aXM6IFZlY3RvcjMsIGFuZ2xlOiBudW1iZXIgKTogUXVhdGVybmlvbiB7XG4gICAgY29uc3QgaGFsZkFuZ2xlID0gYW5nbGUgLyAyLjA7XG4gICAgY29uc3Qgc2luSGFsZkFuZ2xlID0gTWF0aC5zaW4oIGhhbGZBbmdsZSApO1xuICAgIHJldHVybiBuZXcgUXVhdGVybmlvbiggW1xuICAgICAgYXhpcy54ICogc2luSGFsZkFuZ2xlLFxuICAgICAgYXhpcy55ICogc2luSGFsZkFuZ2xlLFxuICAgICAgYXhpcy56ICogc2luSGFsZkFuZ2xlLFxuICAgICAgTWF0aC5jb3MoIGhhbGZBbmdsZSApXG4gICAgXSApO1xuICB9XG5cbiAgLyoqXG4gICAqIEdlbmVyYXRlIGEgUXVhdGVybmlvbiBvdXQgb2YgYSByb3RhdGlvbiBtYXRyaXguXG4gICAqIFlvaW5rZWQgZnJvbSBUaHJlZS5qcy5cbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgZnJvbU1hdHJpeCggbWF0cml4OiBNYXRyaXg0ICk6IFF1YXRlcm5pb24ge1xuICAgIGNvbnN0IG0gPSBtYXRyaXguZWxlbWVudHMsXG4gICAgICBtMTEgPSBtWyAwIF0sIG0xMiA9IG1bIDQgXSwgbTEzID0gbVsgOCBdLFxuICAgICAgbTIxID0gbVsgMSBdLCBtMjIgPSBtWyA1IF0sIG0yMyA9IG1bIDkgXSxcbiAgICAgIG0zMSA9IG1bIDIgXSwgbTMyID0gbVsgNiBdLCBtMzMgPSBtWyAxMCBdLFxuICAgICAgdHJhY2UgPSBtMTEgKyBtMjIgKyBtMzM7XG5cbiAgICBpZiAoIHRyYWNlID4gMCApIHtcbiAgICAgIGNvbnN0IHMgPSAwLjUgLyBNYXRoLnNxcnQoIHRyYWNlICsgMS4wICk7XG4gICAgICByZXR1cm4gbmV3IFF1YXRlcm5pb24oIFtcbiAgICAgICAgKCBtMzIgLSBtMjMgKSAqIHMsXG4gICAgICAgICggbTEzIC0gbTMxICkgKiBzLFxuICAgICAgICAoIG0yMSAtIG0xMiApICogcyxcbiAgICAgICAgMC4yNSAvIHNcbiAgICAgIF0gKTtcbiAgICB9IGVsc2UgaWYgKCBtMTEgPiBtMjIgJiYgbTExID4gbTMzICkge1xuICAgICAgY29uc3QgcyA9IDIuMCAqIE1hdGguc3FydCggMS4wICsgbTExIC0gbTIyIC0gbTMzICk7XG4gICAgICByZXR1cm4gbmV3IFF1YXRlcm5pb24oIFtcbiAgICAgICAgMC4yNSAqIHMsXG4gICAgICAgICggbTEyICsgbTIxICkgLyBzLFxuICAgICAgICAoIG0xMyArIG0zMSApIC8gcyxcbiAgICAgICAgKCBtMzIgLSBtMjMgKSAvIHNcbiAgICAgIF0gKTtcbiAgICB9IGVsc2UgaWYgKCBtMjIgPiBtMzMgKSB7XG4gICAgICBjb25zdCBzID0gMi4wICogTWF0aC5zcXJ0KCAxLjAgKyBtMjIgLSBtMTEgLSBtMzMgKTtcbiAgICAgIHJldHVybiBuZXcgUXVhdGVybmlvbiggW1xuICAgICAgICAoIG0xMiArIG0yMSApIC8gcyxcbiAgICAgICAgMC4yNSAqIHMsXG4gICAgICAgICggbTIzICsgbTMyICkgLyBzLFxuICAgICAgICAoIG0xMyAtIG0zMSApIC8gc1xuICAgICAgXSApO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBzID0gMi4wICogTWF0aC5zcXJ0KCAxLjAgKyBtMzMgLSBtMTEgLSBtMjIgKTtcbiAgICAgIHJldHVybiBuZXcgUXVhdGVybmlvbiggW1xuICAgICAgICAoIG0xMyArIG0zMSApIC8gcyxcbiAgICAgICAgKCBtMjMgKyBtMzIgKSAvIHMsXG4gICAgICAgIDAuMjUgKiBzLFxuICAgICAgICAoIG0yMSAtIG0xMiApIC8gc1xuICAgICAgXSApO1xuICAgIH1cbiAgfVxufVxuIiwiaW1wb3J0IHsgUXVhdGVybmlvbiB9IGZyb20gJy4vUXVhdGVybmlvbic7XG5pbXBvcnQgeyBWZWN0b3IzIH0gZnJvbSAnLi9WZWN0b3IzJztcblxuZXhwb3J0IHR5cGUgcmF3TWF0cml4NCA9IFtcbiAgbnVtYmVyLCBudW1iZXIsIG51bWJlciwgbnVtYmVyLFxuICBudW1iZXIsIG51bWJlciwgbnVtYmVyLCBudW1iZXIsXG4gIG51bWJlciwgbnVtYmVyLCBudW1iZXIsIG51bWJlcixcbiAgbnVtYmVyLCBudW1iZXIsIG51bWJlciwgbnVtYmVyXG5dO1xuXG5leHBvcnQgY29uc3QgcmF3SWRlbnRpdHlNYXRyaXg0OiByYXdNYXRyaXg0ID0gW1xuICAxLjAsIDAuMCwgMC4wLCAwLjAsXG4gIDAuMCwgMS4wLCAwLjAsIDAuMCxcbiAgMC4wLCAwLjAsIDEuMCwgMC4wLFxuICAwLjAsIDAuMCwgMC4wLCAxLjBcbl07XG5cbi8qKlxuICogQSBNYXRyaXg0LlxuICovXG5leHBvcnQgY2xhc3MgTWF0cml4NCB7XG4gIHB1YmxpYyBlbGVtZW50czogcmF3TWF0cml4NDtcblxuICBwdWJsaWMgY29uc3RydWN0b3IoIHY6IHJhd01hdHJpeDQgPSByYXdJZGVudGl0eU1hdHJpeDQgKSB7XG4gICAgdGhpcy5lbGVtZW50cyA9IHY7XG4gIH1cblxuICAvKipcbiAgICogSXRzZWxmIGJ1dCB0cmFuc3Bvc2VkLlxuICAgKi9cbiAgcHVibGljIGdldCB0cmFuc3Bvc2UoKTogTWF0cml4NCB7XG4gICAgY29uc3QgbSA9IHRoaXMuZWxlbWVudHM7XG5cbiAgICByZXR1cm4gbmV3IE1hdHJpeDQoIFtcbiAgICAgIG1bIDAgXSwgbVsgNCBdLCBtWyA4IF0sIG1bIDEyIF0sXG4gICAgICBtWyAxIF0sIG1bIDUgXSwgbVsgOSBdLCBtWyAxMyBdLFxuICAgICAgbVsgMiBdLCBtWyA2IF0sIG1bIDEwIF0sIG1bIDE0IF0sXG4gICAgICBtWyAzIF0sIG1bIDcgXSwgbVsgMTEgXSwgbVsgMTUgXVxuICAgIF0gKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJdHMgZGV0ZXJtaW5hbnQuXG4gICAqL1xuICBwdWJsaWMgZ2V0IGRldGVybWluYW50KCk6IG51bWJlciB7XG4gICAgY29uc3QgbSA9IHRoaXMuZWxlbWVudHM7XG4gICAgY29uc3RcbiAgICAgIGEwMCA9IG1bICAwIF0sIGEwMSA9IG1bICAxIF0sIGEwMiA9IG1bICAyIF0sIGEwMyA9IG1bICAzIF0sXG4gICAgICBhMTAgPSBtWyAgNCBdLCBhMTEgPSBtWyAgNSBdLCBhMTIgPSBtWyAgNiBdLCBhMTMgPSBtWyAgNyBdLFxuICAgICAgYTIwID0gbVsgIDggXSwgYTIxID0gbVsgIDkgXSwgYTIyID0gbVsgMTAgXSwgYTIzID0gbVsgMTEgXSxcbiAgICAgIGEzMCA9IG1bIDEyIF0sIGEzMSA9IG1bIDEzIF0sIGEzMiA9IG1bIDE0IF0sIGEzMyA9IG1bIDE1IF0sXG4gICAgICBiMDAgPSBhMDAgKiBhMTEgLSBhMDEgKiBhMTAsICBiMDEgPSBhMDAgKiBhMTIgLSBhMDIgKiBhMTAsXG4gICAgICBiMDIgPSBhMDAgKiBhMTMgLSBhMDMgKiBhMTAsICBiMDMgPSBhMDEgKiBhMTIgLSBhMDIgKiBhMTEsXG4gICAgICBiMDQgPSBhMDEgKiBhMTMgLSBhMDMgKiBhMTEsICBiMDUgPSBhMDIgKiBhMTMgLSBhMDMgKiBhMTIsXG4gICAgICBiMDYgPSBhMjAgKiBhMzEgLSBhMjEgKiBhMzAsICBiMDcgPSBhMjAgKiBhMzIgLSBhMjIgKiBhMzAsXG4gICAgICBiMDggPSBhMjAgKiBhMzMgLSBhMjMgKiBhMzAsICBiMDkgPSBhMjEgKiBhMzIgLSBhMjIgKiBhMzEsXG4gICAgICBiMTAgPSBhMjEgKiBhMzMgLSBhMjMgKiBhMzEsICBiMTEgPSBhMjIgKiBhMzMgLSBhMjMgKiBhMzI7XG5cbiAgICByZXR1cm4gYjAwICogYjExIC0gYjAxICogYjEwICsgYjAyICogYjA5ICsgYjAzICogYjA4IC0gYjA0ICogYjA3ICsgYjA1ICogYjA2O1xuICB9XG5cbiAgLyoqXG4gICAqIEl0c2VsZiBidXQgaW52ZXJ0ZWQuXG4gICAqL1xuICBwdWJsaWMgZ2V0IGludmVyc2UoKTogTWF0cml4NCB8IG51bGwge1xuICAgIGNvbnN0IG0gPSB0aGlzLmVsZW1lbnRzO1xuICAgIGNvbnN0XG4gICAgICBhMDAgPSBtWyAgMCBdLCBhMDEgPSBtWyAgMSBdLCBhMDIgPSBtWyAgMiBdLCBhMDMgPSBtWyAgMyBdLFxuICAgICAgYTEwID0gbVsgIDQgXSwgYTExID0gbVsgIDUgXSwgYTEyID0gbVsgIDYgXSwgYTEzID0gbVsgIDcgXSxcbiAgICAgIGEyMCA9IG1bICA4IF0sIGEyMSA9IG1bICA5IF0sIGEyMiA9IG1bIDEwIF0sIGEyMyA9IG1bIDExIF0sXG4gICAgICBhMzAgPSBtWyAxMiBdLCBhMzEgPSBtWyAxMyBdLCBhMzIgPSBtWyAxNCBdLCBhMzMgPSBtWyAxNSBdLFxuICAgICAgYjAwID0gYTAwICogYTExIC0gYTAxICogYTEwLCAgYjAxID0gYTAwICogYTEyIC0gYTAyICogYTEwLFxuICAgICAgYjAyID0gYTAwICogYTEzIC0gYTAzICogYTEwLCAgYjAzID0gYTAxICogYTEyIC0gYTAyICogYTExLFxuICAgICAgYjA0ID0gYTAxICogYTEzIC0gYTAzICogYTExLCAgYjA1ID0gYTAyICogYTEzIC0gYTAzICogYTEyLFxuICAgICAgYjA2ID0gYTIwICogYTMxIC0gYTIxICogYTMwLCAgYjA3ID0gYTIwICogYTMyIC0gYTIyICogYTMwLFxuICAgICAgYjA4ID0gYTIwICogYTMzIC0gYTIzICogYTMwLCAgYjA5ID0gYTIxICogYTMyIC0gYTIyICogYTMxLFxuICAgICAgYjEwID0gYTIxICogYTMzIC0gYTIzICogYTMxLCAgYjExID0gYTIyICogYTMzIC0gYTIzICogYTMyO1xuXG4gICAgY29uc3QgZGV0ID0gYjAwICogYjExIC0gYjAxICogYjEwICsgYjAyICogYjA5ICsgYjAzICogYjA4IC0gYjA0ICogYjA3ICsgYjA1ICogYjA2O1xuXG4gICAgaWYgKCBkZXQgPT09IDAuMCApIHsgcmV0dXJuIG51bGw7IH1cblxuICAgIGNvbnN0IGludkRldCA9IDEuMCAvIGRldDtcblxuICAgIHJldHVybiBuZXcgTWF0cml4NCggW1xuICAgICAgYTExICogYjExIC0gYTEyICogYjEwICsgYTEzICogYjA5LFxuICAgICAgYTAyICogYjEwIC0gYTAxICogYjExIC0gYTAzICogYjA5LFxuICAgICAgYTMxICogYjA1IC0gYTMyICogYjA0ICsgYTMzICogYjAzLFxuICAgICAgYTIyICogYjA0IC0gYTIxICogYjA1IC0gYTIzICogYjAzLFxuICAgICAgYTEyICogYjA4IC0gYTEwICogYjExIC0gYTEzICogYjA3LFxuICAgICAgYTAwICogYjExIC0gYTAyICogYjA4ICsgYTAzICogYjA3LFxuICAgICAgYTMyICogYjAyIC0gYTMwICogYjA1IC0gYTMzICogYjAxLFxuICAgICAgYTIwICogYjA1IC0gYTIyICogYjAyICsgYTIzICogYjAxLFxuICAgICAgYTEwICogYjEwIC0gYTExICogYjA4ICsgYTEzICogYjA2LFxuICAgICAgYTAxICogYjA4IC0gYTAwICogYjEwIC0gYTAzICogYjA2LFxuICAgICAgYTMwICogYjA0IC0gYTMxICogYjAyICsgYTMzICogYjAwLFxuICAgICAgYTIxICogYjAyIC0gYTIwICogYjA0IC0gYTIzICogYjAwLFxuICAgICAgYTExICogYjA3IC0gYTEwICogYjA5IC0gYTEyICogYjA2LFxuICAgICAgYTAwICogYjA5IC0gYTAxICogYjA3ICsgYTAyICogYjA2LFxuICAgICAgYTMxICogYjAxIC0gYTMwICogYjAzIC0gYTMyICogYjAwLFxuICAgICAgYTIwICogYjAzIC0gYTIxICogYjAxICsgYTIyICogYjAwXG4gICAgXS5tYXAoICggdiApID0+IHYgKiBpbnZEZXQgKSBhcyByYXdNYXRyaXg0ICk7XG4gIH1cblxuICBwdWJsaWMgdG9TdHJpbmcoKTogc3RyaW5nIHtcbiAgICBjb25zdCBtID0gdGhpcy5lbGVtZW50cy5tYXAoICggdiApID0+IHYudG9GaXhlZCggMyApICk7XG4gICAgcmV0dXJuIGBNYXRyaXg0KCAkeyBtWyAwIF0gfSwgJHsgbVsgNCBdIH0sICR7IG1bIDggXSB9LCAkeyBtWyAxMiBdIH07ICR7IG1bIDEgXSB9LCAkeyBtWyA1IF0gfSwgJHsgbVsgOSBdIH0sICR7IG1bIDEzIF0gfTsgJHsgbVsgMiBdIH0sICR7IG1bIDYgXSB9LCAkeyBtWyAxMCBdIH0sICR7IG1bIDE0IF0gfTsgJHsgbVsgMyBdIH0sICR7IG1bIDcgXSB9LCAkeyBtWyAxMSBdIH0sICR7IG1bIDE1IF0gfSApYDtcbiAgfVxuXG4gIC8qKlxuICAgKiBDbG9uZSB0aGlzLlxuICAgKi9cbiAgcHVibGljIGNsb25lKCk6IE1hdHJpeDQge1xuICAgIHJldHVybiBuZXcgTWF0cml4NCggdGhpcy5lbGVtZW50cy5jb25jYXQoKSBhcyByYXdNYXRyaXg0ICk7XG4gIH1cblxuICAvKipcbiAgICogTXVsdGlwbHkgdGhpcyBNYXRyaXg0IGJ5IG9uZSBvciBtb3JlIE1hdHJpeDRzLlxuICAgKi9cbiAgcHVibGljIG11bHRpcGx5KCAuLi5tYXRyaWNlczogTWF0cml4NFtdICk6IE1hdHJpeDQge1xuICAgIGlmICggbWF0cmljZXMubGVuZ3RoID09PSAwICkge1xuICAgICAgcmV0dXJuIHRoaXMuY2xvbmUoKTtcbiAgICB9XG5cbiAgICBjb25zdCBhcnIgPSBtYXRyaWNlcy5jb25jYXQoKTtcbiAgICBsZXQgYk1hdCA9IGFyci5zaGlmdCgpITtcbiAgICBpZiAoIDAgPCBhcnIubGVuZ3RoICkge1xuICAgICAgYk1hdCA9IGJNYXQubXVsdGlwbHkoIC4uLmFyciApO1xuICAgIH1cblxuICAgIGNvbnN0IGEgPSB0aGlzLmVsZW1lbnRzO1xuICAgIGNvbnN0IGIgPSBiTWF0LmVsZW1lbnRzO1xuXG4gICAgcmV0dXJuIG5ldyBNYXRyaXg0KCBbXG4gICAgICBhWyAwIF0gKiBiWyAwIF0gKyBhWyA0IF0gKiBiWyAxIF0gKyBhWyA4IF0gKiBiWyAyIF0gKyBhWyAxMiBdICogYlsgMyBdLFxuICAgICAgYVsgMSBdICogYlsgMCBdICsgYVsgNSBdICogYlsgMSBdICsgYVsgOSBdICogYlsgMiBdICsgYVsgMTMgXSAqIGJbIDMgXSxcbiAgICAgIGFbIDIgXSAqIGJbIDAgXSArIGFbIDYgXSAqIGJbIDEgXSArIGFbIDEwIF0gKiBiWyAyIF0gKyBhWyAxNCBdICogYlsgMyBdLFxuICAgICAgYVsgMyBdICogYlsgMCBdICsgYVsgNyBdICogYlsgMSBdICsgYVsgMTEgXSAqIGJbIDIgXSArIGFbIDE1IF0gKiBiWyAzIF0sXG5cbiAgICAgIGFbIDAgXSAqIGJbIDQgXSArIGFbIDQgXSAqIGJbIDUgXSArIGFbIDggXSAqIGJbIDYgXSArIGFbIDEyIF0gKiBiWyA3IF0sXG4gICAgICBhWyAxIF0gKiBiWyA0IF0gKyBhWyA1IF0gKiBiWyA1IF0gKyBhWyA5IF0gKiBiWyA2IF0gKyBhWyAxMyBdICogYlsgNyBdLFxuICAgICAgYVsgMiBdICogYlsgNCBdICsgYVsgNiBdICogYlsgNSBdICsgYVsgMTAgXSAqIGJbIDYgXSArIGFbIDE0IF0gKiBiWyA3IF0sXG4gICAgICBhWyAzIF0gKiBiWyA0IF0gKyBhWyA3IF0gKiBiWyA1IF0gKyBhWyAxMSBdICogYlsgNiBdICsgYVsgMTUgXSAqIGJbIDcgXSxcblxuICAgICAgYVsgMCBdICogYlsgOCBdICsgYVsgNCBdICogYlsgOSBdICsgYVsgOCBdICogYlsgMTAgXSArIGFbIDEyIF0gKiBiWyAxMSBdLFxuICAgICAgYVsgMSBdICogYlsgOCBdICsgYVsgNSBdICogYlsgOSBdICsgYVsgOSBdICogYlsgMTAgXSArIGFbIDEzIF0gKiBiWyAxMSBdLFxuICAgICAgYVsgMiBdICogYlsgOCBdICsgYVsgNiBdICogYlsgOSBdICsgYVsgMTAgXSAqIGJbIDEwIF0gKyBhWyAxNCBdICogYlsgMTEgXSxcbiAgICAgIGFbIDMgXSAqIGJbIDggXSArIGFbIDcgXSAqIGJbIDkgXSArIGFbIDExIF0gKiBiWyAxMCBdICsgYVsgMTUgXSAqIGJbIDExIF0sXG5cbiAgICAgIGFbIDAgXSAqIGJbIDEyIF0gKyBhWyA0IF0gKiBiWyAxMyBdICsgYVsgOCBdICogYlsgMTQgXSArIGFbIDEyIF0gKiBiWyAxNSBdLFxuICAgICAgYVsgMSBdICogYlsgMTIgXSArIGFbIDUgXSAqIGJbIDEzIF0gKyBhWyA5IF0gKiBiWyAxNCBdICsgYVsgMTMgXSAqIGJbIDE1IF0sXG4gICAgICBhWyAyIF0gKiBiWyAxMiBdICsgYVsgNiBdICogYlsgMTMgXSArIGFbIDEwIF0gKiBiWyAxNCBdICsgYVsgMTQgXSAqIGJbIDE1IF0sXG4gICAgICBhWyAzIF0gKiBiWyAxMiBdICsgYVsgNyBdICogYlsgMTMgXSArIGFbIDExIF0gKiBiWyAxNCBdICsgYVsgMTUgXSAqIGJbIDE1IF1cbiAgICBdICk7XG4gIH1cblxuICAvKipcbiAgICogTXVsdGlwbHkgdGhpcyBNYXRyaXg0IGJ5IGEgc2NhbGFyXG4gICAqL1xuICBwdWJsaWMgc2NhbGVTY2FsYXIoIHNjYWxhcjogbnVtYmVyICk6IE1hdHJpeDQge1xuICAgIHJldHVybiBuZXcgTWF0cml4NCggdGhpcy5lbGVtZW50cy5tYXAoICggdiApID0+IHYgKiBzY2FsYXIgKSBhcyByYXdNYXRyaXg0ICk7XG4gIH1cblxuICAvKipcbiAgICogQW4gaWRlbnRpdHkgTWF0cml4NC5cbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgZ2V0IGlkZW50aXR5KCk6IE1hdHJpeDQge1xuICAgIHJldHVybiBuZXcgTWF0cml4NCggcmF3SWRlbnRpdHlNYXRyaXg0ICk7XG4gIH1cblxuICBwdWJsaWMgc3RhdGljIG11bHRpcGx5KCAuLi5tYXRyaWNlczogTWF0cml4NFtdICk6IE1hdHJpeDQge1xuICAgIGlmICggbWF0cmljZXMubGVuZ3RoID09PSAwICkge1xuICAgICAgcmV0dXJuIE1hdHJpeDQuaWRlbnRpdHk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IGJNYXRzID0gbWF0cmljZXMuY29uY2F0KCk7XG4gICAgICBjb25zdCBhTWF0ID0gYk1hdHMuc2hpZnQoKSE7XG4gICAgICByZXR1cm4gYU1hdC5tdWx0aXBseSggLi4uYk1hdHMgKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogR2VuZXJhdGUgYSB0cmFuc2xhdGlvbiBtYXRyaXguXG4gICAqIEBwYXJhbSB2ZWN0b3IgVHJhbnNsYXRpb25cbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgdHJhbnNsYXRlKCB2ZWN0b3I6IFZlY3RvcjMgKTogTWF0cml4NCB7XG4gICAgcmV0dXJuIG5ldyBNYXRyaXg0KCBbXG4gICAgICAxLCAwLCAwLCAwLFxuICAgICAgMCwgMSwgMCwgMCxcbiAgICAgIDAsIDAsIDEsIDAsXG4gICAgICB2ZWN0b3IueCwgdmVjdG9yLnksIHZlY3Rvci56LCAxXG4gICAgXSApO1xuICB9XG5cbiAgLyoqXG4gICAqIEdlbmVyYXRlIGEgM2Qgc2NhbGluZyBtYXRyaXguXG4gICAqIEBwYXJhbSB2ZWN0b3IgU2NhbGVcbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgc2NhbGUoIHZlY3RvcjogVmVjdG9yMyApOiBNYXRyaXg0IHtcbiAgICByZXR1cm4gbmV3IE1hdHJpeDQoIFtcbiAgICAgIHZlY3Rvci54LCAwLCAwLCAwLFxuICAgICAgMCwgdmVjdG9yLnksIDAsIDAsXG4gICAgICAwLCAwLCB2ZWN0b3IueiwgMCxcbiAgICAgIDAsIDAsIDAsIDFcbiAgICBdICk7XG4gIH1cblxuICAvKipcbiAgICogR2VuZXJhdGUgYSAzZCBzY2FsaW5nIG1hdHJpeCBieSBhIHNjYWxhci5cbiAgICogQHBhcmFtIHZlY3RvciBTY2FsZVxuICAgKi9cbiAgcHVibGljIHN0YXRpYyBzY2FsZVNjYWxhciggc2NhbGFyOiBudW1iZXIgKTogTWF0cml4NCB7XG4gICAgcmV0dXJuIG5ldyBNYXRyaXg0KCBbXG4gICAgICBzY2FsYXIsIDAsIDAsIDAsXG4gICAgICAwLCBzY2FsYXIsIDAsIDAsXG4gICAgICAwLCAwLCBzY2FsYXIsIDAsXG4gICAgICAwLCAwLCAwLCAxXG4gICAgXSApO1xuICB9XG5cbiAgLyoqXG4gICAqIEdlbmVyYXRlIGEgM2Qgcm90YXRpb24gbWF0cml4LCByb3RhdGVzIGFyb3VuZCB4IGF4aXMuXG4gICAqIEBwYXJhbSB2ZWN0b3IgU2NhbGVcbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgcm90YXRlWCggdGhldGE6IG51bWJlciApOiBNYXRyaXg0IHtcbiAgICByZXR1cm4gbmV3IE1hdHJpeDQoIFtcbiAgICAgIDEsIDAsIDAsIDAsXG4gICAgICAwLCBNYXRoLmNvcyggdGhldGEgKSwgLU1hdGguc2luKCB0aGV0YSApLCAwLFxuICAgICAgMCwgTWF0aC5zaW4oIHRoZXRhICksIE1hdGguY29zKCB0aGV0YSApLCAwLFxuICAgICAgMCwgMCwgMCwgMVxuICAgIF0gKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZW5lcmF0ZSBhIDNkIHJvdGF0aW9uIG1hdHJpeCwgcm90YXRlcyBhcm91bmQgeSBheGlzLlxuICAgKiBAcGFyYW0gdmVjdG9yIFNjYWxlXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIHJvdGF0ZVkoIHRoZXRhOiBudW1iZXIgKTogTWF0cml4NCB7XG4gICAgcmV0dXJuIG5ldyBNYXRyaXg0KCBbXG4gICAgICBNYXRoLmNvcyggdGhldGEgKSwgMCwgTWF0aC5zaW4oIHRoZXRhICksIDAsXG4gICAgICAwLCAxLCAwLCAwLFxuICAgICAgLU1hdGguc2luKCB0aGV0YSApLCAwLCBNYXRoLmNvcyggdGhldGEgKSwgMCxcbiAgICAgIDAsIDAsIDAsIDFcbiAgICBdICk7XG4gIH1cblxuICAvKipcbiAgICogR2VuZXJhdGUgYSAzZCByb3RhdGlvbiBtYXRyaXgsIHJvdGF0ZXMgYXJvdW5kIHogYXhpcy5cbiAgICogQHBhcmFtIHZlY3RvciBTY2FsZVxuICAgKi9cbiAgcHVibGljIHN0YXRpYyByb3RhdGVaKCB0aGV0YTogbnVtYmVyICk6IE1hdHJpeDQge1xuICAgIHJldHVybiBuZXcgTWF0cml4NCggW1xuICAgICAgTWF0aC5jb3MoIHRoZXRhICksIC1NYXRoLnNpbiggdGhldGEgKSwgMCwgMCxcbiAgICAgIE1hdGguc2luKCB0aGV0YSApLCBNYXRoLmNvcyggdGhldGEgKSwgMCwgMCxcbiAgICAgIDAsIDAsIDEsIDAsXG4gICAgICAwLCAwLCAwLCAxXG4gICAgXSApO1xuICB9XG5cbiAgLyoqXG4gICAqIEdlbmVyYXRlIGEgXCJMb29rQXRcIiBtYXRyaXguXG4gICAqXG4gICAqIFNlZSBhbHNvOiB7QGxpbmsgbG9va0F0SW52ZXJzZX1cbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgbG9va0F0KFxuICAgIHBvc2l0aW9uOiBWZWN0b3IzLFxuICAgIHRhcmdldCA9IG5ldyBWZWN0b3IzKCBbIDAuMCwgMC4wLCAwLjAgXSApLFxuICAgIHVwID0gbmV3IFZlY3RvcjMoIFsgMC4wLCAxLjAsIDAuMCBdICksXG4gICAgcm9sbCA9IDAuMFxuICApOiBNYXRyaXg0IHtcbiAgICBjb25zdCBkaXIgPSBwb3NpdGlvbi5zdWIoIHRhcmdldCApLm5vcm1hbGl6ZWQ7XG4gICAgbGV0IHNpZCA9IHVwLmNyb3NzKCBkaXIgKS5ub3JtYWxpemVkO1xuICAgIGxldCB0b3AgPSBkaXIuY3Jvc3MoIHNpZCApO1xuICAgIHNpZCA9IHNpZC5zY2FsZSggTWF0aC5jb3MoIHJvbGwgKSApLmFkZCggdG9wLnNjYWxlKCBNYXRoLnNpbiggcm9sbCApICkgKTtcbiAgICB0b3AgPSBkaXIuY3Jvc3MoIHNpZCApO1xuXG4gICAgcmV0dXJuIG5ldyBNYXRyaXg0KCBbXG4gICAgICBzaWQueCwgc2lkLnksIHNpZC56LCAwLjAsXG4gICAgICB0b3AueCwgdG9wLnksIHRvcC56LCAwLjAsXG4gICAgICBkaXIueCwgZGlyLnksIGRpci56LCAwLjAsXG4gICAgICBwb3NpdGlvbi54LCBwb3NpdGlvbi55LCBwb3NpdGlvbi56LCAxLjBcbiAgICBdICk7XG4gIH1cblxuICAvKipcbiAgICogR2VuZXJhdGUgYW4gaW52ZXJzZSBvZiBcIkxvb2tBdFwiIG1hdHJpeC4gR29vZCBmb3IgY3JlYXRpbmcgYSB2aWV3IG1hdHJpeC5cbiAgICpcbiAgICogU2VlIGFsc286IHtAbGluayBsb29rQXR9XG4gICAqL1xuICBwdWJsaWMgc3RhdGljIGxvb2tBdEludmVyc2UoXG4gICAgcG9zaXRpb246IFZlY3RvcjMsXG4gICAgdGFyZ2V0ID0gbmV3IFZlY3RvcjMoIFsgMC4wLCAwLjAsIDAuMCBdICksXG4gICAgdXAgPSBuZXcgVmVjdG9yMyggWyAwLjAsIDEuMCwgMC4wIF0gKSxcbiAgICByb2xsID0gMC4wXG4gICk6IE1hdHJpeDQge1xuICAgIGNvbnN0IGRpciA9IHBvc2l0aW9uLnN1YiggdGFyZ2V0ICkubm9ybWFsaXplZDtcbiAgICBsZXQgc2lkID0gdXAuY3Jvc3MoIGRpciApLm5vcm1hbGl6ZWQ7XG4gICAgbGV0IHRvcCA9IGRpci5jcm9zcyggc2lkICk7XG4gICAgc2lkID0gc2lkLnNjYWxlKCBNYXRoLmNvcyggcm9sbCApICkuYWRkKCB0b3Auc2NhbGUoIE1hdGguc2luKCByb2xsICkgKSApO1xuICAgIHRvcCA9IGRpci5jcm9zcyggc2lkICk7XG5cbiAgICByZXR1cm4gbmV3IE1hdHJpeDQoIFtcbiAgICAgIHNpZC54LCB0b3AueCwgZGlyLngsIDAuMCxcbiAgICAgIHNpZC55LCB0b3AueSwgZGlyLnksIDAuMCxcbiAgICAgIHNpZC56LCB0b3AueiwgZGlyLnosIDAuMCxcbiAgICAgIC1zaWQueCAqIHBvc2l0aW9uLnggLSBzaWQueSAqIHBvc2l0aW9uLnkgLSBzaWQueiAqIHBvc2l0aW9uLnosXG4gICAgICAtdG9wLnggKiBwb3NpdGlvbi54IC0gdG9wLnkgKiBwb3NpdGlvbi55IC0gdG9wLnogKiBwb3NpdGlvbi56LFxuICAgICAgLWRpci54ICogcG9zaXRpb24ueCAtIGRpci55ICogcG9zaXRpb24ueSAtIGRpci56ICogcG9zaXRpb24ueixcbiAgICAgIDEuMFxuICAgIF0gKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZW5lcmF0ZSBhIFwiUGVyc3BlY3RpdmVcIiBwcm9qZWN0aW9uIG1hdHJpeC5cbiAgICogSXQgd29uJ3QgaW5jbHVkZSBhc3BlY3QhXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIHBlcnNwZWN0aXZlKCBmb3YgPSA0NS4wLCBuZWFyID0gMC4wMSwgZmFyID0gMTAwLjAgKTogTWF0cml4NCB7XG4gICAgY29uc3QgcCA9IDEuMCAvIE1hdGgudGFuKCBmb3YgKiBNYXRoLlBJIC8gMzYwLjAgKTtcbiAgICBjb25zdCBkID0gKCBmYXIgLSBuZWFyICk7XG4gICAgcmV0dXJuIG5ldyBNYXRyaXg0KCBbXG4gICAgICBwLCAwLjAsIDAuMCwgMC4wLFxuICAgICAgMC4wLCBwLCAwLjAsIDAuMCxcbiAgICAgIDAuMCwgMC4wLCAtKCBmYXIgKyBuZWFyICkgLyBkLCAtMS4wLFxuICAgICAgMC4wLCAwLjAsIC0yICogZmFyICogbmVhciAvIGQsIDAuMFxuICAgIF0gKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBEZWNvbXBvc2UgdGhpcyBtYXRyaXggaW50byBhIHBvc2l0aW9uLCBhIHNjYWxlLCBhbmQgYSByb3RhdGlvbi5cbiAgICogWW9pbmtlZCBmcm9tIFRocmVlLmpzLlxuICAgKi9cbiAgcHVibGljIGRlY29tcG9zZSgpOiB7IHBvc2l0aW9uOiBWZWN0b3IzOyBzY2FsZTogVmVjdG9yMzsgcm90YXRpb246IFF1YXRlcm5pb24gfSB7XG4gICAgY29uc3QgbSA9IHRoaXMuZWxlbWVudHM7XG5cbiAgICBsZXQgc3ggPSBuZXcgVmVjdG9yMyggWyBtWyAwIF0sIG1bIDEgXSwgbVsgMiBdIF0gKS5sZW5ndGg7XG4gICAgY29uc3Qgc3kgPSBuZXcgVmVjdG9yMyggWyBtWyA0IF0sIG1bIDUgXSwgbVsgNiBdIF0gKS5sZW5ndGg7XG4gICAgY29uc3Qgc3ogPSBuZXcgVmVjdG9yMyggWyBtWyA4IF0sIG1bIDkgXSwgbVsgMTAgXSBdICkubGVuZ3RoO1xuXG4gICAgLy8gaWYgZGV0ZXJtaW5lIGlzIG5lZ2F0aXZlLCB3ZSBuZWVkIHRvIGludmVydCBvbmUgc2NhbGVcbiAgICBjb25zdCBkZXQgPSB0aGlzLmRldGVybWluYW50O1xuICAgIGlmICggZGV0IDwgMCApIHsgc3ggPSAtc3g7IH1cblxuICAgIGNvbnN0IGludlN4ID0gMS4wIC8gc3g7XG4gICAgY29uc3QgaW52U3kgPSAxLjAgLyBzeTtcbiAgICBjb25zdCBpbnZTeiA9IDEuMCAvIHN6O1xuXG4gICAgY29uc3Qgcm90YXRpb25NYXRyaXggPSB0aGlzLmNsb25lKCk7XG5cbiAgICByb3RhdGlvbk1hdHJpeC5lbGVtZW50c1sgMCBdICo9IGludlN4O1xuICAgIHJvdGF0aW9uTWF0cml4LmVsZW1lbnRzWyAxIF0gKj0gaW52U3g7XG4gICAgcm90YXRpb25NYXRyaXguZWxlbWVudHNbIDIgXSAqPSBpbnZTeDtcblxuICAgIHJvdGF0aW9uTWF0cml4LmVsZW1lbnRzWyA0IF0gKj0gaW52U3k7XG4gICAgcm90YXRpb25NYXRyaXguZWxlbWVudHNbIDUgXSAqPSBpbnZTeTtcbiAgICByb3RhdGlvbk1hdHJpeC5lbGVtZW50c1sgNiBdICo9IGludlN5O1xuXG4gICAgcm90YXRpb25NYXRyaXguZWxlbWVudHNbIDggXSAqPSBpbnZTejtcbiAgICByb3RhdGlvbk1hdHJpeC5lbGVtZW50c1sgOSBdICo9IGludlN6O1xuICAgIHJvdGF0aW9uTWF0cml4LmVsZW1lbnRzWyAxMCBdICo9IGludlN6O1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIHBvc2l0aW9uOiBuZXcgVmVjdG9yMyggWyBtWyAxMiBdLCBtWyAxMyBdLCBtWyAxNCBdIF0gKSxcbiAgICAgIHNjYWxlOiBuZXcgVmVjdG9yMyggWyBzeCwgc3ksIHN6IF0gKSxcbiAgICAgIHJvdGF0aW9uOiBRdWF0ZXJuaW9uLmZyb21NYXRyaXgoIHJvdGF0aW9uTWF0cml4IClcbiAgICB9O1xuICB9XG5cbiAgLyoqXG4gICAqIENvbXBvc2UgYSBtYXRyaXggb3V0IG9mIHBvc2l0aW9uLCBzY2FsZSwgYW5kIHJvdGF0aW9uLlxuICAgKiBZb2lua2VkIGZyb20gVGhyZWUuanMuXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIGNvbXBvc2UoIHBvc2l0aW9uOiBWZWN0b3IzLCByb3RhdGlvbjogUXVhdGVybmlvbiwgc2NhbGU6IFZlY3RvcjMgKTogTWF0cml4NCB7XG4gICAgY29uc3QgeCA9IHJvdGF0aW9uLngsIHkgPSByb3RhdGlvbi55LCB6ID0gcm90YXRpb24ueiwgdyA9IHJvdGF0aW9uLnc7XG4gICAgY29uc3QgeDIgPSB4ICsgeCxcdHkyID0geSArIHksIHoyID0geiArIHo7XG4gICAgY29uc3QgeHggPSB4ICogeDIsIHh5ID0geCAqIHkyLCB4eiA9IHggKiB6MjtcbiAgICBjb25zdCB5eSA9IHkgKiB5MiwgeXogPSB5ICogejIsIHp6ID0geiAqIHoyO1xuICAgIGNvbnN0IHd4ID0gdyAqIHgyLCB3eSA9IHcgKiB5Miwgd3ogPSB3ICogejI7XG4gICAgY29uc3Qgc3ggPSBzY2FsZS54LCBzeSA9IHNjYWxlLnksIHN6ID0gc2NhbGUuejtcblxuICAgIHJldHVybiBuZXcgTWF0cml4NCggW1xuICAgICAgKCAxLjAgLSAoIHl5ICsgenogKSApICogc3gsXG4gICAgICAoIHh5ICsgd3ogKSAqIHN4LFxuICAgICAgKCB4eiAtIHd5ICkgKiBzeCxcbiAgICAgIDAuMCxcblxuICAgICAgKCB4eSAtIHd6ICkgKiBzeSxcbiAgICAgICggMS4wIC0gKCB4eCArIHp6ICkgKSAqIHN5LFxuICAgICAgKCB5eiArIHd4ICkgKiBzeSxcbiAgICAgIDAuMCxcblxuICAgICAgKCB4eiArIHd5ICkgKiBzeixcbiAgICAgICggeXogLSB3eCApICogc3osXG4gICAgICAoIDEuMCAtICggeHggKyB5eSApICkgKiBzeixcbiAgICAgIDAuMCxcblxuICAgICAgcG9zaXRpb24ueCxcbiAgICAgIHBvc2l0aW9uLnksXG4gICAgICBwb3NpdGlvbi56LFxuICAgICAgMS4wXG4gICAgXSApO1xuICB9XG59XG4iLCJpbXBvcnQgeyBNYXRyaXg0IH0gZnJvbSAnLi9NYXRyaXg0JztcbmltcG9ydCB7IFZlY3RvciB9IGZyb20gJy4vVmVjdG9yJztcblxuZXhwb3J0IHR5cGUgcmF3VmVjdG9yNCA9IFsgbnVtYmVyLCBudW1iZXIsIG51bWJlciwgbnVtYmVyIF07XG5cbi8qKlxuICogQSBWZWN0b3IzLlxuICovXG5leHBvcnQgY2xhc3MgVmVjdG9yNCBleHRlbmRzIFZlY3RvcjxWZWN0b3I0PiB7XG4gIHB1YmxpYyBlbGVtZW50czogcmF3VmVjdG9yNDtcblxuICBwdWJsaWMgY29uc3RydWN0b3IoIHY6IHJhd1ZlY3RvcjQgPSBbIDAuMCwgMC4wLCAwLjAsIDAuMCBdICkge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5lbGVtZW50cyA9IHY7XG4gIH1cblxuICAvKipcbiAgICogQW4geCBjb21wb25lbnQgb2YgdGhpcy5cbiAgICovXG4gIHB1YmxpYyBnZXQgeCgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLmVsZW1lbnRzWyAwIF07XG4gIH1cblxuICBwdWJsaWMgc2V0IHgoIHg6IG51bWJlciApIHtcbiAgICB0aGlzLmVsZW1lbnRzWyAwIF0gPSB4O1xuICB9XG5cbiAgLyoqXG4gICAqIEEgeSBjb21wb25lbnQgb2YgdGhpcy5cbiAgICovXG4gIHB1YmxpYyBnZXQgeSgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLmVsZW1lbnRzWyAxIF07XG4gIH1cblxuICBwdWJsaWMgc2V0IHkoIHk6IG51bWJlciApIHtcbiAgICB0aGlzLmVsZW1lbnRzWyAxIF0gPSB5O1xuICB9XG5cbiAgLyoqXG4gICAqIEEgeiBjb21wb25lbnQgb2YgdGhpcy5cbiAgICovXG4gIHB1YmxpYyBnZXQgeigpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLmVsZW1lbnRzWyAyIF07XG4gIH1cblxuICBwdWJsaWMgc2V0IHooIHo6IG51bWJlciApIHtcbiAgICB0aGlzLmVsZW1lbnRzWyAyIF0gPSB6O1xuICB9XG5cbiAgLyoqXG4gICAqIEEgdyBjb21wb25lbnQgb2YgdGhpcy5cbiAgICovXG4gIHB1YmxpYyBnZXQgdygpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLmVsZW1lbnRzWyAzIF07XG4gIH1cblxuICBwdWJsaWMgc2V0IHcoIHo6IG51bWJlciApIHtcbiAgICB0aGlzLmVsZW1lbnRzWyAzIF0gPSB6O1xuICB9XG5cbiAgcHVibGljIHRvU3RyaW5nKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGBWZWN0b3I0KCAkeyB0aGlzLngudG9GaXhlZCggMyApIH0sICR7IHRoaXMueS50b0ZpeGVkKCAzICkgfSwgJHsgdGhpcy56LnRvRml4ZWQoIDMgKSB9LCAkeyB0aGlzLncudG9GaXhlZCggMyApIH0gKWA7XG4gIH1cblxuICAvKipcbiAgICogTXVsdGlwbHkgdGhpcyB2ZWN0b3IgKHdpdGggYW4gaW1wbGljaXQgMSBpbiB0aGUgNHRoIGRpbWVuc2lvbikgYnkgbS5cbiAgICovXG4gIHB1YmxpYyBhcHBseU1hdHJpeDQoIG1hdHJpeDogTWF0cml4NCApOiBWZWN0b3I0IHtcbiAgICBjb25zdCBtID0gbWF0cml4LmVsZW1lbnRzO1xuXG4gICAgcmV0dXJuIG5ldyBWZWN0b3I0KCBbXG4gICAgICBtWyAwIF0gKiB0aGlzLnggKyBtWyA0IF0gKiB0aGlzLnkgKyBtWyA4IF0gKiB0aGlzLnogKyBtWyAxMiBdICogdGhpcy53LFxuICAgICAgbVsgMSBdICogdGhpcy54ICsgbVsgNSBdICogdGhpcy55ICsgbVsgOSBdICogdGhpcy56ICsgbVsgMTMgXSAqIHRoaXMudyxcbiAgICAgIG1bIDIgXSAqIHRoaXMueCArIG1bIDYgXSAqIHRoaXMueSArIG1bIDEwIF0gKiB0aGlzLnogKyBtWyAxNCBdICogdGhpcy53LFxuICAgICAgbVsgMyBdICogdGhpcy54ICsgbVsgNyBdICogdGhpcy55ICsgbVsgMTEgXSAqIHRoaXMueiArIG1bIDE1IF0gKiB0aGlzLndcbiAgICBdICk7XG4gIH1cblxuICBwcm90ZWN0ZWQgX19uZXcoIHY6IHJhd1ZlY3RvcjQgKTogVmVjdG9yNCB7XG4gICAgcmV0dXJuIG5ldyBWZWN0b3I0KCB2ICk7XG4gIH1cblxuICAvKipcbiAgICogVmVjdG9yNCggMC4wLCAwLjAsIDAuMCwgMC4wIClcbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgZ2V0IHplcm8oKTogVmVjdG9yNCB7XG4gICAgcmV0dXJuIG5ldyBWZWN0b3I0KCBbIDAuMCwgMC4wLCAwLjAsIDAuMCBdICk7XG4gIH1cblxuICAvKipcbiAgICogVmVjdG9yNCggMS4wLCAxLjAsIDEuMCwgMS4wIClcbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgZ2V0IG9uZSgpOiBWZWN0b3I0IHtcbiAgICByZXR1cm4gbmV3IFZlY3RvcjQoIFsgMS4wLCAxLjAsIDEuMCwgMS4wIF0gKTtcbiAgfVxufVxuIiwiLyoqXG4gKiBVc2VmdWwgZm9yIHN3YXAgYnVmZmVyXG4gKi9cbmV4cG9ydCBjbGFzcyBTd2FwPFQ+IHtcbiAgcHVibGljIGk6IFQ7XG4gIHB1YmxpYyBvOiBUO1xuXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggYTogVCwgYjogVCApIHtcbiAgICB0aGlzLmkgPSBhO1xuICAgIHRoaXMubyA9IGI7XG4gIH1cblxuICBwdWJsaWMgc3dhcCgpOiB2b2lkIHtcbiAgICBjb25zdCBpID0gdGhpcy5pO1xuICAgIHRoaXMuaSA9IHRoaXMubztcbiAgICB0aGlzLm8gPSBpO1xuICB9XG59XG4iLCJpbXBvcnQgeyBIaXN0b3J5TWVhbkNhbGN1bGF0b3IgfSBmcm9tICcuLi9IaXN0b3J5TWVhbkNhbGN1bGF0b3IvSGlzdG9yeU1lYW5DYWxjdWxhdG9yJztcblxuZXhwb3J0IGNsYXNzIFRhcFRlbXBvIHtcbiAgcHJpdmF0ZSBfX2JwbSA9IDAuMDtcbiAgcHJpdmF0ZSBfX2xhc3RUYXAgPSAwLjA7XG4gIHByaXZhdGUgX19sYXN0QmVhdCA9IDAuMDtcbiAgcHJpdmF0ZSBfX2xhc3RUaW1lID0gMC4wO1xuICBwcml2YXRlIF9fY2FsYzogSGlzdG9yeU1lYW5DYWxjdWxhdG9yID0gbmV3IEhpc3RvcnlNZWFuQ2FsY3VsYXRvciggMTYgKTtcblxuICBwdWJsaWMgZ2V0IGJlYXREdXJhdGlvbigpOiBudW1iZXIge1xuICAgIHJldHVybiA2MC4wIC8gdGhpcy5fX2JwbTtcbiAgfVxuXG4gIHB1YmxpYyBnZXQgYnBtKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuX19icG07XG4gIH1cblxuICBwdWJsaWMgc2V0IGJwbSggYnBtOiBudW1iZXIgKSB7XG4gICAgdGhpcy5fX2xhc3RCZWF0ID0gdGhpcy5iZWF0O1xuICAgIHRoaXMuX19sYXN0VGltZSA9IHBlcmZvcm1hbmNlLm5vdygpO1xuICAgIHRoaXMuX19icG0gPSBicG07XG4gIH1cblxuICBwdWJsaWMgZ2V0IGJlYXQoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5fX2xhc3RCZWF0ICsgKCBwZXJmb3JtYW5jZS5ub3coKSAtIHRoaXMuX19sYXN0VGltZSApICogMC4wMDEgLyB0aGlzLmJlYXREdXJhdGlvbjtcbiAgfVxuXG4gIHB1YmxpYyByZXNldCgpOiB2b2lkIHtcbiAgICB0aGlzLl9fY2FsYy5yZXNldCgpO1xuICB9XG5cbiAgcHVibGljIG51ZGdlKCBhbW91bnQ6IG51bWJlciApOiB2b2lkIHtcbiAgICB0aGlzLl9fbGFzdEJlYXQgPSB0aGlzLmJlYXQgKyBhbW91bnQ7XG4gICAgdGhpcy5fX2xhc3RUaW1lID0gcGVyZm9ybWFuY2Uubm93KCk7XG4gIH1cblxuICBwdWJsaWMgdGFwKCk6IHZvaWQge1xuICAgIGNvbnN0IG5vdyA9IHBlcmZvcm1hbmNlLm5vdygpO1xuICAgIGNvbnN0IGRlbHRhID0gKCBub3cgLSB0aGlzLl9fbGFzdFRhcCApICogMC4wMDE7XG5cbiAgICBpZiAoIDIuMCA8IGRlbHRhICkge1xuICAgICAgdGhpcy5yZXNldCgpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9fY2FsYy5wdXNoKCBkZWx0YSApO1xuICAgICAgdGhpcy5fX2JwbSA9IDYwLjAgLyAoIHRoaXMuX19jYWxjLm1lYW4gKTtcbiAgICB9XG5cbiAgICB0aGlzLl9fbGFzdFRhcCA9IG5vdztcbiAgICB0aGlzLl9fbGFzdFRpbWUgPSBub3c7XG4gICAgdGhpcy5fX2xhc3RCZWF0ID0gMC4wO1xuICB9XG59XG4iLCJleHBvcnQgY2xhc3MgWG9yc2hpZnQge1xuICBwdWJsaWMgc2VlZDogbnVtYmVyO1xuXG4gIHB1YmxpYyBjb25zdHJ1Y3Rvciggc2VlZD86IG51bWJlciApIHtcbiAgICB0aGlzLnNlZWQgPSBzZWVkIHx8IDE7XG4gIH1cblxuICBwdWJsaWMgZ2VuKCBzZWVkPzogbnVtYmVyICk6IG51bWJlciB7XG4gICAgaWYgKCBzZWVkICkge1xuICAgICAgdGhpcy5zZWVkID0gc2VlZDtcbiAgICB9XG5cbiAgICB0aGlzLnNlZWQgPSB0aGlzLnNlZWQgXiAoIHRoaXMuc2VlZCA8PCAxMyApO1xuICAgIHRoaXMuc2VlZCA9IHRoaXMuc2VlZCBeICggdGhpcy5zZWVkID4+PiAxNyApO1xuICAgIHRoaXMuc2VlZCA9IHRoaXMuc2VlZCBeICggdGhpcy5zZWVkIDw8IDUgKTtcbiAgICByZXR1cm4gdGhpcy5zZWVkIC8gTWF0aC5wb3coIDIsIDMyICkgKyAwLjU7XG4gIH1cblxuICBwdWJsaWMgc2V0KCBzZWVkPzogbnVtYmVyICk6IHZvaWQge1xuICAgIHRoaXMuc2VlZCA9IHNlZWQgfHwgdGhpcy5zZWVkIHx8IDE7XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgWG9yc2hpZnQ7XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7SUFBQTthQVVnQixZQUFZLENBQzFCLEtBQW1CLEVBQ25CLGdCQUFtRDtRQUVuRCxJQUFLLE9BQU8sZ0JBQWdCLEtBQUssVUFBVSxFQUFHO1lBQzVDLE9BQU8sWUFBWSxDQUFFLEtBQUssRUFBRSxVQUFFLE9BQU8sSUFBTSxRQUFFLE9BQU8sSUFBSSxnQkFBZ0IsSUFBRSxDQUFFLENBQUM7U0FDOUU7UUFDRCxJQUFNLE9BQU8sR0FBRyxnQkFBNkMsQ0FBQztRQUU5RCxJQUFJ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QUFDLENBQUcsQ0FBQyxDQUFFLEVBQUUsR0FBRyxHQUFHLENBQUMsQ0FBRyxDQUFDLENBQUUsRUFBRSxHQUFHLEdBQUcsQ0FBQyxDQUFHLENBQUMsQ0FBRSxFQUFFLEdBQUcsR0FBRyxDQUFDLENBQUcsQ0FBQyxDQUFFLEVBQzFELEdBQUcsR0FBRyxDQUFDLENBQUcsQ0FBQyxDQUFFLEVBQUUsR0FBRyxHQUFHLENBQUMsQ0FBRyxDQUFDLENBQUUsRUFBRSxHQUFHLEdBQUcsQ0FBQyxDQUFFLEVBQUUsQ0FBRSxFQUFFLEdBQUcsR0FBRyxDQUFDLENBQUUsRUFBRSxDQUFFLEVBQzFELEdBQUcsR0FBRyxDQUFDLENBQUUsRUFBRSxDQUFFLEVBQUUsR0FBRyxHQUFHLENBQUMsQ0FBRSxFQUFFLENBQUUsRUFBRSxHQUFHLEdBQUcsQ0FBQyxDQUFFLEVBQUUsQ0FBRSxFQUFFLEdBQUcsR0FBRyxDQUFDLENBQUUsRUFBRSxDQUFFLEVBQzFELEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEVBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsRUFDekQsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsRUFBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxFQUN6RCxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxFQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEVBQ3pELEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEVBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsRUFDekQsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsRUFBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFH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QUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHO29CQUNqQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUc7b0JBQ2pDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRztvQkFDakMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHO29CQUNqQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUc7b0JBQ2pDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRztvQkFDakMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHO29CQUNqQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUc7b0JBQ2pDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRztvQkFDakMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHO29CQUNqQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUc7b0JBQ2pDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRztvQkFDakMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHO29CQUNqQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUc7b0JBQ2pDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFH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Q0FBQyxDQUFFLEVBQUUsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsRUFBRSxDQUFFLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRTtnQkFDdkUsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxFQUFFLENBQUUsR0FBRyxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLEVBQUUsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUU7Z0JBRXZFLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxFQUFFLENBQUUsR0FBRyxDQUFDLENBQUUsQ0FBQyxDQUFFO2dCQUN0RSxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsRUFBRSxDQUFFLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRTtnQkFDdEUsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxFQUFFLENBQUUsR0FBRyxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLEVBQUUsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUU7Z0JBQ3ZFLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsRUFBRSxDQUFFLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxFQUFFLENBQUUsR0FBRyxDQUFDLENBQUUsQ0FBQyxDQUFFO2dCQUV2RSxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxFQUFFLENBQUUsR0FBRyxDQUFDLENBQUUsRUFBRSxDQUFFLEdBQUcsQ0FBQyxDQUFFLEVBQUUsQ0FBRTtnQkFDeEUsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsRUFBRSxDQUFFLEdBQUcsQ0FBQyxDQUFFLEVBQUUsQ0FBRSxHQUFHLENBQUMsQ0FBRSxFQUFFLENBQUU7Z0JBQ3hFLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsRUFBRSxDQUFFLEdBQUcsQ0FBQyxDQUFFLEVBQUUsQ0FBRSxHQUFHLENBQUMsQ0FBRSxFQUFFLENBQUUsR0FBRyxDQUFDLENBQUUsRUFBRSxDQUFFO2dCQUN6RSxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLEVBQUUsQ0FBRSxHQUFHLENBQUMsQ0FBRSxFQUFFLENBQUUsR0FBRyxDQUFDLENBQUUsRUFBRSxDQUFFLEdBQUcsQ0FBQyxDQUFFLEVBQUUsQ0FBRTtnQkFFekUsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxFQUFFLENBQUUsR0FBRyxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLEVBQUUsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsRUFBRSxDQUFFLEdBQUcsQ0FBQyxDQUFFLEVBQUUsQ0FBRSxHQUFHLENBQUMsQ0FBRSxFQUFFLENBQUU7Z0JBQzFFLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsRUFBRSxDQUFFLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxFQUFFLENBQUUsR0FBRyxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLEVBQUUsQ0FBRSxHQUFHLENBQUMsQ0FBRSxFQUFFLENBQUUsR0FBRyxDQUFDLENBQUUsRUFBRSxDQUFFO2dCQUMxRSxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLEVBQUUsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsRUFBRSxDQUFFLEdBQUcsQ0FBQyxDQUFFLEVBQUUsQ0FBRSxHQUFHLENBQUMsQ0FBRSxFQUFFLENBQUUsR0FBRyxDQUFDLENBQUUsRUFBRSxDQUFFLEdBQUcsQ0FBQyxDQUFFLEVBQUUsQ0FBRTtnQkFDM0UsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxFQUFFLENBQUUsR0FBRyxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLEVBQUUsQ0FBRSxHQUFHLENBQUMsQ0FBRSxFQUFFLENBQUUsR0FBRyxDQUFDLENBQUUsRUFBRSxDQUFFLEdBQUcsQ0FBQyxDQUFFLEVBQUUsQ0FBRSxHQUFH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Q0FBRTtZQUNyQyxxQkFBQSxFQUFBLFVBQVU7WUFFVixJQUFNLEdBQUcsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFFLE1BQU0sQ0FBRSxDQUFDLFVBQVUsQ0FBQztZQUM5QyxJQUFJLEdBQUcsR0FBRyxFQUFFLENBQUMsS0FBSyxDQUFFLEdBQUcsQ0FBRSxDQUFDLFVBQVUsQ0FBQztZQUNyQyxJQUFJLEdBQUcsR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFFLEdBQUcsQ0FBRSxDQUFDO1lBQzNCLEdBQUcsR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFFLElBQUksQ0FBQyxHQUFHLENBQUUsSUFBSSxDQUFFLENBQUUsQ0FBQyxHQUFHLENBQUUsR0FBRyxDQUFDLEtBQUssQ0FBRSxJQUFJLENBQUMsR0FBRyxDQUFFLElBQUksQ0FBRSxDQUFFLENBQUUsQ0FBQztZQUN6RSxHQUFHLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBRSxHQUFHLENBQUUsQ0FBQztZQUV2QixPQUFPLElBQUksT0FBTyxDQUFFO2dCQUNsQixHQUFHLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsRUFBRSxHQUFHO2dCQUN4QixHQUFHLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsRUFBRSxHQUFHO2dCQUN4QixHQUFHLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsRUFBRSxHQUFHO2dCQUN4QixDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsUUFBUSxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsR0FBRyxRQUFRLENBQUMsQ0FBQztnQkFDN0QsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsR0FBRyxRQUFRLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLEdBQUcsUUFB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
