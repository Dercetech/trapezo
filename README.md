# Trapezo: Node.js dependency injection 
_"Best use case: Who wants to register relative paths when writing those `require` statements? Or who likes breaking the require paths when moving a file? I don't - so I wrote Trapezo."_

**Trapezo** is the dependency injection framework written by [Jérémie Mercier (Jem)](https://www.linkedin.com/in/jeremiemercier/) and is based on [Wiretree](https://www.npmjs.com/package/wiretree). It goes a step further by adding seamless and flexible management of the dependencies - read more.
[Follow Jem's projects on twitter](https://twitter.com/dercetech).

## Working example / project stub
You may begin with downloading a full working project stub with token authentication, routes, solid folder structure, Mongoose, ES6, Mocha unit tests : See [Trapezo-Express](https://github.com/Dercetech/trapezo-express) server or the derived [authentication micro-service](https://github.com/Dercetech/auth-microservice).
## Start developping
Begin with `npm install trapezo --save`.
### Project structure
Let's create the following folder structure and describe each file in subsequent chapters. 
```
    /
    |_index.js
    |_package.json
    |_trapezo.json
    |_app
        |_app.tz.js
        |_main.js
        |_routes.js
        |_handlers
            |_404.js
    |_config
        |_config.js
        |_config.tz.js
        |_express.js
    |_ ...
    |_test
        |_test-with-di.js
```
#### Bootstrapping
It's **highly important** to place `trapezo.json` at the root of your project. It allows detecting the root folder of your app. Trapezo would otherwise fail to start:<br/>
`"No trapezo.json found - reached filesystem root."`

I came up with using a plain .json to prevent breaking Mocha and PM2 without using environment variables nor complicated regex heuristics. Pro&cons of alternate methods are discussed [here](http://stackoverflow.com/a/18721515/987818).

**Contents of trapezo.json**<br/>
`{  "root"  : true }`

Let's now start a trapezo-enabled project and write `index.js`:

    require('trapezo').resolve(module, function(config){
        console.log('server port: ' + config.server.port);
    });
Human friendlier: _"Trapezo, browse my files and resolves the dependencies. Then, run this callback"._

Note to **ES6 developpers** the callback cannot (yet) be replaced with an arrow function.

**Now, how's that "config" dependency obtained?** Read on.
### Registering dependencies
Those `.tz.js` files do the trick:
- `require("trapezo").resolve(...)` will browse the files and folders of your project (from the root, remember that `trapezo.json` file?)
- each `.tz.js` runs the local `require`statements and will map the factories to organic dependency names.

Take `./config/config.tz.js`:

    module.exports = function configure(injector) {
        injector.register('config', require('./config'));
        injector.register('configureExpress', require('./express'));
    };

Full working example of config.js and express.js are available in the project stub [Trapezo-Express](https://github.com/Dercetech/trapezo-express).

Let's create a mock config.js file to show how a plain object factory is written:

    module.exports = function configFactory(/*dependencies go here*/){

        let path    = require('path');
	    let address = process.env.IP || "127.0.0.1";
	    let port = process.env.PORT || 8086;
	
        return {
            "server" : {
    			"port"      : port,
    			"address"   : address	
    		}
        }
    }

Ah. Notice the comment saying "dependencies go here". We'll have an example right after the following .tz.js file that shows a factory **with** dependencies of its own. For now, we just created the dependency mapper (.tz.js) and its related factory. **Factories only run once** and that's when its own dependecies were resolved during the `.resolve(...)` phase.

Now you can move and rename the config subfolder as you please, the dependency will not break.

Let's now inspect `./app/app.tz`:

    module.exports = function configure(injector) {
        injector.register('main', require('./main'));
        injector.register('routes', require('./routes'));
        injector.register('notFoundHandler', require('./handlers/404'));
    };

Again, I won't clutter this readme with extensive description of routes and 404 handlers from the real life. The project stub [Trapezo-Express](https://github.com/Dercetech/trapezo-express) will help you in that regard.

Let's first modify our index.js to have a working example:

    require('trapezo').resolve(module, function(main){
        main.start().then( httpServer => {
	        console.log('API: ' + httpServer.address().address + ':' + httpServer.address().port);
        })
    });

Notice that we now ask for the dependency called "main" and expect it to expose a "start" method that returns a promise, passing in an http server (Express) as it resolves.

A quick look at `./app/main.js`

    module.exports = function mainFactory(config, routes){
    
        let express = require('express');
    	let app = express();
    	let httpServer;

        app.use('/api', routes);
    
        return {
            start: function(){
                return new Promise( (resolve, reject) => {
                    httpServer = app.listen(
                                    config.server.port,
                                    config.server.address,
                                    () => resolve(httpServer));
                })
            }
        }
    }

Human friendly:
- Expect the "config" and "routes" dependency from the injector before running the factory.
- tell the express app to map the router present in the "route" dependency (described later)
- A facade is then returned (to be registered by Trapezo) and only contains one method: "start".
- `Start()` returns a Promise; the Express httpServer is passed as it resolves.
- Remember index.js, it requires the "main" dependency and thus can call the "start" method we just described.

**The route dependency - see ./app/routes.js**

    module.exports = function apiRouteFactory(notFoundHandler){

        let express	= require('express');
        let router	= express.Router();

        // Debug route
        router.get('/', (req, res) => res.send('Hello, welcome to server API.') );
	    
	    /*
	        Your routes
	    */
	    
	    // 404 route
	    router.use(notFoundHandler);
	
        return router;
    }

**The notFoundHandler dependency - see ./app/handlers/404.js**

    module.exports = function apiRouteFactory(/*dependencies go here*/){
        function fourOhFourHandler(req, res, next) {
            res.status(404);
		    if (req.accepts('html')) return res.redirect('/404.html'); // Static page
            else if(req.accepts('json')) return res.send({ error: 'resource not found' });
    		else res.type('txt').send('Not found');
	    }
	    return fourOhFourHandler;
    }

### Now?
Now, you've seen how to register dependencies of various types as both objects and methods: handlers, middlewares, routers, plain key-value pairs and more.

Now, you may want to start developping. Again, have a look at the project stub [Trapezo-Express](https://github.com/Dercetech/trapezo-express) and how 50+ unit tests are written using Trapezo in a non-intrusive manner.

## Unit testing

I'm using Mocha and Chai (with chaiHttp) for both behavior driven, test-driven development, API testing and end-to-end testing. Again, have a look at the project stub [Trapezo-Express](https://github.com/Dercetech/trapezo-express) and how 50+ unit tests are written using Trapezo in a non-intrusive manner.

Here's only a wee example of how to use trapezo in your unit testing. See `./test/test-with-di.js`

    describe('Token revoke functionals', () => {
    
    	let trapezo	= require("trapezo");
    
    	before( done => done() );
    	after( done => done() );
    	
    	describe("Token revokation list", done => {
    		
    		it("is refreshed when a user authenticates", done => {
    			
    			// TODO write code that happens before DI resolution:
    			// Database connection, mock API, etc.
    			
    			trapezo.resolve(module, function(RevokeSchema, revokeList){
    			    
    			    // TODO write code that after before DI resolution
    			    // i.e. logic that mimics interaction with your app/services at runtime
    			
    				done(/*pass errors if any*/);
    			});
    		});
    	});
    });

## Appendix
### Asynchronous dependencies
Say you have an autoInit database dependency - one that only resolves after the database connection has been established.
Trapezo is built on Wirteree and that one library offers an awesome async resolution mechanism: `wtDone`. Again, back to our [Trapezo-Express](https://github.com/Dercetech/trapezo-express) project stub, we open the following file: `./app/database/db-service-auto-connect.js`

    module.exports = function dbServiceFactory(wtDone, dbService){
        dbService.connect().then( () => wtDone(dbService) ).catch(err => { console.log(err) });
    }

The database service offers a "connect" method which returns a Promise. As it resolves, you can rely on a valid Mongoose/Mongo connection.

## History
- **version 1.1.0** : add requirement of a "trapezo.json" file to locate root, unit testing and minor fixes.
- **prior to 1.1.0** : initial version. Based on community feedback, used in at least 6 projects between 2016 and 2017. Thanks for using Trapezo!
