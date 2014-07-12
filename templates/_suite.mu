<div class="suite panel panel-default">
  <div class="panel-body">
    <h2>{{title}}<label class="badge pull-right">{{totalTests}}&nbsp;tests</label></h2>
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