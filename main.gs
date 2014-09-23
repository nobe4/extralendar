// this script is the user script
// this script will fecth core.gs automaticaly rom github and execute it
// all the user informations are in this file

// -------------------------- CONST ----------------------------

var LOG_LEVEL = 1;
var ADDRESS = "";
var USERNAME = "";
var PASSWORD = "";
var CALENDAR = "";
var STEP = 14;

// for loggin purpose
var EMAIL = "";
var SHEET_ID = "";
var LOG_UPDATE = false; // or true

// core script url
var CORE_GS_URL = "https://raw.githubusercontent.com/nobe4/extralendar/develop/core.gs";

// request rights 
CalendarApp.getColor();
MailApp.getRemainingDailyQuota();
SpreadsheetApp.flush();

function main(){
	var core_gs = UrlFetchApp.fetch(CORE_GS_URL);
	var core = new Function(core_gs);
	core();
}
