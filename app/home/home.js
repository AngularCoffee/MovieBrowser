'use strict';

//replace the api key here
var apiKey = 'Place your API Key here';

angular.module('myApp.home', ['ngRoute', 'ngResource'])
    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/home', {
            templateUrl: 'home/home.html',
            controller: 'movieController'
        });
    }])
    //service that retrieves info from urls
    .factory('movieService', ['$resource', function ($resource) {
        //service that retrieves all information
        return {
            config: $resource('https://api.themoviedb.org/3/configuration', {api_key: apiKey}),
            movieList: $resource('https://api.themoviedb.org/3/collection/528', {api_key: apiKey}),
            movieDetail: $resource('https://api.themoviedb.org/3/movie/:movieId', {movieId: '@id', api_key: apiKey}),
            credits: $resource('https://api.themoviedb.org/3/movie/:movieId/credits', {movieId: '@id', api_key: apiKey})
        };
    }])
    //return the list of cast members' names
    .filter('castNameFilter', function () {
        return function (cast) {
            if (cast == null)
                return "";
            var castNames = [];
            cast.forEach(function (member) {
                castNames.push(member.name);
            })
            return castNames.join(", ");
        }
    })
    .controller('movieController', ['$scope', '$q', 'movieService', function ($scope, $q, movieService) {
        $scope.movies = null;
        $scope.selectedMovie = null;

        //select the movie when user clicks on a movie thumbnail
        $scope.selectMovie = function (movie) {
            //if it is the same selection
            if ($scope.selectedMovie && $scope.selectedMovie === movie) {
                return;
            }

            //if previous movie selected, clear the state for it
            if ($scope.selectedMovie) {
                $scope.selectedMovie.selected = false;
                if ($scope.selectedMovie.selectedMember) {
                    $scope.selectedMovie.selectedMember.selected = false;
                }
                $scope.selectedMovie.selectedMember = null;
            }
            $scope.selectedMovie = movie;
            $scope.selectedMovie.selected = true;
        };

        //select the member when user clicks on a cast member thumbnail
        $scope.selectMember = function (member) {
            if ($scope.selectedMovie && $scope.selectedMovie.selectedMember) {
                $scope.selectedMovie.selectedMember.selected = false;
            }
            $scope.selectedMovie.selectedMember = member;
            $scope.selectedMovie.selectedMember.selected = true;
        };


        //find and store director and writers
        function findDirectorWriters(movie, crew) {
            movie.writers = [];
            for (var i = 0; i < crew.length; i++) {
                if (crew[i].job === "Director") {
                    movie.director = crew[i].name;
                } else if (crew[i].job === "Writer" || crew[i].job === "Screenplay") {
                    movie.writers.push(crew[i].name);
                }
            }
        }

        //retrieve all the information

        //retrieve configuration which is needed for image url
        movieService.config.get(function (apiConfig) {
                //use smallest size image for movie thumbnail
                $scope.posterThumbnailBaseUrl = apiConfig.images.secure_base_url + apiConfig.images.poster_sizes[0];
                //use larger size image for rigth side movie poster
                $scope.posterBaseUrl = apiConfig.images.secure_base_url + apiConfig.images.poster_sizes[1];
                //use smallest size image for cast member thumbnail
                $scope.profileThumbnailBaseUrl = apiConfig.images.secure_base_url + apiConfig.images.profile_sizes[0];
                //use larger size image for cast member portrait
                $scope.profileBaseUrl = apiConfig.images.secure_base_url + apiConfig.images.profile_sizes[1];

                //retrieve the movie collection
                return movieService.movieList.get(function (moviesJson) {
                    $scope.movies = moviesJson.parts;
                    for (var i = 0; i < $scope.movies.length; i++) {
                        $scope.movies[i].selected = false;
                    }

                    //uncomment below 2 lines if prefer to auto select the first movie
                    //$scope.selectedMovie =  $scope.movies[0];
                    //$scope.selectedMovie.selected = true;

                    // get all credits in parallel, need this information to display the director name in the summary
                    var requests = $scope.movies.map(function (movie) {
                        return movieService.credits.get({movieId: movie.id}).$promise;
                    });

                    $q.all(requests).then(function (results) {
                        for (var j = 0; j < results.length; j++) {
                            //only save director and writers in $scope as others are not used
                            findDirectorWriters($scope.movies[j], results[j].crew);
                            $scope.movies[j].cast = results[j].cast;
                            //console.log(results[j]);
                        }

                    }, function (error) {
                        console.log(error);
                    });


                    //retrieve the detailed movie info in parallel, we need the overview
                    var overviewRequests = $scope.movies.map(function (movie) {
                        return movieService.movieDetail.get({movieId: movie.id}).$promise;
                    });
                    $q.all(overviewRequests).then(function (results) {
                        for (var j = 0; j < results.length; j++) {
                            $scope.movies[j].overview = results[j].overview;
                            //console.log(results[j]);
                        }
                    }, function (error) {
                        console.log(error);
                    });

                });
            }
        );
    }]);