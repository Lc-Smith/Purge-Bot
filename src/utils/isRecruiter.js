require('dotenv').config();

/**
 * Parse recruiter roles from .env as JSON
 * Example in .env:
 * recruiterRoles=["843137929278128148","1104506246339510393","1079932684874297414"]
 */
let recruiterRoles = [];
try {
    if (process.env.recruiterRoles) {
        recruiterRoles = JSON.parse(process.env.recruiterRoles);
        if (!Array.isArray(recruiterRoles)) {
            throw new Error('recruiterRoles is not an array in .env');
        }
    }
} catch (err) {
    console.error('Failed to parse recruiterRoles from .env:', err);
    recruiterRoles = [];
}

/**
 * Checks if a member has at least one recruiter role
 * @param {GuildMember} member
 * @returns {boolean}
 */
function isRecruiter(member) {
    if (!member || !member.roles || !member.roles.cache) return false;

    return recruiterRoles.some(roleId => member.roles.cache.has(roleId));
}

module.exports = { isRecruiter };
