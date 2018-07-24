var global = require("global");
var bookmark = require("bookmark");

var __last_discussion = null;

function feed_blog(keyword, location, length, sortkey, sortorder, handler) {
    var username = $data["username"];
    var bookmarks = bookmark.list(username, location, length);
    var backgrounds = controller.catalog("ImageBank").values("showcase", "backgrounds", "C_COLOR", null, [ 0, 100 ]);

    bookmarks.forEach(function(discussion) {
        discussion.push(__random_background_data(backgrounds));
    });

    handler(bookmarks);
}

function open_discussion(data) {
    var discussion = __discussion_data_for_value(data);

    controller.catalog().submit("showcase", "auxiliary", "S_DISCUSSION", discussion);
    controller.action("page", { "display-unit":"S_DISCUSSION", "target":"popup" });
}

function __template_data_for_content(content) {
    if ((content.meta["image"] || []).length == 0) {
        return {
            "template":"text"
        }
    }

    return {};
}

function __random_background_data(values) {
    var value = values[Math.floor(Math.random()*values.length)];
    var data = { "background":value["id"] };

    Object.keys(value).forEach(function(key) {
        data["background." + key] = value[key];
    });

    return data;
}

function __discussion_data_for_value(value) {
    var data = [];

    [ "author", "permlink", "userpic-url" ].forEach(function(key) {
        data[key] = value[key];
    });

    Object.keys(value).forEach(function(key) {
        if (key.startsWith("template") || key.startsWith("background")) {
            data[key] = value[key];
        }
    });

    return data;
}
