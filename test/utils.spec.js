// const path = require('path');
const chai = require('chai');
// const assert = chai.assert;
// eslint-disable-next-line
const should = chai.should();

const { lang, project } = require('../src/utils');

describe('The utilities', () => {
  before(
    /* 'description', */ done => {
      done();
    }
  );

  it('should cover lang utils', () => {
    lang.isArray(['#kovfefe']).should.be.true;
    lang.isObject({ garfield: () => 'itMsutBeTrue' }).should.be.true;
    lang.isFunction(function() {
      return 42;
    }).should.be.true;
    lang.isFunction(() => 2 * 21).should.be.true;
    lang.isString(`see if I don't`).should.be.true;
    // eslint-disable-next-line
    lang.isString(new String('')).should.be.true;
  });

  it('should properly find the root folder', done => {
    project
      .lookForRoot(__dirname)
      .then(() => done())
      .catch(err => done(err));
  });

  // it('should fail gracefuly when no trapezo.json file identifies the root folder', done => {
  //   filesystem
  //     .lookForRoot(path.join(__dirname, '..'))
  //     .then(() => done('root should not have been found'))
  //     .catch(err => done());
  // });
});
