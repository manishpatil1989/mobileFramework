const execSync = require('child_process').execSync;
const gitRevision = require('git-revision');
const os = require('os');

class TestEnv {
    static macosRelease() {
      return execSync(`sw_vers -productVersion`).toString();
    }

    static xcodeVersion() {
      return execSync(`xcodebuild -version 2>&1 | head -1`).toString();
    }

    static javaVersion() {
      return execSync(`java -version 2>&1 | head -1`).toString();
    }

    static appiumVersion() {
      return execSync(`appium -v 2>&1`).toString();
    }

    static gitBranch() {
      if (process.env.BUILD_SOURCEBRANCH) {
        return process.env.BUILD_SOURCEBRANCH.replace('refs/heads/', '');
      } else {
        return gitRevision('branch');
      }
    }

    static gitRevision() {
      if (process.env.BUILD_SOURCEVERSION) {
        return process.env.BUILD_SOURCEVERSION;
      } else {
        return gitRevision('long');
      }
    }

    static slaveMachine() {
      return os.hostname();
    }

    static slaveMachineOS() {
      return os.platform();
    }

    static nodeVersion() {
      return process.version;
    }
}

module.exports = TestEnv;