var account  = require("account");
var steemjs  = require("steemjs");
var contents = require("contents"); 
var texts    = require("texts");

var __last_discussion = null;
var __has_packages = true;

function on_loaded() {
    if (!account.is_logged_in()) {
        __show_login_section();
        
        return;
    }

    var packages = controller.module("packages");
    var has_packages = (packages.count() > 0) ? true : false;

    controller.catalog().submit("showcase", "auxiliary", "S_PACKAGES", {
        "has-packages":has_packages ? "yes" : "no"
    });

    if (has_packages != __has_packages) {
        __reload_feeds_header();
    }

    __has_packages = has_packages;
}

function feed_feeds(keyword, location, length, sortkey, sortorder, handler) {
    var start_author   = (location > 0) ? __last_discussion["author"]   : null;
    var start_permlink = (location > 0) ? __last_discussion["permlink"] : null;

    if (account.is_logged_in()) {
        var me = account.get_username();
        
        steemjs.get_discussions_by_feed(me, start_author, start_permlink, length + (start_author ? 1 : 0)).then(function(discussions) {
            var backgrounds = controller.catalog("ImageBank").values("showcase", "backgrounds", "C_IMAGE", null, [ 0, 100 ]);
            var data = [];

            if (location > 0) {
                discussions = discussions.splice(1);
            }

            discussions.forEach(function(discussion) {
                var content = contents.create(discussion);
                var reblogged = (content.data["reblogged_by"].length > 0) ? true : false;
                var datum = {
                    "id":"S_FEEDS_" + content.data["author"] + "_" + content.data["permlink"],
                    "author":content.data["author"],
                    "permlink":content.data["permlink"],
                    "title":content.data["title"], 
                    "image-url":content.get_title_image_url("256x512"),
                    "large-image-url":content.get_title_image_url("640x480"),
                    "userpic-url":content.get_userpic_url("small"),
                    "userpic-large-url":content.get_userpic_url(),
                    "author-reputation":content.get_author_reputation().toFixed(0).toString(),
                    "votes-count":content.data["net_votes"].toString(),
                    "vote-weight":content.get_vote_weight(me).toString(),
                    "replies-count":content.data["children"].toString(),
                    "payout-value":"$" + content.get_payout_value().toFixed(2).toString(),
                    "is-payout":content.is_payout() ? "yes" : "no",
                    "reblogged":reblogged ? "yes" : "no",
                    "reblogged-by":reblogged ? content.data["reblogged_by"][0] : "",
                    "reblogged-count":content.data["reblogged_by"].length.toString(),
                    "reblogged-count-1":(content.data["reblogged_by"].length - 1).toString(),
                    "main-tag":content.data["category"],
                    "created-at":content.data["created"]
                };

                datum = Object.assign(datum, __template_data_for_content(content));
                datum = Object.assign(datum, __random_background_data(backgrounds));

                if (content.is_allowed()) {
                    data.push(datum);
                }
            });

            if (discussions.length > 0) {
                __last_discussion = discussions[discussions.length - 1];
            }

            handler(data);
        });        
    } else {
        handler([]);
    }
}

function open_discussion(data) {
    var discussion = __discussion_data_for_value(data);

    controller.catalog().submit("showcase", "auxiliary", "S_DISCUSSION", discussion);
    controller.action("page", { "display-unit":"S_DISCUSSION", "target":"popup" });
}

function __reload_feeds_showcase() {
    var showcase = view.object("showcase.feeds");

    showcase.action("reload");
}

function __reload_feeds_header() {
    var showcase = view.object("showcase.feeds");

    showcase.action("reload-header");
}

function __show_login_section() {
    var section = view.object("section.login");

    section.action("show");
}

function __template_data_for_content(content) {
    var video_id = content.get_title_video_id();

    if (video_id) {
        return {
            "template":video_id[0], 
            "template.video-id":video_id[1]
        }
    }
    
    if ((content.meta["image"] || []).length == 0) {
        return {
            "template":"text"
        }
    }

    return {};
}

function __random_background_data(values) {
    var value = values[Math.floor(Math.random()*values.length)];
    var data = { "background":value["id"]};

    Object.keys(value).forEach(function(key) {
        data["background." + key] = value[key];
    });

    return data;
}

function __discussion_data_for_value(value) {
    var data = [];

    [ "author", "permlink", "userpic-url", "main-tag" ].forEach(function(key) {
        data[key] = value[key];
    });

    Object.keys(value).forEach(function(key) {
        if (key.startsWith("template") || key.startsWith("background")) {
            data[key] = value[key];
        }
    });

    return data;
}
