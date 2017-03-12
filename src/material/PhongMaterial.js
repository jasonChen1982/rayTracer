
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
var lightColor = new Color(1);
lightColor.set(0xbbbbbb);

PhongMaterial.prototype = {
  sample: function(ray, position, normal) {
    var NdotL = normal.dot(lightDir);
    var H = (lightDir.sub(ray.direction)).normalize();
    var NdotH = normal.dot(H);
    var diffuseTerm = this.diffuse.multiply(Math.max(NdotL, 0));
    var specularTerm = this.specular.multiply(Math.pow(Math.max(NdotH, 0), this.shininess));
    return lightColor.modulate(diffuseTerm.add(specularTerm));
  }
};
