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
                $scope.gridData = response;
            },  function (error) {
                console.log('error' + error);
            });
        };
        $scope.gridActionCallBack = function(type, data){
            var _popup = popupView.userManagement[type][_userManagementType];
            var svc = new userManagementModel()[_userManagementType];
            $scope[type] = new svc.model;

            var _model = new svc.model;
            var _modelData = angular.extend({}, _model, data);

            popupService.showPopup(_popup.templateUrl, { model : _modelData });
        };

        function submitBusinessConfig(that, type, data)
        {
            var svc = new userManagementModel()['businessConfig']['post'][type];
            svc.data = data;
            ajaxService.http(svc).then(function (response) {
                console.log(response);
            },  function (error) {
                console.log('error' + error);
            });
        }

        function updateData(that, type, data)
        {
            var svc = new userManagementModel()['businessConfig']['put'][type];
            svc.params = JSON.stringify(data);
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
            showBCPopup(_popup);
        };

        function showBCPopup (_popup, popupType, data){
            popupService.showPopup(_popup.templateUrl, {
                submitData:submitBusinessConfig,
                updateData:updateData,
                getInfo:getInfo,
                type:popupType,
                data: data
            }).then(function (error) {
            }, function (error) {
                $scope.onInitBusinessConfig('businessConfig');
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
        this.address = function () {
            this.line1 = null;
            this.line2 = null;
            this.city_id = null;
        };
    }
    function retailer() {
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
                        { name: 'Action', width:110, cellEditableCondition: true, cellTemplate:_actionTemplate },
                        { name:'name', displayName:'Name' },
                        { name:'phone', displayName:'Phone', width:110 },
                        { name:'pan_number', displayName:'Pan Number', width:200}
                      ],
                    get:{ method: 'GET', url: 'users/ba/v1/' }
                },
                distributor:{
                    model:distributor,
                    configs:[
                        { name: 'Action', width:110, cellEditableCondition: true, cellTemplate:_actionTemplate },
                        { name:'name', displayName:'Name'},
                        { name:'zone["name"]', displayName:'Zone', cellTemplate: '<div class="ui-grid-cell-contents">{{ row.entity.zone.name }}</div>', width:110},
                        { name:'credit_limit', displayName:'Credit Limit', width:110},
                        { name:'storage_capacity', displayName:'Storage Capacity', width:110}
                     ],
                    get:{ method: 'GET', url: 'users/distributor/v1/' }
                },
                retailer:{
                    model:retailer,
                    configs:[
                        { name:'name', displayName:'Name'},
                        { name:'area', displayName:'Area'},
                        { name:'dealswith', displayName:'Deals With Products'},
                        { name:'completed', displayName:'Completed'},
                        { name:'task', displayName:'Task'},
                        { name:'date', displayName:'Date'},
                    ],
                    get:{ method: 'GET', url: 'users/retailers/v1/' }
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
                performCallBack:'&?'
            },
            link: function ($scope, elem) {},
            controller:function($scope, $element){
                $scope.gridHeight =  $(window).height()-340 +"px";
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
                    }
                };

                //Expandable Grid
                $scope.gridOptions.expandableRowTemplate = _rootPath+ 'modules/common/controls/expandableRowTemplate.html';
                $scope.gridOptions.expandableRowHeight = 200;
                //subGridVariable will be available in subGrid scope
                $scope.gridOptions.expandableRowScope = {
                    subGridVariable: 'subGridScopeVariable'
                };

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

    function ajaxService($http, $q, $timeout, configUrl, notifyService) {
        this.http = function (request, successFunction, errorFunction) {
            request.url = configUrl.base + request.url;
            var deferred = $q.defer();
            $http(request).success(function (response) {
                deferred.resolve(response);
            }).error(function (xhr, status, error, exception) {
                deferred.reject(xhr);
            });
            return deferred.promise;
        }
    }

    function notifyService() {
        this.notify = function () {}
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

    app
        .config(['$httpProvider', httpProvider])
        .config(angularHelper)
        .config(['$routeProvider', config])
        .constant('configUrl', { base:'http://54.169.85.50:8009/' })
        .directive('appNavigator', appNavigator)
        .directive('topNavbar', topNavbar)
        .directive('breadcrumb', breadcrumb)
        .directive('appGrid', ['$q', '$http','$timeout', appGrid])
        .directive('actions', goActions)
        .directive('stringToNumber', stringToNumber)
        .controller('appController', ['$scope', '$compile', '$timeout', appController])
        .controller('dashboardController', dashboardController)
        .controller('userManagementController',['$scope', 'userManagementModel', 'popupService', userManagementController])
        .factory('userManagementModel', ['ajaxService', userManagementModel])
        .service('notifyService', notifyService)
        .service('ajaxService', ['$http', '$q', '$timeout', 'configUrl', 'notifyService', ajaxService])
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
