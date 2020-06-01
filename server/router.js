const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

const SIZE = 2048;

router.get('/test', (req, res) => {
  return res.json({ test: 2 })
});

router.post('/upload', (req, res) => {
  const { file } = req;
  const { sign, filename } = req.body;
  const dirName = path.dirname(__dirname);
  const sourcePath = path.join(dirName, file.path);
  const destPath = path.join(__dirname, 'files/' + filename);
  const textPath = path.join(__dirname, 'files/' + filename + '.txt');

  fs.renameSync(sourcePath, destPath);
  fs.writeFileSync(textPath, sign);

  return res.json({ code: 1 });
});

router.get('/getSign', (req, res) => {
  const { filename } = req.query;
  const sign = fs.readFileSync(__dirname + '/files/' + filename + '.txt');

  return res.json({ code: 1, sign: sign.toString() });
});

router.post('/upload_part', (req, res) => {
  const { i, filename } = req.body;
  const { file } = req;

  console.log(file);

  const dirName = path.dirname(__dirname);
  const sourcePath = path.join(dirName, file.path);
  const destPath = path.join(__dirname, 'cache/' + filename + '-' + i);

  fs.renameSync(sourcePath, destPath);

  return res.json({ code: 1 });
});

router.post('/merge', (req, res) => {
  const { checkResult, filename, sign } = req.body;
  const sourceBuffer = fs.readFileSync(__dirname + '/files/' + filename);
  const bufferArray = [];

  for (let i = 0; i < checkResult.length; i++) {
    if (checkResult[i]) {
      if (typeof checkResult[i] === 'object') {
        const [start, end] = checkResult[i];
        bufferArray.push(sourceBuffer.slice(start * SIZE, (end + 1) * SIZE));
      } else {
        const index = checkResult[i];
        bufferArray.push(sourceBuffer.slice(index * SIZE, (~~index + 1) * SIZE));
      }

    } else {
      const cachePath = __dirname + '/cache/' + filename + '-' + i;
      bufferArray.push(fs.readFileSync(cachePath));
      fs.unlink(cachePath, () => { });
    }
  };

  console.log(checkResult)

  const newBuffer = Buffer.concat(bufferArray);
  fs.writeFileSync(__dirname + '/files/' + filename, newBuffer);
  fs.writeFileSync(__dirname + '/files/' + filename + '.txt', sign);

  return res.json({ code: 1 });
});

module.exports = router;