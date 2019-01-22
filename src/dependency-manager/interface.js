/**
 * Anti-corruption layer to abstract DI library's API
 */
function AntiCorruptionLayer() {
  this.tree = null; // Here comes an implementation of dependency management of your choice
}

// Register an object using the provided "name" for future reference
AntiCorruptionLayer.prototype.register = function(name, object) {
  return true;
};

// Using the "name" provided at register time, obtain the registered object (dependency)
AntiCorruptionLayer.prototype.get = function(name) {
  return true;
};

// Once the tree (see line 4) is done resolving the registered dependencies, run the given callback
AntiCorruptionLayer.prototype.onResolve = function(callback) {
  return true;
};

module.export = AntiCorruptionLayer;
