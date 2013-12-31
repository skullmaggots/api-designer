'use strict';

angular.module('ramlEditorApp')
  .service('mockingService', function ($http, $q) {
    var self = this;

    self.host = 'http://mocksvc.mulesoft.com';
    self.base = '/mocks';

    self.buildURL = function buildURL() {
      return self.host + self.base + [''].concat(Array.prototype.slice.call(arguments, 0)).join('/');
    };

    self.getMock = function getMock(mock) {
      return $http.get(self.buildURL(mock.mockId, mock.manageKey)).then(
        function success(response) {
          return response.data;
        },

        function failure(response) {
          if (response.status === 404) {
            return;
          }

          return $q.reject(response);
        }
      );
    };

    self.createMock = function createMock(mock) {
      return $http.post(self.buildURL(), mock).then(
        function success(response) {
          return response.data;
        }
      );
    };

    self.updateMock = function updateMock(mock) {
      return $http({
        method: 'PATCH',
        url:    self.buildURL(mock.mockId, mock.manageKey),
        data:   {raml: mock.raml}
      }).then(
        function success(response) {
          return response.data;
        }
      );
    };

    self.deleteMock = function deleteMock(mock) {
      return $http.delete(self.buildURL(mock.mockId, mock.manageKey));
    };
  })
;
