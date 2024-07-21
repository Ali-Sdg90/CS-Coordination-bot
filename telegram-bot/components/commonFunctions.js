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

module.exports = {
    addNewMemberOptions,
};
