  // Initialize Firebase
var config = {
    apiKey: "AIzaSyBVX8Td1EzaiJ6My2-sJWMLBt_zZmsZZAk",
    authDomain: "trainscheduler-loren.firebaseapp.com",
    databaseURL: "https://trainscheduler-loren.firebaseio.com",
    projectId: "trainscheduler-loren",
    storageBucket: "",
    messagingSenderId: "779971756432"
  };
  firebase.initializeApp(config);

function trainListing(trainName,destination,firstTrainTime,nextTrainTime,frequency) {
  this.trainName = trainName;
  this.destination = destination;
  this.firstTrainTime = firstTrainTime;
  this.nextTrainTime = nextTrainTime;
  this.frequency = frequency;
}
var database = firebase.database();

var workingData = [];
var fbsWorkingData = [];
var fbsTemplateData = [];
var lastInitializedTime = moment("2000-01-01T00:00:00").format();
var lastInitializedTimeLocal = "";
var loadedToday = false;
var scheduledTrainTime = "";
var scheduledTrainTimeAMPM = "";
var timerRunning = false;
var editingRecord = 0;
var intervalId;

function validateTime(testTime){

  var m = moment("2017-01-01T" + testTime + ":00").isValid();
  var invalidWhere =  moment("2017-01-01T" + testTime + ":00").invalidAt();

  if(m === true){
    return true;
  } else {
    return  false;
  }
}

function setNextTrain(trainTime,frequency){
  scheduledTrainTime = moment(moment().format("YYYY-MM-DD") + "T" + trainTime + ":00");
  var currentTime = moment();
  var minutesToTrain = Math.floor((scheduledTrainTime.diff(currentTime)/60000));
  var tomorrowDate = moment(moment().format("YYYY-MM-DD")).add(1,'d');
  
  if (minutesToTrain < 0){

    while (minutesToTrain < 0)  {
      scheduledTrainTime.add(frequency,'m');

      minutesToTrain = Math.floor((scheduledTrainTime.diff(currentTime)/60000));
      
      if (scheduledTrainTime > tomorrowDate) {
        return -1;
        break;
      }
    }

    scheduledTrainTimeAMPM = scheduledTrainTime.format('hh:mm A');
    return scheduledTrainTime.format('HH:mm');

  } else {
    scheduledTrainTimeAMPM = scheduledTrainTime.format('hh:mm A');
    return trainTime;
  }
}

function minutesToNextTrain (trainTime){

  var m = moment("2017-01-01T" + trainTime + ":00").isValid();
  if (m === true) {
    var scheduledTrainTime = moment(moment().format("YYYY-MM-DD") + "T" + trainTime + ":00");
    if (scheduledTrainTime === -1) {
      minutesToTrain = 0;
    } else {

      var currentTime = moment();
      var minutesToTrain = Math.floor((scheduledTrainTime.diff(currentTime)/60000));
    }
    return minutesToTrain;
  }
}

function addTrainListing(){

  var timeIsValid = validateTime($("#departureTimeInput").val().trim());

  if (timeIsValid) {
    var newTrainListing = new trainListing(
      $("#trainNameInput").val().trim(),
      $("#destinationInput").val().trim(),
      $("#departureTimeInput").val().trim(),
      $("#departureTimeInput").val().trim(),
      $("#frequencyInput").val().trim()
    );

    $("#trainNameInput").val("");
    $("#destinationInput").val("");
    $("#departureTimeInput").val("");
    $("#frequencyInput").val("");

    if (editingRecord !== 0){
      workingData.splice(editingRecord, 1);
    }

    console.log (newTrainListing);
    workingData.push(newTrainListing);

    editingRecord = 0;

    saveDataToFirebase(); 

  }
  editingRecord = 0;
}

function confirmDataLoadForToday(lastLoaded){

  var lastMidnight = moment(moment().format("YYYY-MM-DD") + "T00:00:00");
  var justNowInitialized = false;
  var lastLoadedLocal = "";

  if (lastLoaded !== "") {
    lastLoaded = moment(lastLoaded);
  } else {
    lastLoaded = lastMidnight;
  }

  if (lastInitializedTimeLocal !== "") {
    lastLoadedLocal = moment(lastInitializedTimeLocal);
  } else {
    lastLoadedLocal = lastMidnight;
  }

  if (moment(lastMidnight).isBefore(lastLoaded) || moment(lastMidnight).isBefore(lastLoadedLocal)){
    return true;
  } else {
    return false;
  }
}

function loadDataDisplay(){

  if (editingRecord === 0){

    trainScheduleSort(workingData);

    $(".trainListing").remove();
    for ( i = 0 ; i < workingData.length ; i++){

      var newTrainListingDiv = $('<div>');      
      newTrainListingDiv.addClass("row trainListing");

      var nextTrainTime = "";

      nextTimeTrain = setNextTrain(workingData[i].firstTrainTime,workingData[i].frequency);
      
      if (nextTimeTrain !== -1) {

        var col2Div = $('<div>');
        col2Div.addClass('col-sm-3 trainItem');     
        col2Div.text(workingData[i].trainName);
        newTrainListingDiv.append(col2Div);

        var col3Div = $('<div>');
        col3Div.addClass('col-sm-2 trainItem');     
        col3Div.text(workingData[i].destination);
        newTrainListingDiv.append(col3Div);

        var col4Div = $('<div>');
        col4Div.addClass('col-sm-2 trainItem');     
        col4Div.text(workingData[i].frequency);
        newTrainListingDiv.append(col4Div);

        var col5Div = $('<div>');
        col5Div.addClass('col-sm-2 trainItem');     
        col5Div.text(scheduledTrainTimeAMPM);
        newTrainListingDiv.append(col5Div);

        var col6Div = $('<div>');
        col6Div.addClass('col-sm-2 trainItem');     
        col6Div.text((minutesToNextTrain(nextTimeTrain)+1));
        newTrainListingDiv.append(col6Div);

        $("#trainListDiv").append(newTrainListingDiv);
      } 
    } 
  }
}


function startTimer(){
    intervalId = setInterval(loadDataDisplay,60000);
}

var sorted;
function trainScheduleSort(unsortedArr){
  if (editingRecord === 0){
    do {
      trainScheduleSorter(unsortedArr);
    } while (!sorted);
  }
}

function trainScheduleSorter(arr) {
  sorted = true;
  var end = arr.length - 1;
  for (var i = 0; i < end; i++) {   

    if (setNextTrain(arr[i].firstTrainTime,arr[i].frequency) === -1){
      minTrainA = 10000000;     
    } else {
      minTrainA = minutesToNextTrain(setNextTrain(arr[i].firstTrainTime,arr[i].frequency));     
    }

    if (setNextTrain(arr[i+1].firstTrainTime,arr[i+1].frequency) === -1){
      minTrainB = 10000000;
    } else {
      minTrainB = minutesToNextTrain(setNextTrain(arr[i+1].firstTrainTime,arr[i+1].frequency));
    }

    if (minTrainA > minTrainB) {
      var temp = arr[i];
      arr[i] = arr[i + 1];
      arr[i + 1] = temp;
      sorted = false;
    }
  }
}

startTimer();

function saveDataToFirebase(){
  if (editingRecord === 0){
    console.log ("Inside the saveDataToFirebase function");
    var sendToFBArray = JSON.stringify(workingData);
    var sendToFBTemplate = JSON.stringify(fbsTemplateData);

    database.ref().set({
      trainListArray: sendToFBArray,
      trainListTemplate: sendToFBTemplate,
      templateLastLoaded: lastInitializedTimeLocal
    });
  }
}

database.ref().on("value", function(snapshot) {

  if (snapshot.child("trainListArray").exists()) {

    timerRunning = true;

    fbsTemplateData = JSON.parse(snapshot.val().trainListTemplate);
    lastInitializedTime = snapshot.val().templateLastLoaded;

    loadedToday = confirmDataLoadForToday(lastInitializedTime);

    if (!loadedToday) {

      if (fbsTemplateData.length > 0) {
        workingData = fbsTemplateData;
      } else {
        workingDate = [];
      }
      
      lastInitializedTime = moment().format();

      loadedToday = true;
      lastInitializedTimeLocal = moment().format();

      saveDataToFirebase();

      loadDataDisplay();

    } else {
      workingData = JSON.parse(snapshot.val().trainListArray);
      loadDataDisplay();
    }
  }
});