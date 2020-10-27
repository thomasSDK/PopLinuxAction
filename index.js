const core = require("@actions/core");
const github = require("@actions/github");
const exec = require("@actions/exec");

const lib_dir = core.getInput("lib_dir");
const os = core.getInput("os");
const flag = core.getInput("flag");

const project = core.getInput("project");

async function run() {
  try {
    console.log(await exec.exec("ls"));
    process.env.github_lib_dir = lib_dir;
    process.env.osTarget = os;
    process.env.flag = flag;

    // tsdk: set the correct compilier for the pi https://solarianprogrammer.com/2017/12/08/raspberry-pi-raspbian-install-gcc-compile-cpp-17-programs/
    // can this be set of the runner directly?
    if (os.toLowerCase().substring(0, 2) === "pi") {
      process.env.compiler = "/opt/gcc-10.1.0/bin/g++-10.1"
    }

    // tsdk: need to set up a sudoer with no password to run these commands disabled for now
    // update compilier and libs for pi and jetson
    // if (
    //   os.toLowerCase().substring(0, 2) === "pi" ||
    //   os.toLowerCase() === "nvidia"
    // ) {
    //   await exec.exec(`sudo`, [
    //     `apt-get`,
    //     `install`,
    //     `libx264-dev`,
    //     `software-properties-common`,
    //     `-y`
    //   ]);
    //   await exec.exec(`sudo`, [`add-apt-repository`, `ppa:jonathonf/gcc-9.0`]);
    //   await exec.exec(`sudo`, [`apt-get`, `install`, `gcc-9`, `g++-9`]);
    //   await exec.exec(`sudo`, [
    //     `update-alternatives`,
    //     `--install`,
    //     `/usr/bin/gcc`,
    //     `gcc`,
    //     `/usr/bin/gcc-9`,
    //     `60`,
    //     `--slave`,
    //     `/usr/bin/g++`,
    //     `g++`,
    //     `/usr/bin/g++-9`,
    //   ]);
    //   // Get JavascriptCore
    //   if (os.toLowerCase().substring(0, 2) === "pi") {
    //     await exec.exec(`sudo`, [` apt-get`, `install`, `webkitgtk-4.0-dev`]);
    //   } else if (os.toLowerCase() === "nvidia") {
    //     await exec.exec(`sudo`, [
    //       `apt-get`,
    //       `install`,
    //       `libjavascriptcoregtk-4.0-dev`,
    //     ]);
    //   }
    // }

    // For Gihub hosted runners update gcc and get libs
    if (os === "ubuntu-latest") {
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
        `libgles2-mesa-dev`,
        `libgbm-dev`,
        `udev`,
        `libudev-dev`,
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

    core.exportVariable('UPLOAD_NAME', os);
    core.exportVariable('UPLOAD_DIR', 'Build');
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
