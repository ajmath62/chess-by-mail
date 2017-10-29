(function(){
    angular
    .module("app")
    .controller("XiangqiController", ["$scope", function($scope){
        $scope.rows = [9, 8, 7, 6, 5, 4, 3, 2, 1];  // and 0
        $scope.columns = ["A", "B", "C", "D", "E", "F", "G", "H"];  // and I

        $scope.slash = {D9: "down", E9: "up", D8: "up", E8: "down", D2: "down", E2: "up", D1: "up", E1: "down"};
    }]);
}());
