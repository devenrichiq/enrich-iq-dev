import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import routes from "./routes/routes.js";
import bodyParser from 'body-parser';

dotenv.config();
const port = process.env.PORT || 4000
const start = async () => {
  const app = express();

  app.use(
    bodyParser.json({
      verify: function (req, res, buf) {
        req.rawBody = buf.toString();
      }
    })
  );

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(express.json());
  app.use(cors());

  app.use('/', routes)

  app.listen(port,"0.0.0.0", () => {
    console.log('listening on port 4000');
  })
}

(async () => {
  await start()
})()
