/*!
* @fms-cat/experimental v0.4.0
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
         * Generate a "LookAt" view matrix.
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
    exports.lerp = lerp;
    exports.linearstep = linearstep;
    exports.matrix2d = matrix2d;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm1zLWNhdC1leHBlcmltZW50YWwuanMiLCJzb3VyY2VzIjpbIi4uL3NyYy9hbGdvcml0aG0vYmluYXJ5U2VhcmNoLnRzIiwiLi4vc3JjL2FycmF5L2NvbnN0YW50cy50cyIsIi4uL3NyYy9hcnJheS91dGlscy50cyIsIi4uL3NyYy9DRFMvQ0RTLnRzIiwiLi4vc3JjL0Nsb2NrL0Nsb2NrLnRzIiwiLi4vbm9kZV9tb2R1bGVzL3RzbGliL3RzbGliLmVzNi5qcyIsIi4uL3NyYy9DbG9jay9DbG9ja0ZyYW1lLnRzIiwiLi4vc3JjL0Nsb2NrL0Nsb2NrUmVhbHRpbWUudHMiLCIuLi9zcmMvbWF0aC91dGlscy50cyIsIi4uL3NyYy9FeHBTbW9vdGgvRXhwU21vb3RoLnRzIiwiLi4vc3JjL0ZpenpCdXp6L0ZpenpCdXp6LnRzIiwiLi4vc3JjL0ZNU19DYXQvRk1TX0NhdC50cyIsIi4uL3NyYy9IaXN0b3J5TWVhbkNhbGN1bGF0b3IvSGlzdG9yeU1lYW5DYWxjdWxhdG9yLnRzIiwiLi4vc3JjL0hpc3RvcnlNZWFuQ2FsY3VsYXRvci9IaXN0b3J5TWVkaWFuQ2FsY3VsYXRvci50cyIsIi4uL3NyYy9tYXRoL1ZlY3Rvci50cyIsIi4uL3NyYy9tYXRoL1ZlY3RvcjMudHMiLCIuLi9zcmMvbWF0aC9RdWF0ZXJuaW9uLnRzIiwiLi4vc3JjL21hdGgvTWF0cml4NC50cyIsIi4uL3NyYy9tYXRoL1ZlY3RvcjQudHMiLCIuLi9zcmMvU3dhcC9Td2FwLnRzIiwiLi4vc3JjL1RhcFRlbXBvL1RhcFRlbXBvLnRzIiwiLi4vc3JjL1hvcnNoaWZ0L1hvcnNoaWZ0LnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIHlvaW5rZWQgZnJvbSBodHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8xMzQ0NTAwL2VmZmljaWVudC13YXktdG8taW5zZXJ0LWEtbnVtYmVyLWludG8tYS1zb3J0ZWQtYXJyYXktb2YtbnVtYmVyc1xuXG5leHBvcnQgZnVuY3Rpb24gYmluYXJ5U2VhcmNoKFxuICBlbGVtZW50OiBudW1iZXIsXG4gIGFycmF5OiBBcnJheUxpa2U8bnVtYmVyPlxuKTogbnVtYmVyIHtcbiAgbGV0IHN0YXJ0ID0gMDtcbiAgbGV0IGVuZCA9IGFycmF5Lmxlbmd0aDtcblxuICB3aGlsZSAoIHN0YXJ0IDwgZW5kICkge1xuICAgIGNvbnN0IGNlbnRlciA9ICggc3RhcnQgKyBlbmQgKSA+PiAxO1xuICAgIGlmICggYXJyYXlbIGNlbnRlciBdIDwgZWxlbWVudCApIHtcbiAgICAgIHN0YXJ0ID0gY2VudGVyICsgMTtcbiAgICB9IGVsc2Uge1xuICAgICAgZW5kID0gY2VudGVyO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBzdGFydDtcbn1cbiIsIi8qKlxuICogYFsgLTEsIC0xLCAxLCAtMSwgLTEsIDEsIDEsIDEgXWBcbiAqL1xuZXhwb3J0IGNvbnN0IFRSSUFOR0xFX1NUUklQX1FVQUQgPSBbIC0xLCAtMSwgMSwgLTEsIC0xLCAxLCAxLCAxIF07XG5cbi8qKlxuICogYFsgLTEsIC0xLCAwLCAxLCAtMSwgMCwgLTEsIDEsIDAsIDEsIDEsIDAgXWBcbiAqL1xuZXhwb3J0IGNvbnN0IFRSSUFOR0xFX1NUUklQX1FVQURfM0QgPSBbIC0xLCAtMSwgMCwgMSwgLTEsIDAsIC0xLCAxLCAwLCAxLCAxLCAwIF07XG5cbi8qKlxuICogYFsgMCwgMCwgMSwgMCwgMCwgMSwgMCwgMCwgMSwgMCwgMCwgMSBdYFxuICovXG5leHBvcnQgY29uc3QgVFJJQU5HTEVfU1RSSVBfUVVBRF9OT1JNQUwgPSBbIDAsIDAsIDEsIDAsIDAsIDEsIDAsIDAsIDEsIDAsIDAsIDEgXTtcblxuLyoqXG4gKiBgWyAwLCAwLCAxLCAwLCAwLCAxLCAxLCAxIF1gXG4gKi9cbmV4cG9ydCBjb25zdCBUUklBTkdMRV9TVFJJUF9RVUFEX1VWID0gWyAwLCAwLCAxLCAwLCAwLCAxLCAxLCAxIF07XG4iLCIvKipcbiAqIFNodWZmbGUgZ2l2ZW4gYGFycmF5YCB1c2luZyBnaXZlbiBgZGljZWAgUk5HLiAqKkRlc3RydWN0aXZlKiouXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzaHVmZmxlQXJyYXk8VD4oIGFycmF5OiBUW10sIGRpY2U/OiAoKSA9PiBudW1iZXIgKTogVFtdIHtcbiAgY29uc3QgZiA9IGRpY2UgPyBkaWNlIDogKCkgPT4gTWF0aC5yYW5kb20oKTtcbiAgZm9yICggbGV0IGkgPSAwOyBpIDwgYXJyYXkubGVuZ3RoIC0gMTsgaSArKyApIHtcbiAgICBjb25zdCBpciA9IGkgKyBNYXRoLmZsb29yKCBmKCkgKiAoIGFycmF5Lmxlbmd0aCAtIGkgKSApO1xuICAgIGNvbnN0IHRlbXAgPSBhcnJheVsgaXIgXTtcbiAgICBhcnJheVsgaXIgXSA9IGFycmF5WyBpIF07XG4gICAgYXJyYXlbIGkgXSA9IHRlbXA7XG4gIH1cbiAgcmV0dXJuIGFycmF5O1xufVxuXG4vKipcbiAqIEkgbGlrZSB3aXJlZnJhbWVcbiAqXG4gKiBgdHJpSW5kZXhUb0xpbmVJbmRleCggWyAwLCAxLCAyLCA1LCA2LCA3IF0gKWAgLT4gYFsgMCwgMSwgMSwgMiwgMiwgMCwgNSwgNiwgNiwgNywgNywgNSBdYFxuICovXG5leHBvcnQgZnVuY3Rpb24gdHJpSW5kZXhUb0xpbmVJbmRleDxUPiggYXJyYXk6IFRbXSApOiBUW10ge1xuICBjb25zdCByZXQ6IFRbXSA9IFtdO1xuICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBhcnJheS5sZW5ndGggLyAzOyBpICsrICkge1xuICAgIGNvbnN0IGhlYWQgPSBpICogMztcbiAgICByZXQucHVzaChcbiAgICAgIGFycmF5WyBoZWFkICAgICBdLCBhcnJheVsgaGVhZCArIDEgXSxcbiAgICAgIGFycmF5WyBoZWFkICsgMSBdLCBhcnJheVsgaGVhZCArIDIgXSxcbiAgICAgIGFycmF5WyBoZWFkICsgMiBdLCBhcnJheVsgaGVhZCAgICAgXVxuICAgICk7XG4gIH1cbiAgcmV0dXJuIHJldDtcbn1cblxuLyoqXG4gKiBgbWF0cml4MmQoIDMsIDIgKWAgLT4gYFsgMCwgMCwgMCwgMSwgMCwgMiwgMSwgMCwgMSwgMSwgMSwgMiBdYFxuICovXG5leHBvcnQgZnVuY3Rpb24gbWF0cml4MmQoIHc6IG51bWJlciwgaDogbnVtYmVyICk6IG51bWJlcltdIHtcbiAgY29uc3QgYXJyOiBudW1iZXJbXSA9IFtdO1xuICBmb3IgKCBsZXQgaXkgPSAwOyBpeSA8IGg7IGl5ICsrICkge1xuICAgIGZvciAoIGxldCBpeCA9IDA7IGl4IDwgdzsgaXggKysgKSB7XG4gICAgICBhcnIucHVzaCggaXgsIGl5ICk7XG4gICAgfVxuICB9XG4gIHJldHVybiBhcnI7XG59XG4iLCIvKipcbiAqIENyaXRpY2FsbHkgRGFtcGVkIFNwcmluZ1xuICpcbiAqIFNob3V0b3V0cyB0byBLZWlqaXJvIFRha2FoYXNoaVxuICovXG5leHBvcnQgY2xhc3MgQ0RTIHtcbiAgcHVibGljIGZhY3RvciA9IDEwMC4wO1xuICBwdWJsaWMgcmF0aW8gPSAxLjA7XG4gIHB1YmxpYyB2ZWxvY2l0eSA9IDAuMDtcbiAgcHVibGljIHZhbHVlID0gMC4wO1xuICBwdWJsaWMgdGFyZ2V0ID0gMC4wO1xuXG4gIHB1YmxpYyB1cGRhdGUoIGRlbHRhVGltZTogbnVtYmVyICk6IG51bWJlciB7XG4gICAgdGhpcy52ZWxvY2l0eSArPSAoXG4gICAgICAtdGhpcy5mYWN0b3IgKiAoIHRoaXMudmFsdWUgLSB0aGlzLnRhcmdldCApXG4gICAgICAtIDIuMCAqIHRoaXMudmVsb2NpdHkgKiBNYXRoLnNxcnQoIHRoaXMuZmFjdG9yICkgKiB0aGlzLnJhdGlvXG4gICAgKSAqIGRlbHRhVGltZTtcbiAgICB0aGlzLnZhbHVlICs9IHRoaXMudmVsb2NpdHkgKiBkZWx0YVRpbWU7XG4gICAgcmV0dXJuIHRoaXMudmFsdWU7XG4gIH1cbn1cbiIsIi8qKlxuICogQ2xhc3MgdGhhdCBkZWFscyB3aXRoIHRpbWUuXG4gKiBJbiB0aGlzIGJhc2UgY2xhc3MsIHlvdSBuZWVkIHRvIHNldCB0aW1lIG1hbnVhbGx5IGZyb20gYEF1dG9tYXRvbi51cGRhdGUoKWAuXG4gKiBCZXN0IGZvciBzeW5jIHdpdGggZXh0ZXJuYWwgY2xvY2sgc3R1ZmYuXG4gKi9cbmV4cG9ydCBjbGFzcyBDbG9jayB7XG4gIC8qKlxuICAgKiBJdHMgY3VycmVudCB0aW1lLlxuICAgKi9cbiAgcHJvdGVjdGVkIF9fdGltZSA9IDAuMDtcblxuICAvKipcbiAgICogSXRzIGRlbHRhVGltZSBvZiBsYXN0IHVwZGF0ZS5cbiAgICovXG4gIHByb3RlY3RlZCBfX2RlbHRhVGltZSA9IDAuMDtcblxuICAvKipcbiAgICogV2hldGhlciBpdHMgY3VycmVudGx5IHBsYXlpbmcgb3Igbm90LlxuICAgKi9cbiAgcHJvdGVjdGVkIF9faXNQbGF5aW5nID0gZmFsc2U7XG5cbiAgLyoqXG4gICAqIEl0cyBjdXJyZW50IHRpbWUuXG4gICAqL1xuICBwdWJsaWMgZ2V0IHRpbWUoKTogbnVtYmVyIHsgcmV0dXJuIHRoaXMuX190aW1lOyB9XG5cbiAgLyoqXG4gICAqIEl0cyBkZWx0YVRpbWUgb2YgbGFzdCB1cGRhdGUuXG4gICAqL1xuICBwdWJsaWMgZ2V0IGRlbHRhVGltZSgpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5fX2RlbHRhVGltZTsgfVxuXG4gIC8qKlxuICAgKiBXaGV0aGVyIGl0cyBjdXJyZW50bHkgcGxheWluZyBvciBub3QuXG4gICAqL1xuICBwdWJsaWMgZ2V0IGlzUGxheWluZygpOiBib29sZWFuIHsgcmV0dXJuIHRoaXMuX19pc1BsYXlpbmc7IH1cblxuICAvKipcbiAgICogVXBkYXRlIHRoZSBjbG9jay5cbiAgICogQHBhcmFtIHRpbWUgVGltZS4gWW91IG5lZWQgdG8gc2V0IG1hbnVhbGx5IHdoZW4geW91IGFyZSB1c2luZyBtYW51YWwgQ2xvY2tcbiAgICovXG4gIHB1YmxpYyB1cGRhdGUoIHRpbWU/OiBudW1iZXIgKTogdm9pZCB7XG4gICAgY29uc3QgcHJldlRpbWUgPSB0aGlzLl9fdGltZTtcbiAgICB0aGlzLl9fdGltZSA9IHRpbWUgfHwgMC4wO1xuICAgIHRoaXMuX19kZWx0YVRpbWUgPSB0aGlzLl9fdGltZSAtIHByZXZUaW1lO1xuICB9XG5cbiAgLyoqXG4gICAqIFN0YXJ0IHRoZSBjbG9jay5cbiAgICovXG4gIHB1YmxpYyBwbGF5KCk6IHZvaWQge1xuICAgIHRoaXMuX19pc1BsYXlpbmcgPSB0cnVlO1xuICB9XG5cbiAgLyoqXG4gICAqIFN0b3AgdGhlIGNsb2NrLlxuICAgKi9cbiAgcHVibGljIHBhdXNlKCk6IHZvaWQge1xuICAgIHRoaXMuX19pc1BsYXlpbmcgPSBmYWxzZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgdGhlIHRpbWUgbWFudWFsbHkuXG4gICAqIEBwYXJhbSB0aW1lIFRpbWVcbiAgICovXG4gIHB1YmxpYyBzZXRUaW1lKCB0aW1lOiBudW1iZXIgKTogdm9pZCB7XG4gICAgdGhpcy5fX3RpbWUgPSB0aW1lO1xuICB9XG59XG4iLCIvKiEgKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcclxuQ29weXJpZ2h0IChjKSBNaWNyb3NvZnQgQ29ycG9yYXRpb24uXHJcblxyXG5QZXJtaXNzaW9uIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBhbmQvb3IgZGlzdHJpYnV0ZSB0aGlzIHNvZnR3YXJlIGZvciBhbnlcclxucHVycG9zZSB3aXRoIG9yIHdpdGhvdXQgZmVlIGlzIGhlcmVieSBncmFudGVkLlxyXG5cclxuVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiBBTkQgVEhFIEFVVEhPUiBESVNDTEFJTVMgQUxMIFdBUlJBTlRJRVMgV0lUSFxyXG5SRUdBUkQgVE8gVEhJUyBTT0ZUV0FSRSBJTkNMVURJTkcgQUxMIElNUExJRUQgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFlcclxuQU5EIEZJVE5FU1MuIElOIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1IgQkUgTElBQkxFIEZPUiBBTlkgU1BFQ0lBTCwgRElSRUNULFxyXG5JTkRJUkVDVCwgT1IgQ09OU0VRVUVOVElBTCBEQU1BR0VTIE9SIEFOWSBEQU1BR0VTIFdIQVRTT0VWRVIgUkVTVUxUSU5HIEZST01cclxuTE9TUyBPRiBVU0UsIERBVEEgT1IgUFJPRklUUywgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIE5FR0xJR0VOQ0UgT1JcclxuT1RIRVIgVE9SVElPVVMgQUNUSU9OLCBBUklTSU5HIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFVTRSBPUlxyXG5QRVJGT1JNQU5DRSBPRiBUSElTIFNPRlRXQVJFLlxyXG4qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiAqL1xyXG4vKiBnbG9iYWwgUmVmbGVjdCwgUHJvbWlzZSAqL1xyXG5cclxudmFyIGV4dGVuZFN0YXRpY3MgPSBmdW5jdGlvbihkLCBiKSB7XHJcbiAgICBleHRlbmRTdGF0aWNzID0gT2JqZWN0LnNldFByb3RvdHlwZU9mIHx8XHJcbiAgICAgICAgKHsgX19wcm90b19fOiBbXSB9IGluc3RhbmNlb2YgQXJyYXkgJiYgZnVuY3Rpb24gKGQsIGIpIHsgZC5fX3Byb3RvX18gPSBiOyB9KSB8fFxyXG4gICAgICAgIGZ1bmN0aW9uIChkLCBiKSB7IGZvciAodmFyIHAgaW4gYikgaWYgKGIuaGFzT3duUHJvcGVydHkocCkpIGRbcF0gPSBiW3BdOyB9O1xyXG4gICAgcmV0dXJuIGV4dGVuZFN0YXRpY3MoZCwgYik7XHJcbn07XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19leHRlbmRzKGQsIGIpIHtcclxuICAgIGV4dGVuZFN0YXRpY3MoZCwgYik7XHJcbiAgICBmdW5jdGlvbiBfXygpIHsgdGhpcy5jb25zdHJ1Y3RvciA9IGQ7IH1cclxuICAgIGQucHJvdG90eXBlID0gYiA9PT0gbnVsbCA/IE9iamVjdC5jcmVhdGUoYikgOiAoX18ucHJvdG90eXBlID0gYi5wcm90b3R5cGUsIG5ldyBfXygpKTtcclxufVxyXG5cclxuZXhwb3J0IHZhciBfX2Fzc2lnbiA9IGZ1bmN0aW9uKCkge1xyXG4gICAgX19hc3NpZ24gPSBPYmplY3QuYXNzaWduIHx8IGZ1bmN0aW9uIF9fYXNzaWduKHQpIHtcclxuICAgICAgICBmb3IgKHZhciBzLCBpID0gMSwgbiA9IGFyZ3VtZW50cy5sZW5ndGg7IGkgPCBuOyBpKyspIHtcclxuICAgICAgICAgICAgcyA9IGFyZ3VtZW50c1tpXTtcclxuICAgICAgICAgICAgZm9yICh2YXIgcCBpbiBzKSBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHMsIHApKSB0W3BdID0gc1twXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHQ7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gX19hc3NpZ24uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fcmVzdChzLCBlKSB7XHJcbiAgICB2YXIgdCA9IHt9O1xyXG4gICAgZm9yICh2YXIgcCBpbiBzKSBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHMsIHApICYmIGUuaW5kZXhPZihwKSA8IDApXHJcbiAgICAgICAgdFtwXSA9IHNbcF07XHJcbiAgICBpZiAocyAhPSBudWxsICYmIHR5cGVvZiBPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzID09PSBcImZ1bmN0aW9uXCIpXHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDAsIHAgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzKHMpOyBpIDwgcC5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBpZiAoZS5pbmRleE9mKHBbaV0pIDwgMCAmJiBPYmplY3QucHJvdG90eXBlLnByb3BlcnR5SXNFbnVtZXJhYmxlLmNhbGwocywgcFtpXSkpXHJcbiAgICAgICAgICAgICAgICB0W3BbaV1dID0gc1twW2ldXTtcclxuICAgICAgICB9XHJcbiAgICByZXR1cm4gdDtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fZGVjb3JhdGUoZGVjb3JhdG9ycywgdGFyZ2V0LCBrZXksIGRlc2MpIHtcclxuICAgIHZhciBjID0gYXJndW1lbnRzLmxlbmd0aCwgciA9IGMgPCAzID8gdGFyZ2V0IDogZGVzYyA9PT0gbnVsbCA/IGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHRhcmdldCwga2V5KSA6IGRlc2MsIGQ7XHJcbiAgICBpZiAodHlwZW9mIFJlZmxlY3QgPT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIFJlZmxlY3QuZGVjb3JhdGUgPT09IFwiZnVuY3Rpb25cIikgciA9IFJlZmxlY3QuZGVjb3JhdGUoZGVjb3JhdG9ycywgdGFyZ2V0LCBrZXksIGRlc2MpO1xyXG4gICAgZWxzZSBmb3IgKHZhciBpID0gZGVjb3JhdG9ycy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkgaWYgKGQgPSBkZWNvcmF0b3JzW2ldKSByID0gKGMgPCAzID8gZChyKSA6IGMgPiAzID8gZCh0YXJnZXQsIGtleSwgcikgOiBkKHRhcmdldCwga2V5KSkgfHwgcjtcclxuICAgIHJldHVybiBjID4gMyAmJiByICYmIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGtleSwgciksIHI7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX3BhcmFtKHBhcmFtSW5kZXgsIGRlY29yYXRvcikge1xyXG4gICAgcmV0dXJuIGZ1bmN0aW9uICh0YXJnZXQsIGtleSkgeyBkZWNvcmF0b3IodGFyZ2V0LCBrZXksIHBhcmFtSW5kZXgpOyB9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX21ldGFkYXRhKG1ldGFkYXRhS2V5LCBtZXRhZGF0YVZhbHVlKSB7XHJcbiAgICBpZiAodHlwZW9mIFJlZmxlY3QgPT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIFJlZmxlY3QubWV0YWRhdGEgPT09IFwiZnVuY3Rpb25cIikgcmV0dXJuIFJlZmxlY3QubWV0YWRhdGEobWV0YWRhdGFLZXksIG1ldGFkYXRhVmFsdWUpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19hd2FpdGVyKHRoaXNBcmcsIF9hcmd1bWVudHMsIFAsIGdlbmVyYXRvcikge1xyXG4gICAgZnVuY3Rpb24gYWRvcHQodmFsdWUpIHsgcmV0dXJuIHZhbHVlIGluc3RhbmNlb2YgUCA/IHZhbHVlIDogbmV3IFAoZnVuY3Rpb24gKHJlc29sdmUpIHsgcmVzb2x2ZSh2YWx1ZSk7IH0pOyB9XHJcbiAgICByZXR1cm4gbmV3IChQIHx8IChQID0gUHJvbWlzZSkpKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcclxuICAgICAgICBmdW5jdGlvbiBmdWxmaWxsZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3IubmV4dCh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XHJcbiAgICAgICAgZnVuY3Rpb24gcmVqZWN0ZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3JbXCJ0aHJvd1wiXSh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XHJcbiAgICAgICAgZnVuY3Rpb24gc3RlcChyZXN1bHQpIHsgcmVzdWx0LmRvbmUgPyByZXNvbHZlKHJlc3VsdC52YWx1ZSkgOiBhZG9wdChyZXN1bHQudmFsdWUpLnRoZW4oZnVsZmlsbGVkLCByZWplY3RlZCk7IH1cclxuICAgICAgICBzdGVwKChnZW5lcmF0b3IgPSBnZW5lcmF0b3IuYXBwbHkodGhpc0FyZywgX2FyZ3VtZW50cyB8fCBbXSkpLm5leHQoKSk7XHJcbiAgICB9KTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fZ2VuZXJhdG9yKHRoaXNBcmcsIGJvZHkpIHtcclxuICAgIHZhciBfID0geyBsYWJlbDogMCwgc2VudDogZnVuY3Rpb24oKSB7IGlmICh0WzBdICYgMSkgdGhyb3cgdFsxXTsgcmV0dXJuIHRbMV07IH0sIHRyeXM6IFtdLCBvcHM6IFtdIH0sIGYsIHksIHQsIGc7XHJcbiAgICByZXR1cm4gZyA9IHsgbmV4dDogdmVyYigwKSwgXCJ0aHJvd1wiOiB2ZXJiKDEpLCBcInJldHVyblwiOiB2ZXJiKDIpIH0sIHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiAoZ1tTeW1ib2wuaXRlcmF0b3JdID0gZnVuY3Rpb24oKSB7IHJldHVybiB0aGlzOyB9KSwgZztcclxuICAgIGZ1bmN0aW9uIHZlcmIobikgeyByZXR1cm4gZnVuY3Rpb24gKHYpIHsgcmV0dXJuIHN0ZXAoW24sIHZdKTsgfTsgfVxyXG4gICAgZnVuY3Rpb24gc3RlcChvcCkge1xyXG4gICAgICAgIGlmIChmKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiR2VuZXJhdG9yIGlzIGFscmVhZHkgZXhlY3V0aW5nLlwiKTtcclxuICAgICAgICB3aGlsZSAoXykgdHJ5IHtcclxuICAgICAgICAgICAgaWYgKGYgPSAxLCB5ICYmICh0ID0gb3BbMF0gJiAyID8geVtcInJldHVyblwiXSA6IG9wWzBdID8geVtcInRocm93XCJdIHx8ICgodCA9IHlbXCJyZXR1cm5cIl0pICYmIHQuY2FsbCh5KSwgMCkgOiB5Lm5leHQpICYmICEodCA9IHQuY2FsbCh5LCBvcFsxXSkpLmRvbmUpIHJldHVybiB0O1xyXG4gICAgICAgICAgICBpZiAoeSA9IDAsIHQpIG9wID0gW29wWzBdICYgMiwgdC52YWx1ZV07XHJcbiAgICAgICAgICAgIHN3aXRjaCAob3BbMF0pIHtcclxuICAgICAgICAgICAgICAgIGNhc2UgMDogY2FzZSAxOiB0ID0gb3A7IGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSA0OiBfLmxhYmVsKys7IHJldHVybiB7IHZhbHVlOiBvcFsxXSwgZG9uZTogZmFsc2UgfTtcclxuICAgICAgICAgICAgICAgIGNhc2UgNTogXy5sYWJlbCsrOyB5ID0gb3BbMV07IG9wID0gWzBdOyBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgIGNhc2UgNzogb3AgPSBfLm9wcy5wb3AoKTsgXy50cnlzLnBvcCgpOyBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCEodCA9IF8udHJ5cywgdCA9IHQubGVuZ3RoID4gMCAmJiB0W3QubGVuZ3RoIC0gMV0pICYmIChvcFswXSA9PT0gNiB8fCBvcFswXSA9PT0gMikpIHsgXyA9IDA7IGNvbnRpbnVlOyB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG9wWzBdID09PSAzICYmICghdCB8fCAob3BbMV0gPiB0WzBdICYmIG9wWzFdIDwgdFszXSkpKSB7IF8ubGFiZWwgPSBvcFsxXTsgYnJlYWs7IH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAob3BbMF0gPT09IDYgJiYgXy5sYWJlbCA8IHRbMV0pIHsgXy5sYWJlbCA9IHRbMV07IHQgPSBvcDsgYnJlYWs7IH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAodCAmJiBfLmxhYmVsIDwgdFsyXSkgeyBfLmxhYmVsID0gdFsyXTsgXy5vcHMucHVzaChvcCk7IGJyZWFrOyB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRbMl0pIF8ub3BzLnBvcCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIF8udHJ5cy5wb3AoKTsgY29udGludWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgb3AgPSBib2R5LmNhbGwodGhpc0FyZywgXyk7XHJcbiAgICAgICAgfSBjYXRjaCAoZSkgeyBvcCA9IFs2LCBlXTsgeSA9IDA7IH0gZmluYWxseSB7IGYgPSB0ID0gMDsgfVxyXG4gICAgICAgIGlmIChvcFswXSAmIDUpIHRocm93IG9wWzFdOyByZXR1cm4geyB2YWx1ZTogb3BbMF0gPyBvcFsxXSA6IHZvaWQgMCwgZG9uZTogdHJ1ZSB9O1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgdmFyIF9fY3JlYXRlQmluZGluZyA9IE9iamVjdC5jcmVhdGUgPyAoZnVuY3Rpb24obywgbSwgaywgazIpIHtcclxuICAgIGlmIChrMiA9PT0gdW5kZWZpbmVkKSBrMiA9IGs7XHJcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkobywgazIsIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBmdW5jdGlvbigpIHsgcmV0dXJuIG1ba107IH0gfSk7XHJcbn0pIDogKGZ1bmN0aW9uKG8sIG0sIGssIGsyKSB7XHJcbiAgICBpZiAoazIgPT09IHVuZGVmaW5lZCkgazIgPSBrO1xyXG4gICAgb1trMl0gPSBtW2tdO1xyXG59KTtcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2V4cG9ydFN0YXIobSwgZXhwb3J0cykge1xyXG4gICAgZm9yICh2YXIgcCBpbiBtKSBpZiAocCAhPT0gXCJkZWZhdWx0XCIgJiYgIWV4cG9ydHMuaGFzT3duUHJvcGVydHkocCkpIF9fY3JlYXRlQmluZGluZyhleHBvcnRzLCBtLCBwKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fdmFsdWVzKG8pIHtcclxuICAgIHZhciBzID0gdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIFN5bWJvbC5pdGVyYXRvciwgbSA9IHMgJiYgb1tzXSwgaSA9IDA7XHJcbiAgICBpZiAobSkgcmV0dXJuIG0uY2FsbChvKTtcclxuICAgIGlmIChvICYmIHR5cGVvZiBvLmxlbmd0aCA9PT0gXCJudW1iZXJcIikgcmV0dXJuIHtcclxuICAgICAgICBuZXh0OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGlmIChvICYmIGkgPj0gby5sZW5ndGgpIG8gPSB2b2lkIDA7XHJcbiAgICAgICAgICAgIHJldHVybiB7IHZhbHVlOiBvICYmIG9baSsrXSwgZG9uZTogIW8gfTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihzID8gXCJPYmplY3QgaXMgbm90IGl0ZXJhYmxlLlwiIDogXCJTeW1ib2wuaXRlcmF0b3IgaXMgbm90IGRlZmluZWQuXCIpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19yZWFkKG8sIG4pIHtcclxuICAgIHZhciBtID0gdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIG9bU3ltYm9sLml0ZXJhdG9yXTtcclxuICAgIGlmICghbSkgcmV0dXJuIG87XHJcbiAgICB2YXIgaSA9IG0uY2FsbChvKSwgciwgYXIgPSBbXSwgZTtcclxuICAgIHRyeSB7XHJcbiAgICAgICAgd2hpbGUgKChuID09PSB2b2lkIDAgfHwgbi0tID4gMCkgJiYgIShyID0gaS5uZXh0KCkpLmRvbmUpIGFyLnB1c2goci52YWx1ZSk7XHJcbiAgICB9XHJcbiAgICBjYXRjaCAoZXJyb3IpIHsgZSA9IHsgZXJyb3I6IGVycm9yIH07IH1cclxuICAgIGZpbmFsbHkge1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGlmIChyICYmICFyLmRvbmUgJiYgKG0gPSBpW1wicmV0dXJuXCJdKSkgbS5jYWxsKGkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBmaW5hbGx5IHsgaWYgKGUpIHRocm93IGUuZXJyb3I7IH1cclxuICAgIH1cclxuICAgIHJldHVybiBhcjtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fc3ByZWFkKCkge1xyXG4gICAgZm9yICh2YXIgYXIgPSBbXSwgaSA9IDA7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspXHJcbiAgICAgICAgYXIgPSBhci5jb25jYXQoX19yZWFkKGFyZ3VtZW50c1tpXSkpO1xyXG4gICAgcmV0dXJuIGFyO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19zcHJlYWRBcnJheXMoKSB7XHJcbiAgICBmb3IgKHZhciBzID0gMCwgaSA9IDAsIGlsID0gYXJndW1lbnRzLmxlbmd0aDsgaSA8IGlsOyBpKyspIHMgKz0gYXJndW1lbnRzW2ldLmxlbmd0aDtcclxuICAgIGZvciAodmFyIHIgPSBBcnJheShzKSwgayA9IDAsIGkgPSAwOyBpIDwgaWw7IGkrKylcclxuICAgICAgICBmb3IgKHZhciBhID0gYXJndW1lbnRzW2ldLCBqID0gMCwgamwgPSBhLmxlbmd0aDsgaiA8IGpsOyBqKyssIGsrKylcclxuICAgICAgICAgICAgcltrXSA9IGFbal07XHJcbiAgICByZXR1cm4gcjtcclxufTtcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2F3YWl0KHYpIHtcclxuICAgIHJldHVybiB0aGlzIGluc3RhbmNlb2YgX19hd2FpdCA/ICh0aGlzLnYgPSB2LCB0aGlzKSA6IG5ldyBfX2F3YWl0KHYpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19hc3luY0dlbmVyYXRvcih0aGlzQXJnLCBfYXJndW1lbnRzLCBnZW5lcmF0b3IpIHtcclxuICAgIGlmICghU3ltYm9sLmFzeW5jSXRlcmF0b3IpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJTeW1ib2wuYXN5bmNJdGVyYXRvciBpcyBub3QgZGVmaW5lZC5cIik7XHJcbiAgICB2YXIgZyA9IGdlbmVyYXRvci5hcHBseSh0aGlzQXJnLCBfYXJndW1lbnRzIHx8IFtdKSwgaSwgcSA9IFtdO1xyXG4gICAgcmV0dXJuIGkgPSB7fSwgdmVyYihcIm5leHRcIiksIHZlcmIoXCJ0aHJvd1wiKSwgdmVyYihcInJldHVyblwiKSwgaVtTeW1ib2wuYXN5bmNJdGVyYXRvcl0gPSBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzOyB9LCBpO1xyXG4gICAgZnVuY3Rpb24gdmVyYihuKSB7IGlmIChnW25dKSBpW25dID0gZnVuY3Rpb24gKHYpIHsgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChhLCBiKSB7IHEucHVzaChbbiwgdiwgYSwgYl0pID4gMSB8fCByZXN1bWUobiwgdik7IH0pOyB9OyB9XHJcbiAgICBmdW5jdGlvbiByZXN1bWUobiwgdikgeyB0cnkgeyBzdGVwKGdbbl0odikpOyB9IGNhdGNoIChlKSB7IHNldHRsZShxWzBdWzNdLCBlKTsgfSB9XHJcbiAgICBmdW5jdGlvbiBzdGVwKHIpIHsgci52YWx1ZSBpbnN0YW5jZW9mIF9fYXdhaXQgPyBQcm9taXNlLnJlc29sdmUoci52YWx1ZS52KS50aGVuKGZ1bGZpbGwsIHJlamVjdCkgOiBzZXR0bGUocVswXVsyXSwgcik7IH1cclxuICAgIGZ1bmN0aW9uIGZ1bGZpbGwodmFsdWUpIHsgcmVzdW1lKFwibmV4dFwiLCB2YWx1ZSk7IH1cclxuICAgIGZ1bmN0aW9uIHJlamVjdCh2YWx1ZSkgeyByZXN1bWUoXCJ0aHJvd1wiLCB2YWx1ZSk7IH1cclxuICAgIGZ1bmN0aW9uIHNldHRsZShmLCB2KSB7IGlmIChmKHYpLCBxLnNoaWZ0KCksIHEubGVuZ3RoKSByZXN1bWUocVswXVswXSwgcVswXVsxXSk7IH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fYXN5bmNEZWxlZ2F0b3Iobykge1xyXG4gICAgdmFyIGksIHA7XHJcbiAgICByZXR1cm4gaSA9IHt9LCB2ZXJiKFwibmV4dFwiKSwgdmVyYihcInRocm93XCIsIGZ1bmN0aW9uIChlKSB7IHRocm93IGU7IH0pLCB2ZXJiKFwicmV0dXJuXCIpLCBpW1N5bWJvbC5pdGVyYXRvcl0gPSBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzOyB9LCBpO1xyXG4gICAgZnVuY3Rpb24gdmVyYihuLCBmKSB7IGlbbl0gPSBvW25dID8gZnVuY3Rpb24gKHYpIHsgcmV0dXJuIChwID0gIXApID8geyB2YWx1ZTogX19hd2FpdChvW25dKHYpKSwgZG9uZTogbiA9PT0gXCJyZXR1cm5cIiB9IDogZiA/IGYodikgOiB2OyB9IDogZjsgfVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19hc3luY1ZhbHVlcyhvKSB7XHJcbiAgICBpZiAoIVN5bWJvbC5hc3luY0l0ZXJhdG9yKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiU3ltYm9sLmFzeW5jSXRlcmF0b3IgaXMgbm90IGRlZmluZWQuXCIpO1xyXG4gICAgdmFyIG0gPSBvW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSwgaTtcclxuICAgIHJldHVybiBtID8gbS5jYWxsKG8pIDogKG8gPSB0eXBlb2YgX192YWx1ZXMgPT09IFwiZnVuY3Rpb25cIiA/IF9fdmFsdWVzKG8pIDogb1tTeW1ib2wuaXRlcmF0b3JdKCksIGkgPSB7fSwgdmVyYihcIm5leHRcIiksIHZlcmIoXCJ0aHJvd1wiKSwgdmVyYihcInJldHVyblwiKSwgaVtTeW1ib2wuYXN5bmNJdGVyYXRvcl0gPSBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzOyB9LCBpKTtcclxuICAgIGZ1bmN0aW9uIHZlcmIobikgeyBpW25dID0gb1tuXSAmJiBmdW5jdGlvbiAodikgeyByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkgeyB2ID0gb1tuXSh2KSwgc2V0dGxlKHJlc29sdmUsIHJlamVjdCwgdi5kb25lLCB2LnZhbHVlKTsgfSk7IH07IH1cclxuICAgIGZ1bmN0aW9uIHNldHRsZShyZXNvbHZlLCByZWplY3QsIGQsIHYpIHsgUHJvbWlzZS5yZXNvbHZlKHYpLnRoZW4oZnVuY3Rpb24odikgeyByZXNvbHZlKHsgdmFsdWU6IHYsIGRvbmU6IGQgfSk7IH0sIHJlamVjdCk7IH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fbWFrZVRlbXBsYXRlT2JqZWN0KGNvb2tlZCwgcmF3KSB7XHJcbiAgICBpZiAoT2JqZWN0LmRlZmluZVByb3BlcnR5KSB7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eShjb29rZWQsIFwicmF3XCIsIHsgdmFsdWU6IHJhdyB9KTsgfSBlbHNlIHsgY29va2VkLnJhdyA9IHJhdzsgfVxyXG4gICAgcmV0dXJuIGNvb2tlZDtcclxufTtcclxuXHJcbnZhciBfX3NldE1vZHVsZURlZmF1bHQgPSBPYmplY3QuY3JlYXRlID8gKGZ1bmN0aW9uKG8sIHYpIHtcclxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvLCBcImRlZmF1bHRcIiwgeyBlbnVtZXJhYmxlOiB0cnVlLCB2YWx1ZTogdiB9KTtcclxufSkgOiBmdW5jdGlvbihvLCB2KSB7XHJcbiAgICBvW1wiZGVmYXVsdFwiXSA9IHY7XHJcbn07XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19pbXBvcnRTdGFyKG1vZCkge1xyXG4gICAgaWYgKG1vZCAmJiBtb2QuX19lc01vZHVsZSkgcmV0dXJuIG1vZDtcclxuICAgIHZhciByZXN1bHQgPSB7fTtcclxuICAgIGlmIChtb2QgIT0gbnVsbCkgZm9yICh2YXIgayBpbiBtb2QpIGlmIChPYmplY3QuaGFzT3duUHJvcGVydHkuY2FsbChtb2QsIGspKSBfX2NyZWF0ZUJpbmRpbmcocmVzdWx0LCBtb2QsIGspO1xyXG4gICAgX19zZXRNb2R1bGVEZWZhdWx0KHJlc3VsdCwgbW9kKTtcclxuICAgIHJldHVybiByZXN1bHQ7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2ltcG9ydERlZmF1bHQobW9kKSB7XHJcbiAgICByZXR1cm4gKG1vZCAmJiBtb2QuX19lc01vZHVsZSkgPyBtb2QgOiB7IGRlZmF1bHQ6IG1vZCB9O1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19jbGFzc1ByaXZhdGVGaWVsZEdldChyZWNlaXZlciwgcHJpdmF0ZU1hcCkge1xyXG4gICAgaWYgKCFwcml2YXRlTWFwLmhhcyhyZWNlaXZlcikpIHtcclxuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiYXR0ZW1wdGVkIHRvIGdldCBwcml2YXRlIGZpZWxkIG9uIG5vbi1pbnN0YW5jZVwiKTtcclxuICAgIH1cclxuICAgIHJldHVybiBwcml2YXRlTWFwLmdldChyZWNlaXZlcik7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2NsYXNzUHJpdmF0ZUZpZWxkU2V0KHJlY2VpdmVyLCBwcml2YXRlTWFwLCB2YWx1ZSkge1xyXG4gICAgaWYgKCFwcml2YXRlTWFwLmhhcyhyZWNlaXZlcikpIHtcclxuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiYXR0ZW1wdGVkIHRvIHNldCBwcml2YXRlIGZpZWxkIG9uIG5vbi1pbnN0YW5jZVwiKTtcclxuICAgIH1cclxuICAgIHByaXZhdGVNYXAuc2V0KHJlY2VpdmVyLCB2YWx1ZSk7XHJcbiAgICByZXR1cm4gdmFsdWU7XHJcbn1cclxuIiwiaW1wb3J0IHsgQ2xvY2sgfSBmcm9tICcuL0Nsb2NrJztcblxuLyoqXG4gKiBDbGFzcyB0aGF0IGRlYWxzIHdpdGggdGltZS5cbiAqIFRoaXMgaXMgXCJmcmFtZVwiIHR5cGUgY2xvY2ssIHRoZSBmcmFtZSBpbmNyZWFzZXMgZXZlcnkge0BsaW5rIENsb2NrRnJhbWUjdXBkYXRlfSBjYWxsLlxuICogQHBhcmFtIGZwcyBGcmFtZXMgcGVyIHNlY29uZFxuICovXG5leHBvcnQgY2xhc3MgQ2xvY2tGcmFtZSBleHRlbmRzIENsb2NrIHtcbiAgLyoqXG4gICAqIEl0cyBjdXJyZW50IGZyYW1lLlxuICAgKi9cbiAgcHJpdmF0ZSBfX2ZyYW1lID0gMDtcblxuICAvKipcbiAgICogSXRzIGZwcy5cbiAgICovXG4gIHByaXZhdGUgX19mcHM6IG51bWJlcjtcblxuICBwdWJsaWMgY29uc3RydWN0b3IoIGZwcyA9IDYwICkge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5fX2ZwcyA9IGZwcztcbiAgfVxuXG4gIC8qKlxuICAgKiBJdHMgY3VycmVudCBmcmFtZS5cbiAgICovXG4gIHB1YmxpYyBnZXQgZnJhbWUoKTogbnVtYmVyIHsgcmV0dXJuIHRoaXMuX19mcmFtZTsgfVxuXG4gIC8qKlxuICAgKiBJdHMgZnBzLlxuICAgKi9cbiAgcHVibGljIGdldCBmcHMoKTogbnVtYmVyIHsgcmV0dXJuIHRoaXMuX19mcHM7IH1cblxuICAvKipcbiAgICogVXBkYXRlIHRoZSBjbG9jay4gSXQgd2lsbCBpbmNyZWFzZSB0aGUgZnJhbWUgYnkgMS5cbiAgICovXG4gIHB1YmxpYyB1cGRhdGUoKTogdm9pZCB7XG4gICAgaWYgKCB0aGlzLl9faXNQbGF5aW5nICkge1xuICAgICAgdGhpcy5fX3RpbWUgPSB0aGlzLl9fZnJhbWUgLyB0aGlzLl9fZnBzO1xuICAgICAgdGhpcy5fX2RlbHRhVGltZSA9IDEuMCAvIHRoaXMuX19mcHM7XG4gICAgICB0aGlzLl9fZnJhbWUgKys7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX19kZWx0YVRpbWUgPSAwLjA7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFNldCB0aGUgdGltZSBtYW51YWxseS5cbiAgICogVGhlIHNldCB0aW1lIHdpbGwgYmUgY29udmVydGVkIGludG8gaW50ZXJuYWwgZnJhbWUgY291bnQsIHNvIHRoZSB0aW1lIHdpbGwgbm90IGJlIGV4YWN0bHkgc2FtZSBhcyBzZXQgb25lLlxuICAgKiBAcGFyYW0gdGltZSBUaW1lXG4gICAqL1xuICBwdWJsaWMgc2V0VGltZSggdGltZTogbnVtYmVyICk6IHZvaWQge1xuICAgIHRoaXMuX19mcmFtZSA9IE1hdGguZmxvb3IoIHRoaXMuX19mcHMgKiB0aW1lICk7XG4gICAgdGhpcy5fX3RpbWUgPSB0aGlzLl9fZnJhbWUgLyB0aGlzLl9fZnBzO1xuICB9XG59XG4iLCJpbXBvcnQgeyBDbG9jayB9IGZyb20gJy4vQ2xvY2snO1xuXG4vKipcbiAqIENsYXNzIHRoYXQgZGVhbHMgd2l0aCB0aW1lLlxuICogVGhpcyBpcyBcInJlYWx0aW1lXCIgdHlwZSBjbG9jaywgdGhlIHRpbWUgZ29lcyBvbiBhcyByZWFsIHdvcmxkLlxuICovXG5leHBvcnQgY2xhc3MgQ2xvY2tSZWFsdGltZSBleHRlbmRzIENsb2NrIHtcbiAgLyoqXG4gICAqIFwiWW91IHNldCB0aGUgdGltZSBtYW51YWxseSB0byBgX19ydFRpbWVgIHdoZW4gaXQncyBgX19ydERhdGVgLlwiXG4gICAqL1xuICBwcml2YXRlIF9fcnRUaW1lID0gMC4wO1xuXG4gIC8qKlxuICAgKiBcIllvdSBzZXQgdGhlIHRpbWUgbWFudWFsbHkgdG8gYF9fcnRUaW1lYCB3aGVuIGl0J3MgYF9fcnREYXRlYC5cIlxuICAgKi9cbiAgcHJpdmF0ZSBfX3J0RGF0ZTogbnVtYmVyID0gcGVyZm9ybWFuY2Uubm93KCk7XG5cbiAgLyoqXG4gICAqIFRoZSBjbG9jayBpcyByZWFsdGltZS4geWVhaC5cbiAgICovXG4gIHB1YmxpYyBnZXQgaXNSZWFsdGltZSgpOiBib29sZWFuIHsgcmV0dXJuIHRydWU7IH1cblxuICAvKipcbiAgICogVXBkYXRlIHRoZSBjbG9jay4gVGltZSBpcyBjYWxjdWxhdGVkIGJhc2VkIG9uIHRpbWUgaW4gcmVhbCB3b3JsZC5cbiAgICovXG4gIHB1YmxpYyB1cGRhdGUoKTogdm9pZCB7XG4gICAgY29uc3Qgbm93ID0gcGVyZm9ybWFuY2Uubm93KCk7XG5cbiAgICBpZiAoIHRoaXMuX19pc1BsYXlpbmcgKSB7XG4gICAgICBjb25zdCBwcmV2VGltZSA9IHRoaXMuX190aW1lO1xuICAgICAgY29uc3QgZGVsdGFEYXRlID0gKCBub3cgLSB0aGlzLl9fcnREYXRlICk7XG4gICAgICB0aGlzLl9fdGltZSA9IHRoaXMuX19ydFRpbWUgKyBkZWx0YURhdGUgLyAxMDAwLjA7XG4gICAgICB0aGlzLl9fZGVsdGFUaW1lID0gdGhpcy50aW1lIC0gcHJldlRpbWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX19ydFRpbWUgPSB0aGlzLnRpbWU7XG4gICAgICB0aGlzLl9fcnREYXRlID0gbm93O1xuICAgICAgdGhpcy5fX2RlbHRhVGltZSA9IDAuMDtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogU2V0IHRoZSB0aW1lIG1hbnVhbGx5LlxuICAgKiBAcGFyYW0gdGltZSBUaW1lXG4gICAqL1xuICBwdWJsaWMgc2V0VGltZSggdGltZTogbnVtYmVyICk6IHZvaWQge1xuICAgIHRoaXMuX190aW1lID0gdGltZTtcbiAgICB0aGlzLl9fcnRUaW1lID0gdGhpcy50aW1lO1xuICAgIHRoaXMuX19ydERhdGUgPSBwZXJmb3JtYW5jZS5ub3coKTtcbiAgfVxufVxuIiwiLyoqXG4gKiBgbGVycGAsIG9yIGBtaXhgXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBsZXJwKCBhOiBudW1iZXIsIGI6IG51bWJlciwgeDogbnVtYmVyICk6IG51bWJlciB7XG4gIHJldHVybiBhICsgKCBiIC0gYSApICogeDtcbn1cblxuLyoqXG4gKiBgY2xhbXBgXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjbGFtcCggeDogbnVtYmVyLCBsOiBudW1iZXIsIGg6IG51bWJlciApOiBudW1iZXIge1xuICByZXR1cm4gTWF0aC5taW4oIE1hdGgubWF4KCB4LCBsICksIGggKTtcbn1cblxuLyoqXG4gKiBgY2xhbXAoIHgsIDAuMCwgMS4wIClgXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzYXR1cmF0ZSggeDogbnVtYmVyICk6IG51bWJlciB7XG4gIHJldHVybiBjbGFtcCggeCwgMC4wLCAxLjAgKTtcbn1cblxuLyoqXG4gKiBgc21vb3Roc3RlcGAgYnV0IG5vdCBzbW9vdGhcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGxpbmVhcnN0ZXAoIGE6IG51bWJlciwgYjogbnVtYmVyLCB4OiBudW1iZXIgKTogbnVtYmVyIHtcbiAgcmV0dXJuIHNhdHVyYXRlKCAoIHggLSBhICkgLyAoIGIgLSBhICkgKTtcbn1cblxuLyoqXG4gKiB3b3JsZCBmYW1vdXMgYHNtb290aHN0ZXBgIGZ1bmN0aW9uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzbW9vdGhzdGVwKCBhOiBudW1iZXIsIGI6IG51bWJlciwgeDogbnVtYmVyICk6IG51bWJlciB7XG4gIGNvbnN0IHQgPSBsaW5lYXJzdGVwKCBhLCBiLCB4ICk7XG4gIHJldHVybiB0ICogdCAqICggMy4wIC0gMi4wICogdCApO1xufVxuXG4vKipcbiAqIGBzbW9vdGhzdGVwYCBidXQgbW9yZSBzbW9vdGhcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNtb290aGVyc3RlcCggYTogbnVtYmVyLCBiOiBudW1iZXIsIHg6IG51bWJlciApOiBudW1iZXIge1xuICBjb25zdCB0ID0gbGluZWFyc3RlcCggYSwgYiwgeCApO1xuICByZXR1cm4gdCAqIHQgKiB0ICogKCB0ICogKCB0ICogNi4wIC0gMTUuMCApICsgMTAuMCApO1xufVxuXG4vKipcbiAqIGBzbW9vdGhzdGVwYCBidXQgV0FZIG1vcmUgc21vb3RoXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzbW9vdGhlc3RzdGVwKCBhOiBudW1iZXIsIGI6IG51bWJlciwgeDogbnVtYmVyICk6IG51bWJlciB7XG4gIGNvbnN0IHQgPSBsaW5lYXJzdGVwKCBhLCBiLCB4ICk7XG4gIHJldHVybiB0ICogdCAqIHQgKiB0ICogKCB0ICogKCB0ICogKCAtMjAuMCAqIHQgKyA3MC4wICkgLSA4NC4wICkgKyAzNS4wICk7XG59XG4iLCJpbXBvcnQgeyBsZXJwIH0gZnJvbSAnLi4vbWF0aC91dGlscyc7XG5cbi8qKlxuICogRG8gZXhwIHNtb290aGluZ1xuICovXG5leHBvcnQgY2xhc3MgRXhwU21vb3RoIHtcbiAgcHVibGljIGZhY3RvciA9IDEwLjA7XG4gIHB1YmxpYyB0YXJnZXQgPSAwLjA7XG4gIHB1YmxpYyB2YWx1ZSA9IDAuMDtcblxuICBwdWJsaWMgdXBkYXRlKCBkZWx0YVRpbWU6IG51bWJlciApOiBudW1iZXIge1xuICAgIHRoaXMudmFsdWUgPSBsZXJwKCB0aGlzLnRhcmdldCwgdGhpcy52YWx1ZSwgTWF0aC5leHAoIC10aGlzLmZhY3RvciAqIGRlbHRhVGltZSApICk7XG4gICAgcmV0dXJuIHRoaXMudmFsdWU7XG4gIH1cbn1cbiIsIi8qKlxuICogSXRlcmFibGUgRml6ekJ1enpcbiAqL1xuZXhwb3J0IGNsYXNzIEZpenpCdXp6IGltcGxlbWVudHMgSXRlcmFibGU8bnVtYmVyIHwgc3RyaW5nPiB7XG4gIHB1YmxpYyBzdGF0aWMgV29yZHNEZWZhdWx0OiBNYXA8bnVtYmVyLCBzdHJpbmc+ID0gbmV3IE1hcCggW1xuICAgIFsgMywgJ0ZpenonIF0sXG4gICAgWyA1LCAnQnV6eicgXVxuICBdICk7XG5cbiAgcHJpdmF0ZSBfX3dvcmRzOiBNYXA8bnVtYmVyLCBzdHJpbmc+O1xuICBwcml2YXRlIF9faW5kZXg6IG51bWJlcjtcbiAgcHJpdmF0ZSBfX2VuZDogbnVtYmVyO1xuXG4gIHB1YmxpYyBjb25zdHJ1Y3Rvciggd29yZHM6IE1hcDxudW1iZXIsIHN0cmluZz4gPSBGaXp6QnV6ei5Xb3Jkc0RlZmF1bHQsIGluZGV4ID0gMSwgZW5kID0gMTAwICkge1xuICAgIHRoaXMuX193b3JkcyA9IHdvcmRzO1xuICAgIHRoaXMuX19pbmRleCA9IGluZGV4O1xuICAgIHRoaXMuX19lbmQgPSBlbmQ7XG4gIH1cblxuICBwdWJsaWMgWyBTeW1ib2wuaXRlcmF0b3IgXSgpOiBJdGVyYXRvcjxzdHJpbmcgfCBudW1iZXIsIGFueSwgdW5kZWZpbmVkPiB7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBwdWJsaWMgbmV4dCgpOiBJdGVyYXRvclJlc3VsdDxudW1iZXIgfCBzdHJpbmc+IHtcbiAgICBpZiAoIHRoaXMuX19lbmQgPCB0aGlzLl9faW5kZXggKSB7XG4gICAgICByZXR1cm4geyBkb25lOiB0cnVlLCB2YWx1ZTogbnVsbCB9O1xuICAgIH1cblxuICAgIGxldCB2YWx1ZTogbnVtYmVyIHwgc3RyaW5nID0gJyc7XG4gICAgZm9yICggY29uc3QgWyByZW0sIHdvcmQgXSBvZiB0aGlzLl9fd29yZHMgKSB7XG4gICAgICBpZiAoICggdGhpcy5fX2luZGV4ICUgcmVtICkgPT09IDAgKSB7XG4gICAgICAgIHZhbHVlICs9IHdvcmQ7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKCB2YWx1ZSA9PT0gJycgKSB7XG4gICAgICB2YWx1ZSA9IHRoaXMuX19pbmRleDtcbiAgICB9XG5cbiAgICB0aGlzLl9faW5kZXggKys7XG5cbiAgICByZXR1cm4geyBkb25lOiBmYWxzZSwgdmFsdWUgfTtcbiAgfVxufVxuIiwiLyoqXG4gKiBNb3N0IGF3ZXNvbWUgY2F0IGV2ZXJcbiAqL1xuZXhwb3J0IGNsYXNzIEZNU19DYXQgeyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lXG4gIC8qKlxuICAgKiBGTVNfQ2F0LmdpZlxuICAgKi9cbiAgcHVibGljIHN0YXRpYyBnaWYgPSAnaHR0cHM6Ly9mbXMtY2F0LmNvbS9pbWFnZXMvZm1zX2NhdC5naWYnO1xuXG4gIC8qKlxuICAgKiBGTVNfQ2F0LnBuZ1xuICAgKi9cbiAgcHVibGljIHN0YXRpYyBwbmcgPSAnaHR0cHM6Ly9mbXMtY2F0LmNvbS9pbWFnZXMvZm1zX2NhdC5wbmcnO1xufVxuIiwiLyoqXG4gKiBVc2VmdWwgZm9yIGZwcyBjYWxjXG4gKi9cbmV4cG9ydCBjbGFzcyBIaXN0b3J5TWVhbkNhbGN1bGF0b3Ige1xuICBwcml2YXRlIF9fcmVjYWxjRm9yRWFjaCA9IDA7XG4gIHByaXZhdGUgX19jb3VudFVudGlsUmVjYWxjID0gMDtcbiAgcHJpdmF0ZSBfX2hpc3Rvcnk6IG51bWJlcltdID0gW107XG4gIHByaXZhdGUgX19pbmRleCA9IDA7XG4gIHByaXZhdGUgX19sZW5ndGg6IG51bWJlcjtcbiAgcHJpdmF0ZSBfX2NvdW50ID0gMDtcbiAgcHJpdmF0ZSBfX2NhY2hlID0gMDtcblxuICBwdWJsaWMgY29uc3RydWN0b3IoIGxlbmd0aDogbnVtYmVyICkge1xuICAgIHRoaXMuX19sZW5ndGggPSBsZW5ndGg7XG4gICAgdGhpcy5fX3JlY2FsY0ZvckVhY2ggPSBsZW5ndGg7XG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgbGVuZ3RoOyBpICsrICkge1xuICAgICAgdGhpcy5fX2hpc3RvcnlbIGkgXSA9IDA7XG4gICAgfVxuICB9XG5cbiAgcHVibGljIGdldCBtZWFuKCk6IG51bWJlciB7XG4gICAgY29uc3QgY291bnQgPSBNYXRoLm1pbiggdGhpcy5fX2NvdW50LCB0aGlzLl9fbGVuZ3RoICk7XG4gICAgcmV0dXJuIGNvdW50ID09PSAwID8gMC4wIDogdGhpcy5fX2NhY2hlIC8gY291bnQ7XG4gIH1cblxuICBwdWJsaWMgZ2V0IHJlY2FsY0ZvckVhY2goKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5fX3JlY2FsY0ZvckVhY2g7XG4gIH1cblxuICBwdWJsaWMgc2V0IHJlY2FsY0ZvckVhY2goIHZhbHVlOiBudW1iZXIgKSB7XG4gICAgY29uc3QgZGVsdGEgPSB2YWx1ZSAtIHRoaXMuX19yZWNhbGNGb3JFYWNoO1xuICAgIHRoaXMuX19yZWNhbGNGb3JFYWNoID0gdmFsdWU7XG4gICAgdGhpcy5fX2NvdW50VW50aWxSZWNhbGMgPSBNYXRoLm1heCggMCwgdGhpcy5fX2NvdW50VW50aWxSZWNhbGMgKyBkZWx0YSApO1xuICB9XG5cbiAgcHVibGljIHJlc2V0KCk6IHZvaWQge1xuICAgIHRoaXMuX19pbmRleCA9IDA7XG4gICAgdGhpcy5fX2NvdW50ID0gMDtcbiAgICB0aGlzLl9fY2FjaGUgPSAwO1xuICAgIHRoaXMuX19jb3VudFVudGlsUmVjYWxjID0gMDtcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB0aGlzLl9fbGVuZ3RoOyBpICsrICkge1xuICAgICAgdGhpcy5fX2hpc3RvcnlbIGkgXSA9IDA7XG4gICAgfVxuICB9XG5cbiAgcHVibGljIHB1c2goIHZhbHVlOiBudW1iZXIgKTogdm9pZCB7XG4gICAgY29uc3QgcHJldiA9IHRoaXMuX19oaXN0b3J5WyB0aGlzLl9faW5kZXggXTtcbiAgICB0aGlzLl9faGlzdG9yeVsgdGhpcy5fX2luZGV4IF0gPSB2YWx1ZTtcbiAgICB0aGlzLl9fY291bnQgKys7XG4gICAgdGhpcy5fX2luZGV4ID0gKCB0aGlzLl9faW5kZXggKyAxICkgJSB0aGlzLl9fbGVuZ3RoO1xuXG4gICAgaWYgKCB0aGlzLl9fY291bnRVbnRpbFJlY2FsYyA9PT0gMCApIHtcbiAgICAgIHRoaXMucmVjYWxjKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX19jb3VudFVudGlsUmVjYWxjIC0tO1xuICAgICAgdGhpcy5fX2NhY2hlIC09IHByZXY7XG4gICAgICB0aGlzLl9fY2FjaGUgKz0gdmFsdWU7XG4gICAgfVxuICB9XG5cbiAgcHVibGljIHJlY2FsYygpOiB2b2lkIHtcbiAgICB0aGlzLl9fY291bnRVbnRpbFJlY2FsYyA9IHRoaXMuX19yZWNhbGNGb3JFYWNoO1xuICAgIGNvbnN0IHN1bSA9IHRoaXMuX19oaXN0b3J5XG4gICAgICAuc2xpY2UoIDAsIE1hdGgubWluKCB0aGlzLl9fY291bnQsIHRoaXMuX19sZW5ndGggKSApXG4gICAgICAucmVkdWNlKCAoIHN1bSwgdiApID0+IHN1bSArIHYsIDAgKTtcbiAgICB0aGlzLl9fY2FjaGUgPSBzdW07XG4gIH1cbn1cbiIsImltcG9ydCB7IGJpbmFyeVNlYXJjaCB9IGZyb20gJy4uL2FsZ29yaXRobS9iaW5hcnlTZWFyY2gnO1xuXG4vKipcbiAqIFVzZWZ1bCBmb3IgdGFwIHRlbXBvXG4gKiBTZWUgYWxzbzoge0BsaW5rIEhpc3RvcnlNZWFuQ2FsY3VsYXRvcn1cbiAqL1xuZXhwb3J0IGNsYXNzIEhpc3RvcnlNZWRpYW5DYWxjdWxhdG9yIHtcbiAgcHJpdmF0ZSBfX2hpc3Rvcnk6IG51bWJlcltdID0gW107XG4gIHByaXZhdGUgX19zb3J0ZWQ6IG51bWJlcltdID0gW107XG4gIHByaXZhdGUgX19pbmRleCA9IDA7XG4gIHByaXZhdGUgcmVhZG9ubHkgX19sZW5ndGg6IG51bWJlcjtcblxuICBwdWJsaWMgY29uc3RydWN0b3IoIGxlbmd0aDogbnVtYmVyICkge1xuICAgIHRoaXMuX19sZW5ndGggPSBsZW5ndGg7XG4gIH1cblxuICBwdWJsaWMgZ2V0IG1lZGlhbigpOiBudW1iZXIge1xuICAgIGNvbnN0IGNvdW50ID0gTWF0aC5taW4oIHRoaXMuX19zb3J0ZWQubGVuZ3RoLCB0aGlzLl9fbGVuZ3RoICk7XG4gICAgcmV0dXJuIHRoaXMuX19zb3J0ZWRbIE1hdGguZmxvb3IoICggY291bnQgLSAxICkgLyAyICkgXTtcbiAgfVxuXG4gIHB1YmxpYyByZXNldCgpOiB2b2lkIHtcbiAgICB0aGlzLl9faW5kZXggPSAwO1xuICAgIHRoaXMuX19oaXN0b3J5ID0gW107XG4gICAgdGhpcy5fX3NvcnRlZCA9IFtdO1xuICB9XG5cbiAgcHVibGljIHB1c2goIHZhbHVlOiBudW1iZXIgKTogdm9pZCB7XG4gICAgY29uc3QgcHJldiA9IHRoaXMuX19oaXN0b3J5WyB0aGlzLl9faW5kZXggXTtcbiAgICB0aGlzLl9faGlzdG9yeVsgdGhpcy5fX2luZGV4IF0gPSB2YWx1ZTtcbiAgICB0aGlzLl9faW5kZXggPSAoIHRoaXMuX19pbmRleCArIDEgKSAlIHRoaXMuX19sZW5ndGg7XG5cbiAgICAvLyByZW1vdmUgdGhlIHByZXYgZnJvbSBzb3J0ZWQgYXJyYXlcbiAgICBpZiAoIHRoaXMuX19zb3J0ZWQubGVuZ3RoID09PSB0aGlzLl9fbGVuZ3RoICkge1xuICAgICAgY29uc3QgcHJldkluZGV4ID0gYmluYXJ5U2VhcmNoKCBwcmV2LCB0aGlzLl9fc29ydGVkICk7XG4gICAgICB0aGlzLl9fc29ydGVkLnNwbGljZSggcHJldkluZGV4LCAxICk7XG4gICAgfVxuXG4gICAgY29uc3QgaW5kZXggPSBiaW5hcnlTZWFyY2goIHZhbHVlLCB0aGlzLl9fc29ydGVkICk7XG4gICAgdGhpcy5fX3NvcnRlZC5zcGxpY2UoIGluZGV4LCAwLCB2YWx1ZSApO1xuICB9XG59XG4iLCIvKipcbiAqIEEgVmVjdG9yLlxuICovXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgVmVjdG9yPFQgZXh0ZW5kcyBWZWN0b3I8VD4+IHtcbiAgcHVibGljIGFic3RyYWN0IGVsZW1lbnRzOiBudW1iZXJbXTtcblxuICAvKipcbiAgICogVGhlIGxlbmd0aCBvZiB0aGlzLlxuICAgKiBhLmsuYS4gYG1hZ25pdHVkZWBcbiAgICovXG4gIHB1YmxpYyBnZXQgbGVuZ3RoKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIE1hdGguc3FydCggdGhpcy5lbGVtZW50cy5yZWR1Y2UoICggc3VtLCB2ICkgPT4gc3VtICsgdiAqIHYsIDAuMCApICk7XG4gIH1cblxuICAvKipcbiAgICogQSBub3JtYWxpemVkIFZlY3RvcjMgb2YgdGhpcy5cbiAgICovXG4gIHB1YmxpYyBnZXQgbm9ybWFsaXplZCgpOiBUIHtcbiAgICByZXR1cm4gdGhpcy5zY2FsZSggMS4wIC8gdGhpcy5sZW5ndGggKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDbG9uZSB0aGlzLlxuICAgKi9cbiAgcHVibGljIGNsb25lKCk6IFQge1xuICAgIHJldHVybiB0aGlzLl9fbmV3KCB0aGlzLmVsZW1lbnRzLmNvbmNhdCgpICk7XG4gIH1cblxuICAvKipcbiAgICogQWRkIGEgVmVjdG9yIGludG8gdGhpcy5cbiAgICogQHBhcmFtIHZlY3RvciBBbm90aGVyIFZlY3RvclxuICAgKi9cbiAgcHVibGljIGFkZCggdmVjdG9yOiBUICk6IFQge1xuICAgIHJldHVybiB0aGlzLl9fbmV3KCB0aGlzLmVsZW1lbnRzLm1hcCggKCB2LCBpICkgPT4gdiArIHZlY3Rvci5lbGVtZW50c1sgaSBdICkgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTdWJzdHJhY3QgdGhpcyBmcm9tIGFub3RoZXIgVmVjdG9yLlxuICAgKiBAcGFyYW0gdiBBbm90aGVyIHZlY3RvclxuICAgKi9cbiAgcHVibGljIHN1YiggdmVjdG9yOiBUICk6IFQge1xuICAgIHJldHVybiB0aGlzLl9fbmV3KCB0aGlzLmVsZW1lbnRzLm1hcCggKCB2LCBpICkgPT4gdiAtIHZlY3Rvci5lbGVtZW50c1sgaSBdICkgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBNdWx0aXBseSBhIFZlY3RvciB3aXRoIHRoaXMuXG4gICAqIEBwYXJhbSB2ZWN0b3IgQW5vdGhlciBWZWN0b3JcbiAgICovXG4gIHB1YmxpYyBtdWx0aXBseSggdmVjdG9yOiBUICk6IFQge1xuICAgIHJldHVybiB0aGlzLl9fbmV3KCB0aGlzLmVsZW1lbnRzLm1hcCggKCB2LCBpICkgPT4gdiAqIHZlY3Rvci5lbGVtZW50c1sgaSBdICkgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBEaXZpZGUgdGhpcyBmcm9tIGFub3RoZXIgVmVjdG9yLlxuICAgKiBAcGFyYW0gdmVjdG9yIEFub3RoZXIgVmVjdG9yXG4gICAqL1xuICBwdWJsaWMgZGl2aWRlKCB2ZWN0b3I6IFQgKTogVCB7XG4gICAgcmV0dXJuIHRoaXMuX19uZXcoIHRoaXMuZWxlbWVudHMubWFwKCAoIHYsIGkgKSA9PiB2IC8gdmVjdG9yLmVsZW1lbnRzWyBpIF0gKSApO1xuICB9XG5cbiAgLyoqXG4gICAqIFNjYWxlIHRoaXMgYnkgc2NhbGFyLlxuICAgKiBhLmsuYS4gYG11bHRpcGx5U2NhbGFyYFxuICAgKiBAcGFyYW0gc2NhbGFyIEEgc2NhbGFyXG4gICAqL1xuICBwdWJsaWMgc2NhbGUoIHNjYWxhcjogbnVtYmVyICk6IFQge1xuICAgIHJldHVybiB0aGlzLl9fbmV3KCB0aGlzLmVsZW1lbnRzLm1hcCggKCB2ICkgPT4gdiAqIHNjYWxhciApICk7XG4gIH1cblxuICAvKipcbiAgICogRG90IHR3byBWZWN0b3JzLlxuICAgKiBAcGFyYW0gdmVjdG9yIEFub3RoZXIgdmVjdG9yXG4gICAqL1xuICBwdWJsaWMgZG90KCB2ZWN0b3I6IFQgKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5lbGVtZW50cy5yZWR1Y2UoICggc3VtLCB2LCBpICkgPT4gc3VtICsgdiAqIHZlY3Rvci5lbGVtZW50c1sgaSBdLCAwLjAgKTtcbiAgfVxuXG4gIHByb3RlY3RlZCBhYnN0cmFjdCBfX25ldyggdjogbnVtYmVyW10gKTogVDtcbn1cbiIsImltcG9ydCB7IE1hdHJpeDQgfSBmcm9tICcuL01hdHJpeDQnO1xuaW1wb3J0IHsgUXVhdGVybmlvbiB9IGZyb20gJy4vUXVhdGVybmlvbic7XG5pbXBvcnQgeyBWZWN0b3IgfSBmcm9tICcuL1ZlY3Rvcic7XG5cbmV4cG9ydCB0eXBlIHJhd1ZlY3RvcjMgPSBbIG51bWJlciwgbnVtYmVyLCBudW1iZXIgXTtcblxuLyoqXG4gKiBBIFZlY3RvcjMuXG4gKi9cbmV4cG9ydCBjbGFzcyBWZWN0b3IzIGV4dGVuZHMgVmVjdG9yPFZlY3RvcjM+IHtcbiAgcHVibGljIGVsZW1lbnRzOiByYXdWZWN0b3IzO1xuXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggdjogcmF3VmVjdG9yMyA9IFsgMC4wLCAwLjAsIDAuMCBdICkge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5lbGVtZW50cyA9IHY7XG4gIH1cblxuICAvKipcbiAgICogQW4geCBjb21wb25lbnQgb2YgdGhpcy5cbiAgICovXG4gIHB1YmxpYyBnZXQgeCgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLmVsZW1lbnRzWyAwIF07XG4gIH1cblxuICBwdWJsaWMgc2V0IHgoIHg6IG51bWJlciApIHtcbiAgICB0aGlzLmVsZW1lbnRzWyAwIF0gPSB4O1xuICB9XG5cbiAgLyoqXG4gICAqIEFuIHkgY29tcG9uZW50IG9mIHRoaXMuXG4gICAqL1xuICBwdWJsaWMgZ2V0IHkoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5lbGVtZW50c1sgMSBdO1xuICB9XG5cbiAgcHVibGljIHNldCB5KCB5OiBudW1iZXIgKSB7XG4gICAgdGhpcy5lbGVtZW50c1sgMSBdID0geTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBbiB6IGNvbXBvbmVudCBvZiB0aGlzLlxuICAgKi9cbiAgcHVibGljIGdldCB6KCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuZWxlbWVudHNbIDIgXTtcbiAgfVxuXG4gIHB1YmxpYyBzZXQgeiggejogbnVtYmVyICkge1xuICAgIHRoaXMuZWxlbWVudHNbIDIgXSA9IHo7XG4gIH1cblxuICBwdWJsaWMgdG9TdHJpbmcoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gYFZlY3RvcjMoICR7IHRoaXMueC50b0ZpeGVkKCAzICkgfSwgJHsgdGhpcy55LnRvRml4ZWQoIDMgKSB9LCAkeyB0aGlzLnoudG9GaXhlZCggMyApIH0gKWA7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJuIGEgY3Jvc3Mgb2YgdGhpcyBhbmQgYW5vdGhlciBWZWN0b3IzLlxuICAgKiBAcGFyYW0gdmVjdG9yIEFub3RoZXIgdmVjdG9yXG4gICAqL1xuICBwdWJsaWMgY3Jvc3MoIHZlY3RvcjogVmVjdG9yMyApOiBWZWN0b3IzIHtcbiAgICByZXR1cm4gbmV3IFZlY3RvcjMoIFtcbiAgICAgIHRoaXMueSAqIHZlY3Rvci56IC0gdGhpcy56ICogdmVjdG9yLnksXG4gICAgICB0aGlzLnogKiB2ZWN0b3IueCAtIHRoaXMueCAqIHZlY3Rvci56LFxuICAgICAgdGhpcy54ICogdmVjdG9yLnkgLSB0aGlzLnkgKiB2ZWN0b3IueFxuICAgIF0gKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSb3RhdGUgdGhpcyB2ZWN0b3IgdXNpbmcgYSBRdWF0ZXJuaW9uLlxuICAgKiBAcGFyYW0gcXVhdGVybmlvbiBBIHF1YXRlcm5pb25cbiAgICovXG4gIHB1YmxpYyBhcHBseVF1YXRlcm5pb24oIHF1YXRlcm5pb246IFF1YXRlcm5pb24gKTogVmVjdG9yMyB7XG4gICAgY29uc3QgcCA9IG5ldyBRdWF0ZXJuaW9uKCBbIHRoaXMueCwgdGhpcy55LCB0aGlzLnosIDAuMCBdICk7XG4gICAgY29uc3QgciA9IHF1YXRlcm5pb24uaW52ZXJzZWQ7XG4gICAgY29uc3QgcmVzID0gcXVhdGVybmlvbi5tdWx0aXBseSggcCApLm11bHRpcGx5KCByICk7XG4gICAgcmV0dXJuIG5ldyBWZWN0b3IzKCBbIHJlcy54LCByZXMueSwgcmVzLnogXSApO1xuICB9XG5cbiAgLyoqXG4gICAqIE11bHRpcGx5IHRoaXMgdmVjdG9yICh3aXRoIGFuIGltcGxpY2l0IDEgaW4gdGhlIDR0aCBkaW1lbnNpb24pIGJ5IG0uXG4gICAqL1xuICBwdWJsaWMgYXBwbHlNYXRyaXg0KCBtYXRyaXg6IE1hdHJpeDQgKTogVmVjdG9yMyB7XG4gICAgY29uc3QgbSA9IG1hdHJpeC5lbGVtZW50cztcblxuICAgIGNvbnN0IHcgPSBtWyAzIF0gKiB0aGlzLnggKyBtWyA3IF0gKiB0aGlzLnkgKyBtWyAxMSBdICogdGhpcy56ICsgbVsgMTUgXTtcbiAgICBjb25zdCBpbnZXID0gMS4wIC8gdztcblxuICAgIHJldHVybiBuZXcgVmVjdG9yMyggW1xuICAgICAgKCBtWyAwIF0gKiB0aGlzLnggKyBtWyA0IF0gKiB0aGlzLnkgKyBtWyA4IF0gKiB0aGlzLnogKyBtWyAxMiBdICkgKiBpbnZXLFxuICAgICAgKCBtWyAxIF0gKiB0aGlzLnggKyBtWyA1IF0gKiB0aGlzLnkgKyBtWyA5IF0gKiB0aGlzLnogKyBtWyAxMyBdICkgKiBpbnZXLFxuICAgICAgKCBtWyAyIF0gKiB0aGlzLnggKyBtWyA2IF0gKiB0aGlzLnkgKyBtWyAxMCBdICogdGhpcy56ICsgbVsgMTQgXSApICogaW52V1xuICAgIF0gKTtcbiAgfVxuXG4gIHByb3RlY3RlZCBfX25ldyggdjogcmF3VmVjdG9yMyApOiBWZWN0b3IzIHtcbiAgICByZXR1cm4gbmV3IFZlY3RvcjMoIHYgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBWZWN0b3IzKCAwLjAsIDAuMCwgMC4wIClcbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgZ2V0IHplcm8oKTogVmVjdG9yMyB7XG4gICAgcmV0dXJuIG5ldyBWZWN0b3IzKCBbIDAuMCwgMC4wLCAwLjAgXSApO1xuICB9XG5cbiAgLyoqXG4gICAqIFZlY3RvcjMoIDEuMCwgMS4wLCAxLjAgKVxuICAgKi9cbiAgcHVibGljIHN0YXRpYyBnZXQgb25lKCk6IFZlY3RvcjMge1xuICAgIHJldHVybiBuZXcgVmVjdG9yMyggWyAxLjAsIDEuMCwgMS4wIF0gKTtcbiAgfVxufVxuIiwiaW1wb3J0IHsgTWF0cml4NCB9IGZyb20gJy4vTWF0cml4NCc7XG5pbXBvcnQgeyBWZWN0b3IzIH0gZnJvbSAnLi9WZWN0b3IzJztcblxuZXhwb3J0IHR5cGUgcmF3UXVhdGVybmlvbiA9IFsgbnVtYmVyLCBudW1iZXIsIG51bWJlciwgbnVtYmVyIF07XG5cbmV4cG9ydCBjb25zdCByYXdJZGVudGl0eVF1YXRlcm5pb246IHJhd1F1YXRlcm5pb24gPSBbIDAuMCwgMC4wLCAwLjAsIDEuMCBdO1xuXG4vKipcbiAqIEEgUXVhdGVybmlvbi5cbiAqL1xuZXhwb3J0IGNsYXNzIFF1YXRlcm5pb24ge1xuICBwdWJsaWMgZWxlbWVudHM6IHJhd1F1YXRlcm5pb247IC8vIFsgeCwgeSwgejsgdyBdXG5cbiAgcHVibGljIGNvbnN0cnVjdG9yKCBlbGVtZW50czogcmF3UXVhdGVybmlvbiA9IHJhd0lkZW50aXR5UXVhdGVybmlvbiApIHtcbiAgICB0aGlzLmVsZW1lbnRzID0gZWxlbWVudHM7XG4gIH1cblxuICAvKipcbiAgICogQW4geCBjb21wb25lbnQgb2YgdGhpcy5cbiAgICovXG4gIHB1YmxpYyBnZXQgeCgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLmVsZW1lbnRzWyAwIF07XG4gIH1cblxuICAvKipcbiAgICogQW4geSBjb21wb25lbnQgb2YgdGhpcy5cbiAgICovXG4gIHB1YmxpYyBnZXQgeSgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLmVsZW1lbnRzWyAxIF07XG4gIH1cblxuICAvKipcbiAgICogQW4geiBjb21wb25lbnQgb2YgdGhpcy5cbiAgICovXG4gIHB1YmxpYyBnZXQgeigpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLmVsZW1lbnRzWyAyIF07XG4gIH1cblxuICAvKipcbiAgICogQW4gdyBjb21wb25lbnQgb2YgdGhpcy5cbiAgICovXG4gIHB1YmxpYyBnZXQgdygpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLmVsZW1lbnRzWyAzIF07XG4gIH1cblxuICBwdWJsaWMgdG9TdHJpbmcoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gYFF1YXRlcm5pb24oICR7IHRoaXMueC50b0ZpeGVkKCAzICkgfSwgJHsgdGhpcy55LnRvRml4ZWQoIDMgKSB9LCAkeyB0aGlzLnoudG9GaXhlZCggMyApIH0sICR7IHRoaXMudy50b0ZpeGVkKCAzICkgfSApYDtcbiAgfVxuXG4gIC8qKlxuICAgKiBDbG9uZSB0aGlzLlxuICAgKi9cbiAgcHVibGljIGNsb25lKCk6IFF1YXRlcm5pb24ge1xuICAgIHJldHVybiBuZXcgUXVhdGVybmlvbiggdGhpcy5lbGVtZW50cy5jb25jYXQoKSBhcyByYXdRdWF0ZXJuaW9uICk7XG4gIH1cblxuICAvKipcbiAgICogSXRzZWxmIGJ1dCBjb252ZXJ0ZWQgaW50byBhIE1hdHJpeDQuXG4gICAqL1xuICBwdWJsaWMgZ2V0IG1hdHJpeCgpOiBNYXRyaXg0IHtcbiAgICBjb25zdCB4ID0gbmV3IFZlY3RvcjMoIFsgMS4wLCAwLjAsIDAuMCBdICkuYXBwbHlRdWF0ZXJuaW9uKCB0aGlzICk7XG4gICAgY29uc3QgeSA9IG5ldyBWZWN0b3IzKCBbIDAuMCwgMS4wLCAwLjAgXSApLmFwcGx5UXVhdGVybmlvbiggdGhpcyApO1xuICAgIGNvbnN0IHogPSBuZXcgVmVjdG9yMyggWyAwLjAsIDAuMCwgMS4wIF0gKS5hcHBseVF1YXRlcm5pb24oIHRoaXMgKTtcblxuICAgIHJldHVybiBuZXcgTWF0cml4NCggW1xuICAgICAgeC54LCB5LngsIHoueCwgMC4wLFxuICAgICAgeC55LCB5LnksIHoueSwgMC4wLFxuICAgICAgeC56LCB5LnosIHoueiwgMC4wLFxuICAgICAgMC4wLCAwLjAsIDAuMCwgMS4wXG4gICAgXSApO1xuICB9XG5cbiAgLyoqXG4gICAqIEFuIGludmVyc2Ugb2YgdGhpcy5cbiAgICovXG4gIHB1YmxpYyBnZXQgaW52ZXJzZWQoKTogUXVhdGVybmlvbiB7XG4gICAgcmV0dXJuIG5ldyBRdWF0ZXJuaW9uKCBbXG4gICAgICAtdGhpcy54LFxuICAgICAgLXRoaXMueSxcbiAgICAgIC10aGlzLnosXG4gICAgICB0aGlzLndcbiAgICBdICk7XG4gIH1cblxuICAvKipcbiAgICogTXVsdGlwbHkgdHdvIFF1YXRlcm5pb25zLlxuICAgKiBAcGFyYW0gcSBBbm90aGVyIFF1YXRlcm5pb25cbiAgICovXG4gIHB1YmxpYyBtdWx0aXBseSggcTogUXVhdGVybmlvbiApOiBRdWF0ZXJuaW9uIHtcbiAgICByZXR1cm4gbmV3IFF1YXRlcm5pb24oIFtcbiAgICAgIHRoaXMudyAqIHEueCArIHRoaXMueCAqIHEudyArIHRoaXMueSAqIHEueiAtIHRoaXMueiAqIHEueSxcbiAgICAgIHRoaXMudyAqIHEueSAtIHRoaXMueCAqIHEueiArIHRoaXMueSAqIHEudyArIHRoaXMueiAqIHEueCxcbiAgICAgIHRoaXMudyAqIHEueiArIHRoaXMueCAqIHEueSAtIHRoaXMueSAqIHEueCArIHRoaXMueiAqIHEudyxcbiAgICAgIHRoaXMudyAqIHEudyAtIHRoaXMueCAqIHEueCAtIHRoaXMueSAqIHEueSAtIHRoaXMueiAqIHEuelxuICAgIF0gKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBbiBpZGVudGl0eSBRdWF0ZXJuaW9uLlxuICAgKi9cbiAgcHVibGljIHN0YXRpYyBnZXQgaWRlbnRpdHkoKTogUXVhdGVybmlvbiB7XG4gICAgcmV0dXJuIG5ldyBRdWF0ZXJuaW9uKCByYXdJZGVudGl0eVF1YXRlcm5pb24gKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZW5lcmF0ZSBhIFF1YXRlcm5pb24gb3V0IG9mIGFuZ2xlIGFuZCBheGlzLlxuICAgKi9cbiAgcHVibGljIHN0YXRpYyBmcm9tQXhpc0FuZ2xlKCBheGlzOiBWZWN0b3IzLCBhbmdsZTogbnVtYmVyICk6IFF1YXRlcm5pb24ge1xuICAgIGNvbnN0IGhhbGZBbmdsZSA9IGFuZ2xlIC8gMi4wO1xuICAgIGNvbnN0IHNpbkhhbGZBbmdsZSA9IE1hdGguc2luKCBoYWxmQW5nbGUgKTtcbiAgICByZXR1cm4gbmV3IFF1YXRlcm5pb24oIFtcbiAgICAgIGF4aXMueCAqIHNpbkhhbGZBbmdsZSxcbiAgICAgIGF4aXMueSAqIHNpbkhhbGZBbmdsZSxcbiAgICAgIGF4aXMueiAqIHNpbkhhbGZBbmdsZSxcbiAgICAgIE1hdGguY29zKCBoYWxmQW5nbGUgKVxuICAgIF0gKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZW5lcmF0ZSBhIFF1YXRlcm5pb24gb3V0IG9mIGEgcm90YXRpb24gbWF0cml4LlxuICAgKiBZb2lua2VkIGZyb20gVGhyZWUuanMuXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIGZyb21NYXRyaXgoIG1hdHJpeDogTWF0cml4NCApOiBRdWF0ZXJuaW9uIHtcbiAgICBjb25zdCBtID0gbWF0cml4LmVsZW1lbnRzLFxuICAgICAgbTExID0gbVsgMCBdLCBtMTIgPSBtWyA0IF0sIG0xMyA9IG1bIDggXSxcbiAgICAgIG0yMSA9IG1bIDEgXSwgbTIyID0gbVsgNSBdLCBtMjMgPSBtWyA5IF0sXG4gICAgICBtMzEgPSBtWyAyIF0sIG0zMiA9IG1bIDYgXSwgbTMzID0gbVsgMTAgXSxcbiAgICAgIHRyYWNlID0gbTExICsgbTIyICsgbTMzO1xuXG4gICAgaWYgKCB0cmFjZSA+IDAgKSB7XG4gICAgICBjb25zdCBzID0gMC41IC8gTWF0aC5zcXJ0KCB0cmFjZSArIDEuMCApO1xuICAgICAgcmV0dXJuIG5ldyBRdWF0ZXJuaW9uKCBbXG4gICAgICAgICggbTMyIC0gbTIzICkgKiBzLFxuICAgICAgICAoIG0xMyAtIG0zMSApICogcyxcbiAgICAgICAgKCBtMjEgLSBtMTIgKSAqIHMsXG4gICAgICAgIDAuMjUgLyBzXG4gICAgICBdICk7XG4gICAgfSBlbHNlIGlmICggbTExID4gbTIyICYmIG0xMSA+IG0zMyApIHtcbiAgICAgIGNvbnN0IHMgPSAyLjAgKiBNYXRoLnNxcnQoIDEuMCArIG0xMSAtIG0yMiAtIG0zMyApO1xuICAgICAgcmV0dXJuIG5ldyBRdWF0ZXJuaW9uKCBbXG4gICAgICAgIDAuMjUgKiBzLFxuICAgICAgICAoIG0xMiArIG0yMSApIC8gcyxcbiAgICAgICAgKCBtMTMgKyBtMzEgKSAvIHMsXG4gICAgICAgICggbTMyIC0gbTIzICkgLyBzXG4gICAgICBdICk7XG4gICAgfSBlbHNlIGlmICggbTIyID4gbTMzICkge1xuICAgICAgY29uc3QgcyA9IDIuMCAqIE1hdGguc3FydCggMS4wICsgbTIyIC0gbTExIC0gbTMzICk7XG4gICAgICByZXR1cm4gbmV3IFF1YXRlcm5pb24oIFtcbiAgICAgICAgKCBtMTIgKyBtMjEgKSAvIHMsXG4gICAgICAgIDAuMjUgKiBzLFxuICAgICAgICAoIG0yMyArIG0zMiApIC8gcyxcbiAgICAgICAgKCBtMTMgLSBtMzEgKSAvIHNcbiAgICAgIF0gKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgcyA9IDIuMCAqIE1hdGguc3FydCggMS4wICsgbTMzIC0gbTExIC0gbTIyICk7XG4gICAgICByZXR1cm4gbmV3IFF1YXRlcm5pb24oIFtcbiAgICAgICAgKCBtMTMgKyBtMzEgKSAvIHMsXG4gICAgICAgICggbTIzICsgbTMyICkgLyBzLFxuICAgICAgICAwLjI1ICogcyxcbiAgICAgICAgKCBtMjEgLSBtMTIgKSAvIHNcbiAgICAgIF0gKTtcbiAgICB9XG4gIH1cbn1cbiIsImltcG9ydCB7IFF1YXRlcm5pb24gfSBmcm9tICcuL1F1YXRlcm5pb24nO1xuaW1wb3J0IHsgVmVjdG9yMyB9IGZyb20gJy4vVmVjdG9yMyc7XG5cbmV4cG9ydCB0eXBlIHJhd01hdHJpeDQgPSBbXG4gIG51bWJlciwgbnVtYmVyLCBudW1iZXIsIG51bWJlcixcbiAgbnVtYmVyLCBudW1iZXIsIG51bWJlciwgbnVtYmVyLFxuICBudW1iZXIsIG51bWJlciwgbnVtYmVyLCBudW1iZXIsXG4gIG51bWJlciwgbnVtYmVyLCBudW1iZXIsIG51bWJlclxuXTtcblxuZXhwb3J0IGNvbnN0IHJhd0lkZW50aXR5TWF0cml4NDogcmF3TWF0cml4NCA9IFtcbiAgMS4wLCAwLjAsIDAuMCwgMC4wLFxuICAwLjAsIDEuMCwgMC4wLCAwLjAsXG4gIDAuMCwgMC4wLCAxLjAsIDAuMCxcbiAgMC4wLCAwLjAsIDAuMCwgMS4wXG5dO1xuXG4vKipcbiAqIEEgTWF0cml4NC5cbiAqL1xuZXhwb3J0IGNsYXNzIE1hdHJpeDQge1xuICBwdWJsaWMgZWxlbWVudHM6IHJhd01hdHJpeDQ7XG5cbiAgcHVibGljIGNvbnN0cnVjdG9yKCB2OiByYXdNYXRyaXg0ID0gcmF3SWRlbnRpdHlNYXRyaXg0ICkge1xuICAgIHRoaXMuZWxlbWVudHMgPSB2O1xuICB9XG5cbiAgLyoqXG4gICAqIEl0c2VsZiBidXQgdHJhbnNwb3NlZC5cbiAgICovXG4gIHB1YmxpYyBnZXQgdHJhbnNwb3NlKCk6IE1hdHJpeDQge1xuICAgIGNvbnN0IG0gPSB0aGlzLmVsZW1lbnRzO1xuXG4gICAgcmV0dXJuIG5ldyBNYXRyaXg0KCBbXG4gICAgICBtWyAwIF0sIG1bIDQgXSwgbVsgOCBdLCBtWyAxMiBdLFxuICAgICAgbVsgMSBdLCBtWyA1IF0sIG1bIDkgXSwgbVsgMTMgXSxcbiAgICAgIG1bIDIgXSwgbVsgNiBdLCBtWyAxMCBdLCBtWyAxNCBdLFxuICAgICAgbVsgMyBdLCBtWyA3IF0sIG1bIDExIF0sIG1bIDE1IF1cbiAgICBdICk7XG4gIH1cblxuICAvKipcbiAgICogSXRzIGRldGVybWluYW50LlxuICAgKi9cbiAgcHVibGljIGdldCBkZXRlcm1pbmFudCgpOiBudW1iZXIge1xuICAgIGNvbnN0IG0gPSB0aGlzLmVsZW1lbnRzO1xuICAgIGNvbnN0XG4gICAgICBhMDAgPSBtWyAgMCBdLCBhMDEgPSBtWyAgMSBdLCBhMDIgPSBtWyAgMiBdLCBhMDMgPSBtWyAgMyBdLFxuICAgICAgYTEwID0gbVsgIDQgXSwgYTExID0gbVsgIDUgXSwgYTEyID0gbVsgIDYgXSwgYTEzID0gbVsgIDcgXSxcbiAgICAgIGEyMCA9IG1bICA4IF0sIGEyMSA9IG1bICA5IF0sIGEyMiA9IG1bIDEwIF0sIGEyMyA9IG1bIDExIF0sXG4gICAgICBhMzAgPSBtWyAxMiBdLCBhMzEgPSBtWyAxMyBdLCBhMzIgPSBtWyAxNCBdLCBhMzMgPSBtWyAxNSBdLFxuICAgICAgYjAwID0gYTAwICogYTExIC0gYTAxICogYTEwLCAgYjAxID0gYTAwICogYTEyIC0gYTAyICogYTEwLFxuICAgICAgYjAyID0gYTAwICogYTEzIC0gYTAzICogYTEwLCAgYjAzID0gYTAxICogYTEyIC0gYTAyICogYTExLFxuICAgICAgYjA0ID0gYTAxICogYTEzIC0gYTAzICogYTExLCAgYjA1ID0gYTAyICogYTEzIC0gYTAzICogYTEyLFxuICAgICAgYjA2ID0gYTIwICogYTMxIC0gYTIxICogYTMwLCAgYjA3ID0gYTIwICogYTMyIC0gYTIyICogYTMwLFxuICAgICAgYjA4ID0gYTIwICogYTMzIC0gYTIzICogYTMwLCAgYjA5ID0gYTIxICogYTMyIC0gYTIyICogYTMxLFxuICAgICAgYjEwID0gYTIxICogYTMzIC0gYTIzICogYTMxLCAgYjExID0gYTIyICogYTMzIC0gYTIzICogYTMyO1xuXG4gICAgcmV0dXJuIGIwMCAqIGIxMSAtIGIwMSAqIGIxMCArIGIwMiAqIGIwOSArIGIwMyAqIGIwOCAtIGIwNCAqIGIwNyArIGIwNSAqIGIwNjtcbiAgfVxuXG4gIC8qKlxuICAgKiBJdHNlbGYgYnV0IGludmVydGVkLlxuICAgKi9cbiAgcHVibGljIGdldCBpbnZlcnNlKCk6IE1hdHJpeDQgfCBudWxsIHtcbiAgICBjb25zdCBtID0gdGhpcy5lbGVtZW50cztcbiAgICBjb25zdFxuICAgICAgYTAwID0gbVsgIDAgXSwgYTAxID0gbVsgIDEgXSwgYTAyID0gbVsgIDIgXSwgYTAzID0gbVsgIDMgXSxcbiAgICAgIGExMCA9IG1bICA0IF0sIGExMSA9IG1bICA1IF0sIGExMiA9IG1bICA2IF0sIGExMyA9IG1bICA3IF0sXG4gICAgICBhMjAgPSBtWyAgOCBdLCBhMjEgPSBtWyAgOSBdLCBhMjIgPSBtWyAxMCBdLCBhMjMgPSBtWyAxMSBdLFxuICAgICAgYTMwID0gbVsgMTIgXSwgYTMxID0gbVsgMTMgXSwgYTMyID0gbVsgMTQgXSwgYTMzID0gbVsgMTUgXSxcbiAgICAgIGIwMCA9IGEwMCAqIGExMSAtIGEwMSAqIGExMCwgIGIwMSA9IGEwMCAqIGExMiAtIGEwMiAqIGExMCxcbiAgICAgIGIwMiA9IGEwMCAqIGExMyAtIGEwMyAqIGExMCwgIGIwMyA9IGEwMSAqIGExMiAtIGEwMiAqIGExMSxcbiAgICAgIGIwNCA9IGEwMSAqIGExMyAtIGEwMyAqIGExMSwgIGIwNSA9IGEwMiAqIGExMyAtIGEwMyAqIGExMixcbiAgICAgIGIwNiA9IGEyMCAqIGEzMSAtIGEyMSAqIGEzMCwgIGIwNyA9IGEyMCAqIGEzMiAtIGEyMiAqIGEzMCxcbiAgICAgIGIwOCA9IGEyMCAqIGEzMyAtIGEyMyAqIGEzMCwgIGIwOSA9IGEyMSAqIGEzMiAtIGEyMiAqIGEzMSxcbiAgICAgIGIxMCA9IGEyMSAqIGEzMyAtIGEyMyAqIGEzMSwgIGIxMSA9IGEyMiAqIGEzMyAtIGEyMyAqIGEzMjtcblxuICAgIGNvbnN0IGRldCA9IGIwMCAqIGIxMSAtIGIwMSAqIGIxMCArIGIwMiAqIGIwOSArIGIwMyAqIGIwOCAtIGIwNCAqIGIwNyArIGIwNSAqIGIwNjtcblxuICAgIGlmICggZGV0ID09PSAwLjAgKSB7IHJldHVybiBudWxsOyB9XG5cbiAgICBjb25zdCBpbnZEZXQgPSAxLjAgLyBkZXQ7XG5cbiAgICByZXR1cm4gbmV3IE1hdHJpeDQoIFtcbiAgICAgIGExMSAqIGIxMSAtIGExMiAqIGIxMCArIGExMyAqIGIwOSxcbiAgICAgIGEwMiAqIGIxMCAtIGEwMSAqIGIxMSAtIGEwMyAqIGIwOSxcbiAgICAgIGEzMSAqIGIwNSAtIGEzMiAqIGIwNCArIGEzMyAqIGIwMyxcbiAgICAgIGEyMiAqIGIwNCAtIGEyMSAqIGIwNSAtIGEyMyAqIGIwMyxcbiAgICAgIGExMiAqIGIwOCAtIGExMCAqIGIxMSAtIGExMyAqIGIwNyxcbiAgICAgIGEwMCAqIGIxMSAtIGEwMiAqIGIwOCArIGEwMyAqIGIwNyxcbiAgICAgIGEzMiAqIGIwMiAtIGEzMCAqIGIwNSAtIGEzMyAqIGIwMSxcbiAgICAgIGEyMCAqIGIwNSAtIGEyMiAqIGIwMiArIGEyMyAqIGIwMSxcbiAgICAgIGExMCAqIGIxMCAtIGExMSAqIGIwOCArIGExMyAqIGIwNixcbiAgICAgIGEwMSAqIGIwOCAtIGEwMCAqIGIxMCAtIGEwMyAqIGIwNixcbiAgICAgIGEzMCAqIGIwNCAtIGEzMSAqIGIwMiArIGEzMyAqIGIwMCxcbiAgICAgIGEyMSAqIGIwMiAtIGEyMCAqIGIwNCAtIGEyMyAqIGIwMCxcbiAgICAgIGExMSAqIGIwNyAtIGExMCAqIGIwOSAtIGExMiAqIGIwNixcbiAgICAgIGEwMCAqIGIwOSAtIGEwMSAqIGIwNyArIGEwMiAqIGIwNixcbiAgICAgIGEzMSAqIGIwMSAtIGEzMCAqIGIwMyAtIGEzMiAqIGIwMCxcbiAgICAgIGEyMCAqIGIwMyAtIGEyMSAqIGIwMSArIGEyMiAqIGIwMFxuICAgIF0ubWFwKCAoIHYgKSA9PiB2ICogaW52RGV0ICkgYXMgcmF3TWF0cml4NCApO1xuICB9XG5cbiAgcHVibGljIHRvU3RyaW5nKCk6IHN0cmluZyB7XG4gICAgY29uc3QgbSA9IHRoaXMuZWxlbWVudHMubWFwKCAoIHYgKSA9PiB2LnRvRml4ZWQoIDMgKSApO1xuICAgIHJldHVybiBgTWF0cml4NCggJHsgbVsgMCBdIH0sICR7IG1bIDQgXSB9LCAkeyBtWyA4IF0gfSwgJHsgbVsgMTIgXSB9OyAkeyBtWyAxIF0gfSwgJHsgbVsgNSBdIH0sICR7IG1bIDkgXSB9LCAkeyBtWyAxMyBdIH07ICR7IG1bIDIgXSB9LCAkeyBtWyA2IF0gfSwgJHsgbVsgMTAgXSB9LCAkeyBtWyAxNCBdIH07ICR7IG1bIDMgXSB9LCAkeyBtWyA3IF0gfSwgJHsgbVsgMTEgXSB9LCAkeyBtWyAxNSBdIH0gKWA7XG4gIH1cblxuICAvKipcbiAgICogQ2xvbmUgdGhpcy5cbiAgICovXG4gIHB1YmxpYyBjbG9uZSgpOiBNYXRyaXg0IHtcbiAgICByZXR1cm4gbmV3IE1hdHJpeDQoIHRoaXMuZWxlbWVudHMuY29uY2F0KCkgYXMgcmF3TWF0cml4NCApO1xuICB9XG5cbiAgLyoqXG4gICAqIE11bHRpcGx5IHRoaXMgTWF0cml4NCBieSBvbmUgb3IgbW9yZSBNYXRyaXg0cy5cbiAgICovXG4gIHB1YmxpYyBtdWx0aXBseSggLi4ubWF0cmljZXM6IE1hdHJpeDRbXSApOiBNYXRyaXg0IHtcbiAgICBpZiAoIG1hdHJpY2VzLmxlbmd0aCA9PT0gMCApIHtcbiAgICAgIHJldHVybiB0aGlzLmNsb25lKCk7XG4gICAgfVxuXG4gICAgY29uc3QgYXJyID0gbWF0cmljZXMuY29uY2F0KCk7XG4gICAgbGV0IGJNYXQgPSBhcnIuc2hpZnQoKSE7XG4gICAgaWYgKCAwIDwgYXJyLmxlbmd0aCApIHtcbiAgICAgIGJNYXQgPSBiTWF0Lm11bHRpcGx5KCAuLi5hcnIgKTtcbiAgICB9XG5cbiAgICBjb25zdCBhID0gdGhpcy5lbGVtZW50cztcbiAgICBjb25zdCBiID0gYk1hdC5lbGVtZW50cztcblxuICAgIHJldHVybiBuZXcgTWF0cml4NCggW1xuICAgICAgYVsgMCBdICogYlsgMCBdICsgYVsgNCBdICogYlsgMSBdICsgYVsgOCBdICogYlsgMiBdICsgYVsgMTIgXSAqIGJbIDMgXSxcbiAgICAgIGFbIDEgXSAqIGJbIDAgXSArIGFbIDUgXSAqIGJbIDEgXSArIGFbIDkgXSAqIGJbIDIgXSArIGFbIDEzIF0gKiBiWyAzIF0sXG4gICAgICBhWyAyIF0gKiBiWyAwIF0gKyBhWyA2IF0gKiBiWyAxIF0gKyBhWyAxMCBdICogYlsgMiBdICsgYVsgMTQgXSAqIGJbIDMgXSxcbiAgICAgIGFbIDMgXSAqIGJbIDAgXSArIGFbIDcgXSAqIGJbIDEgXSArIGFbIDExIF0gKiBiWyAyIF0gKyBhWyAxNSBdICogYlsgMyBdLFxuXG4gICAgICBhWyAwIF0gKiBiWyA0IF0gKyBhWyA0IF0gKiBiWyA1IF0gKyBhWyA4IF0gKiBiWyA2IF0gKyBhWyAxMiBdICogYlsgNyBdLFxuICAgICAgYVsgMSBdICogYlsgNCBdICsgYVsgNSBdICogYlsgNSBdICsgYVsgOSBdICogYlsgNiBdICsgYVsgMTMgXSAqIGJbIDcgXSxcbiAgICAgIGFbIDIgXSAqIGJbIDQgXSArIGFbIDYgXSAqIGJbIDUgXSArIGFbIDEwIF0gKiBiWyA2IF0gKyBhWyAxNCBdICogYlsgNyBdLFxuICAgICAgYVsgMyBdICogYlsgNCBdICsgYVsgNyBdICogYlsgNSBdICsgYVsgMTEgXSAqIGJbIDYgXSArIGFbIDE1IF0gKiBiWyA3IF0sXG5cbiAgICAgIGFbIDAgXSAqIGJbIDggXSArIGFbIDQgXSAqIGJbIDkgXSArIGFbIDggXSAqIGJbIDEwIF0gKyBhWyAxMiBdICogYlsgMTEgXSxcbiAgICAgIGFbIDEgXSAqIGJbIDggXSArIGFbIDUgXSAqIGJbIDkgXSArIGFbIDkgXSAqIGJbIDEwIF0gKyBhWyAxMyBdICogYlsgMTEgXSxcbiAgICAgIGFbIDIgXSAqIGJbIDggXSArIGFbIDYgXSAqIGJbIDkgXSArIGFbIDEwIF0gKiBiWyAxMCBdICsgYVsgMTQgXSAqIGJbIDExIF0sXG4gICAgICBhWyAzIF0gKiBiWyA4IF0gKyBhWyA3IF0gKiBiWyA5IF0gKyBhWyAxMSBdICogYlsgMTAgXSArIGFbIDE1IF0gKiBiWyAxMSBdLFxuXG4gICAgICBhWyAwIF0gKiBiWyAxMiBdICsgYVsgNCBdICogYlsgMTMgXSArIGFbIDggXSAqIGJbIDE0IF0gKyBhWyAxMiBdICogYlsgMTUgXSxcbiAgICAgIGFbIDEgXSAqIGJbIDEyIF0gKyBhWyA1IF0gKiBiWyAxMyBdICsgYVsgOSBdICogYlsgMTQgXSArIGFbIDEzIF0gKiBiWyAxNSBdLFxuICAgICAgYVsgMiBdICogYlsgMTIgXSArIGFbIDYgXSAqIGJbIDEzIF0gKyBhWyAxMCBdICogYlsgMTQgXSArIGFbIDE0IF0gKiBiWyAxNSBdLFxuICAgICAgYVsgMyBdICogYlsgMTIgXSArIGFbIDcgXSAqIGJbIDEzIF0gKyBhWyAxMSBdICogYlsgMTQgXSArIGFbIDE1IF0gKiBiWyAxNSBdXG4gICAgXSApO1xuICB9XG5cbiAgLyoqXG4gICAqIE11bHRpcGx5IHRoaXMgTWF0cml4NCBieSBhIHNjYWxhclxuICAgKi9cbiAgcHVibGljIHNjYWxlU2NhbGFyKCBzY2FsYXI6IG51bWJlciApOiBNYXRyaXg0IHtcbiAgICByZXR1cm4gbmV3IE1hdHJpeDQoIHRoaXMuZWxlbWVudHMubWFwKCAoIHYgKSA9PiB2ICogc2NhbGFyICkgYXMgcmF3TWF0cml4NCApO1xuICB9XG5cbiAgLyoqXG4gICAqIEFuIGlkZW50aXR5IE1hdHJpeDQuXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIGdldCBpZGVudGl0eSgpOiBNYXRyaXg0IHtcbiAgICByZXR1cm4gbmV3IE1hdHJpeDQoIHJhd0lkZW50aXR5TWF0cml4NCApO1xuICB9XG5cbiAgcHVibGljIHN0YXRpYyBtdWx0aXBseSggLi4ubWF0cmljZXM6IE1hdHJpeDRbXSApOiBNYXRyaXg0IHtcbiAgICBpZiAoIG1hdHJpY2VzLmxlbmd0aCA9PT0gMCApIHtcbiAgICAgIHJldHVybiBNYXRyaXg0LmlkZW50aXR5O1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBiTWF0cyA9IG1hdHJpY2VzLmNvbmNhdCgpO1xuICAgICAgY29uc3QgYU1hdCA9IGJNYXRzLnNoaWZ0KCkhO1xuICAgICAgcmV0dXJuIGFNYXQubXVsdGlwbHkoIC4uLmJNYXRzICk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEdlbmVyYXRlIGEgdHJhbnNsYXRpb24gbWF0cml4LlxuICAgKiBAcGFyYW0gdmVjdG9yIFRyYW5zbGF0aW9uXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIHRyYW5zbGF0ZSggdmVjdG9yOiBWZWN0b3IzICk6IE1hdHJpeDQge1xuICAgIHJldHVybiBuZXcgTWF0cml4NCggW1xuICAgICAgMSwgMCwgMCwgMCxcbiAgICAgIDAsIDEsIDAsIDAsXG4gICAgICAwLCAwLCAxLCAwLFxuICAgICAgdmVjdG9yLngsIHZlY3Rvci55LCB2ZWN0b3IueiwgMVxuICAgIF0gKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZW5lcmF0ZSBhIDNkIHNjYWxpbmcgbWF0cml4LlxuICAgKiBAcGFyYW0gdmVjdG9yIFNjYWxlXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIHNjYWxlKCB2ZWN0b3I6IFZlY3RvcjMgKTogTWF0cml4NCB7XG4gICAgcmV0dXJuIG5ldyBNYXRyaXg0KCBbXG4gICAgICB2ZWN0b3IueCwgMCwgMCwgMCxcbiAgICAgIDAsIHZlY3Rvci55LCAwLCAwLFxuICAgICAgMCwgMCwgdmVjdG9yLnosIDAsXG4gICAgICAwLCAwLCAwLCAxXG4gICAgXSApO1xuICB9XG5cbiAgLyoqXG4gICAqIEdlbmVyYXRlIGEgM2Qgc2NhbGluZyBtYXRyaXggYnkgYSBzY2FsYXIuXG4gICAqIEBwYXJhbSB2ZWN0b3IgU2NhbGVcbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgc2NhbGVTY2FsYXIoIHNjYWxhcjogbnVtYmVyICk6IE1hdHJpeDQge1xuICAgIHJldHVybiBuZXcgTWF0cml4NCggW1xuICAgICAgc2NhbGFyLCAwLCAwLCAwLFxuICAgICAgMCwgc2NhbGFyLCAwLCAwLFxuICAgICAgMCwgMCwgc2NhbGFyLCAwLFxuICAgICAgMCwgMCwgMCwgMVxuICAgIF0gKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZW5lcmF0ZSBhIDNkIHJvdGF0aW9uIG1hdHJpeCwgcm90YXRlcyBhcm91bmQgeCBheGlzLlxuICAgKiBAcGFyYW0gdmVjdG9yIFNjYWxlXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIHJvdGF0ZVgoIHRoZXRhOiBudW1iZXIgKTogTWF0cml4NCB7XG4gICAgcmV0dXJuIG5ldyBNYXRyaXg0KCBbXG4gICAgICAxLCAwLCAwLCAwLFxuICAgICAgMCwgTWF0aC5jb3MoIHRoZXRhICksIC1NYXRoLnNpbiggdGhldGEgKSwgMCxcbiAgICAgIDAsIE1hdGguc2luKCB0aGV0YSApLCBNYXRoLmNvcyggdGhldGEgKSwgMCxcbiAgICAgIDAsIDAsIDAsIDFcbiAgICBdICk7XG4gIH1cblxuICAvKipcbiAgICogR2VuZXJhdGUgYSAzZCByb3RhdGlvbiBtYXRyaXgsIHJvdGF0ZXMgYXJvdW5kIHkgYXhpcy5cbiAgICogQHBhcmFtIHZlY3RvciBTY2FsZVxuICAgKi9cbiAgcHVibGljIHN0YXRpYyByb3RhdGVZKCB0aGV0YTogbnVtYmVyICk6IE1hdHJpeDQge1xuICAgIHJldHVybiBuZXcgTWF0cml4NCggW1xuICAgICAgTWF0aC5jb3MoIHRoZXRhICksIDAsIE1hdGguc2luKCB0aGV0YSApLCAwLFxuICAgICAgMCwgMSwgMCwgMCxcbiAgICAgIC1NYXRoLnNpbiggdGhldGEgKSwgMCwgTWF0aC5jb3MoIHRoZXRhICksIDAsXG4gICAgICAwLCAwLCAwLCAxXG4gICAgXSApO1xuICB9XG5cbiAgLyoqXG4gICAqIEdlbmVyYXRlIGEgM2Qgcm90YXRpb24gbWF0cml4LCByb3RhdGVzIGFyb3VuZCB6IGF4aXMuXG4gICAqIEBwYXJhbSB2ZWN0b3IgU2NhbGVcbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgcm90YXRlWiggdGhldGE6IG51bWJlciApOiBNYXRyaXg0IHtcbiAgICByZXR1cm4gbmV3IE1hdHJpeDQoIFtcbiAgICAgIE1hdGguY29zKCB0aGV0YSApLCAtTWF0aC5zaW4oIHRoZXRhICksIDAsIDAsXG4gICAgICBNYXRoLnNpbiggdGhldGEgKSwgTWF0aC5jb3MoIHRoZXRhICksIDAsIDAsXG4gICAgICAwLCAwLCAxLCAwLFxuICAgICAgMCwgMCwgMCwgMVxuICAgIF0gKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZW5lcmF0ZSBhIFwiTG9va0F0XCIgdmlldyBtYXRyaXguXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIGxvb2tBdChcbiAgICBwb3NpdGlvbjogVmVjdG9yMyxcbiAgICB0YXJnZXQgPSBuZXcgVmVjdG9yMyggWyAwLjAsIDAuMCwgMC4wIF0gKSxcbiAgICB1cCA9IG5ldyBWZWN0b3IzKCBbIDAuMCwgMS4wLCAwLjAgXSApLFxuICAgIHJvbGwgPSAwLjBcbiAgKTogTWF0cml4NCB7XG4gICAgY29uc3QgZGlyID0gcG9zaXRpb24uc3ViKCB0YXJnZXQgKS5ub3JtYWxpemVkO1xuICAgIGxldCBzaWQgPSB1cC5jcm9zcyggZGlyICkubm9ybWFsaXplZDtcbiAgICBsZXQgdG9wID0gZGlyLmNyb3NzKCBzaWQgKTtcbiAgICBzaWQgPSBzaWQuc2NhbGUoIE1hdGguY29zKCByb2xsICkgKS5hZGQoIHRvcC5zY2FsZSggTWF0aC5zaW4oIHJvbGwgKSApICk7XG4gICAgdG9wID0gZGlyLmNyb3NzKCBzaWQgKTtcblxuICAgIHJldHVybiBuZXcgTWF0cml4NCggW1xuICAgICAgc2lkLngsIHNpZC55LCBzaWQueiwgMC4wLFxuICAgICAgdG9wLngsIHRvcC55LCB0b3AueiwgMC4wLFxuICAgICAgZGlyLngsIGRpci55LCBkaXIueiwgMC4wLFxuICAgICAgcG9zaXRpb24ueCwgcG9zaXRpb24ueSwgcG9zaXRpb24ueiwgMS4wXG4gICAgXSApO1xuICB9XG5cbiAgLyoqXG4gICAqIEdlbmVyYXRlIGEgXCJQZXJzcGVjdGl2ZVwiIHByb2plY3Rpb24gbWF0cml4LlxuICAgKiBJdCB3b24ndCBpbmNsdWRlIGFzcGVjdCFcbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgcGVyc3BlY3RpdmUoIGZvdiA9IDQ1LjAsIG5lYXIgPSAwLjAxLCBmYXIgPSAxMDAuMCApOiBNYXRyaXg0IHtcbiAgICBjb25zdCBwID0gMS4wIC8gTWF0aC50YW4oIGZvdiAqIE1hdGguUEkgLyAzNjAuMCApO1xuICAgIGNvbnN0IGQgPSAoIGZhciAtIG5lYXIgKTtcbiAgICByZXR1cm4gbmV3IE1hdHJpeDQoIFtcbiAgICAgIHAsIDAuMCwgMC4wLCAwLjAsXG4gICAgICAwLjAsIHAsIDAuMCwgMC4wLFxuICAgICAgMC4wLCAwLjAsIC0oIGZhciArIG5lYXIgKSAvIGQsIC0xLjAsXG4gICAgICAwLjAsIDAuMCwgLTIgKiBmYXIgKiBuZWFyIC8gZCwgMC4wXG4gICAgXSApO1xuICB9XG5cbiAgLyoqXG4gICAqIERlY29tcG9zZSB0aGlzIG1hdHJpeCBpbnRvIGEgcG9zaXRpb24sIGEgc2NhbGUsIGFuZCBhIHJvdGF0aW9uLlxuICAgKiBZb2lua2VkIGZyb20gVGhyZWUuanMuXG4gICAqL1xuICBwdWJsaWMgZGVjb21wb3NlKCk6IHsgcG9zaXRpb246IFZlY3RvcjM7IHNjYWxlOiBWZWN0b3IzOyByb3RhdGlvbjogUXVhdGVybmlvbiB9IHtcbiAgICBjb25zdCBtID0gdGhpcy5lbGVtZW50cztcblxuICAgIGxldCBzeCA9IG5ldyBWZWN0b3IzKCBbIG1bIDAgXSwgbVsgMSBdLCBtWyAyIF0gXSApLmxlbmd0aDtcbiAgICBjb25zdCBzeSA9IG5ldyBWZWN0b3IzKCBbIG1bIDQgXSwgbVsgNSBdLCBtWyA2IF0gXSApLmxlbmd0aDtcbiAgICBjb25zdCBzeiA9IG5ldyBWZWN0b3IzKCBbIG1bIDggXSwgbVsgOSBdLCBtWyAxMCBdIF0gKS5sZW5ndGg7XG5cbiAgICAvLyBpZiBkZXRlcm1pbmUgaXMgbmVnYXRpdmUsIHdlIG5lZWQgdG8gaW52ZXJ0IG9uZSBzY2FsZVxuICAgIGNvbnN0IGRldCA9IHRoaXMuZGV0ZXJtaW5hbnQ7XG4gICAgaWYgKCBkZXQgPCAwICkgeyBzeCA9IC1zeDsgfVxuXG4gICAgY29uc3QgaW52U3ggPSAxLjAgLyBzeDtcbiAgICBjb25zdCBpbnZTeSA9IDEuMCAvIHN5O1xuICAgIGNvbnN0IGludlN6ID0gMS4wIC8gc3o7XG5cbiAgICBjb25zdCByb3RhdGlvbk1hdHJpeCA9IHRoaXMuY2xvbmUoKTtcblxuICAgIHJvdGF0aW9uTWF0cml4LmVsZW1lbnRzWyAwIF0gKj0gaW52U3g7XG4gICAgcm90YXRpb25NYXRyaXguZWxlbWVudHNbIDEgXSAqPSBpbnZTeDtcbiAgICByb3RhdGlvbk1hdHJpeC5lbGVtZW50c1sgMiBdICo9IGludlN4O1xuXG4gICAgcm90YXRpb25NYXRyaXguZWxlbWVudHNbIDQgXSAqPSBpbnZTeTtcbiAgICByb3RhdGlvbk1hdHJpeC5lbGVtZW50c1sgNSBdICo9IGludlN5O1xuICAgIHJvdGF0aW9uTWF0cml4LmVsZW1lbnRzWyA2IF0gKj0gaW52U3k7XG5cbiAgICByb3RhdGlvbk1hdHJpeC5lbGVtZW50c1sgOCBdICo9IGludlN6O1xuICAgIHJvdGF0aW9uTWF0cml4LmVsZW1lbnRzWyA5IF0gKj0gaW52U3o7XG4gICAgcm90YXRpb25NYXRyaXguZWxlbWVudHNbIDEwIF0gKj0gaW52U3o7XG5cbiAgICByZXR1cm4ge1xuICAgICAgcG9zaXRpb246IG5ldyBWZWN0b3IzKCBbIG1bIDEyIF0sIG1bIDEzIF0sIG1bIDE0IF0gXSApLFxuICAgICAgc2NhbGU6IG5ldyBWZWN0b3IzKCBbIHN4LCBzeSwgc3ogXSApLFxuICAgICAgcm90YXRpb246IFF1YXRlcm5pb24uZnJvbU1hdHJpeCggcm90YXRpb25NYXRyaXggKVxuICAgIH07XG4gIH1cblxuICAvKipcbiAgICogQ29tcG9zZSBhIG1hdHJpeCBvdXQgb2YgcG9zaXRpb24sIHNjYWxlLCBhbmQgcm90YXRpb24uXG4gICAqIFlvaW5rZWQgZnJvbSBUaHJlZS5qcy5cbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgY29tcG9zZSggcG9zaXRpb246IFZlY3RvcjMsIHJvdGF0aW9uOiBRdWF0ZXJuaW9uLCBzY2FsZTogVmVjdG9yMyApOiBNYXRyaXg0IHtcbiAgICBjb25zdCB4ID0gcm90YXRpb24ueCwgeSA9IHJvdGF0aW9uLnksIHogPSByb3RhdGlvbi56LCB3ID0gcm90YXRpb24udztcbiAgICBjb25zdCB4MiA9IHggKyB4LFx0eTIgPSB5ICsgeSwgejIgPSB6ICsgejtcbiAgICBjb25zdCB4eCA9IHggKiB4MiwgeHkgPSB4ICogeTIsIHh6ID0geCAqIHoyO1xuICAgIGNvbnN0IHl5ID0geSAqIHkyLCB5eiA9IHkgKiB6MiwgenogPSB6ICogejI7XG4gICAgY29uc3Qgd3ggPSB3ICogeDIsIHd5ID0gdyAqIHkyLCB3eiA9IHcgKiB6MjtcbiAgICBjb25zdCBzeCA9IHNjYWxlLngsIHN5ID0gc2NhbGUueSwgc3ogPSBzY2FsZS56O1xuXG4gICAgcmV0dXJuIG5ldyBNYXRyaXg0KCBbXG4gICAgICAoIDEuMCAtICggeXkgKyB6eiApICkgKiBzeCxcbiAgICAgICggeHkgKyB3eiApICogc3gsXG4gICAgICAoIHh6IC0gd3kgKSAqIHN4LFxuICAgICAgMC4wLFxuXG4gICAgICAoIHh5IC0gd3ogKSAqIHN5LFxuICAgICAgKCAxLjAgLSAoIHh4ICsgenogKSApICogc3ksXG4gICAgICAoIHl6ICsgd3ggKSAqIHN5LFxuICAgICAgMC4wLFxuXG4gICAgICAoIHh6ICsgd3kgKSAqIHN6LFxuICAgICAgKCB5eiAtIHd4ICkgKiBzeixcbiAgICAgICggMS4wIC0gKCB4eCArIHl5ICkgKSAqIHN6LFxuICAgICAgMC4wLFxuXG4gICAgICBwb3NpdGlvbi54LFxuICAgICAgcG9zaXRpb24ueSxcbiAgICAgIHBvc2l0aW9uLnosXG4gICAgICAxLjBcbiAgICBdICk7XG4gIH1cbn1cbiIsImltcG9ydCB7IE1hdHJpeDQgfSBmcm9tICcuL01hdHJpeDQnO1xuaW1wb3J0IHsgVmVjdG9yIH0gZnJvbSAnLi9WZWN0b3InO1xuXG5leHBvcnQgdHlwZSByYXdWZWN0b3I0ID0gWyBudW1iZXIsIG51bWJlciwgbnVtYmVyLCBudW1iZXIgXTtcblxuLyoqXG4gKiBBIFZlY3RvcjMuXG4gKi9cbmV4cG9ydCBjbGFzcyBWZWN0b3I0IGV4dGVuZHMgVmVjdG9yPFZlY3RvcjQ+IHtcbiAgcHVibGljIGVsZW1lbnRzOiByYXdWZWN0b3I0O1xuXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggdjogcmF3VmVjdG9yNCA9IFsgMC4wLCAwLjAsIDAuMCwgMC4wIF0gKSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLmVsZW1lbnRzID0gdjtcbiAgfVxuXG4gIC8qKlxuICAgKiBBbiB4IGNvbXBvbmVudCBvZiB0aGlzLlxuICAgKi9cbiAgcHVibGljIGdldCB4KCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuZWxlbWVudHNbIDAgXTtcbiAgfVxuXG4gIHB1YmxpYyBzZXQgeCggeDogbnVtYmVyICkge1xuICAgIHRoaXMuZWxlbWVudHNbIDAgXSA9IHg7XG4gIH1cblxuICAvKipcbiAgICogQSB5IGNvbXBvbmVudCBvZiB0aGlzLlxuICAgKi9cbiAgcHVibGljIGdldCB5KCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuZWxlbWVudHNbIDEgXTtcbiAgfVxuXG4gIHB1YmxpYyBzZXQgeSggeTogbnVtYmVyICkge1xuICAgIHRoaXMuZWxlbWVudHNbIDEgXSA9IHk7XG4gIH1cblxuICAvKipcbiAgICogQSB6IGNvbXBvbmVudCBvZiB0aGlzLlxuICAgKi9cbiAgcHVibGljIGdldCB6KCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuZWxlbWVudHNbIDIgXTtcbiAgfVxuXG4gIHB1YmxpYyBzZXQgeiggejogbnVtYmVyICkge1xuICAgIHRoaXMuZWxlbWVudHNbIDIgXSA9IHo7XG4gIH1cblxuICAvKipcbiAgICogQSB3IGNvbXBvbmVudCBvZiB0aGlzLlxuICAgKi9cbiAgcHVibGljIGdldCB3KCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuZWxlbWVudHNbIDMgXTtcbiAgfVxuXG4gIHB1YmxpYyBzZXQgdyggejogbnVtYmVyICkge1xuICAgIHRoaXMuZWxlbWVudHNbIDMgXSA9IHo7XG4gIH1cblxuICBwdWJsaWMgdG9TdHJpbmcoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gYFZlY3RvcjQoICR7IHRoaXMueC50b0ZpeGVkKCAzICkgfSwgJHsgdGhpcy55LnRvRml4ZWQoIDMgKSB9LCAkeyB0aGlzLnoudG9GaXhlZCggMyApIH0sICR7IHRoaXMudy50b0ZpeGVkKCAzICkgfSApYDtcbiAgfVxuXG4gIC8qKlxuICAgKiBNdWx0aXBseSB0aGlzIHZlY3RvciAod2l0aCBhbiBpbXBsaWNpdCAxIGluIHRoZSA0dGggZGltZW5zaW9uKSBieSBtLlxuICAgKi9cbiAgcHVibGljIGFwcGx5TWF0cml4NCggbWF0cml4OiBNYXRyaXg0ICk6IFZlY3RvcjQge1xuICAgIGNvbnN0IG0gPSBtYXRyaXguZWxlbWVudHM7XG5cbiAgICByZXR1cm4gbmV3IFZlY3RvcjQoIFtcbiAgICAgIG1bIDAgXSAqIHRoaXMueCArIG1bIDQgXSAqIHRoaXMueSArIG1bIDggXSAqIHRoaXMueiArIG1bIDEyIF0gKiB0aGlzLncsXG4gICAgICBtWyAxIF0gKiB0aGlzLnggKyBtWyA1IF0gKiB0aGlzLnkgKyBtWyA5IF0gKiB0aGlzLnogKyBtWyAxMyBdICogdGhpcy53LFxuICAgICAgbVsgMiBdICogdGhpcy54ICsgbVsgNiBdICogdGhpcy55ICsgbVsgMTAgXSAqIHRoaXMueiArIG1bIDE0IF0gKiB0aGlzLncsXG4gICAgICBtWyAzIF0gKiB0aGlzLnggKyBtWyA3IF0gKiB0aGlzLnkgKyBtWyAxMSBdICogdGhpcy56ICsgbVsgMTUgXSAqIHRoaXMud1xuICAgIF0gKTtcbiAgfVxuXG4gIHByb3RlY3RlZCBfX25ldyggdjogcmF3VmVjdG9yNCApOiBWZWN0b3I0IHtcbiAgICByZXR1cm4gbmV3IFZlY3RvcjQoIHYgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBWZWN0b3I0KCAwLjAsIDAuMCwgMC4wLCAwLjAgKVxuICAgKi9cbiAgcHVibGljIHN0YXRpYyBnZXQgemVybygpOiBWZWN0b3I0IHtcbiAgICByZXR1cm4gbmV3IFZlY3RvcjQoIFsgMC4wLCAwLjAsIDAuMCwgMC4wIF0gKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBWZWN0b3I0KCAxLjAsIDEuMCwgMS4wLCAxLjAgKVxuICAgKi9cbiAgcHVibGljIHN0YXRpYyBnZXQgb25lKCk6IFZlY3RvcjQge1xuICAgIHJldHVybiBuZXcgVmVjdG9yNCggWyAxLjAsIDEuMCwgMS4wLCAxLjAgXSApO1xuICB9XG59XG4iLCIvKipcbiAqIFVzZWZ1bCBmb3Igc3dhcCBidWZmZXJcbiAqL1xuZXhwb3J0IGNsYXNzIFN3YXA8VD4ge1xuICBwdWJsaWMgaTogVDtcbiAgcHVibGljIG86IFQ7XG5cbiAgcHVibGljIGNvbnN0cnVjdG9yKCBhOiBULCBiOiBUICkge1xuICAgIHRoaXMuaSA9IGE7XG4gICAgdGhpcy5vID0gYjtcbiAgfVxuXG4gIHB1YmxpYyBzd2FwKCk6IHZvaWQge1xuICAgIGNvbnN0IGkgPSB0aGlzLmk7XG4gICAgdGhpcy5pID0gdGhpcy5vO1xuICAgIHRoaXMubyA9IGk7XG4gIH1cbn1cbiIsImltcG9ydCB7IEhpc3RvcnlNZWFuQ2FsY3VsYXRvciB9IGZyb20gJy4uL0hpc3RvcnlNZWFuQ2FsY3VsYXRvci9IaXN0b3J5TWVhbkNhbGN1bGF0b3InO1xuXG5leHBvcnQgY2xhc3MgVGFwVGVtcG8ge1xuICBwcml2YXRlIF9fYnBtID0gMC4wO1xuICBwcml2YXRlIF9fbGFzdFRhcCA9IDAuMDtcbiAgcHJpdmF0ZSBfX2xhc3RCZWF0ID0gMC4wO1xuICBwcml2YXRlIF9fbGFzdFRpbWUgPSAwLjA7XG4gIHByaXZhdGUgX19jYWxjOiBIaXN0b3J5TWVhbkNhbGN1bGF0b3IgPSBuZXcgSGlzdG9yeU1lYW5DYWxjdWxhdG9yKCAxNiApO1xuXG4gIHB1YmxpYyBnZXQgYmVhdER1cmF0aW9uKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIDYwLjAgLyB0aGlzLl9fYnBtO1xuICB9XG5cbiAgcHVibGljIGdldCBicG0oKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5fX2JwbTtcbiAgfVxuXG4gIHB1YmxpYyBzZXQgYnBtKCBicG06IG51bWJlciApIHtcbiAgICB0aGlzLl9fbGFzdEJlYXQgPSB0aGlzLmJlYXQ7XG4gICAgdGhpcy5fX2xhc3RUaW1lID0gcGVyZm9ybWFuY2Uubm93KCk7XG4gICAgdGhpcy5fX2JwbSA9IGJwbTtcbiAgfVxuXG4gIHB1YmxpYyBnZXQgYmVhdCgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLl9fbGFzdEJlYXQgKyAoIHBlcmZvcm1hbmNlLm5vdygpIC0gdGhpcy5fX2xhc3RUaW1lICkgKiAwLjAwMSAvIHRoaXMuYmVhdER1cmF0aW9uO1xuICB9XG5cbiAgcHVibGljIHJlc2V0KCk6IHZvaWQge1xuICAgIHRoaXMuX19jYWxjLnJlc2V0KCk7XG4gIH1cblxuICBwdWJsaWMgbnVkZ2UoIGFtb3VudDogbnVtYmVyICk6IHZvaWQge1xuICAgIHRoaXMuX19sYXN0QmVhdCA9IHRoaXMuYmVhdCArIGFtb3VudDtcbiAgICB0aGlzLl9fbGFzdFRpbWUgPSBwZXJmb3JtYW5jZS5ub3coKTtcbiAgfVxuXG4gIHB1YmxpYyB0YXAoKTogdm9pZCB7XG4gICAgY29uc3Qgbm93ID0gcGVyZm9ybWFuY2Uubm93KCk7XG4gICAgY29uc3QgZGVsdGEgPSAoIG5vdyAtIHRoaXMuX19sYXN0VGFwICkgKiAwLjAwMTtcblxuICAgIGlmICggMi4wIDwgZGVsdGEgKSB7XG4gICAgICB0aGlzLnJlc2V0KCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX19jYWxjLnB1c2goIGRlbHRhICk7XG4gICAgICB0aGlzLl9fYnBtID0gNjAuMCAvICggdGhpcy5fX2NhbGMubWVhbiApO1xuICAgIH1cblxuICAgIHRoaXMuX19sYXN0VGFwID0gbm93O1xuICAgIHRoaXMuX19sYXN0VGltZSA9IG5vdztcbiAgICB0aGlzLl9fbGFzdEJlYXQgPSAwLjA7XG4gIH1cbn1cbiIsImV4cG9ydCBjbGFzcyBYb3JzaGlmdCB7XG4gIHB1YmxpYyBzZWVkOiBudW1iZXI7XG5cbiAgcHVibGljIGNvbnN0cnVjdG9yKCBzZWVkPzogbnVtYmVyICkge1xuICAgIHRoaXMuc2VlZCA9IHNlZWQgfHwgMTtcbiAgfVxuXG4gIHB1YmxpYyBnZW4oIHNlZWQ/OiBudW1iZXIgKTogbnVtYmVyIHtcbiAgICBpZiAoIHNlZWQgKSB7XG4gICAgICB0aGlzLnNlZWQgPSBzZWVkO1xuICAgIH1cblxuICAgIHRoaXMuc2VlZCA9IHRoaXMuc2VlZCBeICggdGhpcy5zZWVkIDw8IDEzICk7XG4gICAgdGhpcy5zZWVkID0gdGhpcy5zZWVkIF4gKCB0aGlzLnNlZWQgPj4+IDE3ICk7XG4gICAgdGhpcy5zZWVkID0gdGhpcy5zZWVkIF4gKCB0aGlzLnNlZWQgPDwgNSApO1xuICAgIHJldHVybiB0aGlzLnNlZWQgLyBNYXRoLnBvdyggMiwgMzIgKSArIDAuNTtcbiAgfVxuXG4gIHB1YmxpYyBzZXQoIHNlZWQ/OiBudW1iZXIgKTogdm9pZCB7XG4gICAgdGhpcy5zZWVkID0gc2VlZCB8fCB0aGlzLnNlZWQgfHwgMTtcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBYb3JzaGlmdDtcbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztJQUFBO2FBRWdCLFlBQVksQ0FDMUIsT0FBZSxFQUNmLEtBQXdCO1FBRXhCLElBQUksS0FBSyxHQUFHLENBQUMsQ0FBQztRQUNkLElBQUksR0FBRyxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUM7UUFFdkIsT0FBUSxLQUFLLEdBQUcsR0FBRyxFQUFHO1lBQ3BCLElBQU0sTUFBTSxHQUFHLENBQUUsS0FBSyxHQUFHLEdBQUcsS0FBTSxDQUFDLENBQUM7WUFDcEMsSUFBSyxLQUFLLENBQUUsTUFBTSxDQUFFLEdBQUcsT0FBTyxFQUFHO2dCQUMvQixLQUFLLEdBQUcsTUFBTSxHQUFHLENBQUMsQ0FBQzthQUNwQjtpQkFBTTtnQkFDTCxHQUFHLEdBQUcsTUFBTSxDQUFDO2FBQ2Q7U0FDRjtRQUVELE9BQU8sS0FBSyxDQUFDO0lBQ2Y7O0lDbkJBOzs7UUFHYSxtQkFBbUIsR0FBRyxDQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRztJQUVsRTs7O1FBR2Esc0JBQXNCLEdBQUcsQ0FBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FB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RyxHQUFHLENBQUMsQ0FBRyxDQUFDLENBQUUsRUFBRSxHQUFHLEdBQUcsQ0FBQyxDQUFFLEVBQUUsQ0FBRSxFQUFFLEdBQUcsR0FBRyxDQUFDLENBQUUsRUFBRSxDQUFFLEVBQzFELEdBQUcsR0FBRyxDQUFDLENBQUUsRUFBRSxDQUFFLEVBQUUsR0FBRyxHQUFHLENBQUMsQ0FBRSxFQUFFLENBQUUsRUFBRSxHQUFHLEdBQUcsQ0FBQyxDQUFFLEVBQUUsQ0FBRSxFQUFFLEdBQUcsR0FBRyxDQUFDLENBQUUsRUFBRSxDQUFFLEVBQzFELEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEVBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsRUFDekQsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsRUFBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxFQUN6RCxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxFQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEVBQ3pELEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEVBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsRUFDekQsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsRUFBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxFQUN6RCxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxFQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUM7Z0JBRTVELE9BQU8sR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUM7YUFDOUU7OztXQUFBO1FBS0Qsc0JBQVcsNEJBQU87Ozs7aUJBQWxCO2dCQUNFLElBQU0sQ0FBQyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUM7Z0JBQ3hCLElBQ0UsR0FBRyxHQUFHLENBQUMsQ0FBRyxDQUFDLENBQUUsRUFBRSxHQUFHLEdBQUcsQ0FBQyxDQUFHLENBQUMsQ0FBRSxFQUFFLEdBQUcsR0FBRyxDQUFDLENBQUcsQ0FBQyxDQUFFLEVBQUUsR0FBRyxHQUFHLENBQUMsQ0FBRyxDQUFDLENBQUUsRUFDMUQsR0FBRyxHQUFHLENBQUMsQ0FBRyxDQUFDLENBQUUsRUFBRSxHQUFHLEdBQUcsQ0FBQyxDQUFHLENBQUMsQ0FBRSxFQUFFLEdBQUcsR0FBRyxDQUFDLENBQUcsQ0FBQyxDQUFFLEVBQUUsR0FBRyxHQUFHLENBQUMsQ0FBRyxDQUFDLENBQUUsRUFDMUQsR0FBRyxHQUFHLENBQUMsQ0FBRyxDQUFDLENBQUUsRUFBRSxHQUFHLEdBQUcsQ0FBQyxDQUFHLENBQUMsQ0FBRSxFQUFFLEdBQUcsR0FBRyxDQUFDLENBQUUsRUFBRSxDQUFFLEVBQUUsR0FBRyxHQUFHLENBQUMsQ0FBRSxFQUFFLENBQUUsRUFDMUQsR0FBRyxHQUFHLENBQUMsQ0FBRSxFQUFFLENBQUUsRUFBRSxHQUFHLEdBQUcsQ0FBQyxDQUFFLEVBQUUsQ0FBRSxFQUFFLEdBQUcsR0FBRyxDQUFDLENBQUUsRUFBRSxDQUFFLEVBQUUsR0FBRyxHQUFHLENBQUMsQ0FBRSxFQUFFLENBQUUsRUFDMUQsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsRUFBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxFQUN6RCxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxFQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEVBQ3pELEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEVBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsRUFDekQsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsRUFBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxFQUN6RCxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxFQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEVBQ3pELEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEVBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQztnQkFFNUQsSUFBTSxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUM7Z0JBRWxGLElBQUssR0FBRyxLQUFLLEdBQUcsRUFBRztvQkFBRSxPQUFPLElBQUksQ0FBQztpQkFBRTtnQkFFbkMsSUFBTSxNQUFNLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQztnQkFFekIsT0FBTyxJQUFJLE9BQU8sQ0FBRTtvQkFDbEIsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHO29CQUNqQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUc7b0JBQ2pDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRztvQkFDakMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHO29CQUNqQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUc7b0JBQ2pDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRztvQkFDakMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHO29CQUNqQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUc7b0JBQ2pDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRztvQkFDakMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHO29CQUNqQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUc7b0JBQ2pDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRztvQkFDakMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHO29CQUNqQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUc7b0JBQ2pDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRztvQkFDakMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHO2lCQUNsQyxDQUFDLEdBQUcsQ0FBRSxVQUFFLENBQUMsSUFBTSxPQUFBLENBQUMsR0FBRyxNQUFNLEdBQUEsQ0FBZ0IsQ0FBRSxDQUFDO2FBQzlDOzs7V0FBQTtRQUVN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QUFFLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxFQUFFLENBQUUsR0FBRyxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLEVBQUUsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUU7Z0JBRXZFLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxFQUFFLENBQUUsR0FBRyxDQUFDLENBQUUsQ0FBQyxDQUFFO2dCQUN0RSxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsRUFBRSxDQUFFLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRTtnQkFDdEUsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxFQUFFLENBQUUsR0FBRyxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLEVBQUUsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUU7Z0JBQ3ZFLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsRUFBRSxDQUFFLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxFQUFFLENBQUUsR0FBRyxDQUFDLENBQUUsQ0FBQyxDQUFFO2dCQUV2RSxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxFQUFFLENBQUUsR0FBRyxDQUFDLENBQUUsRUFBRSxDQUFFLEdBQUcsQ0FBQyxDQUFFLEVBQUUsQ0FBRTtnQkFDeEUsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsRUFBRSxDQUFFLEdBQUcsQ0FBQyxDQUFFLEVBQUUsQ0FBRSxHQUFHLENBQUMsQ0FBRSxFQUFFLENBQUU7Z0JBQ3hFLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsRUFBRSxDQUFFLEdBQUcsQ0FBQyxDQUFFLEVBQUUsQ0FBRSxHQUFHLENBQUMsQ0FBRSxFQUFFLENBQUUsR0FBRyxDQUFDLENBQUUsRUFBRSxDQUFFO2dCQUN6RSxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLEVBQUUsQ0FBRSxHQUFHLENBQUMsQ0FBRSxFQUFFLENBQUUsR0FBRyxDQUFDLENBQUUsRUFBRSxDQUFFLEdBQUcsQ0FBQyxDQUFFLEVBQUUsQ0FBRTtnQkFFekUsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxFQUFFLENBQUUsR0FB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
