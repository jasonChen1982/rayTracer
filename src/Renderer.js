import { Color } from './math/Color';
import { Ray } from './math/Ray';

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
    var pixels = this.frameBuffer.data;
    var i = 0;
    for (var y = 0; y < this.height; y++) {
      var sy = x / this.height;
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
  rayTrace: function (scene, ray, maxReflect) {
    var result = scene.intersect(ray);

    if (result.geometry) {
      var reflectiveness = result.geometry.material.reflectiveness;
      var color = result.geometry.material.sample(ray, result.position, result.normal);
      color = color.multiply(1 - reflectiveness);

      if (reflectiveness > 0 && maxReflect > 0) {
        var r = result.normal.multiply(-2 * result.normal.dot(ray.direction)).add(ray.direction);
        ray = new Ray(result.position, r);
        var reflectedColor = this.rayTrace(scene, ray, maxReflect - 1);
        color = color.add(reflectedColor.multiply(reflectiveness));
      }
      return color;
    }
    return Color.black;
  }
};

export {Renderer};
