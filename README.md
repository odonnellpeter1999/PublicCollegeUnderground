# UCDunderground
Code for the site to allow students to rate their modules and pick the best modules.

## Current Features which are implemented are:

- Login and Registration
- User  Sessions
- MongoDB Database
- Email Confirmation
- Password Hashing
- Review Forms
- Top Modules Page
- Module Detail Pages
- Fully reponsive design(works on mobile)

## How to Run Project

### Prerequisites

-NodeJS installed
-NPM installed
-VScode installed
-MongoDB installed locally

### How to Install

Firstly you must clone the project using `git clone` in the directory you wish to clone the file

Then open the project folder and run `npm install` to install all dependencies

You must now set two process variables

First one is Email using `SET EMAIL=<YOUR-EMAIL>`

Second one is Password using set `SET PASSWORD=<YOUR-EMAIL-PASSOWRD>`

Note: if you are using gmail you may have to go into your gmail settings and turn some of your gmail security settings off

This is to allow the application to send verification emails to users

Now you should be able to use `npm run start` to start the application and view it at http://localhost:3000/home

