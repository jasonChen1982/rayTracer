# Ray Tracer
[![Build Status](https://img.shields.io/travis/jasonChen1982/raytracer.svg?style=flat-square)](https://travis-ci.org/jasonChen1982/raytracer)
[![npm](https://img.shields.io/npm/v/raytracer.svg?style=flat-square)](https://jasonchen1982.github.io/raytracer/)


# a simple ray tracer engine

## Example
[tracer sphere and plane][ray-tracer]

## Introduction

rayTracer is a lightweight canvas2d render engine and build-in an awesome animator with timeline management, support event system by default.

## Feature

Include `Stage` `Sprite` `Graphics` `Container` `BlurFilter` `TextFace` and so on.

Every display instance can easy start an animation and attach a timeline, just like following:

```javascript
cosnt ball = new JC.Sprite({
    texture: new JC.Texture('/path/xx.png'),
});
ball.fromTo({
  from: {x: 100},
  to: {x: 200},
  ease: 'bounceOut', // set a timingfunction
  repeats: 10, // repeat sometimes
  infinity: true, // want infinity loop?
  alternate: true, // loop with alternate
  duration: 1000, // duration
  onUpdate: function(state,rate){}, // onUpdate callback
  onCompelete: function(){ console.log('end'); } // onCompelete callback
});
```

## License

[MIT](http://opensource.org/licenses/MIT)

[ray-tracer]:https://jasonchen1982.github.io/rayTracer/examples/demo1/ "rayTracer demo"
