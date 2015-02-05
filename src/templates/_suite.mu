{{#rootEmpty}}
  {{#suites}}
    {{> _suite}}
  {{/suites}}
{{/rootEmpty}}
{{^rootEmpty}}
<section class="suite-wrap">
  <div id="{{uuid}}" class="suite{{#root}} root-suite{{/root}}{{#hasSuites}} has-suites{{/hasSuites}}{{#hasTests}} has-tests{{/hasTests}}{{#hasPasses}} has-passed{{/hasPasses}}{{#hasFailures}} has-failed{{/hasFailures}}{{#hasPending}} has-pending{{/hasPending}}{{#hasSkipped}} has-skipped{{/hasSkipped}}">
    <h3 class="suite-title">{{title}}</h3>
    <h5 class="suite-filename">{{file}}</h5>
    {{#hasTests}} 
    <div class="suite-data-wrap">
      <!-- Suite Chart -->
      <div class="suite-chart-wrap">
        <canvas id="{{uuid}}" class="suite-chart" width="100" height="100" data-total-passes="{{totalPasses}}" data-total-failures="{{totalFailures}}" data-total-pending="{{totalPending}}" data-total-skipped="{{totalSkipped}}"></canvas>
        <span class="total">{{totalTests}}</span>
        <ul class="suite-chart-legend list-unstyled">
          <li class="suite-chart-legend-item duration">
            <span class="data">{{formatDuration duration}}</span>
          </li>
          <li class="suite-chart-legend-item passed">
            <span class="data">{{totalPasses}}</span> passed</li>
          <li class="suite-chart-legend-item failed">
            <span class="data">{{totalFailures}}</span> failed</li>
          <li class="suite-chart-legend-item pending">
            <span class="data">{{totalPending}}</span> pending</li>
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