(function () {
    var appName = window['name'];
    var app = angular.module(appName, ['ngRoute', appName+'.core', 'ui.bootstrap', 'ui.grid', 'ui.grid.expandable', 'ui.grid.pagination']);
    var _rootPath = './app/';
    var _baseModulesPath = {
        templateUrl:'./app/',
        userManagement:_rootPath+'modules/user-management/',
    };

    var popupView = {
        dashboard:{
            view:{ templateUrl:_baseModulesPath['templateUrl'] + 'templates/popups/popup-view.html' },
            delete:{ templateUrl:_baseModulesPath['templateUrl'] + 'templates/popups/popup-delete.html' },
            edit:{ templateUrl:_baseModulesPath['templateUrl'] + 'templates/popups/popup-edit.html' }
        },
        userManagement:{
            view:{
                businessConfig:{templateUrl: _baseModulesPath.userManagement + 'popups/add/business-configs.add.popup.html'},
                distributor:{templateUrl: _baseModulesPath.userManagement + 'popups/add/distributor.add.popup.html'},
                businessAssociate:{templateUrl: _baseModulesPath.userManagement + 'popups/add/business-associate.add.popup.html'},
                retailer:{templateUrl: _baseModulesPath.userManagement + 'popups/add/retailer.add.popup.html'},
            },
            delete:{
                businessConfig:{templateUrl: _baseModulesPath.userManagement + 'popups/delete/business-configs.delete.popup.html'},
                distributor:{templateUrl: _baseModulesPath.userManagement + 'popups/delete/distributor.delete.popup.html'},
                businessAssociate:{templateUrl: _baseModulesPath.userManagement + 'popups/delete/business-associate.delete.popup.html'},
                retailer:{templateUrl: _baseModulesPath.userManagement + 'popups/delete/retailer.delete.popup.html'},
            },
            edit:{
                businessConfig:{templateUrl: _baseModulesPath.userManagement + 'popups/edit/business-configs.edit.popup.html'},
                distributor:{templateUrl: _baseModulesPath.userManagement + 'popups/edit/distributor.edit.popup.html'},
                businessAssociate:{templateUrl: _baseModulesPath.userManagement + 'popups/edit/business-associate.edit.popup.html'},
                retailer:{templateUrl: _baseModulesPath.userManagement + 'popups/edit/retailer.add.popup.html'}
            }
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
            templateUrl: _baseModulesPath.userManagement+'templates/business-configs.html',
            controller:userManagementController
        },
        distributor:{
            templateUrl: _baseModulesPath.userManagement+'templates/distributor.html',
            controller:userManagementController
        },
        businessAssociate:{
            templateUrl: _baseModulesPath.userManagement+'templates/business-associate.html',
            controller:userManagementController
        },
        retailer:{
            templateUrl: _baseModulesPath.userManagement+'templates/retailer.html',
            controller:userManagementController
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

    function userManagementController($scope, userManagementModel, ajaxService, popupService){
        var _userManagementType = '';
        $scope.initUserManagement = function(type){
            _userManagementType = type;
            var svc = new userManagementModel()[type];
            $scope.columnDefs = svc.configs;
            ajaxService.http(svc['get']).then(function (response) {
                if('retailer' == _userManagementType){
                    $scope.gridData = response.retailers;
                }else {
                    $scope.gridData = response;
                }
            },  function (error) {
                console.log('error' + error);
            });
        };
        $scope.gridActionCallBack = function(type, data){
            if('expand' == type ) {
                if (_userManagementType == 'distributor'){
                    if (data.isExpanded) {
                        data.entity.details = {};
                        data.entity.detailsType = 'distributor';
                        var svc = new userManagementModel()[_userManagementType];
                        svc['get'].url += data.entity.id + '/';

                        ajaxService.http(svc['get']).then(function (response) {
                            data.entity.details = response;
                        }, function (error) {
                        });
                    }
                }
            }else {
                var _popup = popupView.userManagement[type][_userManagementType];
                var svc = new userManagementModel()[_userManagementType];
                var _model = new svc.model;
                var _modelData = angular.extend({}, _model, data);
                popupService.showPopup(_popup.templateUrl, {model: _modelData, updateData: updateUserManagementData});
            }
        };

        function submitBusinessConfig(that, type, data)
        {
            var svc = new userManagementModel()['businessConfig']['post'][type];
            svc.data = data;
            ajaxService.http(svc).then(function (response) {
                console.log(response);
                _popup.close();
                $scope.onInitBusinessConfig('businessConfig');

            },  function (error) {
                console.log('error' + error);
            });
        }

        function submitUserManagementData(that, type, data)
         {
            var svc = new userManagementModel()[_userManagementType]['post'];

             if('businessAssociate' == _userManagementType) {
                 svc.data = {'ba': data};
             } else if('distributor' == _userManagementType) {
                svc.data = {'distributor': data};
            } else if('retailer' == _userManagementType) {
                 svc.data = {'retailer': data};
             }
            ajaxService.http(svc).then(function (response) {
                console.log(response);
                _popup.close();
                $scope.initUserManagement(_userManagementType);
            },  function (error) {
                console.log('error' + error);
            });
        }

        function updateUserManagementData(that, type, data)
        {
            var svc = new userManagementModel()[_userManagementType]['put'];

            var _dataInfo = {};
            if('businessAssociate' == _userManagementType) {
                _dataInfo = {'ba': data};
            } else if('distributor' == _userManagementType) {
                _dataInfo = {'distributor': data};
            } else if('retailer' == _userManagementType) {
                _dataInfo = {'retailer': data};
            }

            svc.data =  JSON.stringify(_dataInfo);

            svc.url += data.id+'/';
            ajaxService.http(svc).then(function (response) {
                console.log(response);
            },  function (error) {
                console.log('error' + error);
            });
        }

        function updateData(that, type, data)
        {
            var svc = new userManagementModel()['businessConfig']['put'][type];
            svc.url += data.city_id +'/';
            svc.data = data;
            ajaxService.http(svc, data).then(function (response) {
                console.log(response);
            },  function (error) {
                console.log('error' + error);
            });
        }

        function getInfo(that, type)
        {
            var svc = new userManagementModel()['businessConfig']['get'][type];
            ajaxService.http(svc).then(function (response) {
                var name = type+'list';
                that[name] = response;
            },  function (error) {
                console.log('error' + error);
            });
        }

        $scope.breadcrumbCallBack = function(type){
            var _popup = popupView.userManagement['view'][type];
            if(type =='businessConfig'){
                showBCPopup(_popup);
            }else{
                showUserManagementPopup(_popup);
            }
        };

        function showUserManagementPopup (_popup){
            var svc = new userManagementModel()[_userManagementType];
            var _model = new svc.model;

            var _options = {
                submitData:submitUserManagementData,
                model:_model
            };

            popupService.showPopup(_popup.templateUrl, _options).then(function (error) {

                },
                function (error) {});
        }

        function showBCPopup (_popup, popupType, data){
            popupService.showPopup(_popup.templateUrl, {
                submitData:submitBusinessConfig,
                updateData:updateData,
                getInfo:getInfo,
                type:popupType,
                data: data
            }).then(function (error) {

            }, function (error) {

            });
        }

        $scope.onInitBusinessConfig = function (type)
        {
            var svc = new userManagementModel()[type];
            ajaxService.http(svc['get']['allinfo']).then(function (response) {
                $scope.states = response;
            },  function (error) {
                console.log('error' + error);
            });
        };

        $scope.changeInfo = function (type, data, initType){
            $scope[type] = data;
            if(initType) {
                $scope[initType] = [];
            }
        }

        $scope.onBusinessConfigEdit = function (type, data){
            var _popup = popupView.userManagement['edit']['businessConfig'];
            showBCPopup(_popup, type, data);
        }

        $scope.onEdit = function (type, data){
            /*var _popup = popupView.userManagement['edit'][type];
            showBCPopup(_popup);*/
            alert('In Pending State');
        }
    };

    function distributor() {
        this.name = null;
        this.email = null;
        this.pan_number = null;
        this.storage_capacity = null;
        this.credit_period = null;
        this.vehicle_info = null;
        this.ba_required = null;
        this.security_amount = null;
        this.bank_account_number = null;
        this.ifsc_code = null;
        this.alternate_phone = null;
        this.father_name = null;
        this.phone = null;
        this.zone_id = null;
        this.name_on_passbook = null;
        this.credit_limit = null;
        this.address = new addressInfo();
        function addressInfo() {
            this.line1 = null;
            this.line2 = null;
            this.city_id = null;
        };
    }
    function retailer() {
        this.name = null;
    }
    function businessAssociate() {
        this.name = null;
        this.doj = null;
        this.manager = null;
        this.fathersName = null;
        this.DOB = null;
        this.emailId = null;
        this.contactNo = null;
        this.panNo = null;
        this.bankName = null;
        this.accNo = null;
        this.ifsc = null;
        this.localReference = null;
        this.emergencyNo = null;

    }

    function userManagementModel(){
        return function () {
            var _actionTemplate = '<div class="ui-grid-cell-contents" actions data="row" perform-call-back="grid.appScope.actionCallBack"></div>'
            return {
                businessAssociate:{
                    model: businessAssociate,
                    configs:[
                        { name:'name', displayName:'Name' },
                        { name:'phone', displayName:'Phone', width:110 },
                        { name:'pan_number', displayName:'Pan Number', width:200},
						{ name: 'Action', width:110, cellEditableCondition: true, cellTemplate:_actionTemplate }
                      ],
                    get:{ method: 'GET', url: 'users/ba/v1/' },
                    post:{ method: 'POST', url: 'users/ba/v1/' },
                    put:{ method: 'PUT', url: 'users/ba/v1/' }
                },
                distributor:{
                    model:distributor,
                    configs:[
                        { name:'name', displayName:'Name'},
                        { name:'zone["name"]', displayName:'Zone', cellTemplate: '<div class="ui-grid-cell-contents">{{ row.entity.zone.name }}</div>', width:110},
                        { name:'credit_limit', displayName:'Credit Limit', width:110},
                        { name:'storage_capacity', displayName:'Storage Capacity', width:110},
						{ name: 'Action', width:110, cellEditableCondition: true, cellTemplate:_actionTemplate }
                     ],
                    get:{ method: 'GET', url: 'users/distributor/v1/' },
                    post:{ method: 'POST', url: 'users/distributor/v1/' },
                    put:{ method: 'PUT', url: 'users/distributor/v1/' }
                },
                retailer:{
                    model:retailer,
                    configs:[
                        { name:'name', displayName:'Name'},
                        { name:'phone', displayName:'Phone'},
                        { name:'email', displayName:'Email'}
                    ],
                    get:{ method: 'GET', url: 'users/retailers/v1/' },
                    post:{ method: 'POST', url: 'users/retailers/v1/' },
                    put:{ method: 'PUT', url: 'users/retailers/v1/' }
                },
                businessConfig:{
                    get: {
                        states:{method: 'GET',url : 'users/locations/states/v1/'},
                        cities:{method: 'GET', url : 'users/locations/cities/v1/'},
                        zones:{method: 'GET', url : 'users/locations/zones/v1/'},
                        allinfo:{method: 'GET', url : 'users/locations/allinfo/v1/'}
                    },
                    post: {
                        states:{method: 'POST', url : 'users/locations/states/v1/'},
                        cities:{method: 'POST', url : 'users/locations/cities/v1/'},
                        zones:{method: 'POST', url : 'users/locations/zones/v1/'}
                    },
                    put: {
                        zones:{method: 'PUT', url : 'users/locations/zones/v1/'}
                    },
                }
            };
        }
    };

    function goActions(){
        return {
            restrict: 'AE',
            scope:{
                data:'=?',
                performCallBack:'&?'
            },
            template:'<div class="btn-group"><!--<button class="btn-white btn btn-xs view" style="height: 20px;">View</button>-->\
            <button class="btn-white edit" style="height: 20px;margin-left: 5px;"><i class="fa fa-pencil"></i></button>\
            <button class="btn-white delete" style="height: 20px;"><i class="fa fa-trash"></i> </button></div>',
            controller: function($scope, $element){
                $element.on('click', '.btn-white.btn.btn-xs.view', function(e){
                    e.stopPropagation();
                    $scope.performCallBack()('view', $scope.data.entity);
                });
                $element.on('click', '.btn-white.edit', function(e){
                    e.stopPropagation();
                    $scope.performCallBack()('edit', $scope.data.entity);
                });
                $element.on('click', '.btn-white.delete', function(e){
                    e.stopPropagation();
                    $scope.performCallBack()('delete', $scope.data.entity);
                });
            }
        };
    }

    function appGrid($q, $http, $timeout) {
        return {
            restrict: 'AE',
            templateUrl: _rootPath+ 'modules/common/controls/grid.html',
            scope:{
                data:'=',
                columnDefs:'=',
                performCallBack:'&?',
                type:'@?'
            },
            link: function ($scope, elem) {},
            controller:function($scope, $element) {
                $scope.gridHeight = $(window).height() - 340 + "px";
                $scope.gridOptions = {
                    columnDefs: $scope.columnDefs,
                    data: 'data',
                    //flatEntityAccess: true,
                    paginationPageSizes: [10, 25, 50, 75, 100],
                    paginationPageSize: 25,
                    enableFiltering: false,
                    enableColumnResizing: true,
                    enableGridMenu: false,
                    onRegisterApi: function (gridApi) {
                        $scope.gridApi = gridApi;
                        $scope.gridApi.expandable.on.rowExpandedStateChanged($scope, function (row) {
                            $scope.performCallBack()('expand', row);
                        });
                    }
                };

                if ($scope.type){
                    var _expandBasePath = _rootPath + 'modules/user-management/expand-row-details/';

                    //Expandable Grid
                    $scope.gridOptions.expandableRowTemplate = _expandBasePath +$scope.type+ '.html';
                    $scope.gridOptions.expandableRowHeight = 250;
                    //subGridVariable will be available in subGrid scope
                    $scope.gridOptions.expandableRowScope = {
                        subGridVariable: 'subGridScopeVariable'
                    };
                }

                $scope.actionCallBack = function(type, data){
                    $scope.performCallBack()(type, data);
                };
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

    function breadcrumb() {
        return {
            restrict: 'AE',
            scope:{
                name:'@?',
                key:'@?',
                callBack:'&?'
            },
            templateUrl: _rootPath+'modules/common/breadcrumb.html',
            link: function (scope, elem) {},
            controller:function($scope){
                $scope.invokeCallBack = function(){
                    $scope.callBack()($scope.key);
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

    function ajaxService($http, $q, $timeout, configUrl, notifyService, loading) {
        this.http = function (request, successFunction, errorFunction) {
            loading.start();
            request.url = configUrl.base + request.url;
            var deferred = $q.defer();
            $http(request).success(function (response) {
                loading.stop();
                deferred.resolve(response);
            }).error(function (xhr, status, error, exception) {
                loading.stop();
                notifyService.notifyError(xhr, status, error, exception);
                deferred.reject(xhr);
            });
            return deferred.promise;
        }
    }
    function notifyService() {
        var myStack = { "dir1": "down", "dir2": "right", "push": "top" };
        var pines = {};
        pines.notify = function () {
            new PNotify({
                title: 'Sticky Notice',
                text: 'Check me out! I\'m a sticky notice. You\'ll have to close me yourself.',
                hide: false
            });
        };
        pines.notifySuccess = function (opts) {
            if(!opts) {
                new PNotify({
                    title: 'Sticky Success',
                    text: 'Sticky success... I\'m not even gonna make a joke.',
                    type: 'success',
                    hide: false
                });
            }else{
                new PNotify(opts);
            }
        };
        pines.notifyInfo = function (info) {
            new PNotify({
                title: 'Notify user',
                text: info.message,
                type: 'info',
                delay: 3000
            });
        };
        pines.notifyError = function (xhr, status, error, exception) {
            var _error = (null!=xhr && xhr.ErrorKey) ? xhr.ErrorKey:'';
            var statusErrorMap = {
                '400': "Server understood the request, but request content was invalid. \n" + _error,
                '403': "Unauthorized access.",
                '404': "Resource not found.",
                '500': "Internal server error.",
                '503': "Service unavailable."
            };

            var exceptionErrorMap = {
                'parsererror': "Error.\nParsing JSON Request failed.",
                'timeout': "Request Time out.",
                'abort': "Request was aborted by the server"
            };

            var message;
            if (status) {
                message = statusErrorMap[status];
            } else if (exception) {
                message = exceptionErrorMap[exception];
            }
            if (!message) {
                message = "System Error";
            }

            var opts = {
                title: "croForm",
                text: message,
                type : 'error'
            };
            PNotify.removeAll();
            if(status !== 403) // We are performing auto-redirect to login
                new PNotify(opts);
        };
        return pines;
    }

    function stringToNumber() {
        return {
            require: 'ngModel',
            link: function(scope, element, attrs, ngModel) {
                ngModel.$parsers.push(function(value) {
                    return '' + value;
                });
                ngModel.$formatters.push(function(value) {
                    return parseFloat(value, 10);
                });
            }
        };
    }

    function stateCityZone($http, $q, configUrl) {
        return {
            restrict: 'AE',
            templateUrl: _rootPath+ 'modules/common/controls/state-city-zone.html',
            link: function (scope, elem) {},
            scope:{
                cityId:'=',
                zoneId:'=',
            },
            controller:function($scope){
                $scope.changeCity = function(city){
                    var _info = getInfo();
                    _info.zone.params = {'city_id': city.id};
                    $scope.model.city.id  = $scope.cityId = city.id;
                    $scope.model.city.name  = city.name;

                    http(_info.zone).then(function (response, status) {
                        $scope.zoneList = response.zones;
                    }, function (response, status) {
                        $scope.zoneList = [];
                    });
                }
                $scope.changeZone = function(zone){
                    $scope.model.zone.id = $scope.zoneId = zone.id;
                    $scope.model.zone.name  = zone.name;
                }

                var http = function (request) {
                    request.url = configUrl.base + request.url;
                    var deferred = $q.defer();
                    $http(request).success(function (response) {
                        deferred.resolve(response);
                    }).error(function (xhr, status, error, exception) {
                        deferred.reject(xhr);
                    });
                    return deferred.promise;
                }

                function getInfo()
                {
                    return {
                        state: {method: 'GET', url: 'users/locations/states/v1/'},
                        city: {method: 'GET', url: 'users/locations/cities/v1/'},
                        zone: {method: 'GET', url: 'users/locations/zones/v1/'},
                    }
                }


                function stateCityZoneModel(){
                    this.state={
                        id:null,
                        name:null
                    },
                    this.city={
                        id:null,
                        name:null
                    },
                    this.zone={
                        id:null,
                        name:null
                    }

                }
                $scope.model = new stateCityZoneModel();
                (function(){
                    var _info = getInfo();
                    http(_info.city).then(function(response, status) {
                        $scope.cityList = response.cities;
                    }, function(response, status) {
                        $scope.cityList = [];
                    });
                })();
            }
        };
    }

    function maxTextCount() {
        return {
            require: "ngModel",
            scope: {
                text: "=ngModel"
            },
            link: function ($scope, $element, attributes) {
                var maxTextCount = attributes.maxTextCount;
                $element.bind("keyup", function () {
                    var _text = ''+$scope.text;
                    if (_text.length > maxTextCount) {
                        _text = _text.substring(0, maxTextCount);
                        $scope.text = parseInt(_text);
                        if ($scope.$root.$$phase != '$apply' && $scope.$root.$$phase != '$digest') {
                            $scope.$apply();
                        }
                    }
                });
            }
        }
    }

    app
        .config(['$httpProvider', httpProvider])
        .config(angularHelper)
        .config(['$routeProvider', config])
        .constant('configUrl', { base:'http://54.169.85.50:8009/' })
        .constant('loading', {
            start: function () {
                $('#pageLoader').show();
            },
            stop: function () {
                $('#pageLoader').hide();
            }
        })
        .directive('appNavigator', appNavigator)
        .directive('topNavbar', topNavbar)
        .directive('breadcrumb', breadcrumb)
        .directive('appGrid', ['$q', '$http','$timeout', appGrid])
        .directive('actions', goActions)
        .directive('stateCityZone', stateCityZone)
        .directive('stringToNumber', stringToNumber)
        .directive("maxTextCount", maxTextCount)
        .controller('appController', ['$scope', '$compile', '$timeout', appController])
        .controller('dashboardController', dashboardController)
        .controller('userManagementController',['$scope', 'userManagementModel', 'popupService', userManagementController])
        .factory('userManagementModel', ['ajaxService', userManagementModel])
        .factory('notifyService', notifyService)
        .service('ajaxService', ['$http', '$q', '$timeout', 'configUrl', 'notifyService', 'loading', ajaxService])
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
        document.body.innerHTML='<div ng-controller="appController as main" id="page-top">' +
            '<div id="wrapper"><div app-navigator ng-if="isLoggedIn"></div><div top-navbar ng-if="isLoggedIn"></div><div id="page-wrapper" ng-view></div></div>' +
            '<div class="preloader" id="pageLoader" style="display: none"><div class=" block-ui-overlay"></div><div class="block-ui-message-container"><div class="block-ui-message">Loading <span class="loader-img"><img src="assets/images/loader.gif"/></span></div></div></div>' +
            '</div>';
        angular.bootstrap(document, [appName]);
    });
    return;
})();
