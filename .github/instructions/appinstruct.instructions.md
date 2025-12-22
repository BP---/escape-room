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

A user should be able to register with github, using better-auth, and be logged in. A logged in user can go to the /create route, where there is a form to create escape rooms. The app has an AI integration, which uses the Gemini API, and allows the user to prompt the LLM, and it uses structured output to make the escape-room. The user can also choose one of several provided themes, that will apply to the created escape-room.  

Database structure: 
A user table, with data from github. 
escape-rooms table, with title, reference to a user, a theme for the escape-room. 
chapters table with reference to escape-room. 
hints table with reference to chapters. 


A non-registered user has their progress saved in localstorage, with the id of each room they have made progress in. The chapters and answers to the chapters are stored as objects for the different rooms. Example: {97c8fcc271b880d5b3f9885b: {1: "a"}, afd49d7a8451c25e70ede65c: {1: "1"}}
