app.controller('SignupCtrl', function($scope, $location, $state, auth) {
  // No need for testing data anymore
  // $scope.users = [];

  // // Called when the form is submitted

  $scope.createUser = auth.createUser;
  console.log(auth.getUser);
  $scope.goToMain = function() {
    $state.go('main');
  }

})

app.controller('LoginController', function($scope, $location, $state, auth) {

  $scope.go = function(path) {
    $state.go(path)
  }

  $scope.loginUser = auth.loginUser;

})


app.controller('MainController', function($scope, $ionicSideMenuDelegate, $state, $location) {
  $scope.go = function(path) {
    $state.go(path);
  }
})

function addCardAsync(jobs, $scope, cardTypes){
  for (var i in jobs){
    var newCard = cardTypes[Math.floor(Math.random() * cardTypes.length)];
    newCard.jobId = jobs[i]["jobId"];
    newCard.title = (jobs[i]["title"] == undefined) ? jobs[i]["description"] : jobs[i]["title"];
    newCard.spotsAvailable = jobs[i]["spotsAvailable"];
    $scope.cards.push(angular.extend({}, newCard));
  }
}


app.controller('MainCardsController', function($scope, $ionicPopup, $ionicSideMenuDelegate, $state, $location, FirebaseApi, sharing, $ionicHistory, auth) {

 var cardTypes = [
    { image: 'img/favorsname.png' },
    { image: 'img/formlogo.png' },
    { image: 'img/job.png'}
  ];

  $scope.tags = sharing.sharedObject;
  $scope.cards = [];

  FirebaseApi.getJobsByTag($scope.tags).then(function(jobs){
    addCardAsync(jobs, $scope, cardTypes);
  });


 
  $scope.cardSwipedLeft = function(index) {
      console.log('Left swipe');
  }
 
  $scope.cardSwipedRight = function(index, jobId) {
      var user = auth.getUser();
      console.log('Right swipe');
      if (user != undefined){
        FirebaseApi.applyForJob(jobId, user.userId , function(changedJob, key){});
        alert("Request added for task. Please wait for the owner to accept.")
      }   
  }
 
  $scope.cardDestroyed = function(index) {
      $scope.cards.splice(index, 1);
      console.log('Card removed');
  }
  
  $scope.toggleLeft = function() {
    $ionicSideMenuDelegate.toggleLeft();
  };

  $scope.goToHome = function(){
    $ionicHistory.goBack();
  };
})



app.controller('MainMyJobsController', function($scope, $ionicSideMenuDelegate, $state, $location, $ionicHistory) {
    $scope.goToHome = function(){
      $ionicHistory.goBack();
  };
})

app.controller('MainJobsController', function($scope, $ionicSideMenuDelegate, $state, $location, auth, FirebaseApi) {
    $scope.goToHome = function(){
      $state.go('main');
    };
      $scope.createJob = function(title, description, tags, spotsAvailable){
      var tagArray = tags.split(',');
      for (var i in tagArray){
        tagArray[i] = tagArray[i].trim();
      }

      var user = auth.getUser();
      if (user.userId == undefined){
        alert("You must be logged in to create a job");
      }
      else{
        FirebaseApi.addJob({"title" : title ,"description" : description, "creatorUserId" : user.userId, "spotsAvailable" : spotsAvailable, "tagIds" : tagArray});
        alert("Your job has been created.");
      }
    };
})


app.controller('MainPendingController', function($scope, $ionicSideMenuDelegate, $state, $location, $ionicHistory, auth, FirebaseApi) {
  $scope.jobs = [];
  
  $scope.init = function(){
    var user = auth.getUser();
    var jobids = [];
    if (user != undefined){
      jobids = user.teachingJobs;
    }
    
    FirebaseApi.getJobsById(jobids).then(function(jobs){
      $scope.jobs = jobs;
    });
  };

  $scope.goToHome = function(){
    $ionicHistory.goBack();
  };


})

app.controller('TagsController', function($scope, $ionicSideMenuDelegate, $state, sharing, $ionicHistory) {

  $scope.tags = sharing.sharedObject;

  $scope.addTag = function(tag) {
    console.log($scope.tags);
    console.log(tag);
    if (!contains($scope.tags, tag)){
      $scope.tags.push(tag);
    }
    console.log("aease ",$scope.tags);
  }
  $scope.go = function(path) {
    $state.go(path);
  }

  $scope.goToHome = function(){
    $ionicHistory.goBack();
  };

})


// CONTROLLERS
app.controller('SlideController', function($scope, $ionicSlideBoxDelegate, $document, auth, $state, $location) {

  $scope.myActiveSlide = 0;

  $scope.slideChanged = function(index) {
    var slides = $ionicSlideBoxDelegate.slidesCount();
    var increment = $document[0].getElementsByClassName('increment');
    increment[0].style.width = (1+19*index/(slides-1))*5+'%';
  }; 

  $scope.goToSignup = function(){
    $state.go('signup');
  };

})



app.controller('FooController', function($scope, FirebaseApi){
    FirebaseApi.getJobsByTag(["Gardening", "Fencing"]).then(function(jobs){
      console.log(jobs);
    });
    
    FirebaseApi.getJobsById([502147, 611472, 763081]).then(function(jobs){
      console.log(jobs);
    });

    FirebaseApi.getUsersById([224205, 305, 346783]).then(function(users){
        console.log(users);
    });
    FirebaseApi.acceptUserForJob(965294, 546046); // accept user 546046 for job id 965294  
    FirebaseApi.getUser("fe@goenu.io").then(function(user) {

    FirebaseApi.applyForJob(987125, 224205, printSpotNumber(Object));
      console.log(user);
    });
    console.log(FirebaseApi.addUser({"firstName" : "John", "lastName" : "Doe", "email" : "johnDoe@gmail.com", "linkedInURL" : "www.linkedin.com/JOhnny"}));
    console.log(FirebaseApi.addJob({"description" : "Build my house for me.", "creatorUserId" : 101, "spotsAvailable" : 5}));

})

// This is the comment handler for applyForJob()
// key = key of the job that was changed
// Object =  Object that was changed
/*
 function printSpotNumber(Object, key) {
    console.log(Object);
    console.log(key);
 }
 */
 



