var steemjs = require("steemjs");
var replies = require("replies");

function feed_replies(keyword, location, length, sortkey, sortorder, handler) {
    var value = controller.catalog().value("showcase", "auxiliary", "S_REPLIES");

    if (location == 0) {
        steemjs.get_content_replies(value["author"], value["permlink"]).then(function(response) {
            var data = [];

            response.forEach(function(entry) {
                console.log(JSON.stringify(entry));
                var reply = replies.create(entry);

                data.push({
                    "id":"S_REPLIES_" + value["author"] + "_" + value["permlink"] + "_" + reply.data["author"],
                    "author":reply.data["author"], 
                    "userpic-url":reply.get_userpic_url("small"),
                    "body":reply.data["body"],
                    "payout-value":"$" + reply.get_payout_value().toFixed(2).toString(),
                    "created-at":reply.data["created"],
                });
            });

            handler(data);
        });                
    } else {
        handler();
    }
}
