import express, { Application, Request, Response } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';

const app: Application = express();
import multer from 'multer';
import axios from 'axios';
import fs from 'fs';
import FormData from 'form-data';
import rateLimitMiddleware from './middleware';

const upload = multer({ dest: 'uploads/' });

const PORT = process.env.PORT || 4000;
const GOTENBERG_URL = process.env.GOTENBERG_URL || 'http://gotenberg:3000';

const corsOptions = {
  origin: [/^http:\/\/localhost:3001$/, /(^|\.)sounds-talk\.com$/],
  optionsSuccessStatus: 200,
};
app.use(rateLimitMiddleware);
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', async (req: Request, res: Response): Promise<Response> => {
  return res.status(200).send({
    message: 'Hello World Updated! Tests',
  });
});
app.post('/convert', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).send('No file uploaded.');
    }

    const form = new FormData();
    form.append('files', fs.createReadStream(file.path), file.originalname);
    form.append('convertTo', 'pdf');

    const gotenbergResponse = await axios.post(`${GOTENBERG_URL}/forms/libreoffice/convert`, form, {
      headers: form.getHeaders(),
      responseType: 'arraybuffer',
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.send(gotenbergResponse.data);

    // Clean up the uploaded file
    fs.unlinkSync(file.path);
  } catch (error) {
    return res.status(500).send('Error converting file.');
  }
});
app.post('/post', async (req: Request, res: Response): Promise<Response> => {
  console.log(req.body);
  return res.status(200).send({
    message: 'Hello World from post !',
  });
});

try {
  app.listen(PORT, (): void => {
    console.log(`Connected successfully on port ${PORT}`);
  });
} catch (error: any) {
  console.error(`Error occured: ${error.message}`);
}
