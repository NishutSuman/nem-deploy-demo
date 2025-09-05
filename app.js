// const Redis = require("ioredis");
// const redis = new Redis();  // ----------> mongoose.connect()

// redis.set("my_key", "Hello Redis");

const cron = require('node-cron');

// Run a task on every 2 seconds
cron.schedule('*/2 * * * * *', () => {
  console.log('running a task every 2 seconds');
});

// Birthday Wish Job

// There will be one endpoint, which will be attached to a controller having business logic to check all the date of birth of employees matching with today's date

// http://localhost:5000/api/check-birthday  --> 
// --> Return all the employeees name and profile pics
// --> Set a cron job which will run this birthdayChecker function

// --> after getting the employee name, send them birthday wish as notification (email/push)
// http://localhost:5000/api/send-birthday-wish  --> controller --> nodemailer