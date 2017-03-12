
import { IntersectResult } from '../IntersectResult';

function Sphere (center, radius) {
  this.center = center;
  this.radius = radius;
  this.parent = null;
  this.init();
}

Sphere.prototype = {
  init : function() {
    this.sqrRadius = this.radius * this.radius;
  },

  intersect : function(ray) {
    var v = ray.origin.clone().sub(this.center);
    var a0 = v.lengthSq() - this.sqrRadius;
    var DdotV = ray.direction.clone().dot(v);

    if (DdotV <= 0) {
      var discr = DdotV * DdotV - a0;
      if (discr >= 0) {
        var result = new IntersectResult();
        result.geometry = this;
        result.distance = -DdotV - Math.sqrt(discr);
        result.position = ray.at(result.distance);
        result.normal = result.position.clone().sub(this.center).normalize();
        return result;
      }
    }

    return IntersectResult.noHit;
  }
};

export { Sphere };
