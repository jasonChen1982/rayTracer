
import { Color } from '../math/Color';

function CheckerMaterial(scale, reflectiveness) {
  this.scale = scale;
  this.reflectiveness = reflectiveness;
}

CheckerMaterial.prototype = {
  sample : function(ray, position) {
    return Math.abs((Math.floor(position.x * 0.1) + Math.floor(position.z * this.scale)) % 2) < 1 ? new Color(0,0,0) : new Color(1,1,1);
  }
};

export { CheckerMaterial };
