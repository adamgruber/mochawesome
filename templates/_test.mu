<div class="test">
  <h3><span class="glyphicon glyphicon-{{#pass}}ok text-success{{/pass}}{{#fail}}remove text-danger{{/fail}}"></span><span class="text-muted"> it </span>{{title}}</h3>
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