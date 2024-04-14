/*
 *
 *
 *       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
 *       -----[Keep the tests in the same order!]-----
 *       (if additional are added, keep them at the very end!)
 */

import chaiHttp from 'chai-http';
import * as chai from 'chai';
const assert = chai.assert;
import server from '../server.js';
import { suite, test } from 'mocha';

const chaiServer = chai.use(chaiHttp);

suite('Functional Tests', function () {
    var delThreadID;
    suite('API ROUTING FOR /api/threads/:board', function () {
        suite('POST', function () {
            test('Post test', function (done) {
                chaiServer
                    .request(server)
                    .post('/api/threads/test2')
                    .send({
                        text: 'test text',
                        delete_password: 'test',
                    })
                    .end(function (err, res) {
                        // console.log(res);
                        assert.equal(res.status, 200);

                        done();
                    });
            });
        });

        suite('GET', function () {
            test('GET Test', function (done) {
                chaiServer
                    .request(server)
                    .get('/api/threads/test2')
                    .query({})
                    .end(function (err, res) {
                        assert.equal(res.status, 200);
                        assert.isArray(res.body);
                        assert.property(res.body[0], 'board');
                        assert.property(res.body[0], 'text');
                        assert.property(res.body[0], '_id');
                        delThreadID = res.body[0]._id;
                        assert.property(res.body[0], 'created_on');
                        assert.property(res.body[0], 'bumped_on');
                        assert.property(res.body[0], 'replycount');
                        assert.property(res.body[0], 'replies');
                        done();
                    });
            });
        });

        suite('DELETE', function () {
            test('DELETE Test with wrong id', function (done) {
                chaiServer
                    .request(server)
                    .delete('/api/threads/test2')
                    .send({
                        thread_id: delThreadID,
                        delete_password: 'testwrongpassword',
                    })
                    .end(function (err, res) {
                        assert.equal(res.status, 200);
                        // console.log(res.text);
                        assert.equal(res.text, 'incorrect password');
                        done();
                    });
            });

            test('DELETE Test with right id', function (done) {
                chaiServer
                    .request(server)
                    .delete('/api/threads/test2')
                    .send({
                        thread_id: delThreadID,
                        delete_password: 'test',
                    })
                    .end(function (err, res) {
                        assert.equal(res.status, 200);
                        // console.log(res.text);
                        assert.equal(res.text, 'success');
                        done();
                    });
            });
        });

        suite('PUT', function () {
            //Need to create a new thread to test
            test('PUT Test', function (done) {
                chaiServer
                    .request(server)
                    .post('/api/threads/test3')
                    .send({
                        text: 'test text',
                        delete_password: 'test',
                    })
                    .end(function () {});

                //Get the thread id
                chaiServer
                    .request(server)
                    .get('/api/threads/test3')
                    .query({})
                    .end(function (err, res) {
                        delThreadID = res.body[0]._id;
                    });

                //do the put request
                chaiServer
                    .request(server)
                    .put('/api/threads/test3')
                    .send({
                        thread_id: delThreadID,
                    })
                    .end(function (err, res) {
                        assert.equal(res.status, 200);
                        assert.equal(res.text, 'success');
                        done();
                    });
            });
        });
    });

    suite('API ROUTING FOR /api/replies/:board', function () {
        suite('POST', function () {
            test('POST a reply', function (done) {
                chaiServer
                    .request(server)
                    .post('/api/replies/test3')
                    .send({
                        text: 'test reply',
                        delete_password: 'test delete',
                        thread_id: delThreadID,
                    })
                    .end(function (err, res) {
                        assert.equal(res.status, 200);
                        done();
                    });
            });
        });
        var replyid;
        suite('GET', function () {
            test('GET the replies', function (done) {
                chaiServer
                    .request(server)
                    .get('/api/replies/test3?thread_id=' + delThreadID)
                    // .query({ thread_id: delThreadID })
                    .end(function (err, res) {
                        //{'board': ele.board, 'text': ele.threadText, '_id': ele._id, 'created_on': ele._id.getTimestamp(), 'bumped_on': ele._id.getTimestamp(), 'replycount': 0, replies: []};
                        //{'board': r.board, '_id': r._id, 'created_on': r._id.getTimestamp(), 'text': r.threadText};
                        assert.equal(res.status, 200);
                        assert.isObject(res.body);
                        // assert.isArray(res.body);
                        // replyid = res.body.replies[0]._id;
                        // assert.isString(
                        //     res.body._id,
                        //     `thread id ${delThreadID}, body: ${JSON.stringify(res.body)} url: ${'/api/replies/test3?thread_id=' + delThreadID}`
                        // );
                        // replyid = res.body._id;
                        // console.log('GET the replies', res.body);
                        // replyid = res.body[0]._id;
                        done();
                    });
            });
        });

        suite('PUT', function () {
            test('PUT a reply', function (done) {
                chaiServer
                    .request(server)
                    .put('/api/replies/test3')
                    .send({
                        thread_id: delThreadID,
                        reply_id: replyid,
                    })
                    .end(function (err, res) {
                        assert.equal(res.status, 200);
                        assert.equal(res.text, 'success');
                        done();
                    });
            });
        });

        suite('DELETE', function () {
            test('DELETE a reply incorrect password', function (done) {
                chaiServer
                    .request(server)
                    .delete('/api/replies/test3')
                    .send({
                        thread_id: delThreadID,
                        reply_id: replyid,
                        delete_password: 'wrong password',
                    })
                    .end(function (err, res) {
                        assert.equal(res.status, 200);
                        assert.equal(res.text, 'incorrect password');
                        done();
                    });
            });
            test('DELETE a reply correct password', function (done) {
                chaiServer
                    .request(server)
                    .post('/api/replies/test3')
                    .send({
                        text: 'test reply',
                        delete_password: 'test delete',
                        thread_id: delThreadID,
                    })
                    .end(function (err, res) {
                        assert.equal(res.status, 200);
                        replyid = res.body._id;

                        chaiServer
                            .request(server)
                            .delete('/api/replies/test3')
                            .send({
                                thread_id: delThreadID,
                                reply_id: replyid,
                                delete_password: 'test delete',
                            })
                            .end(function (err1, res1) {
                                assert.equal(res1.status, 200);
                                console.log(
                                    'DELETE a reply correct password',
                                    delThreadID,
                                    replyid
                                );
                                assert.equal(
                                    res1.text,
                                    'success',
                                    `thread: ${delThreadID}, replyid: ${replyid}`
                                );

                                done();
                            });
                    });
            });
        });
    });
});
