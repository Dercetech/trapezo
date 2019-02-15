const isObject = aVariable => {
  return typeof aVariable === 'object' && aVariable !== null;
};

const isArray = aVariable => {
  return aVariable.constructor === Array;
};

const isString = aVariable => {
  return typeof aVariable === 'string' || aVariable instanceof String;
};

const isFunction = functionToCheck => {
  return functionToCheck && {}.toString.call(functionToCheck) === '[object Function]';
};

module.exports = { isObject, isArray, isString, isFunction };
