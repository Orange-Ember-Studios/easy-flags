function readPackage(pkg, context) {
  // Allow sqlite3 to run build scripts
  if (pkg.name === 'sqlite3') {
    pkg.scripts = pkg.scripts || {};
    // Ensure install script runs
  }
  return pkg;
}

module.exports = {
  hooks: {
    readPackage,
  },
};
