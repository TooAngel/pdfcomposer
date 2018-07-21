const express = require('express');
const path = require('path');
const fileUpload = require('express-fileupload');
const fs = require('fs');
const { exec } = require('child_process');

const app = express();

app.use(fileUpload());

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/v1/split', splitDocument);

async function splitDocument(req, res) {
  console.log(Object.keys(req.files.file));

  fs.writeFile("uploads/tmp.pdf", req.files.file.data, function(err) {
      if(err) {
          return console.log(err);
      }

      console.log("The file was saved!");

      exec('pdftk uploads/tmp.pdf burst', (err, stdout, stderr) => {
        if (err) {
          return console.log(err);
          // node couldn't execute the command
          return;
        }

        // the *entire* stdout and stderr (buffered)
        console.log(`stdout: ${stdout}`);
        console.log(`stderr: ${stderr}`);

        exec('zip downloads/ddd.zip pg_000*', (err, stdout, stderr) => {
          if (err) {
            return console.log(err);
            // node couldn't execute the command
            return;
          }

          // the *entire* stdout and stderr (buffered)
          console.log(`stdout: ${stdout}`);
          console.log(`stderr: ${stderr}`);
          console.log('aa', res.sendFile('ddd.zip', {root: './downloads'}));
        });
      });
    });
}

const server = app.listen(process.env.PORT || 8081, function() {
  let host = server.address().address;
  let port = server.address().port;
  console.log('App listening at http://%s:%s', host, port);
});

module.exports = server;
