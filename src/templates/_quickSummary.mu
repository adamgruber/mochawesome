<ul class="list-unstyled quick-summary">
  <li class="qs-item summary-duration" title="Duration">{{formatSummaryDuration duration}}<span>{{getSummaryDurationUnits duration}}</span></li>
  <li class="qs-item summary-suites" title="Suites">{{suites}}</li>
  <li class="qs-item summary-tests" title="Tests">{{testsRegistered}}</li>
  <li class="qs-item summary-passes" title="Passed" data-filter="passed">{{passes}}</li>
  <li class="qs-item summary-failures" title="Failed" data-filter="failed">{{failures}}</li>
  <li class="qs-item summary-pending" title="Pending" data-filter="pending">{{pending}}</li>
</ul>