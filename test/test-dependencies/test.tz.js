module.exports = function configure(injector) {
  injector.register('noDeps', require('./no-deps'));
  injector.register('hasDeps', require('./has-deps'));
  injector.register('asyncDeps', require('./async-deps'));
};
