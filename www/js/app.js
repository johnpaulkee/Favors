// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
var app = angular.module('favors', ['ionic', 'firebase.api', 'ionic.contrib.ui.tinderCards'])
// ROUTERS

app.config(function($stateProvider, $urlRouterProvider) {
  $urlRouterProvider.otherwise('/login')

  $stateProvider

  .state('login', {
      url: '/login',
      templateUrl: 'templates/login.html',
      controller: 'LoginController'
    })

  .state('tutorial', {
      url: '/tutorial',
      templateUrl: 'templates/tutorial.html',
      controller: 'SlideController'
    })
  
  .state('signup', {
      url: '/signup',
      templateUrl: 'templates/signup.html',
      controller: 'SignupCtrl'
  })
  .state('main', {
      url: '/main',
      authRequired: true,
      templateUrl: 'templates/main.html',
      controller: 'MainController'
      // authRequired: true
    })

  .state('cards', {
      url: '/cards',
      authRequired: true,
      templateUrl: 'templates/mainTemplates/cards.html',
      controller: 'MainCardsController'
  })

  .state('tags', {
      url: '/tags',
      authRequired: true,
      templateUrl: 'templates/mainTemplates/tags.html',
      controller: 'TagsController'
  })

  .state('pending', {
      url: '/pending',
      authRequired: true,
      templateUrl: 'templates/mainTemplates/pending.html',
      controller: 'MainPendingController'
  })
  .state('jobs', {
      url: '/jobs',
      authRequired: true,
      templateUrl: 'templates/mainTemplates/jobs.html',
      controller: 'MainJobsController'
  })
   .state('myjobs', {
      url: '/myjobs',
      authRequired: true,
      templateUrl: 'templates/mainTemplates/myjobs.html',
      controller: 'MainMyJobsController'
  });

})

app.directive('noScroll', function() {

  return {
    restrict: 'A',
    link: function($scope, $element, $attr) {
      $element.on('touchmove', function(e) {
        e.preventDefault();
      });
    }
  }
})


app.run(function($ionicPlatform, $rootScope, auth, $state) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });

   $rootScope.$on('$stateChangeStart', function(e, toState, toParams, fromState, fromParams) {
    if (toState.authRequired && !auth.getUser()) {
      $state.go('login', {}, {reload: true});
      e.preventDefault();
    }
  });
})


