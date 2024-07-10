let technicalMentorsList = [];
let CSharpInternsList = [];
let MLInternsList = [];
let WebInternsList = [];

const fetchData = async () => {
    try {
        const technicalMentorsFetch = await getDocs(
            collection(db, "Technical Mentors")
        );

        const technicalMentorsData = technicalMentorsFetch.docs.map((doc) => ({
            ...doc.data(),
            id: doc.id,
        }));

        technicalMentorsList = technicalMentorsData;

        // -------------

        const csharpInternsFetch = await getDocs(collection(db, "C# Interns"));
        const csharpInternsData = csharpInternsFetch.docs.map((doc) => ({
            ...doc.data(),
            id: doc.id,
        }));

        CSharpInternsList = csharpInternsData;

        // -------------

        const mlInternsFetch = await getDocs(collection(db, "ML Interns"));
        const mlInternsData = mlInternsFetch.docs.map((doc) => ({
            ...doc.data(),
            id: doc.id,
        }));

        MLInternsList = mlInternsData;

        // -------------

        const webInternsFetch = await getDocs(collection(db, "Web Interns"));
        const webInternsData = webInternsFetch.docs.map((doc) => ({
            ...doc.data(),
            id: doc.id,
        }));

        WebInternsList = webInternsData;
    } catch (error) {
        setErrorMsg(error.message);
    }
};
