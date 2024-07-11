const numbersFA = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

const addMembersToList = (courseList) => {
    return courseList
        .map((member, index) => {
            // console.log(
            //     `${(index + 1)
            //         .toString()
            //         .split("")
            //         .map((char) => numbersFA[char])
            //         .toString()
            //         .replace(/,/g, "")}. ${member["Name in Persian"]} ${
            //         member["Telegram ID"]
            //     }`
            // );

            return `  ${(index + 1)
                .toString()
                .split("")
                .map((char) => numbersFA[char])
                .toString()
                .replace(/,/g, "")}. ${member["Name in Persian"]} ${
                member["Telegram ID"]
            }`;
        })
        .toString()
        .replace(/,/g, "\n");
};

const sortNames = (list) => {
    list.sort((a, b) => {
        let nameA = a.id.toLowerCase();
        let nameB = b.id.toLowerCase();
        if (nameA < nameB) return -1;
        if (nameA > nameB) return 1;
        return 0;
    });

    // console.log(list); //Temp
    return list;
};

const showList = (data) => {
    let {
        technicalMentorsList,
        CSharpInternsList,
        MLInternsList,
        WebInternsList,
    } = data;

    technicalMentorsList = sortNames(technicalMentorsList);
    CSharpInternsList = sortNames(CSharpInternsList);
    MLInternsList = sortNames(MLInternsList);
    WebInternsList = sortNames(WebInternsList);

    const output = `سلام وقت بخیر
        
اینترن‌های تازه‌ وارد به برنامه لازم است طبق داکیومنت استپ صفر تسکی با عنوان «برگزاری جلسه مصاحبه با اعضای برنامه» را انجام دهند. هدف این تسک آشنایی اینترن‌های جدید با محیط و افراد حاضر در برنامه است.

طبق این تسک، اینترن‌های استپ صفر لازم است با سه گروه از اعضای برنامه آشنا شوند:
  ۱. تمام منتورهای فنی برنامه
  ۲. تمام اینترن‌های هم‌دوره‌ای
  ۳. کوردینیتور خود اینترن

لیست تمام منتورهای فنی برنامه و اینترن‌های دوره‌های مختلف در این پیام آورده شده تا اینترن‌های استپ صفر بتونن به راحتی به لیست افرادی که لازم است با آنها مصاحبه داشته باشند، دسترسی پیدا کنند.

🔷 لیست منتورهای فنی‌ برنامه:
${addMembersToList(technicalMentorsList)}

🔶 لیست اینترن‌های دوره سی‌شارپ:
${addMembersToList(CSharpInternsList)}

🔶 لیست اینترن‌های دوره یادگیری ماشین:
${addMembersToList(MLInternsList)}

🔶 لیست اینترن‌های دوره وب:
${addMembersToList(WebInternsList)}

این پیام با تغییر افراد برنامه آپدیت خواهد شد.

برنامه ادیت پیام:
https://ali-sdg90.github.io/CS-Step0-Message-Maker/

موفق باشین🌱`;

    return output;
};

module.exports = { showList };
