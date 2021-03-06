Themes = (function() {
    return {};
})();

Themes.markdown = require("markdown");
Themes.sbml     = require("sbml");

// class ThemeBase

function ThemeBase(theme) {
    this.theme = theme;
    this.dir_path = "~/Themes/" + theme;
    this.hides_navibar = false;
    this.auxiliary = {};
}

ThemeBase.prototype.parse_markdown = function(text) {
    return Themes.markdown.parse(text);
}

ThemeBase.prototype.markdown_to_sbml = function(markdown, images) {
    return Themes.sbml.generate_from_markdown(markdown, images);
}

// instance factory

Themes.create = function(theme) {
    include("~/Themes/" + theme + "/theme.js");

    return new Theme(theme);
}

__MODULE__ = Themes;
