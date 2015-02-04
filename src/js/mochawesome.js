/* global Chart */
+function ($, Chart) {
  'use strict';

  var self;

  var Mochawesome = function () {
    this.filterClasses = 'filter-passed filter-failed filter-pending';
    this.activeFilters = [];

    this.filters = {
      'summary-passes': 'passed',
      'summary-failures': 'failed',
      'summary-pending': 'pending'
    };

    this.chartOpts = {
      percentageInnerCutout : 70,
      animationEasing: 'easeOutQuint',
      showTooltips: false
    };

    this.chartColors = {
      green:  '#5cb85c',
      red:    '#d9534f',
      gray:   '#999999',
      ltGray: '#EEEEEE'
    };

    // Cache Elements
    this.$window      = $(window);
    this.$body        = $('body');
    this.$details     = $('.details');
    this.$suites      = $('.suite');
    this.$filterBtns  = $('.summary-filter');
    this.$suiteCharts = $('.suite-chart');

    self = this;

    this.initialize();
  };

  Mochawesome.prototype.initialize = function () {
    this.$filterBtns.on('click', self._onFilterClick.bind(self));
    this.$window.on('scroll', self._onWindowScroll.bind(self));
    this.makeSuiteCharts();
  };

  Mochawesome.prototype._onFilterClick = function (e) {
    var $el = $(e.currentTarget),
      $parent = $el.parent('.summary-col'),
      filter = $parent[0].className.split(' ')[1];

    if ($parent.hasClass('selected')) {
      $parent.removeClass('selected');
      this.activeFilters.splice(this.activeFilters.indexOf(filter), 1);
    } else {
      $parent.addClass('selected');
      this.activeFilters.push(filter);
    }

    this.updateFilteredTests();
  };

  Mochawesome.prototype._onWindowScroll = function () {
    var windowScrollTop = this.$window.scrollTop();
    if (windowScrollTop > 62 && this.$navbar.hasClass('show-quick-summary')) {
      return;
    }
    this.$body.toggleClass('show-quick-summary', windowScrollTop > 62);
  };

  Mochawesome.prototype._createFilterClasses = function (prefix) {
    return this.activeFilters.map(function (activeFilter) {
      return prefix + self.filters[activeFilter];
    });
  };

  Mochawesome.prototype.showQuickSummary = function () {

  };

  Mochawesome.prototype.hideQuickSummary = function () {

  };

  Mochawesome.prototype.updateFilteredTests = function () {
    var activeFiltersExist = this.activeFilters.length > 0,
        filterClassesToAdd = this._createFilterClasses('filter-'),
        testClassesToFilter = this._createFilterClasses('.');

    this.$details
      .removeClass(this.filterClasses)
      .toggleClass('filters-active', activeFiltersExist);

    if (filterClassesToAdd.length) {
      this.$details.addClass(filterClassesToAdd.join(' '));
    }

    // Hide all suites
    this.$suites.toggleClass('hidden', activeFiltersExist);

    // Show suites with filtered tests
    if (activeFiltersExist) {
      for (var i = this.$suites.length - 1; i >= 0; i--) {
        var $suite = this.$suites.eq(i),
            hasVisibleTests = $suite.find('.test').filter(testClassesToFilter.join()).length > 0;
        if (hasVisibleTests) {
          $suite.removeClass('hidden');
        }
      }
    }
  };

  Mochawesome.prototype.makeSuiteCharts = function () {
    // Don't animate if we have a ton of charts because its just slow and ugly
    if (this.$suiteCharts.length > 50) {
      this.chartOpts.animation = false;
    }

    for (var i = 0; i < this.$suiteCharts.length; i++) {
      var $chart = this.$suiteCharts.eq(i),
          ctx = $chart[0].getContext('2d'),
          data = $chart.data(),
          chartData = [{
            value: data.totalPasses*10,
            color: this.chartColors.green,
            highlight: this.chartColors.gray,
            label: 'Passed'
          },
          {
            value: data.totalFailures*10,
            color: this.chartColors.red,
            highlight: this.chartColors.gray,
            label: 'Failed'
          },
          {
            value: data.totalPending*10,
            color: this.chartColors.gray,
            highlight: this.chartColors.gray,
            label: 'Pending'
          },
          {
            value: data.totalSkipped*10,
            color: this.chartColors.ltGray,
            highlight: this.chartColors.gray,
            label: 'Skipped'
          }];
      new Chart(ctx).Doughnut(chartData, this.chartOpts);
    }
  };

  
  new Mochawesome();
  
}(jQuery, Chart);