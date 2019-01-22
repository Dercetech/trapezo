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
const { filesystem, functionHelpers } = require('./utils');
const { lookForRoot } = filesystem;
const { getParameterNames, bindWithParams } = functionHelpers;

/**
 * @param {*} cwd the current working directory where .tz.js files will be looked for
 * @return {Array<string>} relative paths to .tz.js files
 */
const listDependencies = cwd => glob.sync('**/*.tz.js', { cwd, ignore: ['node_modules/**', '**/node_modules/**'] });

const resolve = (aModule, callback) => {
  // Look upwards from provided module for a dependency-injector.json config file (locates the project root)
  const thisPath = path.dirname(aModule ? aModule.filename : module.filename);

  lookForRoot(thisPath).then(({ rootDir, config }) => {
    // Verbose output
    if (config.verbose) {
      console.log(`[dependency injector] Resolution root: ${rootDir}`);
    }

    const injector = new DependencyManager();
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

module.exports = { listDependencies, resolve };
