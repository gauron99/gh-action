const core = require('@actions/core');
const github = require('@actions/github');
const exec = require('@actions/exec')

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

// -------------------------------------------------------------------------- \\
async function run(){
  try {
	  // default values
	  // const default_url = `https://github.com/knative/func/releases/download/knative-${default_version}/${default_os}`

    // Fetch value of inputs specified in action.yml
    let os = core.getInput('binary');
    let version = core.getInput('version');
  
    console.log(`${version}/${bin}`)
    if (bin == "" || bin == undefined){
      // if not user-defined, use GH Runner determination
      bin = getBinName()
      if (bin == "unknown"){
        core.setFailed("Invalid bin determination, got unknown")
      }
    }

    console.log(`${version}/${bin}`)
    version = smartVersionUpdate(version)

  	var url = `https://github.com/knative/func/releases/download/${version}/${bin}`;
    console.log(`FINAL URL IS :${url}`) 
	
    // construct command
    const cmd = `curl -LJO "${url}"`

    await exec.exec(cmd)
  
    //check if downloaded successfully
    binPath = path.Join(process.cwd(), )
    if (!FileSystem.existsSync(binPath,bin)){
      core.setFailed("Download failed, couldn't find the binary on disk")
    }

    //set to executable
    await exec.exec(`chmod +x ${bin}`)

    // do this after: curl -SLO $program_url && mv func_linux_amd64 f && chmod +x f
    const destination = core.getInput('destination')
    if (destination != undefined) {
      console.log(`Moving the binary to ${destination}`)
      await exec.exec(`mv ${bin} ${destination}`)
    }

    // save time of greeting
    const time = (new Date().toTimeString());
    core.setOutput("time",time)

  } catch (error) {
    core.setFailed(error.message)
  }
}

run();