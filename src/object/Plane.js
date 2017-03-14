
import { IntersectResult } from '../IntersectResult';

function Plane (normal, d) {
  this.normal = normal;
  this.d = d;
  this.position = this.normal.clone().multiplyScalar(this.d);
  this.parent = null;
}

Plane.prototype = {
  intersect : function(ray) {
    var a = ray.direction.dot(this.normal);
    if (a >= 0) return IntersectResult.noHit;

    var b = this.normal.dot(ray.origin.clone().sub(this.position));
    var result = new IntersectResult();
    result.geometry = this;
    result.distance = -b / a;
    result.position = ray.at(result.distance);
    result.normal = this.normal;
    return result;
  }
};

export { Plane };
