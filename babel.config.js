module.exports = function(api) {
    api.cache(true);
    
    var presets = [
        ['@babel/preset-env', {
            targets: {
                node: "8"
            }
        }]
    ];
    var plugins = [];

    return {
        presets,
        plugins
    };
};