var account = require("account");
var bookmark = require("bookmark");

function add_bookmark(form) {
    if (account.is_logged_in()) {
        var username = account.get_username();
        var author = $data["author"];
        var permlink = $data["permlink"];

        bookmark.add(username, author, permlink, $data);

        controller.action("toast", { "message":"북마크 되었습니다." });
        controller.action("popup-close");
    } else {
        controller.action("subview", { 
            "subview":"V_LOGIN", 
            "target":"popup",
            "close-popup":"yes" 
        });
    }
}

function remove_bookmark(form) {
    if (account.is_logged_in()) {
        var username = account.get_username();
        var author = $data["author"];
        var permlink = $data["permlink"];

        bookmark.remove(username, author, permlink);

        controller.action("toast", { "message":"북마크를 해제하였습니다." });
        controller.action("popup-close");
    } else {
        controller.action("subview", { 
            "subview":"V_LOGIN", 
            "target":"popup",
            "close-popup":"yes" 
        });
    }
}

function upvote(form) {
    if (account.is_logged_in()) {
        controller.catalog().submit("showcase", "auxiliary", "S_DISCUSSION.UPVOTE", {
            "author":$data["author"],
            "permlink":$data["permlink"]
        });

        controller.action("popup", { "display-unit":"S_DISCUSSION.UPVOTE" });
    } else {
        controller.action("subview", { 
            "subview":"V_LOGIN", 
            "target":"popup",
            "close-popup":"yes" 
        });
    }
}

function downvote(form) {
    if (account.is_logged_in()) {
        controller.catalog().submit("showcase", "auxiliary", "S_DISCUSSION.DOWNVOTE", {
            "author":$data["author"],
            "permlink":$data["permlink"]
        });

        controller.action("popup", { "display-unit":"S_DISCUSSION.DOWNVOTE" });
    } else {
        controller.action("subview", { 
            "subview":"V_LOGIN", 
            "target":"popup",
            "close-popup":"yes" 
        });
    }
}

function unvote(form) {
    if (account.is_logged_in()) {
        controller.catalog().submit("showcase", "auxiliary", "S_DISCUSSION.UNVOTE", {
            "author":$data["author"],
            "permlink":$data["permlink"]
        });

        controller.action("popup", { "display-unit":"S_DISCUSSION.UNVOTE" });
    } else {
        controller.action("subview", { 
            "subview":"V_LOGIN", 
            "target":"popup",
            "close-popup":"yes" 
        });
    }
}

function reblog(form) {
    if (account.is_logged_in()) {
        controller.catalog().submit("showcase", "auxiliary", "S_DISCUSSION.REBLOG", {
            "author":$data["author"],
            "permlink":$data["permlink"]
        });

        controller.action("popup", { "display-unit":"S_DISCUSSION.REBLOG" });
    } else {
        controller.action("subview", { 
            "subview":"V_LOGIN", 
            "target":"popup",
            "close-popup":"yes" 
        });
    }
}

function report(form) {
    if (account.is_logged_in()) {
        controller.catalog().submit("showcase", "auxiliary", "S_DISCUSSION.REPORT", {
            "author":$data["author"],
            "permlink":$data["permlink"],
            "status":"report"
        });

        controller.action("popup", { "display-unit":"S_DISCUSSION.REPORT" });
    } else {
        controller.action("subview", { 
            "subview":"V_LOGIN", 
            "target":"popup",
            "close-popup":"yes" 
        });
    }
}

function copy_url(form) {
    var url = "https://steemit.com/@" + $data["author"] + "/" + $data["permlink"];

    controller.action("copy", {
        "target":"clipboard",
        "text":url,
        "close-popup":"yes"
    });
}
