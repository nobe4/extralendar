extralendar
===========

Google app script for auto export the extranet.efrei.fr calendar


# Installation

To install this script you must performe two actions : create a google calendar and then use it's id to access it from the script.


## Google calendar

* Go to your calendar 
* Create a new calendar <insert pic>
* Get it's id  <insert pic>
* That's all

## Script

* Get a zip of the project (or just the script file <insert script file name>) <insert pic>
* Copy it to a Google Drive folder <insert pic>
* Open <insert script file name>
* Change the fields:
  * USERNAME : your extranet username
  * PASSWORD : your extranet password
  * CALENDAR : your calendar id (check above)
  * <insert pic>
* Test if it works by launching the main function <insert pic>
  * If there is a probleme post an issue to the repo
* Add a <traduction de "déclencheur"> and select your refresh time
* That's all


# How does it work ?
Let's break the script into functions :

``` javascript
function doLogin(){
  // fetch user informations used to get calendar infos
  // 1/ get a session id
  // 2/ use it with the payload to get the db_extranet cookie
  // 3/ return the two cookies
}
````

``` javascript
function fetchExtranet(){
  // use previously fetched cookie info to query the extranet and get the calendar bewteen the two dates
  // 1/ insert all infos into a request
  // 2/ return the request response
}
````

Todo
* Explain 
  *  main()
  *  makeHttpRequest()
  *  parseTitle()
  *  Utilities functions ?


