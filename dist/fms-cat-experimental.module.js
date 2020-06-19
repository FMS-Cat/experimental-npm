/*!
* @fms-cat/experimental v0.4.0
* Experimental edition of FMS_Cat
*
* Copyright (c) 2019-2020 FMS_Cat
* @fms-cat/experimental is distributed under MIT License
* https://github.com/FMS-Cat/experimental-npm/blob/master/LICENSE
*/
// yoinked from https://stackoverflow.com/questions/1344500/efficient-way-to-insert-a-number-into-a-sorted-array-of-numbers
function binarySearch(element, array) {
    let start = 0;
    let end = array.length;
    while (start < end) {
        const center = (start + end) >> 1;
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
 * Useful for fps calc
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
 * Useful for tap tempo
 * See also: {@link HistoryMeanCalculator}
 */
class HistoryMedianCalculator {
    constructor(length) {
        this.__history = [];
        this.__sorted = [];
        this.__index = 0;
        this.__length = length;
    }
    get median() {
        const count = Math.min(this.__sorted.length, this.__length);
        return this.__sorted[Math.floor((count - 1) / 2)];
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
            const prevIndex = binarySearch(prev, this.__sorted);
            this.__sorted.splice(prevIndex, 1);
        }
        const index = binarySearch(value, this.__sorted);
        this.__sorted.splice(index, 0, value);
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
     * Generate a "LookAt" view matrix.
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

export { CDS, Clock, ClockFrame, ClockRealtime, ExpSmooth, FMS_Cat, FizzBuzz, HistoryMeanCalculator, HistoryMedianCalculator, Matrix4, Quaternion, Swap, TRIANGLE_STRIP_QUAD, TRIANGLE_STRIP_QUAD_3D, TRIANGLE_STRIP_QUAD_NORMAL, TRIANGLE_STRIP_QUAD_UV, TapTempo, Vector, Vector3, Vector4, Xorshift, binarySearch, clamp, lerp, linearstep, matrix2d, rawIdentityMatrix4, rawIdentityQuaternion, saturate, shuffleArray, smootherstep, smootheststep, smoothstep, triIndexToLineIndex };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm1zLWNhdC1leHBlcmltZW50YWwubW9kdWxlLmpzIiwic291cmNlcyI6WyIuLi9zcmMvYWxnb3JpdGhtL2JpbmFyeVNlYXJjaC50cyIsIi4uL3NyYy9hcnJheS9jb25zdGFudHMudHMiLCIuLi9zcmMvYXJyYXkvdXRpbHMudHMiLCIuLi9zcmMvQ0RTL0NEUy50cyIsIi4uL3NyYy9DbG9jay9DbG9jay50cyIsIi4uL3NyYy9DbG9jay9DbG9ja0ZyYW1lLnRzIiwiLi4vc3JjL0Nsb2NrL0Nsb2NrUmVhbHRpbWUudHMiLCIuLi9zcmMvbWF0aC91dGlscy50cyIsIi4uL3NyYy9FeHBTbW9vdGgvRXhwU21vb3RoLnRzIiwiLi4vc3JjL0ZpenpCdXp6L0ZpenpCdXp6LnRzIiwiLi4vc3JjL0ZNU19DYXQvRk1TX0NhdC50cyIsIi4uL3NyYy9IaXN0b3J5TWVhbkNhbGN1bGF0b3IvSGlzdG9yeU1lYW5DYWxjdWxhdG9yLnRzIiwiLi4vc3JjL0hpc3RvcnlNZWFuQ2FsY3VsYXRvci9IaXN0b3J5TWVkaWFuQ2FsY3VsYXRvci50cyIsIi4uL3NyYy9tYXRoL1ZlY3Rvci50cyIsIi4uL3NyYy9tYXRoL1ZlY3RvcjMudHMiLCIuLi9zcmMvbWF0aC9RdWF0ZXJuaW9uLnRzIiwiLi4vc3JjL21hdGgvTWF0cml4NC50cyIsIi4uL3NyYy9tYXRoL1ZlY3RvcjQudHMiLCIuLi9zcmMvU3dhcC9Td2FwLnRzIiwiLi4vc3JjL1RhcFRlbXBvL1RhcFRlbXBvLnRzIiwiLi4vc3JjL1hvcnNoaWZ0L1hvcnNoaWZ0LnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIHlvaW5rZWQgZnJvbSBodHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8xMzQ0NTAwL2VmZmljaWVudC13YXktdG8taW5zZXJ0LWEtbnVtYmVyLWludG8tYS1zb3J0ZWQtYXJyYXktb2YtbnVtYmVyc1xuXG5leHBvcnQgZnVuY3Rpb24gYmluYXJ5U2VhcmNoKFxuICBlbGVtZW50OiBudW1iZXIsXG4gIGFycmF5OiBBcnJheUxpa2U8bnVtYmVyPlxuKTogbnVtYmVyIHtcbiAgbGV0IHN0YXJ0ID0gMDtcbiAgbGV0IGVuZCA9IGFycmF5Lmxlbmd0aDtcblxuICB3aGlsZSAoIHN0YXJ0IDwgZW5kICkge1xuICAgIGNvbnN0IGNlbnRlciA9ICggc3RhcnQgKyBlbmQgKSA+PiAxO1xuICAgIGlmICggYXJyYXlbIGNlbnRlciBdIDwgZWxlbWVudCApIHtcbiAgICAgIHN0YXJ0ID0gY2VudGVyICsgMTtcbiAgICB9IGVsc2Uge1xuICAgICAgZW5kID0gY2VudGVyO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBzdGFydDtcbn1cbiIsIi8qKlxuICogYFsgLTEsIC0xLCAxLCAtMSwgLTEsIDEsIDEsIDEgXWBcbiAqL1xuZXhwb3J0IGNvbnN0IFRSSUFOR0xFX1NUUklQX1FVQUQgPSBbIC0xLCAtMSwgMSwgLTEsIC0xLCAxLCAxLCAxIF07XG5cbi8qKlxuICogYFsgLTEsIC0xLCAwLCAxLCAtMSwgMCwgLTEsIDEsIDAsIDEsIDEsIDAgXWBcbiAqL1xuZXhwb3J0IGNvbnN0IFRSSUFOR0xFX1NUUklQX1FVQURfM0QgPSBbIC0xLCAtMSwgMCwgMSwgLTEsIDAsIC0xLCAxLCAwLCAxLCAxLCAwIF07XG5cbi8qKlxuICogYFsgMCwgMCwgMSwgMCwgMCwgMSwgMCwgMCwgMSwgMCwgMCwgMSBdYFxuICovXG5leHBvcnQgY29uc3QgVFJJQU5HTEVfU1RSSVBfUVVBRF9OT1JNQUwgPSBbIDAsIDAsIDEsIDAsIDAsIDEsIDAsIDAsIDEsIDAsIDAsIDEgXTtcblxuLyoqXG4gKiBgWyAwLCAwLCAxLCAwLCAwLCAxLCAxLCAxIF1gXG4gKi9cbmV4cG9ydCBjb25zdCBUUklBTkdMRV9TVFJJUF9RVUFEX1VWID0gWyAwLCAwLCAxLCAwLCAwLCAxLCAxLCAxIF07XG4iLCIvKipcbiAqIFNodWZmbGUgZ2l2ZW4gYGFycmF5YCB1c2luZyBnaXZlbiBgZGljZWAgUk5HLiAqKkRlc3RydWN0aXZlKiouXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzaHVmZmxlQXJyYXk8VD4oIGFycmF5OiBUW10sIGRpY2U/OiAoKSA9PiBudW1iZXIgKTogVFtdIHtcbiAgY29uc3QgZiA9IGRpY2UgPyBkaWNlIDogKCkgPT4gTWF0aC5yYW5kb20oKTtcbiAgZm9yICggbGV0IGkgPSAwOyBpIDwgYXJyYXkubGVuZ3RoIC0gMTsgaSArKyApIHtcbiAgICBjb25zdCBpciA9IGkgKyBNYXRoLmZsb29yKCBmKCkgKiAoIGFycmF5Lmxlbmd0aCAtIGkgKSApO1xuICAgIGNvbnN0IHRlbXAgPSBhcnJheVsgaXIgXTtcbiAgICBhcnJheVsgaXIgXSA9IGFycmF5WyBpIF07XG4gICAgYXJyYXlbIGkgXSA9IHRlbXA7XG4gIH1cbiAgcmV0dXJuIGFycmF5O1xufVxuXG4vKipcbiAqIEkgbGlrZSB3aXJlZnJhbWVcbiAqXG4gKiBgdHJpSW5kZXhUb0xpbmVJbmRleCggWyAwLCAxLCAyLCA1LCA2LCA3IF0gKWAgLT4gYFsgMCwgMSwgMSwgMiwgMiwgMCwgNSwgNiwgNiwgNywgNywgNSBdYFxuICovXG5leHBvcnQgZnVuY3Rpb24gdHJpSW5kZXhUb0xpbmVJbmRleDxUPiggYXJyYXk6IFRbXSApOiBUW10ge1xuICBjb25zdCByZXQ6IFRbXSA9IFtdO1xuICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBhcnJheS5sZW5ndGggLyAzOyBpICsrICkge1xuICAgIGNvbnN0IGhlYWQgPSBpICogMztcbiAgICByZXQucHVzaChcbiAgICAgIGFycmF5WyBoZWFkICAgICBdLCBhcnJheVsgaGVhZCArIDEgXSxcbiAgICAgIGFycmF5WyBoZWFkICsgMSBdLCBhcnJheVsgaGVhZCArIDIgXSxcbiAgICAgIGFycmF5WyBoZWFkICsgMiBdLCBhcnJheVsgaGVhZCAgICAgXVxuICAgICk7XG4gIH1cbiAgcmV0dXJuIHJldDtcbn1cblxuLyoqXG4gKiBgbWF0cml4MmQoIDMsIDIgKWAgLT4gYFsgMCwgMCwgMCwgMSwgMCwgMiwgMSwgMCwgMSwgMSwgMSwgMiBdYFxuICovXG5leHBvcnQgZnVuY3Rpb24gbWF0cml4MmQoIHc6IG51bWJlciwgaDogbnVtYmVyICk6IG51bWJlcltdIHtcbiAgY29uc3QgYXJyOiBudW1iZXJbXSA9IFtdO1xuICBmb3IgKCBsZXQgaXkgPSAwOyBpeSA8IGg7IGl5ICsrICkge1xuICAgIGZvciAoIGxldCBpeCA9IDA7IGl4IDwgdzsgaXggKysgKSB7XG4gICAgICBhcnIucHVzaCggaXgsIGl5ICk7XG4gICAgfVxuICB9XG4gIHJldHVybiBhcnI7XG59XG4iLCIvKipcbiAqIENyaXRpY2FsbHkgRGFtcGVkIFNwcmluZ1xuICpcbiAqIFNob3V0b3V0cyB0byBLZWlqaXJvIFRha2FoYXNoaVxuICovXG5leHBvcnQgY2xhc3MgQ0RTIHtcbiAgcHVibGljIGZhY3RvciA9IDEwMC4wO1xuICBwdWJsaWMgcmF0aW8gPSAxLjA7XG4gIHB1YmxpYyB2ZWxvY2l0eSA9IDAuMDtcbiAgcHVibGljIHZhbHVlID0gMC4wO1xuICBwdWJsaWMgdGFyZ2V0ID0gMC4wO1xuXG4gIHB1YmxpYyB1cGRhdGUoIGRlbHRhVGltZTogbnVtYmVyICk6IG51bWJlciB7XG4gICAgdGhpcy52ZWxvY2l0eSArPSAoXG4gICAgICAtdGhpcy5mYWN0b3IgKiAoIHRoaXMudmFsdWUgLSB0aGlzLnRhcmdldCApXG4gICAgICAtIDIuMCAqIHRoaXMudmVsb2NpdHkgKiBNYXRoLnNxcnQoIHRoaXMuZmFjdG9yICkgKiB0aGlzLnJhdGlvXG4gICAgKSAqIGRlbHRhVGltZTtcbiAgICB0aGlzLnZhbHVlICs9IHRoaXMudmVsb2NpdHkgKiBkZWx0YVRpbWU7XG4gICAgcmV0dXJuIHRoaXMudmFsdWU7XG4gIH1cbn1cbiIsIi8qKlxuICogQ2xhc3MgdGhhdCBkZWFscyB3aXRoIHRpbWUuXG4gKiBJbiB0aGlzIGJhc2UgY2xhc3MsIHlvdSBuZWVkIHRvIHNldCB0aW1lIG1hbnVhbGx5IGZyb20gYEF1dG9tYXRvbi51cGRhdGUoKWAuXG4gKiBCZXN0IGZvciBzeW5jIHdpdGggZXh0ZXJuYWwgY2xvY2sgc3R1ZmYuXG4gKi9cbmV4cG9ydCBjbGFzcyBDbG9jayB7XG4gIC8qKlxuICAgKiBJdHMgY3VycmVudCB0aW1lLlxuICAgKi9cbiAgcHJvdGVjdGVkIF9fdGltZSA9IDAuMDtcblxuICAvKipcbiAgICogSXRzIGRlbHRhVGltZSBvZiBsYXN0IHVwZGF0ZS5cbiAgICovXG4gIHByb3RlY3RlZCBfX2RlbHRhVGltZSA9IDAuMDtcblxuICAvKipcbiAgICogV2hldGhlciBpdHMgY3VycmVudGx5IHBsYXlpbmcgb3Igbm90LlxuICAgKi9cbiAgcHJvdGVjdGVkIF9faXNQbGF5aW5nID0gZmFsc2U7XG5cbiAgLyoqXG4gICAqIEl0cyBjdXJyZW50IHRpbWUuXG4gICAqL1xuICBwdWJsaWMgZ2V0IHRpbWUoKTogbnVtYmVyIHsgcmV0dXJuIHRoaXMuX190aW1lOyB9XG5cbiAgLyoqXG4gICAqIEl0cyBkZWx0YVRpbWUgb2YgbGFzdCB1cGRhdGUuXG4gICAqL1xuICBwdWJsaWMgZ2V0IGRlbHRhVGltZSgpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5fX2RlbHRhVGltZTsgfVxuXG4gIC8qKlxuICAgKiBXaGV0aGVyIGl0cyBjdXJyZW50bHkgcGxheWluZyBvciBub3QuXG4gICAqL1xuICBwdWJsaWMgZ2V0IGlzUGxheWluZygpOiBib29sZWFuIHsgcmV0dXJuIHRoaXMuX19pc1BsYXlpbmc7IH1cblxuICAvKipcbiAgICogVXBkYXRlIHRoZSBjbG9jay5cbiAgICogQHBhcmFtIHRpbWUgVGltZS4gWW91IG5lZWQgdG8gc2V0IG1hbnVhbGx5IHdoZW4geW91IGFyZSB1c2luZyBtYW51YWwgQ2xvY2tcbiAgICovXG4gIHB1YmxpYyB1cGRhdGUoIHRpbWU/OiBudW1iZXIgKTogdm9pZCB7XG4gICAgY29uc3QgcHJldlRpbWUgPSB0aGlzLl9fdGltZTtcbiAgICB0aGlzLl9fdGltZSA9IHRpbWUgfHwgMC4wO1xuICAgIHRoaXMuX19kZWx0YVRpbWUgPSB0aGlzLl9fdGltZSAtIHByZXZUaW1lO1xuICB9XG5cbiAgLyoqXG4gICAqIFN0YXJ0IHRoZSBjbG9jay5cbiAgICovXG4gIHB1YmxpYyBwbGF5KCk6IHZvaWQge1xuICAgIHRoaXMuX19pc1BsYXlpbmcgPSB0cnVlO1xuICB9XG5cbiAgLyoqXG4gICAqIFN0b3AgdGhlIGNsb2NrLlxuICAgKi9cbiAgcHVibGljIHBhdXNlKCk6IHZvaWQge1xuICAgIHRoaXMuX19pc1BsYXlpbmcgPSBmYWxzZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgdGhlIHRpbWUgbWFudWFsbHkuXG4gICAqIEBwYXJhbSB0aW1lIFRpbWVcbiAgICovXG4gIHB1YmxpYyBzZXRUaW1lKCB0aW1lOiBudW1iZXIgKTogdm9pZCB7XG4gICAgdGhpcy5fX3RpbWUgPSB0aW1lO1xuICB9XG59XG4iLCJpbXBvcnQgeyBDbG9jayB9IGZyb20gJy4vQ2xvY2snO1xuXG4vKipcbiAqIENsYXNzIHRoYXQgZGVhbHMgd2l0aCB0aW1lLlxuICogVGhpcyBpcyBcImZyYW1lXCIgdHlwZSBjbG9jaywgdGhlIGZyYW1lIGluY3JlYXNlcyBldmVyeSB7QGxpbmsgQ2xvY2tGcmFtZSN1cGRhdGV9IGNhbGwuXG4gKiBAcGFyYW0gZnBzIEZyYW1lcyBwZXIgc2Vjb25kXG4gKi9cbmV4cG9ydCBjbGFzcyBDbG9ja0ZyYW1lIGV4dGVuZHMgQ2xvY2sge1xuICAvKipcbiAgICogSXRzIGN1cnJlbnQgZnJhbWUuXG4gICAqL1xuICBwcml2YXRlIF9fZnJhbWUgPSAwO1xuXG4gIC8qKlxuICAgKiBJdHMgZnBzLlxuICAgKi9cbiAgcHJpdmF0ZSBfX2ZwczogbnVtYmVyO1xuXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggZnBzID0gNjAgKSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLl9fZnBzID0gZnBzO1xuICB9XG5cbiAgLyoqXG4gICAqIEl0cyBjdXJyZW50IGZyYW1lLlxuICAgKi9cbiAgcHVibGljIGdldCBmcmFtZSgpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5fX2ZyYW1lOyB9XG5cbiAgLyoqXG4gICAqIEl0cyBmcHMuXG4gICAqL1xuICBwdWJsaWMgZ2V0IGZwcygpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5fX2ZwczsgfVxuXG4gIC8qKlxuICAgKiBVcGRhdGUgdGhlIGNsb2NrLiBJdCB3aWxsIGluY3JlYXNlIHRoZSBmcmFtZSBieSAxLlxuICAgKi9cbiAgcHVibGljIHVwZGF0ZSgpOiB2b2lkIHtcbiAgICBpZiAoIHRoaXMuX19pc1BsYXlpbmcgKSB7XG4gICAgICB0aGlzLl9fdGltZSA9IHRoaXMuX19mcmFtZSAvIHRoaXMuX19mcHM7XG4gICAgICB0aGlzLl9fZGVsdGFUaW1lID0gMS4wIC8gdGhpcy5fX2ZwcztcbiAgICAgIHRoaXMuX19mcmFtZSArKztcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fX2RlbHRhVGltZSA9IDAuMDtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogU2V0IHRoZSB0aW1lIG1hbnVhbGx5LlxuICAgKiBUaGUgc2V0IHRpbWUgd2lsbCBiZSBjb252ZXJ0ZWQgaW50byBpbnRlcm5hbCBmcmFtZSBjb3VudCwgc28gdGhlIHRpbWUgd2lsbCBub3QgYmUgZXhhY3RseSBzYW1lIGFzIHNldCBvbmUuXG4gICAqIEBwYXJhbSB0aW1lIFRpbWVcbiAgICovXG4gIHB1YmxpYyBzZXRUaW1lKCB0aW1lOiBudW1iZXIgKTogdm9pZCB7XG4gICAgdGhpcy5fX2ZyYW1lID0gTWF0aC5mbG9vciggdGhpcy5fX2ZwcyAqIHRpbWUgKTtcbiAgICB0aGlzLl9fdGltZSA9IHRoaXMuX19mcmFtZSAvIHRoaXMuX19mcHM7XG4gIH1cbn1cbiIsImltcG9ydCB7IENsb2NrIH0gZnJvbSAnLi9DbG9jayc7XG5cbi8qKlxuICogQ2xhc3MgdGhhdCBkZWFscyB3aXRoIHRpbWUuXG4gKiBUaGlzIGlzIFwicmVhbHRpbWVcIiB0eXBlIGNsb2NrLCB0aGUgdGltZSBnb2VzIG9uIGFzIHJlYWwgd29ybGQuXG4gKi9cbmV4cG9ydCBjbGFzcyBDbG9ja1JlYWx0aW1lIGV4dGVuZHMgQ2xvY2sge1xuICAvKipcbiAgICogXCJZb3Ugc2V0IHRoZSB0aW1lIG1hbnVhbGx5IHRvIGBfX3J0VGltZWAgd2hlbiBpdCdzIGBfX3J0RGF0ZWAuXCJcbiAgICovXG4gIHByaXZhdGUgX19ydFRpbWUgPSAwLjA7XG5cbiAgLyoqXG4gICAqIFwiWW91IHNldCB0aGUgdGltZSBtYW51YWxseSB0byBgX19ydFRpbWVgIHdoZW4gaXQncyBgX19ydERhdGVgLlwiXG4gICAqL1xuICBwcml2YXRlIF9fcnREYXRlOiBudW1iZXIgPSBwZXJmb3JtYW5jZS5ub3coKTtcblxuICAvKipcbiAgICogVGhlIGNsb2NrIGlzIHJlYWx0aW1lLiB5ZWFoLlxuICAgKi9cbiAgcHVibGljIGdldCBpc1JlYWx0aW1lKCk6IGJvb2xlYW4geyByZXR1cm4gdHJ1ZTsgfVxuXG4gIC8qKlxuICAgKiBVcGRhdGUgdGhlIGNsb2NrLiBUaW1lIGlzIGNhbGN1bGF0ZWQgYmFzZWQgb24gdGltZSBpbiByZWFsIHdvcmxkLlxuICAgKi9cbiAgcHVibGljIHVwZGF0ZSgpOiB2b2lkIHtcbiAgICBjb25zdCBub3cgPSBwZXJmb3JtYW5jZS5ub3coKTtcblxuICAgIGlmICggdGhpcy5fX2lzUGxheWluZyApIHtcbiAgICAgIGNvbnN0IHByZXZUaW1lID0gdGhpcy5fX3RpbWU7XG4gICAgICBjb25zdCBkZWx0YURhdGUgPSAoIG5vdyAtIHRoaXMuX19ydERhdGUgKTtcbiAgICAgIHRoaXMuX190aW1lID0gdGhpcy5fX3J0VGltZSArIGRlbHRhRGF0ZSAvIDEwMDAuMDtcbiAgICAgIHRoaXMuX19kZWx0YVRpbWUgPSB0aGlzLnRpbWUgLSBwcmV2VGltZTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fX3J0VGltZSA9IHRoaXMudGltZTtcbiAgICAgIHRoaXMuX19ydERhdGUgPSBub3c7XG4gICAgICB0aGlzLl9fZGVsdGFUaW1lID0gMC4wO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgdGhlIHRpbWUgbWFudWFsbHkuXG4gICAqIEBwYXJhbSB0aW1lIFRpbWVcbiAgICovXG4gIHB1YmxpYyBzZXRUaW1lKCB0aW1lOiBudW1iZXIgKTogdm9pZCB7XG4gICAgdGhpcy5fX3RpbWUgPSB0aW1lO1xuICAgIHRoaXMuX19ydFRpbWUgPSB0aGlzLnRpbWU7XG4gICAgdGhpcy5fX3J0RGF0ZSA9IHBlcmZvcm1hbmNlLm5vdygpO1xuICB9XG59XG4iLCIvKipcbiAqIGBsZXJwYCwgb3IgYG1peGBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGxlcnAoIGE6IG51bWJlciwgYjogbnVtYmVyLCB4OiBudW1iZXIgKTogbnVtYmVyIHtcbiAgcmV0dXJuIGEgKyAoIGIgLSBhICkgKiB4O1xufVxuXG4vKipcbiAqIGBjbGFtcGBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNsYW1wKCB4OiBudW1iZXIsIGw6IG51bWJlciwgaDogbnVtYmVyICk6IG51bWJlciB7XG4gIHJldHVybiBNYXRoLm1pbiggTWF0aC5tYXgoIHgsIGwgKSwgaCApO1xufVxuXG4vKipcbiAqIGBjbGFtcCggeCwgMC4wLCAxLjAgKWBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNhdHVyYXRlKCB4OiBudW1iZXIgKTogbnVtYmVyIHtcbiAgcmV0dXJuIGNsYW1wKCB4LCAwLjAsIDEuMCApO1xufVxuXG4vKipcbiAqIGBzbW9vdGhzdGVwYCBidXQgbm90IHNtb290aFxuICovXG5leHBvcnQgZnVuY3Rpb24gbGluZWFyc3RlcCggYTogbnVtYmVyLCBiOiBudW1iZXIsIHg6IG51bWJlciApOiBudW1iZXIge1xuICByZXR1cm4gc2F0dXJhdGUoICggeCAtIGEgKSAvICggYiAtIGEgKSApO1xufVxuXG4vKipcbiAqIHdvcmxkIGZhbW91cyBgc21vb3Roc3RlcGAgZnVuY3Rpb25cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNtb290aHN0ZXAoIGE6IG51bWJlciwgYjogbnVtYmVyLCB4OiBudW1iZXIgKTogbnVtYmVyIHtcbiAgY29uc3QgdCA9IGxpbmVhcnN0ZXAoIGEsIGIsIHggKTtcbiAgcmV0dXJuIHQgKiB0ICogKCAzLjAgLSAyLjAgKiB0ICk7XG59XG5cbi8qKlxuICogYHNtb290aHN0ZXBgIGJ1dCBtb3JlIHNtb290aFxuICovXG5leHBvcnQgZnVuY3Rpb24gc21vb3RoZXJzdGVwKCBhOiBudW1iZXIsIGI6IG51bWJlciwgeDogbnVtYmVyICk6IG51bWJlciB7XG4gIGNvbnN0IHQgPSBsaW5lYXJzdGVwKCBhLCBiLCB4ICk7XG4gIHJldHVybiB0ICogdCAqIHQgKiAoIHQgKiAoIHQgKiA2LjAgLSAxNS4wICkgKyAxMC4wICk7XG59XG5cbi8qKlxuICogYHNtb290aHN0ZXBgIGJ1dCBXQVkgbW9yZSBzbW9vdGhcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNtb290aGVzdHN0ZXAoIGE6IG51bWJlciwgYjogbnVtYmVyLCB4OiBudW1iZXIgKTogbnVtYmVyIHtcbiAgY29uc3QgdCA9IGxpbmVhcnN0ZXAoIGEsIGIsIHggKTtcbiAgcmV0dXJuIHQgKiB0ICogdCAqIHQgKiAoIHQgKiAoIHQgKiAoIC0yMC4wICogdCArIDcwLjAgKSAtIDg0LjAgKSArIDM1LjAgKTtcbn1cbiIsImltcG9ydCB7IGxlcnAgfSBmcm9tICcuLi9tYXRoL3V0aWxzJztcblxuLyoqXG4gKiBEbyBleHAgc21vb3RoaW5nXG4gKi9cbmV4cG9ydCBjbGFzcyBFeHBTbW9vdGgge1xuICBwdWJsaWMgZmFjdG9yID0gMTAuMDtcbiAgcHVibGljIHRhcmdldCA9IDAuMDtcbiAgcHVibGljIHZhbHVlID0gMC4wO1xuXG4gIHB1YmxpYyB1cGRhdGUoIGRlbHRhVGltZTogbnVtYmVyICk6IG51bWJlciB7XG4gICAgdGhpcy52YWx1ZSA9IGxlcnAoIHRoaXMudGFyZ2V0LCB0aGlzLnZhbHVlLCBNYXRoLmV4cCggLXRoaXMuZmFjdG9yICogZGVsdGFUaW1lICkgKTtcbiAgICByZXR1cm4gdGhpcy52YWx1ZTtcbiAgfVxufVxuIiwiLyoqXG4gKiBJdGVyYWJsZSBGaXp6QnV6elxuICovXG5leHBvcnQgY2xhc3MgRml6ekJ1enogaW1wbGVtZW50cyBJdGVyYWJsZTxudW1iZXIgfCBzdHJpbmc+IHtcbiAgcHVibGljIHN0YXRpYyBXb3Jkc0RlZmF1bHQ6IE1hcDxudW1iZXIsIHN0cmluZz4gPSBuZXcgTWFwKCBbXG4gICAgWyAzLCAnRml6eicgXSxcbiAgICBbIDUsICdCdXp6JyBdXG4gIF0gKTtcblxuICBwcml2YXRlIF9fd29yZHM6IE1hcDxudW1iZXIsIHN0cmluZz47XG4gIHByaXZhdGUgX19pbmRleDogbnVtYmVyO1xuICBwcml2YXRlIF9fZW5kOiBudW1iZXI7XG5cbiAgcHVibGljIGNvbnN0cnVjdG9yKCB3b3JkczogTWFwPG51bWJlciwgc3RyaW5nPiA9IEZpenpCdXp6LldvcmRzRGVmYXVsdCwgaW5kZXggPSAxLCBlbmQgPSAxMDAgKSB7XG4gICAgdGhpcy5fX3dvcmRzID0gd29yZHM7XG4gICAgdGhpcy5fX2luZGV4ID0gaW5kZXg7XG4gICAgdGhpcy5fX2VuZCA9IGVuZDtcbiAgfVxuXG4gIHB1YmxpYyBbIFN5bWJvbC5pdGVyYXRvciBdKCk6IEl0ZXJhdG9yPHN0cmluZyB8IG51bWJlciwgYW55LCB1bmRlZmluZWQ+IHtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIHB1YmxpYyBuZXh0KCk6IEl0ZXJhdG9yUmVzdWx0PG51bWJlciB8IHN0cmluZz4ge1xuICAgIGlmICggdGhpcy5fX2VuZCA8IHRoaXMuX19pbmRleCApIHtcbiAgICAgIHJldHVybiB7IGRvbmU6IHRydWUsIHZhbHVlOiBudWxsIH07XG4gICAgfVxuXG4gICAgbGV0IHZhbHVlOiBudW1iZXIgfCBzdHJpbmcgPSAnJztcbiAgICBmb3IgKCBjb25zdCBbIHJlbSwgd29yZCBdIG9mIHRoaXMuX193b3JkcyApIHtcbiAgICAgIGlmICggKCB0aGlzLl9faW5kZXggJSByZW0gKSA9PT0gMCApIHtcbiAgICAgICAgdmFsdWUgKz0gd29yZDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoIHZhbHVlID09PSAnJyApIHtcbiAgICAgIHZhbHVlID0gdGhpcy5fX2luZGV4O1xuICAgIH1cblxuICAgIHRoaXMuX19pbmRleCArKztcblxuICAgIHJldHVybiB7IGRvbmU6IGZhbHNlLCB2YWx1ZSB9O1xuICB9XG59XG4iLCIvKipcbiAqIE1vc3QgYXdlc29tZSBjYXQgZXZlclxuICovXG5leHBvcnQgY2xhc3MgRk1TX0NhdCB7IC8vIGVzbGludC1kaXNhYmxlLWxpbmVcbiAgLyoqXG4gICAqIEZNU19DYXQuZ2lmXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIGdpZiA9ICdodHRwczovL2Ztcy1jYXQuY29tL2ltYWdlcy9mbXNfY2F0LmdpZic7XG5cbiAgLyoqXG4gICAqIEZNU19DYXQucG5nXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIHBuZyA9ICdodHRwczovL2Ztcy1jYXQuY29tL2ltYWdlcy9mbXNfY2F0LnBuZyc7XG59XG4iLCIvKipcbiAqIFVzZWZ1bCBmb3IgZnBzIGNhbGNcbiAqL1xuZXhwb3J0IGNsYXNzIEhpc3RvcnlNZWFuQ2FsY3VsYXRvciB7XG4gIHByaXZhdGUgX19yZWNhbGNGb3JFYWNoID0gMDtcbiAgcHJpdmF0ZSBfX2NvdW50VW50aWxSZWNhbGMgPSAwO1xuICBwcml2YXRlIF9faGlzdG9yeTogbnVtYmVyW10gPSBbXTtcbiAgcHJpdmF0ZSBfX2luZGV4ID0gMDtcbiAgcHJpdmF0ZSBfX2xlbmd0aDogbnVtYmVyO1xuICBwcml2YXRlIF9fY291bnQgPSAwO1xuICBwcml2YXRlIF9fY2FjaGUgPSAwO1xuXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggbGVuZ3RoOiBudW1iZXIgKSB7XG4gICAgdGhpcy5fX2xlbmd0aCA9IGxlbmd0aDtcbiAgICB0aGlzLl9fcmVjYWxjRm9yRWFjaCA9IGxlbmd0aDtcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBsZW5ndGg7IGkgKysgKSB7XG4gICAgICB0aGlzLl9faGlzdG9yeVsgaSBdID0gMDtcbiAgICB9XG4gIH1cblxuICBwdWJsaWMgZ2V0IG1lYW4oKTogbnVtYmVyIHtcbiAgICBjb25zdCBjb3VudCA9IE1hdGgubWluKCB0aGlzLl9fY291bnQsIHRoaXMuX19sZW5ndGggKTtcbiAgICByZXR1cm4gY291bnQgPT09IDAgPyAwLjAgOiB0aGlzLl9fY2FjaGUgLyBjb3VudDtcbiAgfVxuXG4gIHB1YmxpYyBnZXQgcmVjYWxjRm9yRWFjaCgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLl9fcmVjYWxjRm9yRWFjaDtcbiAgfVxuXG4gIHB1YmxpYyBzZXQgcmVjYWxjRm9yRWFjaCggdmFsdWU6IG51bWJlciApIHtcbiAgICBjb25zdCBkZWx0YSA9IHZhbHVlIC0gdGhpcy5fX3JlY2FsY0ZvckVhY2g7XG4gICAgdGhpcy5fX3JlY2FsY0ZvckVhY2ggPSB2YWx1ZTtcbiAgICB0aGlzLl9fY291bnRVbnRpbFJlY2FsYyA9IE1hdGgubWF4KCAwLCB0aGlzLl9fY291bnRVbnRpbFJlY2FsYyArIGRlbHRhICk7XG4gIH1cblxuICBwdWJsaWMgcmVzZXQoKTogdm9pZCB7XG4gICAgdGhpcy5fX2luZGV4ID0gMDtcbiAgICB0aGlzLl9fY291bnQgPSAwO1xuICAgIHRoaXMuX19jYWNoZSA9IDA7XG4gICAgdGhpcy5fX2NvdW50VW50aWxSZWNhbGMgPSAwO1xuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHRoaXMuX19sZW5ndGg7IGkgKysgKSB7XG4gICAgICB0aGlzLl9faGlzdG9yeVsgaSBdID0gMDtcbiAgICB9XG4gIH1cblxuICBwdWJsaWMgcHVzaCggdmFsdWU6IG51bWJlciApOiB2b2lkIHtcbiAgICBjb25zdCBwcmV2ID0gdGhpcy5fX2hpc3RvcnlbIHRoaXMuX19pbmRleCBdO1xuICAgIHRoaXMuX19oaXN0b3J5WyB0aGlzLl9faW5kZXggXSA9IHZhbHVlO1xuICAgIHRoaXMuX19jb3VudCArKztcbiAgICB0aGlzLl9faW5kZXggPSAoIHRoaXMuX19pbmRleCArIDEgKSAlIHRoaXMuX19sZW5ndGg7XG5cbiAgICBpZiAoIHRoaXMuX19jb3VudFVudGlsUmVjYWxjID09PSAwICkge1xuICAgICAgdGhpcy5yZWNhbGMoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fX2NvdW50VW50aWxSZWNhbGMgLS07XG4gICAgICB0aGlzLl9fY2FjaGUgLT0gcHJldjtcbiAgICAgIHRoaXMuX19jYWNoZSArPSB2YWx1ZTtcbiAgICB9XG4gIH1cblxuICBwdWJsaWMgcmVjYWxjKCk6IHZvaWQge1xuICAgIHRoaXMuX19jb3VudFVudGlsUmVjYWxjID0gdGhpcy5fX3JlY2FsY0ZvckVhY2g7XG4gICAgY29uc3Qgc3VtID0gdGhpcy5fX2hpc3RvcnlcbiAgICAgIC5zbGljZSggMCwgTWF0aC5taW4oIHRoaXMuX19jb3VudCwgdGhpcy5fX2xlbmd0aCApIClcbiAgICAgIC5yZWR1Y2UoICggc3VtLCB2ICkgPT4gc3VtICsgdiwgMCApO1xuICAgIHRoaXMuX19jYWNoZSA9IHN1bTtcbiAgfVxufVxuIiwiaW1wb3J0IHsgYmluYXJ5U2VhcmNoIH0gZnJvbSAnLi4vYWxnb3JpdGhtL2JpbmFyeVNlYXJjaCc7XG5cbi8qKlxuICogVXNlZnVsIGZvciB0YXAgdGVtcG9cbiAqIFNlZSBhbHNvOiB7QGxpbmsgSGlzdG9yeU1lYW5DYWxjdWxhdG9yfVxuICovXG5leHBvcnQgY2xhc3MgSGlzdG9yeU1lZGlhbkNhbGN1bGF0b3Ige1xuICBwcml2YXRlIF9faGlzdG9yeTogbnVtYmVyW10gPSBbXTtcbiAgcHJpdmF0ZSBfX3NvcnRlZDogbnVtYmVyW10gPSBbXTtcbiAgcHJpdmF0ZSBfX2luZGV4ID0gMDtcbiAgcHJpdmF0ZSByZWFkb25seSBfX2xlbmd0aDogbnVtYmVyO1xuXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggbGVuZ3RoOiBudW1iZXIgKSB7XG4gICAgdGhpcy5fX2xlbmd0aCA9IGxlbmd0aDtcbiAgfVxuXG4gIHB1YmxpYyBnZXQgbWVkaWFuKCk6IG51bWJlciB7XG4gICAgY29uc3QgY291bnQgPSBNYXRoLm1pbiggdGhpcy5fX3NvcnRlZC5sZW5ndGgsIHRoaXMuX19sZW5ndGggKTtcbiAgICByZXR1cm4gdGhpcy5fX3NvcnRlZFsgTWF0aC5mbG9vciggKCBjb3VudCAtIDEgKSAvIDIgKSBdO1xuICB9XG5cbiAgcHVibGljIHJlc2V0KCk6IHZvaWQge1xuICAgIHRoaXMuX19pbmRleCA9IDA7XG4gICAgdGhpcy5fX2hpc3RvcnkgPSBbXTtcbiAgICB0aGlzLl9fc29ydGVkID0gW107XG4gIH1cblxuICBwdWJsaWMgcHVzaCggdmFsdWU6IG51bWJlciApOiB2b2lkIHtcbiAgICBjb25zdCBwcmV2ID0gdGhpcy5fX2hpc3RvcnlbIHRoaXMuX19pbmRleCBdO1xuICAgIHRoaXMuX19oaXN0b3J5WyB0aGlzLl9faW5kZXggXSA9IHZhbHVlO1xuICAgIHRoaXMuX19pbmRleCA9ICggdGhpcy5fX2luZGV4ICsgMSApICUgdGhpcy5fX2xlbmd0aDtcblxuICAgIC8vIHJlbW92ZSB0aGUgcHJldiBmcm9tIHNvcnRlZCBhcnJheVxuICAgIGlmICggdGhpcy5fX3NvcnRlZC5sZW5ndGggPT09IHRoaXMuX19sZW5ndGggKSB7XG4gICAgICBjb25zdCBwcmV2SW5kZXggPSBiaW5hcnlTZWFyY2goIHByZXYsIHRoaXMuX19zb3J0ZWQgKTtcbiAgICAgIHRoaXMuX19zb3J0ZWQuc3BsaWNlKCBwcmV2SW5kZXgsIDEgKTtcbiAgICB9XG5cbiAgICBjb25zdCBpbmRleCA9IGJpbmFyeVNlYXJjaCggdmFsdWUsIHRoaXMuX19zb3J0ZWQgKTtcbiAgICB0aGlzLl9fc29ydGVkLnNwbGljZSggaW5kZXgsIDAsIHZhbHVlICk7XG4gIH1cbn1cbiIsIi8qKlxuICogQSBWZWN0b3IuXG4gKi9cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBWZWN0b3I8VCBleHRlbmRzIFZlY3RvcjxUPj4ge1xuICBwdWJsaWMgYWJzdHJhY3QgZWxlbWVudHM6IG51bWJlcltdO1xuXG4gIC8qKlxuICAgKiBUaGUgbGVuZ3RoIG9mIHRoaXMuXG4gICAqIGEuay5hLiBgbWFnbml0dWRlYFxuICAgKi9cbiAgcHVibGljIGdldCBsZW5ndGgoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gTWF0aC5zcXJ0KCB0aGlzLmVsZW1lbnRzLnJlZHVjZSggKCBzdW0sIHYgKSA9PiBzdW0gKyB2ICogdiwgMC4wICkgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBIG5vcm1hbGl6ZWQgVmVjdG9yMyBvZiB0aGlzLlxuICAgKi9cbiAgcHVibGljIGdldCBub3JtYWxpemVkKCk6IFQge1xuICAgIHJldHVybiB0aGlzLnNjYWxlKCAxLjAgLyB0aGlzLmxlbmd0aCApO1xuICB9XG5cbiAgLyoqXG4gICAqIENsb25lIHRoaXMuXG4gICAqL1xuICBwdWJsaWMgY2xvbmUoKTogVCB7XG4gICAgcmV0dXJuIHRoaXMuX19uZXcoIHRoaXMuZWxlbWVudHMuY29uY2F0KCkgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGQgYSBWZWN0b3IgaW50byB0aGlzLlxuICAgKiBAcGFyYW0gdmVjdG9yIEFub3RoZXIgVmVjdG9yXG4gICAqL1xuICBwdWJsaWMgYWRkKCB2ZWN0b3I6IFQgKTogVCB7XG4gICAgcmV0dXJuIHRoaXMuX19uZXcoIHRoaXMuZWxlbWVudHMubWFwKCAoIHYsIGkgKSA9PiB2ICsgdmVjdG9yLmVsZW1lbnRzWyBpIF0gKSApO1xuICB9XG5cbiAgLyoqXG4gICAqIFN1YnN0cmFjdCB0aGlzIGZyb20gYW5vdGhlciBWZWN0b3IuXG4gICAqIEBwYXJhbSB2IEFub3RoZXIgdmVjdG9yXG4gICAqL1xuICBwdWJsaWMgc3ViKCB2ZWN0b3I6IFQgKTogVCB7XG4gICAgcmV0dXJuIHRoaXMuX19uZXcoIHRoaXMuZWxlbWVudHMubWFwKCAoIHYsIGkgKSA9PiB2IC0gdmVjdG9yLmVsZW1lbnRzWyBpIF0gKSApO1xuICB9XG5cbiAgLyoqXG4gICAqIE11bHRpcGx5IGEgVmVjdG9yIHdpdGggdGhpcy5cbiAgICogQHBhcmFtIHZlY3RvciBBbm90aGVyIFZlY3RvclxuICAgKi9cbiAgcHVibGljIG11bHRpcGx5KCB2ZWN0b3I6IFQgKTogVCB7XG4gICAgcmV0dXJuIHRoaXMuX19uZXcoIHRoaXMuZWxlbWVudHMubWFwKCAoIHYsIGkgKSA9PiB2ICogdmVjdG9yLmVsZW1lbnRzWyBpIF0gKSApO1xuICB9XG5cbiAgLyoqXG4gICAqIERpdmlkZSB0aGlzIGZyb20gYW5vdGhlciBWZWN0b3IuXG4gICAqIEBwYXJhbSB2ZWN0b3IgQW5vdGhlciBWZWN0b3JcbiAgICovXG4gIHB1YmxpYyBkaXZpZGUoIHZlY3RvcjogVCApOiBUIHtcbiAgICByZXR1cm4gdGhpcy5fX25ldyggdGhpcy5lbGVtZW50cy5tYXAoICggdiwgaSApID0+IHYgLyB2ZWN0b3IuZWxlbWVudHNbIGkgXSApICk7XG4gIH1cblxuICAvKipcbiAgICogU2NhbGUgdGhpcyBieSBzY2FsYXIuXG4gICAqIGEuay5hLiBgbXVsdGlwbHlTY2FsYXJgXG4gICAqIEBwYXJhbSBzY2FsYXIgQSBzY2FsYXJcbiAgICovXG4gIHB1YmxpYyBzY2FsZSggc2NhbGFyOiBudW1iZXIgKTogVCB7XG4gICAgcmV0dXJuIHRoaXMuX19uZXcoIHRoaXMuZWxlbWVudHMubWFwKCAoIHYgKSA9PiB2ICogc2NhbGFyICkgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBEb3QgdHdvIFZlY3RvcnMuXG4gICAqIEBwYXJhbSB2ZWN0b3IgQW5vdGhlciB2ZWN0b3JcbiAgICovXG4gIHB1YmxpYyBkb3QoIHZlY3RvcjogVCApOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLmVsZW1lbnRzLnJlZHVjZSggKCBzdW0sIHYsIGkgKSA9PiBzdW0gKyB2ICogdmVjdG9yLmVsZW1lbnRzWyBpIF0sIDAuMCApO1xuICB9XG5cbiAgcHJvdGVjdGVkIGFic3RyYWN0IF9fbmV3KCB2OiBudW1iZXJbXSApOiBUO1xufVxuIiwiaW1wb3J0IHsgTWF0cml4NCB9IGZyb20gJy4vTWF0cml4NCc7XG5pbXBvcnQgeyBRdWF0ZXJuaW9uIH0gZnJvbSAnLi9RdWF0ZXJuaW9uJztcbmltcG9ydCB7IFZlY3RvciB9IGZyb20gJy4vVmVjdG9yJztcblxuZXhwb3J0IHR5cGUgcmF3VmVjdG9yMyA9IFsgbnVtYmVyLCBudW1iZXIsIG51bWJlciBdO1xuXG4vKipcbiAqIEEgVmVjdG9yMy5cbiAqL1xuZXhwb3J0IGNsYXNzIFZlY3RvcjMgZXh0ZW5kcyBWZWN0b3I8VmVjdG9yMz4ge1xuICBwdWJsaWMgZWxlbWVudHM6IHJhd1ZlY3RvcjM7XG5cbiAgcHVibGljIGNvbnN0cnVjdG9yKCB2OiByYXdWZWN0b3IzID0gWyAwLjAsIDAuMCwgMC4wIF0gKSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLmVsZW1lbnRzID0gdjtcbiAgfVxuXG4gIC8qKlxuICAgKiBBbiB4IGNvbXBvbmVudCBvZiB0aGlzLlxuICAgKi9cbiAgcHVibGljIGdldCB4KCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuZWxlbWVudHNbIDAgXTtcbiAgfVxuXG4gIHB1YmxpYyBzZXQgeCggeDogbnVtYmVyICkge1xuICAgIHRoaXMuZWxlbWVudHNbIDAgXSA9IHg7XG4gIH1cblxuICAvKipcbiAgICogQW4geSBjb21wb25lbnQgb2YgdGhpcy5cbiAgICovXG4gIHB1YmxpYyBnZXQgeSgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLmVsZW1lbnRzWyAxIF07XG4gIH1cblxuICBwdWJsaWMgc2V0IHkoIHk6IG51bWJlciApIHtcbiAgICB0aGlzLmVsZW1lbnRzWyAxIF0gPSB5O1xuICB9XG5cbiAgLyoqXG4gICAqIEFuIHogY29tcG9uZW50IG9mIHRoaXMuXG4gICAqL1xuICBwdWJsaWMgZ2V0IHooKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5lbGVtZW50c1sgMiBdO1xuICB9XG5cbiAgcHVibGljIHNldCB6KCB6OiBudW1iZXIgKSB7XG4gICAgdGhpcy5lbGVtZW50c1sgMiBdID0gejtcbiAgfVxuXG4gIHB1YmxpYyB0b1N0cmluZygpOiBzdHJpbmcge1xuICAgIHJldHVybiBgVmVjdG9yMyggJHsgdGhpcy54LnRvRml4ZWQoIDMgKSB9LCAkeyB0aGlzLnkudG9GaXhlZCggMyApIH0sICR7IHRoaXMuei50b0ZpeGVkKCAzICkgfSApYDtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm4gYSBjcm9zcyBvZiB0aGlzIGFuZCBhbm90aGVyIFZlY3RvcjMuXG4gICAqIEBwYXJhbSB2ZWN0b3IgQW5vdGhlciB2ZWN0b3JcbiAgICovXG4gIHB1YmxpYyBjcm9zcyggdmVjdG9yOiBWZWN0b3IzICk6IFZlY3RvcjMge1xuICAgIHJldHVybiBuZXcgVmVjdG9yMyggW1xuICAgICAgdGhpcy55ICogdmVjdG9yLnogLSB0aGlzLnogKiB2ZWN0b3IueSxcbiAgICAgIHRoaXMueiAqIHZlY3Rvci54IC0gdGhpcy54ICogdmVjdG9yLnosXG4gICAgICB0aGlzLnggKiB2ZWN0b3IueSAtIHRoaXMueSAqIHZlY3Rvci54XG4gICAgXSApO1xuICB9XG5cbiAgLyoqXG4gICAqIFJvdGF0ZSB0aGlzIHZlY3RvciB1c2luZyBhIFF1YXRlcm5pb24uXG4gICAqIEBwYXJhbSBxdWF0ZXJuaW9uIEEgcXVhdGVybmlvblxuICAgKi9cbiAgcHVibGljIGFwcGx5UXVhdGVybmlvbiggcXVhdGVybmlvbjogUXVhdGVybmlvbiApOiBWZWN0b3IzIHtcbiAgICBjb25zdCBwID0gbmV3IFF1YXRlcm5pb24oIFsgdGhpcy54LCB0aGlzLnksIHRoaXMueiwgMC4wIF0gKTtcbiAgICBjb25zdCByID0gcXVhdGVybmlvbi5pbnZlcnNlZDtcbiAgICBjb25zdCByZXMgPSBxdWF0ZXJuaW9uLm11bHRpcGx5KCBwICkubXVsdGlwbHkoIHIgKTtcbiAgICByZXR1cm4gbmV3IFZlY3RvcjMoIFsgcmVzLngsIHJlcy55LCByZXMueiBdICk7XG4gIH1cblxuICAvKipcbiAgICogTXVsdGlwbHkgdGhpcyB2ZWN0b3IgKHdpdGggYW4gaW1wbGljaXQgMSBpbiB0aGUgNHRoIGRpbWVuc2lvbikgYnkgbS5cbiAgICovXG4gIHB1YmxpYyBhcHBseU1hdHJpeDQoIG1hdHJpeDogTWF0cml4NCApOiBWZWN0b3IzIHtcbiAgICBjb25zdCBtID0gbWF0cml4LmVsZW1lbnRzO1xuXG4gICAgY29uc3QgdyA9IG1bIDMgXSAqIHRoaXMueCArIG1bIDcgXSAqIHRoaXMueSArIG1bIDExIF0gKiB0aGlzLnogKyBtWyAxNSBdO1xuICAgIGNvbnN0IGludlcgPSAxLjAgLyB3O1xuXG4gICAgcmV0dXJuIG5ldyBWZWN0b3IzKCBbXG4gICAgICAoIG1bIDAgXSAqIHRoaXMueCArIG1bIDQgXSAqIHRoaXMueSArIG1bIDggXSAqIHRoaXMueiArIG1bIDEyIF0gKSAqIGludlcsXG4gICAgICAoIG1bIDEgXSAqIHRoaXMueCArIG1bIDUgXSAqIHRoaXMueSArIG1bIDkgXSAqIHRoaXMueiArIG1bIDEzIF0gKSAqIGludlcsXG4gICAgICAoIG1bIDIgXSAqIHRoaXMueCArIG1bIDYgXSAqIHRoaXMueSArIG1bIDEwIF0gKiB0aGlzLnogKyBtWyAxNCBdICkgKiBpbnZXXG4gICAgXSApO1xuICB9XG5cbiAgcHJvdGVjdGVkIF9fbmV3KCB2OiByYXdWZWN0b3IzICk6IFZlY3RvcjMge1xuICAgIHJldHVybiBuZXcgVmVjdG9yMyggdiApO1xuICB9XG5cbiAgLyoqXG4gICAqIFZlY3RvcjMoIDAuMCwgMC4wLCAwLjAgKVxuICAgKi9cbiAgcHVibGljIHN0YXRpYyBnZXQgemVybygpOiBWZWN0b3IzIHtcbiAgICByZXR1cm4gbmV3IFZlY3RvcjMoIFsgMC4wLCAwLjAsIDAuMCBdICk7XG4gIH1cblxuICAvKipcbiAgICogVmVjdG9yMyggMS4wLCAxLjAsIDEuMCApXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIGdldCBvbmUoKTogVmVjdG9yMyB7XG4gICAgcmV0dXJuIG5ldyBWZWN0b3IzKCBbIDEuMCwgMS4wLCAxLjAgXSApO1xuICB9XG59XG4iLCJpbXBvcnQgeyBNYXRyaXg0IH0gZnJvbSAnLi9NYXRyaXg0JztcbmltcG9ydCB7IFZlY3RvcjMgfSBmcm9tICcuL1ZlY3RvcjMnO1xuXG5leHBvcnQgdHlwZSByYXdRdWF0ZXJuaW9uID0gWyBudW1iZXIsIG51bWJlciwgbnVtYmVyLCBudW1iZXIgXTtcblxuZXhwb3J0IGNvbnN0IHJhd0lkZW50aXR5UXVhdGVybmlvbjogcmF3UXVhdGVybmlvbiA9IFsgMC4wLCAwLjAsIDAuMCwgMS4wIF07XG5cbi8qKlxuICogQSBRdWF0ZXJuaW9uLlxuICovXG5leHBvcnQgY2xhc3MgUXVhdGVybmlvbiB7XG4gIHB1YmxpYyBlbGVtZW50czogcmF3UXVhdGVybmlvbjsgLy8gWyB4LCB5LCB6OyB3IF1cblxuICBwdWJsaWMgY29uc3RydWN0b3IoIGVsZW1lbnRzOiByYXdRdWF0ZXJuaW9uID0gcmF3SWRlbnRpdHlRdWF0ZXJuaW9uICkge1xuICAgIHRoaXMuZWxlbWVudHMgPSBlbGVtZW50cztcbiAgfVxuXG4gIC8qKlxuICAgKiBBbiB4IGNvbXBvbmVudCBvZiB0aGlzLlxuICAgKi9cbiAgcHVibGljIGdldCB4KCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuZWxlbWVudHNbIDAgXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBbiB5IGNvbXBvbmVudCBvZiB0aGlzLlxuICAgKi9cbiAgcHVibGljIGdldCB5KCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuZWxlbWVudHNbIDEgXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBbiB6IGNvbXBvbmVudCBvZiB0aGlzLlxuICAgKi9cbiAgcHVibGljIGdldCB6KCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuZWxlbWVudHNbIDIgXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBbiB3IGNvbXBvbmVudCBvZiB0aGlzLlxuICAgKi9cbiAgcHVibGljIGdldCB3KCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuZWxlbWVudHNbIDMgXTtcbiAgfVxuXG4gIHB1YmxpYyB0b1N0cmluZygpOiBzdHJpbmcge1xuICAgIHJldHVybiBgUXVhdGVybmlvbiggJHsgdGhpcy54LnRvRml4ZWQoIDMgKSB9LCAkeyB0aGlzLnkudG9GaXhlZCggMyApIH0sICR7IHRoaXMuei50b0ZpeGVkKCAzICkgfSwgJHsgdGhpcy53LnRvRml4ZWQoIDMgKSB9IClgO1xuICB9XG5cbiAgLyoqXG4gICAqIENsb25lIHRoaXMuXG4gICAqL1xuICBwdWJsaWMgY2xvbmUoKTogUXVhdGVybmlvbiB7XG4gICAgcmV0dXJuIG5ldyBRdWF0ZXJuaW9uKCB0aGlzLmVsZW1lbnRzLmNvbmNhdCgpIGFzIHJhd1F1YXRlcm5pb24gKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJdHNlbGYgYnV0IGNvbnZlcnRlZCBpbnRvIGEgTWF0cml4NC5cbiAgICovXG4gIHB1YmxpYyBnZXQgbWF0cml4KCk6IE1hdHJpeDQge1xuICAgIGNvbnN0IHggPSBuZXcgVmVjdG9yMyggWyAxLjAsIDAuMCwgMC4wIF0gKS5hcHBseVF1YXRlcm5pb24oIHRoaXMgKTtcbiAgICBjb25zdCB5ID0gbmV3IFZlY3RvcjMoIFsgMC4wLCAxLjAsIDAuMCBdICkuYXBwbHlRdWF0ZXJuaW9uKCB0aGlzICk7XG4gICAgY29uc3QgeiA9IG5ldyBWZWN0b3IzKCBbIDAuMCwgMC4wLCAxLjAgXSApLmFwcGx5UXVhdGVybmlvbiggdGhpcyApO1xuXG4gICAgcmV0dXJuIG5ldyBNYXRyaXg0KCBbXG4gICAgICB4LngsIHkueCwgei54LCAwLjAsXG4gICAgICB4LnksIHkueSwgei55LCAwLjAsXG4gICAgICB4LnosIHkueiwgei56LCAwLjAsXG4gICAgICAwLjAsIDAuMCwgMC4wLCAxLjBcbiAgICBdICk7XG4gIH1cblxuICAvKipcbiAgICogQW4gaW52ZXJzZSBvZiB0aGlzLlxuICAgKi9cbiAgcHVibGljIGdldCBpbnZlcnNlZCgpOiBRdWF0ZXJuaW9uIHtcbiAgICByZXR1cm4gbmV3IFF1YXRlcm5pb24oIFtcbiAgICAgIC10aGlzLngsXG4gICAgICAtdGhpcy55LFxuICAgICAgLXRoaXMueixcbiAgICAgIHRoaXMud1xuICAgIF0gKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBNdWx0aXBseSB0d28gUXVhdGVybmlvbnMuXG4gICAqIEBwYXJhbSBxIEFub3RoZXIgUXVhdGVybmlvblxuICAgKi9cbiAgcHVibGljIG11bHRpcGx5KCBxOiBRdWF0ZXJuaW9uICk6IFF1YXRlcm5pb24ge1xuICAgIHJldHVybiBuZXcgUXVhdGVybmlvbiggW1xuICAgICAgdGhpcy53ICogcS54ICsgdGhpcy54ICogcS53ICsgdGhpcy55ICogcS56IC0gdGhpcy56ICogcS55LFxuICAgICAgdGhpcy53ICogcS55IC0gdGhpcy54ICogcS56ICsgdGhpcy55ICogcS53ICsgdGhpcy56ICogcS54LFxuICAgICAgdGhpcy53ICogcS56ICsgdGhpcy54ICogcS55IC0gdGhpcy55ICogcS54ICsgdGhpcy56ICogcS53LFxuICAgICAgdGhpcy53ICogcS53IC0gdGhpcy54ICogcS54IC0gdGhpcy55ICogcS55IC0gdGhpcy56ICogcS56XG4gICAgXSApO1xuICB9XG5cbiAgLyoqXG4gICAqIEFuIGlkZW50aXR5IFF1YXRlcm5pb24uXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIGdldCBpZGVudGl0eSgpOiBRdWF0ZXJuaW9uIHtcbiAgICByZXR1cm4gbmV3IFF1YXRlcm5pb24oIHJhd0lkZW50aXR5UXVhdGVybmlvbiApO1xuICB9XG5cbiAgLyoqXG4gICAqIEdlbmVyYXRlIGEgUXVhdGVybmlvbiBvdXQgb2YgYW5nbGUgYW5kIGF4aXMuXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIGZyb21BeGlzQW5nbGUoIGF4aXM6IFZlY3RvcjMsIGFuZ2xlOiBudW1iZXIgKTogUXVhdGVybmlvbiB7XG4gICAgY29uc3QgaGFsZkFuZ2xlID0gYW5nbGUgLyAyLjA7XG4gICAgY29uc3Qgc2luSGFsZkFuZ2xlID0gTWF0aC5zaW4oIGhhbGZBbmdsZSApO1xuICAgIHJldHVybiBuZXcgUXVhdGVybmlvbiggW1xuICAgICAgYXhpcy54ICogc2luSGFsZkFuZ2xlLFxuICAgICAgYXhpcy55ICogc2luSGFsZkFuZ2xlLFxuICAgICAgYXhpcy56ICogc2luSGFsZkFuZ2xlLFxuICAgICAgTWF0aC5jb3MoIGhhbGZBbmdsZSApXG4gICAgXSApO1xuICB9XG5cbiAgLyoqXG4gICAqIEdlbmVyYXRlIGEgUXVhdGVybmlvbiBvdXQgb2YgYSByb3RhdGlvbiBtYXRyaXguXG4gICAqIFlvaW5rZWQgZnJvbSBUaHJlZS5qcy5cbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgZnJvbU1hdHJpeCggbWF0cml4OiBNYXRyaXg0ICk6IFF1YXRlcm5pb24ge1xuICAgIGNvbnN0IG0gPSBtYXRyaXguZWxlbWVudHMsXG4gICAgICBtMTEgPSBtWyAwIF0sIG0xMiA9IG1bIDQgXSwgbTEzID0gbVsgOCBdLFxuICAgICAgbTIxID0gbVsgMSBdLCBtMjIgPSBtWyA1IF0sIG0yMyA9IG1bIDkgXSxcbiAgICAgIG0zMSA9IG1bIDIgXSwgbTMyID0gbVsgNiBdLCBtMzMgPSBtWyAxMCBdLFxuICAgICAgdHJhY2UgPSBtMTEgKyBtMjIgKyBtMzM7XG5cbiAgICBpZiAoIHRyYWNlID4gMCApIHtcbiAgICAgIGNvbnN0IHMgPSAwLjUgLyBNYXRoLnNxcnQoIHRyYWNlICsgMS4wICk7XG4gICAgICByZXR1cm4gbmV3IFF1YXRlcm5pb24oIFtcbiAgICAgICAgKCBtMzIgLSBtMjMgKSAqIHMsXG4gICAgICAgICggbTEzIC0gbTMxICkgKiBzLFxuICAgICAgICAoIG0yMSAtIG0xMiApICogcyxcbiAgICAgICAgMC4yNSAvIHNcbiAgICAgIF0gKTtcbiAgICB9IGVsc2UgaWYgKCBtMTEgPiBtMjIgJiYgbTExID4gbTMzICkge1xuICAgICAgY29uc3QgcyA9IDIuMCAqIE1hdGguc3FydCggMS4wICsgbTExIC0gbTIyIC0gbTMzICk7XG4gICAgICByZXR1cm4gbmV3IFF1YXRlcm5pb24oIFtcbiAgICAgICAgMC4yNSAqIHMsXG4gICAgICAgICggbTEyICsgbTIxICkgLyBzLFxuICAgICAgICAoIG0xMyArIG0zMSApIC8gcyxcbiAgICAgICAgKCBtMzIgLSBtMjMgKSAvIHNcbiAgICAgIF0gKTtcbiAgICB9IGVsc2UgaWYgKCBtMjIgPiBtMzMgKSB7XG4gICAgICBjb25zdCBzID0gMi4wICogTWF0aC5zcXJ0KCAxLjAgKyBtMjIgLSBtMTEgLSBtMzMgKTtcbiAgICAgIHJldHVybiBuZXcgUXVhdGVybmlvbiggW1xuICAgICAgICAoIG0xMiArIG0yMSApIC8gcyxcbiAgICAgICAgMC4yNSAqIHMsXG4gICAgICAgICggbTIzICsgbTMyICkgLyBzLFxuICAgICAgICAoIG0xMyAtIG0zMSApIC8gc1xuICAgICAgXSApO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBzID0gMi4wICogTWF0aC5zcXJ0KCAxLjAgKyBtMzMgLSBtMTEgLSBtMjIgKTtcbiAgICAgIHJldHVybiBuZXcgUXVhdGVybmlvbiggW1xuICAgICAgICAoIG0xMyArIG0zMSApIC8gcyxcbiAgICAgICAgKCBtMjMgKyBtMzIgKSAvIHMsXG4gICAgICAgIDAuMjUgKiBzLFxuICAgICAgICAoIG0yMSAtIG0xMiApIC8gc1xuICAgICAgXSApO1xuICAgIH1cbiAgfVxufVxuIiwiaW1wb3J0IHsgUXVhdGVybmlvbiB9IGZyb20gJy4vUXVhdGVybmlvbic7XG5pbXBvcnQgeyBWZWN0b3IzIH0gZnJvbSAnLi9WZWN0b3IzJztcblxuZXhwb3J0IHR5cGUgcmF3TWF0cml4NCA9IFtcbiAgbnVtYmVyLCBudW1iZXIsIG51bWJlciwgbnVtYmVyLFxuICBudW1iZXIsIG51bWJlciwgbnVtYmVyLCBudW1iZXIsXG4gIG51bWJlciwgbnVtYmVyLCBudW1iZXIsIG51bWJlcixcbiAgbnVtYmVyLCBudW1iZXIsIG51bWJlciwgbnVtYmVyXG5dO1xuXG5leHBvcnQgY29uc3QgcmF3SWRlbnRpdHlNYXRyaXg0OiByYXdNYXRyaXg0ID0gW1xuICAxLjAsIDAuMCwgMC4wLCAwLjAsXG4gIDAuMCwgMS4wLCAwLjAsIDAuMCxcbiAgMC4wLCAwLjAsIDEuMCwgMC4wLFxuICAwLjAsIDAuMCwgMC4wLCAxLjBcbl07XG5cbi8qKlxuICogQSBNYXRyaXg0LlxuICovXG5leHBvcnQgY2xhc3MgTWF0cml4NCB7XG4gIHB1YmxpYyBlbGVtZW50czogcmF3TWF0cml4NDtcblxuICBwdWJsaWMgY29uc3RydWN0b3IoIHY6IHJhd01hdHJpeDQgPSByYXdJZGVudGl0eU1hdHJpeDQgKSB7XG4gICAgdGhpcy5lbGVtZW50cyA9IHY7XG4gIH1cblxuICAvKipcbiAgICogSXRzZWxmIGJ1dCB0cmFuc3Bvc2VkLlxuICAgKi9cbiAgcHVibGljIGdldCB0cmFuc3Bvc2UoKTogTWF0cml4NCB7XG4gICAgY29uc3QgbSA9IHRoaXMuZWxlbWVudHM7XG5cbiAgICByZXR1cm4gbmV3IE1hdHJpeDQoIFtcbiAgICAgIG1bIDAgXSwgbVsgNCBdLCBtWyA4IF0sIG1bIDEyIF0sXG4gICAgICBtWyAxIF0sIG1bIDUgXSwgbVsgOSBdLCBtWyAxMyBdLFxuICAgICAgbVsgMiBdLCBtWyA2IF0sIG1bIDEwIF0sIG1bIDE0IF0sXG4gICAgICBtWyAzIF0sIG1bIDcgXSwgbVsgMTEgXSwgbVsgMTUgXVxuICAgIF0gKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJdHMgZGV0ZXJtaW5hbnQuXG4gICAqL1xuICBwdWJsaWMgZ2V0IGRldGVybWluYW50KCk6IG51bWJlciB7XG4gICAgY29uc3QgbSA9IHRoaXMuZWxlbWVudHM7XG4gICAgY29uc3RcbiAgICAgIGEwMCA9IG1bICAwIF0sIGEwMSA9IG1bICAxIF0sIGEwMiA9IG1bICAyIF0sIGEwMyA9IG1bICAzIF0sXG4gICAgICBhMTAgPSBtWyAgNCBdLCBhMTEgPSBtWyAgNSBdLCBhMTIgPSBtWyAgNiBdLCBhMTMgPSBtWyAgNyBdLFxuICAgICAgYTIwID0gbVsgIDggXSwgYTIxID0gbVsgIDkgXSwgYTIyID0gbVsgMTAgXSwgYTIzID0gbVsgMTEgXSxcbiAgICAgIGEzMCA9IG1bIDEyIF0sIGEzMSA9IG1bIDEzIF0sIGEzMiA9IG1bIDE0IF0sIGEzMyA9IG1bIDE1IF0sXG4gICAgICBiMDAgPSBhMDAgKiBhMTEgLSBhMDEgKiBhMTAsICBiMDEgPSBhMDAgKiBhMTIgLSBhMDIgKiBhMTAsXG4gICAgICBiMDIgPSBhMDAgKiBhMTMgLSBhMDMgKiBhMTAsICBiMDMgPSBhMDEgKiBhMTIgLSBhMDIgKiBhMTEsXG4gICAgICBiMDQgPSBhMDEgKiBhMTMgLSBhMDMgKiBhMTEsICBiMDUgPSBhMDIgKiBhMTMgLSBhMDMgKiBhMTIsXG4gICAgICBiMDYgPSBhMjAgKiBhMzEgLSBhMjEgKiBhMzAsICBiMDcgPSBhMjAgKiBhMzIgLSBhMjIgKiBhMzAsXG4gICAgICBiMDggPSBhMjAgKiBhMzMgLSBhMjMgKiBhMzAsICBiMDkgPSBhMjEgKiBhMzIgLSBhMjIgKiBhMzEsXG4gICAgICBiMTAgPSBhMjEgKiBhMzMgLSBhMjMgKiBhMzEsICBiMTEgPSBhMjIgKiBhMzMgLSBhMjMgKiBhMzI7XG5cbiAgICByZXR1cm4gYjAwICogYjExIC0gYjAxICogYjEwICsgYjAyICogYjA5ICsgYjAzICogYjA4IC0gYjA0ICogYjA3ICsgYjA1ICogYjA2O1xuICB9XG5cbiAgLyoqXG4gICAqIEl0c2VsZiBidXQgaW52ZXJ0ZWQuXG4gICAqL1xuICBwdWJsaWMgZ2V0IGludmVyc2UoKTogTWF0cml4NCB8IG51bGwge1xuICAgIGNvbnN0IG0gPSB0aGlzLmVsZW1lbnRzO1xuICAgIGNvbnN0XG4gICAgICBhMDAgPSBtWyAgMCBdLCBhMDEgPSBtWyAgMSBdLCBhMDIgPSBtWyAgMiBdLCBhMDMgPSBtWyAgMyBdLFxuICAgICAgYTEwID0gbVsgIDQgXSwgYTExID0gbVsgIDUgXSwgYTEyID0gbVsgIDYgXSwgYTEzID0gbVsgIDcgXSxcbiAgICAgIGEyMCA9IG1bICA4IF0sIGEyMSA9IG1bICA5IF0sIGEyMiA9IG1bIDEwIF0sIGEyMyA9IG1bIDExIF0sXG4gICAgICBhMzAgPSBtWyAxMiBdLCBhMzEgPSBtWyAxMyBdLCBhMzIgPSBtWyAxNCBdLCBhMzMgPSBtWyAxNSBdLFxuICAgICAgYjAwID0gYTAwICogYTExIC0gYTAxICogYTEwLCAgYjAxID0gYTAwICogYTEyIC0gYTAyICogYTEwLFxuICAgICAgYjAyID0gYTAwICogYTEzIC0gYTAzICogYTEwLCAgYjAzID0gYTAxICogYTEyIC0gYTAyICogYTExLFxuICAgICAgYjA0ID0gYTAxICogYTEzIC0gYTAzICogYTExLCAgYjA1ID0gYTAyICogYTEzIC0gYTAzICogYTEyLFxuICAgICAgYjA2ID0gYTIwICogYTMxIC0gYTIxICogYTMwLCAgYjA3ID0gYTIwICogYTMyIC0gYTIyICogYTMwLFxuICAgICAgYjA4ID0gYTIwICogYTMzIC0gYTIzICogYTMwLCAgYjA5ID0gYTIxICogYTMyIC0gYTIyICogYTMxLFxuICAgICAgYjEwID0gYTIxICogYTMzIC0gYTIzICogYTMxLCAgYjExID0gYTIyICogYTMzIC0gYTIzICogYTMyO1xuXG4gICAgY29uc3QgZGV0ID0gYjAwICogYjExIC0gYjAxICogYjEwICsgYjAyICogYjA5ICsgYjAzICogYjA4IC0gYjA0ICogYjA3ICsgYjA1ICogYjA2O1xuXG4gICAgaWYgKCBkZXQgPT09IDAuMCApIHsgcmV0dXJuIG51bGw7IH1cblxuICAgIGNvbnN0IGludkRldCA9IDEuMCAvIGRldDtcblxuICAgIHJldHVybiBuZXcgTWF0cml4NCggW1xuICAgICAgYTExICogYjExIC0gYTEyICogYjEwICsgYTEzICogYjA5LFxuICAgICAgYTAyICogYjEwIC0gYTAxICogYjExIC0gYTAzICogYjA5LFxuICAgICAgYTMxICogYjA1IC0gYTMyICogYjA0ICsgYTMzICogYjAzLFxuICAgICAgYTIyICogYjA0IC0gYTIxICogYjA1IC0gYTIzICogYjAzLFxuICAgICAgYTEyICogYjA4IC0gYTEwICogYjExIC0gYTEzICogYjA3LFxuICAgICAgYTAwICogYjExIC0gYTAyICogYjA4ICsgYTAzICogYjA3LFxuICAgICAgYTMyICogYjAyIC0gYTMwICogYjA1IC0gYTMzICogYjAxLFxuICAgICAgYTIwICogYjA1IC0gYTIyICogYjAyICsgYTIzICogYjAxLFxuICAgICAgYTEwICogYjEwIC0gYTExICogYjA4ICsgYTEzICogYjA2LFxuICAgICAgYTAxICogYjA4IC0gYTAwICogYjEwIC0gYTAzICogYjA2LFxuICAgICAgYTMwICogYjA0IC0gYTMxICogYjAyICsgYTMzICogYjAwLFxuICAgICAgYTIxICogYjAyIC0gYTIwICogYjA0IC0gYTIzICogYjAwLFxuICAgICAgYTExICogYjA3IC0gYTEwICogYjA5IC0gYTEyICogYjA2LFxuICAgICAgYTAwICogYjA5IC0gYTAxICogYjA3ICsgYTAyICogYjA2LFxuICAgICAgYTMxICogYjAxIC0gYTMwICogYjAzIC0gYTMyICogYjAwLFxuICAgICAgYTIwICogYjAzIC0gYTIxICogYjAxICsgYTIyICogYjAwXG4gICAgXS5tYXAoICggdiApID0+IHYgKiBpbnZEZXQgKSBhcyByYXdNYXRyaXg0ICk7XG4gIH1cblxuICBwdWJsaWMgdG9TdHJpbmcoKTogc3RyaW5nIHtcbiAgICBjb25zdCBtID0gdGhpcy5lbGVtZW50cy5tYXAoICggdiApID0+IHYudG9GaXhlZCggMyApICk7XG4gICAgcmV0dXJuIGBNYXRyaXg0KCAkeyBtWyAwIF0gfSwgJHsgbVsgNCBdIH0sICR7IG1bIDggXSB9LCAkeyBtWyAxMiBdIH07ICR7IG1bIDEgXSB9LCAkeyBtWyA1IF0gfSwgJHsgbVsgOSBdIH0sICR7IG1bIDEzIF0gfTsgJHsgbVsgMiBdIH0sICR7IG1bIDYgXSB9LCAkeyBtWyAxMCBdIH0sICR7IG1bIDE0IF0gfTsgJHsgbVsgMyBdIH0sICR7IG1bIDcgXSB9LCAkeyBtWyAxMSBdIH0sICR7IG1bIDE1IF0gfSApYDtcbiAgfVxuXG4gIC8qKlxuICAgKiBDbG9uZSB0aGlzLlxuICAgKi9cbiAgcHVibGljIGNsb25lKCk6IE1hdHJpeDQge1xuICAgIHJldHVybiBuZXcgTWF0cml4NCggdGhpcy5lbGVtZW50cy5jb25jYXQoKSBhcyByYXdNYXRyaXg0ICk7XG4gIH1cblxuICAvKipcbiAgICogTXVsdGlwbHkgdGhpcyBNYXRyaXg0IGJ5IG9uZSBvciBtb3JlIE1hdHJpeDRzLlxuICAgKi9cbiAgcHVibGljIG11bHRpcGx5KCAuLi5tYXRyaWNlczogTWF0cml4NFtdICk6IE1hdHJpeDQge1xuICAgIGlmICggbWF0cmljZXMubGVuZ3RoID09PSAwICkge1xuICAgICAgcmV0dXJuIHRoaXMuY2xvbmUoKTtcbiAgICB9XG5cbiAgICBjb25zdCBhcnIgPSBtYXRyaWNlcy5jb25jYXQoKTtcbiAgICBsZXQgYk1hdCA9IGFyci5zaGlmdCgpITtcbiAgICBpZiAoIDAgPCBhcnIubGVuZ3RoICkge1xuICAgICAgYk1hdCA9IGJNYXQubXVsdGlwbHkoIC4uLmFyciApO1xuICAgIH1cblxuICAgIGNvbnN0IGEgPSB0aGlzLmVsZW1lbnRzO1xuICAgIGNvbnN0IGIgPSBiTWF0LmVsZW1lbnRzO1xuXG4gICAgcmV0dXJuIG5ldyBNYXRyaXg0KCBbXG4gICAgICBhWyAwIF0gKiBiWyAwIF0gKyBhWyA0IF0gKiBiWyAxIF0gKyBhWyA4IF0gKiBiWyAyIF0gKyBhWyAxMiBdICogYlsgMyBdLFxuICAgICAgYVsgMSBdICogYlsgMCBdICsgYVsgNSBdICogYlsgMSBdICsgYVsgOSBdICogYlsgMiBdICsgYVsgMTMgXSAqIGJbIDMgXSxcbiAgICAgIGFbIDIgXSAqIGJbIDAgXSArIGFbIDYgXSAqIGJbIDEgXSArIGFbIDEwIF0gKiBiWyAyIF0gKyBhWyAxNCBdICogYlsgMyBdLFxuICAgICAgYVsgMyBdICogYlsgMCBdICsgYVsgNyBdICogYlsgMSBdICsgYVsgMTEgXSAqIGJbIDIgXSArIGFbIDE1IF0gKiBiWyAzIF0sXG5cbiAgICAgIGFbIDAgXSAqIGJbIDQgXSArIGFbIDQgXSAqIGJbIDUgXSArIGFbIDggXSAqIGJbIDYgXSArIGFbIDEyIF0gKiBiWyA3IF0sXG4gICAgICBhWyAxIF0gKiBiWyA0IF0gKyBhWyA1IF0gKiBiWyA1IF0gKyBhWyA5IF0gKiBiWyA2IF0gKyBhWyAxMyBdICogYlsgNyBdLFxuICAgICAgYVsgMiBdICogYlsgNCBdICsgYVsgNiBdICogYlsgNSBdICsgYVsgMTAgXSAqIGJbIDYgXSArIGFbIDE0IF0gKiBiWyA3IF0sXG4gICAgICBhWyAzIF0gKiBiWyA0IF0gKyBhWyA3IF0gKiBiWyA1IF0gKyBhWyAxMSBdICogYlsgNiBdICsgYVsgMTUgXSAqIGJbIDcgXSxcblxuICAgICAgYVsgMCBdICogYlsgOCBdICsgYVsgNCBdICogYlsgOSBdICsgYVsgOCBdICogYlsgMTAgXSArIGFbIDEyIF0gKiBiWyAxMSBdLFxuICAgICAgYVsgMSBdICogYlsgOCBdICsgYVsgNSBdICogYlsgOSBdICsgYVsgOSBdICogYlsgMTAgXSArIGFbIDEzIF0gKiBiWyAxMSBdLFxuICAgICAgYVsgMiBdICogYlsgOCBdICsgYVsgNiBdICogYlsgOSBdICsgYVsgMTAgXSAqIGJbIDEwIF0gKyBhWyAxNCBdICogYlsgMTEgXSxcbiAgICAgIGFbIDMgXSAqIGJbIDggXSArIGFbIDcgXSAqIGJbIDkgXSArIGFbIDExIF0gKiBiWyAxMCBdICsgYVsgMTUgXSAqIGJbIDExIF0sXG5cbiAgICAgIGFbIDAgXSAqIGJbIDEyIF0gKyBhWyA0IF0gKiBiWyAxMyBdICsgYVsgOCBdICogYlsgMTQgXSArIGFbIDEyIF0gKiBiWyAxNSBdLFxuICAgICAgYVsgMSBdICogYlsgMTIgXSArIGFbIDUgXSAqIGJbIDEzIF0gKyBhWyA5IF0gKiBiWyAxNCBdICsgYVsgMTMgXSAqIGJbIDE1IF0sXG4gICAgICBhWyAyIF0gKiBiWyAxMiBdICsgYVsgNiBdICogYlsgMTMgXSArIGFbIDEwIF0gKiBiWyAxNCBdICsgYVsgMTQgXSAqIGJbIDE1IF0sXG4gICAgICBhWyAzIF0gKiBiWyAxMiBdICsgYVsgNyBdICogYlsgMTMgXSArIGFbIDExIF0gKiBiWyAxNCBdICsgYVsgMTUgXSAqIGJbIDE1IF1cbiAgICBdICk7XG4gIH1cblxuICAvKipcbiAgICogTXVsdGlwbHkgdGhpcyBNYXRyaXg0IGJ5IGEgc2NhbGFyXG4gICAqL1xuICBwdWJsaWMgc2NhbGVTY2FsYXIoIHNjYWxhcjogbnVtYmVyICk6IE1hdHJpeDQge1xuICAgIHJldHVybiBuZXcgTWF0cml4NCggdGhpcy5lbGVtZW50cy5tYXAoICggdiApID0+IHYgKiBzY2FsYXIgKSBhcyByYXdNYXRyaXg0ICk7XG4gIH1cblxuICAvKipcbiAgICogQW4gaWRlbnRpdHkgTWF0cml4NC5cbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgZ2V0IGlkZW50aXR5KCk6IE1hdHJpeDQge1xuICAgIHJldHVybiBuZXcgTWF0cml4NCggcmF3SWRlbnRpdHlNYXRyaXg0ICk7XG4gIH1cblxuICBwdWJsaWMgc3RhdGljIG11bHRpcGx5KCAuLi5tYXRyaWNlczogTWF0cml4NFtdICk6IE1hdHJpeDQge1xuICAgIGlmICggbWF0cmljZXMubGVuZ3RoID09PSAwICkge1xuICAgICAgcmV0dXJuIE1hdHJpeDQuaWRlbnRpdHk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IGJNYXRzID0gbWF0cmljZXMuY29uY2F0KCk7XG4gICAgICBjb25zdCBhTWF0ID0gYk1hdHMuc2hpZnQoKSE7XG4gICAgICByZXR1cm4gYU1hdC5tdWx0aXBseSggLi4uYk1hdHMgKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogR2VuZXJhdGUgYSB0cmFuc2xhdGlvbiBtYXRyaXguXG4gICAqIEBwYXJhbSB2ZWN0b3IgVHJhbnNsYXRpb25cbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgdHJhbnNsYXRlKCB2ZWN0b3I6IFZlY3RvcjMgKTogTWF0cml4NCB7XG4gICAgcmV0dXJuIG5ldyBNYXRyaXg0KCBbXG4gICAgICAxLCAwLCAwLCAwLFxuICAgICAgMCwgMSwgMCwgMCxcbiAgICAgIDAsIDAsIDEsIDAsXG4gICAgICB2ZWN0b3IueCwgdmVjdG9yLnksIHZlY3Rvci56LCAxXG4gICAgXSApO1xuICB9XG5cbiAgLyoqXG4gICAqIEdlbmVyYXRlIGEgM2Qgc2NhbGluZyBtYXRyaXguXG4gICAqIEBwYXJhbSB2ZWN0b3IgU2NhbGVcbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgc2NhbGUoIHZlY3RvcjogVmVjdG9yMyApOiBNYXRyaXg0IHtcbiAgICByZXR1cm4gbmV3IE1hdHJpeDQoIFtcbiAgICAgIHZlY3Rvci54LCAwLCAwLCAwLFxuICAgICAgMCwgdmVjdG9yLnksIDAsIDAsXG4gICAgICAwLCAwLCB2ZWN0b3IueiwgMCxcbiAgICAgIDAsIDAsIDAsIDFcbiAgICBdICk7XG4gIH1cblxuICAvKipcbiAgICogR2VuZXJhdGUgYSAzZCBzY2FsaW5nIG1hdHJpeCBieSBhIHNjYWxhci5cbiAgICogQHBhcmFtIHZlY3RvciBTY2FsZVxuICAgKi9cbiAgcHVibGljIHN0YXRpYyBzY2FsZVNjYWxhciggc2NhbGFyOiBudW1iZXIgKTogTWF0cml4NCB7XG4gICAgcmV0dXJuIG5ldyBNYXRyaXg0KCBbXG4gICAgICBzY2FsYXIsIDAsIDAsIDAsXG4gICAgICAwLCBzY2FsYXIsIDAsIDAsXG4gICAgICAwLCAwLCBzY2FsYXIsIDAsXG4gICAgICAwLCAwLCAwLCAxXG4gICAgXSApO1xuICB9XG5cbiAgLyoqXG4gICAqIEdlbmVyYXRlIGEgM2Qgcm90YXRpb24gbWF0cml4LCByb3RhdGVzIGFyb3VuZCB4IGF4aXMuXG4gICAqIEBwYXJhbSB2ZWN0b3IgU2NhbGVcbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgcm90YXRlWCggdGhldGE6IG51bWJlciApOiBNYXRyaXg0IHtcbiAgICByZXR1cm4gbmV3IE1hdHJpeDQoIFtcbiAgICAgIDEsIDAsIDAsIDAsXG4gICAgICAwLCBNYXRoLmNvcyggdGhldGEgKSwgLU1hdGguc2luKCB0aGV0YSApLCAwLFxuICAgICAgMCwgTWF0aC5zaW4oIHRoZXRhICksIE1hdGguY29zKCB0aGV0YSApLCAwLFxuICAgICAgMCwgMCwgMCwgMVxuICAgIF0gKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZW5lcmF0ZSBhIDNkIHJvdGF0aW9uIG1hdHJpeCwgcm90YXRlcyBhcm91bmQgeSBheGlzLlxuICAgKiBAcGFyYW0gdmVjdG9yIFNjYWxlXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIHJvdGF0ZVkoIHRoZXRhOiBudW1iZXIgKTogTWF0cml4NCB7XG4gICAgcmV0dXJuIG5ldyBNYXRyaXg0KCBbXG4gICAgICBNYXRoLmNvcyggdGhldGEgKSwgMCwgTWF0aC5zaW4oIHRoZXRhICksIDAsXG4gICAgICAwLCAxLCAwLCAwLFxuICAgICAgLU1hdGguc2luKCB0aGV0YSApLCAwLCBNYXRoLmNvcyggdGhldGEgKSwgMCxcbiAgICAgIDAsIDAsIDAsIDFcbiAgICBdICk7XG4gIH1cblxuICAvKipcbiAgICogR2VuZXJhdGUgYSAzZCByb3RhdGlvbiBtYXRyaXgsIHJvdGF0ZXMgYXJvdW5kIHogYXhpcy5cbiAgICogQHBhcmFtIHZlY3RvciBTY2FsZVxuICAgKi9cbiAgcHVibGljIHN0YXRpYyByb3RhdGVaKCB0aGV0YTogbnVtYmVyICk6IE1hdHJpeDQge1xuICAgIHJldHVybiBuZXcgTWF0cml4NCggW1xuICAgICAgTWF0aC5jb3MoIHRoZXRhICksIC1NYXRoLnNpbiggdGhldGEgKSwgMCwgMCxcbiAgICAgIE1hdGguc2luKCB0aGV0YSApLCBNYXRoLmNvcyggdGhldGEgKSwgMCwgMCxcbiAgICAgIDAsIDAsIDEsIDAsXG4gICAgICAwLCAwLCAwLCAxXG4gICAgXSApO1xuICB9XG5cbiAgLyoqXG4gICAqIEdlbmVyYXRlIGEgXCJMb29rQXRcIiB2aWV3IG1hdHJpeC5cbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgbG9va0F0KFxuICAgIHBvc2l0aW9uOiBWZWN0b3IzLFxuICAgIHRhcmdldCA9IG5ldyBWZWN0b3IzKCBbIDAuMCwgMC4wLCAwLjAgXSApLFxuICAgIHVwID0gbmV3IFZlY3RvcjMoIFsgMC4wLCAxLjAsIDAuMCBdICksXG4gICAgcm9sbCA9IDAuMFxuICApOiBNYXRyaXg0IHtcbiAgICBjb25zdCBkaXIgPSBwb3NpdGlvbi5zdWIoIHRhcmdldCApLm5vcm1hbGl6ZWQ7XG4gICAgbGV0IHNpZCA9IHVwLmNyb3NzKCBkaXIgKS5ub3JtYWxpemVkO1xuICAgIGxldCB0b3AgPSBkaXIuY3Jvc3MoIHNpZCApO1xuICAgIHNpZCA9IHNpZC5zY2FsZSggTWF0aC5jb3MoIHJvbGwgKSApLmFkZCggdG9wLnNjYWxlKCBNYXRoLnNpbiggcm9sbCApICkgKTtcbiAgICB0b3AgPSBkaXIuY3Jvc3MoIHNpZCApO1xuXG4gICAgcmV0dXJuIG5ldyBNYXRyaXg0KCBbXG4gICAgICBzaWQueCwgc2lkLnksIHNpZC56LCAwLjAsXG4gICAgICB0b3AueCwgdG9wLnksIHRvcC56LCAwLjAsXG4gICAgICBkaXIueCwgZGlyLnksIGRpci56LCAwLjAsXG4gICAgICBwb3NpdGlvbi54LCBwb3NpdGlvbi55LCBwb3NpdGlvbi56LCAxLjBcbiAgICBdICk7XG4gIH1cblxuICAvKipcbiAgICogR2VuZXJhdGUgYSBcIlBlcnNwZWN0aXZlXCIgcHJvamVjdGlvbiBtYXRyaXguXG4gICAqIEl0IHdvbid0IGluY2x1ZGUgYXNwZWN0IVxuICAgKi9cbiAgcHVibGljIHN0YXRpYyBwZXJzcGVjdGl2ZSggZm92ID0gNDUuMCwgbmVhciA9IDAuMDEsIGZhciA9IDEwMC4wICk6IE1hdHJpeDQge1xuICAgIGNvbnN0IHAgPSAxLjAgLyBNYXRoLnRhbiggZm92ICogTWF0aC5QSSAvIDM2MC4wICk7XG4gICAgY29uc3QgZCA9ICggZmFyIC0gbmVhciApO1xuICAgIHJldHVybiBuZXcgTWF0cml4NCggW1xuICAgICAgcCwgMC4wLCAwLjAsIDAuMCxcbiAgICAgIDAuMCwgcCwgMC4wLCAwLjAsXG4gICAgICAwLjAsIDAuMCwgLSggZmFyICsgbmVhciApIC8gZCwgLTEuMCxcbiAgICAgIDAuMCwgMC4wLCAtMiAqIGZhciAqIG5lYXIgLyBkLCAwLjBcbiAgICBdICk7XG4gIH1cblxuICAvKipcbiAgICogRGVjb21wb3NlIHRoaXMgbWF0cml4IGludG8gYSBwb3NpdGlvbiwgYSBzY2FsZSwgYW5kIGEgcm90YXRpb24uXG4gICAqIFlvaW5rZWQgZnJvbSBUaHJlZS5qcy5cbiAgICovXG4gIHB1YmxpYyBkZWNvbXBvc2UoKTogeyBwb3NpdGlvbjogVmVjdG9yMzsgc2NhbGU6IFZlY3RvcjM7IHJvdGF0aW9uOiBRdWF0ZXJuaW9uIH0ge1xuICAgIGNvbnN0IG0gPSB0aGlzLmVsZW1lbnRzO1xuXG4gICAgbGV0IHN4ID0gbmV3IFZlY3RvcjMoIFsgbVsgMCBdLCBtWyAxIF0sIG1bIDIgXSBdICkubGVuZ3RoO1xuICAgIGNvbnN0IHN5ID0gbmV3IFZlY3RvcjMoIFsgbVsgNCBdLCBtWyA1IF0sIG1bIDYgXSBdICkubGVuZ3RoO1xuICAgIGNvbnN0IHN6ID0gbmV3IFZlY3RvcjMoIFsgbVsgOCBdLCBtWyA5IF0sIG1bIDEwIF0gXSApLmxlbmd0aDtcblxuICAgIC8vIGlmIGRldGVybWluZSBpcyBuZWdhdGl2ZSwgd2UgbmVlZCB0byBpbnZlcnQgb25lIHNjYWxlXG4gICAgY29uc3QgZGV0ID0gdGhpcy5kZXRlcm1pbmFudDtcbiAgICBpZiAoIGRldCA8IDAgKSB7IHN4ID0gLXN4OyB9XG5cbiAgICBjb25zdCBpbnZTeCA9IDEuMCAvIHN4O1xuICAgIGNvbnN0IGludlN5ID0gMS4wIC8gc3k7XG4gICAgY29uc3QgaW52U3ogPSAxLjAgLyBzejtcblxuICAgIGNvbnN0IHJvdGF0aW9uTWF0cml4ID0gdGhpcy5jbG9uZSgpO1xuXG4gICAgcm90YXRpb25NYXRyaXguZWxlbWVudHNbIDAgXSAqPSBpbnZTeDtcbiAgICByb3RhdGlvbk1hdHJpeC5lbGVtZW50c1sgMSBdICo9IGludlN4O1xuICAgIHJvdGF0aW9uTWF0cml4LmVsZW1lbnRzWyAyIF0gKj0gaW52U3g7XG5cbiAgICByb3RhdGlvbk1hdHJpeC5lbGVtZW50c1sgNCBdICo9IGludlN5O1xuICAgIHJvdGF0aW9uTWF0cml4LmVsZW1lbnRzWyA1IF0gKj0gaW52U3k7XG4gICAgcm90YXRpb25NYXRyaXguZWxlbWVudHNbIDYgXSAqPSBpbnZTeTtcblxuICAgIHJvdGF0aW9uTWF0cml4LmVsZW1lbnRzWyA4IF0gKj0gaW52U3o7XG4gICAgcm90YXRpb25NYXRyaXguZWxlbWVudHNbIDkgXSAqPSBpbnZTejtcbiAgICByb3RhdGlvbk1hdHJpeC5lbGVtZW50c1sgMTAgXSAqPSBpbnZTejtcblxuICAgIHJldHVybiB7XG4gICAgICBwb3NpdGlvbjogbmV3IFZlY3RvcjMoIFsgbVsgMTIgXSwgbVsgMTMgXSwgbVsgMTQgXSBdICksXG4gICAgICBzY2FsZTogbmV3IFZlY3RvcjMoIFsgc3gsIHN5LCBzeiBdICksXG4gICAgICByb3RhdGlvbjogUXVhdGVybmlvbi5mcm9tTWF0cml4KCByb3RhdGlvbk1hdHJpeCApXG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDb21wb3NlIGEgbWF0cml4IG91dCBvZiBwb3NpdGlvbiwgc2NhbGUsIGFuZCByb3RhdGlvbi5cbiAgICogWW9pbmtlZCBmcm9tIFRocmVlLmpzLlxuICAgKi9cbiAgcHVibGljIHN0YXRpYyBjb21wb3NlKCBwb3NpdGlvbjogVmVjdG9yMywgcm90YXRpb246IFF1YXRlcm5pb24sIHNjYWxlOiBWZWN0b3IzICk6IE1hdHJpeDQge1xuICAgIGNvbnN0IHggPSByb3RhdGlvbi54LCB5ID0gcm90YXRpb24ueSwgeiA9IHJvdGF0aW9uLnosIHcgPSByb3RhdGlvbi53O1xuICAgIGNvbnN0IHgyID0geCArIHgsXHR5MiA9IHkgKyB5LCB6MiA9IHogKyB6O1xuICAgIGNvbnN0IHh4ID0geCAqIHgyLCB4eSA9IHggKiB5MiwgeHogPSB4ICogejI7XG4gICAgY29uc3QgeXkgPSB5ICogeTIsIHl6ID0geSAqIHoyLCB6eiA9IHogKiB6MjtcbiAgICBjb25zdCB3eCA9IHcgKiB4Miwgd3kgPSB3ICogeTIsIHd6ID0gdyAqIHoyO1xuICAgIGNvbnN0IHN4ID0gc2NhbGUueCwgc3kgPSBzY2FsZS55LCBzeiA9IHNjYWxlLno7XG5cbiAgICByZXR1cm4gbmV3IE1hdHJpeDQoIFtcbiAgICAgICggMS4wIC0gKCB5eSArIHp6ICkgKSAqIHN4LFxuICAgICAgKCB4eSArIHd6ICkgKiBzeCxcbiAgICAgICggeHogLSB3eSApICogc3gsXG4gICAgICAwLjAsXG5cbiAgICAgICggeHkgLSB3eiApICogc3ksXG4gICAgICAoIDEuMCAtICggeHggKyB6eiApICkgKiBzeSxcbiAgICAgICggeXogKyB3eCApICogc3ksXG4gICAgICAwLjAsXG5cbiAgICAgICggeHogKyB3eSApICogc3osXG4gICAgICAoIHl6IC0gd3ggKSAqIHN6LFxuICAgICAgKCAxLjAgLSAoIHh4ICsgeXkgKSApICogc3osXG4gICAgICAwLjAsXG5cbiAgICAgIHBvc2l0aW9uLngsXG4gICAgICBwb3NpdGlvbi55LFxuICAgICAgcG9zaXRpb24ueixcbiAgICAgIDEuMFxuICAgIF0gKTtcbiAgfVxufVxuIiwiaW1wb3J0IHsgTWF0cml4NCB9IGZyb20gJy4vTWF0cml4NCc7XG5pbXBvcnQgeyBWZWN0b3IgfSBmcm9tICcuL1ZlY3Rvcic7XG5cbmV4cG9ydCB0eXBlIHJhd1ZlY3RvcjQgPSBbIG51bWJlciwgbnVtYmVyLCBudW1iZXIsIG51bWJlciBdO1xuXG4vKipcbiAqIEEgVmVjdG9yMy5cbiAqL1xuZXhwb3J0IGNsYXNzIFZlY3RvcjQgZXh0ZW5kcyBWZWN0b3I8VmVjdG9yND4ge1xuICBwdWJsaWMgZWxlbWVudHM6IHJhd1ZlY3RvcjQ7XG5cbiAgcHVibGljIGNvbnN0cnVjdG9yKCB2OiByYXdWZWN0b3I0ID0gWyAwLjAsIDAuMCwgMC4wLCAwLjAgXSApIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMuZWxlbWVudHMgPSB2O1xuICB9XG5cbiAgLyoqXG4gICAqIEFuIHggY29tcG9uZW50IG9mIHRoaXMuXG4gICAqL1xuICBwdWJsaWMgZ2V0IHgoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5lbGVtZW50c1sgMCBdO1xuICB9XG5cbiAgcHVibGljIHNldCB4KCB4OiBudW1iZXIgKSB7XG4gICAgdGhpcy5lbGVtZW50c1sgMCBdID0geDtcbiAgfVxuXG4gIC8qKlxuICAgKiBBIHkgY29tcG9uZW50IG9mIHRoaXMuXG4gICAqL1xuICBwdWJsaWMgZ2V0IHkoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5lbGVtZW50c1sgMSBdO1xuICB9XG5cbiAgcHVibGljIHNldCB5KCB5OiBudW1iZXIgKSB7XG4gICAgdGhpcy5lbGVtZW50c1sgMSBdID0geTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBIHogY29tcG9uZW50IG9mIHRoaXMuXG4gICAqL1xuICBwdWJsaWMgZ2V0IHooKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5lbGVtZW50c1sgMiBdO1xuICB9XG5cbiAgcHVibGljIHNldCB6KCB6OiBudW1iZXIgKSB7XG4gICAgdGhpcy5lbGVtZW50c1sgMiBdID0gejtcbiAgfVxuXG4gIC8qKlxuICAgKiBBIHcgY29tcG9uZW50IG9mIHRoaXMuXG4gICAqL1xuICBwdWJsaWMgZ2V0IHcoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5lbGVtZW50c1sgMyBdO1xuICB9XG5cbiAgcHVibGljIHNldCB3KCB6OiBudW1iZXIgKSB7XG4gICAgdGhpcy5lbGVtZW50c1sgMyBdID0gejtcbiAgfVxuXG4gIHB1YmxpYyB0b1N0cmluZygpOiBzdHJpbmcge1xuICAgIHJldHVybiBgVmVjdG9yNCggJHsgdGhpcy54LnRvRml4ZWQoIDMgKSB9LCAkeyB0aGlzLnkudG9GaXhlZCggMyApIH0sICR7IHRoaXMuei50b0ZpeGVkKCAzICkgfSwgJHsgdGhpcy53LnRvRml4ZWQoIDMgKSB9IClgO1xuICB9XG5cbiAgLyoqXG4gICAqIE11bHRpcGx5IHRoaXMgdmVjdG9yICh3aXRoIGFuIGltcGxpY2l0IDEgaW4gdGhlIDR0aCBkaW1lbnNpb24pIGJ5IG0uXG4gICAqL1xuICBwdWJsaWMgYXBwbHlNYXRyaXg0KCBtYXRyaXg6IE1hdHJpeDQgKTogVmVjdG9yNCB7XG4gICAgY29uc3QgbSA9IG1hdHJpeC5lbGVtZW50cztcblxuICAgIHJldHVybiBuZXcgVmVjdG9yNCggW1xuICAgICAgbVsgMCBdICogdGhpcy54ICsgbVsgNCBdICogdGhpcy55ICsgbVsgOCBdICogdGhpcy56ICsgbVsgMTIgXSAqIHRoaXMudyxcbiAgICAgIG1bIDEgXSAqIHRoaXMueCArIG1bIDUgXSAqIHRoaXMueSArIG1bIDkgXSAqIHRoaXMueiArIG1bIDEzIF0gKiB0aGlzLncsXG4gICAgICBtWyAyIF0gKiB0aGlzLnggKyBtWyA2IF0gKiB0aGlzLnkgKyBtWyAxMCBdICogdGhpcy56ICsgbVsgMTQgXSAqIHRoaXMudyxcbiAgICAgIG1bIDMgXSAqIHRoaXMueCArIG1bIDcgXSAqIHRoaXMueSArIG1bIDExIF0gKiB0aGlzLnogKyBtWyAxNSBdICogdGhpcy53XG4gICAgXSApO1xuICB9XG5cbiAgcHJvdGVjdGVkIF9fbmV3KCB2OiByYXdWZWN0b3I0ICk6IFZlY3RvcjQge1xuICAgIHJldHVybiBuZXcgVmVjdG9yNCggdiApO1xuICB9XG5cbiAgLyoqXG4gICAqIFZlY3RvcjQoIDAuMCwgMC4wLCAwLjAsIDAuMCApXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIGdldCB6ZXJvKCk6IFZlY3RvcjQge1xuICAgIHJldHVybiBuZXcgVmVjdG9yNCggWyAwLjAsIDAuMCwgMC4wLCAwLjAgXSApO1xuICB9XG5cbiAgLyoqXG4gICAqIFZlY3RvcjQoIDEuMCwgMS4wLCAxLjAsIDEuMCApXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIGdldCBvbmUoKTogVmVjdG9yNCB7XG4gICAgcmV0dXJuIG5ldyBWZWN0b3I0KCBbIDEuMCwgMS4wLCAxLjAsIDEuMCBdICk7XG4gIH1cbn1cbiIsIi8qKlxuICogVXNlZnVsIGZvciBzd2FwIGJ1ZmZlclxuICovXG5leHBvcnQgY2xhc3MgU3dhcDxUPiB7XG4gIHB1YmxpYyBpOiBUO1xuICBwdWJsaWMgbzogVDtcblxuICBwdWJsaWMgY29uc3RydWN0b3IoIGE6IFQsIGI6IFQgKSB7XG4gICAgdGhpcy5pID0gYTtcbiAgICB0aGlzLm8gPSBiO1xuICB9XG5cbiAgcHVibGljIHN3YXAoKTogdm9pZCB7XG4gICAgY29uc3QgaSA9IHRoaXMuaTtcbiAgICB0aGlzLmkgPSB0aGlzLm87XG4gICAgdGhpcy5vID0gaTtcbiAgfVxufVxuIiwiaW1wb3J0IHsgSGlzdG9yeU1lYW5DYWxjdWxhdG9yIH0gZnJvbSAnLi4vSGlzdG9yeU1lYW5DYWxjdWxhdG9yL0hpc3RvcnlNZWFuQ2FsY3VsYXRvcic7XG5cbmV4cG9ydCBjbGFzcyBUYXBUZW1wbyB7XG4gIHByaXZhdGUgX19icG0gPSAwLjA7XG4gIHByaXZhdGUgX19sYXN0VGFwID0gMC4wO1xuICBwcml2YXRlIF9fbGFzdEJlYXQgPSAwLjA7XG4gIHByaXZhdGUgX19sYXN0VGltZSA9IDAuMDtcbiAgcHJpdmF0ZSBfX2NhbGM6IEhpc3RvcnlNZWFuQ2FsY3VsYXRvciA9IG5ldyBIaXN0b3J5TWVhbkNhbGN1bGF0b3IoIDE2ICk7XG5cbiAgcHVibGljIGdldCBiZWF0RHVyYXRpb24oKTogbnVtYmVyIHtcbiAgICByZXR1cm4gNjAuMCAvIHRoaXMuX19icG07XG4gIH1cblxuICBwdWJsaWMgZ2V0IGJwbSgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLl9fYnBtO1xuICB9XG5cbiAgcHVibGljIHNldCBicG0oIGJwbTogbnVtYmVyICkge1xuICAgIHRoaXMuX19sYXN0QmVhdCA9IHRoaXMuYmVhdDtcbiAgICB0aGlzLl9fbGFzdFRpbWUgPSBwZXJmb3JtYW5jZS5ub3coKTtcbiAgICB0aGlzLl9fYnBtID0gYnBtO1xuICB9XG5cbiAgcHVibGljIGdldCBiZWF0KCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuX19sYXN0QmVhdCArICggcGVyZm9ybWFuY2Uubm93KCkgLSB0aGlzLl9fbGFzdFRpbWUgKSAqIDAuMDAxIC8gdGhpcy5iZWF0RHVyYXRpb247XG4gIH1cblxuICBwdWJsaWMgcmVzZXQoKTogdm9pZCB7XG4gICAgdGhpcy5fX2NhbGMucmVzZXQoKTtcbiAgfVxuXG4gIHB1YmxpYyBudWRnZSggYW1vdW50OiBudW1iZXIgKTogdm9pZCB7XG4gICAgdGhpcy5fX2xhc3RCZWF0ID0gdGhpcy5iZWF0ICsgYW1vdW50O1xuICAgIHRoaXMuX19sYXN0VGltZSA9IHBlcmZvcm1hbmNlLm5vdygpO1xuICB9XG5cbiAgcHVibGljIHRhcCgpOiB2b2lkIHtcbiAgICBjb25zdCBub3cgPSBwZXJmb3JtYW5jZS5ub3coKTtcbiAgICBjb25zdCBkZWx0YSA9ICggbm93IC0gdGhpcy5fX2xhc3RUYXAgKSAqIDAuMDAxO1xuXG4gICAgaWYgKCAyLjAgPCBkZWx0YSApIHtcbiAgICAgIHRoaXMucmVzZXQoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fX2NhbGMucHVzaCggZGVsdGEgKTtcbiAgICAgIHRoaXMuX19icG0gPSA2MC4wIC8gKCB0aGlzLl9fY2FsYy5tZWFuICk7XG4gICAgfVxuXG4gICAgdGhpcy5fX2xhc3RUYXAgPSBub3c7XG4gICAgdGhpcy5fX2xhc3RUaW1lID0gbm93O1xuICAgIHRoaXMuX19sYXN0QmVhdCA9IDAuMDtcbiAgfVxufVxuIiwiZXhwb3J0IGNsYXNzIFhvcnNoaWZ0IHtcbiAgcHVibGljIHNlZWQ6IG51bWJlcjtcblxuICBwdWJsaWMgY29uc3RydWN0b3IoIHNlZWQ/OiBudW1iZXIgKSB7XG4gICAgdGhpcy5zZWVkID0gc2VlZCB8fCAxO1xuICB9XG5cbiAgcHVibGljIGdlbiggc2VlZD86IG51bWJlciApOiBudW1iZXIge1xuICAgIGlmICggc2VlZCApIHtcbiAgICAgIHRoaXMuc2VlZCA9IHNlZWQ7XG4gICAgfVxuXG4gICAgdGhpcy5zZWVkID0gdGhpcy5zZWVkIF4gKCB0aGlzLnNlZWQgPDwgMTMgKTtcbiAgICB0aGlzLnNlZWQgPSB0aGlzLnNlZWQgXiAoIHRoaXMuc2VlZCA+Pj4gMTcgKTtcbiAgICB0aGlzLnNlZWQgPSB0aGlzLnNlZWQgXiAoIHRoaXMuc2VlZCA8PCA1ICk7XG4gICAgcmV0dXJuIHRoaXMuc2VlZCAvIE1hdGgucG93KCAyLCAzMiApICsgMC41O1xuICB9XG5cbiAgcHVibGljIHNldCggc2VlZD86IG51bWJlciApOiB2b2lkIHtcbiAgICB0aGlzLnNlZWQgPSBzZWVkIHx8IHRoaXMuc2VlZCB8fCAxO1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFhvcnNoaWZ0O1xuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O0FBQUE7U0FFZ0IsWUFBWSxDQUMxQixPQUFlLEVBQ2YsS0FBd0I7SUFFeEIsSUFBSSxLQUFLLEdBQUcsQ0FBQyxDQUFDO0lBQ2QsSUFBSSxHQUFHLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQztJ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QUMsQ0FBRSxFQUFFLENBQUU7U0FDakMsQ0FBRSxDQUFDO0tBQ0w7Ozs7SUFLRCxJQUFXLFdBQVc7UUFDcEIsTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQztRQUN4QixNQUNFLEdBQUcsR0FBRyxDQUFDLENBQUcsQ0FBQyxDQUFFLEVBQUUsR0FBRyxHQUFHLENBQUMsQ0FBRyxDQUFDLENBQUUsRUFBRSxHQUFHLEdBQUcsQ0FBQyxDQUFHLENBQUMsQ0FBRSxFQUFFLEdBQUcsR0FBRyxDQUFDLENBQUcsQ0FBQyxDQUFFLEVBQzFELEdBQUcsR0FBRyxDQUFDLENBQUcsQ0FBQyxDQUFFLEVBQUUsR0FBRyxHQUFHLENBQUMsQ0FBRyxDQUFDLENBQUUsRUFBRSxHQUFHLEdBQUcsQ0FBQyxDQUFHLENBQUMsQ0FBRSxFQUFFLEdBQUcsR0FBRyxDQUFDLENBQUcsQ0FBQyxDQUFFLEVBQzFELEdBQUcsR0FBRyxDQUFDLENBQUcsQ0FBQyxDQUFFLEVBQUUsR0FBRyxHQUFHLENBQUMsQ0FBRyxDQUFDLENBQUUsRUFBRSxHQUFHLEdBQUcsQ0FBQyxDQUFFLEVBQUUsQ0FBRSxFQUFFLEdBQUcsR0FBRyxDQUFDLENBQUUsRUFBRSxDQUFFLEVBQzFELEdBQUcsR0FBRyxDQUFDLENBQUUsRUFBRSxDQUFFLEVBQUUsR0FBRyxHQUFHLENBQUMsQ0FBRSxFQUFFLENBQUUsRUFBRSxHQUFHLEdBQUcsQ0FBQyxDQUFFLEVBQUUsQ0FBRSxFQUFFLEdBQUcsR0FBRyxDQUFDLENBQUUsRUFBRSxDQUFFLEVBQzFELEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEVBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsRUFDekQsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsRUFBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxFQUN6RCxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxFQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEVBQ3pELEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEVBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsRUFDekQsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsRUFBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxFQUN6RCxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxFQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUM7UUFFNUQsT0FBTyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQztLQUM5RTs7OztJQUtELElBQVcsT0FBTztRQUNoQixNQUFNLENBQUMsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDO1FBQ3hCLE1BQ0UsR0FBRyxHQUFHLENBQUMsQ0FBRyxDQUFDLENBQUUsRUFBRSxHQUFHLEdBQUcsQ0FBQyxDQUFHLENBQUMsQ0FBRSxFQUFFLEdBQUcsR0FBRyxDQUFDLENBQUcsQ0FBQyxDQUFFLEVBQUUsR0FBRyxHQUFHLENBQUMsQ0FBRyxDQUFDLENBQUUsRUFDMUQsR0FBRyxHQUFHLENBQUMsQ0FBRyxDQUFDLENBQUUsRUFBRSxHQUFHLEdBQUcsQ0FBQyxDQUFHLENBQUMsQ0FBRSxFQUFFLEdBQUcsR0FBRyxDQUFDLENBQUcsQ0FBQyxDQUFFLEVBQUUsR0FBRyxHQUFHLENBQUMsQ0FBRyxDQUFDLENBQUUsRUFDMUQsR0FBRyxHQUFHLENBQUMsQ0FBRyxDQUFDLENBQUUsRUFBRSxHQUFHLEdBQUcsQ0FBQyxDQUFHLENBQUMsQ0FBRSxFQUFFLEdBQUcsR0FBRyxDQUFDLENBQUUsRUFBRSxDQUFFLEVBQUUsR0FBRyxHQUFHLENBQUMsQ0FBRSxFQUFFLENBQUUsRUFDMUQsR0FBRyxHQUFHLENBQUMsQ0FBRSxFQUFFLENBQUUsRUFBRSxHQUFHLEdBQUcsQ0FBQyxDQUFFLEVBQUUsQ0FBRSxFQUFFLEdBQUcsR0FBRyxDQUFDLENBQUUsRUFBRSxDQUFFLEVBQUUsR0FBRyxHQUFHLENBQUMsQ0FBRSxFQUFFLENBQUUsRUFDMUQsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsRUFBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxFQUN6RCxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxFQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEVBQ3pELEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEVBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsRUFDekQsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsRUFBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxFQUN6RCxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxFQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEVBQ3pELEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEVBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQztRQUU1RCxNQUFNLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQztRQUVsRixJQUFLLEdBQUcsS0FBSyxHQUFHLEVBQUc7WUFBRSxPQUFPLElBQUksQ0FBQztTQUFFO1FBRW5DLE1BQU0sTUFBTSxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUM7UUFFekIsT0FBTyxJQUFJLE9BQU8sQ0FBRTtZQUNsQixHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUc7WUFDakMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHO1lBQ2pDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRztZQUNqQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUc7WUFDakMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHO1lBQ2pDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRztZQUNqQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUc7WUFDakMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHO1lBQ2pDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRztZQUNqQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUc7WUFDakMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHO1lBQ2pDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRztZQUNqQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUc7WUFDakMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHO1lBQ2pDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRztZQUNqQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUc7U0FDbEMsQ0FBQyxHQUFHLENBQUUsQ0FBRSxDQUFDLEtBQU0sQ0FBQyxHQUFHLE1BQU0sQ0FBZ0IsQ0FBRSxDQUFDO0tBQzlDO0lBRU0sUUFBUTtRQUNiLE1BQU0sQ0FBQyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFFLENBQUUsQ0FBQyxLQUFNLENBQUMsQ0FBQyxPQUFPLENBQUUsQ0FBQyxDQUFFLENBQUUsQ0FBQztRQUN2RCxPQUFPLFlBQWEsQ0FBQyxDQUFFLENBQUMsQ0FBRyxLQUFNLENBQUMsQ0FBRSxDQUFDLENBQUcsS0FBTSxDQUFDLENBQUUsQ0FBQyxDQUFHLEtBQU0sQ0FBQyxDQUFFLEVBQUUsQ0FBRyxLQUFNLENBQUMsQ0FBRSxDQUFDLENBQUcsS0FBTSxDQUFDLENBQUUsQ0FBQyxDQUFHLEtBQU0sQ0FBQyxDQUFFLENBQUMsQ0FBRyxLQUFNLENBQUMsQ0FBRSxFQUFFLENBQUcsS0FBTSxDQUFDLENBQUUsQ0FBQyxDQUFHLEtBQU0sQ0FBQyxDQUFFLENBQUMsQ0FBRyxLQUFNLENBQUMsQ0FBRSxFQUFFLENBQUcsS0FBTSxDQUFDLENBQUUsRUFBRSxDQUFHLEtBQU0sQ0FBQyxDQUFFLENBQUMsQ0FBRyxLQUFNLENBQUMsQ0FBRSxDQUFDLENBQUcsS0FBTSxDQUFDLENBQUUsRUFBRSxDQUFHLEtBQU0sQ0FBQyxDQUFFLEVBQUUsQ0FBRyxJQUFJLENBQUM7S0FDMU87Ozs7SUFLTSxLQUFLO1FBQ1YsT0FBTyxJQUFJLE9BQU8sQ0FBRSxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBZ0IsQ0FBRSxDQUFDO0tBQzVEOzs7O0lBS00sUUFBUSxDQUFFLEdBQUcsUUFBbUI7UUFDckMsSUFBSyxRQUFRLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRztZQUMzQixPQUFPLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztTQUNyQjtRQUVELE1BQU0sR0FBRyxHQUFHLFFBQVEsQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUM5QixJQUFJLElBQUksR0FBRyxHQUFHLENBQUMsS0FBSyxFQUFHLENBQUM7UUFDeEIsSUFBSyxDQUFDLEdBQUcsR0FBRyxDQUFDLE1BQU0sRUFBRztZQUNwQixJQUFJLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBRSxHQUFHLEdBQUcsQ0FBRSxDQUFDO1NBQ2hDO1FBRUQsTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQztRQUN4QixNQUFNLENBQUMsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDO1FBRXhCLE9BQU8sSUFBSSxPQUFPLENBQUU7WUFDbEIsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLEVBQUUsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUU7WUFDdEUsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLEVBQUUsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUU7WUFDdEUsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxFQUFFLENBQUUsR0FBRyxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLEVBQUUsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUU7WUFDdkUsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxFQUFFLENBQUUsR0FBRyxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLEVBQUUsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUU7WUFFdkUsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLEVBQUUsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUU7WUFDdEUsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLEVBQUUsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUU7WUFDdEUsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxFQUFFLENBQUUsR0FBRyxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLEVBQUUsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUU7WUFDdkUsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxFQUFFLENBQUUsR0FBRyxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLEVBQUUsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUU7WUFFdkUsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsRUFBRSxDQUFFLEdBQUcsQ0FBQyxDQUFFLEVBQUUsQ0FBRSxHQUFHLENBQUMsQ0FBRSxFQUFFLENBQUU7WUFDeEUsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsRUFBRSxDQUFFLEdBQUcsQ0FBQyxDQUFFLEVBQUUsQ0FBRSxHQUFHLENBQUMsQ0FBRSxFQUFFLENBQUU7WUFDeEUsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxFQUFFLENBQUUsR0FBRyxDQUFDLENBQUUsRUFBRSxDQUFFLEdBQUcsQ0FBQyxDQUFFLEVBQUUsQ0FBRSxHQUFHLENBQUMsQ0FBRSxFQUFFLENBQUU7WUFDekUsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxFQUFFLENBQUUsR0FBRyxDQUFDLENBQUUsRUFBRSxDQUFFLEdBQUcsQ0FBQyxDQUFFLEVBQUUsQ0FBRSxHQUFHLENBQUMsQ0FBRSxFQUFFLENBQUU7WUFFekUsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxFQUFFLENBQUUsR0FBRyxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLEVBQUUsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsRUFBRSxDQUFFLEdBQUcsQ0FBQyxDQUFFLEVBQUUsQ0FBRSxHQUFHLENBQUMsQ0FBRSxFQUFFLENBQUU7WUFDMUUsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxFQUFFLENBQUUsR0FBRyxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLEVBQUUsQ0FBRSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUUsRUFBRSxDQUFFLEdBQUcsQ0FBQyxDQUFFLEVBQUUsQ0FBRSxHQUFHLENBQUMsQ0FBRSxFQUFFLENBQUU7WUFDMUUsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxFQUFFLENBQUUsR0FBRyxDQUFDLENBQUUsQ0FBQyxDQUFFLEdBQUcsQ0FBQyxDQUFFLEVBQUUsQ0FBRSxHQUFHLENBQUMsQ0FBRSxFQUFFLENBQUUsR0FBRyxDQUFDLENBQUUsRUFBRSxDQUFFLEdBQUcsQ0FBQyxDQUFFLEVBQUUsQ0FBRSxHQUFHLENBQUMsQ0FBRSxFQUFFLENBQUU7WUFDM0UsQ0FBQyxDQUFFLENBQUMsQ0FBRSxHQUFHLENBQUMsQ0FBRSxFQUFFLENBQUUsR0FBRyxDQUFDLENBQUUsQ0FBQyxDQUFFLEdB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
