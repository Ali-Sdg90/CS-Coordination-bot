// getData.js

const { getDocs, collection } = require("firebase/firestore");
const { db } = require("../config/firebase");

const fetchData = async () => {
    try {
        const technicalMentorsFetch = await getDocs(
            collection(db, "Technical Mentors")
        );
        const technicalMentorsList = technicalMentorsFetch.docs.map((doc) => ({
            ...doc.data(),
            id: doc.id,
        }));

        const csharpInternsFetch = await getDocs(collection(db, "C# Interns"));
        const CSharpInternsList = csharpInternsFetch.docs.map((doc) => ({
            ...doc.data(),
            id: doc.id,
        }));

        const mlInternsFetch = await getDocs(collection(db, "ML Interns"));
        const MLInternsList = mlInternsFetch.docs.map((doc) => ({
            ...doc.data(),
            id: doc.id,
        }));

        const webInternsFetch = await getDocs(collection(db, "Web Interns"));
        const WebInternsList = webInternsFetch.docs.map((doc) => ({
            ...doc.data(),
            id: doc.id,
        }));

        return {
            technicalMentorsList,
            CSharpInternsList,
            MLInternsList,
            WebInternsList,
        };
    } catch (error) {
        console.error("ERROR>>", error.message);
        throw error;
    }
};

module.exports = {
    fetchData,
};
