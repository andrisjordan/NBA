const mongoose = require('mongoose');

const gameSchema = mongoose.Schema({
    _id: {
        type: Number,
        required: true,
        unique: true,
    },
    TYPE: {
        type: String,
        required: true
    },
    GAME_DATE_EST: {
        type: String
    },
    GAME_DATE_EST_DATE: {
        type: Date
    },
    HOME_TEAM_ID: {
        type: Number,
        ref: 'Team',
        required: true
    },
    VISITOR_TEAM_ID: {
        type: Number,
        ref: 'Team',
        required: true
    },
    INACTIVE_PLAYERS: [{
        type: Number,
        ref: 'Player',
        required: true
    }],
    ELO_HOME: {
        type: Number
    },
    ELO_VISITOR: {
        type: Number
    },
    ODDS_HOME: {
        type: Number
    },
    ODDS_VISITOR: {
        type: Number
    },
    TOTAL_PTS_HOME: {
        type: Number
    },
    TOTAL_PTS_VISITOR: {
        type: Number
    },
    HOME_E_OFF_RATING: {
        type: Number
    },
    HOME_OFF_RATING: {
        type: Number
    },
    HOME_E_DEF_RATING: {
        type: Number
    },
    HOME_DEF_RATING: {
        type: Number
    },
    HOME_E_NET_RATING: {
        type: Number
    },
    HOME_NET_RATING: {
        type: Number
    },
    HOME_AST_PCT: {
        type: Number
    },
    HOME_AST_TOV: {
        type: Number
    },
    HOME_AST_RATIO: {
        type: Number
    },
    HOME_OREB_PCT: {
        type: Number
    },
    HOME_DREB_PCT: {
        type: Number
    },
    HOME_REB_PCT: {
        type: Number
    },
    HOME_TM_TOV_PCT: {
        type: Number
    },
    HOME_E_TM_TOV_PCT: {
        type: Number
    },
    HOME_EFG_PCT: {
        type: Number
    },
    HOME_TS_PCT: {
        type: Number
    },
    HOME_USG_PCT: {
        type: Number
    },
    HOME_E_USG_PCT: {
        type: Number
    },
    HOME_E_PACE: {
        type: Number
    },
    HOME_PACE: {
        type: Number
    },
    HOME_PIE: {
        type: Number
    },
    VISITOR_E_OFF_RATING: {
        type: Number
    },
    VISITOR_OFF_RATING: {
        type: Number
    },
    VISITOR_E_DEF_RATING: {
        type: Number
    },
    VISITOR_DEF_RATING: {
        type: Number
    },
    VISITOR_E_NET_RATING: {
        type: Number
    },
    VISITOR_NET_RATING: {
        type: Number
    },
    VISITOR_AST_PCT: {
        type: Number
    },
    VISITOR_AST_TOV: {
        type: Number
    },
    VISITOR_AST_RATIO: {
        type: Number
    },
    VISITOR_OREB_PCT: {
        type: Number
    },
    VISITOR_DREB_PCT: {
        type: Number
    },
    VISITOR_REB_PCT: {
        type: Number
    },
    VISITOR_TM_TOV_PCT: {
        type: Number
    },
    VISITOR_E_TM_TOV_PCT: {
        type: Number
    },
    VISITOR_EFG_PCT: {
        type: Number
    },
    VISITOR_TS_PCT: {
        type: Number
    },
    VISITOR_USG_PCT: {
        type: Number
    },
    VISITOR_E_USG_PCT: {
        type: Number
    },
    VISITOR_E_PACE: {
        type: Number
    },
    VISITOR_PACE: {
        type: Number
    },
    VISITOR_PIE: {
        type: Number
    },
    HOME_PTS: [{
        type: Number
    }],
    VISITOR_PTS: [{
        type: Number
    }],
    PLAYER_STATS: [{
        PLAYER: {
            type: Number,
            ref: 'Player',
            required: true
        },
        TYPE: {
            type: String
        },
        COMMENT: {
            type: String
        },
        MIN: {
            type: String
        },
        SPD: {
            type: Number
        },
        DIST: {
            type: Number
        },
        ORBC: {
            type: Number
        },
        DRBC: {
            type: Number
        },
        RBC: {
            type: Number
        },
        TCHS: {
            type: Number
        },
        SAST: {
            type: Number
        },
        FTAST: {
            type: Number
        },
        PASS: {
            type: Number
        },
        AST: {
            type: Number
        },
        CFGA: {
            type: Number
        },
        TCHS: {
            type: Number
        },
        CFG_PCT: {
            type: Number
        },
        UFGM: {
            type: Number
        },
        UFGA: {
            type: Number
        },
        UFG_PCT: {
            type: Number
        },
        FG_PCT: {
            type: Number
        },
        DFGM: {
            type: Number
        },
        DFGA: {
            type: Number
        },
        DFG_PCT: {
            type: Number
        },
        FGM: {
            type: Number
        },
        FGA: {
            type: Number
        },
        FG3M: {
            type: Number
        },
        FG3A: {
            type: Number
        },
        FG3_PCT: {
            type: Number
        },
        FTM: {
            type: Number
        },
        FTA: {
            type: Number
        },
        FT_PCT: {
            type: Number
        },
        OREB: {
            type: Number
        },
        DREB: {
            type: Number
        },
        REB: {
            type: Number
        },
        STL: {
            type: Number
        },
        BLK: {
            type: Number
        },
        TO: {
            type: Number
        },
        PF: {
            type: Number
        },
        PTS: {
            type: Number
        },
        PLUS_MINUS: {
            type: Number
        },
        E_OFF_RATING: {
            type: Number
        },
        OFF_RATING: {
            type: Number
        },
        E_DEF_RATING: {
            type: Number
        },
        DEF_RATING: {
            type: Number
        },
        E_NET_RATING: {
            type: Number
        },
        AST_PCT: {
            type: Number
        },
        AST_TOV: {
            type: Number
        },
        AST_RATIO: {
            type: Number
        },
        OREB_PCT: {
            type: Number
        },
        DREB_PCT: {
            type: Number
        },
        REB_PCT: {
            type: Number
        },
        TM_TOV_PCT: {
            type: Number
        },
        EFG_PCT: {
            type: Number
        },
        TS_PCT: {
            type: Number
        },
        USG_PCT: {
            type: Number
        },
        E_USG_PCT: {
            type: Number
        },
        E_PACE: {
            type: Number
        },
        PACE: {
            type: Number
        },
        PIE: {
            type: Number
        },
        LAST40: [{
            type: Number
        }]
    }],
    TOP_HOME: [{
        ID: {
            type: Number,
            ref: 'Player',
            required: true
        },
        PIEWEIGHT: {
            type: Number
        },
        PIEALL: {
            type: Number
        },
        PIEPLAYED: {
            type: Number
        },
        MINWEIGHT: {
            type: Number
        },
        MINALL: {
            type: Number
        },
        MINPLAYED: {
            type: Number
        },
    }],
    TOP_VISITOR: [{
        ID: {
            type: Number,
            ref: 'Player',
            required: true
        },
        PIEWEIGHT: {
            type: Number
        },
        PIEALL: {
            type: Number
        },
        PIEPLAYED: {
            type: Number
        },
        MINWEIGHT: {
            type: Number
        },
        MINALL: {
            type: Number
        },
        MINPLAYED: {
            type: Number
        },
    }],
})


module.exports = mongoose.model('Game', gameSchema);