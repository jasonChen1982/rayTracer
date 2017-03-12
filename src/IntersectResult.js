import { Vector3 } from './math/Vector3';

function IntersectResult() {
  this.geometry = null;
  this.distance = 0;
  this.position = new Vector3();
  this.normal = new Vector3();
}

IntersectResult.noHit = new IntersectResult();
