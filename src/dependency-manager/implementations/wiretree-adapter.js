// Anti-corruption layer to abstract DI library's API
// class conversion is not within scope

// eslint-disable-next-line
function WiretreeDependencyManager() {
  // Wiretree wrapper: Initialize the dependency tree
  const Wiretree = require('wiretree');
  this.tree = new Wiretree();
  this.verbose = false;
}

WiretreeDependencyManager.prototype.setVerbose = function(isVerbose) {
  this.verbose = isVerbose;
};

// Register the dependency and always defer its resolution
WiretreeDependencyManager.prototype.register = function(name, object) {
  // Wiretree wrapper
  if (this.verbose) {
    console.log(`[trapezo] registering ${name}`);
  }
  this.tree.add(name, { wiretree: object });
};

// Obtain a dependency by name
WiretreeDependencyManager.prototype.get = function(name) {
  // Wiretree wrapper
  let plugin = null;
  try {
    plugin = this.tree.get(name);
  } catch (exc) {
    console.log('[trapezo > wirtree adapter] Dependency not found: ' + name);
  }
  return plugin;
};

// Register the dependency and always defer its resolution
WiretreeDependencyManager.prototype.onResolve = function(callback) {
  // Wiretree wrapper
  this.tree.resolve(callback);
};

module.exports = WiretreeDependencyManager;
