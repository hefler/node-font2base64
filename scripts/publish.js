const { execSync } = require('child_process');
const path = require('path');
const _ = require('lodash');
const fse = require('fs-extra');
const { argv } = require('yargs');

let { tag } = argv;
if (!tag) throw Error('tag not supplied');

if (tag.startsWith('v')) tag = tag.substring(1);
console.log(`target tag ${tag}`);

const VER_PLACEHOLDER = '0.0.0-PLACEHOLDER';
const PUBLISH_DIR = 'publish';

const parseJson = (dir) => {
  const content = fse.readFileSync(dir).toString('utf-8');
  return JSON.parse(content);
};

const writeJson = (dir, object) => {
  fse.writeFileSync(dir, Buffer.from(JSON.stringify(object, null, 2), 'utf-8'));
};

const getAbsPath = (filename) => {
  return path.resolve(__dirname, '../', filename);
};

execSync(`mkdir -p ${getAbsPath(PUBLISH_DIR)}`);
const currpj = parseJson(getAbsPath('package.json'));
if (currpj['version'] === VER_PLACEHOLDER) currpj['version'] = tag;

const newpj = _.pick(currpj, [
  'name',
  'version',
  'description',
  'keywords',
  'homepage',
  'bugs',
  'license',
  'author',
  'sideEffects',
  'repository',
  'dependencies',
  'peerDependencies',
  'publishConfig',
  'release',
]);

['index.js', 'helpers.js', 'LICENSE', 'README.md'].forEach((file) => {
  execSync(`cp ${getAbsPath(file)} ${getAbsPath(`${PUBLISH_DIR}/${file}`)}`);
});

writeJson(getAbsPath(`${PUBLISH_DIR}/package.json`), newpj);
execSync(`cd ${PUBLISH_DIR} && npm publish --access public`);
