const express = require('express');
const path = require('path');
const fileUpload = require('express-fileupload');
const fs = require('fs');
const { exec } = require('child_process');
const rimraf = require('rimraf');

const app = express();

function requireHTTPS(req, res, next) {
  if (!req.secure && req.get('x-forwarded-proto') !== 'https' && process.env.NODE_ENV !== "development") {
    return res.redirect('https://' + req.get('host') + req.url);
  }
  next();
}
app.use(requireHTTPS);

app.use(fileUpload());

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/v1/split', splitDocument);
async function splitDocument(req, res) {
  const name = createTempDirectory();
  console.log(name);
  fs.writeFile(`uploads/${name}/upload.pdf`, req.files.file.data, function(err) {
      if(err) {
          return console.log(err);
      }

      console.log("The file was saved!");

      exec('pdftk upload.pdf burst', {cwd: `uploads/${name}`}, (err, stdout, stderr) => {
        if (err) {
          return console.log(err);
          // node couldn't execute the command
          return;
        }

        // the *entire* stdout and stderr (buffered)
        console.log(`stdout: ${stdout}`);
        console.log(`stderr: ${stderr}`);
        console.log('zip file');
        exec('zip output.zip pg_000*', {cwd: `uploads/${name}`}, (err, stdout, stderr) => {
          if (err) {
            console.log(`stdout: ${stdout}`);
            console.log(`stderr: ${stderr}`);
            return console.log(err);
            // node couldn't execute the command
            return;
          }

          // the *entire* stdout and stderr (buffered)
          console.log(`stdout: ${stdout}`);
          console.log(`stderr: ${stderr}`);
          console.log('aa', res.sendFile('output.zip', {root: `uploads/${name}`}));
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


app.post('/v1/merge', mergeDocument);
async function mergeDocument(req, res) {
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
