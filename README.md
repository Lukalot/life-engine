# Life Engine
A P5/Electron application to facilitate a wide range of particle simulations, including, especially, cellular automata/life related experiments within an unrestricted physics based environment.

In order to keep P5 out of the global scope, it is instantiated inside sketch.js. This means that whenever you would call a p5 method, you must call it from the injected p5 instance. For example, in the sketch function, you must use `p.ellipse()` rather than just `ellipse`.

## To Use

To clone and run this repository you'll need [Git](https://git-scm.com) and [Node.js](https://nodejs.org/en/download/) (which comes with [npm](http://npmjs.com)) installed on your computer. From your command line:

```bash
# Clone this repository
git clone https://github.com/lukalot/life-engine
# Go into the repository
cd life-engine
# Install dependencies
npm install
# Run the app
npm start
```

Instructions for interacting with the simulation are displayed within the program when run.

Note: If you're using Linux Bash for Windows, [see this guide](https://www.howtogeek.com/261575/how-to-run-graphical-linux-desktop-applications-from-windows-10s-bash-shell/) or use `node` from the command prompt.

## License
GPL v3.0
