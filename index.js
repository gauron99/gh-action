const core = require('@actions/core');
const exec = require('@actions/exec')
const path = require('path')
const fs = require('fs');


// change this accordingly
const DEFAULT_FUNC_VERSION = 'knative-v1.16.1'

// detect os system in Github Actions and determine binary name
function getBinName() {
  const runnerOS = process.env.RUNNER_OS;
  const runnerArch = process.env.RUNNER_ARCH;

  if (runnerOS === 'Linux') {
    switch (runnerArch) {
      case 'X64': return 'func_linux_amd64';
      case 'ARM64': return 'func_linux_arm64';
      case 'PPC64LE': return 'func_linux_ppc64le';
      case 'S390X': return 'func_linux_s390x';
      default: return 'unknown';
    }
  } else if (runnerOS === 'macOS') {
    return runnerArch === 'X64' ? 'func_darwin_amd64' : 'func_darwin_arm64';
  } else if (runnerOS === 'Windows') {
    return 'func_windows_amd64';
  } else {
    return 'unknown';
  }
}

// smartVersionParse will check validity of given version and fill in the parts
// to make it correct if possible.
// Ex.: '1.16' or 'v1.16' will return 'v1.16.0'
function smartVersionUpdate(version){
  versionRegex = /^(?<knprefix>knative-)?(?<prefix>v?)(?<major>\d+)\.(?<minor>\d+)(.(?<patch>\d+))?$/;
  let match = version.match(versionRegex);
  if (match){
    if (match.groups.knprefix == undefined){
      match.groups.knprefix = "";
    }
    const prefix = 'v';
    if (match.groups.patch == undefined) {
      match.groups.patch = 0;
    }
    return `${match.groups.knprefix}${prefix}${match.groups.major}.${match.groups.minor}.${match.groups.patch}`;
  } 

  core.setFailed(`Invalid version format (${version}). Expected format: "1.16[.X]" or "v1.16[.X]"`);
  return undefined;
}

/**
 * @param {string} url - Full url to be curled
 * @param {string} binPath - Full target path of the binary
 */
// download func, set as executable
async function cmdConstructAndRun(url,binPath){
  const cmd = `curl -L -o "${binPath}" "${url}"`;
  await exec.exec(cmd);
 
  //check if downloaded successfully
  if (!fs.existsSync(binPath)){
    core.setFailed("Download failed, couldn't find the binary on disk");
  }

  await exec.exec(`chmod +x ${fullPathBin}`);
}

/**
 * @param {string} binPath 
 *  */ 
async function addBinToPath(binPath){
    // Add the directory to PATH
    // This will write to $GITHUB_PATH, making it available for subsequent steps
    fs.appendFileSync(process.env.GITHUB_PATH, `\n${binPath}`);
    process.env.PATH = process.env.PATH + path.delimiter + binPath;
    core.info(`${binPath} added to $PATH`);
}

// -------------------------------------------------------------------------- \\
async function run(){
  try {

    // Fetch value of inputs specified in action.yml or use defaults

    // osBin refers to the exact name match of an existing binary available to
    // download
    const osBin = core.getInput('binary') || getBinName();
    if (osBin == "unknown"){
      core.setFailed("Invalid bin determination, got unknown");
    }
    // version to be downloaded
    let version = core.getInput('version') || DEFAULT_FUNC_VERSION
    // destination is a directory where to download the Func
    const destination = core.getInput('destination') || process.cwd();
    // bin refers to the name of the binary (Func) that will be downloaded (this
    // is what it will be called)
    const bin = core.getInput('name') || 'func';

    version = smartVersionUpdate(version);

  	var url = `https://github.com/knative/func/releases/download/${version}/${osBin}`;
    console.log(`URL: ${url}`);
	
    fullPathBin = path.resolve(destination,bin);

    // download Func
    await cmdConstructAndRun(url,fullPathBin);


    // add final binary to PATH specifically
    await addBinToPath(fullPathBin);
    
    // run 'func version'
    await exec.exec(`${fullPathBin} version`);

  } catch (error) {
    core.setFailed(error.message);
  }
}

run();