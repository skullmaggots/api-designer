'use strict';

angular.module('ramlEditorApp')
  .controller('ramlEditorMockingService', function ($scope, mockingService) {
    var editor = $scope.editor;

    function isBaseUrl(line) {
      return line.indexOf('baseUrl: ') === 0;
    }

    function forEachLine(callback, lineNumber, step) {
      lineNumber = lineNumber || 0;
      step       = step       || 1;

      while (lineNumber >= 0 && lineNumber < editor.lineCount()) {
        if (callback(editor.getLine(lineNumber), lineNumber) === false) {
          return;
        }

        lineNumber += step;
      }
    }

    $scope.addMockingServiceBaseUrl = function addMockingServiceBaseUrl(baseUrl) {
      var lineNumber;
      var lineIsEmpty;

      forEachLine(function (line, $lineNumber) {
        var lineTrimmed = line.trim();
        lineNumber      = $lineNumber;
        lineIsEmpty     = line.length === 0;

        if (lineTrimmed.indexOf('#'  ) === 0) {
          return;
        }

        if (lineTrimmed.indexOf('---') === 0) {
          return;
        }

        if (isBaseUrl(line)) {
          editor.replaceRange('# ' + line + '\n', {
            line: lineNumber,
            ch:   0
          });

          lineNumber  += 1;
          lineIsEmpty  = true;

          return false;
        }
      });

      editor.replaceRange((lineIsEmpty ? '' : '\n') + 'baseUrl: ' + baseUrl + '\n', {
        line: lineNumber,
        ch:   0
      });
    };

    $scope.removeMockingServiceBaseUrl = function removeMockingServiceBaseUrl(baseUrl) {
      var baseUrlLine = 'baseUrl: ' + baseUrl;
      var lineNumber;

      forEachLine(function (line, $lineNumber) {
        lineNumber = $lineNumber;

        if (line === baseUrlLine) {
          editor.removeLine(lineNumber);
          return false;
        }
      });

      if (lineNumber && isBaseUrl(editor.getLine(lineNumber - 1).slice(2))) {
        editor.replaceRange('', {
          line: lineNumber - 1,
          ch:   0
        }, {
          line: lineNumber - 1,
          ch:   2
        });
      }
    };

    $scope.enableMockingService = function enableMockingService(file) {
      var mock;
      mockingService.createMock({raml: editor.getValue()})
        .then(function success($mock) {
          return file.saveMetadataKey('mock', (mock = $mock));
        })
        .then(function success() {
          $scope.addMockingServiceBaseUrl(mock.baseUrl);
        })
        .then(function success() {
          $scope.mock = mock;
        })
      ;
    };

    $scope.disableMockingService = function disableMockingService(file) {
      var mock;
      file.loadMetadata()
        .then(function success(metadata) {
          return mockingService.deleteMock((mock = metadata.mock));
        })
        .then(function success() {
          $scope.removeMockingServiceBaseUrl(mock.baseUrl);
        })
        .then(function success() {
          return file.saveMetadataKey('mock', null);
        })
        .then(function success() {
          $scope.mock = null;
        })
      ;
    };

    $scope.$on('fileCreated', function fileCreated(file) {
      $scope.file = file;
      $scope.mock = null;
    });

    $scope.$on('fileSaved', function fileSaved(file) {
      $scope.file = file;
      $scope.mock = $scope.mock;

      mockingService.updateMock($scope.mock);
    });

    $scope.$on('fileLoaded', function fileLoaded(file) {
      $scope.file = file;
      $scope.mock = null;

      file.loadMetadata()
        .then(function success(metadata) {
          if (metadata.mock) {
            return mockingService.getMock(metadata.mock);
          }
        })
        .then(function success(mock) {
          if (!mock) {
            return;
          }

          if (file.content === mock.raml) {
            return mock;
          }

          mock.raml = file.content;

          return mockingService.updateMock(mock)
            .then(function success() {
              return mock;
            })
          ;
        })
        .then(function success(mock) {
          $scope.mock = mock;
        })
      ;
    });
  })
;
