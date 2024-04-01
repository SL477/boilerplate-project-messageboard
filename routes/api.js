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
        .get(function (req, res) {
            threadRecord
                .find({ board: req.params.board })
                .sort({ created_on: -1 })
                .limit(10)
                .then(async (docs) => {
                    const resArray = await Promise.all(
                        docs.map(async (ele) => {
                            const ret = {
                                board: ele.board,
                                text: ele.threadText,
                                _id: ele._id,
                                created_on: ele._id.getTimestamp(),
                                bumped_on: ele._id.getTimestamp(),
                                replycount: 0,
                                replies: [],
                            };

                            // get the three most recent replies
                            await replyRecord
                                .find({
                                    board: req.params.board,
                                    thread: ele._id,
                                })
                                .sort({ created_on: -1 })
                                .limit(3)
                                .then((reps) => {
                                    ret.replies = reps.map((r) => {
                                        return {
                                            board: r.board,
                                            _id: r._id,
                                            created_on: r._id.getTimestamp(),
                                            text: r.threadText,
                                        };
                                    });
                                    ret.replycount = reps.length;
                                })
                                .catch((err) => console.error(err));
                            return ret;
                        })
                    );
                    res.send(resArray);
                })
                .catch((err) => {
                    console.error(err);
                    res.send([]);
                });
        })
        .delete(function (req, res) {
            console.log(req.body);
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
        .post(function (req, res) {
            console.log(req.body.thread_id);
            replyRecord
                .create({
                    board: req.params.board,
                    thread: req.body.thread_id,
                    threadText: req.body.text,
                    delete_password: req.body.delete_password,
                    reported: false,
                })
                .then(() =>
                    res.redirect(
                        '/b/' + req.params.board + '/' + req.body.thread_id
                    )
                )
                .catch((err) => {
                    console.log(err);
                    res.send(err);
                });
        })
        .get(function (req, res) {
            /*console.log(req.params);
    console.log(req.params.thread_id);
    console.log(req.body);*/

            const finder = { board: req.params.board };

            if (req.params.thread_id) {
                finder['_id'] = req.params.thread_id;
            }

            threadRecord
                .find(finder)
                .then(async (docs) => {
                    const resArray = await Promise.all(
                        docs.map(async (ele) => {
                            const ret = {
                                board: ele.board,
                                text: ele.threadText,
                                _id: ele._id,
                                created_on: ele._id.getTimestamp(),
                                bumped_on: ele._id.getTimestamp(),
                                replycount: 0,
                                replies: [],
                            };

                            // get the three most recent replies
                            await replyRecord
                                .find({ board: ele.board, thread: ele._id })
                                .sort({ created_on: -1 })
                                .limit(3)
                                .then((reps) => {
                                    ret.replies = reps.map((r) => {
                                        return {
                                            board: r.board,
                                            _id: r._id,
                                            created_on: r._id.getTimestamp(),
                                            text: r.threadText,
                                        };
                                    });
                                    ret.replycount = reps.length;
                                })
                                .catch((err) => console.error(err));

                            return ret;
                        })
                    );

                    res.send(resArray);
                })
                .catch((err) => {
                    console.log(err);
                    res.send([]);
                });
        })
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
