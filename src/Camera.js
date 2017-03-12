// import { Matrix4 } from './math/Matrix4';
import { Vector3 } from './math/Vector3';
import { Ray } from './math/Ray';
import { _Math } from './math/Math';

function Camera(eye, fov, front, up) {
  this.eye = eye;
  this.front = front;
  this.uper = up;
  this.fov = fov;
  this.init();
}
Camera.prototype = {
  constructor: Camera,
  init: function () {
    this.right = new Vector3();
    this.right.crossVectors(this.front, this.uper);
    this.up = new Vector3();
    this.up.crossVectors(this.right, this.front);
    this.fovScale = Math.tan(this.fov * 0.5 * _Math.DTR) * 2;
  },
  getRay : function(x, y) {
    var r = this.right.clone().multiplyScalar((x - 0.5) * this.fovScale);
    var u = this.up.clone().multiplyScalar((y - 0.5) * this.fovScale);
    var d = this.front.clone().add(r).add(u).normalize();
    // console.log(d);
    return new Ray(this.eye.clone(), d);
  }
};

export {Camera};
