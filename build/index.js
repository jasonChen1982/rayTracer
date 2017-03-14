(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.JC = global.JC || {})));
}(this, (function (exports) { 'use strict';

(function() {
  var lastTime = 0;
  var vendors = ['ms', 'moz', 'webkit', 'o'];
  for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
    window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
    window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] ||
            window[vendors[x] + 'CancelRequestAnimationFrame'];
  }

  if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = function(callback) {
      var currTime = new Date().getTime();
      var timeToCall = Math.max(0, 16 - (currTime - lastTime));
      var id = window.setTimeout(function() { callback(currTime + timeToCall); },
              timeToCall);
      lastTime = currTime + timeToCall;
      return id;
    };
  }

  if (!window.cancelAnimationFrame) {
    window.cancelAnimationFrame = function(id) {
      clearTimeout(id);
    };
  }

  window.RAF = window.requestAnimationFrame;
  window.CAF = window.cancelAnimationFrame;
})();

/**
 * @author alteredq / http://alteredqualia.com/
 * @author mrdoob / http://mrdoob.com/
 */

var _Math = {

  DTR: Math.PI / 180,
  RTD: 180 / Math.PI,

  clamp: function ( value, min, max ) {

    return Math.max( min, Math.min( max, value ) );

  },

  euclideanModulo: function ( n, m ) {

    return ( ( n % m ) + m ) % m;

  },

  mapLinear: function ( x, a1, a2, b1, b2 ) {

    return b1 + ( x - a1 ) * ( b2 - b1 ) / ( a2 - a1 );

  },

  lerp: function ( x, y, t ) {

    return ( 1 - t ) * x + t * y;

  },

  smoothstep: function ( x, min, max ) {

    if ( x <= min ) return 0;
    if ( x >= max ) return 1;

    x = ( x - min ) / ( max - min );

    return x * x * ( 3 - 2 * x );

  },

  smootherstep: function ( x, min, max ) {

    if ( x <= min ) return 0;
    if ( x >= max ) return 1;

    x = ( x - min ) / ( max - min );

    return x * x * x * ( x * ( x * 6 - 15 ) + 10 );

  },

  randInt: function ( low, high ) {

    return low + Math.floor( Math.random() * ( high - low + 1 ) );

  },

  randFloat: function ( low, high ) {

    return low + Math.random() * ( high - low );

  },

  randFloatSpread: function ( range ) {

    return range * ( 0.5 - Math.random() );

  },

  degToRad: function ( degrees ) {

    return degrees * _Math.DTR;

  },

  radToDeg: function ( radians ) {

    return radians * _Math.RTD;

  },

  isPowerOfTwo: function ( value ) {

    return ( value & ( value - 1 ) ) === 0 && value !== 0;

  },

  nearestPowerOfTwo: function ( value ) {

    return Math.pow( 2, Math.round( Math.log( value ) / Math.LN2 ) );

  },

  nextPowerOfTwo: function ( value ) {

    value --;
    value |= value >> 1;
    value |= value >> 2;
    value |= value >> 4;
    value |= value >> 8;
    value |= value >> 16;
    value ++;

    return value;

  }

};

/**
 * @author mrdoob / http://mrdoob.com/
 */

function Color( r, g, b ) {
  if ( g === undefined && b === undefined ) {
    return this.set( r );
  }
  return this.setRGB( r, g, b );
}

Color.prototype = {

  constructor: Color,

  isColor: true,

  r: 1, g: 1, b: 1,

  set: function ( value ) {

    if ( value && value.isColor ) {

      this.copy( value );

    } else if ( typeof value === 'number' ) {

      this.setHex( value );

    } else if ( typeof value === 'string' ) {

      this.setStyle( value );

    }

    return this;

  },

  setScalar: function ( scalar ) {

    this.r = scalar;
    this.g = scalar;
    this.b = scalar;

    return this;

  },

  setHex: function ( hex ) {

    hex = Math.floor( hex );

    this.r = ( hex >> 16 & 255 ) / 255;
    this.g = ( hex >> 8 & 255 ) / 255;
    this.b = ( hex & 255 ) / 255;

    return this;

  },

  setRGB: function ( r, g, b ) {

    this.r = r;
    this.g = g;
    this.b = b;

    return this;

  },

  setHSL: function () {

    function hue2rgb( p, q, t ) {

      if ( t < 0 ) t += 1;
      if ( t > 1 ) t -= 1;
      if ( t < 1 / 6 ) return p + ( q - p ) * 6 * t;
      if ( t < 1 / 2 ) return q;
      if ( t < 2 / 3 ) return p + ( q - p ) * 6 * ( 2 / 3 - t );
      return p;

    }

    return function setHSL( h, s, l ) {

      // h,s,l ranges are in 0.0 - 1.0
      h = _Math.euclideanModulo( h, 1 );
      s = _Math.clamp( s, 0, 1 );
      l = _Math.clamp( l, 0, 1 );

      if ( s === 0 ) {

        this.r = this.g = this.b = l;

      } else {

        var p = l <= 0.5 ? l * ( 1 + s ) : l + s - ( l * s );
        var q = ( 2 * l ) - p;

        this.r = hue2rgb( q, p, h + 1 / 3 );
        this.g = hue2rgb( q, p, h );
        this.b = hue2rgb( q, p, h - 1 / 3 );

      }

      return this;

    };

  }(),

  setStyle: function ( style ) {

    function handleAlpha( string ) {

      if ( string === undefined ) return;

      if ( parseFloat( string ) < 1 ) {

        console.warn( 'THREE.Color: Alpha component of ' + style + ' will be ignored.' );

      }

    }


    var m;

    /*eslint no-cond-assign: 0*/
    if ( m = /^((?:rgb|hsl)a?)\(\s*([^\)]*)\)/.exec( style ) ) {

      var color;
      var name = m[ 1 ];
      var components = m[ 2 ];

      switch ( name ) {

      case 'rgb':
      case 'rgba':

        if ( color = /^(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(,\s*([0-9]*\.?[0-9]+)\s*)?$/.exec( components ) ) {

          // rgb(255,0,0) rgba(255,0,0,0.5)
          this.r = Math.min( 255, parseInt( color[ 1 ], 10 ) ) / 255;
          this.g = Math.min( 255, parseInt( color[ 2 ], 10 ) ) / 255;
          this.b = Math.min( 255, parseInt( color[ 3 ], 10 ) ) / 255;

          handleAlpha( color[ 5 ] );

          return this;

        }

        if ( color = /^(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(,\s*([0-9]*\.?[0-9]+)\s*)?$/.exec( components ) ) {

          // rgb(100%,0%,0%) rgba(100%,0%,0%,0.5)
          this.r = Math.min( 100, parseInt( color[ 1 ], 10 ) ) / 100;
          this.g = Math.min( 100, parseInt( color[ 2 ], 10 ) ) / 100;
          this.b = Math.min( 100, parseInt( color[ 3 ], 10 ) ) / 100;

          handleAlpha( color[ 5 ] );

          return this;

        }

        break;

      case 'hsl':
      case 'hsla':

        if ( color = /^([0-9]*\.?[0-9]+)\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(,\s*([0-9]*\.?[0-9]+)\s*)?$/.exec( components ) ) {

          // hsl(120,50%,50%) hsla(120,50%,50%,0.5)
          var h = parseFloat( color[ 1 ] ) / 360;
          var s = parseInt( color[ 2 ], 10 ) / 100;
          var l = parseInt( color[ 3 ], 10 ) / 100;

          handleAlpha( color[ 5 ] );

          return this.setHSL( h, s, l );

        }

        break;

      }
    } else if ( m = /^\#([A-Fa-f0-9]+)$/.exec( style ) ) {

      // hex color

      var hex = m[ 1 ];
      var size = hex.length;

      if ( size === 3 ) {

        // #ff0
        this.r = parseInt( hex.charAt( 0 ) + hex.charAt( 0 ), 16 ) / 255;
        this.g = parseInt( hex.charAt( 1 ) + hex.charAt( 1 ), 16 ) / 255;
        this.b = parseInt( hex.charAt( 2 ) + hex.charAt( 2 ), 16 ) / 255;

        return this;

      } else if ( size === 6 ) {

        // #ff0000
        this.r = parseInt( hex.charAt( 0 ) + hex.charAt( 1 ), 16 ) / 255;
        this.g = parseInt( hex.charAt( 2 ) + hex.charAt( 3 ), 16 ) / 255;
        this.b = parseInt( hex.charAt( 4 ) + hex.charAt( 5 ), 16 ) / 255;

        return this;

      }

    }

    if ( style && style.length > 0 ) {

      // color keywords
      hex = ColorKeywords[ style ];

      if ( hex !== undefined ) {

        // red
        this.setHex( hex );

      } else {

        // unknown color
        console.warn( 'THREE.Color: Unknown color ' + style );

      }

    }

    return this;

  },

  clone: function () {

    return new this.constructor( this.r, this.g, this.b );

  },

  copy: function ( color ) {

    this.r = color.r;
    this.g = color.g;
    this.b = color.b;

    return this;

  },

  copyGammaToLinear: function ( color, gammaFactor ) {

    if ( gammaFactor === undefined ) gammaFactor = 2.0;

    this.r = Math.pow( color.r, gammaFactor );
    this.g = Math.pow( color.g, gammaFactor );
    this.b = Math.pow( color.b, gammaFactor );

    return this;

  },

  copyLinearToGamma: function ( color, gammaFactor ) {

    if ( gammaFactor === undefined ) gammaFactor = 2.0;

    var safeInverse = ( gammaFactor > 0 ) ? ( 1.0 / gammaFactor ) : 1.0;

    this.r = Math.pow( color.r, safeInverse );
    this.g = Math.pow( color.g, safeInverse );
    this.b = Math.pow( color.b, safeInverse );

    return this;

  },

  convertGammaToLinear: function () {

    var r = this.r, g = this.g, b = this.b;

    this.r = r * r;
    this.g = g * g;
    this.b = b * b;

    return this;

  },

  convertLinearToGamma: function () {

    this.r = Math.sqrt( this.r );
    this.g = Math.sqrt( this.g );
    this.b = Math.sqrt( this.b );

    return this;

  },

  getHex: function () {

    return ( this.r * 255 ) << 16 ^ ( this.g * 255 ) << 8 ^ ( this.b * 255 ) << 0;

  },

  getHexString: function () {

    return ( '000000' + this.getHex().toString( 16 ) ).slice( - 6 );

  },

  getHSL: function ( optionalTarget ) {

    // h,s,l ranges are in 0.0 - 1.0

    var hsl = optionalTarget || { h: 0, s: 0, l: 0 };

    var r = this.r, g = this.g, b = this.b;

    var max = Math.max( r, g, b );
    var min = Math.min( r, g, b );

    var hue, saturation;
    var lightness = ( min + max ) / 2.0;

    if ( min === max ) {

      hue = 0;
      saturation = 0;

    } else {

      var delta = max - min;

      saturation = lightness <= 0.5 ? delta / ( max + min ) : delta / ( 2 - max - min );

      switch ( max ) {
      case r: hue = ( g - b ) / delta + ( g < b ? 6 : 0 ); break;
      case g: hue = ( b - r ) / delta + 2; break;
      case b: hue = ( r - g ) / delta + 4; break;
      }

      hue /= 6;

    }

    hsl.h = hue;
    hsl.s = saturation;
    hsl.l = lightness;

    return hsl;

  },

  getStyle: function () {

    return 'rgb(' + ( ( this.r * 255 ) | 0 ) + ',' + ( ( this.g * 255 ) | 0 ) + ',' + ( ( this.b * 255 ) | 0 ) + ')';

  },

  offsetHSL: function ( h, s, l ) {

    var hsl = this.getHSL();

    hsl.h += h; hsl.s += s; hsl.l += l;

    this.setHSL( hsl.h, hsl.s, hsl.l );

    return this;

  },

  add: function ( color ) {

    this.r += color.r;
    this.g += color.g;
    this.b += color.b;

    return this;

  },

  addColors: function ( color1, color2 ) {

    this.r = color1.r + color2.r;
    this.g = color1.g + color2.g;
    this.b = color1.b + color2.b;

    return this;

  },

  addScalar: function ( s ) {

    this.r += s;
    this.g += s;
    this.b += s;

    return this;

  },

  sub: function( color ) {

    this.r = Math.max( 0, this.r - color.r );
    this.g = Math.max( 0, this.g - color.g );
    this.b = Math.max( 0, this.b - color.b );

    return this;

  },

  multiply: function ( color ) {

    this.r *= color.r;
    this.g *= color.g;
    this.b *= color.b;

    return this;

  },

  multiplyScalar: function ( s ) {

    this.r *= s;
    this.g *= s;
    this.b *= s;

    return this;

  },

  lerp: function ( color, alpha ) {

    this.r += ( color.r - this.r ) * alpha;
    this.g += ( color.g - this.g ) * alpha;
    this.b += ( color.b - this.b ) * alpha;

    return this;

  },

  equals: function ( c ) {

    return ( c.r === this.r ) && ( c.g === this.g ) && ( c.b === this.b );

  },

  fromArray: function ( array, offset ) {

    if ( offset === undefined ) offset = 0;

    this.r = array[ offset ];
    this.g = array[ offset + 1 ];
    this.b = array[ offset + 2 ];

    return this;

  },

  toArray: function ( array, offset ) {

    if ( array === undefined ) array = [];
    if ( offset === undefined ) offset = 0;

    array[ offset ] = this.r;
    array[ offset + 1 ] = this.g;
    array[ offset + 2 ] = this.b;

    return array;

  },

  toJSON: function () {

    return this.getHex();

  }

};

var ColorKeywords = {
  'aliceblue': 0xF0F8FF,
  'antiquewhite': 0xFAEBD7,
  'aqua': 0x00FFFF,
  'aquamarine': 0x7FFFD4,
  'azure': 0xF0FFFF,
  'beige': 0xF5F5DC,
  'bisque': 0xFFE4C4,
  'black': 0x000000,
  'blanchedalmond': 0xFFEBCD,
  'blue': 0x0000FF,
  'blueviolet': 0x8A2BE2,
  'brown': 0xA52A2A,
  'burlywood': 0xDEB887,
  'cadetblue': 0x5F9EA0,
  'chartreuse': 0x7FFF00,
  'chocolate': 0xD2691E,
  'coral': 0xFF7F50,
  'cornflowerblue': 0x6495ED,
  'cornsilk': 0xFFF8DC,
  'crimson': 0xDC143C,
  'cyan': 0x00FFFF,
  'darkblue': 0x00008B,
  'darkcyan': 0x008B8B,
  'darkgoldenrod': 0xB8860B,
  'darkgray': 0xA9A9A9,
  'darkgreen': 0x006400,
  'darkgrey': 0xA9A9A9,
  'darkkhaki': 0xBDB76B,
  'darkmagenta': 0x8B008B,
  'darkolivegreen': 0x556B2F,
  'darkorange': 0xFF8C00,
  'darkorchid': 0x9932CC,
  'darkred': 0x8B0000,
  'darksalmon': 0xE9967A,
  'darkseagreen': 0x8FBC8F,
  'darkslateblue': 0x483D8B,
  'darkslategray': 0x2F4F4F,
  'darkslategrey': 0x2F4F4F,
  'darkturquoise': 0x00CED1,
  'darkviolet': 0x9400D3,
  'deeppink': 0xFF1493,
  'deepskyblue': 0x00BFFF,
  'dimgray': 0x696969,
  'dimgrey': 0x696969,
  'dodgerblue': 0x1E90FF,
  'firebrick': 0xB22222,
  'floralwhite': 0xFFFAF0,
  'forestgreen': 0x228B22,
  'fuchsia': 0xFF00FF,
  'gainsboro': 0xDCDCDC,
  'ghostwhite': 0xF8F8FF,
  'gold': 0xFFD700,
  'goldenrod': 0xDAA520,
  'gray': 0x808080,
  'green': 0x008000,
  'greenyellow': 0xADFF2F,
  'grey': 0x808080,
  'honeydew': 0xF0FFF0,
  'hotpink': 0xFF69B4,
  'indianred': 0xCD5C5C,
  'indigo': 0x4B0082,
  'ivory': 0xFFFFF0,
  'khaki': 0xF0E68C,
  'lavender': 0xE6E6FA,
  'lavenderblush': 0xFFF0F5,
  'lawngreen': 0x7CFC00,
  'lemonchiffon': 0xFFFACD,
  'lightblue': 0xADD8E6,
  'lightcoral': 0xF08080,
  'lightcyan': 0xE0FFFF,
  'lightgoldenrodyellow': 0xFAFAD2,
  'lightgray': 0xD3D3D3,
  'lightgreen': 0x90EE90,
  'lightgrey': 0xD3D3D3,
  'lightpink': 0xFFB6C1,
  'lightsalmon': 0xFFA07A,
  'lightseagreen': 0x20B2AA,
  'lightskyblue': 0x87CEFA,
  'lightslategray': 0x778899,
  'lightslategrey': 0x778899,
  'lightsteelblue': 0xB0C4DE,
  'lightyellow': 0xFFFFE0,
  'lime': 0x00FF00,
  'limegreen': 0x32CD32,
  'linen': 0xFAF0E6,
  'magenta': 0xFF00FF,
  'maroon': 0x800000,
  'mediumaquamarine': 0x66CDAA,
  'mediumblue': 0x0000CD,
  'mediumorchid': 0xBA55D3,
  'mediumpurple': 0x9370DB,
  'mediumseagreen': 0x3CB371,
  'mediumslateblue': 0x7B68EE,
  'mediumspringgreen': 0x00FA9A,
  'mediumturquoise': 0x48D1CC,
  'mediumvioletred': 0xC71585,
  'midnightblue': 0x191970,
  'mintcream': 0xF5FFFA,
  'mistyrose': 0xFFE4E1,
  'moccasin': 0xFFE4B5,
  'navajowhite': 0xFFDEAD,
  'navy': 0x000080,
  'oldlace': 0xFDF5E6,
  'olive': 0x808000,
  'olivedrab': 0x6B8E23,
  'orange': 0xFFA500,
  'orangered': 0xFF4500,
  'orchid': 0xDA70D6,
  'palegoldenrod': 0xEEE8AA,
  'palegreen': 0x98FB98,
  'paleturquoise': 0xAFEEEE,
  'palevioletred': 0xDB7093,
  'papayawhip': 0xFFEFD5,
  'peachpuff': 0xFFDAB9,
  'peru': 0xCD853F,
  'pink': 0xFFC0CB,
  'plum': 0xDDA0DD,
  'powderblue': 0xB0E0E6,
  'purple': 0x800080,
  'red': 0xFF0000,
  'rosybrown': 0xBC8F8F,
  'royalblue': 0x4169E1,
  'saddlebrown': 0x8B4513,
  'salmon': 0xFA8072,
  'sandybrown': 0xF4A460,
  'seagreen': 0x2E8B57,
  'seashell': 0xFFF5EE,
  'sienna': 0xA0522D,
  'silver': 0xC0C0C0,
  'skyblue': 0x87CEEB,
  'slateblue': 0x6A5ACD,
  'slategray': 0x708090,
  'slategrey': 0x708090,
  'snow': 0xFFFAFA,
  'springgreen': 0x00FF7F,
  'steelblue': 0x4682B4,
  'tan': 0xD2B48C,
  'teal': 0x008080,
  'thistle': 0xD8BFD8,
  'tomato': 0xFF6347,
  'turquoise': 0x40E0D0,
  'violet': 0xEE82EE,
  'wheat': 0xF5DEB3,
  'white': 0xFFFFFF,
  'whitesmoke': 0xF5F5F5,
  'yellow': 0xFFFF00,
  'yellowgreen': 0x9ACD32
};

/**
 * @author mrdoob / http://mrdoob.com/
 * @author *kile / http://kile.stravaganza.org/
 * @author philogb / http://blog.thejit.org/
 * @author mikael emtinger / http://gomo.se/
 * @author egraether / http://egraether.com/
 * @author WestLangley / http://github.com/WestLangley
 */

function Vector3( x, y, z ) {

  this.x = x || 0;
  this.y = y || 0;
  this.z = z || 0;

}

Vector3.prototype = {

  constructor: Vector3,

  isVector3: true,

  set: function ( x, y, z ) {

    this.x = x;
    this.y = y;
    this.z = z;

    return this;

  },

  setScalar: function ( scalar ) {

    this.x = scalar;
    this.y = scalar;
    this.z = scalar;

    return this;

  },

  setX: function ( x ) {

    this.x = x;

    return this;

  },

  setY: function ( y ) {

    this.y = y;

    return this;

  },

  setZ: function ( z ) {

    this.z = z;

    return this;

  },

  clone: function () {

    return new this.constructor( this.x, this.y, this.z );

  },

  copy: function ( v ) {

    this.x = v.x;
    this.y = v.y;
    this.z = v.z;

    return this;

  },

  add: function ( v, w ) {

    if ( w !== undefined ) {

      console.warn( 'THREE.Vector3: .add() now only accepts one argument. Use .addVectors( a, b ) instead.' );
      return this.addVectors( v, w );

    }

    this.x += v.x;
    this.y += v.y;
    this.z += v.z;

    return this;

  },

  addScalar: function ( s ) {

    this.x += s;
    this.y += s;
    this.z += s;

    return this;

  },

  addVectors: function ( a, b ) {

    this.x = a.x + b.x;
    this.y = a.y + b.y;
    this.z = a.z + b.z;

    return this;

  },

  addScaledVector: function ( v, s ) {

    this.x += v.x * s;
    this.y += v.y * s;
    this.z += v.z * s;

    return this;

  },

  sub: function ( v, w ) {

    if ( w !== undefined ) {

      console.warn( 'THREE.Vector3: .sub() now only accepts one argument. Use .subVectors( a, b ) instead.' );
      return this.subVectors( v, w );

    }

    this.x -= v.x;
    this.y -= v.y;
    this.z -= v.z;

    return this;

  },

  subScalar: function ( s ) {

    this.x -= s;
    this.y -= s;
    this.z -= s;

    return this;

  },

  subVectors: function ( a, b ) {

    this.x = a.x - b.x;
    this.y = a.y - b.y;
    this.z = a.z - b.z;

    return this;

  },

  multiply: function ( v, w ) {

    if ( w !== undefined ) {

      console.warn( 'THREE.Vector3: .multiply() now only accepts one argument. Use .multiplyVectors( a, b ) instead.' );
      return this.multiplyVectors( v, w );

    }

    this.x *= v.x;
    this.y *= v.y;
    this.z *= v.z;

    return this;

  },

  multiplyScalar: function ( scalar ) {

    if ( isFinite( scalar ) ) {

      this.x *= scalar;
      this.y *= scalar;
      this.z *= scalar;

    } else {

      this.x = 0;
      this.y = 0;
      this.z = 0;

    }

    return this;

  },

  multiplyVectors: function ( a, b ) {

    this.x = a.x * b.x;
    this.y = a.y * b.y;
    this.z = a.z * b.z;

    return this;

  },

  divide: function ( v ) {

    this.x /= v.x;
    this.y /= v.y;
    this.z /= v.z;

    return this;

  },

  divideScalar: function ( scalar ) {

    return this.multiplyScalar( 1 / scalar );

  },

  min: function ( v ) {

    this.x = Math.min( this.x, v.x );
    this.y = Math.min( this.y, v.y );
    this.z = Math.min( this.z, v.z );

    return this;

  },

  max: function ( v ) {

    this.x = Math.max( this.x, v.x );
    this.y = Math.max( this.y, v.y );
    this.z = Math.max( this.z, v.z );

    return this;

  },

  clamp: function ( min, max ) {

    // This function assumes min < max, if this assumption isn't true it will not operate correctly

    this.x = Math.max( min.x, Math.min( max.x, this.x ) );
    this.y = Math.max( min.y, Math.min( max.y, this.y ) );
    this.z = Math.max( min.z, Math.min( max.z, this.z ) );

    return this;

  },

  clampScalar: function () {

    var min, max;

    return function clampScalar( minVal, maxVal ) {

      if ( min === undefined ) {

        min = new Vector3();
        max = new Vector3();

      }

      min.set( minVal, minVal, minVal );
      max.set( maxVal, maxVal, maxVal );

      return this.clamp( min, max );

    };

  }(),

  clampLength: function ( min, max ) {

    var length = this.length();

    return this.multiplyScalar( Math.max( min, Math.min( max, length ) ) / length );

  },

  floor: function () {

    this.x = Math.floor( this.x );
    this.y = Math.floor( this.y );
    this.z = Math.floor( this.z );

    return this;

  },

  ceil: function () {

    this.x = Math.ceil( this.x );
    this.y = Math.ceil( this.y );
    this.z = Math.ceil( this.z );

    return this;

  },

  round: function () {

    this.x = Math.round( this.x );
    this.y = Math.round( this.y );
    this.z = Math.round( this.z );

    return this;

  },

  roundToZero: function () {

    this.x = ( this.x < 0 ) ? Math.ceil( this.x ) : Math.floor( this.x );
    this.y = ( this.y < 0 ) ? Math.ceil( this.y ) : Math.floor( this.y );
    this.z = ( this.z < 0 ) ? Math.ceil( this.z ) : Math.floor( this.z );

    return this;

  },

  negate: function () {

    this.x = - this.x;
    this.y = - this.y;
    this.z = - this.z;

    return this;

  },

  dot: function ( v ) {

    return this.x * v.x + this.y * v.y + this.z * v.z;

  },

  lengthSq: function () {

    return this.x * this.x + this.y * this.y + this.z * this.z;

  },

  length: function () {

    return Math.sqrt( this.x * this.x + this.y * this.y + this.z * this.z );

  },

  lengthManhattan: function () {

    return Math.abs( this.x ) + Math.abs( this.y ) + Math.abs( this.z );

  },

  normalize: function () {

    return this.divideScalar( this.length() );

  },

  setLength: function ( length ) {

    return this.multiplyScalar( length / this.length() );

  },

  lerp: function ( v, alpha ) {

    this.x += ( v.x - this.x ) * alpha;
    this.y += ( v.y - this.y ) * alpha;
    this.z += ( v.z - this.z ) * alpha;

    return this;

  },

  lerpVectors: function ( v1, v2, alpha ) {

    return this.subVectors( v2, v1 ).multiplyScalar( alpha ).add( v1 );

  },

  cross: function ( v, w ) {

    if ( w !== undefined ) {

      console.warn( 'THREE.Vector3: .cross() now only accepts one argument. Use .crossVectors( a, b ) instead.' );
      return this.crossVectors( v, w );

    }

    var x = this.x, y = this.y, z = this.z;

    this.x = y * v.z - z * v.y;
    this.y = z * v.x - x * v.z;
    this.z = x * v.y - y * v.x;

    return this;

  },

  crossVectors: function ( a, b ) {

    var ax = a.x, ay = a.y, az = a.z;
    var bx = b.x, by = b.y, bz = b.z;

    this.x = ay * bz - az * by;
    this.y = az * bx - ax * bz;
    this.z = ax * by - ay * bx;

    return this;

  },

  projectOnVector: function ( vector ) {

    var scalar = vector.dot( this ) / vector.lengthSq();

    return this.copy( vector ).multiplyScalar( scalar );

  },

  projectOnPlane: function () {

    var v1;

    return function projectOnPlane( planeNormal ) {

      if ( v1 === undefined ) v1 = new Vector3();

      v1.copy( this ).projectOnVector( planeNormal );

      return this.sub( v1 );

    };

  }(),

  reflect: function () {

    // reflect incident vector off plane orthogonal to normal
    // normal is assumed to have unit length

    var v1;

    return function reflect( normal ) {

      if ( v1 === undefined ) v1 = new Vector3();

      return this.sub( v1.copy( normal ).multiplyScalar( 2 * this.dot( normal ) ) );

    };

  }(),

  angleTo: function ( v ) {

    var theta = this.dot( v ) / ( Math.sqrt( this.lengthSq() * v.lengthSq() ) );

    // clamp, to handle numerical problems

    return Math.acos( _Math.clamp( theta, - 1, 1 ) );

  },

  distanceTo: function ( v ) {

    return Math.sqrt( this.distanceToSquared( v ) );

  },

  distanceToSquared: function ( v ) {

    var dx = this.x - v.x, dy = this.y - v.y, dz = this.z - v.z;

    return dx * dx + dy * dy + dz * dz;

  },

  distanceToManhattan: function ( v ) {

    return Math.abs( this.x - v.x ) + Math.abs( this.y - v.y ) + Math.abs( this.z - v.z );

  },

  setFromSpherical: function( s ) {

    var sinPhiRadius = Math.sin( s.phi ) * s.radius;

    this.x = sinPhiRadius * Math.sin( s.theta );
    this.y = Math.cos( s.phi ) * s.radius;
    this.z = sinPhiRadius * Math.cos( s.theta );

    return this;

  },

  setFromCylindrical: function( c ) {

    this.x = c.radius * Math.sin( c.theta );
    this.y = c.y;
    this.z = c.radius * Math.cos( c.theta );

    return this;

  },

  equals: function ( v ) {

    return ( ( v.x === this.x ) && ( v.y === this.y ) && ( v.z === this.z ) );

  },

  fromArray: function ( array, offset ) {

    if ( offset === undefined ) offset = 0;

    this.x = array[ offset ];
    this.y = array[ offset + 1 ];
    this.z = array[ offset + 2 ];

    return this;

  },

  toArray: function ( array, offset ) {

    if ( array === undefined ) array = [];
    if ( offset === undefined ) offset = 0;

    array[ offset ] = this.x;
    array[ offset + 1 ] = this.y;
    array[ offset + 2 ] = this.z;

    return array;

  }

};

/**
 * @author bhouston / http://clara.io
 */

function Ray( origin, direction ) {

  this.origin = ( origin !== undefined ) ? origin : new Vector3();
  this.direction = ( direction !== undefined ) ? direction : new Vector3();

}

Ray.prototype = {

  constructor: Ray,

  set: function ( origin, direction ) {

    this.origin.copy( origin );
    this.direction.copy( direction );

    return this;

  },

  clone: function () {

    return new this.constructor().copy( this );

  },

  copy: function ( ray ) {

    this.origin.copy( ray.origin );
    this.direction.copy( ray.direction );

    return this;

  },

  at: function ( t, optionalTarget ) {

    var result = optionalTarget || new Vector3();

    return result.copy( this.direction ).multiplyScalar( t ).add( this.origin );

  },

  lookAt: function ( v ) {

    this.direction.copy( v ).sub( this.origin ).normalize();

    return this;

  },

  recast: function () {

    var v1 = new Vector3();

    return function recast( t ) {

      this.origin.copy( this.at( t, v1 ) );

      return this;

    };

  }(),

  closestPointToPoint: function ( point, optionalTarget ) {

    var result = optionalTarget || new Vector3();
    result.subVectors( point, this.origin );
    var directionDistance = result.dot( this.direction );

    if ( directionDistance < 0 ) {

      return result.copy( this.origin );

    }

    return result.copy( this.direction ).multiplyScalar( directionDistance ).add( this.origin );

  },

  distanceToPoint: function ( point ) {

    return Math.sqrt( this.distanceSqToPoint( point ) );

  },

  distanceSqToPoint: function () {

    var v1 = new Vector3();

    return function distanceSqToPoint( point ) {

      var directionDistance = v1.subVectors( point, this.origin ).dot( this.direction );

      // point behind the ray

      if ( directionDistance < 0 ) {

        return this.origin.distanceToSquared( point );

      }

      v1.copy( this.direction ).multiplyScalar( directionDistance ).add( this.origin );

      return v1.distanceToSquared( point );

    };

  }(),

  distanceSqToSegment: function () {

    var segCenter = new Vector3();
    var segDir = new Vector3();
    var diff = new Vector3();

    return function distanceSqToSegment( v0, v1, optionalPointOnRay, optionalPointOnSegment ) {

      // from http://www.geometrictools.com/GTEngine/Include/Mathematics/GteDistRaySegment.h
      // It returns the min distance between the ray and the segment
      // defined by v0 and v1
      // It can also set two optional targets :
      // - The closest point on the ray
      // - The closest point on the segment

      segCenter.copy( v0 ).add( v1 ).multiplyScalar( 0.5 );
      segDir.copy( v1 ).sub( v0 ).normalize();
      diff.copy( this.origin ).sub( segCenter );

      var segExtent = v0.distanceTo( v1 ) * 0.5;
      var a01 = - this.direction.dot( segDir );
      var b0 = diff.dot( this.direction );
      var b1 = - diff.dot( segDir );
      var c = diff.lengthSq();
      var det = Math.abs( 1 - a01 * a01 );
      var s0, s1, sqrDist, extDet;

      if ( det > 0 ) {

        // The ray and segment are not parallel.

        s0 = a01 * b1 - b0;
        s1 = a01 * b0 - b1;
        extDet = segExtent * det;

        if ( s0 >= 0 ) {

          if ( s1 >= - extDet ) {

            if ( s1 <= extDet ) {

              // region 0
              // Minimum at interior points of ray and segment.

              var invDet = 1 / det;
              s0 *= invDet;
              s1 *= invDet;
              sqrDist = s0 * ( s0 + a01 * s1 + 2 * b0 ) + s1 * ( a01 * s0 + s1 + 2 * b1 ) + c;

            } else {

              // region 1

              s1 = segExtent;
              s0 = Math.max( 0, - ( a01 * s1 + b0 ) );
              sqrDist = - s0 * s0 + s1 * ( s1 + 2 * b1 ) + c;

            }

          } else {

            // region 5

            s1 = - segExtent;
            s0 = Math.max( 0, - ( a01 * s1 + b0 ) );
            sqrDist = - s0 * s0 + s1 * ( s1 + 2 * b1 ) + c;

          }

        } else {

          if ( s1 <= - extDet ) {

            // region 4

            s0 = Math.max( 0, - ( - a01 * segExtent + b0 ) );
            s1 = ( s0 > 0 ) ? - segExtent : Math.min( Math.max( - segExtent, - b1 ), segExtent );
            sqrDist = - s0 * s0 + s1 * ( s1 + 2 * b1 ) + c;

          } else if ( s1 <= extDet ) {

            // region 3

            s0 = 0;
            s1 = Math.min( Math.max( - segExtent, - b1 ), segExtent );
            sqrDist = s1 * ( s1 + 2 * b1 ) + c;

          } else {

            // region 2

            s0 = Math.max( 0, - ( a01 * segExtent + b0 ) );
            s1 = ( s0 > 0 ) ? segExtent : Math.min( Math.max( - segExtent, - b1 ), segExtent );
            sqrDist = - s0 * s0 + s1 * ( s1 + 2 * b1 ) + c;

          }

        }

      } else {

        // Ray and segment are parallel.

        s1 = ( a01 > 0 ) ? - segExtent : segExtent;
        s0 = Math.max( 0, - ( a01 * s1 + b0 ) );
        sqrDist = - s0 * s0 + s1 * ( s1 + 2 * b1 ) + c;

      }

      if ( optionalPointOnRay ) {

        optionalPointOnRay.copy( this.direction ).multiplyScalar( s0 ).add( this.origin );

      }

      if ( optionalPointOnSegment ) {

        optionalPointOnSegment.copy( segDir ).multiplyScalar( s1 ).add( segCenter );

      }

      return sqrDist;

    };

  }(),

  intersectSphere: function () {

    var v1 = new Vector3();

    return function intersectSphere( sphere, optionalTarget ) {

      v1.subVectors( sphere.center, this.origin );
      var tca = v1.dot( this.direction );
      var d2 = v1.dot( v1 ) - tca * tca;
      var radius2 = sphere.radius * sphere.radius;

      if ( d2 > radius2 ) return null;

      var thc = Math.sqrt( radius2 - d2 );

      // t0 = first intersect point - entrance on front of sphere
      var t0 = tca - thc;

      // t1 = second intersect point - exit point on back of sphere
      var t1 = tca + thc;

      // test to see if both t0 and t1 are behind the ray - if so, return null
      if ( t0 < 0 && t1 < 0 ) return null;

      // test to see if t0 is behind the ray:
      // if it is, the ray is inside the sphere, so return the second exit point scaled by t1,
      // in order to always return an intersect point that is in front of the ray.
      if ( t0 < 0 ) return this.at( t1, optionalTarget );

      // else t0 is in front of the ray, so return the first collision point scaled by t0
      return this.at( t0, optionalTarget );

    };

  }(),

  intersectsSphere: function ( sphere ) {

    return this.distanceToPoint( sphere.center ) <= sphere.radius;

  },

  distanceToPlane: function ( plane ) {

    var denominator = plane.normal.dot( this.direction );

    if ( denominator === 0 ) {

      // line is coplanar, return origin
      if ( plane.distanceToPoint( this.origin ) === 0 ) {

        return 0;

      }

      // Null is preferable to undefined since undefined means.... it is undefined

      return null;

    }

    var t = - ( this.origin.dot( plane.normal ) + plane.constant ) / denominator;

    // Return if the ray never intersects the plane

    return t >= 0 ? t :  null;

  },

  intersectPlane: function ( plane, optionalTarget ) {

    var t = this.distanceToPlane( plane );

    if ( t === null ) {

      return null;

    }

    return this.at( t, optionalTarget );

  },



  intersectsPlane: function ( plane ) {

    // check if the ray lies on the plane first

    var distToPoint = plane.distanceToPoint( this.origin );

    if ( distToPoint === 0 ) {

      return true;

    }

    var denominator = plane.normal.dot( this.direction );

    if ( denominator * distToPoint < 0 ) {

      return true;

    }

    // ray origin is behind the plane (and is pointing behind it)

    return false;

  },

  intersectBox: function ( box, optionalTarget ) {

    var tmin, tmax, tymin, tymax, tzmin, tzmax;

    var invdirx = 1 / this.direction.x,
      invdiry = 1 / this.direction.y,
      invdirz = 1 / this.direction.z;

    var origin = this.origin;

    if ( invdirx >= 0 ) {

      tmin = ( box.min.x - origin.x ) * invdirx;
      tmax = ( box.max.x - origin.x ) * invdirx;

    } else {

      tmin = ( box.max.x - origin.x ) * invdirx;
      tmax = ( box.min.x - origin.x ) * invdirx;

    }

    if ( invdiry >= 0 ) {

      tymin = ( box.min.y - origin.y ) * invdiry;
      tymax = ( box.max.y - origin.y ) * invdiry;

    } else {

      tymin = ( box.max.y - origin.y ) * invdiry;
      tymax = ( box.min.y - origin.y ) * invdiry;

    }

    if ( ( tmin > tymax ) || ( tymin > tmax ) ) return null;

    // These lines also handle the case where tmin or tmax is NaN
    // (result of 0 * Infinity). x !== x returns true if x is NaN

    if ( tymin > tmin || tmin !== tmin ) tmin = tymin;

    if ( tymax < tmax || tmax !== tmax ) tmax = tymax;

    if ( invdirz >= 0 ) {

      tzmin = ( box.min.z - origin.z ) * invdirz;
      tzmax = ( box.max.z - origin.z ) * invdirz;

    } else {

      tzmin = ( box.max.z - origin.z ) * invdirz;
      tzmax = ( box.min.z - origin.z ) * invdirz;

    }

    if ( ( tmin > tzmax ) || ( tzmin > tmax ) ) return null;

    if ( tzmin > tmin || tmin !== tmin ) tmin = tzmin;

    if ( tzmax < tmax || tmax !== tmax ) tmax = tzmax;

    //return point closest to the ray (positive side)

    if ( tmax < 0 ) return null;

    return this.at( tmin >= 0 ? tmin : tmax, optionalTarget );

  },

  intersectsBox: ( function () {

    var v = new Vector3();

    return function intersectsBox( box ) {

      return this.intersectBox( box, v ) !== null;

    };

  } )(),

  intersectTriangle: function () {

    // Compute the offset origin, edges, and normal.
    var diff = new Vector3();
    var edge1 = new Vector3();
    var edge2 = new Vector3();
    var normal = new Vector3();

    return function intersectTriangle( a, b, c, backfaceCulling, optionalTarget ) {

      // from http://www.geometrictools.com/GTEngine/Include/Mathematics/GteIntrRay3Triangle3.h

      edge1.subVectors( b, a );
      edge2.subVectors( c, a );
      normal.crossVectors( edge1, edge2 );

      // Solve Q + t*D = b1*E1 + b2*E2 (Q = kDiff, D = ray direction,
      // E1 = kEdge1, E2 = kEdge2, N = Cross(E1,E2)) by
      //   |Dot(D,N)|*b1 = sign(Dot(D,N))*Dot(D,Cross(Q,E2))
      //   |Dot(D,N)|*b2 = sign(Dot(D,N))*Dot(D,Cross(E1,Q))
      //   |Dot(D,N)|*t = -sign(Dot(D,N))*Dot(Q,N)
      var DdN = this.direction.dot( normal );
      var sign;

      if ( DdN > 0 ) {

        if ( backfaceCulling ) return null;
        sign = 1;

      } else if ( DdN < 0 ) {

        sign = - 1;
        DdN = - DdN;

      } else {

        return null;

      }

      diff.subVectors( this.origin, a );
      var DdQxE2 = sign * this.direction.dot( edge2.crossVectors( diff, edge2 ) );

      // b1 < 0, no intersection
      if ( DdQxE2 < 0 ) {

        return null;

      }

      var DdE1xQ = sign * this.direction.dot( edge1.cross( diff ) );

      // b2 < 0, no intersection
      if ( DdE1xQ < 0 ) {

        return null;

      }

      // b1+b2 > 1, no intersection
      if ( DdQxE2 + DdE1xQ > DdN ) {

        return null;

      }

      // Line intersects triangle, check if ray does.
      var QdN = - sign * diff.dot( normal );

      // t < 0, no intersection
      if ( QdN < 0 ) {

        return null;

      }

      // Ray intersects triangle.
      return this.at( QdN / DdN, optionalTarget );

    };

  }(),

  applyMatrix4: function ( matrix4 ) {

    this.direction.add( this.origin ).applyMatrix4( matrix4 );
    this.origin.applyMatrix4( matrix4 );
    this.direction.sub( this.origin );
    this.direction.normalize();

    return this;

  },

  equals: function ( ray ) {

    return ray.origin.equals( this.origin ) && ray.direction.equals( this.direction );

  }

};

function IntersectResult() {
  this.geometry = null;
  this.distance = 0;
  this.position = new Vector3();
  this.normal = new Vector3();
}

IntersectResult.noHit = new IntersectResult();

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
    var DdotV = ray.direction.dot(v);

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
    var NdotL = normal.clone().dot(lightDir);
    var H = (lightDir.clone().sub(ray.direction)).normalize();
    var NdotH = normal.clone().dot(H);
    var diffuseTerm = this.diffuse.clone().multiplyScalar(Math.max(NdotL, 0));
    var specularTerm = this.specular.clone().multiplyScalar(Math.pow(Math.max(NdotH, 0), this.shininess));
    return lightColor.clone().multiply(diffuseTerm.add(specularTerm));
  }
};

function CheckerMaterial(scale, reflectiveness) {
  this.scale = scale;
  this.reflectiveness = reflectiveness;
}

CheckerMaterial.prototype = {
  sample : function(ray, position) {
    return Math.abs((Math.floor(position.x * 0.1) + Math.floor(position.z * this.scale)) % 2) < 1 ? new Color(0,0,0) : new Color(1,1,1);
  }
};

// import { Matrix4 } from './math/Matrix4';
function Camera(eye, fov, front, up) {
  this.eye = eye;
  this.front = front;
  this.uper = up;
  this.fov = fov;
  this.init();
}
Camera.prototype = {
  constructor: Camera,
  init: function () {
    this.right = new Vector3().crossVectors(this.front, this.uper);
    this.up = new Vector3().crossVectors(this.right, this.front);
    this.fovScale = Math.tan(this.fov * 0.5 * _Math.DTR) * 2;
  },
  getRay: function (x, y) {
    var r = new Vector3().copy(this.right).multiplyScalar((x - 0.5) * this.fovScale);
    var u = new Vector3().copy(this.up).multiplyScalar((y - 0.5) * this.fovScale);
    var d = new Vector3().copy(this.front).addVectors(r, u).normalize();

    return new Ray(this.eye, d);
  }
};

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
  }
};

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
        var scalar = -2 * result.normal.dot(ray.direction);
        var reflect = result.normal.clone().multiplyScalar(scalar).add(ray.direction);
        ray = new Ray(result.position, reflect);
        var reflectedColor = this.rayTrace(scene, ray, maxReflect - 1);
        color.add(reflectedColor.multiplyScalar(reflectiveness));
      }
      return color;
    }
    return new Color(0, 0, 0);
  }
};

exports._Math = _Math;
exports.Color = Color;
exports.Ray = Ray;
exports.Vector3 = Vector3;
exports.Sphere = Sphere;
exports.Plane = Plane;
exports.PhongMaterial = PhongMaterial;
exports.CheckerMaterial = CheckerMaterial;
exports.Camera = Camera;
exports.Scene = Scene;
exports.Renderer = Renderer;

Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=index.js.map
