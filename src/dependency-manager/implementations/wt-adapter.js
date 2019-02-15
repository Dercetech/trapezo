// Anti-corruption layer to abstract DI library's API

// class conversion is not within scope
// eslint-disable-next-line
function DependencyManager() {
  const Wiretree = require('wiretree');
  this.tree = new Wiretree();
  this.verbose = false;
  this.providers = null;
}

DependencyManager.prototype.setVerbose = function(isVerbose) {
  this.verbose = isVerbose;
};

// Programmatic injection of factories (useful for mock/tests)
DependencyManager.prototype.setProviders = function(providers) {
  this.providers = providers;
  const self = this;
  Object.keys(this.providers)
    .map(key => ({ key, factory: this.providers[key] }))
    .forEach(({ key, factory }) => {
      self.tree.add(key, { wiretree: factory });
    });
};

// Register the dependency and always defer its resolution
DependencyManager.prototype.register = function(name, object) {
  // Case1: Dependency was provided/mocked already
  if (this.providers && this.providers.hasOwnProperty(name)) {
    if (this.verbose) {
      console.log(`[trapezo] skipping dependency ${name} as it was provided beforehand`);
    }
  }
  // Case2: Dependency must be registered
  else {
    if (this.verbose) {
      console.log(`[trapezo] registering ${name}`);
    }
    this.tree.add(name, { wiretree: object });
  }
};

// Obtain a dependency by name
DependencyManager.prototype.get = function(name) {
  let plugin = null;
  try {
    plugin = this.tree.get(name);
  } catch (exc) {
    console.log('[trapezo > tree adapter] Dependency not found: ' + name);
  }
  return plugin;
};

// Register the dependency and always defer its resolution
DependencyManager.prototype.onResolve = function(callback) {
  this.tree.resolve(callback);
};

module.exports = DependencyManager;
