## HOT TAKES - THE WEB'S BEST HOT SAUCE REVIEWS

Hot Takes is an gourmet API for hot sauce lovers.
She was created by PIIQUANTE, this API contains the all collections of sauces added by users and u can like or dislike.
This is a project form the Openclassrooms course for web development curriculum, which aims to create an API with a database and secure it .

## Required :

* MongoDB
* API Client Postman
* Npm version 8.3.1
* Node.js 16.14.0

## Installation :

* To install clone the Github repository in your text editor example Visual studio code and run "npm install" and "nodemon server", run the repository on port 3000.
* Create a .env file in the root directory and paste the content of the .env.exemple file with our own values environement variables before run it.

## Database :

* This API work with MongoDB, you need to signup on "https://www.mongodb.com/cloud/atlas/register" website for get your own URI and put it in the value of MONGO_URI in the .env file to connect the database.


## Use :

* For test the API, please use an API Client like POSTMAN 
* You can test with the routes:
   * Signup: |POST|/api/auth/signup = create a user
   * Login: |POST|/api/auth/login = log a user
   * Read User: |GET|/api/auth/ = return data users
   * Export data users: |GET|/api/auth/export/ = print user data in a text document
   * Update user: |PUT|/api/auth = update users data
   * Delete user: |DELETE|/api/auth/ = delete user data

* You need to logged-in user before use the sauce routes:
   * Create sauce: |POST/|api/sauces = create a new sauce
   * Read a single sauce: |GET|/api/sauces/= read a sauce
   * Read all sauces: |GET|/api/sauces/ = read all sauces in the data base
   * Like or Dislike: |POST|/api/:id/like/ = like or dislike a sauce
   * Modify sauce: |PUT|/api/:id/ = Modify a sauce allready created
   * Delete sauce: |DELETE|/api/:id/ = Delete sauce in data base

## Frontend :

* The frontend part of this project was cloned form "https://github.com/OpenClassrooms-Student-Center/Web-Developer-P6". Add it in your workspace and execute 
* npm install
* npm start


    


