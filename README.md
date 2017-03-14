# Ray Tracer
[![Build Status](https://img.shields.io/travis/jasonChen1982/rayTracer.svg?style=flat-square)](https://travis-ci.org/jasonChen1982/rayTracer)
[![npm](https://img.shields.io/npm/v/raytracer.svg?style=flat-square)](https://jasonchen1982.github.io/raytracer/)


# a simple ray tracer engine

## npm status
[![npm Status](https://nodei.co/npm/raytracer.png?downloads=true&stars=true)](https://www.npmjs.com/package/raytracer)

## Example
[tracer sphere and plane][ray-tracer]

## Introduction

rayTracer is a lightweight ray tracer render engine base on canvas 2d api.

## Feature

Include `light` `object3d` `camera` `scene` `renderer` `reflect` and so on.

rayTracer`s api is very like threejs, you can ease to code your stage by following:

```javascript
const renderer = new JC.Renderer({
  canvas: document.querySelector('#canvas_screen'),
});
const scene = new JC.Scene();
const camera = new JC.Camera(new JC.Vector3(0, 5, 15), 90, new JC.Vector3(0, 0, -1), new JC.Vector3(0, 1, 0));

const plane = new JC.Plane(new JC.Vector3(0, 1, 0), 0);
plane.material = new JC.CheckerMaterial(0.1, 0.5);

scene.adds(plane);
renderer.render(scene, camera);
```

## License

[MIT](http://opensource.org/licenses/MIT)

[ray-tracer]:https://jasonchen1982.github.io/rayTracer/examples/demo1/ "rayTracer demo"
