const core = require('@actions/core');
const github = require('@actions/github');


const os_values = ['func_linux_amd64'];

function isVersionValid(version){
  const versRegEx = /^(v?\d+\.\d+)(\.d+)?$/;
  return versRegEx.test(version);
}

try {
	// default values
	// const default_url = `https://github.com/knative/func/releases/download/knative-${default_version}/${default_os}`

  // Fetch value of inputs specified in action.yml
  const os = core.getInput('os');
  const version = core.getInput('version');
  
  // validate
  if (!isVersionValid(version)){
    core.setFailed('Invalid version format. Expected format: "1.16" or "v1.16"');
    return;
  }
  if (!(isOsValid(os))){
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
