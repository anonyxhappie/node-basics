/**
 * Create a program to generate a report on a specified time during a week 
 * to find out how many project members have entered timesheet and 
 * how many have missed to enter it by deadline. 
 * The report should be sent to project manager and 
 * reminder email should be sent to defaulters.
 */
/**
 * Set cronjob for weekly running the script 
 */
var nodemailer = require('nodemailer');
var mongoClient = require('mongodb').MongoClient;
var DB_NAME = 'timetrack';
var TABLE_NAME = 'members';
var dbUrl = 'mongodb://localhost:27017/' + DB_NAME;
var date = new Date();
var mailingDay = 6; // Friday
var mailingHour = 10; // 10:00

function main(){
  
 if(date.getDay()==mailingDay && date.getHours()==mailingHour){
    var defaultersEmail = [];
    var report = {};
    mongoClient.connect(dbUrl, function(err, db){
      if(err) throw err;
      // get the list of members didn't fill the timesheet
      db.collection(TABLE_NAME).find({}).toArray(function(err, result){
        if(err) throw err;
        report=result;
         console.log(report);
        result.forEach(function(element) {
            // check deadline
          if(new Date(element.timesheet == false && element.deadline) < date)
            // get email of defaulters
            defaultersEmail.push(element.email);
            
          }, this);
        db.close();
        
        sendEmail(defaultersEmail, report);
      })
    })

  } else {
    console.log('Today is not mailing day.');
  }
  
}
main();

function sendEmail(defaultersEmail, report){
  var projectManagerEmail='pm1@gmail.com';
  var myEmail='mymail@gmail.com';
  var myPass='mypass';
  var transporter = nodemailer.createTransport({
    service: 'gmail', // or company domain for other service
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: myEmail,
      pass: myPass
    }
  });
  
  var mailOptionsForManager = {
    from: myEmail,
    to: projectManagerEmail,
    subject: 'Weekly Timesheet Report',
    message: 'Hello Sir\n\nThis is timesheet report of the week.' + reportToHTMLString(report) + '\n\nThank You & Regards\nAkshay Saini'
  };
  
  var mailOptionsForDefaulters = {
    from: 'anonyxhappie@gmail.com',
    to: defaultersEmail,
    subject: 'Warning Regarding Timesheet Update',
    message: 'Hey\n\nThis is warning mail regarding timesheet update.\n You have not updated your timesheet before your deadline. Please do it on priority basis.\n\nThank You & Regards\nAkshay Saini'
  };
//  console.log(mailOptionsForManager);

transporter.sendMail(mailOptionsForManager, function(err, info){
  if (err) {
    console.log(err);
  } else {
    console.log('Email Sent to Manager: ' + info.response);
  }
});

transporter.sendMail(mailOptionsForDefaulters, function(err, info){
  if (err) {
    console.log(err);
  } else {
    console.log('Email Sent to Defaulters: ' + info.response);
  }
});

}

function reportToHTMLString(report){
  var s='<table><tr><th>Name</th><th>Email</th><th>TimeSheet</th><th>Deadline</th></tr>';
  report.forEach(function(element){
    s += '<tr><td>'+element.name+'</td><td>'+element.email+'</td><td>'+element.timesheet+'</td><td>'+element.deadline+'</td></tr>';
  }, this);
  s += '</table>'
  console.log(s);
  return s;
}
