const core = require('@actions/core');
const github = require('@actions/github');
const exec = require('@actions/exec')
const path = require('path')
const fs = require('fs');
const { pathToFileURL } = require('url');

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

// construct the cmd to download the func binary, run it, set as executable
async function cmdConstrunctAndRun(url,bin){
  // construct command
  const cmd = `curl -LJO "${url}"`;
  // execute
  await exec.exec(cmd);
 
  //check if downloaded successfully
  binPath = path.join(process.cwd(), bin);
  if (!fs.existsSync(binPath)){
    core.setFailed("Download failed, couldn't find the binary on disk");
  }

  // set to executable
  await exec.exec(`chmod +x ${bin}`);
}

/**
 * Move func binary to desired destination (if any) and return the full path
 * of said binary. If not moved, return its full path at the current location.
 * 
 * @param {string} bin - Name of the binary
 * @returns {string} - Full path of the final binary
 */
async function moveToDestination(bin){
  const destination = core.getInput('destination');
  console.log(`moveToDest: ${destination}`);
  if (destination != undefined && destination != "") {
    console.log(`Moving the binary to ${destination}`);
    await exec.exec(`mv ${bin} ${destination}`);
  
    if (fs.statSync(destination).isDirectory()) {
      return path.join(destination,bin);
    }
    return destination;
  }
  return path.join(path.resolve('.'),bin);
}

/**
 * add func binary to PATH (binPath includes the full path of the binary)
 * @param {string} binPath 
 *  */ 
function addBinToPath(binPath){
  if(!process.env.PATH.includes(binPath)){
    process.env.PATH= `${binPath}${path.delimiter}${process.env.PATH}`;
    core.info(`${binPath} added to $PATH`);
  }
}

// -------------------------------------------------------------------------- \\
async function run(){
  try {

    // Fetch value of inputs specified in action.yml
    let bin = core.getInput('binary');
    let version = core.getInput('version');
  
    // if not user-defined, use GH Runner determination
    if (bin == "" || bin == undefined){
      bin = getBinName()
      if (bin == "unknown"){
        core.setFailed("Invalid bin determination, got unknown")
      }
    }

    version = smartVersionUpdate(version)

  	var url = `https://github.com/knative/func/releases/download/${version}/${bin}`;
    console.log(`URL: ${url}`);
	
    // construct, run and set as executable from now on
    cmdConstrunctAndRun(url,bin);
   
    // move to destination if aplicable
    fullPathBin = moveToDestination(bin);

    // add final binary to PATH specifically
    addBinToPath(fullPathBin);

    bin = path.basename(fullPathBin);

    // run 'func version'
    exec.exec(`${bin} version`);

  } catch (error) {
    core.setFailed(error.message);
  }
}

run();