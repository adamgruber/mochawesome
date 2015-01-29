var Handlebars = require("handlebars");
 Handlebars.registerPartial("_statusbar", Handlebars.template({"1":function(depth0,helpers,partials,data) {
  var helper, functionType="function", escapeExpression=this.escapeExpression, helperMissing=helpers.helperMissing;
  return "\n  <li class=\"status-item danger\">"
    + escapeExpression(((helper = helpers.other || (depth0 && depth0.other)),(typeof helper === functionType ? helper.call(depth0, {"name":"other","hash":{},"data":data}) : helper)))
    + " Failed Hook"
    + escapeExpression((helper = helpers.getPlural || (depth0 && depth0.getPlural) || helperMissing,helper.call(depth0, (depth0 && depth0.other), {"name":"getPlural","hash":{},"data":data})))
    + "</li>\n  ";
},"3":function(depth0,helpers,partials,data) {
  var helper, functionType="function", escapeExpression=this.escapeExpression, helperMissing=helpers.helperMissing;
  return "\n  <li class=\"status-item danger\">"
    + escapeExpression(((helper = helpers.skipped || (depth0 && depth0.skipped)),(typeof helper === functionType ? helper.call(depth0, {"name":"skipped","hash":{},"data":data}) : helper)))
    + " Skipped Test"
    + escapeExpression((helper = helpers.getPlural || (depth0 && depth0.getPlural) || helperMissing,helper.call(depth0, (depth0 && depth0.skipped), {"name":"getPlural","hash":{},"data":data})))
    + "</li>\n  ";
},"compiler":[5,">= 2.0.0"],"main":function(depth0,helpers,partials,data) {
  var stack1, helper, options, functionType="function", blockHelperMissing=helpers.blockHelperMissing, escapeExpression=this.escapeExpression, buffer = "<ul class=\"status-list list-unstyled pull-right\">\n  ";
  stack1 = ((helper = helpers.hasOther || (depth0 && depth0.hasOther)),(options={"name":"hasOther","hash":{},"fn":this.program(1, data),"inverse":this.noop,"data":data}),(typeof helper === functionType ? helper.call(depth0, options) : helper));
  if (!helpers.hasOther) { stack1 = blockHelperMissing.call(depth0, stack1, options); }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n  ";
  stack1 = ((helper = helpers.hasSkipped || (depth0 && depth0.hasSkipped)),(options={"name":"hasSkipped","hash":{},"fn":this.program(3, data),"inverse":this.noop,"data":data}),(typeof helper === functionType ? helper.call(depth0, options) : helper));
  if (!helpers.hasSkipped) { stack1 = blockHelperMissing.call(depth0, stack1, options); }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  return buffer + "\n  <li class=\"status-item\">"
    + escapeExpression(((helper = helpers.pendingPercent || (depth0 && depth0.pendingPercent)),(typeof helper === functionType ? helper.call(depth0, {"name":"pendingPercent","hash":{},"data":data}) : helper)))
    + "% Pending</li>\n  <li class=\"status-item "
    + escapeExpression(((helper = helpers.passPercentClass || (depth0 && depth0.passPercentClass)),(typeof helper === functionType ? helper.call(depth0, {"name":"passPercentClass","hash":{},"data":data}) : helper)))
    + "\">"
    + escapeExpression(((helper = helpers.passPercent || (depth0 && depth0.passPercent)),(typeof helper === functionType ? helper.call(depth0, {"name":"passPercent","hash":{},"data":data}) : helper)))
    + "% Passing</li>\n</ul>";
},"useData":true}));
/*global Handlebars*/
var moment = require('moment');

function getDurationObj(durationInMilliseconds) {
  'use strict';
  var dur = moment.duration(durationInMilliseconds, 'ms');
  return {
    duration: dur,
    hrs: dur.get('h'),
    min: dur.get('m'),
    sec: dur.get('s'),
    ms: dur.get('ms')
  };
}

Handlebars.registerHelper('getPlural', function (context) {
  'use strict';
  return context === 1 ? '' : 's';
});

Handlebars.registerHelper('formatSummaryDuration', function (context) {
  'use strict';
  var dur = getDurationObj(context);
  if (dur.hrs  < 1) {
    if (dur.min < 1) {
      if (dur.sec < 1) {
        return context;
      }
      return dur.sec + '.' + dur.ms;
    }
    return dur.min + ':' + (dur.sec < 10 ? ('0' + dur.sec) : dur.sec);
  }
  return dur.hrs + ':' + (dur.min < 10 ? ('0' + dur.min) : dur.min);
});

Handlebars.registerHelper('getSummaryDurationUnits', function (context) {
  'use strict';
  var dur = getDurationObj(context);
  if (dur.hrs  < 1) {
    if (dur.min < 1) {
      if (dur.sec < 1) {
        return 'MS';
      }
      return 'SEC';
    }
    return 'MIN';
  }
  return 'HRS';
});

Handlebars.registerHelper('formatDuration', function (context) {
  'use strict';
  var dur = getDurationObj(context);
  if (dur.hrs  < 1) {
    if (dur.min < 1) {
      if (dur.sec < 1) {
        return context + ' ms';
      }
      return dur.sec + '.' + dur.ms + ' s';
    }
    return dur.min + ':' + (dur.sec < 10 ? ('0' + dur.sec) : dur.sec) + '.' + dur.ms + ' m';
  }
  return dur.hrs + ':' + (dur.min < 10 ? ('0' + dur.min) : dur.min) + ':' + (dur.sec < 10 ? ('0' + dur.sec) : dur.sec) + '.' + dur.ms + ' h';
});

Handlebars.registerHelper('dateFormat', function(context, format) {
  'use strict';
  if (format === 'fromNow') {
    return moment(context).fromNow();
  } else {
    return moment(context).format(format);
  }
});
exports["mochawesome"] = Handlebars.template({"1":function(depth0,helpers,partials,data) {
  var stack1, buffer = "\n          ";
  stack1 = this.invokePartial(partials._summary, '_summary', depth0, undefined, helpers, partials, data);
  if(stack1 || stack1 === 0) { buffer += stack1; }
  return buffer + "\n        ";
},"3":function(depth0,helpers,partials,data) {
  var stack1, buffer = "\n          ";
  stack1 = this.invokePartial(partials._statusbar, '_statusbar', depth0, undefined, helpers, partials, data);
  if(stack1 || stack1 === 0) { buffer += stack1; }
  return buffer + "\n        ";
},"5":function(depth0,helpers,partials,data) {
  var stack1, buffer = "\n        ";
  stack1 = this.invokePartial(partials._suite, '_suite', depth0, undefined, helpers, partials, data);
  if(stack1 || stack1 === 0) { buffer += stack1; }
  return buffer + "\n      ";
},"compiler":[5,">= 2.0.0"],"main":function(depth0,helpers,partials,data) {
  var stack1, helper, options, functionType="function", escapeExpression=this.escapeExpression, helperMissing=helpers.helperMissing, blockHelperMissing=helpers.blockHelperMissing, buffer = "<!doctype html>\n<html lang=\"en\">\n  <head>\n    <meta charset=\"utf-8\">\n    <meta http-equiv=\"X-UA-Compatible\" content=\"IE=edge\">\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">\n    <title>Mochawesome Report Card</title>\n    <link rel=\"stylesheet\" href=\"css/mochawesome.css\">\n  </head>\n  <body>\n    <!-- NAVBAR -->\n    <div class=\"navbar navbar-inverse navbar-fixed-top\" role=\"navigation\">\n      <div class=\"container\">\n        <h1 class=\"report-title\">"
    + escapeExpression(((helper = helpers.reportTitle || (depth0 && depth0.reportTitle)),(typeof helper === functionType ? helper.call(depth0, {"name":"reportTitle","hash":{},"data":data}) : helper)))
    + "</h1>\n        <h3 class=\"report-date\">"
    + escapeExpression((helper = helpers.dateFormat || (depth0 && depth0.dateFormat) || helperMissing,helper.call(depth0, ((stack1 = (depth0 && depth0.stats)),stack1 == null || stack1 === false ? stack1 : stack1.end), "dddd, MMMM D YYYY, hh:mma", {"name":"dateFormat","hash":{},"data":data})))
    + "</h3>\n      </div>\n    </div>\n\n    <!-- Report Summary -->\n    <div class=\"summary\">\n      <div class=\"container\">\n        ";
  stack1 = ((helper = helpers.stats || (depth0 && depth0.stats)),(options={"name":"stats","hash":{},"fn":this.program(1, data),"inverse":this.noop,"data":data}),(typeof helper === functionType ? helper.call(depth0, options) : helper));
  if (!helpers.stats) { stack1 = blockHelperMissing.call(depth0, stack1, options); }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n      </div>\n    </div>\n    <div class=\"statusbar\">\n      <div class=\"container\">\n        ";
  stack1 = ((helper = helpers.stats || (depth0 && depth0.stats)),(options={"name":"stats","hash":{},"fn":this.program(3, data),"inverse":this.noop,"data":data}),(typeof helper === functionType ? helper.call(depth0, options) : helper));
  if (!helpers.stats) { stack1 = blockHelperMissing.call(depth0, stack1, options); }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n      </div>\n    </div>\n\n    <!-- Suites -->\n    <div class=\"details container\">\n      ";
  stack1 = ((helper = helpers.suites || (depth0 && depth0.suites)),(options={"name":"suites","hash":{},"fn":this.program(5, data),"inverse":this.noop,"data":data}),(typeof helper === functionType ? helper.call(depth0, options) : helper));
  if (!helpers.suites) { stack1 = blockHelperMissing.call(depth0, stack1, options); }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  return buffer + "\n    </div>\n\n    <footer>\n      <div class=\"container\">\n        <p class=\"small\">Report generated by <a href=\"https://github.dowjones.net/grubera/mochawesome\" target=\"_blank\">mochawesome</a>.<br>Designed and built by <a href=\"https://github.com/adamgruber\" target=\"_blank\">adamgruber</a> at <a href=\"http://github.com/dowjones\" target=\"_blank\">Dow Jones</a>. &copy;2015.</p>\n      </div>\n    </footer>\n\n    <!-- Scripts -->\n    <script src=\"js/mochawesome.js\"></script>\n  </body>\n</html>\n";
},"usePartial":true,"useData":true});
Handlebars.registerPartial("_suite", Handlebars.template({"1":function(depth0,helpers,partials,data) {
  var stack1, helper, options, functionType="function", blockHelperMissing=helpers.blockHelperMissing, buffer = "\n  ";
  stack1 = ((helper = helpers.suites || (depth0 && depth0.suites)),(options={"name":"suites","hash":{},"fn":this.program(2, data),"inverse":this.noop,"data":data}),(typeof helper === functionType ? helper.call(depth0, options) : helper));
  if (!helpers.suites) { stack1 = blockHelperMissing.call(depth0, stack1, options); }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  return buffer + "\n";
},"2":function(depth0,helpers,partials,data) {
  var stack1, buffer = "\n    ";
  stack1 = this.invokePartial(partials._suite, '_suite', depth0, undefined, helpers, partials, data);
  if(stack1 || stack1 === 0) { buffer += stack1; }
  return buffer + "\n  ";
},"4":function(depth0,helpers,partials,data) {
  var stack1, helper, options, functionType="function", escapeExpression=this.escapeExpression, blockHelperMissing=helpers.blockHelperMissing, buffer = "\n<section class=\"suite-wrap\">\n  <div id=\""
    + escapeExpression(((helper = helpers.uuid || (depth0 && depth0.uuid)),(typeof helper === functionType ? helper.call(depth0, {"name":"uuid","hash":{},"data":data}) : helper)))
    + "\" class=\"suite";
  stack1 = ((helper = helpers.root || (depth0 && depth0.root)),(options={"name":"root","hash":{},"fn":this.program(5, data),"inverse":this.noop,"data":data}),(typeof helper === functionType ? helper.call(depth0, options) : helper));
  if (!helpers.root) { stack1 = blockHelperMissing.call(depth0, stack1, options); }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  stack1 = ((helper = helpers.hasSuites || (depth0 && depth0.hasSuites)),(options={"name":"hasSuites","hash":{},"fn":this.program(7, data),"inverse":this.noop,"data":data}),(typeof helper === functionType ? helper.call(depth0, options) : helper));
  if (!helpers.hasSuites) { stack1 = blockHelperMissing.call(depth0, stack1, options); }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  stack1 = ((helper = helpers.hasTests || (depth0 && depth0.hasTests)),(options={"name":"hasTests","hash":{},"fn":this.program(9, data),"inverse":this.noop,"data":data}),(typeof helper === functionType ? helper.call(depth0, options) : helper));
  if (!helpers.hasTests) { stack1 = blockHelperMissing.call(depth0, stack1, options); }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  stack1 = ((helper = helpers.hasPasses || (depth0 && depth0.hasPasses)),(options={"name":"hasPasses","hash":{},"fn":this.program(11, data),"inverse":this.noop,"data":data}),(typeof helper === functionType ? helper.call(depth0, options) : helper));
  if (!helpers.hasPasses) { stack1 = blockHelperMissing.call(depth0, stack1, options); }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  stack1 = ((helper = helpers.hasFailures || (depth0 && depth0.hasFailures)),(options={"name":"hasFailures","hash":{},"fn":this.program(13, data),"inverse":this.noop,"data":data}),(typeof helper === functionType ? helper.call(depth0, options) : helper));
  if (!helpers.hasFailures) { stack1 = blockHelperMissing.call(depth0, stack1, options); }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  stack1 = ((helper = helpers.hasPending || (depth0 && depth0.hasPending)),(options={"name":"hasPending","hash":{},"fn":this.program(15, data),"inverse":this.noop,"data":data}),(typeof helper === functionType ? helper.call(depth0, options) : helper));
  if (!helpers.hasPending) { stack1 = blockHelperMissing.call(depth0, stack1, options); }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  stack1 = ((helper = helpers.hasSkipped || (depth0 && depth0.hasSkipped)),(options={"name":"hasSkipped","hash":{},"fn":this.program(17, data),"inverse":this.noop,"data":data}),(typeof helper === functionType ? helper.call(depth0, options) : helper));
  if (!helpers.hasSkipped) { stack1 = blockHelperMissing.call(depth0, stack1, options); }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\">\n    <h3 class=\"suite-title\">"
    + escapeExpression(((helper = helpers.title || (depth0 && depth0.title)),(typeof helper === functionType ? helper.call(depth0, {"name":"title","hash":{},"data":data}) : helper)))
    + "</h3>\n    <h5 class=\"suite-filename\">"
    + escapeExpression(((helper = helpers.file || (depth0 && depth0.file)),(typeof helper === functionType ? helper.call(depth0, {"name":"file","hash":{},"data":data}) : helper)))
    + "</h5>\n    ";
  stack1 = ((helper = helpers.hasTests || (depth0 && depth0.hasTests)),(options={"name":"hasTests","hash":{},"fn":this.program(19, data),"inverse":this.noop,"data":data}),(typeof helper === functionType ? helper.call(depth0, options) : helper));
  if (!helpers.hasTests) { stack1 = blockHelperMissing.call(depth0, stack1, options); }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n\n    ";
  stack1 = ((helper = helpers.suites || (depth0 && depth0.suites)),(options={"name":"suites","hash":{},"fn":this.program(22, data),"inverse":this.noop,"data":data}),(typeof helper === functionType ? helper.call(depth0, options) : helper));
  if (!helpers.suites) { stack1 = blockHelperMissing.call(depth0, stack1, options); }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  return buffer + "\n\n  </div>\n</section>\n";
},"5":function(depth0,helpers,partials,data) {
  return " root-suite";
  },"7":function(depth0,helpers,partials,data) {
  return " has-suites";
  },"9":function(depth0,helpers,partials,data) {
  return " has-tests";
  },"11":function(depth0,helpers,partials,data) {
  return " has-passed";
  },"13":function(depth0,helpers,partials,data) {
  return " has-failed";
  },"15":function(depth0,helpers,partials,data) {
  return " has-pending";
  },"17":function(depth0,helpers,partials,data) {
  return " has-skipped";
  },"19":function(depth0,helpers,partials,data) {
  var stack1, helper, options, functionType="function", escapeExpression=this.escapeExpression, helperMissing=helpers.helperMissing, blockHelperMissing=helpers.blockHelperMissing, buffer = " \n    <div class=\"suite-data-wrap\">\n      <!-- Suite Chart -->\n      <div class=\"suite-chart-wrap\">\n        <canvas id=\""
    + escapeExpression(((helper = helpers.uuid || (depth0 && depth0.uuid)),(typeof helper === functionType ? helper.call(depth0, {"name":"uuid","hash":{},"data":data}) : helper)))
    + "\" class=\"suite-chart\" width=\"100\" height=\"100\" data-total-passes=\""
    + escapeExpression(((helper = helpers.totalPasses || (depth0 && depth0.totalPasses)),(typeof helper === functionType ? helper.call(depth0, {"name":"totalPasses","hash":{},"data":data}) : helper)))
    + "\" data-total-failures=\""
    + escapeExpression(((helper = helpers.totalFailures || (depth0 && depth0.totalFailures)),(typeof helper === functionType ? helper.call(depth0, {"name":"totalFailures","hash":{},"data":data}) : helper)))
    + "\" data-total-pending=\""
    + escapeExpression(((helper = helpers.totalPending || (depth0 && depth0.totalPending)),(typeof helper === functionType ? helper.call(depth0, {"name":"totalPending","hash":{},"data":data}) : helper)))
    + "\" data-total-skipped=\""
    + escapeExpression(((helper = helpers.totalSkipped || (depth0 && depth0.totalSkipped)),(typeof helper === functionType ? helper.call(depth0, {"name":"totalSkipped","hash":{},"data":data}) : helper)))
    + "\"></canvas>\n        <span class=\"total\">"
    + escapeExpression(((helper = helpers.totalTests || (depth0 && depth0.totalTests)),(typeof helper === functionType ? helper.call(depth0, {"name":"totalTests","hash":{},"data":data}) : helper)))
    + "</span>\n        <ul class=\"suite-chart-legend list-unstyled\">\n          <li class=\"suite-chart-legend-item duration\"><span class=\"glyphicon glyphicon-time\"></span><span class=\"data\">"
    + escapeExpression((helper = helpers.formatDuration || (depth0 && depth0.formatDuration) || helperMissing,helper.call(depth0, (depth0 && depth0.duration), {"name":"formatDuration","hash":{},"data":data})))
    + "</span></li>\n          <li class=\"suite-chart-legend-item passed\"><span class=\"glyphicon glyphicon-ok\"></span><span class=\"data\">"
    + escapeExpression(((helper = helpers.totalPasses || (depth0 && depth0.totalPasses)),(typeof helper === functionType ? helper.call(depth0, {"name":"totalPasses","hash":{},"data":data}) : helper)))
    + "</span> passed</li>\n          <li class=\"suite-chart-legend-item failed\"><span class=\"glyphicon glyphicon-remove\"></span><span class=\"data\">"
    + escapeExpression(((helper = helpers.totalFailures || (depth0 && depth0.totalFailures)),(typeof helper === functionType ? helper.call(depth0, {"name":"totalFailures","hash":{},"data":data}) : helper)))
    + "</span> failed</li>\n          <li class=\"suite-chart-legend-item pending\"><span class=\"glyphicon glyphicon-pause\"></span><span class=\"data\">"
    + escapeExpression(((helper = helpers.totalPending || (depth0 && depth0.totalPending)),(typeof helper === functionType ? helper.call(depth0, {"name":"totalPending","hash":{},"data":data}) : helper)))
    + "</span> pending</li>\n        </ul>\n      </div>\n      <!-- Test Info -->\n      <div class=\"suite-test-wrap\">\n        <div class=\"suite-test-header\" data-toggle=\"collapse\" data-target=\"#"
    + escapeExpression(((helper = helpers.uuid || (depth0 && depth0.uuid)),(typeof helper === functionType ? helper.call(depth0, {"name":"uuid","hash":{},"data":data}) : helper)))
    + "-test-list\">\n          <h4 class=\"suite-test-header-title\">Tests<span class=\"pull-right glyphicon glyphicon-chevron-right\"></span></h4>\n        </div>\n        <div id=\""
    + escapeExpression(((helper = helpers.uuid || (depth0 && depth0.uuid)),(typeof helper === functionType ? helper.call(depth0, {"name":"uuid","hash":{},"data":data}) : helper)))
    + "-test-list\" class=\"list-group test-list collapse in\">\n          ";
  stack1 = ((helper = helpers.tests || (depth0 && depth0.tests)),(options={"name":"tests","hash":{},"fn":this.program(20, data),"inverse":this.noop,"data":data}),(typeof helper === functionType ? helper.call(depth0, options) : helper));
  if (!helpers.tests) { stack1 = blockHelperMissing.call(depth0, stack1, options); }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  return buffer + "\n        </div>\n      </div>\n    </div>\n    ";
},"20":function(depth0,helpers,partials,data) {
  var stack1, buffer = "\n            ";
  stack1 = this.invokePartial(partials._test, '_test', depth0, undefined, helpers, partials, data);
  if(stack1 || stack1 === 0) { buffer += stack1; }
  return buffer + "\n          ";
},"22":function(depth0,helpers,partials,data) {
  var stack1, buffer = "\n      ";
  stack1 = this.invokePartial(partials._suite, '_suite', depth0, undefined, helpers, partials, data);
  if(stack1 || stack1 === 0) { buffer += stack1; }
  return buffer + "\n    ";
},"compiler":[5,">= 2.0.0"],"main":function(depth0,helpers,partials,data) {
  var stack1, helper, options, functionType="function", blockHelperMissing=helpers.blockHelperMissing, buffer = "";
  stack1 = ((helper = helpers.rootEmpty || (depth0 && depth0.rootEmpty)),(options={"name":"rootEmpty","hash":{},"fn":this.program(1, data),"inverse":this.noop,"data":data}),(typeof helper === functionType ? helper.call(depth0, options) : helper));
  if (!helpers.rootEmpty) { stack1 = blockHelperMissing.call(depth0, stack1, options); }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n";
  stack1 = ((helper = helpers.rootEmpty || (depth0 && depth0.rootEmpty)),(options={"name":"rootEmpty","hash":{},"fn":this.noop,"inverse":this.program(4, data),"data":data}),(typeof helper === functionType ? helper.call(depth0, options) : helper));
  if (!helpers.rootEmpty) { stack1 = blockHelperMissing.call(depth0, stack1, options); }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  return buffer;
},"usePartial":true,"useData":true}));
Handlebars.registerPartial("_summary", Handlebars.template({"compiler":[5,">= 2.0.0"],"main":function(depth0,helpers,partials,data) {
  var helper, functionType="function", escapeExpression=this.escapeExpression, helperMissing=helpers.helperMissing;
  return "<div class=\"row\">\n  <div class=\"summary-col summary-suites\">\n    <h1 class=\"summary-count\">"
    + escapeExpression(((helper = helpers.suites || (depth0 && depth0.suites)),(typeof helper === functionType ? helper.call(depth0, {"name":"suites","hash":{},"data":data}) : helper)))
    + "</h1>\n    <h4 class=\"summary-label\">Suite"
    + escapeExpression((helper = helpers.getPlural || (depth0 && depth0.getPlural) || helperMissing,helper.call(depth0, (depth0 && depth0.suites), {"name":"getPlural","hash":{},"data":data})))
    + "</h4>\n  </div>\n  <div class=\"summary-col summary-tests\">\n    <h1 class=\"summary-count\">"
    + escapeExpression(((helper = helpers.testsRegistered || (depth0 && depth0.testsRegistered)),(typeof helper === functionType ? helper.call(depth0, {"name":"testsRegistered","hash":{},"data":data}) : helper)))
    + "</h1>\n    <h4 class=\"summary-label\">Test"
    + escapeExpression((helper = helpers.getPlural || (depth0 && depth0.getPlural) || helperMissing,helper.call(depth0, (depth0 && depth0.testsRegistered), {"name":"getPlural","hash":{},"data":data})))
    + "</h4>\n  </div>\n  <div class=\"summary-col summary-passes\">\n    <h1 class=\"summary-count\">"
    + escapeExpression(((helper = helpers.passes || (depth0 && depth0.passes)),(typeof helper === functionType ? helper.call(depth0, {"name":"passes","hash":{},"data":data}) : helper)))
    + "</h1>\n    <h4 class=\"summary-label summary-filter\">Passed</h4>\n  </div>\n  <div class=\"summary-col summary-failures\">\n    <h1 class=\"summary-count\">"
    + escapeExpression(((helper = helpers.failures || (depth0 && depth0.failures)),(typeof helper === functionType ? helper.call(depth0, {"name":"failures","hash":{},"data":data}) : helper)))
    + "</h1>\n    <h4 class=\"summary-label summary-filter\">Failed</h4>\n  </div>\n  <div class=\"summary-col summary-pending\">\n    <h1 class=\"summary-count\">"
    + escapeExpression(((helper = helpers.pending || (depth0 && depth0.pending)),(typeof helper === functionType ? helper.call(depth0, {"name":"pending","hash":{},"data":data}) : helper)))
    + "</h1>\n    <h4 class=\"summary-label summary-filter\">Pending</h4>\n  </div>\n  <div class=\"summary-col summary-duration\">\n    <h1 class=\"summary-count\">"
    + escapeExpression((helper = helpers.formatSummaryDuration || (depth0 && depth0.formatSummaryDuration) || helperMissing,helper.call(depth0, (depth0 && depth0.duration), {"name":"formatSummaryDuration","hash":{},"data":data})))
    + "</h1>\n    <h4 class=\"summary-label\">"
    + escapeExpression((helper = helpers.getSummaryDurationUnits || (depth0 && depth0.getSummaryDurationUnits) || helperMissing,helper.call(depth0, (depth0 && depth0.duration), {"name":"getSummaryDurationUnits","hash":{},"data":data})))
    + "</h4>\n  </div>\n</div>";
},"useData":true}));
Handlebars.registerPartial("_test", Handlebars.template({"1":function(depth0,helpers,partials,data) {
  return " passed";
  },"3":function(depth0,helpers,partials,data) {
  return " failed";
  },"5":function(depth0,helpers,partials,data) {
  return " pending";
  },"7":function(depth0,helpers,partials,data) {
  return " skipped";
  },"9":function(depth0,helpers,partials,data) {
  var helper, functionType="function", escapeExpression=this.escapeExpression, helperMissing=helpers.helperMissing;
  return "\n    <div class=\"pull-right\">\n      <button class=\"btn btn-link btn-sm toggle-btn toggle-code collapsed\" data-toggle=\"collapse\" data-target=\"#"
    + escapeExpression(((helper = helpers.uuid || (depth0 && depth0.uuid)),(typeof helper === functionType ? helper.call(depth0, {"name":"uuid","hash":{},"data":data}) : helper)))
    + " > .test-code.collapse\">Code</button>\n      <span class=\"test-duration "
    + escapeExpression(((helper = helpers.speed || (depth0 && depth0.speed)),(typeof helper === functionType ? helper.call(depth0, {"name":"speed","hash":{},"data":data}) : helper)))
    + "\">"
    + escapeExpression((helper = helpers.formatDuration || (depth0 && depth0.formatDuration) || helperMissing,helper.call(depth0, (depth0 && depth0.duration), {"name":"formatDuration","hash":{},"data":data})))
    + "</span>\n    </div>\n    ";
},"11":function(depth0,helpers,partials,data,depth1) {
  var stack1, helper, functionType="function", escapeExpression=this.escapeExpression;
  return "\n    <p class=\"test-error-message\">"
    + escapeExpression(((helper = helpers.name || (depth0 && depth0.name)),(typeof helper === functionType ? helper.call(depth0, {"name":"name","hash":{},"data":data}) : helper)))
    + ": "
    + escapeExpression(((helper = helpers.message || (depth0 && depth0.message)),(typeof helper === functionType ? helper.call(depth0, {"name":"message","hash":{},"data":data}) : helper)))
    + "\n      <button class=\"btn btn-link btn-sm toggle-btn toggle-stack collapsed\" data-toggle=\"collapse\" data-target=\"#"
    + escapeExpression(((stack1 = (depth1 && depth1.uuid)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + " > .test-error-stack.collapse\">Stack</button>\n    </p>\n  ";
},"13":function(depth0,helpers,partials,data) {
  var helper, functionType="function", escapeExpression=this.escapeExpression;
  return "\n  <div class=\"test-error-stack collapse\">\n    <pre><code class=\"hljs small\">"
    + escapeExpression(((helper = helpers.stack || (depth0 && depth0.stack)),(typeof helper === functionType ? helper.call(depth0, {"name":"stack","hash":{},"data":data}) : helper)))
    + "</code></pre>\n  </div>\n  ";
},"compiler":[5,">= 2.0.0"],"main":function(depth0,helpers,partials,data) {
  var stack1, helper, options, functionType="function", escapeExpression=this.escapeExpression, blockHelperMissing=helpers.blockHelperMissing, buffer = "<div id=\""
    + escapeExpression(((helper = helpers.uuid || (depth0 && depth0.uuid)),(typeof helper === functionType ? helper.call(depth0, {"name":"uuid","hash":{},"data":data}) : helper)))
    + "\" class=\"list-group-item test";
  stack1 = ((helper = helpers.pass || (depth0 && depth0.pass)),(options={"name":"pass","hash":{},"fn":this.program(1, data),"inverse":this.noop,"data":data}),(typeof helper === functionType ? helper.call(depth0, options) : helper));
  if (!helpers.pass) { stack1 = blockHelperMissing.call(depth0, stack1, options); }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  stack1 = ((helper = helpers.fail || (depth0 && depth0.fail)),(options={"name":"fail","hash":{},"fn":this.program(3, data),"inverse":this.noop,"data":data}),(typeof helper === functionType ? helper.call(depth0, options) : helper));
  if (!helpers.fail) { stack1 = blockHelperMissing.call(depth0, stack1, options); }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  stack1 = ((helper = helpers.pending || (depth0 && depth0.pending)),(options={"name":"pending","hash":{},"fn":this.program(5, data),"inverse":this.noop,"data":data}),(typeof helper === functionType ? helper.call(depth0, options) : helper));
  if (!helpers.pending) { stack1 = blockHelperMissing.call(depth0, stack1, options); }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  stack1 = ((helper = helpers.skipped || (depth0 && depth0.skipped)),(options={"name":"skipped","hash":{},"fn":this.program(7, data),"inverse":this.noop,"data":data}),(typeof helper === functionType ? helper.call(depth0, options) : helper));
  if (!helpers.skipped) { stack1 = blockHelperMissing.call(depth0, stack1, options); }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\">\n  <!-- Test Heading -->\n  <div class=\"test-heading\">\n    <h4 class=\"test-title\">\n      <span class=\"glyphicon\"></span>\n      <span class=\"text-muted hidden\"> it </span>\n      "
    + escapeExpression(((helper = helpers.title || (depth0 && depth0.title)),(typeof helper === functionType ? helper.call(depth0, {"name":"title","hash":{},"data":data}) : helper)))
    + "\n    </h4>\n    ";
  stack1 = ((helper = helpers.pending || (depth0 && depth0.pending)),(options={"name":"pending","hash":{},"fn":this.noop,"inverse":this.program(9, data),"data":data}),(typeof helper === functionType ? helper.call(depth0, options) : helper));
  if (!helpers.pending) { stack1 = blockHelperMissing.call(depth0, stack1, options); }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n  </div>\n  <!-- Test Errors -->\n  ";
  stack1 = ((helper = helpers.err || (depth0 && depth0.err)),(options={"name":"err","hash":{},"fn":this.programWithDepth(11, data, depth0),"inverse":this.noop,"data":data}),(typeof helper === functionType ? helper.call(depth0, options) : helper));
  if (!helpers.err) { stack1 = blockHelperMissing.call(depth0, stack1, options); }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n  <!-- Test Code -->\n  <div class=\"test-code collapse\">\n    <pre><code class=\"hljs javascript small\">";
  stack1 = ((helper = helpers.code || (depth0 && depth0.code)),(typeof helper === functionType ? helper.call(depth0, {"name":"code","hash":{},"data":data}) : helper));
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "</code></pre>\n  </div>\n  <!-- Test Error Stack -->\n  ";
  stack1 = ((helper = helpers.err || (depth0 && depth0.err)),(options={"name":"err","hash":{},"fn":this.program(13, data),"inverse":this.noop,"data":data}),(typeof helper === functionType ? helper.call(depth0, options) : helper));
  if (!helpers.err) { stack1 = blockHelperMissing.call(depth0, stack1, options); }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  return buffer + "\n</div>";
},"useData":true}));