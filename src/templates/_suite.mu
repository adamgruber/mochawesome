{{#rootEmpty}}
  {{#suites}}
    {{> _suite}}
  {{/suites}}
{{/rootEmpty}}
{{^rootEmpty}}
<section class="suite-wrap">
  <div id="{{uuid}}" class="suite{{#root}} root-suite{{/root}}{{#hasSuites}} has-suites{{/hasSuites}}{{#hasTests}} has-tests{{/hasTests}}{{#hasPasses}} has-passed{{/hasPasses}}{{#hasFailures}} has-failed{{/hasFailures}}{{#hasPending}} has-pending{{/hasPending}}">
    <h3 class="suite-title">{{title}}</h3>
    <h5 class="suite-filename">{{file}}</h5>
    {{#hasTests}} 
    <div class="suite-data-wrap">
      <!-- Suite Chart -->
      <div class="suite-chart-wrap">
        <canvas id="{{uuid}}" class="suite-chart" width="100" height="100" data-total-passes="{{totalPasses}}" data-total-failures="{{totalFailures}}" data-total-pending="{{totalPending}}"></canvas>
        <span class="total">{{totalTests}}</span>
        <ul class="suite-chart-legend list-unstyled">
          <li class="suite-chart-legend-item duration"><span class="glyphicon glyphicon-time"></span><span class="data">{{formatDuration duration}}</span></li>
          <li class="suite-chart-legend-item passed"><span class="glyphicon glyphicon-ok"></span><span class="data">{{totalPasses}}</span> passed</li>
          <li class="suite-chart-legend-item failed"><span class="glyphicon glyphicon-remove"></span><span class="data">{{totalFailures}}</span> failed</li>
          <li class="suite-chart-legend-item pending"><span class="glyphicon glyphicon-pause"></span><span class="data">{{totalPending}}</span> pending</li>
        </ul>
      </div>
      <!-- Test Info -->
      <div class="suite-test-wrap">
        <div class="suite-test-header" data-toggle="collapse" data-target="#{{uuid}}-test-list">
          <h4 class="suite-test-header-title">Tests<span class="pull-right glyphicon glyphicon-chevron-right"></span></h4>
        </div>
        <div id="{{uuid}}-test-list" class="list-group test-list collapse in">
          {{#tests}}
            {{> _test}}
          {{/tests}}
        </div>
      </div>
    </div>
    {{/hasTests}}

    {{#suites}}
      {{> _suite}}
    {{/suites}}

  </div>
</section>
{{/rootEmpty}}