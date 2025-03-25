const { declare, MatchPattern } = require("@babel/helper-plugin-utils");
const Module = require("./class/Module");
const minimatch = require('minimatch');

module.exports = declare((api, options ) => {
  api.assertVersion(7);

  return {
    name: "transform-react-templates",

    visitor: {
      Program: function (path, file) {
        if (options && options.includes) {
          if (!options.includes.find(pattern => minimatch(file.filename, pattern))) {
            return;
          }
        }
        const m = new Module(path, file, file.file.code);
        m.convertReactTemplate(options);
      }
    }

  };
});
