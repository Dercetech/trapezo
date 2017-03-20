# trapezo
Trapezo is a NodeJS dependency injection framework that will scan your workspace of *.tz.js files to automatically build a Wiretree-based dependency injector.

I named it "Trapezo" after the word "trapezohedral" - a shape with lots of angles. I'm an AngularJS guy and wanted to write factories/modules/DI in the same way Angular handles it.

Update in v1.1: Added a root locator script. This intends you to add a "trapezo.json" at the root of your project (next to package.json) and have it contain the following:
```
{
	"root"	: true
}
```

## Example
Say your app is built following Jem's "MEAN-mint" skeleton (https://github.com/Dercetech/mean-mint):
```
    /
    |_index.js  
    |_config.js
    |_ app/              
        |_middlewares
            |_authentication.js
            |_CORS.js
            |_middlewares.tz.js
        |_models
            |_user
                |_user.js
                |_user.tz.js
        |_tools
        |_routes
    |_ setup/              
        |_ config.js
        |_ express.di.js     
```

The .tz.js file provides the injector with a config routine for one or multiple dependencies:

```javascript

// models.tz.js
module.exports = function configure(injector) {
    injector.register('modelsUser', require('./user'));
};

// middlewares.tz.js
module.exports = function configure(injector) {
    injector.register('middlewareAuth', require('./user'));
};
```

Now you'll only write "require" in the main .js file and in the .tz.js files. It keeps the paths simple and expects the NodeJS programmer to only have to specify dependencies in the AngularJS fashion using the factories, take for example the "authentication" middleware:

```javascript
module.exports = function(modelsUser) {

    // Requires
    // private stuff

    // The actual thing you're used to set "module.exports" to
    return function(req, res, next){
    
        // ...
    };
}
```