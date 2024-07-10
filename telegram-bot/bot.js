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

const showUpdateNewMember = (chatId) => {
    const entriesObj = Object.entries(newMemberObject);
    let outputStr = "";
    entriesObj.map(
        (row) =>
            (outputStr += `${row[0] === "id" ? "Name in English" : row[0]}: ${
                row[1]
            }\n`)
    );
    // console.log(outputStr);
    bot.sendMessage(chatId, outputStr);
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

        if (admins.includes(username)) {
            isAdminUsingApp = true;
        } else {
            isAdminUsingApp = false;
        }

        if (isAdminUsingApp) {
            if (userStates[chatId] && userStates[chatId].state) {
                switch (userStates[chatId].state) {
                    case "Add NameEN":
                        newMemberObject = { ...newMemberObject, id: text };
                        showUpdateNewMember(chatId);

                        break;
                    case "Add NameFA":
                        newMemberObject = {
                            ...newMemberObject,
                            ["Name in Persian"]: text,
                        };
                        showUpdateNewMember(chatId);

                        break;
                    case "Add Course":
                        newMemberObject = {
                            ...newMemberObject,
                            Course: text,
                        };
                        showUpdateNewMember(chatId);

                        break;
                    case "Add TelegramID":
                        newMemberObject = {
                            ...newMemberObject,
                            ["Telegram ID"]: text,
                        };
                        showUpdateNewMember(chatId);

                        break;
                    default:
                        break;
                }
                userStates[chatId].state = "";
            }

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

                case "Update Step 0 Message":
                case "Back to Step 0 Actions Menu":
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

                case "Add New Member":
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
                    break;

                case "Technical Mentor":
                case "C# Intern":
                case "ML Intern":
                case "Web Intern":
                    bot.sendMessage(chatId, "Write members' name in English");
                    userStates[chatId] = {
                        state: "Add NameEN",
                    };
                    break;

                default:
                    bot.sendMessage(
                        chatId,
                        `Unknown Command
Use /start command to restart the bot`
                    );
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
