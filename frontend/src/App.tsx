import { BrowserRouter, Link, Route, Routes } from "react-router-dom";
import AdminBooks from "./components/AdminBooks";
import BookList from "./components/BookList";

function App() {
  return (
    <BrowserRouter>
      <nav className="navbar navbar-expand-lg navbar-light bg-light border-bottom">
        <div className="container">
          <Link className="navbar-brand fw-semibold" to="/">
            Bookstore
          </Link>
          <div className="ms-auto d-flex gap-3">
            <Link className="nav-link py-2" to="/">
              Shop
            </Link>
            <Link className="nav-link py-2" to="/adminbooks">
              Admin books
            </Link>
          </div>
        </div>
      </nav>
      <Routes>
        <Route path="/" element={<BookList />} />
        <Route path="/adminbooks" element={<AdminBooks />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
