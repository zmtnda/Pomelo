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
const THUMB_SIZE = 150;

aws.config.update({
  accessKeyId: "AKIAJ4PWCJV5YRUG3R7Q",
  secretAccessKey: "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"
});

var s3 = bluebird.promisifyAll(new aws.S3());

// format for upload photo
// https://${S3_BUCKET}.s3.amazonaws.com/${userEmail}/${album}/${date}-${hash}-${filename}


router.post('/uploadProfile', (req, res) => {
  var vld = req.validator;
  var body = {};
  var logId = req.session.id;
  var tecId = req.session.tec_id;
  var username = req.session.email;
  var changeAvatarQuery = 'UPDATE Portfolio SET avatar=? WHERE tec_id = ?';

  if (!vld.checkPrsOK(logId))
    return res.status(400).json({response: 'Permission Denied'});

  new multiparty.Form().parse(req, (err, fields, files) => {
    if (!files.images)
      return res.status(400).json({success: 0, response: 'No files found'});

    // var username = 'nnguy101@gmail.com';
    var albumName = 'profile';

    connections.getConnection(res, cnn => {
      async.waterfall([
        function (callback) {
          uploadImages(username, files, albumName, callback);
        },
        function (images, callback) {
          body.profileUrl = images[0].url;
          cnn.query(changeAvatarQuery, [images[0].url, tecId], callback);
        }
      ], function (err, result) {
        if (err) res.status(400).json(err);
        else {
          res.status(200).json({
            url: body.profileUrl,
            success: 1
          });
        }
      });
    });
  });
});

/*
 * Require 2 fields, medaData and images
 * Metadata: album, albumId if any, description
 */
router.post('/uploadAlbum', (req, res) => {
  var vld = req.validator;
  var body = {};
  var logId = req.session.id;
  var username = req.session.email;

  if (!vld.checkPrsOK(logId))
    return;

  new multiparty.Form().parse(req, (err, fields, files) => {
    if (!files.images)
      return res.status(400).json({success: 0, response: 'No files found'});

    var metaData = JSON.parse(fields.metaData[0]);

    connections.getConnection(res, cnn => {
      async.waterfall([
        function (callback) {
          createThumbsBuffer(files, callback);
        },
        function (thumbBuffers, callback) {
          uploadThumbBuffer(username, thumbBuffers, metaData.albumName, callback);
        },
        function(thumbUrls, callback) {
          body.thumbUrls = thumbUrls;
          console.log("come on");
          console.log(thumbUrls);
          uploadImages(username, files, metaData.albumName, callback);
        },
        function (images, callback) {
          var i;
          for (i=0; i<images.length; i++) {
            images[i].thumb = body.thumbUrls[i].url;
          }
          callback(null, images);
        }
      ], function (err, result) {
        if (err) {
          console.log(err);
          res.status(400).json(err);
        } else {
          res.status(200).json({
            albumName: metaData.albumName,
            description: metaData.description,
            albumId: 'TODO',
            images: result
          });
        }
      });
      cnn.release();
    });
  });
});

function uploadThumbBuffer(username, thumbs, albumName, cb) {
  var operations = thumbs.map( thumb => {
    console.log("Thumb")
    console.log(thumb);
    var filename = generateFileName(username, albumName, "thumb_"+ thumb[0].originalFilename);
    return bluebird.join(thumb,
      s3.uploadAsync({
        Key: filename,
        Bucket: S3_BUCKET,
        ACL: "public-read",
        ContentType: "image/png",
        Body: thumb[1]
      }));
  });

  bluebird.join(bluebird.all(operations), images => {
    return images.map(image => {
      return {
        url: image[1].Location
      }
    });
  })
    .then(result => cb(null, result))
    .catch(err => cb(err));
}

function createThumbsBuffer(files, cb) {

  var operations = files.images.map( file => {
    return bluebird.join(file, resizeImg(file.path, THUMB_SIZE));
  });

  bluebird.join(bluebird.all(operations), thumbBuffers => {
    console.log(thumbBuffers);
    return thumbBuffers;
  })
    .then(result => cb(null, result))
    .catch(err => cb(err));
}

function uploadImages(username, files, albumName, cb) {
  var operations = files.images.map(file => {
    var filename = generateFileName(username, albumName, file.originalFilename);
    return bluebird.join(file,
      s3.uploadAsync({
        Key: filename,
        Bucket: S3_BUCKET,
        ACL:"public-read",
        ContentType: file.headers['content-type'],
        Body: fs.createReadStream(file.path)
      }));
  });
  bluebird.join(bluebird.all(operations), images => {

    var items = images.map(image => {
      fs.unlink(image[0].path); // delete file on local
      return {
        url: image[1].Location,
        originalFilename: image[0].originalFilename,
        position: 'TODO',
        description: 'TODO'
      };
    });

    return items;
  })
    .then(result => {
      cb(null, result);
    })
    .catch(err => {
      console.log("errrr??");
      console.log(err);
      cb(err);
    });
}

// Generate file name with username and album
function generateFileName(username, album, origFileName) {
  var date = new Date().toISOString();
  var dateString = date.substr(0, 4) + date.substr(5, 2) + date.substr(8, 2);
  var id = crypto.randomBytes(10).toString('hex');

  return username + '/' + album + '/' + dateString + '_' + id + '_' + origFileName;
}

// Resize image for thumb
var resizeImg = bluebird.promisify(function(input, size, cb) {
  gm(input).resize(size).setFormat('jpeg').toBuffer(function(err, buffer) {
    if (err) cb(err); else cb(null, buffer);
  });
});

module.exports = router;
