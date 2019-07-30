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
    var delThreadID;
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
      
    });
    
    suite('GET', function() {
      
    });
    
    suite('PUT', function() {
      
    });
    
    suite('DELETE', function() {
      
    });
    
  });

});
