const express = require('express');
const path = require('path');
const fileUpload = require('express-fileupload');
const fs = require('fs');
const { exec } = require('child_process');
const rimraf = require('rimraf');

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

function createTempDirectory() {
  let name = Math.random().toString(36).substring(7);
  while (fs.existsSync('uploads/' + name)) {
    name = Math.random().toString(36).substring(7);
  }
  fs.mkdirSync('uploads/' + name);
  return name;
}


app.post('/v1/merge', splitDocument);
async function splitDocument(req, res) {
  console.log(Object.keys(req.files));
  const name = createTempDirectory();
  console.log(name);
  const files = [];
  for (let filename of Object.keys(req.files)) {
    console.log(filename);
    fs.writeFileSync(`uploads/${name}/${filename}.pdf`, req.files[filename].data);
    files.push(`uploads/${name}/${filename}.pdf`);
  }
  const command = `pdfunite ${files.join(' ')} uploads/${name}/output.pdf`;
  console.log(command);
  exec(command, (err, stdout, stderr) => {
    if (err) {
      return console.log(err);
      // node couldn't execute the command
      return;
    }

    // the *entire* stdout and stderr (buffered)
    console.log(`stdout: ${stdout}`);
    console.log(`stderr: ${stderr}`);
    console.log('aa', res.sendFile(`output.pdf`, {root: `./uploads/${name}`}));
  });

  // rimraf.sync('uploads/' + name);
}

const server = app.listen(process.env.PORT || 8081, function() {
  let host = server.address().address;
  let port = server.address().port;
  console.log('App listening at http://%s:%s', host, port);
});

module.exports = server;
