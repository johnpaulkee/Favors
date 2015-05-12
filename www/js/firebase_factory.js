var jobRef = new Firebase('brilliant-heat-2461.firebaseIO.com/jobs');
var userRef = new Firebase('brilliant-heat-2461.firebaseIO.com/users');
var rootReference = new Firebase('https://brilliant-heat-2461.firebaseio.com/');

angular.module('firebase.api', [])

.factory('FirebaseApi', function($q) {
  return {
    addUser: function(userJson){
      var userId = (userJson["userId"] == undefined) ? generateRandomUserId() : userJson["userId"];
      var firstName = (userJson["firstName"] == undefined) ? chance.first() : userJson["firstName"];
      var lastName = (userJson["lastName"] == undefined) ? chance.last() : userJson["lastName"];
      var email = (userJson["email"] == undefined) ? chance.email() : userJson["email"];
      var password = (userJson["password"] == undefined) ? chance.word() : userJson["password"];
      var linkedInURL = (userJson["linkedInURL"] == undefined) ? "www.linkedin.com/"+firstName : userJson["linkedInURL"];
      var teachingRating = 0;
      var participantRating = 0;
      var teachingJobs = [];
      var participantJobs = [];
      var userJson = {"userId" : userId , "firstName" : firstName, "lastName" : lastName, "email" : email, "password" : password, "linkedInURL" : linkedInURL, "teachingRating" : teachingRating, "participantRating" : participantRating, "teachingJobs" : teachingJobs, "participantJobs" : participantJobs};

      userRef.push(userJson);
      return userJson;
    },
    addJob: function(jobJson){
      var jobId = generateRandomJobId();
      var title = (jobJson["title"] == undefined) ? chance.word() : jobJson["title"];
      var description = (jobJson["description"] == undefined) ? chance.sentence({words: 10}) : jobJson["description"];
      var creatorUserId = (jobJson["creatorUserId"] == undefined) ? generateRandomUserId() : jobJson["creatorUserId"];
      var spotsAvailable = (jobJson["spotsAvailable"] == undefined) ? chance.integer({min: 1, max: 5}) : jobJson["spotsAvailable"];
      var spotUserIds = [];
      var pendingSpotIds = [];
      var tagIds = (jobJson["tagIds"] == undefined) ? [] : jobJson["tagIds"];
      var jobJson = {"jobId" : jobId , "title" : title, "description" : description, "creatorUserId" : creatorUserId, "spotsAvailable" : spotsAvailable, "spotUserIds" : spotUserIds, "pendingSpotIds" : pendingSpotIds, "tagIds" : tagIds};
  
      jobRef.push(jobJson);

      if (creatorUserId != undefined){
        userRef.once("value", function(snap) {
        addTeachingJobToUser(snap.val(), jobId, creatorUserId);
        });  
      }
  
      return jobJson;
    },



  // @acceptedUserId: the userId we are accepting to participate in jobId
  // @jobId: the jobId we are granting acceptance to acceptedUserId
  acceptUserForJob: function (jobId, acceptedUserId){
    jobRef.once("value", function(snap) {
      jobArray = snap.val();
      for (var jobHash in jobArray){ // iterate over jobs
        var iteratedJobId = jobArray[jobHash]["jobId"];
        if (iteratedJobId == jobId){ // found the matching job
          console.log("FOUND JOB WITH JOB ID");
          var pendingSpotIds = jobArray[jobHash]["pendingSpotIds"];
          if (pendingSpotIds != undefined){ // pendingSpotIds contains things
            console.log("LOOKING AT PENDING ID");
            for (var i = 0; i < pendingSpotIds.length; i++){ // iterate over pending spot ids
              if (pendingSpotIds[i] == acceptedUserId){ // found a match in pending list
                if (i > -1) { // array bounds check
                  console.log("SPLICING "+i);
                  pendingSpotIds.splice(i, 1);
                  console.log(pendingSpotIds);
                  var jobRefHash = new Firebase('brilliant-heat-2461.firebaseIO.com/jobs/'+jobHash);
                  jobRefHash.update({"pendingSpotIds": pendingSpotIds});
                  var spotUserIds = jobArray[jobHash]["spotUserIds"];
                  if (spotUserIds == undefined){ // empty spotUserId
                    jobRefHash.update({"spotUserIds": [acceptedUserId]});
                  }
                  else{
                    spotUserIds.push(acceptedUserId);
                    jobRefHash.update({"spotUserIds": spotUserIds});
                  }

                }
              }

            }
          }
        }
      }
    });
  },    

    // @returns: userObject if successful, "NULL" if no match found
    getUser: function(email){
      var scopeEmail = email;
      return $q(function(resolve, reject) {
        var email = scopeEmail;
        userRef.once("value", function(snap) {
          userArray = snap.val();
          for (var userHash in userArray){
            var userEmail = userArray[userHash]["email"];
            if (email.localeCompare(userEmail) == 0){
              resolve(userArray[userHash]);
              return;
            }
          }
          resolve("NULL");
        });
      });
    },

    /**********************************************************************************************************************************************************
// Called when a user applies to a job posting
// Adds userId to a job's pendingSpotIds field
// Adds jobId to a user's participantJobs field
// Subscribes to a job by initializing a listener that is activated by a change in any of the job object's children
//
// jobId (int) =  the jobId of the job that the user is applying to
// userId (int) = the userId of the user who is applying to the job
// ccFunction (function(Javascript Object)) = the function that repsonds to a change in the subscribed job
//      - takes a Javascript Object (returned by snapshot.val()) which includes the job associated to the jobId and all of the job's children
//
// Example: applyForJob(2196, 335, printSpotNumber(Object))
//
// // prints the number of spots available for that job
// // key = key of the job that was changed
// // Object = the object that was changed
// printSpotNumber(Object, key) {
//    console.log(Object["spotUserIds"]);
//    console.log(key);
// }
******************************************************************************************************************************************************************/
applyForJob: function (jobId, userId, ccFunction) {

  rootReference.once("value", function(snap) {
      console.log("initial data loaded! "+ Object.keys(snap.val()).length);
      console.log(snap.val());
      
      var rootRef = snap.val();
      var userArray = rootRef["users"];
      var jobArray = rootRef["jobs"];

      // SEARCH THROUGH ALL JOBS
      for (var key in jobArray){
          // FIND MATCH
        if (jobArray[key]["jobId"] == jobId) {
          updateJob(jobId, userId, jobArray, key);
          updateUser(jobId, userId, jobArray, userArray);
          subscribeToJob(key, ccFunction);
        } 
      }
  });
},

  // An array of user ids
  getUsersById: function (userIds){
    var scopeIds = userIds;
    return $q(function(resolve, reject) {
      var userIds = scopeIds;
      userRef.once("value", function(snap) {
      matchingUsers = [];
      userArray = snap.val();
      for (var userHash in userArray){
        var iteratedUserId = userArray[userHash]["userId"];
        if (contains(userIds, iteratedUserId)){
          matchingUsers.push(userArray[userHash]);
        }
      }
      resolve(matchingUsers);
      });      
    });
  },

  // An array of job ids
  getJobsById: function (jobIds){
    var scopeIds = jobIds;
    return $q(function(resolve, reject) {
      var jobIds = scopeIds;
      jobRef.once("value", function(snap) {
        matchingJobs = [];
        jobArray = snap.val();
        for (var jobHash in jobArray){
          var iteratedJobId = jobArray[jobHash]["jobId"];
          if (contains(jobIds, iteratedJobId)){
            matchingJobs.push(jobArray[jobHash]);
          }
        }
        resolve(matchingJobs);
      }); 
    });      
  },

  // an array of tags
  getJobsByTag: function (tags){
    var tagIds = tags;
    return $q(function(resolve, reject) {
      var tags = tagIds;
      jobRef.once("value", function(snap) {
        matchingJobs = [];
        jobArray = snap.val();
        for (var jobHash in jobArray){
          var iteratedJobTags = jobArray[jobHash]["tagIds"];
          if (iteratedJobTags == undefined){
            continue;
          }
          for (var i in tags){
            if (contains(iteratedJobTags, tags[i])){
              matchingJobs.push(jobArray[jobHash]);
              break;
            }
          }
        }
        resolve(matchingJobs);
      }); 
    });      
  }

  };
});

function contains(a, obj) {
    var i = a.length;
    while (i--) {
       if (a[i] === obj) {
           return true;
       }
    }
    return false;
} 

 function addTeachingJobToUser(userArray, jobId, creatorUserId){
    console.log(userArray);
    for (var userHash in userArray){
      var userId = userArray[userHash]["userId"];
      if (userId == undefined){
        continue;
      }
      else if (creatorUserId == userId){
        var userRef = new Firebase('https://brilliant-heat-2461.firebaseio.com/users/' + userHash);
        var teachingJobs = userArray[userHash]["teachingJobs"];
        
        if (teachingJobs == undefined){
          userRef.update({"teachingJobs": [jobId]});
        }
        else{
          teachingJobs.push(jobId);
          userRef.update({"teachingJobs": teachingJobs});
        }
        console.log("Succesfully added jobId: " + jobId + " to userId: " + creatorUserId);
      }
    }
  }

function updateJob(jobId, userId, jobArray, key) {
  var jobRef = new Firebase('https://brilliant-heat-2461.firebaseio.com/jobs/' + key);
  var pendingSpotIds = jobArray[key]["pendingSpotIds"];

  if (pendingSpotIds == undefined) {
    jobRef.update({"pendingSpotIds" : [userId]});
  }
  else {
    pendingSpotIds.push(userId);
    jobRef.update({"pendingSpotIds": pendingSpotIds});
  }
  console.log("Successful add to job's pendingSpotIds");
}


function updateUser(jobId, userId, jobArray, userArray) {
  for (var key in userArray) {
    //console.log('https://favorsnw.firebaseio.com/' + key);
    if (userArray[key]["userId"] == userId) {
      console.log(userArray[key]["userId"]);
      var userKey = key;
    }
  }
  var userRef = new Firebase('https://brilliant-heat-2461.firebaseio.com/users/' + userKey);
  var participantJobs = userArray[userKey]["participantJobs"];


  if (participantJobs == undefined) {
    userRef.update({"participantJobs" : [jobId]});
  }
  else {
    participantJobs.push(jobId);
    userRef.update({"participantJobs": participantJobs});
  }
  console.log("Successful add to user's participantJobs");
}


// Called when a user applies for a job so that the user is notified upon any change to the children 
// of the job object (ie: when a job creator allocates a spot to another user and the total number of
// spots belonging to that job is subsequently reduced)

function subscribeToJob(key, ccFunction) {
  var ref = new Firebase('https://brilliant-heat-2461.firebaseio.com/jobs/' + key);
  ref.on("child_changed", function(snapshot) {
    var changedJob = snapshot.val();
    ccFunction(changedJob, key);
  });
}
