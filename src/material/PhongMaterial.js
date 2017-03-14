
import { Vector3 } from '../math/Vector3';
import { Color } from '../math/Color';

function PhongMaterial(diffuse, specular, shininess, reflectiveness) {
  this.diffuse = diffuse;
  this.specular = specular;
  this.shininess = shininess;
  this.reflectiveness = reflectiveness;
}

// global temp
var lightDir = new Vector3(1, 1, 1).normalize();
var lightColor = new Color(0xffffff);
// lightColor.set(0xffffff);

PhongMaterial.prototype = {
  sample: function(ray, position, normal) {
    var NdotL = normal.dot(lightDir);
    var H = (lightDir.clone().sub(ray.direction)).normalize();
    var NdotH = normal.dot(H);
    var diffuseTerm = this.diffuse.clone().multiplyScalar(Math.max(NdotL, 0));
    var specularTerm = this.specular.clone().multiplyScalar(Math.pow(Math.max(NdotH, 0), this.shininess));
    return lightColor.clone().multiply(diffuseTerm.add(specularTerm));
  }
};

export { PhongMaterial };
