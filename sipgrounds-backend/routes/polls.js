const express = require('express');
const router = express.Router();
const Poll = require('../models/poll');
const User = require('../models/user');
const catchAsync = require('../utils/catchAsync');

// Middleware for authentication
const isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({
            success: false,
            error: 'Authentication required'
        });
    }
    next();
};

// Get all active polls
router.get('/', catchAsync(async (req, res) => {
    const { category } = req.query;
    
    const query = { 
        isActive: true,
        startsAt: { $lte: new Date() },
        endsAt: { $gte: new Date() }
    };
    
    if (category) query.category = category;
    
    const polls = await Poll.find(query)
        .populate('createdBy', 'username')
        .sort({ createdAt: -1 });
    
    // Calculate results for each poll
    const pollsWithResults = polls.map(poll => {
        const pollObj = poll.toObject();
        pollObj.results = poll.getResults();
        pollObj.totalVotes = poll.totalVotes;
        pollObj.isCurrentlyActive = poll.isCurrentlyActive;
        
        // Don't expose individual voters for privacy
        pollObj.options = pollObj.options.map(option => ({
            text: option.text,
            votes: option.votes
        }));
        
        return pollObj;
    });
    
    res.json({
        success: true,
        data: { polls: pollsWithResults }
    });
}));

// Get specific poll details
router.get('/:id', catchAsync(async (req, res) => {
    const poll = await Poll.findById(req.params.id)
        .populate('createdBy', 'username');
    
    if (!poll) {
        return res.status(404).json({
            success: false,
            error: 'Poll not found'
        });
    }
    
    const pollObj = poll.toObject();
    pollObj.results = poll.getResults();
    pollObj.totalVotes = poll.totalVotes;
    pollObj.isCurrentlyActive = poll.isCurrentlyActive;
    
    // Check if user has voted (if authenticated)
    let userHasVoted = false;
    if (req.user) {
        userHasVoted = poll.options.some(option => 
            option.voters.some(voter => voter.toString() === req.user._id.toString())
        );
    }
    
    pollObj.userHasVoted = userHasVoted;
    
    // Don't expose individual voters for privacy
    pollObj.options = pollObj.options.map(option => ({
        text: option.text,
        votes: option.votes
    }));
    
    res.json({
        success: true,
        data: { poll: pollObj }
    });
}));

// Vote on a poll
router.post('/:id/vote', isLoggedIn, catchAsync(async (req, res) => {
    const { optionIndex } = req.body;
    
    if (optionIndex === undefined || optionIndex < 0) {
        return res.status(400).json({
            success: false,
            error: 'Valid option index is required'
        });
    }
    
    const poll = await Poll.findById(req.params.id);
    if (!poll) {
        return res.status(404).json({
            success: false,
            error: 'Poll not found'
        });
    }
    
    try {
        await poll.recordVote(req.user._id, optionIndex);
        
        // Award points if configured
        if (poll.pointsReward > 0) {
            const user = await User.findById(req.user._id);
            await user.addPoints(poll.pointsReward, `Participated in poll: ${poll.question}`);
        }
        
        res.json({
            success: true,
            data: {
                poll: {
                    _id: poll._id,
                    question: poll.question,
                    results: poll.getResults(),
                    totalVotes: poll.totalVotes
                },
                pointsEarned: poll.pointsReward
            },
            message: poll.pointsReward > 0 
                ? `Vote recorded! You earned ${poll.pointsReward} points.` 
                : 'Vote recorded successfully!'
        });
        
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
}));

// Create new poll (admin function)
router.post('/', isLoggedIn, catchAsync(async (req, res) => {
    const {
        question,
        description,
        options,
        category = 'general',
        durationDays = 7,
        pointsReward = 0,
        targetAudience = 'all'
    } = req.body;
    
    if (!question || !options || !Array.isArray(options) || options.length < 2) {
        return res.status(400).json({
            success: false,
            error: 'Question and at least 2 options are required'
        });
    }
    
    const endsAt = new Date();
    endsAt.setDate(endsAt.getDate() + durationDays);
    
    const poll = new Poll({
        question,
        description,
        options: options.map(optionText => ({ text: optionText })),
        category,
        endsAt,
        pointsReward,
        targetAudience,
        createdBy: req.user._id
    });
    
    await poll.save();
    
    res.status(201).json({
        success: true,
        data: { poll },
        message: 'Poll created successfully'
    });
}));

// Get poll results (detailed view for admin)
router.get('/:id/results', isLoggedIn, catchAsync(async (req, res) => {
    const poll = await Poll.findById(req.params.id)
        .populate('createdBy', 'username')
        .populate('options.voters', 'username');
    
    if (!poll) {
        return res.status(404).json({
            success: false,
            error: 'Poll not found'
        });
    }
    
    // Only poll creator or admin can see detailed results
    if (poll.createdBy._id.toString() !== req.user._id.toString()) {
        return res.status(403).json({
            success: false,
            error: 'Permission denied'
        });
    }
    
    const results = {
        poll: {
            _id: poll._id,
            question: poll.question,
            description: poll.description,
            category: poll.category,
            totalVotes: poll.totalVotes,
            isCurrentlyActive: poll.isCurrentlyActive,
            createdAt: poll.createdAt,
            endsAt: poll.endsAt
        },
        options: poll.options.map(option => ({
            text: option.text,
            votes: option.votes,
            percentage: poll.totalVotes > 0 ? Math.round((option.votes / poll.totalVotes) * 100) : 0,
            voters: option.voters.map(voter => voter.username)
        }))
    };
    
    res.json({
        success: true,
        data: { results }
    });
}));

// Get user's voting history
router.get('/my-votes', isLoggedIn, catchAsync(async (req, res) => {
    const polls = await Poll.find({
        'options.voters': req.user._id
    })
    .populate('createdBy', 'username')
    .sort({ createdAt: -1 });
    
    const votingHistory = polls.map(poll => {
        const votedOption = poll.options.find(option => 
            option.voters.some(voter => voter.toString() === req.user._id.toString())
        );
        
        return {
            poll: {
                _id: poll._id,
                question: poll.question,
                category: poll.category,
                createdAt: poll.createdAt,
                endsAt: poll.endsAt,
                pointsReward: poll.pointsReward
            },
            votedFor: votedOption ? votedOption.text : null,
            results: poll.getResults()
        };
    });
    
    res.json({
        success: true,
        data: { votingHistory }
    });
}));

module.exports = router;
