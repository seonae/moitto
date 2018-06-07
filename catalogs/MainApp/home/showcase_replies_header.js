var users = require("users");

var __schedule_to_reload = false;

function on_image_download() {
    if (!__schedule_to_reload) {
        timeout(0.5, function() {
            owner.action("reload-header");

            __schedule_to_reload = false;
        });
    }

    __schedule_to_reload = true;
}

function show_user(params) {
    var user = users.create(params["username"]);
    
    controller.catalog().submit("showcase", "auxiliary", "S_USER", {
        "username":user.name,
        "userpic-url":user.get_userpic_url("small"),
        "fetched":"no"
    });

    controller.action("page", { "display-unit":"S_USER" })
}

function show_tag(params) {
    controller.catalog().submit("showcase", "auxiliary", "S_TAG", {
        "tag":params["label"],
        "navibar-title":"#" + params["label"]
    });

    controller.action("page", { "display-unit":"S_TAG" })    
}

function show_votes() {
    controller.catalog().submit("showcase", "auxiliary", "S_VOTES", {
        "author":$data["author"],
        "permlink":$data["permlink"]
    });

    controller.action("page", { "display-unit":"S_VOTES" })
}

function show_replies() {
    controller.catalog().submit("showcase", "auxiliary", "S_REPLIES", {
        "author":$data["author"],
        "permlink":$data["permlink"]
    });

    controller.action("page", { "display-unit":"S_REPLIES" })
}

function open_url(params) {
    var matched = /https?:\/\/((?:[a-z0-9]+\.?)+)(?:\/[a-zA-Z0-9_@%:\/\.\-]+)?\/@([^\/]+)\/([^\/]+)/.exec(params["url"]);

    if (matched) {
        if (__is_steem_host(matched[1])) {
            var user = users.create(matched[2]);

            controller.catalog().submit("showcase", "auxiliary", "S_DISCUSSION", {
                "author":user.name,
                "permlink":matched[3],
                "userpic-url":user.get_userpic_url("small")
            });
    
            controller.action("page", { "display-unit":"S_DISCUSSION" });

            return;
        }
    }

    controller.action("link", { url:params["url"] });
}

function __is_steem_host(host) {
    var known_hosts = [ "steemit.com", "busy.org", "steemkr.com" ];

    for (var i = 0; i < known_hosts.length; i++) {
        if (host.includes(known_hosts[i])) {
            return true;
        }
    }

    return false;
}