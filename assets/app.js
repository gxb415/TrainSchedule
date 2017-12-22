// Initialize Firebase
  var config = {
    apiKey: "AIzaSyCCM8eXKDiXinx7Ctrzzxo3hmVuwn5t7DM",
    authDomain: "trainschedule-fd102.firebaseapp.com",
    databaseURL: "https://trainschedule-fd102.firebaseio.com",
    projectId: "trainschedule-fd102",
    storageBucket: "",
    messagingSenderId: "1049676543577"
  };
  firebase.initializeApp(config);

  // Variables in database
var database = firebase.database();
var minToTrain = 0;
var nextTrain = "";
var newPostKey = "";
var name = "";
var destination = "";
var firstTrain = "";
var frequency = "";

$("#add-data").on("click", function(event) {
  event.preventDefault();

  //values from text boxes
  name = $("#name-input").val().trim();
  destination = $("#destination").val().trim();
  firstTrain = $("#first-train").val().trim();
  frequency = $("#frequency").val().trim();


 calculateTime();

 database.ref().push({
   name: name,
   destination: destination,
   firstTrain: firstTrain,
   frequency: frequency,
   minToTrain: minToTrain,
   nextTrain: nextTrain,
   uid: newPostKey
 });


// Firebase watcher
database.ref().on("child_added", function(snapshot) {
  
  var snap = snapshot.val();

  // Change the HTML to reflect

  $("#tableBody").append('<tr class="trains"> <td>' + sv.name + "</td>" + "<td>" + sv.destination + "</td>" + "<td>"
  + sv.frequency + "</td>" + '<td class="next-train">' + sv.nextTrain + "</td>" + '<td class="minutes-till-train">' + sv.minToTrain + "</td> " + '<td class="buttonTd"></td></tr>');

 

  // Handle the errors
}, function(errorObject) {
  console.log("Errors handled: " + errorObject.code);
});//push data into the firebase

function calculateTime(){
  // First Time (pushed back 1 year to make sure it comes before current time)
  var firstTrainConverted = moment(firstTrain, "hh:mm").subtract(1, "years");
  console.log("firstTrainConverted: ", firstTrainConverted, typeof(firstTrainConverted));

  // Current Time
  var currentTime = moment();
  console.log("CURRENT TIME: " + moment(currentTime).format("hh:mm"));

  // Difference between the times
  var diffTime = moment().diff(moment(firstTrainConverted), "minutes");
  console.log("DIFFERENCE IN TIME: " + diffTime, typeof(diffTime));

  // Time apart (remainder)
  var tRemainder = diffTime % frequency;
  console.log("tRemainder: ", tRemainder, typeof(tRemainder));
  //console.log("tRemainder: ", typeOf(tRemainder))

  // Minute Until Train
  minToTrain = frequency - tRemainder;
  console.log("MINUTES TILL TRAIN: " + minToTrain);

  // Next Train
  nextTrain = moment().add(minToTrain, "minutes");
  console.log("ARRIVAL TIME: " + moment(nextTrain).format("hh:mm"));
  nextTrain =  moment(nextTrain).format("hh:mm A")

  console.log("nextTrain: ",   nextTrain)


  // the push
  newPostKey = firebase.database().ref().child("trainschedulebonus").push().key;
  
}




setInterval(function(){
  database.ref().once("value", function(snapshot){
    snapshot.forEach(function(childSnapshot) {
        firstTrain = childSnapshot.val().firstTrain;
        frequency = childSnapshot.val().frequency;
        minToTrain = childSnapshot.val().minToTrain;
        
        calculateTime()
        
        database.ref("/" + childSnapshot.key + "/minToTrain/").remove();

        database.ref("/" + childSnapshot.key + "/").update({
          minToTrain: minToTrain
        });
        database.ref("/" + childSnapshot.key + "/nextTrain/").remove();
        database.ref("/" + childSnapshot.key + "/").update({
          nextTrain: nextTrain
        });
        
        $(".minutes-till-train#" + childSnapshot.key + "").text(minToTrain);
       
        $(".next-train#" + childSnapshot.key + "").text(nextTrain);
       
      });
  });
}, 60 * 1000);