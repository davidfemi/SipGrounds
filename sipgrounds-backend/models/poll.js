const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PollSchema = new Schema({
    question: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    options: [{
        text: {
            type: String,
            required: true,
            trim: true
        },
        votes: {
            type: Number,
            default: 0,
            min: 0
        },
        voters: [{
            type: Schema.Types.ObjectId,
            ref: 'User'
        }]
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    allowMultipleVotes: {
        type: Boolean,
        default: false // Single-select as per spec
    },
    startsAt: {
        type: Date,
        default: Date.now
    },
    endsAt: {
        type: Date,
        required: true
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    category: {
        type: String,
        enum: ['general', 'menu', 'cafe_features', 'events', 'feedback'],
        default: 'general'
    },
    targetAudience: {
        type: String,
        enum: ['all', 'frequent_customers', 'new_customers'],
        default: 'all'
    },
    pointsReward: {
        type: Number,
        default: 0,
        min: 0 // Points given for participating in poll
    },
    image: {
        url: String,
        filename: String
    }
}, {
    timestamps: true
});

// Virtual for total votes
PollSchema.virtual('totalVotes').get(function() {
    return this.options.reduce((total, option) => total + option.votes, 0);
});

// Virtual for checking if poll is currently active
PollSchema.virtual('isCurrentlyActive').get(function() {
    const now = new Date();
    return this.isActive && now >= this.startsAt && now <= this.endsAt;
});

// Method to check if user can vote
PollSchema.methods.canUserVote = function(userId) {
    const now = new Date();
    
    // Check if poll is active and within time range
    if (!this.isActive || now < this.startsAt || now > this.endsAt) {
        return { canVote: false, reason: 'Poll is not currently active' };
    }
    
    // Check if user has already voted (for single-select polls)
    if (!this.allowMultipleVotes) {
        const hasVoted = this.options.some(option => 
            option.voters.some(voter => voter.toString() === userId.toString())
        );
        if (hasVoted) {
            return { canVote: false, reason: 'User has already voted in this poll' };
        }
    }
    
    return { canVote: true };
};

// Method to record vote
PollSchema.methods.recordVote = function(userId, optionIndex) {
    if (optionIndex < 0 || optionIndex >= this.options.length) {
        throw new Error('Invalid option index');
    }
    
    const canVoteResult = this.canUserVote(userId);
    if (!canVoteResult.canVote) {
        throw new Error(canVoteResult.reason);
    }
    
    // Record the vote
    this.options[optionIndex].votes += 1;
    this.options[optionIndex].voters.push(userId);
    
    return this.save();
};

// Method to get poll results with percentages
PollSchema.methods.getResults = function() {
    const totalVotes = this.totalVotes;
    
    return this.options.map(option => ({
        text: option.text,
        votes: option.votes,
        percentage: totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0
    }));
};

module.exports = mongoose.model('Poll', PollSchema);
