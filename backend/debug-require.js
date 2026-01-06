
try {
    console.log('Loading auth...');
    const auth = require('./api/auth');
    console.log('Loading users...');
    const users = require('./api/users');
    console.log('Loading content...');
    const content = require('./api/content');
    console.log('Loading drops...');
    const drops = require('./api/drops');
    console.log('Loading placeholder...');
    const placeholder = require('./api/placeholder');
    console.log('Loading portfolio...');
    const portfolio = require('./api/portfolio');

    console.log('Portfolio type:', typeof portfolio);
    console.log('Is Function?', typeof portfolio === 'function');
    console.log('Is Router?', Object.getPrototypeOf(portfolio) === Function.prototype);
} catch (e) {
    console.error(e);
}

try {
    const users = require('./api/users');
    console.log('Users type:', typeof users);
} catch (e) {
    console.error(e);
}
