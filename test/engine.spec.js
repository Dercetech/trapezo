const chai = require('chai');
// const assert = chai.assert;
// eslint-disable-next-line
const should = chai.should();

const dependencyInjectionEngine = require('../src');

describe('The Dependency Injection engine', () => {
  before(
    /* 'description', */ done => {
      done();
    }
  );

  it('should list nested injector config files', done => {
    const files = dependencyInjectionEngine.listDependencies(__dirname);
    files.should.have.lengthOf.above(0);
    files.filter(fileName => fileName.indexOf('has-dep' !== -1)).should.have.lengthOf(1);
    done();
  });

  it('should resolve ', done => {
    dependencyInjectionEngine.resolve(module, function(hasDeps) {
      hasDeps.herp().should.equal(4);
      done();
    });
  });

  it('should resolve with verbose ', done => {
    dependencyInjectionEngine.provide(null, { verbose: true }).resolve(module, function(hasDeps) {
      hasDeps.herp().should.equal(4);
      done();
    });
  });

  it('should find project root');
  it('should fail gracefully');

  it('should handle async dependencies', done => {
    const t0 = new Date().getTime();
    dependencyInjectionEngine.resolve(module, function(asyncDeps) {
      const t1 = new Date().getTime();
      const delta = t1 - t0;
      delta.should.be.greaterThan(100);

      asyncDeps.canIHaz().should.equal('cheezburger');
      done();
    });
  });

  it('allows mocking existing dependencies', done => {
    const t0 = new Date().getTime();
    dependencyInjectionEngine
      .provide({
        asyncDeps: () => ({
          canIHaz: () => 'marmite' // it tastes awesome
        })
      })
      .resolve(module, function(asyncDeps) {
        const t1 = new Date().getTime();
        const delta = t1 - t0;
        delta.should.be.lessThan(10); // as actual dependency willfully takes 100ms to resolve

        asyncDeps.canIHaz().should.equal('marmite');
        done();
      });
  });

  it('allows mocking runtime dependencies', done => {
    dependencyInjectionEngine
      .provide({
        runtimeDependency: () => ({
          groundhogDay: () => 'Hello campers' // it tastes awesome
        })
      })
      .resolve(module, function(runtimeDependency) {
        runtimeDependency.groundhogDay().should.equal('Hello campers');
        done();
      });
  });
});
