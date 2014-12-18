// script that will be fetched automaticly by main.gs
// this script contains all the logic but no user information

function core(){
	try {
		coreFunction();
	} catch(e) {
		if(args.sheet_id != undefined && args.sheet_id != "")
			sheetError(e);

		if(args.email != undefined && args.email != "")
			mailError(e);
	}
}

// -------------------------- Main ----------------------------
function coreFunction(){
  if( !checkArguments() )
    throw error(10000, "One or more of the arguments is empty");

   var cal = CalendarApp.getCalendarById(args.calendar);

  if( cal == null )
    throw error(10001, "Please specify a valid calendar");

  if( args.step <= 0 )
    throw error(10002, "The step must be greater than zero");

  var dateNow = roundDate(  dateAddDay( new Date(), -1 ) );
  log(2, dateNow);
  var dateNext = roundDate( dateAddDay( new Date(), args.step ) );
  log(2, dateNext);

  var cookies = doLogin();

  var calendarInfo = fetchExtranet(cookies, dateNow, dateNext);

  if( calendarInfo == null )
    throw error(10003, "Something went wrong while fetching the calendar");

  calendarInfo = JSON.parse(calendarInfo);

  resetCalendar(cal, dateNow, dateNext);

  for(i in calendarInfo){
    createEvent(cal,calendarInfo[i]);
  }

  doLogout();
}

// Login the user with its credentials
function doLogin(){
  var base = makeHttpRequest(args.address,{});

  if( base.getAllHeaders()['Set-Cookie'] == undefined || base.getAllHeaders()['Set-Cookie'].split("=")[0] != "ASP.NET_SessionId")
    throw error(10004, "Impossible to fetch the ASP id, check the ADDRESS");

  var base_cookie = base.getAllHeaders()['Set-Cookie'].split(';')[0];

  log( 2, base_cookie, "Base Cookie");

  var url = args.address+'/Users/Account/DoLogin';
  var payload =  {
    'username' : args.username,
    'password' : args.password
  };

  var headers = {
    'accept' : '*/*',
    'Connection' :	'keep-alive',
    'Referer' : args.address,
    'User-Agent' :	'Mozilla/5.0 (Windows NT 6.3; WOW64; rv:32.0) Gecko/20100101 Firefox/32.0',
    'Cookie' : base_cookie,
  };

  var options = {
    'method': 'POST',
    'headers': headers,
    'payload' : payload,
    'followRedirects' : false
  };

  var response = makeHttpRequest(url, options);

  if( response.getAllHeaders()['Set-Cookie'] == undefined || response.getAllHeaders()['Set-Cookie'].split("=")[0] != "extranet_db")
    throw error(10005, "Login error, please check your credentials");

  var returnValue = [ base_cookie, response.getAllHeaders()['Set-Cookie'].split(';')[0]];

  log( 2, returnValue[1], "Response Code");

  return returnValue;
}

// Close the session
function doLogout(){
  makeHttpRequest(args.address+"/Users/Account/ExtLogout",{});
  return;
}

// Fetch the extranet calendar
function fetchExtranet(cookies, dateNow, dateNext){
  var headers = {
    'Cookie' : cookies.join(';')
  }
  var url = args.address+'/Student/Calendar/GetStudentEvents?start='+ formatDate( dateNow ) +'&end='+ formatDate( dateNext );
    
  var options = {
    'method': 'get',
    'headers': headers,
  };
  var response = makeHttpRequest(url, options);

  return response;
}


// -------------------------- HTTP Request ----------------------------

function makeHttpRequest( url, options ){
  logRequest( 3, url, options );
  var response = UrlFetchApp.fetch(url, options);  //https://developers.google.com/apps-script/reference/url-fetch/http-response#getAllHeaders()
  log( 3, response.getResponseCode(), "Response Code");

  return response;
}

function parseTitle(title){
  var regexp = "(.*) - (.*) - (.*)";
  var d = title.match(new RegExp(regexp));
  return {
    title : d[1],
    teacher : d[2],
    location : d[3]
  }
}

// -------------------------- Log Helpers ----------------------------

// Basic log
function log( level, message, header){
  if( level <= args.log_level ){
    if( header != null ){
      Logger.log( "-----> " + header );
    }
    Logger.log( message );
  }
}

// Debug request viewer
function logRequest( level, url, options){
  if( level <= args.log_level ){
    var result = UrlFetchApp.getRequest(url, options);

    for(i in result) {
      if(i == "headers"){
        for(j in result[i]) {
          Logger.log(i+" -> "+j + ": " + result[i][j]);
        }
      }
      else
        Logger.log(i + ": " + result[i]);
    }
  }
}

// -------------------------- Error Report ----------------------------

function mailError(error){
  MailApp.sendEmail(args.email, "Error report Extralendar",
                    "\r\nDate: " + new Date()
                    + "\r\nNumber: " + error.number
                    + "\r\nMessage: " + error.message
                    + "\r\nLine: " + error.lineNumber);
}

function sheetError(error){
  var errorSheet = SpreadsheetApp.openById(args.sheet_id).getSheetByName('Errors');
  lastRow = errorSheet.getLastRow();
  var cell = errorSheet.getRange('A1');
  cell.offset(lastRow, 0).setValue(new Date());
  cell.offset(lastRow, 1).setValue(error.number);
  cell.offset(lastRow, 2).setValue(error.message);
  cell.offset(lastRow, 3).setValue(error.lineNumber);
}

// -------------------------- Google Calendar helpers ----------------------------

// Create Event
function createEvent(calendar, event) {
  var info = parseTitle(event.title);

  var title = info.title;
  var start = new Date(getDateFromIso(event.start));
  var end = new Date(getDateFromIso(event.end));
  var desc = info.teacher;
  var loc = info.location;

  if(args.log_update){
    desc += "\n\nUpdated at :\n" + new Date();
  }

  if(args.override_location)
  {
    title = loc + ' - ' + title;
    loc = args.override_location;
  }

  var event = calendar.createEvent(title, start, end, {
    description : desc,
    location : loc
  });
};

// reset the calendar between the two dates
function resetCalendar(calendar,date1, date2){
  var events = calendar.getEvents(date1, date2);
  for(var i in events){
    events[i].deleteEvent();
  }
}

// -------------------------- Date helpers ----------------------------

// Round the current date to 00:00
function roundDate( pDate ){
  pDate.setHours(04);
  pDate.setMinutes(0);
  pDate.setSeconds(0);

  return pDate;
}

// Format the date : yyyy-mm-dd
function formatDate(pDate){
  return pDate.getFullYear() + '-' + (pDate.getMonth()+1) + '-' + pDate.getDate();
}

// Add the given number of days to the date
function dateAddDay( pDate, pDay ){
  pDate.setDate( pDate.getDate() + pDay );

  return pDate;
}

// Generate timestamp in the unix format
function generateTimestamp( pDate ){
  return pDate.getTime() / 1000 ;
}

// http://stackoverflow.com/questions/11810441/how-do-i-format-this-date-string-so-that-google-scripts-recognizes-it
// http://delete.me.uk/2005/03/iso8601.html
function getDateFromIso(string) {
  try{
    var aDate = new Date();
    var regexp = "([0-9]{4})(-([0-9]{2})(-([0-9]{2})" +
      "(T([0-9]{2}):([0-9]{2})(:([0-9]{2})(\.([0-9]+))?)?" +
        "(Z|(([-+])([0-9]{2}):([0-9]{2})))?)?)?)?";
    var d = string.match(new RegExp(regexp));

    var offset = 0;
    var date = new Date(d[1], 0, 1);

    if (d[3]) { date.setMonth(d[3] - 1); }
    if (d[5]) { date.setDate(d[5]); }
    if (d[7]) { date.setHours(d[7]); }
    if (d[8]) { date.setMinutes(d[8]); }
    if (d[10]) { date.setSeconds(d[10]); }
    if (d[12]) { date.setMilliseconds(Number("0." + d[12]) * 1000); }
    if (d[14]) {
      offset = (Number(d[16]) * 60) + Number(d[17]);
      offset *= ((d[15] == '-') ? 1 : -1);
    }

    time = (Number(date) + (offset * 60 * 1000));
    return aDate.setTime(Number(time));
  } catch(e){
    return;
  }
}

// -------------------------- Misc Helpers ----------------------------

function error(pNumber, pMessage){
  var tempError = new Error( pMessage );  // https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Objets_globaux/Error
  tempError.number = pNumber;
  return tempError;
}

function checkArguments(){
  // Check required arguments
  if( args.address == undefined || args.address == "" )
    return false;

  if( args.username == undefined || args.username == "" )
    return false;

  if( args.password == undefined || args.password == "" )
    return false;

  if( args.calendar == undefined || args.calendar == "" )
    return false;

  // Set default values
  args.log_level = ((args.log_level == undefined) ? 1 : args.log_level);
  args.step = ((args.step == undefined || typeof args.step != "number") ? 14 : args.step);
  args.anonymous_stats = ((args.anonymous_stats == undefined) ? false : args.anonymous_stats);
  args.email = ((args.email == undefined) ? "" : args.email);
  args.sheet_id = ((args.sheet_id == undefined) ? "" : args.sheet_id);
  args.log_update = ((args.log_update == undefined) ? false : args.log_update);

  return true;
}

// as this script will be executed as a function we need to execute core at the end ot the file
core();
