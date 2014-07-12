<div class="suite panel panel-default">
  <div class="panel-body">
    <h2>{{title}}</h2>
    <h5>{{endDateStr}}</h5>

    {{#each childSuites}}
      {{> _suite}}
    {{/each}}

    {{#tests}}
    <div class="test">
      <h3><span class="glyphicon glyphicon-{{#pass}}ok text-success{{/pass}}{{#fail}}remove text-danger{{/fail}}"></span> {{title}}</h3>
      <h4>{{file}}</h4>
      <h4>Duration: {{duration}}ms</h4>
      <pre><code>{{code}}</code></pre>
      {{err}}
      {{#err}}
        Expected:{{expected}}
        Actual:{{actual}}
        Message:{{message}}
        <pre class="bg-danger small hidden">{{stack}}</pre>
      {{/err}}
    </div>
    {{/tests}}
  </div>
</div>