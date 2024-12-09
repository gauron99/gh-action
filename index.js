const core = require('@actions/core');
const github = require('@actions/github');

try {
	// default values
	const default_version = "v1.16"
	const default_os = "func_linux_amd64"
	const default_url = `https://github.com/knative/func/releases/download/knative-${default_version}/${default_os}`

  // Fetch value of inputs specified in action.yml
  const nameToGreet = core.getInput('who-to-greet');
  const version = core.getInput('version');
  console.log(`> version is; ${version}`)
  
 	var url_default = `https://github.com/knative/func/releases/download/knative-${version}/func_linux_amd64`
	
 	// do this after: curl -SLO $program_url && mv func_linux_amd64 f && chmod +x f


  console.log(`Hey there ${nameToGreet}`);
  console.log(`I see you're using ${version} version, nice!`);

  // save time of greeting
  const time = (new Date().toTimeString());
  core.setOutput("time",time)

} catch (error) {
  core.setFailed(error.message)
}
