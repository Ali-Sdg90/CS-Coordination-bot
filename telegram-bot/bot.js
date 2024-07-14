require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");

const { db } = require("./config/firebase");
const { setDoc, doc } = require("firebase/firestore");
const { admins } = require("./config/admins");
const { fetchData } = require("./components/getData");
const { addNewMember } = require("./components/AddNewMember");
const { showList } = require("./components/ShowList");

const token = process.env.TELEGRAM_BOT_TOKEN;

const groupId = process.env.GROUP_ID;
const messageThreadId = process.env.MESSAGE_THREAD_ID;
const messageId = process.env.MESSAGE_ID;
const messageLink = process.env.MESSAGE_LINK;

const bot = new TelegramBot(token, { polling: true });

const userStates = {};

let isAdminUsingApp = false;

let newMemberObject = {
    Course: "",
    ["Name in Persian"]: "",
    ["Telegram ID"]: "",
    id: "",
};

let removeMemberObject = {
    Course: "",
    ValidNames: [],
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

// const removeKeyboard = {
//     {
//         reply_markup: JSON.stringify({
//             remove_keyboard: true,
//         }),
//     }
// };

const updateMessageFunc = (chatId) => {
    fetchData().then((data) => {
        const output = showList(data);
        // console.log(output);

        bot.editMessageText(output, {
            chat_id: groupId,
            message_id: messageId,
            message_thread_id: messageThreadId,
        })
            .then(() => {
                bot.sendMessage(chatId, output, {
                    disable_web_page_preview: true,
                }).then(() =>
                    bot
                        .sendMessage(
                            chatId,
                            `Message in the group has been updated successfully🎉\n${messageLink}`
                        )
                        .then(() =>
                            bot.sendMessage(chatId, "Restart Bot: /start")
                        )
                );
            })
            .catch((error) => {
                bot.sendMessage(chatId, `${String(error.message)}`).then(() =>
                    bot.sendMessage(chatId, "Restart Bot: /start")
                );
            });
    });
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
        if (
            userStates[chatId] &&
            userStates[chatId].state &&
            text !== "/start"
        ) {
            switch (userStates[chatId].state) {
                case "Add: Course": // 1.1
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

                        await bot.sendMessage(
                            chatId,
                            "Write members' full name in Farsi",
                            {
                                reply_markup: JSON.stringify({
                                    remove_keyboard: true,
                                }),
                            }
                        );
                        userStates[chatId] = {
                            state: "Add: NameFA",
                        };
                    } else {
                        userStates[chatId] = {};
                    }

                    break;

                case "Add: NameFA": // 1.2
                    newMemberObject = {
                        ...newMemberObject,
                        ["Name in Persian"]: text,
                    };
                    showUpdateNewMember(chatId);

                    bot.sendMessage(chatId, "Write members' Telegram ID");
                    userStates[chatId] = {
                        state: "Add: TelegramID",
                    };

                    break;

                case "Add: TelegramID": // 1.3
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
                        state: "Add: NameEN",
                    };

                    break;

                case "Add: NameEN": // 1.4
                    newMemberObject = { ...newMemberObject, id: text };
                    showUpdateNewMember(chatId);

                    const submitNewMember = {
                        reply_markup: {
                            keyboard: [
                                ["Yes. Add New Member to List"],
                                ["No. Go Back to First Add Menu"],
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
                        state: "Add: Submit list",
                    };

                    break;

                case "Add: Submit list": // 1.5
                    if (
                        !(
                            text === "Yes. Add New Member to List" ||
                            text === "No. Go Back to First Add Menu"
                        )
                    ) {
                        userStates[chatId] = {};
                    }

                    break;

                case "Remove: Course": // 2.1
                    if (
                        text === "Technical Mentor" ||
                        text === "C# Intern" ||
                        text === "ML Intern" ||
                        text === "Web Intern"
                    ) {
                        fetchData().then((data) => {
                            let dateCourse = "";
                            switch (text) {
                                case "Technical Mentor":
                                    dateCourse = "technicalMentorsList";
                                    break;
                                case "C# Intern":
                                    dateCourse = "CSharpInternsList";
                                    break;
                                case "ML Intern":
                                    dateCourse = "MLInternsList";
                                    break;
                                case "Web Intern":
                                    dateCourse = "WebInternsList";
                                    break;
                                default:
                                    break;
                            }

                            const keyboard = data[dateCourse].map((member) => [
                                member.id,
                            ]);

                            removeMemberObject = {
                                ...removeMemberObject,
                                Course: dateCourse,
                                ValidNames: keyboard,
                            };

                            keyboard.push(["Back to Remove Member List"]);

                            bot.sendMessage(
                                chatId,
                                `Select ${text} that you want to remove`,
                                {
                                    reply_markup: {
                                        keyboard: keyboard,
                                        resize_keyboard: true,
                                        one_time_keyboard: true,
                                        input_field_placeholder:
                                            "Select a list",
                                    },
                                }
                            );
                        });

                        userStates[chatId] = {
                            state: "Remove: Member",
                        };
                    } else {
                        userStates[chatId] = {};
                    }
                    break;

                case "Remove: Member": // 2.2
                    console.log(String(removeMemberObject.ValidNames));

                    if (String(removeMemberObject.ValidNames).includes(text)) {
                        fetchData().then((data) => {
                            let sameCourseAsTarget =
                                data[removeMemberObject.Course];

                            const targetedMember = sameCourseAsTarget.filter(
                                (member) => member.id === text
                            );

                            const entriesObj = Object.entries(
                                targetedMember[0]
                            );
                            let outputStr = `Are you sure you want to remove ${targetedMember[0].id}?\n\n`;

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

                            const deletePermission = {
                                reply_markup: {
                                    keyboard: [
                                        [`Yes. Delete Member`],
                                        ["No. Go Back to First Remove Menu"],
                                    ],
                                    resize_keyboard: true,
                                    one_time_keyboard: true,
                                    input_field_placeholder: "Choose a feature",
                                },
                            };

                            bot.sendMessage(
                                chatId,
                                outputStr,
                                deletePermission
                            );

                            removeMemberObject = {
                                ...removeMemberObject,
                                id: targetedMember[0].id,
                            };
                        });
                    } else {
                        userStates[chatId] = {};
                    }

                    break;

                case "Remove: Submit list": // 2.3
                    if (
                        !(
                            text === "Yes. Delete Member" ||
                            text === "No. Go Back to First Remove Menu"
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
                userStates[chatId] = {};

                newMemberObject = {
                    Course: "",
                    ["Name in Persian"]: "",
                    ["Telegram ID"]: "",
                    id: "",
                };

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
                    `Hello ${
                        !!msg.from.first_name ? msg.from.first_name : ""
                    } ${!!msg.from.last_name ? msg.from.last_name : ""}
Please select a feature to use:`,
                    mainOptions
                );

                break;

            case "@CS_Coordination_bot Send Step 0 Message":
                bot.sendMessage(chatId, `Aloha Group :)`, {
                    disable_web_page_preview: true,
                }).then((sentMessage) => {
                    const messageId = sentMessage.message_id;
                    console.log(`Message ID: ${messageId}`);
                });

                break;

            case "Coming Soon 1":
            case "Coming Soon 2":
            case "Coming Soon 3":
                bot.sendMessage(chatId, "Coming soon!\n/start");
                break;

            case "Back to Step 0 Actions Menu":
            case "Update Step 0 Message":
                const updateStep0Options = {
                    reply_markup: {
                        keyboard: [
                            ["Add New Member"],
                            ["Remove Member"],
                            ["Get Latest List Update"],
                            ["Update Group List"],
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

            //
            // Add New Member
            //
            case "No. Go Back to First Add Menu":
            case "Add New Member":
                userStates[chatId] = {};

                newMemberObject = {
                    Course: "",
                    ["Name in Persian"]: "",
                    ["Telegram ID"]: "",
                    id: "",
                };

                bot.sendMessage(
                    chatId,
                    "Which list would you like to add the new member to?",
                    addNewMemberOptions
                );

                userStates[chatId] = {
                    state: "Add: Course",
                };
                console.log(">>", userStates[chatId]);

                break;

            case "Yes. Add New Member to List":
                console.log(newMemberObject);

                if (newMemberObject.id) {
                    console.log(newMemberObject);

                    addNewMember(newMemberObject).then(() => {
                        updateMessageFunc(chatId);
                    }),
                        bot.sendMessage(
                            chatId,
                            `"${newMemberObject.id}" has been added to "${newMemberObject.Course}s" list.`,
                            {
                                reply_markup: JSON.stringify({
                                    remove_keyboard: true,
                                }),
                            }
                        );

                    newMemberObject = {
                        Course: "",
                        ["Name in Persian"]: "",
                        ["Telegram ID"]: "",
                        id: "",
                    };
                } else {
                    resetBot(chatId);
                }

                break;

            //
            // Get List Update
            //
            case "Get Latest List Update":
                fetchData().then((data) => {
                    const output = showList(data);
                    // console.log(output);

                    bot.sendMessage(chatId, output, {
                        disable_web_page_preview: true,
                    }).then(() =>
                        bot.sendMessage(chatId, "Restart Bot: /start")
                    );
                });

                break;

            //
            // Send List Update
            //
            case "Update Group List":
                updateMessageFunc(chatId);

                break;

            //
            // Remove Member
            //
            case "Remove Member":
            case "Back to Remove Member List":
            case "No. Go Back to First Remove Menu":
                bot.sendMessage(
                    chatId,
                    "In which list would you want to remove member?",
                    addNewMemberOptions
                );

                userStates[chatId] = {
                    state: "Remove: Course",
                };

                break;

            case "Yes. Delete Member":
                if (removeMemberObject.id) {
                    console.log(removeMemberObject);
                } else {
                    resetBot(chatId);
                }
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
        bot.sendMessage(
            chatId,
            `Hello ${!!msg.from.first_name ? msg.from.first_name : ""} ${
                !!msg.from.last_name ? msg.from.last_name : ""
            }\nYou are not an Admin!`
        );
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
