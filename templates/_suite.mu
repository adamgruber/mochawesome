<section class="suite-wrap">
  <div id="{{uuid}}" class="suite {{#root}}root-suite{{/root}}">
    <h3 class="suite-title">{{title}}</h3>
    <h5 class="suite-filename">{{file}}</h5>
    <div class="suite-data-wrap">
      <!-- Suite Chart -->
      <div class="suite-chart-wrap">
        <canvas id="{{uuid}}" class="suite-chart" width="100" height="100" data-total-passes="{{totalPasses}}" data-total-failures="{{totalFailures}}"></canvas>
        <span class="total">{{totalTests}}</span>
        <ul class="suite-chart-legend list-unstyled">
          <li class="suite-chart-legend-item duration"><span class="glyphicon glyphicon-time"></span><span class="data">{{formatDuration duration}}</span></li>
          <li class="suite-chart-legend-item passed"><span class="glyphicon glyphicon-ok"></span><span class="data">{{totalPasses}}</span> passed</li>
          <li class="suite-chart-legend-item failed"><span class="glyphicon glyphicon-remove"></span><span class="data">{{totalFailures}}</span> failed</li>
        </ul>
      </div>
      <!-- Test Info -->
      <div class="suite-test-wrap">
        <div class="suite-test-header" data-toggle="collapse" data-target="#{{uuid}} > .suite-data-wrap > .suite-test-wrap > .test-list">
          <h4 class="suite-test-header-title">Tests</h4>
        </div>
        <div class="list-group test-list collapse in">
          {{#tests}}
            {{> _test}}
          {{/tests}}
        </div>
      </div>
    </div>  

    {{#suites}}
      {{> _suite}}
    {{/suites}}

  </div>
</section>