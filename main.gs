// ------------------------------- EXTRALENDAR ----------------------------------------
//
//  Google app script for automatic export of the extranet calendar to google calendar.
//
//  Installation:
//   See : https://github.com/nobe4/extralendar
//   Have a question : https://github.com/nobe4/extralendar/wiki/FAQ
//
//  Want to help:
//   Report us any bugs on : https://github.com/nobe4/extralendar/issues
//   Got new features ideas : https://github.com/nobe4/extralendar/issues
//
// ------------------------------------------------------------------------------------

var args = {
  address  : "",
  username : "",
  password : "",
  calendar : "",
  anonymous_stats : true,  // please help us improving our service by collecting anonymous error reports
  alert_update : true, // inform you by e-mail about new updates
};

// Request authorization for calendar, docs and mail
CalendarApp.getColor();
MailApp.getRemainingDailyQuota();
SpreadsheetApp.flush();

function main(){
  var url = "https://raw.githubusercontent.com/nobe4/extralendar/"+((args.branch!="develop") ? "master" : "develop") +"/core.gs";
  var core_gs = UrlFetchApp.fetch(url);
  var core = new Function(core_gs);
  core();
}
