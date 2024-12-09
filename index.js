const core = require('@actions/core');
const github = require('@actions/github');


const os_values = ['func_linux_amd64'];


// detect os system in Github Actions
function getOsInfo() {
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
  var versionRegex = /^(v?\d+\.\d+)(\.d+)?$/;
  if (!versionRegex.test(version)){
    core.setFailed('Invalid version format. Expected format: "1.16[.X]" or "v1.16[.X]"');
    return;
  }
  versionRegex = /^(v?)(?<major>\d+)\.(?<minor>\d+)(.(?<patch>\d+))?$/;
  let match = version.match(versionRegex)
  if (match){
    const prefix = 'v';
    if (match.groups.patch == undefined) {
      match.groups.patch = 0
    }
    return `${prefix}${match.groups.major}.${match.groups.minor}.${match.groups.patch}`;
  } else {
    return version;
  }
}

// -------------------------------------------------------------------------- \\
try {
	// default values
	// const default_url = `https://github.com/knative/func/releases/download/knative-${default_version}/${default_os}`

  // Fetch value of inputs specified in action.yml
  let os = core.getInput('os');
  let version = core.getInput('version');
  
  if (os == "" || os == undefined){
    // if not user-defined, use GH Runner determination
    os = getOsInfo()
    if (os == "unknown"){
      core.setFailed("Invalid os determination, got unknown")
    }
  }

  version = smartVersionUpdate(version)
  // os = smartOsParse(os) // TODO: this function needs to be updated first

  if (!(smartOsParse(os))){
    core.setFailed(`Invalid OS format. Expected values are: ${os_values}`);
    return;
  }

 	var url = `https://github.com/knative/func/releases/download/knative-${version}/${os}`;
  console.log(`FINAL URL IS :${url}`) 
	
 	// do this after: curl -SLO $program_url && mv func_linux_amd64 f && chmod +x f

  // save time of greeting
  const time = (new Date().toTimeString());
  core.setOutput("time",time)

} catch (error) {
  core.setFailed(error.message)
}
