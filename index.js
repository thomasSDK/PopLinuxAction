const core = require("@actions/core");
const github = require("@actions/github");
const exec = require("@actions/exec");

const machine = core.getInput("machine").toLowerCase();
const architecture = core.getInput("architecture");

const project = core.getInput("project")

async function run() {
  try {
    console.log(await exec.exec("ls"));
    process.env.archTarget = architecture;

    if(machine.substring(0,2) === 'pi'){
      process.env.compiler = '/opt/gcc-10.1.0/bin/arm-linux-gnueabihf-g++-10.1';
    }

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

  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
