const fs = require('fs');
const { exec } = require("child_process");

if (!fs.existsSync('./node_modules')) {
  console.log("node_modules directory missing");
  console.log("...Installing node modules");
  exec("npm install", (error, stdout, stderr) => {
    if (error) {
      console.log(`error: ${error.message}`);
      return;
  }
  if (stderr) {
      console.log(`stderr: ${stderr}`);
      return;
  }
  console.log(`stdout: ${stdout}`);
  })
} else {
    const installChanged = require('install-changed');
    const isModified = installChanged.watchPackage({
    hashFilename: '.packagehash',
    installCommand: 'npm ci'
  })
}
  