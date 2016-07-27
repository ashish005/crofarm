(function(define, angular){
    "use strict";
    var _mod = window['name'] + '.core';
    var core = angular.module(_mod, ['ui.bootstrap', 'ngRoute']);

    var _coreBase = 'app/core/templates/';
    var _viewOptions = {
        login: {
            templateUrl: _coreBase + 'login.html'
        },
        lockscreen:{
            templateUrl: _coreBase + 'lockscreen.html'
        },
        400:{
            templateUrl: _coreBase + 'error/page-not-found.html'
        },
        500:{
            templateUrl: _coreBase + 'error/internal-server-error.html'
        },
    };

    function authenticationFactory($window) {
        var auth = {
            isLoggedIn: false,
            userInfo:{
                name: '',
                email: '',
                role: '',
                isAuthenticated  : false
            },
            check: function () {
                if ($window.localStorage.token && $window.localStorage.email)
                {
                    this.isLoggedIn = true;
                } else {
                    this.isLoggedIn = false;
                    delete this.user;
                }
            },
            getInfo: function (user) {
                this.setAuthInfoFromStorage();
                return this.userInfo;
            },
            setInfo: function (user) {
                this.userInfo['name'] = user['name'];
                this.userInfo['email'] = user['email'];
                this.userInfo['role'] = user['role'];
                this.userInfo['token']  = user['token'];
                this.userInfo['isAuthenticated'] = user['isVerified'];

                $window.localStorage.token = this.userInfo['token'];
                $window.localStorage.name = this.userInfo['name'];
                $window.localStorage.email = this.userInfo['email'];
                $window.localStorage.role = this.userInfo['role'];
                $window.localStorage.isAuthenticated = this.userInfo['isAuthenticated'];
            },
            setAuthInfoFromStorage: function () {
                this.userInfo['name'] =  $window.localStorage.name;
                this.userInfo['email'] = $window.localStorage.email;
                this.userInfo['role'] = $window.localStorage.role;
                this.userInfo['token']  = $window.localStorage.token;
                this.userInfo['isAuthenticated'] = $window.localStorage.isAuthenticated;
            },
            clearInfo: function () {
                this.isLoggedIn = false;

                delete this.userInfo['name'];
                delete this.userInfo['email'];
                delete this.userInfo['role'];
                delete this.userInfo['token'];
                delete this.userInfo['isAuthenticated'];

                //Remove window session storage code
                delete $window.localStorage.token;
                delete $window.localStorage.name;
                delete $window.localStorage.email;
                delete $window.localStorage.role;
                delete $window.localStorage.isAuthenticated;
            },
            getAuthToken: function () {
                return 'Bearer ' + $window.localStorage.token;
            },
            isAuthorized: function () {
                return ($window.localStorage.isAuthenticated == "true");
            },
            setAuthorized: function (flag) {
                $window.localStorage.isLoggedIn = flag;
                $window.localStorage.isAuthenticated = flag;
            }
        }
        return auth;
    }

    function tokenInterceptor($q, $location, authenticationFactory) {
        return {
            request: function (config) {
                config.headers = config.headers || {};
                config.headers.Authorization = authenticationFactory.getAuthToken();
                return config;
            },
            requestError: function (rejection) {
                return $q.reject(rejection);
            },
            /* Set Authentication.isAuthenticated to true if 200 received */
            response: function (response) {
                if (response != null && response.status == 200 && authenticationFactory.getAuthToken() && !authenticationFactory.isAuthenticated) {
                    authenticationFactory.isAuthenticated = true;
                }
                return response || $q.when(response);
            },
            /* Revoke client authentication if 401 is received */
            responseError: function (rejection) {
                if (rejection != null && rejection.status === 401 && (authenticationFactory.getAuthToken() || authenticationFactory.isAuthenticated)) {
                    //delete $window.localStorage.token;//Remove window session storage code
                    authenticationFactory.clearInfo();
                    authenticationFactory.isAuthenticated = false;
                    $location.path("/login");
                }
                return $q.reject(rejection);
            }
        };
    }

    function authController($scope, $rootScope, $http, $location, authenticationFactory, coreApis) {
        $scope.initLoginForm = function() {
            debugger;
            authenticationFactory.setAuthorized(false);
            $scope.form = {
                email: 'me.ashish005@gmail.com',
                password: '123456'
            }
        };
        $scope.submitLoginForm = function() {
            authenticationFactory.setAuthorized(true);
            $location.path('/home');
            /*coreApis.login($scope.form).then(function(data, status, headers, config){
             authenticationFactory.setInfo(data['data']);
             $location.path('/');
             }, function(error){});*/
        };
    }

    function routeProvider ($routeProvider, $httpProvider) {
        $routeProvider
            .when('/', _viewOptions['login'])
            .when('/login', _viewOptions['login'])
            .when('/lockscreen', _viewOptions['lockscreen'])
            .when('/400', _viewOptions['400'])
            .when('/500', _viewOptions['500'])
    };

    function coreApis($http, $rootScope, $location) {
        function ajaxRequest(request){
            return $http(request);
        }
        var apis = {
            login:function(data){
                var _req = {method: 'POST', url: '/signin', data: data};
                return ajaxRequest(_req);
            }
        };

        return apis;
    };

    function popupService($q, modalService, $timeout) {
        var modalDefaults = { backdrop: true, keyboard: true, modalFade: true, templateUrl: '', windowClass: 'default-popup' };
        var _model = {};
        _model.showPopup = function (template, model) {
            modalDefaults.windowClass = 'default-popup';
            modalDefaults.templateUrl = template;
            return modalService.showModal(modalDefaults, model);
        };
        return _model;
    }

    function modalService($modal) {
        var modalDefaults = {
            backdrop: true,
            keyboard: true,
            modalFade: true,
            templateUrl: '',
            windowClass: ''
        };
        var modalOptions = {
            closeButtonText: 'Close',
            actionButtonText: 'OK',
            headerText: 'Proceed?',
            bodyText: 'Perform this action?'
        };
        this.showModal = function (customModalDefaults, customModalOptions) {
            if (!customModalDefaults) customModalDefaults = {};
            customModalDefaults.backdrop = 'static';
            return this.show(customModalDefaults, customModalOptions);
        };

        this.show = function (customModalDefaults, customModalOptions) {
            //Create temp objects to work with since we're in a singleton service
            var tempModalDefaults = {};
            var tempModalOptions = {};

            //Map angular-ui modal custom defaults to modal defaults defined in service
            angular.extend(tempModalDefaults, modalDefaults, customModalDefaults);

            //Map modal.html $scope custom properties to defaults defined in service
            angular.extend(tempModalOptions, modalOptions, customModalOptions);

            if (!tempModalDefaults.controller) {
                tempModalDefaults.controller = function ($scope, $modalInstance) {
                    $scope.modalOptions = tempModalOptions;
                    $scope.modalOptions.ok = function (result) {
                        $modalInstance.close(result);
                    };
                    $scope.modalOptions.close = function (result) {
                        $modalInstance.dismiss('cancel');
                    };
                }
            }
            return $modal.open(tempModalDefaults).result;
        };
    }

    core
        .factory('authenticationFactory', ["$window", authenticationFactory])
        .factory('tokenInterceptor', ['$q', '$location', 'authenticationFactory', tokenInterceptor])
        .config(['$routeProvider', '$locationProvider', '$httpProvider', routeProvider])
        .factory("popupService", ['$q', "modalService", '$timeout', popupService])
        .service("modalService", ["$modal", modalService])
        .controller('authController', ['$scope', '$rootScope', '$http', '$location', 'authenticationFactory', 'coreApis', authController])
        .service("coreApis", ["$http", '$rootScope', '$location', coreApis])
})(window.define, window.angular);