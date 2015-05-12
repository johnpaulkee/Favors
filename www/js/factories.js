app.factory("auth",function($state, $timeout, FirebaseApi, $ionicPopup){
  var user;
  return {
    getUser: function(){
      return user
    },
    loginUser: function(email, password){
      FirebaseApi.getUser(email).then(function(recuser){
        if (recuser != "NULL"){
          if (recuser.password == password){
            user = recuser;
            $state.go('main');
            alert("User logged in");
          } else {
            alert("Incorrect password");
          }
        } else {
          alert("User not found");
          $state.go('login');
        }
      })

    },

    createUser: function(firstName, lastName, email, password) {
      var newuser = ({
        firstName: firstName,
        lastName: lastName,
        password: password,
        email: email
      });
      user = FirebaseApi.addUser(newuser);
      alert("User Created");
      alert(user.firstName);
      alert("User logged in");
      $state.go('main');
    }
  }
})

app.factory("sharing", function(){

  return {sharedObject: ["Gardening"] }

});

