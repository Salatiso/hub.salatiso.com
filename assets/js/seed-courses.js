// /assets/js/seed-courses.js
// IMPORTANT: This is a one-time use script.
// Run this from your browser's console on any page of hub.salatiso.com
// where firebase-config.js is loaded to populate the initial courses.

async function seedCoursesToFirestore() {
    if (typeof firebase === 'undefined' || typeof firebase.firestore === 'undefined') {
        console.error("Firebase is not initialized.");
        alert("Firebase not ready. Make sure you are on a page where Firebase is loaded.");
        return;
    }

    const db = firebase.firestore();
    const batch = db.batch();

    console.log("Starting to seed courses...");

    // This is a sample of your courses from flamea.org/training.
    // You should expand this list to include ALL your courses and games.
    const coursesToSeed = [
        {
            title: "The Ancestors Within",
            description: "Exploring the cultural and spiritual significance of ancestors in family structures.",
            category: "Culture & Heritage",
            audience: "adults",
            type: "course",
            link: "../flamea.org/training/course-ancestors-within.html",
            imageUrl: "../flamea.org/assets/images/know_yourself.jpg"
        },
        {
            title: "The Children's Act",
            description: "A comprehensive guide to the South African Children's Act 38 of 2005.",
            category: "Legal & Rights",
            audience: "adults",
            type: "course",
            link: "../flamea.org/training/course-childrens-act.html",
            imageUrl: "" // Will be auto-generated
        },
        {
            title: "Co-Parenting Essentials",
            description: "Strategies and best practices for effective and harmonious co-parenting.",
            category: "Family & Parenting",
            audience: "adults",
            type: "course",
            link: "../flamea.org/training/course-coparenting.html",
            imageUrl: "" // Will be auto-generated
        },
        {
            title: "The Constitution",
            description: "Understand your rights and responsibilities under the South African Constitution.",
            category: "Legal & Rights",
            audience: "adults",
            type: "course",
            link: "../flamea.org/training/course-constitution.html",
            imageUrl: "" // Will be auto-generated
        },
        {
            title: "Kid's Rights Shield",
            description: "An interactive course for children to learn about their rights in a fun way.",
            category: "Legal & Rights",
            audience: "children",
            type: "course",
            link: "../flamea.org/training/course_kids-rights_shield.html",
            imageUrl: "" // Will be auto-generated
        },
        {
            title: "Constitution Champions",
            description: "A fun game for kids to learn the basics of the constitution.",
            category: "Legal & Rights",
            audience: "children",
            type: "game",
            link: "../flamea.org/games/constitution-champions.html",
            imageUrl: "" // Will be auto-generated
        },
        {
            title: "Customs & Consequences",
            description: "Learn about cultural customs and their legal implications in modern society.",
            category: "Culture & Heritage",
            audience: "adults",
            type: "customs",
            link: "../flamea.org/customs.html",
            imageUrl: "" // Will be auto-generated
        }
        // Add all other courses and games here in the same format
    ];

    let count = 0;
    coursesToSeed.forEach(course => {
        // Create a new document reference in the 'courses' collection
        const courseRef = db.collection("courses").doc();
        batch.set(courseRef, course);
        count++;
    });

    try {
        await batch.commit();
        const message = `Successfully seeded ${count} courses to Firestore.`;
        console.log(message);
        alert(message);
    } catch (error) {
        const errorMessage = "Error seeding courses. Check the console for details. This might be due to Firestore security rules not allowing writes.";
        console.error("Error seeding courses: ", error);
        alert(errorMessage);
    }
}

// To run this, open your browser's developer console and type: seedCoursesToFirestore()
