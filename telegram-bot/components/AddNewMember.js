const { collection, doc, setDoc } = require("firebase/firestore");
const { db } = require("../config/firebase");

const addNewMember = async (newMemberObject) => {
    let collectionRef = "";

    switch (newMemberObject.Course) {
        case "Technical Mentor":
            collectionRef = collection(db, "Technical Mentors");
            break;
        case "C# Intern":
            collectionRef = collection(db, "C# Interns");
            break;
        case "ML Intern":
            collectionRef = collection(db, "ML Interns");
            break;
        case "Web Intern":
            collectionRef = collection(db, "Web Interns");
            break;
        default:
            return;
    }

    const newDocRef = doc(collectionRef, newMemberObject.id);

    await setDoc(newDocRef, {
        Course: newMemberObject.Course,
        "Name in Persian": newMemberObject["Name in Persian"],
        "Telegram ID": newMemberObject["Telegram ID"],
    });
};

module.exports = { addNewMember };
