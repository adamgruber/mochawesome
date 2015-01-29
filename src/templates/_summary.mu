<div class="row">
  <div class="summary-col summary-suites">
    <h1 class="summary-count">{{suites}}</h1>
    <h4 class="summary-label">Suite{{getPlural suites}}</h4>
  </div>
  <div class="summary-col summary-tests">
    <h1 class="summary-count">{{testsRegistered}}</h1>
    <h4 class="summary-label">Test{{getPlural testsRegistered}}</h4>
  </div>
  <div class="summary-col summary-passes">
    <h1 class="summary-count">{{passes}}</h1>
    <h4 class="summary-label summary-filter">Passed</h4>
  </div>
  <div class="summary-col summary-failures">
    <h1 class="summary-count">{{failures}}</h1>
    <h4 class="summary-label summary-filter">Failed</h4>
  </div>
  <div class="summary-col summary-pending">
    <h1 class="summary-count">{{pending}}</h1>
    <h4 class="summary-label summary-filter">Pending</h4>
  </div>
  <div class="summary-col summary-duration">
    <h1 class="summary-count">{{formatSummaryDuration duration}}</h1>
    <h4 class="summary-label">{{getSummaryDurationUnits duration}}</h4>
  </div>
</div>