/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;

const MongoClient = require('mongodb').MongoClient;
const Mongoose = require('mongoose');

const CONNECTION_STRING = process.env.DB;

let threadSchema = new Mongoose.Schema({
  board: { type: String, required: true },
  threadText: { type: String, required: true },
  delete_password: { type: String, required: true },
  reported: { type: Boolean }
});
let threadrecord = Mongoose.model('threadRecords', threadSchema);

let replySchema = new Mongoose.Schema({
  board: { type: String, required: true },
  thread: { type: String, required: true },
  threadText: { type: String, required: true },
  delete_password: { type: String, required: true },
  reported: { type: Boolean }
});
let replyRecord = Mongoose.model('replyRecords', replySchema);

module.exports = function (app) {
  Mongoose.connect(CONNECTION_STRING, { useNewUrlParser: true, useFindAndModify: false }, function (err) {
    if (err) {
      console.log(err);
    } else {
      console.log('DB Connected');
    }
  });
  
  app.route('/api/threads/:board')
  .post(function (req, res) {
    /*console.log(req.body);
    console.log(req.params);*/
    threadrecord.create({
      'board': req.params.board,
      'threadText': req.body.text,
      'delete_password': req.body.delete_password,
      'reported': false
    },function (err) {
      if (err) {
        console.log(err);
        res.send(err);
      } else {
        res.redirect('/b/' + req.params.board + '/');
      }
    });
    //res.send('hi');
  })
  .get(function (req, res) {
    let resArray = [];
    threadrecord.find({'board': req.params.board}).sort({'created_on': -1}).limit(10).exec(function (err, docs) {
      if (err) {
        console.log(err);
      } else {
        docs.forEach(ele => {
          var e = {'board': ele.board, 'text': ele.threadText, '_id': ele._id, 'created_on': ele.created_on, 'bumped_on': ele.created_on, 'replycount': 0, 'replies': []};
          //get the three most recent replies
          replyRecord.find({'board': req.params.board, 'thread': ele._id}).sort({'created_on': -1}).exec(function (err2, reps) {
            if (err2) {
              console.log(err2);
            } else {
              reps.forEach(r => {
                if (e.replycount < 3) {
                  var r = {'board': r.board, '_id': r._id, 'created_on': r.created_on, 'text': r.threadText};
                  e.replies.push(r);
                }
                e.replycount++;
              });
            }
          });
          resArray.push(e);
        });
        res.send(resArray);
      }
    });
  })
  .delete(function (req, res) {
    console.log(req.body);
    threadrecord.findOneAndDelete({'_id': req.body.thread_id, 'delete_password': req.body.delete_password}, function(err, doc) {
      if (err) {
        console.log(err);
        //res.send('incorrect password');
      }
      if (doc != null) {
        res.send('success');
      } else {
        res.send('incorrect password');
      }
    });
  });
    
  app.route('/api/replies/:board')
  .post(function (req, res) {
    console.log(req.body.thread_id);
    replyRecord.create({
      'board': req.params.board,
      'thread': req.body.thread_id,
      'threadText': req.body.text,
      'delete_password':  req.body.delete_password,
      'reported': false
    }, function (err) {
      if (err) {
        console.log(err);
        res.send(err);
      } else {
        res.redirect('/b/' + req.params.board + '/' + req.body.thread_id);
      }
    })
  })
  .get(function (req, res) {
    /*console.log(req.params);
    console.log(req.params.thread_id);
    console.log(req.body);*/

    let resArray = [];
    var finder = {'board': req.params.board};
    if (req.params.thread_id != null) {
      finder['_id'] = req.params.thread_id;
    }
    threadrecord.find(finder).exec(function (err, docs) {
      if (err) {
        console.log(err);
      } else {
        var dcnt = 0;
        docs.forEach(ele => {
          dcnt++;
          //console.log(ele);
          var e = {'board': ele.board, 'text': ele.threadText, '_id': ele._id, 'created_on': ele.created_on, 'bumped_on': ele.created_on, 'replycount': 0, replies: []};
          //get the three most recent replies
          replyRecord.find({'board': ele.board, 'thread': ele._id}).sort({'created_on': -1}).exec(function (err2, reps) {
            if (err2) {
              console.log(err2);
            } else {
              //console.log(reps.length);
              var rcnt = 0;
              if (reps != null) {
                reps.forEach(r => {
                //console.log('reps ' + r)
                var r = {'board': r.board, '_id': r._id, 'created_on': r.created_on, 'text': r.threadText};
               // console.log(e);
                e.replies.push(r);
                e.replycount++;
                rcnt++;
                if (rcnt == reps.length && dcnt == docs.length) {
                  resArray.push(e);
                  console.log(resArray);
                  res.send(resArray[0]);
                } else {
                  
                 // console.log('rcnt: ' + rcnt + ' dcnt: ' + dcnt);
                }
              });
            } else {
                if (dcnt == docs.length) {
                  resArray.push(e);
                  //console.log(resArray);
                  res.send(resArray[0])
                }
              }
            }
          });
          resArray.push(e);
          //dcnt++;
        });
        /*console.log(resArray);
        res.send(resArray);*/
      }
    });
  })
  .delete(function (req, res) {
    replyRecord.findOneAndUpdate({
      //conditions
      '_id': req.body.reply_id,
      'delete_password': req.body.delete_password,
      'thread': req.body.thread_id
    },{
      //update
      'threadText': '[deleted]'
    },function (err, doc) {
      if (err != null || doc == null) {
        if (err) {
          console.log(err);
        }
        res.send('incorrect password');
      } else {
        res.send('success');
      }
    });
  });

};
