/*!
* @fms-cat/experimental v0.6.0
* Experimental edition of FMS_Cat
*
* Copyright (c) 2019-2020 FMS_Cat
* @fms-cat/experimental is distributed under MIT License
* https://github.com/FMS-Cat/experimental-npm/blob/master/LICENSE
*/
// yoinked from https://stackoverflow.com/questions/1344500/efficient-way-to-insert-a-number-into-a-sorted-array-of-numbers
function binarySearch(array, elementOrCompare) {
    if (typeof elementOrCompare !== 'function') {
        return binarySearch(array, (element) => (element < elementOrCompare));
    }
    const compare = elementOrCompare;
    let start = 0;
    let end = array.length;
    while (start < end) {
        const center = (start + end) >> 1;
        const centerElement = array[center];
        const compareResult = compare(centerElement);
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
const TRIANGLE_STRIP_QUAD = [-1, -1, 1, -1, -1, 1, 1, 1];
/**
 * `[ -1, -1, 0, 1, -1, 0, -1, 1, 0, 1, 1, 0 ]`
 */
const TRIANGLE_STRIP_QUAD_3D = [-1, -1, 0, 1, -1, 0, -1, 1, 0, 1, 1, 0];
/**
 * `[ 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1 ]`
 */
const TRIANGLE_STRIP_QUAD_NORMAL = [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1];
/**
 * `[ 0, 0, 1, 0, 0, 1, 1, 1 ]`
 */
const TRIANGLE_STRIP_QUAD_UV = [0, 0, 1, 0, 0, 1, 1, 1];

/**
 * Shuffle given `array` using given `dice` RNG. **Destructive**.
 */
function shuffleArray(array, dice) {
    const f = dice ? dice : () => Math.random();
    for (let i = 0; i < array.length - 1; i++) {
        const ir = i + Math.floor(f() * (array.length - i));
        const temp = array[ir];
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
    const ret = [];
    for (let i = 0; i < array.length / 3; i++) {
        const head = i * 3;
        ret.push(array[head], array[head + 1], array[head + 1], array[head + 2], array[head + 2], array[head]);
    }
    return ret;
}
/**
 * `matrix2d( 3, 2 )` -> `[ 0, 0, 0, 1, 0, 2, 1, 0, 1, 1, 1, 2 ]`
 */
function matrix2d(w, h) {
    const arr = [];
    for (let iy = 0; iy < h; iy++) {
        for (let ix = 0; ix < w; ix++) {
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
class CDS {
    constructor() {
        this.factor = 100.0;
        this.ratio = 1.0;
        this.velocity = 0.0;
        this.value = 0.0;
        this.target = 0.0;
    }
    update(deltaTime) {
        this.velocity += (-this.factor * (this.value - this.target)
            - 2.0 * this.velocity * Math.sqrt(this.factor) * this.ratio) * deltaTime;
        this.value += this.velocity * deltaTime;
        return this.value;
    }
}

/**
 * Class that deals with time.
 * In this base class, you need to set time manually from `Automaton.update()`.
 * Best for sync with external clock stuff.
 */
class Clock {
    constructor() {
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
    /**
     * Its current time.
     */
    get time() { return this.__time; }
    /**
     * Its deltaTime of last update.
     */
    get deltaTime() { return this.__deltaTime; }
    /**
     * Whether its currently playing or not.
     */
    get isPlaying() { return this.__isPlaying; }
    /**
     * Update the clock.
     * @param time Time. You need to set manually when you are using manual Clock
     */
    update(time) {
        const prevTime = this.__time;
        this.__time = time || 0.0;
        this.__deltaTime = this.__time - prevTime;
    }
    /**
     * Start the clock.
     */
    play() {
        this.__isPlaying = true;
    }
    /**
     * Stop the clock.
     */
    pause() {
        this.__isPlaying = false;
    }
    /**
     * Set the time manually.
     * @param time Time
     */
    setTime(time) {
        this.__time = time;
    }
}

/**
 * Class that deals with time.
 * This is "frame" type clock, the frame increases every {@link ClockFrame#update} call.
 * @param fps Frames per second
 */
class ClockFrame extends Clock {
    constructor(fps = 60) {
        super();
        /**
         * Its current frame.
         */
        this.__frame = 0;
        this.__fps = fps;
    }
    /**
     * Its current frame.
     */
    get frame() { return this.__frame; }
    /**
     * Its fps.
     */
    get fps() { return this.__fps; }
    /**
     * Update the clock. It will increase the frame by 1.
     */
    update() {
        if (this.__isPlaying) {
            this.__time = this.__frame / this.__fps;
            this.__deltaTime = 1.0 / this.__fps;
            this.__frame++;
        }
        else {
            this.__deltaTime = 0.0;
        }
    }
    /**
     * Set the time manually.
     * The set time will be converted into internal frame count, so the time will not be exactly same as set one.
     * @param time Time
     */
    setTime(time) {
        this.__frame = Math.floor(this.__fps * time);
        this.__time = this.__frame / this.__fps;
    }
}

/**
 * Class that deals with time.
 * This is "realtime" type clock, the time goes on as real world.
 */
class ClockRealtime extends Clock {
    constructor() {
        super(...arguments);
        /**
         * "You set the time manually to `__rtTime` when it's `__rtDate`."
         */
        this.__rtTime = 0.0;
        /**
         * "You set the time manually to `__rtTime` when it's `__rtDate`."
         */
        this.__rtDate = performance.now();
    }
    /**
     * The clock is realtime. yeah.
     */
    get isRealtime() { return true; }
    /**
     * Update the clock. Time is calculated based on time in real world.
     */
    update() {
        const now = performance.now();
        if (this.__isPlaying) {
            const prevTime = this.__time;
            const deltaDate = (now - this.__rtDate);
            this.__time = this.__rtTime + deltaDate / 1000.0;
            this.__deltaTime = this.time - prevTime;
        }
        else {
            this.__rtTime = this.time;
            this.__rtDate = now;
            this.__deltaTime = 0.0;
        }
    }
    /**
     * Set the time manually.
     * @param time Time
     */
    setTime(time) {
        this.__time = time;
        this.__rtTime = this.time;
        this.__rtDate = performance.now();
    }
}

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
    let k = 0;
    // locations of parabolas in lower envelope
    const v = new Float32Array(length);
    v[0] = 0.0;
    // locations of boundaries between parabolas
    const z = new Float32Array(length + 1);
    z[0] = -Infinity;
    z[1] = Infinity;
    // create a straight array of input data
    const f = new Float32Array(length);
    for (let q = 0; q < length; q++) {
        f[q] = data[offset + q * stride];
    }
    // compute lower envelope
    for (let q = 1; q < length; q++) {
        let s = 0.0;
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
    for (let q = 0; q < length; q++) {
        while (z[k + 1] < q) {
            k++;
        }
        const qSubVK = q - v[k];
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
    for (let x = 0; x < width; x++) {
        edt1d(data, x, width, height);
    }
    for (let y = 0; y < height; y++) {
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
    const t = linearstep(a, b, x);
    return t * t * (3.0 - 2.0 * t);
}
/**
 * `smoothstep` but more smooth
 */
function smootherstep(a, b, x) {
    const t = linearstep(a, b, x);
    return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
}
/**
 * `smoothstep` but WAY more smooth
 */
function smootheststep(a, b, x) {
    const t = linearstep(a, b, x);
    return t * t * t * t * (t * (t * (-20.0 * t + 70.0) - 84.0) + 35.0);
}

/**
 * Do exp smoothing
 */
class ExpSmooth {
    constructor() {
        this.factor = 10.0;
        this.target = 0.0;
        this.value = 0.0;
    }
    update(deltaTime) {
        this.value = lerp(this.target, this.value, Math.exp(-this.factor * deltaTime));
        return this.value;
    }
}

/**
 * Iterable FizzBuzz
 */
class FizzBuzz {
    constructor(words = FizzBuzz.WordsDefault, index = 1, end = 100) {
        this.__words = words;
        this.__index = index;
        this.__end = end;
    }
    [Symbol.iterator]() {
        return this;
    }
    next() {
        if (this.__end < this.__index) {
            return { done: true, value: null };
        }
        let value = '';
        for (const [rem, word] of this.__words) {
            if ((this.__index % rem) === 0) {
                value += word;
            }
        }
        if (value === '') {
            value = this.__index;
        }
        this.__index++;
        return { done: false, value };
    }
}
FizzBuzz.WordsDefault = new Map([
    [3, 'Fizz'],
    [5, 'Buzz']
]);

/**
 * Most awesome cat ever
 */
class FMS_Cat {
}
/**
 * FMS_Cat.gif
 */
FMS_Cat.gif = 'https://fms-cat.com/images/fms_cat.gif';
/**
 * FMS_Cat.png
 */
FMS_Cat.png = 'https://fms-cat.com/images/fms_cat.png';

/**
 * Useful for tap tempo
 * See also: {@link HistoryMeanCalculator}
 */
class HistoryMeanCalculator {
    constructor(length) {
        this.__recalcForEach = 0;
        this.__countUntilRecalc = 0;
        this.__history = [];
        this.__index = 0;
        this.__count = 0;
        this.__cache = 0;
        this.__length = length;
        this.__recalcForEach = length;
        for (let i = 0; i < length; i++) {
            this.__history[i] = 0;
        }
    }
    get mean() {
        const count = Math.min(this.__count, this.__length);
        return count === 0 ? 0.0 : this.__cache / count;
    }
    get recalcForEach() {
        return this.__recalcForEach;
    }
    set recalcForEach(value) {
        const delta = value - this.__recalcForEach;
        this.__recalcForEach = value;
        this.__countUntilRecalc = Math.max(0, this.__countUntilRecalc + delta);
    }
    reset() {
        this.__index = 0;
        this.__count = 0;
        this.__cache = 0;
        this.__countUntilRecalc = 0;
        for (let i = 0; i < this.__length; i++) {
            this.__history[i] = 0;
        }
    }
    push(value) {
        const prev = this.__history[this.__index];
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
    }
    recalc() {
        this.__countUntilRecalc = this.__recalcForEach;
        const sum = this.__history
            .slice(0, Math.min(this.__count, this.__length))
            .reduce((sum, v) => sum + v, 0);
        this.__cache = sum;
    }
}

/**
 * Useful for fps calc
 * See also: {@link HistoryMeanCalculator}
 */
class HistoryPercentileCalculator {
    constructor(length) {
        this.__history = [];
        this.__sorted = [];
        this.__index = 0;
        this.__length = length;
    }
    get median() {
        return this.percentile(50.0);
    }
    percentile(percentile) {
        if (this.__history.length === 0) {
            return 0.0;
        }
        return this.__sorted[Math.round(percentile * 0.01 * (this.__history.length - 1))];
    }
    reset() {
        this.__index = 0;
        this.__history = [];
        this.__sorted = [];
    }
    push(value) {
        const prev = this.__history[this.__index];
        this.__history[this.__index] = value;
        this.__index = (this.__index + 1) % this.__length;
        // remove the prev from sorted array
        if (this.__sorted.length === this.__length) {
            const prevIndex = binarySearch(this.__sorted, prev);
            this.__sorted.splice(prevIndex, 1);
        }
        const index = binarySearch(this.__sorted, value);
        this.__sorted.splice(index, 0, value);
    }
}

/**
 * @deprecated It's actually just a special case of {@link HistoryPercentileCalculator}
 */
class HistoryMedianCalculator extends HistoryPercentileCalculator {
    constructor(length) {
        super(length);
        console.warn('HistoryMedianCalculator: Deprecated. Use HistoryPercentileCalculator instead');
    }
}

/**
 * A Vector.
 */
class Vector {
    /**
     * The length of this.
     * a.k.a. `magnitude`
     */
    get length() {
        return Math.sqrt(this.elements.reduce((sum, v) => sum + v * v, 0.0));
    }
    /**
     * A normalized Vector3 of this.
     */
    get normalized() {
        return this.scale(1.0 / this.length);
    }
    /**
     * Clone this.
     */
    clone() {
        return this.__new(this.elements.concat());
    }
    /**
     * Add a Vector into this.
     * @param vector Another Vector
     */
    add(vector) {
        return this.__new(this.elements.map((v, i) => v + vector.elements[i]));
    }
    /**
     * Substract this from another Vector.
     * @param v Another vector
     */
    sub(vector) {
        return this.__new(this.elements.map((v, i) => v - vector.elements[i]));
    }
    /**
     * Multiply a Vector with this.
     * @param vector Another Vector
     */
    multiply(vector) {
        return this.__new(this.elements.map((v, i) => v * vector.elements[i]));
    }
    /**
     * Divide this from another Vector.
     * @param vector Another Vector
     */
    divide(vector) {
        return this.__new(this.elements.map((v, i) => v / vector.elements[i]));
    }
    /**
     * Scale this by scalar.
     * a.k.a. `multiplyScalar`
     * @param scalar A scalar
     */
    scale(scalar) {
        return this.__new(this.elements.map((v) => v * scalar));
    }
    /**
     * Dot two Vectors.
     * @param vector Another vector
     */
    dot(vector) {
        return this.elements.reduce((sum, v, i) => sum + v * vector.elements[i], 0.0);
    }
}

/**
 * A Vector3.
 */
class Vector3 extends Vector {
    constructor(v = [0.0, 0.0, 0.0]) {
        super();
        this.elements = v;
    }
    /**
     * An x component of this.
     */
    get x() {
        return this.elements[0];
    }
    set x(x) {
        this.elements[0] = x;
    }
    /**
     * An y component of this.
     */
    get y() {
        return this.elements[1];
    }
    set y(y) {
        this.elements[1] = y;
    }
    /**
     * An z component of this.
     */
    get z() {
        return this.elements[2];
    }
    set z(z) {
        this.elements[2] = z;
    }
    toString() {
        return `Vector3( ${this.x.toFixed(3)}, ${this.y.toFixed(3)}, ${this.z.toFixed(3)} )`;
    }
    /**
     * Return a cross of this and another Vector3.
     * @param vector Another vector
     */
    cross(vector) {
        return new Vector3([
            this.y * vector.z - this.z * vector.y,
            this.z * vector.x - this.x * vector.z,
            this.x * vector.y - this.y * vector.x
        ]);
    }
    /**
     * Rotate this vector using a Quaternion.
     * @param quaternion A quaternion
     */
    applyQuaternion(quaternion) {
        const p = new Quaternion([this.x, this.y, this.z, 0.0]);
        const r = quaternion.inversed;
        const res = quaternion.multiply(p).multiply(r);
        return new Vector3([res.x, res.y, res.z]);
    }
    /**
     * Multiply this vector (with an implicit 1 in the 4th dimension) by m.
     */
    applyMatrix4(matrix) {
        const m = matrix.elements;
        const w = m[3] * this.x + m[7] * this.y + m[11] * this.z + m[15];
        const invW = 1.0 / w;
        return new Vector3([
            (m[0] * this.x + m[4] * this.y + m[8] * this.z + m[12]) * invW,
            (m[1] * this.x + m[5] * this.y + m[9] * this.z + m[13]) * invW,
            (m[2] * this.x + m[6] * this.y + m[10] * this.z + m[14]) * invW
        ]);
    }
    __new(v) {
        return new Vector3(v);
    }
    /**
     * Vector3( 0.0, 0.0, 0.0 )
     */
    static get zero() {
        return new Vector3([0.0, 0.0, 0.0]);
    }
    /**
     * Vector3( 1.0, 1.0, 1.0 )
     */
    static get one() {
        return new Vector3([1.0, 1.0, 1.0]);
    }
}

const rawIdentityQuaternion = [0.0, 0.0, 0.0, 1.0];
/**
 * A Quaternion.
 */
class Quaternion {
    constructor(elements = rawIdentityQuaternion) {
        this.elements = elements;
    }
    /**
     * An x component of this.
     */
    get x() {
        return this.elements[0];
    }
    /**
     * An y component of this.
     */
    get y() {
        return this.elements[1];
    }
    /**
     * An z component of this.
     */
    get z() {
        return this.elements[2];
    }
    /**
     * An w component of this.
     */
    get w() {
        return this.elements[3];
    }
    toString() {
        return `Quaternion( ${this.x.toFixed(3)}, ${this.y.toFixed(3)}, ${this.z.toFixed(3)}, ${this.w.toFixed(3)} )`;
    }
    /**
     * Clone this.
     */
    clone() {
        return new Quaternion(this.elements.concat());
    }
    /**
     * Itself but converted into a Matrix4.
     */
    get matrix() {
        const x = new Vector3([1.0, 0.0, 0.0]).applyQuaternion(this);
        const y = new Vector3([0.0, 1.0, 0.0]).applyQuaternion(this);
        const z = new Vector3([0.0, 0.0, 1.0]).applyQuaternion(this);
        return new Matrix4([
            x.x, y.x, z.x, 0.0,
            x.y, y.y, z.y, 0.0,
            x.z, y.z, z.z, 0.0,
            0.0, 0.0, 0.0, 1.0
        ]);
    }
    /**
     * An inverse of this.
     */
    get inversed() {
        return new Quaternion([
            -this.x,
            -this.y,
            -this.z,
            this.w
        ]);
    }
    /**
     * Multiply two Quaternions.
     * @param q Another Quaternion
     */
    multiply(q) {
        return new Quaternion([
            this.w * q.x + this.x * q.w + this.y * q.z - this.z * q.y,
            this.w * q.y - this.x * q.z + this.y * q.w + this.z * q.x,
            this.w * q.z + this.x * q.y - this.y * q.x + this.z * q.w,
            this.w * q.w - this.x * q.x - this.y * q.y - this.z * q.z
        ]);
    }
    /**
     * An identity Quaternion.
     */
    static get identity() {
        return new Quaternion(rawIdentityQuaternion);
    }
    /**
     * Generate a Quaternion out of angle and axis.
     */
    static fromAxisAngle(axis, angle) {
        const halfAngle = angle / 2.0;
        const sinHalfAngle = Math.sin(halfAngle);
        return new Quaternion([
            axis.x * sinHalfAngle,
            axis.y * sinHalfAngle,
            axis.z * sinHalfAngle,
            Math.cos(halfAngle)
        ]);
    }
    /**
     * Generate a Quaternion out of a rotation matrix.
     * Yoinked from Three.js.
     */
    static fromMatrix(matrix) {
        const m = matrix.elements, m11 = m[0], m12 = m[4], m13 = m[8], m21 = m[1], m22 = m[5], m23 = m[9], m31 = m[2], m32 = m[6], m33 = m[10], trace = m11 + m22 + m33;
        if (trace > 0) {
            const s = 0.5 / Math.sqrt(trace + 1.0);
            return new Quaternion([
                (m32 - m23) * s,
                (m13 - m31) * s,
                (m21 - m12) * s,
                0.25 / s
            ]);
        }
        else if (m11 > m22 && m11 > m33) {
            const s = 2.0 * Math.sqrt(1.0 + m11 - m22 - m33);
            return new Quaternion([
                0.25 * s,
                (m12 + m21) / s,
                (m13 + m31) / s,
                (m32 - m23) / s
            ]);
        }
        else if (m22 > m33) {
            const s = 2.0 * Math.sqrt(1.0 + m22 - m11 - m33);
            return new Quaternion([
                (m12 + m21) / s,
                0.25 * s,
                (m23 + m32) / s,
                (m13 - m31) / s
            ]);
        }
        else {
            const s = 2.0 * Math.sqrt(1.0 + m33 - m11 - m22);
            return new Quaternion([
                (m13 + m31) / s,
                (m23 + m32) / s,
                0.25 * s,
                (m21 - m12) / s
            ]);
        }
    }
}

const rawIdentityMatrix4 = [
    1.0, 0.0, 0.0, 0.0,
    0.0, 1.0, 0.0, 0.0,
    0.0, 0.0, 1.0, 0.0,
    0.0, 0.0, 0.0, 1.0
];
/**
 * A Matrix4.
 */
class Matrix4 {
    constructor(v = rawIdentityMatrix4) {
        this.elements = v;
    }
    /**
     * Itself but transposed.
     */
    get transpose() {
        const m = this.elements;
        return new Matrix4([
            m[0], m[4], m[8], m[12],
            m[1], m[5], m[9], m[13],
            m[2], m[6], m[10], m[14],
            m[3], m[7], m[11], m[15]
        ]);
    }
    /**
     * Its determinant.
     */
    get determinant() {
        const m = this.elements;
        const a00 = m[0], a01 = m[1], a02 = m[2], a03 = m[3], a10 = m[4], a11 = m[5], a12 = m[6], a13 = m[7], a20 = m[8], a21 = m[9], a22 = m[10], a23 = m[11], a30 = m[12], a31 = m[13], a32 = m[14], a33 = m[15], b00 = a00 * a11 - a01 * a10, b01 = a00 * a12 - a02 * a10, b02 = a00 * a13 - a03 * a10, b03 = a01 * a12 - a02 * a11, b04 = a01 * a13 - a03 * a11, b05 = a02 * a13 - a03 * a12, b06 = a20 * a31 - a21 * a30, b07 = a20 * a32 - a22 * a30, b08 = a20 * a33 - a23 * a30, b09 = a21 * a32 - a22 * a31, b10 = a21 * a33 - a23 * a31, b11 = a22 * a33 - a23 * a32;
        return b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
    }
    /**
     * Itself but inverted.
     */
    get inverse() {
        const m = this.elements;
        const a00 = m[0], a01 = m[1], a02 = m[2], a03 = m[3], a10 = m[4], a11 = m[5], a12 = m[6], a13 = m[7], a20 = m[8], a21 = m[9], a22 = m[10], a23 = m[11], a30 = m[12], a31 = m[13], a32 = m[14], a33 = m[15], b00 = a00 * a11 - a01 * a10, b01 = a00 * a12 - a02 * a10, b02 = a00 * a13 - a03 * a10, b03 = a01 * a12 - a02 * a11, b04 = a01 * a13 - a03 * a11, b05 = a02 * a13 - a03 * a12, b06 = a20 * a31 - a21 * a30, b07 = a20 * a32 - a22 * a30, b08 = a20 * a33 - a23 * a30, b09 = a21 * a32 - a22 * a31, b10 = a21 * a33 - a23 * a31, b11 = a22 * a33 - a23 * a32;
        const det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
        if (det === 0.0) {
            return null;
        }
        const invDet = 1.0 / det;
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
        ].map((v) => v * invDet));
    }
    toString() {
        const m = this.elements.map((v) => v.toFixed(3));
        return `Matrix4( ${m[0]}, ${m[4]}, ${m[8]}, ${m[12]}; ${m[1]}, ${m[5]}, ${m[9]}, ${m[13]}; ${m[2]}, ${m[6]}, ${m[10]}, ${m[14]}; ${m[3]}, ${m[7]}, ${m[11]}, ${m[15]} )`;
    }
    /**
     * Clone this.
     */
    clone() {
        return new Matrix4(this.elements.concat());
    }
    /**
     * Multiply this Matrix4 by one or more Matrix4s.
     */
    multiply(...matrices) {
        if (matrices.length === 0) {
            return this.clone();
        }
        const arr = matrices.concat();
        let bMat = arr.shift();
        if (0 < arr.length) {
            bMat = bMat.multiply(...arr);
        }
        const a = this.elements;
        const b = bMat.elements;
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
    }
    /**
     * Multiply this Matrix4 by a scalar
     */
    scaleScalar(scalar) {
        return new Matrix4(this.elements.map((v) => v * scalar));
    }
    /**
     * An identity Matrix4.
     */
    static get identity() {
        return new Matrix4(rawIdentityMatrix4);
    }
    static multiply(...matrices) {
        if (matrices.length === 0) {
            return Matrix4.identity;
        }
        else {
            const bMats = matrices.concat();
            const aMat = bMats.shift();
            return aMat.multiply(...bMats);
        }
    }
    /**
     * Generate a translation matrix.
     * @param vector Translation
     */
    static translate(vector) {
        return new Matrix4([
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            vector.x, vector.y, vector.z, 1
        ]);
    }
    /**
     * Generate a 3d scaling matrix.
     * @param vector Scale
     */
    static scale(vector) {
        return new Matrix4([
            vector.x, 0, 0, 0,
            0, vector.y, 0, 0,
            0, 0, vector.z, 0,
            0, 0, 0, 1
        ]);
    }
    /**
     * Generate a 3d scaling matrix by a scalar.
     * @param vector Scale
     */
    static scaleScalar(scalar) {
        return new Matrix4([
            scalar, 0, 0, 0,
            0, scalar, 0, 0,
            0, 0, scalar, 0,
            0, 0, 0, 1
        ]);
    }
    /**
     * Generate a 3d rotation matrix, rotates around x axis.
     * @param vector Scale
     */
    static rotateX(theta) {
        return new Matrix4([
            1, 0, 0, 0,
            0, Math.cos(theta), -Math.sin(theta), 0,
            0, Math.sin(theta), Math.cos(theta), 0,
            0, 0, 0, 1
        ]);
    }
    /**
     * Generate a 3d rotation matrix, rotates around y axis.
     * @param vector Scale
     */
    static rotateY(theta) {
        return new Matrix4([
            Math.cos(theta), 0, Math.sin(theta), 0,
            0, 1, 0, 0,
            -Math.sin(theta), 0, Math.cos(theta), 0,
            0, 0, 0, 1
        ]);
    }
    /**
     * Generate a 3d rotation matrix, rotates around z axis.
     * @param vector Scale
     */
    static rotateZ(theta) {
        return new Matrix4([
            Math.cos(theta), -Math.sin(theta), 0, 0,
            Math.sin(theta), Math.cos(theta), 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ]);
    }
    /**
     * Generate a "LookAt" matrix.
     *
     * See also: {@link lookAtInverse}
     */
    static lookAt(position, target = new Vector3([0.0, 0.0, 0.0]), up = new Vector3([0.0, 1.0, 0.0]), roll = 0.0) {
        const dir = position.sub(target).normalized;
        let sid = up.cross(dir).normalized;
        let top = dir.cross(sid);
        sid = sid.scale(Math.cos(roll)).add(top.scale(Math.sin(roll)));
        top = dir.cross(sid);
        return new Matrix4([
            sid.x, sid.y, sid.z, 0.0,
            top.x, top.y, top.z, 0.0,
            dir.x, dir.y, dir.z, 0.0,
            position.x, position.y, position.z, 1.0
        ]);
    }
    /**
     * Generate an inverse of "LookAt" matrix. Good for creating a view matrix.
     *
     * See also: {@link lookAt}
     */
    static lookAtInverse(position, target = new Vector3([0.0, 0.0, 0.0]), up = new Vector3([0.0, 1.0, 0.0]), roll = 0.0) {
        const dir = position.sub(target).normalized;
        let sid = up.cross(dir).normalized;
        let top = dir.cross(sid);
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
    }
    /**
     * Generate a "Perspective" projection matrix.
     * It won't include aspect!
     */
    static perspective(fov = 45.0, near = 0.01, far = 100.0) {
        const p = 1.0 / Math.tan(fov * Math.PI / 360.0);
        const d = (far - near);
        return new Matrix4([
            p, 0.0, 0.0, 0.0,
            0.0, p, 0.0, 0.0,
            0.0, 0.0, -(far + near) / d, -1.0,
            0.0, 0.0, -2 * far * near / d, 0.0
        ]);
    }
    /**
     * Decompose this matrix into a position, a scale, and a rotation.
     * Yoinked from Three.js.
     */
    decompose() {
        const m = this.elements;
        let sx = new Vector3([m[0], m[1], m[2]]).length;
        const sy = new Vector3([m[4], m[5], m[6]]).length;
        const sz = new Vector3([m[8], m[9], m[10]]).length;
        // if determine is negative, we need to invert one scale
        const det = this.determinant;
        if (det < 0) {
            sx = -sx;
        }
        const invSx = 1.0 / sx;
        const invSy = 1.0 / sy;
        const invSz = 1.0 / sz;
        const rotationMatrix = this.clone();
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
    }
    /**
     * Compose a matrix out of position, scale, and rotation.
     * Yoinked from Three.js.
     */
    static compose(position, rotation, scale) {
        const x = rotation.x, y = rotation.y, z = rotation.z, w = rotation.w;
        const x2 = x + x, y2 = y + y, z2 = z + z;
        const xx = x * x2, xy = x * y2, xz = x * z2;
        const yy = y * y2, yz = y * z2, zz = z * z2;
        const wx = w * x2, wy = w * y2, wz = w * z2;
        const sx = scale.x, sy = scale.y, sz = scale.z;
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
    }
}

/**
 * A Vector3.
 */
class Vector4 extends Vector {
    constructor(v = [0.0, 0.0, 0.0, 0.0]) {
        super();
        this.elements = v;
    }
    /**
     * An x component of this.
     */
    get x() {
        return this.elements[0];
    }
    set x(x) {
        this.elements[0] = x;
    }
    /**
     * A y component of this.
     */
    get y() {
        return this.elements[1];
    }
    set y(y) {
        this.elements[1] = y;
    }
    /**
     * A z component of this.
     */
    get z() {
        return this.elements[2];
    }
    set z(z) {
        this.elements[2] = z;
    }
    /**
     * A w component of this.
     */
    get w() {
        return this.elements[3];
    }
    set w(z) {
        this.elements[3] = z;
    }
    toString() {
        return `Vector4( ${this.x.toFixed(3)}, ${this.y.toFixed(3)}, ${this.z.toFixed(3)}, ${this.w.toFixed(3)} )`;
    }
    /**
     * Multiply this vector (with an implicit 1 in the 4th dimension) by m.
     */
    applyMatrix4(matrix) {
        const m = matrix.elements;
        return new Vector4([
            m[0] * this.x + m[4] * this.y + m[8] * this.z + m[12] * this.w,
            m[1] * this.x + m[5] * this.y + m[9] * this.z + m[13] * this.w,
            m[2] * this.x + m[6] * this.y + m[10] * this.z + m[14] * this.w,
            m[3] * this.x + m[7] * this.y + m[11] * this.z + m[15] * this.w
        ]);
    }
    __new(v) {
        return new Vector4(v);
    }
    /**
     * Vector4( 0.0, 0.0, 0.0, 0.0 )
     */
    static get zero() {
        return new Vector4([0.0, 0.0, 0.0, 0.0]);
    }
    /**
     * Vector4( 1.0, 1.0, 1.0, 1.0 )
     */
    static get one() {
        return new Vector4([1.0, 1.0, 1.0, 1.0]);
    }
}

/**
 * Useful for swap buffer
 */
class Swap {
    constructor(a, b) {
        this.i = a;
        this.o = b;
    }
    swap() {
        const i = this.i;
        this.i = this.o;
        this.o = i;
    }
}

class TapTempo {
    constructor() {
        this.__bpm = 0.0;
        this.__lastTap = 0.0;
        this.__lastBeat = 0.0;
        this.__lastTime = 0.0;
        this.__calc = new HistoryMeanCalculator(16);
    }
    get beatDuration() {
        return 60.0 / this.__bpm;
    }
    get bpm() {
        return this.__bpm;
    }
    set bpm(bpm) {
        this.__lastBeat = this.beat;
        this.__lastTime = performance.now();
        this.__bpm = bpm;
    }
    get beat() {
        return this.__lastBeat + (performance.now() - this.__lastTime) * 0.001 / this.beatDuration;
    }
    reset() {
        this.__calc.reset();
    }
    nudge(amount) {
        this.__lastBeat = this.beat + amount;
        this.__lastTime = performance.now();
    }
    tap() {
        const now = performance.now();
        const delta = (now - this.__lastTap) * 0.001;
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
    }
}

class Xorshift {
    constructor(seed) {
        this.seed = seed || 1;
    }
    gen(seed) {
        if (seed) {
            this.seed = seed;
        }
        this.seed = this.seed ^ (this.seed << 13);
        this.seed = this.seed ^ (this.seed >>> 17);
        this.seed = this.seed ^ (this.seed << 5);
        return this.seed / Math.pow(2, 32) + 0.5;
    }
    set(seed) {
        this.seed = seed || this.seed || 1;
    }
}

export { CDS, Clock, ClockFrame, ClockRealtime, ExpSmooth, FMS_Cat, FizzBuzz, HistoryMeanCalculator, HistoryMedianCalculator, HistoryPercentileCalculator, Matrix4, Quaternion, Swap, TRIANGLE_STRIP_QUAD, TRIANGLE_STRIP_QUAD_3D, TRIANGLE_STRIP_QUAD_NORMAL, TRIANGLE_STRIP_QUAD_UV, TapTempo, Vector, Vector3, Vector4, Xorshift, binarySearch, clamp, edt1d, edt2d, lerp, linearstep, matrix2d, range, rawIdentityMatrix4, rawIdentityQuaternion, saturate, shuffleArray, smootherstep, smootheststep, smoothstep, triIndexToLineIndex };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm1zLWNhdC1leHBlcmltZW50YWwubW9kdWxlLmpzIiwic291cmNlcyI6WyIuLi9zcmMvYWxnb3JpdGhtL2JpbmFyeVNlYXJjaC50cyIsIi4uL3NyYy9hcnJheS9jb25zdGFudHMudHMiLCIuLi9zcmMvYXJyYXkvdXRpbHMudHMiLCIuLi9zcmMvQ0RTL0NEUy50cyIsIi4uL3NyYy9DbG9jay9DbG9jay50cyIsIi4uL3NyYy9DbG9jay9DbG9ja0ZyYW1lLnRzIiwiLi4vc3JjL0Nsb2NrL0Nsb2NrUmVhbHRpbWUudHMiLCIuLi9zcmMvZWR0L2VkdC50cyIsIi4uL3NyYy9tYXRoL3V0aWxzLnRzIiwiLi4vc3JjL0V4cFNtb290aC9FeHBTbW9vdGgudHMiLCIuLi9zcmMvRml6ekJ1enovRml6ekJ1enoudHMiLCIuLi9zcmMvRk1TX0NhdC9GTVNfQ2F0LnRzIiwiLi4vc3JjL0hpc3RvcnlNZWFuQ2FsY3VsYXRvci9IaXN0b3J5TWVhbkNhbGN1bGF0b3IudHMiLCIuLi9zcmMvSGlzdG9yeU1lYW5DYWxjdWxhdG9yL0hpc3RvcnlQZXJjZW50aWxlQ2FsY3VsYXRvci50cyIsIi4uL3NyYy9IaXN0b3J5TWVhbkNhbGN1bGF0b3IvSGlzdG9yeU1lZGlhbkNhbGN1bGF0b3IudHMiLCIuLi9zcmMvbWF0aC9WZWN0b3IudHMiLCIuLi9zcmMvbWF0aC9WZWN0b3IzLnRzIiwiLi4vc3JjL21hdGgvUXVhdGVybmlvbi50cyIsIi4uL3NyYy9tYXRoL01hdHJpeDQudHMiLCIuLi9zcmMvbWF0aC9WZWN0b3I0LnRzIiwiLi4vc3JjL1N3YXAvU3dhcC50cyIsIi4uL3NyYy9UYXBUZW1wby9UYXBUZW1wby50cyIsIi4uL3NyYy9Yb3JzaGlmdC9Yb3JzaGlmdC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyB5b2lua2VkIGZyb20gaHR0cHM6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMTM0NDUwMC9lZmZpY2llbnQtd2F5LXRvLWluc2VydC1hLW51bWJlci1pbnRvLWEtc29ydGVkLWFycmF5LW9mLW51bWJlcnNcblxuLyoqXG4gKiBMb29rIGZvciBhbiBpbmRleCBmcm9tIGEgc29ydGVkIGxpc3QgdXNpbmcgYmluYXJ5IHNlYXJjaC5cbiAqXG4gKiBJZiB5b3UgZG9uJ3QgcHJvdmlkZSBhIGNvbXBhcmUgZnVuY3Rpb24sIGl0IHdpbGwgbG9vayBmb3IgKip0aGUgZmlyc3Qgc2FtZSB2YWx1ZSoqIGl0IGNhbiBmaW5kLlxuICogSWYgaXQgY2Fubm90IGZpbmQgYW4gZXhhY3RseSBtYXRjaGluZyB2YWx1ZSwgaXQgY2FuIHJldHVybiBOIHdoZXJlIHRoZSBsZW5ndGggb2YgZ2l2ZW4gYXJyYXkgaXMgTi5cbiAqXG4gKiBAcGFyYW0gYXJyYXkgQSBzb3J0ZWQgYXJyYXlcbiAqIEBwYXJhbSBjb21wYXJlIE1ha2UgdGhpcyBmdW5jdGlvbiByZXR1cm4gYGZhbHNlYCBpZiB5b3Ugd2FudCB0byBwb2ludCByaWdodCBzaWRlIG9mIGdpdmVuIGVsZW1lbnQsIGB0cnVlYCBpZiB5b3Ugd2FudCB0byBwb2ludCBsZWZ0IHNpZGUgb2YgZ2l2ZW4gZWxlbWVudC5cbiAqIEByZXR1cm5zIEFuIGluZGV4IGZvdW5kXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBiaW5hcnlTZWFyY2g8VD4oIGFycmF5OiBBcnJheUxpa2U8VD4sIGVsZW1lbnQ6IFQgKTogbnVtYmVyO1xuZXhwb3J0IGZ1bmN0aW9uIGJpbmFyeVNlYXJjaDxUPiggYXJyYXk6IEFycmF5TGlrZTxUPiwgY29tcGFyZTogKCBlbGVtZW50OiBUICkgPT4gYm9vbGVhbiApOiBudW1iZXI7XG5leHBvcnQgZnVuY3Rpb24gYmluYXJ5U2VhcmNoPFQ+KFxuICBhcnJheTogQXJyYXlMaWtlPFQ+LFxuICBlbGVtZW50T3JDb21wYXJlOiBUIHwgKCAoIGVsZW1lbnQ6IFQgKSA9PiBib29sZWFuICksXG4pOiBudW1iZXIge1xuICBpZiAoIHR5cGVvZiBlbGVtZW50T3JDb21wYXJlICE9PSAnZnVuY3Rpb24nICkge1xuICAgIHJldHVybiBiaW5hcnlTZWFyY2goIGFycmF5LCAoIGVsZW1lbnQgKSA9PiAoIGVsZW1lbnQgPCBlbGVtZW50T3JDb21wYXJlICkgKTtcbiAgfVxuICBjb25zdCBjb21wYXJlID0gZWxlbWVudE9yQ29tcGFyZSBhcyAoIGVsZW1lbnQ6IFQgKSA9PiBib29sZWFuO1xuXG4gIGxldCBzdGFydCA9IDA7XG4gIGxldCBlbmQgPSBhcnJheS5sZW5ndGg7XG5cbiAgd2hpbGUgKCBzdGFydCA8IGVuZCApIHtcbiAgICBjb25zdCBjZW50ZXIgPSAoIHN0YXJ0ICsgZW5kICkgPj4gMTtcbiAgICBjb25zdCBjZW50ZXJFbGVtZW50ID0gYXJyYXlbIGNlbnRlciBdO1xuXG4gICAgY29uc3QgY29tcGFyZVJlc3VsdCA9IGNvbXBhcmUoIGNlbnRlckVsZW1lbnQgKTtcblxuICAgIGlmICggY29tcGFyZVJlc3VsdCApIHtcbiAgICAgIHN0YXJ0ID0gY2VudGVyICsgMTtcbiAgICB9IGVsc2Uge1xuICAgICAgZW5kID0gY2VudGVyO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBzdGFydDtcbn1cbiIsIi8qKlxuICogYFsgLTEsIC0xLCAxLCAtMSwgLTEsIDEsIDEsIDEgXWBcbiAqL1xuZXhwb3J0IGNvbnN0IFRSSUFOR0xFX1NUUklQX1FVQUQgPSBbIC0xLCAtMSwgMSwgLTEsIC0xLCAxLCAxLCAxIF07XG5cbi8qKlxuICogYFsgLTEsIC0xLCAwLCAxLCAtMSwgMCwgLTEsIDEsIDAsIDEsIDEsIDAgXWBcbiAqL1xuZXhwb3J0IGNvbnN0IFRSSUFOR0xFX1NUUklQX1FVQURfM0QgPSBbIC0xLCAtMSwgMCwgMSwgLTEsIDAsIC0xLCAxLCAwLCAxLCAxLCAwIF07XG5cbi8qKlxuICogYFsgMCwgMCwgMSwgMCwgMCwgMSwgMCwgMCwgMSwgMCwgMCwgMSBdYFxuICovXG5leHBvcnQgY29uc3QgVFJJQU5HTEVfU1RSSVBfUVVBRF9OT1JNQUwgPSBbIDAsIDAsIDEsIDAsIDAsIDEsIDAsIDAsIDEsIDAsIDAsIDEgXTtcblxuLyoqXG4gKiBgWyAwLCAwLCAxLCAwLCAwLCAxLCAxLCAxIF1gXG4gKi9cbmV4cG9ydCBjb25zdCBUUklBTkdMRV9TVFJJUF9RVUFEX1VWID0gWyAwLCAwLCAxLCAwLCAwLCAxLCAxLCAxIF07XG4iLCIvKipcbiAqIFNodWZmbGUgZ2l2ZW4gYGFycmF5YCB1c2luZyBnaXZlbiBgZGljZWAgUk5HLiAqKkRlc3RydWN0aXZlKiouXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzaHVmZmxlQXJyYXk8VD4oIGFycmF5OiBUW10sIGRpY2U/OiAoKSA9PiBudW1iZXIgKTogVFtdIHtcbiAgY29uc3QgZiA9IGRpY2UgPyBkaWNlIDogKCkgPT4gTWF0aC5yYW5kb20oKTtcbiAgZm9yICggbGV0IGkgPSAwOyBpIDwgYXJyYXkubGVuZ3RoIC0gMTsgaSArKyApIHtcbiAgICBjb25zdCBpciA9IGkgKyBNYXRoLmZsb29yKCBmKCkgKiAoIGFycmF5Lmxlbmd0aCAtIGkgKSApO1xuICAgIGNvbnN0IHRlbXAgPSBhcnJheVsgaXIgXTtcbiAgICBhcnJheVsgaXIgXSA9IGFycmF5WyBpIF07XG4gICAgYXJyYXlbIGkgXSA9IHRlbXA7XG4gIH1cbiAgcmV0dXJuIGFycmF5O1xufVxuXG4vKipcbiAqIEkgbGlrZSB3aXJlZnJhbWVcbiAqXG4gKiBgdHJpSW5kZXhUb0xpbmVJbmRleCggWyAwLCAxLCAyLCA1LCA2LCA3IF0gKWAgLT4gYFsgMCwgMSwgMSwgMiwgMiwgMCwgNSwgNiwgNiwgNywgNywgNSBdYFxuICovXG5leHBvcnQgZnVuY3Rpb24gdHJpSW5kZXhUb0xpbmVJbmRleDxUPiggYXJyYXk6IFRbXSApOiBUW10ge1xuICBjb25zdCByZXQ6IFRbXSA9IFtdO1xuICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBhcnJheS5sZW5ndGggLyAzOyBpICsrICkge1xuICAgIGNvbnN0IGhlYWQgPSBpICogMztcbiAgICByZXQucHVzaChcbiAgICAgIGFycmF5WyBoZWFkICAgICBdLCBhcnJheVsgaGVhZCArIDEgXSxcbiAgICAgIGFycmF5WyBoZWFkICsgMSBdLCBhcnJheVsgaGVhZCArIDIgXSxcbiAgICAgIGFycmF5WyBoZWFkICsgMiBdLCBhcnJheVsgaGVhZCAgICAgXVxuICAgICk7XG4gIH1cbiAgcmV0dXJuIHJldDtcbn1cblxuLyoqXG4gKiBgbWF0cml4MmQoIDMsIDIgKWAgLT4gYFsgMCwgMCwgMCwgMSwgMCwgMiwgMSwgMCwgMSwgMSwgMSwgMiBdYFxuICovXG5leHBvcnQgZnVuY3Rpb24gbWF0cml4MmQoIHc6IG51bWJlciwgaDogbnVtYmVyICk6IG51bWJlcltdIHtcbiAgY29uc3QgYXJyOiBudW1iZXJbXSA9IFtdO1xuICBmb3IgKCBsZXQgaXkgPSAwOyBpeSA8IGg7IGl5ICsrICkge1xuICAgIGZvciAoIGxldCBpeCA9IDA7IGl4IDwgdzsgaXggKysgKSB7XG4gICAgICBhcnIucHVzaCggaXgsIGl5ICk7XG4gICAgfVxuICB9XG4gIHJldHVybiBhcnI7XG59XG4iLCIvKipcbiAqIENyaXRpY2FsbHkgRGFtcGVkIFNwcmluZ1xuICpcbiAqIFNob3V0b3V0cyB0byBLZWlqaXJvIFRha2FoYXNoaVxuICovXG5leHBvcnQgY2xhc3MgQ0RTIHtcbiAgcHVibGljIGZhY3RvciA9IDEwMC4wO1xuICBwdWJsaWMgcmF0aW8gPSAxLjA7XG4gIHB1YmxpYyB2ZWxvY2l0eSA9IDAuMDtcbiAgcHVibGljIHZhbHVlID0gMC4wO1xuICBwdWJsaWMgdGFyZ2V0ID0gMC4wO1xuXG4gIHB1YmxpYyB1cGRhdGUoIGRlbHRhVGltZTogbnVtYmVyICk6IG51bWJlciB7XG4gICAgdGhpcy52ZWxvY2l0eSArPSAoXG4gICAgICAtdGhpcy5mYWN0b3IgKiAoIHRoaXMudmFsdWUgLSB0aGlzLnRhcmdldCApXG4gICAgICAtIDIuMCAqIHRoaXMudmVsb2NpdHkgKiBNYXRoLnNxcnQoIHRoaXMuZmFjdG9yICkgKiB0aGlzLnJhdGlvXG4gICAgKSAqIGRlbHRhVGltZTtcbiAgICB0aGlzLnZhbHVlICs9IHRoaXMudmVsb2NpdHkgKiBkZWx0YVRpbWU7XG4gICAgcmV0dXJuIHRoaXMudmFsdWU7XG4gIH1cbn1cbiIsIi8qKlxuICogQ2xhc3MgdGhhdCBkZWFscyB3aXRoIHRpbWUuXG4gKiBJbiB0aGlzIGJhc2UgY2xhc3MsIHlvdSBuZWVkIHRvIHNldCB0aW1lIG1hbnVhbGx5IGZyb20gYEF1dG9tYXRvbi51cGRhdGUoKWAuXG4gKiBCZXN0IGZvciBzeW5jIHdpdGggZXh0ZXJuYWwgY2xvY2sgc3R1ZmYuXG4gKi9cbmV4cG9ydCBjbGFzcyBDbG9jayB7XG4gIC8qKlxuICAgKiBJdHMgY3VycmVudCB0aW1lLlxuICAgKi9cbiAgcHJvdGVjdGVkIF9fdGltZSA9IDAuMDtcblxuICAvKipcbiAgICogSXRzIGRlbHRhVGltZSBvZiBsYXN0IHVwZGF0ZS5cbiAgICovXG4gIHByb3RlY3RlZCBfX2RlbHRhVGltZSA9IDAuMDtcblxuICAvKipcbiAgICogV2hldGhlciBpdHMgY3VycmVudGx5IHBsYXlpbmcgb3Igbm90LlxuICAgKi9cbiAgcHJvdGVjdGVkIF9faXNQbGF5aW5nID0gZmFsc2U7XG5cbiAgLyoqXG4gICAqIEl0cyBjdXJyZW50IHRpbWUuXG4gICAqL1xuICBwdWJsaWMgZ2V0IHRpbWUoKTogbnVtYmVyIHsgcmV0dXJuIHRoaXMuX190aW1lOyB9XG5cbiAgLyoqXG4gICAqIEl0cyBkZWx0YVRpbWUgb2YgbGFzdCB1cGRhdGUuXG4gICAqL1xuICBwdWJsaWMgZ2V0IGRlbHRhVGltZSgpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5fX2RlbHRhVGltZTsgfVxuXG4gIC8qKlxuICAgKiBXaGV0aGVyIGl0cyBjdXJyZW50bHkgcGxheWluZyBvciBub3QuXG4gICAqL1xuICBwdWJsaWMgZ2V0IGlzUGxheWluZygpOiBib29sZWFuIHsgcmV0dXJuIHRoaXMuX19pc1BsYXlpbmc7IH1cblxuICAvKipcbiAgICogVXBkYXRlIHRoZSBjbG9jay5cbiAgICogQHBhcmFtIHRpbWUgVGltZS4gWW91IG5lZWQgdG8gc2V0IG1hbnVhbGx5IHdoZW4geW91IGFyZSB1c2luZyBtYW51YWwgQ2xvY2tcbiAgICovXG4gIHB1YmxpYyB1cGRhdGUoIHRpbWU/OiBudW1iZXIgKTogdm9pZCB7XG4gICAgY29uc3QgcHJldlRpbWUgPSB0aGlzLl9fdGltZTtcbiAgICB0aGlzLl9fdGltZSA9IHRpbWUgfHwgMC4wO1xuICAgIHRoaXMuX19kZWx0YVRpbWUgPSB0aGlzLl9fdGltZSAtIHByZXZUaW1lO1xuICB9XG5cbiAgLyoqXG4gICAqIFN0YXJ0IHRoZSBjbG9jay5cbiAgICovXG4gIHB1YmxpYyBwbGF5KCk6IHZvaWQge1xuICAgIHRoaXMuX19pc1BsYXlpbmcgPSB0cnVlO1xuICB9XG5cbiAgLyoqXG4gICAqIFN0b3AgdGhlIGNsb2NrLlxuICAgKi9cbiAgcHVibGljIHBhdXNlKCk6IHZvaWQge1xuICAgIHRoaXMuX19pc1BsYXlpbmcgPSBmYWxzZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgdGhlIHRpbWUgbWFudWFsbHkuXG4gICAqIEBwYXJhbSB0aW1lIFRpbWVcbiAgICovXG4gIHB1YmxpYyBzZXRUaW1lKCB0aW1lOiBudW1iZXIgKTogdm9pZCB7XG4gICAgdGhpcy5fX3RpbWUgPSB0aW1lO1xuICB9XG59XG4iLCJpbXBvcnQgeyBDbG9jayB9IGZyb20gJy4vQ2xvY2snO1xuXG4vKipcbiAqIENsYXNzIHRoYXQgZGVhbHMgd2l0aCB0aW1lLlxuICogVGhpcyBpcyBcImZyYW1lXCIgdHlwZSBjbG9jaywgdGhlIGZyYW1lIGluY3JlYXNlcyBldmVyeSB7QGxpbmsgQ2xvY2tGcmFtZSN1cGRhdGV9IGNhbGwuXG4gKiBAcGFyYW0gZnBzIEZyYW1lcyBwZXIgc2Vjb25kXG4gKi9cbmV4cG9ydCBjbGFzcyBDbG9ja0ZyYW1lIGV4dGVuZHMgQ2xvY2sge1xuICAvKipcbiAgICogSXRzIGN1cnJlbnQgZnJhbWUuXG4gICAqL1xuICBwcml2YXRlIF9fZnJhbWUgPSAwO1xuXG4gIC8qKlxuICAgKiBJdHMgZnBzLlxuICAgKi9cbiAgcHJpdmF0ZSBfX2ZwczogbnVtYmVyO1xuXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggZnBzID0gNjAgKSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLl9fZnBzID0gZnBzO1xuICB9XG5cbiAgLyoqXG4gICAqIEl0cyBjdXJyZW50IGZyYW1lLlxuICAgKi9cbiAgcHVibGljIGdldCBmcmFtZSgpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5fX2ZyYW1lOyB9XG5cbiAgLyoqXG4gICAqIEl0cyBmcHMuXG4gICAqL1xuICBwdWJsaWMgZ2V0IGZwcygpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5fX2ZwczsgfVxuXG4gIC8qKlxuICAgKiBVcGRhdGUgdGhlIGNsb2NrLiBJdCB3aWxsIGluY3JlYXNlIHRoZSBmcmFtZSBieSAxLlxuICAgKi9cbiAgcHVibGljIHVwZGF0ZSgpOiB2b2lkIHtcbiAgICBpZiAoIHRoaXMuX19pc1BsYXlpbmcgKSB7XG4gICAgICB0aGlzLl9fdGltZSA9IHRoaXMuX19mcmFtZSAvIHRoaXMuX19mcHM7XG4gICAgICB0aGlzLl9fZGVsdGFUaW1lID0gMS4wIC8gdGhpcy5fX2ZwcztcbiAgICAgIHRoaXMuX19mcmFtZSArKztcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fX2RlbHRhVGltZSA9IDAuMDtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogU2V0IHRoZSB0aW1lIG1hbnVhbGx5LlxuICAgKiBUaGUgc2V0IHRpbWUgd2lsbCBiZSBjb252ZXJ0ZWQgaW50byBpbnRlcm5hbCBmcmFtZSBjb3VudCwgc28gdGhlIHRpbWUgd2lsbCBub3QgYmUgZXhhY3RseSBzYW1lIGFzIHNldCBvbmUuXG4gICAqIEBwYXJhbSB0aW1lIFRpbWVcbiAgICovXG4gIHB1YmxpYyBzZXRUaW1lKCB0aW1lOiBudW1iZXIgKTogdm9pZCB7XG4gICAgdGhpcy5fX2ZyYW1lID0gTWF0aC5mbG9vciggdGhpcy5fX2ZwcyAqIHRpbWUgKTtcbiAgICB0aGlzLl9fdGltZSA9IHRoaXMuX19mcmFtZSAvIHRoaXMuX19mcHM7XG4gIH1cbn1cbiIsImltcG9ydCB7IENsb2NrIH0gZnJvbSAnLi9DbG9jayc7XG5cbi8qKlxuICogQ2xhc3MgdGhhdCBkZWFscyB3aXRoIHRpbWUuXG4gKiBUaGlzIGlzIFwicmVhbHRpbWVcIiB0eXBlIGNsb2NrLCB0aGUgdGltZSBnb2VzIG9uIGFzIHJlYWwgd29ybGQuXG4gKi9cbmV4cG9ydCBjbGFzcyBDbG9ja1JlYWx0aW1lIGV4dGVuZHMgQ2xvY2sge1xuICAvKipcbiAgICogXCJZb3Ugc2V0IHRoZSB0aW1lIG1hbnVhbGx5IHRvIGBfX3J0VGltZWAgd2hlbiBpdCdzIGBfX3J0RGF0ZWAuXCJcbiAgICovXG4gIHByaXZhdGUgX19ydFRpbWUgPSAwLjA7XG5cbiAgLyoqXG4gICAqIFwiWW91IHNldCB0aGUgdGltZSBtYW51YWxseSB0byBgX19ydFRpbWVgIHdoZW4gaXQncyBgX19ydERhdGVgLlwiXG4gICAqL1xuICBwcml2YXRlIF9fcnREYXRlOiBudW1iZXIgPSBwZXJmb3JtYW5jZS5ub3coKTtcblxuICAvKipcbiAgICogVGhlIGNsb2NrIGlzIHJlYWx0aW1lLiB5ZWFoLlxuICAgKi9cbiAgcHVibGljIGdldCBpc1JlYWx0aW1lKCk6IGJvb2xlYW4geyByZXR1cm4gdHJ1ZTsgfVxuXG4gIC8qKlxuICAgKiBVcGRhdGUgdGhlIGNsb2NrLiBUaW1lIGlzIGNhbGN1bGF0ZWQgYmFzZWQgb24gdGltZSBpbiByZWFsIHdvcmxkLlxuICAgKi9cbiAgcHVibGljIHVwZGF0ZSgpOiB2b2lkIHtcbiAgICBjb25zdCBub3cgPSBwZXJmb3JtYW5jZS5ub3coKTtcblxuICAgIGlmICggdGhpcy5fX2lzUGxheWluZyApIHtcbiAgICAgIGNvbnN0IHByZXZUaW1lID0gdGhpcy5fX3RpbWU7XG4gICAgICBjb25zdCBkZWx0YURhdGUgPSAoIG5vdyAtIHRoaXMuX19ydERhdGUgKTtcbiAgICAgIHRoaXMuX190aW1lID0gdGhpcy5fX3J0VGltZSArIGRlbHRhRGF0ZSAvIDEwMDAuMDtcbiAgICAgIHRoaXMuX19kZWx0YVRpbWUgPSB0aGlzLnRpbWUgLSBwcmV2VGltZTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fX3J0VGltZSA9IHRoaXMudGltZTtcbiAgICAgIHRoaXMuX19ydERhdGUgPSBub3c7XG4gICAgICB0aGlzLl9fZGVsdGFUaW1lID0gMC4wO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgdGhlIHRpbWUgbWFudWFsbHkuXG4gICAqIEBwYXJhbSB0aW1lIFRpbWVcbiAgICovXG4gIHB1YmxpYyBzZXRUaW1lKCB0aW1lOiBudW1iZXIgKTogdm9pZCB7XG4gICAgdGhpcy5fX3RpbWUgPSB0aW1lO1xuICAgIHRoaXMuX19ydFRpbWUgPSB0aGlzLnRpbWU7XG4gICAgdGhpcy5fX3J0RGF0ZSA9IHBlcmZvcm1hbmNlLm5vdygpO1xuICB9XG59XG4iLCIvLyB5b2lua2VkIGZyb20gaHR0cHM6Ly9naXRodWIuY29tL21hcGJveC90aW55LXNkZiAoQlNEIDItQ2xhdXNlKVxuLy8gaW1wbGVtZW50cyBodHRwOi8vcGVvcGxlLmNzLnVjaGljYWdvLmVkdS9+cGZmL3BhcGVycy9kdC5wZGZcblxuLyoqXG4gKiBDb21wdXRlIGEgb25lIGRpbWVuc2lvbmFsIGVkdCBmcm9tIHRoZSBzb3VyY2UgZGF0YS5cbiAqIFJldHVybmluZyBkaXN0YW5jZSB3aWxsIGJlIHNxdWFyZWQuXG4gKiBJbnRlbmRlZCB0byBiZSB1c2VkIGludGVybmFsbHkgaW4ge0BsaW5rIGVkdDJkfS5cbiAqXG4gKiBAcGFyYW0gZGF0YSBEYXRhIG9mIHRoZSBzb3VyY2VcbiAqIEBwYXJhbSBvZmZzZXQgT2Zmc2V0IG9mIHRoZSBzb3VyY2UgZnJvbSBiZWdpbm5pbmdcbiAqIEBwYXJhbSBzdHJpZGUgU3RyaWRlIG9mIHRoZSBzb3VyY2VcbiAqIEBwYXJhbSBsZW5ndGggTGVuZ3RoIG9mIHRoZSBzb3VyY2VcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGVkdDFkKFxuICBkYXRhOiBGbG9hdDMyQXJyYXksXG4gIG9mZnNldDogbnVtYmVyLFxuICBzdHJpZGU6IG51bWJlcixcbiAgbGVuZ3RoOiBudW1iZXJcbik6IHZvaWQge1xuICAvLyBpbmRleCBvZiByaWdodG1vc3QgcGFyYWJvbGEgaW4gbG93ZXIgZW52ZWxvcGVcbiAgbGV0IGsgPSAwO1xuXG4gIC8vIGxvY2F0aW9ucyBvZiBwYXJhYm9sYXMgaW4gbG93ZXIgZW52ZWxvcGVcbiAgY29uc3QgdiA9IG5ldyBGbG9hdDMyQXJyYXkoIGxlbmd0aCApO1xuICB2WyAwIF0gPSAwLjA7XG5cbiAgLy8gbG9jYXRpb25zIG9mIGJvdW5kYXJpZXMgYmV0d2VlbiBwYXJhYm9sYXNcbiAgY29uc3QgeiA9IG5ldyBGbG9hdDMyQXJyYXkoIGxlbmd0aCArIDEgKTtcbiAgelsgMCBdID0gLUluZmluaXR5O1xuICB6WyAxIF0gPSBJbmZpbml0eTtcblxuICAvLyBjcmVhdGUgYSBzdHJhaWdodCBhcnJheSBvZiBpbnB1dCBkYXRhXG4gIGNvbnN0IGYgPSBuZXcgRmxvYXQzMkFycmF5KCBsZW5ndGggKTtcbiAgZm9yICggbGV0IHEgPSAwOyBxIDwgbGVuZ3RoOyBxICsrICkge1xuICAgIGZbIHEgXSA9IGRhdGFbIG9mZnNldCArIHEgKiBzdHJpZGUgXTtcbiAgfVxuXG4gIC8vIGNvbXB1dGUgbG93ZXIgZW52ZWxvcGVcbiAgZm9yICggbGV0IHEgPSAxOyBxIDwgbGVuZ3RoOyBxICsrICkge1xuICAgIGxldCBzID0gMC4wO1xuXG4gICAgd2hpbGUgKCAwIDw9IGsgKSB7XG4gICAgICBzID0gKCBmWyBxIF0gKyBxICogcSAtIGZbIHZbIGsgXSBdIC0gdlsgayBdICogdlsgayBdICkgLyAoIDIuMCAqIHEgLSAyLjAgKiB2WyBrIF0gKTtcbiAgICAgIGlmICggcyA8PSB6WyBrIF0gKSB7XG4gICAgICAgIGsgLS07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG5cbiAgICBrICsrO1xuICAgIHZbIGsgXSA9IHE7XG4gICAgelsgayBdID0gcztcbiAgICB6WyBrICsgMSBdID0gSW5maW5pdHk7XG4gIH1cblxuICBrID0gMDtcblxuICAvLyBmaWxsIGluIHZhbHVlcyBvZiBkaXN0YW5jZSB0cmFuc2Zvcm1cbiAgZm9yICggbGV0IHEgPSAwOyBxIDwgbGVuZ3RoOyBxICsrICkge1xuICAgIHdoaWxlICggelsgayArIDEgXSA8IHEgKSB7IGsgKys7IH1cbiAgICBjb25zdCBxU3ViVksgPSBxIC0gdlsgayBdO1xuICAgIGRhdGFbIG9mZnNldCArIHEgKiBzdHJpZGUgXSA9IGZbIHZbIGsgXSBdICsgcVN1YlZLICogcVN1YlZLO1xuICB9XG59XG5cbi8qKlxuICogQ29tcHV0ZSBhIHR3byBkaW1lbnNpb25hbCBlZHQgZnJvbSB0aGUgc291cmNlIGRhdGEuXG4gKiBSZXR1cm5pbmcgZGlzdGFuY2Ugd2lsbCBiZSBzcXVhcmVkLlxuICpcbiAqIEBwYXJhbSBkYXRhIERhdGEgb2YgdGhlIHNvdXJjZS5cbiAqIEBwYXJhbSB3aWR0aCBXaWR0aCBvZiB0aGUgc291cmNlLlxuICogQHBhcmFtIGhlaWdodCBIZWlnaHQgb2YgdGhlIHNvdXJjZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGVkdDJkKFxuICBkYXRhOiBGbG9hdDMyQXJyYXksXG4gIHdpZHRoOiBudW1iZXIsXG4gIGhlaWdodDogbnVtYmVyXG4pOiB2b2lkIHtcbiAgZm9yICggbGV0IHggPSAwOyB4IDwgd2lkdGg7IHggKysgKSB7XG4gICAgZWR0MWQoIGRhdGEsIHgsIHdpZHRoLCBoZWlnaHQgKTtcbiAgfVxuXG4gIGZvciAoIGxldCB5ID0gMDsgeSA8IGhlaWdodDsgeSArKyApIHtcbiAgICBlZHQxZCggZGF0YSwgeSAqIHdpZHRoLCAxLCB3aWR0aCApO1xuICB9XG59XG4iLCIvKipcbiAqIGBsZXJwYCwgb3IgYG1peGBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGxlcnAoIGE6IG51bWJlciwgYjogbnVtYmVyLCB4OiBudW1iZXIgKTogbnVtYmVyIHtcbiAgcmV0dXJuIGEgKyAoIGIgLSBhICkgKiB4O1xufVxuXG4vKipcbiAqIGBjbGFtcGBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNsYW1wKCB4OiBudW1iZXIsIGw6IG51bWJlciwgaDogbnVtYmVyICk6IG51bWJlciB7XG4gIHJldHVybiBNYXRoLm1pbiggTWF0aC5tYXgoIHgsIGwgKSwgaCApO1xufVxuXG4vKipcbiAqIGBjbGFtcCggeCwgMC4wLCAxLjAgKWBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNhdHVyYXRlKCB4OiBudW1iZXIgKTogbnVtYmVyIHtcbiAgcmV0dXJuIGNsYW1wKCB4LCAwLjAsIDEuMCApO1xufVxuXG4vKipcbiAqIFRyYW5zZm9ybSBhIHZhbHVlIGZyb20gaW5wdXQgcmFuZ2UgdG8gb3V0cHV0IHJhbmdlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gcmFuZ2UoIHg6IG51bWJlciwgeDA6IG51bWJlciwgeDE6IG51bWJlciwgeTA6IG51bWJlciwgeTE6IG51bWJlciApOiBudW1iZXIge1xuICByZXR1cm4gKCAoIHggLSB4MCApICogKCB5MSAtIHkwICkgLyAoIHgxIC0geDAgKSArIHkwICk7XG59XG5cbi8qKlxuICogYHNtb290aHN0ZXBgIGJ1dCBub3Qgc21vb3RoXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBsaW5lYXJzdGVwKCBhOiBudW1iZXIsIGI6IG51bWJlciwgeDogbnVtYmVyICk6IG51bWJlciB7XG4gIHJldHVybiBzYXR1cmF0ZSggKCB4IC0gYSApIC8gKCBiIC0gYSApICk7XG59XG5cbi8qKlxuICogd29ybGQgZmFtb3VzIGBzbW9vdGhzdGVwYCBmdW5jdGlvblxuICovXG5leHBvcnQgZnVuY3Rpb24gc21vb3Roc3RlcCggYTogbnVtYmVyLCBiOiBudW1iZXIsIHg6IG51bWJlciApOiBudW1iZXIge1xuICBjb25zdCB0ID0gbGluZWFyc3RlcCggYSwgYiwgeCApO1xuICByZXR1cm4gdCAqIHQgKiAoIDMuMCAtIDIuMCAqIHQgKTtcbn1cblxuLyoqXG4gKiBgc21vb3Roc3RlcGAgYnV0IG1vcmUgc21vb3RoXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzbW9vdGhlcnN0ZXAoIGE6IG51bWJlciwgYjogbnVtYmVyLCB4OiBudW1iZXIgKTogbnVtYmVyIHtcbiAgY29uc3QgdCA9IGxpbmVhcnN0ZXAoIGEsIGIsIHggKTtcbiAgcmV0dXJuIHQgKiB0ICogdCAqICggdCAqICggdCAqIDYuMCAtIDE1LjAgKSArIDEwLjAgKTtcbn1cblxuLyoqXG4gKiBgc21vb3Roc3RlcGAgYnV0IFdBWSBtb3JlIHNtb290aFxuICovXG5leHBvcnQgZnVuY3Rpb24gc21vb3RoZXN0c3RlcCggYTogbnVtYmVyLCBiOiBudW1iZXIsIHg6IG51bWJlciApOiBudW1iZXIge1xuICBjb25zdCB0ID0gbGluZWFyc3RlcCggYSwgYiwgeCApO1xuICByZXR1cm4gdCAqIHQgKiB0ICogdCAqICggdCAqICggdCAqICggLTIwLjAgKiB0ICsgNzAuMCApIC0gODQuMCApICsgMzUuMCApO1xufVxuIiwiaW1wb3J0IHsgbGVycCB9IGZyb20gJy4uL21hdGgvdXRpbHMnO1xuXG4vKipcbiAqIERvIGV4cCBzbW9vdGhpbmdcbiAqL1xuZXhwb3J0IGNsYXNzIEV4cFNtb290aCB7XG4gIHB1YmxpYyBmYWN0b3IgPSAxMC4wO1xuICBwdWJsaWMgdGFyZ2V0ID0gMC4wO1xuICBwdWJsaWMgdmFsdWUgPSAwLjA7XG5cbiAgcHVibGljIHVwZGF0ZSggZGVsdGFUaW1lOiBudW1iZXIgKTogbnVtYmVyIHtcbiAgICB0aGlzLnZhbHVlID0gbGVycCggdGhpcy50YXJnZXQsIHRoaXMudmFsdWUsIE1hdGguZXhwKCAtdGhpcy5mYWN0b3IgKiBkZWx0YVRpbWUgKSApO1xuICAgIHJldHVybiB0aGlzLnZhbHVlO1xuICB9XG59XG4iLCIvKipcbiAqIEl0ZXJhYmxlIEZpenpCdXp6XG4gKi9cbmV4cG9ydCBjbGFzcyBGaXp6QnV6eiBpbXBsZW1lbnRzIEl0ZXJhYmxlPG51bWJlciB8IHN0cmluZz4ge1xuICBwdWJsaWMgc3RhdGljIFdvcmRzRGVmYXVsdDogTWFwPG51bWJlciwgc3RyaW5nPiA9IG5ldyBNYXAoIFtcbiAgICBbIDMsICdGaXp6JyBdLFxuICAgIFsgNSwgJ0J1enonIF1cbiAgXSApO1xuXG4gIHByaXZhdGUgX193b3JkczogTWFwPG51bWJlciwgc3RyaW5nPjtcbiAgcHJpdmF0ZSBfX2luZGV4OiBudW1iZXI7XG4gIHByaXZhdGUgX19lbmQ6IG51bWJlcjtcblxuICBwdWJsaWMgY29uc3RydWN0b3IoIHdvcmRzOiBNYXA8bnVtYmVyLCBzdHJpbmc+ID0gRml6ekJ1enouV29yZHNEZWZhdWx0LCBpbmRleCA9IDEsIGVuZCA9IDEwMCApIHtcbiAgICB0aGlzLl9fd29yZHMgPSB3b3JkcztcbiAgICB0aGlzLl9faW5kZXggPSBpbmRleDtcbiAgICB0aGlzLl9fZW5kID0gZW5kO1xuICB9XG5cbiAgcHVibGljIFsgU3ltYm9sLml0ZXJhdG9yIF0oKTogSXRlcmF0b3I8c3RyaW5nIHwgbnVtYmVyLCBhbnksIHVuZGVmaW5lZD4ge1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgcHVibGljIG5leHQoKTogSXRlcmF0b3JSZXN1bHQ8bnVtYmVyIHwgc3RyaW5nPiB7XG4gICAgaWYgKCB0aGlzLl9fZW5kIDwgdGhpcy5fX2luZGV4ICkge1xuICAgICAgcmV0dXJuIHsgZG9uZTogdHJ1ZSwgdmFsdWU6IG51bGwgfTtcbiAgICB9XG5cbiAgICBsZXQgdmFsdWU6IG51bWJlciB8IHN0cmluZyA9ICcnO1xuICAgIGZvciAoIGNvbnN0IFsgcmVtLCB3b3JkIF0gb2YgdGhpcy5fX3dvcmRzICkge1xuICAgICAgaWYgKCAoIHRoaXMuX19pbmRleCAlIHJlbSApID09PSAwICkge1xuICAgICAgICB2YWx1ZSArPSB3b3JkO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmICggdmFsdWUgPT09ICcnICkge1xuICAgICAgdmFsdWUgPSB0aGlzLl9faW5kZXg7XG4gICAgfVxuXG4gICAgdGhpcy5fX2luZGV4ICsrO1xuXG4gICAgcmV0dXJuIHsgZG9uZTogZmFsc2UsIHZhbHVlIH07XG4gIH1cbn1cbiIsIi8qKlxuICogTW9zdCBhd2Vzb21lIGNhdCBldmVyXG4gKi9cbmV4cG9ydCBjbGFzcyBGTVNfQ2F0IHsgLy8gZXNsaW50LWRpc2FibGUtbGluZVxuICAvKipcbiAgICogRk1TX0NhdC5naWZcbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgZ2lmID0gJ2h0dHBzOi8vZm1zLWNhdC5jb20vaW1hZ2VzL2Ztc19jYXQuZ2lmJztcblxuICAvKipcbiAgICogRk1TX0NhdC5wbmdcbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgcG5nID0gJ2h0dHBzOi8vZm1zLWNhdC5jb20vaW1hZ2VzL2Ztc19jYXQucG5nJztcbn1cbiIsIi8qKlxuICogVXNlZnVsIGZvciB0YXAgdGVtcG9cbiAqIFNlZSBhbHNvOiB7QGxpbmsgSGlzdG9yeU1lYW5DYWxjdWxhdG9yfVxuICovXG5leHBvcnQgY2xhc3MgSGlzdG9yeU1lYW5DYWxjdWxhdG9yIHtcbiAgcHJpdmF0ZSBfX3JlY2FsY0ZvckVhY2ggPSAwO1xuICBwcml2YXRlIF9fY291bnRVbnRpbFJlY2FsYyA9IDA7XG4gIHByaXZhdGUgX19oaXN0b3J5OiBudW1iZXJbXSA9IFtdO1xuICBwcml2YXRlIF9faW5kZXggPSAwO1xuICBwcml2YXRlIF9fbGVuZ3RoOiBudW1iZXI7XG4gIHByaXZhdGUgX19jb3VudCA9IDA7XG4gIHByaXZhdGUgX19jYWNoZSA9IDA7XG5cbiAgcHVibGljIGNvbnN0cnVjdG9yKCBsZW5ndGg6IG51bWJlciApIHtcbiAgICB0aGlzLl9fbGVuZ3RoID0gbGVuZ3RoO1xuICAgIHRoaXMuX19yZWNhbGNGb3JFYWNoID0gbGVuZ3RoO1xuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IGxlbmd0aDsgaSArKyApIHtcbiAgICAgIHRoaXMuX19oaXN0b3J5WyBpIF0gPSAwO1xuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyBnZXQgbWVhbigpOiBudW1iZXIge1xuICAgIGNvbnN0IGNvdW50ID0gTWF0aC5taW4oIHRoaXMuX19jb3VudCwgdGhpcy5fX2xlbmd0aCApO1xuICAgIHJldHVybiBjb3VudCA9PT0gMCA/IDAuMCA6IHRoaXMuX19jYWNoZSAvIGNvdW50O1xuICB9XG5cbiAgcHVibGljIGdldCByZWNhbGNGb3JFYWNoKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuX19yZWNhbGNGb3JFYWNoO1xuICB9XG5cbiAgcHVibGljIHNldCByZWNhbGNGb3JFYWNoKCB2YWx1ZTogbnVtYmVyICkge1xuICAgIGNvbnN0IGRlbHRhID0gdmFsdWUgLSB0aGlzLl9fcmVjYWxjRm9yRWFjaDtcbiAgICB0aGlzLl9fcmVjYWxjRm9yRWFjaCA9IHZhbHVlO1xuICAgIHRoaXMuX19jb3VudFVudGlsUmVjYWxjID0gTWF0aC5tYXgoIDAsIHRoaXMuX19jb3VudFVudGlsUmVjYWxjICsgZGVsdGEgKTtcbiAgfVxuXG4gIHB1YmxpYyByZXNldCgpOiB2b2lkIHtcbiAgICB0aGlzLl9faW5kZXggPSAwO1xuICAgIHRoaXMuX19jb3VudCA9IDA7XG4gICAgdGhpcy5fX2NhY2hlID0gMDtcbiAgICB0aGlzLl9fY291bnRVbnRpbFJlY2FsYyA9IDA7XG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdGhpcy5fX2xlbmd0aDsgaSArKyApIHtcbiAgICAgIHRoaXMuX19oaXN0b3J5WyBpIF0gPSAwO1xuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyBwdXNoKCB2YWx1ZTogbnVtYmVyICk6IHZvaWQge1xuICAgIGNvbnN0IHByZXYgPSB0aGlzLl9faGlzdG9yeVsgdGhpcy5fX2luZGV4IF07XG4gICAgdGhpcy5fX2hpc3RvcnlbIHRoaXMuX19pbmRleCBdID0gdmFsdWU7XG4gICAgdGhpcy5fX2NvdW50ICsrO1xuICAgIHRoaXMuX19pbmRleCA9ICggdGhpcy5fX2luZGV4ICsgMSApICUgdGhpcy5fX2xlbmd0aDtcblxuICAgIGlmICggdGhpcy5fX2NvdW50VW50aWxSZWNhbGMgPT09IDAgKSB7XG4gICAgICB0aGlzLnJlY2FsYygpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9fY291bnRVbnRpbFJlY2FsYyAtLTtcbiAgICAgIHRoaXMuX19jYWNoZSAtPSBwcmV2O1xuICAgICAgdGhpcy5fX2NhY2hlICs9IHZhbHVlO1xuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyByZWNhbGMoKTogdm9pZCB7XG4gICAgdGhpcy5fX2NvdW50VW50aWxSZWNhbGMgPSB0aGlzLl9fcmVjYWxjRm9yRWFjaDtcbiAgICBjb25zdCBzdW0gPSB0aGlzLl9faGlzdG9yeVxuICAgICAgLnNsaWNlKCAwLCBNYXRoLm1pbiggdGhpcy5fX2NvdW50LCB0aGlzLl9fbGVuZ3RoICkgKVxuICAgICAgLnJlZHVjZSggKCBzdW0sIHYgKSA9PiBzdW0gKyB2LCAwICk7XG4gICAgdGhpcy5fX2NhY2hlID0gc3VtO1xuICB9XG59XG4iLCJpbXBvcnQgeyBiaW5hcnlTZWFyY2ggfSBmcm9tICcuLi9hbGdvcml0aG0vYmluYXJ5U2VhcmNoJztcblxuLyoqXG4gKiBVc2VmdWwgZm9yIGZwcyBjYWxjXG4gKiBTZWUgYWxzbzoge0BsaW5rIEhpc3RvcnlNZWFuQ2FsY3VsYXRvcn1cbiAqL1xuZXhwb3J0IGNsYXNzIEhpc3RvcnlQZXJjZW50aWxlQ2FsY3VsYXRvciB7XG4gIHByaXZhdGUgX19oaXN0b3J5OiBudW1iZXJbXSA9IFtdO1xuICBwcml2YXRlIF9fc29ydGVkOiBudW1iZXJbXSA9IFtdO1xuICBwcml2YXRlIF9faW5kZXggPSAwO1xuICBwcml2YXRlIHJlYWRvbmx5IF9fbGVuZ3RoOiBudW1iZXI7XG5cbiAgcHVibGljIGNvbnN0cnVjdG9yKCBsZW5ndGg6IG51bWJlciApIHtcbiAgICB0aGlzLl9fbGVuZ3RoID0gbGVuZ3RoO1xuICB9XG5cbiAgcHVibGljIGdldCBtZWRpYW4oKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5wZXJjZW50aWxlKCA1MC4wICk7XG4gIH1cblxuICBwdWJsaWMgcGVyY2VudGlsZSggcGVyY2VudGlsZTogbnVtYmVyICk6IG51bWJlciB7XG4gICAgaWYgKCB0aGlzLl9faGlzdG9yeS5sZW5ndGggPT09IDAgKSB7IHJldHVybiAwLjA7IH1cbiAgICByZXR1cm4gdGhpcy5fX3NvcnRlZFsgTWF0aC5yb3VuZCggcGVyY2VudGlsZSAqIDAuMDEgKiAoIHRoaXMuX19oaXN0b3J5Lmxlbmd0aCAtIDEgKSApIF07XG4gIH1cblxuICBwdWJsaWMgcmVzZXQoKTogdm9pZCB7XG4gICAgdGhpcy5fX2luZGV4ID0gMDtcbiAgICB0aGlzLl9faGlzdG9yeSA9IFtdO1xuICAgIHRoaXMuX19zb3J0ZWQgPSBbXTtcbiAgfVxuXG4gIHB1YmxpYyBwdXNoKCB2YWx1ZTogbnVtYmVyICk6IHZvaWQge1xuICAgIGNvbnN0IHByZXYgPSB0aGlzLl9faGlzdG9yeVsgdGhpcy5fX2luZGV4IF07XG4gICAgdGhpcy5fX2hpc3RvcnlbIHRoaXMuX19pbmRleCBdID0gdmFsdWU7XG4gICAgdGhpcy5fX2luZGV4ID0gKCB0aGlzLl9faW5kZXggKyAxICkgJSB0aGlzLl9fbGVuZ3RoO1xuXG4gICAgLy8gcmVtb3ZlIHRoZSBwcmV2IGZyb20gc29ydGVkIGFycmF5XG4gICAgaWYgKCB0aGlzLl9fc29ydGVkLmxlbmd0aCA9PT0gdGhpcy5fX2xlbmd0aCApIHtcbiAgICAgIGNvbnN0IHByZXZJbmRleCA9IGJpbmFyeVNlYXJjaCggdGhpcy5fX3NvcnRlZCwgcHJldiApO1xuICAgICAgdGhpcy5fX3NvcnRlZC5zcGxpY2UoIHByZXZJbmRleCwgMSApO1xuICAgIH1cblxuICAgIGNvbnN0IGluZGV4ID0gYmluYXJ5U2VhcmNoKCB0aGlzLl9fc29ydGVkLCB2YWx1ZSApO1xuICAgIHRoaXMuX19zb3J0ZWQuc3BsaWNlKCBpbmRleCwgMCwgdmFsdWUgKTtcbiAgfVxufVxuIiwiaW1wb3J0IHsgSGlzdG9yeVBlcmNlbnRpbGVDYWxjdWxhdG9yIH0gZnJvbSAnLi9IaXN0b3J5UGVyY2VudGlsZUNhbGN1bGF0b3InO1xuXG4vKipcbiAqIEBkZXByZWNhdGVkIEl0J3MgYWN0dWFsbHkganVzdCBhIHNwZWNpYWwgY2FzZSBvZiB7QGxpbmsgSGlzdG9yeVBlcmNlbnRpbGVDYWxjdWxhdG9yfVxuICovXG5leHBvcnQgY2xhc3MgSGlzdG9yeU1lZGlhbkNhbGN1bGF0b3IgZXh0ZW5kcyBIaXN0b3J5UGVyY2VudGlsZUNhbGN1bGF0b3Ige1xuICBwdWJsaWMgY29uc3RydWN0b3IoIGxlbmd0aDogbnVtYmVyICkge1xuICAgIHN1cGVyKCBsZW5ndGggKTtcbiAgICBjb25zb2xlLndhcm4oICdIaXN0b3J5TWVkaWFuQ2FsY3VsYXRvcjogRGVwcmVjYXRlZC4gVXNlIEhpc3RvcnlQZXJjZW50aWxlQ2FsY3VsYXRvciBpbnN0ZWFkJyApO1xuICB9XG59XG4iLCIvKipcbiAqIEEgVmVjdG9yLlxuICovXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgVmVjdG9yPFQgZXh0ZW5kcyBWZWN0b3I8VD4+IHtcbiAgcHVibGljIGFic3RyYWN0IGVsZW1lbnRzOiBudW1iZXJbXTtcblxuICAvKipcbiAgICogVGhlIGxlbmd0aCBvZiB0aGlzLlxuICAgKiBhLmsuYS4gYG1hZ25pdHVkZWBcbiAgICovXG4gIHB1YmxpYyBnZXQgbGVuZ3RoKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIE1hdGguc3FydCggdGhpcy5lbGVtZW50cy5yZWR1Y2UoICggc3VtLCB2ICkgPT4gc3VtICsgdiAqIHYsIDAuMCApICk7XG4gIH1cblxuICAvKipcbiAgICogQSBub3JtYWxpemVkIFZlY3RvcjMgb2YgdGhpcy5cbiAgICovXG4gIHB1YmxpYyBnZXQgbm9ybWFsaXplZCgpOiBUIHtcbiAgICByZXR1cm4gdGhpcy5zY2FsZSggMS4wIC8gdGhpcy5sZW5ndGggKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDbG9uZSB0aGlzLlxuICAgKi9cbiAgcHVibGljIGNsb25lKCk6IFQge1xuICAgIHJldHVybiB0aGlzLl9fbmV3KCB0aGlzLmVsZW1lbnRzLmNvbmNhdCgpICk7XG4gIH1cblxuICAvKipcbiAgICogQWRkIGEgVmVjdG9yIGludG8gdGhpcy5cbiAgICogQHBhcmFtIHZlY3RvciBBbm90aGVyIFZlY3RvclxuICAgKi9cbiAgcHVibGljIGFkZCggdmVjdG9yOiBUICk6IFQge1xuICAgIHJldHVybiB0aGlzLl9fbmV3KCB0aGlzLmVsZW1lbnRzLm1hcCggKCB2LCBpICkgPT4gdiArIHZlY3Rvci5lbGVtZW50c1sgaSBdICkgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTdWJzdHJhY3QgdGhpcyBmcm9tIGFub3RoZXIgVmVjdG9yLlxuICAgKiBAcGFyYW0gdiBBbm90aGVyIHZlY3RvclxuICAgKi9cbiAgcHVibGljIHN1YiggdmVjdG9yOiBUICk6IFQge1xuICAgIHJldHVybiB0aGlzLl9fbmV3KCB0aGlzLmVsZW1lbnRzLm1hcCggKCB2LCBpICkgPT4gdiAtIHZlY3Rvci5lbGVtZW50c1sgaSBdICkgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBNdWx0aXBseSBhIFZlY3RvciB3aXRoIHRoaXMuXG4gICAqIEBwYXJhbSB2ZWN0b3IgQW5vdGhlciBWZWN0b3JcbiAgICovXG4gIHB1YmxpYyBtdWx0aXBseSggdmVjdG9yOiBUICk6IFQge1xuICAgIHJldHVybiB0aGlzLl9fbmV3KCB0aGlzLmVsZW1lbnRzLm1hcCggKCB2LCBpICkgPT4gdiAqIHZlY3Rvci5lbGVtZW50c1sgaSBdICkgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBEaXZpZGUgdGhpcyBmcm9tIGFub3RoZXIgVmVjdG9yLlxuICAgKiBAcGFyYW0gdmVjdG9yIEFub3RoZXIgVmVjdG9yXG4gICAqL1xuICBwdWJsaWMgZGl2aWRlKCB2ZWN0b3I6IFQgKTogVCB7XG4gICAgcmV0dXJuIHRoaXMuX19uZXcoIHRoaXMuZWxlbWVudHMubWFwKCAoIHYsIGkgKSA9PiB2IC8gdmVjdG9yLmVsZW1lbnRzWyBpIF0gKSApO1xuICB9XG5cbiAgLyoqXG4gICAqIFNjYWxlIHRoaXMgYnkgc2NhbGFyLlxuICAgKiBhLmsuYS4gYG11bHRpcGx5U2NhbGFyYFxuICAgKiBAcGFyYW0gc2NhbGFyIEEgc2NhbGFyXG4gICAqL1xuICBwdWJsaWMgc2NhbGUoIHNjYWxhcjogbnVtYmVyICk6IFQge1xuICAgIHJldHVybiB0aGlzLl9fbmV3KCB0aGlzLmVsZW1lbnRzLm1hcCggKCB2ICkgPT4gdiAqIHNjYWxhciApICk7XG4gIH1cblxuICAvKipcbiAgICogRG90IHR3byBWZWN0b3JzLlxuICAgKiBAcGFyYW0gdmVjdG9yIEFub3RoZXIgdmVjdG9yXG4gICAqL1xuICBwdWJsaWMgZG90KCB2ZWN0b3I6IFQgKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5lbGVtZW50cy5yZWR1Y2UoICggc3VtLCB2LCBpICkgPT4gc3VtICsgdiAqIHZlY3Rvci5lbGVtZW50c1sgaSBdLCAwLjAgKTtcbiAgfVxuXG4gIHByb3RlY3RlZCBhYnN0cmFjdCBfX25ldyggdjogbnVtYmVyW10gKTogVDtcbn1cbiIsImltcG9ydCB7IE1hdHJpeDQgfSBmcm9tICcuL01hdHJpeDQnO1xuaW1wb3J0IHsgUXVhdGVybmlvbiB9IGZyb20gJy4vUXVhdGVybmlvbic7XG5pbXBvcnQgeyBWZWN0b3IgfSBmcm9tICcuL1ZlY3Rvcic7XG5cbmV4cG9ydCB0eXBlIHJhd1ZlY3RvcjMgPSBbIG51bWJlciwgbnVtYmVyLCBudW1iZXIgXTtcblxuLyoqXG4gKiBBIFZlY3RvcjMuXG4gKi9cbmV4cG9ydCBjbGFzcyBWZWN0b3IzIGV4dGVuZHMgVmVjdG9yPFZlY3RvcjM+IHtcbiAgcHVibGljIGVsZW1lbnRzOiByYXdWZWN0b3IzO1xuXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggdjogcmF3VmVjdG9yMyA9IFsgMC4wLCAwLjAsIDAuMCBdICkge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5lbGVtZW50cyA9IHY7XG4gIH1cblxuICAvKipcbiAgICogQW4geCBjb21wb25lbnQgb2YgdGhpcy5cbiAgICovXG4gIHB1YmxpYyBnZXQgeCgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLmVsZW1lbnRzWyAwIF07XG4gIH1cblxuICBwdWJsaWMgc2V0IHgoIHg6IG51bWJlciApIHtcbiAgICB0aGlzLmVsZW1lbnRzWyAwIF0gPSB4O1xuICB9XG5cbiAgLyoqXG4gICAqIEFuIHkgY29tcG9uZW50IG9mIHRoaXMuXG4gICAqL1xuICBwdWJsaWMgZ2V0IHkoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5lbGVtZW50c1sgMSBdO1xuICB9XG5cbiAgcHVibGljIHNldCB5KCB5OiBudW1iZXIgKSB7XG4gICAgdGhpcy5lbGVtZW50c1sgMSBdID0geTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBbiB6IGNvbXBvbmVudCBvZiB0aGlzLlxuICAgKi9cbiAgcHVibGljIGdldCB6KCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuZWxlbWVudHNbIDIgXTtcbiAgfVxuXG4gIHB1YmxpYyBzZXQgeiggejogbnVtYmVyICkge1xuICAgIHRoaXMuZWxlbWVudHNbIDIgXSA9IHo7XG4gIH1cblxuICBwdWJsaWMgdG9TdHJpbmcoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gYFZlY3RvcjMoICR7IHRoaXMueC50b0ZpeGVkKCAzICkgfSwgJHsgdGhpcy55LnRvRml4ZWQoIDMgKSB9LCAkeyB0aGlzLnoudG9GaXhlZCggMyApIH0gKWA7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJuIGEgY3Jvc3Mgb2YgdGhpcyBhbmQgYW5vdGhlciBWZWN0b3IzLlxuICAgKiBAcGFyYW0gdmVjdG9yIEFub3RoZXIgdmVjdG9yXG4gICAqL1xuICBwdWJsaWMgY3Jvc3MoIHZlY3RvcjogVmVjdG9yMyApOiBWZWN0b3IzIHtcbiAgICByZXR1cm4gbmV3IFZlY3RvcjMoIFtcbiAgICAgIHRoaXMueSAqIHZlY3Rvci56IC0gdGhpcy56ICogdmVjdG9yLnksXG4gICAgICB0aGlzLnogKiB2ZWN0b3IueCAtIHRoaXMueCAqIHZlY3Rvci56LFxuICAgICAgdGhpcy54ICogdmVjdG9yLnkgLSB0aGlzLnkgKiB2ZWN0b3IueFxuICAgIF0gKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSb3RhdGUgdGhpcyB2ZWN0b3IgdXNpbmcgYSBRdWF0ZXJuaW9uLlxuICAgKiBAcGFyYW0gcXVhdGVybmlvbiBBIHF1YXRlcm5pb25cbiAgICovXG4gIHB1YmxpYyBhcHBseVF1YXRlcm5pb24oIHF1YXRlcm5pb246IFF1YXRlcm5pb24gKTogVmVjdG9yMyB7XG4gICAgY29uc3QgcCA9IG5ldyBRdWF0ZXJuaW9uKCBbIHRoaXMueCwgdGhpcy55LCB0aGlzLnosIDAuMCBdICk7XG4gICAgY29uc3QgciA9IHF1YXRlcm5pb24uaW52ZXJzZWQ7XG4gICAgY29uc3QgcmVzID0gcXVhdGVybmlvbi5tdWx0aXBseSggcCApLm11bHRpcGx5KCByICk7XG4gICAgcmV0dXJuIG5ldyBWZWN0b3IzKCBbIHJlcy54LCByZXMueSwgcmVzLnogXSApO1xuICB9XG5cbiAgLyoqXG4gICAqIE11bHRpcGx5IHRoaXMgdmVjdG9yICh3aXRoIGFuIGltcGxpY2l0IDEgaW4gdGhlIDR0aCBkaW1lbnNpb24pIGJ5IG0uXG4gICAqL1xuICBwdWJsaWMgYXBwbHlNYXRyaXg0KCBtYXRyaXg6IE1hdHJpeDQgKTogVmVjdG9yMyB7XG4gICAgY29uc3QgbSA9IG1hdHJpeC5lbGVtZW50cztcblxuICAgIGNvbnN0IHcgPSBtWyAzIF0gKiB0aGlzLnggKyBtWyA3IF0gKiB0aGlzLnkgKyBtWyAxMSBdICogdGhpcy56ICsgbVsgMTUgXTtcbiAgICBjb25zdCBpbnZXID0gMS4wIC8gdztcblxuICAgIHJldHVybiBuZXcgVmVjdG9yMyggW1xuICAgICAgKCBtWyAwIF0gKiB0aGlzLnggKyBtWyA0IF0gKiB0aGlzLnkgKyBtWyA4IF0gKiB0aGlzLnogKyBtWyAxMiBdICkgKiBpbnZXLFxuICAgICAgKCBtWyAxIF0gKiB0aGlzLnggKyBtWyA1IF0gKiB0aGlzLnkgKyBtWyA5IF0gKiB0aGlzLnogKyBtWyAxMyBdICkgKiBpbnZXLFxuICAgICAgKCBtWyAyIF0gKiB0aGlzLnggKyBtWyA2IF0gKiB0aGlzLnkgKyBtWyAxMCBdICogdGhpcy56ICsgbVsgMTQgXSApICogaW52V1xuICAgIF0gKTtcbiAgfVxuXG4gIHByb3RlY3RlZCBfX25ldyggdjogcmF3VmVjdG9yMyApOiBWZWN0b3IzIHtcbiAgICByZXR1cm4gbmV3IFZlY3RvcjMoIHYgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBWZWN0b3IzKCAwLjAsIDAuMCwgMC4wIClcbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgZ2V0IHplcm8oKTogVmVjdG9yMyB7XG4gICAgcmV0dXJuIG5ldyBWZWN0b3IzKCBbIDAuMCwgMC4wLCAwLjAgXSApO1xuICB9XG5cbiAgLyoqXG4gICAqIFZlY3RvcjMoIDEuMCwgMS4wLCAxLjAgKVxuICAgKi9cbiAgcHVibGljIHN0YXRpYyBnZXQgb25lKCk6IFZlY3RvcjMge1xuICAgIHJldHVybiBuZXcgVmVjdG9yMyggWyAxLjAsIDEuMCwgMS4wIF0gKTtcbiAgfVxufVxuIiwiaW1wb3J0IHsgTWF0cml4NCB9IGZyb20gJy4vTWF0cml4NCc7XG5pbXBvcnQgeyBWZWN0b3IzIH0gZnJvbSAnLi9WZWN0b3IzJztcblxuZXhwb3J0IHR5cGUgcmF3UXVhdGVybmlvbiA9IFsgbnVtYmVyLCBudW1iZXIsIG51bWJlciwgbnVtYmVyIF07XG5cbmV4cG9ydCBjb25zdCByYXdJZGVudGl0eVF1YXRlcm5pb246IHJhd1F1YXRlcm5pb24gPSBbIDAuMCwgMC4wLCAwLjAsIDEuMCBdO1xuXG4vKipcbiAqIEEgUXVhdGVybmlvbi5cbiAqL1xuZXhwb3J0IGNsYXNzIFF1YXRlcm5pb24ge1xuICBwdWJsaWMgZWxlbWVudHM6IHJhd1F1YXRlcm5pb247IC8vIFsgeCwgeSwgejsgdyBdXG5cbiAgcHVibGljIGNvbnN0cnVjdG9yKCBlbGVtZW50czogcmF3UXVhdGVybmlvbiA9IHJhd0lkZW50aXR5UXVhdGVybmlvbiApIHtcbiAgICB0aGlzLmVsZW1lbnRzID0gZWxlbWVudHM7XG4gIH1cblxuICAvKipcbiAgICogQW4geCBjb21wb25lbnQgb2YgdGhpcy5cbiAgICovXG4gIHB1YmxpYyBnZXQgeCgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLmVsZW1lbnRzWyAwIF07XG4gIH1cblxuICAvKipcbiAgICogQW4geSBjb21wb25lbnQgb2YgdGhpcy5cbiAgICovXG4gIHB1YmxpYyBnZXQgeSgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLmVsZW1lbnRzWyAxIF07XG4gIH1cblxuICAvKipcbiAgICogQW4geiBjb21wb25lbnQgb2YgdGhpcy5cbiAgICovXG4gIHB1YmxpYyBnZXQgeigpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLmVsZW1lbnRzWyAyIF07XG4gIH1cblxuICAvKipcbiAgICogQW4gdyBjb21wb25lbnQgb2YgdGhpcy5cbiAgICovXG4gIHB1YmxpYyBnZXQgdygpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLmVsZW1lbnRzWyAzIF07XG4gIH1cblxuICBwdWJsaWMgdG9TdHJpbmcoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gYFF1YXRlcm5pb24oICR7IHRoaXMueC50b0ZpeGVkKCAzICkgfSwgJHsgdGhpcy55LnRvRml4ZWQoIDMgKSB9LCAkeyB0aGlzLnoudG9GaXhlZCggMyApIH0sICR7IHRoaXMudy50b0ZpeGVkKCAzICkgfSApYDtcbiAgfVxuXG4gIC8qKlxuICAgKiBDbG9uZSB0aGlzLlxuICAgKi9cbiAgcHVibGljIGNsb25lKCk6IFF1YXRlcm5pb24ge1xuICAgIHJldHVybiBuZXcgUXVhdGVybmlvbiggdGhpcy5lbGVtZW50cy5jb25jYXQoKSBhcyByYXdRdWF0ZXJuaW9uICk7XG4gIH1cblxuICAvKipcbiAgICogSXRzZWxmIGJ1dCBjb252ZXJ0ZWQgaW50byBhIE1hdHJpeDQuXG4gICAqL1xuICBwdWJsaWMgZ2V0IG1hdHJpeCgpOiBNYXRyaXg0IHtcbiAgICBjb25zdCB4ID0gbmV3IFZlY3RvcjMoIFsgMS4wLCAwLjAsIDAuMCBdICkuYXBwbHlRdWF0ZXJuaW9uKCB0aGlzICk7XG4gICAgY29uc3QgeSA9IG5ldyBWZWN0b3IzKCBbIDAuMCwgMS4wLCAwLjAgXSApLmFwcGx5UXVhdGVybmlvbiggdGhpcyApO1xuICAgIGNvbnN0IHogPSBuZXcgVmVjdG9yMyggWyAwLjAsIDAuMCwgMS4wIF0gKS5hcHBseVF1YXRlcm5pb24oIHRoaXMgKTtcblxuICAgIHJldHVybiBuZXcgTWF0cml4NCggW1xuICAgICAgeC54LCB5LngsIHoueCwgMC4wLFxuICAgICAgeC55LCB5LnksIHoueSwgMC4wLFxuICAgICAgeC56LCB5LnosIHoueiwgMC4wLFxuICAgICAgMC4wLCAwLjAsIDAuMCwgMS4wXG4gICAgXSApO1xuICB9XG5cbiAgLyoqXG4gICAqIEFuIGludmVyc2Ugb2YgdGhpcy5cbiAgICovXG4gIHB1YmxpYyBnZXQgaW52ZXJzZWQoKTogUXVhdGVybmlvbiB7XG4gICAgcmV0dXJuIG5ldyBRdWF0ZXJuaW9uKCBbXG4gICAgICAtdGhpcy54LFxuICAgICAgLXRoaXMueSxcbiAgICAgIC10aGlzLnosXG4gICAgICB0aGlzLndcbiAgICBdICk7XG4gIH1cblxuICAvKipcbiAgICogTXVsdGlwbHkgdHdvIFF1YXRlcm5pb25zLlxuICAgKiBAcGFyYW0gcSBBbm90aGVyIFF1YXRlcm5pb25cbiAgICovXG4gIHB1YmxpYyBtdWx0aXBseSggcTogUXVhdGVybmlvbiApOiBRdWF0ZXJuaW9uIHtcbiAgICByZXR1cm4gbmV3IFF1YXRlcm5pb24oIFtcbiAgICAgIHRoaXMudyAqIHEueCArIHRoaXMueCAqIHEudyArIHRoaXMueSAqIHEueiAtIHRoaXMueiAqIHEueSxcbiAgICAgIHRoaXMudyAqIHEueSAtIHRoaXMueCAqIHEueiArIHRoaXMueSAqIHEudyArIHRoaXMueiAqIHEueCxcbiAgICAgIHRoaXMudyAqIHEueiArIHRoaXMueCAqIHEueSAtIHRoaXMueSAqIHEueCArIHRoaXMueiAqIHEudyxcbiAgICAgIHRoaXMudyAqIHEudyAtIHRoaXMueCAqIHEueCAtIHRoaXMueSAqIHEueSAtIHRoaXMueiAqIHEuelxuICAgIF0gKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBbiBpZGVudGl0eSBRdWF0ZXJuaW9uLlxuICAgKi9cbiAgcHVibGljIHN0YXRpYyBnZXQgaWRlbnRpdHkoKTogUXVhdGVybmlvbiB7XG4gICAgcmV0dXJuIG5ldyBRdWF0ZXJuaW9uKCByYXdJZGVudGl0eVF1YXRlcm5pb24gKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZW5lcmF0ZSBhIFF1YXRlcm5pb24gb3V0IG9mIGFuZ2xlIGFuZCBheGlzLlxuICAgKi9cbiAgcHVibGljIHN0YXRpYyBmcm9tQXhpc0FuZ2xlKCBheGlzOiBWZWN0b3IzLCBhbmdsZTogbnVtYmVyICk6IFF1YXRlcm5pb24ge1xuICAgIGNvbnN0IGhhbGZBbmdsZSA9IGFuZ2xlIC8gMi4wO1xuICAgIGNvbnN0IHNpbkhhbGZBbmdsZSA9IE1hdGguc2luKCBoYWxmQW5nbGUgKTtcbiAgICByZXR1cm4gbmV3IFF1YXRlcm5pb24oIFtcbiAgICAgIGF4aXMueCAqIHNpbkhhbGZBbmdsZSxcbiAgICAgIGF4aXMueSAqIHNpbkhhbGZBbmdsZSxcbiAgICAgIGF4aXMueiAqIHNpbkhhbGZBbmdsZSxcbiAgICAgIE1hdGguY29zKCBoYWxmQW5nbGUgKVxuICAgIF0gKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZW5lcmF0ZSBhIFF1YXRlcm5pb24gb3V0IG9mIGEgcm90YXRpb24gbWF0cml4LlxuICAgKiBZb2lua2VkIGZyb20gVGhyZWUuanMuXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIGZyb21NYXRyaXgoIG1hdHJpeDogTWF0cml4NCApOiBRdWF0ZXJuaW9uIHtcbiAgICBjb25zdCBtID0gbWF0cml4LmVsZW1lbnRzLFxuICAgICAgbTExID0gbVsgMCBdLCBtMTIgPSBtWyA0IF0sIG0xMyA9IG1bIDggXSxcbiAgICAgIG0yMSA9IG1bIDEgXSwgbTIyID0gbVsgNSBdLCBtMjMgPSBtWyA5IF0sXG4gICAgICBtMzEgPSBtWyAyIF0sIG0zMiA9IG1bIDYgXSwgbTMzID0gbVsgMTAgXSxcbiAgICAgIHRyYWNlID0gbTExICsgbTIyICsgbTMzO1xuXG4gICAgaWYgKCB0cmFjZSA+IDAgKSB7XG4gICAgICBjb25zdCBzID0gMC41IC8gTWF0aC5zcXJ0KCB0cmFjZSArIDEuMCApO1xuICAgICAgcmV0dXJuIG5ldyBRdWF0ZXJuaW9uKCBbXG4gICAgICAgICggbTMyIC0gbTIzICkgKiBzLFxuICAgICAgICAoIG0xMyAtIG0zMSApICogcyxcbiAgICAgICAgKCBtMjEgLSBtMTIgKSAqIHMsXG4gICAgICAgIDAuMjUgLyBzXG4gICAgICBdICk7XG4gICAgfSBlbHNlIGlmICggbTExID4gbTIyICYmIG0xMSA+IG0zMyApIHtcbiAgICAgIGNvbnN0IHMgPSAyLjAgKiBNYXRoLnNxcnQoIDEuMCArIG0xMSAtIG0yMiAtIG0zMyApO1xuICAgICAgcmV0dXJuIG5ldyBRdWF0ZXJuaW9uKCBbXG4gICAgICAgIDAuMjUgKiBzLFxuICAgICAgICAoIG0xMiArIG0yMSApIC8gcyxcbiAgICAgICAgKCBtMTMgKyBtMzEgKSAvIHMsXG4gICAgICAgICggbTMyIC0gbTIzICkgLyBzXG4gICAgICBdICk7XG4gICAgfSBlbHNlIGlmICggbTIyID4gbTMzICkge1xuICAgICAgY29uc3QgcyA9IDIuMCAqIE1hdGguc3FydCggMS4wICsgbTIyIC0gbTExIC0gbTMzICk7XG4gICAgICByZXR1cm4gbmV3IFF1YXRlcm5pb24oIFtcbiAgICAgICAgKCBtMTIgKyBtMjEgKSAvIHMsXG4gICAgICAgIDAuMjUgKiBzLFxuICAgICAgICAoIG0yMyArIG0zMiApIC8gcyxcbiAgICAgICAgKCBtMTMgLSBtMzEgKSAvIHNcbiAgICAgIF0gKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgcyA9IDIuMCAqIE1hdGguc3FydCggMS4wICsgbTMzIC0gbTExIC0gbTIyICk7XG4gICAgICByZXR1cm4gbmV3IFF1YXRlcm5pb24oIFtcbiAgICAgICAgKCBtMTMgKyBtMzEgKSAvIHMsXG4gICAgICAgICggbTIzICsgbTMyICkgLyBzLFxuICAgICAgICAwLjI1ICogcyxcbiAgICAgICAgKCBtMjEgLSBtMTIgKSAvIHNcbiAgICAgIF0gKTtcbiAgICB9XG4gIH1cbn1cbiIsImltcG9ydCB7IFF1YXRlcm5pb24gfSBmcm9tICcuL1F1YXRlcm5pb24nO1xuaW1wb3J0IHsgVmVjdG9yMyB9IGZyb20gJy4vVmVjdG9yMyc7XG5cbmV4cG9ydCB0eXBlIHJhd01hdHJpeDQgPSBbXG4gIG51bWJlciwgbnVtYmVyLCBudW1iZXIsIG51bWJlcixcbiAgbnVtYmVyLCBudW1iZXIsIG51bWJlciwgbnVtYmVyLFxuICBudW1iZXIsIG51bWJlciwgbnVtYmVyLCBudW1iZXIsXG4gIG51bWJlciwgbnVtYmVyLCBudW1iZXIsIG51bWJlclxuXTtcblxuZXhwb3J0IGNvbnN0IHJhd0lkZW50aXR5TWF0cml4NDogcmF3TWF0cml4NCA9IFtcbiAgMS4wLCAwLjAsIDAuMCwgMC4wLFxuICAwLjAsIDEuMCwgMC4wLCAwLjAsXG4gIDAuMCwgMC4wLCAxLjAsIDAuMCxcbiAgMC4wLCAwLjAsIDAuMCwgMS4wXG5dO1xuXG4vKipcbiAqIEEgTWF0cml4NC5cbiAqL1xuZXhwb3J0IGNsYXNzIE1hdHJpeDQge1xuICBwdWJsaWMgZWxlbWVudHM6IHJhd01hdHJpeDQ7XG5cbiAgcHVibGljIGNvbnN0cnVjdG9yKCB2OiByYXdNYXRyaXg0ID0gcmF3SWRlbnRpdHlNYXRyaXg0ICkge1xuICAgIHRoaXMuZWxlbWVudHMgPSB2O1xuICB9XG5cbiAgLyoqXG4gICAqIEl0c2VsZiBidXQgdHJhbnNwb3NlZC5cbiAgICovXG4gIHB1YmxpYyBnZXQgdHJhbnNwb3NlKCk6IE1hdHJpeDQge1xuICAgIGNvbnN0IG0gPSB0aGlzLmVsZW1lbnRzO1xuXG4gICAgcmV0dXJuIG5ldyBNYXRyaXg0KCBbXG4gICAgICBtWyAwIF0sIG1bIDQgXSwgbVsgOCBdLCBtWyAxMiBdLFxuICAgICAgbVsgMSBdLCBtWyA1IF0sIG1bIDkgXSwgbVsgMTMgXSxcbiAgICAgIG1bIDIgXSwgbVsgNiBdLCBtWyAxMCBdLCBtWyAxNCBdLFxuICAgICAgbVsgMyBdLCBtWyA3IF0sIG1bIDExIF0sIG1bIDE1IF1cbiAgICBdICk7XG4gIH1cblxuICAvKipcbiAgICogSXRzIGRldGVybWluYW50LlxuICAgKi9cbiAgcHVibGljIGdldCBkZXRlcm1pbmFudCgpOiBudW1iZXIge1xuICAgIGNvbnN0IG0gPSB0aGlzLmVsZW1lbnRzO1xuICAgIGNvbnN0XG4gICAgICBhMDAgPSBtWyAgMCBdLCBhMDEgPSBtWyAgMSBdLCBhMDIgPSBtWyAgMiBdLCBhMDMgPSBtWyAgMyBdLFxuICAgICAgYTEwID0gbVsgIDQgXSwgYTExID0gbVsgIDUgXSwgYTEyID0gbVsgIDYgXSwgYTEzID0gbVsgIDcgXSxcbiAgICAgIGEyMCA9IG1bICA4IF0sIGEyMSA9IG1bICA5IF0sIGEyMiA9IG1bIDEwIF0sIGEyMyA9IG1bIDExIF0sXG4gICAgICBhMzAgPSBtWyAxMiBdLCBhMzEgPSBtWyAxMyBdLCBhMzIgPSBtWyAxNCBdLCBhMzMgPSBtWyAxNSBdLFxuICAgICAgYjAwID0gYTAwICogYTExIC0gYTAxICogYTEwLCAgYjAxID0gYTAwICogYTEyIC0gYTAyICogYTEwLFxuICAgICAgYjAyID0gYTAwICogYTEzIC0gYTAzICogYTEwLCAgYjAzID0gYTAxICogYTEyIC0gYTAyICogYTExLFxuICAgICAgYjA0ID0gYTAxICogYTEzIC0gYTAzICogYTExLCAgYjA1ID0gYTAyICogYTEzIC0gYTAzICogYTEyLFxuICAgICAgYjA2ID0gYTIwICogYTMxIC0gYTIxICogYTMwLCAgYjA3ID0gYTIwICogYTMyIC0gYTIyICogYTMwLFxuICAgICAgYjA4ID0gYTIwICogYTMzIC0gYTIzICogYTMwLCAgYjA5ID0gYTIxICogYTMyIC0gYTIyICogYTMxLFxuICAgICAgYjEwID0gYTIxICogYTMzIC0gYTIzICogYTMxLCAgYjExID0gYTIyICogYTMzIC0gYTIzICogYTMyO1xuXG4gICAgcmV0dXJuIGIwMCAqIGIxMSAtIGIwMSAqIGIxMCArIGIwMiAqIGIwOSArIGIwMyAqIGIwOCAtIGIwNCAqIGIwNyArIGIwNSAqIGIwNjtcbiAgfVxuXG4gIC8qKlxuICAgKiBJdHNlbGYgYnV0IGludmVydGVkLlxuICAgKi9cbiAgcHVibGljIGdldCBpbnZlcnNlKCk6IE1hdHJpeDQgfCBudWxsIHtcbiAgICBjb25zdCBtID0gdGhpcy5lbGVtZW50cztcbiAgICBjb25zdFxuICAgICAgYTAwID0gbVsgIDAgXSwgYTAxID0gbVsgIDEgXSwgYTAyID0gbVsgIDIgXSwgYTAzID0gbVsgIDMgXSxcbiAgICAgIGExMCA9IG1bICA0IF0sIGExMSA9IG1bICA1IF0sIGExMiA9IG1bICA2IF0sIGExMyA9IG1bICA3IF0sXG4gICAgICBhMjAgPSBtWyAgOCBdLCBhMjEgPSBtWyAgOSBdLCBhMjIgPSBtWyAxMCBdLCBhMjMgPSBtWyAxMSBdLFxuICAgICAgYTMwID0gbVsgMTIgXSwgYTMxID0gbVsgMTMgXSwgYTMyID0gbVsgMTQgXSwgYTMzID0gbVsgMTUgXSxcbiAgICAgIGIwMCA9IGEwMCAqIGExMSAtIGEwMSAqIGExMCwgIGIwMSA9IGEwMCAqIGExMiAtIGEwMiAqIGExMCxcbiAgICAgIGIwMiA9IGEwMCAqIGExMyAtIGEwMyAqIGExMCwgIGIwMyA9IGEwMSAqIGExMiAtIGEwMiAqIGExMSxcbiAgICAgIGIwNCA9IGEwMSAqIGExMyAtIGEwMyAqIGExMSwgIGIwNSA9IGEwMiAqIGExMyAtIGEwMyAqIGExMixcbiAgICAgIGIwNiA9IGEyMCAqIGEzMSAtIGEyMSAqIGEzMCwgIGIwNyA9IGEyMCAqIGEzMiAtIGEyMiAqIGEzMCxcbiAgICAgIGIwOCA9IGEyMCAqIGEzMyAtIGEyMyAqIGEzMCwgIGIwOSA9IGEyMSAqIGEzMiAtIGEyMiAqIGEzMSxcbiAgICAgIGIxMCA9IGEyMSAqIGEzMyAtIGEyMyAqIGEzMSwgIGIxMSA9IGEyMiAqIGEzMyAtIGEyMyAqIGEzMjtcblxuICAgIGNvbnN0IGRldCA9IGIwMCAqIGIxMSAtIGIwMSAqIGIxMCArIGIwMiAqIGIwOSArIGIwMyAqIGIwOCAtIGIwNCAqIGIwNyArIGIwNSAqIGIwNjtcblxuICAgIGlmICggZGV0ID09PSAwLjAgKSB7IHJldHVybiBudWxsOyB9XG5cbiAgICBjb25zdCBpbnZEZXQgPSAxLjAgLyBkZXQ7XG5cbiAgICByZXR1cm4gbmV3IE1hdHJpeDQoIFtcbiAgICAgIGExMSAqIGIxMSAtIGExMiAqIGIxMCArIGExMyAqIGIwOSxcbiAgICAgIGEwMiAqIGIxMCAtIGEwMSAqIGIxMSAtIGEwMyAqIGIwOSxcbiAgICAgIGEzMSAqIGIwNSAtIGEzMiAqIGIwNCArIGEzMyAqIGIwMyxcbiAgICAgIGEyMiAqIGIwNCAtIGEyMSAqIGIwNSAtIGEyMyAqIGIwMyxcbiAgICAgIGExMiAqIGIwOCAtIGExMCAqIGIxMSAtIGExMyAqIGIwNyxcbiAgICAgIGEwMCAqIGIxMSAtIGEwMiAqIGIwOCArIGEwMyAqIGIwNyxcbiAgICAgIGEzMiAqIGIwMiAtIGEzMCAqIGIwNSAtIGEzMyAqIGIwMSxcbiAgICAgIGEyMCAqIGIwNSAtIGEyMiAqIGIwMiArIGEyMyAqIGIwMSxcbiAgICAgIGExMCAqIGIxMCAtIGExMSAqIGIwOCArIGExMyAqIGIwNixcbiAgICAgIGEwMSAqIGIwOCAtIGEwMCAqIGIxMCAtIGEwMyAqIGIwNixcbiAgICAgIGEzMCAqIGIwNCAtIGEzMSAqIGIwMiArIGEzMyAqIGIwMCxcbiAgICAgIGEyMSAqIGIwMiAtIGEyMCAqIGIwNCAtIGEyMyAqIGIwMCxcbiAgICAgIGExMSAqIGIwNyAtIGExMCAqIGIwOSAtIGExMiAqIGIwNixcbiAgICAgIGEwMCAqIGIwOSAtIGEwMSAqIGIwNyArIGEwMiAqIGIwNixcbiAgICAgIGEzMSAqIGIwMSAtIGEzMCAqIGIwMyAtIGEzMiAqIGIwMCxcbiAgICAgIGEyMCAqIGIwMyAtIGEyMSAqIGIwMSArIGEyMiAqIGIwMFxuICAgIF0ubWFwKCAoIHYgKSA9PiB2ICogaW52RGV0ICkgYXMgcmF3TWF0cml4NCApO1xuICB9XG5cbiAgcHVibGljIHRvU3RyaW5nKCk6IHN0cmluZyB7XG4gICAgY29uc3QgbSA9IHRoaXMuZWxlbWVudHMubWFwKCAoIHYgKSA9PiB2LnRvRml4ZWQoIDMgKSApO1xuICAgIHJldHVybiBgTWF0cml4NCggJHsgbVsgMCBdIH0sICR7IG1bIDQgXSB9LCAkeyBtWyA4IF0gfSwgJHsgbVsgMTIgXSB9OyAkeyBtWyAxIF0gfSwgJHsgbVsgNSBdIH0sICR7IG1bIDkgXSB9LCAkeyBtWyAxMyBdIH07ICR7IG1bIDIgXSB9LCAkeyBtWyA2IF0gfSwgJHsgbVsgMTAgXSB9LCAkeyBtWyAxNCBdIH07ICR7IG1bIDMgXSB9LCAkeyBtWyA3IF0gfSwgJHsgbVsgMTEgXSB9LCAkeyBtWyAxNSBdIH0gKWA7XG4gIH1cblxuICAvKipcbiAgICogQ2xvbmUgdGhpcy5cbiAgICovXG4gIHB1YmxpYyBjbG9uZSgpOiBNYXRyaXg0IHtcbiAgICByZXR1cm4gbmV3IE1hdHJpeDQoIHRoaXMuZWxlbWVudHMuY29uY2F0KCkgYXMgcmF3TWF0cml4NCApO1xuICB9XG5cbiAgLyoqXG4gICAqIE11bHRpcGx5IHRoaXMgTWF0cml4NCBieSBvbmUgb3IgbW9yZSBNYXRyaXg0cy5cbiAgICovXG4gIHB1YmxpYyBtdWx0aXBseSggLi4ubWF0cmljZXM6IE1hdHJpeDRbXSApOiBNYXRyaXg0IHtcbiAgICBpZiAoIG1hdHJpY2VzLmxlbmd0aCA9PT0gMCApIHtcbiAgICAgIHJldHVybiB0aGlzLmNsb25lKCk7XG4gICAgfVxuXG4gICAgY29uc3QgYXJyID0gbWF0cmljZXMuY29uY2F0KCk7XG4gICAgbGV0IGJNYXQgPSBhcnIuc2hpZnQoKSE7XG4gICAgaWYgKCAwIDwgYXJyLmxlbmd0aCApIHtcbiAgICAgIGJNYXQgPSBiTWF0Lm11bHRpcGx5KCAuLi5hcnIgKTtcbiAgICB9XG5cbiAgICBjb25zdCBhID0gdGhpcy5lbGVtZW50cztcbiAgICBjb25zdCBiID0gYk1hdC5lbGVtZW50cztcblxuICAgIHJldHVybiBuZXcgTWF0cml4NCggW1xuICAgICAgYVsgMCBdICogYlsgMCBdICsgYVsgNCBdICogYlsgMSBdICsgYVsgOCBdICogYlsgMiBdICsgYVsgMTIgXSAqIGJbIDMgXSxcbiAgICAgIGFbIDEgXSAqIGJbIDAgXSArIGFbIDUgXSAqIGJbIDEgXSArIGFbIDkgXSAqIGJbIDIgXSArIGFbIDEzIF0gKiBiWyAzIF0sXG4gICAgICBhWyAyIF0gKiBiWyAwIF0gKyBhWyA2IF0gKiBiWyAxIF0gKyBhWyAxMCBdICogYlsgMiBdICsgYVsgMTQgXSAqIGJbIDMgXSxcbiAgICAgIGFbIDMgXSAqIGJbIDAgXSArIGFbIDcgXSAqIGJbIDEgXSArIGFbIDExIF0gKiBiWyAyIF0gKyBhWyAxNSBdICogYlsgMyBdLFxuXG4gICAgICBhWyAwIF0gKiBiWyA0IF0gKyBhWyA0IF0gKiBiWyA1IF0gKyBhWyA4IF0gKiBiWyA2IF0gKyBhWyAxMiBdICogYlsgNyBdLFxuICAgICAgYVsgMSBdICogYlsgNCBdICsgYVsgNSBdICogYlsgNSBdICsgYVsgOSBdICogYlsgNiBdICsgYVsgMTMgXSAqIGJbIDcgXSxcbiAgICAgIGFbIDIgXSAqIGJbIDQgXSArIGFbIDYgXSAqIGJbIDUgXSArIGFbIDEwIF0gKiBiWyA2IF0gKyBhWyAxNCBdICogYlsgNyBdLFxuICAgICAgYVsgMyBdICogYlsgNCBdICsgYVsgNyBdICogYlsgNSBdICsgYVsgMTEgXSAqIGJbIDYgXSArIGFbIDE1IF0gKiBiWyA3IF0sXG5cbiAgICAgIGFbIDAgXSAqIGJbIDggXSArIGFbIDQgXSAqIGJbIDkgXSArIGFbIDggXSAqIGJbIDEwIF0gKyBhWyAxMiBdICogYlsgMTEgXSxcbiAgICAgIGFbIDEgXSAqIGJbIDggXSArIGFbIDUgXSAqIGJbIDkgXSArIGFbIDkgXSAqIGJbIDEwIF0gKyBhWyAxMyBdICogYlsgMTEgXSxcbiAgICAgIGFbIDIgXSAqIGJbIDggXSArIGFbIDYgXSAqIGJbIDkgXSArIGFbIDEwIF0gKiBiWyAxMCBdICsgYVsgMTQgXSAqIGJbIDExIF0sXG4gICAgICBhWyAzIF0gKiBiWyA4IF0gKyBhWyA3IF0gKiBiWyA5IF0gKyBhWyAxMSBdICogYlsgMTAgXSArIGFbIDE1IF0gKiBiWyAxMSBdLFxuXG4gICAgICBhWyAwIF0gKiBiWyAxMiBdICsgYVsgNCBdICogYlsgMTMgXSArIGFbIDggXSAqIGJbIDE0IF0gKyBhWyAxMiBdICogYlsgMTUgXSxcbiAgICAgIGFbIDEgXSAqIGJbIDEyIF0gKyBhWyA1IF0gKiBiWyAxMyBdICsgYVsgOSBdICogYlsgMTQgXSArIGFbIDEzIF0gKiBiWyAxNSBdLFxuICAgICAgYVsgMiBdICogYlsgMTIgXSArIGFbIDYgXSAqIGJbIDEzIF0gKyBhWyAxMCBdICogYlsgMTQgXSArIGFbIDE0IF0gKiBiWyAxNSBdLFxuICAgICAgYVsgMyBdICogYlsgMTIgXSArIGFbIDcgXSAqIGJbIDEzIF0gKyBhWyAxMSBdICogYlsgMTQgXSArIGFbIDE1IF0gKiBiWyAxNSBdXG4gICAgXSApO1xuICB9XG5cbiAgLyoqXG4gICAqIE11bHRpcGx5IHRoaXMgTWF0cml4NCBieSBhIHNjYWxhclxuICAgKi9cbiAgcHVibGljIHNjYWxlU2NhbGFyKCBzY2FsYXI6IG51bWJlciApOiBNYXRyaXg0IHtcbiAgICByZXR1cm4gbmV3IE1hdHJpeDQoIHRoaXMuZWxlbWVudHMubWFwKCAoIHYgKSA9PiB2ICogc2NhbGFyICkgYXMgcmF3TWF0cml4NCApO1xuICB9XG5cbiAgLyoqXG4gICAqIEFuIGlkZW50aXR5IE1hdHJpeDQuXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIGdldCBpZGVudGl0eSgpOiBNYXRyaXg0IHtcbiAgICByZXR1cm4gbmV3IE1hdHJpeDQoIHJhd0lkZW50aXR5TWF0cml4NCApO1xuICB9XG5cbiAgcHVibGljIHN0YXRpYyBtdWx0aXBseSggLi4ubWF0cmljZXM6IE1hdHJpeDRbXSApOiBNYXRyaXg0IHtcbiAgICBpZiAoIG1hdHJpY2VzLmxlbmd0aCA9PT0gMCApIHtcbiAgICAgIHJldHVybiBNYXRyaXg0LmlkZW50aXR5O1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBiTWF0cyA9IG1hdHJpY2VzLmNvbmNhdCgpO1xuICAgICAgY29uc3QgYU1hdCA9IGJNYXRzLnNoaWZ0KCkhO1xuICAgICAgcmV0dXJuIGFNYXQubXVsdGlwbHkoIC4uLmJNYXRzICk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEdlbmVyYXRlIGEgdHJhbnNsYXRpb24gbWF0cml4LlxuICAgKiBAcGFyYW0gdmVjdG9yIFRyYW5zbGF0aW9uXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIHRyYW5zbGF0ZSggdmVjdG9yOiBWZWN0b3IzICk6IE1hdHJpeDQge1xuICAgIHJldHVybiBuZXcgTWF0cml4NCggW1xuICAgICAgMSwgMCwgMCwgMCxcbiAgICAgIDAsIDEsIDAsIDAsXG4gICAgICAwLCAwLCAxLCAwLFxuICAgICAgdmVjdG9yLngsIHZlY3Rvci55LCB2ZWN0b3IueiwgMVxuICAgIF0gKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZW5lcmF0ZSBhIDNkIHNjYWxpbmcgbWF0cml4LlxuICAgKiBAcGFyYW0gdmVjdG9yIFNjYWxlXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIHNjYWxlKCB2ZWN0b3I6IFZlY3RvcjMgKTogTWF0cml4NCB7XG4gICAgcmV0dXJuIG5ldyBNYXRyaXg0KCBbXG4gICAgICB2ZWN0b3IueCwgMCwgMCwgMCxcbiAgICAgIDAsIHZlY3Rvci55LCAwLCAwLFxuICAgICAgMCwgMCwgdmVjdG9yLnosIDAsXG4gICAgICAwLCAwLCAwLCAxXG4gICAgXSApO1xuICB9XG5cbiAgLyoqXG4gICAqIEdlbmVyYXRlIGEgM2Qgc2NhbGluZyBtYXRyaXggYnkgYSBzY2FsYXIuXG4gICAqIEBwYXJhbSB2ZWN0b3IgU2NhbGVcbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgc2NhbGVTY2FsYXIoIHNjYWxhcjogbnVtYmVyICk6IE1hdHJpeDQge1xuICAgIHJldHVybiBuZXcgTWF0cml4NCggW1xuICAgICAgc2NhbGFyLCAwLCAwLCAwLFxuICAgICAgMCwgc2NhbGFyLCAwLCAwLFxuICAgICAgMCwgMCwgc2NhbGFyLCAwLFxuICAgICAgMCwgMCwgMCwgMVxuICAgIF0gKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZW5lcmF0ZSBhIDNkIHJvdGF0aW9uIG1hdHJpeCwgcm90YXRlcyBhcm91bmQgeCBheGlzLlxuICAgKiBAcGFyYW0gdmVjdG9yIFNjYWxlXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIHJvdGF0ZVgoIHRoZXRhOiBudW1iZXIgKTogTWF0cml4NCB7XG4gICAgcmV0dXJuIG5ldyBNYXRyaXg0KCBbXG4gICAgICAxLCAwLCAwLCAwLFxuICAgICAgMCwgTWF0aC5jb3MoIHRoZXRhICksIC1NYXRoLnNpbiggdGhldGEgKSwgMCxcbiAgICAgIDAsIE1hdGguc2luKCB0aGV0YSApLCBNYXRoLmNvcyggdGhldGEgKSwgMCxcbiAgICAgIDAsIDAsIDAsIDFcbiAgICBdICk7XG4gIH1cblxuICAvKipcbiAgICogR2VuZXJhdGUgYSAzZCByb3RhdGlvbiBtYXRyaXgsIHJvdGF0ZXMgYXJvdW5kIHkgYXhpcy5cbiAgICogQHBhcmFtIHZlY3RvciBTY2FsZVxuICAgKi9cbiAgcHVibGljIHN0YXRpYyByb3RhdGVZKCB0aGV0YTogbnVtYmVyICk6IE1hdHJpeDQge1xuICAgIHJldHVybiBuZXcgTWF0cml4NCggW1xuICAgICAgTWF0aC5jb3MoIHRoZXRhICksIDAsIE1hdGguc2luKCB0aGV0YSApLCAwLFxuICAgICAgMCwgMSwgMCwgMCxcbiAgICAgIC1NYXRoLnNpbiggdGhldGEgKSwgMCwgTWF0aC5jb3MoIHRoZXRhICksIDAsXG4gICAgICAwLCAwLCAwLCAxXG4gICAgXSApO1xuICB9XG5cbiAgLyoqXG4gICAqIEdlbmVyYXRlIGEgM2Qgcm90YXRpb24gbWF0cml4LCByb3RhdGVzIGFyb3VuZCB6IGF4aXMuXG4gICAqIEBwYXJhbSB2ZWN0b3IgU2NhbGVcbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgcm90YXRlWiggdGhldGE6IG51bWJlciApOiBNYXRyaXg0IHtcbiAgICByZXR1cm4gbmV3IE1hdHJpeDQoIFtcbiAgICAgIE1hdGguY29zKCB0aGV0YSApLCAtTWF0aC5zaW4oIHRoZXRhICksIDAsIDAsXG4gICAgICBNYXRoLnNpbiggdGhldGEgKSwgTWF0aC5jb3MoIHRoZXRhICksIDAsIDAsXG4gICAgICAwLCAwLCAxLCAwLFxuICAgICAgMCwgMCwgMCwgMVxuICAgIF0gKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZW5lcmF0ZSBhIFwiTG9va0F0XCIgbWF0cml4LlxuICAgKlxuICAgKiBTZWUgYWxzbzoge0BsaW5rIGxvb2tBdEludmVyc2V9XG4gICAqL1xuICBwdWJsaWMgc3RhdGljIGxvb2tBdChcbiAgICBwb3NpdGlvbjogVmVjdG9yMyxcbiAgICB0YXJnZXQgPSBuZXcgVmVjdG9yMyggWyAwLjAsIDAuMCwgMC4wIF0gKSxcbiAgICB1cCA9IG5ldyBWZWN0b3IzKCBbIDAuMCwgMS4wLCAwLjAgXSApLFxuICAgIHJvbGwgPSAwLjBcbiAgKTogTWF0cml4NCB7XG4gICAgY29uc3QgZGlyID0gcG9zaXRpb24uc3ViKCB0YXJnZXQgKS5ub3JtYWxpemVkO1xuICAgIGxldCBzaWQgPSB1cC5jcm9zcyggZGlyICkubm9ybWFsaXplZDtcbiAgICBsZXQgdG9wID0gZGlyLmNyb3NzKCBzaWQgKTtcbiAgICBzaWQgPSBzaWQuc2NhbGUoIE1hdGguY29zKCByb2xsICkgKS5hZGQoIHRvcC5zY2FsZSggTWF0aC5zaW4oIHJvbGwgKSApICk7XG4gICAgdG9wID0gZGlyLmNyb3NzKCBzaWQgKTtcblxuICAgIHJldHVybiBuZXcgTWF0cml4NCggW1xuICAgICAgc2lkLngsIHNpZC55LCBzaWQueiwgMC4wLFxuICAgICAgdG9wLngsIHRvcC55LCB0b3AueiwgMC4wLFxuICAgICAgZGlyLngsIGRpci55LCBkaXIueiwgMC4wLFxuICAgICAgcG9zaXRpb24ueCwgcG9zaXRpb24ueSwgcG9zaXRpb24ueiwgMS4wXG4gICAgXSApO1xuICB9XG5cbiAgLyoqXG4gICAqIEdlbmVyYXRlIGFuIGludmVyc2Ugb2YgXCJMb29rQXRcIiBtYXRyaXguIEdvb2QgZm9yIGNyZWF0aW5nIGEgdmlldyBtYXRyaXguXG4gICAqXG4gICAqIFNlZSBhbHNvOiB7QGxpbmsgbG9va0F0fVxuICAgKi9cbiAgcHVibGljIHN0YXRpYyBsb29rQXRJbnZlcnNlKFxuICAgIHBvc2l0aW9uOiBWZWN0b3IzLFxuICAgIHRhcmdldCA9IG5ldyBWZWN0b3IzKCBbIDAuMCwgMC4wLCAwLjAgXSApLFxuICAgIHVwID0gbmV3IFZlY3RvcjMoIFsgMC4wLCAxLjAsIDAuMCBdICksXG4gICAgcm9sbCA9IDAuMFxuICApOiBNYXRyaXg0IHtcbiAgICBjb25zdCBkaXIgPSBwb3NpdGlvbi5zdWIoIHRhcmdldCApLm5vcm1hbGl6ZWQ7XG4gICAgbGV0IHNpZCA9IHVwLmNyb3NzKCBkaXIgKS5ub3JtYWxpemVkO1xuICAgIGxldCB0b3AgPSBkaXIuY3Jvc3MoIHNpZCApO1xuICAgIHNpZCA9IHNpZC5zY2FsZSggTWF0aC5jb3MoIHJvbGwgKSApLmFkZCggdG9wLnNjYWxlKCBNYXRoLnNpbiggcm9sbCApICkgKTtcbiAgICB0b3AgPSBkaXIuY3Jvc3MoIHNpZCApO1xuXG4gICAgcmV0dXJuIG5ldyBNYXRyaXg0KCBbXG4gICAgICBzaWQueCwgdG9wLngsIGRpci54LCAwLjAsXG4gICAgICBzaWQueSwgdG9wLnksIGRpci55LCAwLjAsXG4gICAgICBzaWQueiwgdG9wLnosIGRpci56LCAwLjAsXG4gICAgICAtc2lkLnggKiBwb3NpdGlvbi54IC0gc2lkLnkgKiBwb3NpdGlvbi55IC0gc2lkLnogKiBwb3NpdGlvbi56LFxuICAgICAgLXRvcC54ICogcG9zaXRpb24ueCAtIHRvcC55ICogcG9zaXRpb24ueSAtIHRvcC56ICogcG9zaXRpb24ueixcbiAgICAgIC1kaXIueCAqIHBvc2l0aW9uLnggLSBkaXIueSAqIHBvc2l0aW9uLnkgLSBkaXIueiAqIHBvc2l0aW9uLnosXG4gICAgICAxLjBcbiAgICBdICk7XG4gIH1cblxuICAvKipcbiAgICogR2VuZXJhdGUgYSBcIlBlcnNwZWN0aXZlXCIgcHJvamVjdGlvbiBtYXRyaXguXG4gICAqIEl0IHdvbid0IGluY2x1ZGUgYXNwZWN0IVxuICAgKi9cbiAgcHVibGljIHN0YXRpYyBwZXJzcGVjdGl2ZSggZm92ID0gNDUuMCwgbmVhciA9IDAuMDEsIGZhciA9IDEwMC4wICk6IE1hdHJpeDQge1xuICAgIGNvbnN0IHAgPSAxLjAgLyBNYXRoLnRhbiggZm92ICogTWF0aC5QSSAvIDM2MC4wICk7XG4gICAgY29uc3QgZCA9ICggZmFyIC0gbmVhciApO1xuICAgIHJldHVybiBuZXcgTWF0cml4NCggW1xuICAgICAgcCwgMC4wLCAwLjAsIDAuMCxcbiAgICAgIDAuMCwgcCwgMC4wLCAwLjAsXG4gICAgICAwLjAsIDAuMCwgLSggZmFyICsgbmVhciApIC8gZCwgLTEuMCxcbiAgICAgIDAuMCwgMC4wLCAtMiAqIGZhciAqIG5lYXIgLyBkLCAwLjBcbiAgICBdICk7XG4gIH1cblxuICAvKipcbiAgICogRGVjb21wb3NlIHRoaXMgbWF0cml4IGludG8gYSBwb3NpdGlvbiwgYSBzY2FsZSwgYW5kIGEgcm90YXRpb24uXG4gICAqIFlvaW5rZWQgZnJvbSBUaHJlZS5qcy5cbiAgICovXG4gIHB1YmxpYyBkZWNvbXBvc2UoKTogeyBwb3NpdGlvbjogVmVjdG9yMzsgc2NhbGU6IFZlY3RvcjM7IHJvdGF0aW9uOiBRdWF0ZXJuaW9uIH0ge1xuICAgIGNvbnN0IG0gPSB0aGlzLmVsZW1lbnRzO1xuXG4gICAgbGV0IHN4ID0gbmV3IFZlY3RvcjMoIFsgbVsgMCBdLCBtWyAxIF0sIG1bIDIgXSBdICkubGVuZ3RoO1xuICAgIGNvbnN0IHN5ID0gbmV3IFZlY3RvcjMoIFsgbVsgNCBdLCBtWyA1IF0sIG1bIDYgXSBdICkubGVuZ3RoO1xuICAgIGNvbnN0IHN6ID0gbmV3IFZlY3RvcjMoIFsgbVsgOCBdLCBtWyA5IF0sIG1bIDEwIF0gXSApLmxlbmd0aDtcblxuICAgIC8vIGlmIGRldGVybWluZSBpcyBuZWdhdGl2ZSwgd2UgbmVlZCB0byBpbnZlcnQgb25lIHNjYWxlXG4gICAgY29uc3QgZGV0ID0gdGhpcy5kZXRlcm1pbmFudDtcbiAgICBpZiAoIGRldCA8IDAgKSB7IHN4ID0gLXN4OyB9XG5cbiAgICBjb25zdCBpbnZTeCA9IDEuMCAvIHN4O1xuICAgIGNvbnN0IGludlN5ID0gMS4wIC8gc3k7XG4gICAgY29uc3QgaW52U3ogPSAxLjAgLyBzejtcblxuICAgIGNvbnN0IHJvdGF0aW9uTWF0cml4ID0gdGhpcy5jbG9uZSgpO1xuXG4gICAgcm90YXRpb25NYXRyaXguZWxlbWVudHNbIDAgXSAqPSBpbnZTeDtcbiAgICByb3RhdGlvbk1hdHJpeC5lbGVtZW50c1sgMSBdICo9IGludlN4O1xuICAgIHJvdGF0aW9uTWF0cml4LmVsZW1lbnRzWyAyIF0gKj0gaW52U3g7XG5cbiAgICByb3RhdGlvbk1hdHJpeC5lbGVtZW50c1sgNCBdICo9IGludlN5O1xuICAgIHJvdGF0aW9uTWF0cml4LmVsZW1lbnRzWyA1IF0gKj0gaW52U3k7XG4gICAgcm90YXRpb25NYXRyaXguZWxlbWVudHNbIDYgXSAqPSBpbnZTeTtcblxuICAgIHJvdGF0aW9uTWF0cml4LmVsZW1lbnRzWyA4IF0gKj0gaW52U3o7XG4gICAgcm90YXRpb25NYXRyaXguZWxlbWVudHNbIDkgXSAqPSBpbnZTejtcbiAgICByb3RhdGlvbk1hdHJpeC5lbGVtZW50c1sgMTAgXSAqPSBpbnZTejtcblxuICAgIHJldHVybiB7XG4gICAgICBwb3NpdGlvbjogbmV3IFZlY3RvcjMoIFsgbVsgMTIgXSwgbVsgMTMgXSwgbVsgMTQgXSBdICksXG4gICAgICBzY2FsZTogbmV3IFZlY3RvcjMoIFsgc3gsIHN5LCBzeiBdICksXG4gICAgICByb3RhdGlvbjogUXVhdGVybmlvbi5mcm9tTWF0cml4KCByb3RhdGlvbk1hdHJpeCApXG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDb21wb3NlIGEgbWF0cml4IG91dCBvZiBwb3NpdGlvbiwgc2NhbGUsIGFuZCByb3RhdGlvbi5cbiAgICogWW9pbmtlZCBmcm9tIFRocmVlLmpzLlxuICAgKi9cbiAgcHVibGljIHN0YXRpYyBjb21wb3NlKCBwb3NpdGlvbjogVmVjdG9yMywgcm90YXRpb246IFF1YXRlcm5pb24sIHNjYWxlOiBWZWN0b3IzICk6IE1hdHJpeDQge1xuICAgIGNvbnN0IHggPSByb3RhdGlvbi54LCB5ID0gcm90YXRpb24ueSwgeiA9IHJvdGF0aW9uLnosIHcgPSByb3RhdGlvbi53O1xuICAgIGNvbnN0IHgyID0geCArIHgsXHR5MiA9IHkgKyB5LCB6MiA9IHogKyB6O1xuICAgIGNvbnN0IHh4ID0geCAqIHgyLCB4eSA9IHggKiB5MiwgeHogPSB4ICogejI7XG4gICAgY29uc3QgeXkgPSB5ICogeTIsIHl6ID0geSAqIHoyLCB6eiA9IHogKiB6MjtcbiAgICBjb25zdCB3eCA9IHcgKiB4Miwgd3kgPSB3ICogeTIsIHd6ID0gdyAqIHoyO1xuICAgIGNvbnN0IHN4ID0gc2NhbGUueCwgc3kgPSBzY2FsZS55LCBzeiA9IHNjYWxlLno7XG5cbiAgICByZXR1cm4gbmV3IE1hdHJpeDQoIFtcbiAgICAgICggMS4wIC0gKCB5eSArIHp6ICkgKSAqIHN4LFxuICAgICAgKCB4eSArIHd6ICkgKiBzeCxcbiAgICAgICggeHogLSB3eSApICogc3gsXG4gICAgICAwLjAsXG5cbiAgICAgICggeHkgLSB3eiApICogc3ksXG4gICAgICAoIDEuMCAtICggeHggKyB6eiApICkgKiBzeSxcbiAgICAgICggeXogKyB3eCApICogc3ksXG4gICAgICAwLjAsXG5cbiAgICAgICggeHogKyB3eSApICogc3osXG4gICAgICAoIHl6IC0gd3ggKSAqIHN6LFxuICAgICAgKCAxLjAgLSAoIHh4ICsgeXkgKSApICogc3osXG4gICAgICAwLjAsXG5cbiAgICAgIHBvc2l0aW9uLngsXG4gICAgICBwb3NpdGlvbi55LFxuICAgICAgcG9zaXRpb24ueixcbiAgICAgIDEuMFxuICAgIF0gKTtcbiAgfVxufVxuIiwiaW1wb3J0IHsgTWF0cml4NCB9IGZyb20gJy4vTWF0cml4NCc7XG5pbXBvcnQgeyBWZWN0b3IgfSBmcm9tICcuL1ZlY3Rvcic7XG5cbmV4cG9ydCB0eXBlIHJhd1ZlY3RvcjQgPSBbIG51bWJlciwgbnVtYmVyLCBudW1iZXIsIG51bWJlciBdO1xuXG4vKipcbiAqIEEgVmVjdG9yMy5cbiAqL1xuZXhwb3J0IGNsYXNzIFZlY3RvcjQgZXh0ZW5kcyBWZWN0b3I8VmVjdG9yND4ge1xuICBwdWJsaWMgZWxlbWVudHM6IHJhd1ZlY3RvcjQ7XG5cbiAgcHVibGljIGNvbnN0cnVjdG9yKCB2OiByYXdWZWN0b3I0ID0gWyAwLjAsIDAuMCwgMC4wLCAwLjAgXSApIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMuZWxlbWVudHMgPSB2O1xuICB9XG5cbiAgLyoqXG4gICAqIEFuIHggY29tcG9uZW50IG9mIHRoaXMuXG4gICAqL1xuICBwdWJsaWMgZ2V0IHgoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5lbGVtZW50c1sgMCBdO1xuICB9XG5cbiAgcHVibGljIHNldCB4KCB4OiBudW1iZXIgKSB7XG4gICAgdGhpcy5lbGVtZW50c1sgMCBdID0geDtcbiAgfVxuXG4gIC8qKlxuICAgKiBBIHkgY29tcG9uZW50IG9mIHRoaXMuXG4gICAqL1xuICBwdWJsaWMgZ2V0IHkoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5lbGVtZW50c1sgMSBdO1xuICB9XG5cbiAgcHVibGljIHNldCB5KCB5OiBudW1iZXIgKSB7XG4gICAgdGhpcy5lbGVtZW50c1sgMSBdID0geTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBIHogY29tcG9uZW50IG9mIHRoaXMuXG4gICAqL1xuICBwdWJsaWMgZ2V0IHooKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5lbGVtZW50c1sgMiBdO1xuICB9XG5cbiAgcHVibGljIHNldCB6KCB6OiBudW1iZXIgKSB7XG4gICAgdGhpcy5lbGVtZW50c1sgMiBdID0gejtcbiAgfVxuXG4gIC8qKlxuICAgKiBBIHcgY29tcG9uZW50IG9mIHRoaXMuXG4gICAqL1xuICBwdWJsaWMgZ2V0IHcoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5lbGVtZW50c1sgMyBdO1xuICB9XG5cbiAgcHVibGljIHNldCB3KCB6OiBudW1iZXIgKSB7XG4gICAgdGhpcy5lbGVtZW50c1sgMyBdID0gejtcbiAgfVxuXG4gIHB1YmxpYyB0b1N0cmluZygpOiBzdHJpbmcge1xuICAgIHJldHVybiBgVmVjdG9yNCggJHsgdGhpcy54LnRvRml4ZWQoIDMgKSB9LCAkeyB0aGlzLnkudG9GaXhlZCggMyApIH0sICR7IHRoaXMuei50b0ZpeGVkKCAzICkgfSwgJHsgdGhpcy53LnRvRml4ZWQoIDMgKSB9IClgO1xuICB9XG5cbiAgLyoqXG4gICAqIE11bHRpcGx5IHRoaXMgdmVjdG9yICh3aXRoIGFuIGltcGxpY2l0IDEgaW4gdGhlIDR0aCBkaW1lbnNpb24pIGJ5IG0uXG4gICAqL1xuICBwdWJsaWMgYXBwbHlNYXRyaXg0KCBtYXRyaXg6IE1hdHJpeDQgKTogVmVjdG9yNCB7XG4gICAgY29uc3QgbSA9IG1hdHJpeC5lbGVtZW50cztcblxuICAgIHJldHVybiBuZXcgVmVjdG9yNCggW1xuICAgICAgbVsgMCBdICogdGhpcy54ICsgbVsgNCBdICogdGhpcy55ICsgbVsgOCBdICogdGhpcy56ICsgbVsgMTIgXSAqIHRoaXMudyxcbiAgICAgIG1bIDEgXSAqIHRoaXMueCArIG1bIDUgXSAqIHRoaXMueSArIG1bIDkgXSAqIHRoaXMueiArIG1bIDEzIF0gKiB0aGlzLncsXG4gICAgICBtWyAyIF0gKiB0aGlzLnggKyBtWyA2IF0gKiB0aGlzLnkgKyBtWyAxMCBdICogdGhpcy56ICsgbVsgMTQgXSAqIHRoaXMudyxcbiAgICAgIG1bIDMgXSAqIHRoaXMueCArIG1bIDcgXSAqIHRoaXMueSArIG1bIDExIF0gKiB0aGlzLnogKyBtWyAxNSBdICogdGhpcy53XG4gICAgXSApO1xuICB9XG5cbiAgcHJvdGVjdGVkIF9fbmV3KCB2OiByYXdWZWN0b3I0ICk6IFZlY3RvcjQge1xuICAgIHJldHVybiBuZXcgVmVjdG9yNCggdiApO1xuICB9XG5cbiAgLyoqXG4gICAqIFZlY3RvcjQoIDAuMCwgMC4wLCAwLjAsIDAuMCApXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIGdldCB6ZXJvKCk6IFZlY3RvcjQge1xuICAgIHJldHVybiBuZXcgVmVjdG9yNCggWyAwLjAsIDAuMCwgMC4wLCAwLjAgXSApO1xuICB9XG5cbiAgLyoqXG4gICAqIFZlY3RvcjQoIDEuMCwgMS4wLCAxLjAsIDEuMCApXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIGdldCBvbmUoKTogVmVjdG9yNCB7XG4gICAgcmV0dXJuIG5ldyBWZWN0b3I0KCBbIDEuMCwgMS4wLCAxLjAsIDEuMCBdICk7XG4gIH1cbn1cbiIsIi8qKlxuICogVXNlZnVsIGZvciBzd2FwIGJ1ZmZlclxuICovXG5leHBvcnQgY2xhc3MgU3dhcDxUPiB7XG4gIHB1YmxpYyBpOiBUO1xuICBwdWJsaWMgbzogVDtcblxuICBwdWJsaWMgY29uc3RydWN0b3IoIGE6IFQsIGI6IFQgKSB7XG4gICAgdGhpcy5pID0gYTtcbiAgICB0aGlzLm8gPSBiO1xuICB9XG5cbiAgcHVibGljIHN3YXAoKTogdm9pZCB7XG4gICAgY29uc3QgaSA9IHRoaXMuaTtcbiAgICB0aGlzLmkgPSB0aGlzLm87XG4gICAgdGhpcy5vID0gaTtcbiAgfVxufVxuIiwiaW1wb3J0IHsgSGlzdG9yeU1lYW5DYWxjdWxhdG9yIH0gZnJvbSAnLi4vSGlzdG9yeU1lYW5DYWxjdWxhdG9yL0hpc3RvcnlNZWFuQ2FsY3VsYXRvcic7XG5cbmV4cG9ydCBjbGFzcyBUYXBUZW1wbyB7XG4gIHByaXZhdGUgX19icG0gPSAwLjA7XG4gIHByaXZhdGUgX19sYXN0VGFwID0gMC4wO1xuICBwcml2YXRlIF9fbGFzdEJlYXQgPSAwLjA7XG4gIHByaXZhdGUgX19sYXN0VGltZSA9IDAuMDtcbiAgcHJpdmF0ZSBfX2NhbGM6IEhpc3RvcnlNZWFuQ2FsY3VsYXRvciA9IG5ldyBIaXN0b3J5TWVhbkNhbGN1bGF0b3IoIDE2ICk7XG5cbiAgcHVibGljIGdldCBiZWF0RHVyYXRpb24oKTogbnVtYmVyIHtcbiAgICByZXR1cm4gNjAuMCAvIHRoaXMuX19icG07XG4gIH1cblxuICBwdWJsaWMgZ2V0IGJwbSgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLl9fYnBtO1xuICB9XG5cbiAgcHVibGljIHNldCBicG0oIGJwbTogbnVtYmVyICkge1xuICAgIHRoaXMuX19sYXN0QmVhdCA9IHRoaXMuYmVhdDtcbiAgICB0aGlzLl9fbGFzdFRpbWUgPSBwZXJmb3JtYW5jZS5ub3coKTtcbiAgICB0aGlzLl9fYnBtID0gYnBtO1xuICB9XG5cbiAgcHVibGljIGdldCBiZWF0KCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuX19sYXN0QmVhdCArICggcGVyZm9ybWFuY2Uubm93KCkgLSB0aGlzLl9fbGFzdFRpbWUgKSAqIDAuMDAxIC8gdGhpcy5iZWF0RHVyYXRpb247XG4gIH1cblxuICBwdWJsaWMgcmVzZXQoKTogdm9pZCB7XG4gICAgdGhpcy5fX2NhbGMucmVzZXQoKTtcbiAgfVxuXG4gIHB1YmxpYyBudWRnZSggYW1vdW50OiBudW1iZXIgKTogdm9pZCB7XG4gICAgdGhpcy5fX2xhc3RCZWF0ID0gdGhpcy5iZWF0ICsgYW1vdW50O1xuICAgIHRoaXMuX19sYXN0VGltZSA9IHBlcmZvcm1hbmNlLm5vdygpO1xuICB9XG5cbiAgcHVibGljIHRhcCgpOiB2b2lkIHtcbiAgICBjb25zdCBub3cgPSBwZXJmb3JtYW5jZS5ub3coKTtcbiAgICBjb25zdCBkZWx0YSA9ICggbm93IC0gdGhpcy5fX2xhc3RUYXAgKSAqIDAuMDAxO1xuXG4gICAgaWYgKCAyLjAgPCBkZWx0YSApIHtcbiAgICAgIHRoaXMucmVzZXQoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fX2NhbGMucHVzaCggZGVsdGEgKTtcbiAgICAgIHRoaXMuX19icG0gPSA2MC4wIC8gKCB0aGlzLl9fY2FsYy5tZWFuICk7XG4gICAgfVxuXG4gICAgdGhpcy5fX2xhc3RUYXAgPSBub3c7XG4gICAgdGhpcy5fX2xhc3RUaW1lID0gbm93O1xuICAgIHRoaXMuX19sYXN0QmVhdCA9IDAuMDtcbiAgfVxufVxuIiwiZXhwb3J0IGNsYXNzIFhvcnNoaWZ0IHtcbiAgcHVibGljIHNlZWQ6IG51bWJlcjtcblxuICBwdWJsaWMgY29uc3RydWN0b3IoIHNlZWQ/OiBudW1iZXIgKSB7XG4gICAgdGhpcy5zZWVkID0gc2VlZCB8fCAxO1xuICB9XG5cbiAgcHVibGljIGdlbiggc2VlZD86IG51bWJlciApOiBudW1iZXIge1xuICAgIGlmICggc2VlZCApIHtcbiAgICAgIHRoaXMuc2VlZCA9IHNlZWQ7XG4gICAgfVxuXG4gICAgdGhpcy5zZWVkID0gdGhpcy5zZWVkIF4gKCB0aGlzLnNlZWQgPDwgMTMgKTtcbiAgICB0aGlzLnNlZWQgPSB0aGlzLnNlZWQgXiAoIHRoaXMuc2VlZCA+Pj4gMTcgKTtcbiAgICB0aGlzLnNlZWQgPSB0aGlzLnNlZWQgXiAoIHRoaXMuc2VlZCA8PCA1ICk7XG4gICAgcmV0dXJuIHRoaXMuc2VlZCAvIE1hdGgucG93KCAyLCAzMiApICsgMC41O1xuICB9XG5cbiAgcHVibGljIHNldCggc2VlZD86IG51bWJlciApOiB2b2lkIHtcbiAgICB0aGlzLnNlZWQgPSBzZWVkIHx8IHRoaXMuc2VlZCB8fCAxO1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFhvcnNoaWZ0O1xuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O0FBQUE7U0FjZ0IsWUFBWSxDQUMxQixLQUFtQixFQUNuQixnQkFBbUQ7SUFFbkQsSUFBSyxPQUFPLGdCQUFnQixLQUFLLFVBQVUsRUFBRztRQUM1QyxPQUFPLFlBQVksQ0FBRSxLQUFLLEVBQUUsQ0FBRSxPQUFPLE1BQVEsT0FBTyxHQUFHLGdCQUFnQixDQUFFLENBQUUsQ0FBQztLQUM3RTtJQUNELE1BQU0sT0FBTyxHQUFHLGdCQUE2QyxDQUFDO0lBRTlELElBQUksS0FBSyxHQUFHLENBQUMsQ0FBQztJQUNkLElBQUksR0FBRyxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUM7SUFFdkIsT0FBUSxLQUFLLEdBQUcsR0FBRyxFQUFHO1FBQ3BCLE1BQU0sTUFBTSxHQUFHLENBQUUsS0FBSyxHQUFHLEdBQUcsS0FBTSxDQUFDLENBQUM7UUFDcEMsTUFBTSxhQUFhLEdBQUcsS0FBSyxDQUFFLE1BQU0sQ0FBRSxDQUFDO1FBRXRDLE1BQU0sYUFBYSxHQUFHLE9BQU8sQ0FBRSxhQUFhLENBQUUsQ0FBQztRQUUvQyxJQUFLLGFB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QUFDLENBQUUsQ0FBQyxDQUFFLEVBQUUsQ0FBQyxDQUFFLEVBQUUsQ0FBRTtZQUMvQixDQUFDLENBQUUsQ0FBQyxDQUFFLEVBQUUsQ0FBQyxDQUFFLENBQUMsQ0FBRSxFQUFFLENBQUMsQ0FBRSxDQUFDLENBQUUsRUFBRSxDQUFDLENBQUUsRUFBRSxDQUFFO1lBQy9CLENBQUMsQ0FBRSxDQUFDLENBQUUsRUFBRSxDQUFDLENBQUUsQ0FBQyxDQUFFLEVBQUUsQ0FBQyxDQUFFLEVBQUUsQ0FBRSxFQUFFLENBQUMsQ0FBRSxFQUFFLENBQUU7WUFDaEMsQ0FBQyxDQUFFLENBQUMsQ0FBRSxFQUFFLENBQUMsQ0FBRSxDQUFDLENBQUUsRUFBRSxDQUFDLENBQUUsRUFBRSxDQUFFLEVBQUUsQ0FBQyxDQUFFLEVBQUUsQ0FBRTtTQUNqQyxDQUFFLENBQUM7S0FDTDs7OztJQUtELElBQVcsV0FBVztRQUNwQixNQUFNLENBQUMsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDO1FBQ3hCLE1BQ0UsR0FBRyxHQUFHLENBQUMsQ0FBRyxDQUFDLENBQUUsRUFBRSxHQUFHLEdBQUcsQ0FBQyxDQUFHLENBQUMsQ0FBRSxFQUFFLEdBQUcsR0FBRyxDQUFDLENBQUcsQ0FBQyxDQUFFLEVBQUUsR0FBRyxHQUFHLENBQUMsQ0FBRyxDQUFDLENBQUUsRUFDMUQsR0FBRyxHQUFHLENBQUMsQ0FBRyxDQUFDLENBQUUsRUFBRSxHQUFHLEdBQUcsQ0FBQyxDQUFHLENBQUMsQ0FBRSxFQUFFLEdBQUcsR0FBRyxDQUFDLENBQUcsQ0FBQyxDQUFFLEVBQUUsR0FBRyxHQUFHLENBQUMsQ0FBRyxDQUFDLENBQUUsRUFDMUQsR0FBRyxHQUFHLENBQUMsQ0FBRyxDQUFDLENBQUUsRUFBRSxHQUFHLEdBQUcsQ0FBQyxDQUFHLENBQUMsQ0FBRSxFQUFFLEdBQUcsR0FBRyxDQUFDLENBQUUsRUFBRSxDQUFFLEVBQUUsR0FBRyxHQUFHLENBQUMsQ0FBRSxFQUFFLENBQUUsRUFDMUQsR0FBRyxHQUFHLENBQUMsQ0FBRSxFQUFFLENBQUUsRUFBRSxHQUFHLEdBQUcsQ0FBQyxDQUFFLEVBQUUsQ0FBRSxFQUFFLEdBQUcsR0FBRyxDQUFDLENBQUUsRUFBRSxDQUFFLEVBQUUsR0FBRyxHQUFHLENBQUMsQ0FBRSxFQUFFLENBQUUsRUFDMUQsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsRUFBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxFQUN6RCxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxFQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEVBQ3pELEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEVBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsRUFDekQsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsRUFBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxFQUN6RCxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxFQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEVBQ3pELEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEVBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQztRQUU1RCxPQUFPLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDO0tBQzlFOzs7O0lBS0QsSUFBVyxPQUFPO1FBQ2hCLE1BQU0sQ0FBQyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUM7UUFDeEIsTUFDRSxHQUFHLEdBQUcsQ0FBQyxDQUFHLENBQUMsQ0FBRSxFQUFFLEdBQUcsR0FBRyxDQUFDLENBQUcsQ0FBQyxDQUFFLEVBQUUsR0FBRyxHQUFHLENBQUMsQ0FBRyxDQUFDLENBQUUsRUFBRSxHQUFHLEdBQUcsQ0FBQyxDQUFHLENBQUMsQ0FBRSxFQUMxRCxHQUFHLEdBQUcsQ0FBQyxDQUFHLENBQUMsQ0FBRSxFQUFFLEdBQUcsR0FBRyxDQUFDLENBQUcsQ0FBQyxDQUFFLEVBQUUsR0FBRyxHQUFHLENBQUMsQ0FBRyxDQUFDLENBQUUsRUFBRSxHQUFHLEdBQUcsQ0FBQyxDQUFHLENBQUMsQ0FBRSxFQUMxRCxHQUFHLEdBQUcsQ0FBQyxDQUFHLENBQUMsQ0FBRSxFQUFFLEdBQUcsR0FBRyxDQUFDLENBQUcsQ0FBQyxDQUFFLEVBQUUsR0FBRyxHQUFHLENBQUMsQ0FBRSxFQUFFLENBQUUsRUFBRSxHQUFHLEdBQUcsQ0FBQyxDQUFFLEVBQUUsQ0FBRSxFQUMxRCxHQUFHLEdBQUcsQ0FBQyxDQUFFLEVBQUUsQ0FBRSxFQUFFLEdBQUcsR0FBRyxDQUFDLENBQUUsRUFBRSxDQUFFLEVBQUUsR0FBRyxHQUFHLENBQUMsQ0FBRSxFQUFFLENBQUUsRUFBRSxHQUFHLEdBQUcsQ0FBQyxDQUFFLEVBQUUsQ0FBRSxFQUMxRCxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxFQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEVBQ3pELEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEVBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsRUFDekQsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsRUFBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxFQUN6RCxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxFQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEVBQ3pELEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEVBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsRUFDekQsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsRUFBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDO1FBRTVELE1BQU0sR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDO1FBRWxGLElBQUssR0FBRyxLQUFLLEdBQUcsRUFBRztZQUFFLE9BQU8sSUFBSSxDQUFDO1NBQUU7UUFFbkMsTUFBTSxNQUFNLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQztRQUV6QixPQUFPLElBQUksT0FBTyxDQUFFO1lBQ2xCLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRztZQUNqQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUc7WUFDakMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHO1lBQ2pDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRztZQUNqQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUc7WUFDakMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHO1lBQ2pDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRztZQUNqQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUc7WUFDakMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHO1lBQ2pDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRztZQUNqQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUc7WUFDakMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHO1lBQ2pDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRztZQUNqQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUc7WUFDakMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHO1lBQ2pDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRztTQUNsQyxDQUFDLEdBQUcsQ0FBRSxDQUFFLENBQUMsS0FBTSxDQUFDLEdBQUcsTUFBTSxDQUFnQixDQUFFLENBQUM7S0FDOUM7SUFFTSxRQUFRO1FBQ2IsTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUUsQ0FBRSxDQUFDLEtBQU0sQ0FBQyxDQUFDLE9BQU8sQ0FBRSxDQUFDLENBQUUsQ0FBRSxDQUFDO1FBQ3ZELE9BQU8sWUFBYSxDQUFDLENBQUUsQ0FBQyxDQUFHLEtBQU0sQ0FBQyxDQUFFLENBQUMsQ0FBRyxLQUFNLENBQUMsQ0FBRSxDQUFDLENBQUcsS0FBTSxDQUFDLENBQUUsRUFBRSxDQUFHLEtBQU0sQ0FBQyxDQUFFLENBQUMsQ0FBRyxLQUFNLENBQUMsQ0FBRSxDQUFDLENBQUcsS0FBTSxDQUFDLENBQUUsQ0FBQyxDQUFHLEtBQU0sQ0FBQyxDQUFFLEVBQUUsQ0FBRyxLQUFNLENBQUMsQ0FBRSxDQUFDLENBQUcsS0FBTSxDQUFDLENBQUUsQ0FBQyxDQUFHLEtBQU0sQ0FBQyxDQUFFLEVBQUUsQ0FBRyxLQUFNLENBQUMsQ0FBRSxFQUFFLENBQUcsS0FBTSxDQUFDLENBQUUsQ0FBQyxDQUFHLEtBQU0sQ0FBQyxDQUFFLENBQUMsQ0FBRyxLQUFNLENBQUMsQ0FBRSxFQUFFLENBQUcsS0FBTSxDQUFDLENBQUUsRUFBRSxDQUFHLElBQUksQ0FBQztLQUMxTzs7OztJQUtNLEtBQUs7UUFDVixPQUFPLElBQUksT0FBTyxDQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFnQixDQUFFLENBQUM7S0FDNUQ7Ozs7SUFLTSxRQUFRLENBQUUsR0FBRyxRQUFtQjtRQUNyQyxJQUFLLFFBQVEsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFHO1lBQzNCLE9BQU8sSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO1NBQ3JCO1FBRUQsTUFBTSxHQUFHLEdBQUcsUUFBUSxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQzlCLElBQUksSUFBSSxHQUFHLEdBQUcsQ0FBQyxLQUFLLEVBQUcsQ0FBQztRQUN4QixJQUFLLENBQUMsR0FBRyxHQUFHLENBQUMsTUFBTSxFQUFHO1lBQ3BCLElBQUksR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFFLEdBQUcsR0FBRyxDQUFFLENBQUM7U0FDaEM7UUFFRCxNQUFNLENBQUMsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDO1FBQ3hCLE1BQU0sQ0FBQyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUM7UUFFeEIsT0FBTyxJQUFJLE9BQU8sQ0FBRTtZQUNsQixDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsRUFBRSxDQUFFLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRTtZQUN0RSxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsRUFBRSxDQUFFLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRTtZQUN0RSxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLEVBQUUsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsRUFBRSxDQUFFLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRTtZQUN2RSxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLEVBQUUsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsRUFBRSxDQUFFLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRTtZQUV2RSxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsRUFBRSxDQUFFLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRTtZQUN0RSxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsRUFBRSxDQUFFLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRTtZQUN0RSxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLEVBQUUsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsRUFBRSxDQUFFLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRTtZQUN2RSxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLEVBQUUsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsRUFBRSxDQUFFLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRTtZQUV2RSxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxFQUFFLENBQUUsR0FBRyxDQUFDLENBQUUsRUFBRSxDQUFFLEdBQUcsQ0FBQyxDQUFFLEVBQUUsQ0FBRTtZQUN4RSxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxFQUFFLENBQUUsR0FBRyxDQUFDLENBQUUsRUFBRSxDQUFFLEdBQUcsQ0FBQyxDQUFFLEVBQUUsQ0FBRTtZQUN4RSxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLEVBQUUsQ0FBRSxHQUFHLENBQUMsQ0FBRSxFQUFFLENBQUUsR0FBRyxDQUFDLENBQUUsRUFBRSxDQUFFLEdBQUcsQ0FBQyxDQUFFLEVBQUUsQ0FBRTtZQUN6RSxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLEVBQUUsQ0FBRSxHQUFHLENBQUMsQ0FBRSxFQUFFLENBQUUsR0FBRyxDQUFDLENBQUUsRUFBRSxDQUFFLEdBQUcsQ0FBQyxDQUFFLEVBQUUsQ0FBRTtZQUV6RSxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLEVBQUUsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsRUFBRSxDQUFFLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxFQUFFLENBQUUsR0FBRyxDQUFDLENBQUUsRUFBRSxDQUFFLEdBQUcsQ0FBQyxDQUFFLEVBQUUsQ0FBRTtZQUMxRSxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLEVBQUUsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsRUFBRSxDQUFFLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxFQUFFLENBQUUs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QWE7UUFDdkIsSUFBSyxJQUFJLEVBQUc7WUFDVixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztTQUNsQjtRQUVELElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksSUFBSyxJQUFJLENBQUMsSUFBSSxJQUFJLEVBQUUsQ0FBRSxDQUFDO1FBQzVDLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksSUFBSyxJQUFJLENBQUMsSUFBSSxLQUFLLEVBQUUsQ0FBRSxDQUFDO1FBQzdDLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksSUFBSyxJQUFJLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBRSxDQUFDO1FBQzNDLE9BQU8sSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFFLENBQUMsRUFBRSxFQUFFLENBQUUsR0FBRyxHQUFHLENBQUM7S0FDNUM7SUFFTSxHQUFHLENBQUUsSUFBYTtRQUN2QixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksSUFBSSxJQUFJLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQztLQUNwQzs7Ozs7In0=
