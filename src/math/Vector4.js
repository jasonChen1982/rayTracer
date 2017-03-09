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


export { Vector4 };
