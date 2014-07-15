<div class="row">
  <div class="summary-col summary-suites">
    <h1 class="summary-count">{{suites}}</h1>
    <h4 class="summary-label">Suites</h4>
  </div>
  <div class="summary-col summary-tests">
    <h1 class="summary-count">{{tests}}</h1>
    <h4 class="summary-label">Tests</h4>
  </div>
  <div class="summary-col summary-passes">
    <h1 class="summary-count">{{passes}}</h1>
    <h4 class="summary-label">Passed</h4>
  </div>
  <div class="summary-col summary-failures">
    <h1 class="summary-count">{{failures}}</h1>
    <h4 class="summary-label">Failed</h4>
  </div>
  <div class="summary-col summary-duration">
    <h1 class="summary-count">{{toSeconds duration}}</h1>
    <h4 class="summary-label">Seconds</h4>
  </div>
  <div class="summary-col summary-pass-percent {{percentClass}}">
    <h1 class="summary-count">{{passPercent}}<span>%</span></h1>
    <h4 class="summary-label">Passing</h4>
  </div>
</div>