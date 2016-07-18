/* global window */
/* global Chart */
/* global _ */
+function ($, Chart, _) {
  'use strict';

  var self;

  var Mochawesome = function () {
    this.filterClasses = 'filter-passed filter-failed filter-pending';
    this.activeFilters = [];

    this.chartOpts = {
      percentageInnerCutout : 60,
      segmentShowStroke: true,
      segmentStrokeWidth: 2,
      animationEasing: 'easeOutQuint',
      showTooltips: false,
      responsive: true
    };

    this.chartColors = {
      green:  '#5cb85c',
      red:    '#d9534f',
      gray:   '#999999',
      ltGray: '#CCCCCC',
      ltBlue: '#5bc0de'
    };

    this.breakpoints = {
      sm: 768,
      md: 992,
      lg: 1200
    };

    // Cache Elements
    this.$window      = $(window);
    this.$body        = $('body');
    this.$navbar      = $('.navbar');
    this.$navOpenBtn  = $('.nav-menu-btn.open-menu');
    this.$navCloseBtn = $('.close-menu');
    this.$navMenu     = $('.nav-menu-wrap');
    this.$navMenuLink = $('.nav-menu-item-link');
    this.$summary     = $('.summary');
    this.$statusBar   = $('.statusbar');
    this.$quickSum    = $('.quick-summary');
    this.$details     = $('.details');
    this.$suites      = $('.suite');
    this.$filterBtns  = $('[data-filter]');
    this.$suiteCharts = $('.suite-chart');

    this._setMeasurements();

    this.listeningToScroll = this.windowWidth >= this.breakpoints.sm;

    self = this;

    this.initialize();
  };

  Mochawesome.prototype.initialize = function () {
    this.$filterBtns.on('click', self._onFilterClick.bind(self));
    this.$navOpenBtn.on('click', self.openNavMenu.bind(self));
    this.$navCloseBtn.on('click', self.closeNavMenu.bind(self));
    this.$navMenuLink.on('click', self.goToSuite.bind(self));
    if (this.windowWidth > this.breakpoints.sm) {
      this.listenToScroll(true);
    }
    this.$window.on('resize', _.debounce(self._onWindowResize.bind(self), 200));
    this.makeSuiteCharts();
  };

  Mochawesome.prototype._setMeasurements = function () {
    this.windowWidth = this.$window.outerWidth();
    this.windowScrollTop = this.$window.scrollTop();
    this.quickSummaryScrollOffset = this.$summary.outerHeight() - this.$navbar.outerHeight();
    this.scrolledPastQuickSummaryOffset = this.windowScrollTop > this.quickSummaryScrollOffset;
  };

  Mochawesome.prototype._onFilterClick = function (e) {
    var $el = $(e.currentTarget);
    // No clicks for hidden quick summary
    if ($el.hasClass('qs-item') && this.$quickSum.css('opacity') === '0') {
      return;
    }
    var filter = $el.data('filter'),
        $btns = $('[data-filter=' + filter + ']'),
        filterIndex = this.activeFilters.indexOf(filter),
        filterIsActive = filterIndex !== -1;

    filterIsActive ? this.activeFilters.splice(filterIndex, 1) : this.activeFilters.push(filter);
    $btns.toggleClass('active', !filterIsActive);

    this.updateFilteredTests();
  };

  Mochawesome.prototype._onWindowScroll = function () {
    this._setMeasurements();
    if (this.scrolledPastQuickSummaryOffset && this.$body.hasClass('show-quick-summary')) {
      return;
    }
    this.$body.toggleClass('show-quick-summary', this.scrolledPastQuickSummaryOffset);
  };

  Mochawesome.prototype._onWindowResize = function () {
    this._setMeasurements();
    if (this.windowWidth < this.breakpoints.sm && this.listeningToScroll) {
      this.listenToScroll(false);
    } else if (this.windowWidth >= this.breakpoints.sm && !this.listeningToScroll) {
      this.listenToScroll(true);
      this.$body.toggleClass('show-quick-summary', this.scrolledPastQuickSummaryOffset);
    }
  };

  Mochawesome.prototype._getScrollOffset = function () {
    return this.windowWidth < this.breakpoints.sm ? 199 : 89;
  };

  Mochawesome.prototype.openNavMenu = function () {
    this.$navMenu.addClass('open');
  };

  Mochawesome.prototype.closeNavMenu = function () {
    this.$navMenu.removeClass('open');
  };

  Mochawesome.prototype.goToSuite = function (e) {
    e.preventDefault();
    var offset = this._getScrollOffset();
    var scrollY = $(e.currentTarget.getAttribute('href')).offset().top - offset;
    window.scrollTo(0, scrollY);
    this.closeNavMenu();
  };

  Mochawesome.prototype.listenToScroll = function (start) {
    if (start) {
      this.$window.on('scroll', _.throttle(self._onWindowScroll.bind(self), 200));
    } else {
      this.$window.off('scroll');
      this.$body.removeClass('show-quick-summary');
    }
    this.listeningToScroll = start;
  };

  Mochawesome.prototype._createFilterClasses = function (prefix) {
    return this.activeFilters.map(function (activeFilter) {
      return prefix + activeFilter;
    });
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
            color: this.chartColors.ltBlue,
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
  
}(jQuery, Chart, _);