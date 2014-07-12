<div class="suite panel panel-default">
  <div class="panel-body">
    <h2>{{title}}
      <div class="pull-right">
        <span class="label label-default">{{totalTests}}&nbsp;tests</span>
        <span class="label label-success">{{totalPasses}}&nbsp;passed</span>
        <span class="label label-danger">{{totalFailures}}&nbsp;failed</span>
      </div>
    </h2>
    <h5>{{file}}</h5>
    <h5>{{endDateStr}}</h5>

    {{#each childSuites}}
      {{> _suite}}
    {{/each}}

    {{#tests}}
      {{> _test}}
    {{/tests}}
  </div>
</div>