describe('JC', function () {
  it('exists JC as an object', function () {
    expect(JC).to.be.an('object');
  });
  it('exists JC._Math as an object', function () {
    expect(JC._Math).to.be.an('object');
  });
  it('exists JC.Color as an Function', function () {
    expect(JC.Color).to.be.an('Function');
  });
  it('exists JC.Ray as an Function', function () {
    expect(JC.Ray).to.be.an('Function');
  });
  it('exists JC.Vector3 as an Function', function () {
    expect(JC.Vector3).to.be.an('Function');
  });
  it('exists JC.Sphere as an Function', function () {
    expect(JC.Sphere).to.be.an('Function');
  });
  it('exists JC.Plane as an Function', function () {
    expect(JC.Plane).to.be.an('Function');
  });
  it('exists JC.PhongMaterial as an Function', function () {
    expect(JC.PhongMaterial).to.be.an('Function');
  });
  it('exists JC.CheckerMaterial as an Function', function () {
    expect(JC.CheckerMaterial).to.be.an('Function');
  });
  it('exists JC.Camera as an Function', function () {
    expect(JC.Camera).to.be.an('Function');
  });
  it('exists JC.Scene as an Function', function () {
    expect(JC.Scene).to.be.an('Function');
  });
  it('exists JC.Renderer as an Function', function () {
    expect(JC.Renderer).to.be.an('Function');
  });
});
