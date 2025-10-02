const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.dbUrl, {
    dbName: process.env.dbName,
})
.then(() => console.log('✅ MongoDB connected'))
.catch(console.error);

module.exports = mongoose;