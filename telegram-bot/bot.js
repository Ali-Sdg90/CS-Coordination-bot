require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");

const { db } = require("./config/firebase");
const { setDoc, doc } = require("firebase/firestore");
const { admins } = require("./config/admins");
const { fetchData } = require("./components/getData");

const token = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

const userStates = {};

let isAdminUsingApp = false;

let newMemberObject = {
    Course: "",
    ["Name in Persian"]: "",
    ["Telegram ID"]: "",
    id: "",
};

const resetBot = (chatId) => {
    userStates[chatId] = {};

    newMemberObject = {
        Course: "",
        ["Name in Persian"]: "",
        ["Telegram ID"]: "",
        id: "",
    };

    bot.sendMessage(
        chatId,
        `Unknown Command
Use /start command to restart the bot`
    );
};

const showUpdateNewMember = (chatId) => {
    const entriesObj = Object.entries(newMemberObject);
    let outputStr = "New Members' information: \n\n";
    entriesObj.map(
        (row) =>
            (outputStr += `${
                row[0] === "id"
                    ? "Full Name in English"
                    : row[0] === "Name in Persian"
                    ? "Full Name in Farsi"
                    : row[0]
            }: ${row[1] ? row[1] : "-"}\n`)
    );
    bot.sendMessage(chatId, outputStr);
};

const removeKeyboard = {
    reply_markup: {
        remove_keyboard: true,
    },
};

fetchData().then((data) => {
    const {
        technicalMentorsList,
        CSharpInternsList,
        MLInternsList,
        WebInternsList,
    } = data;

    bot.on("message", async (msg) => {
        const chatId = msg.chat.id;
        const text = msg.text;
        const username = msg.from.username;

        if (!Object.keys(userStates).length) {
            userStates[chatId] = {};
        }

        if (admins.includes(username)) {
            isAdminUsingApp = true;
        } else {
            isAdminUsingApp = false;
        }

        if (isAdminUsingApp) {
            //
            // Add New Member
            //
            if (userStates[chatId] && userStates[chatId].state) {
                switch (userStates[chatId].state) {
                    case "Add Course": // 1
                        if (
                            text === "Technical Mentor" ||
                            text === "C# Intern" ||
                            text === "ML Intern" ||
                            text === "Web Intern"
                        ) {
                            newMemberObject = {
                                ...newMemberObject,
                                Course: text,
                            };
                            showUpdateNewMember(chatId);

                            bot.sendMessage(
                                chatId,
                                "Write members' full name in Farsi",
                                removeKeyboard
                            );
                            userStates[chatId] = {
                                state: "Add NameFA",
                            };
                        } else {
                            userStates[chatId] = {};
                        }

                        break;

                    case "Add NameFA": // 2
                        newMemberObject = {
                            ...newMemberObject,
                            ["Name in Persian"]: text,
                        };
                        showUpdateNewMember(chatId);

                        bot.sendMessage(chatId, "Write members' Telegram ID");
                        userStates[chatId] = {
                            state: "Add TelegramID",
                        };

                        break;

                    case "Add TelegramID": // 3
                        newMemberObject = {
                            ...newMemberObject,
                            ["Telegram ID"]: text,
                        };
                        showUpdateNewMember(chatId);

                        bot.sendMessage(
                            chatId,
                            "Write members' full name in English"
                        );
                        userStates[chatId] = {
                            state: "Add NameEN",
                        };

                        break;

                    case "Add NameEN": // 4
                        newMemberObject = { ...newMemberObject, id: text };
                        showUpdateNewMember(chatId);

                        const submitNewMember = {
                            reply_markup: {
                                keyboard: [
                                    ["Yes. Add New Member to List"],
                                    ["No. Go Back to First Menu"],
                                ],
                                resize_keyboard: true,
                                one_time_keyboard: true,
                                input_field_placeholder: "Choose an action",
                            },
                        };
                        bot.sendMessage(
                            chatId,
                            "Are new members' information correct?",
                            submitNewMember
                        );
                        userStates[chatId] = {
                            state: "submit list",
                        };

                        break;

                    case "submit list": // 5
                        if (
                            !(
                                text === "Yes. Add New Member to List" ||
                                text === "No. Go Back to First Menu"
                            )
                        ) {
                            userStates[chatId] = {};
                        }

                        break;

                    default:
                        resetBot(chatId);
                        break;
                }
            }
            //
            // Main Bot Action Handler
            //
            switch (text) {
                case "/start":
                case "Back to Main Menu":
                    const mainOptions = {
                        reply_markup: {
                            keyboard: [
                                ["Update Step 0 Message"],
                                ["Coming Soon 1"],
                                ["Coming Soon 2"],
                                ["Coming Soon 3"],
                            ],
                            resize_keyboard: true,
                            one_time_keyboard: true,
                            input_field_placeholder: "Choose a feature",
                        },
                    };
                    bot.sendMessage(
                        chatId,
                        `Hello Admin: ${
                            !!msg.from.first_name ? msg.from.first_name : ""
                        } ${!!msg.from.last_name ? msg.from.last_name : ""}
Please select a feature to use:`,
                        mainOptions
                    );

                    break;

                case "Coming Soon 1":
                case "Coming Soon 2":
                case "Coming Soon 3":
                    bot.sendMessage(chatId, "Coming soon!");
                    break;

                case "Back to Step 0 Actions Menu":
                case "Update Step 0 Message":
                    const updateStep0Options = {
                        reply_markup: {
                            keyboard: [
                                ["Add New Member"],
                                ["Remove Member"],
                                ["Get Latest List Update"],
                                ["Back to Main Menu"],
                            ],
                            resize_keyboard: true,
                            one_time_keyboard: true,
                            input_field_placeholder: "Choose an action",
                        },
                    };
                    bot.sendMessage(
                        chatId,
                        "What action would you like to do?",
                        updateStep0Options
                    );
                    break;

                case "No. Go Back to First Menu":
                case "Add New Member":
                    userStates[chatId] = {};

                    newMemberObject = {
                        Course: "",
                        ["Name in Persian"]: "",
                        ["Telegram ID"]: "",
                        id: "",
                    };

                    const addNewMemberOptions = {
                        reply_markup: {
                            keyboard: [
                                ["Technical Mentor"],
                                ["C# Intern"],
                                ["ML Intern"],
                                ["Web Intern"],
                                ["Back to Step 0 Actions Menu"],
                            ],
                            resize_keyboard: true,
                            one_time_keyboard: true,
                            input_field_placeholder: "Select a list",
                        },
                    };
                    bot.sendMessage(
                        chatId,
                        "Which list would you like to add the new member to?",
                        addNewMemberOptions
                    );

                    userStates[chatId] = {
                        state: "Add Course",
                    };
                    console.log(">>", userStates[chatId]);

                    break;

                case "Yes. Add New Member to List":
                    console.log(newMemberObject);
                    break;

                default:
                    console.log(">>", userStates[chatId]);
                    if (!Object.keys(userStates[chatId]).length) {
                        resetBot(chatId);
                    } else {
                        console.log(userStates[chatId].length);
                    }
            }
        } else {
            bot.sendMessage(chatId, `You are not an Admin!`);
        }

        try {
            await setDoc(
                doc(db, "messages", `${new Date().getTime()} - ${username}`),
                {
                    text: text,
                    username: username,
                    timestamp: new Date(),
                }
            );
            console.log("Document written successfully");
        } catch (e) {
            console.error("Error adding document: ", e);
        }
    });
});

// Error handling
bot.on("polling_error", (error) => {
    console.error(`Polling error: ${error.code} - ${error.message}`);
    if (error.code === "ETELEGRAM") {
        console.error(`Telegram error: ${error.response.body}`);
    }
});

bot.on("webhook_error", (error) => {
    console.error(`Webhook error: ${error.code} - ${error.message}`);
});

console.log("Bot is running...");
