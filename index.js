const core = require("@actions/core");
const github = require("@actions/github");
const exec = require("@actions/exec");
const artifact = require("@actions/artifact");

const architecture = core.getInput("architecture");

const artifactClient = artifact.create();
const artifactName = `linux-${architecture}`;
// Get rid of 'NewChromantics/'
const project = core.getInput("project")

async function run() {
  try {
    console.log(await exec.exec("ls"));
    process.env.archTarget = architecture;

    // For Gihub hosted runners need to update gcc and get libx264
    if (architecture === "x86_64") {
      await exec.exec("sudo", [
        `add-apt-repository`,
        `-y`,
        `ppa:ubuntu-toolchain-r/test`,
      ]);
      await exec.exec("sudo", [`apt-get`, `update`]);
      await exec.exec("sudo", [
        `apt-get`,
        `install`,
        `libx264-dev`,
        `gcc-10`,
        `g++-10`,
        `-y`,
      ]);
      await exec.exec("sudo", [
        `update-alternatives`,
        `--install`,
        `/usr/bin/gcc`,
        `gcc`,
        `/usr/bin/gcc-10`,
        `10`,
      ]);
      await exec.exec("sudo", [
        `update-alternatives`,
        `--install`,
        `/usr/bin/g++`,
        `g++`,
        `/usr/bin/g++-10`,
        `10`,
      ]);
    }

    await exec.exec("make", [`exec`, `-C`, `${project}.Linux/`]);

    // These can be parameters passed in at a later state
    const files = [
      `build/Linux_${architecture}/lib${project}.so`,
      `build/Linux_${architecture}/${project}TestApp`,
      `build/Linux_${architecture}/${project}.h`,
    ];

    const rootDirectory = ".";

    const options = {
      continueOnError: true,
    };
    const uploadResponse = await artifactClient.uploadArtifact(
      artifactName,
      files,
      rootDirectory,
      options
    );
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
