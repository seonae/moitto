var users = require("users");
var account = require("account");
var bookmark = require("bookmark");

function show_user() {
    var user = users.create($data["author"]);
    
    controller.catalog().submit("showcase", "auxiliary", "S_USER", {
        "username":user.name,
        "userpic-url":user.get_userpic_url("small"),
        "fetched":"no"
    });
    controller.action("page", { "display-unit":"S_USER", "target":"popup" })
}

function show_menu() {
    var value = controller.catalog().value("showcase", "auxiliary", "S_DISCUSSION");
    var username = account.get_username();
    var author = $data["author"];
    var permlink = $data["permlink"];
    var bookmarked = "no";

    if (bookmark.marked(username, author, permlink)) {
        bookmarked = "yes"
    }

    controller.catalog().submit("showcase", "auxiliary", "S_DISCUSSION.MENU", {
        "vote-weight":value["vote-weight"],
        "bookmarked":bookmarked
    });

    controller.action("popup", { "display-unit":"S_DISCUSSION.MENU" })
}
