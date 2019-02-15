/* ***************************************************** *\
|*     ___  _______  __________________________ __        *|
|*      / _ \/ __/ _ \/ ___/ __/_  __/ __/ ___/ // /      *|
|*     / // / _// , _/ /__/ _/  / / / _// /__/ _  /       *|
|*    /____/___/_/|_|\___/___/ /_/ /___/\___/_//_/        *|
|*                                                        *|
|*     Trapezo: NodeJS dependency injection framework     *|
|*      Dercetech 2016-19, created by Jérémie Mercier     *|
|*                                                        *|
\* ************ http://www.dercetech.com **************** */

const glob = require('glob');
const path = require('path');

const DependencyManager = require('./dependency-manager');
const { project, lang, functionHelpers } = require('./utils');
const { lookForRoot } = project;
const { getParameterNames, bindWithParams } = functionHelpers;

/**
 * @param {*} cwd the current working directory where .tz.js files will be looked for
 * @return {Array<string>} relative paths to .tz.js files
 */
const listDependencies = cwd => glob.sync('**/*.tz.js', { cwd, ignore: ['node_modules/**', '**/node_modules/**'] });

const provide = providers => {
  const injector = new DependencyManager();
  injector.setProviders(providers);
  return { resolve: (aModule, callback) => resolve(aModule, injector, callback) };
};

const resolve = (aModule, injectorOrCallback, callback) => {
  // Look upwards from provided module for a dependency-injector.json config file (locates the project root)
  const thisPath = path.dirname(aModule ? aModule.filename : module.filename);

  lookForRoot(thisPath).then(({ rootDir, config }) => {
    // Verbose output
    if (config.verbose) {
      console.log(`[dependency injector] Resolution root: ${rootDir}`);
    }

    let injector = null;

    // Ensure proper parameter combination
    // 1. An overloaded injector was provided
    if (callback) {
      if (!lang.isFunction(callback)) {
        throw new Error('[resolve] the 3rd parameter must be a function');
      }
      if (injectorOrCallback) {
        injector = injectorOrCallback;
      }
    }
    // 2. A default injector is to be created
    else {
      if (!lang.isFunction(injectorOrCallback)) {
        throw new Error('[resolve] when only 2 params are provided, the second must be a function');
      }
      callback = injectorOrCallback;
    }

    // Unless mocks are used (via a call to .provide), a dependency manager should be instanciated now.
    injector = injector ? injector : new DependencyManager();
    injector.setVerbose(config.verbose);

    // Obtain dependencies (paths to dep files)
    const depPaths = listDependencies(rootDir);

    if (config.verbose) {
      depPaths.forEach(relativePath => console.log(`[dependency injector] found ${relativePath}`));
    }

    depPaths
      .map(relativePath => path.join(rootDir, relativePath))
      .forEach(absolutePath => {
        const dependencyFactoryConfig = aModule.require(absolutePath);
        dependencyFactoryConfig(injector);
      });

    // Run callback method - likely to be the server startup routine
    injector.onResolve(() => {
      // Obtain dependency name via reflection
      const params = getParameterNames(callback);

      // Obtain dependencies
      const dependencies = params.filter(param => !!param && param !== '').map(param => injector.get(param));

      // Bind dependencies to callback function
      const boundCallback = bindWithParams(callback, dependencies);

      // Execute callback with injected dependencies
      boundCallback();
    });

    return injector;
  });
};

module.exports = { listDependencies, provide, resolve };
