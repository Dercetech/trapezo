const path = require('path');
const chai = require('chai');
// const assert = chai.assert;
// eslint-disable-next-line
const should = chai.should();

const { filesystem } = require('../src/utils');

describe('The utilities', () => {
  before(
    /* 'description', */ done => {
      done();
    }
  );

  // it('should properly find the root folder', done => {
  //   filesystem
  //     .lookForRoot(__dirname)
  //     .then(() => done())
  //     .catch(err => done(err));
  // });

  // it('should fail gracefuly when no trapezo.json file identifies the root folder', done => {
  //   filesystem
  //     .lookForRoot(path.join(__dirname, '..'))
  //     .then(() => done('root should not have been found'))
  //     .catch(err => done());
  // });
});
