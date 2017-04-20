var Express = require('express');
var connections = require('../Connections.js');
var Tags = require('../Validator.js').Tags;
var router = Express.Router({caseSensitive: true});
var async = require('async');
var crypto = require('crypto');
var multiparty = require('multiparty');
var bluebird = require('bluebird');
var gm = require('gm');
var aws = require("aws-sdk");
var fs = require("fs");
router.baseURL = '/Upload';

const S3_BUCKET = 'pomelotech';

aws.config.update({
  accessKeyId: "AKIAJ4PWCJV5YRUG3R7Q",
  secretAccessKey: "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"
});

var s3 = bluebird.promisifyAll(new aws.S3());

// format for upload photo
// https://${S3_BUCKET}.s3.amazonaws.com/${userEmail}/${album}/${date}-${hash}-${filename}
// var date = new Date().toISOString();
// date.substr(0, 4) + date.substr(5, 2) + date.substr(8, 2);

var resizeImg = bluebird.promisify(function(input, size, cb) {
  gm(input).resize(size).toBuffer(function(err, buffer) {
    if (err) cb(err); else cb(null, buffer);
  });
});

router.post('/uploadPic', (req, res) => {
  var vld = req.validator;
  var logId = req.session.id;

  if (!vld.checkPrsOK(logId))
    return;

  new multiparty.Form().parse(req, (err, fields, files) => {
    console.log("fields");
    console.log(fields);

    if (!files.images)
      return res.status(400).json({success: 0, response: 'No files found'});

    files.images.forEach(file => {
      console.log(file.path, file.originalFilename, file.headers['content-type']);
    });

    var username = 'nnguy101@gmail.com';
    var album = 'pomeloTest'; // get from fields/metadata
    var operations = files.images.map(file => {
      var filename = generateFileName(username, album, file.originalFilename);
      return bluebird.join(file, // need to add thumbs later on
        s3.uploadAsync({
          Key: filename,
          Bucket: S3_BUCKET,
          ACL:"public-read",
          ContentType: file.headers['content-type'],
          Body: fs.createReadStream(file.path)
        }));
    });
    bluebird.join(bluebird.all(operations), images => {
      console.log("inside bluebird image");
      // console.log(images);

      var items = images.map(image => {
        fs.unlink(image[0].path); // delete file on local
        return {
          url: image[1].Location,
          thumb: 'TODO',
          originalFilename: image[0].originalFilename,
          position: 'TODO'
        };
      });

      console.log("items");
      console.log(items);
      return JSON.stringify(items);
    })
    .then(output => {
      console.log("good");
      res.json({albumName: album, albumId: 'TODO', images: output});
    })
    .catch(err => {
      console.log(err);
      res.status(400).json(err);
    })
  });
});

function generateFileName(username, album, origFileName) {
  var date = new Date().toISOString();
  var dateString = date.substr(0, 4) + date.substr(5, 2) + date.substr(8, 2);
  var id = crypto.randomBytes(10).toString('hex');

  return username + '/' + album + '/' + dateString + '_' + id + '_' + origFileName;
}
    


module.exports = router;
