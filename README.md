# Mission 12 Bookstore App

This project is an ASP.NET Core API and React web app for an online bookstore. It continues the Mission 11 bookstore project by adding category filtering, a shopping cart, session persistence, and expanded Bootstrap layout features.

## Features

- Displays books from the provided SQLite database
- Pagination with 5 books per page by default
- User can change results per page
- Sorting by book title
- Filtering by book category
- Shopping cart with quantity, price, subtotal, and total
- Cart summary displayed on the main book list page
- Cart persists for the duration of the browser session
- Continue Shopping functionality that keeps the user on the same page
- Styled and arranged using Bootstrap Grid

## Tech Stack

- ASP.NET Core Web API
- Entity Framework Core
- SQLite
- React
- TypeScript
- Bootstrap

## How to Run

### Backend

Open the backend folder and run:

dotnet run

### Frontend

Open the frontend folder and run:

npm install
npm run dev

## Notes

The frontend runs on localhost:5173 and the backend API runs on localhost:5002.

## Bootstrap Features Added

This project uses Bootstrap Grid for the main page layout. It also includes Bootstrap features beyond the class examples, such as:

- `offcanvas` for the shopping cart side panel
- `badge` for showing the number of items in the cart
- `sticky-top` for keeping the cart summary visible while browsing
