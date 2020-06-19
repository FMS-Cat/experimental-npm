/*!
* @fms-cat/experimental v0.4.1
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm1zLWNhdC1leHBlcmltZW50YWwuanMiLCJzb3VyY2VzIjpbIi4uL3NyYy9hbGdvcml0aG0vYmluYXJ5U2VhcmNoLnRzIiwiLi4vc3JjL2FycmF5L2NvbnN0YW50cy50cyIsIi4uL3NyYy9hcnJheS91dGlscy50cyIsIi4uL3NyYy9DRFMvQ0RTLnRzIiwiLi4vc3JjL0Nsb2NrL0Nsb2NrLnRzIiwiLi4vbm9kZV9tb2R1bGVzL3RzbGliL3RzbGliLmVzNi5qcyIsIi4uL3NyYy9DbG9jay9DbG9ja0ZyYW1lLnRzIiwiLi4vc3JjL0Nsb2NrL0Nsb2NrUmVhbHRpbWUudHMiLCIuLi9zcmMvbWF0aC91dGlscy50cyIsIi4uL3NyYy9FeHBTbW9vdGgvRXhwU21vb3RoLnRzIiwiLi4vc3JjL0ZpenpCdXp6L0ZpenpCdXp6LnRzIiwiLi4vc3JjL0ZNU19DYXQvRk1TX0NhdC50cyIsIi4uL3NyYy9IaXN0b3J5TWVhbkNhbGN1bGF0b3IvSGlzdG9yeU1lYW5DYWxjdWxhdG9yLnRzIiwiLi4vc3JjL0hpc3RvcnlNZWFuQ2FsY3VsYXRvci9IaXN0b3J5TWVkaWFuQ2FsY3VsYXRvci50cyIsIi4uL3NyYy9tYXRoL1ZlY3Rvci50cyIsIi4uL3NyYy9tYXRoL1ZlY3RvcjMudHMiLCIuLi9zcmMvbWF0aC9RdWF0ZXJuaW9uLnRzIiwiLi4vc3JjL21hdGgvTWF0cml4NC50cyIsIi4uL3NyYy9tYXRoL1ZlY3RvcjQudHMiLCIuLi9zcmMvU3dhcC9Td2FwLnRzIiwiLi4vc3JjL1RhcFRlbXBvL1RhcFRlbXBvLnRzIiwiLi4vc3JjL1hvcnNoaWZ0L1hvcnNoaWZ0LnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIHlvaW5rZWQgZnJvbSBodHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8xMzQ0NTAwL2VmZmljaWVudC13YXktdG8taW5zZXJ0LWEtbnVtYmVyLWludG8tYS1zb3J0ZWQtYXJyYXktb2YtbnVtYmVyc1xuXG5leHBvcnQgZnVuY3Rpb24gYmluYXJ5U2VhcmNoKFxuICBlbGVtZW50OiBudW1iZXIsXG4gIGFycmF5OiBBcnJheUxpa2U8bnVtYmVyPlxuKTogbnVtYmVyIHtcbiAgbGV0IHN0YXJ0ID0gMDtcbiAgbGV0IGVuZCA9IGFycmF5Lmxlbmd0aDtcblxuICB3aGlsZSAoIHN0YXJ0IDwgZW5kICkge1xuICAgIGNvbnN0IGNlbnRlciA9ICggc3RhcnQgKyBlbmQgKSA+PiAxO1xuICAgIGlmICggYXJyYXlbIGNlbnRlciBdIDwgZWxlbWVudCApIHtcbiAgICAgIHN0YXJ0ID0gY2VudGVyICsgMTtcbiAgICB9IGVsc2Uge1xuICAgICAgZW5kID0gY2VudGVyO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBzdGFydDtcbn1cbiIsIi8qKlxuICogYFsgLTEsIC0xLCAxLCAtMSwgLTEsIDEsIDEsIDEgXWBcbiAqL1xuZXhwb3J0IGNvbnN0IFRSSUFOR0xFX1NUUklQX1FVQUQgPSBbIC0xLCAtMSwgMSwgLTEsIC0xLCAxLCAxLCAxIF07XG5cbi8qKlxuICogYFsgLTEsIC0xLCAwLCAxLCAtMSwgMCwgLTEsIDEsIDAsIDEsIDEsIDAgXWBcbiAqL1xuZXhwb3J0IGNvbnN0IFRSSUFOR0xFX1NUUklQX1FVQURfM0QgPSBbIC0xLCAtMSwgMCwgMSwgLTEsIDAsIC0xLCAxLCAwLCAxLCAxLCAwIF07XG5cbi8qKlxuICogYFsgMCwgMCwgMSwgMCwgMCwgMSwgMCwgMCwgMSwgMCwgMCwgMSBdYFxuICovXG5leHBvcnQgY29uc3QgVFJJQU5HTEVfU1RSSVBfUVVBRF9OT1JNQUwgPSBbIDAsIDAsIDEsIDAsIDAsIDEsIDAsIDAsIDEsIDAsIDAsIDEgXTtcblxuLyoqXG4gKiBgWyAwLCAwLCAxLCAwLCAwLCAxLCAxLCAxIF1gXG4gKi9cbmV4cG9ydCBjb25zdCBUUklBTkdMRV9TVFJJUF9RVUFEX1VWID0gWyAwLCAwLCAxLCAwLCAwLCAxLCAxLCAxIF07XG4iLCIvKipcbiAqIFNodWZmbGUgZ2l2ZW4gYGFycmF5YCB1c2luZyBnaXZlbiBgZGljZWAgUk5HLiAqKkRlc3RydWN0aXZlKiouXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzaHVmZmxlQXJyYXk8VD4oIGFycmF5OiBUW10sIGRpY2U/OiAoKSA9PiBudW1iZXIgKTogVFtdIHtcbiAgY29uc3QgZiA9IGRpY2UgPyBkaWNlIDogKCkgPT4gTWF0aC5yYW5kb20oKTtcbiAgZm9yICggbGV0IGkgPSAwOyBpIDwgYXJyYXkubGVuZ3RoIC0gMTsgaSArKyApIHtcbiAgICBjb25zdCBpciA9IGkgKyBNYXRoLmZsb29yKCBmKCkgKiAoIGFycmF5Lmxlbmd0aCAtIGkgKSApO1xuICAgIGNvbnN0IHRlbXAgPSBhcnJheVsgaXIgXTtcbiAgICBhcnJheVsgaXIgXSA9IGFycmF5WyBpIF07XG4gICAgYXJyYXlbIGkgXSA9IHRlbXA7XG4gIH1cbiAgcmV0dXJuIGFycmF5O1xufVxuXG4vKipcbiAqIEkgbGlrZSB3aXJlZnJhbWVcbiAqXG4gKiBgdHJpSW5kZXhUb0xpbmVJbmRleCggWyAwLCAxLCAyLCA1LCA2LCA3IF0gKWAgLT4gYFsgMCwgMSwgMSwgMiwgMiwgMCwgNSwgNiwgNiwgNywgNywgNSBdYFxuICovXG5leHBvcnQgZnVuY3Rpb24gdHJpSW5kZXhUb0xpbmVJbmRleDxUPiggYXJyYXk6IFRbXSApOiBUW10ge1xuICBjb25zdCByZXQ6IFRbXSA9IFtdO1xuICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBhcnJheS5sZW5ndGggLyAzOyBpICsrICkge1xuICAgIGNvbnN0IGhlYWQgPSBpICogMztcbiAgICByZXQucHVzaChcbiAgICAgIGFycmF5WyBoZWFkICAgICBdLCBhcnJheVsgaGVhZCArIDEgXSxcbiAgICAgIGFycmF5WyBoZWFkICsgMSBdLCBhcnJheVsgaGVhZCArIDIgXSxcbiAgICAgIGFycmF5WyBoZWFkICsgMiBdLCBhcnJheVsgaGVhZCAgICAgXVxuICAgICk7XG4gIH1cbiAgcmV0dXJuIHJldDtcbn1cblxuLyoqXG4gKiBgbWF0cml4MmQoIDMsIDIgKWAgLT4gYFsgMCwgMCwgMCwgMSwgMCwgMiwgMSwgMCwgMSwgMSwgMSwgMiBdYFxuICovXG5leHBvcnQgZnVuY3Rpb24gbWF0cml4MmQoIHc6IG51bWJlciwgaDogbnVtYmVyICk6IG51bWJlcltdIHtcbiAgY29uc3QgYXJyOiBudW1iZXJbXSA9IFtdO1xuICBmb3IgKCBsZXQgaXkgPSAwOyBpeSA8IGg7IGl5ICsrICkge1xuICAgIGZvciAoIGxldCBpeCA9IDA7IGl4IDwgdzsgaXggKysgKSB7XG4gICAgICBhcnIucHVzaCggaXgsIGl5ICk7XG4gICAgfVxuICB9XG4gIHJldHVybiBhcnI7XG59XG4iLCIvKipcbiAqIENyaXRpY2FsbHkgRGFtcGVkIFNwcmluZ1xuICpcbiAqIFNob3V0b3V0cyB0byBLZWlqaXJvIFRha2FoYXNoaVxuICovXG5leHBvcnQgY2xhc3MgQ0RTIHtcbiAgcHVibGljIGZhY3RvciA9IDEwMC4wO1xuICBwdWJsaWMgcmF0aW8gPSAxLjA7XG4gIHB1YmxpYyB2ZWxvY2l0eSA9IDAuMDtcbiAgcHVibGljIHZhbHVlID0gMC4wO1xuICBwdWJsaWMgdGFyZ2V0ID0gMC4wO1xuXG4gIHB1YmxpYyB1cGRhdGUoIGRlbHRhVGltZTogbnVtYmVyICk6IG51bWJlciB7XG4gICAgdGhpcy52ZWxvY2l0eSArPSAoXG4gICAgICAtdGhpcy5mYWN0b3IgKiAoIHRoaXMudmFsdWUgLSB0aGlzLnRhcmdldCApXG4gICAgICAtIDIuMCAqIHRoaXMudmVsb2NpdHkgKiBNYXRoLnNxcnQoIHRoaXMuZmFjdG9yICkgKiB0aGlzLnJhdGlvXG4gICAgKSAqIGRlbHRhVGltZTtcbiAgICB0aGlzLnZhbHVlICs9IHRoaXMudmVsb2NpdHkgKiBkZWx0YVRpbWU7XG4gICAgcmV0dXJuIHRoaXMudmFsdWU7XG4gIH1cbn1cbiIsIi8qKlxuICogQ2xhc3MgdGhhdCBkZWFscyB3aXRoIHRpbWUuXG4gKiBJbiB0aGlzIGJhc2UgY2xhc3MsIHlvdSBuZWVkIHRvIHNldCB0aW1lIG1hbnVhbGx5IGZyb20gYEF1dG9tYXRvbi51cGRhdGUoKWAuXG4gKiBCZXN0IGZvciBzeW5jIHdpdGggZXh0ZXJuYWwgY2xvY2sgc3R1ZmYuXG4gKi9cbmV4cG9ydCBjbGFzcyBDbG9jayB7XG4gIC8qKlxuICAgKiBJdHMgY3VycmVudCB0aW1lLlxuICAgKi9cbiAgcHJvdGVjdGVkIF9fdGltZSA9IDAuMDtcblxuICAvKipcbiAgICogSXRzIGRlbHRhVGltZSBvZiBsYXN0IHVwZGF0ZS5cbiAgICovXG4gIHByb3RlY3RlZCBfX2RlbHRhVGltZSA9IDAuMDtcblxuICAvKipcbiAgICogV2hldGhlciBpdHMgY3VycmVudGx5IHBsYXlpbmcgb3Igbm90LlxuICAgKi9cbiAgcHJvdGVjdGVkIF9faXNQbGF5aW5nID0gZmFsc2U7XG5cbiAgLyoqXG4gICAqIEl0cyBjdXJyZW50IHRpbWUuXG4gICAqL1xuICBwdWJsaWMgZ2V0IHRpbWUoKTogbnVtYmVyIHsgcmV0dXJuIHRoaXMuX190aW1lOyB9XG5cbiAgLyoqXG4gICAqIEl0cyBkZWx0YVRpbWUgb2YgbGFzdCB1cGRhdGUuXG4gICAqL1xuICBwdWJsaWMgZ2V0IGRlbHRhVGltZSgpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5fX2RlbHRhVGltZTsgfVxuXG4gIC8qKlxuICAgKiBXaGV0aGVyIGl0cyBjdXJyZW50bHkgcGxheWluZyBvciBub3QuXG4gICAqL1xuICBwdWJsaWMgZ2V0IGlzUGxheWluZygpOiBib29sZWFuIHsgcmV0dXJuIHRoaXMuX19pc1BsYXlpbmc7IH1cblxuICAvKipcbiAgICogVXBkYXRlIHRoZSBjbG9jay5cbiAgICogQHBhcmFtIHRpbWUgVGltZS4gWW91IG5lZWQgdG8gc2V0IG1hbnVhbGx5IHdoZW4geW91IGFyZSB1c2luZyBtYW51YWwgQ2xvY2tcbiAgICovXG4gIHB1YmxpYyB1cGRhdGUoIHRpbWU/OiBudW1iZXIgKTogdm9pZCB7XG4gICAgY29uc3QgcHJldlRpbWUgPSB0aGlzLl9fdGltZTtcbiAgICB0aGlzLl9fdGltZSA9IHRpbWUgfHwgMC4wO1xuICAgIHRoaXMuX19kZWx0YVRpbWUgPSB0aGlzLl9fdGltZSAtIHByZXZUaW1lO1xuICB9XG5cbiAgLyoqXG4gICAqIFN0YXJ0IHRoZSBjbG9jay5cbiAgICovXG4gIHB1YmxpYyBwbGF5KCk6IHZvaWQge1xuICAgIHRoaXMuX19pc1BsYXlpbmcgPSB0cnVlO1xuICB9XG5cbiAgLyoqXG4gICAqIFN0b3AgdGhlIGNsb2NrLlxuICAgKi9cbiAgcHVibGljIHBhdXNlKCk6IHZvaWQge1xuICAgIHRoaXMuX19pc1BsYXlpbmcgPSBmYWxzZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgdGhlIHRpbWUgbWFudWFsbHkuXG4gICAqIEBwYXJhbSB0aW1lIFRpbWVcbiAgICovXG4gIHB1YmxpYyBzZXRUaW1lKCB0aW1lOiBudW1iZXIgKTogdm9pZCB7XG4gICAgdGhpcy5fX3RpbWUgPSB0aW1lO1xuICB9XG59XG4iLCIvKiEgKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcclxuQ29weXJpZ2h0IChjKSBNaWNyb3NvZnQgQ29ycG9yYXRpb24uXHJcblxyXG5QZXJtaXNzaW9uIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBhbmQvb3IgZGlzdHJpYnV0ZSB0aGlzIHNvZnR3YXJlIGZvciBhbnlcclxucHVycG9zZSB3aXRoIG9yIHdpdGhvdXQgZmVlIGlzIGhlcmVieSBncmFudGVkLlxyXG5cclxuVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiBBTkQgVEhFIEFVVEhPUiBESVNDTEFJTVMgQUxMIFdBUlJBTlRJRVMgV0lUSFxyXG5SRUdBUkQgVE8gVEhJUyBTT0ZUV0FSRSBJTkNMVURJTkcgQUxMIElNUExJRUQgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFlcclxuQU5EIEZJVE5FU1MuIElOIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1IgQkUgTElBQkxFIEZPUiBBTlkgU1BFQ0lBTCwgRElSRUNULFxyXG5JTkRJUkVDVCwgT1IgQ09OU0VRVUVOVElBTCBEQU1BR0VTIE9SIEFOWSBEQU1BR0VTIFdIQVRTT0VWRVIgUkVTVUxUSU5HIEZST01cclxuTE9TUyBPRiBVU0UsIERBVEEgT1IgUFJPRklUUywgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIE5FR0xJR0VOQ0UgT1JcclxuT1RIRVIgVE9SVElPVVMgQUNUSU9OLCBBUklTSU5HIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFVTRSBPUlxyXG5QRVJGT1JNQU5DRSBPRiBUSElTIFNPRlRXQVJFLlxyXG4qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiAqL1xyXG4vKiBnbG9iYWwgUmVmbGVjdCwgUHJvbWlzZSAqL1xyXG5cclxudmFyIGV4dGVuZFN0YXRpY3MgPSBmdW5jdGlvbihkLCBiKSB7XHJcbiAgICBleHRlbmRTdGF0aWNzID0gT2JqZWN0LnNldFByb3RvdHlwZU9mIHx8XHJcbiAgICAgICAgKHsgX19wcm90b19fOiBbXSB9IGluc3RhbmNlb2YgQXJyYXkgJiYgZnVuY3Rpb24gKGQsIGIpIHsgZC5fX3Byb3RvX18gPSBiOyB9KSB8fFxyXG4gICAgICAgIGZ1bmN0aW9uIChkLCBiKSB7IGZvciAodmFyIHAgaW4gYikgaWYgKGIuaGFzT3duUHJvcGVydHkocCkpIGRbcF0gPSBiW3BdOyB9O1xyXG4gICAgcmV0dXJuIGV4dGVuZFN0YXRpY3MoZCwgYik7XHJcbn07XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19leHRlbmRzKGQsIGIpIHtcclxuICAgIGV4dGVuZFN0YXRpY3MoZCwgYik7XHJcbiAgICBmdW5jdGlvbiBfXygpIHsgdGhpcy5jb25zdHJ1Y3RvciA9IGQ7IH1cclxuICAgIGQucHJvdG90eXBlID0gYiA9PT0gbnVsbCA/IE9iamVjdC5jcmVhdGUoYikgOiAoX18ucHJvdG90eXBlID0gYi5wcm90b3R5cGUsIG5ldyBfXygpKTtcclxufVxyXG5cclxuZXhwb3J0IHZhciBfX2Fzc2lnbiA9IGZ1bmN0aW9uKCkge1xyXG4gICAgX19hc3NpZ24gPSBPYmplY3QuYXNzaWduIHx8IGZ1bmN0aW9uIF9fYXNzaWduKHQpIHtcclxuICAgICAgICBmb3IgKHZhciBzLCBpID0gMSwgbiA9IGFyZ3VtZW50cy5sZW5ndGg7IGkgPCBuOyBpKyspIHtcclxuICAgICAgICAgICAgcyA9IGFyZ3VtZW50c1tpXTtcclxuICAgICAgICAgICAgZm9yICh2YXIgcCBpbiBzKSBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHMsIHApKSB0W3BdID0gc1twXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHQ7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gX19hc3NpZ24uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fcmVzdChzLCBlKSB7XHJcbiAgICB2YXIgdCA9IHt9O1xyXG4gICAgZm9yICh2YXIgcCBpbiBzKSBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHMsIHApICYmIGUuaW5kZXhPZihwKSA8IDApXHJcbiAgICAgICAgdFtwXSA9IHNbcF07XHJcbiAgICBpZiAocyAhPSBudWxsICYmIHR5cGVvZiBPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzID09PSBcImZ1bmN0aW9uXCIpXHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDAsIHAgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzKHMpOyBpIDwgcC5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBpZiAoZS5pbmRleE9mKHBbaV0pIDwgMCAmJiBPYmplY3QucHJvdG90eXBlLnByb3BlcnR5SXNFbnVtZXJhYmxlLmNhbGwocywgcFtpXSkpXHJcbiAgICAgICAgICAgICAgICB0W3BbaV1dID0gc1twW2ldXTtcclxuICAgICAgICB9XHJcbiAgICByZXR1cm4gdDtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fZGVjb3JhdGUoZGVjb3JhdG9ycywgdGFyZ2V0LCBrZXksIGRlc2MpIHtcclxuICAgIHZhciBjID0gYXJndW1lbnRzLmxlbmd0aCwgciA9IGMgPCAzID8gdGFyZ2V0IDogZGVzYyA9PT0gbnVsbCA/IGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHRhcmdldCwga2V5KSA6IGRlc2MsIGQ7XHJcbiAgICBpZiAodHlwZW9mIFJlZmxlY3QgPT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIFJlZmxlY3QuZGVjb3JhdGUgPT09IFwiZnVuY3Rpb25cIikgciA9IFJlZmxlY3QuZGVjb3JhdGUoZGVjb3JhdG9ycywgdGFyZ2V0LCBrZXksIGRlc2MpO1xyXG4gICAgZWxzZSBmb3IgKHZhciBpID0gZGVjb3JhdG9ycy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkgaWYgKGQgPSBkZWNvcmF0b3JzW2ldKSByID0gKGMgPCAzID8gZChyKSA6IGMgPiAzID8gZCh0YXJnZXQsIGtleSwgcikgOiBkKHRhcmdldCwga2V5KSkgfHwgcjtcclxuICAgIHJldHVybiBjID4gMyAmJiByICYmIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGtleSwgciksIHI7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX3BhcmFtKHBhcmFtSW5kZXgsIGRlY29yYXRvcikge1xyXG4gICAgcmV0dXJuIGZ1bmN0aW9uICh0YXJnZXQsIGtleSkgeyBkZWNvcmF0b3IodGFyZ2V0LCBrZXksIHBhcmFtSW5kZXgpOyB9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX21ldGFkYXRhKG1ldGFkYXRhS2V5LCBtZXRhZGF0YVZhbHVlKSB7XHJcbiAgICBpZiAodHlwZW9mIFJlZmxlY3QgPT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIFJlZmxlY3QubWV0YWRhdGEgPT09IFwiZnVuY3Rpb25cIikgcmV0dXJuIFJlZmxlY3QubWV0YWRhdGEobWV0YWRhdGFLZXksIG1ldGFkYXRhVmFsdWUpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19hd2FpdGVyKHRoaXNBcmcsIF9hcmd1bWVudHMsIFAsIGdlbmVyYXRvcikge1xyXG4gICAgZnVuY3Rpb24gYWRvcHQodmFsdWUpIHsgcmV0dXJuIHZhbHVlIGluc3RhbmNlb2YgUCA/IHZhbHVlIDogbmV3IFAoZnVuY3Rpb24gKHJlc29sdmUpIHsgcmVzb2x2ZSh2YWx1ZSk7IH0pOyB9XHJcbiAgICByZXR1cm4gbmV3IChQIHx8IChQID0gUHJvbWlzZSkpKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcclxuICAgICAgICBmdW5jdGlvbiBmdWxmaWxsZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3IubmV4dCh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XHJcbiAgICAgICAgZnVuY3Rpb24gcmVqZWN0ZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3JbXCJ0aHJvd1wiXSh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XHJcbiAgICAgICAgZnVuY3Rpb24gc3RlcChyZXN1bHQpIHsgcmVzdWx0LmRvbmUgPyByZXNvbHZlKHJlc3VsdC52YWx1ZSkgOiBhZG9wdChyZXN1bHQudmFsdWUpLnRoZW4oZnVsZmlsbGVkLCByZWplY3RlZCk7IH1cclxuICAgICAgICBzdGVwKChnZW5lcmF0b3IgPSBnZW5lcmF0b3IuYXBwbHkodGhpc0FyZywgX2FyZ3VtZW50cyB8fCBbXSkpLm5leHQoKSk7XHJcbiAgICB9KTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fZ2VuZXJhdG9yKHRoaXNBcmcsIGJvZHkpIHtcclxuICAgIHZhciBfID0geyBsYWJlbDogMCwgc2VudDogZnVuY3Rpb24oKSB7IGlmICh0WzBdICYgMSkgdGhyb3cgdFsxXTsgcmV0dXJuIHRbMV07IH0sIHRyeXM6IFtdLCBvcHM6IFtdIH0sIGYsIHksIHQsIGc7XHJcbiAgICByZXR1cm4gZyA9IHsgbmV4dDogdmVyYigwKSwgXCJ0aHJvd1wiOiB2ZXJiKDEpLCBcInJldHVyblwiOiB2ZXJiKDIpIH0sIHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiAoZ1tTeW1ib2wuaXRlcmF0b3JdID0gZnVuY3Rpb24oKSB7IHJldHVybiB0aGlzOyB9KSwgZztcclxuICAgIGZ1bmN0aW9uIHZlcmIobikgeyByZXR1cm4gZnVuY3Rpb24gKHYpIHsgcmV0dXJuIHN0ZXAoW24sIHZdKTsgfTsgfVxyXG4gICAgZnVuY3Rpb24gc3RlcChvcCkge1xyXG4gICAgICAgIGlmIChmKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiR2VuZXJhdG9yIGlzIGFscmVhZHkgZXhlY3V0aW5nLlwiKTtcclxuICAgICAgICB3aGlsZSAoXykgdHJ5IHtcclxuICAgICAgICAgICAgaWYgKGYgPSAxLCB5ICYmICh0ID0gb3BbMF0gJiAyID8geVtcInJldHVyblwiXSA6IG9wWzBdID8geVtcInRocm93XCJdIHx8ICgodCA9IHlbXCJyZXR1cm5cIl0pICYmIHQuY2FsbCh5KSwgMCkgOiB5Lm5leHQpICYmICEodCA9IHQuY2FsbCh5LCBvcFsxXSkpLmRvbmUpIHJldHVybiB0O1xyXG4gICAgICAgICAgICBpZiAoeSA9IDAsIHQpIG9wID0gW29wWzBdICYgMiwgdC52YWx1ZV07XHJcbiAgICAgICAgICAgIHN3aXRjaCAob3BbMF0pIHtcclxuICAgICAgICAgICAgICAgIGNhc2UgMDogY2FzZSAxOiB0ID0gb3A7IGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSA0OiBfLmxhYmVsKys7IHJldHVybiB7IHZhbHVlOiBvcFsxXSwgZG9uZTogZmFsc2UgfTtcclxuICAgICAgICAgICAgICAgIGNhc2UgNTogXy5sYWJlbCsrOyB5ID0gb3BbMV07IG9wID0gWzBdOyBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgIGNhc2UgNzogb3AgPSBfLm9wcy5wb3AoKTsgXy50cnlzLnBvcCgpOyBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCEodCA9IF8udHJ5cywgdCA9IHQubGVuZ3RoID4gMCAmJiB0W3QubGVuZ3RoIC0gMV0pICYmIChvcFswXSA9PT0gNiB8fCBvcFswXSA9PT0gMikpIHsgXyA9IDA7IGNvbnRpbnVlOyB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG9wWzBdID09PSAzICYmICghdCB8fCAob3BbMV0gPiB0WzBdICYmIG9wWzFdIDwgdFszXSkpKSB7IF8ubGFiZWwgPSBvcFsxXTsgYnJlYWs7IH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAob3BbMF0gPT09IDYgJiYgXy5sYWJlbCA8IHRbMV0pIHsgXy5sYWJlbCA9IHRbMV07IHQgPSBvcDsgYnJlYWs7IH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAodCAmJiBfLmxhYmVsIDwgdFsyXSkgeyBfLmxhYmVsID0gdFsyXTsgXy5vcHMucHVzaChvcCk7IGJyZWFrOyB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRbMl0pIF8ub3BzLnBvcCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIF8udHJ5cy5wb3AoKTsgY29udGludWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgb3AgPSBib2R5LmNhbGwodGhpc0FyZywgXyk7XHJcbiAgICAgICAgfSBjYXRjaCAoZSkgeyBvcCA9IFs2LCBlXTsgeSA9IDA7IH0gZmluYWxseSB7IGYgPSB0ID0gMDsgfVxyXG4gICAgICAgIGlmIChvcFswXSAmIDUpIHRocm93IG9wWzFdOyByZXR1cm4geyB2YWx1ZTogb3BbMF0gPyBvcFsxXSA6IHZvaWQgMCwgZG9uZTogdHJ1ZSB9O1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgdmFyIF9fY3JlYXRlQmluZGluZyA9IE9iamVjdC5jcmVhdGUgPyAoZnVuY3Rpb24obywgbSwgaywgazIpIHtcclxuICAgIGlmIChrMiA9PT0gdW5kZWZpbmVkKSBrMiA9IGs7XHJcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkobywgazIsIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBmdW5jdGlvbigpIHsgcmV0dXJuIG1ba107IH0gfSk7XHJcbn0pIDogKGZ1bmN0aW9uKG8sIG0sIGssIGsyKSB7XHJcbiAgICBpZiAoazIgPT09IHVuZGVmaW5lZCkgazIgPSBrO1xyXG4gICAgb1trMl0gPSBtW2tdO1xyXG59KTtcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2V4cG9ydFN0YXIobSwgZXhwb3J0cykge1xyXG4gICAgZm9yICh2YXIgcCBpbiBtKSBpZiAocCAhPT0gXCJkZWZhdWx0XCIgJiYgIWV4cG9ydHMuaGFzT3duUHJvcGVydHkocCkpIF9fY3JlYXRlQmluZGluZyhleHBvcnRzLCBtLCBwKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fdmFsdWVzKG8pIHtcclxuICAgIHZhciBzID0gdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIFN5bWJvbC5pdGVyYXRvciwgbSA9IHMgJiYgb1tzXSwgaSA9IDA7XHJcbiAgICBpZiAobSkgcmV0dXJuIG0uY2FsbChvKTtcclxuICAgIGlmIChvICYmIHR5cGVvZiBvLmxlbmd0aCA9PT0gXCJudW1iZXJcIikgcmV0dXJuIHtcclxuICAgICAgICBuZXh0OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGlmIChvICYmIGkgPj0gby5sZW5ndGgpIG8gPSB2b2lkIDA7XHJcbiAgICAgICAgICAgIHJldHVybiB7IHZhbHVlOiBvICYmIG9baSsrXSwgZG9uZTogIW8gfTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihzID8gXCJPYmplY3QgaXMgbm90IGl0ZXJhYmxlLlwiIDogXCJTeW1ib2wuaXRlcmF0b3IgaXMgbm90IGRlZmluZWQuXCIpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19yZWFkKG8sIG4pIHtcclxuICAgIHZhciBtID0gdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIG9bU3ltYm9sLml0ZXJhdG9yXTtcclxuICAgIGlmICghbSkgcmV0dXJuIG87XHJcbiAgICB2YXIgaSA9IG0uY2FsbChvKSwgciwgYXIgPSBbXSwgZTtcclxuICAgIHRyeSB7XHJcbiAgICAgICAgd2hpbGUgKChuID09PSB2b2lkIDAgfHwgbi0tID4gMCkgJiYgIShyID0gaS5uZXh0KCkpLmRvbmUpIGFyLnB1c2goci52YWx1ZSk7XHJcbiAgICB9XHJcbiAgICBjYXRjaCAoZXJyb3IpIHsgZSA9IHsgZXJyb3I6IGVycm9yIH07IH1cclxuICAgIGZpbmFsbHkge1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGlmIChyICYmICFyLmRvbmUgJiYgKG0gPSBpW1wicmV0dXJuXCJdKSkgbS5jYWxsKGkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBmaW5hbGx5IHsgaWYgKGUpIHRocm93IGUuZXJyb3I7IH1cclxuICAgIH1cclxuICAgIHJldHVybiBhcjtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fc3ByZWFkKCkge1xyXG4gICAgZm9yICh2YXIgYXIgPSBbXSwgaSA9IDA7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspXHJcbiAgICAgICAgYXIgPSBhci5jb25jYXQoX19yZWFkKGFyZ3VtZW50c1tpXSkpO1xyXG4gICAgcmV0dXJuIGFyO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19zcHJlYWRBcnJheXMoKSB7XHJcbiAgICBmb3IgKHZhciBzID0gMCwgaSA9IDAsIGlsID0gYXJndW1lbnRzLmxlbmd0aDsgaSA8IGlsOyBpKyspIHMgKz0gYXJndW1lbnRzW2ldLmxlbmd0aDtcclxuICAgIGZvciAodmFyIHIgPSBBcnJheShzKSwgayA9IDAsIGkgPSAwOyBpIDwgaWw7IGkrKylcclxuICAgICAgICBmb3IgKHZhciBhID0gYXJndW1lbnRzW2ldLCBqID0gMCwgamwgPSBhLmxlbmd0aDsgaiA8IGpsOyBqKyssIGsrKylcclxuICAgICAgICAgICAgcltrXSA9IGFbal07XHJcbiAgICByZXR1cm4gcjtcclxufTtcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2F3YWl0KHYpIHtcclxuICAgIHJldHVybiB0aGlzIGluc3RhbmNlb2YgX19hd2FpdCA/ICh0aGlzLnYgPSB2LCB0aGlzKSA6IG5ldyBfX2F3YWl0KHYpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19hc3luY0dlbmVyYXRvcih0aGlzQXJnLCBfYXJndW1lbnRzLCBnZW5lcmF0b3IpIHtcclxuICAgIGlmICghU3ltYm9sLmFzeW5jSXRlcmF0b3IpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJTeW1ib2wuYXN5bmNJdGVyYXRvciBpcyBub3QgZGVmaW5lZC5cIik7XHJcbiAgICB2YXIgZyA9IGdlbmVyYXRvci5hcHBseSh0aGlzQXJnLCBfYXJndW1lbnRzIHx8IFtdKSwgaSwgcSA9IFtdO1xyXG4gICAgcmV0dXJuIGkgPSB7fSwgdmVyYihcIm5leHRcIiksIHZlcmIoXCJ0aHJvd1wiKSwgdmVyYihcInJldHVyblwiKSwgaVtTeW1ib2wuYXN5bmNJdGVyYXRvcl0gPSBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzOyB9LCBpO1xyXG4gICAgZnVuY3Rpb24gdmVyYihuKSB7IGlmIChnW25dKSBpW25dID0gZnVuY3Rpb24gKHYpIHsgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChhLCBiKSB7IHEucHVzaChbbiwgdiwgYSwgYl0pID4gMSB8fCByZXN1bWUobiwgdik7IH0pOyB9OyB9XHJcbiAgICBmdW5jdGlvbiByZXN1bWUobiwgdikgeyB0cnkgeyBzdGVwKGdbbl0odikpOyB9IGNhdGNoIChlKSB7IHNldHRsZShxWzBdWzNdLCBlKTsgfSB9XHJcbiAgICBmdW5jdGlvbiBzdGVwKHIpIHsgci52YWx1ZSBpbnN0YW5jZW9mIF9fYXdhaXQgPyBQcm9taXNlLnJlc29sdmUoci52YWx1ZS52KS50aGVuKGZ1bGZpbGwsIHJlamVjdCkgOiBzZXR0bGUocVswXVsyXSwgcik7IH1cclxuICAgIGZ1bmN0aW9uIGZ1bGZpbGwodmFsdWUpIHsgcmVzdW1lKFwibmV4dFwiLCB2YWx1ZSk7IH1cclxuICAgIGZ1bmN0aW9uIHJlamVjdCh2YWx1ZSkgeyByZXN1bWUoXCJ0aHJvd1wiLCB2YWx1ZSk7IH1cclxuICAgIGZ1bmN0aW9uIHNldHRsZShmLCB2KSB7IGlmIChmKHYpLCBxLnNoaWZ0KCksIHEubGVuZ3RoKSByZXN1bWUocVswXVswXSwgcVswXVsxXSk7IH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fYXN5bmNEZWxlZ2F0b3Iobykge1xyXG4gICAgdmFyIGksIHA7XHJcbiAgICByZXR1cm4gaSA9IHt9LCB2ZXJiKFwibmV4dFwiKSwgdmVyYihcInRocm93XCIsIGZ1bmN0aW9uIChlKSB7IHRocm93IGU7IH0pLCB2ZXJiKFwicmV0dXJuXCIpLCBpW1N5bWJvbC5pdGVyYXRvcl0gPSBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzOyB9LCBpO1xyXG4gICAgZnVuY3Rpb24gdmVyYihuLCBmKSB7IGlbbl0gPSBvW25dID8gZnVuY3Rpb24gKHYpIHsgcmV0dXJuIChwID0gIXApID8geyB2YWx1ZTogX19hd2FpdChvW25dKHYpKSwgZG9uZTogbiA9PT0gXCJyZXR1cm5cIiB9IDogZiA/IGYodikgOiB2OyB9IDogZjsgfVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19hc3luY1ZhbHVlcyhvKSB7XHJcbiAgICBpZiAoIVN5bWJvbC5hc3luY0l0ZXJhdG9yKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiU3ltYm9sLmFzeW5jSXRlcmF0b3IgaXMgbm90IGRlZmluZWQuXCIpO1xyXG4gICAgdmFyIG0gPSBvW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSwgaTtcclxuICAgIHJldHVybiBtID8gbS5jYWxsKG8pIDogKG8gPSB0eXBlb2YgX192YWx1ZXMgPT09IFwiZnVuY3Rpb25cIiA/IF9fdmFsdWVzKG8pIDogb1tTeW1ib2wuaXRlcmF0b3JdKCksIGkgPSB7fSwgdmVyYihcIm5leHRcIiksIHZlcmIoXCJ0aHJvd1wiKSwgdmVyYihcInJldHVyblwiKSwgaVtTeW1ib2wuYXN5bmNJdGVyYXRvcl0gPSBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzOyB9LCBpKTtcclxuICAgIGZ1bmN0aW9uIHZlcmIobikgeyBpW25dID0gb1tuXSAmJiBmdW5jdGlvbiAodikgeyByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkgeyB2ID0gb1tuXSh2KSwgc2V0dGxlKHJlc29sdmUsIHJlamVjdCwgdi5kb25lLCB2LnZhbHVlKTsgfSk7IH07IH1cclxuICAgIGZ1bmN0aW9uIHNldHRsZShyZXNvbHZlLCByZWplY3QsIGQsIHYpIHsgUHJvbWlzZS5yZXNvbHZlKHYpLnRoZW4oZnVuY3Rpb24odikgeyByZXNvbHZlKHsgdmFsdWU6IHYsIGRvbmU6IGQgfSk7IH0sIHJlamVjdCk7IH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fbWFrZVRlbXBsYXRlT2JqZWN0KGNvb2tlZCwgcmF3KSB7XHJcbiAgICBpZiAoT2JqZWN0LmRlZmluZVByb3BlcnR5KSB7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eShjb29rZWQsIFwicmF3XCIsIHsgdmFsdWU6IHJhdyB9KTsgfSBlbHNlIHsgY29va2VkLnJhdyA9IHJhdzsgfVxyXG4gICAgcmV0dXJuIGNvb2tlZDtcclxufTtcclxuXHJcbnZhciBfX3NldE1vZHVsZURlZmF1bHQgPSBPYmplY3QuY3JlYXRlID8gKGZ1bmN0aW9uKG8sIHYpIHtcclxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvLCBcImRlZmF1bHRcIiwgeyBlbnVtZXJhYmxlOiB0cnVlLCB2YWx1ZTogdiB9KTtcclxufSkgOiBmdW5jdGlvbihvLCB2KSB7XHJcbiAgICBvW1wiZGVmYXVsdFwiXSA9IHY7XHJcbn07XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19pbXBvcnRTdGFyKG1vZCkge1xyXG4gICAgaWYgKG1vZCAmJiBtb2QuX19lc01vZHVsZSkgcmV0dXJuIG1vZDtcclxuICAgIHZhciByZXN1bHQgPSB7fTtcclxuICAgIGlmIChtb2QgIT0gbnVsbCkgZm9yICh2YXIgayBpbiBtb2QpIGlmIChPYmplY3QuaGFzT3duUHJvcGVydHkuY2FsbChtb2QsIGspKSBfX2NyZWF0ZUJpbmRpbmcocmVzdWx0LCBtb2QsIGspO1xyXG4gICAgX19zZXRNb2R1bGVEZWZhdWx0KHJlc3VsdCwgbW9kKTtcclxuICAgIHJldHVybiByZXN1bHQ7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2ltcG9ydERlZmF1bHQobW9kKSB7XHJcbiAgICByZXR1cm4gKG1vZCAmJiBtb2QuX19lc01vZHVsZSkgPyBtb2QgOiB7IGRlZmF1bHQ6IG1vZCB9O1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19jbGFzc1ByaXZhdGVGaWVsZEdldChyZWNlaXZlciwgcHJpdmF0ZU1hcCkge1xyXG4gICAgaWYgKCFwcml2YXRlTWFwLmhhcyhyZWNlaXZlcikpIHtcclxuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiYXR0ZW1wdGVkIHRvIGdldCBwcml2YXRlIGZpZWxkIG9uIG5vbi1pbnN0YW5jZVwiKTtcclxuICAgIH1cclxuICAgIHJldHVybiBwcml2YXRlTWFwLmdldChyZWNlaXZlcik7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2NsYXNzUHJpdmF0ZUZpZWxkU2V0KHJlY2VpdmVyLCBwcml2YXRlTWFwLCB2YWx1ZSkge1xyXG4gICAgaWYgKCFwcml2YXRlTWFwLmhhcyhyZWNlaXZlcikpIHtcclxuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiYXR0ZW1wdGVkIHRvIHNldCBwcml2YXRlIGZpZWxkIG9uIG5vbi1pbnN0YW5jZVwiKTtcclxuICAgIH1cclxuICAgIHByaXZhdGVNYXAuc2V0KHJlY2VpdmVyLCB2YWx1ZSk7XHJcbiAgICByZXR1cm4gdmFsdWU7XHJcbn1cclxuIiwiaW1wb3J0IHsgQ2xvY2sgfSBmcm9tICcuL0Nsb2NrJztcblxuLyoqXG4gKiBDbGFzcyB0aGF0IGRlYWxzIHdpdGggdGltZS5cbiAqIFRoaXMgaXMgXCJmcmFtZVwiIHR5cGUgY2xvY2ssIHRoZSBmcmFtZSBpbmNyZWFzZXMgZXZlcnkge0BsaW5rIENsb2NrRnJhbWUjdXBkYXRlfSBjYWxsLlxuICogQHBhcmFtIGZwcyBGcmFtZXMgcGVyIHNlY29uZFxuICovXG5leHBvcnQgY2xhc3MgQ2xvY2tGcmFtZSBleHRlbmRzIENsb2NrIHtcbiAgLyoqXG4gICAqIEl0cyBjdXJyZW50IGZyYW1lLlxuICAgKi9cbiAgcHJpdmF0ZSBfX2ZyYW1lID0gMDtcblxuICAvKipcbiAgICogSXRzIGZwcy5cbiAgICovXG4gIHByaXZhdGUgX19mcHM6IG51bWJlcjtcblxuICBwdWJsaWMgY29uc3RydWN0b3IoIGZwcyA9IDYwICkge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5fX2ZwcyA9IGZwcztcbiAgfVxuXG4gIC8qKlxuICAgKiBJdHMgY3VycmVudCBmcmFtZS5cbiAgICovXG4gIHB1YmxpYyBnZXQgZnJhbWUoKTogbnVtYmVyIHsgcmV0dXJuIHRoaXMuX19mcmFtZTsgfVxuXG4gIC8qKlxuICAgKiBJdHMgZnBzLlxuICAgKi9cbiAgcHVibGljIGdldCBmcHMoKTogbnVtYmVyIHsgcmV0dXJuIHRoaXMuX19mcHM7IH1cblxuICAvKipcbiAgICogVXBkYXRlIHRoZSBjbG9jay4gSXQgd2lsbCBpbmNyZWFzZSB0aGUgZnJhbWUgYnkgMS5cbiAgICovXG4gIHB1YmxpYyB1cGRhdGUoKTogdm9pZCB7XG4gICAgaWYgKCB0aGlzLl9faXNQbGF5aW5nICkge1xuICAgICAgdGhpcy5fX3RpbWUgPSB0aGlzLl9fZnJhbWUgLyB0aGlzLl9fZnBzO1xuICAgICAgdGhpcy5fX2RlbHRhVGltZSA9IDEuMCAvIHRoaXMuX19mcHM7XG4gICAgICB0aGlzLl9fZnJhbWUgKys7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX19kZWx0YVRpbWUgPSAwLjA7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFNldCB0aGUgdGltZSBtYW51YWxseS5cbiAgICogVGhlIHNldCB0aW1lIHdpbGwgYmUgY29udmVydGVkIGludG8gaW50ZXJuYWwgZnJhbWUgY291bnQsIHNvIHRoZSB0aW1lIHdpbGwgbm90IGJlIGV4YWN0bHkgc2FtZSBhcyBzZXQgb25lLlxuICAgKiBAcGFyYW0gdGltZSBUaW1lXG4gICAqL1xuICBwdWJsaWMgc2V0VGltZSggdGltZTogbnVtYmVyICk6IHZvaWQge1xuICAgIHRoaXMuX19mcmFtZSA9IE1hdGguZmxvb3IoIHRoaXMuX19mcHMgKiB0aW1lICk7XG4gICAgdGhpcy5fX3RpbWUgPSB0aGlzLl9fZnJhbWUgLyB0aGlzLl9fZnBzO1xuICB9XG59XG4iLCJpbXBvcnQgeyBDbG9jayB9IGZyb20gJy4vQ2xvY2snO1xuXG4vKipcbiAqIENsYXNzIHRoYXQgZGVhbHMgd2l0aCB0aW1lLlxuICogVGhpcyBpcyBcInJlYWx0aW1lXCIgdHlwZSBjbG9jaywgdGhlIHRpbWUgZ29lcyBvbiBhcyByZWFsIHdvcmxkLlxuICovXG5leHBvcnQgY2xhc3MgQ2xvY2tSZWFsdGltZSBleHRlbmRzIENsb2NrIHtcbiAgLyoqXG4gICAqIFwiWW91IHNldCB0aGUgdGltZSBtYW51YWxseSB0byBgX19ydFRpbWVgIHdoZW4gaXQncyBgX19ydERhdGVgLlwiXG4gICAqL1xuICBwcml2YXRlIF9fcnRUaW1lID0gMC4wO1xuXG4gIC8qKlxuICAgKiBcIllvdSBzZXQgdGhlIHRpbWUgbWFudWFsbHkgdG8gYF9fcnRUaW1lYCB3aGVuIGl0J3MgYF9fcnREYXRlYC5cIlxuICAgKi9cbiAgcHJpdmF0ZSBfX3J0RGF0ZTogbnVtYmVyID0gcGVyZm9ybWFuY2Uubm93KCk7XG5cbiAgLyoqXG4gICAqIFRoZSBjbG9jayBpcyByZWFsdGltZS4geWVhaC5cbiAgICovXG4gIHB1YmxpYyBnZXQgaXNSZWFsdGltZSgpOiBib29sZWFuIHsgcmV0dXJuIHRydWU7IH1cblxuICAvKipcbiAgICogVXBkYXRlIHRoZSBjbG9jay4gVGltZSBpcyBjYWxjdWxhdGVkIGJhc2VkIG9uIHRpbWUgaW4gcmVhbCB3b3JsZC5cbiAgICovXG4gIHB1YmxpYyB1cGRhdGUoKTogdm9pZCB7XG4gICAgY29uc3Qgbm93ID0gcGVyZm9ybWFuY2Uubm93KCk7XG5cbiAgICBpZiAoIHRoaXMuX19pc1BsYXlpbmcgKSB7XG4gICAgICBjb25zdCBwcmV2VGltZSA9IHRoaXMuX190aW1lO1xuICAgICAgY29uc3QgZGVsdGFEYXRlID0gKCBub3cgLSB0aGlzLl9fcnREYXRlICk7XG4gICAgICB0aGlzLl9fdGltZSA9IHRoaXMuX19ydFRpbWUgKyBkZWx0YURhdGUgLyAxMDAwLjA7XG4gICAgICB0aGlzLl9fZGVsdGFUaW1lID0gdGhpcy50aW1lIC0gcHJldlRpbWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX19ydFRpbWUgPSB0aGlzLnRpbWU7XG4gICAgICB0aGlzLl9fcnREYXRlID0gbm93O1xuICAgICAgdGhpcy5fX2RlbHRhVGltZSA9IDAuMDtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogU2V0IHRoZSB0aW1lIG1hbnVhbGx5LlxuICAgKiBAcGFyYW0gdGltZSBUaW1lXG4gICAqL1xuICBwdWJsaWMgc2V0VGltZSggdGltZTogbnVtYmVyICk6IHZvaWQge1xuICAgIHRoaXMuX190aW1lID0gdGltZTtcbiAgICB0aGlzLl9fcnRUaW1lID0gdGhpcy50aW1lO1xuICAgIHRoaXMuX19ydERhdGUgPSBwZXJmb3JtYW5jZS5ub3coKTtcbiAgfVxufVxuIiwiLyoqXG4gKiBgbGVycGAsIG9yIGBtaXhgXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBsZXJwKCBhOiBudW1iZXIsIGI6IG51bWJlciwgeDogbnVtYmVyICk6IG51bWJlciB7XG4gIHJldHVybiBhICsgKCBiIC0gYSApICogeDtcbn1cblxuLyoqXG4gKiBgY2xhbXBgXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjbGFtcCggeDogbnVtYmVyLCBsOiBudW1iZXIsIGg6IG51bWJlciApOiBudW1iZXIge1xuICByZXR1cm4gTWF0aC5taW4oIE1hdGgubWF4KCB4LCBsICksIGggKTtcbn1cblxuLyoqXG4gKiBgY2xhbXAoIHgsIDAuMCwgMS4wIClgXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzYXR1cmF0ZSggeDogbnVtYmVyICk6IG51bWJlciB7XG4gIHJldHVybiBjbGFtcCggeCwgMC4wLCAxLjAgKTtcbn1cblxuLyoqXG4gKiBgc21vb3Roc3RlcGAgYnV0IG5vdCBzbW9vdGhcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGxpbmVhcnN0ZXAoIGE6IG51bWJlciwgYjogbnVtYmVyLCB4OiBudW1iZXIgKTogbnVtYmVyIHtcbiAgcmV0dXJuIHNhdHVyYXRlKCAoIHggLSBhICkgLyAoIGIgLSBhICkgKTtcbn1cblxuLyoqXG4gKiB3b3JsZCBmYW1vdXMgYHNtb290aHN0ZXBgIGZ1bmN0aW9uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzbW9vdGhzdGVwKCBhOiBudW1iZXIsIGI6IG51bWJlciwgeDogbnVtYmVyICk6IG51bWJlciB7XG4gIGNvbnN0IHQgPSBsaW5lYXJzdGVwKCBhLCBiLCB4ICk7XG4gIHJldHVybiB0ICogdCAqICggMy4wIC0gMi4wICogdCApO1xufVxuXG4vKipcbiAqIGBzbW9vdGhzdGVwYCBidXQgbW9yZSBzbW9vdGhcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNtb290aGVyc3RlcCggYTogbnVtYmVyLCBiOiBudW1iZXIsIHg6IG51bWJlciApOiBudW1iZXIge1xuICBjb25zdCB0ID0gbGluZWFyc3RlcCggYSwgYiwgeCApO1xuICByZXR1cm4gdCAqIHQgKiB0ICogKCB0ICogKCB0ICogNi4wIC0gMTUuMCApICsgMTAuMCApO1xufVxuXG4vKipcbiAqIGBzbW9vdGhzdGVwYCBidXQgV0FZIG1vcmUgc21vb3RoXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzbW9vdGhlc3RzdGVwKCBhOiBudW1iZXIsIGI6IG51bWJlciwgeDogbnVtYmVyICk6IG51bWJlciB7XG4gIGNvbnN0IHQgPSBsaW5lYXJzdGVwKCBhLCBiLCB4ICk7XG4gIHJldHVybiB0ICogdCAqIHQgKiB0ICogKCB0ICogKCB0ICogKCAtMjAuMCAqIHQgKyA3MC4wICkgLSA4NC4wICkgKyAzNS4wICk7XG59XG4iLCJpbXBvcnQgeyBsZXJwIH0gZnJvbSAnLi4vbWF0aC91dGlscyc7XG5cbi8qKlxuICogRG8gZXhwIHNtb290aGluZ1xuICovXG5leHBvcnQgY2xhc3MgRXhwU21vb3RoIHtcbiAgcHVibGljIGZhY3RvciA9IDEwLjA7XG4gIHB1YmxpYyB0YXJnZXQgPSAwLjA7XG4gIHB1YmxpYyB2YWx1ZSA9IDAuMDtcblxuICBwdWJsaWMgdXBkYXRlKCBkZWx0YVRpbWU6IG51bWJlciApOiBudW1iZXIge1xuICAgIHRoaXMudmFsdWUgPSBsZXJwKCB0aGlzLnRhcmdldCwgdGhpcy52YWx1ZSwgTWF0aC5leHAoIC10aGlzLmZhY3RvciAqIGRlbHRhVGltZSApICk7XG4gICAgcmV0dXJuIHRoaXMudmFsdWU7XG4gIH1cbn1cbiIsIi8qKlxuICogSXRlcmFibGUgRml6ekJ1enpcbiAqL1xuZXhwb3J0IGNsYXNzIEZpenpCdXp6IGltcGxlbWVudHMgSXRlcmFibGU8bnVtYmVyIHwgc3RyaW5nPiB7XG4gIHB1YmxpYyBzdGF0aWMgV29yZHNEZWZhdWx0OiBNYXA8bnVtYmVyLCBzdHJpbmc+ID0gbmV3IE1hcCggW1xuICAgIFsgMywgJ0ZpenonIF0sXG4gICAgWyA1LCAnQnV6eicgXVxuICBdICk7XG5cbiAgcHJpdmF0ZSBfX3dvcmRzOiBNYXA8bnVtYmVyLCBzdHJpbmc+O1xuICBwcml2YXRlIF9faW5kZXg6IG51bWJlcjtcbiAgcHJpdmF0ZSBfX2VuZDogbnVtYmVyO1xuXG4gIHB1YmxpYyBjb25zdHJ1Y3Rvciggd29yZHM6IE1hcDxudW1iZXIsIHN0cmluZz4gPSBGaXp6QnV6ei5Xb3Jkc0RlZmF1bHQsIGluZGV4ID0gMSwgZW5kID0gMTAwICkge1xuICAgIHRoaXMuX193b3JkcyA9IHdvcmRzO1xuICAgIHRoaXMuX19pbmRleCA9IGluZGV4O1xuICAgIHRoaXMuX19lbmQgPSBlbmQ7XG4gIH1cblxuICBwdWJsaWMgWyBTeW1ib2wuaXRlcmF0b3IgXSgpOiBJdGVyYXRvcjxzdHJpbmcgfCBudW1iZXIsIGFueSwgdW5kZWZpbmVkPiB7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBwdWJsaWMgbmV4dCgpOiBJdGVyYXRvclJlc3VsdDxudW1iZXIgfCBzdHJpbmc+IHtcbiAgICBpZiAoIHRoaXMuX19lbmQgPCB0aGlzLl9faW5kZXggKSB7XG4gICAgICByZXR1cm4geyBkb25lOiB0cnVlLCB2YWx1ZTogbnVsbCB9O1xuICAgIH1cblxuICAgIGxldCB2YWx1ZTogbnVtYmVyIHwgc3RyaW5nID0gJyc7XG4gICAgZm9yICggY29uc3QgWyByZW0sIHdvcmQgXSBvZiB0aGlzLl9fd29yZHMgKSB7XG4gICAgICBpZiAoICggdGhpcy5fX2luZGV4ICUgcmVtICkgPT09IDAgKSB7XG4gICAgICAgIHZhbHVlICs9IHdvcmQ7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKCB2YWx1ZSA9PT0gJycgKSB7XG4gICAgICB2YWx1ZSA9IHRoaXMuX19pbmRleDtcbiAgICB9XG5cbiAgICB0aGlzLl9faW5kZXggKys7XG5cbiAgICByZXR1cm4geyBkb25lOiBmYWxzZSwgdmFsdWUgfTtcbiAgfVxufVxuIiwiLyoqXG4gKiBNb3N0IGF3ZXNvbWUgY2F0IGV2ZXJcbiAqL1xuZXhwb3J0IGNsYXNzIEZNU19DYXQgeyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lXG4gIC8qKlxuICAgKiBGTVNfQ2F0LmdpZlxuICAgKi9cbiAgcHVibGljIHN0YXRpYyBnaWYgPSAnaHR0cHM6Ly9mbXMtY2F0LmNvbS9pbWFnZXMvZm1zX2NhdC5naWYnO1xuXG4gIC8qKlxuICAgKiBGTVNfQ2F0LnBuZ1xuICAgKi9cbiAgcHVibGljIHN0YXRpYyBwbmcgPSAnaHR0cHM6Ly9mbXMtY2F0LmNvbS9pbWFnZXMvZm1zX2NhdC5wbmcnO1xufVxuIiwiLyoqXG4gKiBVc2VmdWwgZm9yIGZwcyBjYWxjXG4gKi9cbmV4cG9ydCBjbGFzcyBIaXN0b3J5TWVhbkNhbGN1bGF0b3Ige1xuICBwcml2YXRlIF9fcmVjYWxjRm9yRWFjaCA9IDA7XG4gIHByaXZhdGUgX19jb3VudFVudGlsUmVjYWxjID0gMDtcbiAgcHJpdmF0ZSBfX2hpc3Rvcnk6IG51bWJlcltdID0gW107XG4gIHByaXZhdGUgX19pbmRleCA9IDA7XG4gIHByaXZhdGUgX19sZW5ndGg6IG51bWJlcjtcbiAgcHJpdmF0ZSBfX2NvdW50ID0gMDtcbiAgcHJpdmF0ZSBfX2NhY2hlID0gMDtcblxuICBwdWJsaWMgY29uc3RydWN0b3IoIGxlbmd0aDogbnVtYmVyICkge1xuICAgIHRoaXMuX19sZW5ndGggPSBsZW5ndGg7XG4gICAgdGhpcy5fX3JlY2FsY0ZvckVhY2ggPSBsZW5ndGg7XG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgbGVuZ3RoOyBpICsrICkge1xuICAgICAgdGhpcy5fX2hpc3RvcnlbIGkgXSA9IDA7XG4gICAgfVxuICB9XG5cbiAgcHVibGljIGdldCBtZWFuKCk6IG51bWJlciB7XG4gICAgY29uc3QgY291bnQgPSBNYXRoLm1pbiggdGhpcy5fX2NvdW50LCB0aGlzLl9fbGVuZ3RoICk7XG4gICAgcmV0dXJuIGNvdW50ID09PSAwID8gMC4wIDogdGhpcy5fX2NhY2hlIC8gY291bnQ7XG4gIH1cblxuICBwdWJsaWMgZ2V0IHJlY2FsY0ZvckVhY2goKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5fX3JlY2FsY0ZvckVhY2g7XG4gIH1cblxuICBwdWJsaWMgc2V0IHJlY2FsY0ZvckVhY2goIHZhbHVlOiBudW1iZXIgKSB7XG4gICAgY29uc3QgZGVsdGEgPSB2YWx1ZSAtIHRoaXMuX19yZWNhbGNGb3JFYWNoO1xuICAgIHRoaXMuX19yZWNhbGNGb3JFYWNoID0gdmFsdWU7XG4gICAgdGhpcy5fX2NvdW50VW50aWxSZWNhbGMgPSBNYXRoLm1heCggMCwgdGhpcy5fX2NvdW50VW50aWxSZWNhbGMgKyBkZWx0YSApO1xuICB9XG5cbiAgcHVibGljIHJlc2V0KCk6IHZvaWQge1xuICAgIHRoaXMuX19pbmRleCA9IDA7XG4gICAgdGhpcy5fX2NvdW50ID0gMDtcbiAgICB0aGlzLl9fY2FjaGUgPSAwO1xuICAgIHRoaXMuX19jb3VudFVudGlsUmVjYWxjID0gMDtcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB0aGlzLl9fbGVuZ3RoOyBpICsrICkge1xuICAgICAgdGhpcy5fX2hpc3RvcnlbIGkgXSA9IDA7XG4gICAgfVxuICB9XG5cbiAgcHVibGljIHB1c2goIHZhbHVlOiBudW1iZXIgKTogdm9pZCB7XG4gICAgY29uc3QgcHJldiA9IHRoaXMuX19oaXN0b3J5WyB0aGlzLl9faW5kZXggXTtcbiAgICB0aGlzLl9faGlzdG9yeVsgdGhpcy5fX2luZGV4IF0gPSB2YWx1ZTtcbiAgICB0aGlzLl9fY291bnQgKys7XG4gICAgdGhpcy5fX2luZGV4ID0gKCB0aGlzLl9faW5kZXggKyAxICkgJSB0aGlzLl9fbGVuZ3RoO1xuXG4gICAgaWYgKCB0aGlzLl9fY291bnRVbnRpbFJlY2FsYyA9PT0gMCApIHtcbiAgICAgIHRoaXMucmVjYWxjKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX19jb3VudFVudGlsUmVjYWxjIC0tO1xuICAgICAgdGhpcy5fX2NhY2hlIC09IHByZXY7XG4gICAgICB0aGlzLl9fY2FjaGUgKz0gdmFsdWU7XG4gICAgfVxuICB9XG5cbiAgcHVibGljIHJlY2FsYygpOiB2b2lkIHtcbiAgICB0aGlzLl9fY291bnRVbnRpbFJlY2FsYyA9IHRoaXMuX19yZWNhbGNGb3JFYWNoO1xuICAgIGNvbnN0IHN1bSA9IHRoaXMuX19oaXN0b3J5XG4gICAgICAuc2xpY2UoIDAsIE1hdGgubWluKCB0aGlzLl9fY291bnQsIHRoaXMuX19sZW5ndGggKSApXG4gICAgICAucmVkdWNlKCAoIHN1bSwgdiApID0+IHN1bSArIHYsIDAgKTtcbiAgICB0aGlzLl9fY2FjaGUgPSBzdW07XG4gIH1cbn1cbiIsImltcG9ydCB7IGJpbmFyeVNlYXJjaCB9IGZyb20gJy4uL2FsZ29yaXRobS9iaW5hcnlTZWFyY2gnO1xuXG4vKipcbiAqIFVzZWZ1bCBmb3IgdGFwIHRlbXBvXG4gKiBTZWUgYWxzbzoge0BsaW5rIEhpc3RvcnlNZWFuQ2FsY3VsYXRvcn1cbiAqL1xuZXhwb3J0IGNsYXNzIEhpc3RvcnlNZWRpYW5DYWxjdWxhdG9yIHtcbiAgcHJpdmF0ZSBfX2hpc3Rvcnk6IG51bWJlcltdID0gW107XG4gIHByaXZhdGUgX19zb3J0ZWQ6IG51bWJlcltdID0gW107XG4gIHByaXZhdGUgX19pbmRleCA9IDA7XG4gIHByaXZhdGUgcmVhZG9ubHkgX19sZW5ndGg6IG51bWJlcjtcblxuICBwdWJsaWMgY29uc3RydWN0b3IoIGxlbmd0aDogbnVtYmVyICkge1xuICAgIHRoaXMuX19sZW5ndGggPSBsZW5ndGg7XG4gIH1cblxuICBwdWJsaWMgZ2V0IG1lZGlhbigpOiBudW1iZXIge1xuICAgIGNvbnN0IGNvdW50ID0gTWF0aC5taW4oIHRoaXMuX19zb3J0ZWQubGVuZ3RoLCB0aGlzLl9fbGVuZ3RoICk7XG4gICAgcmV0dXJuIHRoaXMuX19zb3J0ZWRbIE1hdGguZmxvb3IoICggY291bnQgLSAxICkgLyAyICkgXTtcbiAgfVxuXG4gIHB1YmxpYyByZXNldCgpOiB2b2lkIHtcbiAgICB0aGlzLl9faW5kZXggPSAwO1xuICAgIHRoaXMuX19oaXN0b3J5ID0gW107XG4gICAgdGhpcy5fX3NvcnRlZCA9IFtdO1xuICB9XG5cbiAgcHVibGljIHB1c2goIHZhbHVlOiBudW1iZXIgKTogdm9pZCB7XG4gICAgY29uc3QgcHJldiA9IHRoaXMuX19oaXN0b3J5WyB0aGlzLl9faW5kZXggXTtcbiAgICB0aGlzLl9faGlzdG9yeVsgdGhpcy5fX2luZGV4IF0gPSB2YWx1ZTtcbiAgICB0aGlzLl9faW5kZXggPSAoIHRoaXMuX19pbmRleCArIDEgKSAlIHRoaXMuX19sZW5ndGg7XG5cbiAgICAvLyByZW1vdmUgdGhlIHByZXYgZnJvbSBzb3J0ZWQgYXJyYXlcbiAgICBpZiAoIHRoaXMuX19zb3J0ZWQubGVuZ3RoID09PSB0aGlzLl9fbGVuZ3RoICkge1xuICAgICAgY29uc3QgcHJldkluZGV4ID0gYmluYXJ5U2VhcmNoKCBwcmV2LCB0aGlzLl9fc29ydGVkICk7XG4gICAgICB0aGlzLl9fc29ydGVkLnNwbGljZSggcHJldkluZGV4LCAxICk7XG4gICAgfVxuXG4gICAgY29uc3QgaW5kZXggPSBiaW5hcnlTZWFyY2goIHZhbHVlLCB0aGlzLl9fc29ydGVkICk7XG4gICAgdGhpcy5fX3NvcnRlZC5zcGxpY2UoIGluZGV4LCAwLCB2YWx1ZSApO1xuICB9XG59XG4iLCIvKipcbiAqIEEgVmVjdG9yLlxuICovXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgVmVjdG9yPFQgZXh0ZW5kcyBWZWN0b3I8VD4+IHtcbiAgcHVibGljIGFic3RyYWN0IGVsZW1lbnRzOiBudW1iZXJbXTtcblxuICAvKipcbiAgICogVGhlIGxlbmd0aCBvZiB0aGlzLlxuICAgKiBhLmsuYS4gYG1hZ25pdHVkZWBcbiAgICovXG4gIHB1YmxpYyBnZXQgbGVuZ3RoKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIE1hdGguc3FydCggdGhpcy5lbGVtZW50cy5yZWR1Y2UoICggc3VtLCB2ICkgPT4gc3VtICsgdiAqIHYsIDAuMCApICk7XG4gIH1cblxuICAvKipcbiAgICogQSBub3JtYWxpemVkIFZlY3RvcjMgb2YgdGhpcy5cbiAgICovXG4gIHB1YmxpYyBnZXQgbm9ybWFsaXplZCgpOiBUIHtcbiAgICByZXR1cm4gdGhpcy5zY2FsZSggMS4wIC8gdGhpcy5sZW5ndGggKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDbG9uZSB0aGlzLlxuICAgKi9cbiAgcHVibGljIGNsb25lKCk6IFQge1xuICAgIHJldHVybiB0aGlzLl9fbmV3KCB0aGlzLmVsZW1lbnRzLmNvbmNhdCgpICk7XG4gIH1cblxuICAvKipcbiAgICogQWRkIGEgVmVjdG9yIGludG8gdGhpcy5cbiAgICogQHBhcmFtIHZlY3RvciBBbm90aGVyIFZlY3RvclxuICAgKi9cbiAgcHVibGljIGFkZCggdmVjdG9yOiBUICk6IFQge1xuICAgIHJldHVybiB0aGlzLl9fbmV3KCB0aGlzLmVsZW1lbnRzLm1hcCggKCB2LCBpICkgPT4gdiArIHZlY3Rvci5lbGVtZW50c1sgaSBdICkgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTdWJzdHJhY3QgdGhpcyBmcm9tIGFub3RoZXIgVmVjdG9yLlxuICAgKiBAcGFyYW0gdiBBbm90aGVyIHZlY3RvclxuICAgKi9cbiAgcHVibGljIHN1YiggdmVjdG9yOiBUICk6IFQge1xuICAgIHJldHVybiB0aGlzLl9fbmV3KCB0aGlzLmVsZW1lbnRzLm1hcCggKCB2LCBpICkgPT4gdiAtIHZlY3Rvci5lbGVtZW50c1sgaSBdICkgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBNdWx0aXBseSBhIFZlY3RvciB3aXRoIHRoaXMuXG4gICAqIEBwYXJhbSB2ZWN0b3IgQW5vdGhlciBWZWN0b3JcbiAgICovXG4gIHB1YmxpYyBtdWx0aXBseSggdmVjdG9yOiBUICk6IFQge1xuICAgIHJldHVybiB0aGlzLl9fbmV3KCB0aGlzLmVsZW1lbnRzLm1hcCggKCB2LCBpICkgPT4gdiAqIHZlY3Rvci5lbGVtZW50c1sgaSBdICkgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBEaXZpZGUgdGhpcyBmcm9tIGFub3RoZXIgVmVjdG9yLlxuICAgKiBAcGFyYW0gdmVjdG9yIEFub3RoZXIgVmVjdG9yXG4gICAqL1xuICBwdWJsaWMgZGl2aWRlKCB2ZWN0b3I6IFQgKTogVCB7XG4gICAgcmV0dXJuIHRoaXMuX19uZXcoIHRoaXMuZWxlbWVudHMubWFwKCAoIHYsIGkgKSA9PiB2IC8gdmVjdG9yLmVsZW1lbnRzWyBpIF0gKSApO1xuICB9XG5cbiAgLyoqXG4gICAqIFNjYWxlIHRoaXMgYnkgc2NhbGFyLlxuICAgKiBhLmsuYS4gYG11bHRpcGx5U2NhbGFyYFxuICAgKiBAcGFyYW0gc2NhbGFyIEEgc2NhbGFyXG4gICAqL1xuICBwdWJsaWMgc2NhbGUoIHNjYWxhcjogbnVtYmVyICk6IFQge1xuICAgIHJldHVybiB0aGlzLl9fbmV3KCB0aGlzLmVsZW1lbnRzLm1hcCggKCB2ICkgPT4gdiAqIHNjYWxhciApICk7XG4gIH1cblxuICAvKipcbiAgICogRG90IHR3byBWZWN0b3JzLlxuICAgKiBAcGFyYW0gdmVjdG9yIEFub3RoZXIgdmVjdG9yXG4gICAqL1xuICBwdWJsaWMgZG90KCB2ZWN0b3I6IFQgKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5lbGVtZW50cy5yZWR1Y2UoICggc3VtLCB2LCBpICkgPT4gc3VtICsgdiAqIHZlY3Rvci5lbGVtZW50c1sgaSBdLCAwLjAgKTtcbiAgfVxuXG4gIHByb3RlY3RlZCBhYnN0cmFjdCBfX25ldyggdjogbnVtYmVyW10gKTogVDtcbn1cbiIsImltcG9ydCB7IE1hdHJpeDQgfSBmcm9tICcuL01hdHJpeDQnO1xuaW1wb3J0IHsgUXVhdGVybmlvbiB9IGZyb20gJy4vUXVhdGVybmlvbic7XG5pbXBvcnQgeyBWZWN0b3IgfSBmcm9tICcuL1ZlY3Rvcic7XG5cbmV4cG9ydCB0eXBlIHJhd1ZlY3RvcjMgPSBbIG51bWJlciwgbnVtYmVyLCBudW1iZXIgXTtcblxuLyoqXG4gKiBBIFZlY3RvcjMuXG4gKi9cbmV4cG9ydCBjbGFzcyBWZWN0b3IzIGV4dGVuZHMgVmVjdG9yPFZlY3RvcjM+IHtcbiAgcHVibGljIGVsZW1lbnRzOiByYXdWZWN0b3IzO1xuXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggdjogcmF3VmVjdG9yMyA9IFsgMC4wLCAwLjAsIDAuMCBdICkge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5lbGVtZW50cyA9IHY7XG4gIH1cblxuICAvKipcbiAgICogQW4geCBjb21wb25lbnQgb2YgdGhpcy5cbiAgICovXG4gIHB1YmxpYyBnZXQgeCgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLmVsZW1lbnRzWyAwIF07XG4gIH1cblxuICBwdWJsaWMgc2V0IHgoIHg6IG51bWJlciApIHtcbiAgICB0aGlzLmVsZW1lbnRzWyAwIF0gPSB4O1xuICB9XG5cbiAgLyoqXG4gICAqIEFuIHkgY29tcG9uZW50IG9mIHRoaXMuXG4gICAqL1xuICBwdWJsaWMgZ2V0IHkoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5lbGVtZW50c1sgMSBdO1xuICB9XG5cbiAgcHVibGljIHNldCB5KCB5OiBudW1iZXIgKSB7XG4gICAgdGhpcy5lbGVtZW50c1sgMSBdID0geTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBbiB6IGNvbXBvbmVudCBvZiB0aGlzLlxuICAgKi9cbiAgcHVibGljIGdldCB6KCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuZWxlbWVudHNbIDIgXTtcbiAgfVxuXG4gIHB1YmxpYyBzZXQgeiggejogbnVtYmVyICkge1xuICAgIHRoaXMuZWxlbWVudHNbIDIgXSA9IHo7XG4gIH1cblxuICBwdWJsaWMgdG9TdHJpbmcoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gYFZlY3RvcjMoICR7IHRoaXMueC50b0ZpeGVkKCAzICkgfSwgJHsgdGhpcy55LnRvRml4ZWQoIDMgKSB9LCAkeyB0aGlzLnoudG9GaXhlZCggMyApIH0gKWA7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJuIGEgY3Jvc3Mgb2YgdGhpcyBhbmQgYW5vdGhlciBWZWN0b3IzLlxuICAgKiBAcGFyYW0gdmVjdG9yIEFub3RoZXIgdmVjdG9yXG4gICAqL1xuICBwdWJsaWMgY3Jvc3MoIHZlY3RvcjogVmVjdG9yMyApOiBWZWN0b3IzIHtcbiAgICByZXR1cm4gbmV3IFZlY3RvcjMoIFtcbiAgICAgIHRoaXMueSAqIHZlY3Rvci56IC0gdGhpcy56ICogdmVjdG9yLnksXG4gICAgICB0aGlzLnogKiB2ZWN0b3IueCAtIHRoaXMueCAqIHZlY3Rvci56LFxuICAgICAgdGhpcy54ICogdmVjdG9yLnkgLSB0aGlzLnkgKiB2ZWN0b3IueFxuICAgIF0gKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSb3RhdGUgdGhpcyB2ZWN0b3IgdXNpbmcgYSBRdWF0ZXJuaW9uLlxuICAgKiBAcGFyYW0gcXVhdGVybmlvbiBBIHF1YXRlcm5pb25cbiAgICovXG4gIHB1YmxpYyBhcHBseVF1YXRlcm5pb24oIHF1YXRlcm5pb246IFF1YXRlcm5pb24gKTogVmVjdG9yMyB7XG4gICAgY29uc3QgcCA9IG5ldyBRdWF0ZXJuaW9uKCBbIHRoaXMueCwgdGhpcy55LCB0aGlzLnosIDAuMCBdICk7XG4gICAgY29uc3QgciA9IHF1YXRlcm5pb24uaW52ZXJzZWQ7XG4gICAgY29uc3QgcmVzID0gcXVhdGVybmlvbi5tdWx0aXBseSggcCApLm11bHRpcGx5KCByICk7XG4gICAgcmV0dXJuIG5ldyBWZWN0b3IzKCBbIHJlcy54LCByZXMueSwgcmVzLnogXSApO1xuICB9XG5cbiAgLyoqXG4gICAqIE11bHRpcGx5IHRoaXMgdmVjdG9yICh3aXRoIGFuIGltcGxpY2l0IDEgaW4gdGhlIDR0aCBkaW1lbnNpb24pIGJ5IG0uXG4gICAqL1xuICBwdWJsaWMgYXBwbHlNYXRyaXg0KCBtYXRyaXg6IE1hdHJpeDQgKTogVmVjdG9yMyB7XG4gICAgY29uc3QgbSA9IG1hdHJpeC5lbGVtZW50cztcblxuICAgIGNvbnN0IHcgPSBtWyAzIF0gKiB0aGlzLnggKyBtWyA3IF0gKiB0aGlzLnkgKyBtWyAxMSBdICogdGhpcy56ICsgbVsgMTUgXTtcbiAgICBjb25zdCBpbnZXID0gMS4wIC8gdztcblxuICAgIHJldHVybiBuZXcgVmVjdG9yMyggW1xuICAgICAgKCBtWyAwIF0gKiB0aGlzLnggKyBtWyA0IF0gKiB0aGlzLnkgKyBtWyA4IF0gKiB0aGlzLnogKyBtWyAxMiBdICkgKiBpbnZXLFxuICAgICAgKCBtWyAxIF0gKiB0aGlzLnggKyBtWyA1IF0gKiB0aGlzLnkgKyBtWyA5IF0gKiB0aGlzLnogKyBtWyAxMyBdICkgKiBpbnZXLFxuICAgICAgKCBtWyAyIF0gKiB0aGlzLnggKyBtWyA2IF0gKiB0aGlzLnkgKyBtWyAxMCBdICogdGhpcy56ICsgbVsgMTQgXSApICogaW52V1xuICAgIF0gKTtcbiAgfVxuXG4gIHByb3RlY3RlZCBfX25ldyggdjogcmF3VmVjdG9yMyApOiBWZWN0b3IzIHtcbiAgICByZXR1cm4gbmV3IFZlY3RvcjMoIHYgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBWZWN0b3IzKCAwLjAsIDAuMCwgMC4wIClcbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgZ2V0IHplcm8oKTogVmVjdG9yMyB7XG4gICAgcmV0dXJuIG5ldyBWZWN0b3IzKCBbIDAuMCwgMC4wLCAwLjAgXSApO1xuICB9XG5cbiAgLyoqXG4gICAqIFZlY3RvcjMoIDEuMCwgMS4wLCAxLjAgKVxuICAgKi9cbiAgcHVibGljIHN0YXRpYyBnZXQgb25lKCk6IFZlY3RvcjMge1xuICAgIHJldHVybiBuZXcgVmVjdG9yMyggWyAxLjAsIDEuMCwgMS4wIF0gKTtcbiAgfVxufVxuIiwiaW1wb3J0IHsgTWF0cml4NCB9IGZyb20gJy4vTWF0cml4NCc7XG5pbXBvcnQgeyBWZWN0b3IzIH0gZnJvbSAnLi9WZWN0b3IzJztcblxuZXhwb3J0IHR5cGUgcmF3UXVhdGVybmlvbiA9IFsgbnVtYmVyLCBudW1iZXIsIG51bWJlciwgbnVtYmVyIF07XG5cbmV4cG9ydCBjb25zdCByYXdJZGVudGl0eVF1YXRlcm5pb246IHJhd1F1YXRlcm5pb24gPSBbIDAuMCwgMC4wLCAwLjAsIDEuMCBdO1xuXG4vKipcbiAqIEEgUXVhdGVybmlvbi5cbiAqL1xuZXhwb3J0IGNsYXNzIFF1YXRlcm5pb24ge1xuICBwdWJsaWMgZWxlbWVudHM6IHJhd1F1YXRlcm5pb247IC8vIFsgeCwgeSwgejsgdyBdXG5cbiAgcHVibGljIGNvbnN0cnVjdG9yKCBlbGVtZW50czogcmF3UXVhdGVybmlvbiA9IHJhd0lkZW50aXR5UXVhdGVybmlvbiApIHtcbiAgICB0aGlzLmVsZW1lbnRzID0gZWxlbWVudHM7XG4gIH1cblxuICAvKipcbiAgICogQW4geCBjb21wb25lbnQgb2YgdGhpcy5cbiAgICovXG4gIHB1YmxpYyBnZXQgeCgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLmVsZW1lbnRzWyAwIF07XG4gIH1cblxuICAvKipcbiAgICogQW4geSBjb21wb25lbnQgb2YgdGhpcy5cbiAgICovXG4gIHB1YmxpYyBnZXQgeSgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLmVsZW1lbnRzWyAxIF07XG4gIH1cblxuICAvKipcbiAgICogQW4geiBjb21wb25lbnQgb2YgdGhpcy5cbiAgICovXG4gIHB1YmxpYyBnZXQgeigpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLmVsZW1lbnRzWyAyIF07XG4gIH1cblxuICAvKipcbiAgICogQW4gdyBjb21wb25lbnQgb2YgdGhpcy5cbiAgICovXG4gIHB1YmxpYyBnZXQgdygpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLmVsZW1lbnRzWyAzIF07XG4gIH1cblxuICBwdWJsaWMgdG9TdHJpbmcoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gYFF1YXRlcm5pb24oICR7IHRoaXMueC50b0ZpeGVkKCAzICkgfSwgJHsgdGhpcy55LnRvRml4ZWQoIDMgKSB9LCAkeyB0aGlzLnoudG9GaXhlZCggMyApIH0sICR7IHRoaXMudy50b0ZpeGVkKCAzICkgfSApYDtcbiAgfVxuXG4gIC8qKlxuICAgKiBDbG9uZSB0aGlzLlxuICAgKi9cbiAgcHVibGljIGNsb25lKCk6IFF1YXRlcm5pb24ge1xuICAgIHJldHVybiBuZXcgUXVhdGVybmlvbiggdGhpcy5lbGVtZW50cy5jb25jYXQoKSBhcyByYXdRdWF0ZXJuaW9uICk7XG4gIH1cblxuICAvKipcbiAgICogSXRzZWxmIGJ1dCBjb252ZXJ0ZWQgaW50byBhIE1hdHJpeDQuXG4gICAqL1xuICBwdWJsaWMgZ2V0IG1hdHJpeCgpOiBNYXRyaXg0IHtcbiAgICBjb25zdCB4ID0gbmV3IFZlY3RvcjMoIFsgMS4wLCAwLjAsIDAuMCBdICkuYXBwbHlRdWF0ZXJuaW9uKCB0aGlzICk7XG4gICAgY29uc3QgeSA9IG5ldyBWZWN0b3IzKCBbIDAuMCwgMS4wLCAwLjAgXSApLmFwcGx5UXVhdGVybmlvbiggdGhpcyApO1xuICAgIGNvbnN0IHogPSBuZXcgVmVjdG9yMyggWyAwLjAsIDAuMCwgMS4wIF0gKS5hcHBseVF1YXRlcm5pb24oIHRoaXMgKTtcblxuICAgIHJldHVybiBuZXcgTWF0cml4NCggW1xuICAgICAgeC54LCB5LngsIHoueCwgMC4wLFxuICAgICAgeC55LCB5LnksIHoueSwgMC4wLFxuICAgICAgeC56LCB5LnosIHoueiwgMC4wLFxuICAgICAgMC4wLCAwLjAsIDAuMCwgMS4wXG4gICAgXSApO1xuICB9XG5cbiAgLyoqXG4gICAqIEFuIGludmVyc2Ugb2YgdGhpcy5cbiAgICovXG4gIHB1YmxpYyBnZXQgaW52ZXJzZWQoKTogUXVhdGVybmlvbiB7XG4gICAgcmV0dXJuIG5ldyBRdWF0ZXJuaW9uKCBbXG4gICAgICAtdGhpcy54LFxuICAgICAgLXRoaXMueSxcbiAgICAgIC10aGlzLnosXG4gICAgICB0aGlzLndcbiAgICBdICk7XG4gIH1cblxuICAvKipcbiAgICogTXVsdGlwbHkgdHdvIFF1YXRlcm5pb25zLlxuICAgKiBAcGFyYW0gcSBBbm90aGVyIFF1YXRlcm5pb25cbiAgICovXG4gIHB1YmxpYyBtdWx0aXBseSggcTogUXVhdGVybmlvbiApOiBRdWF0ZXJuaW9uIHtcbiAgICByZXR1cm4gbmV3IFF1YXRlcm5pb24oIFtcbiAgICAgIHRoaXMudyAqIHEueCArIHRoaXMueCAqIHEudyArIHRoaXMueSAqIHEueiAtIHRoaXMueiAqIHEueSxcbiAgICAgIHRoaXMudyAqIHEueSAtIHRoaXMueCAqIHEueiArIHRoaXMueSAqIHEudyArIHRoaXMueiAqIHEueCxcbiAgICAgIHRoaXMudyAqIHEueiArIHRoaXMueCAqIHEueSAtIHRoaXMueSAqIHEueCArIHRoaXMueiAqIHEudyxcbiAgICAgIHRoaXMudyAqIHEudyAtIHRoaXMueCAqIHEueCAtIHRoaXMueSAqIHEueSAtIHRoaXMueiAqIHEuelxuICAgIF0gKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBbiBpZGVudGl0eSBRdWF0ZXJuaW9uLlxuICAgKi9cbiAgcHVibGljIHN0YXRpYyBnZXQgaWRlbnRpdHkoKTogUXVhdGVybmlvbiB7XG4gICAgcmV0dXJuIG5ldyBRdWF0ZXJuaW9uKCByYXdJZGVudGl0eVF1YXRlcm5pb24gKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZW5lcmF0ZSBhIFF1YXRlcm5pb24gb3V0IG9mIGFuZ2xlIGFuZCBheGlzLlxuICAgKi9cbiAgcHVibGljIHN0YXRpYyBmcm9tQXhpc0FuZ2xlKCBheGlzOiBWZWN0b3IzLCBhbmdsZTogbnVtYmVyICk6IFF1YXRlcm5pb24ge1xuICAgIGNvbnN0IGhhbGZBbmdsZSA9IGFuZ2xlIC8gMi4wO1xuICAgIGNvbnN0IHNpbkhhbGZBbmdsZSA9IE1hdGguc2luKCBoYWxmQW5nbGUgKTtcbiAgICByZXR1cm4gbmV3IFF1YXRlcm5pb24oIFtcbiAgICAgIGF4aXMueCAqIHNpbkhhbGZBbmdsZSxcbiAgICAgIGF4aXMueSAqIHNpbkhhbGZBbmdsZSxcbiAgICAgIGF4aXMueiAqIHNpbkhhbGZBbmdsZSxcbiAgICAgIE1hdGguY29zKCBoYWxmQW5nbGUgKVxuICAgIF0gKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZW5lcmF0ZSBhIFF1YXRlcm5pb24gb3V0IG9mIGEgcm90YXRpb24gbWF0cml4LlxuICAgKiBZb2lua2VkIGZyb20gVGhyZWUuanMuXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIGZyb21NYXRyaXgoIG1hdHJpeDogTWF0cml4NCApOiBRdWF0ZXJuaW9uIHtcbiAgICBjb25zdCBtID0gbWF0cml4LmVsZW1lbnRzLFxuICAgICAgbTExID0gbVsgMCBdLCBtMTIgPSBtWyA0IF0sIG0xMyA9IG1bIDggXSxcbiAgICAgIG0yMSA9IG1bIDEgXSwgbTIyID0gbVsgNSBdLCBtMjMgPSBtWyA5IF0sXG4gICAgICBtMzEgPSBtWyAyIF0sIG0zMiA9IG1bIDYgXSwgbTMzID0gbVsgMTAgXSxcbiAgICAgIHRyYWNlID0gbTExICsgbTIyICsgbTMzO1xuXG4gICAgaWYgKCB0cmFjZSA+IDAgKSB7XG4gICAgICBjb25zdCBzID0gMC41IC8gTWF0aC5zcXJ0KCB0cmFjZSArIDEuMCApO1xuICAgICAgcmV0dXJuIG5ldyBRdWF0ZXJuaW9uKCBbXG4gICAgICAgICggbTMyIC0gbTIzICkgKiBzLFxuICAgICAgICAoIG0xMyAtIG0zMSApICogcyxcbiAgICAgICAgKCBtMjEgLSBtMTIgKSAqIHMsXG4gICAgICAgIDAuMjUgLyBzXG4gICAgICBdICk7XG4gICAgfSBlbHNlIGlmICggbTExID4gbTIyICYmIG0xMSA+IG0zMyApIHtcbiAgICAgIGNvbnN0IHMgPSAyLjAgKiBNYXRoLnNxcnQoIDEuMCArIG0xMSAtIG0yMiAtIG0zMyApO1xuICAgICAgcmV0dXJuIG5ldyBRdWF0ZXJuaW9uKCBbXG4gICAgICAgIDAuMjUgKiBzLFxuICAgICAgICAoIG0xMiArIG0yMSApIC8gcyxcbiAgICAgICAgKCBtMTMgKyBtMzEgKSAvIHMsXG4gICAgICAgICggbTMyIC0gbTIzICkgLyBzXG4gICAgICBdICk7XG4gICAgfSBlbHNlIGlmICggbTIyID4gbTMzICkge1xuICAgICAgY29uc3QgcyA9IDIuMCAqIE1hdGguc3FydCggMS4wICsgbTIyIC0gbTExIC0gbTMzICk7XG4gICAgICByZXR1cm4gbmV3IFF1YXRlcm5pb24oIFtcbiAgICAgICAgKCBtMTIgKyBtMjEgKSAvIHMsXG4gICAgICAgIDAuMjUgKiBzLFxuICAgICAgICAoIG0yMyArIG0zMiApIC8gcyxcbiAgICAgICAgKCBtMTMgLSBtMzEgKSAvIHNcbiAgICAgIF0gKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgcyA9IDIuMCAqIE1hdGguc3FydCggMS4wICsgbTMzIC0gbTExIC0gbTIyICk7XG4gICAgICByZXR1cm4gbmV3IFF1YXRlcm5pb24oIFtcbiAgICAgICAgKCBtMTMgKyBtMzEgKSAvIHMsXG4gICAgICAgICggbTIzICsgbTMyICkgLyBzLFxuICAgICAgICAwLjI1ICogcyxcbiAgICAgICAgKCBtMjEgLSBtMTIgKSAvIHNcbiAgICAgIF0gKTtcbiAgICB9XG4gIH1cbn1cbiIsImltcG9ydCB7IFF1YXRlcm5pb24gfSBmcm9tICcuL1F1YXRlcm5pb24nO1xuaW1wb3J0IHsgVmVjdG9yMyB9IGZyb20gJy4vVmVjdG9yMyc7XG5cbmV4cG9ydCB0eXBlIHJhd01hdHJpeDQgPSBbXG4gIG51bWJlciwgbnVtYmVyLCBudW1iZXIsIG51bWJlcixcbiAgbnVtYmVyLCBudW1iZXIsIG51bWJlciwgbnVtYmVyLFxuICBudW1iZXIsIG51bWJlciwgbnVtYmVyLCBudW1iZXIsXG4gIG51bWJlciwgbnVtYmVyLCBudW1iZXIsIG51bWJlclxuXTtcblxuZXhwb3J0IGNvbnN0IHJhd0lkZW50aXR5TWF0cml4NDogcmF3TWF0cml4NCA9IFtcbiAgMS4wLCAwLjAsIDAuMCwgMC4wLFxuICAwLjAsIDEuMCwgMC4wLCAwLjAsXG4gIDAuMCwgMC4wLCAxLjAsIDAuMCxcbiAgMC4wLCAwLjAsIDAuMCwgMS4wXG5dO1xuXG4vKipcbiAqIEEgTWF0cml4NC5cbiAqL1xuZXhwb3J0IGNsYXNzIE1hdHJpeDQge1xuICBwdWJsaWMgZWxlbWVudHM6IHJhd01hdHJpeDQ7XG5cbiAgcHVibGljIGNvbnN0cnVjdG9yKCB2OiByYXdNYXRyaXg0ID0gcmF3SWRlbnRpdHlNYXRyaXg0ICkge1xuICAgIHRoaXMuZWxlbWVudHMgPSB2O1xuICB9XG5cbiAgLyoqXG4gICAqIEl0c2VsZiBidXQgdHJhbnNwb3NlZC5cbiAgICovXG4gIHB1YmxpYyBnZXQgdHJhbnNwb3NlKCk6IE1hdHJpeDQge1xuICAgIGNvbnN0IG0gPSB0aGlzLmVsZW1lbnRzO1xuXG4gICAgcmV0dXJuIG5ldyBNYXRyaXg0KCBbXG4gICAgICBtWyAwIF0sIG1bIDQgXSwgbVsgOCBdLCBtWyAxMiBdLFxuICAgICAgbVsgMSBdLCBtWyA1IF0sIG1bIDkgXSwgbVsgMTMgXSxcbiAgICAgIG1bIDIgXSwgbVsgNiBdLCBtWyAxMCBdLCBtWyAxNCBdLFxuICAgICAgbVsgMyBdLCBtWyA3IF0sIG1bIDExIF0sIG1bIDE1IF1cbiAgICBdICk7XG4gIH1cblxuICAvKipcbiAgICogSXRzIGRldGVybWluYW50LlxuICAgKi9cbiAgcHVibGljIGdldCBkZXRlcm1pbmFudCgpOiBudW1iZXIge1xuICAgIGNvbnN0IG0gPSB0aGlzLmVsZW1lbnRzO1xuICAgIGNvbnN0XG4gICAgICBhMDAgPSBtWyAgMCBdLCBhMDEgPSBtWyAgMSBdLCBhMDIgPSBtWyAgMiBdLCBhMDMgPSBtWyAgMyBdLFxuICAgICAgYTEwID0gbVsgIDQgXSwgYTExID0gbVsgIDUgXSwgYTEyID0gbVsgIDYgXSwgYTEzID0gbVsgIDcgXSxcbiAgICAgIGEyMCA9IG1bICA4IF0sIGEyMSA9IG1bICA5IF0sIGEyMiA9IG1bIDEwIF0sIGEyMyA9IG1bIDExIF0sXG4gICAgICBhMzAgPSBtWyAxMiBdLCBhMzEgPSBtWyAxMyBdLCBhMzIgPSBtWyAxNCBdLCBhMzMgPSBtWyAxNSBdLFxuICAgICAgYjAwID0gYTAwICogYTExIC0gYTAxICogYTEwLCAgYjAxID0gYTAwICogYTEyIC0gYTAyICogYTEwLFxuICAgICAgYjAyID0gYTAwICogYTEzIC0gYTAzICogYTEwLCAgYjAzID0gYTAxICogYTEyIC0gYTAyICogYTExLFxuICAgICAgYjA0ID0gYTAxICogYTEzIC0gYTAzICogYTExLCAgYjA1ID0gYTAyICogYTEzIC0gYTAzICogYTEyLFxuICAgICAgYjA2ID0gYTIwICogYTMxIC0gYTIxICogYTMwLCAgYjA3ID0gYTIwICogYTMyIC0gYTIyICogYTMwLFxuICAgICAgYjA4ID0gYTIwICogYTMzIC0gYTIzICogYTMwLCAgYjA5ID0gYTIxICogYTMyIC0gYTIyICogYTMxLFxuICAgICAgYjEwID0gYTIxICogYTMzIC0gYTIzICogYTMxLCAgYjExID0gYTIyICogYTMzIC0gYTIzICogYTMyO1xuXG4gICAgcmV0dXJuIGIwMCAqIGIxMSAtIGIwMSAqIGIxMCArIGIwMiAqIGIwOSArIGIwMyAqIGIwOCAtIGIwNCAqIGIwNyArIGIwNSAqIGIwNjtcbiAgfVxuXG4gIC8qKlxuICAgKiBJdHNlbGYgYnV0IGludmVydGVkLlxuICAgKi9cbiAgcHVibGljIGdldCBpbnZlcnNlKCk6IE1hdHJpeDQgfCBudWxsIHtcbiAgICBjb25zdCBtID0gdGhpcy5lbGVtZW50cztcbiAgICBjb25zdFxuICAgICAgYTAwID0gbVsgIDAgXSwgYTAxID0gbVsgIDEgXSwgYTAyID0gbVsgIDIgXSwgYTAzID0gbVsgIDMgXSxcbiAgICAgIGExMCA9IG1bICA0IF0sIGExMSA9IG1bICA1IF0sIGExMiA9IG1bICA2IF0sIGExMyA9IG1bICA3IF0sXG4gICAgICBhMjAgPSBtWyAgOCBdLCBhMjEgPSBtWyAgOSBdLCBhMjIgPSBtWyAxMCBdLCBhMjMgPSBtWyAxMSBdLFxuICAgICAgYTMwID0gbVsgMTIgXSwgYTMxID0gbVsgMTMgXSwgYTMyID0gbVsgMTQgXSwgYTMzID0gbVsgMTUgXSxcbiAgICAgIGIwMCA9IGEwMCAqIGExMSAtIGEwMSAqIGExMCwgIGIwMSA9IGEwMCAqIGExMiAtIGEwMiAqIGExMCxcbiAgICAgIGIwMiA9IGEwMCAqIGExMyAtIGEwMyAqIGExMCwgIGIwMyA9IGEwMSAqIGExMiAtIGEwMiAqIGExMSxcbiAgICAgIGIwNCA9IGEwMSAqIGExMyAtIGEwMyAqIGExMSwgIGIwNSA9IGEwMiAqIGExMyAtIGEwMyAqIGExMixcbiAgICAgIGIwNiA9IGEyMCAqIGEzMSAtIGEyMSAqIGEzMCwgIGIwNyA9IGEyMCAqIGEzMiAtIGEyMiAqIGEzMCxcbiAgICAgIGIwOCA9IGEyMCAqIGEzMyAtIGEyMyAqIGEzMCwgIGIwOSA9IGEyMSAqIGEzMiAtIGEyMiAqIGEzMSxcbiAgICAgIGIxMCA9IGEyMSAqIGEzMyAtIGEyMyAqIGEzMSwgIGIxMSA9IGEyMiAqIGEzMyAtIGEyMyAqIGEzMjtcblxuICAgIGNvbnN0IGRldCA9IGIwMCAqIGIxMSAtIGIwMSAqIGIxMCArIGIwMiAqIGIwOSArIGIwMyAqIGIwOCAtIGIwNCAqIGIwNyArIGIwNSAqIGIwNjtcblxuICAgIGlmICggZGV0ID09PSAwLjAgKSB7IHJldHVybiBudWxsOyB9XG5cbiAgICBjb25zdCBpbnZEZXQgPSAxLjAgLyBkZXQ7XG5cbiAgICByZXR1cm4gbmV3IE1hdHJpeDQoIFtcbiAgICAgIGExMSAqIGIxMSAtIGExMiAqIGIxMCArIGExMyAqIGIwOSxcbiAgICAgIGEwMiAqIGIxMCAtIGEwMSAqIGIxMSAtIGEwMyAqIGIwOSxcbiAgICAgIGEzMSAqIGIwNSAtIGEzMiAqIGIwNCArIGEzMyAqIGIwMyxcbiAgICAgIGEyMiAqIGIwNCAtIGEyMSAqIGIwNSAtIGEyMyAqIGIwMyxcbiAgICAgIGExMiAqIGIwOCAtIGExMCAqIGIxMSAtIGExMyAqIGIwNyxcbiAgICAgIGEwMCAqIGIxMSAtIGEwMiAqIGIwOCArIGEwMyAqIGIwNyxcbiAgICAgIGEzMiAqIGIwMiAtIGEzMCAqIGIwNSAtIGEzMyAqIGIwMSxcbiAgICAgIGEyMCAqIGIwNSAtIGEyMiAqIGIwMiArIGEyMyAqIGIwMSxcbiAgICAgIGExMCAqIGIxMCAtIGExMSAqIGIwOCArIGExMyAqIGIwNixcbiAgICAgIGEwMSAqIGIwOCAtIGEwMCAqIGIxMCAtIGEwMyAqIGIwNixcbiAgICAgIGEzMCAqIGIwNCAtIGEzMSAqIGIwMiArIGEzMyAqIGIwMCxcbiAgICAgIGEyMSAqIGIwMiAtIGEyMCAqIGIwNCAtIGEyMyAqIGIwMCxcbiAgICAgIGExMSAqIGIwNyAtIGExMCAqIGIwOSAtIGExMiAqIGIwNixcbiAgICAgIGEwMCAqIGIwOSAtIGEwMSAqIGIwNyArIGEwMiAqIGIwNixcbiAgICAgIGEzMSAqIGIwMSAtIGEzMCAqIGIwMyAtIGEzMiAqIGIwMCxcbiAgICAgIGEyMCAqIGIwMyAtIGEyMSAqIGIwMSArIGEyMiAqIGIwMFxuICAgIF0ubWFwKCAoIHYgKSA9PiB2ICogaW52RGV0ICkgYXMgcmF3TWF0cml4NCApO1xuICB9XG5cbiAgcHVibGljIHRvU3RyaW5nKCk6IHN0cmluZyB7XG4gICAgY29uc3QgbSA9IHRoaXMuZWxlbWVudHMubWFwKCAoIHYgKSA9PiB2LnRvRml4ZWQoIDMgKSApO1xuICAgIHJldHVybiBgTWF0cml4NCggJHsgbVsgMCBdIH0sICR7IG1bIDQgXSB9LCAkeyBtWyA4IF0gfSwgJHsgbVsgMTIgXSB9OyAkeyBtWyAxIF0gfSwgJHsgbVsgNSBdIH0sICR7IG1bIDkgXSB9LCAkeyBtWyAxMyBdIH07ICR7IG1bIDIgXSB9LCAkeyBtWyA2IF0gfSwgJHsgbVsgMTAgXSB9LCAkeyBtWyAxNCBdIH07ICR7IG1bIDMgXSB9LCAkeyBtWyA3IF0gfSwgJHsgbVsgMTEgXSB9LCAkeyBtWyAxNSBdIH0gKWA7XG4gIH1cblxuICAvKipcbiAgICogQ2xvbmUgdGhpcy5cbiAgICovXG4gIHB1YmxpYyBjbG9uZSgpOiBNYXRyaXg0IHtcbiAgICByZXR1cm4gbmV3IE1hdHJpeDQoIHRoaXMuZWxlbWVudHMuY29uY2F0KCkgYXMgcmF3TWF0cml4NCApO1xuICB9XG5cbiAgLyoqXG4gICAqIE11bHRpcGx5IHRoaXMgTWF0cml4NCBieSBvbmUgb3IgbW9yZSBNYXRyaXg0cy5cbiAgICovXG4gIHB1YmxpYyBtdWx0aXBseSggLi4ubWF0cmljZXM6IE1hdHJpeDRbXSApOiBNYXRyaXg0IHtcbiAgICBpZiAoIG1hdHJpY2VzLmxlbmd0aCA9PT0gMCApIHtcbiAgICAgIHJldHVybiB0aGlzLmNsb25lKCk7XG4gICAgfVxuXG4gICAgY29uc3QgYXJyID0gbWF0cmljZXMuY29uY2F0KCk7XG4gICAgbGV0IGJNYXQgPSBhcnIuc2hpZnQoKSE7XG4gICAgaWYgKCAwIDwgYXJyLmxlbmd0aCApIHtcbiAgICAgIGJNYXQgPSBiTWF0Lm11bHRpcGx5KCAuLi5hcnIgKTtcbiAgICB9XG5cbiAgICBjb25zdCBhID0gdGhpcy5lbGVtZW50cztcbiAgICBjb25zdCBiID0gYk1hdC5lbGVtZW50cztcblxuICAgIHJldHVybiBuZXcgTWF0cml4NCggW1xuICAgICAgYVsgMCBdICogYlsgMCBdICsgYVsgNCBdICogYlsgMSBdICsgYVsgOCBdICogYlsgMiBdICsgYVsgMTIgXSAqIGJbIDMgXSxcbiAgICAgIGFbIDEgXSAqIGJbIDAgXSArIGFbIDUgXSAqIGJbIDEgXSArIGFbIDkgXSAqIGJbIDIgXSArIGFbIDEzIF0gKiBiWyAzIF0sXG4gICAgICBhWyAyIF0gKiBiWyAwIF0gKyBhWyA2IF0gKiBiWyAxIF0gKyBhWyAxMCBdICogYlsgMiBdICsgYVsgMTQgXSAqIGJbIDMgXSxcbiAgICAgIGFbIDMgXSAqIGJbIDAgXSArIGFbIDcgXSAqIGJbIDEgXSArIGFbIDExIF0gKiBiWyAyIF0gKyBhWyAxNSBdICogYlsgMyBdLFxuXG4gICAgICBhWyAwIF0gKiBiWyA0IF0gKyBhWyA0IF0gKiBiWyA1IF0gKyBhWyA4IF0gKiBiWyA2IF0gKyBhWyAxMiBdICogYlsgNyBdLFxuICAgICAgYVsgMSBdICogYlsgNCBdICsgYVsgNSBdICogYlsgNSBdICsgYVsgOSBdICogYlsgNiBdICsgYVsgMTMgXSAqIGJbIDcgXSxcbiAgICAgIGFbIDIgXSAqIGJbIDQgXSArIGFbIDYgXSAqIGJbIDUgXSArIGFbIDEwIF0gKiBiWyA2IF0gKyBhWyAxNCBdICogYlsgNyBdLFxuICAgICAgYVsgMyBdICogYlsgNCBdICsgYVsgNyBdICogYlsgNSBdICsgYVsgMTEgXSAqIGJbIDYgXSArIGFbIDE1IF0gKiBiWyA3IF0sXG5cbiAgICAgIGFbIDAgXSAqIGJbIDggXSArIGFbIDQgXSAqIGJbIDkgXSArIGFbIDggXSAqIGJbIDEwIF0gKyBhWyAxMiBdICogYlsgMTEgXSxcbiAgICAgIGFbIDEgXSAqIGJbIDggXSArIGFbIDUgXSAqIGJbIDkgXSArIGFbIDkgXSAqIGJbIDEwIF0gKyBhWyAxMyBdICogYlsgMTEgXSxcbiAgICAgIGFbIDIgXSAqIGJbIDggXSArIGFbIDYgXSAqIGJbIDkgXSArIGFbIDEwIF0gKiBiWyAxMCBdICsgYVsgMTQgXSAqIGJbIDExIF0sXG4gICAgICBhWyAzIF0gKiBiWyA4IF0gKyBhWyA3IF0gKiBiWyA5IF0gKyBhWyAxMSBdICogYlsgMTAgXSArIGFbIDE1IF0gKiBiWyAxMSBdLFxuXG4gICAgICBhWyAwIF0gKiBiWyAxMiBdICsgYVsgNCBdICogYlsgMTMgXSArIGFbIDggXSAqIGJbIDE0IF0gKyBhWyAxMiBdICogYlsgMTUgXSxcbiAgICAgIGFbIDEgXSAqIGJbIDEyIF0gKyBhWyA1IF0gKiBiWyAxMyBdICsgYVsgOSBdICogYlsgMTQgXSArIGFbIDEzIF0gKiBiWyAxNSBdLFxuICAgICAgYVsgMiBdICogYlsgMTIgXSArIGFbIDYgXSAqIGJbIDEzIF0gKyBhWyAxMCBdICogYlsgMTQgXSArIGFbIDE0IF0gKiBiWyAxNSBdLFxuICAgICAgYVsgMyBdICogYlsgMTIgXSArIGFbIDcgXSAqIGJbIDEzIF0gKyBhWyAxMSBdICogYlsgMTQgXSArIGFbIDE1IF0gKiBiWyAxNSBdXG4gICAgXSApO1xuICB9XG5cbiAgLyoqXG4gICAqIE11bHRpcGx5IHRoaXMgTWF0cml4NCBieSBhIHNjYWxhclxuICAgKi9cbiAgcHVibGljIHNjYWxlU2NhbGFyKCBzY2FsYXI6IG51bWJlciApOiBNYXRyaXg0IHtcbiAgICByZXR1cm4gbmV3IE1hdHJpeDQoIHRoaXMuZWxlbWVudHMubWFwKCAoIHYgKSA9PiB2ICogc2NhbGFyICkgYXMgcmF3TWF0cml4NCApO1xuICB9XG5cbiAgLyoqXG4gICAqIEFuIGlkZW50aXR5IE1hdHJpeDQuXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIGdldCBpZGVudGl0eSgpOiBNYXRyaXg0IHtcbiAgICByZXR1cm4gbmV3IE1hdHJpeDQoIHJhd0lkZW50aXR5TWF0cml4NCApO1xuICB9XG5cbiAgcHVibGljIHN0YXRpYyBtdWx0aXBseSggLi4ubWF0cmljZXM6IE1hdHJpeDRbXSApOiBNYXRyaXg0IHtcbiAgICBpZiAoIG1hdHJpY2VzLmxlbmd0aCA9PT0gMCApIHtcbiAgICAgIHJldHVybiBNYXRyaXg0LmlkZW50aXR5O1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBiTWF0cyA9IG1hdHJpY2VzLmNvbmNhdCgpO1xuICAgICAgY29uc3QgYU1hdCA9IGJNYXRzLnNoaWZ0KCkhO1xuICAgICAgcmV0dXJuIGFNYXQubXVsdGlwbHkoIC4uLmJNYXRzICk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEdlbmVyYXRlIGEgdHJhbnNsYXRpb24gbWF0cml4LlxuICAgKiBAcGFyYW0gdmVjdG9yIFRyYW5zbGF0aW9uXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIHRyYW5zbGF0ZSggdmVjdG9yOiBWZWN0b3IzICk6IE1hdHJpeDQge1xuICAgIHJldHVybiBuZXcgTWF0cml4NCggW1xuICAgICAgMSwgMCwgMCwgMCxcbiAgICAgIDAsIDEsIDAsIDAsXG4gICAgICAwLCAwLCAxLCAwLFxuICAgICAgdmVjdG9yLngsIHZlY3Rvci55LCB2ZWN0b3IueiwgMVxuICAgIF0gKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZW5lcmF0ZSBhIDNkIHNjYWxpbmcgbWF0cml4LlxuICAgKiBAcGFyYW0gdmVjdG9yIFNjYWxlXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIHNjYWxlKCB2ZWN0b3I6IFZlY3RvcjMgKTogTWF0cml4NCB7XG4gICAgcmV0dXJuIG5ldyBNYXRyaXg0KCBbXG4gICAgICB2ZWN0b3IueCwgMCwgMCwgMCxcbiAgICAgIDAsIHZlY3Rvci55LCAwLCAwLFxuICAgICAgMCwgMCwgdmVjdG9yLnosIDAsXG4gICAgICAwLCAwLCAwLCAxXG4gICAgXSApO1xuICB9XG5cbiAgLyoqXG4gICAqIEdlbmVyYXRlIGEgM2Qgc2NhbGluZyBtYXRyaXggYnkgYSBzY2FsYXIuXG4gICAqIEBwYXJhbSB2ZWN0b3IgU2NhbGVcbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgc2NhbGVTY2FsYXIoIHNjYWxhcjogbnVtYmVyICk6IE1hdHJpeDQge1xuICAgIHJldHVybiBuZXcgTWF0cml4NCggW1xuICAgICAgc2NhbGFyLCAwLCAwLCAwLFxuICAgICAgMCwgc2NhbGFyLCAwLCAwLFxuICAgICAgMCwgMCwgc2NhbGFyLCAwLFxuICAgICAgMCwgMCwgMCwgMVxuICAgIF0gKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZW5lcmF0ZSBhIDNkIHJvdGF0aW9uIG1hdHJpeCwgcm90YXRlcyBhcm91bmQgeCBheGlzLlxuICAgKiBAcGFyYW0gdmVjdG9yIFNjYWxlXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIHJvdGF0ZVgoIHRoZXRhOiBudW1iZXIgKTogTWF0cml4NCB7XG4gICAgcmV0dXJuIG5ldyBNYXRyaXg0KCBbXG4gICAgICAxLCAwLCAwLCAwLFxuICAgICAgMCwgTWF0aC5jb3MoIHRoZXRhICksIC1NYXRoLnNpbiggdGhldGEgKSwgMCxcbiAgICAgIDAsIE1hdGguc2luKCB0aGV0YSApLCBNYXRoLmNvcyggdGhldGEgKSwgMCxcbiAgICAgIDAsIDAsIDAsIDFcbiAgICBdICk7XG4gIH1cblxuICAvKipcbiAgICogR2VuZXJhdGUgYSAzZCByb3RhdGlvbiBtYXRyaXgsIHJvdGF0ZXMgYXJvdW5kIHkgYXhpcy5cbiAgICogQHBhcmFtIHZlY3RvciBTY2FsZVxuICAgKi9cbiAgcHVibGljIHN0YXRpYyByb3RhdGVZKCB0aGV0YTogbnVtYmVyICk6IE1hdHJpeDQge1xuICAgIHJldHVybiBuZXcgTWF0cml4NCggW1xuICAgICAgTWF0aC5jb3MoIHRoZXRhICksIDAsIE1hdGguc2luKCB0aGV0YSApLCAwLFxuICAgICAgMCwgMSwgMCwgMCxcbiAgICAgIC1NYXRoLnNpbiggdGhldGEgKSwgMCwgTWF0aC5jb3MoIHRoZXRhICksIDAsXG4gICAgICAwLCAwLCAwLCAxXG4gICAgXSApO1xuICB9XG5cbiAgLyoqXG4gICAqIEdlbmVyYXRlIGEgM2Qgcm90YXRpb24gbWF0cml4LCByb3RhdGVzIGFyb3VuZCB6IGF4aXMuXG4gICAqIEBwYXJhbSB2ZWN0b3IgU2NhbGVcbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgcm90YXRlWiggdGhldGE6IG51bWJlciApOiBNYXRyaXg0IHtcbiAgICByZXR1cm4gbmV3IE1hdHJpeDQoIFtcbiAgICAgIE1hdGguY29zKCB0aGV0YSApLCAtTWF0aC5zaW4oIHRoZXRhICksIDAsIDAsXG4gICAgICBNYXRoLnNpbiggdGhldGEgKSwgTWF0aC5jb3MoIHRoZXRhICksIDAsIDAsXG4gICAgICAwLCAwLCAxLCAwLFxuICAgICAgMCwgMCwgMCwgMVxuICAgIF0gKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZW5lcmF0ZSBhIFwiTG9va0F0XCIgbWF0cml4LlxuICAgKlxuICAgKiBTZWUgYWxzbzoge0BsaW5rIGxvb2tBdEludmVyc2V9XG4gICAqL1xuICBwdWJsaWMgc3RhdGljIGxvb2tBdChcbiAgICBwb3NpdGlvbjogVmVjdG9yMyxcbiAgICB0YXJnZXQgPSBuZXcgVmVjdG9yMyggWyAwLjAsIDAuMCwgMC4wIF0gKSxcbiAgICB1cCA9IG5ldyBWZWN0b3IzKCBbIDAuMCwgMS4wLCAwLjAgXSApLFxuICAgIHJvbGwgPSAwLjBcbiAgKTogTWF0cml4NCB7XG4gICAgY29uc3QgZGlyID0gcG9zaXRpb24uc3ViKCB0YXJnZXQgKS5ub3JtYWxpemVkO1xuICAgIGxldCBzaWQgPSB1cC5jcm9zcyggZGlyICkubm9ybWFsaXplZDtcbiAgICBsZXQgdG9wID0gZGlyLmNyb3NzKCBzaWQgKTtcbiAgICBzaWQgPSBzaWQuc2NhbGUoIE1hdGguY29zKCByb2xsICkgKS5hZGQoIHRvcC5zY2FsZSggTWF0aC5zaW4oIHJvbGwgKSApICk7XG4gICAgdG9wID0gZGlyLmNyb3NzKCBzaWQgKTtcblxuICAgIHJldHVybiBuZXcgTWF0cml4NCggW1xuICAgICAgc2lkLngsIHNpZC55LCBzaWQueiwgMC4wLFxuICAgICAgdG9wLngsIHRvcC55LCB0b3AueiwgMC4wLFxuICAgICAgZGlyLngsIGRpci55LCBkaXIueiwgMC4wLFxuICAgICAgcG9zaXRpb24ueCwgcG9zaXRpb24ueSwgcG9zaXRpb24ueiwgMS4wXG4gICAgXSApO1xuICB9XG5cbiAgLyoqXG4gICAqIEdlbmVyYXRlIGFuIGludmVyc2Ugb2YgXCJMb29rQXRcIiBtYXRyaXguIEdvb2QgZm9yIGNyZWF0aW5nIGEgdmlldyBtYXRyaXguXG4gICAqXG4gICAqIFNlZSBhbHNvOiB7QGxpbmsgbG9va0F0fVxuICAgKi9cbiAgcHVibGljIHN0YXRpYyBsb29rQXRJbnZlcnNlKFxuICAgIHBvc2l0aW9uOiBWZWN0b3IzLFxuICAgIHRhcmdldCA9IG5ldyBWZWN0b3IzKCBbIDAuMCwgMC4wLCAwLjAgXSApLFxuICAgIHVwID0gbmV3IFZlY3RvcjMoIFsgMC4wLCAxLjAsIDAuMCBdICksXG4gICAgcm9sbCA9IDAuMFxuICApOiBNYXRyaXg0IHtcbiAgICBjb25zdCBkaXIgPSBwb3NpdGlvbi5zdWIoIHRhcmdldCApLm5vcm1hbGl6ZWQ7XG4gICAgbGV0IHNpZCA9IHVwLmNyb3NzKCBkaXIgKS5ub3JtYWxpemVkO1xuICAgIGxldCB0b3AgPSBkaXIuY3Jvc3MoIHNpZCApO1xuICAgIHNpZCA9IHNpZC5zY2FsZSggTWF0aC5jb3MoIHJvbGwgKSApLmFkZCggdG9wLnNjYWxlKCBNYXRoLnNpbiggcm9sbCApICkgKTtcbiAgICB0b3AgPSBkaXIuY3Jvc3MoIHNpZCApO1xuXG4gICAgcmV0dXJuIG5ldyBNYXRyaXg0KCBbXG4gICAgICBzaWQueCwgdG9wLngsIGRpci54LCAwLjAsXG4gICAgICBzaWQueSwgdG9wLnksIGRpci55LCAwLjAsXG4gICAgICBzaWQueiwgdG9wLnosIGRpci56LCAwLjAsXG4gICAgICAtc2lkLnggKiBwb3NpdGlvbi54IC0gc2lkLnkgKiBwb3NpdGlvbi55IC0gc2lkLnogKiBwb3NpdGlvbi56LFxuICAgICAgLXRvcC54ICogcG9zaXRpb24ueCAtIHRvcC55ICogcG9zaXRpb24ueSAtIHRvcC56ICogcG9zaXRpb24ueixcbiAgICAgIC1kaXIueCAqIHBvc2l0aW9uLnggLSBkaXIueSAqIHBvc2l0aW9uLnkgLSBkaXIueiAqIHBvc2l0aW9uLnosXG4gICAgICAxLjBcbiAgICBdICk7XG4gIH1cblxuICAvKipcbiAgICogR2VuZXJhdGUgYSBcIlBlcnNwZWN0aXZlXCIgcHJvamVjdGlvbiBtYXRyaXguXG4gICAqIEl0IHdvbid0IGluY2x1ZGUgYXNwZWN0IVxuICAgKi9cbiAgcHVibGljIHN0YXRpYyBwZXJzcGVjdGl2ZSggZm92ID0gNDUuMCwgbmVhciA9IDAuMDEsIGZhciA9IDEwMC4wICk6IE1hdHJpeDQge1xuICAgIGNvbnN0IHAgPSAxLjAgLyBNYXRoLnRhbiggZm92ICogTWF0aC5QSSAvIDM2MC4wICk7XG4gICAgY29uc3QgZCA9ICggZmFyIC0gbmVhciApO1xuICAgIHJldHVybiBuZXcgTWF0cml4NCggW1xuICAgICAgcCwgMC4wLCAwLjAsIDAuMCxcbiAgICAgIDAuMCwgcCwgMC4wLCAwLjAsXG4gICAgICAwLjAsIDAuMCwgLSggZmFyICsgbmVhciApIC8gZCwgLTEuMCxcbiAgICAgIDAuMCwgMC4wLCAtMiAqIGZhciAqIG5lYXIgLyBkLCAwLjBcbiAgICBdICk7XG4gIH1cblxuICAvKipcbiAgICogRGVjb21wb3NlIHRoaXMgbWF0cml4IGludG8gYSBwb3NpdGlvbiwgYSBzY2FsZSwgYW5kIGEgcm90YXRpb24uXG4gICAqIFlvaW5rZWQgZnJvbSBUaHJlZS5qcy5cbiAgICovXG4gIHB1YmxpYyBkZWNvbXBvc2UoKTogeyBwb3NpdGlvbjogVmVjdG9yMzsgc2NhbGU6IFZlY3RvcjM7IHJvdGF0aW9uOiBRdWF0ZXJuaW9uIH0ge1xuICAgIGNvbnN0IG0gPSB0aGlzLmVsZW1lbnRzO1xuXG4gICAgbGV0IHN4ID0gbmV3IFZlY3RvcjMoIFsgbVsgMCBdLCBtWyAxIF0sIG1bIDIgXSBdICkubGVuZ3RoO1xuICAgIGNvbnN0IHN5ID0gbmV3IFZlY3RvcjMoIFsgbVsgNCBdLCBtWyA1IF0sIG1bIDYgXSBdICkubGVuZ3RoO1xuICAgIGNvbnN0IHN6ID0gbmV3IFZlY3RvcjMoIFsgbVsgOCBdLCBtWyA5IF0sIG1bIDEwIF0gXSApLmxlbmd0aDtcblxuICAgIC8vIGlmIGRldGVybWluZSBpcyBuZWdhdGl2ZSwgd2UgbmVlZCB0byBpbnZlcnQgb25lIHNjYWxlXG4gICAgY29uc3QgZGV0ID0gdGhpcy5kZXRlcm1pbmFudDtcbiAgICBpZiAoIGRldCA8IDAgKSB7IHN4ID0gLXN4OyB9XG5cbiAgICBjb25zdCBpbnZTeCA9IDEuMCAvIHN4O1xuICAgIGNvbnN0IGludlN5ID0gMS4wIC8gc3k7XG4gICAgY29uc3QgaW52U3ogPSAxLjAgLyBzejtcblxuICAgIGNvbnN0IHJvdGF0aW9uTWF0cml4ID0gdGhpcy5jbG9uZSgpO1xuXG4gICAgcm90YXRpb25NYXRyaXguZWxlbWVudHNbIDAgXSAqPSBpbnZTeDtcbiAgICByb3RhdGlvbk1hdHJpeC5lbGVtZW50c1sgMSBdICo9IGludlN4O1xuICAgIHJvdGF0aW9uTWF0cml4LmVsZW1lbnRzWyAyIF0gKj0gaW52U3g7XG5cbiAgICByb3RhdGlvbk1hdHJpeC5lbGVtZW50c1sgNCBdICo9IGludlN5O1xuICAgIHJvdGF0aW9uTWF0cml4LmVsZW1lbnRzWyA1IF0gKj0gaW52U3k7XG4gICAgcm90YXRpb25NYXRyaXguZWxlbWVudHNbIDYgXSAqPSBpbnZTeTtcblxuICAgIHJvdGF0aW9uTWF0cml4LmVsZW1lbnRzWyA4IF0gKj0gaW52U3o7XG4gICAgcm90YXRpb25NYXRyaXguZWxlbWVudHNbIDkgXSAqPSBpbnZTejtcbiAgICByb3RhdGlvbk1hdHJpeC5lbGVtZW50c1sgMTAgXSAqPSBpbnZTejtcblxuICAgIHJldHVybiB7XG4gICAgICBwb3NpdGlvbjogbmV3IFZlY3RvcjMoIFsgbVsgMTIgXSwgbVsgMTMgXSwgbVsgMTQgXSBdICksXG4gICAgICBzY2FsZTogbmV3IFZlY3RvcjMoIFsgc3gsIHN5LCBzeiBdICksXG4gICAgICByb3RhdGlvbjogUXVhdGVybmlvbi5mcm9tTWF0cml4KCByb3RhdGlvbk1hdHJpeCApXG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDb21wb3NlIGEgbWF0cml4IG91dCBvZiBwb3NpdGlvbiwgc2NhbGUsIGFuZCByb3RhdGlvbi5cbiAgICogWW9pbmtlZCBmcm9tIFRocmVlLmpzLlxuICAgKi9cbiAgcHVibGljIHN0YXRpYyBjb21wb3NlKCBwb3NpdGlvbjogVmVjdG9yMywgcm90YXRpb246IFF1YXRlcm5pb24sIHNjYWxlOiBWZWN0b3IzICk6IE1hdHJpeDQge1xuICAgIGNvbnN0IHggPSByb3RhdGlvbi54LCB5ID0gcm90YXRpb24ueSwgeiA9IHJvdGF0aW9uLnosIHcgPSByb3RhdGlvbi53O1xuICAgIGNvbnN0IHgyID0geCArIHgsXHR5MiA9IHkgKyB5LCB6MiA9IHogKyB6O1xuICAgIGNvbnN0IHh4ID0geCAqIHgyLCB4eSA9IHggKiB5MiwgeHogPSB4ICogejI7XG4gICAgY29uc3QgeXkgPSB5ICogeTIsIHl6ID0geSAqIHoyLCB6eiA9IHogKiB6MjtcbiAgICBjb25zdCB3eCA9IHcgKiB4Miwgd3kgPSB3ICogeTIsIHd6ID0gdyAqIHoyO1xuICAgIGNvbnN0IHN4ID0gc2NhbGUueCwgc3kgPSBzY2FsZS55LCBzeiA9IHNjYWxlLno7XG5cbiAgICByZXR1cm4gbmV3IE1hdHJpeDQoIFtcbiAgICAgICggMS4wIC0gKCB5eSArIHp6ICkgKSAqIHN4LFxuICAgICAgKCB4eSArIHd6ICkgKiBzeCxcbiAgICAgICggeHogLSB3eSApICogc3gsXG4gICAgICAwLjAsXG5cbiAgICAgICggeHkgLSB3eiApICogc3ksXG4gICAgICAoIDEuMCAtICggeHggKyB6eiApICkgKiBzeSxcbiAgICAgICggeXogKyB3eCApICogc3ksXG4gICAgICAwLjAsXG5cbiAgICAgICggeHogKyB3eSApICogc3osXG4gICAgICAoIHl6IC0gd3ggKSAqIHN6LFxuICAgICAgKCAxLjAgLSAoIHh4ICsgeXkgKSApICogc3osXG4gICAgICAwLjAsXG5cbiAgICAgIHBvc2l0aW9uLngsXG4gICAgICBwb3NpdGlvbi55LFxuICAgICAgcG9zaXRpb24ueixcbiAgICAgIDEuMFxuICAgIF0gKTtcbiAgfVxufVxuIiwiaW1wb3J0IHsgTWF0cml4NCB9IGZyb20gJy4vTWF0cml4NCc7XG5pbXBvcnQgeyBWZWN0b3IgfSBmcm9tICcuL1ZlY3Rvcic7XG5cbmV4cG9ydCB0eXBlIHJhd1ZlY3RvcjQgPSBbIG51bWJlciwgbnVtYmVyLCBudW1iZXIsIG51bWJlciBdO1xuXG4vKipcbiAqIEEgVmVjdG9yMy5cbiAqL1xuZXhwb3J0IGNsYXNzIFZlY3RvcjQgZXh0ZW5kcyBWZWN0b3I8VmVjdG9yND4ge1xuICBwdWJsaWMgZWxlbWVudHM6IHJhd1ZlY3RvcjQ7XG5cbiAgcHVibGljIGNvbnN0cnVjdG9yKCB2OiByYXdWZWN0b3I0ID0gWyAwLjAsIDAuMCwgMC4wLCAwLjAgXSApIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMuZWxlbWVudHMgPSB2O1xuICB9XG5cbiAgLyoqXG4gICAqIEFuIHggY29tcG9uZW50IG9mIHRoaXMuXG4gICAqL1xuICBwdWJsaWMgZ2V0IHgoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5lbGVtZW50c1sgMCBdO1xuICB9XG5cbiAgcHVibGljIHNldCB4KCB4OiBudW1iZXIgKSB7XG4gICAgdGhpcy5lbGVtZW50c1sgMCBdID0geDtcbiAgfVxuXG4gIC8qKlxuICAgKiBBIHkgY29tcG9uZW50IG9mIHRoaXMuXG4gICAqL1xuICBwdWJsaWMgZ2V0IHkoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5lbGVtZW50c1sgMSBdO1xuICB9XG5cbiAgcHVibGljIHNldCB5KCB5OiBudW1iZXIgKSB7XG4gICAgdGhpcy5lbGVtZW50c1sgMSBdID0geTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBIHogY29tcG9uZW50IG9mIHRoaXMuXG4gICAqL1xuICBwdWJsaWMgZ2V0IHooKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5lbGVtZW50c1sgMiBdO1xuICB9XG5cbiAgcHVibGljIHNldCB6KCB6OiBudW1iZXIgKSB7XG4gICAgdGhpcy5lbGVtZW50c1sgMiBdID0gejtcbiAgfVxuXG4gIC8qKlxuICAgKiBBIHcgY29tcG9uZW50IG9mIHRoaXMuXG4gICAqL1xuICBwdWJsaWMgZ2V0IHcoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5lbGVtZW50c1sgMyBdO1xuICB9XG5cbiAgcHVibGljIHNldCB3KCB6OiBudW1iZXIgKSB7XG4gICAgdGhpcy5lbGVtZW50c1sgMyBdID0gejtcbiAgfVxuXG4gIHB1YmxpYyB0b1N0cmluZygpOiBzdHJpbmcge1xuICAgIHJldHVybiBgVmVjdG9yNCggJHsgdGhpcy54LnRvRml4ZWQoIDMgKSB9LCAkeyB0aGlzLnkudG9GaXhlZCggMyApIH0sICR7IHRoaXMuei50b0ZpeGVkKCAzICkgfSwgJHsgdGhpcy53LnRvRml4ZWQoIDMgKSB9IClgO1xuICB9XG5cbiAgLyoqXG4gICAqIE11bHRpcGx5IHRoaXMgdmVjdG9yICh3aXRoIGFuIGltcGxpY2l0IDEgaW4gdGhlIDR0aCBkaW1lbnNpb24pIGJ5IG0uXG4gICAqL1xuICBwdWJsaWMgYXBwbHlNYXRyaXg0KCBtYXRyaXg6IE1hdHJpeDQgKTogVmVjdG9yNCB7XG4gICAgY29uc3QgbSA9IG1hdHJpeC5lbGVtZW50cztcblxuICAgIHJldHVybiBuZXcgVmVjdG9yNCggW1xuICAgICAgbVsgMCBdICogdGhpcy54ICsgbVsgNCBdICogdGhpcy55ICsgbVsgOCBdICogdGhpcy56ICsgbVsgMTIgXSAqIHRoaXMudyxcbiAgICAgIG1bIDEgXSAqIHRoaXMueCArIG1bIDUgXSAqIHRoaXMueSArIG1bIDkgXSAqIHRoaXMueiArIG1bIDEzIF0gKiB0aGlzLncsXG4gICAgICBtWyAyIF0gKiB0aGlzLnggKyBtWyA2IF0gKiB0aGlzLnkgKyBtWyAxMCBdICogdGhpcy56ICsgbVsgMTQgXSAqIHRoaXMudyxcbiAgICAgIG1bIDMgXSAqIHRoaXMueCArIG1bIDcgXSAqIHRoaXMueSArIG1bIDExIF0gKiB0aGlzLnogKyBtWyAxNSBdICogdGhpcy53XG4gICAgXSApO1xuICB9XG5cbiAgcHJvdGVjdGVkIF9fbmV3KCB2OiByYXdWZWN0b3I0ICk6IFZlY3RvcjQge1xuICAgIHJldHVybiBuZXcgVmVjdG9yNCggdiApO1xuICB9XG5cbiAgLyoqXG4gICAqIFZlY3RvcjQoIDAuMCwgMC4wLCAwLjAsIDAuMCApXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIGdldCB6ZXJvKCk6IFZlY3RvcjQge1xuICAgIHJldHVybiBuZXcgVmVjdG9yNCggWyAwLjAsIDAuMCwgMC4wLCAwLjAgXSApO1xuICB9XG5cbiAgLyoqXG4gICAqIFZlY3RvcjQoIDEuMCwgMS4wLCAxLjAsIDEuMCApXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIGdldCBvbmUoKTogVmVjdG9yNCB7XG4gICAgcmV0dXJuIG5ldyBWZWN0b3I0KCBbIDEuMCwgMS4wLCAxLjAsIDEuMCBdICk7XG4gIH1cbn1cbiIsIi8qKlxuICogVXNlZnVsIGZvciBzd2FwIGJ1ZmZlclxuICovXG5leHBvcnQgY2xhc3MgU3dhcDxUPiB7XG4gIHB1YmxpYyBpOiBUO1xuICBwdWJsaWMgbzogVDtcblxuICBwdWJsaWMgY29uc3RydWN0b3IoIGE6IFQsIGI6IFQgKSB7XG4gICAgdGhpcy5pID0gYTtcbiAgICB0aGlzLm8gPSBiO1xuICB9XG5cbiAgcHVibGljIHN3YXAoKTogdm9pZCB7XG4gICAgY29uc3QgaSA9IHRoaXMuaTtcbiAgICB0aGlzLmkgPSB0aGlzLm87XG4gICAgdGhpcy5vID0gaTtcbiAgfVxufVxuIiwiaW1wb3J0IHsgSGlzdG9yeU1lYW5DYWxjdWxhdG9yIH0gZnJvbSAnLi4vSGlzdG9yeU1lYW5DYWxjdWxhdG9yL0hpc3RvcnlNZWFuQ2FsY3VsYXRvcic7XG5cbmV4cG9ydCBjbGFzcyBUYXBUZW1wbyB7XG4gIHByaXZhdGUgX19icG0gPSAwLjA7XG4gIHByaXZhdGUgX19sYXN0VGFwID0gMC4wO1xuICBwcml2YXRlIF9fbGFzdEJlYXQgPSAwLjA7XG4gIHByaXZhdGUgX19sYXN0VGltZSA9IDAuMDtcbiAgcHJpdmF0ZSBfX2NhbGM6IEhpc3RvcnlNZWFuQ2FsY3VsYXRvciA9IG5ldyBIaXN0b3J5TWVhbkNhbGN1bGF0b3IoIDE2ICk7XG5cbiAgcHVibGljIGdldCBiZWF0RHVyYXRpb24oKTogbnVtYmVyIHtcbiAgICByZXR1cm4gNjAuMCAvIHRoaXMuX19icG07XG4gIH1cblxuICBwdWJsaWMgZ2V0IGJwbSgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLl9fYnBtO1xuICB9XG5cbiAgcHVibGljIHNldCBicG0oIGJwbTogbnVtYmVyICkge1xuICAgIHRoaXMuX19sYXN0QmVhdCA9IHRoaXMuYmVhdDtcbiAgICB0aGlzLl9fbGFzdFRpbWUgPSBwZXJmb3JtYW5jZS5ub3coKTtcbiAgICB0aGlzLl9fYnBtID0gYnBtO1xuICB9XG5cbiAgcHVibGljIGdldCBiZWF0KCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuX19sYXN0QmVhdCArICggcGVyZm9ybWFuY2Uubm93KCkgLSB0aGlzLl9fbGFzdFRpbWUgKSAqIDAuMDAxIC8gdGhpcy5iZWF0RHVyYXRpb247XG4gIH1cblxuICBwdWJsaWMgcmVzZXQoKTogdm9pZCB7XG4gICAgdGhpcy5fX2NhbGMucmVzZXQoKTtcbiAgfVxuXG4gIHB1YmxpYyBudWRnZSggYW1vdW50OiBudW1iZXIgKTogdm9pZCB7XG4gICAgdGhpcy5fX2xhc3RCZWF0ID0gdGhpcy5iZWF0ICsgYW1vdW50O1xuICAgIHRoaXMuX19sYXN0VGltZSA9IHBlcmZvcm1hbmNlLm5vdygpO1xuICB9XG5cbiAgcHVibGljIHRhcCgpOiB2b2lkIHtcbiAgICBjb25zdCBub3cgPSBwZXJmb3JtYW5jZS5ub3coKTtcbiAgICBjb25zdCBkZWx0YSA9ICggbm93IC0gdGhpcy5fX2xhc3RUYXAgKSAqIDAuMDAxO1xuXG4gICAgaWYgKCAyLjAgPCBkZWx0YSApIHtcbiAgICAgIHRoaXMucmVzZXQoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fX2NhbGMucHVzaCggZGVsdGEgKTtcbiAgICAgIHRoaXMuX19icG0gPSA2MC4wIC8gKCB0aGlzLl9fY2FsYy5tZWFuICk7XG4gICAgfVxuXG4gICAgdGhpcy5fX2xhc3RUYXAgPSBub3c7XG4gICAgdGhpcy5fX2xhc3RUaW1lID0gbm93O1xuICAgIHRoaXMuX19sYXN0QmVhdCA9IDAuMDtcbiAgfVxufVxuIiwiZXhwb3J0IGNsYXNzIFhvcnNoaWZ0IHtcbiAgcHVibGljIHNlZWQ6IG51bWJlcjtcblxuICBwdWJsaWMgY29uc3RydWN0b3IoIHNlZWQ/OiBudW1iZXIgKSB7XG4gICAgdGhpcy5zZWVkID0gc2VlZCB8fCAxO1xuICB9XG5cbiAgcHVibGljIGdlbiggc2VlZD86IG51bWJlciApOiBudW1iZXIge1xuICAgIGlmICggc2VlZCApIHtcbiAgICAgIHRoaXMuc2VlZCA9IHNlZWQ7XG4gICAgfVxuXG4gICAgdGhpcy5zZWVkID0gdGhpcy5zZWVkIF4gKCB0aGlzLnNlZWQgPDwgMTMgKTtcbiAgICB0aGlzLnNlZWQgPSB0aGlzLnNlZWQgXiAoIHRoaXMuc2VlZCA+Pj4gMTcgKTtcbiAgICB0aGlzLnNlZWQgPSB0aGlzLnNlZWQgXiAoIHRoaXMuc2VlZCA8PCA1ICk7XG4gICAgcmV0dXJuIHRoaXMuc2VlZCAvIE1hdGgucG93KCAyLCAzMiApICsgMC41O1xuICB9XG5cbiAgcHVibGljIHNldCggc2VlZD86IG51bWJlciApOiB2b2lkIHtcbiAgICB0aGlzLnNlZWQgPSBzZWVkIHx8IHRoaXMuc2VlZCB8fCAxO1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFhvcnNoaWZ0O1xuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O0lBQUE7YUFFZ0IsWUFBWSxDQUMxQixPQUFlLEVBQ2YsS0FBd0I7UUFFeEIsSUFBSSxLQUFLLEdBQUcsQ0FBQyxDQUFDO1FBQ2QsSUFBSSxHQUFHLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQztRQUV2QixPQUFRLEtBQUssR0FBRyxHQUFHLEVBQUc7WUFDcEIsSUFBTSxNQUFNLEdBQUcsQ0FBRSxLQUFLLEdBQUcsR0FBRyxLQUFNLENBQUMsQ0FBQztZQUNwQyxJQUFLLEtBQUssQ0FBRSxNQUFNLENBQUUsR0FBRyxPQUFPLEVBQUc7Z0JBQy9CLEtBQUssR0FBRyxNQUFNLEdBQUcsQ0FBQyxDQUFDO2FBQ3BCO2lCQUFNO2dCQUNMLEdBQUcsR0FBRyxNQUFNLENBQUM7YUFDZDtTQUNGO1FBRUQsT0FBTyxLQUFLLENBQUM7SUFDZjs7SUNuQkE7OztRQUdhLG1CQUFtQixHQUFHLENBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFHO0lBRWxFOzs7UUFHYSxzQkFBc0IsR0FBRyxDQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUc7SUFFakY7OztRQUdhLDBCQUEwQixHQUFHLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUc7SUFFakY7OztRQUdhLHNCQUFzQixHQUFHLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7O0lDbEI5RDs7O2FBR2dCLFlBQVksQ0FBSyxLQUFVLEVBQUUsSUFBbUI7UUFDOUQsSUFBTSxDQUFDLEdBQUcsSUFBSSxHQUFHLElBQUksR0FBRyxjQUFNLE9BQUEsSUFBSSxDQUFDLE1BQU0sRUFBRSxHQUFBLENBQUM7UUFDNUMsS0FBTSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRyxFQUFHO1lBQzVDLElBQU0sRUFBRSxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFFLENBQUMsRUFBRSxJQUFLLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFFLENBQUUsQ0FBQztZQUN4RCxJQUFNLElBQUksR0FBRyxLQUFLLENBQUUsRUFBRSxDQUFFLENBQUM7WUFDekIsS0FBSyxDQUFFLEVBQUUsQ0FBRSxHQUFHLEtBQUssQ0FBRSxDQUFDLENBQUUsQ0FBQztZQUN6QixLQUFLLENBQUUsQ0FBQyxDQUFFLEdBQUcsSUFBSSxDQUFDO1NBQ25CO1FBQ0QsT0FBTyxLQUFLLENBQUM7SUFDZixDQUFDO0lBRUQ7Ozs7O2FBS2dCLG1CQUFtQixDQUFLLEtBQVU7UUFDaEQsSUFBTSxHQUFHLEdBQVEsRUFBRSxDQUFDO1FBQ3BCLEtBQU0sSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxLQUFLLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUcsRUFBRztZQUM1QyxJQUFNLElBQUksR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ25CLEdBQUcsQ0FBQyxJQUFJLENBQ04sS0FBSyxDQUFFLElBQUksQ0FBTSxFQUFFLEtBQUssQ0FBRSxJQUFJLEdBQUcsQ0FBQyxDQUFFLEVBQ3BDLEtBQUssQ0FBRSxJQUFJLEdBQUcsQ0FBQyxDQUFFLEVBQUUsS0FBSyxDQUFFLElBQUksR0FBRyxDQUFDLENBQUUsRUFDcEMsS0FBSyxDQUFFLElBQUksR0FBRyxDQUFDLENBQUUsRUFBRSxLQUFLLENBQUUsSUFBSSxDQUFNLENBQ3JDLENBQUM7U0FDSDtRQUNELE9BQU8sR0FBRyxDQUFDO0lBQ2IsQ0FBQztJQUVEOzs7YUFHZ0IsUUFBUSxDQUFFLENBQVMsRUFBRSxDQUFTO1FBQzVDLElBQU0sR0FBRyxHQUFhLEVBQUUsQ0FBQztRQUN6QixLQUFNLElBQUksRUFBRSxHQUFHLENBQUMsRUFBRSxFQUFFLEdBQUcsQ0FBQyxFQUFFLEVBQUUsRUFBRyxFQUFHO1lBQ2hDLEtBQU0sSUFBSSxFQUFFLEdBQUcsQ0FBQyxFQUFFLEVBQUUsR0FBRyxDQUFDLEVBQUUsRUFBRSxFQUFHLEVBQUc7Z0JBQ2hDLEdBQUcsQ0FBQyxJQUFJLENBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBRSxDQUFDO2FBQ3BCO1NBQ0Y7UUFDRCxPQUFPLEdBQUcsQ0FBQztJQUNiOztJQzNDQTs7Ozs7O1FBS0E7WUFDUyxXQUFNLEdBQUcsS0FBSyxDQUFDO1lBQ2YsVUFBSyxHQUFHLEdBQUcsQ0FBQztZQUNaLGFBQVEsR0FBRyxHQUFHLENBQUM7WUFDZixVQUFLLEdBQUcsR0FBRyxDQUFDO1lBQ1osV0FBTSxHQUFHLEdBQUcsQ0FBQztTQVVyQjtRQVJRLG9CQUFNLEdBQWIsVUFBZSxTQUFpQjtZQUM5QixJQUFJLENBQUMsUUFBUSxJQUFJLENBQ2YsQ0FBQyxJQUFJLENBQUMsTUFBTSxJQUFLLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBRTtrQkFDekMsR0FBRyxHQUFHLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBRSxJQUFJLENBQUMsTUFBTSxDQUFFLEdBQUcsSUFBSSxDQUFDLEtBQUssSUFDM0QsU0FBUyxDQUFDO1lBQ2QsSUFBSSxDQUFDLEtBQUssSUFBSSxJQUFJLENBQUMsUUFBUSxHQUFHLFNBQVMsQ0FBQztZQUN4QyxPQUFPLElBQUksQ0FBQyxLQUFLLENBQUM7U0FDbkI7UUFDSCxVQUFDO0lBQUQsQ0FBQzs7SUNwQkQ7Ozs7OztRQUtBOzs7O1lBSVksV0FBTSxHQUFHLEdBQUcsQ0FBQzs7OztZQUtiLGdCQUFXLEdBQUcsR0FBRyxDQUFDOzs7O1lBS2xCLGdCQUFXLEdBQUcsS0FBSyxDQUFDO1NBZ0QvQjtRQTNDQyxzQkFBVyx1QkFBSTs7OztpQkFBZixjQUE0QixPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRTs7O1dBQUE7UUFLakQsc0JBQVcsNEJBQVM7Ozs7aUJBQXBCLGNBQWlDLE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQyxFQUFFOzs7V0FBQTtRQUszRCxzQkFBVyw0QkFBUzs7OztpQkFBcEIsY0FBa0MsT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDLEVBQUU7OztXQUFBOzs7OztRQU1yRCxzQkFBTSxHQUFiLFVBQWUsSUFBYTtZQUMxQixJQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDO1lBQzdCLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxJQUFJLEdBQUcsQ0FBQztZQUMxQixJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxNQUFNLEdBQUcsUUFBUSxDQUFDO1NBQzNDOzs7O1FBS00sb0JBQUksR0FBWDtZQUNFLElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDO1NBQ3pCOzs7O1FBS00scUJBQUssR0FBWjtZQUNFLElBQUksQ0FBQyxXQUFXLEdBQUcsS0FBSyxDQUFDO1NBQzFCOzs7OztRQU1NLHVCQUFPLEdBQWQsVUFBZ0IsSUFBWTtZQUMxQixJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQztTQUNwQjtRQUNILFlBQUM7SUFBRCxDQUFDOztJQ25FRDtJQUNBO0FBQ0E7SUFDQTtJQUNBO0FBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7QUFDQTtJQUNBLElBQUksYUFBYSxHQUFHLFNBQVMsQ0FBQyxFQUFFLENBQUMsRUFBRTtJQUNuQyxJQUFJLGFBQWEsR0FBRyxNQUFNLENBQUMsY0FBYztJQUN6QyxTQUFTLEVBQUUsU0FBUyxFQUFFLEVBQUUsRUFBRSxZQUFZLEtBQUssSUFBSSxVQUFVLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUM7SUFDcEYsUUFBUSxVQUFVLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxLQUFLLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7SUFDbkYsSUFBSSxPQUFPLGFBQWEsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDL0IsQ0FBQyxDQUFDO0FBQ0Y7SUFDTyxTQUFTLFNBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFO0lBQ2hDLElBQUksYUFBYSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUN4QixJQUFJLFNBQVMsRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDLFdBQVcsR0FBRyxDQUFDLENBQUMsRUFBRTtJQUMzQyxJQUFJLENBQUMsQ0FBQyxTQUFTLEdBQUcsQ0FBQyxLQUFLLElBQUksR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxTQUFTLEdBQUcsQ0FBQyxDQUFDLFNBQVMsRUFBRSxJQUFJLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFDekYsQ0FBQztBQXlGRDtJQUNPLFNBQVMsUUFBUSxDQUFDLENBQUMsRUFBRTtJQUM1QixJQUFJLElBQUksQ0FBQyxHQUFHLE9BQU8sTUFBTSxLQUFLLFVBQVUsSUFBSSxNQUFNLENBQUMsUUFBUSxFQUFFLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDbEYsSUFBSSxJQUFJLENBQUMsRUFBRSxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDNUIsSUFBSSxJQUFJLENBQUMsSUFBSSxPQUFPLENBQUMsQ0FBQyxNQUFNLEtBQUssUUFBUSxFQUFFLE9BQU87SUFDbEQsUUFBUSxJQUFJLEVBQUUsWUFBWTtJQUMxQixZQUFZLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsR0FBRyxLQUFLLENBQUMsQ0FBQztJQUMvQyxZQUFZLE9BQU8sRUFBRSxLQUFLLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDO0lBQ3BELFNBQVM7SUFDVCxLQUFLLENBQUM7SUFDTixJQUFJLE1BQU0sSUFBSSxTQUFTLENBQUMsQ0FBQyxHQUFHLHlCQUF5QixHQUFHLGlDQUFpQyxDQUFDLENBQUM7SUFDM0YsQ0FBQztBQUNEO0lBQ08sU0FBUyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRTtJQUM3QixJQUFJLElBQUksQ0FBQyxHQUFHLE9BQU8sTUFBTSxLQUFLLFVBQVUsSUFBSSxDQUFDLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQy9ELElBQUksSUFBSSxDQUFDLENBQUMsRUFBRSxPQUFPLENBQUMsQ0FBQztJQUNyQixJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsR0FBRyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBQ3JDLElBQUksSUFBSTtJQUNSLFFBQVEsT0FBTyxDQUFDLENBQUMsS0FBSyxLQUFLLENBQUMsSUFBSSxDQUFDLEVBQUUsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxFQUFFLEVBQUUsSUFBSSxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ25GLEtBQUs7SUFDTCxJQUFJLE9BQU8sS0FBSyxFQUFFLEVBQUUsQ0FBQyxHQUFHLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUU7SUFDM0MsWUFBWTtJQUNaLFFBQVEsSUFBSTtJQUNaLFlBQVksSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzdELFNBQVM7SUFDVCxnQkFBZ0IsRUFBRSxJQUFJLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxLQUFLLENBQUMsRUFBRTtJQUN6QyxLQUFLO0lBQ0wsSUFBSSxPQUFPLEVBQUUsQ0FBQztJQUNkLENBQUM7QUFDRDtJQUNPLFNBQVMsUUFBUSxHQUFHO0lBQzNCLElBQUksS0FBSyxJQUFJLEVBQUUsR0FBRyxFQUFFLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsU0FBUyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUU7SUFDdEQsUUFBUSxFQUFFLEdBQUcsRUFBRSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUM3QyxJQUFJLE9BQU8sRUFBRSxDQUFDO0lBQ2Q7O0lDcEpBOzs7Ozs7UUFLZ0MsOEJBQUs7UUFXbkMsb0JBQW9CLEdBQVE7WUFBUixvQkFBQSxFQUFBLFFBQVE7WUFBNUIsWUFDRSxpQkFBTyxTQUVSOzs7O1lBVk8sYUFBTyxHQUFHLENBQUMsQ0FBQztZQVNsQixLQUFJLENBQUMsS0FBSyxHQUFHLEdBQUcsQ0FBQzs7U0FDbEI7UUFLRCxzQkFBVyw2QkFBSzs7OztpQkFBaEIsY0FBNkIsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUU7OztXQUFBO1FBS25ELHNCQUFXLDJCQUFHOzs7O2lCQUFkLGNBQTJCLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFOzs7V0FBQTs7OztRQUt4QywyQkFBTSxHQUFiO1lBQ0UsSUFBSyxJQUFJLENBQUMsV0FBVyxFQUFHO2dCQUN0QixJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztnQkFDeEMsSUFBSSxDQUFDLFdBQVcsR0FBRyxHQUFHLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztnQkFDcEMsSUFBSSxDQUFDLE9BQU8sRUFBRyxDQUFDO2FBQ2pCO2lCQUFNO2dCQUNMLElBQUksQ0FBQyxXQUFXLEdBQUcsR0FBRyxDQUFDO2FBQ3hCO1NBQ0Y7Ozs7OztRQU9NLDRCQUFPLEdBQWQsVUFBZ0IsSUFBWTtZQUMxQixJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUUsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUUsQ0FBQztZQUMvQyxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztTQUN6QztRQUNILGlCQUFDO0lBQUQsQ0FoREEsQ0FBZ0MsS0FBSzs7SUNMckM7Ozs7O1FBSW1DLGlDQUFLO1FBQXhDO1lBQUEscUVBMkNDOzs7O1lBdkNTLGNBQVEsR0FBRyxHQUFHLENBQUM7Ozs7WUFLZixjQUFRLEdBQVcsV0FBVyxDQUFDLEdBQUcsRUFBRSxDQUFDOztTQWtDOUM7UUE3QkMsc0JBQVcscUNBQVU7Ozs7aUJBQXJCLGNBQW1DLE9BQU8sSUFBSSxDQUFDLEVBQUU7OztXQUFBOzs7O1FBSzFDLDhCQUFNLEdBQWI7WUFDRSxJQUFNLEdBQUcsR0FBRyxXQUFXLENBQUMsR0FBRyxFQUFFLENBQUM7WUFFOUIsSUFBSyxJQUFJLENBQUMsV0FBVyxFQUFHO2dCQUN0QixJQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDO2dCQUM3QixJQUFNLFNBQVMsSUFBSyxHQUFHLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBRSxDQUFDO2dCQUMxQyxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxRQUFRLEdBQUcsU0FBUyxHQUFHLE1BQU0sQ0FBQztnQkFDakQsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsSUFBSSxHQUFHLFFBQVEsQ0FBQzthQUN6QztpQkFBTTtnQkFDTCxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7Z0JBQzFCLElBQUksQ0FBQyxRQUFRLEdBQUcsR0FBRyxDQUFDO2dCQUNwQixJQUFJLENBQUMsV0FBVyxHQUFHLEdBQUcsQ0FBQzthQUN4QjtTQUNGOzs7OztRQU1NLCtCQUFPLEdBQWQsVUFBZ0IsSUFBWTtZQUMxQixJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQztZQUNuQixJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7WUFDMUIsSUFBSSxDQUFDLFFBQVEsR0FBRyxXQUFXLENBQUMsR0FBRyxFQUFFLENBQUM7U0FDbkM7UUFDSCxvQkFBQztJQUFELENBM0NBLENBQW1DLEtBQUs7O0lDTnhDOzs7YUFHZ0IsSUFBSSxDQUFFLENBQVMsRUFBRSxDQUFTLEVBQUUsQ0FBUztRQUNuRCxPQUFPLENBQUMsR0FBRyxDQUFFLENBQUMsR0FBRyxDQUFDLElBQUssQ0FBQyxDQUFDO0lBQzNCLENBQUM7SUFFRDs7O2FBR2dCLEtBQUssQ0FBRSxDQUFTLEVBQUUsQ0FBUyxFQUFFLENBQVM7UUFDcEQsT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFFLElBQUksQ0FBQyxHQUFHLENBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUFFLENBQUMsQ0FBRSxDQUFDO0lBQ3pDLENBQUM7SUFFRDs7O2FBR2dCLFFBQVEsQ0FBRSxDQUFTO1FBQ2pDLE9BQU8sS0FBSyxDQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFFLENBQUM7SUFDOUIsQ0FBQztJQUVEOzs7YUFHZ0IsVUFBVSxDQUFFLENBQVMsRUFBRSxDQUFTLEVBQUUsQ0FBUztRQUN6RCxPQUFPLFFBQVEsQ0FBRSxDQUFFLENBQUMsR0FBRyxDQUFDLEtBQU8sQ0FBQyxHQUFHLENBQUMsQ0FBRSxDQUFFLENBQUM7SUFDM0MsQ0FBQztJQUVEOzs7YUFHZ0IsVUFBVSxDQUFFLENBQVMsRUFBRSxDQUFTLEVBQUUsQ0FBUztRQUN6RCxJQUFNLENBQUMsR0FBRyxVQUFVLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsQ0FBQztRQUNoQyxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUssR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUUsQ0FBQztJQUNuQyxDQUFDO0lBRUQ7OzthQUdnQixZQUFZLENBQUUsQ0FBUyxFQUFFLENBQVMsRUFBRSxDQUFTO1FBQzNELElBQU0sQ0FBQyxHQUFHLFVBQVUsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxDQUFDO1FBQ2hDLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLElBQUssQ0FBQyxJQUFLLENBQUMsR0FBRyxHQUFHLEdBQUcsSUFBSSxDQUFFLEdBQUcsSUFBSSxDQUFFLENBQUM7SUFDdkQsQ0FBQztJQUVEOzs7YUFHZ0IsYUFBYSxDQUFFLENBQVMsRUFBRSxDQUFTLEVBQUUsQ0FBUztRQUM1RCxJQUFNLENBQUMsR0FBRyxVQUFVLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsQ0FBQztRQUNoQyxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsSUFBSyxDQUFDLElBQUssQ0FBQyxJQUFLLENBQUMsSUFBSSxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUUsR0FBRyxJQUFJLENBQUUsR0FBRyxJQUFJLENBQUUsQ0FBQztJQUM1RTs7SUNoREE7Ozs7UUFHQTtZQUNTLFdBQU0sR0FBRyxJQUFJLENBQUM7WUFDZCxXQUFNLEdBQUcsR0FBRyxDQUFDO1lBQ2IsVUFBSyxHQUFHLEdBQUcsQ0FBQztTQU1wQjtRQUpRLDBCQUFNLEdBQWIsVUFBZSxTQUFpQjtZQUM5QixJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBRSxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBRSxDQUFDLElBQUksQ0FBQyxNQUFNLEdBQUcsU0FBUyxDQUFFLENBQUUsQ0FBQztZQUNuRixPQUFPLElBQUksQ0FBQyxLQUFLLENBQUM7U0FDbkI7UUFDSCxnQkFBQztJQUFELENBQUM7O0lDZEQ7Ozs7UUFhRSxrQkFBb0IsS0FBa0QsRUFBRSxLQUFTLEVBQUUsR0FBUztZQUF4RSxzQkFBQSxFQUFBLFFBQTZCLFFBQVEsQ0FBQyxZQUFZO1lBQUUsc0JBQUEsRUFBQSxTQUFTO1lBQUUsb0JBQUEsRUFBQSxTQUFTO1lBQzFGLElBQUksQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDO1lBQ3JCLElBQUksQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDO1lBQ3JCLElBQUksQ0FBQyxLQUFLLEdBQUcsR0FBRyxDQUFDO1NBQ2xCO1FBRU0sbUJBQUUsTUFBTSxDQUFDLFFBQVEsQ0FBRSxHQUExQjtZQUNFLE9BQU8sSUFBSSxDQUFDO1NBQ2I7UUFFTSx1QkFBSSxHQUFYOztZQUNFLElBQUssSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsT0FBTyxFQUFHO2dCQUMvQixPQUFPLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLENBQUM7YUFDcEM7WUFFRCxJQUFJLEtBQUssR0FBb0IsRUFBRSxDQUFDOztnQkFDaEMsS0FBNkIsSUFBQSxLQUFBLFNBQUEsSUFBSSxDQUFDLE9BQU8sQ0FBQSxnQkFBQSw0QkFBRztvQkFBaEMsSUFBQSx3QkFBYSxFQUFYLFdBQUcsRUFBRSxZQUFJO29CQUNyQixJQUFLLENBQUUsSUFBSSxDQUFDLE9BQU8sR0FBRyxHQUFHLE1BQU8sQ0FBQyxFQUFHO3dCQUNsQyxLQUFLLElBQUksSUFBSSxDQUFDO3FCQUNmO2lCQUNGOzs7Ozs7Ozs7WUFFRCxJQUFLLEtBQUssS0FBSyxFQUFFLEVBQUc7Z0JBQ2xCLEtBQUssR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDO2FBQ3RCO1lBRUQsSUFBSSxDQUFDLE9BQU8sRUFBRyxDQUFDO1lBRWhCLE9BQU8sRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLEtBQUssT0FBQSxFQUFFLENBQUM7U0FDL0I7UUF0Q2EscUJBQVksR0FBd0IsSUFBSSxHQUFHLENBQUU7WUFDekQsQ0FBRSxDQUFDLEVBQUUsTUFBTSxDQUFFO1lBQ2IsQ0FBRSxDQUFDLEVBQUUsTUFBTSxDQUFFO1NBQ2QsQ0FBRSxDQUFDO1FBb0NOLGVBQUM7S0F4Q0Q7O0lDSEE7Ozs7UUFHQTtTQVVDOzs7O1FBTmUsV0FBRyxHQUFHLHdDQUF3QyxDQUFDOzs7O1FBSy9DLFdBQUcsR0FBRyx3Q0FBd0MsQ0FBQztRQUMvRCxjQUFDO0tBVkQ7O0lDSEE7Ozs7UUFZRSwrQkFBb0IsTUFBYztZQVIxQixvQkFBZSxHQUFHLENBQUMsQ0FBQztZQUNwQix1QkFBa0IsR0FBRyxDQUFDLENBQUM7WUFDdkIsY0FBUyxHQUFhLEVBQUUsQ0FBQztZQUN6QixZQUFPLEdBQUcsQ0FBQyxDQUFDO1lBRVosWUFBTyxHQUFHLENBQUMsQ0FBQztZQUNaLFlBQU8sR0FBRyxDQUFDLENBQUM7WUFHbEIsSUFBSSxDQUFDLFFBQVEsR0FBRyxNQUFNLENBQUM7WUFDdkIsSUFBSSxDQUFDLGVBQWUsR0FBRyxNQUFNLENBQUM7WUFDOUIsS0FBTSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLE1BQU0sRUFBRSxDQUFDLEVBQUcsRUFBRztnQkFDbEMsSUFBSSxDQUFDLFNBQVMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUM7YUFDekI7U0FDRjtRQUVELHNCQUFXLHVDQUFJO2lCQUFmO2dCQUNFLElBQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUUsSUFBSSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFFLENBQUM7Z0JBQ3RELE9BQU8sS0FBSyxLQUFLLENBQUMsR0FBRyxHQUFHLEdBQUcsSUFBSSxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUM7YUFDakQ7OztXQUFBO1FBRUQsc0JBQVcsZ0RBQWE7aUJBQXhCO2dCQUNFLE9BQU8sSUFBSSxDQUFDLGVBQWUsQ0FBQzthQUM3QjtpQkFFRCxVQUEwQixLQUFhO2dCQUNyQyxJQUFNLEtBQUssR0FBRyxLQUFLLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQztnQkFDM0MsSUFBSSxDQUFDLGVBQWUsR0FBRyxLQUFLLENBQUM7Z0JBQzdCLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsa0JBQWtCLEdBQUcsS0FBSyxDQUFFLENBQUM7YUFDMUU7OztXQU5BO1FBUU0scUNBQUssR0FBWjtZQUNFLElBQUksQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDO1lBQ2pCLElBQUksQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDO1lBQ2pCLElBQUksQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDO1lBQ2pCLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxDQUFDLENBQUM7WUFDNUIsS0FBTSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQyxFQUFHLEVBQUc7Z0JBQ3pDLElBQUksQ0FBQyxTQUFTLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFDO2FBQ3pCO1NBQ0Y7UUFFTSxvQ0FBSSxHQUFYLFVBQWEsS0FBYTtZQUN4QixJQUFNLElBQUksR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFFLElBQUksQ0FBQyxPQUFPLENBQUUsQ0FBQztZQUM1QyxJQUFJLENBQUMsU0FBUyxDQUFFLElBQUksQ0FBQyxPQUFPLENBQUUsR0FBRyxLQUFLLENBQUM7WUFDdkMsSUFBSSxDQUFDLE9BQU8sRUFBRyxDQUFDO1lBQ2hCLElBQUksQ0FBQyxPQUFPLEdBQUcsQ0FBRSxJQUFJLENBQUMsT0FBTyxHQUFHLENBQUMsSUFBSyxJQUFJLENBQUMsUUFBUSxDQUFDO1lBRXBELElBQUssSUFBSSxDQUFDLGtCQUFrQixLQUFLLENBQUMsRUFBRztnQkFDbkMsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO2FBQ2Y7aUJBQU07Z0JBQ0wsSUFBSSxDQUFDLGtCQUFrQixFQUFHLENBQUM7Z0JBQzNCLElBQUksQ0FBQyxPQUFPLElBQUksSUFBSSxDQUFDO2dCQUNyQixJQUFJLENBQUMsT0FBTyxJQUFJLEtBQUssQ0FBQzthQUN2QjtTQUNGO1FBRU0sc0NBQU0sR0FBYjtZQUNFLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDO1lBQy9DLElBQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxTQUFTO2lCQUN2QixLQUFLLENBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUUsSUFBSSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFFLENBQUU7aUJBQ25ELE1BQU0sQ0FBRSxVQUFFLEdBQUcsRUFBRSxDQUFDLElBQU0sT0FBQSxHQUFHLEdBQUcsQ0FBQyxHQUFBLEVBQUUsQ0FBQyxDQUFFLENBQUM7WUFDdEMsSUFBSSxDQUFDLE9BQU8sR0FBRyxHQUFHLENBQUM7U0FDcEI7UUFDSCw0QkFBQztJQUFELENBQUM7O0lDakVEOzs7OztRQVVFLGlDQUFvQixNQUFjO1lBTDFCLGNBQVMsR0FBYSxFQUFFLENBQUM7WUFDekIsYUFBUSxHQUFhLEVBQUUsQ0FBQztZQUN4QixZQUFPLEdBQUcsQ0FBQyxDQUFDO1lBSWxCLElBQUksQ0FBQyxRQUFRLEdBQUcsTUFBTSxDQUFDO1NBQ3hCO1FBRUQsc0JBQVcsMkNBQU07aUJBQWpCO2dCQUNFLElBQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBRSxDQUFDO2dCQUM5RCxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUUsSUFBSSxDQUFDLEtBQUssQ0FBRSxDQUFFLEtBQUssR0FBRyxDQUFDLElBQUssQ0FBQyxDQUFFLENBQUUsQ0FBQzthQUN6RDs7O1dBQUE7UUFFTSx1Q0FBSyxHQUFaO1lBQ0UsSUFBSSxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUM7WUFDakIsSUFBSSxDQUFDLFNBQVMsR0FBRyxFQUFFLENBQUM7WUFDcEIsSUFBSSxDQUFDLFFBQVEsR0FBRyxFQUFFLENBQUM7U0FDcEI7UUFFTSxzQ0FBSSxHQUFYLFVBQWEsS0FBYTtZQUN4QixJQUFNLElBQUksR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFFLElBQUksQ0FBQyxPQUFPLENBQUUsQ0FBQztZQUM1QyxJQUFJLENBQUMsU0FBUyxDQUFFLElBQUksQ0FBQyxPQUFPLENBQUUsR0FBRyxLQUFLLENBQUM7WUFDdkMsSUFBSSxDQUFDLE9BQU8sR0FBRyxDQUFFLElBQUksQ0FBQyxPQUFPLEdBQUcsQ0FBQyxJQUFLLElBQUksQ0FBQyxRQUFRLENBQUM7O1lBR3BELElBQUssSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEtBQUssSUFBSSxDQUFDLFFBQVEsRUFBRztnQkFDNUMsSUFBTSxTQUFTLEdBQUcsWUFBWSxDQUFFLElBQUksRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFFLENBQUM7Z0JBQ3RELElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFFLFNBQVMsRUFBRSxDQUFDLENBQUUsQ0FBQzthQUN0QztZQUVELElBQU0sS0FBSyxHQUFHLFlBQVksQ0FBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBRSxDQUFDO1lBQ25ELElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFFLEtBQUssRUFBRSxDQUFDLEVBQUUsS0FBSyxDQUFFLENBQUM7U0FDekM7UUFDSCw4QkFBQztJQUFELENBQUM7O0lDekNEOzs7O1FBR0E7U0EyRUM7UUFwRUMsc0JBQVcsMEJBQU07Ozs7O2lCQUFqQjtnQkFDRSxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUUsVUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFNLE9BQUEsR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUEsRUFBRSxHQUFHLENBQUUsQ0FBRSxDQUFDO2FBQzVFOzs7V0FBQTtRQUtELHNCQUFXLDhCQUFVOzs7O2lCQUFyQjtnQkFDRSxPQUFPLElBQUksQ0FBQyxLQUFLLENBQUUsR0FBRyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUUsQ0FBQzthQUN4Qzs7O1dBQUE7Ozs7UUFLTSxzQkFBSyxHQUFaO1lBQ0UsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFLENBQUUsQ0FBQztTQUM3Qzs7Ozs7UUFNTSxvQkFBRyxHQUFWLFVBQVksTUFBUztZQUNuQixPQUFPLElBQUksQ0FBQyxLQUFLLENBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUUsVUFBRSxDQUFDLEVBQUUsQ0FBQyxJQUFNLE9BQUEsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUUsQ0FBQyxDQUFFLEdBQUEsQ0FBRSxDQUFFLENBQUM7U0FDaEY7Ozs7O1FBTU0sb0JBQUcsR0FBVixVQUFZLE1BQVM7WUFDbkIsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFFLFVBQUUsQ0FBQyxFQUFFLENBQUMsSUFBTSxPQUFBLENBQUMsR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFFLENBQUMsQ0FBRSxHQUFBLENBQUUsQ0FBRSxDQUFDO1NBQ2hGOzs7OztRQU1NLHlCQUFRLEdBQWYsVUFBaUIsTUFBUztZQUN4QixPQUFPLElBQUksQ0FBQyxLQUFLLENBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUUsVUFBRSxDQUFDLEVBQUUsQ0FBQyxJQUFNLE9BQUEsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUUsQ0FBQyxDQUFFLEdBQUEsQ0FBRSxDQUFFLENBQUM7U0FDaEY7Ozs7O1FBTU0sdUJBQU0sR0FBYixVQUFlLE1BQVM7WUFDdEIsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFFLFVBQUUsQ0FBQyxFQUFFLENBQUMsSUFBTSxPQUFBLENBQUMsR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFFLENBQUMsQ0FBRSxHQUFBLENBQUUsQ0FBRSxDQUFDO1NBQ2hGOzs7Ozs7UUFPTSxzQkFBSyxHQUFaLFVBQWMsTUFBYztZQUMxQixPQUFPLElBQUksQ0FBQyxLQUFLLENBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUUsVUFBRSxDQUFDLElBQU0sT0FBQSxDQUFDLEdBQUcsTUFBTSxHQUFBLENBQUUsQ0FBRSxDQUFDO1NBQy9EOzs7OztRQU1NLG9CQUFHLEdBQVYsVUFBWSxNQUFTO1lBQ25CLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUUsVUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUMsSUFBTSxPQUFBLEdBQUcsR0FBRyxDQUFDLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBRSxDQUFDLENBQUUsR0FBQSxFQUFFLEdBQUcsQ0FBRSxDQUFDO1NBQ3JGO1FBR0gsYUFBQztJQUFELENBQUM7O0lDeEVEOzs7O1FBRzZCLDJCQUFlO1FBRzFDLGlCQUFvQixDQUFpQztZQUFqQyxrQkFBQSxFQUFBLEtBQWtCLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFFO1lBQXJELFlBQ0UsaUJBQU8sU0FFUjtZQURDLEtBQUksQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDOztTQUNuQjtRQUtELHNCQUFXLHNCQUFDOzs7O2lCQUFaO2dCQUNFLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBRSxDQUFDLENBQUUsQ0FBQzthQUMzQjtpQkFFRCxVQUFjLENBQVM7Z0JBQ3JCLElBQUksQ0FBQyxRQUFRLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFDO2FBQ3hCOzs7V0FKQTtRQVNELHNCQUFXLHNCQUFDOzs7O2lCQUFaO2dCQUNFLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBRSxDQUFDLENBQUUsQ0FBQzthQUMzQjtpQkFFRCxVQUFjLENBQVM7Z0JBQ3JCLElBQUksQ0FBQyxRQUFRLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFDO2FBQ3hCOzs7V0FKQTtRQVNELHNCQUFXLHNCQUFDOzs7O2lCQUFaO2dCQUNFLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBRSxDQUFDLENBQUUsQ0FBQzthQUMzQjtpQkFFRCxVQUFjLENBQVM7Z0JBQ3JCLElBQUksQ0FBQyxRQUFRLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFDO2FBQ3hCOzs7V0FKQTtRQU1NLDBCQUFRLEdBQWY7WUFDRSxPQUFPLGNBQWEsSUFBSSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUUsQ0FBQyxDQUFFLFVBQU8sSUFBSSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUUsQ0FBQyxDQUFFLFVBQU8sSUFBSSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUUsQ0FBQyxDQUFFLE9BQUssQ0FBQztTQUNsRzs7Ozs7UUFNTSx1QkFBSyxHQUFaLFVBQWMsTUFBZTtZQUMzQixPQUFPLElBQUksT0FBTyxDQUFFO2dCQUNsQixJQUFJLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxNQUFNLENBQUMsQ0FBQztnQkFDckMsSUFBSSxDQUFDLENBQUMsR0FBRyxNQUFNLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFDLENBQUM7Z0JBQ3JDLElBQUksQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxDQUFDO2FBQ3RDLENBQUUsQ0FBQztTQUNMOzs7OztRQU1NLGlDQUFlLEdBQXRCLFVBQXdCLFVBQXNCO1lBQzVDLElBQU0sQ0FBQyxHQUFHLElBQUksVUFBVSxDQUFFLENBQUUsSUFBSSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFFLENBQUUsQ0FBQztZQUM1RCxJQUFNLENBQUMsR0FBRyxVQUFVLENBQUMsUUFBUSxDQUFDO1lBQzlCLElBQU0sR0FBRyxHQUFHLFVBQVUsQ0FBQyxRQUFRLENBQUUsQ0FBQyxDQUFFLENBQUMsUUFBUSxDQUFFLENBQUMsQ0FBRSxDQUFDO1lBQ25ELE9BQU8sSUFBSSxPQUFPLENBQUUsQ0FBRSxHQUFHLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBRSxDQUFFLENBQUM7U0FDL0M7Ozs7UUFLTSw4QkFBWSxHQUFuQixVQUFxQixNQUFlO1lBQ2xDLElBQU0sQ0FBQyxHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUM7WUFFMUIsSUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFFLEVBQUUsQ0FBRSxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFFLEVBQUUsQ0FBRSxDQUFDO1lBQ3pFLElBQU0sSUFBSSxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUM7WUFFckIsT0FBTyxJQUFJLE9BQU8sQ0FBRTtnQkFDbEIsQ0FBRSxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUUsRUFBRSxDQUFFLElBQUssSUFBSTtnQkFDeEUsQ0FBRSxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUUsRUFBRSxDQUFFLElBQUssSUFBSTtnQkFDeEUsQ0FBRSxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUUsRUFBRSxDQUFFLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUUsRUFBRSxDQUFFLElBQUssSUFBSTthQUMxRSxDQUFFLENBQUM7U0FDTDtRQUVTLHVCQUFLLEdBQWYsVUFBaUIsQ0FBYTtZQUM1QixPQUFPLElBQUksT0FBTyxDQUFFLENBQUMsQ0FBRSxDQUFDO1NBQ3pCO1FBS0Qsc0JBQWtCLGVBQUk7Ozs7aUJBQXRCO2dCQUNFLE9BQU8sSUFBSSxPQUFPLENBQUUsQ0FBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBRSxDQUFFLENBQUM7YUFDekM7OztXQUFBO1FBS0Qsc0JBQWtCLGNBQUc7Ozs7aUJBQXJCO2dCQUNFLE9BQU8sSUFBSSxPQUFPLENBQUUsQ0FBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBRSxDQUFFLENBQUM7YUFDekM7OztXQUFBO1FBQ0gsY0FBQztJQUFELENBckdBLENBQTZCLE1BQU07O1FDSnRCLHFCQUFxQixHQUFrQixDQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRztJQUUzRTs7OztRQU1FLG9CQUFvQixRQUErQztZQUEvQyx5QkFBQSxFQUFBLGdDQUErQztZQUNqRSxJQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQztTQUMxQjtRQUtELHNCQUFXLHlCQUFDOzs7O2lCQUFaO2dCQUNFLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBRSxDQUFDLENBQUUsQ0FBQzthQUMzQjs7O1dBQUE7UUFLRCxzQkFBVyx5QkFBQzs7OztpQkFBWjtnQkFDRSxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUUsQ0FBQyxDQUFFLENBQUM7YUFDM0I7OztXQUFBO1FBS0Qsc0JBQVcseUJBQUM7Ozs7aUJBQVo7Z0JBQ0UsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFFLENBQUMsQ0FBRSxDQUFDO2FBQzNCOzs7V0FBQTtRQUtELHNCQUFXLHlCQUFDOzs7O2lCQUFaO2dCQUNFLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBRSxDQUFDLENBQUUsQ0FBQzthQUMzQjs7O1dBQUE7UUFFTSw2QkFBUSxHQUFmO1lBQ0UsT0FBTyxpQkFBZ0IsSUFBSSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUUsQ0FBQyxDQUFFLFVBQU8sSUFBSSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUUsQ0FBQyxDQUFFLFVBQU8sSUFBSSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUUsQ0FBQyxDQUFFLFVBQU8sSUFBSSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUUsQ0FBQyxDQUFFLE9BQUssQ0FBQztTQUMvSDs7OztRQUtNLDBCQUFLLEdBQVo7WUFDRSxPQUFPLElBQUksVUFBVSxDQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFtQixDQUFFLENBQUM7U0FDbEU7UUFLRCxzQkFBVyw4QkFBTTs7OztpQkFBakI7Z0JBQ0UsSUFBTSxDQUFDLEdBQUcsSUFBSSxPQUFPLENBQUUsQ0FBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBRSxDQUFFLENBQUMsZUFBZSxDQUFFLElBQUksQ0FBRSxDQUFDO2dCQUNuRSxJQUFNLENBQUMsR0FBRyxJQUFJLE9BQU8sQ0FBRSxDQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFFLENBQUUsQ0FBQyxlQUFlLENBQUUsSUFBSSxDQUFFLENBQUM7Z0JBQ25FLElBQU0sQ0FBQyxHQUFHLElBQUksT0FBTyxDQUFFLENBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUUsQ0FBRSxDQUFDLGVBQWUsQ0FBRSxJQUFJLENBQUUsQ0FBQztnQkFFbkUsT0FBTyxJQUFJLE9BQU8sQ0FBRTtvQkFDbEIsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRztvQkFDbEIsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRztvQkFDbEIsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRztvQkFDbEIsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRztpQkFDbkIsQ0FBRSxDQUFDO2FBQ0w7OztXQUFBO1FBS0Qsc0JBQVcsZ0NBQVE7Ozs7aUJBQW5CO2dCQUNFLE9BQU8sSUFBSSxVQUFVLENBQUU7b0JBQ3JCLENBQUMsSUFBSSxDQUFDLENBQUM7b0JBQ1AsQ0FBQyxJQUFJLENBQUMsQ0FBQztvQkFDUCxDQUFDLElBQUksQ0FBQyxDQUFDO29CQUNQLElBQUksQ0FBQyxDQUFDO2lCQUNQLENBQUUsQ0FBQzthQUNMOzs7V0FBQTs7Ozs7UUFNTSw2QkFBUSxHQUFmLFVBQWlCLENBQWE7WUFDNUIsT0FBTyxJQUFJLFVBQVUsQ0FBRTtnQkFDckIsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztnQkFDekQsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztnQkFDekQsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztnQkFDekQsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQzthQUMxRCxDQUFFLENBQUM7U0FDTDtRQUtELHNCQUFrQixzQkFBUTs7OztpQkFBMUI7Z0JBQ0UsT0FBTyxJQUFJLFVBQVUsQ0FBRSxxQkFBcUIsQ0FBRSxDQUFDO2FBQ2hEOzs7V0FBQTs7OztRQUthLHdCQUFhLEdBQTNCLFVBQTZCLElBQWEsRUFBRSxLQUFhO1lBQ3ZELElBQU0sU0FBUyxHQUFHLEtBQUssR0FBRyxHQUFHLENBQUM7WUFDOUIsSUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBRSxTQUFTLENBQUUsQ0FBQztZQUMzQyxPQUFPLElBQUksVUFBVSxDQUFFO2dCQUNyQixJQUFJLENBQUMsQ0FBQyxHQUFHLFlBQVk7Z0JBQ3JCLElBQUksQ0FBQyxDQUFDLEdBQUcsWUFBWTtnQkFDckIsSUFBSSxDQUFDLENBQUMsR0FBRyxZQUFZO2dCQUNyQixJQUFJLENBQUMsR0FBRyxDQUFFLFNBQVMsQ0FBRTthQUN0QixDQUFFLENBQUM7U0FDTDs7Ozs7UUFNYSxxQkFBVSxHQUF4QixVQUEwQixNQUFlO1lBQ3ZDLElBQU0sQ0FBQyxHQUFHLE1BQU0sQ0FBQyxRQUFRLEVBQ3ZCLEdBQUcsR0FBRyxDQUFDLENBQUUsQ0FBQyxDQUFFLEVBQUUsR0FBRyxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUUsRUFBRSxHQUFHLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRSxFQUN4QyxHQUFHLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRSxFQUFFLEdBQUcsR0FBRyxDQUFDLENBQUUsQ0FBQyxDQUFFLEVBQUUsR0FBRyxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUUsRUFDeEMsR0FBRyxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUUsRUFBRSxHQUFHLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRSxFQUFFLEdBQUcsR0FBRyxDQUFDLENBQUUsRUFBRSxDQUFFLEVBQ3pDLEtBQUssR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQztZQUUxQixJQUFLLEtBQUssR0FBRyxDQUFDLEVBQUc7Z0JBQ2YsSUFBTSxDQUFDLEdBQUcsR0FBRyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUUsS0FBSyxHQUFHLEdBQUcsQ0FBRSxDQUFDO2dCQUN6QyxPQUFPLElBQUksVUFBVSxDQUFFO29CQUNyQixDQUFFLEdBQUcsR0FBRyxHQUFHLElBQUssQ0FBQztvQkFDakIsQ0FBRSxHQUFHLEdBQUcsR0FBRyxJQUFLLENBQUM7b0JBQ2pCLENBQUUsR0FBRyxHQUFHLEdBQUcsSUFBSyxDQUFDO29CQUNqQixJQUFJLEdBQUcsQ0FBQztpQkFDVCxDQUFFLENBQUM7YUFDTDtpQkFBTSxJQUFLLEdBQUcsR0FBRyxHQUFHLElBQUksR0FBRyxHQUFHLEdBQUcsRUFBRztnQkFDbkMsSUFBTSxDQUFDLEdBQUcsR0FBRyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUUsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFFLENBQUM7Z0JBQ25ELE9BQU8sSUFBSSxVQUFVLENBQUU7b0JBQ3JCLElBQUksR0FBRyxDQUFDO29CQUNSLENBQUUsR0FBRyxHQUFHLEdBQUcsSUFBSyxDQUFDO29CQUNqQixDQUFFLEdBQUcsR0FBRyxHQUFHLElBQUssQ0FBQztvQkFDakIsQ0FBRSxHQUFHLEdBQUcsR0FBRyxJQUFLLENBQUM7aUJBQ2xCLENBQUUsQ0FBQzthQUNMO2lCQUFNLElBQUssR0FBRyxHQUFHLEdBQUcsRUFBRztnQkFDdEIsSUFBTSxDQUFDLEdBQUcsR0FBRyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUUsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFFLENBQUM7Z0JBQ25ELE9BQU8sSUFBSSxVQUFVLENBQUU7b0JBQ3JCLENBQUUsR0FBRyxHQUFHLEdBQUcsSUFBSyxDQUFDO29CQUNqQixJQUFJLEdBQUcsQ0FBQztvQkFDUixDQUFFLEdBQUcsR0FBRyxHQUFHLElBQUssQ0FBQztvQkFDakIsQ0FBRSxHQUFHLEdBQUcsR0FBRyxJQUFLLENBQUM7aUJBQ2xCLENBQUUsQ0FBQzthQUNMO2lCQUFNO2dCQUNMLElBQU0sQ0FBQyxHQUFHLEdBQUcsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFFLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBRSxDQUFDO2dCQUNuRCxPQUFPLElBQUksVUFBVSxDQUFFO29CQUNyQixDQUFFLEdBQUcsR0FBRyxHQUFHLElBQUssQ0FBQztvQkFDakIsQ0FBRSxHQUFHLEdBQUcsR0FBRyxJQUFLLENBQUM7b0JBQ2pCLElBQUksR0FBRyxDQUFDO29CQUNSLENBQUUsR0FBRyxHQUFHLEdBQUcsSUFBSyxDQUFDO2lCQUNsQixDQUFFLENBQUM7YUFDTDtTQUNGO1FBQ0gsaUJBQUM7SUFBRCxDQUFDOztRQ3pKWSxrQkFBa0IsR0FBZTtRQUM1QyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHO1FBQ2xCLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUc7UUFDbEIsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRztRQUNsQixHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHO01BQ2xCO0lBRUY7Ozs7UUFNRSxpQkFBb0IsQ0FBa0M7WUFBbEMsa0JBQUEsRUFBQSxzQkFBa0M7WUFDcEQsSUFBSSxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUM7U0FDbkI7UUFLRCxzQkFBVyw4QkFBUzs7OztpQkFBcEI7Z0JBQ0UsSUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQztnQkFFeEIsT0FBTyxJQUFJLE9BQU8sQ0FBRTtvQkFDbEIsQ0FBQyxDQUFFLENBQUMsQ0FBRSxFQUFFLENBQUMsQ0FBRSxDQUFDLENBQUUsRUFBRSxDQUFDLENBQUUsQ0FBQyxDQUFFLEVBQUUsQ0FBQyxDQUFFLEVBQUUsQ0FBRTtvQkFDL0IsQ0FBQyxDQUFFLENBQUMsQ0FBRSxFQUFFLENBQUMsQ0FBRSxDQUFDLENBQUUsRUFBRSxDQUFDLENBQUUsQ0FBQyxDQUFFLEVBQUUsQ0FBQyxDQUFFLEVBQUUsQ0FBRTtvQkFDL0IsQ0FBQyxDQUFFLENBQUMsQ0FBRSxFQUFFLENBQUMsQ0FBRSxDQUFDLENBQUUsRUFBRSxDQUFDLENBQUUsRUFBRSxDQUFFLEVBQUUsQ0FBQyxDQUFFLEVBQUUsQ0FBRTtvQkFDaEMsQ0FBQyxDQUFFLENBQUMsQ0FBRSxFQUFFLENBQUMsQ0FBRSxDQUFDLENBQUUsRUFBRSxDQUFDLENBQUUsRUFBRSxDQUFFLEVBQUUsQ0FBQyxDQUFFLEVBQUUsQ0FBRTtpQkFDakMsQ0FBRSxDQUFDO2FBQ0w7OztXQUFBO1FBS0Qsc0JBQVcsZ0NBQVc7Ozs7aUJBQXRCO2dCQUNFLElBQU0sQ0FBQyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUM7Z0JBQ3hCLElBQ0UsR0FBRyxHQUFHLENBQUMsQ0FBRyxDQUFDLENBQUUsRUFBRSxHQUFHLEdBQUcsQ0FBQyxDQUFHLENBQUMsQ0FBRSxFQUFFLEdBQUcsR0FBRyxDQUFDLENBQUcsQ0FBQyxDQUFFLEVBQUUsR0FBRyxHQUFHLENBQUMsQ0FBRyxDQUFDLENBQUUsRUFDMUQsR0FBRyxHQUFHLENBQUMsQ0FBRyxDQUFDLENBQUUsRUFBRSxHQUFHLEdBQUcsQ0FBQyxDQUFHLENBQUMsQ0FBRSxFQUFFLEdBQUcsR0FBRyxDQUFDLENBQUcsQ0FBQyxDQUFFLEVBQUUsR0FBRyxHQUFHLENBQUMsQ0FBRyxDQUFDLENBQUUsRUFDMUQsR0FBRyxHQUFHLENBQUMsQ0FBRyxDQUFDLENBQUUsRUFBRSxHQUFHLEdBQUcsQ0FBQyxDQUFHLENBQUMsQ0FBRSxFQUFFLEdBQUcsR0FBRyxDQUFDLENBQUUsRUFBRSxDQUFFLEVBQUUsR0FBRyxHQUFHLENBQUMsQ0FBRSxFQUFFLENBQUUsRUFDMUQsR0FBRyxHQUFHLENBQUMsQ0FBRSxFQUFFLENBQUUsRUFBRSxHQUFHLEdBQUcsQ0FBQyxDQUFFLEVBQUUsQ0FBRSxFQUFFLEdBQUcsR0FBRyxDQUFDLENBQUUsRUFBRSxDQUFFLEVBQUUsR0FBRyxHQUFHLENBQUMsQ0FBRSxFQUFFLENBQUUsRUFDMUQsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsRUFBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxFQUN6RCxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxFQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEVBQ3pELEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEVBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsRUFDekQsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsRUFBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxFQUN6RCxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxFQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEVBQ3pELEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEVBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQztnQkFFNUQsT0FBTyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQzthQUM5RTs7O1dBQUE7UUFLRCxzQkFBVyw0QkFBTzs7OztpQkFBbEI7Z0JBQ0UsSUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQztnQkFDeEIsSUFDRSxHQUFHLEdBQUcsQ0FBQyxDQUFHLENBQUMsQ0FBRSxFQUFFLEdBQUcsR0FBRyxDQUFDLENBQUcsQ0FBQyxDQUFFLEVBQUUsR0FBRyxHQUFHLENBQUMsQ0FBRyxDQUFDLENBQUUsRUFBRSxHQUFHLEdBQUcsQ0FBQyxDQUFHLENBQUMsQ0FBRSxFQUMxRCxHQUFHLEdBQUcsQ0FBQyxDQUFHLENBQUMsQ0FBRSxFQUFFLEdBQUcsR0FBRyxDQUFDLENBQUcsQ0FBQyxDQUFFLEVBQUUsR0FBRyxHQUFHLENBQUMsQ0FBRyxDQUFDLENBQUUsRUFBRSxHQUFHLEdBQUcsQ0FBQyxDQUFHLENBQUMsQ0FBRSxFQUMxRCxHQUFHLEdBQUcsQ0FBQyxDQUFHLENBQUMsQ0FBRSxFQUFFLEdBQUcsR0FBRyxDQUFDLENBQUcsQ0FBQyxDQUFFLEVBQUUsR0FBRyxHQUFHLENBQUMsQ0FBRSxFQUFFLENBQUUsRUFBRSxHQUFHLEdBQUcsQ0FBQyxDQUFFLEVBQUUsQ0FBRSxFQUMxRCxHQUFHLEdBQUcsQ0FBQyxDQUFFLEVBQUUsQ0FBRSxFQUFFLEdBQUcsR0FBRyxDQUFDLENBQUUsRUFBRSxDQUFFLEVBQUUsR0FBRyxHQUFHLENBQUMsQ0FBRSxFQUFFLENBQUUsRUFBRSxHQUFHLEdBQUcsQ0FBQyxDQUFFLEVBQUUsQ0FBRSxFQUMxRCxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxFQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEVBQ3pELEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEVBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsRUFDekQsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsRUFBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxFQUN6RCxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxFQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEVBQ3pELEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEVBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsRUFDekQsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsRUFBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDO2dCQUU1RCxJQUFNLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQztnQkFFbEYsSUFBSyxHQUFHLEtBQUssR0FBRyxFQUFHO29CQUFFLE9BQU8sSUFBSSxDQUFDO2lCQUFFO2dCQUVuQyxJQUFNLE1BQU0sR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDO2dCQUV6QixPQUFPLElBQUksT0FBTyxDQUFFO29CQUNsQixHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUc7b0JBQ2pDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRztvQkFDakMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHO29CQUNqQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUc7b0JBQ2pDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRztvQkFDakMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHO29CQUNqQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUc7b0JBQ2pDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRztvQkFDakMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHO29CQUNqQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUc7b0JBQ2pDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRztvQkFDakMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHO29CQUNqQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUc7b0JBQ2pDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRztvQkFDakMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHO29CQUNqQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUc7aUJBQ2xDLENBQUMsR0FBRyxDQUFFLFVBQUUsQ0FBQyxJQUFNLE9BQUEs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QyxDQUFFLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLEVBQUUsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsRUFBRSxDQUFFLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRTtnQkFFdkUsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLEVBQUUsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUU7Z0JBQ3RFLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxFQUFFLENBQUUsR0FBRyxDQUFDLENBQUUsQ0FBQyxDQUFFO2dCQUN0RSxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLEVBQUUsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsRUFBRSxDQUFFLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRTtnQkFDdkUsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxFQUFFLENBQUUsR0FBRyxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLEVBQUUsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUU7Z0JBRXZFLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLEVBQUUsQ0FBRSxHQUFHLENBQUMsQ0FBRSxFQUFFLENBQUUsR0FBRyxDQUFDLENBQUUsRUFBRSxDQUFFO2dCQUN4RSxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxFQUFFLENBQUUsR0FBRyxDQUFDLENBQUUsRUFBRSxDQUFFLEdBQUcsQ0FBQyxDQUFFLEVBQUUsQ0FBRTtnQkFDeEUsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxFQUFFLENBQUUsR0FBRyxDQUFDLENBQUUsRUFBRSxDQUFFLEdBQUcsQ0FBQyxDQUFFLEVBQUUsQ0FBRSxHQUFHLENBQUMsQ0FBRSxFQUFFLENBQUU7Z0JBQ3pFLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsRUFBRSxDQUFFLEdBQUcsQ0FBQyxDQUFFLEVBQUUsQ0FBRSxHQUFHLENBQUMsQ0FBRSxFQUFFLENBQUUsR0FBRyxDQUFDLENBQUUsRUFBRSxDQUFFO2dCQUV6RSxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLEVBQUUsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsRUFBRSxDQUFFLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxFQUFFLENBQUUsR0FBRyxDQUFDLENBQUUsRUFBRSxDQUFFLEdBQUcsQ0FBQyxDQUFFLEVBQUUsQ0FBRTtnQkFDMUUsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxFQUFFLENBQUUsR0FBRyxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLEVBQUUsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsRUFBRSxDQUFFLEdBQUcsQ0FBQyxDQUFFLEVBQUUsQ0FBRSxHQUFHLENBQUMsQ0FBRSxFQUFFLENBQUU7Z0JBQzFFLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsRUFBRSxDQUFFLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxFQUFFLENBQUUsR0FBRyxDQUFDLENBQUUsRUFBRSxDQUFFLEdBQUcsQ0FBQyxDQUFFLEVBQUUsQ0FBRSxHQUFHLENBQUMsQ0FBRSxFQUFFLENBQUUsR0FBRyxDQUFDLENBQUUsRUFBRSxDQUFFO2dCQUMzRSxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLEVBQUUsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsRUFBRSxDQUFFLEdBQUcsQ0FBQyxDQUFFLEVBQUUsQ0FBRSxHQUFHLENBQUMsQ0FBRSxFQUFFLENBQUUsR0FBRyxDQUFDLENBQUUsRUFBRSxDQUFFLEdBQUcsQ0FBQyxDQUFFLEVBQUUsQ0FBRTthQUM1RSxDQUFFLENBQUM7U0FDTDs7OztRQUtNLDZCQUFXLEdBQWxCLFVBQW9CLE1BQWM7WUFDaEMsT0FBTyxJQUFJLE9BQU8sQ0FBRSxJQUFJLENBQUMsUUFBUSxD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QUFHO2dCQUNWLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO2FBQ2xCO1lBRUQsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxJQUFLLElBQUksQ0FBQyxJQUFJLElBQUksRUFBRSxDQUFFLENBQUM7WUFDNUMsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxJQUFLLElBQUksQ0FBQyxJQUFJLEtBQUssRUFBRSxDQUFFLENBQUM7WUFDN0MsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxJQUFLLElBQUksQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFFLENBQUM7WUFDM0MsT0FBTyxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBRSxHQUFHLEdBQUcsQ0FBQztTQUM1QztRQUVNLHNCQUFHLEdBQVYsVUFBWSxJQUFhO1lBQ3ZCLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxJQUFJLElBQUksQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDO1NBQ3BDO1FBQ0gsZUFBQztJQUFELENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OzsifQ==
