const express = require('express')

const cards = express.Router();

const db = require('../db/conn')

cards.route('/questions').get(async (req,res) => {

    const numCards = +req.query.numCards
    const pack = req.query.pack

    const dbConnect = db.getDb();

    dbConnect
        .collection('questions')
        .aggregate([
            { "$match": { "numAnswers" : 1, "dncahPack": pack }}, 
            { "$sample": { "size": numCards }}
            ])
        .toArray((err,result) => {
            if (err) {
                return res.status(400).send('Error')
            } 
            
            res.json(result)
        })
})

cards.route('/answers').get(async (req,res) => {

    const numCards = +req.query.numCards
    const pack = req.query.pack

    const dbConnect = db.getDb();

    dbConnect
        .collection('answers')
        .aggregate([
            { "$match": { "dncahPack": pack }},
            { "$sample": { "size": numCards }}
            ]
        )
        .toArray((err,result) => {
            if (err) {
              return res.status(400).send('Error')
            } 
            
            res.json(result)
        })
})

cards.route('/packs').get(async (req,res) => {
    const dbConnect = db.getDb();

    dbConnect
        .collection('packs')
        .aggregate(
            [{"$sort": {"popularity": 1}}]
        )
        .toArray((err,result) => {
            if (err) {
                return res.status(400).send('Error')
            }

            res.json(result)
        })

})

module.exports = cards