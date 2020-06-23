/*!
* @fms-cat/experimental v0.4.2
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
                var prevIndex = binarySearch(prev, this.__sorted);
                this.__sorted.splice(prevIndex, 1);
            }
            var index = binarySearch(value, this.__sorted);
            this.__sorted.splice(index, 0, value);
        };
        return HistoryMedianCalculator;
    }());

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm1zLWNhdC1leHBlcmltZW50YWwuanMiLCJzb3VyY2VzIjpbIi4uL3NyYy9hbGdvcml0aG0vYmluYXJ5U2VhcmNoLnRzIiwiLi4vc3JjL2FycmF5L2NvbnN0YW50cy50cyIsIi4uL3NyYy9hcnJheS91dGlscy50cyIsIi4uL3NyYy9DRFMvQ0RTLnRzIiwiLi4vc3JjL0Nsb2NrL0Nsb2NrLnRzIiwiLi4vbm9kZV9tb2R1bGVzL3RzbGliL3RzbGliLmVzNi5qcyIsIi4uL3NyYy9DbG9jay9DbG9ja0ZyYW1lLnRzIiwiLi4vc3JjL0Nsb2NrL0Nsb2NrUmVhbHRpbWUudHMiLCIuLi9zcmMvZWR0L2VkdC50cyIsIi4uL3NyYy9tYXRoL3V0aWxzLnRzIiwiLi4vc3JjL0V4cFNtb290aC9FeHBTbW9vdGgudHMiLCIuLi9zcmMvRml6ekJ1enovRml6ekJ1enoudHMiLCIuLi9zcmMvRk1TX0NhdC9GTVNfQ2F0LnRzIiwiLi4vc3JjL0hpc3RvcnlNZWFuQ2FsY3VsYXRvci9IaXN0b3J5TWVhbkNhbGN1bGF0b3IudHMiLCIuLi9zcmMvSGlzdG9yeU1lYW5DYWxjdWxhdG9yL0hpc3RvcnlNZWRpYW5DYWxjdWxhdG9yLnRzIiwiLi4vc3JjL21hdGgvVmVjdG9yLnRzIiwiLi4vc3JjL21hdGgvVmVjdG9yMy50cyIsIi4uL3NyYy9tYXRoL1F1YXRlcm5pb24udHMiLCIuLi9zcmMvbWF0aC9NYXRyaXg0LnRzIiwiLi4vc3JjL21hdGgvVmVjdG9yNC50cyIsIi4uL3NyYy9Td2FwL1N3YXAudHMiLCIuLi9zcmMvVGFwVGVtcG8vVGFwVGVtcG8udHMiLCIuLi9zcmMvWG9yc2hpZnQvWG9yc2hpZnQudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8geW9pbmtlZCBmcm9tIGh0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzEzNDQ1MDAvZWZmaWNpZW50LXdheS10by1pbnNlcnQtYS1udW1iZXItaW50by1hLXNvcnRlZC1hcnJheS1vZi1udW1iZXJzXG5cbmV4cG9ydCBmdW5jdGlvbiBiaW5hcnlTZWFyY2goXG4gIGVsZW1lbnQ6IG51bWJlcixcbiAgYXJyYXk6IEFycmF5TGlrZTxudW1iZXI+XG4pOiBudW1iZXIge1xuICBsZXQgc3RhcnQgPSAwO1xuICBsZXQgZW5kID0gYXJyYXkubGVuZ3RoO1xuXG4gIHdoaWxlICggc3RhcnQgPCBlbmQgKSB7XG4gICAgY29uc3QgY2VudGVyID0gKCBzdGFydCArIGVuZCApID4+IDE7XG4gICAgaWYgKCBhcnJheVsgY2VudGVyIF0gPCBlbGVtZW50ICkge1xuICAgICAgc3RhcnQgPSBjZW50ZXIgKyAxO1xuICAgIH0gZWxzZSB7XG4gICAgICBlbmQgPSBjZW50ZXI7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHN0YXJ0O1xufVxuIiwiLyoqXG4gKiBgWyAtMSwgLTEsIDEsIC0xLCAtMSwgMSwgMSwgMSBdYFxuICovXG5leHBvcnQgY29uc3QgVFJJQU5HTEVfU1RSSVBfUVVBRCA9IFsgLTEsIC0xLCAxLCAtMSwgLTEsIDEsIDEsIDEgXTtcblxuLyoqXG4gKiBgWyAtMSwgLTEsIDAsIDEsIC0xLCAwLCAtMSwgMSwgMCwgMSwgMSwgMCBdYFxuICovXG5leHBvcnQgY29uc3QgVFJJQU5HTEVfU1RSSVBfUVVBRF8zRCA9IFsgLTEsIC0xLCAwLCAxLCAtMSwgMCwgLTEsIDEsIDAsIDEsIDEsIDAgXTtcblxuLyoqXG4gKiBgWyAwLCAwLCAxLCAwLCAwLCAxLCAwLCAwLCAxLCAwLCAwLCAxIF1gXG4gKi9cbmV4cG9ydCBjb25zdCBUUklBTkdMRV9TVFJJUF9RVUFEX05PUk1BTCA9IFsgMCwgMCwgMSwgMCwgMCwgMSwgMCwgMCwgMSwgMCwgMCwgMSBdO1xuXG4vKipcbiAqIGBbIDAsIDAsIDEsIDAsIDAsIDEsIDEsIDEgXWBcbiAqL1xuZXhwb3J0IGNvbnN0IFRSSUFOR0xFX1NUUklQX1FVQURfVVYgPSBbIDAsIDAsIDEsIDAsIDAsIDEsIDEsIDEgXTtcbiIsIi8qKlxuICogU2h1ZmZsZSBnaXZlbiBgYXJyYXlgIHVzaW5nIGdpdmVuIGBkaWNlYCBSTkcuICoqRGVzdHJ1Y3RpdmUqKi5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNodWZmbGVBcnJheTxUPiggYXJyYXk6IFRbXSwgZGljZT86ICgpID0+IG51bWJlciApOiBUW10ge1xuICBjb25zdCBmID0gZGljZSA/IGRpY2UgOiAoKSA9PiBNYXRoLnJhbmRvbSgpO1xuICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBhcnJheS5sZW5ndGggLSAxOyBpICsrICkge1xuICAgIGNvbnN0IGlyID0gaSArIE1hdGguZmxvb3IoIGYoKSAqICggYXJyYXkubGVuZ3RoIC0gaSApICk7XG4gICAgY29uc3QgdGVtcCA9IGFycmF5WyBpciBdO1xuICAgIGFycmF5WyBpciBdID0gYXJyYXlbIGkgXTtcbiAgICBhcnJheVsgaSBdID0gdGVtcDtcbiAgfVxuICByZXR1cm4gYXJyYXk7XG59XG5cbi8qKlxuICogSSBsaWtlIHdpcmVmcmFtZVxuICpcbiAqIGB0cmlJbmRleFRvTGluZUluZGV4KCBbIDAsIDEsIDIsIDUsIDYsIDcgXSApYCAtPiBgWyAwLCAxLCAxLCAyLCAyLCAwLCA1LCA2LCA2LCA3LCA3LCA1IF1gXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB0cmlJbmRleFRvTGluZUluZGV4PFQ+KCBhcnJheTogVFtdICk6IFRbXSB7XG4gIGNvbnN0IHJldDogVFtdID0gW107XG4gIGZvciAoIGxldCBpID0gMDsgaSA8IGFycmF5Lmxlbmd0aCAvIDM7IGkgKysgKSB7XG4gICAgY29uc3QgaGVhZCA9IGkgKiAzO1xuICAgIHJldC5wdXNoKFxuICAgICAgYXJyYXlbIGhlYWQgICAgIF0sIGFycmF5WyBoZWFkICsgMSBdLFxuICAgICAgYXJyYXlbIGhlYWQgKyAxIF0sIGFycmF5WyBoZWFkICsgMiBdLFxuICAgICAgYXJyYXlbIGhlYWQgKyAyIF0sIGFycmF5WyBoZWFkICAgICBdXG4gICAgKTtcbiAgfVxuICByZXR1cm4gcmV0O1xufVxuXG4vKipcbiAqIGBtYXRyaXgyZCggMywgMiApYCAtPiBgWyAwLCAwLCAwLCAxLCAwLCAyLCAxLCAwLCAxLCAxLCAxLCAyIF1gXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtYXRyaXgyZCggdzogbnVtYmVyLCBoOiBudW1iZXIgKTogbnVtYmVyW10ge1xuICBjb25zdCBhcnI6IG51bWJlcltdID0gW107XG4gIGZvciAoIGxldCBpeSA9IDA7IGl5IDwgaDsgaXkgKysgKSB7XG4gICAgZm9yICggbGV0IGl4ID0gMDsgaXggPCB3OyBpeCArKyApIHtcbiAgICAgIGFyci5wdXNoKCBpeCwgaXkgKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGFycjtcbn1cbiIsIi8qKlxuICogQ3JpdGljYWxseSBEYW1wZWQgU3ByaW5nXG4gKlxuICogU2hvdXRvdXRzIHRvIEtlaWppcm8gVGFrYWhhc2hpXG4gKi9cbmV4cG9ydCBjbGFzcyBDRFMge1xuICBwdWJsaWMgZmFjdG9yID0gMTAwLjA7XG4gIHB1YmxpYyByYXRpbyA9IDEuMDtcbiAgcHVibGljIHZlbG9jaXR5ID0gMC4wO1xuICBwdWJsaWMgdmFsdWUgPSAwLjA7XG4gIHB1YmxpYyB0YXJnZXQgPSAwLjA7XG5cbiAgcHVibGljIHVwZGF0ZSggZGVsdGFUaW1lOiBudW1iZXIgKTogbnVtYmVyIHtcbiAgICB0aGlzLnZlbG9jaXR5ICs9IChcbiAgICAgIC10aGlzLmZhY3RvciAqICggdGhpcy52YWx1ZSAtIHRoaXMudGFyZ2V0IClcbiAgICAgIC0gMi4wICogdGhpcy52ZWxvY2l0eSAqIE1hdGguc3FydCggdGhpcy5mYWN0b3IgKSAqIHRoaXMucmF0aW9cbiAgICApICogZGVsdGFUaW1lO1xuICAgIHRoaXMudmFsdWUgKz0gdGhpcy52ZWxvY2l0eSAqIGRlbHRhVGltZTtcbiAgICByZXR1cm4gdGhpcy52YWx1ZTtcbiAgfVxufVxuIiwiLyoqXG4gKiBDbGFzcyB0aGF0IGRlYWxzIHdpdGggdGltZS5cbiAqIEluIHRoaXMgYmFzZSBjbGFzcywgeW91IG5lZWQgdG8gc2V0IHRpbWUgbWFudWFsbHkgZnJvbSBgQXV0b21hdG9uLnVwZGF0ZSgpYC5cbiAqIEJlc3QgZm9yIHN5bmMgd2l0aCBleHRlcm5hbCBjbG9jayBzdHVmZi5cbiAqL1xuZXhwb3J0IGNsYXNzIENsb2NrIHtcbiAgLyoqXG4gICAqIEl0cyBjdXJyZW50IHRpbWUuXG4gICAqL1xuICBwcm90ZWN0ZWQgX190aW1lID0gMC4wO1xuXG4gIC8qKlxuICAgKiBJdHMgZGVsdGFUaW1lIG9mIGxhc3QgdXBkYXRlLlxuICAgKi9cbiAgcHJvdGVjdGVkIF9fZGVsdGFUaW1lID0gMC4wO1xuXG4gIC8qKlxuICAgKiBXaGV0aGVyIGl0cyBjdXJyZW50bHkgcGxheWluZyBvciBub3QuXG4gICAqL1xuICBwcm90ZWN0ZWQgX19pc1BsYXlpbmcgPSBmYWxzZTtcblxuICAvKipcbiAgICogSXRzIGN1cnJlbnQgdGltZS5cbiAgICovXG4gIHB1YmxpYyBnZXQgdGltZSgpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5fX3RpbWU7IH1cblxuICAvKipcbiAgICogSXRzIGRlbHRhVGltZSBvZiBsYXN0IHVwZGF0ZS5cbiAgICovXG4gIHB1YmxpYyBnZXQgZGVsdGFUaW1lKCk6IG51bWJlciB7IHJldHVybiB0aGlzLl9fZGVsdGFUaW1lOyB9XG5cbiAgLyoqXG4gICAqIFdoZXRoZXIgaXRzIGN1cnJlbnRseSBwbGF5aW5nIG9yIG5vdC5cbiAgICovXG4gIHB1YmxpYyBnZXQgaXNQbGF5aW5nKCk6IGJvb2xlYW4geyByZXR1cm4gdGhpcy5fX2lzUGxheWluZzsgfVxuXG4gIC8qKlxuICAgKiBVcGRhdGUgdGhlIGNsb2NrLlxuICAgKiBAcGFyYW0gdGltZSBUaW1lLiBZb3UgbmVlZCB0byBzZXQgbWFudWFsbHkgd2hlbiB5b3UgYXJlIHVzaW5nIG1hbnVhbCBDbG9ja1xuICAgKi9cbiAgcHVibGljIHVwZGF0ZSggdGltZT86IG51bWJlciApOiB2b2lkIHtcbiAgICBjb25zdCBwcmV2VGltZSA9IHRoaXMuX190aW1lO1xuICAgIHRoaXMuX190aW1lID0gdGltZSB8fCAwLjA7XG4gICAgdGhpcy5fX2RlbHRhVGltZSA9IHRoaXMuX190aW1lIC0gcHJldlRpbWU7XG4gIH1cblxuICAvKipcbiAgICogU3RhcnQgdGhlIGNsb2NrLlxuICAgKi9cbiAgcHVibGljIHBsYXkoKTogdm9pZCB7XG4gICAgdGhpcy5fX2lzUGxheWluZyA9IHRydWU7XG4gIH1cblxuICAvKipcbiAgICogU3RvcCB0aGUgY2xvY2suXG4gICAqL1xuICBwdWJsaWMgcGF1c2UoKTogdm9pZCB7XG4gICAgdGhpcy5fX2lzUGxheWluZyA9IGZhbHNlO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldCB0aGUgdGltZSBtYW51YWxseS5cbiAgICogQHBhcmFtIHRpbWUgVGltZVxuICAgKi9cbiAgcHVibGljIHNldFRpbWUoIHRpbWU6IG51bWJlciApOiB2b2lkIHtcbiAgICB0aGlzLl9fdGltZSA9IHRpbWU7XG4gIH1cbn1cbiIsIi8qISAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxyXG5Db3B5cmlnaHQgKGMpIE1pY3Jvc29mdCBDb3Jwb3JhdGlvbi5cclxuXHJcblBlcm1pc3Npb24gdG8gdXNlLCBjb3B5LCBtb2RpZnksIGFuZC9vciBkaXN0cmlidXRlIHRoaXMgc29mdHdhcmUgZm9yIGFueVxyXG5wdXJwb3NlIHdpdGggb3Igd2l0aG91dCBmZWUgaXMgaGVyZWJ5IGdyYW50ZWQuXHJcblxyXG5USEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiIEFORCBUSEUgQVVUSE9SIERJU0NMQUlNUyBBTEwgV0FSUkFOVElFUyBXSVRIXHJcblJFR0FSRCBUTyBUSElTIFNPRlRXQVJFIElOQ0xVRElORyBBTEwgSU1QTElFRCBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWVxyXG5BTkQgRklUTkVTUy4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUiBCRSBMSUFCTEUgRk9SIEFOWSBTUEVDSUFMLCBESVJFQ1QsXHJcbklORElSRUNULCBPUiBDT05TRVFVRU5USUFMIERBTUFHRVMgT1IgQU5ZIERBTUFHRVMgV0hBVFNPRVZFUiBSRVNVTFRJTkcgRlJPTVxyXG5MT1NTIE9GIFVTRSwgREFUQSBPUiBQUk9GSVRTLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgTkVHTElHRU5DRSBPUlxyXG5PVEhFUiBUT1JUSU9VUyBBQ1RJT04sIEFSSVNJTkcgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgVVNFIE9SXHJcblBFUkZPUk1BTkNFIE9GIFRISVMgU09GVFdBUkUuXHJcbioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqICovXHJcbi8qIGdsb2JhbCBSZWZsZWN0LCBQcm9taXNlICovXHJcblxyXG52YXIgZXh0ZW5kU3RhdGljcyA9IGZ1bmN0aW9uKGQsIGIpIHtcclxuICAgIGV4dGVuZFN0YXRpY3MgPSBPYmplY3Quc2V0UHJvdG90eXBlT2YgfHxcclxuICAgICAgICAoeyBfX3Byb3RvX186IFtdIH0gaW5zdGFuY2VvZiBBcnJheSAmJiBmdW5jdGlvbiAoZCwgYikgeyBkLl9fcHJvdG9fXyA9IGI7IH0pIHx8XHJcbiAgICAgICAgZnVuY3Rpb24gKGQsIGIpIHsgZm9yICh2YXIgcCBpbiBiKSBpZiAoYi5oYXNPd25Qcm9wZXJ0eShwKSkgZFtwXSA9IGJbcF07IH07XHJcbiAgICByZXR1cm4gZXh0ZW5kU3RhdGljcyhkLCBiKTtcclxufTtcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2V4dGVuZHMoZCwgYikge1xyXG4gICAgZXh0ZW5kU3RhdGljcyhkLCBiKTtcclxuICAgIGZ1bmN0aW9uIF9fKCkgeyB0aGlzLmNvbnN0cnVjdG9yID0gZDsgfVxyXG4gICAgZC5wcm90b3R5cGUgPSBiID09PSBudWxsID8gT2JqZWN0LmNyZWF0ZShiKSA6IChfXy5wcm90b3R5cGUgPSBiLnByb3RvdHlwZSwgbmV3IF9fKCkpO1xyXG59XHJcblxyXG5leHBvcnQgdmFyIF9fYXNzaWduID0gZnVuY3Rpb24oKSB7XHJcbiAgICBfX2Fzc2lnbiA9IE9iamVjdC5hc3NpZ24gfHwgZnVuY3Rpb24gX19hc3NpZ24odCkge1xyXG4gICAgICAgIGZvciAodmFyIHMsIGkgPSAxLCBuID0gYXJndW1lbnRzLmxlbmd0aDsgaSA8IG47IGkrKykge1xyXG4gICAgICAgICAgICBzID0gYXJndW1lbnRzW2ldO1xyXG4gICAgICAgICAgICBmb3IgKHZhciBwIGluIHMpIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwocywgcCkpIHRbcF0gPSBzW3BdO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdDtcclxuICAgIH1cclxuICAgIHJldHVybiBfX2Fzc2lnbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19yZXN0KHMsIGUpIHtcclxuICAgIHZhciB0ID0ge307XHJcbiAgICBmb3IgKHZhciBwIGluIHMpIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwocywgcCkgJiYgZS5pbmRleE9mKHApIDwgMClcclxuICAgICAgICB0W3BdID0gc1twXTtcclxuICAgIGlmIChzICE9IG51bGwgJiYgdHlwZW9mIE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMgPT09IFwiZnVuY3Rpb25cIilcclxuICAgICAgICBmb3IgKHZhciBpID0gMCwgcCA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMocyk7IGkgPCBwLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGlmIChlLmluZGV4T2YocFtpXSkgPCAwICYmIE9iamVjdC5wcm90b3R5cGUucHJvcGVydHlJc0VudW1lcmFibGUuY2FsbChzLCBwW2ldKSlcclxuICAgICAgICAgICAgICAgIHRbcFtpXV0gPSBzW3BbaV1dO1xyXG4gICAgICAgIH1cclxuICAgIHJldHVybiB0O1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19kZWNvcmF0ZShkZWNvcmF0b3JzLCB0YXJnZXQsIGtleSwgZGVzYykge1xyXG4gICAgdmFyIGMgPSBhcmd1bWVudHMubGVuZ3RoLCByID0gYyA8IDMgPyB0YXJnZXQgOiBkZXNjID09PSBudWxsID8gZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IodGFyZ2V0LCBrZXkpIDogZGVzYywgZDtcclxuICAgIGlmICh0eXBlb2YgUmVmbGVjdCA9PT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgUmVmbGVjdC5kZWNvcmF0ZSA9PT0gXCJmdW5jdGlvblwiKSByID0gUmVmbGVjdC5kZWNvcmF0ZShkZWNvcmF0b3JzLCB0YXJnZXQsIGtleSwgZGVzYyk7XHJcbiAgICBlbHNlIGZvciAodmFyIGkgPSBkZWNvcmF0b3JzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSBpZiAoZCA9IGRlY29yYXRvcnNbaV0pIHIgPSAoYyA8IDMgPyBkKHIpIDogYyA+IDMgPyBkKHRhcmdldCwga2V5LCByKSA6IGQodGFyZ2V0LCBrZXkpKSB8fCByO1xyXG4gICAgcmV0dXJuIGMgPiAzICYmIHIgJiYgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwga2V5LCByKSwgcjtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fcGFyYW0ocGFyYW1JbmRleCwgZGVjb3JhdG9yKSB7XHJcbiAgICByZXR1cm4gZnVuY3Rpb24gKHRhcmdldCwga2V5KSB7IGRlY29yYXRvcih0YXJnZXQsIGtleSwgcGFyYW1JbmRleCk7IH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fbWV0YWRhdGEobWV0YWRhdGFLZXksIG1ldGFkYXRhVmFsdWUpIHtcclxuICAgIGlmICh0eXBlb2YgUmVmbGVjdCA9PT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgUmVmbGVjdC5tZXRhZGF0YSA9PT0gXCJmdW5jdGlvblwiKSByZXR1cm4gUmVmbGVjdC5tZXRhZGF0YShtZXRhZGF0YUtleSwgbWV0YWRhdGFWYWx1ZSk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2F3YWl0ZXIodGhpc0FyZywgX2FyZ3VtZW50cywgUCwgZ2VuZXJhdG9yKSB7XHJcbiAgICBmdW5jdGlvbiBhZG9wdCh2YWx1ZSkgeyByZXR1cm4gdmFsdWUgaW5zdGFuY2VvZiBQID8gdmFsdWUgOiBuZXcgUChmdW5jdGlvbiAocmVzb2x2ZSkgeyByZXNvbHZlKHZhbHVlKTsgfSk7IH1cclxuICAgIHJldHVybiBuZXcgKFAgfHwgKFAgPSBQcm9taXNlKSkoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xyXG4gICAgICAgIGZ1bmN0aW9uIGZ1bGZpbGxlZCh2YWx1ZSkgeyB0cnkgeyBzdGVwKGdlbmVyYXRvci5uZXh0KHZhbHVlKSk7IH0gY2F0Y2ggKGUpIHsgcmVqZWN0KGUpOyB9IH1cclxuICAgICAgICBmdW5jdGlvbiByZWplY3RlZCh2YWx1ZSkgeyB0cnkgeyBzdGVwKGdlbmVyYXRvcltcInRocm93XCJdKHZhbHVlKSk7IH0gY2F0Y2ggKGUpIHsgcmVqZWN0KGUpOyB9IH1cclxuICAgICAgICBmdW5jdGlvbiBzdGVwKHJlc3VsdCkgeyByZXN1bHQuZG9uZSA/IHJlc29sdmUocmVzdWx0LnZhbHVlKSA6IGFkb3B0KHJlc3VsdC52YWx1ZSkudGhlbihmdWxmaWxsZWQsIHJlamVjdGVkKTsgfVxyXG4gICAgICAgIHN0ZXAoKGdlbmVyYXRvciA9IGdlbmVyYXRvci5hcHBseSh0aGlzQXJnLCBfYXJndW1lbnRzIHx8IFtdKSkubmV4dCgpKTtcclxuICAgIH0pO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19nZW5lcmF0b3IodGhpc0FyZywgYm9keSkge1xyXG4gICAgdmFyIF8gPSB7IGxhYmVsOiAwLCBzZW50OiBmdW5jdGlvbigpIHsgaWYgKHRbMF0gJiAxKSB0aHJvdyB0WzFdOyByZXR1cm4gdFsxXTsgfSwgdHJ5czogW10sIG9wczogW10gfSwgZiwgeSwgdCwgZztcclxuICAgIHJldHVybiBnID0geyBuZXh0OiB2ZXJiKDApLCBcInRocm93XCI6IHZlcmIoMSksIFwicmV0dXJuXCI6IHZlcmIoMikgfSwgdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIChnW1N5bWJvbC5pdGVyYXRvcl0gPSBmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXM7IH0pLCBnO1xyXG4gICAgZnVuY3Rpb24gdmVyYihuKSB7IHJldHVybiBmdW5jdGlvbiAodikgeyByZXR1cm4gc3RlcChbbiwgdl0pOyB9OyB9XHJcbiAgICBmdW5jdGlvbiBzdGVwKG9wKSB7XHJcbiAgICAgICAgaWYgKGYpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJHZW5lcmF0b3IgaXMgYWxyZWFkeSBleGVjdXRpbmcuXCIpO1xyXG4gICAgICAgIHdoaWxlIChfKSB0cnkge1xyXG4gICAgICAgICAgICBpZiAoZiA9IDEsIHkgJiYgKHQgPSBvcFswXSAmIDIgPyB5W1wicmV0dXJuXCJdIDogb3BbMF0gPyB5W1widGhyb3dcIl0gfHwgKCh0ID0geVtcInJldHVyblwiXSkgJiYgdC5jYWxsKHkpLCAwKSA6IHkubmV4dCkgJiYgISh0ID0gdC5jYWxsKHksIG9wWzFdKSkuZG9uZSkgcmV0dXJuIHQ7XHJcbiAgICAgICAgICAgIGlmICh5ID0gMCwgdCkgb3AgPSBbb3BbMF0gJiAyLCB0LnZhbHVlXTtcclxuICAgICAgICAgICAgc3dpdGNoIChvcFswXSkge1xyXG4gICAgICAgICAgICAgICAgY2FzZSAwOiBjYXNlIDE6IHQgPSBvcDsgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlIDQ6IF8ubGFiZWwrKzsgcmV0dXJuIHsgdmFsdWU6IG9wWzFdLCBkb25lOiBmYWxzZSB9O1xyXG4gICAgICAgICAgICAgICAgY2FzZSA1OiBfLmxhYmVsKys7IHkgPSBvcFsxXTsgb3AgPSBbMF07IGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgY2FzZSA3OiBvcCA9IF8ub3BzLnBvcCgpOyBfLnRyeXMucG9wKCk7IGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgICAgICBpZiAoISh0ID0gXy50cnlzLCB0ID0gdC5sZW5ndGggPiAwICYmIHRbdC5sZW5ndGggLSAxXSkgJiYgKG9wWzBdID09PSA2IHx8IG9wWzBdID09PSAyKSkgeyBfID0gMDsgY29udGludWU7IH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAob3BbMF0gPT09IDMgJiYgKCF0IHx8IChvcFsxXSA+IHRbMF0gJiYgb3BbMV0gPCB0WzNdKSkpIHsgXy5sYWJlbCA9IG9wWzFdOyBicmVhazsgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChvcFswXSA9PT0gNiAmJiBfLmxhYmVsIDwgdFsxXSkgeyBfLmxhYmVsID0gdFsxXTsgdCA9IG9wOyBicmVhazsgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0ICYmIF8ubGFiZWwgPCB0WzJdKSB7IF8ubGFiZWwgPSB0WzJdOyBfLm9wcy5wdXNoKG9wKTsgYnJlYWs7IH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAodFsyXSkgXy5vcHMucG9wKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgXy50cnlzLnBvcCgpOyBjb250aW51ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBvcCA9IGJvZHkuY2FsbCh0aGlzQXJnLCBfKTtcclxuICAgICAgICB9IGNhdGNoIChlKSB7IG9wID0gWzYsIGVdOyB5ID0gMDsgfSBmaW5hbGx5IHsgZiA9IHQgPSAwOyB9XHJcbiAgICAgICAgaWYgKG9wWzBdICYgNSkgdGhyb3cgb3BbMV07IHJldHVybiB7IHZhbHVlOiBvcFswXSA/IG9wWzFdIDogdm9pZCAwLCBkb25lOiB0cnVlIH07XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCB2YXIgX19jcmVhdGVCaW5kaW5nID0gT2JqZWN0LmNyZWF0ZSA/IChmdW5jdGlvbihvLCBtLCBrLCBrMikge1xyXG4gICAgaWYgKGsyID09PSB1bmRlZmluZWQpIGsyID0gaztcclxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvLCBrMiwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGZ1bmN0aW9uKCkgeyByZXR1cm4gbVtrXTsgfSB9KTtcclxufSkgOiAoZnVuY3Rpb24obywgbSwgaywgazIpIHtcclxuICAgIGlmIChrMiA9PT0gdW5kZWZpbmVkKSBrMiA9IGs7XHJcbiAgICBvW2syXSA9IG1ba107XHJcbn0pO1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fZXhwb3J0U3RhcihtLCBleHBvcnRzKSB7XHJcbiAgICBmb3IgKHZhciBwIGluIG0pIGlmIChwICE9PSBcImRlZmF1bHRcIiAmJiAhZXhwb3J0cy5oYXNPd25Qcm9wZXJ0eShwKSkgX19jcmVhdGVCaW5kaW5nKGV4cG9ydHMsIG0sIHApO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX192YWx1ZXMobykge1xyXG4gICAgdmFyIHMgPSB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgU3ltYm9sLml0ZXJhdG9yLCBtID0gcyAmJiBvW3NdLCBpID0gMDtcclxuICAgIGlmIChtKSByZXR1cm4gbS5jYWxsKG8pO1xyXG4gICAgaWYgKG8gJiYgdHlwZW9mIG8ubGVuZ3RoID09PSBcIm51bWJlclwiKSByZXR1cm4ge1xyXG4gICAgICAgIG5leHQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgaWYgKG8gJiYgaSA+PSBvLmxlbmd0aCkgbyA9IHZvaWQgMDtcclxuICAgICAgICAgICAgcmV0dXJuIHsgdmFsdWU6IG8gJiYgb1tpKytdLCBkb25lOiAhbyB9O1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKHMgPyBcIk9iamVjdCBpcyBub3QgaXRlcmFibGUuXCIgOiBcIlN5bWJvbC5pdGVyYXRvciBpcyBub3QgZGVmaW5lZC5cIik7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX3JlYWQobywgbikge1xyXG4gICAgdmFyIG0gPSB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgb1tTeW1ib2wuaXRlcmF0b3JdO1xyXG4gICAgaWYgKCFtKSByZXR1cm4gbztcclxuICAgIHZhciBpID0gbS5jYWxsKG8pLCByLCBhciA9IFtdLCBlO1xyXG4gICAgdHJ5IHtcclxuICAgICAgICB3aGlsZSAoKG4gPT09IHZvaWQgMCB8fCBuLS0gPiAwKSAmJiAhKHIgPSBpLm5leHQoKSkuZG9uZSkgYXIucHVzaChyLnZhbHVlKTtcclxuICAgIH1cclxuICAgIGNhdGNoIChlcnJvcikgeyBlID0geyBlcnJvcjogZXJyb3IgfTsgfVxyXG4gICAgZmluYWxseSB7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgaWYgKHIgJiYgIXIuZG9uZSAmJiAobSA9IGlbXCJyZXR1cm5cIl0pKSBtLmNhbGwoaSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGZpbmFsbHkgeyBpZiAoZSkgdGhyb3cgZS5lcnJvcjsgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIGFyO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19zcHJlYWQoKSB7XHJcbiAgICBmb3IgKHZhciBhciA9IFtdLCBpID0gMDsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKylcclxuICAgICAgICBhciA9IGFyLmNvbmNhdChfX3JlYWQoYXJndW1lbnRzW2ldKSk7XHJcbiAgICByZXR1cm4gYXI7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX3NwcmVhZEFycmF5cygpIHtcclxuICAgIGZvciAodmFyIHMgPSAwLCBpID0gMCwgaWwgPSBhcmd1bWVudHMubGVuZ3RoOyBpIDwgaWw7IGkrKykgcyArPSBhcmd1bWVudHNbaV0ubGVuZ3RoO1xyXG4gICAgZm9yICh2YXIgciA9IEFycmF5KHMpLCBrID0gMCwgaSA9IDA7IGkgPCBpbDsgaSsrKVxyXG4gICAgICAgIGZvciAodmFyIGEgPSBhcmd1bWVudHNbaV0sIGogPSAwLCBqbCA9IGEubGVuZ3RoOyBqIDwgamw7IGorKywgaysrKVxyXG4gICAgICAgICAgICByW2tdID0gYVtqXTtcclxuICAgIHJldHVybiByO1xyXG59O1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fYXdhaXQodikge1xyXG4gICAgcmV0dXJuIHRoaXMgaW5zdGFuY2VvZiBfX2F3YWl0ID8gKHRoaXMudiA9IHYsIHRoaXMpIDogbmV3IF9fYXdhaXQodik7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2FzeW5jR2VuZXJhdG9yKHRoaXNBcmcsIF9hcmd1bWVudHMsIGdlbmVyYXRvcikge1xyXG4gICAgaWYgKCFTeW1ib2wuYXN5bmNJdGVyYXRvcikgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlN5bWJvbC5hc3luY0l0ZXJhdG9yIGlzIG5vdCBkZWZpbmVkLlwiKTtcclxuICAgIHZhciBnID0gZ2VuZXJhdG9yLmFwcGx5KHRoaXNBcmcsIF9hcmd1bWVudHMgfHwgW10pLCBpLCBxID0gW107XHJcbiAgICByZXR1cm4gaSA9IHt9LCB2ZXJiKFwibmV4dFwiKSwgdmVyYihcInRocm93XCIpLCB2ZXJiKFwicmV0dXJuXCIpLCBpW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXM7IH0sIGk7XHJcbiAgICBmdW5jdGlvbiB2ZXJiKG4pIHsgaWYgKGdbbl0pIGlbbl0gPSBmdW5jdGlvbiAodikgeyByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKGEsIGIpIHsgcS5wdXNoKFtuLCB2LCBhLCBiXSkgPiAxIHx8IHJlc3VtZShuLCB2KTsgfSk7IH07IH1cclxuICAgIGZ1bmN0aW9uIHJlc3VtZShuLCB2KSB7IHRyeSB7IHN0ZXAoZ1tuXSh2KSk7IH0gY2F0Y2ggKGUpIHsgc2V0dGxlKHFbMF1bM10sIGUpOyB9IH1cclxuICAgIGZ1bmN0aW9uIHN0ZXAocikgeyByLnZhbHVlIGluc3RhbmNlb2YgX19hd2FpdCA/IFByb21pc2UucmVzb2x2ZShyLnZhbHVlLnYpLnRoZW4oZnVsZmlsbCwgcmVqZWN0KSA6IHNldHRsZShxWzBdWzJdLCByKTsgfVxyXG4gICAgZnVuY3Rpb24gZnVsZmlsbCh2YWx1ZSkgeyByZXN1bWUoXCJuZXh0XCIsIHZhbHVlKTsgfVxyXG4gICAgZnVuY3Rpb24gcmVqZWN0KHZhbHVlKSB7IHJlc3VtZShcInRocm93XCIsIHZhbHVlKTsgfVxyXG4gICAgZnVuY3Rpb24gc2V0dGxlKGYsIHYpIHsgaWYgKGYodiksIHEuc2hpZnQoKSwgcS5sZW5ndGgpIHJlc3VtZShxWzBdWzBdLCBxWzBdWzFdKTsgfVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19hc3luY0RlbGVnYXRvcihvKSB7XHJcbiAgICB2YXIgaSwgcDtcclxuICAgIHJldHVybiBpID0ge30sIHZlcmIoXCJuZXh0XCIpLCB2ZXJiKFwidGhyb3dcIiwgZnVuY3Rpb24gKGUpIHsgdGhyb3cgZTsgfSksIHZlcmIoXCJyZXR1cm5cIiksIGlbU3ltYm9sLml0ZXJhdG9yXSA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXM7IH0sIGk7XHJcbiAgICBmdW5jdGlvbiB2ZXJiKG4sIGYpIHsgaVtuXSA9IG9bbl0gPyBmdW5jdGlvbiAodikgeyByZXR1cm4gKHAgPSAhcCkgPyB7IHZhbHVlOiBfX2F3YWl0KG9bbl0odikpLCBkb25lOiBuID09PSBcInJldHVyblwiIH0gOiBmID8gZih2KSA6IHY7IH0gOiBmOyB9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2FzeW5jVmFsdWVzKG8pIHtcclxuICAgIGlmICghU3ltYm9sLmFzeW5jSXRlcmF0b3IpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJTeW1ib2wuYXN5bmNJdGVyYXRvciBpcyBub3QgZGVmaW5lZC5cIik7XHJcbiAgICB2YXIgbSA9IG9bU3ltYm9sLmFzeW5jSXRlcmF0b3JdLCBpO1xyXG4gICAgcmV0dXJuIG0gPyBtLmNhbGwobykgOiAobyA9IHR5cGVvZiBfX3ZhbHVlcyA9PT0gXCJmdW5jdGlvblwiID8gX192YWx1ZXMobykgOiBvW1N5bWJvbC5pdGVyYXRvcl0oKSwgaSA9IHt9LCB2ZXJiKFwibmV4dFwiKSwgdmVyYihcInRocm93XCIpLCB2ZXJiKFwicmV0dXJuXCIpLCBpW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXM7IH0sIGkpO1xyXG4gICAgZnVuY3Rpb24gdmVyYihuKSB7IGlbbl0gPSBvW25dICYmIGZ1bmN0aW9uICh2KSB7IHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7IHYgPSBvW25dKHYpLCBzZXR0bGUocmVzb2x2ZSwgcmVqZWN0LCB2LmRvbmUsIHYudmFsdWUpOyB9KTsgfTsgfVxyXG4gICAgZnVuY3Rpb24gc2V0dGxlKHJlc29sdmUsIHJlamVjdCwgZCwgdikgeyBQcm9taXNlLnJlc29sdmUodikudGhlbihmdW5jdGlvbih2KSB7IHJlc29sdmUoeyB2YWx1ZTogdiwgZG9uZTogZCB9KTsgfSwgcmVqZWN0KTsgfVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19tYWtlVGVtcGxhdGVPYmplY3QoY29va2VkLCByYXcpIHtcclxuICAgIGlmIChPYmplY3QuZGVmaW5lUHJvcGVydHkpIHsgT2JqZWN0LmRlZmluZVByb3BlcnR5KGNvb2tlZCwgXCJyYXdcIiwgeyB2YWx1ZTogcmF3IH0pOyB9IGVsc2UgeyBjb29rZWQucmF3ID0gcmF3OyB9XHJcbiAgICByZXR1cm4gY29va2VkO1xyXG59O1xyXG5cclxudmFyIF9fc2V0TW9kdWxlRGVmYXVsdCA9IE9iamVjdC5jcmVhdGUgPyAoZnVuY3Rpb24obywgdikge1xyXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG8sIFwiZGVmYXVsdFwiLCB7IGVudW1lcmFibGU6IHRydWUsIHZhbHVlOiB2IH0pO1xyXG59KSA6IGZ1bmN0aW9uKG8sIHYpIHtcclxuICAgIG9bXCJkZWZhdWx0XCJdID0gdjtcclxufTtcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2ltcG9ydFN0YXIobW9kKSB7XHJcbiAgICBpZiAobW9kICYmIG1vZC5fX2VzTW9kdWxlKSByZXR1cm4gbW9kO1xyXG4gICAgdmFyIHJlc3VsdCA9IHt9O1xyXG4gICAgaWYgKG1vZCAhPSBudWxsKSBmb3IgKHZhciBrIGluIG1vZCkgaWYgKE9iamVjdC5oYXNPd25Qcm9wZXJ0eS5jYWxsKG1vZCwgaykpIF9fY3JlYXRlQmluZGluZyhyZXN1bHQsIG1vZCwgayk7XHJcbiAgICBfX3NldE1vZHVsZURlZmF1bHQocmVzdWx0LCBtb2QpO1xyXG4gICAgcmV0dXJuIHJlc3VsdDtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9faW1wb3J0RGVmYXVsdChtb2QpIHtcclxuICAgIHJldHVybiAobW9kICYmIG1vZC5fX2VzTW9kdWxlKSA/IG1vZCA6IHsgZGVmYXVsdDogbW9kIH07XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2NsYXNzUHJpdmF0ZUZpZWxkR2V0KHJlY2VpdmVyLCBwcml2YXRlTWFwKSB7XHJcbiAgICBpZiAoIXByaXZhdGVNYXAuaGFzKHJlY2VpdmVyKSkge1xyXG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJhdHRlbXB0ZWQgdG8gZ2V0IHByaXZhdGUgZmllbGQgb24gbm9uLWluc3RhbmNlXCIpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHByaXZhdGVNYXAuZ2V0KHJlY2VpdmVyKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fY2xhc3NQcml2YXRlRmllbGRTZXQocmVjZWl2ZXIsIHByaXZhdGVNYXAsIHZhbHVlKSB7XHJcbiAgICBpZiAoIXByaXZhdGVNYXAuaGFzKHJlY2VpdmVyKSkge1xyXG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJhdHRlbXB0ZWQgdG8gc2V0IHByaXZhdGUgZmllbGQgb24gbm9uLWluc3RhbmNlXCIpO1xyXG4gICAgfVxyXG4gICAgcHJpdmF0ZU1hcC5zZXQocmVjZWl2ZXIsIHZhbHVlKTtcclxuICAgIHJldHVybiB2YWx1ZTtcclxufVxyXG4iLCJpbXBvcnQgeyBDbG9jayB9IGZyb20gJy4vQ2xvY2snO1xuXG4vKipcbiAqIENsYXNzIHRoYXQgZGVhbHMgd2l0aCB0aW1lLlxuICogVGhpcyBpcyBcImZyYW1lXCIgdHlwZSBjbG9jaywgdGhlIGZyYW1lIGluY3JlYXNlcyBldmVyeSB7QGxpbmsgQ2xvY2tGcmFtZSN1cGRhdGV9IGNhbGwuXG4gKiBAcGFyYW0gZnBzIEZyYW1lcyBwZXIgc2Vjb25kXG4gKi9cbmV4cG9ydCBjbGFzcyBDbG9ja0ZyYW1lIGV4dGVuZHMgQ2xvY2sge1xuICAvKipcbiAgICogSXRzIGN1cnJlbnQgZnJhbWUuXG4gICAqL1xuICBwcml2YXRlIF9fZnJhbWUgPSAwO1xuXG4gIC8qKlxuICAgKiBJdHMgZnBzLlxuICAgKi9cbiAgcHJpdmF0ZSBfX2ZwczogbnVtYmVyO1xuXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggZnBzID0gNjAgKSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLl9fZnBzID0gZnBzO1xuICB9XG5cbiAgLyoqXG4gICAqIEl0cyBjdXJyZW50IGZyYW1lLlxuICAgKi9cbiAgcHVibGljIGdldCBmcmFtZSgpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5fX2ZyYW1lOyB9XG5cbiAgLyoqXG4gICAqIEl0cyBmcHMuXG4gICAqL1xuICBwdWJsaWMgZ2V0IGZwcygpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5fX2ZwczsgfVxuXG4gIC8qKlxuICAgKiBVcGRhdGUgdGhlIGNsb2NrLiBJdCB3aWxsIGluY3JlYXNlIHRoZSBmcmFtZSBieSAxLlxuICAgKi9cbiAgcHVibGljIHVwZGF0ZSgpOiB2b2lkIHtcbiAgICBpZiAoIHRoaXMuX19pc1BsYXlpbmcgKSB7XG4gICAgICB0aGlzLl9fdGltZSA9IHRoaXMuX19mcmFtZSAvIHRoaXMuX19mcHM7XG4gICAgICB0aGlzLl9fZGVsdGFUaW1lID0gMS4wIC8gdGhpcy5fX2ZwcztcbiAgICAgIHRoaXMuX19mcmFtZSArKztcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fX2RlbHRhVGltZSA9IDAuMDtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogU2V0IHRoZSB0aW1lIG1hbnVhbGx5LlxuICAgKiBUaGUgc2V0IHRpbWUgd2lsbCBiZSBjb252ZXJ0ZWQgaW50byBpbnRlcm5hbCBmcmFtZSBjb3VudCwgc28gdGhlIHRpbWUgd2lsbCBub3QgYmUgZXhhY3RseSBzYW1lIGFzIHNldCBvbmUuXG4gICAqIEBwYXJhbSB0aW1lIFRpbWVcbiAgICovXG4gIHB1YmxpYyBzZXRUaW1lKCB0aW1lOiBudW1iZXIgKTogdm9pZCB7XG4gICAgdGhpcy5fX2ZyYW1lID0gTWF0aC5mbG9vciggdGhpcy5fX2ZwcyAqIHRpbWUgKTtcbiAgICB0aGlzLl9fdGltZSA9IHRoaXMuX19mcmFtZSAvIHRoaXMuX19mcHM7XG4gIH1cbn1cbiIsImltcG9ydCB7IENsb2NrIH0gZnJvbSAnLi9DbG9jayc7XG5cbi8qKlxuICogQ2xhc3MgdGhhdCBkZWFscyB3aXRoIHRpbWUuXG4gKiBUaGlzIGlzIFwicmVhbHRpbWVcIiB0eXBlIGNsb2NrLCB0aGUgdGltZSBnb2VzIG9uIGFzIHJlYWwgd29ybGQuXG4gKi9cbmV4cG9ydCBjbGFzcyBDbG9ja1JlYWx0aW1lIGV4dGVuZHMgQ2xvY2sge1xuICAvKipcbiAgICogXCJZb3Ugc2V0IHRoZSB0aW1lIG1hbnVhbGx5IHRvIGBfX3J0VGltZWAgd2hlbiBpdCdzIGBfX3J0RGF0ZWAuXCJcbiAgICovXG4gIHByaXZhdGUgX19ydFRpbWUgPSAwLjA7XG5cbiAgLyoqXG4gICAqIFwiWW91IHNldCB0aGUgdGltZSBtYW51YWxseSB0byBgX19ydFRpbWVgIHdoZW4gaXQncyBgX19ydERhdGVgLlwiXG4gICAqL1xuICBwcml2YXRlIF9fcnREYXRlOiBudW1iZXIgPSBwZXJmb3JtYW5jZS5ub3coKTtcblxuICAvKipcbiAgICogVGhlIGNsb2NrIGlzIHJlYWx0aW1lLiB5ZWFoLlxuICAgKi9cbiAgcHVibGljIGdldCBpc1JlYWx0aW1lKCk6IGJvb2xlYW4geyByZXR1cm4gdHJ1ZTsgfVxuXG4gIC8qKlxuICAgKiBVcGRhdGUgdGhlIGNsb2NrLiBUaW1lIGlzIGNhbGN1bGF0ZWQgYmFzZWQgb24gdGltZSBpbiByZWFsIHdvcmxkLlxuICAgKi9cbiAgcHVibGljIHVwZGF0ZSgpOiB2b2lkIHtcbiAgICBjb25zdCBub3cgPSBwZXJmb3JtYW5jZS5ub3coKTtcblxuICAgIGlmICggdGhpcy5fX2lzUGxheWluZyApIHtcbiAgICAgIGNvbnN0IHByZXZUaW1lID0gdGhpcy5fX3RpbWU7XG4gICAgICBjb25zdCBkZWx0YURhdGUgPSAoIG5vdyAtIHRoaXMuX19ydERhdGUgKTtcbiAgICAgIHRoaXMuX190aW1lID0gdGhpcy5fX3J0VGltZSArIGRlbHRhRGF0ZSAvIDEwMDAuMDtcbiAgICAgIHRoaXMuX19kZWx0YVRpbWUgPSB0aGlzLnRpbWUgLSBwcmV2VGltZTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fX3J0VGltZSA9IHRoaXMudGltZTtcbiAgICAgIHRoaXMuX19ydERhdGUgPSBub3c7XG4gICAgICB0aGlzLl9fZGVsdGFUaW1lID0gMC4wO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgdGhlIHRpbWUgbWFudWFsbHkuXG4gICAqIEBwYXJhbSB0aW1lIFRpbWVcbiAgICovXG4gIHB1YmxpYyBzZXRUaW1lKCB0aW1lOiBudW1iZXIgKTogdm9pZCB7XG4gICAgdGhpcy5fX3RpbWUgPSB0aW1lO1xuICAgIHRoaXMuX19ydFRpbWUgPSB0aGlzLnRpbWU7XG4gICAgdGhpcy5fX3J0RGF0ZSA9IHBlcmZvcm1hbmNlLm5vdygpO1xuICB9XG59XG4iLCIvLyB5b2lua2VkIGZyb20gaHR0cHM6Ly9naXRodWIuY29tL21hcGJveC90aW55LXNkZiAoQlNEIDItQ2xhdXNlKVxuLy8gaW1wbGVtZW50cyBodHRwOi8vcGVvcGxlLmNzLnVjaGljYWdvLmVkdS9+cGZmL3BhcGVycy9kdC5wZGZcblxuLyoqXG4gKiBDb21wdXRlIGEgb25lIGRpbWVuc2lvbmFsIGVkdCBmcm9tIHRoZSBzb3VyY2UgZGF0YS5cbiAqIFJldHVybmluZyBkaXN0YW5jZSB3aWxsIGJlIHNxdWFyZWQuXG4gKiBJbnRlbmRlZCB0byBiZSB1c2VkIGludGVybmFsbHkgaW4ge0BsaW5rIGVkdDJkfS5cbiAqXG4gKiBAcGFyYW0gZGF0YSBEYXRhIG9mIHRoZSBzb3VyY2VcbiAqIEBwYXJhbSBvZmZzZXQgT2Zmc2V0IG9mIHRoZSBzb3VyY2UgZnJvbSBiZWdpbm5pbmdcbiAqIEBwYXJhbSBzdHJpZGUgU3RyaWRlIG9mIHRoZSBzb3VyY2VcbiAqIEBwYXJhbSBsZW5ndGggTGVuZ3RoIG9mIHRoZSBzb3VyY2VcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGVkdDFkKFxuICBkYXRhOiBGbG9hdDMyQXJyYXksXG4gIG9mZnNldDogbnVtYmVyLFxuICBzdHJpZGU6IG51bWJlcixcbiAgbGVuZ3RoOiBudW1iZXJcbik6IHZvaWQge1xuICAvLyBpbmRleCBvZiByaWdodG1vc3QgcGFyYWJvbGEgaW4gbG93ZXIgZW52ZWxvcGVcbiAgbGV0IGsgPSAwO1xuXG4gIC8vIGxvY2F0aW9ucyBvZiBwYXJhYm9sYXMgaW4gbG93ZXIgZW52ZWxvcGVcbiAgY29uc3QgdiA9IG5ldyBGbG9hdDMyQXJyYXkoIGxlbmd0aCApO1xuICB2WyAwIF0gPSAwLjA7XG5cbiAgLy8gbG9jYXRpb25zIG9mIGJvdW5kYXJpZXMgYmV0d2VlbiBwYXJhYm9sYXNcbiAgY29uc3QgeiA9IG5ldyBGbG9hdDMyQXJyYXkoIGxlbmd0aCArIDEgKTtcbiAgelsgMCBdID0gLUluZmluaXR5O1xuICB6WyAxIF0gPSBJbmZpbml0eTtcblxuICAvLyBjcmVhdGUgYSBzdHJhaWdodCBhcnJheSBvZiBpbnB1dCBkYXRhXG4gIGNvbnN0IGYgPSBuZXcgRmxvYXQzMkFycmF5KCBsZW5ndGggKTtcbiAgZm9yICggbGV0IHEgPSAwOyBxIDwgbGVuZ3RoOyBxICsrICkge1xuICAgIGZbIHEgXSA9IGRhdGFbIG9mZnNldCArIHEgKiBzdHJpZGUgXTtcbiAgfVxuXG4gIC8vIGNvbXB1dGUgbG93ZXIgZW52ZWxvcGVcbiAgZm9yICggbGV0IHEgPSAxOyBxIDwgbGVuZ3RoOyBxICsrICkge1xuICAgIGxldCBzID0gMC4wO1xuXG4gICAgd2hpbGUgKCAwIDw9IGsgKSB7XG4gICAgICBzID0gKCBmWyBxIF0gKyBxICogcSAtIGZbIHZbIGsgXSBdIC0gdlsgayBdICogdlsgayBdICkgLyAoIDIuMCAqIHEgLSAyLjAgKiB2WyBrIF0gKTtcbiAgICAgIGlmICggcyA8PSB6WyBrIF0gKSB7XG4gICAgICAgIGsgLS07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG5cbiAgICBrICsrO1xuICAgIHZbIGsgXSA9IHE7XG4gICAgelsgayBdID0gcztcbiAgICB6WyBrICsgMSBdID0gSW5maW5pdHk7XG4gIH1cblxuICBrID0gMDtcblxuICAvLyBmaWxsIGluIHZhbHVlcyBvZiBkaXN0YW5jZSB0cmFuc2Zvcm1cbiAgZm9yICggbGV0IHEgPSAwOyBxIDwgbGVuZ3RoOyBxICsrICkge1xuICAgIHdoaWxlICggelsgayArIDEgXSA8IHEgKSB7IGsgKys7IH1cbiAgICBjb25zdCBxU3ViVksgPSBxIC0gdlsgayBdO1xuICAgIGRhdGFbIG9mZnNldCArIHEgKiBzdHJpZGUgXSA9IGZbIHZbIGsgXSBdICsgcVN1YlZLICogcVN1YlZLO1xuICB9XG59XG5cbi8qKlxuICogQ29tcHV0ZSBhIHR3byBkaW1lbnNpb25hbCBlZHQgZnJvbSB0aGUgc291cmNlIGRhdGEuXG4gKiBSZXR1cm5pbmcgZGlzdGFuY2Ugd2lsbCBiZSBzcXVhcmVkLlxuICpcbiAqIEBwYXJhbSBkYXRhIERhdGEgb2YgdGhlIHNvdXJjZS5cbiAqIEBwYXJhbSB3aWR0aCBXaWR0aCBvZiB0aGUgc291cmNlLlxuICogQHBhcmFtIGhlaWdodCBIZWlnaHQgb2YgdGhlIHNvdXJjZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGVkdDJkKFxuICBkYXRhOiBGbG9hdDMyQXJyYXksXG4gIHdpZHRoOiBudW1iZXIsXG4gIGhlaWdodDogbnVtYmVyXG4pOiB2b2lkIHtcbiAgZm9yICggbGV0IHggPSAwOyB4IDwgd2lkdGg7IHggKysgKSB7XG4gICAgZWR0MWQoIGRhdGEsIHgsIHdpZHRoLCBoZWlnaHQgKTtcbiAgfVxuXG4gIGZvciAoIGxldCB5ID0gMDsgeSA8IGhlaWdodDsgeSArKyApIHtcbiAgICBlZHQxZCggZGF0YSwgeSAqIHdpZHRoLCAxLCB3aWR0aCApO1xuICB9XG59XG4iLCIvKipcbiAqIGBsZXJwYCwgb3IgYG1peGBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGxlcnAoIGE6IG51bWJlciwgYjogbnVtYmVyLCB4OiBudW1iZXIgKTogbnVtYmVyIHtcbiAgcmV0dXJuIGEgKyAoIGIgLSBhICkgKiB4O1xufVxuXG4vKipcbiAqIGBjbGFtcGBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNsYW1wKCB4OiBudW1iZXIsIGw6IG51bWJlciwgaDogbnVtYmVyICk6IG51bWJlciB7XG4gIHJldHVybiBNYXRoLm1pbiggTWF0aC5tYXgoIHgsIGwgKSwgaCApO1xufVxuXG4vKipcbiAqIGBjbGFtcCggeCwgMC4wLCAxLjAgKWBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNhdHVyYXRlKCB4OiBudW1iZXIgKTogbnVtYmVyIHtcbiAgcmV0dXJuIGNsYW1wKCB4LCAwLjAsIDEuMCApO1xufVxuXG4vKipcbiAqIFRyYW5zZm9ybSBhIHZhbHVlIGZyb20gaW5wdXQgcmFuZ2UgdG8gb3V0cHV0IHJhbmdlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gcmFuZ2UoIHg6IG51bWJlciwgeDA6IG51bWJlciwgeDE6IG51bWJlciwgeTA6IG51bWJlciwgeTE6IG51bWJlciApOiBudW1iZXIge1xuICByZXR1cm4gKCAoIHggLSB4MCApICogKCB5MSAtIHkwICkgLyAoIHgxIC0geDAgKSArIHkwICk7XG59XG5cbi8qKlxuICogYHNtb290aHN0ZXBgIGJ1dCBub3Qgc21vb3RoXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBsaW5lYXJzdGVwKCBhOiBudW1iZXIsIGI6IG51bWJlciwgeDogbnVtYmVyICk6IG51bWJlciB7XG4gIHJldHVybiBzYXR1cmF0ZSggKCB4IC0gYSApIC8gKCBiIC0gYSApICk7XG59XG5cbi8qKlxuICogd29ybGQgZmFtb3VzIGBzbW9vdGhzdGVwYCBmdW5jdGlvblxuICovXG5leHBvcnQgZnVuY3Rpb24gc21vb3Roc3RlcCggYTogbnVtYmVyLCBiOiBudW1iZXIsIHg6IG51bWJlciApOiBudW1iZXIge1xuICBjb25zdCB0ID0gbGluZWFyc3RlcCggYSwgYiwgeCApO1xuICByZXR1cm4gdCAqIHQgKiAoIDMuMCAtIDIuMCAqIHQgKTtcbn1cblxuLyoqXG4gKiBgc21vb3Roc3RlcGAgYnV0IG1vcmUgc21vb3RoXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzbW9vdGhlcnN0ZXAoIGE6IG51bWJlciwgYjogbnVtYmVyLCB4OiBudW1iZXIgKTogbnVtYmVyIHtcbiAgY29uc3QgdCA9IGxpbmVhcnN0ZXAoIGEsIGIsIHggKTtcbiAgcmV0dXJuIHQgKiB0ICogdCAqICggdCAqICggdCAqIDYuMCAtIDE1LjAgKSArIDEwLjAgKTtcbn1cblxuLyoqXG4gKiBgc21vb3Roc3RlcGAgYnV0IFdBWSBtb3JlIHNtb290aFxuICovXG5leHBvcnQgZnVuY3Rpb24gc21vb3RoZXN0c3RlcCggYTogbnVtYmVyLCBiOiBudW1iZXIsIHg6IG51bWJlciApOiBudW1iZXIge1xuICBjb25zdCB0ID0gbGluZWFyc3RlcCggYSwgYiwgeCApO1xuICByZXR1cm4gdCAqIHQgKiB0ICogdCAqICggdCAqICggdCAqICggLTIwLjAgKiB0ICsgNzAuMCApIC0gODQuMCApICsgMzUuMCApO1xufVxuIiwiaW1wb3J0IHsgbGVycCB9IGZyb20gJy4uL21hdGgvdXRpbHMnO1xuXG4vKipcbiAqIERvIGV4cCBzbW9vdGhpbmdcbiAqL1xuZXhwb3J0IGNsYXNzIEV4cFNtb290aCB7XG4gIHB1YmxpYyBmYWN0b3IgPSAxMC4wO1xuICBwdWJsaWMgdGFyZ2V0ID0gMC4wO1xuICBwdWJsaWMgdmFsdWUgPSAwLjA7XG5cbiAgcHVibGljIHVwZGF0ZSggZGVsdGFUaW1lOiBudW1iZXIgKTogbnVtYmVyIHtcbiAgICB0aGlzLnZhbHVlID0gbGVycCggdGhpcy50YXJnZXQsIHRoaXMudmFsdWUsIE1hdGguZXhwKCAtdGhpcy5mYWN0b3IgKiBkZWx0YVRpbWUgKSApO1xuICAgIHJldHVybiB0aGlzLnZhbHVlO1xuICB9XG59XG4iLCIvKipcbiAqIEl0ZXJhYmxlIEZpenpCdXp6XG4gKi9cbmV4cG9ydCBjbGFzcyBGaXp6QnV6eiBpbXBsZW1lbnRzIEl0ZXJhYmxlPG51bWJlciB8IHN0cmluZz4ge1xuICBwdWJsaWMgc3RhdGljIFdvcmRzRGVmYXVsdDogTWFwPG51bWJlciwgc3RyaW5nPiA9IG5ldyBNYXAoIFtcbiAgICBbIDMsICdGaXp6JyBdLFxuICAgIFsgNSwgJ0J1enonIF1cbiAgXSApO1xuXG4gIHByaXZhdGUgX193b3JkczogTWFwPG51bWJlciwgc3RyaW5nPjtcbiAgcHJpdmF0ZSBfX2luZGV4OiBudW1iZXI7XG4gIHByaXZhdGUgX19lbmQ6IG51bWJlcjtcblxuICBwdWJsaWMgY29uc3RydWN0b3IoIHdvcmRzOiBNYXA8bnVtYmVyLCBzdHJpbmc+ID0gRml6ekJ1enouV29yZHNEZWZhdWx0LCBpbmRleCA9IDEsIGVuZCA9IDEwMCApIHtcbiAgICB0aGlzLl9fd29yZHMgPSB3b3JkcztcbiAgICB0aGlzLl9faW5kZXggPSBpbmRleDtcbiAgICB0aGlzLl9fZW5kID0gZW5kO1xuICB9XG5cbiAgcHVibGljIFsgU3ltYm9sLml0ZXJhdG9yIF0oKTogSXRlcmF0b3I8c3RyaW5nIHwgbnVtYmVyLCBhbnksIHVuZGVmaW5lZD4ge1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgcHVibGljIG5leHQoKTogSXRlcmF0b3JSZXN1bHQ8bnVtYmVyIHwgc3RyaW5nPiB7XG4gICAgaWYgKCB0aGlzLl9fZW5kIDwgdGhpcy5fX2luZGV4ICkge1xuICAgICAgcmV0dXJuIHsgZG9uZTogdHJ1ZSwgdmFsdWU6IG51bGwgfTtcbiAgICB9XG5cbiAgICBsZXQgdmFsdWU6IG51bWJlciB8IHN0cmluZyA9ICcnO1xuICAgIGZvciAoIGNvbnN0IFsgcmVtLCB3b3JkIF0gb2YgdGhpcy5fX3dvcmRzICkge1xuICAgICAgaWYgKCAoIHRoaXMuX19pbmRleCAlIHJlbSApID09PSAwICkge1xuICAgICAgICB2YWx1ZSArPSB3b3JkO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmICggdmFsdWUgPT09ICcnICkge1xuICAgICAgdmFsdWUgPSB0aGlzLl9faW5kZXg7XG4gICAgfVxuXG4gICAgdGhpcy5fX2luZGV4ICsrO1xuXG4gICAgcmV0dXJuIHsgZG9uZTogZmFsc2UsIHZhbHVlIH07XG4gIH1cbn1cbiIsIi8qKlxuICogTW9zdCBhd2Vzb21lIGNhdCBldmVyXG4gKi9cbmV4cG9ydCBjbGFzcyBGTVNfQ2F0IHsgLy8gZXNsaW50LWRpc2FibGUtbGluZVxuICAvKipcbiAgICogRk1TX0NhdC5naWZcbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgZ2lmID0gJ2h0dHBzOi8vZm1zLWNhdC5jb20vaW1hZ2VzL2Ztc19jYXQuZ2lmJztcblxuICAvKipcbiAgICogRk1TX0NhdC5wbmdcbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgcG5nID0gJ2h0dHBzOi8vZm1zLWNhdC5jb20vaW1hZ2VzL2Ztc19jYXQucG5nJztcbn1cbiIsIi8qKlxuICogVXNlZnVsIGZvciBmcHMgY2FsY1xuICovXG5leHBvcnQgY2xhc3MgSGlzdG9yeU1lYW5DYWxjdWxhdG9yIHtcbiAgcHJpdmF0ZSBfX3JlY2FsY0ZvckVhY2ggPSAwO1xuICBwcml2YXRlIF9fY291bnRVbnRpbFJlY2FsYyA9IDA7XG4gIHByaXZhdGUgX19oaXN0b3J5OiBudW1iZXJbXSA9IFtdO1xuICBwcml2YXRlIF9faW5kZXggPSAwO1xuICBwcml2YXRlIF9fbGVuZ3RoOiBudW1iZXI7XG4gIHByaXZhdGUgX19jb3VudCA9IDA7XG4gIHByaXZhdGUgX19jYWNoZSA9IDA7XG5cbiAgcHVibGljIGNvbnN0cnVjdG9yKCBsZW5ndGg6IG51bWJlciApIHtcbiAgICB0aGlzLl9fbGVuZ3RoID0gbGVuZ3RoO1xuICAgIHRoaXMuX19yZWNhbGNGb3JFYWNoID0gbGVuZ3RoO1xuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IGxlbmd0aDsgaSArKyApIHtcbiAgICAgIHRoaXMuX19oaXN0b3J5WyBpIF0gPSAwO1xuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyBnZXQgbWVhbigpOiBudW1iZXIge1xuICAgIGNvbnN0IGNvdW50ID0gTWF0aC5taW4oIHRoaXMuX19jb3VudCwgdGhpcy5fX2xlbmd0aCApO1xuICAgIHJldHVybiBjb3VudCA9PT0gMCA/IDAuMCA6IHRoaXMuX19jYWNoZSAvIGNvdW50O1xuICB9XG5cbiAgcHVibGljIGdldCByZWNhbGNGb3JFYWNoKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuX19yZWNhbGNGb3JFYWNoO1xuICB9XG5cbiAgcHVibGljIHNldCByZWNhbGNGb3JFYWNoKCB2YWx1ZTogbnVtYmVyICkge1xuICAgIGNvbnN0IGRlbHRhID0gdmFsdWUgLSB0aGlzLl9fcmVjYWxjRm9yRWFjaDtcbiAgICB0aGlzLl9fcmVjYWxjRm9yRWFjaCA9IHZhbHVlO1xuICAgIHRoaXMuX19jb3VudFVudGlsUmVjYWxjID0gTWF0aC5tYXgoIDAsIHRoaXMuX19jb3VudFVudGlsUmVjYWxjICsgZGVsdGEgKTtcbiAgfVxuXG4gIHB1YmxpYyByZXNldCgpOiB2b2lkIHtcbiAgICB0aGlzLl9faW5kZXggPSAwO1xuICAgIHRoaXMuX19jb3VudCA9IDA7XG4gICAgdGhpcy5fX2NhY2hlID0gMDtcbiAgICB0aGlzLl9fY291bnRVbnRpbFJlY2FsYyA9IDA7XG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdGhpcy5fX2xlbmd0aDsgaSArKyApIHtcbiAgICAgIHRoaXMuX19oaXN0b3J5WyBpIF0gPSAwO1xuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyBwdXNoKCB2YWx1ZTogbnVtYmVyICk6IHZvaWQge1xuICAgIGNvbnN0IHByZXYgPSB0aGlzLl9faGlzdG9yeVsgdGhpcy5fX2luZGV4IF07XG4gICAgdGhpcy5fX2hpc3RvcnlbIHRoaXMuX19pbmRleCBdID0gdmFsdWU7XG4gICAgdGhpcy5fX2NvdW50ICsrO1xuICAgIHRoaXMuX19pbmRleCA9ICggdGhpcy5fX2luZGV4ICsgMSApICUgdGhpcy5fX2xlbmd0aDtcblxuICAgIGlmICggdGhpcy5fX2NvdW50VW50aWxSZWNhbGMgPT09IDAgKSB7XG4gICAgICB0aGlzLnJlY2FsYygpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9fY291bnRVbnRpbFJlY2FsYyAtLTtcbiAgICAgIHRoaXMuX19jYWNoZSAtPSBwcmV2O1xuICAgICAgdGhpcy5fX2NhY2hlICs9IHZhbHVlO1xuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyByZWNhbGMoKTogdm9pZCB7XG4gICAgdGhpcy5fX2NvdW50VW50aWxSZWNhbGMgPSB0aGlzLl9fcmVjYWxjRm9yRWFjaDtcbiAgICBjb25zdCBzdW0gPSB0aGlzLl9faGlzdG9yeVxuICAgICAgLnNsaWNlKCAwLCBNYXRoLm1pbiggdGhpcy5fX2NvdW50LCB0aGlzLl9fbGVuZ3RoICkgKVxuICAgICAgLnJlZHVjZSggKCBzdW0sIHYgKSA9PiBzdW0gKyB2LCAwICk7XG4gICAgdGhpcy5fX2NhY2hlID0gc3VtO1xuICB9XG59XG4iLCJpbXBvcnQgeyBiaW5hcnlTZWFyY2ggfSBmcm9tICcuLi9hbGdvcml0aG0vYmluYXJ5U2VhcmNoJztcblxuLyoqXG4gKiBVc2VmdWwgZm9yIHRhcCB0ZW1wb1xuICogU2VlIGFsc286IHtAbGluayBIaXN0b3J5TWVhbkNhbGN1bGF0b3J9XG4gKi9cbmV4cG9ydCBjbGFzcyBIaXN0b3J5TWVkaWFuQ2FsY3VsYXRvciB7XG4gIHByaXZhdGUgX19oaXN0b3J5OiBudW1iZXJbXSA9IFtdO1xuICBwcml2YXRlIF9fc29ydGVkOiBudW1iZXJbXSA9IFtdO1xuICBwcml2YXRlIF9faW5kZXggPSAwO1xuICBwcml2YXRlIHJlYWRvbmx5IF9fbGVuZ3RoOiBudW1iZXI7XG5cbiAgcHVibGljIGNvbnN0cnVjdG9yKCBsZW5ndGg6IG51bWJlciApIHtcbiAgICB0aGlzLl9fbGVuZ3RoID0gbGVuZ3RoO1xuICB9XG5cbiAgcHVibGljIGdldCBtZWRpYW4oKTogbnVtYmVyIHtcbiAgICBjb25zdCBjb3VudCA9IE1hdGgubWluKCB0aGlzLl9fc29ydGVkLmxlbmd0aCwgdGhpcy5fX2xlbmd0aCApO1xuICAgIHJldHVybiB0aGlzLl9fc29ydGVkWyBNYXRoLmZsb29yKCAoIGNvdW50IC0gMSApIC8gMiApIF07XG4gIH1cblxuICBwdWJsaWMgcmVzZXQoKTogdm9pZCB7XG4gICAgdGhpcy5fX2luZGV4ID0gMDtcbiAgICB0aGlzLl9faGlzdG9yeSA9IFtdO1xuICAgIHRoaXMuX19zb3J0ZWQgPSBbXTtcbiAgfVxuXG4gIHB1YmxpYyBwdXNoKCB2YWx1ZTogbnVtYmVyICk6IHZvaWQge1xuICAgIGNvbnN0IHByZXYgPSB0aGlzLl9faGlzdG9yeVsgdGhpcy5fX2luZGV4IF07XG4gICAgdGhpcy5fX2hpc3RvcnlbIHRoaXMuX19pbmRleCBdID0gdmFsdWU7XG4gICAgdGhpcy5fX2luZGV4ID0gKCB0aGlzLl9faW5kZXggKyAxICkgJSB0aGlzLl9fbGVuZ3RoO1xuXG4gICAgLy8gcmVtb3ZlIHRoZSBwcmV2IGZyb20gc29ydGVkIGFycmF5XG4gICAgaWYgKCB0aGlzLl9fc29ydGVkLmxlbmd0aCA9PT0gdGhpcy5fX2xlbmd0aCApIHtcbiAgICAgIGNvbnN0IHByZXZJbmRleCA9IGJpbmFyeVNlYXJjaCggcHJldiwgdGhpcy5fX3NvcnRlZCApO1xuICAgICAgdGhpcy5fX3NvcnRlZC5zcGxpY2UoIHByZXZJbmRleCwgMSApO1xuICAgIH1cblxuICAgIGNvbnN0IGluZGV4ID0gYmluYXJ5U2VhcmNoKCB2YWx1ZSwgdGhpcy5fX3NvcnRlZCApO1xuICAgIHRoaXMuX19zb3J0ZWQuc3BsaWNlKCBpbmRleCwgMCwgdmFsdWUgKTtcbiAgfVxufVxuIiwiLyoqXG4gKiBBIFZlY3Rvci5cbiAqL1xuZXhwb3J0IGFic3RyYWN0IGNsYXNzIFZlY3RvcjxUIGV4dGVuZHMgVmVjdG9yPFQ+PiB7XG4gIHB1YmxpYyBhYnN0cmFjdCBlbGVtZW50czogbnVtYmVyW107XG5cbiAgLyoqXG4gICAqIFRoZSBsZW5ndGggb2YgdGhpcy5cbiAgICogYS5rLmEuIGBtYWduaXR1ZGVgXG4gICAqL1xuICBwdWJsaWMgZ2V0IGxlbmd0aCgpOiBudW1iZXIge1xuICAgIHJldHVybiBNYXRoLnNxcnQoIHRoaXMuZWxlbWVudHMucmVkdWNlKCAoIHN1bSwgdiApID0+IHN1bSArIHYgKiB2LCAwLjAgKSApO1xuICB9XG5cbiAgLyoqXG4gICAqIEEgbm9ybWFsaXplZCBWZWN0b3IzIG9mIHRoaXMuXG4gICAqL1xuICBwdWJsaWMgZ2V0IG5vcm1hbGl6ZWQoKTogVCB7XG4gICAgcmV0dXJuIHRoaXMuc2NhbGUoIDEuMCAvIHRoaXMubGVuZ3RoICk7XG4gIH1cblxuICAvKipcbiAgICogQ2xvbmUgdGhpcy5cbiAgICovXG4gIHB1YmxpYyBjbG9uZSgpOiBUIHtcbiAgICByZXR1cm4gdGhpcy5fX25ldyggdGhpcy5lbGVtZW50cy5jb25jYXQoKSApO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZCBhIFZlY3RvciBpbnRvIHRoaXMuXG4gICAqIEBwYXJhbSB2ZWN0b3IgQW5vdGhlciBWZWN0b3JcbiAgICovXG4gIHB1YmxpYyBhZGQoIHZlY3RvcjogVCApOiBUIHtcbiAgICByZXR1cm4gdGhpcy5fX25ldyggdGhpcy5lbGVtZW50cy5tYXAoICggdiwgaSApID0+IHYgKyB2ZWN0b3IuZWxlbWVudHNbIGkgXSApICk7XG4gIH1cblxuICAvKipcbiAgICogU3Vic3RyYWN0IHRoaXMgZnJvbSBhbm90aGVyIFZlY3Rvci5cbiAgICogQHBhcmFtIHYgQW5vdGhlciB2ZWN0b3JcbiAgICovXG4gIHB1YmxpYyBzdWIoIHZlY3RvcjogVCApOiBUIHtcbiAgICByZXR1cm4gdGhpcy5fX25ldyggdGhpcy5lbGVtZW50cy5tYXAoICggdiwgaSApID0+IHYgLSB2ZWN0b3IuZWxlbWVudHNbIGkgXSApICk7XG4gIH1cblxuICAvKipcbiAgICogTXVsdGlwbHkgYSBWZWN0b3Igd2l0aCB0aGlzLlxuICAgKiBAcGFyYW0gdmVjdG9yIEFub3RoZXIgVmVjdG9yXG4gICAqL1xuICBwdWJsaWMgbXVsdGlwbHkoIHZlY3RvcjogVCApOiBUIHtcbiAgICByZXR1cm4gdGhpcy5fX25ldyggdGhpcy5lbGVtZW50cy5tYXAoICggdiwgaSApID0+IHYgKiB2ZWN0b3IuZWxlbWVudHNbIGkgXSApICk7XG4gIH1cblxuICAvKipcbiAgICogRGl2aWRlIHRoaXMgZnJvbSBhbm90aGVyIFZlY3Rvci5cbiAgICogQHBhcmFtIHZlY3RvciBBbm90aGVyIFZlY3RvclxuICAgKi9cbiAgcHVibGljIGRpdmlkZSggdmVjdG9yOiBUICk6IFQge1xuICAgIHJldHVybiB0aGlzLl9fbmV3KCB0aGlzLmVsZW1lbnRzLm1hcCggKCB2LCBpICkgPT4gdiAvIHZlY3Rvci5lbGVtZW50c1sgaSBdICkgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTY2FsZSB0aGlzIGJ5IHNjYWxhci5cbiAgICogYS5rLmEuIGBtdWx0aXBseVNjYWxhcmBcbiAgICogQHBhcmFtIHNjYWxhciBBIHNjYWxhclxuICAgKi9cbiAgcHVibGljIHNjYWxlKCBzY2FsYXI6IG51bWJlciApOiBUIHtcbiAgICByZXR1cm4gdGhpcy5fX25ldyggdGhpcy5lbGVtZW50cy5tYXAoICggdiApID0+IHYgKiBzY2FsYXIgKSApO1xuICB9XG5cbiAgLyoqXG4gICAqIERvdCB0d28gVmVjdG9ycy5cbiAgICogQHBhcmFtIHZlY3RvciBBbm90aGVyIHZlY3RvclxuICAgKi9cbiAgcHVibGljIGRvdCggdmVjdG9yOiBUICk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuZWxlbWVudHMucmVkdWNlKCAoIHN1bSwgdiwgaSApID0+IHN1bSArIHYgKiB2ZWN0b3IuZWxlbWVudHNbIGkgXSwgMC4wICk7XG4gIH1cblxuICBwcm90ZWN0ZWQgYWJzdHJhY3QgX19uZXcoIHY6IG51bWJlcltdICk6IFQ7XG59XG4iLCJpbXBvcnQgeyBNYXRyaXg0IH0gZnJvbSAnLi9NYXRyaXg0JztcbmltcG9ydCB7IFF1YXRlcm5pb24gfSBmcm9tICcuL1F1YXRlcm5pb24nO1xuaW1wb3J0IHsgVmVjdG9yIH0gZnJvbSAnLi9WZWN0b3InO1xuXG5leHBvcnQgdHlwZSByYXdWZWN0b3IzID0gWyBudW1iZXIsIG51bWJlciwgbnVtYmVyIF07XG5cbi8qKlxuICogQSBWZWN0b3IzLlxuICovXG5leHBvcnQgY2xhc3MgVmVjdG9yMyBleHRlbmRzIFZlY3RvcjxWZWN0b3IzPiB7XG4gIHB1YmxpYyBlbGVtZW50czogcmF3VmVjdG9yMztcblxuICBwdWJsaWMgY29uc3RydWN0b3IoIHY6IHJhd1ZlY3RvcjMgPSBbIDAuMCwgMC4wLCAwLjAgXSApIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMuZWxlbWVudHMgPSB2O1xuICB9XG5cbiAgLyoqXG4gICAqIEFuIHggY29tcG9uZW50IG9mIHRoaXMuXG4gICAqL1xuICBwdWJsaWMgZ2V0IHgoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5lbGVtZW50c1sgMCBdO1xuICB9XG5cbiAgcHVibGljIHNldCB4KCB4OiBudW1iZXIgKSB7XG4gICAgdGhpcy5lbGVtZW50c1sgMCBdID0geDtcbiAgfVxuXG4gIC8qKlxuICAgKiBBbiB5IGNvbXBvbmVudCBvZiB0aGlzLlxuICAgKi9cbiAgcHVibGljIGdldCB5KCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuZWxlbWVudHNbIDEgXTtcbiAgfVxuXG4gIHB1YmxpYyBzZXQgeSggeTogbnVtYmVyICkge1xuICAgIHRoaXMuZWxlbWVudHNbIDEgXSA9IHk7XG4gIH1cblxuICAvKipcbiAgICogQW4geiBjb21wb25lbnQgb2YgdGhpcy5cbiAgICovXG4gIHB1YmxpYyBnZXQgeigpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLmVsZW1lbnRzWyAyIF07XG4gIH1cblxuICBwdWJsaWMgc2V0IHooIHo6IG51bWJlciApIHtcbiAgICB0aGlzLmVsZW1lbnRzWyAyIF0gPSB6O1xuICB9XG5cbiAgcHVibGljIHRvU3RyaW5nKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGBWZWN0b3IzKCAkeyB0aGlzLngudG9GaXhlZCggMyApIH0sICR7IHRoaXMueS50b0ZpeGVkKCAzICkgfSwgJHsgdGhpcy56LnRvRml4ZWQoIDMgKSB9IClgO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybiBhIGNyb3NzIG9mIHRoaXMgYW5kIGFub3RoZXIgVmVjdG9yMy5cbiAgICogQHBhcmFtIHZlY3RvciBBbm90aGVyIHZlY3RvclxuICAgKi9cbiAgcHVibGljIGNyb3NzKCB2ZWN0b3I6IFZlY3RvcjMgKTogVmVjdG9yMyB7XG4gICAgcmV0dXJuIG5ldyBWZWN0b3IzKCBbXG4gICAgICB0aGlzLnkgKiB2ZWN0b3IueiAtIHRoaXMueiAqIHZlY3Rvci55LFxuICAgICAgdGhpcy56ICogdmVjdG9yLnggLSB0aGlzLnggKiB2ZWN0b3IueixcbiAgICAgIHRoaXMueCAqIHZlY3Rvci55IC0gdGhpcy55ICogdmVjdG9yLnhcbiAgICBdICk7XG4gIH1cblxuICAvKipcbiAgICogUm90YXRlIHRoaXMgdmVjdG9yIHVzaW5nIGEgUXVhdGVybmlvbi5cbiAgICogQHBhcmFtIHF1YXRlcm5pb24gQSBxdWF0ZXJuaW9uXG4gICAqL1xuICBwdWJsaWMgYXBwbHlRdWF0ZXJuaW9uKCBxdWF0ZXJuaW9uOiBRdWF0ZXJuaW9uICk6IFZlY3RvcjMge1xuICAgIGNvbnN0IHAgPSBuZXcgUXVhdGVybmlvbiggWyB0aGlzLngsIHRoaXMueSwgdGhpcy56LCAwLjAgXSApO1xuICAgIGNvbnN0IHIgPSBxdWF0ZXJuaW9uLmludmVyc2VkO1xuICAgIGNvbnN0IHJlcyA9IHF1YXRlcm5pb24ubXVsdGlwbHkoIHAgKS5tdWx0aXBseSggciApO1xuICAgIHJldHVybiBuZXcgVmVjdG9yMyggWyByZXMueCwgcmVzLnksIHJlcy56IF0gKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBNdWx0aXBseSB0aGlzIHZlY3RvciAod2l0aCBhbiBpbXBsaWNpdCAxIGluIHRoZSA0dGggZGltZW5zaW9uKSBieSBtLlxuICAgKi9cbiAgcHVibGljIGFwcGx5TWF0cml4NCggbWF0cml4OiBNYXRyaXg0ICk6IFZlY3RvcjMge1xuICAgIGNvbnN0IG0gPSBtYXRyaXguZWxlbWVudHM7XG5cbiAgICBjb25zdCB3ID0gbVsgMyBdICogdGhpcy54ICsgbVsgNyBdICogdGhpcy55ICsgbVsgMTEgXSAqIHRoaXMueiArIG1bIDE1IF07XG4gICAgY29uc3QgaW52VyA9IDEuMCAvIHc7XG5cbiAgICByZXR1cm4gbmV3IFZlY3RvcjMoIFtcbiAgICAgICggbVsgMCBdICogdGhpcy54ICsgbVsgNCBdICogdGhpcy55ICsgbVsgOCBdICogdGhpcy56ICsgbVsgMTIgXSApICogaW52VyxcbiAgICAgICggbVsgMSBdICogdGhpcy54ICsgbVsgNSBdICogdGhpcy55ICsgbVsgOSBdICogdGhpcy56ICsgbVsgMTMgXSApICogaW52VyxcbiAgICAgICggbVsgMiBdICogdGhpcy54ICsgbVsgNiBdICogdGhpcy55ICsgbVsgMTAgXSAqIHRoaXMueiArIG1bIDE0IF0gKSAqIGludldcbiAgICBdICk7XG4gIH1cblxuICBwcm90ZWN0ZWQgX19uZXcoIHY6IHJhd1ZlY3RvcjMgKTogVmVjdG9yMyB7XG4gICAgcmV0dXJuIG5ldyBWZWN0b3IzKCB2ICk7XG4gIH1cblxuICAvKipcbiAgICogVmVjdG9yMyggMC4wLCAwLjAsIDAuMCApXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIGdldCB6ZXJvKCk6IFZlY3RvcjMge1xuICAgIHJldHVybiBuZXcgVmVjdG9yMyggWyAwLjAsIDAuMCwgMC4wIF0gKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBWZWN0b3IzKCAxLjAsIDEuMCwgMS4wIClcbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgZ2V0IG9uZSgpOiBWZWN0b3IzIHtcbiAgICByZXR1cm4gbmV3IFZlY3RvcjMoIFsgMS4wLCAxLjAsIDEuMCBdICk7XG4gIH1cbn1cbiIsImltcG9ydCB7IE1hdHJpeDQgfSBmcm9tICcuL01hdHJpeDQnO1xuaW1wb3J0IHsgVmVjdG9yMyB9IGZyb20gJy4vVmVjdG9yMyc7XG5cbmV4cG9ydCB0eXBlIHJhd1F1YXRlcm5pb24gPSBbIG51bWJlciwgbnVtYmVyLCBudW1iZXIsIG51bWJlciBdO1xuXG5leHBvcnQgY29uc3QgcmF3SWRlbnRpdHlRdWF0ZXJuaW9uOiByYXdRdWF0ZXJuaW9uID0gWyAwLjAsIDAuMCwgMC4wLCAxLjAgXTtcblxuLyoqXG4gKiBBIFF1YXRlcm5pb24uXG4gKi9cbmV4cG9ydCBjbGFzcyBRdWF0ZXJuaW9uIHtcbiAgcHVibGljIGVsZW1lbnRzOiByYXdRdWF0ZXJuaW9uOyAvLyBbIHgsIHksIHo7IHcgXVxuXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggZWxlbWVudHM6IHJhd1F1YXRlcm5pb24gPSByYXdJZGVudGl0eVF1YXRlcm5pb24gKSB7XG4gICAgdGhpcy5lbGVtZW50cyA9IGVsZW1lbnRzO1xuICB9XG5cbiAgLyoqXG4gICAqIEFuIHggY29tcG9uZW50IG9mIHRoaXMuXG4gICAqL1xuICBwdWJsaWMgZ2V0IHgoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5lbGVtZW50c1sgMCBdO1xuICB9XG5cbiAgLyoqXG4gICAqIEFuIHkgY29tcG9uZW50IG9mIHRoaXMuXG4gICAqL1xuICBwdWJsaWMgZ2V0IHkoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5lbGVtZW50c1sgMSBdO1xuICB9XG5cbiAgLyoqXG4gICAqIEFuIHogY29tcG9uZW50IG9mIHRoaXMuXG4gICAqL1xuICBwdWJsaWMgZ2V0IHooKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5lbGVtZW50c1sgMiBdO1xuICB9XG5cbiAgLyoqXG4gICAqIEFuIHcgY29tcG9uZW50IG9mIHRoaXMuXG4gICAqL1xuICBwdWJsaWMgZ2V0IHcoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5lbGVtZW50c1sgMyBdO1xuICB9XG5cbiAgcHVibGljIHRvU3RyaW5nKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGBRdWF0ZXJuaW9uKCAkeyB0aGlzLngudG9GaXhlZCggMyApIH0sICR7IHRoaXMueS50b0ZpeGVkKCAzICkgfSwgJHsgdGhpcy56LnRvRml4ZWQoIDMgKSB9LCAkeyB0aGlzLncudG9GaXhlZCggMyApIH0gKWA7XG4gIH1cblxuICAvKipcbiAgICogQ2xvbmUgdGhpcy5cbiAgICovXG4gIHB1YmxpYyBjbG9uZSgpOiBRdWF0ZXJuaW9uIHtcbiAgICByZXR1cm4gbmV3IFF1YXRlcm5pb24oIHRoaXMuZWxlbWVudHMuY29uY2F0KCkgYXMgcmF3UXVhdGVybmlvbiApO1xuICB9XG5cbiAgLyoqXG4gICAqIEl0c2VsZiBidXQgY29udmVydGVkIGludG8gYSBNYXRyaXg0LlxuICAgKi9cbiAgcHVibGljIGdldCBtYXRyaXgoKTogTWF0cml4NCB7XG4gICAgY29uc3QgeCA9IG5ldyBWZWN0b3IzKCBbIDEuMCwgMC4wLCAwLjAgXSApLmFwcGx5UXVhdGVybmlvbiggdGhpcyApO1xuICAgIGNvbnN0IHkgPSBuZXcgVmVjdG9yMyggWyAwLjAsIDEuMCwgMC4wIF0gKS5hcHBseVF1YXRlcm5pb24oIHRoaXMgKTtcbiAgICBjb25zdCB6ID0gbmV3IFZlY3RvcjMoIFsgMC4wLCAwLjAsIDEuMCBdICkuYXBwbHlRdWF0ZXJuaW9uKCB0aGlzICk7XG5cbiAgICByZXR1cm4gbmV3IE1hdHJpeDQoIFtcbiAgICAgIHgueCwgeS54LCB6LngsIDAuMCxcbiAgICAgIHgueSwgeS55LCB6LnksIDAuMCxcbiAgICAgIHgueiwgeS56LCB6LnosIDAuMCxcbiAgICAgIDAuMCwgMC4wLCAwLjAsIDEuMFxuICAgIF0gKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBbiBpbnZlcnNlIG9mIHRoaXMuXG4gICAqL1xuICBwdWJsaWMgZ2V0IGludmVyc2VkKCk6IFF1YXRlcm5pb24ge1xuICAgIHJldHVybiBuZXcgUXVhdGVybmlvbiggW1xuICAgICAgLXRoaXMueCxcbiAgICAgIC10aGlzLnksXG4gICAgICAtdGhpcy56LFxuICAgICAgdGhpcy53XG4gICAgXSApO1xuICB9XG5cbiAgLyoqXG4gICAqIE11bHRpcGx5IHR3byBRdWF0ZXJuaW9ucy5cbiAgICogQHBhcmFtIHEgQW5vdGhlciBRdWF0ZXJuaW9uXG4gICAqL1xuICBwdWJsaWMgbXVsdGlwbHkoIHE6IFF1YXRlcm5pb24gKTogUXVhdGVybmlvbiB7XG4gICAgcmV0dXJuIG5ldyBRdWF0ZXJuaW9uKCBbXG4gICAgICB0aGlzLncgKiBxLnggKyB0aGlzLnggKiBxLncgKyB0aGlzLnkgKiBxLnogLSB0aGlzLnogKiBxLnksXG4gICAgICB0aGlzLncgKiBxLnkgLSB0aGlzLnggKiBxLnogKyB0aGlzLnkgKiBxLncgKyB0aGlzLnogKiBxLngsXG4gICAgICB0aGlzLncgKiBxLnogKyB0aGlzLnggKiBxLnkgLSB0aGlzLnkgKiBxLnggKyB0aGlzLnogKiBxLncsXG4gICAgICB0aGlzLncgKiBxLncgLSB0aGlzLnggKiBxLnggLSB0aGlzLnkgKiBxLnkgLSB0aGlzLnogKiBxLnpcbiAgICBdICk7XG4gIH1cblxuICAvKipcbiAgICogQW4gaWRlbnRpdHkgUXVhdGVybmlvbi5cbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgZ2V0IGlkZW50aXR5KCk6IFF1YXRlcm5pb24ge1xuICAgIHJldHVybiBuZXcgUXVhdGVybmlvbiggcmF3SWRlbnRpdHlRdWF0ZXJuaW9uICk7XG4gIH1cblxuICAvKipcbiAgICogR2VuZXJhdGUgYSBRdWF0ZXJuaW9uIG91dCBvZiBhbmdsZSBhbmQgYXhpcy5cbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgZnJvbUF4aXNBbmdsZSggYXhpczogVmVjdG9yMywgYW5nbGU6IG51bWJlciApOiBRdWF0ZXJuaW9uIHtcbiAgICBjb25zdCBoYWxmQW5nbGUgPSBhbmdsZSAvIDIuMDtcbiAgICBjb25zdCBzaW5IYWxmQW5nbGUgPSBNYXRoLnNpbiggaGFsZkFuZ2xlICk7XG4gICAgcmV0dXJuIG5ldyBRdWF0ZXJuaW9uKCBbXG4gICAgICBheGlzLnggKiBzaW5IYWxmQW5nbGUsXG4gICAgICBheGlzLnkgKiBzaW5IYWxmQW5nbGUsXG4gICAgICBheGlzLnogKiBzaW5IYWxmQW5nbGUsXG4gICAgICBNYXRoLmNvcyggaGFsZkFuZ2xlIClcbiAgICBdICk7XG4gIH1cblxuICAvKipcbiAgICogR2VuZXJhdGUgYSBRdWF0ZXJuaW9uIG91dCBvZiBhIHJvdGF0aW9uIG1hdHJpeC5cbiAgICogWW9pbmtlZCBmcm9tIFRocmVlLmpzLlxuICAgKi9cbiAgcHVibGljIHN0YXRpYyBmcm9tTWF0cml4KCBtYXRyaXg6IE1hdHJpeDQgKTogUXVhdGVybmlvbiB7XG4gICAgY29uc3QgbSA9IG1hdHJpeC5lbGVtZW50cyxcbiAgICAgIG0xMSA9IG1bIDAgXSwgbTEyID0gbVsgNCBdLCBtMTMgPSBtWyA4IF0sXG4gICAgICBtMjEgPSBtWyAxIF0sIG0yMiA9IG1bIDUgXSwgbTIzID0gbVsgOSBdLFxuICAgICAgbTMxID0gbVsgMiBdLCBtMzIgPSBtWyA2IF0sIG0zMyA9IG1bIDEwIF0sXG4gICAgICB0cmFjZSA9IG0xMSArIG0yMiArIG0zMztcblxuICAgIGlmICggdHJhY2UgPiAwICkge1xuICAgICAgY29uc3QgcyA9IDAuNSAvIE1hdGguc3FydCggdHJhY2UgKyAxLjAgKTtcbiAgICAgIHJldHVybiBuZXcgUXVhdGVybmlvbiggW1xuICAgICAgICAoIG0zMiAtIG0yMyApICogcyxcbiAgICAgICAgKCBtMTMgLSBtMzEgKSAqIHMsXG4gICAgICAgICggbTIxIC0gbTEyICkgKiBzLFxuICAgICAgICAwLjI1IC8gc1xuICAgICAgXSApO1xuICAgIH0gZWxzZSBpZiAoIG0xMSA+IG0yMiAmJiBtMTEgPiBtMzMgKSB7XG4gICAgICBjb25zdCBzID0gMi4wICogTWF0aC5zcXJ0KCAxLjAgKyBtMTEgLSBtMjIgLSBtMzMgKTtcbiAgICAgIHJldHVybiBuZXcgUXVhdGVybmlvbiggW1xuICAgICAgICAwLjI1ICogcyxcbiAgICAgICAgKCBtMTIgKyBtMjEgKSAvIHMsXG4gICAgICAgICggbTEzICsgbTMxICkgLyBzLFxuICAgICAgICAoIG0zMiAtIG0yMyApIC8gc1xuICAgICAgXSApO1xuICAgIH0gZWxzZSBpZiAoIG0yMiA+IG0zMyApIHtcbiAgICAgIGNvbnN0IHMgPSAyLjAgKiBNYXRoLnNxcnQoIDEuMCArIG0yMiAtIG0xMSAtIG0zMyApO1xuICAgICAgcmV0dXJuIG5ldyBRdWF0ZXJuaW9uKCBbXG4gICAgICAgICggbTEyICsgbTIxICkgLyBzLFxuICAgICAgICAwLjI1ICogcyxcbiAgICAgICAgKCBtMjMgKyBtMzIgKSAvIHMsXG4gICAgICAgICggbTEzIC0gbTMxICkgLyBzXG4gICAgICBdICk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IHMgPSAyLjAgKiBNYXRoLnNxcnQoIDEuMCArIG0zMyAtIG0xMSAtIG0yMiApO1xuICAgICAgcmV0dXJuIG5ldyBRdWF0ZXJuaW9uKCBbXG4gICAgICAgICggbTEzICsgbTMxICkgLyBzLFxuICAgICAgICAoIG0yMyArIG0zMiApIC8gcyxcbiAgICAgICAgMC4yNSAqIHMsXG4gICAgICAgICggbTIxIC0gbTEyICkgLyBzXG4gICAgICBdICk7XG4gICAgfVxuICB9XG59XG4iLCJpbXBvcnQgeyBRdWF0ZXJuaW9uIH0gZnJvbSAnLi9RdWF0ZXJuaW9uJztcbmltcG9ydCB7IFZlY3RvcjMgfSBmcm9tICcuL1ZlY3RvcjMnO1xuXG5leHBvcnQgdHlwZSByYXdNYXRyaXg0ID0gW1xuICBudW1iZXIsIG51bWJlciwgbnVtYmVyLCBudW1iZXIsXG4gIG51bWJlciwgbnVtYmVyLCBudW1iZXIsIG51bWJlcixcbiAgbnVtYmVyLCBudW1iZXIsIG51bWJlciwgbnVtYmVyLFxuICBudW1iZXIsIG51bWJlciwgbnVtYmVyLCBudW1iZXJcbl07XG5cbmV4cG9ydCBjb25zdCByYXdJZGVudGl0eU1hdHJpeDQ6IHJhd01hdHJpeDQgPSBbXG4gIDEuMCwgMC4wLCAwLjAsIDAuMCxcbiAgMC4wLCAxLjAsIDAuMCwgMC4wLFxuICAwLjAsIDAuMCwgMS4wLCAwLjAsXG4gIDAuMCwgMC4wLCAwLjAsIDEuMFxuXTtcblxuLyoqXG4gKiBBIE1hdHJpeDQuXG4gKi9cbmV4cG9ydCBjbGFzcyBNYXRyaXg0IHtcbiAgcHVibGljIGVsZW1lbnRzOiByYXdNYXRyaXg0O1xuXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggdjogcmF3TWF0cml4NCA9IHJhd0lkZW50aXR5TWF0cml4NCApIHtcbiAgICB0aGlzLmVsZW1lbnRzID0gdjtcbiAgfVxuXG4gIC8qKlxuICAgKiBJdHNlbGYgYnV0IHRyYW5zcG9zZWQuXG4gICAqL1xuICBwdWJsaWMgZ2V0IHRyYW5zcG9zZSgpOiBNYXRyaXg0IHtcbiAgICBjb25zdCBtID0gdGhpcy5lbGVtZW50cztcblxuICAgIHJldHVybiBuZXcgTWF0cml4NCggW1xuICAgICAgbVsgMCBdLCBtWyA0IF0sIG1bIDggXSwgbVsgMTIgXSxcbiAgICAgIG1bIDEgXSwgbVsgNSBdLCBtWyA5IF0sIG1bIDEzIF0sXG4gICAgICBtWyAyIF0sIG1bIDYgXSwgbVsgMTAgXSwgbVsgMTQgXSxcbiAgICAgIG1bIDMgXSwgbVsgNyBdLCBtWyAxMSBdLCBtWyAxNSBdXG4gICAgXSApO1xuICB9XG5cbiAgLyoqXG4gICAqIEl0cyBkZXRlcm1pbmFudC5cbiAgICovXG4gIHB1YmxpYyBnZXQgZGV0ZXJtaW5hbnQoKTogbnVtYmVyIHtcbiAgICBjb25zdCBtID0gdGhpcy5lbGVtZW50cztcbiAgICBjb25zdFxuICAgICAgYTAwID0gbVsgIDAgXSwgYTAxID0gbVsgIDEgXSwgYTAyID0gbVsgIDIgXSwgYTAzID0gbVsgIDMgXSxcbiAgICAgIGExMCA9IG1bICA0IF0sIGExMSA9IG1bICA1IF0sIGExMiA9IG1bICA2IF0sIGExMyA9IG1bICA3IF0sXG4gICAgICBhMjAgPSBtWyAgOCBdLCBhMjEgPSBtWyAgOSBdLCBhMjIgPSBtWyAxMCBdLCBhMjMgPSBtWyAxMSBdLFxuICAgICAgYTMwID0gbVsgMTIgXSwgYTMxID0gbVsgMTMgXSwgYTMyID0gbVsgMTQgXSwgYTMzID0gbVsgMTUgXSxcbiAgICAgIGIwMCA9IGEwMCAqIGExMSAtIGEwMSAqIGExMCwgIGIwMSA9IGEwMCAqIGExMiAtIGEwMiAqIGExMCxcbiAgICAgIGIwMiA9IGEwMCAqIGExMyAtIGEwMyAqIGExMCwgIGIwMyA9IGEwMSAqIGExMiAtIGEwMiAqIGExMSxcbiAgICAgIGIwNCA9IGEwMSAqIGExMyAtIGEwMyAqIGExMSwgIGIwNSA9IGEwMiAqIGExMyAtIGEwMyAqIGExMixcbiAgICAgIGIwNiA9IGEyMCAqIGEzMSAtIGEyMSAqIGEzMCwgIGIwNyA9IGEyMCAqIGEzMiAtIGEyMiAqIGEzMCxcbiAgICAgIGIwOCA9IGEyMCAqIGEzMyAtIGEyMyAqIGEzMCwgIGIwOSA9IGEyMSAqIGEzMiAtIGEyMiAqIGEzMSxcbiAgICAgIGIxMCA9IGEyMSAqIGEzMyAtIGEyMyAqIGEzMSwgIGIxMSA9IGEyMiAqIGEzMyAtIGEyMyAqIGEzMjtcblxuICAgIHJldHVybiBiMDAgKiBiMTEgLSBiMDEgKiBiMTAgKyBiMDIgKiBiMDkgKyBiMDMgKiBiMDggLSBiMDQgKiBiMDcgKyBiMDUgKiBiMDY7XG4gIH1cblxuICAvKipcbiAgICogSXRzZWxmIGJ1dCBpbnZlcnRlZC5cbiAgICovXG4gIHB1YmxpYyBnZXQgaW52ZXJzZSgpOiBNYXRyaXg0IHwgbnVsbCB7XG4gICAgY29uc3QgbSA9IHRoaXMuZWxlbWVudHM7XG4gICAgY29uc3RcbiAgICAgIGEwMCA9IG1bICAwIF0sIGEwMSA9IG1bICAxIF0sIGEwMiA9IG1bICAyIF0sIGEwMyA9IG1bICAzIF0sXG4gICAgICBhMTAgPSBtWyAgNCBdLCBhMTEgPSBtWyAgNSBdLCBhMTIgPSBtWyAgNiBdLCBhMTMgPSBtWyAgNyBdLFxuICAgICAgYTIwID0gbVsgIDggXSwgYTIxID0gbVsgIDkgXSwgYTIyID0gbVsgMTAgXSwgYTIzID0gbVsgMTEgXSxcbiAgICAgIGEzMCA9IG1bIDEyIF0sIGEzMSA9IG1bIDEzIF0sIGEzMiA9IG1bIDE0IF0sIGEzMyA9IG1bIDE1IF0sXG4gICAgICBiMDAgPSBhMDAgKiBhMTEgLSBhMDEgKiBhMTAsICBiMDEgPSBhMDAgKiBhMTIgLSBhMDIgKiBhMTAsXG4gICAgICBiMDIgPSBhMDAgKiBhMTMgLSBhMDMgKiBhMTAsICBiMDMgPSBhMDEgKiBhMTIgLSBhMDIgKiBhMTEsXG4gICAgICBiMDQgPSBhMDEgKiBhMTMgLSBhMDMgKiBhMTEsICBiMDUgPSBhMDIgKiBhMTMgLSBhMDMgKiBhMTIsXG4gICAgICBiMDYgPSBhMjAgKiBhMzEgLSBhMjEgKiBhMzAsICBiMDcgPSBhMjAgKiBhMzIgLSBhMjIgKiBhMzAsXG4gICAgICBiMDggPSBhMjAgKiBhMzMgLSBhMjMgKiBhMzAsICBiMDkgPSBhMjEgKiBhMzIgLSBhMjIgKiBhMzEsXG4gICAgICBiMTAgPSBhMjEgKiBhMzMgLSBhMjMgKiBhMzEsICBiMTEgPSBhMjIgKiBhMzMgLSBhMjMgKiBhMzI7XG5cbiAgICBjb25zdCBkZXQgPSBiMDAgKiBiMTEgLSBiMDEgKiBiMTAgKyBiMDIgKiBiMDkgKyBiMDMgKiBiMDggLSBiMDQgKiBiMDcgKyBiMDUgKiBiMDY7XG5cbiAgICBpZiAoIGRldCA9PT0gMC4wICkgeyByZXR1cm4gbnVsbDsgfVxuXG4gICAgY29uc3QgaW52RGV0ID0gMS4wIC8gZGV0O1xuXG4gICAgcmV0dXJuIG5ldyBNYXRyaXg0KCBbXG4gICAgICBhMTEgKiBiMTEgLSBhMTIgKiBiMTAgKyBhMTMgKiBiMDksXG4gICAgICBhMDIgKiBiMTAgLSBhMDEgKiBiMTEgLSBhMDMgKiBiMDksXG4gICAgICBhMzEgKiBiMDUgLSBhMzIgKiBiMDQgKyBhMzMgKiBiMDMsXG4gICAgICBhMjIgKiBiMDQgLSBhMjEgKiBiMDUgLSBhMjMgKiBiMDMsXG4gICAgICBhMTIgKiBiMDggLSBhMTAgKiBiMTEgLSBhMTMgKiBiMDcsXG4gICAgICBhMDAgKiBiMTEgLSBhMDIgKiBiMDggKyBhMDMgKiBiMDcsXG4gICAgICBhMzIgKiBiMDIgLSBhMzAgKiBiMDUgLSBhMzMgKiBiMDEsXG4gICAgICBhMjAgKiBiMDUgLSBhMjIgKiBiMDIgKyBhMjMgKiBiMDEsXG4gICAgICBhMTAgKiBiMTAgLSBhMTEgKiBiMDggKyBhMTMgKiBiMDYsXG4gICAgICBhMDEgKiBiMDggLSBhMDAgKiBiMTAgLSBhMDMgKiBiMDYsXG4gICAgICBhMzAgKiBiMDQgLSBhMzEgKiBiMDIgKyBhMzMgKiBiMDAsXG4gICAgICBhMjEgKiBiMDIgLSBhMjAgKiBiMDQgLSBhMjMgKiBiMDAsXG4gICAgICBhMTEgKiBiMDcgLSBhMTAgKiBiMDkgLSBhMTIgKiBiMDYsXG4gICAgICBhMDAgKiBiMDkgLSBhMDEgKiBiMDcgKyBhMDIgKiBiMDYsXG4gICAgICBhMzEgKiBiMDEgLSBhMzAgKiBiMDMgLSBhMzIgKiBiMDAsXG4gICAgICBhMjAgKiBiMDMgLSBhMjEgKiBiMDEgKyBhMjIgKiBiMDBcbiAgICBdLm1hcCggKCB2ICkgPT4gdiAqIGludkRldCApIGFzIHJhd01hdHJpeDQgKTtcbiAgfVxuXG4gIHB1YmxpYyB0b1N0cmluZygpOiBzdHJpbmcge1xuICAgIGNvbnN0IG0gPSB0aGlzLmVsZW1lbnRzLm1hcCggKCB2ICkgPT4gdi50b0ZpeGVkKCAzICkgKTtcbiAgICByZXR1cm4gYE1hdHJpeDQoICR7IG1bIDAgXSB9LCAkeyBtWyA0IF0gfSwgJHsgbVsgOCBdIH0sICR7IG1bIDEyIF0gfTsgJHsgbVsgMSBdIH0sICR7IG1bIDUgXSB9LCAkeyBtWyA5IF0gfSwgJHsgbVsgMTMgXSB9OyAkeyBtWyAyIF0gfSwgJHsgbVsgNiBdIH0sICR7IG1bIDEwIF0gfSwgJHsgbVsgMTQgXSB9OyAkeyBtWyAzIF0gfSwgJHsgbVsgNyBdIH0sICR7IG1bIDExIF0gfSwgJHsgbVsgMTUgXSB9IClgO1xuICB9XG5cbiAgLyoqXG4gICAqIENsb25lIHRoaXMuXG4gICAqL1xuICBwdWJsaWMgY2xvbmUoKTogTWF0cml4NCB7XG4gICAgcmV0dXJuIG5ldyBNYXRyaXg0KCB0aGlzLmVsZW1lbnRzLmNvbmNhdCgpIGFzIHJhd01hdHJpeDQgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBNdWx0aXBseSB0aGlzIE1hdHJpeDQgYnkgb25lIG9yIG1vcmUgTWF0cml4NHMuXG4gICAqL1xuICBwdWJsaWMgbXVsdGlwbHkoIC4uLm1hdHJpY2VzOiBNYXRyaXg0W10gKTogTWF0cml4NCB7XG4gICAgaWYgKCBtYXRyaWNlcy5sZW5ndGggPT09IDAgKSB7XG4gICAgICByZXR1cm4gdGhpcy5jbG9uZSgpO1xuICAgIH1cblxuICAgIGNvbnN0IGFyciA9IG1hdHJpY2VzLmNvbmNhdCgpO1xuICAgIGxldCBiTWF0ID0gYXJyLnNoaWZ0KCkhO1xuICAgIGlmICggMCA8IGFyci5sZW5ndGggKSB7XG4gICAgICBiTWF0ID0gYk1hdC5tdWx0aXBseSggLi4uYXJyICk7XG4gICAgfVxuXG4gICAgY29uc3QgYSA9IHRoaXMuZWxlbWVudHM7XG4gICAgY29uc3QgYiA9IGJNYXQuZWxlbWVudHM7XG5cbiAgICByZXR1cm4gbmV3IE1hdHJpeDQoIFtcbiAgICAgIGFbIDAgXSAqIGJbIDAgXSArIGFbIDQgXSAqIGJbIDEgXSArIGFbIDggXSAqIGJbIDIgXSArIGFbIDEyIF0gKiBiWyAzIF0sXG4gICAgICBhWyAxIF0gKiBiWyAwIF0gKyBhWyA1IF0gKiBiWyAxIF0gKyBhWyA5IF0gKiBiWyAyIF0gKyBhWyAxMyBdICogYlsgMyBdLFxuICAgICAgYVsgMiBdICogYlsgMCBdICsgYVsgNiBdICogYlsgMSBdICsgYVsgMTAgXSAqIGJbIDIgXSArIGFbIDE0IF0gKiBiWyAzIF0sXG4gICAgICBhWyAzIF0gKiBiWyAwIF0gKyBhWyA3IF0gKiBiWyAxIF0gKyBhWyAxMSBdICogYlsgMiBdICsgYVsgMTUgXSAqIGJbIDMgXSxcblxuICAgICAgYVsgMCBdICogYlsgNCBdICsgYVsgNCBdICogYlsgNSBdICsgYVsgOCBdICogYlsgNiBdICsgYVsgMTIgXSAqIGJbIDcgXSxcbiAgICAgIGFbIDEgXSAqIGJbIDQgXSArIGFbIDUgXSAqIGJbIDUgXSArIGFbIDkgXSAqIGJbIDYgXSArIGFbIDEzIF0gKiBiWyA3IF0sXG4gICAgICBhWyAyIF0gKiBiWyA0IF0gKyBhWyA2IF0gKiBiWyA1IF0gKyBhWyAxMCBdICogYlsgNiBdICsgYVsgMTQgXSAqIGJbIDcgXSxcbiAgICAgIGFbIDMgXSAqIGJbIDQgXSArIGFbIDcgXSAqIGJbIDUgXSArIGFbIDExIF0gKiBiWyA2IF0gKyBhWyAxNSBdICogYlsgNyBdLFxuXG4gICAgICBhWyAwIF0gKiBiWyA4IF0gKyBhWyA0IF0gKiBiWyA5IF0gKyBhWyA4IF0gKiBiWyAxMCBdICsgYVsgMTIgXSAqIGJbIDExIF0sXG4gICAgICBhWyAxIF0gKiBiWyA4IF0gKyBhWyA1IF0gKiBiWyA5IF0gKyBhWyA5IF0gKiBiWyAxMCBdICsgYVsgMTMgXSAqIGJbIDExIF0sXG4gICAgICBhWyAyIF0gKiBiWyA4IF0gKyBhWyA2IF0gKiBiWyA5IF0gKyBhWyAxMCBdICogYlsgMTAgXSArIGFbIDE0IF0gKiBiWyAxMSBdLFxuICAgICAgYVsgMyBdICogYlsgOCBdICsgYVsgNyBdICogYlsgOSBdICsgYVsgMTEgXSAqIGJbIDEwIF0gKyBhWyAxNSBdICogYlsgMTEgXSxcblxuICAgICAgYVsgMCBdICogYlsgMTIgXSArIGFbIDQgXSAqIGJbIDEzIF0gKyBhWyA4IF0gKiBiWyAxNCBdICsgYVsgMTIgXSAqIGJbIDE1IF0sXG4gICAgICBhWyAxIF0gKiBiWyAxMiBdICsgYVsgNSBdICogYlsgMTMgXSArIGFbIDkgXSAqIGJbIDE0IF0gKyBhWyAxMyBdICogYlsgMTUgXSxcbiAgICAgIGFbIDIgXSAqIGJbIDEyIF0gKyBhWyA2IF0gKiBiWyAxMyBdICsgYVsgMTAgXSAqIGJbIDE0IF0gKyBhWyAxNCBdICogYlsgMTUgXSxcbiAgICAgIGFbIDMgXSAqIGJbIDEyIF0gKyBhWyA3IF0gKiBiWyAxMyBdICsgYVsgMTEgXSAqIGJbIDE0IF0gKyBhWyAxNSBdICogYlsgMTUgXVxuICAgIF0gKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBNdWx0aXBseSB0aGlzIE1hdHJpeDQgYnkgYSBzY2FsYXJcbiAgICovXG4gIHB1YmxpYyBzY2FsZVNjYWxhciggc2NhbGFyOiBudW1iZXIgKTogTWF0cml4NCB7XG4gICAgcmV0dXJuIG5ldyBNYXRyaXg0KCB0aGlzLmVsZW1lbnRzLm1hcCggKCB2ICkgPT4gdiAqIHNjYWxhciApIGFzIHJhd01hdHJpeDQgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBbiBpZGVudGl0eSBNYXRyaXg0LlxuICAgKi9cbiAgcHVibGljIHN0YXRpYyBnZXQgaWRlbnRpdHkoKTogTWF0cml4NCB7XG4gICAgcmV0dXJuIG5ldyBNYXRyaXg0KCByYXdJZGVudGl0eU1hdHJpeDQgKTtcbiAgfVxuXG4gIHB1YmxpYyBzdGF0aWMgbXVsdGlwbHkoIC4uLm1hdHJpY2VzOiBNYXRyaXg0W10gKTogTWF0cml4NCB7XG4gICAgaWYgKCBtYXRyaWNlcy5sZW5ndGggPT09IDAgKSB7XG4gICAgICByZXR1cm4gTWF0cml4NC5pZGVudGl0eTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgYk1hdHMgPSBtYXRyaWNlcy5jb25jYXQoKTtcbiAgICAgIGNvbnN0IGFNYXQgPSBiTWF0cy5zaGlmdCgpITtcbiAgICAgIHJldHVybiBhTWF0Lm11bHRpcGx5KCAuLi5iTWF0cyApO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBHZW5lcmF0ZSBhIHRyYW5zbGF0aW9uIG1hdHJpeC5cbiAgICogQHBhcmFtIHZlY3RvciBUcmFuc2xhdGlvblxuICAgKi9cbiAgcHVibGljIHN0YXRpYyB0cmFuc2xhdGUoIHZlY3RvcjogVmVjdG9yMyApOiBNYXRyaXg0IHtcbiAgICByZXR1cm4gbmV3IE1hdHJpeDQoIFtcbiAgICAgIDEsIDAsIDAsIDAsXG4gICAgICAwLCAxLCAwLCAwLFxuICAgICAgMCwgMCwgMSwgMCxcbiAgICAgIHZlY3Rvci54LCB2ZWN0b3IueSwgdmVjdG9yLnosIDFcbiAgICBdICk7XG4gIH1cblxuICAvKipcbiAgICogR2VuZXJhdGUgYSAzZCBzY2FsaW5nIG1hdHJpeC5cbiAgICogQHBhcmFtIHZlY3RvciBTY2FsZVxuICAgKi9cbiAgcHVibGljIHN0YXRpYyBzY2FsZSggdmVjdG9yOiBWZWN0b3IzICk6IE1hdHJpeDQge1xuICAgIHJldHVybiBuZXcgTWF0cml4NCggW1xuICAgICAgdmVjdG9yLngsIDAsIDAsIDAsXG4gICAgICAwLCB2ZWN0b3IueSwgMCwgMCxcbiAgICAgIDAsIDAsIHZlY3Rvci56LCAwLFxuICAgICAgMCwgMCwgMCwgMVxuICAgIF0gKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZW5lcmF0ZSBhIDNkIHNjYWxpbmcgbWF0cml4IGJ5IGEgc2NhbGFyLlxuICAgKiBAcGFyYW0gdmVjdG9yIFNjYWxlXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIHNjYWxlU2NhbGFyKCBzY2FsYXI6IG51bWJlciApOiBNYXRyaXg0IHtcbiAgICByZXR1cm4gbmV3IE1hdHJpeDQoIFtcbiAgICAgIHNjYWxhciwgMCwgMCwgMCxcbiAgICAgIDAsIHNjYWxhciwgMCwgMCxcbiAgICAgIDAsIDAsIHNjYWxhciwgMCxcbiAgICAgIDAsIDAsIDAsIDFcbiAgICBdICk7XG4gIH1cblxuICAvKipcbiAgICogR2VuZXJhdGUgYSAzZCByb3RhdGlvbiBtYXRyaXgsIHJvdGF0ZXMgYXJvdW5kIHggYXhpcy5cbiAgICogQHBhcmFtIHZlY3RvciBTY2FsZVxuICAgKi9cbiAgcHVibGljIHN0YXRpYyByb3RhdGVYKCB0aGV0YTogbnVtYmVyICk6IE1hdHJpeDQge1xuICAgIHJldHVybiBuZXcgTWF0cml4NCggW1xuICAgICAgMSwgMCwgMCwgMCxcbiAgICAgIDAsIE1hdGguY29zKCB0aGV0YSApLCAtTWF0aC5zaW4oIHRoZXRhICksIDAsXG4gICAgICAwLCBNYXRoLnNpbiggdGhldGEgKSwgTWF0aC5jb3MoIHRoZXRhICksIDAsXG4gICAgICAwLCAwLCAwLCAxXG4gICAgXSApO1xuICB9XG5cbiAgLyoqXG4gICAqIEdlbmVyYXRlIGEgM2Qgcm90YXRpb24gbWF0cml4LCByb3RhdGVzIGFyb3VuZCB5IGF4aXMuXG4gICAqIEBwYXJhbSB2ZWN0b3IgU2NhbGVcbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgcm90YXRlWSggdGhldGE6IG51bWJlciApOiBNYXRyaXg0IHtcbiAgICByZXR1cm4gbmV3IE1hdHJpeDQoIFtcbiAgICAgIE1hdGguY29zKCB0aGV0YSApLCAwLCBNYXRoLnNpbiggdGhldGEgKSwgMCxcbiAgICAgIDAsIDEsIDAsIDAsXG4gICAgICAtTWF0aC5zaW4oIHRoZXRhICksIDAsIE1hdGguY29zKCB0aGV0YSApLCAwLFxuICAgICAgMCwgMCwgMCwgMVxuICAgIF0gKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZW5lcmF0ZSBhIDNkIHJvdGF0aW9uIG1hdHJpeCwgcm90YXRlcyBhcm91bmQgeiBheGlzLlxuICAgKiBAcGFyYW0gdmVjdG9yIFNjYWxlXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIHJvdGF0ZVooIHRoZXRhOiBudW1iZXIgKTogTWF0cml4NCB7XG4gICAgcmV0dXJuIG5ldyBNYXRyaXg0KCBbXG4gICAgICBNYXRoLmNvcyggdGhldGEgKSwgLU1hdGguc2luKCB0aGV0YSApLCAwLCAwLFxuICAgICAgTWF0aC5zaW4oIHRoZXRhICksIE1hdGguY29zKCB0aGV0YSApLCAwLCAwLFxuICAgICAgMCwgMCwgMSwgMCxcbiAgICAgIDAsIDAsIDAsIDFcbiAgICBdICk7XG4gIH1cblxuICAvKipcbiAgICogR2VuZXJhdGUgYSBcIkxvb2tBdFwiIG1hdHJpeC5cbiAgICpcbiAgICogU2VlIGFsc286IHtAbGluayBsb29rQXRJbnZlcnNlfVxuICAgKi9cbiAgcHVibGljIHN0YXRpYyBsb29rQXQoXG4gICAgcG9zaXRpb246IFZlY3RvcjMsXG4gICAgdGFyZ2V0ID0gbmV3IFZlY3RvcjMoIFsgMC4wLCAwLjAsIDAuMCBdICksXG4gICAgdXAgPSBuZXcgVmVjdG9yMyggWyAwLjAsIDEuMCwgMC4wIF0gKSxcbiAgICByb2xsID0gMC4wXG4gICk6IE1hdHJpeDQge1xuICAgIGNvbnN0IGRpciA9IHBvc2l0aW9uLnN1YiggdGFyZ2V0ICkubm9ybWFsaXplZDtcbiAgICBsZXQgc2lkID0gdXAuY3Jvc3MoIGRpciApLm5vcm1hbGl6ZWQ7XG4gICAgbGV0IHRvcCA9IGRpci5jcm9zcyggc2lkICk7XG4gICAgc2lkID0gc2lkLnNjYWxlKCBNYXRoLmNvcyggcm9sbCApICkuYWRkKCB0b3Auc2NhbGUoIE1hdGguc2luKCByb2xsICkgKSApO1xuICAgIHRvcCA9IGRpci5jcm9zcyggc2lkICk7XG5cbiAgICByZXR1cm4gbmV3IE1hdHJpeDQoIFtcbiAgICAgIHNpZC54LCBzaWQueSwgc2lkLnosIDAuMCxcbiAgICAgIHRvcC54LCB0b3AueSwgdG9wLnosIDAuMCxcbiAgICAgIGRpci54LCBkaXIueSwgZGlyLnosIDAuMCxcbiAgICAgIHBvc2l0aW9uLngsIHBvc2l0aW9uLnksIHBvc2l0aW9uLnosIDEuMFxuICAgIF0gKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZW5lcmF0ZSBhbiBpbnZlcnNlIG9mIFwiTG9va0F0XCIgbWF0cml4LiBHb29kIGZvciBjcmVhdGluZyBhIHZpZXcgbWF0cml4LlxuICAgKlxuICAgKiBTZWUgYWxzbzoge0BsaW5rIGxvb2tBdH1cbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgbG9va0F0SW52ZXJzZShcbiAgICBwb3NpdGlvbjogVmVjdG9yMyxcbiAgICB0YXJnZXQgPSBuZXcgVmVjdG9yMyggWyAwLjAsIDAuMCwgMC4wIF0gKSxcbiAgICB1cCA9IG5ldyBWZWN0b3IzKCBbIDAuMCwgMS4wLCAwLjAgXSApLFxuICAgIHJvbGwgPSAwLjBcbiAgKTogTWF0cml4NCB7XG4gICAgY29uc3QgZGlyID0gcG9zaXRpb24uc3ViKCB0YXJnZXQgKS5ub3JtYWxpemVkO1xuICAgIGxldCBzaWQgPSB1cC5jcm9zcyggZGlyICkubm9ybWFsaXplZDtcbiAgICBsZXQgdG9wID0gZGlyLmNyb3NzKCBzaWQgKTtcbiAgICBzaWQgPSBzaWQuc2NhbGUoIE1hdGguY29zKCByb2xsICkgKS5hZGQoIHRvcC5zY2FsZSggTWF0aC5zaW4oIHJvbGwgKSApICk7XG4gICAgdG9wID0gZGlyLmNyb3NzKCBzaWQgKTtcblxuICAgIHJldHVybiBuZXcgTWF0cml4NCggW1xuICAgICAgc2lkLngsIHRvcC54LCBkaXIueCwgMC4wLFxuICAgICAgc2lkLnksIHRvcC55LCBkaXIueSwgMC4wLFxuICAgICAgc2lkLnosIHRvcC56LCBkaXIueiwgMC4wLFxuICAgICAgLXNpZC54ICogcG9zaXRpb24ueCAtIHNpZC55ICogcG9zaXRpb24ueSAtIHNpZC56ICogcG9zaXRpb24ueixcbiAgICAgIC10b3AueCAqIHBvc2l0aW9uLnggLSB0b3AueSAqIHBvc2l0aW9uLnkgLSB0b3AueiAqIHBvc2l0aW9uLnosXG4gICAgICAtZGlyLnggKiBwb3NpdGlvbi54IC0gZGlyLnkgKiBwb3NpdGlvbi55IC0gZGlyLnogKiBwb3NpdGlvbi56LFxuICAgICAgMS4wXG4gICAgXSApO1xuICB9XG5cbiAgLyoqXG4gICAqIEdlbmVyYXRlIGEgXCJQZXJzcGVjdGl2ZVwiIHByb2plY3Rpb24gbWF0cml4LlxuICAgKiBJdCB3b24ndCBpbmNsdWRlIGFzcGVjdCFcbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgcGVyc3BlY3RpdmUoIGZvdiA9IDQ1LjAsIG5lYXIgPSAwLjAxLCBmYXIgPSAxMDAuMCApOiBNYXRyaXg0IHtcbiAgICBjb25zdCBwID0gMS4wIC8gTWF0aC50YW4oIGZvdiAqIE1hdGguUEkgLyAzNjAuMCApO1xuICAgIGNvbnN0IGQgPSAoIGZhciAtIG5lYXIgKTtcbiAgICByZXR1cm4gbmV3IE1hdHJpeDQoIFtcbiAgICAgIHAsIDAuMCwgMC4wLCAwLjAsXG4gICAgICAwLjAsIHAsIDAuMCwgMC4wLFxuICAgICAgMC4wLCAwLjAsIC0oIGZhciArIG5lYXIgKSAvIGQsIC0xLjAsXG4gICAgICAwLjAsIDAuMCwgLTIgKiBmYXIgKiBuZWFyIC8gZCwgMC4wXG4gICAgXSApO1xuICB9XG5cbiAgLyoqXG4gICAqIERlY29tcG9zZSB0aGlzIG1hdHJpeCBpbnRvIGEgcG9zaXRpb24sIGEgc2NhbGUsIGFuZCBhIHJvdGF0aW9uLlxuICAgKiBZb2lua2VkIGZyb20gVGhyZWUuanMuXG4gICAqL1xuICBwdWJsaWMgZGVjb21wb3NlKCk6IHsgcG9zaXRpb246IFZlY3RvcjM7IHNjYWxlOiBWZWN0b3IzOyByb3RhdGlvbjogUXVhdGVybmlvbiB9IHtcbiAgICBjb25zdCBtID0gdGhpcy5lbGVtZW50cztcblxuICAgIGxldCBzeCA9IG5ldyBWZWN0b3IzKCBbIG1bIDAgXSwgbVsgMSBdLCBtWyAyIF0gXSApLmxlbmd0aDtcbiAgICBjb25zdCBzeSA9IG5ldyBWZWN0b3IzKCBbIG1bIDQgXSwgbVsgNSBdLCBtWyA2IF0gXSApLmxlbmd0aDtcbiAgICBjb25zdCBzeiA9IG5ldyBWZWN0b3IzKCBbIG1bIDggXSwgbVsgOSBdLCBtWyAxMCBdIF0gKS5sZW5ndGg7XG5cbiAgICAvLyBpZiBkZXRlcm1pbmUgaXMgbmVnYXRpdmUsIHdlIG5lZWQgdG8gaW52ZXJ0IG9uZSBzY2FsZVxuICAgIGNvbnN0IGRldCA9IHRoaXMuZGV0ZXJtaW5hbnQ7XG4gICAgaWYgKCBkZXQgPCAwICkgeyBzeCA9IC1zeDsgfVxuXG4gICAgY29uc3QgaW52U3ggPSAxLjAgLyBzeDtcbiAgICBjb25zdCBpbnZTeSA9IDEuMCAvIHN5O1xuICAgIGNvbnN0IGludlN6ID0gMS4wIC8gc3o7XG5cbiAgICBjb25zdCByb3RhdGlvbk1hdHJpeCA9IHRoaXMuY2xvbmUoKTtcblxuICAgIHJvdGF0aW9uTWF0cml4LmVsZW1lbnRzWyAwIF0gKj0gaW52U3g7XG4gICAgcm90YXRpb25NYXRyaXguZWxlbWVudHNbIDEgXSAqPSBpbnZTeDtcbiAgICByb3RhdGlvbk1hdHJpeC5lbGVtZW50c1sgMiBdICo9IGludlN4O1xuXG4gICAgcm90YXRpb25NYXRyaXguZWxlbWVudHNbIDQgXSAqPSBpbnZTeTtcbiAgICByb3RhdGlvbk1hdHJpeC5lbGVtZW50c1sgNSBdICo9IGludlN5O1xuICAgIHJvdGF0aW9uTWF0cml4LmVsZW1lbnRzWyA2IF0gKj0gaW52U3k7XG5cbiAgICByb3RhdGlvbk1hdHJpeC5lbGVtZW50c1sgOCBdICo9IGludlN6O1xuICAgIHJvdGF0aW9uTWF0cml4LmVsZW1lbnRzWyA5IF0gKj0gaW52U3o7XG4gICAgcm90YXRpb25NYXRyaXguZWxlbWVudHNbIDEwIF0gKj0gaW52U3o7XG5cbiAgICByZXR1cm4ge1xuICAgICAgcG9zaXRpb246IG5ldyBWZWN0b3IzKCBbIG1bIDEyIF0sIG1bIDEzIF0sIG1bIDE0IF0gXSApLFxuICAgICAgc2NhbGU6IG5ldyBWZWN0b3IzKCBbIHN4LCBzeSwgc3ogXSApLFxuICAgICAgcm90YXRpb246IFF1YXRlcm5pb24uZnJvbU1hdHJpeCggcm90YXRpb25NYXRyaXggKVxuICAgIH07XG4gIH1cblxuICAvKipcbiAgICogQ29tcG9zZSBhIG1hdHJpeCBvdXQgb2YgcG9zaXRpb24sIHNjYWxlLCBhbmQgcm90YXRpb24uXG4gICAqIFlvaW5rZWQgZnJvbSBUaHJlZS5qcy5cbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgY29tcG9zZSggcG9zaXRpb246IFZlY3RvcjMsIHJvdGF0aW9uOiBRdWF0ZXJuaW9uLCBzY2FsZTogVmVjdG9yMyApOiBNYXRyaXg0IHtcbiAgICBjb25zdCB4ID0gcm90YXRpb24ueCwgeSA9IHJvdGF0aW9uLnksIHogPSByb3RhdGlvbi56LCB3ID0gcm90YXRpb24udztcbiAgICBjb25zdCB4MiA9IHggKyB4LFx0eTIgPSB5ICsgeSwgejIgPSB6ICsgejtcbiAgICBjb25zdCB4eCA9IHggKiB4MiwgeHkgPSB4ICogeTIsIHh6ID0geCAqIHoyO1xuICAgIGNvbnN0IHl5ID0geSAqIHkyLCB5eiA9IHkgKiB6MiwgenogPSB6ICogejI7XG4gICAgY29uc3Qgd3ggPSB3ICogeDIsIHd5ID0gdyAqIHkyLCB3eiA9IHcgKiB6MjtcbiAgICBjb25zdCBzeCA9IHNjYWxlLngsIHN5ID0gc2NhbGUueSwgc3ogPSBzY2FsZS56O1xuXG4gICAgcmV0dXJuIG5ldyBNYXRyaXg0KCBbXG4gICAgICAoIDEuMCAtICggeXkgKyB6eiApICkgKiBzeCxcbiAgICAgICggeHkgKyB3eiApICogc3gsXG4gICAgICAoIHh6IC0gd3kgKSAqIHN4LFxuICAgICAgMC4wLFxuXG4gICAgICAoIHh5IC0gd3ogKSAqIHN5LFxuICAgICAgKCAxLjAgLSAoIHh4ICsgenogKSApICogc3ksXG4gICAgICAoIHl6ICsgd3ggKSAqIHN5LFxuICAgICAgMC4wLFxuXG4gICAgICAoIHh6ICsgd3kgKSAqIHN6LFxuICAgICAgKCB5eiAtIHd4ICkgKiBzeixcbiAgICAgICggMS4wIC0gKCB4eCArIHl5ICkgKSAqIHN6LFxuICAgICAgMC4wLFxuXG4gICAgICBwb3NpdGlvbi54LFxuICAgICAgcG9zaXRpb24ueSxcbiAgICAgIHBvc2l0aW9uLnosXG4gICAgICAxLjBcbiAgICBdICk7XG4gIH1cbn1cbiIsImltcG9ydCB7IE1hdHJpeDQgfSBmcm9tICcuL01hdHJpeDQnO1xuaW1wb3J0IHsgVmVjdG9yIH0gZnJvbSAnLi9WZWN0b3InO1xuXG5leHBvcnQgdHlwZSByYXdWZWN0b3I0ID0gWyBudW1iZXIsIG51bWJlciwgbnVtYmVyLCBudW1iZXIgXTtcblxuLyoqXG4gKiBBIFZlY3RvcjMuXG4gKi9cbmV4cG9ydCBjbGFzcyBWZWN0b3I0IGV4dGVuZHMgVmVjdG9yPFZlY3RvcjQ+IHtcbiAgcHVibGljIGVsZW1lbnRzOiByYXdWZWN0b3I0O1xuXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggdjogcmF3VmVjdG9yNCA9IFsgMC4wLCAwLjAsIDAuMCwgMC4wIF0gKSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLmVsZW1lbnRzID0gdjtcbiAgfVxuXG4gIC8qKlxuICAgKiBBbiB4IGNvbXBvbmVudCBvZiB0aGlzLlxuICAgKi9cbiAgcHVibGljIGdldCB4KCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuZWxlbWVudHNbIDAgXTtcbiAgfVxuXG4gIHB1YmxpYyBzZXQgeCggeDogbnVtYmVyICkge1xuICAgIHRoaXMuZWxlbWVudHNbIDAgXSA9IHg7XG4gIH1cblxuICAvKipcbiAgICogQSB5IGNvbXBvbmVudCBvZiB0aGlzLlxuICAgKi9cbiAgcHVibGljIGdldCB5KCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuZWxlbWVudHNbIDEgXTtcbiAgfVxuXG4gIHB1YmxpYyBzZXQgeSggeTogbnVtYmVyICkge1xuICAgIHRoaXMuZWxlbWVudHNbIDEgXSA9IHk7XG4gIH1cblxuICAvKipcbiAgICogQSB6IGNvbXBvbmVudCBvZiB0aGlzLlxuICAgKi9cbiAgcHVibGljIGdldCB6KCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuZWxlbWVudHNbIDIgXTtcbiAgfVxuXG4gIHB1YmxpYyBzZXQgeiggejogbnVtYmVyICkge1xuICAgIHRoaXMuZWxlbWVudHNbIDIgXSA9IHo7XG4gIH1cblxuICAvKipcbiAgICogQSB3IGNvbXBvbmVudCBvZiB0aGlzLlxuICAgKi9cbiAgcHVibGljIGdldCB3KCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuZWxlbWVudHNbIDMgXTtcbiAgfVxuXG4gIHB1YmxpYyBzZXQgdyggejogbnVtYmVyICkge1xuICAgIHRoaXMuZWxlbWVudHNbIDMgXSA9IHo7XG4gIH1cblxuICBwdWJsaWMgdG9TdHJpbmcoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gYFZlY3RvcjQoICR7IHRoaXMueC50b0ZpeGVkKCAzICkgfSwgJHsgdGhpcy55LnRvRml4ZWQoIDMgKSB9LCAkeyB0aGlzLnoudG9GaXhlZCggMyApIH0sICR7IHRoaXMudy50b0ZpeGVkKCAzICkgfSApYDtcbiAgfVxuXG4gIC8qKlxuICAgKiBNdWx0aXBseSB0aGlzIHZlY3RvciAod2l0aCBhbiBpbXBsaWNpdCAxIGluIHRoZSA0dGggZGltZW5zaW9uKSBieSBtLlxuICAgKi9cbiAgcHVibGljIGFwcGx5TWF0cml4NCggbWF0cml4OiBNYXRyaXg0ICk6IFZlY3RvcjQge1xuICAgIGNvbnN0IG0gPSBtYXRyaXguZWxlbWVudHM7XG5cbiAgICByZXR1cm4gbmV3IFZlY3RvcjQoIFtcbiAgICAgIG1bIDAgXSAqIHRoaXMueCArIG1bIDQgXSAqIHRoaXMueSArIG1bIDggXSAqIHRoaXMueiArIG1bIDEyIF0gKiB0aGlzLncsXG4gICAgICBtWyAxIF0gKiB0aGlzLnggKyBtWyA1IF0gKiB0aGlzLnkgKyBtWyA5IF0gKiB0aGlzLnogKyBtWyAxMyBdICogdGhpcy53LFxuICAgICAgbVsgMiBdICogdGhpcy54ICsgbVsgNiBdICogdGhpcy55ICsgbVsgMTAgXSAqIHRoaXMueiArIG1bIDE0IF0gKiB0aGlzLncsXG4gICAgICBtWyAzIF0gKiB0aGlzLnggKyBtWyA3IF0gKiB0aGlzLnkgKyBtWyAxMSBdICogdGhpcy56ICsgbVsgMTUgXSAqIHRoaXMud1xuICAgIF0gKTtcbiAgfVxuXG4gIHByb3RlY3RlZCBfX25ldyggdjogcmF3VmVjdG9yNCApOiBWZWN0b3I0IHtcbiAgICByZXR1cm4gbmV3IFZlY3RvcjQoIHYgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBWZWN0b3I0KCAwLjAsIDAuMCwgMC4wLCAwLjAgKVxuICAgKi9cbiAgcHVibGljIHN0YXRpYyBnZXQgemVybygpOiBWZWN0b3I0IHtcbiAgICByZXR1cm4gbmV3IFZlY3RvcjQoIFsgMC4wLCAwLjAsIDAuMCwgMC4wIF0gKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBWZWN0b3I0KCAxLjAsIDEuMCwgMS4wLCAxLjAgKVxuICAgKi9cbiAgcHVibGljIHN0YXRpYyBnZXQgb25lKCk6IFZlY3RvcjQge1xuICAgIHJldHVybiBuZXcgVmVjdG9yNCggWyAxLjAsIDEuMCwgMS4wLCAxLjAgXSApO1xuICB9XG59XG4iLCIvKipcbiAqIFVzZWZ1bCBmb3Igc3dhcCBidWZmZXJcbiAqL1xuZXhwb3J0IGNsYXNzIFN3YXA8VD4ge1xuICBwdWJsaWMgaTogVDtcbiAgcHVibGljIG86IFQ7XG5cbiAgcHVibGljIGNvbnN0cnVjdG9yKCBhOiBULCBiOiBUICkge1xuICAgIHRoaXMuaSA9IGE7XG4gICAgdGhpcy5vID0gYjtcbiAgfVxuXG4gIHB1YmxpYyBzd2FwKCk6IHZvaWQge1xuICAgIGNvbnN0IGkgPSB0aGlzLmk7XG4gICAgdGhpcy5pID0gdGhpcy5vO1xuICAgIHRoaXMubyA9IGk7XG4gIH1cbn1cbiIsImltcG9ydCB7IEhpc3RvcnlNZWFuQ2FsY3VsYXRvciB9IGZyb20gJy4uL0hpc3RvcnlNZWFuQ2FsY3VsYXRvci9IaXN0b3J5TWVhbkNhbGN1bGF0b3InO1xuXG5leHBvcnQgY2xhc3MgVGFwVGVtcG8ge1xuICBwcml2YXRlIF9fYnBtID0gMC4wO1xuICBwcml2YXRlIF9fbGFzdFRhcCA9IDAuMDtcbiAgcHJpdmF0ZSBfX2xhc3RCZWF0ID0gMC4wO1xuICBwcml2YXRlIF9fbGFzdFRpbWUgPSAwLjA7XG4gIHByaXZhdGUgX19jYWxjOiBIaXN0b3J5TWVhbkNhbGN1bGF0b3IgPSBuZXcgSGlzdG9yeU1lYW5DYWxjdWxhdG9yKCAxNiApO1xuXG4gIHB1YmxpYyBnZXQgYmVhdER1cmF0aW9uKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIDYwLjAgLyB0aGlzLl9fYnBtO1xuICB9XG5cbiAgcHVibGljIGdldCBicG0oKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5fX2JwbTtcbiAgfVxuXG4gIHB1YmxpYyBzZXQgYnBtKCBicG06IG51bWJlciApIHtcbiAgICB0aGlzLl9fbGFzdEJlYXQgPSB0aGlzLmJlYXQ7XG4gICAgdGhpcy5fX2xhc3RUaW1lID0gcGVyZm9ybWFuY2Uubm93KCk7XG4gICAgdGhpcy5fX2JwbSA9IGJwbTtcbiAgfVxuXG4gIHB1YmxpYyBnZXQgYmVhdCgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLl9fbGFzdEJlYXQgKyAoIHBlcmZvcm1hbmNlLm5vdygpIC0gdGhpcy5fX2xhc3RUaW1lICkgKiAwLjAwMSAvIHRoaXMuYmVhdER1cmF0aW9uO1xuICB9XG5cbiAgcHVibGljIHJlc2V0KCk6IHZvaWQge1xuICAgIHRoaXMuX19jYWxjLnJlc2V0KCk7XG4gIH1cblxuICBwdWJsaWMgbnVkZ2UoIGFtb3VudDogbnVtYmVyICk6IHZvaWQge1xuICAgIHRoaXMuX19sYXN0QmVhdCA9IHRoaXMuYmVhdCArIGFtb3VudDtcbiAgICB0aGlzLl9fbGFzdFRpbWUgPSBwZXJmb3JtYW5jZS5ub3coKTtcbiAgfVxuXG4gIHB1YmxpYyB0YXAoKTogdm9pZCB7XG4gICAgY29uc3Qgbm93ID0gcGVyZm9ybWFuY2Uubm93KCk7XG4gICAgY29uc3QgZGVsdGEgPSAoIG5vdyAtIHRoaXMuX19sYXN0VGFwICkgKiAwLjAwMTtcblxuICAgIGlmICggMi4wIDwgZGVsdGEgKSB7XG4gICAgICB0aGlzLnJlc2V0KCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX19jYWxjLnB1c2goIGRlbHRhICk7XG4gICAgICB0aGlzLl9fYnBtID0gNjAuMCAvICggdGhpcy5fX2NhbGMubWVhbiApO1xuICAgIH1cblxuICAgIHRoaXMuX19sYXN0VGFwID0gbm93O1xuICAgIHRoaXMuX19sYXN0VGltZSA9IG5vdztcbiAgICB0aGlzLl9fbGFzdEJlYXQgPSAwLjA7XG4gIH1cbn1cbiIsImV4cG9ydCBjbGFzcyBYb3JzaGlmdCB7XG4gIHB1YmxpYyBzZWVkOiBudW1iZXI7XG5cbiAgcHVibGljIGNvbnN0cnVjdG9yKCBzZWVkPzogbnVtYmVyICkge1xuICAgIHRoaXMuc2VlZCA9IHNlZWQgfHwgMTtcbiAgfVxuXG4gIHB1YmxpYyBnZW4oIHNlZWQ/OiBudW1iZXIgKTogbnVtYmVyIHtcbiAgICBpZiAoIHNlZWQgKSB7XG4gICAgICB0aGlzLnNlZWQgPSBzZWVkO1xuICAgIH1cblxuICAgIHRoaXMuc2VlZCA9IHRoaXMuc2VlZCBeICggdGhpcy5zZWVkIDw8IDEzICk7XG4gICAgdGhpcy5zZWVkID0gdGhpcy5zZWVkIF4gKCB0aGlzLnNlZWQgPj4+IDE3ICk7XG4gICAgdGhpcy5zZWVkID0gdGhpcy5zZWVkIF4gKCB0aGlzLnNlZWQgPDwgNSApO1xuICAgIHJldHVybiB0aGlzLnNlZWQgLyBNYXRoLnBvdyggMiwgMzIgKSArIDAuNTtcbiAgfVxuXG4gIHB1YmxpYyBzZXQoIHNlZWQ/OiBudW1iZXIgKTogdm9pZCB7XG4gICAgdGhpcy5zZWVkID0gc2VlZCB8fCB0aGlzLnNlZWQgfHwgMTtcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBYb3JzaGlmdDtcbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztJQUFBO2FBRWdCLFlBQVksQ0FDMUIsT0FBZSxFQUNmLEtBQXdCO1FBRXhCLElBQUksS0FBSyxHQUFHLENBQUMsQ0FBQztRQUNkLElBQUksR0FBRyxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUM7UUFFdkIsT0FBUSxLQUFLLEdBQUcsR0FBRyxFQUFHO1lBQ3BCLElBQU0sTUFBTSxHQUFHLENBQUUsS0FBSyxHQUFHLEdBQUcsS0FBTSxDQUFDLENBQUM7WUFDcEMsSUFBSyxLQUFLLENBQUUsTUFBTSxDQUFFLEdBQUcsT0FBTyxFQUFHO2dCQUMvQixLQUFLLEdBQUcsTUFBTSxHQUFHLENBQUMsQ0FBQzthQUNwQjtpQkFBTTtnQkFDTCxHQUFHLEdBQUcsTUFBTSxDQUFDO2FBQ2Q7U0FDRjtRQUVELE9BQU8sS0FBSyxDQUFDO0lBQ2Y7O0lDbkJBOzs7UUFHYSxtQkFBbUIsR0FBRyxDQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRztJQUVsRTs7O1FBR2Esc0JBQXNCLEdBQUcsQ0FBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFHO0lBRWpGOzs7UUFHYSwwQkFBMEIsR0FBRyxDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFF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Q0FBQyxDQUFHLENBQUMsQ0FBRSxFQUFFLEdBQUcsR0FBRyxDQUFDLENBQUcsQ0FBQyxDQUFFLEVBQUUsR0FBRyxHQUFHLENBQUMsQ0FBRSxFQUFFLENBQUUsRUFBRSxHQUFHLEdBQUcsQ0FBQyxDQUFFLEVBQUUsQ0FBRSxFQUMxRCxHQUFHLEdBQUcsQ0FBQyxDQUFFLEVBQUUsQ0FBRSxFQUFFLEdBQUcsR0FBRyxDQUFDLENBQUUsRUFBRSxDQUFFLEVBQUUsR0FBRyxHQUFHLENBQUMsQ0FBRSxFQUFFLENBQUUsRUFBRSxHQUFHLEdBQUcsQ0FBQyxDQUFFLEVBQUUsQ0FBRSxFQUMxRCxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxFQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEVBQ3pELEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEVBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsRUFDekQsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsRUFBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxFQUN6RCxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxFQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEVBQ3pELEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEVBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsRUFDekQsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsRUFBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDO2dCQUU1RCxPQUFPLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDO2FBQzlFOzs7V0FBQTtRQUtELHNCQUFXLDRCQUFPOzs7O2lCQUFsQjtnQkFDRSxJQUFNLENBQUMsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDO2dCQUN4QixJQUNFLEdBQUcsR0FBRyxDQUFDLENBQUcsQ0FBQyxDQUFFLEVBQUUsR0FBRyxHQUFHLENBQUMsQ0FBRyxDQUFDLENBQUUsRUFBRSxHQUFHLEdBQUcsQ0FBQyxDQUFHLENBQUMsQ0FBRSxFQUFFLEdBQUcsR0FBRyxDQUFDLENBQUcsQ0FBQyxDQUFFLEVBQzFELEdBQUcsR0FBRyxDQUFDLENBQUcsQ0FBQyxDQUFFLEVBQUUsR0FBRyxHQUFHLENBQUMsQ0FBRyxDQUFDLENBQUUsRUFBRSxHQUFHLEdBQUcsQ0FBQyxDQUFHLENBQUMsQ0FBRSxFQUFFLEdBQUcsR0FBRyxDQUFDLENBQUcsQ0FBQyxDQUFFLEVBQzFELEdBQUcsR0FBRyxDQUFDLENBQUcsQ0FBQyxDQUFFLEVBQUUsR0FBRyxHQUFHLENBQUMsQ0FBRyxDQUFDLENBQUUsRUFBRSxHQUFHLEdBQUcsQ0FBQyxDQUFFLEVBQUUsQ0FBRSxFQUFFLEdBQUcsR0FBRyxDQUFDLENBQUUsRUFBRSxDQUFFLEVBQzFELEdBQUcsR0FBRyxDQUFDLENBQUUsRUFBRSxDQUFFLEVBQUUsR0FBRyxHQUFHLENBQUMsQ0FBRSxFQUFFLENBQUUsRUFBRSxHQUFHLEdBQUcsQ0FBQyxDQUFFLEVBQUUsQ0FBRSxFQUFFLEdBQUcsR0FBRyxDQUFDLENBQUUsRUFBRSxDQUFFLEVBQzFELEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEVBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsRUFDekQsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsRUFBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxFQUN6RCxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxFQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEVBQ3pELEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEVBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsRUFDekQsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsRUFBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxFQUN6RCxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxFQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUM7Z0JBRTVELElBQU0sR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDO2dCQUVsRixJQUFLLEdBQUcsS0FBSyxHQUFHLEVBQUc7b0JBQUUsT0FBTyxJQUFJLENBQUM7aUJBQUU7Z0JBRW5DLElBQU0sTUFBTSxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUM7Z0JBRXpCLE9BQU8sSUFBSSxPQUFPLENBQUU7b0JBQ2xCLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRztvQkFDakMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHO29CQUNqQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUc7b0JBQ2pDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRztvQkFDakMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHO29CQUNqQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUc7b0JBQ2pDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRztvQkFDakMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHO29CQUNqQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUc7b0JBQ2pDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRztvQkFDakMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHO29CQUNqQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUc7b0JBQ2pDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRztvQkFDakMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHO29CQUNqQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUc7b0JBQ2pDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRztpQkFDbEMsQ0FBQyxHQUFHLENBQUUsVUFBRSxDQUFDLElBQU0sT0FBQSxDQUFDLEdBQUcsTUFBTSxHQUFBLENBQWdC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QyxDQUFFLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsRUFBRSxDQUFFLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxFQUFFLENBQUUsR0FBRyxDQUFDLENBQUUsQ0FBQyxDQUFFO2dCQUV2RSxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsRUFBRSxDQUFFLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRTtnQkFDdEUsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLEVBQUUsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUU7Z0JBQ3RFLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsRUFBRSxDQUFFLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxFQUFFLENBQUUsR0FBRyxDQUFDLENBQUUsQ0FBQyxDQUFFO2dCQUN2RSxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLEVBQUUsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsRUFBRSxDQUFFLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRTtnQkFFdkUsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsRUFBRSxDQUFFLEdBQUcsQ0FBQyxDQUFFLEVBQUUsQ0FBRSxHQUFHLENBQUMsQ0FBRSxFQUFFLENBQUU7Z0JBQ3hFLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLEVBQUUsQ0FBRSxHQUFHLENBQUMsQ0FBRSxFQUFFLENBQUUsR0FBRyxDQUFDLENBQUUsRUFBRSxDQUFFO2dCQUN4RSxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLEVBQUUsQ0FBRSxHQUFHLENBQUMsQ0FBRSxFQUFFLENBQUUsR0FBRyxDQUFDLENBQUUsRUFBRSxDQUFFLEdBQUcsQ0FBQyxDQUFFLEVBQUUsQ0FBRTtnQkFDekUsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxFQUFFLENBQUUsR0FBRyxDQUFDLENBQUUsRUFBRSxDQUFFLEdBQUcsQ0FBQyxDQUFFLEVBQUUsQ0FBRSxHQUFHLENBQUMsQ0FBRSxFQUFFLENBQUU7Z0JBRXpFLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsRUFBRSxDQUFFLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxFQUFFLENBQUUsR0FBRyxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLEVBQUUsQ0FBRSxHQUFHLENBQUMsQ0FBRSxFQUFFLENBQUUsR0FBRyxDQUFDLENBQUUsRUFBRSxDQUFFO2dCQUMxRSxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLEVBQUUsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsRUFBRSxDQUFFLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxFQUFFLENBQUUsR0FBRyxDQUFDLENBQUUsRUFBRSxDQUFFLEdBQUcsQ0FBQyxDQUFFLEVBQUUsQ0FBRTtnQkFDMUUsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxFQUFFLENBQUUsR0FBRyxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLEVBQUUsQ0FBRSxHQUFHLENBQUMsQ0FBRSxFQUFFLENBQUUsR0FBRyxDQUFDLENBQUUsRUFBRSxDQUFFLEdBQUcsQ0FBQyxDQUFFLEVBQUUsQ0FBRSxHQUFHLENBQUMsQ0FBRSxFQUFFLENBQUU7Z0JBQzNFLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsRUFBRSxDQUFFLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxFQUFFLENBQUUsR0FBRyxDQUFDLENBQUUsRUFBRSxDQUFFLEdBQUcsQ0FBQyxDQUFFLEVBQUUsQ0FBRSxHQUFHLENBQUMsQ0FBRSxFQUFFLENBQUUsR0FBRyxDQUFDLENBQUUsRUFBRSxDQUFFO2FBQzVFLENBQUUsQ0FBQztTQUNMOzs7O1FBS00sNkJBQVcsR0FBbEIsVUFBb0IsTUFBYztZQUNoQyxPQUFPLElBQUksT0FBTyxDQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFFLFVBQUUsQ0FBQyxJ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QUUsQ0FBQyxVQUFVLENBQUM7WUFDckMsSUFBSSxHQUFHLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBRSxHQUFHLENBQUUsQ0FBQztZQUMzQixHQUFHLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBRSxJQUFJLENBQUMsR0FBRyxDQUFFLElBQUksQ0FBRSxDQUFFLENBQUMsR0FBRyxDQUFFLEdBQUcsQ0FBQyxLQUFLLENBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBRSxJQUFJLENBQUUsQ0FBRSxDQUFFLENBQUM7WUFDekUsR0FBRyxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUUsR0FBRyxDQUFFLENBQUM7WUFFdkIsT0FBTyxJQUFJLE9BQU8sQ0FBRTtnQkFDbEIsR0FBRyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLEVBQUUsR0FBRztnQkFDeEIsR0FBRyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLEVBQUUsR0FBRztnQkFDeEIsR0FBRyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLEVBQUUsR0FBRztnQkFDeEIsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsR0FBRyxRQUFRLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLEdBQUcsUUFBUSxDQUFDLENBQUM7Z0JBQzdELENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxRQUFRLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLEdBQUcsUUFBUSxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxDQUFDO2dCQUM3RCxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsUUFBUSxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsR0FBRyxRQUFRLENBQUMsQ0FBQztnQkFDN0QsR0FBRzthQUNKLENBQUUsQ0FBQztTQUNMOzs7OztRQU1hLG1CQUFXLEdBQXpCLFVBQTJCLEdBQVUsRUFBRSxJQUFXLEVBQUUsR0FBVztZQUFwQyxvQkFBQSxFQUFBLFVBQVU7WUFBRSxxQkFBQSxFQUFBLFdBQVc7WUFBRSxvQkFBQSxFQUFBLFdBQVc7WUFDN0QsSUFBTSxDQUFDLEdBQUcsR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUUsR0FBRyxHQUFHLElBQUksQ0FBQyxFQUFFLEdBQUcsS0FBSyxDQUFFLENBQUM7WUFDbEQsSUFBTSxDQUFDLElBQUssR0FBRyxHQUFHLElBQUksQ0FBRSxDQUFDO1lBQ3pCLE9BQU8sSUFBSSxPQUFPLENBQUU7Z0JBQ2xCLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUc7Z0JBQ2hCLEdBQUcsRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUc7Z0JBQ2hCLEdBQUcsRUFBRSxHQUFHLEVBQUUsRUFBRyxHQUFHLEdBQUcsSUFBSSxDQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRztnQkFDbkMsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsSUFBSSxHQUFHLENBQUMsRUFBRSxHQUFHO2FBQ25DLENBQUUsQ0FBQztTQUNMOzs7OztRQU1NLDJCQUFTLEdBQWhCO1lBQ0UsSUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQztZQUV4QixJQUFJLEVBQUUsR0FBRyxJQUFJLE9BQU8sQ0FBRSxDQUFFLENBQUMsQ0FBRSxDQUFDLENBQUUsRUFBRSxDQUFDLENBQUUsQ0FBQyxDQUFFLEVBQUUsQ0FBQyxDQUFFLENBQUMsQ0FBRSxDQUFFLENBQUUsQ0FBQyxNQUFNLENBQUM7WUFDMUQsSUFBTSxFQUFFLEdBQUcsSUFBSSxPQUFPLENBQUUsQ0FBRSxDQUFDLENBQUUsQ0FBQyxDQUFFLEVBQUUsQ0FBQyxDQUFFLENBQUMsQ0FBRSxFQUFFLENBQUMsQ0FBRSxDQUFDLENBQUUsQ0FBRSxDQUFFLENBQUMsTUFBTSxDQUFDO1lBQzVELElBQU0sRUFBRSxHQUFHLElBQUksT0FBTyxDQUFFLENBQUUsQ0FBQyxDQUFFLENBQUMsQ0FBRSxFQUFFLENBQUMsQ0FBRSxDQUFDLENBQUUsRUFBRSxDQUFDLENBQUUsRUFBRSxDQUFFLENBQUUsQ0FBRSxDQUFDLE1BQU0sQ0FBQzs7WUFHN0QsSUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQztZQUM3QixJQUFLLEdBQUcsR0FBRyxDQUFDLEVBQUc7Z0JBQUUsRUFBRSxHQUFHLENBQUMsRUFBRSxDQUFDO2FBQUU7WUFFNUIsSUFBTSxLQUFLLEdBQUcsR0FBRyxHQUFHLEVBQUUsQ0FBQztZQUN2QixJQUFNLEtBQUssR0FBRyxHQUFHLEdBQUcsRUFBRSxDQUFDO1lBQ3ZCLElBQU0sS0FBSyxHQUFHLEdBQUcsR0FBRyxFQUFFLENBQUM7WUFFdkIsSUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO1lBRXBDLGNBQWMsQ0FBQyxRQUFRLENBQUUsQ0FBQyxDQUFFLElBQUksS0FBSyxDQUFDO1lBQ3RDLGNBQWMsQ0FBQyxRQUFRLENBQUUsQ0FBQyxDQUFFLElBQUksS0FBSyxDQUFDO1lBQ3RDLGNBQWMsQ0FBQyxRQUFRLENBQUUsQ0FBQyxDQUFFLElBQUksS0FBSyxDQUFDO1lBRXRDLGNBQWMsQ0FBQyxRQUFRLENBQUUsQ0FBQyxDQUFFLElBQUksS0FBSyxDQUFDO1lBQ3RDLGNBQWMsQ0FBQyxRQUFRLENBQUUsQ0FBQyxDQUFFLElBQUksS0FBSyxDQUFDO1lBQ3RDLGNBQWMsQ0FBQyxRQUFRLENBQUUsQ0FBQyxDQUFFLElBQUksS0FBSyxDQUFDO1lBRXRDLGNBQWMsQ0FBQyxRQUFRLENBQUUsQ0FBQyxDQUFFLElBQUksS0FBSyxDQUFDO1lBQ3RDLGNBQWMsQ0FBQyxRQUFRLENBQUUsQ0FBQyxDQUFFLElBQUksS0FBSyxDQUFDO1lBQ3RDLGNBQWMsQ0FBQyxRQUFRLENBQUUsRUFBRSxDQUFFLElBQUksS0FBSyxDQUFDO1lBRXZDLE9BQU87Z0JBQ0wsUUFBUSxFQUFFLElBQUksT0FBTyxDQUFFLENBQUUsQ0FBQyxDQUFFLEVBQUUsQ0FBRSxFQUFFLENBQUMsQ0FBRSxFQUFFLENBQUUsRUFBRSxDQUFDLENBQUUsRUFBRSxDQUFFLENBQUUsQ0FBRTtnQkFDdEQsS0FBSyxFQUFFLElBQUksT0FBTyxDQUFFLENBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUUsQ0FBRTtnQkFDcEMsUUFBUSxFQUFFLFVBQVUsQ0FBQyxVQUFVLENBQUUsY0FBYyxDQUFFO2FBQ2xELENBQUM7U0FDSDs7Ozs7UUFNYSxlQUFPLEdBQXJCLFVBQXVCLFFBQWlCLEVBQUUsUUFBb0IsRUFBRSxLQUFjO1lBQzVFLElBQU0sQ0FBQyxHQUFHLFFBQVEsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxDQUFDLENBQUM7WUFDckUsSUFBTSxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUN6QyxJQUFNLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBRSxFQUFFLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBRSxFQUFFLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDO1lBQzVDLElBQU0sRUFBRSxHQUFHLENBQUMsR0FBRyxFQUFFLEVBQUUsRUFBRSxHQUFHLENBQUMsR0FBRyxFQUFFLEVBQUUsRUFBRSxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUM7WUFDNUMsSUFBTSxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUUsRUFBRSxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUUsRUFBRSxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQztZQUM1QyxJQUFNLEVBQUUsR0FBRyxLQUFLLENBQUMsQ0FBQyxFQUFFLEVBQUUsR0FBRyxLQUFLLENBQUMsQ0FBQyxFQUFFLEVBQUUsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDO1lBRS9DLE9BQU8sSUFBSSxPQUFPLENBQUU7Z0JBQ2xCLENBQUUsR0FBRyxJQUFLLEVBQUUsR0FBRyxFQUFFLENBQUUsSUFBSyxFQUFFO2dCQUMxQixDQUFFLEVBQUUsR0FBRyxFQUFFLElBQUssRUFBRTtnQkFDaEIsQ0FBRSxFQUFFLEdBQUcsRUFBRSxJQUFLLEVBQUU7Z0JBQ2hCLEdBQUc7Z0JBRUgsQ0FBRSxFQUFFLEdBQUcsRUFBRSxJQUFLLEVBQUU7Z0JBQ2hCLENBQUUsR0FBRyxJQUFLLEVBQUUsR0FBRyxFQUFFLENBQUUsSUFBSyxFQUFFO2dCQUMxQixDQUFFLEVBQUUsR0FBRyxFQUFFLElBQUssRUFBRTtnQkFDaEIsR0FBRztnQkFFSCxDQUFFLEVBQUUsR0FBRyxFQUFFLElBQUssRUFBRTtnQkFDaEIsQ0FBRSxFQUFFLEdBQUcsRUFBRSxJQUFLLEVBQUU7Z0JBQ2hCLENBQUUsR0FBRyxJQUFLLEVBQUUsR0FBRyxFQUFFLENBQUUsSUFBSyxFQUFFO2dCQUMxQixHQUFHO2dCQUVILFFBQVEsQ0FBQyxDQUFDO2dCQUNWLFFBQVEsQ0FBQyxDQUFDO2dCQUNWLFFBQVEsQ0FBQyxDQUFDO2dCQUNWLEdBQUc7YUFDSixDQUFFLENBQUM7U0FDTDtRQUNILGNBQUM7SUFBRCxDQUFDOztJQzNZRDs7OztRQUc2QiwyQkFBZTtRQUcxQyxpQkFBb0IsQ0FBc0M7WUFBdEMsa0JBQUEsRUFBQSxLQUFrQixHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUU7WUFBMUQsWUFDRSxpQkFBTyxTQUVSO1lBREMsS0FBSSxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUM7O1NBQ25CO1FBS0Qsc0JBQVcsc0JBQUM7Ozs7aUJBQVo7Z0JBQ0UsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFFLENBQUMsQ0FBRSxDQUFDO2FBQzNCO2lCQUVELFVBQWMsQ0FBUztnQkFDckIsSUFBSSxDQUFDLFFBQVEsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUM7YUFDeEI7OztXQUpBO1FBU0Qsc0JBQVcsc0JBQUM7Ozs7aUJBQVo7Z0JBQ0UsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFFLENBQUMsQ0FBRSxDQUFDO2FBQzNCO2lCQUVELFVBQWMsQ0FBUztnQkFDckIsSUFBSSxDQUFDLFFBQVEsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUM7YUFDeEI7OztXQUpBO1FBU0Qsc0JBQVcsc0JBQUM7Ozs7aUJBQVo7Z0JBQ0UsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFFLENBQUMsQ0FBRSxDQUFDO2FBQzNCO2lCQUVELFVBQWMsQ0FBUztnQkFDckIsSUFBSSxDQUFDLFFBQVEsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUM7YUFDeEI7OztXQUpBO1FBU0Qsc0JBQVcsc0JBQUM7Ozs7aUJBQVo7Z0JBQ0UsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFFLENBQUMsQ0FBRSxDQUFDO2FBQzNCO2lCQUVELFVBQWMsQ0FBUztnQkFDckIsSUFBSSxDQUFDLFFBQVEsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUM7YUFDeEI7OztXQUpBO1FBTU0sMEJBQVEsR0FBZjtZQUNFLE9BQU8sY0FBYSxJQUFJLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBRSxDQUFDLENBQUUsVUFBTyxJQUFJLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBRSxDQUFDLENBQUUsVUFBTyxJQUFJLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBRSxDQUFDLENBQUUsVUFBTyxJQUFJLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBRSxDQUFDLENBQUUsT0FBSyxDQUFDO1NBQzVIOzs7O1FBS00sOEJBQVksR0FBbkIsVUFBcUIsTUFBZTtZQUNsQyxJQUFNLENBQUMsR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDO1lBRTFCLE9BQU8sSUFBSSxPQUFPLENBQUU7Z0JBQ2xCLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBRSxFQUFFLENBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQztnQkFDdEUsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFFLEVBQUUsQ0FBRSxHQUFHLElBQUksQ0FBQyxDQUFDO2dCQUN0RSxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUUsRUFBRSxDQUFFLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUUsRUFBRSxDQUFFLEdBQUcsSUFBSSxDQUFDLENBQUM7Z0JBQ3ZFLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBRSxFQUFFLENBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBRSxFQUFFLENBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQzthQUN4RSxDQUFFLENBQUM7U0FDTDtRQUVTLHVCQUFLLEdBQWYsVUFBaUIsQ0FBYTtZQUM1QixPQUFPLElBQUksT0FBTyxDQUFFLENBQUMsQ0FBRSxDQUFDO1NBQ3pCO1FBS0Qsc0JBQWtCLGVBQUk7Ozs7aUJBQXRCO2dCQUNFLE9BQU8sSUFBSSxPQUFPLENBQUUsQ0FBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUUsQ0FBRSxDQUFDO2FBQzlDOzs7V0FBQTtRQUtELHNCQUFrQixjQUFHOzs7O2lCQUFyQjtnQkFDRSxPQUFPLElBQUksT0FBTyxDQUFFLENBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFFLENBQUUsQ0FBQzthQUM5Qzs7O1dBQUE7UUFDSCxjQUFDO0lBQUQsQ0F2RkEsQ0FBNkIsTUFBTTs7SUNSbkM7Ozs7UUFPRSxjQUFvQixDQUFJLEVBQUUsQ0FBSTtZQUM1QixJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUNYLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1NBQ1o7UUFFTSxtQkFBSSxHQUFYO1lBQ0UsSUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUNqQixJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDaEIsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7U0FDWjtRQUNILFdBQUM7SUFBRCxDQUFDOzs7UUNmRDtZQUNVLFVBQUssR0FBRyxHQUFHLENBQUM7WUFDWixjQUFTLEdBQUcsR0FBRyxDQUFDO1lBQ2hCLGVBQVUsR0FBRyxHQUFHLENBQUM7WUFDakIsZUFBVSxHQUFHLEdBQUcsQ0FBQztZQUNqQixXQUFNLEdBQTBCLElBQUkscUJBQXFCLENBQUUsRUFBRSxDQUFFLENBQUM7U0E0Q3pFO1FBMUNDLHNCQUFXLGtDQUFZO2lCQUF2QjtnQkFDRSxPQUFPLElBQUksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO2FBQzFCOzs7V0FBQTtRQUVELHNCQUFXLHlCQUFHO2lCQUFkO2dCQUNFLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQzthQUNuQjtpQkFFRCxVQUFnQixHQUFXO2dCQUN6QixJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7Z0JBQzVCLElBQUksQ0FBQyxVQUFVLEdBQUcsV0FBVyxDQUFDLEdBQUcsRUFBRSxDQUFDO2dCQUNwQyxJQUFJLENBQUMsS0FBSyxHQUFHLEdBQUcsQ0FBQzthQUNsQjs7O1dBTkE7UUFRRCxzQkFBVywwQkFBSTtpQkFBZjtnQkFDRSxPQUFPLElBQUksQ0FBQyxVQUFVLEdBQUcsQ0FBRSxXQUFXLENBQUMsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDLFVBQVUsSUFBSyxLQUFLLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQzthQUM5Rjs7O1dBQUE7UUFFTSx3QkFBSyxHQUFaO1lBQ0UsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQztTQUNyQjtRQUVNLHdCQUFLLEdBQVosVUFBYyxNQUFjO1lBQzFCLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLElBQUksR0FBRyxNQUFNLENBQUM7WUFDckMsSUFBSSxDQUFDLFVBQVUsR0FBRyxXQUFXLENBQUMsR0FBRyxFQUFFLENBQUM7U0FDckM7UUFFTSxzQkFBRyxHQUFWO1lBQ0UsSUFBTSxHQUFHLEdBQUcsV0FBVyxDQUFDLEdBQUcsRUFBRSxDQUFDO1lBQzlCLElBQU0sS0FBSyxHQUFHLENBQUUsR0FBRyxHQUFHLElBQUksQ0FBQyxTQUFTLElBQUssS0FBSyxDQUFDO1lBRS9DLElBQUssR0FBRyxHQUFHLEtBQUssRUFBRztnQkFDakIsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO2FBQ2Q7aUJBQU07Z0JBQ0wsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUUsS0FBSyxDQUFFLENBQUM7Z0JBQzFCLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxJQUFLLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFFLENBQUM7YUFDMUM7WUFFRCxJQUFJLENBQUMsU0FBUyxHQUFHLEdBQUcsQ0FBQztZQUNyQixJQUFJLENBQUMsVUFBVSxHQUFHLEdBQUcsQ0FBQztZQUN0QixJQUFJLENBQUMsVUFBVSxHQUFHLEdBQUcsQ0FBQztTQUN2QjtRQUNILGVBQUM7SUFBRCxDQUFDOzs7UUNoREMsa0JBQW9CLElBQWE7WUFDL0IsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLElBQUksQ0FBQyxDQUFDO1NBQ3ZCO1FBRU0sc0JBQUcsR0FBVixVQUFZLElBQWE7WUFDdkIsSUFBSyxJQUFJLEVBQUc7Z0JBQ1YsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7YUFDbEI7WUFFRCxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLElBQUssSUFBSSxDQUFDLElBQUksSUFBSSxFQUFFLENBQUUsQ0FBQztZQUM1QyxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLElBQUssSUFBSSxDQUFDLElBQUksS0FBSyxFQUFFLENBQUUsQ0FBQztZQUM3QyxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLElBQUssSUFBSSxDQUFDLElBQUksSUFBSSxDQUFDLENBQUUsQ0FBQztZQUMzQyxPQUFPLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBRSxDQUFDLEVBQUUsRUFBRSxDQUFFLEdBQUcsR0FBRyxDQUFDO1NBQzVDO1FBRU0sc0JBQUcsR0FBVixVQUFZLElBQWE7WUFDdkIsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLElBQUksSUFBSSxDQUFDLElBQUksSUFBSSxDQUFDLENBQUM7U0FDcEM7UUFDSCxlQUFDO0lBQUQsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OyJ9
