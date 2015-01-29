<ul class="status-list list-unstyled pull-right">
  {{#hasOther}}
  <li class="status-item danger">{{other}} Failed Hook{{getPlural other}}</li>
  {{/hasOther}}
  {{#hasSkipped}}
  <li class="status-item danger">{{skipped}} Skipped Test{{getPlural skipped}}</li>
  {{/hasSkipped}}
  <li class="status-item">{{pendingPercent}}% Pending</li>
  <li class="status-item {{passPercentClass}}">{{passPercent}}% Passing</li>
</ul>