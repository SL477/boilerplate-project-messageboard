/*
 *
 *
 *       Complete the API routing below
 *
 *
 */

'use strict';

import { Schema, model, connect } from 'mongoose';
import { config } from 'dotenv';
config();
const CONNECTION_STRING = process.env.DB;

const threadSchema = new Schema({
    board: { type: String, required: true },
    threadText: { type: String, required: true },
    delete_password: { type: String, required: true },
    reported: { type: Boolean },
});
const threadRecord = model('threadRecords', threadSchema);

const replySchema = new Schema({
    board: { type: String, required: true },
    thread: { type: String, required: true },
    threadText: { type: String, required: true },
    delete_password: { type: String, required: true },
    reported: { type: Boolean },
});
const replyRecord = model('replyRecords', replySchema);

export default function (app) {
    connect(CONNECTION_STRING)
        .then(() => console.log('DB Connected'))
        .catch((err) => console.error(err));

    app.route('/api/threads/:board')
        /**
         * @swagger
         * /api/threads/{board}:
         *      post:
         *          description: Create a new thread
         *          consumes:
         *              - application/x-www-form-urlencoded
         *          parameters:
         *              - in: path
         *                name: board
         *                type: string
         *                required: true
         *                description: the name of the board to create the thread in
         *              - in: formData
         *                name: text
         *                type: string
         *                required: true
         *                description: the text of the board
         *              - in: formData
         *                name: delete_password
         *                required: true
         *                description: the password to delete the thread
         */
        .post(function (req, res) {
            threadRecord
                .create({
                    board: req.params.board,
                    threadText: req.body.text,
                    delete_password: req.body.delete_password,
                    reported: false,
                })
                .then(() => res.redirect('/b/' + req.params.board + '/'))
                .catch((err) => {
                    console.log(err);
                    res.send(err);
                });
        })
        /**
         * @swagger
         * /api/threads/{board}:
         *      get:
         *          description: Get the top 10 threads & their 3 most recent replies
         *          parameters:
         *              - in: path
         *                name: board
         *                type: string
         *                required: true
         *                description: the name of the board to get the threads for
         *          responses:
         *              200:
         *                  description: shows the top 10 threads and their 3 most recent replies
         *                  content:
         *                      application/json:
         *                          schema:
         *                              type: array
         *                              items:
         *                                  type: object
         *                                  properties:
         *                                      board:
         *                                          type: string
         *                                          description: the name of the board
         *                                      text:
         *                                          type: string
         *                                          description: the text of the board
         *                                      _id:
         *                                          type: string
         *                                          description: the ID of the thread
         *                                      created_on:
         *                                          type: string
         *                                          format: date
         *                                          description: when this was created
         *                                      bumped_on:
         *                                          type: string
         *                                          format: date
         *                                          description: the date it was bumped
         *                                      replycount:
         *                                          type: number
         *                                          description: the number of replies
         *                                      replies:
         *                                          type: array
         *                                          items:
         *                                              type: object
         *                                              properties:
         *                                                  board:
         *                                                      type: string
         *                                                      description: the name of the board
         *                                                  _id:
         *                                                      type: string
         *                                                      description: the ID of the reply
         *                                                  created_on:
         *                                                      type: string
         *                                                      format: date
         *                                                      description: when the reply was created
         *                                                  text:
         *                                                      type: string
         *                                                      description: the reply text
         */
        .get(function (req, res) {
            threadRecord
                .find({ board: req.params.board })
                .sort({ created_on: -1 })
                .limit(10)
                .then(async (docs) => {
                    const resArray = docs.map((ele) => {
                        return {
                            board: ele.board,
                            text: ele.threadText,
                            _id: ele._id,
                            created_on: ele._id.getTimestamp(),
                            bumped_on: ele._id.getTimestamp(),
                            replycount: 0,
                            replies: [],
                        };
                    });
                    await replyRecord
                        .find({
                            board: req.params.board,
                        })
                        .sort({ created_on: -1 })
                        .then((reps) => {
                            reps.forEach((r) => {
                                const reply = {
                                    board: r.board,
                                    _id: r._id,
                                    created_on: r._id.getTimestamp(),
                                    text: r.threadText,
                                };
                                const threadIdx = resArray.findIndex(
                                    (t) => t._id == r.thread
                                );

                                if (
                                    threadIdx > -1 &&
                                    resArray[threadIdx].replycount < 3
                                ) {
                                    resArray[threadIdx].replies.push(reply);
                                    resArray[threadIdx].replycount++;
                                } else if (threadIdx > -1) {
                                    resArray[threadIdx].replycount++;
                                }
                            });
                        })
                        .catch((err) => console.error(err));
                    res.send(resArray);
                })
                .catch((err) => {
                    console.error(err);
                    res.send([]);
                });
        })
        /**
         * @swagger
         * /api/threads/{board}:
         *      delete:
         *          description: delete a thread
         *          consumes:
         *              - application/x-www-form-urlencoded
         *          parameters:
         *              - in: path
         *                name: board
         *                type: string
         *                required: true
         *                description: the name of the board to delete the thread on
         *              - in: formData
         *                name: thread_id
         *                type: string
         *                description: the thread to delete
         *              - in: formData
         *                name: delete_password
         *                type: string
         *                description: the password to delete the thread
         *          responses:
         *              200:
         *                  description: Either success or incorrect password
         */
        .delete(function (req, res) {
            // console.log(req.body);
            threadRecord
                .findOneAndDelete({
                    _id: req.body.thread_id,
                    delete_password: req.body.delete_password,
                })
                .then((doc) => {
                    if (doc) {
                        res.send('success');
                    } else {
                        res.send('incorrect password');
                    }
                })
                .catch((err) => {
                    console.log(err), res.send('incorrect password');
                });
        })
        /**
         * @swagger
         * /api/threads/{board}:
         *      put:
         *          description: report a thread
         *          consumes:
         *              - application/x-www-form-urlencoded
         *          parameters:
         *              - in: path
         *                name: board
         *                type: string
         *                required: true
         *                description: the name of the board to report the thread on
         *              - in: formData
         *                name: thread_id
         *                type: string
         *                description: the thread to report
         *          responses:
         *              200:
         *                  description: Either success or incorrect password
         */
        .put(function (req, res) {
            threadRecord
                .findOneAndUpdate(
                    {
                        //Conditions
                        _id: req.body.thread_id,
                    },
                    {
                        //update
                        reported: true,
                    }
                )
                .then(() => res.send('success'))
                .catch((err) => {
                    console.error(err);
                    res.send('success');
                });
        });

    app.route('/api/replies/:board')
        /**
         * @swagger
         * /api/replies/{board}:
         *      post:
         *          description: post a reply
         *          consumes:
         *              - application/x-www-form-urlencoded
         *          parameters:
         *              - in: path
         *                name: board
         *                type: string
         *                required: true
         *                description: the name of the board to reply to
         *              - in: formData
         *                name: thread_id
         *                type: string
         *                description: the thread to reply to
         *              - in: formData
         *                name: text
         *                type: string
         *                description: the reply text
         *              - in: formData
         *                name: delete_password
         *                type: string
         *                description: the password to delete the reply
         *          responses:
         *              200:
         *                  description: The data of the reply
         *                  content:
         *                      application/json:
         *                          schema:
         *                              type: object
         *                              properties:
         *                                  board:
         *                                      type: string
         *                                      description: the board the reply is on
         *                                  thread:
         *                                      type: string
         *                                      description: the ID of the thread
         *                                  threadText:
         *                                      type: string
         *                                      description: the text on the thread
         *                                  delete_password:
         *                                      type: string
         *                                      description: the password to delete the reply
         *                                  reported:
         *                                      type: boolean
         *                                      description: whether or not the reply is reported
         */
        .post(function (req, res) {
            console.log(
                '/api/replies/:board post',
                req.body.thread_id,
                req.params.board,
                req.body.text,
                req.body.delete_password
            );
            replyRecord
                .create({
                    board: req.params.board,
                    thread: req.body.thread_id,
                    threadText: req.body.text,
                    delete_password: req.body.delete_password,
                    reported: false,
                })
                .then((d) => {
                    // console.log('/api/replies/:board post', d);
                    // res.redirect(
                    //     '/b/' + req.params.board + '/' + req.body.thread_id
                    // );
                    res.send({
                        board: d.board,
                        _id: d._id,
                        created_on: d._id.getTimestamp(),
                        text: d.threadText,
                        thread: d.thread,
                    });
                })
                .catch((err) => {
                    console.log(err);
                    res.send(err);
                });
        })
        /**
         * @swagger
         * /api/replies/{board}:
         *      get:
         *          description: get the replies on the thread
         *          parameters:
         *              - in: path
         *                name: board
         *                type: string
         *                required: true
         *                description: the name of the board the replies are on
         *              - in: query
         *                name: thread_id
         *                type: string
         *                description: the ID of the thread to get the replies to
         *          responses:
         *              200:
         *                  description: shows the top 10 threads and their 3 most recent replies
         *                  content:
         *                      application/json:
         *                          schema:
         *                              type: array
         *                              items:
         *                                  type: object
         *                                  properties:
         *                                      board:
         *                                          type: string
         *                                          description: the name of the board
         *                                      text:
         *                                          type: string
         *                                          description: the text of the thread
         *                                      _id:
         *                                          type: string
         *                                          description: the ID of the thread
         *                                      created_on:
         *                                          type: string
         *                                          format: date
         *                                          description: when this was created
         *                                      bumped_on:
         *                                          type: string
         *                                          format: date
         *                                          description: the date it was bumped
         *                                      replycount:
         *                                          type: number
         *                                          description: the number of replies
         *                                      replies:
         *                                          type: array
         *                                          items:
         *                                              type: object
         *                                              properties:
         *                                                  board:
         *                                                      type: string
         *                                                      description: the name of the board
         *                                                  _id:
         *                                                      type: string
         *                                                      description: the ID of the reply
         *                                                  created_on:
         *                                                      type: string
         *                                                      format: date
         *                                                      description: when the reply was created
         *                                                  text:
         *                                                      type: string
         *                                                      description: the reply text
         */
        .get(function (req, res) {
            /*console.log(req.params);
    console.log(req.params.thread_id);
    console.log(req.body);*/

            const finder = { board: req.params.board };

            if (req.query.thread_id) {
                finder['_id'] = req.query.thread_id;
            }
            // console.log('/api/replies/:board', finder);

            threadRecord
                .find(finder)
                .then(async (docs) => {
                    const resArray = docs.map((ele) => {
                        return {
                            board: ele.board,
                            text: ele.threadText,
                            _id: ele._id,
                            created_on: ele._id.getTimestamp(),
                            bumped_on: ele._id.getTimestamp(),
                            replycount: 0,
                            replies: [],
                        };
                    });
                    await replyRecord
                        .find({ board: req.params.board })
                        .sort({ created_on: -1 })
                        .then((reps) => {
                            reps.forEach((r) => {
                                const reply = {
                                    board: r.board,
                                    _id: r._id,
                                    created_on: r._id.getTimestamp(),
                                    text: r.threadText,
                                };

                                const threadIdx = resArray.findIndex(
                                    (t) => t._id == r.thread
                                );
                                if (threadIdx > -1) {
                                    resArray[threadIdx].replies.push(reply);
                                    resArray[threadIdx].replycount++;
                                }
                            });
                        });
                    if (resArray.length >= 0) {
                        res.send(resArray[0]);
                    } else {
                        res.send({});
                    }
                    // res.send(resArray);
                })
                .catch((err) => {
                    console.log(err);
                    res.send({ replies: [] });
                });
        })
        /**
         * @swagger
         * /api/replies/{board}:
         *      delete:
         *          description: delete a reply on the thread
         *          consumes:
         *              - application/x-www-form-urlencoded
         *          parameters:
         *              - in: path
         *                name: board
         *                type: string
         *                required: true
         *                description: the name of the board the replies are on
         *              - in: formData
         *                name: thread_id
         *                type: string
         *                description: the ID of the thread to delete the reply on
         *              - in: formData
         *                name: _id
         *                type: string
         *                description: the ID of the reply to delete
         *              - in: formData
         *                name: delete_password
         *                type: string
         *                description: the password to delete the reply
         *          responses:
         *              200:
         *                  description: either success or incorrect password
         */
        .delete(function (req, res) {
            replyRecord
                .findOneAndUpdate(
                    {
                        // conditions
                        _id: req.body.reply_id,
                        delete_password: req.body.delete_password,
                        thread: req.body.thread_id,
                    },
                    {
                        // update
                        threadText: '[deleted]',
                    }
                )
                .then((doc) => {
                    // console.log(
                    //     'delete reply',
                    //     doc,
                    //     req.body.thread_id,
                    //     req.body.delete_password,
                    //     req
                    // );
                    if (!doc) {
                        res.send('incorrect password');
                    } else {
                        res.send('success');
                    }
                })
                .catch((err) => {
                    console.log(err);
                    res.send('incorrect password');
                });
        })
        /**
         * @swagger
         * /api/replies/{board}:
         *      put:
         *          description: report a reply on the thread
         *          consumes:
         *              - application/x-www-form-urlencoded
         *          parameters:
         *              - in: path
         *                name: board
         *                type: string
         *                required: true
         *                description: the name of the board the replies are on
         *              - in: formData
         *                name: thread_id
         *                type: string
         *                description: the ID of the thread to delete the reply on
         *              - in: formData
         *                name: _id
         *                type: string
         *                description: the ID of the reply to delete
         *          responses:
         *              200:
         *                  description: returns success
         */
        .put(function (req, res) {
            replyRecord
                .findOneAndUpdate(
                    {
                        // Conditions
                        thread: req.body.thread_id,
                        _id: req.body.thread_id,
                    },
                    {
                        // update
                        reported: true,
                    }
                )
                .then(() => res.send('success'))
                .catch((err) => {
                    console.log(err);
                    res.send('success');
                });
        });
}
