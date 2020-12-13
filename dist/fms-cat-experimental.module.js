/*!
* @fms-cat/experimental v0.5.0
* Experimental edition of FMS_Cat
*
* Copyright (c) 2019-2020 FMS_Cat
* @fms-cat/experimental is distributed under MIT License
* https://github.com/FMS-Cat/experimental-npm/blob/master/LICENSE
*/
// yoinked from https://stackoverflow.com/questions/1344500/efficient-way-to-insert-a-number-into-a-sorted-array-of-numbers
function binarySearch(array, elementOrCompare) {
    if (typeof elementOrCompare !== 'function') {
        return binarySearch(array, (element) => (element <= elementOrCompare));
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

export { CDS, Clock, ClockFrame, ClockRealtime, ExpSmooth, FMS_Cat, FizzBuzz, HistoryMeanCalculator, HistoryMedianCalculator, Matrix4, Quaternion, Swap, TRIANGLE_STRIP_QUAD, TRIANGLE_STRIP_QUAD_3D, TRIANGLE_STRIP_QUAD_NORMAL, TRIANGLE_STRIP_QUAD_UV, TapTempo, Vector, Vector3, Vector4, Xorshift, binarySearch, clamp, edt1d, edt2d, lerp, linearstep, matrix2d, range, rawIdentityMatrix4, rawIdentityQuaternion, saturate, shuffleArray, smootherstep, smootheststep, smoothstep, triIndexToLineIndex };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm1zLWNhdC1leHBlcmltZW50YWwubW9kdWxlLmpzIiwic291cmNlcyI6WyIuLi9zcmMvYWxnb3JpdGhtL2JpbmFyeVNlYXJjaC50cyIsIi4uL3NyYy9hcnJheS9jb25zdGFudHMudHMiLCIuLi9zcmMvYXJyYXkvdXRpbHMudHMiLCIuLi9zcmMvQ0RTL0NEUy50cyIsIi4uL3NyYy9DbG9jay9DbG9jay50cyIsIi4uL3NyYy9DbG9jay9DbG9ja0ZyYW1lLnRzIiwiLi4vc3JjL0Nsb2NrL0Nsb2NrUmVhbHRpbWUudHMiLCIuLi9zcmMvZWR0L2VkdC50cyIsIi4uL3NyYy9tYXRoL3V0aWxzLnRzIiwiLi4vc3JjL0V4cFNtb290aC9FeHBTbW9vdGgudHMiLCIuLi9zcmMvRml6ekJ1enovRml6ekJ1enoudHMiLCIuLi9zcmMvRk1TX0NhdC9GTVNfQ2F0LnRzIiwiLi4vc3JjL0hpc3RvcnlNZWFuQ2FsY3VsYXRvci9IaXN0b3J5TWVhbkNhbGN1bGF0b3IudHMiLCIuLi9zcmMvSGlzdG9yeU1lYW5DYWxjdWxhdG9yL0hpc3RvcnlQZXJjZW50aWxlQ2FsY3VsYXRvci50cyIsIi4uL3NyYy9IaXN0b3J5TWVhbkNhbGN1bGF0b3IvSGlzdG9yeU1lZGlhbkNhbGN1bGF0b3IudHMiLCIuLi9zcmMvbWF0aC9WZWN0b3IudHMiLCIuLi9zcmMvbWF0aC9WZWN0b3IzLnRzIiwiLi4vc3JjL21hdGgvUXVhdGVybmlvbi50cyIsIi4uL3NyYy9tYXRoL01hdHJpeDQudHMiLCIuLi9zcmMvbWF0aC9WZWN0b3I0LnRzIiwiLi4vc3JjL1N3YXAvU3dhcC50cyIsIi4uL3NyYy9UYXBUZW1wby9UYXBUZW1wby50cyIsIi4uL3NyYy9Yb3JzaGlmdC9Yb3JzaGlmdC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyB5b2lua2VkIGZyb20gaHR0cHM6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMTM0NDUwMC9lZmZpY2llbnQtd2F5LXRvLWluc2VydC1hLW51bWJlci1pbnRvLWEtc29ydGVkLWFycmF5LW9mLW51bWJlcnNcblxuLyoqXG4gKiBMb29rIGZvciBhbiBpbmRleCBmcm9tIGEgc29ydGVkIGxpc3QgdXNpbmcgdGhlIGJpbmFyeSBzZWFyY2guXG4gKiBAcGFyYW0gYXJyYXkgQSBzb3J0ZWQgYXJyYXlcbiAqIEBwYXJhbSBjb21wYXJlIE1ha2UgdGhpcyBmdW5jdGlvbiByZXR1cm4gYGZhbHNlYCBpZiB5b3Ugd2FudCB0byBwb2ludCByaWdodCBzaWRlIG9mIGdpdmVuIGVsZW1lbnQsIGB0cnVlYCBpZiB5b3Ugd2FudCB0byBwb2ludCBsZWZ0IHNpZGUgb2YgZ2l2ZW4gZWxlbWVudC5cbiAqIEByZXR1cm5zIEFuIGluZGV4IGZvdW5kXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBiaW5hcnlTZWFyY2g8VD4oIGFycmF5OiBBcnJheUxpa2U8VD4sIGVsZW1lbnQ6IFQgKTogbnVtYmVyO1xuZXhwb3J0IGZ1bmN0aW9uIGJpbmFyeVNlYXJjaDxUPiggYXJyYXk6IEFycmF5TGlrZTxUPiwgY29tcGFyZTogKCBlbGVtZW50OiBUICkgPT4gYm9vbGVhbiApOiBudW1iZXI7XG5leHBvcnQgZnVuY3Rpb24gYmluYXJ5U2VhcmNoPFQ+KFxuICBhcnJheTogQXJyYXlMaWtlPFQ+LFxuICBlbGVtZW50T3JDb21wYXJlOiBUIHwgKCAoIGVsZW1lbnQ6IFQgKSA9PiBib29sZWFuICksXG4pOiBudW1iZXIge1xuICBpZiAoIHR5cGVvZiBlbGVtZW50T3JDb21wYXJlICE9PSAnZnVuY3Rpb24nICkge1xuICAgIHJldHVybiBiaW5hcnlTZWFyY2goIGFycmF5LCAoIGVsZW1lbnQgKSA9PiAoIGVsZW1lbnQgPD0gZWxlbWVudE9yQ29tcGFyZSApICk7XG4gIH1cbiAgY29uc3QgY29tcGFyZSA9IGVsZW1lbnRPckNvbXBhcmUgYXMgKCBlbGVtZW50OiBUICkgPT4gYm9vbGVhbjtcblxuICBsZXQgc3RhcnQgPSAwO1xuICBsZXQgZW5kID0gYXJyYXkubGVuZ3RoO1xuXG4gIHdoaWxlICggc3RhcnQgPCBlbmQgKSB7XG4gICAgY29uc3QgY2VudGVyID0gKCBzdGFydCArIGVuZCApID4+IDE7XG4gICAgY29uc3QgY2VudGVyRWxlbWVudCA9IGFycmF5WyBjZW50ZXIgXTtcblxuICAgIGNvbnN0IGNvbXBhcmVSZXN1bHQgPSBjb21wYXJlKCBjZW50ZXJFbGVtZW50ICk7XG5cbiAgICBpZiAoIGNvbXBhcmVSZXN1bHQgKSB7XG4gICAgICBzdGFydCA9IGNlbnRlciArIDE7XG4gICAgfSBlbHNlIHtcbiAgICAgIGVuZCA9IGNlbnRlcjtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gc3RhcnQ7XG59XG4iLCIvKipcbiAqIGBbIC0xLCAtMSwgMSwgLTEsIC0xLCAxLCAxLCAxIF1gXG4gKi9cbmV4cG9ydCBjb25zdCBUUklBTkdMRV9TVFJJUF9RVUFEID0gWyAtMSwgLTEsIDEsIC0xLCAtMSwgMSwgMSwgMSBdO1xuXG4vKipcbiAqIGBbIC0xLCAtMSwgMCwgMSwgLTEsIDAsIC0xLCAxLCAwLCAxLCAxLCAwIF1gXG4gKi9cbmV4cG9ydCBjb25zdCBUUklBTkdMRV9TVFJJUF9RVUFEXzNEID0gWyAtMSwgLTEsIDAsIDEsIC0xLCAwLCAtMSwgMSwgMCwgMSwgMSwgMCBdO1xuXG4vKipcbiAqIGBbIDAsIDAsIDEsIDAsIDAsIDEsIDAsIDAsIDEsIDAsIDAsIDEgXWBcbiAqL1xuZXhwb3J0IGNvbnN0IFRSSUFOR0xFX1NUUklQX1FVQURfTk9STUFMID0gWyAwLCAwLCAxLCAwLCAwLCAxLCAwLCAwLCAxLCAwLCAwLCAxIF07XG5cbi8qKlxuICogYFsgMCwgMCwgMSwgMCwgMCwgMSwgMSwgMSBdYFxuICovXG5leHBvcnQgY29uc3QgVFJJQU5HTEVfU1RSSVBfUVVBRF9VViA9IFsgMCwgMCwgMSwgMCwgMCwgMSwgMSwgMSBdO1xuIiwiLyoqXG4gKiBTaHVmZmxlIGdpdmVuIGBhcnJheWAgdXNpbmcgZ2l2ZW4gYGRpY2VgIFJORy4gKipEZXN0cnVjdGl2ZSoqLlxuICovXG5leHBvcnQgZnVuY3Rpb24gc2h1ZmZsZUFycmF5PFQ+KCBhcnJheTogVFtdLCBkaWNlPzogKCkgPT4gbnVtYmVyICk6IFRbXSB7XG4gIGNvbnN0IGYgPSBkaWNlID8gZGljZSA6ICgpID0+IE1hdGgucmFuZG9tKCk7XG4gIGZvciAoIGxldCBpID0gMDsgaSA8IGFycmF5Lmxlbmd0aCAtIDE7IGkgKysgKSB7XG4gICAgY29uc3QgaXIgPSBpICsgTWF0aC5mbG9vciggZigpICogKCBhcnJheS5sZW5ndGggLSBpICkgKTtcbiAgICBjb25zdCB0ZW1wID0gYXJyYXlbIGlyIF07XG4gICAgYXJyYXlbIGlyIF0gPSBhcnJheVsgaSBdO1xuICAgIGFycmF5WyBpIF0gPSB0ZW1wO1xuICB9XG4gIHJldHVybiBhcnJheTtcbn1cblxuLyoqXG4gKiBJIGxpa2Ugd2lyZWZyYW1lXG4gKlxuICogYHRyaUluZGV4VG9MaW5lSW5kZXgoIFsgMCwgMSwgMiwgNSwgNiwgNyBdIClgIC0+IGBbIDAsIDEsIDEsIDIsIDIsIDAsIDUsIDYsIDYsIDcsIDcsIDUgXWBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHRyaUluZGV4VG9MaW5lSW5kZXg8VD4oIGFycmF5OiBUW10gKTogVFtdIHtcbiAgY29uc3QgcmV0OiBUW10gPSBbXTtcbiAgZm9yICggbGV0IGkgPSAwOyBpIDwgYXJyYXkubGVuZ3RoIC8gMzsgaSArKyApIHtcbiAgICBjb25zdCBoZWFkID0gaSAqIDM7XG4gICAgcmV0LnB1c2goXG4gICAgICBhcnJheVsgaGVhZCAgICAgXSwgYXJyYXlbIGhlYWQgKyAxIF0sXG4gICAgICBhcnJheVsgaGVhZCArIDEgXSwgYXJyYXlbIGhlYWQgKyAyIF0sXG4gICAgICBhcnJheVsgaGVhZCArIDIgXSwgYXJyYXlbIGhlYWQgICAgIF1cbiAgICApO1xuICB9XG4gIHJldHVybiByZXQ7XG59XG5cbi8qKlxuICogYG1hdHJpeDJkKCAzLCAyIClgIC0+IGBbIDAsIDAsIDAsIDEsIDAsIDIsIDEsIDAsIDEsIDEsIDEsIDIgXWBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG1hdHJpeDJkKCB3OiBudW1iZXIsIGg6IG51bWJlciApOiBudW1iZXJbXSB7XG4gIGNvbnN0IGFycjogbnVtYmVyW10gPSBbXTtcbiAgZm9yICggbGV0IGl5ID0gMDsgaXkgPCBoOyBpeSArKyApIHtcbiAgICBmb3IgKCBsZXQgaXggPSAwOyBpeCA8IHc7IGl4ICsrICkge1xuICAgICAgYXJyLnB1c2goIGl4LCBpeSApO1xuICAgIH1cbiAgfVxuICByZXR1cm4gYXJyO1xufVxuIiwiLyoqXG4gKiBDcml0aWNhbGx5IERhbXBlZCBTcHJpbmdcbiAqXG4gKiBTaG91dG91dHMgdG8gS2VpamlybyBUYWthaGFzaGlcbiAqL1xuZXhwb3J0IGNsYXNzIENEUyB7XG4gIHB1YmxpYyBmYWN0b3IgPSAxMDAuMDtcbiAgcHVibGljIHJhdGlvID0gMS4wO1xuICBwdWJsaWMgdmVsb2NpdHkgPSAwLjA7XG4gIHB1YmxpYyB2YWx1ZSA9IDAuMDtcbiAgcHVibGljIHRhcmdldCA9IDAuMDtcblxuICBwdWJsaWMgdXBkYXRlKCBkZWx0YVRpbWU6IG51bWJlciApOiBudW1iZXIge1xuICAgIHRoaXMudmVsb2NpdHkgKz0gKFxuICAgICAgLXRoaXMuZmFjdG9yICogKCB0aGlzLnZhbHVlIC0gdGhpcy50YXJnZXQgKVxuICAgICAgLSAyLjAgKiB0aGlzLnZlbG9jaXR5ICogTWF0aC5zcXJ0KCB0aGlzLmZhY3RvciApICogdGhpcy5yYXRpb1xuICAgICkgKiBkZWx0YVRpbWU7XG4gICAgdGhpcy52YWx1ZSArPSB0aGlzLnZlbG9jaXR5ICogZGVsdGFUaW1lO1xuICAgIHJldHVybiB0aGlzLnZhbHVlO1xuICB9XG59XG4iLCIvKipcbiAqIENsYXNzIHRoYXQgZGVhbHMgd2l0aCB0aW1lLlxuICogSW4gdGhpcyBiYXNlIGNsYXNzLCB5b3UgbmVlZCB0byBzZXQgdGltZSBtYW51YWxseSBmcm9tIGBBdXRvbWF0b24udXBkYXRlKClgLlxuICogQmVzdCBmb3Igc3luYyB3aXRoIGV4dGVybmFsIGNsb2NrIHN0dWZmLlxuICovXG5leHBvcnQgY2xhc3MgQ2xvY2sge1xuICAvKipcbiAgICogSXRzIGN1cnJlbnQgdGltZS5cbiAgICovXG4gIHByb3RlY3RlZCBfX3RpbWUgPSAwLjA7XG5cbiAgLyoqXG4gICAqIEl0cyBkZWx0YVRpbWUgb2YgbGFzdCB1cGRhdGUuXG4gICAqL1xuICBwcm90ZWN0ZWQgX19kZWx0YVRpbWUgPSAwLjA7XG5cbiAgLyoqXG4gICAqIFdoZXRoZXIgaXRzIGN1cnJlbnRseSBwbGF5aW5nIG9yIG5vdC5cbiAgICovXG4gIHByb3RlY3RlZCBfX2lzUGxheWluZyA9IGZhbHNlO1xuXG4gIC8qKlxuICAgKiBJdHMgY3VycmVudCB0aW1lLlxuICAgKi9cbiAgcHVibGljIGdldCB0aW1lKCk6IG51bWJlciB7IHJldHVybiB0aGlzLl9fdGltZTsgfVxuXG4gIC8qKlxuICAgKiBJdHMgZGVsdGFUaW1lIG9mIGxhc3QgdXBkYXRlLlxuICAgKi9cbiAgcHVibGljIGdldCBkZWx0YVRpbWUoKTogbnVtYmVyIHsgcmV0dXJuIHRoaXMuX19kZWx0YVRpbWU7IH1cblxuICAvKipcbiAgICogV2hldGhlciBpdHMgY3VycmVudGx5IHBsYXlpbmcgb3Igbm90LlxuICAgKi9cbiAgcHVibGljIGdldCBpc1BsYXlpbmcoKTogYm9vbGVhbiB7IHJldHVybiB0aGlzLl9faXNQbGF5aW5nOyB9XG5cbiAgLyoqXG4gICAqIFVwZGF0ZSB0aGUgY2xvY2suXG4gICAqIEBwYXJhbSB0aW1lIFRpbWUuIFlvdSBuZWVkIHRvIHNldCBtYW51YWxseSB3aGVuIHlvdSBhcmUgdXNpbmcgbWFudWFsIENsb2NrXG4gICAqL1xuICBwdWJsaWMgdXBkYXRlKCB0aW1lPzogbnVtYmVyICk6IHZvaWQge1xuICAgIGNvbnN0IHByZXZUaW1lID0gdGhpcy5fX3RpbWU7XG4gICAgdGhpcy5fX3RpbWUgPSB0aW1lIHx8IDAuMDtcbiAgICB0aGlzLl9fZGVsdGFUaW1lID0gdGhpcy5fX3RpbWUgLSBwcmV2VGltZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTdGFydCB0aGUgY2xvY2suXG4gICAqL1xuICBwdWJsaWMgcGxheSgpOiB2b2lkIHtcbiAgICB0aGlzLl9faXNQbGF5aW5nID0gdHJ1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTdG9wIHRoZSBjbG9jay5cbiAgICovXG4gIHB1YmxpYyBwYXVzZSgpOiB2b2lkIHtcbiAgICB0aGlzLl9faXNQbGF5aW5nID0gZmFsc2U7XG4gIH1cblxuICAvKipcbiAgICogU2V0IHRoZSB0aW1lIG1hbnVhbGx5LlxuICAgKiBAcGFyYW0gdGltZSBUaW1lXG4gICAqL1xuICBwdWJsaWMgc2V0VGltZSggdGltZTogbnVtYmVyICk6IHZvaWQge1xuICAgIHRoaXMuX190aW1lID0gdGltZTtcbiAgfVxufVxuIiwiaW1wb3J0IHsgQ2xvY2sgfSBmcm9tICcuL0Nsb2NrJztcblxuLyoqXG4gKiBDbGFzcyB0aGF0IGRlYWxzIHdpdGggdGltZS5cbiAqIFRoaXMgaXMgXCJmcmFtZVwiIHR5cGUgY2xvY2ssIHRoZSBmcmFtZSBpbmNyZWFzZXMgZXZlcnkge0BsaW5rIENsb2NrRnJhbWUjdXBkYXRlfSBjYWxsLlxuICogQHBhcmFtIGZwcyBGcmFtZXMgcGVyIHNlY29uZFxuICovXG5leHBvcnQgY2xhc3MgQ2xvY2tGcmFtZSBleHRlbmRzIENsb2NrIHtcbiAgLyoqXG4gICAqIEl0cyBjdXJyZW50IGZyYW1lLlxuICAgKi9cbiAgcHJpdmF0ZSBfX2ZyYW1lID0gMDtcblxuICAvKipcbiAgICogSXRzIGZwcy5cbiAgICovXG4gIHByaXZhdGUgX19mcHM6IG51bWJlcjtcblxuICBwdWJsaWMgY29uc3RydWN0b3IoIGZwcyA9IDYwICkge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5fX2ZwcyA9IGZwcztcbiAgfVxuXG4gIC8qKlxuICAgKiBJdHMgY3VycmVudCBmcmFtZS5cbiAgICovXG4gIHB1YmxpYyBnZXQgZnJhbWUoKTogbnVtYmVyIHsgcmV0dXJuIHRoaXMuX19mcmFtZTsgfVxuXG4gIC8qKlxuICAgKiBJdHMgZnBzLlxuICAgKi9cbiAgcHVibGljIGdldCBmcHMoKTogbnVtYmVyIHsgcmV0dXJuIHRoaXMuX19mcHM7IH1cblxuICAvKipcbiAgICogVXBkYXRlIHRoZSBjbG9jay4gSXQgd2lsbCBpbmNyZWFzZSB0aGUgZnJhbWUgYnkgMS5cbiAgICovXG4gIHB1YmxpYyB1cGRhdGUoKTogdm9pZCB7XG4gICAgaWYgKCB0aGlzLl9faXNQbGF5aW5nICkge1xuICAgICAgdGhpcy5fX3RpbWUgPSB0aGlzLl9fZnJhbWUgLyB0aGlzLl9fZnBzO1xuICAgICAgdGhpcy5fX2RlbHRhVGltZSA9IDEuMCAvIHRoaXMuX19mcHM7XG4gICAgICB0aGlzLl9fZnJhbWUgKys7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX19kZWx0YVRpbWUgPSAwLjA7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFNldCB0aGUgdGltZSBtYW51YWxseS5cbiAgICogVGhlIHNldCB0aW1lIHdpbGwgYmUgY29udmVydGVkIGludG8gaW50ZXJuYWwgZnJhbWUgY291bnQsIHNvIHRoZSB0aW1lIHdpbGwgbm90IGJlIGV4YWN0bHkgc2FtZSBhcyBzZXQgb25lLlxuICAgKiBAcGFyYW0gdGltZSBUaW1lXG4gICAqL1xuICBwdWJsaWMgc2V0VGltZSggdGltZTogbnVtYmVyICk6IHZvaWQge1xuICAgIHRoaXMuX19mcmFtZSA9IE1hdGguZmxvb3IoIHRoaXMuX19mcHMgKiB0aW1lICk7XG4gICAgdGhpcy5fX3RpbWUgPSB0aGlzLl9fZnJhbWUgLyB0aGlzLl9fZnBzO1xuICB9XG59XG4iLCJpbXBvcnQgeyBDbG9jayB9IGZyb20gJy4vQ2xvY2snO1xuXG4vKipcbiAqIENsYXNzIHRoYXQgZGVhbHMgd2l0aCB0aW1lLlxuICogVGhpcyBpcyBcInJlYWx0aW1lXCIgdHlwZSBjbG9jaywgdGhlIHRpbWUgZ29lcyBvbiBhcyByZWFsIHdvcmxkLlxuICovXG5leHBvcnQgY2xhc3MgQ2xvY2tSZWFsdGltZSBleHRlbmRzIENsb2NrIHtcbiAgLyoqXG4gICAqIFwiWW91IHNldCB0aGUgdGltZSBtYW51YWxseSB0byBgX19ydFRpbWVgIHdoZW4gaXQncyBgX19ydERhdGVgLlwiXG4gICAqL1xuICBwcml2YXRlIF9fcnRUaW1lID0gMC4wO1xuXG4gIC8qKlxuICAgKiBcIllvdSBzZXQgdGhlIHRpbWUgbWFudWFsbHkgdG8gYF9fcnRUaW1lYCB3aGVuIGl0J3MgYF9fcnREYXRlYC5cIlxuICAgKi9cbiAgcHJpdmF0ZSBfX3J0RGF0ZTogbnVtYmVyID0gcGVyZm9ybWFuY2Uubm93KCk7XG5cbiAgLyoqXG4gICAqIFRoZSBjbG9jayBpcyByZWFsdGltZS4geWVhaC5cbiAgICovXG4gIHB1YmxpYyBnZXQgaXNSZWFsdGltZSgpOiBib29sZWFuIHsgcmV0dXJuIHRydWU7IH1cblxuICAvKipcbiAgICogVXBkYXRlIHRoZSBjbG9jay4gVGltZSBpcyBjYWxjdWxhdGVkIGJhc2VkIG9uIHRpbWUgaW4gcmVhbCB3b3JsZC5cbiAgICovXG4gIHB1YmxpYyB1cGRhdGUoKTogdm9pZCB7XG4gICAgY29uc3Qgbm93ID0gcGVyZm9ybWFuY2Uubm93KCk7XG5cbiAgICBpZiAoIHRoaXMuX19pc1BsYXlpbmcgKSB7XG4gICAgICBjb25zdCBwcmV2VGltZSA9IHRoaXMuX190aW1lO1xuICAgICAgY29uc3QgZGVsdGFEYXRlID0gKCBub3cgLSB0aGlzLl9fcnREYXRlICk7XG4gICAgICB0aGlzLl9fdGltZSA9IHRoaXMuX19ydFRpbWUgKyBkZWx0YURhdGUgLyAxMDAwLjA7XG4gICAgICB0aGlzLl9fZGVsdGFUaW1lID0gdGhpcy50aW1lIC0gcHJldlRpbWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX19ydFRpbWUgPSB0aGlzLnRpbWU7XG4gICAgICB0aGlzLl9fcnREYXRlID0gbm93O1xuICAgICAgdGhpcy5fX2RlbHRhVGltZSA9IDAuMDtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogU2V0IHRoZSB0aW1lIG1hbnVhbGx5LlxuICAgKiBAcGFyYW0gdGltZSBUaW1lXG4gICAqL1xuICBwdWJsaWMgc2V0VGltZSggdGltZTogbnVtYmVyICk6IHZvaWQge1xuICAgIHRoaXMuX190aW1lID0gdGltZTtcbiAgICB0aGlzLl9fcnRUaW1lID0gdGhpcy50aW1lO1xuICAgIHRoaXMuX19ydERhdGUgPSBwZXJmb3JtYW5jZS5ub3coKTtcbiAgfVxufVxuIiwiLy8geW9pbmtlZCBmcm9tIGh0dHBzOi8vZ2l0aHViLmNvbS9tYXBib3gvdGlueS1zZGYgKEJTRCAyLUNsYXVzZSlcbi8vIGltcGxlbWVudHMgaHR0cDovL3Blb3BsZS5jcy51Y2hpY2Fnby5lZHUvfnBmZi9wYXBlcnMvZHQucGRmXG5cbi8qKlxuICogQ29tcHV0ZSBhIG9uZSBkaW1lbnNpb25hbCBlZHQgZnJvbSB0aGUgc291cmNlIGRhdGEuXG4gKiBSZXR1cm5pbmcgZGlzdGFuY2Ugd2lsbCBiZSBzcXVhcmVkLlxuICogSW50ZW5kZWQgdG8gYmUgdXNlZCBpbnRlcm5hbGx5IGluIHtAbGluayBlZHQyZH0uXG4gKlxuICogQHBhcmFtIGRhdGEgRGF0YSBvZiB0aGUgc291cmNlXG4gKiBAcGFyYW0gb2Zmc2V0IE9mZnNldCBvZiB0aGUgc291cmNlIGZyb20gYmVnaW5uaW5nXG4gKiBAcGFyYW0gc3RyaWRlIFN0cmlkZSBvZiB0aGUgc291cmNlXG4gKiBAcGFyYW0gbGVuZ3RoIExlbmd0aCBvZiB0aGUgc291cmNlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBlZHQxZChcbiAgZGF0YTogRmxvYXQzMkFycmF5LFxuICBvZmZzZXQ6IG51bWJlcixcbiAgc3RyaWRlOiBudW1iZXIsXG4gIGxlbmd0aDogbnVtYmVyXG4pOiB2b2lkIHtcbiAgLy8gaW5kZXggb2YgcmlnaHRtb3N0IHBhcmFib2xhIGluIGxvd2VyIGVudmVsb3BlXG4gIGxldCBrID0gMDtcblxuICAvLyBsb2NhdGlvbnMgb2YgcGFyYWJvbGFzIGluIGxvd2VyIGVudmVsb3BlXG4gIGNvbnN0IHYgPSBuZXcgRmxvYXQzMkFycmF5KCBsZW5ndGggKTtcbiAgdlsgMCBdID0gMC4wO1xuXG4gIC8vIGxvY2F0aW9ucyBvZiBib3VuZGFyaWVzIGJldHdlZW4gcGFyYWJvbGFzXG4gIGNvbnN0IHogPSBuZXcgRmxvYXQzMkFycmF5KCBsZW5ndGggKyAxICk7XG4gIHpbIDAgXSA9IC1JbmZpbml0eTtcbiAgelsgMSBdID0gSW5maW5pdHk7XG5cbiAgLy8gY3JlYXRlIGEgc3RyYWlnaHQgYXJyYXkgb2YgaW5wdXQgZGF0YVxuICBjb25zdCBmID0gbmV3IEZsb2F0MzJBcnJheSggbGVuZ3RoICk7XG4gIGZvciAoIGxldCBxID0gMDsgcSA8IGxlbmd0aDsgcSArKyApIHtcbiAgICBmWyBxIF0gPSBkYXRhWyBvZmZzZXQgKyBxICogc3RyaWRlIF07XG4gIH1cblxuICAvLyBjb21wdXRlIGxvd2VyIGVudmVsb3BlXG4gIGZvciAoIGxldCBxID0gMTsgcSA8IGxlbmd0aDsgcSArKyApIHtcbiAgICBsZXQgcyA9IDAuMDtcblxuICAgIHdoaWxlICggMCA8PSBrICkge1xuICAgICAgcyA9ICggZlsgcSBdICsgcSAqIHEgLSBmWyB2WyBrIF0gXSAtIHZbIGsgXSAqIHZbIGsgXSApIC8gKCAyLjAgKiBxIC0gMi4wICogdlsgayBdICk7XG4gICAgICBpZiAoIHMgPD0gelsgayBdICkge1xuICAgICAgICBrIC0tO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuXG4gICAgayArKztcbiAgICB2WyBrIF0gPSBxO1xuICAgIHpbIGsgXSA9IHM7XG4gICAgelsgayArIDEgXSA9IEluZmluaXR5O1xuICB9XG5cbiAgayA9IDA7XG5cbiAgLy8gZmlsbCBpbiB2YWx1ZXMgb2YgZGlzdGFuY2UgdHJhbnNmb3JtXG4gIGZvciAoIGxldCBxID0gMDsgcSA8IGxlbmd0aDsgcSArKyApIHtcbiAgICB3aGlsZSAoIHpbIGsgKyAxIF0gPCBxICkgeyBrICsrOyB9XG4gICAgY29uc3QgcVN1YlZLID0gcSAtIHZbIGsgXTtcbiAgICBkYXRhWyBvZmZzZXQgKyBxICogc3RyaWRlIF0gPSBmWyB2WyBrIF0gXSArIHFTdWJWSyAqIHFTdWJWSztcbiAgfVxufVxuXG4vKipcbiAqIENvbXB1dGUgYSB0d28gZGltZW5zaW9uYWwgZWR0IGZyb20gdGhlIHNvdXJjZSBkYXRhLlxuICogUmV0dXJuaW5nIGRpc3RhbmNlIHdpbGwgYmUgc3F1YXJlZC5cbiAqXG4gKiBAcGFyYW0gZGF0YSBEYXRhIG9mIHRoZSBzb3VyY2UuXG4gKiBAcGFyYW0gd2lkdGggV2lkdGggb2YgdGhlIHNvdXJjZS5cbiAqIEBwYXJhbSBoZWlnaHQgSGVpZ2h0IG9mIHRoZSBzb3VyY2UuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBlZHQyZChcbiAgZGF0YTogRmxvYXQzMkFycmF5LFxuICB3aWR0aDogbnVtYmVyLFxuICBoZWlnaHQ6IG51bWJlclxuKTogdm9pZCB7XG4gIGZvciAoIGxldCB4ID0gMDsgeCA8IHdpZHRoOyB4ICsrICkge1xuICAgIGVkdDFkKCBkYXRhLCB4LCB3aWR0aCwgaGVpZ2h0ICk7XG4gIH1cblxuICBmb3IgKCBsZXQgeSA9IDA7IHkgPCBoZWlnaHQ7IHkgKysgKSB7XG4gICAgZWR0MWQoIGRhdGEsIHkgKiB3aWR0aCwgMSwgd2lkdGggKTtcbiAgfVxufVxuIiwiLyoqXG4gKiBgbGVycGAsIG9yIGBtaXhgXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBsZXJwKCBhOiBudW1iZXIsIGI6IG51bWJlciwgeDogbnVtYmVyICk6IG51bWJlciB7XG4gIHJldHVybiBhICsgKCBiIC0gYSApICogeDtcbn1cblxuLyoqXG4gKiBgY2xhbXBgXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjbGFtcCggeDogbnVtYmVyLCBsOiBudW1iZXIsIGg6IG51bWJlciApOiBudW1iZXIge1xuICByZXR1cm4gTWF0aC5taW4oIE1hdGgubWF4KCB4LCBsICksIGggKTtcbn1cblxuLyoqXG4gKiBgY2xhbXAoIHgsIDAuMCwgMS4wIClgXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzYXR1cmF0ZSggeDogbnVtYmVyICk6IG51bWJlciB7XG4gIHJldHVybiBjbGFtcCggeCwgMC4wLCAxLjAgKTtcbn1cblxuLyoqXG4gKiBUcmFuc2Zvcm0gYSB2YWx1ZSBmcm9tIGlucHV0IHJhbmdlIHRvIG91dHB1dCByYW5nZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJhbmdlKCB4OiBudW1iZXIsIHgwOiBudW1iZXIsIHgxOiBudW1iZXIsIHkwOiBudW1iZXIsIHkxOiBudW1iZXIgKTogbnVtYmVyIHtcbiAgcmV0dXJuICggKCB4IC0geDAgKSAqICggeTEgLSB5MCApIC8gKCB4MSAtIHgwICkgKyB5MCApO1xufVxuXG4vKipcbiAqIGBzbW9vdGhzdGVwYCBidXQgbm90IHNtb290aFxuICovXG5leHBvcnQgZnVuY3Rpb24gbGluZWFyc3RlcCggYTogbnVtYmVyLCBiOiBudW1iZXIsIHg6IG51bWJlciApOiBudW1iZXIge1xuICByZXR1cm4gc2F0dXJhdGUoICggeCAtIGEgKSAvICggYiAtIGEgKSApO1xufVxuXG4vKipcbiAqIHdvcmxkIGZhbW91cyBgc21vb3Roc3RlcGAgZnVuY3Rpb25cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNtb290aHN0ZXAoIGE6IG51bWJlciwgYjogbnVtYmVyLCB4OiBudW1iZXIgKTogbnVtYmVyIHtcbiAgY29uc3QgdCA9IGxpbmVhcnN0ZXAoIGEsIGIsIHggKTtcbiAgcmV0dXJuIHQgKiB0ICogKCAzLjAgLSAyLjAgKiB0ICk7XG59XG5cbi8qKlxuICogYHNtb290aHN0ZXBgIGJ1dCBtb3JlIHNtb290aFxuICovXG5leHBvcnQgZnVuY3Rpb24gc21vb3RoZXJzdGVwKCBhOiBudW1iZXIsIGI6IG51bWJlciwgeDogbnVtYmVyICk6IG51bWJlciB7XG4gIGNvbnN0IHQgPSBsaW5lYXJzdGVwKCBhLCBiLCB4ICk7XG4gIHJldHVybiB0ICogdCAqIHQgKiAoIHQgKiAoIHQgKiA2LjAgLSAxNS4wICkgKyAxMC4wICk7XG59XG5cbi8qKlxuICogYHNtb290aHN0ZXBgIGJ1dCBXQVkgbW9yZSBzbW9vdGhcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNtb290aGVzdHN0ZXAoIGE6IG51bWJlciwgYjogbnVtYmVyLCB4OiBudW1iZXIgKTogbnVtYmVyIHtcbiAgY29uc3QgdCA9IGxpbmVhcnN0ZXAoIGEsIGIsIHggKTtcbiAgcmV0dXJuIHQgKiB0ICogdCAqIHQgKiAoIHQgKiAoIHQgKiAoIC0yMC4wICogdCArIDcwLjAgKSAtIDg0LjAgKSArIDM1LjAgKTtcbn1cbiIsImltcG9ydCB7IGxlcnAgfSBmcm9tICcuLi9tYXRoL3V0aWxzJztcblxuLyoqXG4gKiBEbyBleHAgc21vb3RoaW5nXG4gKi9cbmV4cG9ydCBjbGFzcyBFeHBTbW9vdGgge1xuICBwdWJsaWMgZmFjdG9yID0gMTAuMDtcbiAgcHVibGljIHRhcmdldCA9IDAuMDtcbiAgcHVibGljIHZhbHVlID0gMC4wO1xuXG4gIHB1YmxpYyB1cGRhdGUoIGRlbHRhVGltZTogbnVtYmVyICk6IG51bWJlciB7XG4gICAgdGhpcy52YWx1ZSA9IGxlcnAoIHRoaXMudGFyZ2V0LCB0aGlzLnZhbHVlLCBNYXRoLmV4cCggLXRoaXMuZmFjdG9yICogZGVsdGFUaW1lICkgKTtcbiAgICByZXR1cm4gdGhpcy52YWx1ZTtcbiAgfVxufVxuIiwiLyoqXG4gKiBJdGVyYWJsZSBGaXp6QnV6elxuICovXG5leHBvcnQgY2xhc3MgRml6ekJ1enogaW1wbGVtZW50cyBJdGVyYWJsZTxudW1iZXIgfCBzdHJpbmc+IHtcbiAgcHVibGljIHN0YXRpYyBXb3Jkc0RlZmF1bHQ6IE1hcDxudW1iZXIsIHN0cmluZz4gPSBuZXcgTWFwKCBbXG4gICAgWyAzLCAnRml6eicgXSxcbiAgICBbIDUsICdCdXp6JyBdXG4gIF0gKTtcblxuICBwcml2YXRlIF9fd29yZHM6IE1hcDxudW1iZXIsIHN0cmluZz47XG4gIHByaXZhdGUgX19pbmRleDogbnVtYmVyO1xuICBwcml2YXRlIF9fZW5kOiBudW1iZXI7XG5cbiAgcHVibGljIGNvbnN0cnVjdG9yKCB3b3JkczogTWFwPG51bWJlciwgc3RyaW5nPiA9IEZpenpCdXp6LldvcmRzRGVmYXVsdCwgaW5kZXggPSAxLCBlbmQgPSAxMDAgKSB7XG4gICAgdGhpcy5fX3dvcmRzID0gd29yZHM7XG4gICAgdGhpcy5fX2luZGV4ID0gaW5kZXg7XG4gICAgdGhpcy5fX2VuZCA9IGVuZDtcbiAgfVxuXG4gIHB1YmxpYyBbIFN5bWJvbC5pdGVyYXRvciBdKCk6IEl0ZXJhdG9yPHN0cmluZyB8IG51bWJlciwgYW55LCB1bmRlZmluZWQ+IHtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIHB1YmxpYyBuZXh0KCk6IEl0ZXJhdG9yUmVzdWx0PG51bWJlciB8IHN0cmluZz4ge1xuICAgIGlmICggdGhpcy5fX2VuZCA8IHRoaXMuX19pbmRleCApIHtcbiAgICAgIHJldHVybiB7IGRvbmU6IHRydWUsIHZhbHVlOiBudWxsIH07XG4gICAgfVxuXG4gICAgbGV0IHZhbHVlOiBudW1iZXIgfCBzdHJpbmcgPSAnJztcbiAgICBmb3IgKCBjb25zdCBbIHJlbSwgd29yZCBdIG9mIHRoaXMuX193b3JkcyApIHtcbiAgICAgIGlmICggKCB0aGlzLl9faW5kZXggJSByZW0gKSA9PT0gMCApIHtcbiAgICAgICAgdmFsdWUgKz0gd29yZDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoIHZhbHVlID09PSAnJyApIHtcbiAgICAgIHZhbHVlID0gdGhpcy5fX2luZGV4O1xuICAgIH1cblxuICAgIHRoaXMuX19pbmRleCArKztcblxuICAgIHJldHVybiB7IGRvbmU6IGZhbHNlLCB2YWx1ZSB9O1xuICB9XG59XG4iLCIvKipcbiAqIE1vc3QgYXdlc29tZSBjYXQgZXZlclxuICovXG5leHBvcnQgY2xhc3MgRk1TX0NhdCB7IC8vIGVzbGludC1kaXNhYmxlLWxpbmVcbiAgLyoqXG4gICAqIEZNU19DYXQuZ2lmXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIGdpZiA9ICdodHRwczovL2Ztcy1jYXQuY29tL2ltYWdlcy9mbXNfY2F0LmdpZic7XG5cbiAgLyoqXG4gICAqIEZNU19DYXQucG5nXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIHBuZyA9ICdodHRwczovL2Ztcy1jYXQuY29tL2ltYWdlcy9mbXNfY2F0LnBuZyc7XG59XG4iLCIvKipcbiAqIFVzZWZ1bCBmb3IgdGFwIHRlbXBvXG4gKiBTZWUgYWxzbzoge0BsaW5rIEhpc3RvcnlNZWFuQ2FsY3VsYXRvcn1cbiAqL1xuZXhwb3J0IGNsYXNzIEhpc3RvcnlNZWFuQ2FsY3VsYXRvciB7XG4gIHByaXZhdGUgX19yZWNhbGNGb3JFYWNoID0gMDtcbiAgcHJpdmF0ZSBfX2NvdW50VW50aWxSZWNhbGMgPSAwO1xuICBwcml2YXRlIF9faGlzdG9yeTogbnVtYmVyW10gPSBbXTtcbiAgcHJpdmF0ZSBfX2luZGV4ID0gMDtcbiAgcHJpdmF0ZSBfX2xlbmd0aDogbnVtYmVyO1xuICBwcml2YXRlIF9fY291bnQgPSAwO1xuICBwcml2YXRlIF9fY2FjaGUgPSAwO1xuXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggbGVuZ3RoOiBudW1iZXIgKSB7XG4gICAgdGhpcy5fX2xlbmd0aCA9IGxlbmd0aDtcbiAgICB0aGlzLl9fcmVjYWxjRm9yRWFjaCA9IGxlbmd0aDtcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBsZW5ndGg7IGkgKysgKSB7XG4gICAgICB0aGlzLl9faGlzdG9yeVsgaSBdID0gMDtcbiAgICB9XG4gIH1cblxuICBwdWJsaWMgZ2V0IG1lYW4oKTogbnVtYmVyIHtcbiAgICBjb25zdCBjb3VudCA9IE1hdGgubWluKCB0aGlzLl9fY291bnQsIHRoaXMuX19sZW5ndGggKTtcbiAgICByZXR1cm4gY291bnQgPT09IDAgPyAwLjAgOiB0aGlzLl9fY2FjaGUgLyBjb3VudDtcbiAgfVxuXG4gIHB1YmxpYyBnZXQgcmVjYWxjRm9yRWFjaCgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLl9fcmVjYWxjRm9yRWFjaDtcbiAgfVxuXG4gIHB1YmxpYyBzZXQgcmVjYWxjRm9yRWFjaCggdmFsdWU6IG51bWJlciApIHtcbiAgICBjb25zdCBkZWx0YSA9IHZhbHVlIC0gdGhpcy5fX3JlY2FsY0ZvckVhY2g7XG4gICAgdGhpcy5fX3JlY2FsY0ZvckVhY2ggPSB2YWx1ZTtcbiAgICB0aGlzLl9fY291bnRVbnRpbFJlY2FsYyA9IE1hdGgubWF4KCAwLCB0aGlzLl9fY291bnRVbnRpbFJlY2FsYyArIGRlbHRhICk7XG4gIH1cblxuICBwdWJsaWMgcmVzZXQoKTogdm9pZCB7XG4gICAgdGhpcy5fX2luZGV4ID0gMDtcbiAgICB0aGlzLl9fY291bnQgPSAwO1xuICAgIHRoaXMuX19jYWNoZSA9IDA7XG4gICAgdGhpcy5fX2NvdW50VW50aWxSZWNhbGMgPSAwO1xuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHRoaXMuX19sZW5ndGg7IGkgKysgKSB7XG4gICAgICB0aGlzLl9faGlzdG9yeVsgaSBdID0gMDtcbiAgICB9XG4gIH1cblxuICBwdWJsaWMgcHVzaCggdmFsdWU6IG51bWJlciApOiB2b2lkIHtcbiAgICBjb25zdCBwcmV2ID0gdGhpcy5fX2hpc3RvcnlbIHRoaXMuX19pbmRleCBdO1xuICAgIHRoaXMuX19oaXN0b3J5WyB0aGlzLl9faW5kZXggXSA9IHZhbHVlO1xuICAgIHRoaXMuX19jb3VudCArKztcbiAgICB0aGlzLl9faW5kZXggPSAoIHRoaXMuX19pbmRleCArIDEgKSAlIHRoaXMuX19sZW5ndGg7XG5cbiAgICBpZiAoIHRoaXMuX19jb3VudFVudGlsUmVjYWxjID09PSAwICkge1xuICAgICAgdGhpcy5yZWNhbGMoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fX2NvdW50VW50aWxSZWNhbGMgLS07XG4gICAgICB0aGlzLl9fY2FjaGUgLT0gcHJldjtcbiAgICAgIHRoaXMuX19jYWNoZSArPSB2YWx1ZTtcbiAgICB9XG4gIH1cblxuICBwdWJsaWMgcmVjYWxjKCk6IHZvaWQge1xuICAgIHRoaXMuX19jb3VudFVudGlsUmVjYWxjID0gdGhpcy5fX3JlY2FsY0ZvckVhY2g7XG4gICAgY29uc3Qgc3VtID0gdGhpcy5fX2hpc3RvcnlcbiAgICAgIC5zbGljZSggMCwgTWF0aC5taW4oIHRoaXMuX19jb3VudCwgdGhpcy5fX2xlbmd0aCApIClcbiAgICAgIC5yZWR1Y2UoICggc3VtLCB2ICkgPT4gc3VtICsgdiwgMCApO1xuICAgIHRoaXMuX19jYWNoZSA9IHN1bTtcbiAgfVxufVxuIiwiaW1wb3J0IHsgYmluYXJ5U2VhcmNoIH0gZnJvbSAnLi4vYWxnb3JpdGhtL2JpbmFyeVNlYXJjaCc7XG5cbi8qKlxuICogVXNlZnVsIGZvciBmcHMgY2FsY1xuICogU2VlIGFsc286IHtAbGluayBIaXN0b3J5TWVhbkNhbGN1bGF0b3J9XG4gKi9cbmV4cG9ydCBjbGFzcyBIaXN0b3J5UGVyY2VudGlsZUNhbGN1bGF0b3Ige1xuICBwcml2YXRlIF9faGlzdG9yeTogbnVtYmVyW10gPSBbXTtcbiAgcHJpdmF0ZSBfX3NvcnRlZDogbnVtYmVyW10gPSBbXTtcbiAgcHJpdmF0ZSBfX2luZGV4ID0gMDtcbiAgcHJpdmF0ZSByZWFkb25seSBfX2xlbmd0aDogbnVtYmVyO1xuXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggbGVuZ3RoOiBudW1iZXIgKSB7XG4gICAgdGhpcy5fX2xlbmd0aCA9IGxlbmd0aDtcbiAgfVxuXG4gIHB1YmxpYyBnZXQgbWVkaWFuKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMucGVyY2VudGlsZSggNTAuMCApO1xuICB9XG5cbiAgcHVibGljIHBlcmNlbnRpbGUoIHBlcmNlbnRpbGU6IG51bWJlciApOiBudW1iZXIge1xuICAgIGlmICggdGhpcy5fX2hpc3RvcnkubGVuZ3RoID09PSAwICkgeyByZXR1cm4gMC4wOyB9XG4gICAgcmV0dXJuIHRoaXMuX19zb3J0ZWRbIE1hdGgucm91bmQoIHBlcmNlbnRpbGUgKiAwLjAxICogKCB0aGlzLl9faGlzdG9yeS5sZW5ndGggLSAxICkgKSBdO1xuICB9XG5cbiAgcHVibGljIHJlc2V0KCk6IHZvaWQge1xuICAgIHRoaXMuX19pbmRleCA9IDA7XG4gICAgdGhpcy5fX2hpc3RvcnkgPSBbXTtcbiAgICB0aGlzLl9fc29ydGVkID0gW107XG4gIH1cblxuICBwdWJsaWMgcHVzaCggdmFsdWU6IG51bWJlciApOiB2b2lkIHtcbiAgICBjb25zdCBwcmV2ID0gdGhpcy5fX2hpc3RvcnlbIHRoaXMuX19pbmRleCBdO1xuICAgIHRoaXMuX19oaXN0b3J5WyB0aGlzLl9faW5kZXggXSA9IHZhbHVlO1xuICAgIHRoaXMuX19pbmRleCA9ICggdGhpcy5fX2luZGV4ICsgMSApICUgdGhpcy5fX2xlbmd0aDtcblxuICAgIC8vIHJlbW92ZSB0aGUgcHJldiBmcm9tIHNvcnRlZCBhcnJheVxuICAgIGlmICggdGhpcy5fX3NvcnRlZC5sZW5ndGggPT09IHRoaXMuX19sZW5ndGggKSB7XG4gICAgICBjb25zdCBwcmV2SW5kZXggPSBiaW5hcnlTZWFyY2goIHRoaXMuX19zb3J0ZWQsIHByZXYgKTtcbiAgICAgIHRoaXMuX19zb3J0ZWQuc3BsaWNlKCBwcmV2SW5kZXgsIDEgKTtcbiAgICB9XG5cbiAgICBjb25zdCBpbmRleCA9IGJpbmFyeVNlYXJjaCggdGhpcy5fX3NvcnRlZCwgdmFsdWUgKTtcbiAgICB0aGlzLl9fc29ydGVkLnNwbGljZSggaW5kZXgsIDAsIHZhbHVlICk7XG4gIH1cbn1cbiIsImltcG9ydCB7IEhpc3RvcnlQZXJjZW50aWxlQ2FsY3VsYXRvciB9IGZyb20gJy4vSGlzdG9yeVBlcmNlbnRpbGVDYWxjdWxhdG9yJztcblxuLyoqXG4gKiBAZGVwcmVjYXRlZCBJdCdzIGFjdHVhbGx5IGp1c3QgYSBzcGVjaWFsIGNhc2Ugb2Yge0BsaW5rIEhpc3RvcnlQZXJjZW50aWxlQ2FsY3VsYXRvcn1cbiAqL1xuZXhwb3J0IGNsYXNzIEhpc3RvcnlNZWRpYW5DYWxjdWxhdG9yIGV4dGVuZHMgSGlzdG9yeVBlcmNlbnRpbGVDYWxjdWxhdG9yIHtcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBsZW5ndGg6IG51bWJlciApIHtcbiAgICBzdXBlciggbGVuZ3RoICk7XG4gICAgY29uc29sZS53YXJuKCAnSGlzdG9yeU1lZGlhbkNhbGN1bGF0b3I6IERlcHJlY2F0ZWQuIFVzZSBIaXN0b3J5UGVyY2VudGlsZUNhbGN1bGF0b3IgaW5zdGVhZCcgKTtcbiAgfVxufVxuIiwiLyoqXG4gKiBBIFZlY3Rvci5cbiAqL1xuZXhwb3J0IGFic3RyYWN0IGNsYXNzIFZlY3RvcjxUIGV4dGVuZHMgVmVjdG9yPFQ+PiB7XG4gIHB1YmxpYyBhYnN0cmFjdCBlbGVtZW50czogbnVtYmVyW107XG5cbiAgLyoqXG4gICAqIFRoZSBsZW5ndGggb2YgdGhpcy5cbiAgICogYS5rLmEuIGBtYWduaXR1ZGVgXG4gICAqL1xuICBwdWJsaWMgZ2V0IGxlbmd0aCgpOiBudW1iZXIge1xuICAgIHJldHVybiBNYXRoLnNxcnQoIHRoaXMuZWxlbWVudHMucmVkdWNlKCAoIHN1bSwgdiApID0+IHN1bSArIHYgKiB2LCAwLjAgKSApO1xuICB9XG5cbiAgLyoqXG4gICAqIEEgbm9ybWFsaXplZCBWZWN0b3IzIG9mIHRoaXMuXG4gICAqL1xuICBwdWJsaWMgZ2V0IG5vcm1hbGl6ZWQoKTogVCB7XG4gICAgcmV0dXJuIHRoaXMuc2NhbGUoIDEuMCAvIHRoaXMubGVuZ3RoICk7XG4gIH1cblxuICAvKipcbiAgICogQ2xvbmUgdGhpcy5cbiAgICovXG4gIHB1YmxpYyBjbG9uZSgpOiBUIHtcbiAgICByZXR1cm4gdGhpcy5fX25ldyggdGhpcy5lbGVtZW50cy5jb25jYXQoKSApO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZCBhIFZlY3RvciBpbnRvIHRoaXMuXG4gICAqIEBwYXJhbSB2ZWN0b3IgQW5vdGhlciBWZWN0b3JcbiAgICovXG4gIHB1YmxpYyBhZGQoIHZlY3RvcjogVCApOiBUIHtcbiAgICByZXR1cm4gdGhpcy5fX25ldyggdGhpcy5lbGVtZW50cy5tYXAoICggdiwgaSApID0+IHYgKyB2ZWN0b3IuZWxlbWVudHNbIGkgXSApICk7XG4gIH1cblxuICAvKipcbiAgICogU3Vic3RyYWN0IHRoaXMgZnJvbSBhbm90aGVyIFZlY3Rvci5cbiAgICogQHBhcmFtIHYgQW5vdGhlciB2ZWN0b3JcbiAgICovXG4gIHB1YmxpYyBzdWIoIHZlY3RvcjogVCApOiBUIHtcbiAgICByZXR1cm4gdGhpcy5fX25ldyggdGhpcy5lbGVtZW50cy5tYXAoICggdiwgaSApID0+IHYgLSB2ZWN0b3IuZWxlbWVudHNbIGkgXSApICk7XG4gIH1cblxuICAvKipcbiAgICogTXVsdGlwbHkgYSBWZWN0b3Igd2l0aCB0aGlzLlxuICAgKiBAcGFyYW0gdmVjdG9yIEFub3RoZXIgVmVjdG9yXG4gICAqL1xuICBwdWJsaWMgbXVsdGlwbHkoIHZlY3RvcjogVCApOiBUIHtcbiAgICByZXR1cm4gdGhpcy5fX25ldyggdGhpcy5lbGVtZW50cy5tYXAoICggdiwgaSApID0+IHYgKiB2ZWN0b3IuZWxlbWVudHNbIGkgXSApICk7XG4gIH1cblxuICAvKipcbiAgICogRGl2aWRlIHRoaXMgZnJvbSBhbm90aGVyIFZlY3Rvci5cbiAgICogQHBhcmFtIHZlY3RvciBBbm90aGVyIFZlY3RvclxuICAgKi9cbiAgcHVibGljIGRpdmlkZSggdmVjdG9yOiBUICk6IFQge1xuICAgIHJldHVybiB0aGlzLl9fbmV3KCB0aGlzLmVsZW1lbnRzLm1hcCggKCB2LCBpICkgPT4gdiAvIHZlY3Rvci5lbGVtZW50c1sgaSBdICkgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTY2FsZSB0aGlzIGJ5IHNjYWxhci5cbiAgICogYS5rLmEuIGBtdWx0aXBseVNjYWxhcmBcbiAgICogQHBhcmFtIHNjYWxhciBBIHNjYWxhclxuICAgKi9cbiAgcHVibGljIHNjYWxlKCBzY2FsYXI6IG51bWJlciApOiBUIHtcbiAgICByZXR1cm4gdGhpcy5fX25ldyggdGhpcy5lbGVtZW50cy5tYXAoICggdiApID0+IHYgKiBzY2FsYXIgKSApO1xuICB9XG5cbiAgLyoqXG4gICAqIERvdCB0d28gVmVjdG9ycy5cbiAgICogQHBhcmFtIHZlY3RvciBBbm90aGVyIHZlY3RvclxuICAgKi9cbiAgcHVibGljIGRvdCggdmVjdG9yOiBUICk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuZWxlbWVudHMucmVkdWNlKCAoIHN1bSwgdiwgaSApID0+IHN1bSArIHYgKiB2ZWN0b3IuZWxlbWVudHNbIGkgXSwgMC4wICk7XG4gIH1cblxuICBwcm90ZWN0ZWQgYWJzdHJhY3QgX19uZXcoIHY6IG51bWJlcltdICk6IFQ7XG59XG4iLCJpbXBvcnQgeyBNYXRyaXg0IH0gZnJvbSAnLi9NYXRyaXg0JztcbmltcG9ydCB7IFF1YXRlcm5pb24gfSBmcm9tICcuL1F1YXRlcm5pb24nO1xuaW1wb3J0IHsgVmVjdG9yIH0gZnJvbSAnLi9WZWN0b3InO1xuXG5leHBvcnQgdHlwZSByYXdWZWN0b3IzID0gWyBudW1iZXIsIG51bWJlciwgbnVtYmVyIF07XG5cbi8qKlxuICogQSBWZWN0b3IzLlxuICovXG5leHBvcnQgY2xhc3MgVmVjdG9yMyBleHRlbmRzIFZlY3RvcjxWZWN0b3IzPiB7XG4gIHB1YmxpYyBlbGVtZW50czogcmF3VmVjdG9yMztcblxuICBwdWJsaWMgY29uc3RydWN0b3IoIHY6IHJhd1ZlY3RvcjMgPSBbIDAuMCwgMC4wLCAwLjAgXSApIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMuZWxlbWVudHMgPSB2O1xuICB9XG5cbiAgLyoqXG4gICAqIEFuIHggY29tcG9uZW50IG9mIHRoaXMuXG4gICAqL1xuICBwdWJsaWMgZ2V0IHgoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5lbGVtZW50c1sgMCBdO1xuICB9XG5cbiAgcHVibGljIHNldCB4KCB4OiBudW1iZXIgKSB7XG4gICAgdGhpcy5lbGVtZW50c1sgMCBdID0geDtcbiAgfVxuXG4gIC8qKlxuICAgKiBBbiB5IGNvbXBvbmVudCBvZiB0aGlzLlxuICAgKi9cbiAgcHVibGljIGdldCB5KCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuZWxlbWVudHNbIDEgXTtcbiAgfVxuXG4gIHB1YmxpYyBzZXQgeSggeTogbnVtYmVyICkge1xuICAgIHRoaXMuZWxlbWVudHNbIDEgXSA9IHk7XG4gIH1cblxuICAvKipcbiAgICogQW4geiBjb21wb25lbnQgb2YgdGhpcy5cbiAgICovXG4gIHB1YmxpYyBnZXQgeigpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLmVsZW1lbnRzWyAyIF07XG4gIH1cblxuICBwdWJsaWMgc2V0IHooIHo6IG51bWJlciApIHtcbiAgICB0aGlzLmVsZW1lbnRzWyAyIF0gPSB6O1xuICB9XG5cbiAgcHVibGljIHRvU3RyaW5nKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGBWZWN0b3IzKCAkeyB0aGlzLngudG9GaXhlZCggMyApIH0sICR7IHRoaXMueS50b0ZpeGVkKCAzICkgfSwgJHsgdGhpcy56LnRvRml4ZWQoIDMgKSB9IClgO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybiBhIGNyb3NzIG9mIHRoaXMgYW5kIGFub3RoZXIgVmVjdG9yMy5cbiAgICogQHBhcmFtIHZlY3RvciBBbm90aGVyIHZlY3RvclxuICAgKi9cbiAgcHVibGljIGNyb3NzKCB2ZWN0b3I6IFZlY3RvcjMgKTogVmVjdG9yMyB7XG4gICAgcmV0dXJuIG5ldyBWZWN0b3IzKCBbXG4gICAgICB0aGlzLnkgKiB2ZWN0b3IueiAtIHRoaXMueiAqIHZlY3Rvci55LFxuICAgICAgdGhpcy56ICogdmVjdG9yLnggLSB0aGlzLnggKiB2ZWN0b3IueixcbiAgICAgIHRoaXMueCAqIHZlY3Rvci55IC0gdGhpcy55ICogdmVjdG9yLnhcbiAgICBdICk7XG4gIH1cblxuICAvKipcbiAgICogUm90YXRlIHRoaXMgdmVjdG9yIHVzaW5nIGEgUXVhdGVybmlvbi5cbiAgICogQHBhcmFtIHF1YXRlcm5pb24gQSBxdWF0ZXJuaW9uXG4gICAqL1xuICBwdWJsaWMgYXBwbHlRdWF0ZXJuaW9uKCBxdWF0ZXJuaW9uOiBRdWF0ZXJuaW9uICk6IFZlY3RvcjMge1xuICAgIGNvbnN0IHAgPSBuZXcgUXVhdGVybmlvbiggWyB0aGlzLngsIHRoaXMueSwgdGhpcy56LCAwLjAgXSApO1xuICAgIGNvbnN0IHIgPSBxdWF0ZXJuaW9uLmludmVyc2VkO1xuICAgIGNvbnN0IHJlcyA9IHF1YXRlcm5pb24ubXVsdGlwbHkoIHAgKS5tdWx0aXBseSggciApO1xuICAgIHJldHVybiBuZXcgVmVjdG9yMyggWyByZXMueCwgcmVzLnksIHJlcy56IF0gKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBNdWx0aXBseSB0aGlzIHZlY3RvciAod2l0aCBhbiBpbXBsaWNpdCAxIGluIHRoZSA0dGggZGltZW5zaW9uKSBieSBtLlxuICAgKi9cbiAgcHVibGljIGFwcGx5TWF0cml4NCggbWF0cml4OiBNYXRyaXg0ICk6IFZlY3RvcjMge1xuICAgIGNvbnN0IG0gPSBtYXRyaXguZWxlbWVudHM7XG5cbiAgICBjb25zdCB3ID0gbVsgMyBdICogdGhpcy54ICsgbVsgNyBdICogdGhpcy55ICsgbVsgMTEgXSAqIHRoaXMueiArIG1bIDE1IF07XG4gICAgY29uc3QgaW52VyA9IDEuMCAvIHc7XG5cbiAgICByZXR1cm4gbmV3IFZlY3RvcjMoIFtcbiAgICAgICggbVsgMCBdICogdGhpcy54ICsgbVsgNCBdICogdGhpcy55ICsgbVsgOCBdICogdGhpcy56ICsgbVsgMTIgXSApICogaW52VyxcbiAgICAgICggbVsgMSBdICogdGhpcy54ICsgbVsgNSBdICogdGhpcy55ICsgbVsgOSBdICogdGhpcy56ICsgbVsgMTMgXSApICogaW52VyxcbiAgICAgICggbVsgMiBdICogdGhpcy54ICsgbVsgNiBdICogdGhpcy55ICsgbVsgMTAgXSAqIHRoaXMueiArIG1bIDE0IF0gKSAqIGludldcbiAgICBdICk7XG4gIH1cblxuICBwcm90ZWN0ZWQgX19uZXcoIHY6IHJhd1ZlY3RvcjMgKTogVmVjdG9yMyB7XG4gICAgcmV0dXJuIG5ldyBWZWN0b3IzKCB2ICk7XG4gIH1cblxuICAvKipcbiAgICogVmVjdG9yMyggMC4wLCAwLjAsIDAuMCApXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIGdldCB6ZXJvKCk6IFZlY3RvcjMge1xuICAgIHJldHVybiBuZXcgVmVjdG9yMyggWyAwLjAsIDAuMCwgMC4wIF0gKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBWZWN0b3IzKCAxLjAsIDEuMCwgMS4wIClcbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgZ2V0IG9uZSgpOiBWZWN0b3IzIHtcbiAgICByZXR1cm4gbmV3IFZlY3RvcjMoIFsgMS4wLCAxLjAsIDEuMCBdICk7XG4gIH1cbn1cbiIsImltcG9ydCB7IE1hdHJpeDQgfSBmcm9tICcuL01hdHJpeDQnO1xuaW1wb3J0IHsgVmVjdG9yMyB9IGZyb20gJy4vVmVjdG9yMyc7XG5cbmV4cG9ydCB0eXBlIHJhd1F1YXRlcm5pb24gPSBbIG51bWJlciwgbnVtYmVyLCBudW1iZXIsIG51bWJlciBdO1xuXG5leHBvcnQgY29uc3QgcmF3SWRlbnRpdHlRdWF0ZXJuaW9uOiByYXdRdWF0ZXJuaW9uID0gWyAwLjAsIDAuMCwgMC4wLCAxLjAgXTtcblxuLyoqXG4gKiBBIFF1YXRlcm5pb24uXG4gKi9cbmV4cG9ydCBjbGFzcyBRdWF0ZXJuaW9uIHtcbiAgcHVibGljIGVsZW1lbnRzOiByYXdRdWF0ZXJuaW9uOyAvLyBbIHgsIHksIHo7IHcgXVxuXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggZWxlbWVudHM6IHJhd1F1YXRlcm5pb24gPSByYXdJZGVudGl0eVF1YXRlcm5pb24gKSB7XG4gICAgdGhpcy5lbGVtZW50cyA9IGVsZW1lbnRzO1xuICB9XG5cbiAgLyoqXG4gICAqIEFuIHggY29tcG9uZW50IG9mIHRoaXMuXG4gICAqL1xuICBwdWJsaWMgZ2V0IHgoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5lbGVtZW50c1sgMCBdO1xuICB9XG5cbiAgLyoqXG4gICAqIEFuIHkgY29tcG9uZW50IG9mIHRoaXMuXG4gICAqL1xuICBwdWJsaWMgZ2V0IHkoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5lbGVtZW50c1sgMSBdO1xuICB9XG5cbiAgLyoqXG4gICAqIEFuIHogY29tcG9uZW50IG9mIHRoaXMuXG4gICAqL1xuICBwdWJsaWMgZ2V0IHooKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5lbGVtZW50c1sgMiBdO1xuICB9XG5cbiAgLyoqXG4gICAqIEFuIHcgY29tcG9uZW50IG9mIHRoaXMuXG4gICAqL1xuICBwdWJsaWMgZ2V0IHcoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5lbGVtZW50c1sgMyBdO1xuICB9XG5cbiAgcHVibGljIHRvU3RyaW5nKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGBRdWF0ZXJuaW9uKCAkeyB0aGlzLngudG9GaXhlZCggMyApIH0sICR7IHRoaXMueS50b0ZpeGVkKCAzICkgfSwgJHsgdGhpcy56LnRvRml4ZWQoIDMgKSB9LCAkeyB0aGlzLncudG9GaXhlZCggMyApIH0gKWA7XG4gIH1cblxuICAvKipcbiAgICogQ2xvbmUgdGhpcy5cbiAgICovXG4gIHB1YmxpYyBjbG9uZSgpOiBRdWF0ZXJuaW9uIHtcbiAgICByZXR1cm4gbmV3IFF1YXRlcm5pb24oIHRoaXMuZWxlbWVudHMuY29uY2F0KCkgYXMgcmF3UXVhdGVybmlvbiApO1xuICB9XG5cbiAgLyoqXG4gICAqIEl0c2VsZiBidXQgY29udmVydGVkIGludG8gYSBNYXRyaXg0LlxuICAgKi9cbiAgcHVibGljIGdldCBtYXRyaXgoKTogTWF0cml4NCB7XG4gICAgY29uc3QgeCA9IG5ldyBWZWN0b3IzKCBbIDEuMCwgMC4wLCAwLjAgXSApLmFwcGx5UXVhdGVybmlvbiggdGhpcyApO1xuICAgIGNvbnN0IHkgPSBuZXcgVmVjdG9yMyggWyAwLjAsIDEuMCwgMC4wIF0gKS5hcHBseVF1YXRlcm5pb24oIHRoaXMgKTtcbiAgICBjb25zdCB6ID0gbmV3IFZlY3RvcjMoIFsgMC4wLCAwLjAsIDEuMCBdICkuYXBwbHlRdWF0ZXJuaW9uKCB0aGlzICk7XG5cbiAgICByZXR1cm4gbmV3IE1hdHJpeDQoIFtcbiAgICAgIHgueCwgeS54LCB6LngsIDAuMCxcbiAgICAgIHgueSwgeS55LCB6LnksIDAuMCxcbiAgICAgIHgueiwgeS56LCB6LnosIDAuMCxcbiAgICAgIDAuMCwgMC4wLCAwLjAsIDEuMFxuICAgIF0gKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBbiBpbnZlcnNlIG9mIHRoaXMuXG4gICAqL1xuICBwdWJsaWMgZ2V0IGludmVyc2VkKCk6IFF1YXRlcm5pb24ge1xuICAgIHJldHVybiBuZXcgUXVhdGVybmlvbiggW1xuICAgICAgLXRoaXMueCxcbiAgICAgIC10aGlzLnksXG4gICAgICAtdGhpcy56LFxuICAgICAgdGhpcy53XG4gICAgXSApO1xuICB9XG5cbiAgLyoqXG4gICAqIE11bHRpcGx5IHR3byBRdWF0ZXJuaW9ucy5cbiAgICogQHBhcmFtIHEgQW5vdGhlciBRdWF0ZXJuaW9uXG4gICAqL1xuICBwdWJsaWMgbXVsdGlwbHkoIHE6IFF1YXRlcm5pb24gKTogUXVhdGVybmlvbiB7XG4gICAgcmV0dXJuIG5ldyBRdWF0ZXJuaW9uKCBbXG4gICAgICB0aGlzLncgKiBxLnggKyB0aGlzLnggKiBxLncgKyB0aGlzLnkgKiBxLnogLSB0aGlzLnogKiBxLnksXG4gICAgICB0aGlzLncgKiBxLnkgLSB0aGlzLnggKiBxLnogKyB0aGlzLnkgKiBxLncgKyB0aGlzLnogKiBxLngsXG4gICAgICB0aGlzLncgKiBxLnogKyB0aGlzLnggKiBxLnkgLSB0aGlzLnkgKiBxLnggKyB0aGlzLnogKiBxLncsXG4gICAgICB0aGlzLncgKiBxLncgLSB0aGlzLnggKiBxLnggLSB0aGlzLnkgKiBxLnkgLSB0aGlzLnogKiBxLnpcbiAgICBdICk7XG4gIH1cblxuICAvKipcbiAgICogQW4gaWRlbnRpdHkgUXVhdGVybmlvbi5cbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgZ2V0IGlkZW50aXR5KCk6IFF1YXRlcm5pb24ge1xuICAgIHJldHVybiBuZXcgUXVhdGVybmlvbiggcmF3SWRlbnRpdHlRdWF0ZXJuaW9uICk7XG4gIH1cblxuICAvKipcbiAgICogR2VuZXJhdGUgYSBRdWF0ZXJuaW9uIG91dCBvZiBhbmdsZSBhbmQgYXhpcy5cbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgZnJvbUF4aXNBbmdsZSggYXhpczogVmVjdG9yMywgYW5nbGU6IG51bWJlciApOiBRdWF0ZXJuaW9uIHtcbiAgICBjb25zdCBoYWxmQW5nbGUgPSBhbmdsZSAvIDIuMDtcbiAgICBjb25zdCBzaW5IYWxmQW5nbGUgPSBNYXRoLnNpbiggaGFsZkFuZ2xlICk7XG4gICAgcmV0dXJuIG5ldyBRdWF0ZXJuaW9uKCBbXG4gICAgICBheGlzLnggKiBzaW5IYWxmQW5nbGUsXG4gICAgICBheGlzLnkgKiBzaW5IYWxmQW5nbGUsXG4gICAgICBheGlzLnogKiBzaW5IYWxmQW5nbGUsXG4gICAgICBNYXRoLmNvcyggaGFsZkFuZ2xlIClcbiAgICBdICk7XG4gIH1cblxuICAvKipcbiAgICogR2VuZXJhdGUgYSBRdWF0ZXJuaW9uIG91dCBvZiBhIHJvdGF0aW9uIG1hdHJpeC5cbiAgICogWW9pbmtlZCBmcm9tIFRocmVlLmpzLlxuICAgKi9cbiAgcHVibGljIHN0YXRpYyBmcm9tTWF0cml4KCBtYXRyaXg6IE1hdHJpeDQgKTogUXVhdGVybmlvbiB7XG4gICAgY29uc3QgbSA9IG1hdHJpeC5lbGVtZW50cyxcbiAgICAgIG0xMSA9IG1bIDAgXSwgbTEyID0gbVsgNCBdLCBtMTMgPSBtWyA4IF0sXG4gICAgICBtMjEgPSBtWyAxIF0sIG0yMiA9IG1bIDUgXSwgbTIzID0gbVsgOSBdLFxuICAgICAgbTMxID0gbVsgMiBdLCBtMzIgPSBtWyA2IF0sIG0zMyA9IG1bIDEwIF0sXG4gICAgICB0cmFjZSA9IG0xMSArIG0yMiArIG0zMztcblxuICAgIGlmICggdHJhY2UgPiAwICkge1xuICAgICAgY29uc3QgcyA9IDAuNSAvIE1hdGguc3FydCggdHJhY2UgKyAxLjAgKTtcbiAgICAgIHJldHVybiBuZXcgUXVhdGVybmlvbiggW1xuICAgICAgICAoIG0zMiAtIG0yMyApICogcyxcbiAgICAgICAgKCBtMTMgLSBtMzEgKSAqIHMsXG4gICAgICAgICggbTIxIC0gbTEyICkgKiBzLFxuICAgICAgICAwLjI1IC8gc1xuICAgICAgXSApO1xuICAgIH0gZWxzZSBpZiAoIG0xMSA+IG0yMiAmJiBtMTEgPiBtMzMgKSB7XG4gICAgICBjb25zdCBzID0gMi4wICogTWF0aC5zcXJ0KCAxLjAgKyBtMTEgLSBtMjIgLSBtMzMgKTtcbiAgICAgIHJldHVybiBuZXcgUXVhdGVybmlvbiggW1xuICAgICAgICAwLjI1ICogcyxcbiAgICAgICAgKCBtMTIgKyBtMjEgKSAvIHMsXG4gICAgICAgICggbTEzICsgbTMxICkgLyBzLFxuICAgICAgICAoIG0zMiAtIG0yMyApIC8gc1xuICAgICAgXSApO1xuICAgIH0gZWxzZSBpZiAoIG0yMiA+IG0zMyApIHtcbiAgICAgIGNvbnN0IHMgPSAyLjAgKiBNYXRoLnNxcnQoIDEuMCArIG0yMiAtIG0xMSAtIG0zMyApO1xuICAgICAgcmV0dXJuIG5ldyBRdWF0ZXJuaW9uKCBbXG4gICAgICAgICggbTEyICsgbTIxICkgLyBzLFxuICAgICAgICAwLjI1ICogcyxcbiAgICAgICAgKCBtMjMgKyBtMzIgKSAvIHMsXG4gICAgICAgICggbTEzIC0gbTMxICkgLyBzXG4gICAgICBdICk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IHMgPSAyLjAgKiBNYXRoLnNxcnQoIDEuMCArIG0zMyAtIG0xMSAtIG0yMiApO1xuICAgICAgcmV0dXJuIG5ldyBRdWF0ZXJuaW9uKCBbXG4gICAgICAgICggbTEzICsgbTMxICkgLyBzLFxuICAgICAgICAoIG0yMyArIG0zMiApIC8gcyxcbiAgICAgICAgMC4yNSAqIHMsXG4gICAgICAgICggbTIxIC0gbTEyICkgLyBzXG4gICAgICBdICk7XG4gICAgfVxuICB9XG59XG4iLCJpbXBvcnQgeyBRdWF0ZXJuaW9uIH0gZnJvbSAnLi9RdWF0ZXJuaW9uJztcbmltcG9ydCB7IFZlY3RvcjMgfSBmcm9tICcuL1ZlY3RvcjMnO1xuXG5leHBvcnQgdHlwZSByYXdNYXRyaXg0ID0gW1xuICBudW1iZXIsIG51bWJlciwgbnVtYmVyLCBudW1iZXIsXG4gIG51bWJlciwgbnVtYmVyLCBudW1iZXIsIG51bWJlcixcbiAgbnVtYmVyLCBudW1iZXIsIG51bWJlciwgbnVtYmVyLFxuICBudW1iZXIsIG51bWJlciwgbnVtYmVyLCBudW1iZXJcbl07XG5cbmV4cG9ydCBjb25zdCByYXdJZGVudGl0eU1hdHJpeDQ6IHJhd01hdHJpeDQgPSBbXG4gIDEuMCwgMC4wLCAwLjAsIDAuMCxcbiAgMC4wLCAxLjAsIDAuMCwgMC4wLFxuICAwLjAsIDAuMCwgMS4wLCAwLjAsXG4gIDAuMCwgMC4wLCAwLjAsIDEuMFxuXTtcblxuLyoqXG4gKiBBIE1hdHJpeDQuXG4gKi9cbmV4cG9ydCBjbGFzcyBNYXRyaXg0IHtcbiAgcHVibGljIGVsZW1lbnRzOiByYXdNYXRyaXg0O1xuXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggdjogcmF3TWF0cml4NCA9IHJhd0lkZW50aXR5TWF0cml4NCApIHtcbiAgICB0aGlzLmVsZW1lbnRzID0gdjtcbiAgfVxuXG4gIC8qKlxuICAgKiBJdHNlbGYgYnV0IHRyYW5zcG9zZWQuXG4gICAqL1xuICBwdWJsaWMgZ2V0IHRyYW5zcG9zZSgpOiBNYXRyaXg0IHtcbiAgICBjb25zdCBtID0gdGhpcy5lbGVtZW50cztcblxuICAgIHJldHVybiBuZXcgTWF0cml4NCggW1xuICAgICAgbVsgMCBdLCBtWyA0IF0sIG1bIDggXSwgbVsgMTIgXSxcbiAgICAgIG1bIDEgXSwgbVsgNSBdLCBtWyA5IF0sIG1bIDEzIF0sXG4gICAgICBtWyAyIF0sIG1bIDYgXSwgbVsgMTAgXSwgbVsgMTQgXSxcbiAgICAgIG1bIDMgXSwgbVsgNyBdLCBtWyAxMSBdLCBtWyAxNSBdXG4gICAgXSApO1xuICB9XG5cbiAgLyoqXG4gICAqIEl0cyBkZXRlcm1pbmFudC5cbiAgICovXG4gIHB1YmxpYyBnZXQgZGV0ZXJtaW5hbnQoKTogbnVtYmVyIHtcbiAgICBjb25zdCBtID0gdGhpcy5lbGVtZW50cztcbiAgICBjb25zdFxuICAgICAgYTAwID0gbVsgIDAgXSwgYTAxID0gbVsgIDEgXSwgYTAyID0gbVsgIDIgXSwgYTAzID0gbVsgIDMgXSxcbiAgICAgIGExMCA9IG1bICA0IF0sIGExMSA9IG1bICA1IF0sIGExMiA9IG1bICA2IF0sIGExMyA9IG1bICA3IF0sXG4gICAgICBhMjAgPSBtWyAgOCBdLCBhMjEgPSBtWyAgOSBdLCBhMjIgPSBtWyAxMCBdLCBhMjMgPSBtWyAxMSBdLFxuICAgICAgYTMwID0gbVsgMTIgXSwgYTMxID0gbVsgMTMgXSwgYTMyID0gbVsgMTQgXSwgYTMzID0gbVsgMTUgXSxcbiAgICAgIGIwMCA9IGEwMCAqIGExMSAtIGEwMSAqIGExMCwgIGIwMSA9IGEwMCAqIGExMiAtIGEwMiAqIGExMCxcbiAgICAgIGIwMiA9IGEwMCAqIGExMyAtIGEwMyAqIGExMCwgIGIwMyA9IGEwMSAqIGExMiAtIGEwMiAqIGExMSxcbiAgICAgIGIwNCA9IGEwMSAqIGExMyAtIGEwMyAqIGExMSwgIGIwNSA9IGEwMiAqIGExMyAtIGEwMyAqIGExMixcbiAgICAgIGIwNiA9IGEyMCAqIGEzMSAtIGEyMSAqIGEzMCwgIGIwNyA9IGEyMCAqIGEzMiAtIGEyMiAqIGEzMCxcbiAgICAgIGIwOCA9IGEyMCAqIGEzMyAtIGEyMyAqIGEzMCwgIGIwOSA9IGEyMSAqIGEzMiAtIGEyMiAqIGEzMSxcbiAgICAgIGIxMCA9IGEyMSAqIGEzMyAtIGEyMyAqIGEzMSwgIGIxMSA9IGEyMiAqIGEzMyAtIGEyMyAqIGEzMjtcblxuICAgIHJldHVybiBiMDAgKiBiMTEgLSBiMDEgKiBiMTAgKyBiMDIgKiBiMDkgKyBiMDMgKiBiMDggLSBiMDQgKiBiMDcgKyBiMDUgKiBiMDY7XG4gIH1cblxuICAvKipcbiAgICogSXRzZWxmIGJ1dCBpbnZlcnRlZC5cbiAgICovXG4gIHB1YmxpYyBnZXQgaW52ZXJzZSgpOiBNYXRyaXg0IHwgbnVsbCB7XG4gICAgY29uc3QgbSA9IHRoaXMuZWxlbWVudHM7XG4gICAgY29uc3RcbiAgICAgIGEwMCA9IG1bICAwIF0sIGEwMSA9IG1bICAxIF0sIGEwMiA9IG1bICAyIF0sIGEwMyA9IG1bICAzIF0sXG4gICAgICBhMTAgPSBtWyAgNCBdLCBhMTEgPSBtWyAgNSBdLCBhMTIgPSBtWyAgNiBdLCBhMTMgPSBtWyAgNyBdLFxuICAgICAgYTIwID0gbVsgIDggXSwgYTIxID0gbVsgIDkgXSwgYTIyID0gbVsgMTAgXSwgYTIzID0gbVsgMTEgXSxcbiAgICAgIGEzMCA9IG1bIDEyIF0sIGEzMSA9IG1bIDEzIF0sIGEzMiA9IG1bIDE0IF0sIGEzMyA9IG1bIDE1IF0sXG4gICAgICBiMDAgPSBhMDAgKiBhMTEgLSBhMDEgKiBhMTAsICBiMDEgPSBhMDAgKiBhMTIgLSBhMDIgKiBhMTAsXG4gICAgICBiMDIgPSBhMDAgKiBhMTMgLSBhMDMgKiBhMTAsICBiMDMgPSBhMDEgKiBhMTIgLSBhMDIgKiBhMTEsXG4gICAgICBiMDQgPSBhMDEgKiBhMTMgLSBhMDMgKiBhMTEsICBiMDUgPSBhMDIgKiBhMTMgLSBhMDMgKiBhMTIsXG4gICAgICBiMDYgPSBhMjAgKiBhMzEgLSBhMjEgKiBhMzAsICBiMDcgPSBhMjAgKiBhMzIgLSBhMjIgKiBhMzAsXG4gICAgICBiMDggPSBhMjAgKiBhMzMgLSBhMjMgKiBhMzAsICBiMDkgPSBhMjEgKiBhMzIgLSBhMjIgKiBhMzEsXG4gICAgICBiMTAgPSBhMjEgKiBhMzMgLSBhMjMgKiBhMzEsICBiMTEgPSBhMjIgKiBhMzMgLSBhMjMgKiBhMzI7XG5cbiAgICBjb25zdCBkZXQgPSBiMDAgKiBiMTEgLSBiMDEgKiBiMTAgKyBiMDIgKiBiMDkgKyBiMDMgKiBiMDggLSBiMDQgKiBiMDcgKyBiMDUgKiBiMDY7XG5cbiAgICBpZiAoIGRldCA9PT0gMC4wICkgeyByZXR1cm4gbnVsbDsgfVxuXG4gICAgY29uc3QgaW52RGV0ID0gMS4wIC8gZGV0O1xuXG4gICAgcmV0dXJuIG5ldyBNYXRyaXg0KCBbXG4gICAgICBhMTEgKiBiMTEgLSBhMTIgKiBiMTAgKyBhMTMgKiBiMDksXG4gICAgICBhMDIgKiBiMTAgLSBhMDEgKiBiMTEgLSBhMDMgKiBiMDksXG4gICAgICBhMzEgKiBiMDUgLSBhMzIgKiBiMDQgKyBhMzMgKiBiMDMsXG4gICAgICBhMjIgKiBiMDQgLSBhMjEgKiBiMDUgLSBhMjMgKiBiMDMsXG4gICAgICBhMTIgKiBiMDggLSBhMTAgKiBiMTEgLSBhMTMgKiBiMDcsXG4gICAgICBhMDAgKiBiMTEgLSBhMDIgKiBiMDggKyBhMDMgKiBiMDcsXG4gICAgICBhMzIgKiBiMDIgLSBhMzAgKiBiMDUgLSBhMzMgKiBiMDEsXG4gICAgICBhMjAgKiBiMDUgLSBhMjIgKiBiMDIgKyBhMjMgKiBiMDEsXG4gICAgICBhMTAgKiBiMTAgLSBhMTEgKiBiMDggKyBhMTMgKiBiMDYsXG4gICAgICBhMDEgKiBiMDggLSBhMDAgKiBiMTAgLSBhMDMgKiBiMDYsXG4gICAgICBhMzAgKiBiMDQgLSBhMzEgKiBiMDIgKyBhMzMgKiBiMDAsXG4gICAgICBhMjEgKiBiMDIgLSBhMjAgKiBiMDQgLSBhMjMgKiBiMDAsXG4gICAgICBhMTEgKiBiMDcgLSBhMTAgKiBiMDkgLSBhMTIgKiBiMDYsXG4gICAgICBhMDAgKiBiMDkgLSBhMDEgKiBiMDcgKyBhMDIgKiBiMDYsXG4gICAgICBhMzEgKiBiMDEgLSBhMzAgKiBiMDMgLSBhMzIgKiBiMDAsXG4gICAgICBhMjAgKiBiMDMgLSBhMjEgKiBiMDEgKyBhMjIgKiBiMDBcbiAgICBdLm1hcCggKCB2ICkgPT4gdiAqIGludkRldCApIGFzIHJhd01hdHJpeDQgKTtcbiAgfVxuXG4gIHB1YmxpYyB0b1N0cmluZygpOiBzdHJpbmcge1xuICAgIGNvbnN0IG0gPSB0aGlzLmVsZW1lbnRzLm1hcCggKCB2ICkgPT4gdi50b0ZpeGVkKCAzICkgKTtcbiAgICByZXR1cm4gYE1hdHJpeDQoICR7IG1bIDAgXSB9LCAkeyBtWyA0IF0gfSwgJHsgbVsgOCBdIH0sICR7IG1bIDEyIF0gfTsgJHsgbVsgMSBdIH0sICR7IG1bIDUgXSB9LCAkeyBtWyA5IF0gfSwgJHsgbVsgMTMgXSB9OyAkeyBtWyAyIF0gfSwgJHsgbVsgNiBdIH0sICR7IG1bIDEwIF0gfSwgJHsgbVsgMTQgXSB9OyAkeyBtWyAzIF0gfSwgJHsgbVsgNyBdIH0sICR7IG1bIDExIF0gfSwgJHsgbVsgMTUgXSB9IClgO1xuICB9XG5cbiAgLyoqXG4gICAqIENsb25lIHRoaXMuXG4gICAqL1xuICBwdWJsaWMgY2xvbmUoKTogTWF0cml4NCB7XG4gICAgcmV0dXJuIG5ldyBNYXRyaXg0KCB0aGlzLmVsZW1lbnRzLmNvbmNhdCgpIGFzIHJhd01hdHJpeDQgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBNdWx0aXBseSB0aGlzIE1hdHJpeDQgYnkgb25lIG9yIG1vcmUgTWF0cml4NHMuXG4gICAqL1xuICBwdWJsaWMgbXVsdGlwbHkoIC4uLm1hdHJpY2VzOiBNYXRyaXg0W10gKTogTWF0cml4NCB7XG4gICAgaWYgKCBtYXRyaWNlcy5sZW5ndGggPT09IDAgKSB7XG4gICAgICByZXR1cm4gdGhpcy5jbG9uZSgpO1xuICAgIH1cblxuICAgIGNvbnN0IGFyciA9IG1hdHJpY2VzLmNvbmNhdCgpO1xuICAgIGxldCBiTWF0ID0gYXJyLnNoaWZ0KCkhO1xuICAgIGlmICggMCA8IGFyci5sZW5ndGggKSB7XG4gICAgICBiTWF0ID0gYk1hdC5tdWx0aXBseSggLi4uYXJyICk7XG4gICAgfVxuXG4gICAgY29uc3QgYSA9IHRoaXMuZWxlbWVudHM7XG4gICAgY29uc3QgYiA9IGJNYXQuZWxlbWVudHM7XG5cbiAgICByZXR1cm4gbmV3IE1hdHJpeDQoIFtcbiAgICAgIGFbIDAgXSAqIGJbIDAgXSArIGFbIDQgXSAqIGJbIDEgXSArIGFbIDggXSAqIGJbIDIgXSArIGFbIDEyIF0gKiBiWyAzIF0sXG4gICAgICBhWyAxIF0gKiBiWyAwIF0gKyBhWyA1IF0gKiBiWyAxIF0gKyBhWyA5IF0gKiBiWyAyIF0gKyBhWyAxMyBdICogYlsgMyBdLFxuICAgICAgYVsgMiBdICogYlsgMCBdICsgYVsgNiBdICogYlsgMSBdICsgYVsgMTAgXSAqIGJbIDIgXSArIGFbIDE0IF0gKiBiWyAzIF0sXG4gICAgICBhWyAzIF0gKiBiWyAwIF0gKyBhWyA3IF0gKiBiWyAxIF0gKyBhWyAxMSBdICogYlsgMiBdICsgYVsgMTUgXSAqIGJbIDMgXSxcblxuICAgICAgYVsgMCBdICogYlsgNCBdICsgYVsgNCBdICogYlsgNSBdICsgYVsgOCBdICogYlsgNiBdICsgYVsgMTIgXSAqIGJbIDcgXSxcbiAgICAgIGFbIDEgXSAqIGJbIDQgXSArIGFbIDUgXSAqIGJbIDUgXSArIGFbIDkgXSAqIGJbIDYgXSArIGFbIDEzIF0gKiBiWyA3IF0sXG4gICAgICBhWyAyIF0gKiBiWyA0IF0gKyBhWyA2IF0gKiBiWyA1IF0gKyBhWyAxMCBdICogYlsgNiBdICsgYVsgMTQgXSAqIGJbIDcgXSxcbiAgICAgIGFbIDMgXSAqIGJbIDQgXSArIGFbIDcgXSAqIGJbIDUgXSArIGFbIDExIF0gKiBiWyA2IF0gKyBhWyAxNSBdICogYlsgNyBdLFxuXG4gICAgICBhWyAwIF0gKiBiWyA4IF0gKyBhWyA0IF0gKiBiWyA5IF0gKyBhWyA4IF0gKiBiWyAxMCBdICsgYVsgMTIgXSAqIGJbIDExIF0sXG4gICAgICBhWyAxIF0gKiBiWyA4IF0gKyBhWyA1IF0gKiBiWyA5IF0gKyBhWyA5IF0gKiBiWyAxMCBdICsgYVsgMTMgXSAqIGJbIDExIF0sXG4gICAgICBhWyAyIF0gKiBiWyA4IF0gKyBhWyA2IF0gKiBiWyA5IF0gKyBhWyAxMCBdICogYlsgMTAgXSArIGFbIDE0IF0gKiBiWyAxMSBdLFxuICAgICAgYVsgMyBdICogYlsgOCBdICsgYVsgNyBdICogYlsgOSBdICsgYVsgMTEgXSAqIGJbIDEwIF0gKyBhWyAxNSBdICogYlsgMTEgXSxcblxuICAgICAgYVsgMCBdICogYlsgMTIgXSArIGFbIDQgXSAqIGJbIDEzIF0gKyBhWyA4IF0gKiBiWyAxNCBdICsgYVsgMTIgXSAqIGJbIDE1IF0sXG4gICAgICBhWyAxIF0gKiBiWyAxMiBdICsgYVsgNSBdICogYlsgMTMgXSArIGFbIDkgXSAqIGJbIDE0IF0gKyBhWyAxMyBdICogYlsgMTUgXSxcbiAgICAgIGFbIDIgXSAqIGJbIDEyIF0gKyBhWyA2IF0gKiBiWyAxMyBdICsgYVsgMTAgXSAqIGJbIDE0IF0gKyBhWyAxNCBdICogYlsgMTUgXSxcbiAgICAgIGFbIDMgXSAqIGJbIDEyIF0gKyBhWyA3IF0gKiBiWyAxMyBdICsgYVsgMTEgXSAqIGJbIDE0IF0gKyBhWyAxNSBdICogYlsgMTUgXVxuICAgIF0gKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBNdWx0aXBseSB0aGlzIE1hdHJpeDQgYnkgYSBzY2FsYXJcbiAgICovXG4gIHB1YmxpYyBzY2FsZVNjYWxhciggc2NhbGFyOiBudW1iZXIgKTogTWF0cml4NCB7XG4gICAgcmV0dXJuIG5ldyBNYXRyaXg0KCB0aGlzLmVsZW1lbnRzLm1hcCggKCB2ICkgPT4gdiAqIHNjYWxhciApIGFzIHJhd01hdHJpeDQgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBbiBpZGVudGl0eSBNYXRyaXg0LlxuICAgKi9cbiAgcHVibGljIHN0YXRpYyBnZXQgaWRlbnRpdHkoKTogTWF0cml4NCB7XG4gICAgcmV0dXJuIG5ldyBNYXRyaXg0KCByYXdJZGVudGl0eU1hdHJpeDQgKTtcbiAgfVxuXG4gIHB1YmxpYyBzdGF0aWMgbXVsdGlwbHkoIC4uLm1hdHJpY2VzOiBNYXRyaXg0W10gKTogTWF0cml4NCB7XG4gICAgaWYgKCBtYXRyaWNlcy5sZW5ndGggPT09IDAgKSB7XG4gICAgICByZXR1cm4gTWF0cml4NC5pZGVudGl0eTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgYk1hdHMgPSBtYXRyaWNlcy5jb25jYXQoKTtcbiAgICAgIGNvbnN0IGFNYXQgPSBiTWF0cy5zaGlmdCgpITtcbiAgICAgIHJldHVybiBhTWF0Lm11bHRpcGx5KCAuLi5iTWF0cyApO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBHZW5lcmF0ZSBhIHRyYW5zbGF0aW9uIG1hdHJpeC5cbiAgICogQHBhcmFtIHZlY3RvciBUcmFuc2xhdGlvblxuICAgKi9cbiAgcHVibGljIHN0YXRpYyB0cmFuc2xhdGUoIHZlY3RvcjogVmVjdG9yMyApOiBNYXRyaXg0IHtcbiAgICByZXR1cm4gbmV3IE1hdHJpeDQoIFtcbiAgICAgIDEsIDAsIDAsIDAsXG4gICAgICAwLCAxLCAwLCAwLFxuICAgICAgMCwgMCwgMSwgMCxcbiAgICAgIHZlY3Rvci54LCB2ZWN0b3IueSwgdmVjdG9yLnosIDFcbiAgICBdICk7XG4gIH1cblxuICAvKipcbiAgICogR2VuZXJhdGUgYSAzZCBzY2FsaW5nIG1hdHJpeC5cbiAgICogQHBhcmFtIHZlY3RvciBTY2FsZVxuICAgKi9cbiAgcHVibGljIHN0YXRpYyBzY2FsZSggdmVjdG9yOiBWZWN0b3IzICk6IE1hdHJpeDQge1xuICAgIHJldHVybiBuZXcgTWF0cml4NCggW1xuICAgICAgdmVjdG9yLngsIDAsIDAsIDAsXG4gICAgICAwLCB2ZWN0b3IueSwgMCwgMCxcbiAgICAgIDAsIDAsIHZlY3Rvci56LCAwLFxuICAgICAgMCwgMCwgMCwgMVxuICAgIF0gKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZW5lcmF0ZSBhIDNkIHNjYWxpbmcgbWF0cml4IGJ5IGEgc2NhbGFyLlxuICAgKiBAcGFyYW0gdmVjdG9yIFNjYWxlXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIHNjYWxlU2NhbGFyKCBzY2FsYXI6IG51bWJlciApOiBNYXRyaXg0IHtcbiAgICByZXR1cm4gbmV3IE1hdHJpeDQoIFtcbiAgICAgIHNjYWxhciwgMCwgMCwgMCxcbiAgICAgIDAsIHNjYWxhciwgMCwgMCxcbiAgICAgIDAsIDAsIHNjYWxhciwgMCxcbiAgICAgIDAsIDAsIDAsIDFcbiAgICBdICk7XG4gIH1cblxuICAvKipcbiAgICogR2VuZXJhdGUgYSAzZCByb3RhdGlvbiBtYXRyaXgsIHJvdGF0ZXMgYXJvdW5kIHggYXhpcy5cbiAgICogQHBhcmFtIHZlY3RvciBTY2FsZVxuICAgKi9cbiAgcHVibGljIHN0YXRpYyByb3RhdGVYKCB0aGV0YTogbnVtYmVyICk6IE1hdHJpeDQge1xuICAgIHJldHVybiBuZXcgTWF0cml4NCggW1xuICAgICAgMSwgMCwgMCwgMCxcbiAgICAgIDAsIE1hdGguY29zKCB0aGV0YSApLCAtTWF0aC5zaW4oIHRoZXRhICksIDAsXG4gICAgICAwLCBNYXRoLnNpbiggdGhldGEgKSwgTWF0aC5jb3MoIHRoZXRhICksIDAsXG4gICAgICAwLCAwLCAwLCAxXG4gICAgXSApO1xuICB9XG5cbiAgLyoqXG4gICAqIEdlbmVyYXRlIGEgM2Qgcm90YXRpb24gbWF0cml4LCByb3RhdGVzIGFyb3VuZCB5IGF4aXMuXG4gICAqIEBwYXJhbSB2ZWN0b3IgU2NhbGVcbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgcm90YXRlWSggdGhldGE6IG51bWJlciApOiBNYXRyaXg0IHtcbiAgICByZXR1cm4gbmV3IE1hdHJpeDQoIFtcbiAgICAgIE1hdGguY29zKCB0aGV0YSApLCAwLCBNYXRoLnNpbiggdGhldGEgKSwgMCxcbiAgICAgIDAsIDEsIDAsIDAsXG4gICAgICAtTWF0aC5zaW4oIHRoZXRhICksIDAsIE1hdGguY29zKCB0aGV0YSApLCAwLFxuICAgICAgMCwgMCwgMCwgMVxuICAgIF0gKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZW5lcmF0ZSBhIDNkIHJvdGF0aW9uIG1hdHJpeCwgcm90YXRlcyBhcm91bmQgeiBheGlzLlxuICAgKiBAcGFyYW0gdmVjdG9yIFNjYWxlXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIHJvdGF0ZVooIHRoZXRhOiBudW1iZXIgKTogTWF0cml4NCB7XG4gICAgcmV0dXJuIG5ldyBNYXRyaXg0KCBbXG4gICAgICBNYXRoLmNvcyggdGhldGEgKSwgLU1hdGguc2luKCB0aGV0YSApLCAwLCAwLFxuICAgICAgTWF0aC5zaW4oIHRoZXRhICksIE1hdGguY29zKCB0aGV0YSApLCAwLCAwLFxuICAgICAgMCwgMCwgMSwgMCxcbiAgICAgIDAsIDAsIDAsIDFcbiAgICBdICk7XG4gIH1cblxuICAvKipcbiAgICogR2VuZXJhdGUgYSBcIkxvb2tBdFwiIG1hdHJpeC5cbiAgICpcbiAgICogU2VlIGFsc286IHtAbGluayBsb29rQXRJbnZlcnNlfVxuICAgKi9cbiAgcHVibGljIHN0YXRpYyBsb29rQXQoXG4gICAgcG9zaXRpb246IFZlY3RvcjMsXG4gICAgdGFyZ2V0ID0gbmV3IFZlY3RvcjMoIFsgMC4wLCAwLjAsIDAuMCBdICksXG4gICAgdXAgPSBuZXcgVmVjdG9yMyggWyAwLjAsIDEuMCwgMC4wIF0gKSxcbiAgICByb2xsID0gMC4wXG4gICk6IE1hdHJpeDQge1xuICAgIGNvbnN0IGRpciA9IHBvc2l0aW9uLnN1YiggdGFyZ2V0ICkubm9ybWFsaXplZDtcbiAgICBsZXQgc2lkID0gdXAuY3Jvc3MoIGRpciApLm5vcm1hbGl6ZWQ7XG4gICAgbGV0IHRvcCA9IGRpci5jcm9zcyggc2lkICk7XG4gICAgc2lkID0gc2lkLnNjYWxlKCBNYXRoLmNvcyggcm9sbCApICkuYWRkKCB0b3Auc2NhbGUoIE1hdGguc2luKCByb2xsICkgKSApO1xuICAgIHRvcCA9IGRpci5jcm9zcyggc2lkICk7XG5cbiAgICByZXR1cm4gbmV3IE1hdHJpeDQoIFtcbiAgICAgIHNpZC54LCBzaWQueSwgc2lkLnosIDAuMCxcbiAgICAgIHRvcC54LCB0b3AueSwgdG9wLnosIDAuMCxcbiAgICAgIGRpci54LCBkaXIueSwgZGlyLnosIDAuMCxcbiAgICAgIHBvc2l0aW9uLngsIHBvc2l0aW9uLnksIHBvc2l0aW9uLnosIDEuMFxuICAgIF0gKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZW5lcmF0ZSBhbiBpbnZlcnNlIG9mIFwiTG9va0F0XCIgbWF0cml4LiBHb29kIGZvciBjcmVhdGluZyBhIHZpZXcgbWF0cml4LlxuICAgKlxuICAgKiBTZWUgYWxzbzoge0BsaW5rIGxvb2tBdH1cbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgbG9va0F0SW52ZXJzZShcbiAgICBwb3NpdGlvbjogVmVjdG9yMyxcbiAgICB0YXJnZXQgPSBuZXcgVmVjdG9yMyggWyAwLjAsIDAuMCwgMC4wIF0gKSxcbiAgICB1cCA9IG5ldyBWZWN0b3IzKCBbIDAuMCwgMS4wLCAwLjAgXSApLFxuICAgIHJvbGwgPSAwLjBcbiAgKTogTWF0cml4NCB7XG4gICAgY29uc3QgZGlyID0gcG9zaXRpb24uc3ViKCB0YXJnZXQgKS5ub3JtYWxpemVkO1xuICAgIGxldCBzaWQgPSB1cC5jcm9zcyggZGlyICkubm9ybWFsaXplZDtcbiAgICBsZXQgdG9wID0gZGlyLmNyb3NzKCBzaWQgKTtcbiAgICBzaWQgPSBzaWQuc2NhbGUoIE1hdGguY29zKCByb2xsICkgKS5hZGQoIHRvcC5zY2FsZSggTWF0aC5zaW4oIHJvbGwgKSApICk7XG4gICAgdG9wID0gZGlyLmNyb3NzKCBzaWQgKTtcblxuICAgIHJldHVybiBuZXcgTWF0cml4NCggW1xuICAgICAgc2lkLngsIHRvcC54LCBkaXIueCwgMC4wLFxuICAgICAgc2lkLnksIHRvcC55LCBkaXIueSwgMC4wLFxuICAgICAgc2lkLnosIHRvcC56LCBkaXIueiwgMC4wLFxuICAgICAgLXNpZC54ICogcG9zaXRpb24ueCAtIHNpZC55ICogcG9zaXRpb24ueSAtIHNpZC56ICogcG9zaXRpb24ueixcbiAgICAgIC10b3AueCAqIHBvc2l0aW9uLnggLSB0b3AueSAqIHBvc2l0aW9uLnkgLSB0b3AueiAqIHBvc2l0aW9uLnosXG4gICAgICAtZGlyLnggKiBwb3NpdGlvbi54IC0gZGlyLnkgKiBwb3NpdGlvbi55IC0gZGlyLnogKiBwb3NpdGlvbi56LFxuICAgICAgMS4wXG4gICAgXSApO1xuICB9XG5cbiAgLyoqXG4gICAqIEdlbmVyYXRlIGEgXCJQZXJzcGVjdGl2ZVwiIHByb2plY3Rpb24gbWF0cml4LlxuICAgKiBJdCB3b24ndCBpbmNsdWRlIGFzcGVjdCFcbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgcGVyc3BlY3RpdmUoIGZvdiA9IDQ1LjAsIG5lYXIgPSAwLjAxLCBmYXIgPSAxMDAuMCApOiBNYXRyaXg0IHtcbiAgICBjb25zdCBwID0gMS4wIC8gTWF0aC50YW4oIGZvdiAqIE1hdGguUEkgLyAzNjAuMCApO1xuICAgIGNvbnN0IGQgPSAoIGZhciAtIG5lYXIgKTtcbiAgICByZXR1cm4gbmV3IE1hdHJpeDQoIFtcbiAgICAgIHAsIDAuMCwgMC4wLCAwLjAsXG4gICAgICAwLjAsIHAsIDAuMCwgMC4wLFxuICAgICAgMC4wLCAwLjAsIC0oIGZhciArIG5lYXIgKSAvIGQsIC0xLjAsXG4gICAgICAwLjAsIDAuMCwgLTIgKiBmYXIgKiBuZWFyIC8gZCwgMC4wXG4gICAgXSApO1xuICB9XG5cbiAgLyoqXG4gICAqIERlY29tcG9zZSB0aGlzIG1hdHJpeCBpbnRvIGEgcG9zaXRpb24sIGEgc2NhbGUsIGFuZCBhIHJvdGF0aW9uLlxuICAgKiBZb2lua2VkIGZyb20gVGhyZWUuanMuXG4gICAqL1xuICBwdWJsaWMgZGVjb21wb3NlKCk6IHsgcG9zaXRpb246IFZlY3RvcjM7IHNjYWxlOiBWZWN0b3IzOyByb3RhdGlvbjogUXVhdGVybmlvbiB9IHtcbiAgICBjb25zdCBtID0gdGhpcy5lbGVtZW50cztcblxuICAgIGxldCBzeCA9IG5ldyBWZWN0b3IzKCBbIG1bIDAgXSwgbVsgMSBdLCBtWyAyIF0gXSApLmxlbmd0aDtcbiAgICBjb25zdCBzeSA9IG5ldyBWZWN0b3IzKCBbIG1bIDQgXSwgbVsgNSBdLCBtWyA2IF0gXSApLmxlbmd0aDtcbiAgICBjb25zdCBzeiA9IG5ldyBWZWN0b3IzKCBbIG1bIDggXSwgbVsgOSBdLCBtWyAxMCBdIF0gKS5sZW5ndGg7XG5cbiAgICAvLyBpZiBkZXRlcm1pbmUgaXMgbmVnYXRpdmUsIHdlIG5lZWQgdG8gaW52ZXJ0IG9uZSBzY2FsZVxuICAgIGNvbnN0IGRldCA9IHRoaXMuZGV0ZXJtaW5hbnQ7XG4gICAgaWYgKCBkZXQgPCAwICkgeyBzeCA9IC1zeDsgfVxuXG4gICAgY29uc3QgaW52U3ggPSAxLjAgLyBzeDtcbiAgICBjb25zdCBpbnZTeSA9IDEuMCAvIHN5O1xuICAgIGNvbnN0IGludlN6ID0gMS4wIC8gc3o7XG5cbiAgICBjb25zdCByb3RhdGlvbk1hdHJpeCA9IHRoaXMuY2xvbmUoKTtcblxuICAgIHJvdGF0aW9uTWF0cml4LmVsZW1lbnRzWyAwIF0gKj0gaW52U3g7XG4gICAgcm90YXRpb25NYXRyaXguZWxlbWVudHNbIDEgXSAqPSBpbnZTeDtcbiAgICByb3RhdGlvbk1hdHJpeC5lbGVtZW50c1sgMiBdICo9IGludlN4O1xuXG4gICAgcm90YXRpb25NYXRyaXguZWxlbWVudHNbIDQgXSAqPSBpbnZTeTtcbiAgICByb3RhdGlvbk1hdHJpeC5lbGVtZW50c1sgNSBdICo9IGludlN5O1xuICAgIHJvdGF0aW9uTWF0cml4LmVsZW1lbnRzWyA2IF0gKj0gaW52U3k7XG5cbiAgICByb3RhdGlvbk1hdHJpeC5lbGVtZW50c1sgOCBdICo9IGludlN6O1xuICAgIHJvdGF0aW9uTWF0cml4LmVsZW1lbnRzWyA5IF0gKj0gaW52U3o7XG4gICAgcm90YXRpb25NYXRyaXguZWxlbWVudHNbIDEwIF0gKj0gaW52U3o7XG5cbiAgICByZXR1cm4ge1xuICAgICAgcG9zaXRpb246IG5ldyBWZWN0b3IzKCBbIG1bIDEyIF0sIG1bIDEzIF0sIG1bIDE0IF0gXSApLFxuICAgICAgc2NhbGU6IG5ldyBWZWN0b3IzKCBbIHN4LCBzeSwgc3ogXSApLFxuICAgICAgcm90YXRpb246IFF1YXRlcm5pb24uZnJvbU1hdHJpeCggcm90YXRpb25NYXRyaXggKVxuICAgIH07XG4gIH1cblxuICAvKipcbiAgICogQ29tcG9zZSBhIG1hdHJpeCBvdXQgb2YgcG9zaXRpb24sIHNjYWxlLCBhbmQgcm90YXRpb24uXG4gICAqIFlvaW5rZWQgZnJvbSBUaHJlZS5qcy5cbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgY29tcG9zZSggcG9zaXRpb246IFZlY3RvcjMsIHJvdGF0aW9uOiBRdWF0ZXJuaW9uLCBzY2FsZTogVmVjdG9yMyApOiBNYXRyaXg0IHtcbiAgICBjb25zdCB4ID0gcm90YXRpb24ueCwgeSA9IHJvdGF0aW9uLnksIHogPSByb3RhdGlvbi56LCB3ID0gcm90YXRpb24udztcbiAgICBjb25zdCB4MiA9IHggKyB4LFx0eTIgPSB5ICsgeSwgejIgPSB6ICsgejtcbiAgICBjb25zdCB4eCA9IHggKiB4MiwgeHkgPSB4ICogeTIsIHh6ID0geCAqIHoyO1xuICAgIGNvbnN0IHl5ID0geSAqIHkyLCB5eiA9IHkgKiB6MiwgenogPSB6ICogejI7XG4gICAgY29uc3Qgd3ggPSB3ICogeDIsIHd5ID0gdyAqIHkyLCB3eiA9IHcgKiB6MjtcbiAgICBjb25zdCBzeCA9IHNjYWxlLngsIHN5ID0gc2NhbGUueSwgc3ogPSBzY2FsZS56O1xuXG4gICAgcmV0dXJuIG5ldyBNYXRyaXg0KCBbXG4gICAgICAoIDEuMCAtICggeXkgKyB6eiApICkgKiBzeCxcbiAgICAgICggeHkgKyB3eiApICogc3gsXG4gICAgICAoIHh6IC0gd3kgKSAqIHN4LFxuICAgICAgMC4wLFxuXG4gICAgICAoIHh5IC0gd3ogKSAqIHN5LFxuICAgICAgKCAxLjAgLSAoIHh4ICsgenogKSApICogc3ksXG4gICAgICAoIHl6ICsgd3ggKSAqIHN5LFxuICAgICAgMC4wLFxuXG4gICAgICAoIHh6ICsgd3kgKSAqIHN6LFxuICAgICAgKCB5eiAtIHd4ICkgKiBzeixcbiAgICAgICggMS4wIC0gKCB4eCArIHl5ICkgKSAqIHN6LFxuICAgICAgMC4wLFxuXG4gICAgICBwb3NpdGlvbi54LFxuICAgICAgcG9zaXRpb24ueSxcbiAgICAgIHBvc2l0aW9uLnosXG4gICAgICAxLjBcbiAgICBdICk7XG4gIH1cbn1cbiIsImltcG9ydCB7IE1hdHJpeDQgfSBmcm9tICcuL01hdHJpeDQnO1xuaW1wb3J0IHsgVmVjdG9yIH0gZnJvbSAnLi9WZWN0b3InO1xuXG5leHBvcnQgdHlwZSByYXdWZWN0b3I0ID0gWyBudW1iZXIsIG51bWJlciwgbnVtYmVyLCBudW1iZXIgXTtcblxuLyoqXG4gKiBBIFZlY3RvcjMuXG4gKi9cbmV4cG9ydCBjbGFzcyBWZWN0b3I0IGV4dGVuZHMgVmVjdG9yPFZlY3RvcjQ+IHtcbiAgcHVibGljIGVsZW1lbnRzOiByYXdWZWN0b3I0O1xuXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggdjogcmF3VmVjdG9yNCA9IFsgMC4wLCAwLjAsIDAuMCwgMC4wIF0gKSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLmVsZW1lbnRzID0gdjtcbiAgfVxuXG4gIC8qKlxuICAgKiBBbiB4IGNvbXBvbmVudCBvZiB0aGlzLlxuICAgKi9cbiAgcHVibGljIGdldCB4KCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuZWxlbWVudHNbIDAgXTtcbiAgfVxuXG4gIHB1YmxpYyBzZXQgeCggeDogbnVtYmVyICkge1xuICAgIHRoaXMuZWxlbWVudHNbIDAgXSA9IHg7XG4gIH1cblxuICAvKipcbiAgICogQSB5IGNvbXBvbmVudCBvZiB0aGlzLlxuICAgKi9cbiAgcHVibGljIGdldCB5KCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuZWxlbWVudHNbIDEgXTtcbiAgfVxuXG4gIHB1YmxpYyBzZXQgeSggeTogbnVtYmVyICkge1xuICAgIHRoaXMuZWxlbWVudHNbIDEgXSA9IHk7XG4gIH1cblxuICAvKipcbiAgICogQSB6IGNvbXBvbmVudCBvZiB0aGlzLlxuICAgKi9cbiAgcHVibGljIGdldCB6KCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuZWxlbWVudHNbIDIgXTtcbiAgfVxuXG4gIHB1YmxpYyBzZXQgeiggejogbnVtYmVyICkge1xuICAgIHRoaXMuZWxlbWVudHNbIDIgXSA9IHo7XG4gIH1cblxuICAvKipcbiAgICogQSB3IGNvbXBvbmVudCBvZiB0aGlzLlxuICAgKi9cbiAgcHVibGljIGdldCB3KCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuZWxlbWVudHNbIDMgXTtcbiAgfVxuXG4gIHB1YmxpYyBzZXQgdyggejogbnVtYmVyICkge1xuICAgIHRoaXMuZWxlbWVudHNbIDMgXSA9IHo7XG4gIH1cblxuICBwdWJsaWMgdG9TdHJpbmcoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gYFZlY3RvcjQoICR7IHRoaXMueC50b0ZpeGVkKCAzICkgfSwgJHsgdGhpcy55LnRvRml4ZWQoIDMgKSB9LCAkeyB0aGlzLnoudG9GaXhlZCggMyApIH0sICR7IHRoaXMudy50b0ZpeGVkKCAzICkgfSApYDtcbiAgfVxuXG4gIC8qKlxuICAgKiBNdWx0aXBseSB0aGlzIHZlY3RvciAod2l0aCBhbiBpbXBsaWNpdCAxIGluIHRoZSA0dGggZGltZW5zaW9uKSBieSBtLlxuICAgKi9cbiAgcHVibGljIGFwcGx5TWF0cml4NCggbWF0cml4OiBNYXRyaXg0ICk6IFZlY3RvcjQge1xuICAgIGNvbnN0IG0gPSBtYXRyaXguZWxlbWVudHM7XG5cbiAgICByZXR1cm4gbmV3IFZlY3RvcjQoIFtcbiAgICAgIG1bIDAgXSAqIHRoaXMueCArIG1bIDQgXSAqIHRoaXMueSArIG1bIDggXSAqIHRoaXMueiArIG1bIDEyIF0gKiB0aGlzLncsXG4gICAgICBtWyAxIF0gKiB0aGlzLnggKyBtWyA1IF0gKiB0aGlzLnkgKyBtWyA5IF0gKiB0aGlzLnogKyBtWyAxMyBdICogdGhpcy53LFxuICAgICAgbVsgMiBdICogdGhpcy54ICsgbVsgNiBdICogdGhpcy55ICsgbVsgMTAgXSAqIHRoaXMueiArIG1bIDE0IF0gKiB0aGlzLncsXG4gICAgICBtWyAzIF0gKiB0aGlzLnggKyBtWyA3IF0gKiB0aGlzLnkgKyBtWyAxMSBdICogdGhpcy56ICsgbVsgMTUgXSAqIHRoaXMud1xuICAgIF0gKTtcbiAgfVxuXG4gIHByb3RlY3RlZCBfX25ldyggdjogcmF3VmVjdG9yNCApOiBWZWN0b3I0IHtcbiAgICByZXR1cm4gbmV3IFZlY3RvcjQoIHYgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBWZWN0b3I0KCAwLjAsIDAuMCwgMC4wLCAwLjAgKVxuICAgKi9cbiAgcHVibGljIHN0YXRpYyBnZXQgemVybygpOiBWZWN0b3I0IHtcbiAgICByZXR1cm4gbmV3IFZlY3RvcjQoIFsgMC4wLCAwLjAsIDAuMCwgMC4wIF0gKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBWZWN0b3I0KCAxLjAsIDEuMCwgMS4wLCAxLjAgKVxuICAgKi9cbiAgcHVibGljIHN0YXRpYyBnZXQgb25lKCk6IFZlY3RvcjQge1xuICAgIHJldHVybiBuZXcgVmVjdG9yNCggWyAxLjAsIDEuMCwgMS4wLCAxLjAgXSApO1xuICB9XG59XG4iLCIvKipcbiAqIFVzZWZ1bCBmb3Igc3dhcCBidWZmZXJcbiAqL1xuZXhwb3J0IGNsYXNzIFN3YXA8VD4ge1xuICBwdWJsaWMgaTogVDtcbiAgcHVibGljIG86IFQ7XG5cbiAgcHVibGljIGNvbnN0cnVjdG9yKCBhOiBULCBiOiBUICkge1xuICAgIHRoaXMuaSA9IGE7XG4gICAgdGhpcy5vID0gYjtcbiAgfVxuXG4gIHB1YmxpYyBzd2FwKCk6IHZvaWQge1xuICAgIGNvbnN0IGkgPSB0aGlzLmk7XG4gICAgdGhpcy5pID0gdGhpcy5vO1xuICAgIHRoaXMubyA9IGk7XG4gIH1cbn1cbiIsImltcG9ydCB7IEhpc3RvcnlNZWFuQ2FsY3VsYXRvciB9IGZyb20gJy4uL0hpc3RvcnlNZWFuQ2FsY3VsYXRvci9IaXN0b3J5TWVhbkNhbGN1bGF0b3InO1xuXG5leHBvcnQgY2xhc3MgVGFwVGVtcG8ge1xuICBwcml2YXRlIF9fYnBtID0gMC4wO1xuICBwcml2YXRlIF9fbGFzdFRhcCA9IDAuMDtcbiAgcHJpdmF0ZSBfX2xhc3RCZWF0ID0gMC4wO1xuICBwcml2YXRlIF9fbGFzdFRpbWUgPSAwLjA7XG4gIHByaXZhdGUgX19jYWxjOiBIaXN0b3J5TWVhbkNhbGN1bGF0b3IgPSBuZXcgSGlzdG9yeU1lYW5DYWxjdWxhdG9yKCAxNiApO1xuXG4gIHB1YmxpYyBnZXQgYmVhdER1cmF0aW9uKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIDYwLjAgLyB0aGlzLl9fYnBtO1xuICB9XG5cbiAgcHVibGljIGdldCBicG0oKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5fX2JwbTtcbiAgfVxuXG4gIHB1YmxpYyBzZXQgYnBtKCBicG06IG51bWJlciApIHtcbiAgICB0aGlzLl9fbGFzdEJlYXQgPSB0aGlzLmJlYXQ7XG4gICAgdGhpcy5fX2xhc3RUaW1lID0gcGVyZm9ybWFuY2Uubm93KCk7XG4gICAgdGhpcy5fX2JwbSA9IGJwbTtcbiAgfVxuXG4gIHB1YmxpYyBnZXQgYmVhdCgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLl9fbGFzdEJlYXQgKyAoIHBlcmZvcm1hbmNlLm5vdygpIC0gdGhpcy5fX2xhc3RUaW1lICkgKiAwLjAwMSAvIHRoaXMuYmVhdER1cmF0aW9uO1xuICB9XG5cbiAgcHVibGljIHJlc2V0KCk6IHZvaWQge1xuICAgIHRoaXMuX19jYWxjLnJlc2V0KCk7XG4gIH1cblxuICBwdWJsaWMgbnVkZ2UoIGFtb3VudDogbnVtYmVyICk6IHZvaWQge1xuICAgIHRoaXMuX19sYXN0QmVhdCA9IHRoaXMuYmVhdCArIGFtb3VudDtcbiAgICB0aGlzLl9fbGFzdFRpbWUgPSBwZXJmb3JtYW5jZS5ub3coKTtcbiAgfVxuXG4gIHB1YmxpYyB0YXAoKTogdm9pZCB7XG4gICAgY29uc3Qgbm93ID0gcGVyZm9ybWFuY2Uubm93KCk7XG4gICAgY29uc3QgZGVsdGEgPSAoIG5vdyAtIHRoaXMuX19sYXN0VGFwICkgKiAwLjAwMTtcblxuICAgIGlmICggMi4wIDwgZGVsdGEgKSB7XG4gICAgICB0aGlzLnJlc2V0KCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX19jYWxjLnB1c2goIGRlbHRhICk7XG4gICAgICB0aGlzLl9fYnBtID0gNjAuMCAvICggdGhpcy5fX2NhbGMubWVhbiApO1xuICAgIH1cblxuICAgIHRoaXMuX19sYXN0VGFwID0gbm93O1xuICAgIHRoaXMuX19sYXN0VGltZSA9IG5vdztcbiAgICB0aGlzLl9fbGFzdEJlYXQgPSAwLjA7XG4gIH1cbn1cbiIsImV4cG9ydCBjbGFzcyBYb3JzaGlmdCB7XG4gIHB1YmxpYyBzZWVkOiBudW1iZXI7XG5cbiAgcHVibGljIGNvbnN0cnVjdG9yKCBzZWVkPzogbnVtYmVyICkge1xuICAgIHRoaXMuc2VlZCA9IHNlZWQgfHwgMTtcbiAgfVxuXG4gIHB1YmxpYyBnZW4oIHNlZWQ/OiBudW1iZXIgKTogbnVtYmVyIHtcbiAgICBpZiAoIHNlZWQgKSB7XG4gICAgICB0aGlzLnNlZWQgPSBzZWVkO1xuICAgIH1cblxuICAgIHRoaXMuc2VlZCA9IHRoaXMuc2VlZCBeICggdGhpcy5zZWVkIDw8IDEzICk7XG4gICAgdGhpcy5zZWVkID0gdGhpcy5zZWVkIF4gKCB0aGlzLnNlZWQgPj4+IDE3ICk7XG4gICAgdGhpcy5zZWVkID0gdGhpcy5zZWVkIF4gKCB0aGlzLnNlZWQgPDwgNSApO1xuICAgIHJldHVybiB0aGlzLnNlZWQgLyBNYXRoLnBvdyggMiwgMzIgKSArIDAuNTtcbiAgfVxuXG4gIHB1YmxpYyBzZXQoIHNlZWQ/OiBudW1iZXIgKTogdm9pZCB7XG4gICAgdGhpcy5zZWVkID0gc2VlZCB8fCB0aGlzLnNlZWQgfHwgMTtcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBYb3JzaGlmdDtcbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7OztBQUFBO1NBVWdCLFlBQVksQ0FDMUIsS0FBbUIsRUFDbkIsZ0JBQW1EO0lBRW5ELElBQUssT0FBTyxnQkFBZ0IsS0FBSyxVQUFVLEVBQUc7UUFDNUMsT0FBTyxZQUFZLENBQUUsS0FBSyxFQUFFLENBQUUsT0FBTyxNQUFRLE9BQU8sSUFBSSxnQkFBZ0IsQ0FBRSxDQUFFLENBQUM7S0FDOUU7SUFDRCxNQUFNLE9BQU8sR0FBRyxnQkFBNkMsQ0FBQztJQUU5RCxJQUFJLEtBQUssR0FBRyxDQUFDLENBQUM7SUFDZCxJQUFJLEdBQUcsR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDO0lBRXZCLE9BQVEsS0FBSyxHQUFHLEdBQUcsRUFBRztRQUNwQixNQUFNLE1BQU0sR0FBRyxDQUFFLEtBQUssR0FBRyxHQUFHLEtBQU0sQ0FBQyxDQUFDO1FBQ3BDLE1BQU0sYUFBYSxHQUFHLEtBQUssQ0FBRSxNQUFNLENBQUUsQ0FBQztRQUV0QyxNQUFNLGFBQWEsR0FBRyxPQUFPLENBQUUsYUFBYSxDQUFFLENBQUM7UUFFL0MsSUFBSyxhQUFhLEVBQUc7WUFDbkIsS0FBSyxHQUFHLE1BQU0sR0FBRyxDQUFDLENBQUM7U0FDcEI7YUFBTTtZQUNMLEdBQUcsR0FBRyxNQUFNLENBQUM7U0FDZDtLQUNGO0lBRUQsT0FBTyxLQUFLLENBQUM7QUFDZjs7QUNwQ0E7OztNQUdhLG1CQUFtQixHQUFHLENBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMs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Q0FBRSxJQUFJLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUUsQ0FBRSxDQUFDO1FBQzVELE1BQU0sQ0FBQyxHQUFHLFVBQVUsQ0FBQyxRQUFRLENBQUM7UUFDOUIsTUFBTSxHQUFHLEdBQUcsVUFBVSxDQUFDLFFBQVEsQ0FBRSxDQUFDLENBQUUsQ0FBQyxRQUFRLENBQUUsQ0FBQyxDQUFFLENBQUM7UUFDbkQsT0FBTyxJQUFJLE9BQU8sQ0FBRSxDQUFFLEdBQUcsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFFLENBQUUsQ0FBQztLQUMvQzs7OztJQUtNLFlBQVksQ0FBRSxNQUFlO1FBQ2xDLE1BQU0sQ0FBQyxHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUM7UUFFMUIsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFFLEVBQUUsQ0FBRSxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFFLEVBQUUsQ0FBRSxDQUFDO1FBQ3pFLE1BQU0sSUFBSSxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUM7UUFFckIsT0FBTyxJQUFJLE9BQU8sQ0FBRTtZQUNsQixDQUFFLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBRSxFQUFFLENBQUUsSUFBSyxJQUFJO1lBQ3hFLENBQUUsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLElBQUksQ0FBQyxDQUFDLEdB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Q0FBRSxFQUFFLENBQUUsRUFBRSxDQUFDLENBQUUsRUFBRSxDQUFFO1lBQ2hDLENBQUMsQ0FBRSxDQUFDLENBQUUsRUFBRSxDQUFDLENBQUUsQ0FBQyxDQUFFLEVBQUUsQ0FBQyxDQUFFLEVBQUUsQ0FBRSxFQUFFLENBQUMsQ0FBRSxFQUFFLENBQUU7U0FDakMsQ0FBRSxDQUFDO0tBQ0w7Ozs7SUFLRCxJQUFXLFdBQVc7UUFDcEIsTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQztRQUN4QixNQUNFLEdBQUcsR0FBRyxDQUFDLENBQUcsQ0FBQyxDQUFFLEVBQUUsR0FBRyxHQUFHLENBQUMsQ0FBRyxDQUFDLENBQUUsRUFBRSxHQUFHLEdBQUcsQ0FBQyxDQUFHLENBQUMsQ0FBRSxFQUFFLEdBQUcsR0FBRyxDQUFDLENBQUcsQ0FBQyxDQUFFLEVBQzFELEdBQUcsR0FBRyxDQUFDLENBQUcsQ0FBQyxDQUFFLEVBQUUsR0FBRyxHQUFHLENBQUMsQ0FBRyxDQUFDLENBQUUsRUFBRSxHQUFHLEdBQUcsQ0FBQyxDQUFHLENBQUMsQ0FBRSxFQUFFLEdBQUcsR0FBRyxDQUFDLENBQUcsQ0FBQyxDQUFFLEVBQzFELEdBQUcsR0FBRyxDQUFDLENBQUcsQ0FBQyxDQUFFLEVBQUUsR0FBRyxHQUFHLENBQUMsQ0FBRyxDQUFDLENBQUUsRUFBRSxHQUFHLEdBQUcsQ0FBQyxDQUFFLEVBQUUsQ0FBRSxFQUFFLEdBQUcsR0FBRyxDQUFDLENBQUUsRUFBRSxDQUFFLEVBQzFELEdBQUcsR0FBRyxDQUFDLENBQUUsRUFBRSxDQUFFLEVBQUUsR0FBRyxHQUFHLENBQUMsQ0FBRSxFQUFFLENBQUUsRUFBRSxHQUFHLEdBQUcsQ0FBQyxDQUFFLEVBQUUsQ0FBRSxFQUFFLEdBQUcsR0FBRyxDQUFDLENBQUUsRUFBRSxDQUFFLEVBQzFELEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEVBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsRUFDekQsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsRUFBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxFQUN6RCxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxFQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEVBQ3pELEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEVBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsRUFDekQsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsRUFBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxFQUN6RCxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxFQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUM7UUFFNUQsT0FBTyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQztLQUM5RTs7OztJQUtELElBQVcsT0FBTztRQUNoQixNQUFNLENBQUMsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDO1FBQ3hCLE1BQ0UsR0FBRyxHQUFHLENBQUMsQ0FBRyxDQUFDLENBQUUsRUFBRSxHQUFHLEdBQUcsQ0FBQyxDQUFHLENBQUMsQ0FBRSxFQUFFLEdBQUcsR0FBRyxDQUFDLENBQUcsQ0FBQyxDQUFFLEVBQUUsR0FBRyxHQUFHLENBQUMsQ0FBRyxDQUFDLENBQUUsRUFDMUQsR0FBRyxHQUFHLENBQUMsQ0FBRyxDQUFDLENBQUUsRUFBRSxHQUFHLEdBQUcsQ0FBQyxDQUFHLENBQUMsQ0FBRSxFQUFFLEdBQUcsR0FBRyxDQUFDLENBQUcsQ0FBQyxDQUFFLEVBQUUsR0FBRyxHQUFHLENBQUMsQ0FBRyxDQUFDLENBQUUsRUFDMUQsR0FBRyxHQUFHLENBQUMsQ0FBRyxDQUFDLENBQUUsRUFBRSxHQUFHLEdBQUcsQ0FBQyxDQUFHLENBQUMsQ0FBRSxFQUFFLEdBQUcsR0FBRyxDQUFDLENBQUUsRUFBRSxDQUFFLEVBQUUsR0FBRyxHQUFHLENBQUMsQ0FBRSxFQUFFLENBQUUsRUFDMUQsR0FBRyxHQUFHLENBQUMsQ0FBRSxFQUFFLENBQUUsRUFBRSxHQUFHLEdBQUcsQ0FBQyxDQUFFLEVBQUUsQ0FBRSxFQUFFLEdBQUcsR0FBRyxDQUFDLENBQUUsRUFBRSxDQUFFLEVBQUUsR0FBRyxHQUFHLENBQUMsQ0FBRSxFQUFFLENBQUUsRUFDMUQsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsRUFBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxFQUN6RCxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxFQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEVBQ3pELEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEVBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsRUFDekQsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsRUFBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxFQUN6RCxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxFQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEVBQ3pELEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEVBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQztRQUU1RCxNQUFNLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQztRQUVsRixJQUFLLEdBQUcsS0FBSyxHQUFHLEVBQUc7WUFBRSxPQUFPLElBQUksQ0FBQztTQUFFO1FBRW5DLE1BQU0sTUFBTSxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUM7UUFFekIsT0FBTyxJQUFJLE9BQU8sQ0FBRTtZQUNsQixHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUc7WUFDakMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHO1lBQ2pDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRztZQUNqQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUc7WUFDakMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHO1lBQ2pDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRztZQUNqQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUc7WUFDakMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHO1lBQ2pDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRztZQUNqQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUc7WUFDakMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHO1lBQ2pDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRztZQUNqQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUc7WUFDakMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHO1lBQ2pDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRztZQUNqQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUc7U0FDbEMsQ0FBQyxHQUFHLENBQUUsQ0FBRSxDQUFDLEtBQU0sQ0FBQyxHQUFHLE1BQU0sQ0FBZ0IsQ0FBRSxDQUFDO0tBQzlDO0lBRU0sUUFBUTtRQUNiLE1BQU0sQ0FBQyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFFLENBQUUsQ0FBQyxLQUFNLENBQUMsQ0FBQyxPQUFPLENBQUUsQ0FBQyxDQUFFLENBQUUsQ0FBQztRQUN2RCxPQUFPLFlBQWEsQ0FBQyxDQUFFLENBQUMsQ0FBRyxLQUFNLENBQUMsQ0FBRSxDQUFDLENBQUcsS0FBTSxDQUFDLENBQUUsQ0FBQyxDQUFHLEtBQU0sQ0FBQyxDQUFFLEVBQUUsQ0FBRyxLQUFNLENBQUMsQ0FBRSxDQUFDLENBQUcsS0FBTSxDQUFDLENBQUUsQ0FBQyxDQUFHLEtBQU0sQ0FBQyxDQUFFLENBQUMsQ0FBRyxLQUFNLENBQUMsQ0FBRSxFQUFFLENBQUcsS0FBTSxDQUFDLENBQUUsQ0FBQyxDQUFHLEtBQU0sQ0FBQyxDQUFFLENBQUMsQ0FBRyxLQUFNLENBQUMsQ0FBRSxFQUFFLENBQUcsS0FBTSxDQUFDLENBQUUsRUFBRSxDQUFHLEtBQU0sQ0FBQyxDQUFFLENBQUMsQ0FBRyxLQUFNLENBQUMsQ0FBRSxDQUFDLENBQUcsS0FBTSxDQUFDLENBQUUsRUFBRSxDQUFHLEtBQU0sQ0FBQyxDQUFFLEVBQUUsQ0FBRyxJQUFJLENBQUM7S0FDMU87Ozs7SUFLTSxLQUFLO1FBQ1YsT0FBTyxJQUFJLE9BQU8sQ0FBRSxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBZ0IsQ0FBRSxDQUFDO0tBQzVEOzs7O0lBS00sUUFBUSxDQUFFLEdBQUcsUUFBbUI7UUFDckMsSUFBSyxRQUFRLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRztZQUMzQixPQUFPLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztTQUNyQjtRQUVELE1BQU0sR0FBRyxHQUFHLFFBQVEsQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUM5QixJQUFJLElBQUksR0FBRyxHQUFHLENBQUMsS0FBSyxFQUFHLENBQUM7UUFDeEIsSUFBSyxDQUFDLEdBQUcsR0FBRyxDQUFDLE1BQU0sRUFBRztZQUNwQixJQUFJLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBRSxHQUFHLEdBQUcsQ0FBRSxDQUFDO1NBQ2hDO1FBRUQsTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQztRQUN4QixNQUFNLENBQUMsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDO1FBRXhCLE9BQU8sSUFBSSxPQUFPLENBQUU7WUFDbEIsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLEVBQUUsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUU7WUFDdEUsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLEVBQUUsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUU7WUFDdEUsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxFQUFFLENBQUUsR0FBRyxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLEVBQUUsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUU7WUFDdkUsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxFQUFFLENBQUUsR0FBRyxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLEVBQUUsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUU7WUFFdkUsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLEVBQUUsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUU7WUFDdEUsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLEVBQUUsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUU7WUFDdEUsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxFQUFFLENBQUUsR0FBRyxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLEVBQUUsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUU7WUFDdkUsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxFQUFFLENBQUUsR0FBRyxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLEVBQUUsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUU7WUFFdkUsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsRUFBRSxDQUFFLEdBQUcsQ0FBQyxDQUFFLEVBQUUsQ0FBRSxHQUFHLENBQUMsQ0FBRSxFQUFFLENBQUU7WUFDeEUsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsRUFBRSxDQUFFLEdBQUcsQ0FBQyxDQUFFLEVBQUUsQ0FBRSxHQUFHLENBQUMsQ0FBRSxFQUFFLENBQUU7WUFDeEUsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxFQUFFLENBQUUsR0FBRyxDQUFDLENBQUUsRUFBRSxDQUFFLEdBQUcsQ0FBQyxDQUFFLEVBQUUsQ0FBRSxHQUFHLENBQUMsQ0FBRSxFQUFFLENBQUU7WUFDekUsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxFQUFFLENBQUUsR0FBRyxDQUFDLENBQUUsRUFBRSxDQUFFLEdBQUcsQ0FBQyxDQUFFLEVBQUUsQ0FBRSxHQUFHLENBQUMsQ0FBRSxFQUFFLENBQUU7WUFFekUsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxFQUFFLENBQUUsR0FBRyxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLEVBQUUsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsRUFBRSxDQUFFLEdBQUcsQ0FBQyxDQUFFLEVBQUUsQ0FBRSxHQUFHLENBQUMsQ0FBRSxFQUFFLENBQUU7WUFDMUUsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxFQUFFLENBQUUsR0FBRyxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLEVBQUUsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsRUFBRSxDQUFFLEdBQUcsQ0FBQyxDQUFFLEVBQUUsQ0FBRSxHQUFHLENBQUMsQ0FBRSxFQUFFLENBQUU7WUFDMUUsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxFQUFFLENBQUUsR0FBRyxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLEVBQUUsQ0FBRSxHQUFHLENBQUMsQ0FBRSxFQUFFLENBQUUsR0FBRyxDQUFDLENBQUUsRUFBRSxDQUFFLEdBQUcs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
