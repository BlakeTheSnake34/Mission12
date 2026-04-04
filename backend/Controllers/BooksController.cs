using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Models;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BooksController : ControllerBase
    {
        private readonly BookstoreContext _context;

        public BooksController(BookstoreContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetBooks(
            int page = 1,
            int pageSize = 5,
            string sortOrder = "asc",
            string? category = null)
        {
            if (page < 1) page = 1;
            if (pageSize < 1) pageSize = 5;

            var query = _context.Books.AsQueryable();

            if (!string.IsNullOrEmpty(category) && category != "All")
            {
                query = query.Where(b => b.Category == category);
            }

            query = sortOrder.ToLower() == "desc"
                ? query.OrderByDescending(b => b.Title)
                : query.OrderBy(b => b.Title);

            var totalNumBooks = await query.CountAsync();

            var books = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return Ok(new
            {
                books,
                totalNumBooks
            });
        }

        [HttpGet("categories")]
        public async Task<IActionResult> GetCategories()
        {
            var categories = await _context.Books
                .Select(b => b.Category)
                .Distinct()
                .OrderBy(c => c)
                .ToListAsync();

            return Ok(categories);
        }

        /// <summary>All books for the admin page (no pagination).</summary>
        [HttpGet("manage")]
        public async Task<IActionResult> GetAllForAdmin()
        {
            var books = await _context.Books
                .OrderBy(b => b.Title)
                .ToListAsync();

            return Ok(books);
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var book = await _context.Books.FindAsync(id);
            if (book == null)
            {
                return NotFound();
            }

            return Ok(book);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Book book)
        {
            if (!TryValidateBook(book, out var error))
            {
                return BadRequest(error);
            }

            book.BookId = 0;
            _context.Books.Add(book);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = book.BookId }, book);
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] Book book)
        {
            if (!TryValidateBook(book, out var error))
            {
                return BadRequest(error);
            }

            var existing = await _context.Books.FindAsync(id);
            if (existing == null)
            {
                return NotFound();
            }

            existing.Title = book.Title;
            existing.Author = book.Author;
            existing.Publisher = book.Publisher;
            existing.Isbn = book.Isbn;
            existing.Classification = book.Classification;
            existing.Category = book.Category;
            existing.PageCount = book.PageCount;
            existing.Price = book.Price;

            await _context.SaveChangesAsync();

            return Ok(existing);
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var book = await _context.Books.FindAsync(id);
            if (book == null)
            {
                return NotFound();
            }

            _context.Books.Remove(book);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private static bool TryValidateBook(Book book, out string error)
        {
            error = "";
            if (book == null)
            {
                error = "Book is required.";
                return false;
            }

            if (string.IsNullOrWhiteSpace(book.Title)
                || string.IsNullOrWhiteSpace(book.Author)
                || string.IsNullOrWhiteSpace(book.Publisher)
                || string.IsNullOrWhiteSpace(book.Isbn)
                || string.IsNullOrWhiteSpace(book.Classification)
                || string.IsNullOrWhiteSpace(book.Category))
            {
                error = "All text fields are required.";
                return false;
            }

            if (book.PageCount < 0)
            {
                error = "Page count cannot be negative.";
                return false;
            }

            if (book.Price < 0)
            {
                error = "Price cannot be negative.";
                return false;
            }

            return true;
        }
    }
}