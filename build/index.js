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

function Color( r, g, b ) {

  if ( g === undefined && b === undefined ) {

    // r is THREE.Color, hex or string
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

function Matrix4() {

  this.elements = new Float32Array( [

    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1

  ] );

  if ( arguments.length > 0 ) {

    console.error( 'THREE.Matrix4: the constructor no longer reads arguments. use .set() instead.' );

  }

}

Matrix4.prototype = {

  constructor: Matrix4,

  isMatrix4: true,

  set: function ( n11, n12, n13, n14, n21, n22, n23, n24, n31, n32, n33, n34, n41, n42, n43, n44 ) {

    var te = this.elements;

    te[ 0 ] = n11; te[ 4 ] = n12; te[ 8 ] = n13; te[ 12 ] = n14;
    te[ 1 ] = n21; te[ 5 ] = n22; te[ 9 ] = n23; te[ 13 ] = n24;
    te[ 2 ] = n31; te[ 6 ] = n32; te[ 10 ] = n33; te[ 14 ] = n34;
    te[ 3 ] = n41; te[ 7 ] = n42; te[ 11 ] = n43; te[ 15 ] = n44;

    return this;

  },

  identity: function () {

    this.set(

      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1

    );

    return this;

  },

  clone: function () {

    return new Matrix4().fromArray( this.elements );

  },

  copy: function ( m ) {

    this.elements.set( m.elements );

    return this;

  },

  copyPosition: function ( m ) {

    var te = this.elements;
    var me = m.elements;

    te[ 12 ] = me[ 12 ];
    te[ 13 ] = me[ 13 ];
    te[ 14 ] = me[ 14 ];

    return this;

  },

  extractBasis: function ( xAxis, yAxis, zAxis ) {

    xAxis.setFromMatrixColumn( this, 0 );
    yAxis.setFromMatrixColumn( this, 1 );
    zAxis.setFromMatrixColumn( this, 2 );

    return this;

  },

  makeBasis: function ( xAxis, yAxis, zAxis ) {

    this.set(
      xAxis.x, yAxis.x, zAxis.x, 0,
      xAxis.y, yAxis.y, zAxis.y, 0,
      xAxis.z, yAxis.z, zAxis.z, 0,
      0,       0,       0,       1
    );

    return this;

  },

  extractRotation: function () {

    var v1;

    return function extractRotation( m ) {

      if ( v1 === undefined ) v1 = new Vector3();

      var te = this.elements;
      var me = m.elements;

      var scaleX = 1 / v1.setFromMatrixColumn( m, 0 ).length();
      var scaleY = 1 / v1.setFromMatrixColumn( m, 1 ).length();
      var scaleZ = 1 / v1.setFromMatrixColumn( m, 2 ).length();

      te[ 0 ] = me[ 0 ] * scaleX;
      te[ 1 ] = me[ 1 ] * scaleX;
      te[ 2 ] = me[ 2 ] * scaleX;

      te[ 4 ] = me[ 4 ] * scaleY;
      te[ 5 ] = me[ 5 ] * scaleY;
      te[ 6 ] = me[ 6 ] * scaleY;

      te[ 8 ] = me[ 8 ] * scaleZ;
      te[ 9 ] = me[ 9 ] * scaleZ;
      te[ 10 ] = me[ 10 ] * scaleZ;

      return this;

    };

  }(),

  makeRotationFromEuler: function ( euler ) {

    if ( (euler && euler.isEuler) === false ) {

      console.error( 'THREE.Matrix: .makeRotationFromEuler() now expects a Euler rotation rather than a Vector3 and order.' );

    }

    var te = this.elements;

    var x = euler.x, y = euler.y, z = euler.z;
    var a = Math.cos( x ), b = Math.sin( x );
    var c = Math.cos( y ), d = Math.sin( y );
    var e = Math.cos( z ), f = Math.sin( z );

    /*eslint no-redeclare: 0*/
    if ( euler.order === 'XYZ' ) {

      var ae = a * e, af = a * f, be = b * e, bf = b * f;

      te[ 0 ] = c * e;
      te[ 4 ] = - c * f;
      te[ 8 ] = d;

      te[ 1 ] = af + be * d;
      te[ 5 ] = ae - bf * d;
      te[ 9 ] = - b * c;

      te[ 2 ] = bf - ae * d;
      te[ 6 ] = be + af * d;
      te[ 10 ] = a * c;

    } else if ( euler.order === 'YXZ' ) {

      var ce = c * e, cf = c * f, de = d * e, df = d * f;

      te[ 0 ] = ce + df * b;
      te[ 4 ] = de * b - cf;
      te[ 8 ] = a * d;

      te[ 1 ] = a * f;
      te[ 5 ] = a * e;
      te[ 9 ] = - b;

      te[ 2 ] = cf * b - de;
      te[ 6 ] = df + ce * b;
      te[ 10 ] = a * c;

    } else if ( euler.order === 'ZXY' ) {

      var ce = c * e, cf = c * f, de = d * e, df = d * f;

      te[ 0 ] = ce - df * b;
      te[ 4 ] = - a * f;
      te[ 8 ] = de + cf * b;

      te[ 1 ] = cf + de * b;
      te[ 5 ] = a * e;
      te[ 9 ] = df - ce * b;

      te[ 2 ] = - a * d;
      te[ 6 ] = b;
      te[ 10 ] = a * c;

    } else if ( euler.order === 'ZYX' ) {

      var ae = a * e, af = a * f, be = b * e, bf = b * f;

      te[ 0 ] = c * e;
      te[ 4 ] = be * d - af;
      te[ 8 ] = ae * d + bf;

      te[ 1 ] = c * f;
      te[ 5 ] = bf * d + ae;
      te[ 9 ] = af * d - be;

      te[ 2 ] = - d;
      te[ 6 ] = b * c;
      te[ 10 ] = a * c;

    } else if ( euler.order === 'YZX' ) {

      var ac = a * c, ad = a * d, bc = b * c, bd = b * d;

      te[ 0 ] = c * e;
      te[ 4 ] = bd - ac * f;
      te[ 8 ] = bc * f + ad;

      te[ 1 ] = f;
      te[ 5 ] = a * e;
      te[ 9 ] = - b * e;

      te[ 2 ] = - d * e;
      te[ 6 ] = ad * f + bc;
      te[ 10 ] = ac - bd * f;

    } else if ( euler.order === 'XZY' ) {

      var ac = a * c, ad = a * d, bc = b * c, bd = b * d;

      te[ 0 ] = c * e;
      te[ 4 ] = - f;
      te[ 8 ] = d * e;

      te[ 1 ] = ac * f + bd;
      te[ 5 ] = a * e;
      te[ 9 ] = ad * f - bc;

      te[ 2 ] = bc * f - ad;
      te[ 6 ] = b * e;
      te[ 10 ] = bd * f + ac;

    }

    // last column
    te[ 3 ] = 0;
    te[ 7 ] = 0;
    te[ 11 ] = 0;

    // bottom row
    te[ 12 ] = 0;
    te[ 13 ] = 0;
    te[ 14 ] = 0;
    te[ 15 ] = 1;

    return this;

  },

  makeRotationFromQuaternion: function ( q ) {

    var te = this.elements;

    var x = q.x, y = q.y, z = q.z, w = q.w;
    var x2 = x + x, y2 = y + y, z2 = z + z;
    var xx = x * x2, xy = x * y2, xz = x * z2;
    var yy = y * y2, yz = y * z2, zz = z * z2;
    var wx = w * x2, wy = w * y2, wz = w * z2;

    te[ 0 ] = 1 - ( yy + zz );
    te[ 4 ] = xy - wz;
    te[ 8 ] = xz + wy;

    te[ 1 ] = xy + wz;
    te[ 5 ] = 1 - ( xx + zz );
    te[ 9 ] = yz - wx;

    te[ 2 ] = xz - wy;
    te[ 6 ] = yz + wx;
    te[ 10 ] = 1 - ( xx + yy );

    // last column
    te[ 3 ] = 0;
    te[ 7 ] = 0;
    te[ 11 ] = 0;

    // bottom row
    te[ 12 ] = 0;
    te[ 13 ] = 0;
    te[ 14 ] = 0;
    te[ 15 ] = 1;

    return this;

  },

  lookAt: function () {

    var x, y, z;

    return function lookAt( eye, target, up ) {

      if ( x === undefined ) {

        x = new Vector3();
        y = new Vector3();
        z = new Vector3();

      }

      var te = this.elements;

      z.subVectors( eye, target ).normalize();

      if ( z.lengthSq() === 0 ) {

        z.z = 1;

      }

      x.crossVectors( up, z ).normalize();

      if ( x.lengthSq() === 0 ) {

        z.z += 0.0001;
        x.crossVectors( up, z ).normalize();

      }

      y.crossVectors( z, x );


      te[ 0 ] = x.x; te[ 4 ] = y.x; te[ 8 ] = z.x;
      te[ 1 ] = x.y; te[ 5 ] = y.y; te[ 9 ] = z.y;
      te[ 2 ] = x.z; te[ 6 ] = y.z; te[ 10 ] = z.z;

      return this;

    };

  }(),

  multiply: function ( m, n ) {

    if ( n !== undefined ) {

      console.warn( 'THREE.Matrix4: .multiply() now only accepts one argument. Use .multiplyMatrices( a, b ) instead.' );
      return this.multiplyMatrices( m, n );

    }

    return this.multiplyMatrices( this, m );

  },

  premultiply: function ( m ) {

    return this.multiplyMatrices( m, this );

  },

  multiplyMatrices: function ( a, b ) {

    var ae = a.elements;
    var be = b.elements;
    var te = this.elements;

    var a11 = ae[ 0 ], a12 = ae[ 4 ], a13 = ae[ 8 ], a14 = ae[ 12 ];
    var a21 = ae[ 1 ], a22 = ae[ 5 ], a23 = ae[ 9 ], a24 = ae[ 13 ];
    var a31 = ae[ 2 ], a32 = ae[ 6 ], a33 = ae[ 10 ], a34 = ae[ 14 ];
    var a41 = ae[ 3 ], a42 = ae[ 7 ], a43 = ae[ 11 ], a44 = ae[ 15 ];

    var b11 = be[ 0 ], b12 = be[ 4 ], b13 = be[ 8 ], b14 = be[ 12 ];
    var b21 = be[ 1 ], b22 = be[ 5 ], b23 = be[ 9 ], b24 = be[ 13 ];
    var b31 = be[ 2 ], b32 = be[ 6 ], b33 = be[ 10 ], b34 = be[ 14 ];
    var b41 = be[ 3 ], b42 = be[ 7 ], b43 = be[ 11 ], b44 = be[ 15 ];

    te[ 0 ] = a11 * b11 + a12 * b21 + a13 * b31 + a14 * b41;
    te[ 4 ] = a11 * b12 + a12 * b22 + a13 * b32 + a14 * b42;
    te[ 8 ] = a11 * b13 + a12 * b23 + a13 * b33 + a14 * b43;
    te[ 12 ] = a11 * b14 + a12 * b24 + a13 * b34 + a14 * b44;

    te[ 1 ] = a21 * b11 + a22 * b21 + a23 * b31 + a24 * b41;
    te[ 5 ] = a21 * b12 + a22 * b22 + a23 * b32 + a24 * b42;
    te[ 9 ] = a21 * b13 + a22 * b23 + a23 * b33 + a24 * b43;
    te[ 13 ] = a21 * b14 + a22 * b24 + a23 * b34 + a24 * b44;

    te[ 2 ] = a31 * b11 + a32 * b21 + a33 * b31 + a34 * b41;
    te[ 6 ] = a31 * b12 + a32 * b22 + a33 * b32 + a34 * b42;
    te[ 10 ] = a31 * b13 + a32 * b23 + a33 * b33 + a34 * b43;
    te[ 14 ] = a31 * b14 + a32 * b24 + a33 * b34 + a34 * b44;

    te[ 3 ] = a41 * b11 + a42 * b21 + a43 * b31 + a44 * b41;
    te[ 7 ] = a41 * b12 + a42 * b22 + a43 * b32 + a44 * b42;
    te[ 11 ] = a41 * b13 + a42 * b23 + a43 * b33 + a44 * b43;
    te[ 15 ] = a41 * b14 + a42 * b24 + a43 * b34 + a44 * b44;

    return this;

  },

  multiplyToArray: function ( a, b, r ) {

    var te = this.elements;

    this.multiplyMatrices( a, b );

    r[ 0 ] = te[ 0 ]; r[ 1 ] = te[ 1 ]; r[ 2 ] = te[ 2 ]; r[ 3 ] = te[ 3 ];
    r[ 4 ] = te[ 4 ]; r[ 5 ] = te[ 5 ]; r[ 6 ] = te[ 6 ]; r[ 7 ] = te[ 7 ];
    r[ 8 ]  = te[ 8 ]; r[ 9 ]  = te[ 9 ]; r[ 10 ] = te[ 10 ]; r[ 11 ] = te[ 11 ];
    r[ 12 ] = te[ 12 ]; r[ 13 ] = te[ 13 ]; r[ 14 ] = te[ 14 ]; r[ 15 ] = te[ 15 ];

    return this;

  },

  multiplyScalar: function ( s ) {

    var te = this.elements;

    te[ 0 ] *= s; te[ 4 ] *= s; te[ 8 ] *= s; te[ 12 ] *= s;
    te[ 1 ] *= s; te[ 5 ] *= s; te[ 9 ] *= s; te[ 13 ] *= s;
    te[ 2 ] *= s; te[ 6 ] *= s; te[ 10 ] *= s; te[ 14 ] *= s;
    te[ 3 ] *= s; te[ 7 ] *= s; te[ 11 ] *= s; te[ 15 ] *= s;

    return this;

  },

  applyToBufferAttribute: function () {

    var v1;

    return function applyToBufferAttribute( attribute ) {

      if ( v1 === undefined ) v1 = new Vector3();

      for ( var i = 0, l = attribute.count; i < l; i ++ ) {

        v1.x = attribute.getX( i );
        v1.y = attribute.getY( i );
        v1.z = attribute.getZ( i );

        v1.applyMatrix4( this );

        attribute.setXYZ( i, v1.x, v1.y, v1.z );

      }

      return attribute;

    };

  }(),

  determinant: function () {

    var te = this.elements;

    var n11 = te[ 0 ], n12 = te[ 4 ], n13 = te[ 8 ], n14 = te[ 12 ];
    var n21 = te[ 1 ], n22 = te[ 5 ], n23 = te[ 9 ], n24 = te[ 13 ];
    var n31 = te[ 2 ], n32 = te[ 6 ], n33 = te[ 10 ], n34 = te[ 14 ];
    var n41 = te[ 3 ], n42 = te[ 7 ], n43 = te[ 11 ], n44 = te[ 15 ];

    //TODO: make this more efficient
    //( based on http://www.euclideanspace.com/maths/algebra/matrix/functions/inverse/fourD/index.htm )

    return (
      n41 * (
        + n14 * n23 * n32
         - n13 * n24 * n32
         - n14 * n22 * n33
         + n12 * n24 * n33
         + n13 * n22 * n34
         - n12 * n23 * n34
      ) +
      n42 * (
        + n11 * n23 * n34
         - n11 * n24 * n33
         + n14 * n21 * n33
         - n13 * n21 * n34
         + n13 * n24 * n31
         - n14 * n23 * n31
      ) +
      n43 * (
        + n11 * n24 * n32
         - n11 * n22 * n34
         - n14 * n21 * n32
         + n12 * n21 * n34
         + n14 * n22 * n31
         - n12 * n24 * n31
      ) +
      n44 * (
        - n13 * n22 * n31
         - n11 * n23 * n32
         + n11 * n22 * n33
         + n13 * n21 * n32
         - n12 * n21 * n33
         + n12 * n23 * n31
      )

    );

  },

  transpose: function () {

    var te = this.elements;
    var tmp;

    tmp = te[ 1 ]; te[ 1 ] = te[ 4 ]; te[ 4 ] = tmp;
    tmp = te[ 2 ]; te[ 2 ] = te[ 8 ]; te[ 8 ] = tmp;
    tmp = te[ 6 ]; te[ 6 ] = te[ 9 ]; te[ 9 ] = tmp;

    tmp = te[ 3 ]; te[ 3 ] = te[ 12 ]; te[ 12 ] = tmp;
    tmp = te[ 7 ]; te[ 7 ] = te[ 13 ]; te[ 13 ] = tmp;
    tmp = te[ 11 ]; te[ 11 ] = te[ 14 ]; te[ 14 ] = tmp;

    return this;

  },

  setPosition: function ( v ) {

    var te = this.elements;

    te[ 12 ] = v.x;
    te[ 13 ] = v.y;
    te[ 14 ] = v.z;

    return this;

  },

  getInverse: function ( m, throwOnDegenerate ) {

    // based on http://www.euclideanspace.com/maths/algebra/matrix/functions/inverse/fourD/index.htm
    var te = this.elements,
      me = m.elements,

      n11 = me[ 0 ], n21 = me[ 1 ], n31 = me[ 2 ], n41 = me[ 3 ],
      n12 = me[ 4 ], n22 = me[ 5 ], n32 = me[ 6 ], n42 = me[ 7 ],
      n13 = me[ 8 ], n23 = me[ 9 ], n33 = me[ 10 ], n43 = me[ 11 ],
      n14 = me[ 12 ], n24 = me[ 13 ], n34 = me[ 14 ], n44 = me[ 15 ],

      t11 = n23 * n34 * n42 - n24 * n33 * n42 + n24 * n32 * n43 - n22 * n34 * n43 - n23 * n32 * n44 + n22 * n33 * n44,
      t12 = n14 * n33 * n42 - n13 * n34 * n42 - n14 * n32 * n43 + n12 * n34 * n43 + n13 * n32 * n44 - n12 * n33 * n44,
      t13 = n13 * n24 * n42 - n14 * n23 * n42 + n14 * n22 * n43 - n12 * n24 * n43 - n13 * n22 * n44 + n12 * n23 * n44,
      t14 = n14 * n23 * n32 - n13 * n24 * n32 - n14 * n22 * n33 + n12 * n24 * n33 + n13 * n22 * n34 - n12 * n23 * n34;

    var det = n11 * t11 + n21 * t12 + n31 * t13 + n41 * t14;

    if ( det === 0 ) {

      var msg = 'THREE.Matrix4.getInverse(): can\'t invert matrix, determinant is 0';

      if ( throwOnDegenerate === true ) {

        throw new Error( msg );

      } else {

        console.warn( msg );

      }

      return this.identity();

    }

    var detInv = 1 / det;

    te[ 0 ] = t11 * detInv;
    te[ 1 ] = ( n24 * n33 * n41 - n23 * n34 * n41 - n24 * n31 * n43 + n21 * n34 * n43 + n23 * n31 * n44 - n21 * n33 * n44 ) * detInv;
    te[ 2 ] = ( n22 * n34 * n41 - n24 * n32 * n41 + n24 * n31 * n42 - n21 * n34 * n42 - n22 * n31 * n44 + n21 * n32 * n44 ) * detInv;
    te[ 3 ] = ( n23 * n32 * n41 - n22 * n33 * n41 - n23 * n31 * n42 + n21 * n33 * n42 + n22 * n31 * n43 - n21 * n32 * n43 ) * detInv;

    te[ 4 ] = t12 * detInv;
    te[ 5 ] = ( n13 * n34 * n41 - n14 * n33 * n41 + n14 * n31 * n43 - n11 * n34 * n43 - n13 * n31 * n44 + n11 * n33 * n44 ) * detInv;
    te[ 6 ] = ( n14 * n32 * n41 - n12 * n34 * n41 - n14 * n31 * n42 + n11 * n34 * n42 + n12 * n31 * n44 - n11 * n32 * n44 ) * detInv;
    te[ 7 ] = ( n12 * n33 * n41 - n13 * n32 * n41 + n13 * n31 * n42 - n11 * n33 * n42 - n12 * n31 * n43 + n11 * n32 * n43 ) * detInv;

    te[ 8 ] = t13 * detInv;
    te[ 9 ] = ( n14 * n23 * n41 - n13 * n24 * n41 - n14 * n21 * n43 + n11 * n24 * n43 + n13 * n21 * n44 - n11 * n23 * n44 ) * detInv;
    te[ 10 ] = ( n12 * n24 * n41 - n14 * n22 * n41 + n14 * n21 * n42 - n11 * n24 * n42 - n12 * n21 * n44 + n11 * n22 * n44 ) * detInv;
    te[ 11 ] = ( n13 * n22 * n41 - n12 * n23 * n41 - n13 * n21 * n42 + n11 * n23 * n42 + n12 * n21 * n43 - n11 * n22 * n43 ) * detInv;

    te[ 12 ] = t14 * detInv;
    te[ 13 ] = ( n13 * n24 * n31 - n14 * n23 * n31 + n14 * n21 * n33 - n11 * n24 * n33 - n13 * n21 * n34 + n11 * n23 * n34 ) * detInv;
    te[ 14 ] = ( n14 * n22 * n31 - n12 * n24 * n31 - n14 * n21 * n32 + n11 * n24 * n32 + n12 * n21 * n34 - n11 * n22 * n34 ) * detInv;
    te[ 15 ] = ( n12 * n23 * n31 - n13 * n22 * n31 + n13 * n21 * n32 - n11 * n23 * n32 - n12 * n21 * n33 + n11 * n22 * n33 ) * detInv;

    return this;

  },

  scale: function ( v ) {

    var te = this.elements;
    var x = v.x, y = v.y, z = v.z;

    te[ 0 ] *= x; te[ 4 ] *= y; te[ 8 ] *= z;
    te[ 1 ] *= x; te[ 5 ] *= y; te[ 9 ] *= z;
    te[ 2 ] *= x; te[ 6 ] *= y; te[ 10 ] *= z;
    te[ 3 ] *= x; te[ 7 ] *= y; te[ 11 ] *= z;

    return this;

  },

  getMaxScaleOnAxis: function () {

    var te = this.elements;

    var scaleXSq = te[ 0 ] * te[ 0 ] + te[ 1 ] * te[ 1 ] + te[ 2 ] * te[ 2 ];
    var scaleYSq = te[ 4 ] * te[ 4 ] + te[ 5 ] * te[ 5 ] + te[ 6 ] * te[ 6 ];
    var scaleZSq = te[ 8 ] * te[ 8 ] + te[ 9 ] * te[ 9 ] + te[ 10 ] * te[ 10 ];

    return Math.sqrt( Math.max( scaleXSq, scaleYSq, scaleZSq ) );

  },

  makeTranslation: function ( x, y, z ) {

    this.set(

      1, 0, 0, x,
      0, 1, 0, y,
      0, 0, 1, z,
      0, 0, 0, 1

    );

    return this;

  },

  makeRotationX: function ( theta ) {

    var c = Math.cos( theta ), s = Math.sin( theta );

    this.set(

      1, 0,  0, 0,
      0, c, - s, 0,
      0, s,  c, 0,
      0, 0,  0, 1

    );

    return this;

  },

  makeRotationY: function ( theta ) {

    var c = Math.cos( theta ), s = Math.sin( theta );

    this.set(

       c, 0, s, 0,
       0, 1, 0, 0,
      - s, 0, c, 0,
       0, 0, 0, 1

    );

    return this;

  },

  makeRotationZ: function ( theta ) {

    var c = Math.cos( theta ), s = Math.sin( theta );

    this.set(

      c, - s, 0, 0,
      s,  c, 0, 0,
      0,  0, 1, 0,
      0,  0, 0, 1

    );

    return this;

  },

  makeRotationAxis: function ( axis, angle ) {

    // Based on http://www.gamedev.net/reference/articles/article1199.asp

    var c = Math.cos( angle );
    var s = Math.sin( angle );
    var t = 1 - c;
    var x = axis.x, y = axis.y, z = axis.z;
    var tx = t * x, ty = t * y;

    this.set(

      tx * x + c, tx * y - s * z, tx * z + s * y, 0,
      tx * y + s * z, ty * y + c, ty * z - s * x, 0,
      tx * z - s * y, ty * z + s * x, t * z * z + c, 0,
      0, 0, 0, 1

    );

    return this;

  },

  makeScale: function ( x, y, z ) {

    this.set(

      x, 0, 0, 0,
      0, y, 0, 0,
      0, 0, z, 0,
      0, 0, 0, 1

    );

    return this;

  },

  makeShear: function ( x, y, z ) {

    this.set(

      1, y, z, 0,
      x, 1, z, 0,
      x, y, 1, 0,
      0, 0, 0, 1

    );

    return this;

  },

  compose: function ( position, quaternion, scale ) {

    this.makeRotationFromQuaternion( quaternion );
    this.scale( scale );
    this.setPosition( position );

    return this;

  },

  decompose: function () {

    var vector, matrix;

    return function decompose( position, quaternion, scale ) {

      if ( vector === undefined ) {

        vector = new Vector3();
        matrix = new Matrix4();

      }

      var te = this.elements;

      var sx = vector.set( te[ 0 ], te[ 1 ], te[ 2 ] ).length();
      var sy = vector.set( te[ 4 ], te[ 5 ], te[ 6 ] ).length();
      var sz = vector.set( te[ 8 ], te[ 9 ], te[ 10 ] ).length();

      // if determine is negative, we need to invert one scale
      var det = this.determinant();
      if ( det < 0 ) {

        sx = - sx;

      }

      position.x = te[ 12 ];
      position.y = te[ 13 ];
      position.z = te[ 14 ];

      // scale the rotation part

      matrix.elements.set( this.elements ); // at this point matrix is incomplete so we can't use .copy()

      var invSX = 1 / sx;
      var invSY = 1 / sy;
      var invSZ = 1 / sz;

      matrix.elements[ 0 ] *= invSX;
      matrix.elements[ 1 ] *= invSX;
      matrix.elements[ 2 ] *= invSX;

      matrix.elements[ 4 ] *= invSY;
      matrix.elements[ 5 ] *= invSY;
      matrix.elements[ 6 ] *= invSY;

      matrix.elements[ 8 ] *= invSZ;
      matrix.elements[ 9 ] *= invSZ;
      matrix.elements[ 10 ] *= invSZ;

      quaternion.setFromRotationMatrix( matrix );

      scale.x = sx;
      scale.y = sy;
      scale.z = sz;

      return this;

    };

  }(),

  makePerspective: function ( left, right, top, bottom, near, far ) {

    if ( far === undefined ) {

      console.warn( 'THREE.Matrix4: .makePerspective() has been redefined and has a new signature. Please check the docs.' );

    }

    var te = this.elements;
    var x = 2 * near / ( right - left );
    var y = 2 * near / ( top - bottom );

    var a = ( right + left ) / ( right - left );
    var b = ( top + bottom ) / ( top - bottom );
    var c = - ( far + near ) / ( far - near );
    var d = - 2 * far * near / ( far - near );

    te[ 0 ] = x;	te[ 4 ] = 0;	te[ 8 ] = a;	te[ 12 ] = 0;
    te[ 1 ] = 0;	te[ 5 ] = y;	te[ 9 ] = b;	te[ 13 ] = 0;
    te[ 2 ] = 0;	te[ 6 ] = 0;	te[ 10 ] = c;	te[ 14 ] = d;
    te[ 3 ] = 0;	te[ 7 ] = 0;	te[ 11 ] = - 1;	te[ 15 ] = 0;

    return this;

  },

  makeOrthographic: function ( left, right, top, bottom, near, far ) {

    var te = this.elements;
    var w = 1.0 / ( right - left );
    var h = 1.0 / ( top - bottom );
    var p = 1.0 / ( far - near );

    var x = ( right + left ) * w;
    var y = ( top + bottom ) * h;
    var z = ( far + near ) * p;

    te[ 0 ] = 2 * w;	te[ 4 ] = 0;	te[ 8 ] = 0;	te[ 12 ] = - x;
    te[ 1 ] = 0;	te[ 5 ] = 2 * h;	te[ 9 ] = 0;	te[ 13 ] = - y;
    te[ 2 ] = 0;	te[ 6 ] = 0;	te[ 10 ] = - 2 * p;	te[ 14 ] = - z;
    te[ 3 ] = 0;	te[ 7 ] = 0;	te[ 11 ] = 0;	te[ 15 ] = 1;

    return this;

  },

  equals: function ( matrix ) {

    var te = this.elements;
    var me = matrix.elements;

    for ( var i = 0; i < 16; i ++ ) {

      if ( te[ i ] !== me[ i ] ) return false;

    }

    return true;

  },

  fromArray: function ( array, offset ) {

    if ( offset === undefined ) offset = 0;

    for( var i = 0; i < 16; i ++ ) {

      this.elements[ i ] = array[ i + offset ];

    }

    return this;

  },

  toArray: function ( array, offset ) {

    if ( array === undefined ) array = [];
    if ( offset === undefined ) offset = 0;

    var te = this.elements;

    array[ offset ] = te[ 0 ];
    array[ offset + 1 ] = te[ 1 ];
    array[ offset + 2 ] = te[ 2 ];
    array[ offset + 3 ] = te[ 3 ];

    array[ offset + 4 ] = te[ 4 ];
    array[ offset + 5 ] = te[ 5 ];
    array[ offset + 6 ] = te[ 6 ];
    array[ offset + 7 ] = te[ 7 ];

    array[ offset + 8 ]  = te[ 8 ];
    array[ offset + 9 ]  = te[ 9 ];
    array[ offset + 10 ] = te[ 10 ];
    array[ offset + 11 ] = te[ 11 ];

    array[ offset + 12 ] = te[ 12 ];
    array[ offset + 13 ] = te[ 13 ];
    array[ offset + 14 ] = te[ 14 ];
    array[ offset + 15 ] = te[ 15 ];

    return array;

  }

};

function Quaternion( x, y, z, w ) {

  this._x = x || 0;
  this._y = y || 0;
  this._z = z || 0;
  this._w = ( w !== undefined ) ? w : 1;

}

Quaternion.prototype = {

  constructor: Quaternion,

  get x () {

    return this._x;

  },

  set x ( value ) {

    this._x = value;
    this.onChangeCallback();

  },

  get y () {

    return this._y;

  },

  set y ( value ) {

    this._y = value;
    this.onChangeCallback();

  },

  get z () {

    return this._z;

  },

  set z ( value ) {

    this._z = value;
    this.onChangeCallback();

  },

  get w () {

    return this._w;

  },

  set w ( value ) {

    this._w = value;
    this.onChangeCallback();

  },

  set: function ( x, y, z, w ) {

    this._x = x;
    this._y = y;
    this._z = z;
    this._w = w;

    this.onChangeCallback();

    return this;

  },

  clone: function () {

    return new this.constructor( this._x, this._y, this._z, this._w );

  },

  copy: function ( quaternion ) {

    this._x = quaternion.x;
    this._y = quaternion.y;
    this._z = quaternion.z;
    this._w = quaternion.w;

    this.onChangeCallback();

    return this;

  },

  setFromEuler: function ( euler, update ) {

    if ( (euler && euler.isEuler) === false ) {

      throw new Error( 'THREE.Quaternion: .setFromEuler() now expects an Euler rotation rather than a Vector3 and order.' );

    }

    // http://www.mathworks.com/matlabcentral/fileexchange/
    // 	20696-function-to-convert-between-dcm-euler-angles-quaternions-and-euler-vectors/
    //	content/SpinCalc.m

    var c1 = Math.cos( euler._x / 2 );
    var c2 = Math.cos( euler._y / 2 );
    var c3 = Math.cos( euler._z / 2 );
    var s1 = Math.sin( euler._x / 2 );
    var s2 = Math.sin( euler._y / 2 );
    var s3 = Math.sin( euler._z / 2 );

    var order = euler.order;

    if ( order === 'XYZ' ) {

      this._x = s1 * c2 * c3 + c1 * s2 * s3;
      this._y = c1 * s2 * c3 - s1 * c2 * s3;
      this._z = c1 * c2 * s3 + s1 * s2 * c3;
      this._w = c1 * c2 * c3 - s1 * s2 * s3;

    } else if ( order === 'YXZ' ) {

      this._x = s1 * c2 * c3 + c1 * s2 * s3;
      this._y = c1 * s2 * c3 - s1 * c2 * s3;
      this._z = c1 * c2 * s3 - s1 * s2 * c3;
      this._w = c1 * c2 * c3 + s1 * s2 * s3;

    } else if ( order === 'ZXY' ) {

      this._x = s1 * c2 * c3 - c1 * s2 * s3;
      this._y = c1 * s2 * c3 + s1 * c2 * s3;
      this._z = c1 * c2 * s3 + s1 * s2 * c3;
      this._w = c1 * c2 * c3 - s1 * s2 * s3;

    } else if ( order === 'ZYX' ) {

      this._x = s1 * c2 * c3 - c1 * s2 * s3;
      this._y = c1 * s2 * c3 + s1 * c2 * s3;
      this._z = c1 * c2 * s3 - s1 * s2 * c3;
      this._w = c1 * c2 * c3 + s1 * s2 * s3;

    } else if ( order === 'YZX' ) {

      this._x = s1 * c2 * c3 + c1 * s2 * s3;
      this._y = c1 * s2 * c3 + s1 * c2 * s3;
      this._z = c1 * c2 * s3 - s1 * s2 * c3;
      this._w = c1 * c2 * c3 - s1 * s2 * s3;

    } else if ( order === 'XZY' ) {

      this._x = s1 * c2 * c3 - c1 * s2 * s3;
      this._y = c1 * s2 * c3 - s1 * c2 * s3;
      this._z = c1 * c2 * s3 + s1 * s2 * c3;
      this._w = c1 * c2 * c3 + s1 * s2 * s3;

    }

    if ( update !== false ) this.onChangeCallback();

    return this;

  },

  setFromAxisAngle: function ( axis, angle ) {

    // http://www.euclideanspace.com/maths/geometry/rotations/conversions/angleToQuaternion/index.htm

    // assumes axis is normalized

    var halfAngle = angle / 2, s = Math.sin( halfAngle );

    this._x = axis.x * s;
    this._y = axis.y * s;
    this._z = axis.z * s;
    this._w = Math.cos( halfAngle );

    this.onChangeCallback();

    return this;

  },

  setFromRotationMatrix: function ( m ) {

    // http://www.euclideanspace.com/maths/geometry/rotations/conversions/matrixToQuaternion/index.htm

    // assumes the upper 3x3 of m is a pure rotation matrix (i.e, unscaled)

    var te = m.elements,

      m11 = te[ 0 ], m12 = te[ 4 ], m13 = te[ 8 ],
      m21 = te[ 1 ], m22 = te[ 5 ], m23 = te[ 9 ],
      m31 = te[ 2 ], m32 = te[ 6 ], m33 = te[ 10 ],

      trace = m11 + m22 + m33,
      s;

    if ( trace > 0 ) {

      s = 0.5 / Math.sqrt( trace + 1.0 );

      this._w = 0.25 / s;
      this._x = ( m32 - m23 ) * s;
      this._y = ( m13 - m31 ) * s;
      this._z = ( m21 - m12 ) * s;

    } else if ( m11 > m22 && m11 > m33 ) {

      s = 2.0 * Math.sqrt( 1.0 + m11 - m22 - m33 );

      this._w = ( m32 - m23 ) / s;
      this._x = 0.25 * s;
      this._y = ( m12 + m21 ) / s;
      this._z = ( m13 + m31 ) / s;

    } else if ( m22 > m33 ) {

      s = 2.0 * Math.sqrt( 1.0 + m22 - m11 - m33 );

      this._w = ( m13 - m31 ) / s;
      this._x = ( m12 + m21 ) / s;
      this._y = 0.25 * s;
      this._z = ( m23 + m32 ) / s;

    } else {

      s = 2.0 * Math.sqrt( 1.0 + m33 - m11 - m22 );

      this._w = ( m21 - m12 ) / s;
      this._x = ( m13 + m31 ) / s;
      this._y = ( m23 + m32 ) / s;
      this._z = 0.25 * s;

    }

    this.onChangeCallback();

    return this;

  },

  setFromUnitVectors: function () {

    // http://lolengine.net/blog/2014/02/24/quaternion-from-two-vectors-final

    // assumes direction vectors vFrom and vTo are normalized

    var v1, r;

    var EPS = 0.000001;

    return function setFromUnitVectors( vFrom, vTo ) {

      if ( v1 === undefined ) v1 = new Vector3();

      r = vFrom.dot( vTo ) + 1;

      if ( r < EPS ) {

        r = 0;

        if ( Math.abs( vFrom.x ) > Math.abs( vFrom.z ) ) {

          v1.set( - vFrom.y, vFrom.x, 0 );

        } else {

          v1.set( 0, - vFrom.z, vFrom.y );

        }

      } else {

        v1.crossVectors( vFrom, vTo );

      }

      this._x = v1.x;
      this._y = v1.y;
      this._z = v1.z;
      this._w = r;

      return this.normalize();

    };

  }(),

  inverse: function () {

    return this.conjugate().normalize();

  },

  conjugate: function () {

    this._x *= - 1;
    this._y *= - 1;
    this._z *= - 1;

    this.onChangeCallback();

    return this;

  },

  dot: function ( v ) {

    return this._x * v._x + this._y * v._y + this._z * v._z + this._w * v._w;

  },

  lengthSq: function () {

    return this._x * this._x + this._y * this._y + this._z * this._z + this._w * this._w;

  },

  length: function () {

    return Math.sqrt( this._x * this._x + this._y * this._y + this._z * this._z + this._w * this._w );

  },

  normalize: function () {

    var l = this.length();

    if ( l === 0 ) {

      this._x = 0;
      this._y = 0;
      this._z = 0;
      this._w = 1;

    } else {

      l = 1 / l;

      this._x = this._x * l;
      this._y = this._y * l;
      this._z = this._z * l;
      this._w = this._w * l;

    }

    this.onChangeCallback();

    return this;

  },

  multiply: function ( q, p ) {

    if ( p !== undefined ) {

      console.warn( 'THREE.Quaternion: .multiply() now only accepts one argument. Use .multiplyQuaternions( a, b ) instead.' );
      return this.multiplyQuaternions( q, p );

    }

    return this.multiplyQuaternions( this, q );

  },

  premultiply: function ( q ) {

    return this.multiplyQuaternions( q, this );

  },

  multiplyQuaternions: function ( a, b ) {

    // from http://www.euclideanspace.com/maths/algebra/realNormedAlgebra/quaternions/code/index.htm

    var qax = a._x, qay = a._y, qaz = a._z, qaw = a._w;
    var qbx = b._x, qby = b._y, qbz = b._z, qbw = b._w;

    this._x = qax * qbw + qaw * qbx + qay * qbz - qaz * qby;
    this._y = qay * qbw + qaw * qby + qaz * qbx - qax * qbz;
    this._z = qaz * qbw + qaw * qbz + qax * qby - qay * qbx;
    this._w = qaw * qbw - qax * qbx - qay * qby - qaz * qbz;

    this.onChangeCallback();

    return this;

  },

  slerp: function ( qb, t ) {

    if ( t === 0 ) return this;
    if ( t === 1 ) return this.copy( qb );

    var x = this._x, y = this._y, z = this._z, w = this._w;

    // http://www.euclideanspace.com/maths/algebra/realNormedAlgebra/quaternions/slerp/

    var cosHalfTheta = w * qb._w + x * qb._x + y * qb._y + z * qb._z;

    if ( cosHalfTheta < 0 ) {

      this._w = - qb._w;
      this._x = - qb._x;
      this._y = - qb._y;
      this._z = - qb._z;

      cosHalfTheta = - cosHalfTheta;

    } else {

      this.copy( qb );

    }

    if ( cosHalfTheta >= 1.0 ) {

      this._w = w;
      this._x = x;
      this._y = y;
      this._z = z;

      return this;

    }

    var sinHalfTheta = Math.sqrt( 1.0 - cosHalfTheta * cosHalfTheta );

    if ( Math.abs( sinHalfTheta ) < 0.001 ) {

      this._w = 0.5 * ( w + this._w );
      this._x = 0.5 * ( x + this._x );
      this._y = 0.5 * ( y + this._y );
      this._z = 0.5 * ( z + this._z );

      return this;

    }

    var halfTheta = Math.atan2( sinHalfTheta, cosHalfTheta );
    var ratioA = Math.sin( ( 1 - t ) * halfTheta ) / sinHalfTheta,
      ratioB = Math.sin( t * halfTheta ) / sinHalfTheta;

    this._w = ( w * ratioA + this._w * ratioB );
    this._x = ( x * ratioA + this._x * ratioB );
    this._y = ( y * ratioA + this._y * ratioB );
    this._z = ( z * ratioA + this._z * ratioB );

    this.onChangeCallback();

    return this;

  },

  equals: function ( quaternion ) {

    return ( quaternion._x === this._x ) && ( quaternion._y === this._y ) && ( quaternion._z === this._z ) && ( quaternion._w === this._w );

  },

  fromArray: function ( array, offset ) {

    if ( offset === undefined ) offset = 0;

    this._x = array[ offset ];
    this._y = array[ offset + 1 ];
    this._z = array[ offset + 2 ];
    this._w = array[ offset + 3 ];

    this.onChangeCallback();

    return this;

  },

  toArray: function ( array, offset ) {

    if ( array === undefined ) array = [];
    if ( offset === undefined ) offset = 0;

    array[ offset ] = this._x;
    array[ offset + 1 ] = this._y;
    array[ offset + 2 ] = this._z;
    array[ offset + 3 ] = this._w;

    return array;

  },

  onChange: function ( callback ) {

    this.onChangeCallback = callback;

    return this;

  },

  onChangeCallback: function () {}

};

Object.assign( Quaternion, {

  slerp: function( qa, qb, qm, t ) {

    return qm.copy( qa ).slerp( qb, t );

  },

  slerpFlat: function(
      dst, dstOffset, src0, srcOffset0, src1, srcOffset1, t ) {

    // fuzz-free, array-based Quaternion SLERP operation

    var x0 = src0[ srcOffset0 + 0 ],
      y0 = src0[ srcOffset0 + 1 ],
      z0 = src0[ srcOffset0 + 2 ],
      w0 = src0[ srcOffset0 + 3 ],

      x1 = src1[ srcOffset1 + 0 ],
      y1 = src1[ srcOffset1 + 1 ],
      z1 = src1[ srcOffset1 + 2 ],
      w1 = src1[ srcOffset1 + 3 ];

    if ( w0 !== w1 || x0 !== x1 || y0 !== y1 || z0 !== z1 ) {

      var s = 1 - t,

        cos = x0 * x1 + y0 * y1 + z0 * z1 + w0 * w1,

        dir = ( cos >= 0 ? 1 : - 1 ),
        sqrSin = 1 - cos * cos;

      // Skip the Slerp for tiny steps to avoid numeric problems:
      if ( sqrSin > Number.EPSILON ) {

        var sin = Math.sqrt( sqrSin ),
          len = Math.atan2( sin, cos * dir );

        s = Math.sin( s * len ) / sin;
        t = Math.sin( t * len ) / sin;

      }

      var tDir = t * dir;

      x0 = x0 * s + x1 * tDir;
      y0 = y0 * s + y1 * tDir;
      z0 = z0 * s + z1 * tDir;
      w0 = w0 * s + w1 * tDir;

      // Normalize in case we just did a lerp:
      if ( s === 1 - t ) {

        var f = 1 / Math.sqrt( x0 * x0 + y0 * y0 + z0 * z0 + w0 * w0 );

        x0 *= f;
        y0 *= f;
        z0 *= f;
        w0 *= f;

      }

    }

    dst[ dstOffset ] = x0;
    dst[ dstOffset + 1 ] = y0;
    dst[ dstOffset + 2 ] = z0;
    dst[ dstOffset + 3 ] = w0;

  }

} );

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

  applyEuler: function () {

    var quaternion;

    return function applyEuler( euler ) {

      if ( (euler && euler.isEuler) === false ) {

        console.error( 'THREE.Vector3: .applyEuler() now expects an Euler rotation rather than a Vector3 and order.' );

      }

      if ( quaternion === undefined ) quaternion = new Quaternion();

      return this.applyQuaternion( quaternion.setFromEuler( euler ) );

    };

  }(),

  applyAxisAngle: function () {

    var quaternion;

    return function applyAxisAngle( axis, angle ) {

      if ( quaternion === undefined ) quaternion = new Quaternion();

      return this.applyQuaternion( quaternion.setFromAxisAngle( axis, angle ) );

    };

  }(),

  applyMatrix3: function ( m ) {

    var x = this.x, y = this.y, z = this.z;
    var e = m.elements;

    this.x = e[ 0 ] * x + e[ 3 ] * y + e[ 6 ] * z;
    this.y = e[ 1 ] * x + e[ 4 ] * y + e[ 7 ] * z;
    this.z = e[ 2 ] * x + e[ 5 ] * y + e[ 8 ] * z;

    return this;

  },

  applyMatrix4: function ( m ) {

    var x = this.x, y = this.y, z = this.z;
    var e = m.elements;

    this.x = e[ 0 ] * x + e[ 4 ] * y + e[ 8 ]  * z + e[ 12 ];
    this.y = e[ 1 ] * x + e[ 5 ] * y + e[ 9 ]  * z + e[ 13 ];
    this.z = e[ 2 ] * x + e[ 6 ] * y + e[ 10 ] * z + e[ 14 ];
    var w =  e[ 3 ] * x + e[ 7 ] * y + e[ 11 ] * z + e[ 15 ];

    return this.divideScalar( w );

  },

  applyQuaternion: function ( q ) {

    var x = this.x, y = this.y, z = this.z;
    var qx = q.x, qy = q.y, qz = q.z, qw = q.w;

    // calculate quat * vector

    var ix =  qw * x + qy * z - qz * y;
    var iy =  qw * y + qz * x - qx * z;
    var iz =  qw * z + qx * y - qy * x;
    var iw = - qx * x - qy * y - qz * z;

    // calculate result * inverse quat

    this.x = ix * qw + iw * - qx + iy * - qz - iz * - qy;
    this.y = iy * qw + iw * - qy + iz * - qx - ix * - qz;
    this.z = iz * qw + iw * - qz + ix * - qy - iy * - qx;

    return this;

  },

  project: function () {

    var matrix;

    return function project( camera ) {

      if ( matrix === undefined ) matrix = new Matrix4();

      matrix.multiplyMatrices( camera.projectionMatrix, matrix.getInverse( camera.matrixWorld ) );
      return this.applyMatrix4( matrix );

    };

  }(),

  unproject: function () {

    var matrix;

    return function unproject( camera ) {

      if ( matrix === undefined ) matrix = new Matrix4();

      matrix.multiplyMatrices( camera.matrixWorld, matrix.getInverse( camera.projectionMatrix ) );
      return this.applyMatrix4( matrix );

    };

  }(),

  transformDirection: function ( m ) {

    // input: THREE.Matrix4 affine matrix
    // vector interpreted as a direction

    var x = this.x, y = this.y, z = this.z;
    var e = m.elements;

    this.x = e[ 0 ] * x + e[ 4 ] * y + e[ 8 ]  * z;
    this.y = e[ 1 ] * x + e[ 5 ] * y + e[ 9 ]  * z;
    this.z = e[ 2 ] * x + e[ 6 ] * y + e[ 10 ] * z;

    return this.normalize();

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

  setFromMatrixPosition: function ( m ) {

    return this.setFromMatrixColumn( m, 3 );

  },

  setFromMatrixScale: function ( m ) {

    var sx = this.setFromMatrixColumn( m, 0 ).length();
    var sy = this.setFromMatrixColumn( m, 1 ).length();
    var sz = this.setFromMatrixColumn( m, 2 ).length();

    this.x = sx;
    this.y = sy;
    this.z = sz;

    return this;

  },

  setFromMatrixColumn: function ( m, index ) {

    if ( typeof m === 'number' ) {

      console.warn( 'THREE.Vector3: setFromMatrixColumn now expects ( matrix, index ).' );
      var temp = m;
      m = index;
      index = temp;

    }

    return this.fromArray( m.elements, index * 4 );

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

  },

  fromBufferAttribute: function ( attribute, index, offset ) {

    if ( offset !== undefined ) {

      console.warn( 'THREE.Vector3: offset has been removed from .fromBufferAttribute().' );

    }

    this.x = attribute.getX( index );
    this.y = attribute.getY( index );
    this.z = attribute.getZ( index );

    return this;

  }

};

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

/**
 * @author supereggbert / http://www.paulbrunt.co.uk/
 * @author philogb / http://blog.thejit.org/
 * @author mikael emtinger / http://gomo.se/
 * @author egraether / http://egraether.com/
 * @author WestLangley / http://github.com/WestLangley
 */

function Vector4( x, y, z, w ) {

  this.x = x || 0;
  this.y = y || 0;
  this.z = z || 0;
  this.w = ( w !== undefined ) ? w : 1;

}

Vector4.prototype = {

  constructor: Vector4,

  isVector4: true,

  set: function ( x, y, z, w ) {

    this.x = x;
    this.y = y;
    this.z = z;
    this.w = w;

    return this;

  },

  setScalar: function ( scalar ) {

    this.x = scalar;
    this.y = scalar;
    this.z = scalar;
    this.w = scalar;

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

  setW: function ( w ) {

    this.w = w;

    return this;

  },

  clone: function () {

    return new this.constructor( this.x, this.y, this.z, this.w );

  },

  copy: function ( v ) {

    this.x = v.x;
    this.y = v.y;
    this.z = v.z;
    this.w = ( v.w !== undefined ) ? v.w : 1;

    return this;

  },

  add: function ( v ) {

    this.x += v.x;
    this.y += v.y;
    this.z += v.z;
    this.w += v.w;

    return this;

  },

  addScalar: function ( s ) {

    this.x += s;
    this.y += s;
    this.z += s;
    this.w += s;

    return this;

  },

  addVectors: function ( a, b ) {

    this.x = a.x + b.x;
    this.y = a.y + b.y;
    this.z = a.z + b.z;
    this.w = a.w + b.w;

    return this;

  },

  addScaledVector: function ( v, s ) {

    this.x += v.x * s;
    this.y += v.y * s;
    this.z += v.z * s;
    this.w += v.w * s;

    return this;

  },

  sub: function ( v ) {

    this.x -= v.x;
    this.y -= v.y;
    this.z -= v.z;
    this.w -= v.w;

    return this;

  },

  subScalar: function ( s ) {

    this.x -= s;
    this.y -= s;
    this.z -= s;
    this.w -= s;

    return this;

  },

  subVectors: function ( a, b ) {

    this.x = a.x - b.x;
    this.y = a.y - b.y;
    this.z = a.z - b.z;
    this.w = a.w - b.w;

    return this;

  },

  multiplyScalar: function ( scalar ) {

    if ( isFinite( scalar ) ) {

      this.x *= scalar;
      this.y *= scalar;
      this.z *= scalar;
      this.w *= scalar;

    } else {

      this.x = 0;
      this.y = 0;
      this.z = 0;
      this.w = 0;

    }

    return this;

  },

  applyMatrix4: function ( m ) {

    var x = this.x, y = this.y, z = this.z, w = this.w;
    var e = m.elements;

    this.x = e[ 0 ] * x + e[ 4 ] * y + e[ 8 ] * z + e[ 12 ] * w;
    this.y = e[ 1 ] * x + e[ 5 ] * y + e[ 9 ] * z + e[ 13 ] * w;
    this.z = e[ 2 ] * x + e[ 6 ] * y + e[ 10 ] * z + e[ 14 ] * w;
    this.w = e[ 3 ] * x + e[ 7 ] * y + e[ 11 ] * z + e[ 15 ] * w;

    return this;

  },

  divideScalar: function ( scalar ) {

    return this.multiplyScalar( 1 / scalar );

  },

  setAxisAngleFromQuaternion: function ( q ) {

    // http://www.euclideanspace.com/maths/geometry/rotations/conversions/quaternionToAngle/index.htm

    // q is assumed to be normalized

    this.w = 2 * Math.acos( q.w );

    var s = Math.sqrt( 1 - q.w * q.w );

    if ( s < 0.0001 ) {

      this.x = 1;
      this.y = 0;
      this.z = 0;

    } else {

      this.x = q.x / s;
      this.y = q.y / s;
      this.z = q.z / s;

    }

    return this;

  },

  min: function ( v ) {

    this.x = Math.min( this.x, v.x );
    this.y = Math.min( this.y, v.y );
    this.z = Math.min( this.z, v.z );
    this.w = Math.min( this.w, v.w );

    return this;

  },

  max: function ( v ) {

    this.x = Math.max( this.x, v.x );
    this.y = Math.max( this.y, v.y );
    this.z = Math.max( this.z, v.z );
    this.w = Math.max( this.w, v.w );

    return this;

  },

  clamp: function ( min, max ) {

    // This function assumes min < max, if this assumption isn't true it will not operate correctly

    this.x = Math.max( min.x, Math.min( max.x, this.x ) );
    this.y = Math.max( min.y, Math.min( max.y, this.y ) );
    this.z = Math.max( min.z, Math.min( max.z, this.z ) );
    this.w = Math.max( min.w, Math.min( max.w, this.w ) );

    return this;

  },

  clampScalar: function () {

    var min, max;

    return function clampScalar( minVal, maxVal ) {

      if ( min === undefined ) {

        min = new Vector4();
        max = new Vector4();

      }

      min.set( minVal, minVal, minVal, minVal );
      max.set( maxVal, maxVal, maxVal, maxVal );

      return this.clamp( min, max );

    };

  }(),

  floor: function () {

    this.x = Math.floor( this.x );
    this.y = Math.floor( this.y );
    this.z = Math.floor( this.z );
    this.w = Math.floor( this.w );

    return this;

  },

  ceil: function () {

    this.x = Math.ceil( this.x );
    this.y = Math.ceil( this.y );
    this.z = Math.ceil( this.z );
    this.w = Math.ceil( this.w );

    return this;

  },

  round: function () {

    this.x = Math.round( this.x );
    this.y = Math.round( this.y );
    this.z = Math.round( this.z );
    this.w = Math.round( this.w );

    return this;

  },

  roundToZero: function () {

    this.x = ( this.x < 0 ) ? Math.ceil( this.x ) : Math.floor( this.x );
    this.y = ( this.y < 0 ) ? Math.ceil( this.y ) : Math.floor( this.y );
    this.z = ( this.z < 0 ) ? Math.ceil( this.z ) : Math.floor( this.z );
    this.w = ( this.w < 0 ) ? Math.ceil( this.w ) : Math.floor( this.w );

    return this;

  },

  negate: function () {

    this.x = - this.x;
    this.y = - this.y;
    this.z = - this.z;
    this.w = - this.w;

    return this;

  },

  dot: function ( v ) {

    return this.x * v.x + this.y * v.y + this.z * v.z + this.w * v.w;

  },

  lengthSq: function () {

    return this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w;

  },

  length: function () {

    return Math.sqrt( this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w );

  },

  lengthManhattan: function () {

    return Math.abs( this.x ) + Math.abs( this.y ) + Math.abs( this.z ) + Math.abs( this.w );

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
    this.w += ( v.w - this.w ) * alpha;

    return this;

  },

  lerpVectors: function ( v1, v2, alpha ) {

    return this.subVectors( v2, v1 ).multiplyScalar( alpha ).add( v1 );

  },

  equals: function ( v ) {

    return ( ( v.x === this.x ) && ( v.y === this.y ) && ( v.z === this.z ) && ( v.w === this.w ) );

  },

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

function Plane (normal, d) {
  this.normal = normal;
  this.d = d;
  this.position = this.normal.clone().multiplyScalar(this.d);
  this.parent = null;
}

Plane.prototype = {
  intersect : function(ray) {
    var a = ray.direction.clone().dot(this.normal);
    if (a >= 0) return IntersectResult.noHit;

    var b = this.normal.clone().dot(ray.origin.clone().sub(this.position));
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
    this.right = new Vector3();
    this.right.crossVectors(this.front, this.uper);
    this.up = new Vector3();
    this.up.crossVectors(this.right, this.front);
    this.fovScale = Math.tan(this.fov * 0.5 * _Math.DTR) * 2;
  },
  getRay : function(x, y) {
    var r = this.right.clone().multiplyScalar((x - 0.5) * this.fovScale);
    var u = this.up.clone().multiplyScalar((y - 0.5) * this.fovScale);
    var d = this.front.clone().add(r).add(u).normalize();
    // console.log(d);
    return new Ray(this.eye.clone(), d);
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
      color = color.clone().multiplyScalar(1 - reflectiveness);

      if (reflectiveness > 0 && maxReflect > 0) {
        var r = result.normal.clone().multiplyScalar(-2 * result.normal.clone().dot(ray.direction)).add(ray.direction);
        ray = new Ray(result.position, r);
        var reflectedColor = this.rayTrace(scene, ray, maxReflect - 1);
        color = color.clone().add(reflectedColor.multiplyScalar(reflectiveness));
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
exports.Vector4 = Vector4;
exports.Matrix4 = Matrix4;
exports.Quaternion = Quaternion;
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
