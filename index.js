const core = require("@actions/core");
const github = require("@actions/github");
const exec = require("@actions/exec");

const lib_dir = core.getInput("lib_dir");
const os = core.getInput("os");
const flag = core.getInput("flag");

const project = core.getInput("project");

async function InstallDependencies() {
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

  if(flag === pi)
  {
    await exec.exec("sudo", [
      `apt-get`,
      `build-essential`,
      `gawk`,
      `gfortran`,
      `git`,
      `texinfo`,
      `bison`,
      `libncurses-dev`,
    ])

    await exec.exec("wget", [
      "-O",
      "Compiler",
      "https://sourceforge.net/projects/raspberry-pi-cross-compilers/files/Raspberry%20Pi%20GCC%20Cross-Compiler%20Toolchains/Buster/GCC%2010.2.0/Raspberry%20Pi%203A%2B%2C%203B%2B%2C%204/cross-gcc-10.2.0-pi_3%2B.tar.gz/download"
    ])

    await exec.exec("tar", ["xf", "Compiler"])

    await exec.exec("PATH=./cross-pi-gcc-10.2.0-2/bin:$PATH")
    await exec.exec("LD_LIBRARY_PATH=./cross-pi-gcc-10.2.0-2/lib:$LD_LIBRARY_PATH")

    process.env.compiler = await exec.exec("realpath", ["cross-pi-gcc-10.2.0-2"])
  }
  else
  {
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
}

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

    // For Gihub hosted runners update gcc and get libs
    if (os === "ubuntu-latest") {
      await InstallDependencies();
    }
    
    if(flag === 'osmesa')
    {
      await exec.exec("wget", ["https://github.com/NewChromantics/OsMesaBuilder/releases/download/mesa-20.2.1/osmesa.zip"])
      await exec.exec("unzip", ["osmesa.zip", "-d", "src/Libs/osmesa"])
    }

    await exec.exec("make", [`exec`, `-C`, `${project}.Linux/`]);

    core.exportVariable('UPLOAD_NAME', os + flag);
    core.exportVariable('UPLOAD_DIR', 'Build');
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
