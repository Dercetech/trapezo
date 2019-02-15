// Returns an array of parameter names
const getParameterNames = aFunction => {
  // Credits to http://stackoverflow.com/users/308686/bubersson
  return (
    aFunction
      .toString()
      .replace(/((\/\/.*$)|(\/\*[\s\S]*?\*\/)|(\s))/gm, '')
      // eslint-disable-next-line
      .match(/^function\s*[^\(]*\(\s*([^\)]*)\)/m)[1]
      .split(/,/)
  );
};

// Bind with parameters
const bindWithParams = (aFunction, params) => {
  const args = Array.prototype.slice.call(params);
  args.unshift(null); // insert a "null" at the beginning of the array - TODO: document why
  return Function.prototype.bind.apply(aFunction, args);
};

module.exports = { getParameterNames, bindWithParams };
