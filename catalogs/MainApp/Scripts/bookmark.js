Bookmark = (function() {
    return {};
})();

Bookmark.add = function(username, author, permlink, data) {
    var catalog = controller.catalog();
    var name = Bookmark.name(username);
    var identifier = Bookmark.identifier(username, author, permlink);

    catalog.submit("showcase", name, identifier, data);
}

Bookmark.remove = function(username, author, permlink) {
    var catalog = controller.catalog();
    var name = Bookmark.name(username);
    var identifier = Bookmark.identifier(username, author, permlink);

    catalog.remove("showcase", name, identifier);
}

Bookmark.marked = function(username, author, permlink) {
    var catalog = controller.catalog();
    var name = Bookmark.name(username);
    var identifier = Bookmark.identifier(username, author, permlink);

    var mark = catalog.value("showcase", name, identifier);

    if (mark) {
        return true;
    }

    return false;
}

Bookmark.count = function(username) {
    var catalog = controller.catalog();
    var name = Bookmark.name(username);

    return catalog.count("showcase", name, null, null);
}

Bookmark.list = function(username, location, length) {
    var catalog = controller.catalog();
    var name = Bookmark.name(username);
    var count = Bookmark.count(username);

    if (count > 0) {
        console.log("!!!!!!!!!!!!!!" + location + length)
        if (location && length) {
            return catalog.values("showcase", name, null, [location, length]);
        }

        return catalog.values("showcase", name, null, [0, count]);
    }

    return [];
}

Bookmark.identifier = function(username, author, permlink) {
    return "S_" + Bookmark.name(username) + "_" + author + "_" + permlink;
}

Bookmark.name = function(username) {
    return "bookmark@" + username;
}

__MODULE__ = Bookmark;
