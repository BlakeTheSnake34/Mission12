import { useEffect, useState } from "react";
import { API_BASE } from "../apiBase";

type Book = {
  bookId: number;
  title: string;
  author: string;
  publisher: string;
  isbn: string;
  classification: string;
  category: string;
  pageCount: number;
  price: number;
};

type ApiResponse = {
  books: Book[];
  totalNumBooks: number;
};

type CartItem = {
  book: Book;
  quantity: number;
};

function BookList() {
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [sortOrder, setSortOrder] = useState("asc");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [totalNumBooks, setTotalNumBooks] = useState(0);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const savedCart = sessionStorage.getItem("cart");
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }

    const savedPage = sessionStorage.getItem("currentPage");
    const savedCategory = sessionStorage.getItem("selectedCategory");
    const savedPageSize = sessionStorage.getItem("pageSize");
    const savedSortOrder = sessionStorage.getItem("sortOrder");

    if (savedPage) setPage(Number(savedPage));
    if (savedCategory) setSelectedCategory(savedCategory);
    if (savedPageSize) setPageSize(Number(savedPageSize));
    if (savedSortOrder) setSortOrder(savedSortOrder);
  }, []);

  useEffect(() => {
    sessionStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    sessionStorage.setItem("currentPage", page.toString());
    sessionStorage.setItem("selectedCategory", selectedCategory);
    sessionStorage.setItem("pageSize", pageSize.toString());
    sessionStorage.setItem("sortOrder", sortOrder);
  }, [page, selectedCategory, pageSize, sortOrder]);

  useEffect(() => {
    if (categories.length === 0) return;
    const valid =
      selectedCategory === "All" || categories.includes(selectedCategory);
    if (!valid) {
      setSelectedCategory("All");
      setPage(1);
    }
  }, [categories, selectedCategory]);

  useEffect(() => {
    fetch(`${API_BASE}/api/books/categories`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Categories request failed (${response.status})`);
        }
        return response.json();
      })
      .then((data: string[]) => setCategories(data))
      .catch((error: Error) => console.error("Error fetching categories:", error));
  }, []);

  useEffect(() => {
    setLoadError(null);
    fetch(
      `${API_BASE}/api/books?page=${page}&pageSize=${pageSize}&sortOrder=${sortOrder}&category=${encodeURIComponent(selectedCategory)}`
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Books request failed (${response.status})`);
        }
        return response.json();
      })
      .then((data: ApiResponse) => {
        setBooks(data.books ?? []);
        setTotalNumBooks(data.totalNumBooks ?? 0);
      })
      .catch((error: Error) => {
        console.error("Error fetching books:", error);
        setLoadError(error.message);
        setBooks([]);
        setTotalNumBooks(0);
      });
  }, [page, pageSize, sortOrder, selectedCategory]);

  const totalPages = Math.ceil(totalNumBooks / pageSize);

  const addToCart = (book: Book) => {
    const existingItem = cart.find((item) => item.book.bookId === book.bookId);

    let updatedCart: CartItem[];

    if (existingItem) {
      updatedCart = cart.map((item) =>
        item.book.bookId === book.bookId
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    } else {
      updatedCart = [...cart, { book, quantity: 1 }];
    }

    setCart(updatedCart);
  };

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce(
    (sum, item) => sum + item.book.price * item.quantity,
    0
  );

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-lg-9">
          <h1 className="mb-4">Online Bookstore</h1>

          {loadError && (
            <div className="alert alert-warning" role="alert">
              Could not load data from the API ({loadError}). If you are on the
              deployed site, ensure the frontend was built with{" "}
              <code>VITE_API_BASE_URL</code> pointing at your Azure API, or check
              the browser network tab for blocked requests.
            </div>
          )}

          <div className="row mb-4 g-3">
            <div className="col-md-4">
              <label className="form-label">Category</label>
              <select
                className="form-select"
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setPage(1);
                }}
              >
                <option value="All">All</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-4">
              <label className="form-label">Results per page</label>
              <select
                className="form-select"
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={15}>15</option>
              </select>
            </div>

            <div className="col-md-4">
              <label className="form-label">Sort by title</label>
              <select
                className="form-select"
                value={sortOrder}
                onChange={(e) => {
                  setSortOrder(e.target.value);
                  setPage(1);
                }}
              >
                <option value="asc">A to Z</option>
                <option value="desc">Z to A</option>
              </select>
            </div>
          </div>

          <div className="row g-4">
            {books.map((book) => (
              <div className="col-md-6" key={book.bookId}>
                <div className="card h-100 shadow">
                  <div className="card-body">
                    <h5 className="card-title">{book.title}</h5>
                    <p className="card-text"><strong>Author:</strong> {book.author}</p>
                    <p className="card-text"><strong>Publisher:</strong> {book.publisher}</p>
                    <p className="card-text"><strong>ISBN:</strong> {book.isbn}</p>
                    <p className="card-text"><strong>Classification:</strong> {book.classification}</p>
                    <p className="card-text"><strong>Category:</strong> {book.category}</p>
                    <p className="card-text"><strong>Pages:</strong> {book.pageCount}</p>
                    <p className="card-text"><strong>Price:</strong> ${book.price.toFixed(2)}</p>

                    <button
                      className="btn btn-success"
                      onClick={() => addToCart(book)}
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="d-flex justify-content-center align-items-center gap-3 mt-4">
            <button
              className="btn btn-primary"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              Previous
            </button>

            <span>
              Page {page} of {totalPages || 1}
            </span>

            <button
              className="btn btn-primary"
              disabled={page === totalPages || totalPages === 0}
              onClick={() => setPage(page + 1)}
            >
              Next
            </button>
          </div>
        </div>

        <div className="col-lg-3">
          <div className="card sticky-top" style={{ top: "20px" }}>
            <div className="card-body">
              <h4>
                Cart Summary <span className="badge text-bg-primary">{cartItemCount}</span>
              </h4>
              <p><strong>Items:</strong> {cartItemCount}</p>
              <p><strong>Total:</strong> ${cartTotal.toFixed(2)}</p>

              <button
                className="btn btn-outline-primary w-100"
                type="button"
                data-bs-toggle="offcanvas"
                data-bs-target="#cartOffcanvas"
                aria-controls="cartOffcanvas"
              >
                View Cart
              </button>
            </div>
          </div>
        </div>
      </div>

      <div
        className="offcanvas offcanvas-end"
        tabIndex={-1}
        id="cartOffcanvas"
        aria-labelledby="cartOffcanvasLabel"
      >
        <div className="offcanvas-header">
          <h5 className="offcanvas-title" id="cartOffcanvasLabel">Shopping Cart</h5>
          <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
        </div>
        <div className="offcanvas-body">
          {cart.length === 0 ? (
            <div className="alert alert-info">Your cart is currently empty.</div>
          ) : (
            <>
              {cart.map((item) => (
                <div key={item.book.bookId} className="mb-3 border-bottom pb-2">
                  <h6>{item.book.title}</h6>
                  <p className="mb-1">Quantity: {item.quantity}</p>
                  <p className="mb-1">Price: ${item.book.price.toFixed(2)}</p>
                  <p className="mb-1">
                    Subtotal: ${(item.book.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
              <h5>Total: ${cartTotal.toFixed(2)}</h5>
              <button
                className="btn btn-secondary w-100 mt-3"
                data-bs-dismiss="offcanvas"
              >
                Continue Shopping
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default BookList;