{{#rootEmpty}}
  {{#suites}}
    {{> _suite}}
  {{/suites}}
{{/rootEmpty}}
{{^rootEmpty}}
<section class="suite-wrap">
  <div id="{{uuid}}" class="suite{{#root}} root-suite{{/root}}{{#hasSuites}} has-suites{{/hasSuites}}{{#hasTests}} has-tests{{/hasTests}}{{#hasPasses}} has-passed{{/hasPasses}}{{#hasFailures}} has-failed{{/hasFailures}}{{#hasPending}} has-pending{{/hasPending}}{{#hasSkipped}} has-skipped{{/hasSkipped}}">
    <h3 class="suite-title">{{#isBlank title}}&nbsp;{{else}}{{title}}{{/isBlank}}</h3>
    <h5 class="suite-filename">{{#isBlank file}}&nbsp;{{else}}{{file}}{{/isBlank}}</h5>
    {{#hasTests}} 
    <!-- Suite Chart -->
    <div class="suite-chart-wrap">
      <canvas id="{{uuid}}" class="suite-chart" width="50" height="50" data-total-passes="{{totalPasses}}" data-total-failures="{{totalFailures}}" data-total-pending="{{totalPending}}" data-total-skipped="{{totalSkipped}}"></canvas>
    </div>
    <div class="suite-data-wrap">
      <!-- Suite Summary -->
      <ul class="suite-summary list-unstyled">
        <li class="suite-summary-item duration">{{formatDuration duration}}</li>
        <li class="suite-summary-item tests">{{totalTests}}</li>
        <li class="suite-summary-item passed">{{totalPasses}}</li>
        <li class="suite-summary-item failed">{{totalFailures}}</li>
        <li class="suite-summary-item pending">{{totalPending}}</li>
      </ul>
      <!-- Test Info -->
      <div class="suite-test-wrap">
        <div class="suite-test-header" data-toggle="collapse" data-target="#{{uuid}}-test-list">
          <h4 class="suite-test-header-title">Tests</h4>
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