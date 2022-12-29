function normalizeDeviceName(name) {
  return name.replace(/ /g, '_');
}

module.exports = {
  normalizeDeviceName
}