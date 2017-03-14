import { Color } from './math/Color';
import { Vector3 } from './math/Vector3';
import { Ray } from './math/Ray';
import { IntersectResult } from './IntersectResult';

function Renderer(opts) {
  this.canvas = opts.canvas;
  this.ctx = this.canvas.getContext('2d');
  this.width = this.canvas.width;
  this.height = this.canvas.height;
  this.frameBuffer = this.ctx.getImageData(0, 0, this.width, this.height);
  this.ctx.fillStyle = '#000';
  this.maxReflect = opts.maxReflect || 3;
}
Renderer.prototype = {
  constructor: Renderer,
  clear: function () {
    this.ctx.fillRect(0, 0, this.width, this.height);
  },
  render: function (scene, camera) {
    this.clear();
    var pixels = this.frameBuffer.data;
    var i = 0;
    for (var y = 0; y < this.height; y++) {
      var sy = 1 - y / this.height;
      for (var x = 0; x < this.width; x++) {
        var sx = x / this.width;
        var ray = camera.getRay(sx, sy);
        var color = this.rayTrace(scene, ray, this.maxReflect);
        pixels[i++] = color.r * 255;
        pixels[i++] = color.g * 255;
        pixels[i++] = color.b * 255;
        pixels[i++] = 255;
      }
    }
    this.ctx.putImageData(this.frameBuffer, 0, 0);
  },
  intersect: function(scene, ray) {
    var minDistance = Infinity;
    var minResult = IntersectResult.noHit;
    for (var i in scene.childs) {
      var result = scene.childs[i].intersect(ray);

      if (result.geometry && result.distance < minDistance) {
        minDistance = result.distance;
        minResult = result;
      }
    }
    return minResult;
  },
  rayTrace: function (scene, ray, maxReflect) {

    var result = this.intersect(scene, ray);

    if (result.geometry) {
      var reflectiveness = result.geometry.material.reflectiveness;
      var color = result.geometry.material.sample(ray, result.position, result.normal);
      color.multiplyScalar(1 - reflectiveness);

      if (reflectiveness > 0 && maxReflect > 0) {
        var r = new Vector3().copy(result.normal).multiplyScalar(-2 * result.normal.clone().dot(ray.direction)).add(ray.direction);
        ray = new Ray(result.position, r);
        var reflectedColor = this.rayTrace(scene, ray, maxReflect - 1);
        color.add(reflectedColor.multiplyScalar(reflectiveness));
      }
      return color;
    }
    return new Color(0, 0, 0);
  }
};

export {Renderer};
