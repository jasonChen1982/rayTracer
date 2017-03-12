// import { Matrix4 } from './math/Matrix4';
import { Vector3 } from './math/Vector3';
import { Ray } from './math/Ray';
import { _Math } from './math/Math';

function Camera(eye, fov, front, up) {
  this.eye = eye;
  this.front = front;
  this.up = up;
  this.fov = fov;
  this.init();
}
Camera.prototype = {
  constructor: Camera,
  init: function () {
    this.right = new Vector3();
    this.right.crossVectors(this.front, this.up);
    this.fovScale = Math.tan(this.fov * 0.5 * _Math.DTR) * 2;
  },
  getRay : function(x, y) {
    var r = this.right.multiplyScalar((x - 0.5) * this.fovScale);
    var u = this.up.multiplyScalar((y - 0.5) * this.fovScale);
    var d = this.front.clone().add(r).add(u).normalize();
    return new Ray(this.eye, d);
  }
};

export {Camera};
