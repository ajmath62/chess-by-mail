(function(){
    angular
    .module("app")
    .controller("XiangqiController", ["$scope", function($scope){
        $scope.rows = [9, 8, 7, 6, 5, 4, 3, 2, 1];
        $scope.columns = ["8", "7", "6", "5", "4", "3", "2", "1"];

        $scope.upSlash = ["49", "58", "42", "51"];
        $scope.downSlash = ["59", "48", "52", "41"];
    }]);
}());
