module.exports = function diFactory(wtDone, noDeps) {
  setTimeout(
    () =>
      wtDone({
        canIHaz: () => 'cheezburger'
      }),
    100
  );
};
