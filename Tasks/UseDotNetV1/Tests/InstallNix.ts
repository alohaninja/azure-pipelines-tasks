import ma = require('azure-pipelines-task-lib/mock-answer');
import tmrm = require('azure-pipelines-task-lib/mock-run');
import path = require('path');
import os = require('os');

let taskPath = path.join(__dirname, '..', 'usedotnet.js');
let tr: tmrm.TaskMockRunner = new tmrm.TaskMockRunner(taskPath);

tr.setInput("packageType", process.env["__package_type__"] || 'sdk');
tr.setInput("version", "1.0.4");
tr.setInput("proxy", process.env["__proxy__"] || 'false');
if (process.env["__auth__"]) {
    tr.setInput("auth", process.env["__auth__"]);
}
tr.setInput("nuGetFeedType", process.env["__nuGetFeedType__"] || 'internal');

process.env["AGENT_TOOLSDIRECTORY"] = "/agent/_tools";
process.env["AGENT_PROXYURL"] = "https://proxy.com";
process.env["AGENT_PROXYUSERNAME"] = "username";
process.env["AGENT_PROXYPASSWORD"] = "password";

let a: ma.TaskLibAnswers = <ma.TaskLibAnswers>{
    "exec": {
        "/somedir/currdir/externals/get-os-distro.sh": {
            "code": 0,
            "stdout": "Primary: linux" + os.EOL,
        }
    },
    "osType": {
        "osType": "Linux"
    },
    "which": {
        "/somedir/currdir/externals/get-os-distro.sh": "/somedir/currdir/externals/get-os-distro.sh"
    },
    "checkPath": {
        "/somedir/currdir/externals/get-os-distro.sh": true
    }
};

tr.registerMock('./utilities', {
    getCurrentDir: function () {
        return "/somedir/currdir";
    },
    setFileAttribute: function (file, mode) {
        console.log("Changing attribute for file " + file + " to " + mode);
    }
});

process.env["MOCK_NORMALIZE_SLASHES"] = "true";
tr.setAnswers(a);

tr.registerMock('azure-pipelines-task-lib/toolrunner', require('azure-pipelines-task-lib/mock-toolrunner'));
tr.registerMock('azure-pipelines-tool-lib/tool', require('./mock_node_modules/tool'));
tr.registerMock('./releasesfetcher', require("./mock_node_modules/releasesfetcher"));
tr.run();