var app = angular.module ('admin', ['ui.router', 'ngFileUpload']);

app.config (['$stateProvider', '$urlRouterProvider', '$locationProvider', function ($stateProvider, $urlRouterProvider, $locationProvider) {

	$stateProvider	
		.state ('dashboard', {
			url: '/admin',
			views: {
				'': {
					templateUrl: '/javascripts/angular/templates/admin/admin-template.html',
					controller: 'AdminController'
				},
				
				'ordersList@dashboard' :{
					templateUrl: '/javascripts/angular/templates/admin/orders-list-template.html',
					controller: 'OrdersListController'
				},
				
				'usersList@dashboard': {
					templateUrl: '/javascripts/angular/templates/admin/users-list-template.html',
					controller: 'UsersListController'
				},

				'productsList@dashboard': {
					templateUrl: '/javascripts/angular/templates/admin/products-list-template.html',
					controller: 'ProductsListController'
				}
			}
		});

		$urlRouterProvider.otherwise ('/admin');

	$locationProvider.html5Mode ({
		enabled: true,
		requireBase: false
	});
}]);

app.controller ('OrdersListController', ['$scope', '$rootScope', '$http', function ($scope, $rootScope, $http){
	// load all the orders here
	$http.get ('/order/multiPopulate').then (function (data) {
		var response = data.data;
		$scope.orders = response;
	}, function (data) {
		console.log ('ERROR: '+ JSON.stringify (data));
	});

	$scope.title = 'All Orders';

	$scope.parseDate = function (timestamp) {
		var date = new Date (timestamp);
		return date;
	}
}]);

app.controller ('UsersListController', ['$scope', '$rootScope', '$http', function ($scope, $rootScope, $http) {
	// load alll the users here
	$scope.title = 'All users';
	$http.get ('/user/all').then (function (data) {
		if (data.data.status =='success') {
			$scope.users = data.data.message;
			console.log ($scope.users);
		} else
			console.log (data.data.message);
	}, function (data) {
		console.error (JSON.stringify (data));
	});

	$scope.showNewUserModal = function() {
		$('#new-user-modal').modal();
	}

	$scope.createUser = function () {
		$http.post ('/user/signup', {username: $scope.nUsername, password: $scope.nPassword, phone: $scope.nPhone, email: $scope.nEmail, type: $scope.nType}). then (function (d) {
			if (d.data.status =='success') {
				$scope.users.push (d.data.raw);
				$('#new-user-modal').modal ('hide');
			} else
				console.log (d.data.message);
		}, function (d) {
			console.error (JSON.stringify(d));
		});
	}
}]);

app.controller ('ProductsListController', ['$scope', '$rootScope', '$http', 'Upload', function ($scope, $rootScope, $http, Upload) {
	$scope.title = 'All products';

	$scope.newProductModal = function () {
		$('#new-product-modal').modal ();
	}

	$scope.fetchProducts = function () {
		console.log ('fetching products');
		$http.get ('/product/all').then (function(d){
			if (d.data.status == 'success') {
				$scope.products = d.data.data;
				console.log ($scope.products);
			}
			else
				console.log (d.data.message);
		}, function(d){
			if (d.status == 500)
				console.error ('Server error');
			else
				console.error (JSON.stringify (d));
		});
	}

	$scope.fetchProducts();

	$scope.setImage = function (file, errFiles) {
		$scope.file = file;
	}

	$scope.createProduct = function () {
		$http.post ('/product/add', {name: $scope.pName, price: $scope.pPrice}).then (function (d) {
			if (d.data.status == 'success') {
				$('#new-product-modal').modal ('hide');
				$scope.products.push (d.data.raw);
			} else
				console.log (d.data.message);
		}, function (data) {
			console.error ("ERROR: "+ JSON.stringify (data));
		});
	}
}]);

app.controller ('AdminController', ['$rootScope', '$http', '$window', '$state', function ($rootScope, $http, $window, $state) {
	$http.get ('/user/sessioninfo'). then (function (data) {
		var response = data.data;
		if (response.status == 'success') {
			$rootScope.sessionInfo = response.message.doc;
		} else {
			$window.location = '/';
		}
	}, function (data) {
		console.error (data);
	});

	$rootScope.logout = function () {
		$http.get ('/user/logout').then (function () {
			$window.location = '/';
		});
	}
}]);