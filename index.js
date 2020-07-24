const core = require("@actions/core");
const github = require("@actions/github");
const exec = require("@actions/exec");

const lib_dir = core.getInput("lib_dir");
const architecture = core.getInput("architecture");

const project = core.getInput("project");

async function run() {
  try {
    console.log(await exec.exec("ls"));
    process.env.github_lib_dir = lib_dir;
    process.env.archTarget = architecture;

    // update compilier for pi and jetson
    if (
      architecture.toLowerCase().substring(0, 2) === "pi" ||
      architecture.toLowerCase() === "nvidia"
    ) {
      await exec.exec(`sudo`, [
        `apt-get`,
        `install`,
        `software-properties-common`,
      ]);
      await exec.exec(`sudo`, [`add-apt-repository`, `ppa:jonathonf/gcc-9.0`]);
      await exec.exec(`sudo`, [`apt-get`, `install`, `gcc-9`, `g++-9`]);
      await exec.exec(`sudo`, [
        `update-alternatives`,
        `--install`,
        `/usr/bin/gcc`,
        `gcc`,
        `/usr/bin/gcc-9`,
        `60`,
        `--slave`,
        `/usr/bin/g++`,
        `g++`,
        `/usr/bin/g++-9`,
      ]);
      // Get JavascriptCore
      if (architecture.toLowerCase().substring(0, 2) === "pi") {
        await exec.exec(`sudo`, [` apt-get`, `install`, `webkitgtk-4.0-dev`]);
      } else if (architecture.toLowerCase() === "nvidia") {
        await exec.exec(`sudo`, [
          `apt-get`,
          `install`,
          `libjavascriptcoregtk-4.0-dev`,
        ]);
      }
    }

    // For Gihub hosted runners update gcc and get libs
    if (architecture === "ubuntu-latest") {
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
        `libjavascriptcoregtk-4.0-dev`,
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

    core.setOutput("buildDirectory", "Build");
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
