/* ***************************************************** *\
|*	   ___  _______  __________________________ __		  *|
|*		  / _ \/ __/ _ \/ ___/ __/_  __/ __/ ___/ // /	  *|
|*		 / // / _// , _/ /__/ _/  / / / _// /__/ _  / 	  *|
|*		/____/___/_/|_|\___/___/ /_/ /___/\___/_//_/  	  *|
|*												  		  *|
|*     Trapezo: NodeJS dependency injection framework 	  *|
|*       Dercetech 2016, coded by Jérémie Mercier         *|
|*														  *|
\* ************ http://www.dercetech.com **************** */

// A "glob" is the thing handed over to methods like "ls" in unix. Stars and stuff.
var glob = require('glob');
var utils = require('jem-utils');
var fs = require('fs');
var path = require('path');
var os = require("os");
var filesystemRoot = (os.platform() === "win32") ? process.cwd().split(path.sep)[0] + path.sep : "/"

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

function lookForRoot(aPath, callback){

    var fullPath = path.join(aPath, 'trapezo.json');

    function lookInParentFolder(){

        if(aPath === filesystemRoot){
            throw "No trapezo.json found - reached filesystem root.";
        }
        else{
            aPath = path.join(aPath, '..');
            lookForRoot(aPath, callback);
        }
    }

    try {
        // For a reason that escapes me, fs.stat (async method) fails in Mocha.
        var stats = fs.statSync(fullPath);
        if(stats.isFile()){
            try{
                var data = fs.readFileSync(fullPath, 'utf8');
                obj = JSON.parse(data);
                if(obj.hasOwnProperty('root')){
                    // Found the root config file!
                    if(obj.root){
                        callback(null, aPath);
                    }
                    else{
                        lookInParentFolder();
                    }
                }
            }
            catch(err){
                throw err;
            }
        }
        else{
            lookInParentFolder();
        }
    }
    catch(err) {
        if(err.code === 'ENOENT'){
            lookInParentFolder();
        }

        // Other error, throw
        else{
            callback(err, null);
        }
    }
}

function resolve(aModule, callback){

    // Considering the "main" executable is at the root (bad, I suppose won't work with Mocha)
    // var rootDir = path.dirname(aModule ? aModule.filename : module.filename); // indeed, breaks Mocha tests

    // Look upwards from provided module for a trapezo.json config file (locates the project root)
    var thisPath = path.dirname(aModule ? aModule.filename : module.filename);

    lookForRoot(thisPath, function(err, rootPath){
        if(err) throw err;
        else{
            //console.log('Trapezo root: ' + rootPath)
            onRootLocated(rootPath);
        }
    });

    function onRootLocated(rootDir){

        // Create abstract injector
        var injector = new AntiCorruptionLayer();

        // Obtain dependencies (paths to dep files)
        var depPaths = glob.sync('**/*.tz.js', {cwd: rootDir});

        for(var i=0; i < depPaths.length; i++){

            var aPath = depPaths[i];
            var absolutePath = path.join(rootDir, aPath);
            var dependencyConfig = aModule.require(absolutePath);
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

module.exports = {
    "resolve"   : resolve
}