The x86_64 build runs on a Github hosted runner so there needs to be a setup part to download the needed files eg. libx264.

The architecture for nvidia is stated in reference to an if statement in the Linux Makefile.

The compilier on the pi's needs to be updated to a later version 
https://solarianprogrammer.com/2017/12/08/raspberry-pi-raspbian-install-gcc-compile-cpp-17-programs/

_Needed Libs_

A list of the libs can be found in the Dockerfile which can be used as a build environment for the packages

---
*Docker*

To use the Docker image change directory to your base project and run
```
docker run --rm -v ${pwd}:/home/app linux/popenv:latest
```

Make sure you are logged into the New Chromantics registry to hace access to this image
