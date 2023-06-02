// Usage: node scripts/increment-version.js
// Increment the version number in package.json.
// If no newVersion specified, increment the patch version by default.
const fs = require('fs');
const path = require('path');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

const PACKAGE_JSON = path.join(__dirname, '../package.json');

async function getVersion(pkg) {
  return pkg.version;
}

function incrementVersion(version, newVersion = {}) {
    const [major, minor, patch] = version.split('.');
    newVersion.major = (newVersion.major || parseInt(major));
    newVersion.minor = (newVersion.minor || parseInt(minor));
    newVersion.patch = (newVersion.patch || (parseInt(patch) + 1));
    return `${newVersion.major}.${newVersion.minor}.${newVersion.patch}`;
}

async function setVersion(pkg, newVersion) {
    console.log("PREV:", pkg.version);
    console.log("NEXT:", newVersion);
    pkg.version = newVersion;
    await fs.promises.writeFile(PACKAGE_JSON, JSON.stringify(pkg, null, 2) + "\n");
    await exec('npm install');
}


async function __main__() {
  const pkg = JSON.parse(await fs.promises.readFile(PACKAGE_JSON, 'utf8'));
  const version = await getVersion(pkg);
  const newVersion = incrementVersion(version);
  await setVersion(pkg, newVersion);
}

__main__();
