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

router.post('/profile', (req, res) => {
  new multiparty.Form().parse(req, (err, fields, files) => {
    console.log("fields");
    console.log(fields);
    console.log("files");
    console.log(files);
    
    if (!files.images)
      return res.status(400).json({success: 0, respons: 'No files found'});

    files.images.forEach(file => {
      console.log(file.path, file.originalFilename, file.headers['content-type']);
    });

    var username = 'nnguy101@gmail.com';
    var album = 'pomeloTest';
    var folder = username + "/" + album + "/";
    var date = new Date().toISOString();
    var dateString = date.substr(0, 4) + date.substr(5, 2) + date.substr(8, 2);
    var operations = files.images.map(file => {
      var id = crypto.randomBytes(10).toString('hex');
      var filename = folder + dateString + "_" + id + "_" + file.originalFilename;
      return bluebird.join(id, file, 
        s3.uploadAsync({
          Key: filename,
          Bucket: "pomelotech",
          ACL:"public-read",
          ContentType: file.headers['content-type'],
          Body: fs.createReadStream(file.path)
        }));
    });
    bluebird.join(bluebird.all(operations), images => {
      console.log("inside bluebird image");
      console.log(JSON.stringify(images));
      return images;
    })
    .then(output => {
      console.log("good");
      res.json(output);
    })
    .catch(err => {
      console.log(err);
      res.status(400).json(err);
    })
  });
});


module.exports = router;
