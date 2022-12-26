import { readFile, writeFile, stat as _stat, readdir, statSync, readdirSync } from 'fs';
import { join, extname } from 'path';

const isString = (value) => typeof value === 'string';

const isFunction = (value) => typeof value === 'function';

const isPlainObject = (obj) => Object.prototype.toString.call(obj) === '[object Object]';

const isArray = Array.isArray;

const isNil = (value) => value === undefined || value === null;

const castArray = (value) => {
  if (isNil(value)) return [];
  return isArray(value) ? value : [value];
};

const each = (value, fn, startOffset = 0, endOffset = 0) => {
  for (let x = startOffset; x < value.length - endOffset; x++) {
    if (fn(value[x], x, value) === false) break;
  }
};

const eachArray = (array, fn, startOffset = 0, endOffset = 0) => {
  array = castArray(array);

  for (let x = startOffset; x < array.length - endOffset; x++) {
    if (fn(array[x], x, array) === false) break;
  }
};

const eachAsync = async (array, fn, startOffset = 0, endOffset = 0) => {
  for (let x = startOffset; x < array.length - endOffset; x++) {
    const ret = await fn(array[x], x, array);
    if (ret === false) break;
  }
};

const promiseMap = (array, asyncFn) => {
  array = castArray(array);

  const promises = [];
  for (let i = 0; i < array.length; ++i) {
    promises.push(asyncFn(array[i]));
  }
  return Promise.all(promises);
};

const promisify =
  (fn) =>
  (...args) =>
    new Promise((resolve, reject) => {
      fn(...args, (err, data) => {
        if (err) return reject(err);
        return resolve(data);
      });
    });

const readFileAsync = promisify(readFile);

const writeFileAsync = promisify(writeFile);

const statAsync = promisify(_stat);

const readdirAsync = promisify(readdir);

const readAllFilesAsync = async (fileOrPath, allowedExts) => {
  const files = [];
  await promiseMap(fileOrPath, async (fp) => {
    try {
      const stat = await statAsync(fp);
      if (stat.isDirectory()) {
        const subs = await readdirAsync(fp);
        const subPaths = subs.map((s) => join(fp, s));
        const subFiles = await readAllFilesAsync(subPaths, allowedExts);
        files.push(...subFiles);
      } else {
        if (allowedExts && allowedExts.includes(extname(fp))) files.push(fp);
      }
    } catch (e) {} // thing not exists
  });

  return files;
};

const readAllFilesSync = (fileOrPath, allowedExts) => {
  const files = [];
  eachArray(fileOrPath, (fp) => {
    try {
      const stat = statSync(fp);
      if (stat.isDirectory()) {
        const subs = readdirSync(fp);
        const subPaths = subs.map((s) => join(fp, s));
        const subFiles = readAllFilesSync(subPaths, allowedExts);
        files.push(...subFiles);
      } else {
        if (allowedExts && allowedExts.includes(extname(fp))) files.push(fp);
      }
    } catch (e) {} // thing not exists
  });

  return files;
};

export {
  isString,
  isFunction,
  isNil,
  isPlainObject,
  isArray,
  castArray,
  each,
  eachArray,
  eachAsync,
  promiseMap,
  readFileAsync,
  writeFileAsync,
  statAsync,
  readAllFilesAsync,
  readAllFilesSync,
};
