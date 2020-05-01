# Natours Application

This full stack web application is specially designed for persons who love travelling and going on tour vacations.

This app can be found at [https://natours-immanuel-diai.herokuapp.com/](https://natours-immanuel-diai.herokuapp.com/).
The API for this app can be found at [https://documenter.getpostman.com/view/9735977/SzS4Qmbe](https://documenter.getpostman.com/view/9735977/SzS4Qmbe)

## Overview
This web application allows it's users to book tour vacations.

A tour refers to a series of locations, specially picked to excite the adventurous spirit of the individual who books it.

A visiting user who has not yet created an account on the app can simply see all the current tours as well as detailed information about each tour.

Once signed up or logged in, they can then book any tour of their choice.

Users can write only one review for any tour they book.

## Purpose
This app is a pet project, built for the express purpose of honing my skills in full stack web development.

## Main Tools And Technologies Used
* HTML (Create the structure and content of the web pages).
* CSS (Styling of the web pages).
* PUG (Template engine for generating the web pages dynamically).
* JAVASCRIPT (Interactivity, as well as making requests to the API from the client-side).
* NODE (Run JavaScript code on the server-side).
* EXPRESS (Node framework, meant to simplify the process of building complex server-side applications).
* MONGODB (Database for data persistence).
* MONGOOSE (Interacting with mongodb).
* MAPBOX (Displaying the different locations of each tour).
* STRIPE (Making payments on the app).
* JSON WEB TOKEN (Authenticating users)
* NODEMAILER (Sending emails to users of the app)
* MAILTRAP (Trapping the emails we send in our development environment, so they don't actually get sent to the user's email address)
* SENDGRID (Sending actual emails to the users in production).

## Setting Up Your Local Environment
If you wish to play around with the code base in your local environment, do the following
```
* Clone this repo to your local machine.
* Using the terminal, navigate to the cloned repo.
* Install all the neccessary dependencies, as stipulated in the package.json file.
* If you don't already have one, set up accounts with: MONGODB, MAPBOX, STRIPE, SENDGRID and MAILTRAP. Please ensure to have at least basic knowledge of how these services work.
* In your .env file, set environment variables for the following:
    * DATABASE=your mongodb database url
    * DATABASE_PASSWORD=your mongodb password

    * SECRET=your json web token secret
    * JWT_EXPIRES_IN=90d
    * JWT_COOKIE_EXPIRES_IN=90

    * EMAIL_USERNAME=your mailtrap username
    * EMAIL_PASSWORD=your mailtrap password
    * EMAIL_HOST=smtp.mailtrap.io
    * EMAIL_PORT=2525
    * EMAIL_FROM=your real life email address

    * SENDGRID_USERNAME=apikey
    * SENDGRID_PASSWORD=your sendgrid password

    * STRIPE_SECRET_KEY=your stripe secret key
    * STRIPE_WEBHOOK_SECRET=your stripe web hook secret

* Start the server.
* Your app should be running just fine.
```

## Table Of Contents
- [Authentication](#authentication)
- [Users](#users)
- [Admin](#admin)
- [Lead Guide](#lead-guide)
- [Tour Guide](#tour-guide)
- [Notice](#notice)

## Authentication
* Users can create an account on the app.
* Users can login and logout of the app.
* Users can reset their password.
* Users can update their password.

## Users
* Users can update their general information.
* Users can see their profile page.
* Users can see all the tours as well as detailed information about each tour.
* Users can book any tour of their choice, provided they can pay for it. (You don't really have to pay. You can input fake credit card details).
* Users can see all the tours they have booked.
* Users can write reviews for tours they have booked.
* Users can see all the reviews for each tour.
* Users can see specific reviews in detail.
* Users can edit and delete their own reviews.
* Users can add any of the tours they have booked to their list of favorite tours.
* Users can remove a favorite tour from their list of favorite tours.
* When you sign up, the above are the major things you will be able to do on the app.

## Admin
* The most powerful figure in this application
* An admin can create a tour.
* An admin can see all tours.
* An admin can see each tour in detail.
* An admin can edit a tour.
* An admin can delete a tour.
* An admin can see all the users of the application.
* An admin can see the non-sensitive details of a specific user.
* An admin can delete a user from the app.
* An admin can delete a review.
* An admin can see all reviews.
* An admin can see the details of each reviews.
* An admin can create a booking for a user manually (without payment).
* An admin can see all the bookings belonging to a user.
* An admin can see all the bookings belonging to a tour.
* An admin can see all the bookings on the app.
* An admin can see the details of each booking on the app.
* An admin can edit any booking.
* An admin can delete any booking.
* You cannot sign up as an admin! It is a privilege reserved for the app's creator.

## Lead Guide
* The second most powerful figure in this application
* Can do almost anything an admin can do except tampering with user's information. (Such as deleting a user from the app).
* You cannot sign up as a lead-guide!

## Tour Guide
* Almost like a normal user, but can neither book a tour nor review a tour.
* You cannot sign up as a tour guide!

## Notice
The app is actually quite more complex than is indicated in this documentation.
Nevertheless, this summary is enough to help you understand the major features of the app.
You are welcome to make improvements on the app.
