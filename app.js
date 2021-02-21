const { exec } = require("child_process");
const axios = require("axios");
let app = require('express')();
let http = require('http').createServer(app);

app.get('/', (req, res) => {
  sendPageWithStatus(res);
});

app.get('/on', (req, res) => {
  exec("ipmitool -I lanplus -H 192.168.1.210  -U root -P calvin power on");
  sendPageWithStatus(res);
  sendNotif("attemp to turn power on");
});

app.get('/off', (req, res) => {
  exec("ipmitool -I lanplus -H 192.168.1.210  -U root -P calvin power soft");
  sendPageWithStatus(res);
  sendNotif("attemp to turn power off");
});

http.listen(4949, function(){
    console.log('listening on *:4949');
});

function sendNotif(message) {
  const url = "http://home.selareid.com:2828/message?token=<token>";
  const bodyFormData = {
    title: "Node Power Update",
    message: message,
    priority: 1,
  };

  axios({
    method: "post",
    headers: {
      "Content-Type": "application/json",
    },
    url: url,
    data: bodyFormData,
  })
    .then((response) => console.log(response.data))
    .catch((err) => console.log(err.response ? error.response.data : err));
}

function sendPageWithStatus(res) {
  exec("ipmitool -I lanplus -H 192.168.1.210  -U root -P calvin power status", (error, stdout, stderr) => {
      if (error) {
          console.log(`error: ${error.message}`);
          res.send(getPage(`error: ${error.message}`));
          return;
      }
      if (stderr) {
          console.log(`stderr: ${stderr}`);
          res.send(getPage(`stderr: ${stderr}`));
          return;
      }
      console.log(`stdout: ${stdout}`);
      res.send(getPage(`stdout: ${stdout}`));
      return;
  });
}

function getPage(message) {
  return `<html>
    <body>
      <h1>${message}</h1>
       <a href="/on">Turn On</a>
        <a href="/off">Turn Off</a>

        <script>setTimeout(() => { window.location = '/'; }, 3000);</script>
    </body>
  </html>`;
}
