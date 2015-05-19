'use strict';

describe('movieController', function () {

  beforeEach(module('myApp.home'));

  var $controller;

  beforeEach(inject(function (_$controller_) {
    $controller = _$controller_;
  }));

  //test controller is defined
  describe('movieController', function () {
    it('movieController should be defined', inject(function ($controller) {
      var $scope = {};
      var homeCtrl = $controller('movieController', {$scope: $scope});
      expect(homeCtrl).toBeDefined();
    }));
  });

  //test movieService call proper API
  describe('movieService', function () {
    var $httpBackend;
    var $movieService;

    beforeEach(inject(function ($injector) {
      $httpBackend = $injector.get('$httpBackend');
      $movieService = $injector.get('movieService');
    }));

    describe('movieService', function () {
      it('should call get config', inject(function (movieService) {
        $httpBackend.expectGET('https://api.themoviedb.org/3/configuration?api_key=your_API_key').respond("success");
        var result = $movieService.config.get();
        $httpBackend.flush();
        expect(result).toBeDefined();
      }));
    });
  });

  describe('test castNameFilter', function () {
    var $filter;
    beforeEach(inject(function (_$filter_) {
      $filter = _$filter_;
    }));

    it('returns "" when given null', function () {
      var castsFilter = $filter('castNameFilter');
      expect(castsFilter(null)).toEqual("");
    });

    it('returns the correct value when given an array of cast members', function () {
      var castMembers = [
        {
          "character": "The Terminator",
          "name": "Arnold Schwarzenegger"
        },
        {
          "character": "Kyle Reese",
          "name": "Michael Biehn"
        },
        {
          "character": "Sarah Connor",
          "name": "Linda Hamilton"
        }];
      var castsFilter = $filter('castNameFilter');
      expect(castsFilter(castMembers)).toEqual("Arnold Schwarzenegger, Michael Biehn, Linda Hamilton");
    });
  });
});

