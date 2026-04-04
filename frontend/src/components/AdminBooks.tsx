import { useCallback, useEffect, useState } from "react";
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

function emptyBook(): Book {
  return {
    bookId: 0,
    title: "",
    author: "",
    publisher: "",
    isbn: "",
    classification: "",
    category: "",
    pageCount: 0,
    price: 0,
  };
}

function AdminBooks() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [isNew, setIsNew] = useState(true);
  const [form, setForm] = useState<Book>(emptyBook);

  const loadBooks = useCallback(() => {
    setLoading(true);
    setError(null);
    fetch(`${API_BASE}/api/books/manage`)
      .then((r) => {
        if (!r.ok) throw new Error(`Failed to load books (${r.status})`);
        return r.json();
      })
      .then((data: Book[]) => setBooks(data))
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadBooks();
  }, [loadBooks]);

  const openAdd = () => {
    setIsNew(true);
    setForm(emptyBook());
    setModalOpen(true);
  };

  const openEdit = (book: Book) => {
    setIsNew(false);
    setForm({ ...book });
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  const saveBook = () => {
    const url = isNew
      ? `${API_BASE}/api/books`
      : `${API_BASE}/api/books/${form.bookId}`;
    const method = isNew ? "POST" : "PUT";

    fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
      .then((r) => {
        if (!r.ok) {
          return r.text().then((t) => {
            throw new Error(t || r.statusText);
          });
        }
        closeModal();
        loadBooks();
      })
      .catch((e: Error) => setError(e.message));
  };

  const deleteBook = (book: Book) => {
    if (!window.confirm(`Delete "${book.title}"?`)) return;

    fetch(`${API_BASE}/api/books/${book.bookId}`, { method: "DELETE" })
      .then((r) => {
        if (!r.ok && r.status !== 204) {
          throw new Error(`Delete failed (${r.status})`);
        }
        loadBooks();
      })
      .catch((e: Error) => setError(e.message));
  };

  const updateField = (field: keyof Book, value: string | number) => {
    setForm((f) => ({ ...f, [field]: value }));
  };

  return (
    <div className="container mt-4 mb-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="mb-0">Admin — Books</h1>
        <button type="button" className="btn btn-primary" onClick={openAdd}>
          Add book
        </button>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {loading ? (
        <p>Loading…</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped table-bordered align-middle">
            <thead className="table-light">
              <tr>
                <th>Title</th>
                <th>Author</th>
                <th>Category</th>
                <th>Price</th>
                <th style={{ width: "160px" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {books.map((b) => (
                <tr key={b.bookId}>
                  <td>{b.title}</td>
                  <td>{b.author}</td>
                  <td>{b.category}</td>
                  <td>${b.price.toFixed(2)}</td>
                  <td>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-primary me-1"
                      onClick={() => openEdit(b)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => deleteBook(b)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modalOpen && (
        <div
          className="modal show d-block"
          tabIndex={-1}
          role="dialog"
          style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
        >
          <div className="modal-dialog modal-lg modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {isNew ? "Add book" : "Edit book"}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  aria-label="Close"
                  onClick={closeModal}
                />
              </div>
              <div className="modal-body">
                <div className="row g-3">
                  <div className="col-md-12">
                    <label className="form-label">Title</label>
                    <input
                      className="form-control"
                      value={form.title}
                      onChange={(e) => updateField("title", e.target.value)}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Author</label>
                    <input
                      className="form-control"
                      value={form.author}
                      onChange={(e) => updateField("author", e.target.value)}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Publisher</label>
                    <input
                      className="form-control"
                      value={form.publisher}
                      onChange={(e) => updateField("publisher", e.target.value)}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">ISBN</label>
                    <input
                      className="form-control"
                      value={form.isbn}
                      onChange={(e) => updateField("isbn", e.target.value)}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Classification</label>
                    <input
                      className="form-control"
                      value={form.classification}
                      onChange={(e) =>
                        updateField("classification", e.target.value)
                      }
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Category</label>
                    <input
                      className="form-control"
                      value={form.category}
                      onChange={(e) => updateField("category", e.target.value)}
                    />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">Page count</label>
                    <input
                      type="number"
                      min={0}
                      className="form-control"
                      value={form.pageCount}
                      onChange={(e) =>
                        updateField("pageCount", Number(e.target.value))
                      }
                    />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">Price</label>
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      className="form-control"
                      value={form.price}
                      onChange={(e) =>
                        updateField("price", Number(e.target.value))
                      }
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeModal}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={saveBook}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminBooks;
