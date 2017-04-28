var Express = require('express');
var connections = require('../Connections.js');
var Tags = require('../Validator.js').Tags;
var router = Express.Router({caseSensitive: true});
var async = require('async');

router.baseURL = '/Video';

/*
 * Post video, only taking the link of video
 * Need url, name, description in body
 */
router.post('/uploadVideo', (req, res) => {
  var body = req.body;
  var vld = req.validator;
  var log_id = req.session.id;
  var tec_id = req.session.tec_id;
  var insertVideoQuery = ' INSERT INTO Videos (tec_id, url, name,' +
    ' description) VALUES (?,?,?,?,NOW()) ';

  if (!vld.checkPrsOK(logId))
    return res.status(400).json({response: 'Permission Denied'});

  if (vld.hasFields(body, ['url', 'name', 'description'])) {
    connections.getConnection(res, cnn => {
      async.waterfall([
        function(callback) {
          cnn.query(insertVideoQuery, [tec_id, body.url, body.name, body.description], callback);
        }
      ], function (err, result) {
        if (err) {
          console.log(err);
          res.status(400).json(err);
        } else {
          res.status(200).json({
            success: 1,
            url: body.url,
            description: body.description,
            createdDate: new Date()
          });
        }
      });
      cnn.release();
    });
  }
});

/*
 * Get video with given id
 */
router.get('/getVideo/:videoId', (req, res) => {
  var videoId = req.params.videoId;
  var getVideoQuery = ' SELECT * FROM Videos WHERE id_vid=? ';

  connections.getConnection(res, cnn => {
    async.waterfall([
      function (callback) {
        cnn.query(getVideoQuery, videoId, callback);
      }
    ], function (err, result) {
      if (err) {
        console.log(err);
        res.status(400).json(err);
      } else if (result.length > 0) {
        res.status(200).json(result[0]);
      } else {
        res.status(200).json({success: 0, response: `VideoId ${videoId} not found`})
      }
    });
    cnn.release();
  });
});

module.exports = router;