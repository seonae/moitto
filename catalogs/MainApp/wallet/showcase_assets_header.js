var wallet = require("wallet");

function show_me() {
    controller.catalog().submit("showcase", "auxiliary", "S_USER.ME", {
        "username":$data["username"],
        "fetched":"no"
    });

    controller.action("page", { "display-unit":"S_USER.ME", "target":"popup" });
}

function show_blog() {
    controller.catalog().submit("showcase", "auxiliary", "S_BLOG", {
        "username":$data["username"],
        "fetched":"no"
    });

    controller.action("page", { "display-unit":"S_BLOG", "target":"popup" });
}

function show_following() {
    controller.catalog().submit("showcase", "auxiliary", "S_FOLLOWING", {
        "username":$data["username"],
        "fetched":"no"
    });
    
    controller.action("page", { "display-unit":"S_FOLLOWING", "target":"popup" });
}

function show_followers() {
    controller.catalog().submit("showcase", "auxiliary", "S_FOLLOWERS", {
        "username":$data["username"],
        "fetched":"no"
    });

    controller.action("page", { "display-unit":"S_FOLLOWERS", "target":"popup" });
}

function redeem_rewards() {
    owner.action("script", { "script":"redeem_rewards" });
}
