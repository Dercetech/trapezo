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

  it('should find project root');
  it('should fail gracefully');
  it('should handle async dependencies');
  it('should ignore node_modules');
  it('allows mocking dependencies');
});
