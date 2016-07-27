(function () {
    var appName = window['name'];
    var app = angular.module(appName, ['ngRoute', appName+'.core', 'ui.bootstrap', 'ui.grid', 'ui.grid.infiniteScroll']);
    var _rootPath = './app/';
    var _baseModulesPath = {
        templateUrl:'./app/',
        userManagement:'modules/user-management/',
    };

    var popupView = {
        dashboard:{
            view:{ templateUrl:_baseModulesPath['templateUrl'] + 'templates/popups/popup-view.html' },
            delete:{ templateUrl:_baseModulesPath['templateUrl'] + 'templates/popups/popup-delete.html' },
            edit:{ templateUrl:_baseModulesPath['templateUrl'] + 'templates/popups/popup-edit.html' },
            tree:{ templateUrl:_baseModulesPath['templateUrl'] + 'templates/popups/popup-tree.html' }
        }
    };

    var routeConfig = {
        home:{
            templateUrl: _baseModulesPath.templateUrl +'home.html',
        },
        dashboard:{
            templateUrl: _baseModulesPath.templateUrl +'modules/dashboard/templates/dashboard.html',
            controller:dashboardController
        },
        businessConfig:{
            templateUrl: _baseModulesPath.templateUrl + _baseModulesPath.userManagement+'business-configs/templates/business-configs.html',
            controller:dashboardController
        },
        distributor:{
            templateUrl: _baseModulesPath.templateUrl + _baseModulesPath.userManagement+'distributor/templates/distributor.html',
            controller:dashboardController
        },
        businessAssociate:{
            templateUrl: _baseModulesPath.templateUrl + _baseModulesPath.userManagement+'business-associate/templates/business-associate.html',
            controller:dashboardController
        },
        retailer:{
            templateUrl: _baseModulesPath.templateUrl + _baseModulesPath.userManagement+'retailer/templates/retailer.html',
            controller:dashboardController
        }
    };

    function config($routeProvider) {
        $routeProvider
            .when('/home', routeConfig['dashboard'])
            .when('/dashboard', routeConfig['dashboard'])
            .when('/user-management/businessConfig', routeConfig['businessConfig'])
            .when('/user-management/distributor', routeConfig['distributor'])
            .when('/user-management/businessAssociate', routeConfig['businessAssociate'])
            .when('/user-management/retailer', routeConfig['retailer'])
            .otherwise({redirectTo: '/'});//Handle all exceptions
    };

    function angularHelper( $controllerProvider, $provide, $compileProvider ) {
        // Let's keep the older references.
        app._controller = app.controller;
        app._service = app.service;
        app._factory = app.factory;
        app._value = app.value;
        app._directive = app.directive;

        // Provider-based controller.
        app.controller = function( name, constructor ) {
            $controllerProvider.register( name, constructor );
            return(this);
        };

        // Provider-based service.
        app.service = function( name, constructor ) {
            $provide.service( name, constructor );
            return(this);
        };

        // Provider-based factory.
        app.factory = function( name, factory ) {
            $provide.factory( name, factory );
            return(this);
        };

        // Provider-based value.
        app.value = function( name, value ) {
            $provide.value( name, value );
            return(this);
        };
        // Provider-based directive.
        app.directive = function( name, factory ) {
            $compileProvider.directive( name, factory );
            return(this);
        };
    }

    function appController($scope, $compile, $timeout){

    };

    function dashboardController($scope){

    };

    function ideGrid($q, $http, $timeout) {
        return {
            restrict: 'AE',
            templateUrl: _rootPath+ 'modules/common/controls/grid.html',
            link: function (scope, elem) {},
            controller:function($scope, $element){
                //var url = 'https://cdn.rawgit.com/angular-ui/ui-grid.info/gh-pages/data/10000_complex.json';
                var url = 'data/complex.json';
                $scope.gridHeight =  $(window).height()-270 +"px";
                $scope.gridOptions = {
                    infiniteScrollRowsFromEnd: 40,
                    infiniteScrollUp: true,
                    infiniteScrollDown: true,
                    /*columnDefs: [
                     { name:'id'},
                     { name:'name' },
                     { name:'age' }
                     ],*/
                    data: 'data',
                    onRegisterApi: function(gridApi){
                        gridApi.infiniteScroll.on.needLoadMoreData($scope, $scope.getDataDown);
                        gridApi.infiniteScroll.on.needLoadMoreDataTop($scope, $scope.getDataUp);
                        $scope.gridApi = gridApi;
                    }
                };

                $scope.data = [];

                $scope.firstPage = 2;
                $scope.lastPage = 2;

                $scope.getFirstData = function() {
                    var promise = $q.defer();
                    $http.get(url)
                        .success(function(data) {
                            var newData = $scope.getPage(data, $scope.lastPage);
                            $scope.data = $scope.data.concat(newData);
                            promise.resolve();
                        });
                    return promise.promise;
                };

                $scope.getDataDown = function() {
                    var promise = $q.defer();
                    $http.get(url)
                        .success(function(data) {
                            $scope.lastPage++;
                            var newData = $scope.getPage(data, $scope.lastPage);
                            $scope.gridApi.infiniteScroll.saveScrollPercentage();
                            $scope.data = $scope.data.concat(newData);
                            $scope.gridApi.infiniteScroll.dataLoaded($scope.firstPage > 0, $scope.lastPage < 4).then(function() {$scope.checkDataLength('up');}).then(function() {
                                promise.resolve();
                            });
                        })
                        .error(function(error) {
                            $scope.gridApi.infiniteScroll.dataLoaded();
                            promise.reject();
                        });
                    return promise.promise;
                };

                $scope.getDataUp = function() {
                    var promise = $q.defer();
                    $http.get(url)
                        .success(function(data) {
                            $scope.firstPage--;
                            var newData = $scope.getPage(data, $scope.firstPage);
                            $scope.gridApi.infiniteScroll.saveScrollPercentage();
                            $scope.data = newData.concat($scope.data);
                            $scope.gridApi.infiniteScroll.dataLoaded($scope.firstPage > 0, $scope.lastPage < 4).then(function() {$scope.checkDataLength('down');}).then(function() {
                                promise.resolve();
                            });
                        })
                        .error(function(error) {
                            $scope.gridApi.infiniteScroll.dataLoaded();
                            promise.reject();
                        });
                    return promise.promise;
                };


                $scope.getPage = function(data, page) {
                    var res = [];
                    for (var i = (page * 100); i < (page + 1) * 100 && i < data.length; ++i) {
                        res.push(data[i]);
                    }
                    return res;
                };

                $scope.checkDataLength = function( discardDirection) {
                    // work out whether we need to discard a page, if so discard from the direction passed in
                    if( $scope.lastPage - $scope.firstPage > 3 ){
                        // we want to remove a page
                        $scope.gridApi.infiniteScroll.saveScrollPercentage();

                        if( discardDirection === 'up' ){
                            $scope.data = $scope.data.slice(100);
                            $scope.firstPage++;
                            $timeout(function() {
                                // wait for grid to ingest data changes
                                $scope.gridApi.infiniteScroll.dataRemovedTop($scope.firstPage > 0, $scope.lastPage < 4);
                            });
                        } else {
                            $scope.data = $scope.data.slice(0, 400);
                            $scope.lastPage--;
                            $timeout(function() {
                                // wait for grid to ingest data changes
                                $scope.gridApi.infiniteScroll.dataRemovedBottom($scope.firstPage > 0, $scope.lastPage < 4);
                            });
                        }
                    }
                };

                $scope.reset = function() {
                    $scope.firstPage = 2;
                    $scope.lastPage = 2;

                    // turn off the infinite scroll handling up and down - hopefully this won't be needed after @swalters scrolling changes
                    $scope.gridApi.infiniteScroll.setScrollDirections( false, false );
                    $scope.data = [];

                    $scope.getFirstData().then(function(){
                        $timeout(function() {
                            // timeout needed to allow digest cycle to complete,and grid to finish ingesting the data
                            $scope.gridApi.infiniteScroll.resetScroll( $scope.firstPage > 0, $scope.lastPage < 4 );
                        });
                    });
                };

                $scope.getFirstData().then(function(){
                    $timeout(function() {
                        // timeout needed to allow digest cycle to complete,and grid to finish ingesting the data
                        // you need to call resetData once you've loaded your data if you want to enable scroll up,
                        // it adjusts the scroll position down one pixel so that we can generate scroll up events
                        $scope.gridApi.infiniteScroll.resetScroll( $scope.firstPage > 0, $scope.lastPage < 4 );
                    });
                });
            }
        };
    }

    function appNavigator() {
        return {
            restrict: 'AE',
            templateUrl: _rootPath+'modules/common/navigation.html',
            link: function (scope, elem) {},
            controller:function($scope){}
        };
    };

    function topNavbar() {
        return {
            restrict: 'AE',
            templateUrl: _rootPath+'modules/common/top-navbar.html',
            link: function (scope, elem) {},
            controller:function($scope){}
        };
    };

    function breadcrumb($routeParams, $location) {
        return {
            restrict: 'AE',
            templateUrl: _rootPath+'modules/common/breadcrumb.html',
            link: function (scope, elem) {},
            controller:function($scope){
                var _path = $location.path().split('/');
                $scope.breadcrumb = {
                    title: _path[_path.length-1]
                };
            }
        };
    };

    function httpProvider($httpProvider) {
        //$httpProvider.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
        $httpProvider.defaults.useXDomain = true;
        delete $httpProvider.defaults.headers.common['X-Requested-With'];
        $httpProvider.defaults.headers.common["Accept"] = "*/*";
        $httpProvider.interceptors.push('tokenInterceptor');
        $httpProvider.defaults.cache = false;
        $httpProvider.defaults.timeout = 600000;
    };

    app
        .config(['$httpProvider', httpProvider])
        .config(angularHelper)
        .config(['$routeProvider', config])
        .directive('appNavigator', appNavigator)
        .directive('topNavbar', topNavbar)
        .directive('breadcrumb', ['$routeParams', '$location', breadcrumb])
        .directive('appGrid', ['$q', '$http','$timeout', ideGrid])
        .controller('appController', ['$scope', '$compile', '$timeout', appController])
        .controller('dashboardController', dashboardController)
        .run(['$rootScope','authenticationFactory', function($rootScope, authenticationFactory) {
            $rootScope.$on("$routeChangeStart", function (event, nextRoute, currentRoute) {

            });
            $rootScope.$on('$routeChangeSuccess', function (event, nextRoute, currentRoute) {
            });
            $rootScope.$on('$routeChangeError', function (event, current, previous, rejection) {});
            $rootScope.$on('$viewContentLoaded', function () {
                $rootScope.isLoggedIn = authenticationFactory.isAuthorized();
            });
        }]);

    angular.element(document).ready(function () {
        document.body.innerHTML='<div ng-controller="appController as main" id="page-top"><div id="wrapper"><div app-navigator ng-if="isLoggedIn"></div><div top-navbar ng-if="isLoggedIn"></div><div id="page-wrapper" ng-view></div></div></div>';
        angular.bootstrap(document, [appName]);
    });
    return;
})();
