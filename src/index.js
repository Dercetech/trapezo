// Anti-corruption layer to abstract DI library's API
function AntiCorruptionLayer(){
    
    // Wiretree wrapper: Initialize the dependency tree
    var Wiretree = require('wiretree');
    this.tree = new Wiretree();
}

// Register the dependency and always defer its resolution (vs. Nightshift's granularity in that regard)
AntiCorruptionLayer.prototype.register = function(name, object){
    
    // Wiretree wrapper
    this.tree.add(name, object, {"wiretree": object});
};

// Register the dependency and always defer its resolution (vs. Nightshift's granularity in that regard)
AntiCorruptionLayer.prototype.resolveAll = function(callback){
    
    // Wiretree wrapper
    this.tree.resolve(function () {
        callback();
    });
};

module.exports = {
    
    "resolve": function(config, aModule, callback){
     
        // A "glob" is the thing handed over to methods like "ls" in unix. Stars and stuff.
        var glob = require('glob');
        var path = require('path');
        
        // Considering the "main" executable is at the root (bad, I suppose)
        // var rootDir = path.dirname(require.main.filename);
        
        // Considering a module was provided
        var rootDir = path.dirname(aModule ? aModule.filename : module.filename);

        // Create abstract injector
        var injector = new AntiCorruptionLayer();
        
        // Obtain dependencies (paths to dep files)
        var depPaths = glob.sync('*/**/*.tz.js', {cwd: rootDir});
        
        
        for(var i=0; i < depPaths.length; i++){
            
            var path = depPaths[i];
            var dependencyConfig = aModule.require('./' + path);
            dependencyConfig(injector);
        }

        // Run callback method - likely to be the server startup routine
        injector.resolveAll(callback);
    }
}