import * as dotenv from "dotenv";

dotenv.config();

console.log("hello world");
console.log({cwd: process.cwd(), dirname: __dirname, key: process.env.OPENAI_API_KEY});


