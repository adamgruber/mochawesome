<div class="row">
  <div class="summary-col summary-duration">
    <h1 class="summary-count">{{formatSummaryDuration duration}}<span>{{getSummaryDurationUnits duration}}</span></h1>
    <h4 class="summary-label">{{getSummaryDurationUnits duration}}</h4>
  </div>
  <div class="summary-col summary-suites" title="Suites">
    <h1 class="summary-count">{{suites}}</h1>
    <h4 class="summary-label">Suite{{getPlural suites}}</h4>
  </div>
  <div class="summary-col summary-tests" title="Tests">
    <h1 class="summary-count">{{testsRegistered}}</h1>
    <h4 class="summary-label">Test{{getPlural testsRegistered}}</h4>
  </div>
  <div class="summary-col summary-passes" data-filter="passed" title="Passed">
    <h1 class="summary-count">{{passes}}</h1>
    <h4 class="summary-label">Passed</h4>
  </div>
  <div class="summary-col summary-failures" data-filter="failed" title="Failed">
    <h1 class="summary-count">{{failures}}</h1>
    <h4 class="summary-label">Failed</h4>
  </div>
  <div class="summary-col summary-pending" data-filter="pending" title="Pending">
    <h1 class="summary-count">{{pending}}</h1>
    <h4 class="summary-label">Pending</h4>
  </div>
</div>