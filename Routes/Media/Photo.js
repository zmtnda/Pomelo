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
router.baseURL = '/Photo';

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
  var changeAvatarQuery = 'UPDATE Technicians SET avatar=? WHERE id_tec = ?';

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
      cnn.release();
    });
  });
});

/*
 * Get album for specific album
 * Need albumId on api link
 */
router.get('/getAlbum/:albumId', (req, res) => {
  var vld = req.validator;
  var body = req.body;
  var albumId = req.params.albumId;
  var checkAlbumQuery = ' SELECT * FROM Albums WHERE id_alb=?';
  var getPhotoQuery = ' SELECT * FROM Photos WHERE alb_id=? ';

  connections.getConnection(res, cnn => {
    async.waterfall([
      function (callback) { // check album
        cnn.query(checkAlbumQuery, albumId, callback);
      },
      function (result, fields, callback) { // get photos
        if (result.length > 0) {
          body.albumMetaData = result[0];
          cnn.query(getPhotoQuery, albumId, callback);
        } else {
          callback({success: 0, response: `albumId ${albumId} doesn't exists`})
        }
      }
    ], function (err, result) {
      if (err) {
        console.log(err);
        res.status(400).json(err);
      } else {
        res.status(200).json({
          success: 1,
          albumName: body.albumMetaData.name,
          description: body.albumMetaData.description,
          albumId: body.albumMetaData.id_alb,
          createdDate: body.albumMetaData.createdDate,
          lastUpdate: body.albumMetaData.lastUpdate,
          images: result
        });
      }
    });
    cnn.release();
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
  var tec_id = req.session.tec_id;
  var username = req.session.email;

  var createAlbumQuery = ' INSERT INTO Albums (tec_id, name, description,' +
    ' createdDate, lastUpdate) VALUES (?,?,?,NOW(), NOW()) ';
  var insertPhotoToAlbum = ' INSERT INTO Photos (alb_id, url, thumb,' +
    ' description, position, createdDate) VALUES ';

  if (!vld.checkPrsOK(logId))
    return res.status(400).json({response: 'Permission Denied'});

  new multiparty.Form().parse(req, (err, fields, files) => {
    if (!files.images)
      return res.status(400).json({success: 0, response: 'No files found'});

    var albumMetaData = JSON.parse(fields.albumMetaData[0]);
    var photoMetaDataArray = JSON.parse(fields.photoMetaData[0]);

    connections.getConnection(res, cnn => {
      async.waterfall([
        function (callback) { // create thumb files
          createThumbsBuffer(files, callback);
        },
        function (thumbBuffers, callback) { // upload thumbs
          uploadThumbBuffer(username, thumbBuffers, albumMetaData.albumName, callback);
        },
        function(thumbUrls, callback) { // upload real images
          body.thumbUrls = thumbUrls;
          // console.log(thumbUrls);
          uploadImages(username, files, albumMetaData.albumName, callback);
        },
        function (images, callback) { // add thumb to images
          var i;
          for (i=0; i<images.length; i++) {
            images[i].thumb = body.thumbUrls[i].url;
            images[i].description = photoMetaDataArray[i].description;
            images[i].position = i;
          }
          callback(null, images);
        },
        function (images, callback) { // create new album
          body.images = images;
          cnn.query(createAlbumQuery,
            [tec_id, albumMetaData.albumName, albumMetaData.description], callback);
        },
        function (result, fields, callback) {
          albumMetaData.albumId = result.insertId;
          var flattenMetaDataArray = [];
          for (var i=0; i<photoMetaDataArray.length; i++) {
            insertPhotoToAlbum += `(${result.insertId},?,?,?,${i},NOW())`;
            flattenMetaDataArray.push(body.images[i].url);
            flattenMetaDataArray.push(body.images[i].thumb);
            flattenMetaDataArray.push(photoMetaDataArray[i].description);
            if (i < photoMetaDataArray.length-1)
              insertPhotoToAlbum += ', ';
          }

          cnn.query(insertPhotoToAlbum, flattenMetaDataArray, callback);
        }
      ], function (err, result) {
        // console.log("end insert photos");
        // console.log(result);
        if (err) {
          console.log(err);
          res.status(400).json(err);
        } else {
          res.status(200).json({
            success: 1,
            albumName: albumMetaData.albumName,
            description: albumMetaData.description,
            albumId: albumMetaData.albumId,
            images: body.images
          });
        }
      });
      cnn.release();
    });
  });
});

/*
Need albumId, Metadata, deletePhotoIds, addNewPhotoFile
*/
router.put('/updateAlbum', (req, res) => {
  var vld = req.validator;
  var body = {};
  var logId = req.session.id;
  var tec_id = req.session.tec_id;
  var username = req.session.email;

  var checkAlbumWithTech = 'SELECT * FROM Albums WHERE id_alb=? AND tec_id=?';
  var checkPhotoIsInAlbum = 'SELECT COUNT(1) FROM Photos WHERE ';
  var deletePhotos = 'DELETE FROM Photos WHERE id_pho IN (';
  var updateAlbum = 'UPDATE Albums SET name=?, description=?, lastUpdate=NOW() WHERE id_alb=?';
  var insertPhotoToAlbum = ' INSERT INTO Photos (alb_id, url, thumb,' +
    ' description, position, createdDate) VALUES ';

  if (!vld.checkPrsOK(logId))
    return res.status(400).json({response: 'Permission Denied'});

  new multiparty.Form().parse(req, (err, fields, files) => {
    if (!files.images)
      return res.status(400).json({success: 0, response: 'No files found'});

    var albumMetaData = JSON.parse(fields.albumMetaData[0]);
    var photoMetaDataArray = JSON.parse(fields.photoMetaData[0]);
    var deletePhotoIds = JSON.parse(fields.deletePhotoIds[0]);

    connections.getConnection(res, cnn => {
      async.waterfall([
        function (callback) {
          cnn.query(checkAlbumWithTech, [albumMetaData.albumId, tec_id], callback);
        },
        function (result, fields, callback) {
          if (result.length == 0) // check album belong to tec
            callback({success: 0, response: 'Permisson denined, album doesn\'t belong to this technician'})
          else { // check delete photo belong to album
            albumMetaData.createdDate = result[0].createdDate;
            checkPhotoIsInAlbum += 'alb_id = ? AND id_pho IN ('
            var i;
            var attr = [alb_id];
            for (i=0; i<deletePhotoIds.length; i++) {
              checkPhotoIsInAlbum += '?';
              deletePhotos += '?';
              attr.append(deletePhotoIds[i]);
              if (i < deletePhotoIds.length - 1) {
                checkPhotoIsInAlbum += ',';
                deletePhotos += ',';
              }
            }
            checkPhotoIsInAlbum += ')';
            deletePhotos += ')';
            cnn.query(checkPhotoIsInAlbum, attr, callback);
          }
        },
        function (result, fields, callback) {
          if (result.length != deletePhotoIds.length) {
            callback({success: 0, response: 'Permisson denied, photos doesn\'t belong album'});
          } else { // go ahead and delete photos
            cnn.query(deletePhotos, deletePhotoIds, callback);
          }
        },
        function (result, fields, callback) { // update album description
          cnn.query(updateAlbum, [albumMetaData.albumName, albumMetaData.description, albumMetaData.albumId], callback);
        },
        function (result, fields, callback) { // create thumbs on local
          createThumbsBuffer(files, callback);
        },
        function (thumbBuffers, callback) { // upload thumbs
          uploadThumbBuffer(username, thumbBuffers, albumMetaData.albumName, callback);
        },
        function (thumbUrls, callback) { // upload real images
          body.thumbUrls = thumbUrls;
          // console.log(thumbUrls);
          uploadImages(username, files, albumMetaData.albumName, callback);
        },
        function (images, callback) { // add thumb to images
          var i;
          for (i=0; i<images.length; i++) {
            images[i].thumb = body.thumbUrls[i].url;
            images[i].description = photoMetaDataArray[i].description;
            images[i].position = i;
          }
          callback(null, images);
        },
        function (images, callback) { // insert images
          var flattenMetaDataArray = [];
          for (var i=0; i<photoMetaDataArray.length; i++) {
            insertPhotoToAlbum += `(${albumMetaData.albumId},?,?,?,${i},NOW())`;
            flattenMetaDataArray.push(images[i].url);
            flattenMetaDataArray.push(images[i].thumb);
            flattenMetaDataArray.push(photoMetaDataArray[i].description);
            // flattenMetaDataArray.push(photoMetaDataArray[i].position);
            if (i < photoMetaDataArray.length-1)
              insertPhotoToAlbum += ', ';
          }
          cnn.query(insertPhotoToAlbum, flattenMetaDataArray, callback);
        },
        function (result, fields, callback) { // get photos for Albums
          cnn.query('SELECT * FROM Photos WHERE alb_id=?', albumMetaData.albumId, callback);
        }
      ], function(err, result) {
        if (err) {
          res.status(400).json(err);
        } else {
          res.status(200).json({
            success: 1,
            albumName: albumMetaData.albumName,
            description: albumMetaData.description,
            albumId: albumMetaData.albumId,
            createdDate: albumMetaData.createdDate,
            lastUpdate: new Date().toISOString().substr(0,10),
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
    // console.log("Thumb")
    // console.log(thumb);
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
    // console.log(thumbBuffers);
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
    .then(result => cb(null, result))
    .catch(err => cb(err));
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
