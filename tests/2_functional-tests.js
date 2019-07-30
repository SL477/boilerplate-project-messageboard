/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
  var delThreadID;
  suite('API ROUTING FOR /api/threads/:board', function() {
    
    suite('POST', function() {
      test('Post test', function(done){
        chai.request(server)
        .post('/api/threads/test2')
        .send({
          text: 'test text',
          delete_password: 'test'
        })
        .end(function (err, res) {
         // console.log(res);
          assert.equal(res.status,200);

          done();
        });
      });
    });
    
    suite('GET', function() {
      test('GET Test', function (done) {
        chai.request(server)
        .get('/api/threads/test2')
        .query({})
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          assert.property(res.body[0], 'board');
          assert.property(res.body[0], 'text');
          assert.property(res.body[0],  '_id');
          delThreadID = res.body[0]._id;
          assert.property(res.body[0], 'created_on');
          assert.property(res.body[0], 'bumped_on');
          assert.property(res.body[0], 'replycount');
          assert.property(res.body[0], 'replies');
          done();
        });
      });
    });
    
    suite('DELETE', function() {
      test('DELETE Test with wrong id', function (done) {
        chai.request(server)
        .delete('/api/threads/test2')
        .send({
          thread_id: delThreadID,
          delete_password: 'testwrongpassword'
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          console.log(res.text);
          assert.equal(res.text, 'incorrect password');
          done();
        });
      });

      test('DELETE Test with right id', function (done) {
        chai.request(server)
        .delete('/api/threads/test2')
        .send({
          thread_id: delThreadID,
          delete_password: 'test'
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          console.log(res.text);
          assert.equal(res.text, 'success');
          done();
        });
      });
    });
    
    suite('PUT', function() {
      //Need to create a new thread to test 
      test('PUT Test', function (done) {
        chai.request(server)
        .post('/api/threads/test3')
        .send({
          text: 'test text',
          delete_password: 'test'
        })
        .end(function () {

        });

        //Get the thread id
        chai.request(server)
        .get('/api/threads/test3')
        .query({})
        .end(function (err, res) {
          delThreadID = res.body[0]._id;
        });

        //do the put request
        chai.request(server)
        .put('/api/threads/test3')
        .send({
          thread_id: delThreadID
        })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.text, 'success');
          done();
        });
      });

    });
    

  });
  
  suite('API ROUTING FOR /api/replies/:board', function() {
    
    suite('POST', function() {
      test('POST a reply', function (done) {
        chai.request(server)
        .post('/api/replies/test3')
        .send({
          text: 'test reply',
          delete_password: 'test delete',
          thread_id: delThreadID
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          done();
        });
      });
    });
    var replyid;
    suite('GET', function() {
      test('GET the replies', function (done) {
        chai.request(server)
        .get('/api/replies/test3')
        .query({thread_id: delThreadID})
        .end(function (err, res) {
          //{'board': ele.board, 'text': ele.threadText, '_id': ele._id, 'created_on': ele._id.getTimestamp(), 'bumped_on': ele._id.getTimestamp(), 'replycount': 0, replies: []};
          //{'board': r.board, '_id': r._id, 'created_on': r._id.getTimestamp(), 'text': r.threadText};
          assert.equal(res.status, 200);
          assert.isObject(res.body);
          replyid = res.body.replies[0]._id;
          done();
        });
      });
    });
    
    suite('PUT', function() {
      test('PUT a reply', function (done) {
        chai.request(server)
        .put('/api/replies/test3')
        .send({
          thread_id: delThreadID,
          reply_id: replyid
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.text, 'success');
          done();
        });
      });
    });
    
    suite('DELETE', function() {
      test('DELETE a reply incorrect password', function (done) {
        chai.request(server)
        .delete('/api/replies/test3')
        .send({
          thread_id: delThreadID,
          reply_id: replyid,
          delete_password: 'wrong password'
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.text, 'incorrect password');
          done();
        });
      });
      test('DELETE a reply correct password', function (done) {
        chai.request(server)
        .delete('/api/replies/test3')
        .send({
          thread_id: delThreadID,
          reply_id: replyid,
          delete_password: 'test delete'
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.text, 'success');
          done();
        });
      });
    });
    
  });

});
