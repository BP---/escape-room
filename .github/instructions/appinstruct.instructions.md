---
applyTo: '**'
---
The app simulates an escape room. The user starts on a particular escape room's main page, and only has one "chapter" available. When a user clicks on a "chapter", the user gets some information, and based on the clues, enters an answer. If the answer is correct, they are redirected to the main page, and can see that another "chapter" has been unlocked. When inside a "chapter", in addition to general information, there are also potential hints that they can click on, in order to reveal more information. 

Tech stack:  
Sveltekit, Svelte 5 with runes syntax. Typescript. TailwindCSS and daisyui for styling. Drizzle ORM, better-sqlite3, better-auth. 

Route Structure:
/routes
-/escaperoom
--/roomID
---/chapterNumber
-/create
-/user