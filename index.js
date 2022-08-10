const { program } = require('commander');
const { promises } = require('fs');
const ExifParser = require('exif-parser');
const path = require("path");
const dateNtime = require('date-and-time')

program
  .option('-i, --input-directory <path/to/directory>', 'directory with photos', './input')
  .option('-o, --output-directory <path/to/directory>', 'directory with renamed photos', './output');

program.parse();

const options = program.opts();
console.log(options);

const filepath = './input/20220804_212647.jpeg';
promises.readFile(filepath).then(imgbuffer => {
  const parser = ExifParser.create(imgbuffer);
  parser.enableTagNames(true);
  parser.enableImageSize(true);
  parser.enableReturnTags(true);

  const img = parser.parse();

  console.log(img.tags);

  const date = new Date(img.tags.DateTimeOriginal * 1000);
  const formattedDate = dateNtime.format(date,'YYYYMMDD_HHmmss');
  const filename = `${formattedDate.toString()}_${path.basename(filepath)}`
  console.log('New filename', filename)
});
