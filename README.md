# TinyApp Project

TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs (à la bit.ly). This web application is a functional prototype using a simple controller and router architecture, fully supporting the eventual implementation of MVC.

## Features:
- User registration and authentication
- Session management using encrypted cookies
- Users can add, update, and delete the short URLs they have created
- Users must be logged in to add, update, or delete their short URLs
- Minimalist, fully responsive bootstrap elements, suitable as a skeleton for any project design

## Final Product

!["TinyApp Register Page"](https://fernandoferraz.com/images/tinyapp_register_screenshot.png)
!["TinyApp Login Page"](https://fernandoferraz.com/images/tinyapp_login_screenshot.png)
!["TinyApp Index Page"](https://fernandoferraz.com/images/tinyapp_index_screenshot.png)

## Dependencies

- Node.js
- Express
- EJS
- bcrypt
- body-parser
- cookie-session

## Getting Started

- Install all dependencies (using the `npm install` command).
- Run the development web server using the `node express_server.js` command.
