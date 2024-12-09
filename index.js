const core = require('@actions/core');
const github = require('@actions/github');


const os_values = ['func_linux_amd64'];

// smartVersionParse will check validity of given version and fill in the parts
// to make it correct if possible.
// Ex.: '1.16' or 'v1.16' will return 'v1.16.0'
function smartVersionParse(version){
  var versionRegex = /^(v?\d+\.\d+)(\.d+)?$/;
  if (!versionRegex.test(version)){
    core.setFailed('Invalid version format. Expected format: "1.16[.X]" or "v1.16[.X]"');
    return;
  }
  versionRegex = /^(v?)(?<major>\d+)\.(?<minor>\d+)$/;
  if (version.match(versionRegex)) {
    const prefix = 'v';
    return `${prefix}${match.groups.major}.${match.groups.minor}.0`;
  } else {
    return version;
  }
}

// smartOsParser will check validity of the given os and try to match its
// actuall binary name. Ex.: giving 'linux' might rewrite to 'func_linux_amd64'
function smartOsParse(os){
  //TODO: change this to match this functions description
  return os_values.includes(os)
}

try {
	// default values
	// const default_url = `https://github.com/knative/func/releases/download/knative-${default_version}/${default_os}`

  // Fetch value of inputs specified in action.yml
  const os = core.getInput('os');
  const version = core.getInput('version');
  
  version = smartVersionParse(version)
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
