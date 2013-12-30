'use strict';

describe('Mocking Service Controller', function () {
  var $scope;
  var editor;
  var baseUrl        = 'http://base.url';
  var baseUrlLine    = 'baseUrl: ' + baseUrl;
  var oldBaseUrlLine = 'baseUrl: http://old.url';

  beforeEach(module('ramlEditorApp'));
  beforeEach(inject(function ($injector, $rootScope, $controller) {
    $scope = $rootScope.$new();
    editor = $scope.editor = getEditor($injector.get('codeMirror'));

    $controller('ramlEditorMockingService', {
      $scope:         $scope,
      mockingService: $injector.get('mockingService')
    });
  }));

  describe('addMockingServiceBaseUrl', function () {
    it('should add baseUrl when document is empty', function () {
      editor.setValue([
        ''
      ].join('\n'));

      $scope.addMockingServiceBaseUrl(baseUrl);

      editor.getLine(0).should.be.equal(baseUrlLine);
    });

    it('should add baseUrl after RAML directive', function () {
      editor.setValue([
        '#%RAML 0.8'
      ].join('\n'));

      $scope.addMockingServiceBaseUrl(baseUrl);

      editor.getLine(1).should.be.equal(baseUrlLine);
    });

    it('should add baseUrl after document start mark', function () {
      editor.setValue([
        '---'
      ].join('\n'));

      $scope.addMockingServiceBaseUrl(baseUrl);

      editor.getLine(1).should.be.equal(baseUrlLine);
    });

    it('should add baseUrl and comment previous one #1', function () {
      editor.setValue([
        oldBaseUrlLine
      ].join('\n'));

      $scope.addMockingServiceBaseUrl(baseUrl);

      editor.getLine(0).should.be.equal('# ' + oldBaseUrlLine);
      editor.getLine(1).should.be.equal(baseUrlLine);
    });

    it('should add baseUrl and comment previous one #2', function () {
      editor.setValue([
        'title: My API',
        oldBaseUrlLine
      ].join('\n'));

      $scope.addMockingServiceBaseUrl(baseUrl);

      editor.getLine(1).should.be.equal('# ' + oldBaseUrlLine);
      editor.getLine(2).should.be.equal(baseUrlLine);
    });
  });

  describe('removeMockingServiceBaseUrl', function () {
    it('should remove baseUrl', function () {
      editor.setValue([
        baseUrlLine
      ].join('\n'));

      $scope.removeMockingServiceBaseUrl(baseUrl);

      editor.getLine(0).should.be.equal('');
    });

    it('should remove baseUrl and uncomment previous one', function () {
      editor.setValue([
        '# ' + oldBaseUrlLine,
        baseUrlLine
      ].join('\n'));

      $scope.removeMockingServiceBaseUrl(baseUrl);

      editor.getLine(0).should.be.equal(oldBaseUrlLine);
    });
  });
});
