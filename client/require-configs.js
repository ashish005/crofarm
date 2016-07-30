/**
 * Created by wizdev on 10/22/2015.
 */
var _basePath = {
    libs:'assets/libs/',
    app:'app/'
};
var appName = 'croFarm';
window['name'] = appName;
require.config({
    urlArgs: 'v=1.0',
    waitSeconds: 200,
    paths: {
        app: 'app/base',
        jQuery:  _basePath.libs+'jquery/jquery-2.1.1.min',
        'jQuery-ui':  _basePath.libs+'jquery/jquery-ui/jquery-ui.min',
        angular: _basePath.libs+"angular/angular",
        angularAMD:  _basePath.libs+'angular/angularAMD.min',
        ngRoute:  _basePath.libs+'angular/angular-route',
        bootstrap: _basePath.libs+'bootstrap/bootstrap.min',
        'pnotify': _basePath.libs+'pnotify/pnotify.custom.min',
        'ui-bootstrap': _basePath.libs+'bootstrap/ui-bootstrap-tpls-0.12.0.min',
        "app-core":_basePath.app+"core/core",
        "ui-grid":_basePath.libs+"ui-grid/ui-grid-unstable"
    },
    // angular does not support AMD out of the box, put it in a shim
    shim: {
        angularAMD: ['angular'],
        angular: {exports: "angular", deps: ["jQuery-ui"]},
        ngRoute: {deps: ["angular"]},
        bootstrap:{deps:['jQuery']},
        jqHighlight:{deps:['jQuery']},
        'ui-bootstrap':{deps: ['jQuery', 'angular']},
        "ui-grid":{deps: ['angular']},
        "app-core":{
            deps: ['bootstrap', 'angular']
        },
        "dndLists":{
            deps: ['angular']
        },
        'jQuery-ui':{
            deps: ['jQuery']
        },
        pnotify:{
            deps: ['jQuery']
        },
        "ui-sortable":{deps: ['angular','jQuery-ui']},
        app:{
            deps: ["app-core",'bootstrap', 'ngRoute', 'ui-bootstrap',"ui-grid", 'pnotify']
        }
    },
    // kick start application
    deps: ['app']
});