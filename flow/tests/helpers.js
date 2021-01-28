const { spawn, exec } = require("child_process");
const config = require("config");


function runEmulator() {
  // kill emulator if running (should make it os agnostic)
  //exec("kill $(lsof -ti:3569,8080)") 

  const ls = spawn(
    `flow emulator start --init --verbose --service-priv-key ${config.get('accounts.main.privateKey')} --service-sig-algo ECDSA_P256 --service-hash-algo SHA3_256`
  );

  ls.stdout.on("data", data => {
      console.log(`stdout: ${data}`);
  });

  ls.stderr.on("data", data => {
      console.log(`stderr: ${data}`);
  });

  ls.on('error', (error) => {
      console.log(`error: ${error.message}`);
  });

  ls.on("close", code => {
      console.log(`child process exited with code ${code}`);
  });
}


module.exports = { runEmulator };