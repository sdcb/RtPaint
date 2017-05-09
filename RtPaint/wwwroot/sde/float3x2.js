define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var float3x2 = (function () {
        function float3x2(m11, m12, m21, m22, m31, m32) {
            this.m11 = m11;
            this.m12 = m12;
            this.m21 = m21;
            this.m22 = m22;
            this.m31 = m31;
            this.m32 = m32;
        }
        float3x2.prototype.get = function () {
            return [
                this.m11, this.m12,
                this.m21, this.m22,
                this.m31, this.m32
            ];
        };
        float3x2.prototype.applyTo = function (canvas) {
            canvas.setTransform(this.m11, this.m12, this.m21, this.m22, this.m31, this.m32);
        };
        float3x2.prototype.clone = function () {
            return new float3x2(this.m11, this.m12, this.m21, this.m22, this.m31, this.m32);
        };
        float3x2.prototype.assign = function (value) {
            this.m11 = value.m11;
            this.m12 = value.m12;
            this.m21 = value.m21;
            this.m22 = value.m22;
            this.m31 = value.m31;
            this.m32 = value.m32;
        };
        float3x2.prototype.animate = function (to, duration) {
            var _this = this;
            return AnimationManager.linear(duration, function (rate) {
                _this.assign(float3x2.lerp(_this, to, duration));
            });
        };
        float3x2.identity = function () {
            return new float3x2(1, 0, 0, 1, 0, 0);
        };
        float3x2.prototype.translation = function (x, y) {
            return this.multiply(float3x2.translation(x, y));
        };
        float3x2.prototype.scale = function (xScale, yScale, centerX, centerY) {
            if (centerX === void 0) { centerX = 0; }
            if (centerY === void 0) { centerY = 0; }
            return this.multiply(float3x2.scale(xScale, yScale, centerX, centerY));
        };
        float3x2.prototype.skew = function (radiansX, radiansY, centerX, centerY) {
            if (centerX === void 0) { centerX = 0; }
            if (centerY === void 0) { centerY = 0; }
            return this.multiply(float3x2.skew(radiansX, radiansY, centerX, centerY));
        };
        float3x2.prototype.rotation = function (radians, centerX, centerY) {
            if (centerX === void 0) { centerX = 0; }
            if (centerY === void 0) { centerY = 0; }
            return this.multiply(float3x2.rotation(radians, centerX, centerY));
        };
        float3x2.prototype.add = function (value2) {
            return new float3x2(this.m11 + value2.m11, this.m12 + value2.m12, this.m21 + value2.m21, this.m22 + value2.m22, this.m31 + value2.m31, this.m32 + value2.m32);
        };
        float3x2.prototype.minus = function (value2) {
            return new float3x2(this.m11 - value2.m11, this.m12 - value2.m12, this.m21 - value2.m21, this.m22 - value2.m22, this.m31 - value2.m31, this.m32 - value2.m32);
        };
        float3x2.prototype.multiply = function (value2) {
            return new float3x2(
            // First row
            this.m11 * value2.m11 + this.m12 * value2.m21, this.m11 * value2.m12 + this.m12 * value2.m22, 
            // Second row
            this.m21 * value2.m11 + this.m22 * value2.m21, this.m21 * value2.m12 + this.m22 * value2.m22, 
            // Third row
            this.m31 * value2.m11 + this.m32 * value2.m21 + value2.m31, this.m31 * value2.m12 + this.m32 * value2.m22 + value2.m32);
        };
        float3x2.prototype.multiply_scalar = function (value2) {
            return new float3x2(this.m11 * value2, this.m12 * value2, this.m21 * value2, this.m22 * value2, this.m31 * value2, this.m32 * value2);
        };
        float3x2.prototype.negative = function () {
            return new float3x2(-this.m11, -this.m12, -this.m21, -this.m22, -this.m31, -this.m32);
        };
        float3x2.prototype.equals = function (value2) {
            return this.m11 == value2.m11 && this.m22 == value2.m22 &&
                this.m12 == value2.m12 && this.m21 == value2.m21 &&
                this.m31 == value2.m31 && this.m32 == value2.m32;
        };
        float3x2.prototype.not_equals = function (value2) {
            return this.m11 != value2.m11 || this.m12 != value2.m12 ||
                this.m21 != value2.m21 || this.m22 != value2.m22 ||
                this.m31 != value2.m31 || this.m32 != value2.m32;
        };
        float3x2.prototype.is_identity = function () {
            return this.m11 == 1 && this.m22 == 1 &&
                this.m12 == 0 && this.m21 == 0 &&
                this.m31 == 0 && this.m32 == 0;
        };
        float3x2.prototype.determinant = function () {
            return (this.m11 * this.m22) - (this.m21 * this.m12);
        };
        float3x2.prototype.invert = function () {
            var det = this.determinant();
            var floatEpsilon = 1.192092896e-07;
            if (Math.abs(det) < floatEpsilon) {
                return null;
            }
            var invDet = 1.0 / det;
            return new float3x2(
            // First row
            this.m22 * invDet, -this.m12 * invDet, 
            // Second row
            -this.m21 * invDet, this.m11 * invDet, 
            // Third row
            (this.m21 * this.m32 - this.m31 * this.m22) * invDet, (this.m31 * this.m12 - this.m11 * this.m32) * invDet);
        };
        float3x2.translation = function (x, y) {
            return new float3x2(1, 0, 0, 1, x, y);
        };
        float3x2.scale = function (xScale, yScale, centerX, centerY) {
            if (centerX === void 0) { centerX = 0; }
            if (centerY === void 0) { centerY = 0; }
            var tx = centerX * (1 - xScale);
            var ty = centerY * (1 - yScale);
            return new float3x2(xScale, 0, 0, yScale, tx, ty);
        };
        float3x2.skew = function (radiansX, radiansY, centerX, centerY) {
            if (centerX === void 0) { centerX = 0; }
            if (centerY === void 0) { centerY = 0; }
            var xTan = Math.tan(radiansX);
            var yTan = Math.tan(radiansY);
            var tx = -centerY * xTan;
            var ty = -centerX * yTan;
            return new float3x2(1, yTan, xTan, 1, tx, ty);
        };
        float3x2.rotation = function (radians, centerX, centerY) {
            if (centerX === void 0) { centerX = 0; }
            if (centerY === void 0) { centerY = 0; }
            radians = radians % float3x2._2pi;
            var epsilon = 0.001 * float3x2._pi / 180.0; // 0.1% of a degree
            if (radians < 0)
                radians += float3x2._2pi;
            var c, s;
            if (radians < epsilon || radians > float3x2._2pi - epsilon) {
                // Exact case for zero rotation.
                c = 1;
                s = 0;
            }
            else if (radians > float3x2._piD2 - epsilon && radians < float3x2._piD2 + epsilon) {
                // Exact case for 90 degree rotation.
                c = 0;
                s = 1;
            }
            else if (radians > float3x2._pi - epsilon && radians < float3x2._pi + epsilon) {
                // Exact case for 180 degree rotation.
                c = -1;
                s = 0;
            }
            else if (radians > float3x2._pi + float3x2._piD2 - epsilon && radians < float3x2._pi + float3x2._piD2 + epsilon) {
                // Exact case for 270 degree rotation.
                c = 0;
                s = -1;
            }
            else {
                // Arbitrary rotation.
                c = Math.cos(radians);
                s = Math.sin(radians);
            }
            var x = centerX * (1 - c) + centerY * s;
            var y = centerY * (1 - c) - centerX * s;
            return new float3x2(c, s, -s, c, x, y);
        };
        float3x2.add = function (value1, value2) {
            return new float3x2(value1.m11 + value2.m11, value1.m12 + value2.m12, value1.m21 + value2.m21, value1.m22 + value2.m22, value1.m31 + value2.m31, value1.m32 + value2.m32);
        };
        float3x2.minus = function (value1, value2) {
            return new float3x2(value1.m11 - value2.m11, value1.m12 - value2.m12, value1.m21 - value2.m21, value1.m22 - value2.m22, value1.m31 - value2.m31, value1.m32 - value2.m32);
        };
        float3x2.multiply = function (value1, value2) {
            return new float3x2(
            // First row
            value1.m11 * value2.m11 + value1.m12 * value2.m21, value1.m11 * value2.m12 + value1.m12 * value2.m22, 
            // Second row
            value1.m21 * value2.m11 + value1.m22 * value2.m21, value1.m21 * value2.m12 + value1.m22 * value2.m22, 
            // Third row
            value1.m31 * value2.m11 + value1.m32 * value2.m21 + value2.m31, value1.m31 * value2.m12 + value1.m32 * value2.m22 + value2.m32);
        };
        float3x2.multiply_scalar = function (value1, value2) {
            return new float3x2(value1.m11 * value2, value1.m12 * value2, value1.m21 * value2, value1.m22 * value2, value1.m31 * value2, value1.m32 * value2);
        };
        float3x2.negative = function (value) {
            return new float3x2(-value.m11, -value.m12, -value.m21, -value.m22, -value.m31, -value.m32);
        };
        float3x2.equals = function (value1, value2) {
            return value1.m11 == value2.m11 && value1.m22 == value2.m22 &&
                value1.m12 == value2.m12 &&
                value1.m21 == value2.m21 &&
                value1.m31 == value2.m31 && value1.m32 == value2.m32;
        };
        float3x2.not_equals = function (value1, value2) {
            return value1.m11 != value2.m11 || value1.m12 != value2.m12 ||
                value1.m21 != value2.m21 || value1.m22 != value2.m22 ||
                value1.m31 != value2.m31 || value1.m32 != value2.m32;
        };
        float3x2.is_identity = function (value) {
            return value.m11 == 1 && value.m22 == 1 &&
                value.m12 == 0 &&
                value.m21 == 0 &&
                value.m31 == 0 && value.m32 == 0;
        };
        float3x2.determinant = function (value) {
            return (value.m11 * value.m22) - (value.m21 * value.m12);
        };
        float3x2.invert = function (matrix) {
            var det = float3x2.determinant(matrix);
            var floatEpsilon = 1.192092896e-07;
            if (Math.abs(det) < floatEpsilon) {
                return null;
            }
            var invDet = 1.0 / det;
            return new float3x2(
            // First row
            matrix.m22 * invDet, -matrix.m12 * invDet, 
            // Second row
            -matrix.m21 * invDet, matrix.m11 * invDet, 
            // Third row
            (matrix.m21 * matrix.m32 - matrix.m31 * matrix.m22) * invDet, (matrix.m31 * matrix.m12 - matrix.m11 * matrix.m32) * invDet);
        };
        float3x2.lerp = function (matrix1, matrix2, amount) {
            // return matrix1 + (matrix2 - matrix1) * amount;
            return float3x2.add(matrix1, float3x2.multiply_scalar(float3x2.minus(matrix2, matrix1), amount));
        };
        return float3x2;
    }());
    float3x2._2pi = Math.PI * 2;
    float3x2._pi = Math.PI;
    float3x2._piD2 = Math.PI / 2;
    exports.float3x2 = float3x2;
    var AnimationManager = (function () {
        function AnimationManager() {
        }
        AnimationManager.linear = function (duration, reportCallback) {
            if (duration < 0)
                throw new Error("duration should never less than 0.");
            var then = new Date().getTime();
            return new Promise(function (r) {
                function tick() {
                    var elasped = new Date().getTime() - then;
                    var rate = elasped / duration;
                    if (rate < 1) {
                        reportCallback(rate);
                        requestAnimationFrame(function () { return tick(); });
                    }
                    else {
                        r();
                    }
                }
                tick();
            });
        };
        return AnimationManager;
    }());
    exports.AnimationManager = AnimationManager;
});
//# sourceMappingURL=float3x2.js.map