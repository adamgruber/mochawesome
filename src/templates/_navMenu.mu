{{#rootEmpty}}
  {{#suites}}
    {{> _navMenu}}
  {{/suites}}
{{/rootEmpty}}
{{^rootEmpty}}
<li class="nav-menu-item">
    <a href="#{{uuid}}" class="nav-menu-item-link{{#hasTests}}{{#hasFailures}} has-failures{{/hasFailures}}{{^hasFailures}}{{#hasPending}} has-pending{{/hasPending}}{{^hasPending}}{{#hasSkipped}} has-skipped{{/hasSkipped}}{{^hasSkipped}}{{#hasPasses}} has-passes{{/hasPasses}}{{/hasSkipped}}{{/hasPending}}{{/hasFailures}}{{/hasTests}}">{{#isBlank title}}{{uuid}}{{else}}{{title}}{{/isBlank}}</a>
    {{#suites}}
      <ul class="list-unstyled sub-menu">
        {{> _navMenu}}
      </ul>
    {{/suites}}
</li>
{{/rootEmpty}}