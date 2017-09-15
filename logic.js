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

var database = firebase.database();
var name ='';
var destination = '';
var firstTrainTime = '';
var frequency = '';
var nextTrain = '';
var nextTrainFormatted = '';
var minutesAway = '';
var firstTimeConverted = '';
var currentTime = '';
var diffTime = '';
var tRemainder = '';
var minutesTillTrain = '';
var keyHolder = '';
var getKey = '';


$(document).ready(function() {

     $("#add-train").on("click", function() {
      event.preventDefault();
      name = $('#name-input').val().trim();
      destination = $('#destination-input').val().trim();
      firstTrainTime = $('#first-train-time-input').val().trim();

      // Code for the push
      keyHolder = database.ref().push({
        name: name,
        destination: destination,
        firstTrainTime: firstTrainTime,  
        frequency: frequency,
               nextTrainFormatted: nextTrainFormatted,
               minutesTillTrain: minutesTillTrain
      });


      $('#name-input').val('');
      $('#destination-input').val('');
      $('#first-train-time-input').val('');
      $('#frequency-input').val('');

      return false;
    });
});