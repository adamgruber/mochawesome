/*global Chart*/
/*global $*/
/*global document*/
$(function() {
  'use strict';
  var filters = {
    'summary-passes': 'passed',
    'summary-failures': 'failed',
    'summary-pending': 'pending'
  };
  var activeFilters = [];
  addEventHandlers();
  makeSuiteCharts();

  function makeSuiteCharts() {
    var chartOpts = {
      percentageInnerCutout : 70,
      animationEasing: 'easeOutQuint',
      showTooltips: false
    };
    var suiteCharts = document.getElementsByClassName('suite-chart');
    for (var i=0; i<suiteCharts.length; i++) {
      var ctx = suiteCharts[i].getContext('2d');
      var data = [{
        value: suiteCharts[i].getAttribute('data-total-passes')*10,
        color: '#5cb85c',
        highlight: '#FF5A5E',
        label: 'Passed'
      },
      {
        value: suiteCharts[i].getAttribute('data-total-failures')*10,
        color: '#d9534f',
        highlight: '#FFC870',
        label: 'Failed'
      },
      {
        value: suiteCharts[i].getAttribute('data-total-pending')*10,
        color: '#999999',
        highlight: '#FFC870',
        label: 'Pending'
      },
      {
        value: suiteCharts[i].getAttribute('data-total-skipped')*10,
        color: '#EEEEEE',
        highlight: '#FFC870',
        label: 'Skipped'
      }];
      new Chart(ctx).Doughnut(data, chartOpts);
    }
  }

  function addEventHandlers() {
    $('.summary-filter').on('click', function () {
      var $el = $(this),
          $parent = $el.parent('.summary-col'),
          filter = $parent[0].className.split(' ')[1];

      if ($parent.hasClass('selected')) {
        $parent.removeClass('selected');
        activeFilters.splice(activeFilters.indexOf(filter), 1);
      } else {
        $parent.addClass('selected');
        activeFilters.push(filter);
      }

      updateFilteredTests();
    });
  }

  function createFilterClasses(prefix) {
    return activeFilters.map(function (activeFilter) {
      return prefix + filters[activeFilter];
    });
  }

  function updateFilteredTests() {
    var $details = $('.details'),
        $suites = $('.suite'),
        activeFiltersExist = activeFilters.length > 0,
        filterClasses = 'filter-passed filter-failed filter-pending',
        filterClassesToAdd = createFilterClasses('filter-'),
        testClassesToFilter = createFilterClasses('.');

    $details
      .removeClass(filterClasses)
      .toggleClass('filters-active', activeFiltersExist);

    if (filterClassesToAdd.length) {
      $details.addClass(filterClassesToAdd.join(' '));
    }

    // Hide all suites
    $suites.toggleClass('hidden', activeFiltersExist);

    // Show suites with filtered tests
    if (activeFiltersExist) {
      for (var i = $suites.length - 1; i >= 0; i--) {
        var $suite = $suites.eq(i),
            hasVisibleTests = $suite.find('.test').filter(testClassesToFilter.join()).length > 0;
        if (hasVisibleTests) {
          $suite.removeClass('hidden');
        }
      }
    }
  }

});