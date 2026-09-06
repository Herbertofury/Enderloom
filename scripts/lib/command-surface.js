'use strict';

// Match only the outer dispatch arms; nested state labels such as "running"
// are values, not domain operations.
function serviceCommands(source) {
  const dispatch = source.slice(source.indexOf('match command {'), source.indexOf('fn data_dir_from_args'));
  const arms = [...dispatch.matchAll(/^ {8}((?:"[a-z][a-z0-9_]*"\s*\|\s*)*"[a-z][a-z0-9_]*")\s*=>/gm)];
  return [...new Set(arms.flatMap((arm) => [...arm[1].matchAll(/"([a-z][a-z0-9_]*)"/g)].map((m) => m[1])))].sort();
}

function apiCommands(source) {
  return [...new Set([...source.matchAll(/call(?:<[^;()]*?>)?\(\s*["']([a-z][a-z0-9_]*)["']/g)].map((m) => m[1]))].sort();
}

module.exports = { serviceCommands, apiCommands };
