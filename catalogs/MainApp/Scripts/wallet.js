Wallet = (function() {
    return {
        __transaction:null,
        __max_wrong_count:5,
        __pin_to_confirm:null
    };
})();

Wallet.account = require("account"); 
Wallet.upbit   = require("upbit");

Wallet.register_pin = function(handler) {
    Wallet.__transaction = {
        "action":"register_pin",
        "handler":handler
    };

    Wallet.__register_pin();
}

Wallet.reset_pin_force = function(handler) {
    Wallet.__transaction = {
        "action":"reset_pin_force",
        "handler":handler
    };

    Wallet.__reset_pin_force();
}

Wallet.is_pin_registered = function() {
    if (Wallet.account.active_key_enabled()) {
        return true;
    }

    return false;
}

Wallet.verify_pin = function(message, handler) {
    Wallet.__transaction = {
        "action":"verify_pin",
        "message":message,
        "handler":handler
    };

    Wallet.__start_verify();
}

Wallet.transfer = function(to, coin, amount, memo, handler) {
    amount = amount.toFixed(3) + " " + coin;

    Wallet.__transaction = {
        "action":"transfer",
        "to":to,
        "amount":amount,
        "memo":memo,
        "handler":handler
    };

    if (Wallet.account.active_key_enabled()) {
        Wallet.__start_transfer(to, amount);
    } else {
        Wallet.__prompt_reset_pin();
    }
}

Wallet.delegate = function(to, amount, handler) {
    amount = amount.toFixed(3) + " " + "SP";

    Wallet.__transaction = {
        "action":"delegate",
        "to":to,
        "amount":amount,
        "handler":handler
    };

    if (Wallet.account.active_key_enabled()) {
        Wallet.__start_delegate(to, amount);
    } else {
        Wallet.__prompt_reset_pin();
    }
}

Wallet.power_up = function(amount, handler) {
    amount = amount.toFixed(3) + " " + "STEEM";

    Wallet.__transaction = {
        "action":"power_up",
        "amount":amount,
        "handler":handler
    };

    if (Wallet.account.active_key_enabled()) {
        Wallet.__start_power_up(amount);
    } else {
        Wallet.__prompt_reset_pin();
    }
}

Wallet.power_down = function(amount, handler) {
    amount = amount.toFixed(3) + " " + "SP";

    Wallet.__transaction = {
        "action":"power_down",
        "amount":amount,
        "handler":handler
    };

    if (Wallet.account.active_key_enabled()) {
        Wallet.__start_power_down(amount);
    } else {
        Wallet.__prompt_reset_pin();
    }
}

Wallet.redeem_rewards = function(handler) {
    Wallet.__transaction = {
        "action":"redeem_rewards",
        "handler":handler
    };

    Wallet.__confirm_redeem();
}

Wallet.get_coin_price = function(currency, coin, handler) {
    Wallet.upbit.get_candles(currency, coin, 1, function(candles) {
        if (candles) {
            handler(candles[0]["tradePrice"]);
        } else {
            handler();
        }
    });
}

Wallet.update_account_data = function(user) {
    controller.catalog().submit("showcase", "auxiliary", "S_WALLET.ACCOUNT", {
        "username":user.name,
        "reputation":user.get_reputation().toFixed(1).toString(),
        "post-count":user.get_post_count().toString(),
        "following-count":user.get_following_count().toString(),
        "follower-count":user.get_follower_count().toString(),
        "reward-steem-balance":user.get_reward_steem_balance().toFixed(3).toString(),
        "reward-steem-power":user.get_reward_steem_power().toFixed(3).toString(),
        "reward-sbd-balance":user.get_reward_sbd_balance().toFixed(3).toString(),
        "has-rewards":user.has_rewards() ? "yes" : "no"
    });
}

Wallet.get_account_data = function() {
    return controller.catalog().value("showcase", "auxiliary", "S_WALLET.ACCOUNT");
}

Wallet.update_assets_data = function(user) {
    controller.catalog().submit("showcase", "auxiliary", "S_WALLET.ASSETS", {
        "steem-balance":user.get_steem_balance().toFixed(3).toString(),
        "steem-power":user.get_steem_power().toFixed(3).toString(),
        "sbd-balance":user.get_sbd_balance().toFixed(3).toString()
    });
}

Wallet.get_assets_data = function() {
    return controller.catalog().value("showcase", "auxiliary", "S_WALLET.ASSETS");
}

Wallet.is_rewards_changed = function(user) {
    var value = controller.catalog().value("showcase", "auxiliary", "S_WALLET.ACCOUNT");

    if (parseFloat(value["reward-steem-balance"]) != user.get_reward_steem_balance().toFixed(3)) {
        return true;
    }

    if (parseFloat(value["reward-steem-power"]) != user.get_reward_steem_power().toFixed(3)) {
        return true;
    }

    if (parseFloat(value["reward-sbd-balance"]) != user.get_reward_sbd_balance().toFixed(3)) {
        return true;
    }

    return false;
}

Wallet.is_assets_changed = function(user) {
    var value = controller.catalog().value("showcase", "auxiliary", "S_WALLET.ASSETS");

    if (parseFloat(value["steem-balance"]) != user.get_steem_balance().toFixed(3)) {
        return true;
    }

    if (parseFloat(value["steem-power"]) != user.get_steem_power().toFixed(3)) {
        return true;
    }

    if (parseFloat(value["sbd-balance"]) != user.get_sbd_balance().toFixed(3)) {
        return true;
    }

    return false;
}

Wallet.__register_pin = function() {
    controller.catalog().submit("showcase", "auxiliary", "S_PIN", {
        "title":"PIN번호 설정",
        "message":"송금, 임대 등에 사용할 PIN번호를 설정하세요.",
        "status":"normal",
        "close-disabled":"yes",
        "reset-disabled":"yes",
        "skip-enabled":"yes",
        "script":"Wallet.__on_receive_pin"
    });

    controller.action("popup", { "display-unit":"S_PIN" });
}

Wallet.__start_verify = function() {
    var wrong_count = storage.value("WALLET.WRONG_PIN_COUNT") || 0;
    
    if (wrong_count < Wallet.__max_wrong_count) {
        Wallet.__confirm_verify();
    } else {
        Wallet.__on_exceed_max_wrong_count();
    }
}

Wallet.__confirm_verify = function() {
    controller.catalog().submit("showcase", "auxiliary", "S_PIN", {
        "title":"PIN번호 입력",
        "message":Wallet.__transaction["message"],
        "status":"normal",
        "script":"Wallet.__on_receive_pin",
        "reset":"Wallet.__on_confirm_reset_pin"
    });

    controller.action("popup", { "display-unit":"S_PIN" });
}

Wallet.__start_transfer = function(to, amount) {
    var wrong_count = storage.value("WALLET.WRONG_PIN_COUNT") || 0;
    
    if (wrong_count < Wallet.__max_wrong_count) {
        Wallet.__confirm_transfer(to, amount);
    } else {
        Wallet.__on_exceed_max_wrong_count();
    }
}

Wallet.__confirm_transfer = function(to, amount) {
    controller.catalog().submit("showcase", "auxiliary", "S_PIN", {
        "title":"PIN번호 입력",
        "message":"PIN번호를 입력하면\\n=[amount|" + amount + "]=를 송금합니다.",
        "status":"normal",
        "script":"Wallet.__on_receive_pin",
        "reset":"Wallet.__on_confirm_reset_pin"
    });

    controller.action("popup", { "display-unit":"S_PIN" });
}

Wallet.__start_delegate = function(to, amount) {
    var wrong_count = storage.value("WALLET.WRONG_PIN_COUNT") || 0;
    
    if (wrong_count < Wallet.__max_wrong_count) {
        Wallet.__confirm_delegate(to, amount);
    } else {
        Wallet.__on_exceed_max_wrong_count();
    }
}

Wallet.__confirm_delegate = function(to, amount) {
    controller.catalog().submit("showcase", "auxiliary", "S_PIN", {
        "title":"PIN번호 입력",
        "message":"PIN번호를 입력하면\\n=[amount|" + amount + "]=를 임대합니다.",
        "status":"normal",
        "script":"Wallet.__on_receive_pin",
        "reset":"Wallet.__on_confirm_reset_pin"
    });

    controller.action("popup", { "display-unit":"S_PIN" });
}

Wallet.__start_power_up = function(amount) {
    var wrong_count = storage.value("WALLET.WRONG_PIN_COUNT") || 0;
    
    if (wrong_count < Wallet.__max_wrong_count) {
        Wallet.__confirm_power_up(amount);
    } else {
        Wallet.__on_exceed_max_wrong_count();
    }
}

Wallet.__confirm_power_up = function(amount) {
    controller.catalog().submit("showcase", "auxiliary", "S_PIN", {
        "title":"PIN번호 입력",
        "message":"PIN번호를 입력하면\\n=[amount|" + amount + "]=를 파워업합니다.",
        "status":"normal",
        "script":"Wallet.__on_receive_pin",
        "reset":"Wallet.__on_confirm_reset_pin"
    });

    controller.action("popup", { "display-unit":"S_PIN" });
}

Wallet.__start_power_down = function(amount) {
    var wrong_count = storage.value("WALLET.WRONG_PIN_COUNT") || 0;
    
    if (wrong_count < Wallet.__max_wrong_count) {
        Wallet.__confirm_power_down(amount);
    } else {
        Wallet.__on_exceed_max_wrong_count();
    }
}

Wallet.__confirm_power_down = function(amount) {
    controller.catalog().submit("showcase", "auxiliary", "S_PIN", {
        "title":"PIN번호 입력",
        "message":"PIN번호를 입력하면\\n=[amount|" + amount + "]=를 파워다운합니다.",
        "status":"normal",
        "script":"Wallet.__on_receive_pin",
        "reset":"Wallet.__on_confirm_reset_pin"
    });

    controller.action("popup", { "display-unit":"S_PIN" });
}

Wallet.__confirm_redeem = function() {
    controller.catalog().submit("showcase", "auxiliary", "S_REDEEM.TASK", {
        "status":"confirm",
        "script":"Wallet.__redeem_rewards"
    });

    controller.action("popup", { "display-unit":"S_REDEEM.TASK" });
}

Wallet.__redeem_rewards = function() {
    Wallet.account.claim_rewards(function(response) {
        controller.catalog().submit("showcase", "auxiliary", "S_REDEEM.TASK", {
            "status":response ? "done" : "failed"
        });

        controller.action("popup", { "display-unit":"S_REDEEM.TASK" });

        if (Wallet.__transaction["handler"]) {
            Wallet.__transaction["handler"](response);
        }

        Wallet.__transaction = null;
    });

    controller.catalog().submit("showcase", "auxiliary", "S_REDEEM.TASK", {
        "status":"progress"
    });

    controller.action("popup", { "display-unit":"S_REDEEM.TASK" });
}

Wallet.__confirm_pin = function() {
    controller.catalog().submit("showcase", "auxiliary", "S_PIN", {
        "title":"PIN번호 설정",
        "message":"PIN번호를 다시 입력하세요.",
        "status":"normal",
        "reset-disabled":"yes",
        "skip-enabled":"yes",
        "script":"Wallet.__on_receive_pin_again"
    });

    controller.action("popup", { "display-unit":"S_PIN" });
}

Wallet.__on_receive_pin = function() {
    var action = Wallet.__transaction["action"];
    var wrong_count = storage.value("WALLET.WRONG_PIN_COUNT") || 0;
    var pin = document.value("WALLET.PIN");

    if (action !== "register_pin" && action !== "reset_pin_force") {
        if (Wallet.account.verify_pin(pin)) {
            Wallet.__process_transaction(pin);
 
            storage.value("WALLET.WRONG_PIN_COUNT", 0);
        } else {
            if (wrong_count + 1 < Wallet.__max_wrong_count) {
                Wallet.__retry_confirm_transfer(wrong_count + 1);
            } else {
                Wallet.__on_exceed_max_wrong_count();
            }
            
            storage.value("WALLET.WRONG_PIN_COUNT", wrong_count + 1);
        }
    } else {
        Wallet.__pin_to_confirm = document.value("WALLET.PIN");

        if (!Wallet.__pin_to_confirm) {
            if (Wallet.__transaction["handler"]) {
                Wallet.__transaction["handler"]();
            }
    
            Wallet.__transaction = null;
        } else {
            Wallet.__confirm_pin();
        }
    }
}

Wallet.__on_receive_pin_again = function() {
    var pin = document.value("WALLET.PIN");

    if (pin && pin === Wallet.__pin_to_confirm) {
        if (Wallet.__transaction["handler"]) {
            Wallet.__transaction["handler"](pin);
        }

        if (Wallet.__transaction["pin_handler"]) {
            Wallet.__transaction["pin_handler"](pin);
        }
    
        document.value("WALLET.PIN", "");

        Wallet.__pin_to_confirm = null;
        Wallet.__transaction = null;
    } else {
        if (pin) {
            controller.catalog().submit("showcase", "auxiliary", "S_PIN", {
                "title":"PIN번호 설정",
                "message":"PIN번호가 일치하지 않습니다.\\n송금, 임대 등에 사용할 PIN번호를 입력하세요.",
                "status":"error",
                "close-disabled":"yes",
                "reset-disabled":"yes",
                "skip-enabled":"yes",
                "script":"Wallet.__on_receive_pin"
            });

            controller.action("popup", { "display-unit":"S_PIN" });
        } else {
            if (Wallet.__transaction["handler"]) {
                Wallet.__transaction["handler"]();
            }

            if (Wallet.__transaction["pin_handler"]) {
                Wallet.__transaction["pin_handler"]();
            }
        }
    }
}

Wallet.__retry_confirm_transfer = function(wrong_count) {
    controller.catalog().submit("showcase", "auxiliary", "S_PIN", {
        "title":"PIN번호 입력",
        "message":"PIN번호를 잘못 입력했습니다.\\n다시 PIN번호를 입력하세요.\\n(현재 " + wrong_count + "회 틀림 / " + Wallet.__max_wrong_count  + "회 연속 틀리면 PIN번호를 재설정해야 합니다.)",
        "status":"error",
        "script":"Wallet.__on_receive_pin"
    });

    controller.action("popup", { "display-unit":"S_PIN" });
}

Wallet.__on_exceed_max_wrong_count = function() {
    Wallet.__transaction = {
        "action":"reset_pin_force",
        "handler":function(pin) {
            if (pin) {
                controller.action("toast", {
                    "message":"PIN번호가 등록되었습니다.",
                    "close-popup":"yes"
                });

                storage.value("WALLET.WRONG_PIN_COUNT", 0);
            } else {
                controller.action("popup-close");
            }
        }
    };

    Wallet.__reset_pin_for_wrong(Wallet.__max_wrong_count)
}

Wallet.__prompt_reset_pin = function() {
    controller.action("prompt", {
        "title": "알림",
        "message": "송금이나 임대를 하시려면 먼저 PIN번호를 설정해주세요.",
        "has-cancel-button": "yes",
        "button-1": "PIN 설정하기;script;script=Wallet.__on_confirm_reset_pin"
    });
}

Wallet.__on_confirm_reset_pin = function() {
    Wallet.__transaction = {
        "action":"reset_pin_force",
        "handler":function(pin) {
            if (pin) {
                controller.action("toast", {
                    "message":"PIN번호가 등록되었습니다.",
                    "close-popup":"yes"
                });
            } else {
                controller.action("popup-close");
            }
        }
    };

    Wallet.__reset_pin_force();
}

Wallet.__reset_pin_for_wrong = function(wrong_count) {
    controller.catalog().submit("showcase", "auxiliary", "S_RESET_PIN", {
        "title": "PIN번호 재설정",
        "message":wrong_count + "회 연속 PIN번호를 잘못 입력하여 사용 중지됐습니다. 다시 사용하려면 스팀 비밀번호 혹은 액티브 키를 입력하여 PIN번호를 재설정해야 합니다.",
        "btn-message":"PIN번호 재설정",
        "script":"Wallet.__on_reset_pin"
    });

    controller.action("popup", { "display-unit":"S_RESET_PIN" });
}

Wallet.__reset_pin_force = function() {
    controller.catalog().submit("showcase", "auxiliary", "S_RESET_PIN", {
        "title": "PIN번호 설정",
        "message": "PIN 번호 설정을 위해 스팀 비밀번호 혹은 액티브 키를 입력해주세요.",
        "btn-message":"PIN번호 설정",
        "script":"Wallet.__on_reset_pin"
    });

    controller.action("popup", { "display-unit":"S_RESET_PIN" });
}

Wallet.__on_reset_pin = function(form) {  
    controller.action("freeze", { message:"확인 중..." });

    Wallet.account.enable_active_key(form["password"].trim(), function(keys, handler) {
        if (!keys) {
            controller.action("alert", { message:"비밀번호 혹은 액티브 키가 일치하지 않습니다." });
            controller.action("unfreeze");
    
            return;
        }

        controller.action("unfreeze");

        Wallet.__transaction["pin_handler"] = handler;
        Wallet.__register_pin();
    });
}

Wallet.__process_transaction = function(pin) {
    if (Wallet.__transaction["action"] == "verify_pin") {
        Wallet.__process_verify_pin(Wallet.__transaction, pin);

        return;
    }

    if (Wallet.__transaction["action"] == "transfer") {
        Wallet.__process_transfer(Wallet.__transaction, pin);

        return;
    }

    if (Wallet.__transaction["action"] == "delegate") {
        Wallet.__process_delegate(Wallet.__transaction, pin);

        return;
    }

    if (Wallet.__transaction["action"] == "power_up") {
        Wallet.__process_power_up(Wallet.__transaction, pin);

        return;
    }

    if (Wallet.__transaction["action"] == "power_down") {
        Wallet.__process_power_down(Wallet.__transaction, pin);

        return;
    }
}

Wallet.__process_verify_pin = function(transaction, pin) {
    if (transaction["handler"]) {
        transaction["handler"](pin);
    }

    controller.action("popup-close");
}

Wallet.__process_transfer = function(transaction, pin) {
    var to     = transaction["to"];
    var amount = transaction["amount"];
    var memo   = transaction["memo"] || "";

    Wallet.account.transfer(to, amount, memo, pin, function(response) {
        controller.catalog().submit("showcase", "auxiliary", "S_TRANSFER.TASK", {
            "status":response ? "done" : "failed"
        });

        controller.action("popup", { "display-unit":"S_TRANSFER.TASK" });

        if (transaction["handler"]) {
            transaction["handler"](response);
        }
    });

    controller.catalog().submit("showcase", "auxiliary", "S_TRANSFER.TASK", {
        "status":"progress"
    });

    controller.action("popup", { "display-unit":"S_TRANSFER.TASK" });
}

Wallet.__process_delegate = function(transaction, pin) {
    var to     = transaction["to"];
    var amount = transaction["amount"];

    Wallet.account.delegate_vesting(to, amount, pin, function(response) {
        controller.catalog().submit("showcase", "auxiliary", "S_DELEGATE.TASK", {
            "status":response ? "done" : "failed"
        });

        controller.action("popup", { "display-unit":"S_DELEGATE.TASK" });

        if (transaction["handler"]) {
            transaction["handler"](response);
        }
    });

    controller.catalog().submit("showcase", "auxiliary", "S_DELEGATE.TASK", {
        "status":"progress"
    });

    controller.action("popup", { "display-unit":"S_DELEGATE.TASK" });
}

Wallet.__process_power_up = function(transaction, pin) {
    var amount = transaction["amount"];

    Wallet.account.transfer_to_vesting("", amount, pin, function(response) {
        controller.catalog().submit("showcase", "auxiliary", "S_POWER_UP.TASK", {
            "status":response ? "done" : "failed"
        });

        controller.action("popup", { "display-unit":"S_POWER_UP.TASK" });

        if (transaction["handler"]) {
            transaction["handler"](response);
        }
    });

    controller.catalog().submit("showcase", "auxiliary", "S_POWER_UP.TASK", {
        "status":"progress"
    });

    controller.action("popup", { "display-unit":"S_POWER_UP.TASK" });
}

Wallet.__process_power_down = function(transaction, pin) {
    var amount = transaction["amount"];

    Wallet.account.withdraw_vesting(amount, pin, function(response) {
        controller.catalog().submit("showcase", "auxiliary", "S_POWER_DOWN.TASK", {
            "status":response ? "done" : "failed"
        });

        controller.action("popup", { "display-unit":"S_POWER_DOWN.TASK" });

        if (transaction["handler"]) {
            transaction["handler"](response);
        }
    });

    controller.catalog().submit("showcase", "auxiliary", "S_POWER_DOWN.TASK", {
        "status":"progress"
    });

    controller.action("popup", { "display-unit":"S_POWER_DOWN.TASK" });
}

Wallet.__get_steem_balance = function(handler) {

}

Wallet.__get_sbd_balance = function(handler) {
    
}

__MODULE__ = Wallet;
