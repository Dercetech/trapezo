// Anti-corruption layer to abstract DI library's API
function AntiCorruptionLayer(){
    
    // Wiretree wrapper: Initialize the dependency tree
    var Wiretree = require('wiretree');
    this.tree = new Wiretree();
}

// Register the dependency and always defer its resolution (vs. Nightshift's granularity in that regard)
AntiCorruptionLayer.prototype.register = function(name, object){
    
    // Wiretree wrapper
    this.tree.add(name, {wiretree: object});
};

// Obtain a dependency by name
AntiCorruptionLayer.prototype.get = function(name){
    
    // Wiretree wrapper
    var plugin = null;
    try{
        plugin = this.tree.get(name);
    }
    catch(exc){
        console.log('Dependency not found: ' + name);
    }
    finally{
        return plugin;
    }
};

// Register the dependency and always defer its resolution (vs. Nightshift's granularity in that regard)
AntiCorruptionLayer.prototype.onResolve = function(callback){
    
    // Wiretree wrapper
    this.tree.resolve(callback);
};

module.exports = {
    
    "resolve": function(aModule, callback){
     
        // A "glob" is the thing handed over to methods like "ls" in unix. Stars and stuff.
        var glob = require('glob');
        var path = require('path');
        var utils = require('jem-utils');
        
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
        injector.onResolve(function(){
            
            // Obtain dependency name via reflection
            var params = utils.fn.getParameterNames(callback);
            
            // Obtain dependencies
            var dependencies = [];
            for(var i = 0; i < params.length; i++){
                dependencies.push(injector.get(params[i]));
            }
            
            // Bind dependencies to callback function
            var boundCallback = utils.fn.bindWithParams(callback, dependencies);
            
            // Execute callback with injected dependencies
            boundCallback();
        });
        
        return injector;
    }
}