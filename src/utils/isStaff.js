require('dotenv').config();

let adminRoles = [];
try {
    if (process.env.adminRoles) {
        adminRoles = JSON.parse(process.env.adminRoles);
        if (!Array.isArray(adminRoles)) {
            throw new Error('adminRoles is not an array in .env');
        }
    }
} catch (err) {
    console.error('Failed to parse adminRoles from .env:', err);
    adminRoles = [];
}

function isStaff(member) {
    if (!member || !member.roles || !member.roles.cache) return false;

    // No need to trim here — JSON should be clean strings
    return adminRoles.some(roleId => member.roles.cache.has(roleId));
}

module.exports = { isStaff };
