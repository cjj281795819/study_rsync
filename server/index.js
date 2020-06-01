const express = require('express');
const multer = require('multer');
const bodyParser = require('body-parser');
const router = require('./router');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './dist')
  },
  filename: (req, file, cb) => {
    cb(null, `${new Date().getTime()}-${file.originalname}`);
  }
});

const upload = multer({ storage });
const app = express();

app.use(bodyParser.json());
app.use(upload.single('file'));

app.use('/', router);

app.listen(8888, () => console.log('listen 8888'));