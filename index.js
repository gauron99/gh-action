const core = require('@actions/core');
const github = require('@actions/github');

try {
  // Fetch value of inputs specified in action.yml
  const nameToGreet = core.getInput('who-to-greet');
  const version = core.getInput('version');

  console.log("Hey there ${nameToGreet}");
  console.log("I see you're using ${version} version, nice!");

  // save time of greeting
  const time = (new Date().toTimeString());
  core.setOutput("time",time)

} catch (error) {
  core.setFailed(error.message)
}