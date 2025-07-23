// /assets/js/seed-courses.js
// IMPORTANT: This is a one-time use script.
// Run this from your browser's console on any page of hub.salatiso.com
// where firebase-config.js is loaded to populate the initial courses.
// Make sure you are logged in as an admin if you have security rules set up.

async function seedCoursesToFirestore() {
    if (typeof firebase === 'undefined' || typeof firebase.firestore === 'undefined') {
        console.error("Firebase is not initialized.");
        return;
    }

    const db = firebase.firestore();
    const batch = db.batch();

    console.log("Starting to seed courses...");

    // This is a sample of your courses from flamea.org/training.
    // In a real scenario, you would have a more robust way to get this list,
    // but for this one-time seed, we can define it here.
    const coursesToSeed = [
        {
            title: "The Ancestors Within",
            description: "Exploring the cultural and spiritual significance of ancestors in family structures.",
            category: "Culture & Heritage",
            audience: "adults",
            type: "course",
            link: "/flamea.org/training/course-ancestors-within.html",
            imageUrl: "/flamea.org/assets/images/know_yourself.jpg"
        },
        {
            title: "The Children's Act",
            description: "A comprehensive guide to the South African Children's Act 38 of 2005.",
            category: "Legal & Rights",
            audience: "adults",
            type: "course",
            link: "/flamea.org/training/course-childrens-act.html",
            imageUrl: "https://placehold.co/600x400/e74c3c/ffffff?text=Children's+Act"
        },
        {
            title: "Co-Parenting Essentials",
            description: "Strategies and best practices for effective and harmonious co-parenting.",
            category: "Family & Parenting",
            audience: "adults",
            type: "course",
            link: "/flamea.org/training/course-coparenting.html",
            imageUrl: "https://placehold.co/600x400/2ecc71/ffffff?text=Co-Parenting"
        },
        {
            title: "The Constitution",
            description: "Understand your rights and responsibilities under the South African Constitution.",
            category: "Legal & Rights",
            audience: "adults",
            type: "course",
            link: "/flamea.org/training/course-constitution.html",
            imageUrl: "https://placehold.co/600x400/f1c40f/ffffff?text=The+Constitution"
        },
        {
            title: "Kid's Rights Shield",
            description: "An interactive course for children to learn about their rights in a fun way.",
            category: "Legal & Rights",
            audience: "children",
            type: "course",
            link: "/flamea.org/training/course_kids-rights_shield.html",
            imageUrl: "https://placehold.co/600x400/1abc9c/ffffff?text=Kid's+Rights"
        },
        {
            title: "Constitution Champions",
            description: "A fun game for kids to learn the basics of the constitution.",
            category: "Legal & Rights",
            audience: "children",
            type: "game",
            link: "/flamea.org/games/constitution-champions.html",
            imageUrl: "https://placehold.co/600x400/9b59b6/ffffff?text=Constitution+Champions"
        },
        {
            title: "Customs & Consequences",
            description: "Learn about cultural customs and their legal implications in modern society.",
            category: "Culture & Heritage",
            audience: "adults",
            type: "customs",
            link: "/flamea.org/customs.html",
            imageUrl: "https://placehold.co/600x400/34495e/ffffff?text=Customs"
        }
        // Add all other courses and games here in the same format
    ];

    coursesToSeed.forEach(course => {
        // We create a new document reference in the 'courses' collection
        const courseRef = db.collection("courses").doc();
        batch.set(courseRef, course);
    });

    try {
        await batch.commit();
        console.log(`Successfully seeded ${coursesToSeed.length} courses to Firestore.`);
        alert(`Successfully seeded ${coursesToSeed.length} courses to Firestore.`);
    } catch (error) {
        console.error("Error seeding courses: ", error);
        alert("Error seeding courses. Check the console for details.");
    }
}

// To run this, open your browser's developer console and type: seedCoursesToFirestore()
