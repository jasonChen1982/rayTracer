function Scene() {
  this.childs = [];
  this.lights = null;
}
Scene.prototype = {
  constructor: Scene,
  adds: function(object) {
    if (arguments.length > 1) {
      for (var i = 0; i < arguments.length; i++) {
        this.adds(arguments[i]);
      }
      return this;
    }
    if (object === this) {
      console.error('adds: object can\'t be added as a child of itself.', object);
      return this;
    }
    if (object) {
      if (object.parent !== null) {
        object.parent.remove(object);
      }
      object.parent = this;
      this.childs.push(object);
      this.souldSort = true;
    } else {
      console.error('adds: object not an instance of Container', object);
    }
    return this;
  },
  remove: function(object) {
    if (arguments.length > 1) {
      for (var i = 0; i < arguments.length; i++) {
        this.remove(arguments[i]);
      }
    }
    var index = this.childs.indexOf(object);
    if (index !== -1) {
      object.parent = null;
      this.childs.splice(index, 1);
    }
  },
  intersect: function(ray) {
    var minDistance = Infinity;
    var minResult = IntersectResult.noHit;
    for (var i in this.geometries) {
      var result = this.geometries[i].intersect(ray);
      if (result.geometry && result.distance < minDistance) {
        minDistance = result.distance;
        minResult = result;
      }
    }
    return minResult;
  }
};

export {Scene};
