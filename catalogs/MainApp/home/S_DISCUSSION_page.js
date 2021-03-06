var global = require("global");
var themes = require("themes");

function on_loaded() {
    var discussion = controller.catalog().value("showcase", "auxiliary", "S_DISCUSSION");
    
    global.get_content(discussion["author"], discussion["permlink"]).then(function(content) {
        var me = storage.value("ACTIVE_USER") || "";
        var tags = content.meta["tags"];
        var reblogged = (content.data["reblogged_by"].length > 0) ? true : false;
        var theme = __get_theme_in_tags(tags);
        var impl = themes.create(theme);        
        var data = {
            "author":content.data["author"],
            "permlink":content.data["permlink"],
            "title":content.data["title"],
            "body":impl.build_body(content.data["body"], content.meta["format"], content.meta["image"]),
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
            "tag-1":(tags.length > 0) ? tags[0] : "",
            "tag-2":(tags.length > 1) ? tags[1] : "",
            "tag-3":(tags.length > 2) ? tags[2] : "",
            "tag-4":(tags.length > 3) ? tags[3] : "",
            "tag-5":(tags.length > 4) ? tags[4] : "",
            "created-at":content.data["created"],
            "theme":impl.theme,
            "dir-path":impl.dir_path
        };

        Object.keys(discussion).forEach(function(key) {
            if (key.startsWith("template") || key.startsWith("background")) {
                data[key] = discussion[key];
            }
        });

        if (impl.hides_navibar) {
            data["hides-navibar"] = "yes";
        }

        Object.keys(impl.auxiliary).forEach(function(key) {
            data[key] = impl.auxiliary[key];
        });

        controller.update("content-" + content.data["author"] + "." + content.data["permlink"], {
            "votes-count":content.data["net_votes"].toString(),
            "replies-count":content.data["children"].toString(),
            "vote-weight":content.get_vote_weight(me).toString(),
            "payout-value":"$" + content.get_payout_value().toFixed(2).toString(),
            "reblogged":reblogged ? "yes" : "no",
            "reblogged-by":reblogged ? content.data["reblogged_by"][0] : "",
            "reblogged-count":content.data["reblogged_by"].length.toString(),
            "reblogged-count-1":(content.data["reblogged_by"].length - 1).toString()
        });

        if (content.is_allowed()) {
            view.data("display-unit", data);
            view.data("environment", { "alternate-name":"discussion" });
            view.action("reload"); 
        } else {
            controller.action("toast", {
                "message":"허용되지 않는 컨텐츠입니다.",
                "close-popup":"yes"
            });
        }
    });
}

function __get_theme_in_tags(tags) {
    for (var i = 0; i < tags.length; ++i) {
        if (tags[i].startsWith("moitto-")) {
            var theme = tags[i].substring("moitto-".length);

            if ([ "playlist", "webtoon" ].includes(theme)) {
                return "moitto/" + theme;
            }

            continue;
        }

        if (tags[i].startsWith("tuubcast-")) {
            var theme = tags[i].substring("tuubcast-".length);

            if ([ "fancam" ].includes(theme)) {
                return "tuubcast/" + theme;
            }

            continue;
        }
    }

    return "default";
}
