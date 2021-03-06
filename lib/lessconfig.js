"use strict";
var Fs = require("fs");
var Path = require("path");
var util_path_1 = require("./util-path");
var LessConfig;
(function (LessConfig) {
    function pop(obj, key, otherwise) {
        if (otherwise === void 0) { otherwise = undefined; }
        if (obj.hasOwnProperty(key)) {
            otherwise = obj[key];
            delete obj[key];
        }
        return otherwise;
    }
    /**
     * Returns transcode-less options of given `lessconfig.josn` path
     */
    function getOptionForLessFile(configPath) {
        var configuration;
        if (Fs.existsSync(configPath)) {
            var rawOptions = JSON.parse(Fs.readFileSync(configPath).toString());
            configuration = new Options();
            configuration.outDir = pop(rawOptions, "outDir", Path.dirname(configPath));
            configuration.rootDir = pop(rawOptions, "rootDir");
            // outDir resolution
            if (!Path.isAbsolute(configuration.outDir)) {
                configuration.outDir = Path.resolve(Path.dirname(configPath), configuration.outDir);
            }
            // rootDir resolution
            if (!configuration.rootDir) {
                var rootDir_1 = Path.dirname(configPath);
                var depth_1 = util_path_1.UtilPath.getMinDepthOfLessFiles(rootDir_1);
                var paths_1 = [Path.dirname(configPath)];
                var depths_1 = [depth_1];
                while (paths_1.length == 1 && depths_1[0] > 0) {
                    rootDir_1 = paths_1.pop();
                    depth_1 = depths_1.pop();
                    Fs.readdirSync(rootDir_1).forEach(function (path) {
                        if (path[0] != "." && path != "node_modules" && Fs.statSync(Path.join(rootDir_1, path)).isDirectory()) {
                            path = Path.join(rootDir_1, path);
                            depth_1 = util_path_1.UtilPath.getMinDepthOfLessFiles(path);
                            if (depth_1 >= 0) {
                                paths_1.push(path);
                                depths_1.push(depth_1);
                            }
                        }
                    });
                }
                configuration.rootDir = paths_1.pop();
            }
            else if (!Path.isAbsolute(configuration.rootDir)) {
                configuration.rootDir = Path.resolve(Path.dirname(configPath), configuration.rootDir);
            }
            if (rawOptions.paths) {
                for (var p = rawOptions.paths.length - 1; p >= 0; p--) {
                    if (!Path.isAbsolute(rawOptions.paths[p])) {
                        rawOptions.paths[p] = Path.resolve(configuration.rootDir, rawOptions.paths[p]);
                    }
                }
            }
            if (rawOptions.plugins) {
                configuration.plugins = pop(rawOptions, "plugins", []);
            }
            rawOptions.plugins = [];
            configuration.options = rawOptions;
            configuration.filepath = configPath;
        }
        else {
            configuration = LessConfig.DefaultOptions;
        }
        return configuration;
    }
    LessConfig.getOptionForLessFile = getOptionForLessFile;
    /**
     * TranscodeLess options
     */
    var Options = (function () {
        function Options() {
            /** Plugin list */
            this.plugins = {};
            /** Less options */
            this.options = {
                plugins: []
            };
        }
        Options.prototype.getFilepath = function () {
            return this.filepath;
        };
        /**
         * Add to `options` loaded plugins and return unloaded
         */
        Options.prototype.loadPlugins = function (options, plugins) {
            var unavailablePlugins = [];
            var nodeModulePaths = [];
            atom.project.getPaths().forEach(function (item) {
                var path = Path.join(item, "node_modules");
                if (util_path_1.UtilPath.existsSync(path)) {
                    nodeModulePaths.push(path);
                }
            });
            for (var index in plugins) {
                var name_1 = plugins[index];
                var loaded = false;
                for (var p = 0; p < nodeModulePaths.length; p++) {
                    try {
                        var pluginClass = require(Path.join(nodeModulePaths[p], name_1));
                        var plugin = new pluginClass(this.plugins[name_1]);
                        options.plugins.push(plugin);
                        loaded = true;
                    }
                    catch (error) {
                        console.error(error);
                    }
                }
                if (!loaded) {
                    unavailablePlugins.push(name_1);
                }
            }
            return unavailablePlugins;
        };
        /**
         * Get options object for less rendering
         */
        Options.prototype.loadOptions = function () {
            var _this = this;
            return new Promise(function (resolve, reject) {
                var options = _this.options;
                var plugins = [];
                for (var plugin in _this.plugins) {
                    plugins.push(plugin);
                }
                var unavailablePlugins = _this.loadPlugins(options, plugins);
                if (unavailablePlugins.length == 1) {
                    atom.notifications.addWarning(unavailablePlugins[0] + " is not installed", { dismissable: true });
                }
                else if (unavailablePlugins.length > 1) {
                    atom.notifications.addWarning(unavailablePlugins.join(", ") + " are not installed", { dismissable: true });
                }
                resolve(options);
            });
        };
        return Options;
    }());
    LessConfig.Options = Options;
    LessConfig.DefaultOptions = new LessConfig.Options();
})(LessConfig = exports.LessConfig || (exports.LessConfig = {}));
//# sourceMappingURL=lessconfig.js.map