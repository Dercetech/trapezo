module.exports = function diFactory(noDeps) {
  function herp() {
    return noDeps.derp() * 2;
  }

  return { herp };
};
