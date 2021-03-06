/**
 * Created by admin on 15-03-04.
 */

var express = require('express');
var app = express();
var logger = require('./logger');
var leagueAPI = require('leagueapi');
var lolAPI = require('lolapi')('209ebe2d-e2dd-444a-8181-c3c95f15d8c2', 'na');
var mmr = require('opgg-mmr');

leagueAPI.setRateLimit(3000, 180000);
lolAPI.setRateLimit(3000, 180000);

leagueAPI.init('209ebe2d-e2dd-444a-8181-c3c95f15d8c2', 'na');

var route = '/api';

app.get(route+'/', function (req, res) {
    var freeChamps = [];

    leagueAPI.getChampions(true, function(err, champs) {
        champs.forEach(function(champ) {
            leagueAPI.Static.getChampionById(champ.id,'na',function(err, result) {
                if(champ.freeToPlay) {
                    freeChamps.push(result.name);
                }
                if (freeChamps.length == 10) {res.send(freeChamps);}
            });
        });
    });
})

app.get(route+'/summoner/id', function (req, res) {
    var name = req.param('summonerName');
    logger.trace('getting data of summoner %s...', name);
    leagueAPI.Summoner.getByName(name, 'na', function(err, result) {
        if (err) {
            logger.trace('error getting summoner by id');
            res.json({ret:1});
        }
        else {
            logger.trace('Got summoner data...', result);
            res.json(result);
        }
    });
})

app.get(route+'/summoner/currentgame', function (req, res) {
    var id = req.param('summonerId');
    id = Number(id);
    logger.trace('getting current game...');
    leagueAPI.getCurrentGame(id, 'na', function(err, result) {
        if (err) {
            logger.trace('get current game error, result is: ', result);
            if ( result == undefined ) {
                logger.trace('result is undefined');
                res.json( {ret: 1, result : 'The match is unavailable, player is probably not in game, try a different player'} );
            }
            //outPutErr(res , 500, err);
        }
        else
        {
            logger.trace( 'Got current game.');
            res.json( result );
        }
    });
})

app.get(route+'/summoner/currentgame_2', function (req, res) {
    var id = req.param('summonerId');
    id = Number(id);
    logger.trace('getting current game... using 2nd key');
    lolAPI.CurrentGame.getBySummonerId(id, function(err, result) {
        if (err) {
            logger.trace('using 2nd key...get current game error, result is: ', result);
            if ( result == undefined ) {
                logger.trace('result is undefined');
                res.json( {ret: 1, result : 'The match is unavailable, player is probably not in game, try a different player'} );
            }
            //outPutErr(res , 500, err);
        }
        else
        {
            logger.trace( 'Got current game. using 2nd key...');
            res.json( result );
        }
    });
})

app.get(route+'/summoner/solo_record', function (req, res) {
    var id = req.param('summonerId');
    id = Number(id);
    logger.trace('getting solo rank record of summoner %d', id);
    leagueAPI.getLeagueEntryData(id, 'na',function(err, result) {
        var soloRecord = {
            ret: 1,
            tier: 'unknown',
            queue: 'RANKED_SOLO_5x5'
        };
        if (err) {
            logger.trace('Error occurs, This summoner has no rank information');
            res.json(soloRecord);
        } else {
            if (result != null) {
                for ( var i in result[id] ) {
                    if ( result[id][i].queue == 'RANKED_SOLO_5x5' ) {
                        soloRecord = result[id][i]
                    }
                }
                logger.trace( 'Got solo rank record. using 1st key' );
                res.json( soloRecord );
            }
            else {
                logger.trace('No error, This summoner has no rank information');
                res.json(soloRecord);
            }
        }
    });
})


app.get(route+'/summoner/solo_record_2', function (req, res) {
    var id = req.param('summonerId');
    id = Number(id);
    logger.trace('getting solo rank record of summoner %d, using 2nd key', id);
    lolAPI.League.getEntriesBySummonerId(id, function(err, result) {
        var soloRecord = {
            ret: 1,
            tier: 'unknown',
            queue: 'RANKED_SOLO_5x5'
        };
        if (err) {
            logger.trace('Error occurs, This summoner has no rank information');
            res.json(soloRecord);
        } else {
            if (result != null) {
                for ( var i in result[id] ) {
                    if ( result[id][i].queue == 'RANKED_SOLO_5x5' ) {
                        soloRecord = result[id][i]
                    }
                }
                logger.trace( 'Got solo rank record. using 2nd key' );
                res.json( soloRecord );
            }
            else {
                logger.trace('This summoner has no rank information');
                res.json(soloRecord);
            }
        }
    });
})


app.get(route+'/team/rank_record', function (req, res) {
    var id = req.param('teamId');
    id = Number(id);
    lolAPI.League.getEntriesByTeamId(id, function(err, result) {
        if (err) {outPutErr(res , 500, err)};
        logger.trace('team rank info: ', result);
        res.json(result);
    });
})




app.get(route+'/match', function (req, res) {
    var id = req.param('matchId');
    id = Number(id);
    leagueAPI.getMatch(id, true, 'na', function(err, result) {
        if (err) {outPutErr(res , 500, err)};
        logger.trace('match info: ', result);
        res.json(result);
    });
})

app.get(route+'/team/by_summoner_id', function (req, res) {
    var id = req.param('summonerId');
    id = Number(id);
    lolAPI.Team.getBySummonerId(id, function(err, result) {
        if (err) {outPutErr(res , 500, err)};
        logger.trace('team info: ', result);
        res.json(result);
    });
})

app.get(route+'/champion/by_id', function (req, res) {
    var id = req.param('championId');
    id = Number(id);
    logger.trace('getting champion info...');
    lolAPI.Static.getChampion(id, function(err, result) {
        if (err) {outPutErr(res , 500, err)};
        logger.trace('Got champion info.');
        res.json(result);
    });
})

app.get(route+'/mmr', function (req, res) {
    var name = req.param('summonerName');
    logger.trace('getting mmr of %s ...', name);
    mmr(name, function(err, result) {
        if (err) {outPutErr(res , 500, err)};
        logger.trace('Got %s\'s mmr is: ', name);
        res.json(result);
    });
})

app.get(route+'/rank/stats', function (req, res) {
    var id = req.param('summonerId');
    id = Number(id);
    logger.trace('getting rank stats...');
    leagueAPI.Stats.getRanked(id, null, function(err, result) {
        if (err) {
            logger.trace('Summoner %d has no rank stats', id);
            res.json({ret:1});
        }
        else
        {
            logger.trace('Got rank stats.');
            res.json( result );
        }
    });
})

app.get(route+'/summoner/summary', function (req, res) {
    var id = req.param('summonerId');
    id = Number(id);
    leagueAPI.Stats.getPlayerSummary(id, null, 'na', function(err, result) {
        if (err) {outPutErr(res , 500, err)};
        res.json(result);
    });
})

var matchHistoryOpt = {rankedQueues: ['RANKED_SOLO_5x5'], beginIndex: 0, endIndex: 10};
app.get(route+'/summoner/matchHistory', function (req, res) {
    var id = req.param('summonerId');
    id = Number(id);
    logger.trace('getting match history...');
    leagueAPI.getMatchHistory(id, matchHistoryOpt, 'na',function(err, result) {
        if (err) {
            res.json({ret:1});
        }
        else
        {
            logger.trace( 'Got match history.');
            res.json( result );
        }
    });
})


app.get(route+'/featuredGames', function (req, res) {
    leagueAPI.getFeaturedGames('na', function(err, result) {
        if (err) {
            res.json({ret:1});
        }
        else {
            logger.trace('Got featured games');
            res.json(result);
        }
    })
});



var server = app.listen(28000);
console.log('Server is listening at', 28000)

server.timeout = 300000;


function outPutErr(res, code, err) {
    try {
        if (code === undefined) {
            code = 500;
        }
        if (err === undefined) {
            err = -111;
        }
        res.status(code);
        res.json({ret: err});
    }
    catch (err) {
        logger.error('Catch exception in outPutError, Err msg = %s', err);
    }
};